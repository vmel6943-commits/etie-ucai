/**
 * 情报工作台 · 个人观点（连续两页投票）
 * -----------------------------------------------------------------------------
 * 一个弹窗内依次完成两题，两道都提交才算任务完成。
 *
 * 数据只放内容与键名，交互逻辑在 scenes/AdOpinion.tsx。
 *
 * 保存方式：复用现有存档的 choices 字段（每题一个键），不新增存档字段、不改 version。
 * 注意：localStorage 只能识别「这台设备的这个浏览器」，
 * 无法识别跨设备的同一个人，也不构成全体乘客的实时统计。
 */

export type OpinionOptionId = 'A' | 'B' | 'C' | 'D';

export type OpinionOption = {
  id: OpinionOptionId;
  name: string;
  detail: string;
};

export type OpinionPage = {
  /** 存档里 choices 的键，改了会读不到旧选择 */
  key: string;
  /** 顶部页码，例如 01/02 */
  no: string;
  topic: string;
  background: string[];
  question: string;
  options: OpinionOption[];
  submitLabel: string;
  /** 小型配图（可选） */
  image?: { src: string; alt: string };
  /** 数据卡（没用配图时用来替代，避免放不存在的图） */
  stat?: { big: string; unit: string; lines: string[] };
};

export const opinionPages: OpinionPage[] = [
  {
    key: 'opinion-coke-ai',
    no: '01/02',
    topic: '🎄 可口可乐AI广告，你站哪一边？',
    background: [
      '前两年，可口可乐曾尝试使用生成式AI制作圣诞广告，却因部分画面缺乏真实感而引发争议。',
      '2026年，可口可乐美国版圣诞广告《Enjoy Joy》重新采用真人拍摄，通过家庭聚会、朋友相伴等生活场景传递节日温暖。',
    ],
    question: '如果两支广告同样精彩，你更喜欢哪一种制作方式？',
    options: [
      { id: 'A', name: '真人拍摄', detail: '更真实、有温度' },
      { id: 'B', name: 'AI生成', detail: '技术也能带来创意' },
      { id: 'C', name: '内容优先', detail: '好看最重要' },
      { id: 'D', name: '看情况', detail: '不同广告适合不同方式' },
    ],
    submitLabel: '提交投票 →',
    image: { src: './assets/enjoy-joy-official.png', alt: '可口可乐《Enjoy Joy》广告画面' },
  },
  {
    key: 'opinion-hongguo-short',
    no: '02/02',
    topic: '🎬 AI短剧越来越多，真的越来越好看了吗？',
    background: [
      '红果短剧公布的2026年10月内容治理数据显示，超过1.2万部AI剧因低质内容等问题被拦截或下架。',
      '需要注意的是，部分作品是在上线前被拦截，并不意味着1.2万部已经播出的短剧全部被下架。',
      'AI正在降低短剧制作门槛，但当作品数量快速增加，内容质量也引发了新的讨论。',
    ],
    question: '你怎么看待AI短剧大量涌现的现象？',
    options: [
      { id: 'A', name: '支持AI创作', detail: '降低普通人的创作门槛' },
      { id: 'B', name: '担忧内容质量', detail: '容易出现大量同质化作品' },
      { id: 'C', name: '内容优先', detail: '关键是剧本与创意' },
      { id: 'D', name: '理性观察', detail: '应该结合治理标准看待数据' },
    ],
    submitLabel: '提交投票并完成任务 ✓',
    stat: {
      big: '1.2万+',
      unit: '部 AI 剧被拦截或下架',
      lines: ['数据区间：2026 年 10 月', '含上线前拦截，不等于全部已播出'],
    },
  },
];

/** 两道都提交后写入的 flag，用于工作台入口显示「已完成」 */
export const OPINION_DONE_FLAG = 'opinion-done';

/** 群友真实统计的数据形状。接入后端后由 readOpinionTally 返回。 */
export type OpinionTally = {
  counts: Partial<Record<OpinionOptionId, number>>;
  total: number;
  updatedAt?: string;
};

/**
 * 目前没有共享数据服务，固定返回 null。
 * 组件在拿到 null 时不会显示任何票数或百分比。
 */
export function readOpinionTally(): OpinionTally | null {
  return null;
}

export function optionOf(page: OpinionPage, id: string | undefined) {
  return page.options.find(option => option.id === id);
}
