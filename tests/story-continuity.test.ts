import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,canFinish,canRevote,validateImport,type GameState,type Vote} from '../src/game/model.ts';
import {recordReportVote,getReportVote,reportVoteLabel,canReflect,canExplore,canReceiveHiddenPhoto} from '../src/game/investigation.ts';
const vote:Vote={choice:'A',confidence:3,influences:[],at:'2026-11-22T00:00:00Z'};
const allTasks=['opinion-done','coke-material:film','puzzle-solved','crisis-done','tracking-done'];
function record(game:GameState,id:string,phase:'first'|'final',value=vote){Object.assign(game,recordReportVote(game,id,phase,value));}
function ready(){const game=initialState();record(game,'coke','first');game.flags=['coke-truth-revealed',...allTasks];return game;}

test('先读其他专报时投票各自保存，可口可乐的初次判断仍为空',()=>{
 const game=initialState();record(game,'miniso','first');record(game,'math','first',{...vote,choice:'B'});
 assert.equal(getReportVote(game,'coke','first'),null);
 assert.equal(game.firstVote,null);
 assert.match(reportVoteLabel(game,'miniso','first'),/门店/);
 assert.match(reportVoteLabel(game,'math','first'),/研究进展/);
 record(game,'coke','first');
 assert.match(reportVoteLabel(game,'coke','first'),/可口可乐/);
 assert.equal(getReportVote(game,'miniso','first')?.choice,'A');
});
test('每一项未完成任务都会阻止最终判断和第三幕，预先存在的旧 finalVote 也不能绕过',()=>{
 for(const missing of allTasks){
  const game=ready();game.flags=game.flags.filter(flag=>flag!==missing);game.finalVote=vote;
  assert.equal(canReflect(game),false,missing);assert.equal(canRevote(game),false,missing);assert.equal(canExplore(game),false,missing);
  assert.deepEqual(recordReportVote(game,'coke','final',vote),{},missing);
 }
});
test('五项任务、初次判断和完整消息收齐后，最终判断才能开启第三幕与首日盖章',()=>{
 const game=ready();assert.equal(canReflect(game),true);assert.equal(canExplore(game),false);
 record(game,'coke','final',{...vote,choice:'C'});assert.equal(canExplore(game),true);assert.equal(canFinish(game),false);
 game.ticket={nickname:'测试旅客',carriage:'A',seat:'01W',style:0,id:'G07-TEST',checked:true,issuedAt:vote.at};
 assert.equal(canFinish(game),true);assert.equal(game.meals.length,0);assert.equal(game.memory,null);assert.equal(game.flags.includes('broadcast'),false);
 game.ticket.checked=false;assert.equal(canFinish(game),false);
});
test('旧图书馆判断保留归档，当前手账不会把它误读为热点情报',()=>{
 const game=initialState();game.firstVote=vote;game.finalVote={...vote,choice:'B'};
 assert.equal(getReportVote(game,'coke','first'),null);assert.equal(reportVoteLabel(game,'coke','first'),'尚未记录');
 record(game,'coke','first',{...vote,choice:'C'});
 assert.equal(JSON.parse(game.choices['archived-library-first']).choice,'A');assert.equal(JSON.parse(game.choices['archived-library-final']).choice,'B');
 assert.equal(game.firstVote?.choice,'C');assert.equal(game.finalVote,null);
});
test('热点版旧存档的判断仍可读取，历史完成的旅程保留自由探索',()=>{
 const game=initialState();game.flags=['coke-truth-revealed'];game.firstVote=vote;
 assert.equal(getReportVote(game,'coke','first')?.choice,'A');assert.equal(canExplore(game),false);
 game.completedAt=vote.at;assert.equal(canExplore(game),true);
});
test('隐藏照片需要神秘电波和四份资料查阅，赠礼仅触发一次',()=>{
 const game=initialState();assert.equal(canReceiveHiddenPhoto(game),false);
 game.inventory=['cassette'];assert.equal(canReceiveHiddenPhoto(game),false);
 game.flags=['tracking-done'];assert.equal(canReceiveHiddenPhoto(game),true);
 game.flags.push('hidden-photo-gift');assert.equal(canReceiveHiddenPhoto(game),false);
});
test('关闭、导出和恢复后专报判断保持原主题，重复提交不会覆盖',()=>{
 const game=ready();record(game,'miniso','first',{...vote,choice:'B'});record(game,'miniso','first',vote);
 const restored:unknown=JSON.parse(JSON.stringify(game));assert.equal(validateImport(restored),true);
 assert.equal(getReportVote(restored as GameState,'miniso','first')?.choice,'B');
 game.choices['report-vote:math:first']='invalid-json';assert.equal(getReportVote(game,'math','first'),null);
 assert.deepEqual(recordReportVote(game,'unknown','first',vote),{});
});
