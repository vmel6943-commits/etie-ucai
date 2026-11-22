import {useEffect, useRef, useState} from 'react';
import {useGame} from '../game/store';
import {reportCases, type ReportCase, type ReportVisual} from '../data/reports';
import {CokeVote} from './CokeVote';
import {getReportVote} from '../game/investigation';
import './coke-report.css';
import './coke-report-cases.css';

/** 视觉区：情报 01 是可点击的官方影片，情报 02 是广告图，情报 03 是排版示意。 */
function ReportVisualBlock({visual}:{visual:ReportVisual}) {
  if (visual.kind === 'clipping') {
    return (
      <div className="coke-report__visual">
        <div className="rp-clipping">
          <span className="rp-clipping__kicker">{visual.kicker}</span>
          <strong className="rp-clipping__big">{visual.big}</strong>
          <span className="rp-clipping__unit">{visual.unit}</span>
          <ul className="rp-clipping__lines">
            {visual.lines.map(line => <li key={line}>{line}</li>)}
          </ul>
        </div>
        <p className="coke-report__credit">{visual.credit}</p>
      </div>
    );
  }

  if (visual.kind === 'still') {
    return (
      <div className="coke-report__visual">
        <div className="coke-report__film rp-still">
          <img src={visual.src} alt={visual.alt}/>
        </div>
        <p className="coke-report__credit">{visual.credit}</p>
      </div>
    );
  }

  return (
    <div className="coke-report__visual">
      <a className="coke-report__film" href={visual.href} target="_blank" rel="noopener noreferrer" aria-label={visual.hrefLabel}>
        <img src={visual.src} alt={visual.alt}/>
        <span className="coke-report__play" aria-hidden="true">▶</span>
        <span className="coke-report__film-label">ENJOY JOY · 前往官方页面观看 ↗</span>
      </a>
      <p className="coke-report__credit">{visual.credit}</p>
    </div>
  );
}

export function CokeReport({onClose}:{onClose:(topicId:string)=>void}) {
  const [activeId,setActiveId]=useState(reportCases[0].id);
  // 每份情报各自记录进度，切换不会互相覆盖，也不会出现内容混杂。
  const game=useGame(state=>state.game);
  const [revealedLocally,setRevealedLocally]=useState<Record<string,boolean>>({});
  const rootRef=useRef<HTMLElement>(null);

  const active:ReportCase = reportCases.find(c => c.id === activeId) ?? reportCases[0];
  const savedFlag = useGame(s => s.game.flags.includes(active.flag));
  const firstVote = getReportVote(game,active.id,'first');
  // 还没读可口可乐那份时，读别的专报末尾会被引回可口可乐，而不是直接关掉。
  const needsCoke = active.id !== reportCases[0].id && !game.flags.includes(reportCases[0].flag);

  const storedStage=Number(game.choices['report-stage:'+active.id] || 0);
  const stage = savedFlag ? 3 : Math.max(0,Math.min(3,Number.isFinite(storedStage)?storedStage:0));
  const revealed = (revealedLocally[active.id] ?? false) || savedFlag;

  // 切换情报时回到顶部，避免停在上一条情报的中段。
  useEffect(() => {
    const scroller = rootRef.current?.closest('.panel-body');
    if (scroller) scroller.scrollTo({top:0, behavior:'auto'});
  }, [activeId]);

  const setStage = (next:number) => useGame.getState().choose('report-stage:'+active.id,String(next));

  function begin() {
    useGame.getState().flag('report-seen');
    setStage(1);
  }

  function reveal() {
    useGame.getState().flag(active.flag);
    setRevealedLocally(prev => ({...prev, [active.id]: true}));
  }

  return <article className="coke-report" aria-label={`列车专报 · ${active.no}`} ref={rootRef}>
    <div className="rp-tabs" role="tablist" aria-label="情报档案">
      {reportCases.map(item => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === active.id}
          className={`rp-tab ${item.id === active.id ? 'is-active' : ''}`}
          onClick={() => setActiveId(item.id)}
        >
          {item.tab}
        </button>
      ))}
    </div>

    <header className="coke-report__masthead"><span>{active.masthead}</span><h2>列车专报</h2></header>
    <h3 className="coke-report__headline">{active.headline}</h3>
    <div className="coke-report__columns">
      <ReportVisualBlock visual={active.visual}/>
      <div className="coke-report__text">
        <section className="coke-report__paper">
          <h4>{active.briefTitle}</h4>
          {/* 文案为数据层内的固定内容，含 <br/> 与 <strong> 标记。 */}
          {active.brief.map((paragraph, i) => (
            <p key={i} dangerouslySetInnerHTML={{__html: paragraph}}/>
          ))}
        </section>
        <section className="coke-report__paper coke-report__prompt">
          <p>{active.prompt}</p>
          {stage === 0 && (
            <button type="button" className="coke-report__button" onClick={begin}>
              {active.startLabel} <span aria-hidden="true">→</span>
            </button>
          )}
        </section>
      </div>
    </div>

    {stage > 0 && <section className="coke-report__trace" aria-label="新闻传播调查" aria-live="polite">
      <div className="coke-report__trace-head"><span>消息追踪 · {stage} / 3</span><h4>同一条消息，传着传着发生了什么？</h4></div>
      <div className="coke-report__versions">
        {active.versions.slice(0, stage).map((version, i) => (
          <section className="coke-report__version" key={version.label}>
            <small>{version.label}</small>
            <p>「{version.text}」</p>
            <span className="coke-report__note">{version.note}</span>
            {i === 0 && version.href && (
              <a href={version.href} target="_blank" rel="noopener noreferrer">{version.hrefLabel ?? '查看原始报道 ↗'}</a>
            )}
          </section>
        ))}
      </div>
      {stage < 3 && (
        <button type="button" className="coke-report__button" onClick={() => setStage(stage + 1)}>
          查看下一份消息 <span aria-hidden="true">→</span>
        </button>
      )}
      {stage === 3 && !firstVote && (
        <CokeVote key={active.id} caseId={active.id} mode="first" onDone={() => undefined}/>
      )}
      {stage === 3 && !revealed && firstVote && (
        <button type="button" className="coke-report__button" onClick={reveal}>
          揭开真相 <span aria-hidden="true">✦</span>
        </button>
      )}
      {revealed && (
        <div className="coke-report__truth">
          <h4>{active.truth.title}</h4>
          {active.truth.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          {active.truth.note && <p>{active.truth.note}</p>}
          {active.discussion && (
            <div className="rp-discussion">
              <h5>{active.discussion.title}</h5>
              <ol>
                {active.discussion.items.map(item => <li key={item}>{item}</li>)}
              </ol>
            </div>
          )}
          {active.truth.sources.length > 0 && (
            <div className="coke-report__sources">
              {active.truth.sources.map(source => (
                <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.label}</a>
              ))}
            </div>
          )}
          <button type="button" className="coke-report__secondary" onClick={()=>{if(needsCoke)setActiveId(reportCases[0].id);else onClose(active.id);}}>{needsCoke?'继续阅读可口可乐专报':active.truth.closeLabel}</button>
        </div>
      )}
    </section>}
  </article>;
}
