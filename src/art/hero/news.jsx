import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const HW = 1400, HH = 620;

const OBSERVED = '#00d084';
const INFERENCE = '#7b1fe0';
const MUNDANE = INK;

const GOLD = NEON[8];

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function sawtoothPath(x0, x1, base, rise, n, amp) {
  const x = (t) => x0 + (t / n) * (x1 - x0);
  const y = (t) => base - (t / n) * rise;
  let d = `M${x(0).toFixed(1)} ${y(0).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    d += `L${x(i + 0.55).toFixed(1)} ${(y(i + 0.55) - amp).toFixed(1)}`;
    d += `L${x(i + 1).toFixed(1)} ${y(i + 1).toFixed(1)}`;
  }
  return d;
}

export default function Hero({ height = '100%' }) {
  const r = rng(20260809);

  const lanes = [
    { y: 158, color: OBSERVED, op: 0.42 },
    { y: 292, color: INFERENCE, op: 0.38 },
    { y: 426, color: MUNDANE, op: 0.24 },
  ].map((lane) => {
    const segs = [];
    let x = 34;
    while (x < HW - 40) {
      const w = 26 + r() * 132;
      segs.push({ x, w: Math.min(w, HW - 40 - x) });
      x += w + 16 + r() * 62;
    }
    return { ...lane, segs };
  });

  const saw = sawtoothPath(48, HW - 30, 496, 350, 24, 34);
  const trend = `M48 496 L${HW - 30} 146`;

  const rounds = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: 176 + i * 202, h: 20 + i * 11, last: i === 5,
  }));
  const FLOOR = 510;

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none',
    }}>
      <svg viewBox={`0 0 ${HW} ${HH}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>

        {}
        {rounds.map((c, i) => (
          <line key={`c${i}`} x1={c.x} y1={0} x2={c.x} y2={HH}
            stroke={INK} strokeWidth="1" opacity="0.13" />
        ))}

        {}
        {lanes.map((lane, li) => (
          <g key={`l${li}`}>
            <line x1="24" y1={lane.y - 16} x2={HW - 24} y2={lane.y - 16}
              stroke={INK} strokeWidth="1" opacity="0.14" />
            {lane.segs.map((s, i) => (
              <rect key={i} x={s.x} y={lane.y} width={s.w} height="15"
                fill={lane.color} opacity={lane.op * (0.55 + (i % 4) * 0.15)} />
            ))}
            <rect x="24" y={lane.y - 4} width="9" height="23" fill={lane.color} opacity={lane.op + 0.3} />
          </g>
        ))}

        {}
        <path d={`${saw} L${HW - 30} ${FLOOR} L48 ${FLOOR} Z`} fill={GOLD} opacity="0.16" />
        <path d={trend} fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="9 8" opacity="0.34" />
        <path d={saw} fill="none" stroke={INK} strokeWidth="5.4" strokeLinejoin="round" opacity="0.2" />
        <path d={saw} fill="none" stroke={GOLD} strokeWidth="3.2" strokeLinejoin="round" opacity="0.75" />
        <circle cx={HW - 30} cy={146} r="9" fill={GOLD} opacity="0.8" stroke={INK} strokeWidth="1.6" strokeOpacity="0.35" />

        {}
        <line x1="24" y1={FLOOR} x2={HW - 24} y2={FLOOR} stroke={INK} strokeWidth="1.6" opacity="0.34" />
        {rounds.map((c, i) => (
          <g key={`r${i}`}>
            <rect x={c.x - 6} y={FLOOR - c.h} width="12" height={c.h}
              fill={c.last ? GOLD : INK} opacity={c.last ? 0.62 : 0.24} />
            {c.last && <rect x={c.x - 6} y={FLOOR - c.h} width="12" height={c.h}
              fill="none" stroke={INK} strokeWidth="1.3" opacity="0.42" />}
          </g>
        ))}

        {}
        {[[392, 402], [672, 330], [952, 258], [1232, 186]].map(([x, y], i) => (
          <circle key={`m${i}`} cx={x} cy={y} r={i === 3 ? 8 : 6}
            fill={i % 2 ? INFERENCE : OBSERVED} opacity="0.48" />
        ))}

        {}
        <defs>
          <linearGradient id="newsHeroWash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={PAPER} stopOpacity="0.68" />
            <stop offset="50%" stopColor={PAPER} stopOpacity="0.62" />
            <stop offset="72%" stopColor={PAPER} stopOpacity="0.34" />
            <stop offset="90%" stopColor={PAPER} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={HW} height={HH} fill="url(#newsHeroWash)" />
      </svg>
    </div>
  );
}
