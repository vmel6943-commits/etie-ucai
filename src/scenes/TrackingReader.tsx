import {useEffect, useRef, useState} from 'react';
import {Check} from 'lucide-react';
import {useGame, saveUnavailable} from '../game/store';
import {
  trackingBoards, requiredBoards, trackingFlag, TRACKING_DONE_FLAG,
  type TrackingBoard,
} from '../data/tracking';
import './tracking-reader.css';

export function TrackingReader({onClose}:{onClose?:()=>void}) {
  const flags = useGame(s => s.game.flags);
  const [index, setIndex] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  // 存档写入失败时只提示、不再要求“再点一次”：以前回读失败会让提示永远清不掉。
  const storageWarning = saveUnavailable();
  const rootRef = useRef<HTMLElement>(null);

  const read = (board: TrackingBoard) => flags.includes(trackingFlag(board.id));
  const doneCount = requiredBoards.filter(read).length;
  const allDone = doneCount === requiredBoards.length;

  /* 切换板块后正文回到顶部（手机端尤其需要） */
  useEffect(() => {
    const scroller = rootRef.current?.closest('.panel-body');
    if (scroller) scroller.scrollTo({top: 0, behavior: 'auto'});
  }, [index]);

  /* 四份必读全部查阅 → 自动标记完成并弹一次提示 */
  useEffect(() => {
    if (!allDone) return;
    if (!flags.includes(TRACKING_DONE_FLAG)) {
      useGame.getState().flag(TRACKING_DONE_FLAG);
      useGame.getState().flag('coke-material:spread');
      setCelebrate(true);
    }
  }, [allDone, flags]);

  const board = trackingBoards[index];

  const markRead = () => {
    if (read(board)) return; // 重复点击不重复计数
    useGame.getState().flag(trackingFlag(board.id));
  };

  return <section className="tracking" aria-label="查看最新信息" ref={rootRef}>
    <div className="tracking__title">
      <h3>新闻档案</h3>
      <span className="tracking__progress-label">
        情报查阅进度：<strong>{doneCount}</strong>/{requiredBoards.length}
      </span>
      <div className="tracking__bar" role="progressbar" aria-valuemin={0} aria-valuemax={requiredBoards.length} aria-valuenow={doneCount}>
        <i style={{width: `${(doneCount / requiredBoards.length) * 100}%`}}/>
      </div>
      {allDone && <span className="tracking__badge">✓ 任务完成</span>}
    </div>

    <nav className="tracking__tabs" aria-label="情报板块">
      {trackingBoards.map((item, i) => {
        const on = i === index;
        const checked = read(item);
        return <button
          key={item.id}
          type="button"
          className={`tracking__tab ${on ? 'is-active' : ''} ${checked ? 'is-read' : ''}`}
          aria-current={on ? 'true' : undefined}
          onClick={() => setIndex(i)}
        >
          <span>{item.tab}</span>
          {checked && <Check size={12} aria-label="已查阅"/>}
        </button>;
      })}
    </nav>

    <article className="tracking__body" key={board.id}>
      <span className="eyebrow">{board.kicker}</span>
      <h3>{board.title}</h3>
      {board.time && <p className="tracking__time">{board.time}</p>}

      {board.image && <figure className="tracking__figure">
        <img src={board.image.src} alt={board.image.alt}/>
      </figure>}

      {board.stat && <div className="tracking__stat">
        <strong>{board.stat.big}</strong>
        <span>{board.stat.unit}</span>
        <ul>{board.stat.lines.map(line => <li key={line}>{line}</li>)}</ul>
      </div>}

      {board.sections.map(section => <section key={section.heading} className="tracking__section">
        <h4>{section.heading}</h4>
        {section.paragraphs.map((text, i) => <p key={i}>{text}</p>)}
      </section>)}

      {board.links.length > 0 && <div className="tracking__links">
        {board.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>)}
      </div>}

      {storageWarning && <p className="tracking__error" role="status">浏览器没有允许本地保存，这次的查阅记录在刷新后会丢失，但不影响本次旅程继续进行。</p>}

      <button
        type="button"
        className={`tracking__mark ${read(board) ? 'is-read' : ''}`}
        onClick={markRead}
        disabled={read(board)}
      >
        {read(board) ? '✓ 已查阅' : '标记已查阅'}
      </button>

      {!board.required && <p className="tracking__hint">总结板块可以自由阅读，不计入四份必读进度。</p>}
    </article>

    <div className="tracking__pager">
      <button type="button" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}>← 上一份</button>
      <span>{index + 1} / {trackingBoards.length}</span>
      <button type="button" onClick={() => setIndex(i => Math.min(trackingBoards.length - 1, i + 1))} disabled={index === trackingBoards.length - 1}>下一份 →</button>
    </div>

    {celebrate && <div className="tracking__celebrate" onKeyDown={event=>{if(event.key==='Tab'){event.preventDefault();event.currentTarget.querySelector('button')?.focus();}if(event.key==='Escape'){event.stopPropagation();setCelebrate(false);}}} role="dialog" aria-modal="true" aria-label="四份情报查阅完成">
      <div className="tracking__celebrate-card">
        <span className="tracking__celebrate-seal" aria-hidden="true">🎫</span>
        <h3>四份情报查阅完成！</h3>
        <p className="tracking__celebrate-lead">恭喜乘客！</p>
        <p>你已成功查阅本次列车收集的四份热点情报，掌握了这些新闻背后的故事。</p>
        <p>从品牌营销到AI科技，每一份情报都为这趟旅程增添了新的发现。</p>
        <p className="tracking__celebrate-end">下一站，更多精彩还在等待你！</p>
        <button type="button" className="tracking__celebrate-btn" autoFocus onClick={() => { setCelebrate(false); onClose?.(); }}>
          返回情报工作台
        </button>
      </div>
    </div>}
  </section>;
}
