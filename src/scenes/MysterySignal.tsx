import {useEffect, useRef, useState} from 'react';
import {Play, RotateCcw, Radio} from 'lucide-react';
import {useGame} from '../game/store';
import {art} from '../data/config';
import './mystery-signal.css';

/**
 * 神秘电波
 * -----------------------------------------------------------------------------
 * 纯剧情介绍，不是任务：
 * · 没有答题、投票、解谜、查阅按钮
 * · 不强制进入情报工作台，不自动跳转
 * · 没有真实录音文件，所以用「文字逐句出现」模拟广播，不假装有音频
 */

type Line = { kind: 'noise' | 'speech' | 'end'; text: string };

const BROADCAST: Line[] = [
  { kind: 'noise', text: '（列车行驶途中，广播里突然传来一阵电流杂音……）' },
  { kind: 'noise', text: '📻 滋……滋滋……' },
  { kind: 'speech', text: '📣「各位乘客请注意！」' },
  { kind: 'speech', text: '「本列车刚刚截获了四份来自不同地方的神秘消息……」' },
  { kind: 'speech', text: '🎄「有品牌重新选择真人拍摄圣诞广告……」' },
  { kind: 'speech', text: '🛍️「有商店竟然打出了『支持大声喧哗』的广告……」' },
  { kind: 'speech', text: '🤖「有AI参与挑战困扰人类百余年的数学难题……」' },
  { kind: 'speech', text: '🎬「还有一个月内上万部AI短剧被平台处理的消息……」' },
  { kind: 'speech', text: '「这些看似毫不相关的事件，究竟隐藏着怎样的故事？」' },
  { kind: 'end', text: '（电流声再次响起，广播信号突然中断……）' },
];

const INTERVAL = 900;
const PROGRESS_KEY = 'signal-progress';

function savedProgress(heard: boolean) {
  if (heard) return BROADCAST.length;
  const raw = Number(useGame.getState().game.choices[PROGRESS_KEY] ?? 0);
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(BROADCAST.length, Math.floor(raw)));
}

export function MysterySignal() {
  const heard=useGame(state=>state.game.flags.includes('signal-heard'));
  // 关掉弹窗再回来，从上次听到的那一句继续，不用重头播一遍。
  const [shown, setShown] = useState(() => savedProgress(heard));
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const saveProgress = (value: number) => {
    useGame.getState().choose(PROGRESS_KEY, String(value));
  };

  const stop = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
  };

  /* 组件卸载/弹窗关闭时清掉定时器 */
  useEffect(() => () => {
    if (timer.current !== null) window.clearInterval(timer.current);
  }, []);

  const play = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    const restart = shown >= BROADCAST.length;
    if (restart) { setShown(0); saveProgress(0); }
    setPlaying(true);
    let next = restart ? 0 : shown;
    timer.current = window.setInterval(() => {
      next += 1;
      setShown(next);
      saveProgress(next);
      if (next >= BROADCAST.length) {
        window.clearInterval(timer.current!);
        timer.current = null;
        setPlaying(false);
        useGame.getState().flag('signal-heard');
        useGame.getState().collect('cassette','神秘电波收藏家');
      }
    }, INTERVAL);
  };

  const clear = () => { stop(); setShown(0); saveProgress(0); };

  const finished = shown >= BROADCAST.length;

  return <div className="mystery-signal">
    <div className="mystery-signal__hero">
      <img src={art('cassette')} alt="旧式录音磁带" draggable={false}/>
      <span className={`mystery-signal__wave ${playing ? 'is-live' : ''}`} aria-hidden="true">
        <i/><i/><i/><i/><i/>
      </span>
    </div>

    <header className="mystery-signal__head">
      <h3>神秘电波</h3>
      <p>一段意外闯入的列车广播……</p>
    </header>

    <div className="mystery-signal__screen" aria-live="polite">
      {shown === 0 && <p className="mystery-signal__idle">
        <Radio size={16} aria-hidden="true"/>
        按下播放，收听这段闯入的广播。
      </p>}
      {BROADCAST.slice(0, shown).map((line, i) => (
        <p key={i} className={`mystery-signal__line is-${line.kind}`}>{line.text}</p>
      ))}
      {playing && <p className="mystery-signal__cursor" aria-hidden="true">▌</p>}
    </div>

    <div className="mystery-signal__controls">
      <button type="button" className="mystery-signal__play" onClick={play} disabled={playing}>
        <Play size={16} aria-hidden="true"/>
        {playing ? '广播播放中……' : finished ? '重新播放' : shown > 0 ? '继续播放' : '播放广播'}
      </button>
      {shown > 0 && !playing && <button type="button" className="mystery-signal__again" onClick={clear}>
        <RotateCcw size={14} aria-hidden="true"/>清空
      </button>}
    </div>

    {finished&&<p role="status">这段神秘电波已连同旧磁带收进行囊。等进入夜行车厢、查阅完四份新闻后，可以到广播角把磁带交给情报贩子。</p>}
    <p className="mystery-signal__note">本段为剧情模拟广播，没有真实录音文件，因此以文字逐句呈现。</p>
  </div>;
}
