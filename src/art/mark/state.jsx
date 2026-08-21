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

function warmRamp(t) {
  const stops = [
    [0.00, [23, 86, 245]], [0.35, [140, 184, 235]], [0.5, [234, 228, 212]],
    [0.7, [255, 138, 0]], [1.00, [199, 34, 8]],
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

const N = 62;
const INSTS = [
  { c: NEON[0], d: -1.00 },
  { c: NEON[1], d: -0.44 },
  { c: NEON[3], d: 0.06 },
  { c: NEON[5], d: 0.56 },
  { c: NEON[2], d: 1.04 },
];

export default function Mark({ height = 300, style = {} }) {
  const r = rng(1880);
  const v = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    return -0.34 + 1.86 * Math.pow(t, 1.95)
      + 0.115 * Math.sin(t * 17.3) + 0.085 * Math.sin(t * 6.1 + 1.2)
      + (r() - 0.5) * 0.30;
  });

  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const dMax = Math.max(...v.map((u) => Math.abs(u - mean)));
  const stripe = (u) => warmRamp(0.5 + 0.5 * Math.sign(u - mean) * Math.pow(Math.abs(u - mean) / dMax, 0.82));

  const top = 18, bot = H - 18, left = 12, right = W - 12;
  const bh = (bot - top) / N;
  const cy = (i) => top + (i + 0.5) * bh;
  const datum = (left + right) / 2;
  const SC = 78;
  const smooth = v.map((_, i) => {
    let s = 0, n = 0;
    for (let k = -3; k <= 3; k++) { const j = i + k; if (j >= 0 && j < N) { s += v[j]; n++; } }
    return s / n;
  });
  const clampX = (x) => Math.max(left + 5, Math.min(right - 5, x));
  const traceX = INSTS.map(({ d }) => smooth.map((u, i) => {
    const t = i / (N - 1);
    return clampX(datum + (u + d * (0.03 + 0.15 * Math.pow(1 - t, 1.7))) * SC);
  }));
  const pathOf = (xs) => xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${cy(i).toFixed(1)}`).join('');
  const refRows = 9;
  const ends = INSTS.map((_, k) => traceX[k][N - 1]);

  return (
    <div aria-hidden="true" style={{ height, minWidth: 0, ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}>
        {}
        {v.map((u, i) => (
          <rect key={`s${i}`} x={left} y={top + i * bh} width={right - left} height={bh + 0.7}
            fill={stripe(u)} />
        ))}

        {}
        <rect x={left} y={top} width={right - left} height={refRows * bh} fill={PAPER} opacity="0.16" />
        <line x1={left} y1={top + refRows * bh} x2={right} y2={top + refRows * bh}
          stroke={INK} strokeWidth="1.2" strokeDasharray="5 4" />
        <path d={`M${left - 6} ${top} L${left - 12} ${top} L${left - 12} ${top + refRows * bh} L${left - 6} ${top + refRows * bh}`}
          fill="none" stroke={INK} strokeWidth="1.4" />

        {}
        <line x1={datum} y1={top} x2={datum} y2={bot} stroke={INK} strokeWidth="1.3" opacity="0.75" />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`t${i}`} x1={datum - 4} y1={top + (i + 1) * ((bot - top) / 14)}
            x2={datum + 4} y2={top + (i + 1) * ((bot - top) / 14)} stroke={INK} strokeWidth="1" opacity="0.5" />
        ))}

        {}
        {INSTS.map(({ c }, k) => (
          k === 2 ? null : (
            <g key={`i${k}`}>
              <path d={pathOf(traceX[k])} fill="none" stroke={PAPER} strokeWidth="3.4" opacity="0.7" />
              <path d={pathOf(traceX[k])} fill="none" stroke={c} strokeWidth="1.5" opacity="0.95" />
            </g>
          )
        ))}
        {}
        <path d={pathOf(traceX[2])} fill="none" stroke={PAPER} strokeWidth="6" opacity="0.8" />
        <path d={pathOf(traceX[2])} fill="none" stroke={INSTS[2].c} strokeWidth="3" />
        {traceX[2].map((x, i) => (i % 6 === 2
          ? <circle key={`d${i}`} cx={x} cy={cy(i)} r="2.6" fill={INSTS[2].c} stroke={PAPER} strokeWidth="1" />
          : null))}

        {}
        <line x1={Math.min(...ends) - 6} y1={bot + 9} x2={Math.max(...ends) + 6} y2={bot + 9} stroke={INK} strokeWidth="1.5" />
        <line x1={Math.min(...ends) - 6} y1={bot + 4} x2={Math.min(...ends) - 6} y2={bot + 14} stroke={INK} strokeWidth="1.5" />
        <line x1={Math.max(...ends) + 6} y1={bot + 4} x2={Math.max(...ends) + 6} y2={bot + 14} stroke={INK} strokeWidth="1.5" />
        {INSTS.map(({ c }, k) => (
          <rect key={`e${k}`} x={ends[k] - 2.6} y={bot + 1} width="5.2" height="5.2" fill={c} />
        ))}

        {}
        <rect x={left} y={top} width={right - left} height={bot - top} fill="none" stroke={INK} strokeWidth="1.6" />
      </svg>
    </div>
  );
}
