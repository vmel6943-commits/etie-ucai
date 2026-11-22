import {useState} from 'react';
import {AlertTriangle, Check, RotateCcw} from 'lucide-react';
import {useGame} from '../game/store';
import {
  crisisComments, crisisActions, crisisStart, crisisMaxActions,
  judgeCrisis, outcomeText, CRISIS_DONE_FLAG,
  type CrisisAction, type CrisisOutcome,
} from '../data/crisis';
import './crisis-room.css';

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const RUN_KEY = 'crisis-run';

type Stage = 'play' | 'report';
type Run = { heat: number; trust: number; used: CrisisAction[]; stage: Stage };

const freshRun = (): Run => ({heat: crisisStart.heat, trust: crisisStart.trust, used: [], stage: 'play'});

/** 关掉弹窗再回来会接着上次的三次行动，不用重新来过 */
function loadRun(): Run {
  try {
    const raw: unknown = JSON.parse(useGame.getState().game.choices[RUN_KEY] ?? 'null');
    if (!raw || typeof raw !== 'object') return freshRun();
    const value = raw as {heat?: unknown; trust?: unknown; used?: unknown; stage?: unknown};
    if (typeof value.heat !== 'number' || !Number.isFinite(value.heat)) return freshRun();
    if (typeof value.trust !== 'number' || !Number.isFinite(value.trust)) return freshRun();
    const usedIds = Array.isArray(value.used) ? value.used.filter((id): id is string => typeof id === 'string') : [];
    const used = crisisActions.filter(action => usedIds.includes(action.id));
    const stage: Stage = value.stage === 'report' && used.length >= crisisMaxActions ? 'report' : 'play';
    return {heat: clamp(value.heat), trust: clamp(value.trust), used, stage};
  } catch {
    return freshRun();
  }
}

export function CrisisRoom({onClose}:{onClose?:()=>void}) {
  const flags = useGame(s => s.game.flags);
  const alreadyDone = flags.includes(CRISIS_DONE_FLAG);

  const [run, setRun] = useState<Run>(loadRun);
  const [feedback, setFeedback] = useState<string | null>(null);

  const save = (next: Run) => {
    setRun(next);
    useGame.getState().choose(RUN_KEY, JSON.stringify({heat: next.heat, trust: next.trust, used: next.used.map(a => a.id), stage: next.stage}));
  };

  const left = crisisMaxActions - run.used.length;
  const outcome: CrisisOutcome = judgeCrisis(run.heat, run.trust);

  const act = (action: CrisisAction) => {
    if (run.used.some(a => a.id === action.id) || left <= 0) return;
    const used = [...run.used, action];
    const next: Run = {
      heat: clamp(run.heat + action.heat),
      trust: clamp(run.trust + action.trust),
      used,
      stage: used.length >= crisisMaxActions ? 'report' : 'play',
    };
    setFeedback(`${action.title} → ${action.feedback}`);
    save(next);
  };

  const replay = () => {
    setFeedback(null);
    save(freshRun());
  };

  const finish = () => {
    useGame.getState().flag(CRISIS_DONE_FLAG);
    onClose?.();
  };

  return <section className="crisis" aria-label="舆情急救室">
    <header className="crisis__head">
      <h3>🚨 舆情急救室</h3>
      <span className="crisis__kicker">G-07 · 模拟公关演练</span>
    </header>

    {alreadyDone && <div className="crisis__banner" role="status">
      <Check size={15} aria-hidden="true"/>
      <span>这场舆情你已经处理过一次。</span>
      <button type="button" onClick={replay}><RotateCcw size={13}/>重新体验</button>
    </div>}

    {/* 舆情警报卡片 */}
    <div className="crisis__alert">
      <p className="crisis__alert-line"><AlertTriangle size={15} aria-hidden="true"/>列车行驶途中，神秘情报鹅突然收到一封来自品牌公关部的紧急电报！</p>
      <p>「不好了！最近名创优品推出了『不扫兴的友情』广告，其中一句『支持大声喧哗』被网友单独截出来传播。」</p>
      <p>「现在部分网友质疑：品牌是不是在鼓励顾客不遵守公共秩序？」</p>
      <p className="crisis__lead"><strong>请你临时担任品牌公关负责人，帮助品牌化解这场舆情危机！</strong></p>
      <p className="crisis__disclaimer">注意：以上舆情危机属于游戏模拟情境，并非真实发生的品牌事件；下列数值同为虚构。</p>
    </div>

    {/* 两条进度条 */}
    <div className="crisis__gauges">
      <div className="crisis__gauge">
        <div className="crisis__gauge-top"><span>舆情热度</span><strong>{run.heat}<i>/100</i></strong></div>
        <div className="crisis__bar"><i className="is-heat" style={{width: `${run.heat}%`}}/></div>
      </div>
      <div className="crisis__gauge">
        <div className="crisis__gauge-top"><span>品牌信任度</span><strong>{run.trust}<i>/100</i></strong></div>
        <div className="crisis__bar"><i className="is-trust" style={{width: `${run.trust}%`}}/></div>
      </div>
    </div>

    {/* 网友评论 */}
    <div className="crisis__comments">
      {crisisComments.map(c => <div className="crisis__comment" key={c.id}>
        <span className="crisis__avatar">{c.author}</span>
        <p>{c.text}</p>
      </div>)}
    </div>

    {/* 行动 */}
    {run.stage === 'play' && <>
      <div className="crisis__actions-head">
        <h4>采取公关行动</h4>
        <span>剩余行动机会 <strong>{left}</strong> / {crisisMaxActions}</span>
      </div>
      <div className="crisis__actions">
        {crisisActions.map(action => {
          const done = run.used.some(a => a.id === action.id);
          return <button
            key={action.id}
            type="button"
            className={`crisis__action ${done ? 'is-used' : ''}`}
            disabled={done || left <= 0}
            onClick={() => act(action)}
          >
            <span className="crisis__action-title">{action.title}</span>
            <span className="crisis__action-detail">{action.detail}</span>
            {done && <span className="crisis__action-mark">已使用</span>}
          </button>;
        })}
      </div>
      {feedback && <p className="crisis__feedback" role="status">{feedback}</p>}
    </>}

    {/* 处理报告 */}
    {run.stage === 'report' && <div className="crisis__report">
      <h4>🎫 舆情处理报告</h4>
      <div className={`crisis__verdict is-${outcome}`}>
        <strong>{outcomeText[outcome].title}</strong>
        <span>{outcomeText[outcome].line}</span>
      </div>
      <dl className="crisis__final">
        <div><dt>最终舆情热度</dt><dd>{run.heat}/100</dd></div>
        <div><dt>最终品牌信任度</dt><dd>{run.trust}/100</dd></div>
      </dl>
      <h5>你采取的三次行动</h5>
      <ol className="crisis__used">
        {run.used.map((a, i) => <li key={a.id}>
          <span>{i + 1}. {a.title}</span>
          <small>热度 {a.heat > 0 ? '+' : ''}{a.heat} · 信任 {a.trust > 0 ? '+' : ''}{a.trust}</small>
        </li>)}
      </ol>
      <p className="crisis__advice">{outcomeText[outcome].advice}</p>
      <button type="button" className="crisis__finish" onClick={finish}>完成任务并返回情报工作台</button>
    </div>}
  </section>;
}
