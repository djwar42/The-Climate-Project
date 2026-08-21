import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const W = 300, H = 460;
const BX0 = 58, BX1 = 244;
const TOP = 30, FLOOR = 436;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  const c = (x, y) => Math.round(x + (y - x) * t);
  return `rgb(${c(r1, r2)},${c(g1, g2)},${c(b1, b2)})`;
}

const LADDER = [NEON[5], NEON[1], NEON[4], NEON[7], NEON[0], NEON[9]];
function ramp(t) {
  const u = Math.min(0.9999, Math.max(0, t)) * (LADDER.length - 1);
  const i = Math.floor(u);
  return mix(LADDER[i], LADDER[i + 1], u - i);
}

export default function Mark({ height = 300, color, style = {} }) {
  const r = rng(7717);
  const cool = color || NEON[5];

  const bands = [];
  {
    let y = TOP + 8, gap = 34, i = 0;
    while (y < FLOOR - 44 && gap > 1.6) {
      const cyc = (Math.sin(i * 0.63 + 0.4) + 1) / 2;
      const warm = Math.pow(cyc, 5);
      bands.push({
        y, h: Math.max(1.2, gap * 0.42), warm,
        inset: (i % 3) * 3, o: 0.62 + r() * 0.38,
      });
      y += gap; gap *= 0.9; i++;
    }
  }
  const smearTop = bands.length ? bands[bands.length - 1].y + bands[bands.length - 1].h + 3 : 380;

  const smear = [];
  {
    let y = smearTop, p = 3.4;
    while (y < FLOOR - 12 && p > 0.9) { smear.push(y); y += p; p *= 0.94; }
  }

  const bubbleFloor = TOP + (FLOOR - TOP) * 0.62;
  const bubbles = Array.from({ length: 38 }, () => ({
    x: BX0 + 8 + r() * (BX1 - BX0 - 16),
    y: TOP + 14 + r() * (bubbleFloor - TOP - 14),
    rr: 1.1 + r() * 2.4,
  }));

  const terms = bands
    .map((b, i) => ({ ...b, i }))
    .filter((b) => b.warm > 0.62)
    .slice(0, 6);

  return (
    <div aria-hidden="true" style={{ height, minWidth: 0, ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="ic-round" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.42" />
            <stop offset="0.16" stopColor={PAPER} stopOpacity="0.1" />
            <stop offset="0.46" stopColor={PAPER} stopOpacity="0" />
            <stop offset="0.72" stopColor={INK} stopOpacity="0.05" />
            <stop offset="1" stopColor={INK} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {}
        <rect x={BX0} y={TOP} width={BX1 - BX0} height={FLOOR - TOP} fill={cool} opacity="0.10" />

        {}
        {bands.map((b, i) => (
          <rect key={`b${i}`} x={BX0 + 2 + b.inset} y={b.y} width={BX1 - BX0 - 4 - b.inset * 2}
            height={b.h} fill={b.warm > 0.15 ? ramp(0.62 + b.warm * 0.38) : cool} opacity={b.o} />
        ))}

        {}
        {smear.map((y, i) => (
          <rect key={`m${i}`} x={BX0 + 2} y={y} width={BX1 - BX0 - 4} height="1"
            fill={cool} opacity={0.4 + (i / smear.length) * 0.5} />
        ))}
        <rect x={BX0 + 2} y={FLOOR - 12} width={BX1 - BX0 - 4} height="12" fill={cool} opacity="0.95" />

        {}
        {bubbles.map((b, i) => (
          <g key={`u${i}`}>
            <circle cx={b.x} cy={b.y} r={b.rr} fill={PAPER} opacity="0.9" />
            <circle cx={b.x} cy={b.y} r={b.rr} fill="none" stroke={INK} strokeWidth="0.7" opacity="0.55" />
          </g>
        ))}

        {}
        <rect x={BX0} y={TOP} width={BX1 - BX0} height={FLOOR - TOP} fill="url(#ic-round)" />
        <line x1={BX0} y1={TOP} x2={BX0} y2={FLOOR} stroke={INK} strokeWidth="1.8" />
        <line x1={BX1} y1={TOP} x2={BX1} y2={FLOOR} stroke={INK} strokeWidth="1.8" />
        <line x1={BX0} y1={FLOOR} x2={BX1} y2={FLOOR} stroke={INK} strokeWidth="1.8" />
        <ellipse cx={(BX0 + BX1) / 2} cy={TOP} rx={(BX1 - BX0) / 2} ry="9"
          fill={PAPER} opacity="0.55" />
        <ellipse cx={(BX0 + BX1) / 2} cy={TOP} rx={(BX1 - BX0) / 2} ry="9"
          fill="none" stroke={INK} strokeWidth="1.8" />

        {}
        {bands.map((b, i) => (
          <line key={`k${i}`} x1={BX0 - (i % 5 === 0 ? 16 : 8)} y1={b.y} x2={BX0} y2={b.y}
            stroke={INK} strokeWidth={i % 5 === 0 ? 1.5 : 1} opacity={i % 5 === 0 ? 0.75 : 0.4} />
        ))}
        <line x1={BX0 - 16} y1={TOP + 8} x2={BX0 - 16} y2={smearTop} stroke={INK} strokeWidth="1" opacity="0.4" />

        {}
        {terms.map((t, i) => (
          <g key={`e${i}`}>
            <line x1={BX1} y1={t.y + t.h / 2} x2={BX1 + 22} y2={t.y + t.h / 2}
              stroke={ramp(0.72)} strokeWidth="1.6" opacity="0.85" />
            <circle cx={BX1 + 28} cy={t.y + t.h / 2} r="5.2" fill={PAPER} />
            <circle cx={BX1 + 28} cy={t.y + t.h / 2} r="3.4" fill={ramp(0.86)} />
            <circle cx={BX1 + 28} cy={t.y + t.h / 2} r="6.8" fill="none" stroke={ramp(0.86)}
              strokeWidth="1.3" opacity="0.55" />
          </g>
        ))}
      </svg>
    </div>
  );
}
