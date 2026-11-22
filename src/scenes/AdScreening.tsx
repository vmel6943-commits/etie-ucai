import {useState} from 'react';
import {Play, ExternalLink, VideoOff, Check} from 'lucide-react';
import {useGame} from '../game/store';
import {adVideos, type AdVideo} from '../data/adVideos';
import {sound} from '../utils/audio';
import './ad-screening.css';

/**
 * 列车广告放映室
 * · 用视频平台的官方 iframe 嵌入，站内直接播放，不跳转
 * · 切换卡片时 iframe 重新挂载，上一支随之停止（不会两个同时在放）
 * · 实测不可嵌入的视频不显示播放器，改为「当前视频暂不支持站内播放」+ 原视频入口
 * · 不使用任何本地视频文件
 * · 看完后需要点「记入情报任务」，与另外四项任务保持一致，点开不等于完成
 */
export const AD_SCREENING_DONE = 'coke-material:film';

export function AdScreening({onClose}:{onClose?:()=>void}) {
  // 默认打开第一支可嵌入的视频
  const [activeId, setActiveId] = useState(
    (adVideos.find(v => v.embeddable) ?? adVideos[0]).id,
  );
  const active: AdVideo = adVideos.find(v => v.id === activeId) ?? adVideos[0];
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({});
  const done = useGame(s => s.game.flags.includes(AD_SCREENING_DONE));

  const markBroken = (id: string) => setBrokenCovers(prev => (prev[id] ? prev : {...prev, [id]: true}));
  const markDone = () => { sound('success'); useGame.getState().flag(AD_SCREENING_DONE); };

  return <section className="screening" aria-label="列车广告放映室">
    <header className="screening__head">
      <span className="screening__kicker">G-07 · 列车广告放映室</span>
      <h3>三份广告影像，记录创意如何随时代改变。</h3>
    </header>

    {/* 播放器 */}
    <div className="screening__player">
      <div className="screening__frame">
        {active.embeddable && active.embed
          ? <iframe
              key={active.id}
              src={active.embed}
              title={`${active.title} · ${active.film}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          : <div className="screening__offline">
              <VideoOff size={22} aria-hidden="true"/>
              <strong>当前视频暂不支持站内播放</strong>
              <p>{active.unavailableNote ?? '这支视频的来源平台不允许内嵌播放。'}</p>
              <a href={active.watch} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} aria-hidden="true"/>{active.watchLabel}
              </a>
            </div>}
      </div>

      <div className="screening__meta">
        <div>
          <span className="screening__year">{active.year}</span>
          <h4>{active.title}</h4>
          <p className="screening__film">影片：{active.film}</p>
        </div>
        {active.embeddable && <a className="screening__watch" href={active.watch} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={14} aria-hidden="true"/>{active.watchLabel}
        </a>}
      </div>
      <p className="screening__desc">{active.desc}</p>
    </div>

    {/* 视频卡片 */}
    <div className="screening__cards" role="tablist" aria-label="广告影片">
      {adVideos.map(video => {
        const on = video.id === active.id;
        const cover = video.cover ?? video.coverNetwork;
        return <button
          key={video.id}
          type="button"
          role="tab"
          aria-selected={on}
          className={`screening__card ${on ? 'is-active' : ''} ${video.embeddable ? '' : 'is-off'}`}
          onClick={() => setActiveId(video.id)}
        >
          <span className="screening__cover">
            {cover && !brokenCovers[video.id] && (
              <img src={cover} alt="" loading="lazy" onError={() => markBroken(video.id)}/>
            )}
            {(!cover || brokenCovers[video.id]) && <i aria-hidden="true"/>}
            <span className="screening__play" aria-hidden="true">
              {video.embeddable ? <Play size={16}/> : <VideoOff size={15}/>}
            </span>
          </span>
          <span className="screening__card-no">{video.no}</span>
          <span className="screening__card-name">{video.card}</span>
          <span className="screening__card-year">
            {video.year}{!video.embeddable && ' · 站内不可播'}
          </span>
        </button>;
      })}
    </div>

    <div className="screening__footer">
      <button
        type="button"
        className={`screening__done ${done?'is-done':''}`}
        onClick={markDone}
        disabled={done}
      >
        {done?<><Check size={16} aria-hidden="true"/>已记入情报任务</>:'看完了，记入情报任务'}
      </button>
      <p className="screening__hint">打开播放室不会自动完成任务，看完后点上面的按钮，五项任务才会记上这一项。</p>
      <button type="button" className="screening__back" onClick={onClose}>返回情报工作台</button>
    </div>
  </section>;
}
