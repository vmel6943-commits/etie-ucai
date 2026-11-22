/** Shared colors keep the selectable on-screen ticket and saved PNG in sync. */
export const ticketPalettes = [
  {
    paper: '#142b3d', edge: '#0a1a2a', light: '#29465a', ink: '#fff0d2', muted: '#d5c29e', gold: '#dfc187', line: '#cda76b80',
    stubPaper: '#f2e2c1', stubEdge: '#d8be92', stubInk: '#263747', stubMuted: '#62513e', ribbon: '#f0dfbd', ribbonInk: '#253849',
  },
  {
    paper: '#efe2c6', edge: '#d7bd91', light: '#fff7e3', ink: '#243c4a', muted: '#66543d', gold: '#8b6a3e', line: '#92764b99',
    stubPaper: '#2b4352', stubEdge: '#142a39', stubInk: '#f8e8c7', stubMuted: '#e4d0ac', ribbon: '#334c58', ribbonInk: '#f8ebd1',
  },
  {
    paper: '#75473d', edge: '#4d302b', light: '#a3654e', ink: '#fff0d8', muted: '#ecd1af', gold: '#e8c791', line: '#e3bb8999',
    stubPaper: '#f0ddbc', stubEdge: '#d6ba92', stubInk: '#573831', stubMuted: '#6b4b3e', ribbon: '#f1d6ad', ribbonInk: '#603d34',
  },
] as const;

export function ticketPalette(style: number) {
  return ticketPalettes[style] || ticketPalettes[0];
}
