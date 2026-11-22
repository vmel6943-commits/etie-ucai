import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../src/game/model.ts';
import {normalizeHistory} from '../src/game/legacyHistory.ts';
import {journeyTitle} from '../src/data/identity.ts';
import {ticketDesign} from '../src/ui-refresh/ticketDesign.ts';

test('train title agrees with live and exported ticket copy', () => {
  assert.equal(journeyTitle, '鹅铁U彩');
  assert.equal(ticketDesign.title, journeyTitle);
  assert.ok(ticketDesign.subtitle.includes(journeyTitle));
});

test('legacy scripted history uses role names while preserving player input and progress', () => {
  const game = initialState();
  game.history = [
    {speaker: '\u9a6c\u96e8\u79cb', text: '我是乘务员\u9a6c\u96e8\u79cb。欢迎搭乘开往周日的列车。'},
    {speaker: '\u5468\u7d2b\u7433', text: '我是\u5468\u7d2b\u7433。'},
    {speaker: '旅客', text: '自己的名字和记录'},
  ];
  const updated = normalizeHistory(game);
  assert.deepEqual(updated.history.slice(0,2), [
    {speaker: '乘务员', text: '我是乘务员。欢迎搭乘鹅铁U彩。'},
    {speaker: '神秘情报贩子', text: '我是神秘情报贩子。'},
  ]);
  assert.deepEqual(updated.history[2], game.history[2]);
  assert.equal(updated.flags, game.flags);
  assert.deepEqual(normalizeHistory(updated), updated);
});
