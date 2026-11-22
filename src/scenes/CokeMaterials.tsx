import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Check, ClipboardList, Film, MessageSquare, Search, Puzzle, Siren, ChevronRight} from 'lucide-react';
import type {GameState} from '../game/model';
import {questTasks, workbenchProgress, WORKBENCH_COMPLETE_SHOWN} from '../game/workbenchQuest';
import {useGame} from '../game/store';
import {AdOpinion} from './AdOpinion';
import {AdScreening} from './AdScreening';
import {CrisisRoom} from './CrisisRoom';
import {IntelPuzzle} from './IntelPuzzle';
import {TrackingReader} from './TrackingReader';
import './coke-materials.css';

export type CokeMaterialId='film'|'report'|'response'|'spread'|'opinion';
export const cokeHotspots:Record<string,{id:CokeMaterialId;label:string}>={
  video:{id:'film',label:'广告档案'}, notice:{id:'response',label:'舆情急救室'},
  timeline:{id:'report',label:'情报拼图室'}, witness:{id:'opinion',label:'个人观点'},
  spread:{id:'spread',label:'查看最新信息'}, evidence:{id:'spread',label:'查看最新信息'},
};

/** 每个材料对应的「真实完成状态」，读取各任务自己写入的 flag */
const materials = [
  {id:'film',label:'广告档案',icon:Film,quest:'film'},
  {id:'opinion',label:'个人观点',icon:MessageSquare,quest:'opinion'},
  {id:'report',label:'情报拼图室',icon:Puzzle,quest:'puzzle'},
  {id:'response',label:'舆情急救室',icon:Siren,quest:'crisis'},
  {id:'spread',label:'查看最新信息',icon:Search,quest:'tracking'},
] as const;

const questDone = (game: GameState, questId: string) =>
  questTasks.find(task => task.id === questId)?.done(game) ?? false;

export function cokeMaterialDone(game: GameState, id: CokeMaterialId | undefined) {
  const material = materials.find(material => material.id === id);
  return material ? questDone(game, material.quest) : false;
}

export function CokeMaterialTray({game,onOpen,onBack,onNext}:{game:GameState;onOpen:(id:CokeMaterialId)=>void;onBack:()=>void;onNext?:()=>void}) {
  const progress = workbenchProgress(game);
  const shown = game.flags.includes(WORKBENCH_COMPLETE_SHOWN);
  const [celebrate, setCelebrate] = useState(false);
  const completionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!celebrate) return;
    const previous = document.activeElement as HTMLElement | null;
    const backgrounds = Array.from(document.querySelectorAll<HTMLElement>('.game > .topbar, .game > .world, .game > .bottom-bar'));
    const inertStates = backgrounds.map(element => element.inert);
    backgrounds.forEach(element => { element.inert = true; });
    const button = completionRef.current?.querySelector<HTMLButtonElement>('button');
    button?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') { event.preventDefault(); button?.focus(); }
      if (event.key === 'Escape') {
        event.preventDefault();
        useGame.getState().flag(WORKBENCH_COMPLETE_SHOWN);
        setCelebrate(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      const modalOpen = !!document.querySelector('.game > .modal-scrim');
      backgrounds.forEach((element, index) => { element.inert = modalOpen || inertStates[index]; });
      if (previous?.isConnected) previous.focus();
    };
  }, [celebrate]);

  /* 五项全部完成 → 展示一次完成提示 */
  useEffect(() => {
    if (progress.all && !shown) setCelebrate(true);
  }, [progress.all, shown]);

  const dismiss = () => {
    useGame.getState().flag(WORKBENCH_COMPLETE_SHOWN);
    setCelebrate(false);
  };

  return <section className="material-tray coke-material-tray" aria-label="皮箱里的热点情报">
    <div className="material-tray-heading">
      <ClipboardList size={20} aria-hidden="true"/>
      <div>
        <strong>皮箱里的情报</strong>
        <small>
          {progress.all
            ? '五项情报调查任务已全部完成'
            : `情报调查任务 ${progress.done}/${progress.total} 项完成`}
        </small>
      </div>
    </div>

    <div className="material-tabs">
      {materials.map(({id,label,icon:Icon,quest}) => {
        const done = questDone(game, quest);
        const caption = id==='spread' ? '最新信息' : label;
        return <button
          type="button"
          key={id}
          onClick={()=>onOpen(id)}
          className={done?'material-read':''}
          aria-label={done?`${label}（已完成）`:label}
        >
          <Icon size={19} aria-hidden="true"/>
          <span>{caption.slice(0,2)}<br className="material-label-break"/>{caption.slice(2)}</span>
          {done && <Check size={12} className="material-check" aria-label="已完成"/>}
        </button>;
      })}
    </div>

    {/* 五项全完成 → 底部按钮改为进入下一场景 */}
    {progress.all && onNext
      ? <button type="button" className="material-next coke-material-tray__next" onClick={() => { dismiss(); onNext(); }}>进入下一场景 <ChevronRight size={16} aria-hidden="true"/></button>
      : <button type="button" className="material-next" onClick={onBack}>返回皮箱</button>}

    {/* 旧版第二幕留下的调查记录不再计入，给回坑的老玩家一句说明 */}
    {!progress.all && game.evidence.length>0 &&
      <p className="coke-material-tray__legacy">这一版第二幕换成了五项热点情报任务，此前的调查记录不再计入，需要重新完成五项。</p>}

    {celebrate && createPortal(<div
      ref={completionRef}
      className="workbench-done"
      role="dialog"
      aria-modal="true"
      aria-label="情报调查任务完成"
      onPointerDown={e => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="workbench-done__card">
        <span className="workbench-done__seal" aria-hidden="true"><ClipboardList size={32}/></span>
        <h3>情报调查任务完成！</h3>
        <p className="workbench-done__lead">恭喜乘客！</p>
        <p>五份情报调查任务已经全部完成。收好最终判断，就可以继续夜行。</p>
        <p>神秘情报鹅已经整理好所有资料，而下一节车厢的乘务员，似乎还有新的消息要告诉你……</p>
        <p className="workbench-done__end">下一站，新的故事即将开启。</p>
        <button type="button" className="workbench-done__btn" onClick={() => { dismiss(); onNext?.(); }}>
          进入下一场景 <ChevronRight size={16} aria-hidden="true"/>
        </button>
      </div>
    </div>, document.querySelector('.game') ?? document.body)}
  </section>;
}

export function CokeMaterial({id,onClose}:{id:CokeMaterialId;onClose?:()=>void}) {
  if(id==='film')return <AdScreening onClose={onClose}/>;
  if(id==='report')return <IntelPuzzle onClose={onClose}/>;
  if(id==='response')return <CrisisRoom onClose={onClose}/>;
  if(id==='opinion')return <AdOpinion onClose={onClose}/>;
  return <TrackingReader onClose={onClose}/>;
}
