/** The date shown on the keepsake is the actual issue date, not a departure time. */
export function issueDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

/** Keeps the existing G07-XXXXXXXX format even in browsers without randomUUID. */
export function createTicketId(): string {
  const bytes = new Uint8Array(4);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return 'G07-' + Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}
