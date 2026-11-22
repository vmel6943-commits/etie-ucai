/**
 * 可口可乐情报的判断投票（首次 / 再次）
 * -----------------------------------------------------------------------------
 * 两次投票共用同一组选项，才能比较「信息量变了，判断会不会变」。
 * 选项 id 必须是 A/B/C，才能复用现有存档的 Vote 结构（model.ts 的 Vote）。
 */

export type CokeVoteOption = { id: 'A' | 'B' | 'C'; text: string };

export const cokeVote = {
  first: {
    question: '读完列车专报，你更接近哪种判断？',
    hint: '先记下此刻的想法。看完皮箱里的材料，你还可以重新判断一次。',
  },
  final: {
    question: '看完皮箱里的材料，你的判断变了吗？',
    hint: '没有标准答案，两次判断都会保留下来，方便你自己对照。',
  },
  options: [
    { id: 'A', text: '基本可信：可口可乐确实在放弃 AI。' },
    { id: 'B', text: '被夸大了：标题比事实走得远。' },
    { id: 'C', text: '还说不好：我想再看更多材料。' },
  ] as CokeVoteOption[],
};

export const cokeVoteConfidence = ['很没把握', '不太确定', '一半一半', '比较确定', '很有把握'];
