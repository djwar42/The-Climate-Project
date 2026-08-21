import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const W = 300, H = 460;

const OBSERVED = '#00d084';
const INFERENCE = '#7b1fe0';
const MUNDANE = INK;

const GOLD = NEON[8];
const SECOND = NEON[0];

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function teeth(x0, x1, base, rise, n, amp, phase = 0.55) {
  const x = (t) => x0 + (t / n) * (x1 - x0);
  const y = (t) => base - (t / n) * rise;
  let d = `M${x(0).toFixed(1)} ${y(0).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    d += `L${x(i + phase).toFixed(1)} ${(y(i + phase) - amp).toFixed(1)}`;
    d += `L${x(i + 1).toFixed(1)} ${y(i + 1).toFixed(1)}`;
  }
  return d;
}

export default function Mark({ height = '100%' }) {
  const r = rng(88121);
  const X0 = 44, X1 = 288, BASE = 372, RISE = 236, N = 11, AMP = 30;

  const main = teeth(X0, X1, BASE, RISE, N, AMP);
  const second = teeth(X0 + 12, X1, BASE + 10, RISE - 64, N, AMP * 0.6, 0.28);

  const rows = [
    { y: 394, color: OBSERVED, op: 1 },
    { y: 414, color: INFERENCE, op: 1 },
    { y: 434, color: MUNDANE, op: 0.6 },
  ].map((row) => {
    const segs = [];
    let x = 44;
    while (x < 288) {
      const w = 12 + r() * 46;
      segs.push({ x, w: Math.min(w, 288 - x) });
      x += w + 6 + r() * 18;
    }
    return { ...row, segs };
  });

  return (
    <div aria-hidden="true" style={{ height, minWidth: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}>

        {}
        <rect x="44" y="34" width={W - 56} height={BASE - 34} fill={GOLD} opacity="0.11" />
        {[100, 168, 236, 304].map((y) => (
          <line key={y} x1="44" y1={y} x2={W - 12} y2={y} stroke={INK} strokeWidth="1" opacity="0.14" />
        ))}

        {}
        <line x1="44" y1="24" x2={W - 12} y2="24" stroke={INK} strokeWidth="1.4" opacity="0.4" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={48 + i * 40} y="18" width="12" height="12"
            fill={i === 5 ? GOLD : 'none'} stroke={INK} strokeWidth="1.6" opacity={i === 5 ? 1 : 0.45} />
        ))}

        {}
        <path d={second} fill="none" stroke={SECOND} strokeWidth="2.6" strokeLinejoin="round" opacity="0.6" />

        {}
        <path d={`M${X0} ${BASE} L${X1} ${BASE - RISE}`} fill="none" stroke={INK}
          strokeWidth="2" strokeDasharray="7 6" opacity="0.5" />

        {}
        <path d={`${main} L${X1} ${BASE} L${X0} ${BASE} Z`} fill={GOLD} opacity="0.36" />
        <path d={main} fill="none" stroke={INK} strokeWidth="7.4" strokeLinejoin="round" strokeLinecap="round" />
        <path d={main} fill="none" stroke={GOLD} strokeWidth="4.8" strokeLinejoin="round" strokeLinecap="round" />

        {}
        <circle cx={X1} cy={BASE - RISE} r="9.5" fill={GOLD} stroke={INK} strokeWidth="2.4" />
        <line x1={X1 - 26} y1={BASE - RISE} x2={X1 - 14} y2={BASE - RISE} stroke={INK} strokeWidth="2" opacity="0.5" />

        {}
        <line x1="44" y1="18" x2="44" y2={BASE} stroke={INK} strokeWidth="2.2" />
        <line x1="38" y1={BASE} x2={W - 12} y2={BASE} stroke={INK} strokeWidth="2.2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="36" y1={BASE - i * 58} x2="44" y2={BASE - i * 58} stroke={INK} strokeWidth="1.6" opacity="0.6" />
        ))}

        {}
        {rows.map((row, i) => (
          <g key={i}>
            <line x1="44" y1={row.y - 4} x2={W - 12} y2={row.y - 4} stroke={INK} strokeWidth="1" opacity="0.16" />
            <rect x="32" y={row.y} width="8" height="14" fill={row.color} opacity={row.op} stroke={INK} strokeWidth="1.2" />
            {row.segs.map((s, j) => (
              <rect key={j} x={s.x} y={row.y} width={s.w} height="14"
                fill={row.color} opacity={row.op * (0.5 + (j % 3) * 0.25)} />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
