/**
 * 情报工作台 · 查看最新信息（新闻档案）
 * -----------------------------------------------------------------------------
 * 只做新闻阅读：真实新闻介绍、事件背景、具体经过、为什么引发关注、新闻图片、
 * 新闻来源，以及每篇底部的【标记已查阅】。
 *
 * 这里**没有**传播版本对比、模拟标题、真假判断或投票 —— 那些属于其他模块。
 *
 * 板块 01–04 计入 0/4 进度，板块 05（情报总结）只供自由阅读，不计入。
 */

export type TrackingSection = { heading: string; paragraphs: string[] };

export type TrackingBoard = {
  id: string;
  tab: string;
  kicker: string;
  title: string;
  time?: string;
  image?: { src: string; alt: string };
  stat?: { big: string; unit: string; lines: string[] };
  sections: TrackingSection[];
  links: { href: string; label: string }[];
  required: boolean;
};

const official = 'https://www.coca-colacompany.com/media-center/coca-cola-2026-holiday-campaign';
const coverage = 'https://www.marketingdive.com/news/coca-cola-pivots-from-divisive-ai-generated-ads-for-holiday-campaign/875215/';
const clarification = 'https://www.mediapost.com/publications/article/419592/coke-drops-enjoy-joy-with-key-ingredient-humans.html';

export const trackingBoards: TrackingBoard[] = [
  {
    id: 'coke',
    tab: '可口可乐',
    kicker: '板块 01 · 品牌与广告',
    title: '可口可乐：圣诞广告为什么重新选择真人拍摄？',
    time: '2026 年 11 月 19 日',
    image: {
      src: './assets/enjoy-joy-official.png',
      alt: '可口可乐官方《Enjoy Joy》广告画面：家人朋友在厨房准备食物',
    },
    sections: [
      {
        heading: '事件背景',
        paragraphs: [
          '2024、2025 年，可口可乐曾在圣诞广告中使用生成式AI制作画面。这类广告技术上很新，但部分观众认为画面虽然精致，却缺少真实生活里的情感与细节。',
          '关于真实感和情感表达的讨论，正是从这两年的AI广告开始的。',
        ],
      },
      {
        heading: '事件具体经过',
        paragraphs: [
          '2026 年 11 月 19 日，可口可乐推出美国版圣诞广告《Enjoy Joy》，改用真人实拍，呈现家庭聚会、朋友相伴等生活场景。',
          '官方发布页面提供影片与画面素材，品牌以真实人物和真实场景来传递节日温度。',
        ],
      },
      {
        heading: '为什么引发关注？',
        paragraphs: [
          '一家长期尝试AI的品牌，在最重要的节日档期回到真人拍摄，自然成了广告行业和消费者观察的对象。',
          '需要明确的是：美国市场的部分广告改用真人拍摄，并不代表可口可乐全面放弃AI。品牌在英国等其他市场仍有AI制作的圣诞广告，也没有宣布全面停用AI。',
        ],
      },
    ],
    links: [
      { href: official, label: '查看新闻原文：可口可乐官方发布 ↗' },
      { href: coverage, label: 'MarketingDive 报道 ↗' },
      { href: clarification, label: '公司发言人回应 ↗' },
    ],
    required: true,
  },
  {
    id: 'miniso',
    tab: '名创优品',
    kicker: '板块 02 · 品牌与营销',
    title: '名创优品：为什么推出「不扫兴的友情」广告？',
    time: '2026 年 11 月',
    image: {
      src: './assets/miniso-friends.webp',
      alt: '名创优品「不扫兴的友情」广告图：支持大声喧哗、支持小声蛐蛐、支持只逛不买等图示',
    },
    sections: [
      {
        heading: '事件背景',
        paragraphs: [
          '零售品牌的广告通常围绕商品、价格和上新展开。名创优品这次把镜头从货架挪开，转向「和朋友一起逛店」这件事本身。',
          '「不扫兴的友情」是一支关于陪伴的短片，而不是一份商品清单。',
        ],
      },
      {
        heading: '事件具体经过',
        paragraphs: [
          '短片把好友逛店时会做的各种小事，做成一组「友情提示」：支持大声喧哗、支持小声蛐蛐、支持无奖竞猜、支持携带人形挂件、支持抱大腿、支持过度分享、支持小拳出击、支持集体自恋、支持只逛不买、支持放鸽子。',
          '创意还借用了苏轼与张怀民的典故，表达有人愿意陪你一起无聊，是一件很幸福的事。',
        ],
      },
      {
        heading: '为什么引发关注？',
        paragraphs: [
          '它卖的不是商品，而是情绪价值：有人陪你逛、陪你浪费时间、不催你走。这种「不扫兴」的关系描述，正好击中年轻人对友谊的日常体验。',
          '从营销角度看，品牌把一次购物行为，换成了可以分享的关系叙事，因此更容易在社交平台被讨论和二次演绎。',
        ],
      },
    ],
    links: [],
    required: true,
  },
  {
    id: 'math',
    tab: 'AI 与黎曼猜想',
    kicker: '板块 03 · AI 与科学研究',
    title: 'AI与黎曼猜想：AI如何参与数学难题的证明？',
    time: '2026 年 11 月 20—21 日',
    stat: {
      big: '17,000,000',
      unit: '行 Lean 形式化证明代码',
      lines: ['人类可读的证明草稿超过 25 万页，最终没有公开', '2026 年 11 月 21 日，Lean 与 Mathlib 社区确认命题成立'],
    },
    sections: [
      {
        heading: '事件背景',
        paragraphs: [
          '黎曼猜想由黎曼在 1859 年提出，讨论的是黎曼 ζ 函数非平凡零点的分布，与素数如何分布密切相关。',
          '它悬置了一百六十多年，被列为克雷数学研究所的千禧年大奖难题之一，至今没有人给出被数学界普遍接受的证明。',
        ],
      },
      {
        heading: '事件具体经过',
        paragraphs: [
          '11 月 20 日，Anthropic 数学家 Levent Alpöge 宣布，他与AI模型 Claude 合作，找到了黎曼猜想的证明方法。',
          '他曾尝试生成一份供人类阅读的证明文字稿，结果超过 25 万页，最终没有公开，转而发布了约 1700 万行 Lean 形式化证明代码。',
          '11 月 21 日，Lean 和 Mathlib 社区发布联合声明，确认这段代码证明了正确的数学命题。',
        ],
      },
      {
        heading: '为什么引发关注？',
        paragraphs: [
          '关键在于「机器能验证」和「人能理解」是两件事。形式化代码可以被计算机一步步核验，但数学家仍需研究：AI 究竟使用了什么关键的数学思想。',
          '这也带出对未来科研分工的讨论——AI 擅长提出与验证，人类更擅长解释、归纳与判断价值。',
          '需要说明：这是AI参与取得的重要进展，并不等于人类数学家已经被取代。',
        ],
      },
    ],
    links: [],
    required: true,
  },
  {
    id: 'hongguo',
    tab: '红果短剧',
    kicker: '板块 04 · AI 与内容治理',
    title: '红果短剧：一个月为什么处理了1.2万余部AI剧？',
    time: '2026 年 10 月治理数据',
    stat: {
      big: '12,323',
      unit: '部 AI 剧被拦截或下架',
      lines: ['统计区间：2026 年 10 月', '含上线前拦截，不等于全部已播出后被下架'],
    },
    sections: [
      {
        heading: '事件背景',
        paragraphs: [
          '生成式AI正在快速降低短剧的制作门槛：周期短、成本低、产量高，短时间内就能产出大量作品。',
          '供给变多的同时，同质化、低质内容也集中出现，平台因此需要加强分发前的筛选。',
        ],
      },
      {
        heading: '事件具体经过',
        paragraphs: [
          '红果短剧公布 2026 年 10 月的内容治理数据，共 12,323 部AI剧因低质内容等问题被拦截或下架。',
          '这个数字需要拆开看：其中一部分是在上线前被拦截，并没有真正播出；不能把它理解成 1.2 万余部已经播出的短剧全部被下架。',
        ],
      },
      {
        heading: '为什么引发关注？',
        paragraphs: [
          '一个月上万部的处理规模，让「AI 短剧到底能不能看」成为公共话题：数量涨得很快，质量标准跟不跟得上。',
          '行业也在观察这次治理是短期清理，还是会沉淀为常态化机制——这直接关系到创作效率与内容质量能否同时成立。',
        ],
      },
    ],
    links: [],
    required: true,
  },
  {
    id: 'summary',
    tab: '情报总结',
    kicker: '板块 05 · 总结',
    title: '四条新闻背后的共同现象',
    sections: [
      {
        heading: 'AI 同时出现在四个位置',
        paragraphs: [
          '可口可乐的改变发生在广告创作，名创优品在营销表达，黎曼猜想在研究验证，红果短剧在生产工具。',
          '同一种技术，正在同时改写内容的生产方式、表达方式和验证方式。',
        ],
      },
      {
        heading: '技术越强，判断越重要',
        paragraphs: [
          'AI 让制作更快、门槛更低，产量随之放大；产量一大，真假与优劣就更难分辨。',
          '这四条新闻都在提醒同一件事：技术能生成结果，但「这个结果意味着什么」，仍然需要人来判断。',
        ],
      },
      {
        heading: '可以带走的一句',
        paragraphs: [
          '看新闻时先分清三件事：哪部分是事实，哪部分是推测，哪部分是被放大的说法。',
          '再往下追问一层——它到底说的是「部分」还是「全部」。',
        ],
      },
    ],
    links: [],
    required: false,
  },
];

export const requiredBoards = trackingBoards.filter(board => board.required);

export const trackingFlag = (id: string) => `tracked:${id}`;
export const TRACKING_DONE_FLAG = 'tracking-done';
