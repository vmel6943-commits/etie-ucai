import {useEffect, useState} from 'react';
import {Check} from 'lucide-react';
import {useGame, saveUnavailable} from '../game/store';
import {
  opinionPages, OPINION_DONE_FLAG, readOpinionTally, optionOf,
  type OpinionOptionId, type OpinionPage,
} from '../data/opinion';
import './ad-opinion.css';

function Progress({index}:{index:number}) {
  return <div className="ad-opinion__progress" aria-hidden="true">
    <span className={`ad-opinion__dot ${index >= 0 ? 'is-on' : ''}`}/>
    <span className={`ad-opinion__rail ${index >= 1 ? 'is-on' : ''}`}/>
    <span className={`ad-opinion__dot ${index >= 1 ? 'is-on' : ''}`}/>
  </div>;
}

export function AdOpinion({onClose}:{onClose?:()=>void}) {
  const choices = useGame(s => s.game.choices);
  const flags = useGame(s => s.game.flags);

  const answeredA = Boolean(choices[opinionPages[0].key]);
  const answeredB = Boolean(choices[opinionPages[1].key]);

  const [step, setStep] = useState<0 | 1 | 2>(() => (answeredA && answeredB ? 2 : answeredA ? 1 : 0));
  const [selected, setSelected] = useState<OpinionOptionId | null>(null);
  // 存档写入失败时只提示，不阻断：以前回读校验失败会让人永远停在第一题。
  const storageWarning = saveUnavailable();

  const tally = readOpinionTally();

  // 两题都答过 → 标记任务完成（幂等），工作台入口会显示已完成
  useEffect(() => {
    if (answeredA && answeredB && !flags.includes(OPINION_DONE_FLAG)) {
      useGame.getState().flag(OPINION_DONE_FLAG);
    }
  }, [answeredA, answeredB, flags]);

  const page: OpinionPage | null = step < 2 ? opinionPages[step] : null;

  const submit = () => {
    if (!page || !selected) return;
    useGame.getState().choose(page.key, selected);
    if (step === 0) {
      setStep(1);
      setSelected(null);
    } else {
      useGame.getState().flag(OPINION_DONE_FLAG);
      setStep(2);
    }
  };

  /* ───────────────────────── 完成页 ───────────────────────── */
  if (step === 2) {
    const first = optionOf(opinionPages[0], choices[opinionPages[0].key]);
    const second = optionOf(opinionPages[1], choices[opinionPages[1].key]);
    return <section className="ad-opinion ad-opinion--done" aria-label="个人观点调查完成">
      <div className="ad-opinion__page">
        <div className="ad-opinion__done-head">
          <span className="ad-opinion__seal" aria-hidden="true">🎫</span>
          <h3>个人观点调查完成！</h3>
          <Progress index={1}/>
        </div>
        <p className="ad-opinion__lead">恭喜乘客！</p>
        <p className="ad-opinion__text">你已完成本次情报工作台的两项观点调查。</p>
        <p className="ad-opinion__text">从AI广告的真实感之争，到AI短剧的内容质量讨论，你已经留下了自己的判断。</p>

        <div className="ad-opinion__record">
          <h4>本次投票记录</h4>
          <dl>
            <div>
              <dt>① 可口可乐AI广告</dt>
              <dd>{first ? `${first.id} · ${first.name}` : '未记录'}</dd>
            </div>
            <div>
              <dt>② 红果短剧</dt>
              <dd>{second ? `${second.id} · ${second.name}` : '未记录'}</dd>
            </div>
          </dl>
        </div>

        <p className="ad-opinion__closing">🚂 每一种观点，都是列车旅途中值得收藏的声音。</p>
        <p className="ad-opinion__text">感谢你为本次情报调查贡献自己的看法！</p>

        <button type="button" className="ad-opinion__submit" onClick={onClose}>返回情报工作台</button>
        <p className="ad-opinion__note">
          {tally
            ? `群友统计：共 ${tally.total} 人参与`
            : '两道题各只计一次。这些选择只保存在你自己的浏览器里，页面不显示任何票数或百分比。'}
        </p>
      </div>
    </section>;
  }

  /* ───────────────────────── 投票页 ───────────────────────── */
  if (!page) return null;

  return <section className="ad-opinion" aria-label={`个人观点 · 第 ${step + 1} 题`}>
    <div className="ad-opinion__page" key={page.key}>
      <div className="ad-opinion__top">
        <span className="eyebrow">个人观点 · {page.no}</span>
        <Progress index={step}/>
      </div>

      <h3 className="ad-opinion__topic">{page.topic}</h3>

      <div className="ad-opinion__background">
        {page.background.map(text => <p key={text}>{text}</p>)}
      </div>

      {page.image && <figure className="ad-opinion__figure">
        <img src={page.image.src} alt={page.image.alt}/>
      </figure>}

      {page.stat && <div className="ad-opinion__stat">
        <strong>{page.stat.big}</strong>
        <span>{page.stat.unit}</span>
        <ul>{page.stat.lines.map(line => <li key={line}>{line}</li>)}</ul>
      </div>}

      <p className="ad-opinion__question">{page.question}</p>

      <div className="ad-opinion__options" role="radiogroup" aria-label={page.question}>
        {page.options.map(option => {
          const on = selected === option.id;
          return <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={`ad-opinion__option ${on ? 'is-selected' : ''}`}
            onClick={() => setSelected(option.id)}
          >
            <span className="ad-opinion__badge" aria-hidden="true">{on ? <Check size={14}/> : option.id}</span>
            <span className="ad-opinion__copy">
              <strong className="ad-opinion__name">{option.name}</strong>
              <span className="ad-opinion__detail">{option.detail}</span>
            </span>
          </button>;
        })}
      </div>

      {storageWarning && <p className="ad-opinion__error" role="status">浏览器没有允许本地保存，这次选择会在离开页面后失效，但本次旅程仍可继续。</p>}

      <button type="button" className="ad-opinion__submit" onClick={submit} disabled={!selected}>
        {page.submitLabel}
      </button>

      <p className="ad-opinion__note">
        两道题都提交后，这次观点调查才算完成。
      </p>
    </div>
  </section>;
}
