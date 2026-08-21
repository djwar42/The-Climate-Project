export const NEON = [
  '#ff3c1a',
  '#00b3a4',
  '#ff2d8b',
  '#7b1fe0',
  '#00d084',
  '#2160ff',
  '#e8324a',
  '#ff8a00',
  '#e4e400',
  '#cc2a0f',
];
export const NEON_BASE = ['#d93314', '#009a8d', '#e02579', '#6a18c4', '#1c53db'];
export const neonBase = i => NEON_BASE[((i % 5) + 5) % 5];
export const NEON_EXTENDED = ['#fcb900', '#ff5a2e', '#00c2ff', '#a0e400', '#ff2d5e', '#19d3ff'];
export const neon = i => NEON[((i % NEON.length) + NEON.length) % NEON.length];
export const NEON_FULL = [...NEON, ...NEON_EXTENDED];
export const neonFull = i => NEON_FULL[((i % NEON_FULL.length) + NEON_FULL.length) % NEON_FULL.length];
