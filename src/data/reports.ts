/**
 * 列车专报 · 情报档案数据
 * -----------------------------------------------------------------------------
 * 三份情报共用同一套页面模板与交互（阅读 → 追踪三层传播 → 揭开真相 → 讨论），
 * 本文件只放「内容」，不含任何样式与交互逻辑。
 *
 * 新增第四份情报时：在 reportCases 末尾追加一项即可，不需要改组件与样式。
 *
 * 注意：
 * · 情报 01 的 flag 仍是 'coke-truth-revealed'，剧情推进（皮箱解锁）依赖它，勿改。
 * · 情报 02 / 03 使用各自的 flag，只记录、不参与剧情推进。
 */

export type ReportVersion = {
  label: string;
  text: string;
  note: string;
  href?: string;
  hrefLabel?: string;
};

export type ReportVisual =
  | { kind: 'film'; src: string; alt: string; credit: string; href: string; hrefLabel: string }
  | { kind: 'still'; src: string; alt: string; credit: string }
  | { kind: 'clipping'; kicker: string; big: string; unit: string; lines: string[]; credit: string };

export type ReportCase = {
  id: string;
  /** 顶部页眉里的期号 */
  no: string;
  /** 情报切换标签上的短名 */
  tab: string;
  masthead: string;
  headline: string;
  visual: ReportVisual;
  briefTitle: string;
  brief: string[];
  prompt: string;
  startLabel: string;
  versions: ReportVersion[];
  truth: {
    title: string;
    paragraphs: string[];
    note?: string;
    sources: { href: string; label: string }[];
    closeLabel: string;
  };
  discussion?: { title: string; items: string[] };
  /** 揭开真相时写入的 flag */
  flag: string;
};

const official = 'https://www.coca-colacompany.com/media-center/coca-cola-2026-holiday-campaign';
const coverage = 'https://www.marketingdive.com/news/coca-cola-pivots-from-divisive-ai-generated-ads-for-holiday-campaign/875215/';
const clarification = 'https://www.mediapost.com/publications/article/419592/coke-drops-enjoy-joy-with-key-ingredient-humans.html';

export const reportCases: ReportCase[] = [
  /* ───────────────────────────── 情报 01 · 可口可乐 ───────────────────────────── */
  {
    id: 'coke',
    no: '第一份情报',
    tab: '01 可口可乐',
    masthead: 'ETIE UCAI GAZETTE · 第一份情报',
    headline: '可口可乐，真的要和AI说再见了？',
    visual: {
      kind: 'film',
      src: './assets/enjoy-joy-official.png',
      alt: '可口可乐官方《Enjoy Joy》广告画面：家人朋友在厨房准备食物',
      credit: '画面来源：可口可乐官方新闻页面',
      href: official,
      hrefLabel: '打开可口可乐官方页面观看 Enjoy Joy 广告',
    },
    briefTitle: '🕵️ 神秘情报贩子｜今日速递',
    brief: [
      '2024、2025年，可口可乐的AI圣诞广告引发不少讨论。',
      '但今年11月19日，美国版圣诞广告《Enjoy Joy》却重新选择真人实拍，呈现家人团聚、朋友相伴的温暖瞬间。',
      '有人说，这是可口可乐向AI说再见。<br/><strong>事情真的是这样吗？</strong>',
    ],
    prompt: '「同一条消息，竟然出现了三个不同的版本……」',
    startLabel: '追踪这条消息',
    versions: [
      { label: '第一份 · 原始报道概述', text: '可口可乐2026年美国圣诞广告改用真人实拍', note: '这份报道描述的是美国市场这组广告的创作方式。', href: coverage, hrefLabel: '查看原始报道 ↗' },
      { label: '第二份 · 二次转发（模拟）', text: '可口可乐因AI广告遭吐槽，放弃AI改用真人拍摄！', note: '模拟转发把外界争议写成了品牌选择的确定原因。' },
      { label: '第三份 · 再次传播（模拟）', text: '可口可乐承认AI广告失败，宣布全面停用AI！', note: '模拟传播把一组广告的调整扩大成品牌整体决定。' },
    ],
    truth: {
      title: '真相 · 一支广告，不等于一项全面决定',
      paragraphs: [
        '美国版《Enjoy Joy》采用真人实拍，不代表可口可乐全面放弃AI。公司发言人表示，这次选择不意味着更广泛的政策转向，AI仍可能在适当场景中辅助创意。',
      ],
      note: '第二、第三份标题为剧情模拟，并非真实新闻。',
      sources: [
        { href: official, label: '可口可乐官方发布 ↗' },
        { href: clarification, label: '公司发言人回应 ↗' },
      ],
      closeLabel: '收好专报',
    },
    flag: 'coke-truth-revealed',
  },

  /* ───────────────────────────── 情报 02 · 名创优品 ───────────────────────────── */
  {
    id: 'miniso',
    no: '第二份情报',
    tab: '02 名创优品',
    masthead: 'ETIE UCAI GAZETTE · 第二份情报',
    headline: '名创优品：逛店真的可以「不守规矩」？',
    visual: {
      kind: 'still',
      src: './assets/miniso-friends.webp',
      alt: '名创优品「不扫兴的友情」广告图：支持大声喧哗、支持小声蛐蛐、支持无奖竞猜、支持只逛不买等图示',
      credit: '画面来源：名创优品「不扫兴的友情」广告',
    },
    briefTitle: '🕵️ 神秘情报贩子｜今日速递',
    brief: [
      '名创优品最近推出了一支「不扫兴的友情」短片，把猜价格、反复闻香薰、捶打公仔、只逛不买等行为变成朋友之间的快乐互动。',
      '短片还借用了苏轼与张怀民的典故，表达有人愿意陪你一起无聊的幸福感。',
      '可没过多久，网上就传出了「名创优品推出新规」的说法。<br/><strong>一支广告，真的变成门店制度了吗？</strong>',
    ],
    prompt: '「同一条消息，竟然出现了三个不同的版本……」',
    startLabel: '追踪这条消息',
    versions: [
      { label: '第一份 · 原始报道', text: '名创优品推出「不扫兴的友情」广告，打造好友专属逛店指南', note: '这份报道描述的是广告本身的创意主题。' },
      { label: '第二份 · 二次转发（模拟）', text: '名创优品推出新规？逛店可以随便捶公仔、大声聊天！', note: '模拟转发把广告里的创意表达写成了「新规」。' },
      { label: '第三份 · 再次传播（模拟）', text: '名创优品全面放开门店行为限制？顾客以后想怎么闹都行！', note: '模拟传播把一条广告夸大成门店制度的全面放开。' },
    ],
    truth: {
      title: '真相 · 一场被误读的友情营销',
      paragraphs: [
        '原来，名创优品并没有宣布取消门店行为规范。',
        '广告只是用幽默的方式，把好友逛店时的各种小互动包装成「友情提醒」，鼓励大家享受有人陪伴、不必拘谨的快乐。',
      ],
      note: '传播陷阱：将广告里的创意表达误读为真实规定，再通过夸张标题制造误解。',
      sources: [],
      closeLabel: '收好专报',
    },
    discussion: {
      title: '💬 看完之后，聊聊友情',
      items: [
        '你觉得真正的好朋友，就是无论做什么都不会扫兴吗？还是说，有时候敢于拒绝、提出不同意见，才是真正的友情？',
        '你和朋友逛名创优品时，做过最无聊但又特别开心的一件事是什么？',
      ],
    },
    flag: 'report-miniso-revealed',
  },

  /* ───────────────────────────── 情报 03 · AI 与数学 ───────────────────────────── */
  {
    id: 'math',
    no: '第三份情报',
    tab: '03 AI 与数学',
    masthead: 'ETIE UCAI GAZETTE · 第三份情报',
    headline: 'AI证明了数学难题，人类却看不懂？',
    visual: {
      kind: 'clipping',
      kicker: 'LEAN · MATHLIB · 形式化验证',
      big: '17,000,000',
      unit: '行验证代码',
      lines: [
        '正文草稿曾写到 25 万页以上，但没有公开。',
        '公开的是 Lean 形式化证明代码。',
        '2026 年 11 月 21 日，Lean 与 Mathlib 社区联合确认：代码证明的命题成立。',
      ],
      credit: '视觉为编辑部排版示意，非报道截图',
    },
    briefTitle: '🕵️ 神秘情报贩子｜今日速递',
    brief: [
      '11月20日，Anthropic数学家Levent Alpöge宣布，他与AI模型Claude合作，找到了黎曼猜想的证明方法。',
      '他曾尝试生成一份供人类阅读的证明文字稿，结果超过25万页，最终没有公开，而是发布了约1700万行Lean形式化证明代码。',
      '11月21日，Lean和Mathlib社区发布联合声明，确认代码证明了正确的数学命题。但数学家们仍然需要研究：AI究竟使用了什么关键数学思想。',
      '<strong>验证通过，就等于人类看懂了吗？</strong>',
    ],
    prompt: '「同一条消息，竟然出现了三个不同的版本……」',
    startLabel: '追踪这条消息',
    versions: [
      { label: '第一份 · 原始报道', text: '数学家携手AI提出黎曼猜想证明，公开1700万行验证代码', note: '这份报道描述的是研究进展与验证代码的公开。' },
      { label: '第二份 · 二次转发（模拟）', text: 'AI破解167年数学难题！25万页证明连数学家都看不懂？', note: '模拟转发把证明的体量与「看不懂」拼进了同一个标题。' },
      { label: '第三份 · 再次传播（模拟）', text: 'AI已超越人类数学家？未来数学研究再也不需要人类！', note: '模拟传播把一次研究突破夸大成人类与 AI 的替代关系。' },
    ],
    truth: {
      title: '真相 · 机器验证通过，不等于人类已经理解',
      paragraphs: [
        'AI 参与完成的黎曼猜想形式化证明，已经通过独立验证。',
        '但超过 25 万页的是未公开的人类可读文字草稿，而不是目前公开的证明文件。',
        '这次事件真正引发的思考是：当 AI 能够产生复杂的数学证明，计算机能够检查其逻辑正确性，人类数学家未来是否更需要负责理解、解释和发现证明背后的关键思想？',
      ],
      note: '传播陷阱：把「AI参与重大数学突破」夸大为「AI全面超越数学家」，忽略了研究、验证与理解之间的区别。',
      sources: [],
      closeLabel: '收好专报',
    },
    discussion: {
      title: '💬 看完之后，聊聊 AI 与人类',
      items: [
        '如果 AI 解决了一道困扰人类 167 年的数学难题，计算机也确认它的证明正确，但数学家暂时还无法完全理解其中的思路，你认为这算真正的数学突破吗？',
        '未来人类在科学研究中又该扮演什么角色？',
      ],
    },
    flag: 'report-math-revealed',
  },
];

export const reportById = (id: string) => reportCases.find(c => c.id === id) ?? reportCases[0];
