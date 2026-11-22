import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createTicketId, issueDate} from '../src/ui-refresh/ticketDetails.ts';
import {ticketPalette, ticketPalettes} from '../src/ui-refresh/ticketPalettes.ts';
import {ticketLocomotive} from '../src/ui-refresh/ticketIllustration.ts';

test('浏览器没有 randomUUID 时仍可生成兼容旧存档格式的车票编号', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  try {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {getRandomValues: (bytes: Uint8Array) => { bytes.set([1, 2, 3, 4]); return bytes; }},
    });
    assert.match(createTicketId(), /^G07-[0-9A-F]{8}$/);
    Object.defineProperty(globalThis, 'crypto', {configurable: true, value: undefined});
    assert.match(createTicketId(), /^G07-[0-9A-F]{8}$/);
  } finally {
    if (original) Object.defineProperty(globalThis, 'crypto', original);
    else Reflect.deleteProperty(globalThis, 'crypto');
  }
});

test('票面展示真实出票日期，遇到无效日期时不会中断渲染', () => {
  const issued = new Date(2026, 10, 22, 12).toISOString();
  assert.equal(issueDate(issued), '2026/11/22');
  assert.equal(issueDate('invalid'), '—');
});

test('三种既有票面保留不同主色，并为未知样式使用午夜蓝', () => {
  assert.equal(ticketPalettes.length, 3);
  assert.equal(new Set(ticketPalettes.map(palette => palette.paper)).size, 3);
  assert.equal(ticketPalette(0).paper, '#142b3d');
  assert.equal(ticketPalette(1).paper, '#efe2c6');
  assert.equal(ticketPalette(2).paper, '#75473d');
  assert.equal(ticketPalette(9), ticketPalette(0));
});

test('票面列车插画随项目提供，并可用于子目录部署', () => {
  assert.ok(ticketLocomotive.startsWith('./assets/'));
  assert.ok(existsSync(new URL('../public/' + ticketLocomotive.slice(2), import.meta.url)));
});
