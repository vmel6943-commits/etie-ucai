import {useState} from 'react';
import {useGame} from '../game/store';
import {art} from '../data/config';
import {Button} from '../components/ui';
import {sound} from '../utils/audio';
import {CokeReport} from './CokeReport';

/**
 * 第二幕的两个门面组件。
 * 早前那批「图书馆案例」调查组件（视频分镜、公告对比、时间线、证词、传播记录）
 * 已随第二幕改成热点情报而失效，这里只保留仍在使用的专报与皮箱。
 */
export function Report({onClose}:{onClose:(topicId:string)=>void}){
  return <CokeReport onClose={onClose}/>;
}

export function Suitcase({onOpen,notify,cokeMode=false}:{onOpen:()=>void;notify:(s:string)=>void;cokeMode?:boolean}){
  const wasOpened=useGame(s=>s.game.flags.includes('suitcase'));
  const [opened,setOpened]=useState(wasOpened);
  return <div className={`case-unlock ${opened?'opened':''}`}>
    <img className="suitcase-art" src={art(opened?'suitcaseOpen':'suitcase')} alt={opened?'已打开的情报皮箱':'神秘情报贩子的情报皮箱'}/>
    <h3>{opened?'同一件事，原来还有这些材料。':'“来，帮我扶一下箱盖。”'}</h3>
    <p>{opened
      ? (cokeMode?'皮箱已经打开，里面的广告、报道与传播记录都可以翻阅。':'视频、公告、时间记录，还有不同人的说法。你可以从最在意的那一份开始，慢慢翻看。')
      : '神秘情报贩子把皮箱放在桌上，轻轻拨开铜扣。纸张的边角，已经从箱缝里露了出来。'}</p>
    {opened
      ? <>
          {!cokeMode&&<div className="unlocked-records"><span>视频档案</span><span>完整公告</span><span>现场记录</span></div>}
          <Button onClick={onOpen}>{cokeMode?'进入皮箱，翻阅情报':'自由翻阅皮箱里的材料'}</Button>
        </>
      : <Button onClick={()=>{setOpened(true);useGame.getState().flag('suitcase');sound('paper');}}>帮她打开皮箱</Button>}
  </div>;
}
