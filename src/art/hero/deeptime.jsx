import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const HW = 1400, HH = 620;

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

const AGES = [444e6, 66e6, 2.6e6, 800e3, 130e3, 21e3, 11.7e3, 2000, 175, 10, 1];
const OLDEST = 444e6;
const RX0 = 74, RX1 = 1352;
const logX = (age) => RX1 - (Math.log10(age) / Math.log10(OLDEST)) * (RX1 - RX0);
const linX = (age) => RX1 - (age / OLDEST) * (RX1 - RX0);

const LOG_Y = 408, LIN_Y = 540;

export default function Hero({ height = '100%', style = {} }) {
  const r = rng(803718);

  const strata = [];
  {
    let y = 6, gap = 54;
    while (y < HH - 30 && gap > 1.5) {
      const warm = Math.pow((Math.sin(strata.length * 0.58) + 1) / 2, 6);
      strata.push({
        y, h: Math.max(1, gap * 0.32), warm, w: HW * (0.46 + r() * 0.54),
        o: Math.min(0.17, 0.05 + strata.length * 0.006),
      });
      y += gap; gap *= 0.906;
    }
  }

  let saw = '';
  {
    const top = 118, bot = 252;
    let x = 150, w = 74;
    saw = `M${x} ${top}`;
    while (x < HW - 20) {
      const dip = x + w * 0.78;
      saw += `L${dip.toFixed(1)} ${bot}L${(x + w).toFixed(1)} ${top}`;
      x += w; w *= 1.14;
    }
  }

  const KINDS = [NEON[5], NEON[0], NEON[3], NEON[7], NEON[1], NEON[4]];
  const needles = Array.from({ length: 26 }, (_, i) => {
    const t = Math.pow(i / 25, 0.72);
    const x = RX0 + 16 + t * (RX1 - RX0 - 30);
    return { x, h: 34 + r() * 78, c: KINDS[Math.floor(r() * KINDS.length)], big: r() > 0.78 };
  });

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none', ...style,
    }}>
      <svg viewBox={`0 0 ${HW} ${HH}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="dt-wash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.72" />
            <stop offset="0.42" stopColor={PAPER} stopOpacity="0.66" />
            <stop offset="0.78" stopColor={PAPER} stopOpacity="0.12" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0" />
          </linearGradient>
        </defs>

        {}
        {strata.map((b, i) => (
          <rect key={`st${i}`} x="0" y={b.y} width={b.w} height={b.h}
            fill={b.warm > 0.25 ? mix(NEON[7], NEON[0], b.warm) : NEON[5]}
            opacity={b.warm > 0.25 ? b.o + 0.09 : b.o} />
        ))}

        {}
        <path d={saw} fill="none" stroke={NEON[1]} strokeWidth="2.1" opacity="0.34" strokeLinejoin="round" />

        {}
        {AGES.map((age, i) => {
          const a = logX(age), b = linX(age);
          return (
            <path key={`tie${i}`}
              d={`M${a.toFixed(1)} ${LOG_Y + 8} C ${a.toFixed(1)} ${LOG_Y + 62} ${b.toFixed(1)} ${LIN_Y - 62} ${b.toFixed(1)} ${LIN_Y - 8}`}
              fill="none" stroke={ramp(i / (AGES.length - 1))} strokeWidth="1.6" opacity="0.6" />
          );
        })}
        <line x1={RX0} y1={LOG_Y} x2={RX1} y2={LOG_Y} stroke={INK} strokeWidth="1.6" opacity="0.55" />
        <line x1={RX0} y1={LIN_Y} x2={RX1} y2={LIN_Y} stroke={INK} strokeWidth="1.6" opacity="0.55" />
        {AGES.map((age, i) => (
          <g key={`tk${i}`}>
            <line x1={logX(age)} y1={LOG_Y - 7} x2={logX(age)} y2={LOG_Y + 8}
              stroke={ramp(i / (AGES.length - 1))} strokeWidth="2.4" opacity="0.85" />
            <line x1={linX(age)} y1={LIN_Y - 8} x2={linX(age)} y2={LIN_Y + 9}
              stroke={ramp(i / (AGES.length - 1))} strokeWidth="2.4" opacity="0.85" />
          </g>
        ))}

        {}
        {needles.map((n, i) => (
          <g key={`nd${i}`}>
            <line x1={n.x} y1={LOG_Y - 4} x2={n.x} y2={LOG_Y - 4 - n.h} stroke={n.c}
              strokeWidth={n.big ? 1.9 : 1.2} opacity="0.62" />
            {n.big
              ? <circle cx={n.x} cy={LOG_Y - 8 - n.h} r="5" fill="none" stroke={n.c} strokeWidth="2" opacity="0.85" />
              : <circle cx={n.x} cy={LOG_Y - 6 - n.h} r="2.6" fill={n.c} opacity="0.7" />}
          </g>
        ))}

        {}
        <rect x="0" y="0" width={HW} height={HH} fill="url(#dt-wash)" />
      </svg>
    </div>
  );
}
