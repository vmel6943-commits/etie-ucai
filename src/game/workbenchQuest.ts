/**
 * 情报工作台 · 五项任务的统一完成判断
 * -----------------------------------------------------------------------------
 * 五个任务各自的完成规则写在各自的组件里，这里只读它们已经留下的 flag，
 * 不改变任何单项任务的规则。
 *
 * 供工作台底部按钮、完成提示、以及后续「进入下一场景」解锁共用。
 * 组员合并时：只依赖这个文件 + game.flags，不需要理解各任务的内部实现。
 */

import type {GameState} from './model';

export type QuestId = 'opinion' | 'film' | 'puzzle' | 'crisis' | 'tracking';

export type QuestTask = {
  id: QuestId;
  label: string;
  /** 读取实际完成状态 */
  done: (game: GameState) => boolean;
};

export const questTasks: QuestTask[] = [
  { id: 'opinion', label: '个人观点', done: g => g.flags.includes('opinion-done') },
  { id: 'film', label: '广告档案', done: g => g.flags.includes('coke-material:film') },
  { id: 'puzzle', label: '情报拼图室', done: g => g.flags.includes('puzzle-solved') },
  { id: 'crisis', label: '舆情急救室', done: g => g.flags.includes('crisis-done') },
  { id: 'tracking', label: '查看最新信息', done: g => g.flags.includes('tracking-done') },
];

/** 五项全部完成 */
export function workbenchComplete(game: GameState) {
  return questTasks.every(task => task.done(game));
}

/** 已完成数量，用于底部提示 */
export function workbenchProgress(game: GameState) {
  const done = questTasks.filter(task => task.done(game)).length;
  return { done, total: questTasks.length, all: done === questTasks.length };
}

/** 全部完成提示只弹一次 */
export const WORKBENCH_COMPLETE_SHOWN = 'workbench-complete-shown';
