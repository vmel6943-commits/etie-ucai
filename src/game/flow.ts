/**
 * 剧情推进判定（纯函数）
 * -----------------------------------------------------------------------------
 * 这些判断原先散落在 App.tsx 的 switch 里，既不好测也不好读。
 * 现在集中在这里：组件只负责“把判定结果变成一次跳转或一个面板”，
 * 测试则可以直接驱动整条剧情链，不需要 React 环境。
 */
import type {GameState} from './model.ts';
import {canOpenSuitcase, has} from './model.ts';
import {canExplore, canReflect, getReportVote} from './investigation.ts';
import {workbenchProgress} from './workbenchQuest.ts';

export const INVESTIGATION_COMPLETE = 'investigation-complete';

/** 情报贩子场景的推进目标：先读专报 → 开箱 → 之后直接进工作台 */
export type InformantAction = 'report' | 'suitcase' | 'workbench';
export function informantAction(game: GameState): InformantAction {
  if (!canOpenSuitcase(game)) return 'report';
  // 皮箱已经打开过就直接进工作台，不再让玩家多点一次“进入皮箱”。
  if (has(game, 'suitcase')) return 'workbench';
  return 'suitcase';
}

/** 从专报关闭时的去向：只有刚揭开口可乐真相的那一份才接皮箱 */
export function reportCloseTarget(game: GameState, topicId: string): 'suitcase' | 'close' {
  return topicId === 'coke' && canOpenSuitcase(game) ? 'suitcase' : 'close';
}

/** 站台“登上列车”的去向：未检票→检票；已在旅程中→回车厢；首次登车→播报 */
export type PlatformAction = 'check' | 'board' | 'carriage';
export function platformAction(game: GameState): PlatformAction {
  if (!game.ticket?.checked) return 'check';
  if (has(game, 'map-seen')) return 'carriage';
  return 'board';
}

/** 工作台“进入下一场景”的去向 */
export type WorkbenchAction = 'report' | 'vote' | 'explore' | 'materials';
export function workbenchAction(game: GameState): WorkbenchAction {
  if (canExplore(game)) return 'explore';
  if (!workbenchProgress(game).all) return 'materials';
  if (!canReflect(game)) return 'report';
  return 'vote';
}

/** 第三幕开场对白只播一次，重进时直接回车厢，避免重复领取调查记录 */
export function needsExplorationIntro(game: GameState) {
  return !has(game, INVESTIGATION_COMPLETE);
}

/** 手账盖章缺什么，用于盖章页的提示 */
export function endingMissing(game: GameState): string[] {
  const missing: string[] = [];
  if (!game.ticket) missing.push('领取车票');
  else if (!game.ticket.checked) missing.push('完成检票');
  if (!canReflect(game)) missing.push('完成五项情报任务并留下最终判断');
  else if (!getReportVote(game, 'coke', 'final')) missing.push('记录调查后的判断');
  return missing;
}
