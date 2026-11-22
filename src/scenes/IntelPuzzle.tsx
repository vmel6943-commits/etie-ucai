import {useEffect, useMemo, useState} from 'react';
import {Check, Stamp, RotateCcw, X} from 'lucide-react';
import {useGame} from '../game/store';
import {
  archives, clues, shuffled, PUZZLE_DONE_FLAG,
  type ArchiveId, type Clue,
} from '../data/puzzle';
import './intel-puzzle.css';

type Placements = Record<string, ArchiveId | null>;

const emptyPlacements = (): Placements =>
  Object.fromEntries(clues.map(clue => [clue.id, null]));

const solvedPlacements = (): Placements =>
  Object.fromEntries(clues.map(clue => [clue.id, clue.archive]));

const PLACEMENT_KEY = 'puzzle-placements';

/** 关掉弹窗再回来会接着上次摆好的位置 */
function loadPlacements(): Placements {
  const base = emptyPlacements();
  try {
    const raw: unknown = JSON.parse(useGame.getState().game.choices[PLACEMENT_KEY] ?? 'null');
    if (!raw || typeof raw !== 'object') return base;
    const saved = raw as Record<string, unknown>;
    for (const clue of clues) {
      const value = saved[clue.id];
      if (typeof value === 'string' && archives.some(archive => archive.id === value)) {
        base[clue.id] = value as ArchiveId;
      }
    }
  } catch {
    /* 损坏的进度当作没摆过 */
  }
  return base;
}

export function IntelPuzzle({onClose}:{onClose?:()=>void}) {
  const flags = useGame(s => s.game.flags);
  const alreadyDone = flags.includes(PUZZLE_DONE_FLAG);

  const [order, setOrder] = useState<Clue[]>(() => shuffled(clues));
  const [placements, setPlacements] = useState<Placements>(() =>
    alreadyDone ? solvedPlacements() : loadPlacements());
  const [results, setResults] = useState<Record<string, boolean>>(() => {
    if (!alreadyDone) return {};
    return Object.fromEntries(clues.map(clue => [clue.id, true]));
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(alreadyDone);
  const [celebrate, setCelebrate] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const persist = (next: Placements) => {
    useGame.getState().choose(PLACEMENT_KEY, JSON.stringify(next));
  };

  const placedCount = countPlaced(placements);
  const allPlaced = placedCount === clues.length;
  const allCorrect = clues.every(clue => placements[clue.id] === clue.archive);

  /* 已完成的用户再次进入时只展示归档结果，不再弹完成提示 */
  useEffect(() => {
    if (alreadyDone && !flags.includes(PUZZLE_DONE_FLAG)) {
      useGame.getState().flag(PUZZLE_DONE_FLAG);
    }
  }, [alreadyDone, flags]);

  const place = (clueId: string, archiveId: ArchiveId) => {
    setPlacements(prev => {
      const next = {...prev};
      // 一个档案袋只放一张线索：若目标袋已有别的线索，先把它退回桌面
      for (const key of Object.keys(next)) {
        if (next[key] === archiveId && key !== clueId) next[key] = null;
      }
      next[clueId] = archiveId;
      persist(next);
      return next;
    });
    // 移动过的线索清除它自己的判定
    setResults(prev => {
      if (!(clueId in prev)) return prev;
      const next = {...prev};
      delete next[clueId];
      return next;
    });
    setSelected(null);
    setChecked(false);
  };

  const takeBack = (clueId: string) => {
    setPlacements(prev => {
      const next = {...prev, [clueId]: null};
      persist(next);
      return next;
    });
    setResults(prev => {
      const next = {...prev};
      delete next[clueId];
      return next;
    });
    setChecked(false);
    setSelected(null);
  };

  const submit = () => {
    const next: Record<string, boolean> = {};
    for (const clue of clues) next[clue.id] = placements[clue.id] === clue.archive;
    setResults(next);
    setChecked(true);
    // 只有本次提交四张全对，才算完成并弹出提示
    if (clues.every(clue => next[clue.id])) {
      useGame.getState().flag(PUZZLE_DONE_FLAG);
      setCelebrate(true);
    }
  };

  const replay = () => {
    setOrder(shuffled(clues));
    setPlacements(emptyPlacements());
    persist(emptyPlacements());
    setResults({});
    setSelected(null);
    setChecked(false);
    setCelebrate(false);
    setReplaying(true);
  };

  const unplaced = useMemo(
    () => order.filter(clue => !placements[clue.id]),
    [order, placements],
  );

  return <section className="puzzle" aria-label="情报拼图室">
    <header className="puzzle__head">
      <span className="puzzle__kicker">G-07 · 情报拼图室</span>
      <h3>四份情报散落一地，等待你重新归档。</h3>
    </header>

    <div className="puzzle__story">
      <p>🚂 列车行驶途中，神秘情报鹅的皮箱突然被撞开！</p>
      <p>四份刚刚收集到的热点新闻散落一地，原本整理好的情报线索也被打乱了。</p>
      <p>现在，需要各位乘客协助情报鹅，将四张线索卡片放回对应的新闻档案中。</p>
      <p><strong>只有全部归档正确，才能成功恢复这份情报资料！</strong></p>
    </div>

    {alreadyDone && !replaying && <div className="puzzle__banner" role="status">
      <Check size={16} aria-hidden="true"/>
      <span>这份情报已经归档完成。</span>
      <button type="button" onClick={replay}><RotateCcw size={14}/>重新体验</button>
    </div>}

    {/* 档案袋 */}
    <div className="puzzle__archives">
      {archives.map(archive => {
        const inside = clues.filter(clue => placements[clue.id] === archive.id);
        return <div
          key={archive.id}
          role="button"
          tabIndex={selected ? 0 : -1}
          className={`puzzle__archive ${selected ? 'is-target' : ''}`}
          onClick={() => { if (selected) place(selected, archive.id); }}
          onKeyDown={e => { if(e.target!==e.currentTarget)return; if ((e.key === 'Enter' || e.key === ' ') && selected) { e.preventDefault(); place(selected, archive.id); } }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const clueId=e.dataTransfer.getData('text/plain') || selected; if (clues.some(clue=>clue.id===clueId)) place(clueId!, archive.id); }}
          aria-label={`档案 ${archive.code}：${archive.name}`}
        >
          <span className="puzzle__archive-tab">{archive.code}</span>
          <span className="puzzle__archive-name">{archive.name}</span>
          <span className="puzzle__archive-hint">{archive.hint}</span>
          <span className="puzzle__archive-slot">
            {inside.length === 0
              ? <em>待归档</em>
              : inside.map(clue => {
                  const ok = results[clue.id];
                  return <span
                    key={clue.id}
                    className={`puzzle__chip ${ok === true ? 'is-ok' : ok === false ? 'is-bad' : ''}`}
                  >
                    <small>线索 {clue.no}</small>
                    <span>{clue.text}</span>
                    {ok === true && <Check size={12} aria-label="正确"/>}
                    {ok === false && <X size={12} aria-label="不正确"/>}
                    <button type="button" className="puzzle__undo" onClick={e => { e.stopPropagation(); takeBack(clue.id); }}>
                      取回
                    </button>
                  </span>;
                })}
          </span>
        </div>;
      })}
    </div>

    {/* 散落线索 */}
    <div className="puzzle__pool">
      <h4>散落的线索 <span>{unplaced.length} 张未归档</span></h4>
      {unplaced.length === 0
        ? <p className="puzzle__pool-empty">四张线索都已放好，可以提交归档了。</p>
        : <div className="puzzle__cards">
            {unplaced.map(clue => <button
              key={clue.id}
              type="button"
              draggable
              onDragStart={event => { event.dataTransfer.effectAllowed='move'; event.dataTransfer.setData('text/plain',clue.id); setSelected(clue.id); }}
              className={`puzzle__card ${selected === clue.id ? 'is-selected' : ''}`}
              onClick={() => setSelected(selected === clue.id ? null : clue.id)}
              aria-pressed={selected === clue.id}
            >
              <span className="puzzle__card-no">线索 {clue.no}</span>
              <span className="puzzle__card-text">{clue.text}</span>
            </button>)}
          </div>}
      {selected && <p className="puzzle__tip">已选中一张线索，点上面任意档案袋完成归档。</p>}
    </div>

    <div className="puzzle__footer">
      <button
        type="button"
        className="puzzle__submit"
        onClick={submit}
        disabled={!allPlaced}
      >
        提交情报归档 <span aria-hidden="true">📮</span>
      </button>
      {!allPlaced && <span className="puzzle__count">已归档 {placedCount} / 4</span>}
      {checked && !allCorrect && <span className="puzzle__warn">还有线索没归对，调整后再提交一次。</span>}
      {checked && allCorrect && <span className="puzzle__good">四张线索全部归档正确。</span>}
    </div>

    {celebrate && <div className="puzzle__celebrate" onKeyDown={event=>{if(event.key==='Tab'){event.preventDefault();event.currentTarget.querySelector('button')?.focus();}if(event.key==='Escape'){event.stopPropagation();setCelebrate(false);}}} role="dialog" aria-modal="true" aria-label="情报归档成功">
      <div className="puzzle__celebrate-card">
        <span className="puzzle__seal" aria-hidden="true"><Stamp size={26}/></span>
        <h3>🎫 情报归档成功！</h3>
        <p className="puzzle__lead">恭喜乘客！</p>
        <p>四份散落的热点情报已经成功归档，神秘情报鹅的资料终于恢复完整！</p>
        <p>看来你已经掌握了这趟列车上的重要新闻。</p>
        <p className="puzzle__turn">归档只是其中一站，皮箱里的其他材料也值得看看。</p>
        <p className="puzzle__end">🚂 收好这些线索，按自己的顺序继续旅程。</p>
        <button type="button" className="puzzle__celebrate-btn" autoFocus onClick={() => { setCelebrate(false); onClose?.(); }}>
          返回情报工作台
        </button>
      </div>
    </div>}
  </section>;
}

function countPlaced(placements: Placements) {
  return Object.values(placements).filter(Boolean).length;
}
