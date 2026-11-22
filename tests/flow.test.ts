import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,canFinish,canOpenSuitcase,task,type GameState,type Vote} from '../src/game/model.ts';
import {recordReportVote,getReportVote,canReflect,canExplore,reportTopicHasFinal,reportTopics} from '../src/game/investigation.ts';
import {workbenchComplete} from '../src/game/workbenchQuest.ts';
import {
  informantAction,reportCloseTarget,platformAction,workbenchAction,
  needsExplorationIntro,endingMissing,INVESTIGATION_COMPLETE,
} from '../src/game/flow.ts';
import {previousScene,boardingAction} from '../src/game/presentation.ts';

const vote:Vote={choice:'A',confidence:3,influences:[],at:'2026-11-22T00:00:00Z'};
const allTasks=['opinion-done','coke-material:film','puzzle-solved','crisis-done','tracking-done'];
function record(game:GameState,id:string,phase:'first'|'final',value:Vote=vote){Object.assign(game,recordReportVote(game,id,phase,value));}
function ticketed(checked=true) {
  const game=initialState();
  game.ticket={nickname:'测试旅客',carriage:'A',seat:'01W',style:0,id:'G07-TEST',checked,issuedAt:vote.at};
  return game;
}

test('情报贩子场景：未揭真相先读专报，开箱后直接进工作台，不再多点一次',()=>{
  const game=initialState();
  assert.equal(informantAction(game),'report');
  game.flags.push('coke-truth-revealed');
  assert.equal(informantAction(game),'suitcase');
  game.flags.push('suitcase');
  assert.equal(informantAction(game),'workbench');
});

test('关闭专报只在“可口可乐且刚揭开真相”时接皮箱，读别的专报不会被弹走',()=>{
  const game=initialState();
  assert.equal(reportCloseTarget(game,'coke'),'close');
  game.flags.push('coke-truth-revealed');
  assert.equal(reportCloseTarget(game,'coke'),'suitcase');
  assert.equal(reportCloseTarget(game,'miniso'),'close');
  assert.equal(reportCloseTarget(game,'math'),'close');
});

test('站台：未检票去检票，首次登车播报，已在旅程中直接回车厢',()=>{
  const game=ticketed(false);
  assert.equal(platformAction(game),'check');
  game.ticket!.checked=true;
  assert.equal(platformAction(game),'board');
  game.flags.push('map-seen');
  assert.equal(platformAction(game),'carriage');
});

test('工作台去向：材料没做完留在工作台，缺初次判断回专报，做完进最终判断，投完进第三幕',()=>{
  const game=initialState();
  assert.equal(workbenchAction(game),'materials');
  game.flags.push('coke-truth-revealed',...allTasks);
  assert.equal(workbenchAction(game),'report');
  record(game,'coke','first');
  assert.equal(workbenchAction(game),'vote');
  record(game,'coke','final');
  assert.equal(workbenchAction(game),'explore');
});

test('第三幕开场对白只播一次，重进不再重复领取调查记录',()=>{
  const game=initialState();
  assert.equal(needsExplorationIntro(game),true);
  game.flags.push(INVESTIGATION_COMPLETE);
  assert.equal(needsExplorationIntro(game),false);
});

test('返回关系：检票口回到候车大厅，而不是出票机',()=>{
  assert.equal(previousScene.gate,'hall');
  assert.equal(previousScene.machine,'hall');
  assert.equal(previousScene.workbench,'informant');
});

test('三份专报都能各记一次判断，但只有可口可乐开放“调查后的判断”',()=>{
  const game=initialState();
  record(game,'miniso','first',{...vote,choice:'B'});
  record(game,'math','first',{...vote,choice:'C'});
  assert.equal(getReportVote(game,'miniso','first')?.choice,'B');
  assert.equal(getReportVote(game,'math','first')?.choice,'C');
  assert.equal(reportTopicHasFinal('coke'),true);
  assert.equal(reportTopicHasFinal('miniso'),false);
  assert.equal(reportTopicHasFinal('math'),false);
  assert.equal(reportTopics.length,3);
  // 就算调用方硬要写，也会被拒绝
  assert.deepEqual(recordReportVote(game,'miniso','final',vote),{});
});

test('广告档案必须自己确认，点开不再自动记账',()=>{
  const game=initialState();
  assert.equal(workbenchComplete(game),false);
  // 只打开材料不会写 flag —— 打开动作不再产生完成标记
  assert.equal(game.flags.includes('coke-material:film'),false);
  game.flags.push('coke-material:film');
  assert.equal(game.flags.includes('coke-material:film'),true);
});

test('盖章页缺什么就说什么，满足条件后才允许盖章',()=>{
  const game=initialState();
  assert.deepEqual(endingMissing(game),['领取车票','完成五项情报任务并留下最终判断']);
  const ticket=ticketed(false);
  assert.deepEqual(endingMissing(ticket),['完成检票','完成五项情报任务并留下最终判断']);
  ticket.ticket!.checked=true;
  assert.deepEqual(endingMissing(ticket),['完成五项情报任务并留下最终判断']);
  assert.equal(canFinish(ticket),false);
});

test('工作台与情报贩子的提示文案跟随真实状态，不会一直显示旧提示',()=>{
  const game=initialState();
  game.scene='informant';
  assert.match(task(game),/先读可口可乐专报/);
  game.flags.push('coke-truth-revealed');
  assert.match(task(game),/打开皮箱/);
  game.flags.push('suitcase');
  assert.match(task(game),/去情报工作台/);
  game.scene='workbench';
  game.flags.push(...allTasks);
  record(game,'coke','first');
  assert.match(task(game),/留下最终判断/);
  record(game,'coke','final');
  assert.match(task(game),/去夜行车厢/);
});

test('完整旅程：从封面一路走到首日盖章，每一步的闸门都与剧情一致',()=>{
  const game=initialState();

  // 第一幕
  game.started=true;
  assert.equal(boardingAction(game),'拆开邀请函');
  game.flags.push('letter');
  assert.equal(boardingAction(game),'前往雾中车站');
  game.scene='hall';
  assert.equal(boardingAction(game),'和乘务员打个招呼');
  game.flags.push('briefed');
  assert.equal(boardingAction(game),'领取我的车票');
  game.ticket={nickname:'旅客',carriage:'A',seat:'01W',style:0,id:'G07-A',checked:false,issuedAt:vote.at};
  game.scene='gate';
  assert.equal(boardingAction(game),'出示我的车票');
  assert.equal(platformAction(game),'check');
  game.ticket.checked=true;
  assert.equal(boardingAction(game),'走向站台');
  game.scene='platform';
  assert.equal(boardingAction(game),'登上列车');
  assert.equal(platformAction(game),'board');
  game.scene='carriage';
  assert.equal(boardingAction(game),'展开七日路线图');
  game.flags.push('boarded','map-seen');
  assert.equal(boardingAction(game),'走向过道尽头的皮箱');

  // 第二幕
  game.scene='informant';
  assert.equal(informantAction(game),'report');
  record(game,'coke','first');
  game.flags.push('coke-truth-revealed');
  assert.equal(canOpenSuitcase(game),true);
  assert.equal(informantAction(game),'suitcase');
  game.flags.push('suitcase');
  assert.equal(informantAction(game),'workbench');
  game.scene='workbench';
  assert.equal(workbenchAction(game),'materials');
  assert.equal(canReflect(game),false);
  game.flags.push(...allTasks);
  assert.equal(workbenchComplete(game),true);
  assert.equal(workbenchAction(game),'vote');
  record(game,'coke','final');
  assert.equal(canExplore(game),true);
  assert.equal(workbenchAction(game),'explore');
  assert.equal(reportCloseTarget(game,'coke'),'suitcase');
  assert.equal(needsExplorationIntro(game),true);
  game.flags.push(INVESTIGATION_COMPLETE);

  // 第三幕
  game.scene='passenger';
  assert.equal(needsExplorationIntro(game),false);
  assert.equal(canFinish(game),true);
  Object.assign(game,{completedAt:vote.at});
  assert.equal(canFinish(game),true);
  assert.match(task(game),/已经收藏/);
});
