/**
 * 情报工作台 · 舆情急救室
 * -----------------------------------------------------------------------------
 * 模拟情境：名创优品「不扫兴的友情」广告中「支持大声喧哗」被单独截出传播。
 * 所有评论、数值、结果均为游戏模拟，不代表真实品牌舆情。
 *
 * 数值规则写死在前端，不接任何接口。
 */

export type CrisisAction = {
  id: string;
  /** 行动标题 */
  title: string;
  /** 一句话说明 */
  detail: string;
  /** 舆情热度变化（负数为降温） */
  heat: number;
  /** 品牌信任度变化 */
  trust: number;
  /** 执行后的一条模拟反馈 */
  feedback: string;
};

export const crisisComments = [
  { id: 'A', author: '网友A', text: '这广告挺有创意，感觉很懂朋友之间的快乐！' },
  { id: 'B', author: '网友B', text: '支持大声喧哗？这样不会打扰其他顾客吗？' },
  { id: 'C', author: '网友C', text: '所以名创优品以后可以随便吵闹了？' },
];

export const crisisActions: CrisisAction[] = [
  {
    id: 'publish',
    title: '公开完整广告内容',
    detail: '帮助网友了解广告原本的创意。',
    heat: -14,
    trust: +13,
    feedback: '完整短片被更多人看到，评论区开始出现「原来是这样」的讨论。',
  },
  {
    id: 'explain',
    title: '解释广告表达的真实含义',
    detail: '强调友情营销并不等于取消门店规范。',
    heat: -10,
    trust: +11,
    feedback: '官方说明了「友情提醒」只是创意表达，部分误解被澄清。',
  },
  {
    id: 'respond',
    title: '回应顾客的实际担忧',
    detail: '说明品牌尊重正常购物秩序。',
    heat: -12,
    trust: +15,
    feedback: '门店秩序的说明让常客安心，关于「打扰其他顾客」的质疑减少。',
  },
  {
    id: 'delete',
    title: '删除所有负面评论',
    detail: '可能引发网友对品牌透明度的质疑。',
    heat: +14,
    trust: -12,
    feedback: '评论消失后截图被搬到了其他平台，「删评」成了新的讨论点。',
  },
  {
    id: 'meme',
    title: '继续玩梗，不作解释',
    detail: '可能吸引关注，但也可能让误解继续扩大。',
    heat: +9,
    trust: -5,
    feedback: '玩梗确实带来了流量，但「到底能不能喧哗」仍然没人回答。',
  },
];

export const crisisStart = { heat: 75, trust: 50 };
export const crisisMaxActions = 3;

export type CrisisOutcome = 'success' | 'stable' | 'worse';

export function judgeCrisis(heat: number, trust: number): CrisisOutcome {
  if (heat <= 45 && trust >= 78) return 'success';
  if (heat <= 65 && trust >= 52) return 'stable';
  return 'worse';
}

export const outcomeText: Record<CrisisOutcome, { title: string; line: string; advice: string }> = {
  success: {
    title: '成功化解',
    line: '误解得到澄清，品牌信任有所恢复。',
    advice: '你把事实、含义和顾客关切都摆到了台面上，热度降下来了，信任也回来了。',
  },
  stable: {
    title: '基本稳定',
    line: '舆情暂时得到控制，但仍存在部分质疑。',
    advice: '局面稳住了，不过还有人对门店秩序存疑，后续仍需要持续回应。',
  },
  worse: {
    title: '危机升级',
    line: '处理方式未能有效回应争议，舆情继续扩大。',
    advice: '回避或压制会让讨论转移到别处，热度退了不快，信任也掉了。',
  },
};

export const CRISIS_DONE_FLAG = 'crisis-done';
