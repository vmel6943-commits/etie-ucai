import type {GameState, Vote} from './model.ts';
import {cokeVote} from '../data/cokeVote.ts';
import {workbenchComplete, workbenchProgress} from './workbenchQuest.ts';

export const reportTopics = [
  {id:'coke', title:'可口可乐与 AI 广告', flag:'coke-truth-revealed', hasFinal:true, options:cokeVote.options},
  {id:'miniso', title:'名创优品与友情营销', flag:'report-miniso-revealed', hasFinal:false, options:[
    {id:'A', text:'基本可信：广告代表门店行为规定发生了变化。'},
    {id:'B', text:'被夸大了：广告创意被写成了门店新规。'},
    {id:'C', text:'还说不好：我想再了解广告的完整表达。'},
  ]},
  {id:'math', title:'AI 与数学研究', flag:'report-math-revealed', hasFinal:false, options:[
    {id:'A', text:'基本可信：这次研究意味着人类数学家将被替代。'},
    {id:'B', text:'被夸大了：研究进展不能直接推出替代结论。'},
    {id:'C', text:'还说不好：验证、理解与研究仍需分别讨论。'},
  ]},
] as const;
export type ReportId = (typeof reportTopics)[number]['id'];
export type VotePhase = 'first' | 'final';
export const reportTopic = (id: string) => reportTopics.find(topic=>topic.id===id) ?? reportTopics[0];
export const reportVoteKey = (id: string, phase: VotePhase) => `report-vote:${id}:${phase}`;

function validVote(value: unknown): value is Vote {
  if(!value || typeof value!=='object') return false;
  const vote=value as Vote;
  return ['A','B','C'].includes(vote.choice) && Number.isInteger(vote.confidence) && vote.confidence>=1 && vote.confidence<=5 &&
    Array.isArray(vote.influences) && vote.influences.every(item=>typeof item==='string') && typeof vote.at==='string';
}
export function getReportVote(game: GameState, id: string, phase: VotePhase): Vote | null {
  const raw=game.choices[reportVoteKey(id,phase)];
  if(raw) {
    try { const vote:unknown=JSON.parse(raw); if(validVote(vote))return vote; } catch { /* Keep malformed optional data out of the UI. */ }
  }
  // Prior hotspot editions stored the Coca-Cola comparison in these two fields.
  if(id==='coke' && game.flags.includes('coke-truth-revealed')) return phase==='first'?game.firstVote:game.finalVote;
  return null;
}
export function reportVoteLabel(game:GameState,id:string,phase:VotePhase) {
  const vote=getReportVote(game,id,phase);
  return reportTopic(id).options.find(option=>option.id===vote?.choice)?.text ?? '尚未记录';
}
/** 只有可口可乐这份专报有「调查后的判断」，另外两份只记录一次判断 */
export function reportTopicHasFinal(id:string) {
  return reportTopic(id).hasFinal;
}
export function recordReportVote(game:GameState,id:string,phase:VotePhase,vote:Vote):Partial<GameState> {
  if(!reportTopics.some(topic=>topic.id===id) || !validVote(vote) || getReportVote(game,id,phase))return {};
  if(phase==='final' && (!canReflect(game)||!getReportVote(game,id,'first')||!reportTopicHasFinal(id)))return {};
  const choices={...game.choices,[reportVoteKey(id,phase)]:JSON.stringify(vote)};
  if(id!=='coke')return {choices};
  // Preserve historical library votes separately when replacing their old storage slots.
  if(!game.flags.includes('coke-truth-revealed') && game.firstVote && !game.choices[reportVoteKey('coke','first')]) {
    choices['archived-library-first']=JSON.stringify(game.firstVote);
    if(game.finalVote)choices['archived-library-final']=JSON.stringify(game.finalVote);
  }
  return phase==='first'?{choices,firstVote:vote,finalVote:null}:{choices,finalVote:vote};
}
export function canReflect(game:GameState) {
  return workbenchComplete(game) && game.flags.includes('coke-truth-revealed') && !!getReportVote(game,'coke','first');
}
export function canExplore(game:GameState) {
  // Completed historical journeys keep their free-exploration access.
  return !!game.completedAt || canReflect(game) && !!getReportVote(game,'coke','final');
}
export function readyForEnding(game:GameState) {
  return !!game.ticket?.checked && canReflect(game) && !!getReportVote(game,'coke','final');
}
export function investigationStatus(game:GameState) {
  const progress=workbenchProgress(game);
  return `五项情报任务 ${progress.done}/${progress.total} 项完成`;
}
export function canReceiveHiddenPhoto(game:GameState) {
  return game.flags.includes('tracking-done') && game.inventory.includes('cassette') && !game.flags.includes('hidden-photo-gift');
}
