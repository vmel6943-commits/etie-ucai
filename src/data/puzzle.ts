/**
 * 情报工作台 · 情报拼图室
 * -----------------------------------------------------------------------------
 * 四份新闻档案 + 四张打乱顺序的线索卡，把线索归档到正确档案。
 * 只有四张全部正确才算完成；完成后可重复体验，但不会清掉已完成状态。
 */

export type ArchiveId = 'coke' | 'miniso' | 'math' | 'hongguo';

export type Archive = { id: ArchiveId; code: string; name: string; hint: string };

export type Clue = { id: string; no: string; text: string; archive: ArchiveId };

export const archives: Archive[] = [
  { id: 'coke', code: 'A', name: '可口可乐AI圣诞广告', hint: '品牌 · 广告' },
  { id: 'miniso', code: 'B', name: '名创优品「不扫兴的友情」', hint: '品牌 · 营销' },
  { id: 'math', code: 'C', name: 'AI与黎曼猜想', hint: 'AI · 科学研究' },
  { id: 'hongguo', code: 'D', name: '红果短剧内容治理', hint: 'AI · 内容治理' },
];

export const clues: Clue[] = [
  {
    id: 'c1',
    no: '01',
    text: '2026年美国圣诞广告重新采用真人实拍，展现家庭团聚的节日场景。',
    archive: 'coke',
  },
  {
    id: 'c2',
    no: '02',
    text: '支持无奖竞猜、只逛不买，让朋友之间的相处不再扫兴。',
    archive: 'miniso',
  },
  {
    id: 'c3',
    no: '03',
    text: '约1700万行形式化证明代码，AI参与挑战困扰数学界多年的难题。',
    archive: 'math',
  },
  {
    id: 'c4',
    no: '04',
    text: '一个月内，超过1.2万部AI剧因内容质量等问题被平台拦截或下架。',
    archive: 'hongguo',
  },
];

/** Fisher–Yates 洗牌，每轮开始都重新打乱 */
export function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // 避免恰好等于原始顺序（4 张时概率很低，但仍兜一下）
  const same = out.every((item, i) => item === list[i]);
  return same && out.length > 1 ? [...out.slice(1), out[0]] : out;
}

export const PUZZLE_DONE_FLAG = 'puzzle-solved';
