import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const W = 1400, H = 780;

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
    [0.00, [33, 96, 255]], [0.35, [150, 190, 235]], [0.5, [232, 226, 210]],
    [0.7, [255, 138, 0]], [1.00, [204, 42, 15]],
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

const N = 118;
function series() {
  const r = rng(1880);
  const v = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const trend = -0.34 + 1.86 * Math.pow(t, 1.95);
    const wob = 0.115 * Math.sin(t * 17.3) + 0.085 * Math.sin(t * 6.1 + 1.2);
    v.push(trend + wob + (r() - 0.5) * 0.26);
  }
  return v;
}

const INSTS = [
  { c: NEON[0], d: -1.00 },
  { c: NEON[1], d: -0.42 },
  { c: NEON[3], d: 0.08 },
  { c: NEON[5], d: 0.58 },
  { c: NEON[2], d: 1.05 },
];

export default function Hero({ height = '100%' }) {
  const v = series();
  const uMax = Math.max(...v.map(Math.abs));
  const ramp = (u) => warmRamp(0.5 + 0.5 * Math.sign(u) * Math.pow(Math.abs(u) / uMax, 0.74));
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const dMax = Math.max(...v.map((u) => Math.abs(u - mean)));
  const stripe = (u) => warmRamp(0.5 + 0.5 * Math.sign(u - mean) * Math.pow(Math.abs(u - mean) / dMax, 0.8));
  const y0 = 496;
  const SC = 128;
  const x0 = 34, x1 = W - 6;
  const CALIPER = 1180;
  const step = (x1 - x0) / N;
  const px = (i) => x0 + i * step;
  const py = (u) => y0 - u * SC;

  const smooth = v.map((_, i) => {
    let s = 0, n = 0;
    for (let k = -4; k <= 4; k++) { const j = i + k; if (j >= 0 && j < N) { s += v[j]; n++; } }
    return s / n;
  });
  const traceY = INSTS.map(({ d }) => smooth.map((u, i) => {
    const t = i / (N - 1);
    const spread = 0.046 + 0.135 * Math.pow(1 - t, 1.7);
    return py(u + d * spread);
  }));
  const pathOf = (ys) => ys.map((y, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${y.toFixed(1)}`).join('');
  const bandD = `${pathOf(traceY[0])}L${px(N - 1).toFixed(1)} ${traceY[4][N - 1].toFixed(1)}${
    traceY[4].slice().reverse().map((y, k) => `L${px(N - 1 - k).toFixed(1)} ${y.toFixed(1)}`).join('')}Z`;

  const refEnd = 30;
  const iM = Math.max(0, Math.min(N - 1, Math.round((CALIPER - x0) / step)));
  const ends = INSTS.map((_, k) => traceY[k][iM]);
  const cx = px(iM);

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none',
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="tcp01-wash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.80" />
            <stop offset="0.46" stopColor={PAPER} stopOpacity="0.72" />
            <stop offset="0.70" stopColor={PAPER} stopOpacity="0.40" />
            <stop offset="0.88" stopColor={PAPER} stopOpacity="0.16" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0.06" />
          </linearGradient>
          {}
          <linearGradient id="tcp01-foot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PAPER} stopOpacity="0" />
            <stop offset="0.55" stopColor={PAPER} stopOpacity="0.18" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0.42" />
          </linearGradient>
        </defs>

        {}
        {v.map((u, i) => (
          <rect key={`r${i}`} x={px(i)} y="0" width={step + 0.6} height="40"
            fill={stripe(u)} opacity="0.9" />
        ))}
        <line x1="0" y1="40.5" x2={W} y2="40.5" stroke={INK} strokeWidth="1" opacity="0.35" />

        {}
        <rect x={px(0)} y="110" width={px(refEnd) - px(0)} height={H - 190} fill={INK} opacity="0.06" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`hx${i}`} x1={px(0)} y1={164 + i * 52} x2={px(refEnd)} y2={124 + i * 52}
            stroke={INK} strokeWidth="0.9" opacity="0.26" />
        ))}
        <line x1={px(refEnd)} y1="110" x2={px(refEnd)} y2={H - 80} stroke={INK} strokeWidth="1.1" opacity="0.45" />
        <path d={`M${px(0)} 126 L${px(0)} 110 L${px(refEnd)} 110 L${px(refEnd)} 126`}
          fill="none" stroke={INK} strokeWidth="1.5" opacity="0.7" />

        {}
        {v.map((u, i) => {
          const yv = py(u);
          return <rect key={`b${i}`} x={px(i) + 1.3} y={Math.min(y0, yv)}
            width={Math.max(1.2, step - 2.6)} height={Math.abs(y0 - yv)}
            fill={ramp(u)} opacity="0.85" />;
        })}

        {}
        <line x1="0" y1={y0} x2={W} y2={y0} stroke={INK} strokeWidth="2" />
        {Array.from({ length: 40 }, (_, i) => (
          <line key={`t${i}`} x1={20 + i * 35} y1={y0} x2={20 + i * 35} y2={y0 + (i % 5 === 0 ? 11 : 6)}
            stroke={INK} strokeWidth="1" opacity="0.45" />
        ))}
        {[-0.4, 0.5, 1.0, 1.5].map((u) => (
          <line key={`g${u}`} x1="0" y1={py(u)} x2={W} y2={py(u)}
            stroke={INK} strokeWidth="0.9" opacity="0.16" strokeDasharray="3 9" />
        ))}

        {}
        <path d={bandD} fill={NEON[0]} opacity="0.10" />
        {INSTS.map(({ c }, k) => (
          <g key={`i${k}`}>
            <path d={pathOf(traceY[k])} fill="none" stroke={PAPER} strokeWidth="4.2" opacity="0.55" />
            <path d={pathOf(traceY[k])} fill="none" stroke={c} strokeWidth={k === 2 ? 2.6 : 1.5}
              opacity={k === 2 ? 0.95 : 0.7} />
          </g>
        ))}

        {}
        <rect x="0" y="0" width={W} height={H} fill="url(#tcp01-wash)" />
        <rect x="0" y={H * 0.45} width={W} height={H * 0.55} fill="url(#tcp01-foot)" />

        {}
        <line x1={cx} y1={Math.min(...ends) - 14} x2={cx} y2={Math.max(...ends) + 24}
          stroke={INK} strokeWidth="1" opacity="0.5" strokeDasharray="4 5" />
        <line x1={cx + 24} y1={Math.min(...ends) - 9} x2={cx + 24} y2={Math.max(...ends) + 9}
          stroke={INK} strokeWidth="1.6" />
        <line x1={cx + 17} y1={Math.min(...ends) - 9} x2={cx + 31} y2={Math.min(...ends) - 9} stroke={INK} strokeWidth="1.6" />
        <line x1={cx + 17} y1={Math.max(...ends) + 9} x2={cx + 31} y2={Math.max(...ends) + 9} stroke={INK} strokeWidth="1.6" />
        {INSTS.map(({ c }, k) => (
          <g key={`e${k}`}>
            <line x1={cx} y1={ends[k]} x2={cx + 18} y2={ends[k]} stroke={c} strokeWidth="1.2" opacity="0.75" />
            <rect x={cx - 3.4} y={ends[k] - 3.4} width="6.8" height="6.8" fill={c} stroke={PAPER} strokeWidth="1" />
          </g>
        ))}

        {}
        {v.map((u, i) => (
          <rect key={`fr${i}`} x={px(i)} y={H - 66} width={step + 0.6} height="26"
            fill={stripe(u)} opacity="0.4" />
        ))}
        <line x1="0" y1={H - 30} x2={W} y2={H - 30} stroke={INK} strokeWidth="1.2" opacity="0.3" />
        <line x1="0" y1={H - 68} x2={W} y2={H - 68} stroke={INK} strokeWidth="1" opacity="0.22" />
      </svg>
    </div>
  );
}
