import type {GameState} from './model.ts';

// Only normalize scripted dialogue. A traveller's own nickname and input stay theirs.
const legacyNames: Record<string, string> = {
  '\u9a6c\u96e8\u79cb': '乘务员',
  '\u5468\u7d2b\u7433': '神秘情报贩子',
  '\u80e1\u712f\u8587': '列车长',
  '\u9093\u7434': '手账记录员',
};

export function normalizeHistory(game: GameState): GameState {
  return {
    ...game,
    history: game.history.map(entry => {
      const role = legacyNames[entry.speaker] ?? (Object.values(legacyNames).includes(entry.speaker) ? entry.speaker : undefined);
      if (!role) return entry;
      let text = entry.text;
      for (const [name, replacement] of Object.entries(legacyNames)) {
        text = text.replaceAll(name, replacement);
      }
      text = text.replaceAll('乘务员乘务员', '乘务员').replaceAll('列车长列车长', '列车长');
      text = text.replaceAll('开往周日的列车', '鹅铁U彩').replaceAll('烧鹅濑粉号', '鹅铁U彩').replaceAll('鹅鹅列车', '鹅铁U彩');
      return {speaker: role, text};
    }),
  };
}
