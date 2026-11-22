import {useState} from 'react';
import {Check} from 'lucide-react';
import {useGame} from '../game/store';
import {voteFeedback} from '../game/model';
import {getReportVote, recordReportVote, reportTopic, canReflect} from '../game/investigation';
import {cokeVote, cokeVoteConfidence, type CokeVoteOption} from '../data/cokeVote';
import './coke-vote.css';

type Mode = 'first' | 'final';

/**
 * 可口可乐情报的判断投票。
 * · mode="first"：内嵌在列车专报里（读完三层传播、揭开真相之前）
 * · mode="final"：看完皮箱材料后，作为面板内容出现，提交后显示前后对比
 * 复用现有存档的 firstVote / finalVote，不改存档结构。
 */
export function CokeVote({mode, onDone, caseId='coke'}:{mode:Mode; onDone:()=>void; caseId?:string}) {
  const game = useGame(s => s.game);
  const topic=reportTopic(caseId);
  const existing = getReportVote(game,topic.id,mode);
  const [choice, setChoice] = useState<CokeVoteOption['id'] | null>(existing?.choice ?? null);
  const [confidence, setConfidence] = useState(existing?.confidence ?? 3);
  const [done, setDone] = useState(false);

  const copy = {...cokeVote[mode],hint:mode==='first'&&topic.id!=='coke'?'这份判断会随本条专报收进手账。记录之后，可以展开完整消息。':cokeVote[mode].hint};

  const submit = () => {
    if (!choice) return;
    if(mode==='final'&&!canReflect(useGame.getState().game))return;
    useGame.getState().update(current=>recordReportVote(current,topic.id,mode,{choice,confidence,influences:[],at:new Date().toISOString()}));
    setDone(true);
  };

  const feedback = mode === 'final' && getReportVote(game,topic.id,'first') && existing
    ? voteFeedback(getReportVote(game,topic.id,'first')!, existing)
    : null;

  if(mode==='final'&&!canReflect(game))return <div className="coke-vote"><h3>还有材料等你收好。</h3><p>{topic.title}的最终判断会在五项任务全部完成后开启。</p><button type="button" className="coke-vote__submit" onClick={onDone}>返回情报工作台</button></div>;
  if (done || existing) {
    const chosen = topic.options.find(o => o.id === (choice ?? existing?.choice));
    return <div className={`coke-vote coke-vote--${mode}`}>
      <div className="coke-vote__done" role="status" aria-live="polite">
        <h4>✓ 已记下你的判断</h4>
        <p>你选了 <strong>{chosen?.id} · {chosen?.text}</strong>，把握程度 {confidence} / 5。</p>
        {feedback && <p className="coke-vote__feedback">
          对照第一次判断：<strong>{feedback.kind}</strong>（{feedback.confidence}）。
        </p>}
        {mode === 'final' && <button type="button" className="coke-vote__submit" onClick={onDone}>
          收好材料，继续夜行 <span aria-hidden="true">→</span>
        </button>}
      </div>
    </div>;
  }

  return <div className={`coke-vote coke-vote--${mode}`}>
    <p className="coke-vote__hint">{topic.title}</p><h4 className="coke-vote__question">{copy.question}</h4>
    <p className="coke-vote__hint">{copy.hint}</p>
    <div className="coke-vote__options" role="radiogroup" aria-label={copy.question}>
      {topic.options.map(option => {
        const selected = choice === option.id;
        return <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={selected}
          className={`coke-vote__option ${selected ? 'is-selected' : ''}`}
          onClick={() => setChoice(option.id)}
        >
          <span className="coke-vote__badge" aria-hidden="true">{selected ? <Check size={13}/> : option.id}</span>
          <span>{option.text}</span>
        </button>;
      })}
    </div>
    <div className="coke-vote__confidence">
      <span className="coke-vote__label">把握程度</span>
      <div className="coke-vote__scale">
        {[1, 2, 3, 4, 5].map(n => <button
          key={n}
          type="button"
          aria-label={`把握程度 ${n} / 5`}
          aria-pressed={confidence === n}
          className={confidence === n ? 'is-selected' : ''}
          onClick={() => setConfidence(n)}
        >{n}</button>)}
      </div>
      <span className="coke-vote__tip">{cokeVoteConfidence[confidence - 1]}</span>
    </div>
    <button type="button" className="coke-vote__submit" onClick={submit} disabled={!choice}>
      {mode === 'final' ? '提交新的判断' : '记下我的判断'}
    </button>
  </div>;
}
