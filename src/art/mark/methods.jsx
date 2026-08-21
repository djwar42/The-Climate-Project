import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const W = 300, H = 460;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function divergeRamp(t) {
  const stops = [
    [0.00, [33, 96, 255]], [0.30, [128, 174, 250]], [0.5, [232, 226, 210]],
    [0.70, [255, 45, 139]], [1.00, [123, 31, 224]],
  ];
  const u0 = Math.min(1, Math.max(0, t));
  for (let i = 1; i < stops.length; i++) {
    if (u0 <= stops[i][0]) {
      const [t0, a] = stops[i - 1], [t1, b] = stops[i];
      const u = (u0 - t0) / (t1 - t0);
      return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * u)).join(',')})`;
    }
  }
  return `rgb(${stops[stops.length - 1][1].join(',')})`;
}

const COLS = 9, ROWS = 22;

export default function Mark({ height = 300, style = {} }) {
  const r = rng(1957);
  const cell = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cx = x / (COLS - 1), cy = y / (ROWS - 1);
      const seasonal = 0.34 * Math.sin(cx * Math.PI * 2 - 0.6);
      const warming = -0.44 + 1.12 * Math.pow(cy, 1.2);
      const wave = 0.16 * Math.sin(cy * 7.1 + cx * 2.4);
      cell.push({ x, y, v: seasonal + warming + wave + (r() - 0.5) * 0.26 });
    }
  }
  const mag = Math.max(...cell.map((c) => Math.abs(c.v)));
  const shade = (v) => divergeRamp(0.5 + Math.sign(v) * 0.5 * Math.pow(Math.min(1, Math.abs(v) / mag), 0.68));

  const gx = 14, gy = 56, gw = 218, gh = 372;
  const cw = gw / COLS, ch = gh / ROWS;

  const colMean = Array.from({ length: COLS }, (_, x) =>
    cell.filter((c) => c.x === x).reduce((a, c) => a + c.v, 0) / ROWS);
  const rowMean = Array.from({ length: ROWS }, (_, y) =>
    cell.filter((c) => c.y === y).reduce((a, c) => a + c.v, 0) / COLS);
  const cMag = Math.max(...colMean.map(Math.abs));
  const rMag = Math.max(...rowMean.map(Math.abs));

  const topMid = 34, topAmp = 15;
  const rightMid = 264, rightAmp = 25;

  const sorted = cell.map((c) => Math.abs(c.v)).sort((a, b) => b - a);
  const thresh = sorted[Math.floor(sorted.length * 0.09)];

  return (
    <div aria-hidden="true" style={{ height, minWidth: 0, ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}>
        {}
        {cell.map((c, i) => (
          <rect key={`c${i}`} x={gx + c.x * cw} y={gy + c.y * ch} width={cw + 0.4} height={ch + 0.4}
            fill={shade(c.v)} />
        ))}
        {}
        {Array.from({ length: COLS - 1 }, (_, i) => (
          <line key={`lv${i}`} x1={gx + (i + 1) * cw} y1={gy} x2={gx + (i + 1) * cw} y2={gy + gh}
            stroke={INK} strokeWidth="0.6" opacity="0.2" />
        ))}
        {Array.from({ length: ROWS - 1 }, (_, i) => (
          <line key={`lh${i}`} x1={gx} y1={gy + (i + 1) * ch} x2={gx + gw} y2={gy + (i + 1) * ch}
            stroke={INK} strokeWidth="0.6" opacity="0.2" />
        ))}
        {}
        {cell.map((c, i) => (Math.abs(c.v) >= thresh
          ? <circle key={`x${i}`} cx={gx + (c.x + 0.5) * cw} cy={gy + (c.y + 0.5) * ch} r={Math.min(cw, ch) * 0.36}
            fill="none" stroke={INK} strokeWidth="1.4" opacity="0.85" />
          : null))}
        <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke={INK} strokeWidth="1.6" />

        {}
        <line x1={gx} y1={topMid} x2={gx + gw} y2={topMid} stroke={INK} strokeWidth="1" opacity="0.55" />
        {colMean.map((v, x) => {
          const h = (v / cMag) * topAmp;
          return <rect key={`cm${x}`} x={gx + x * cw + 2} y={h >= 0 ? topMid - h : topMid}
            width={cw - 4} height={Math.max(1.2, Math.abs(h))} fill={shade(v * 1.35)} />;
        })}
        {colMean.map((v, x) => (
          <rect key={`cd${x}`} x={gx + (x + 0.5) * cw - 1.4} y={topMid - (v / cMag) * topAmp - 1.4}
            width="2.8" height="2.8" fill={INK} />
        ))}
        <path d={colMean.map((v, x) => `${x ? 'L' : 'M'}${(gx + (x + 0.5) * cw).toFixed(1)} ${(topMid - (v / cMag) * topAmp).toFixed(1)}`).join('')}
          fill="none" stroke={NEON[2]} strokeWidth="1.6" opacity="0.9" />

        {}
        <line x1={rightMid} y1={gy} x2={rightMid} y2={gy + gh} stroke={INK} strokeWidth="1" opacity="0.55" />
        {rowMean.map((v, y) => {
          const w = (v / rMag) * rightAmp;
          return <rect key={`rm${y}`} x={w >= 0 ? rightMid : rightMid + w} y={gy + y * ch + 1.6}
            width={Math.max(1.2, Math.abs(w))} height={ch - 3.2} fill={shade(v * 1.35)} />;
        })}
        <path d={rowMean.map((v, y) => `${y ? 'L' : 'M'}${(rightMid + (v / rMag) * rightAmp).toFixed(1)} ${(gy + (y + 0.5) * ch).toFixed(1)}`).join('')}
          fill="none" stroke={PAPER} strokeWidth="3.4" opacity="0.65" />
        <path d={rowMean.map((v, y) => `${y ? 'L' : 'M'}${(rightMid + (v / rMag) * rightAmp).toFixed(1)} ${(gy + (y + 0.5) * ch).toFixed(1)}`).join('')}
          fill="none" stroke={NEON[2]} strokeWidth="2" />

        {}
        <path d={`M${gx} ${gy - 8} L${gx} ${gy - 16} L${gx + 26} ${gy - 16}`} fill="none" stroke={INK} strokeWidth="1.4" />
        <path d={`M${gx + gw} ${gy + gh + 8} L${gx + gw} ${gy + gh + 16} L${gx + gw - 26} ${gy + gh + 16}`}
          fill="none" stroke={INK} strokeWidth="1.4" />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`ft${i}`} x1={gx + i * (gw / 9)} y1={gy + gh + 22} x2={gx + i * (gw / 9)}
            y2={gy + gh + (i % 3 === 0 ? 30 : 26)} stroke={INK} strokeWidth="1" opacity="0.6" />
        ))}
      </svg>
    </div>
  );
}
