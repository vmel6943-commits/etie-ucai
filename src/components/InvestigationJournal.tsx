import {reportTopics,getReportVote,reportVoteLabel,investigationStatus,reportTopicHasFinal} from '../game/investigation';
import {questTasks} from '../game/workbenchQuest';
import {opinionPages,optionOf} from '../data/opinion';
import {useGame} from '../game/store';
import {Button} from './ui';
import type {ShareKind} from '../utils/share';

export function InvestigationJournal({onShare}:{onShare:(kind:ShareKind)=>void}) {
  const game=useGame(state=>state.game);
  return <section className="investigation-record" aria-label="热点情报调查记录">
    <span className="eyebrow">HOTSPOT STORIES / MY NOTES</span>
    <h3>皮箱里的热点情报</h3>
    <p>{investigationStatus(game)}</p>
    <ul className="investigation-checklist">
      {questTasks.map(task=><li key={task.id}><span>{task.label}</span><strong>{task.done(game)?'已完成':'待体验'}</strong></li>)}
    </ul>
    {reportTopics.map(topic=>{
      const first=getReportVote(game,topic.id,'first');
      const final=getReportVote(game,topic.id,'final');
      const revealed=game.flags.includes(topic.flag);
      const hasFinal=reportTopicHasFinal(topic.id);
      return <section className="journal-finding" key={topic.id}>
        <h4>{topic.title}</h4>
        <p className="muted">{revealed?'完整消息已展开':'还可以回到列车专报继续阅读'}</p>
        {first&&<p><strong>初次判断</strong> {reportVoteLabel(game,topic.id,'first')} <small>把握程度 {first.confidence}/5</small></p>}
        {/* 只有可口可乐这份会走到“调查后的判断”，另外两份就不要留一行空白让人以为漏做 */}
        {hasFinal&&final&&<p><strong>调查后判断</strong> {reportVoteLabel(game,topic.id,'final')} <small>把握程度 {final.confidence}/5</small></p>}
        {hasFinal&&!final&&<p className="muted">看完皮箱材料后，可以再记一次判断。</p>}
        {!hasFinal&&first&&<p className="muted">这份专报只记录一次判断。</p>}
        {!first&&<p>这份情报尚未留下判断。</p>}
      </section>;
    })}
    <h4>我留下的个人观点</h4>
    {opinionPages.map(page=>{
      const option=optionOf(page,game.choices[page.key]);
      return <div className="journal-finding" key={page.key}><p>{page.question}</p><strong>{option?`${option.name} · ${option.detail}`:'尚未记录'}</strong></div>;
    })}
    {getReportVote(game,'coke','final')&&<Button secondary onClick={()=>onShare('opinion')}>保存我的情报记录卡</Button>}
  </section>;
}
