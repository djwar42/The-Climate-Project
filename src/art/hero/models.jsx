import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const HW = 1400, HH = 760;

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

const X0 = 56, XP = 616, X1 = 1350;
const YZERO = 600, PPU = 100;
const yv = (v) => YZERO - v * PPU;

function hindVal(t) {
  return -0.32 + 1.62 * Math.pow(t, 2.35)
    + Math.sin(t * 3.1 + 0.4) * 0.07
    + Math.sin(t * 8.6 + 1.9) * 0.035;
}

const ENDS = [1.3, 1.55, 1.8, 2.05, 2.3, 2.55, 2.8, 3.1, 3.45, 3.85, 4.3, 4.8];
const MEDIAN = 2.68;

export default function Hero({ height = '100%', style = {} }) {
  const r = rng(2100);

  let hind = '';
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    hind += `${i ? 'L' : 'M'}${(X0 + t * (XP - X0)).toFixed(1)} ${yv(hindVal(t)).toFixed(1)}`;
  }
  const yNow = yv(hindVal(1));

  const obs = Array.from({ length: 52 }, (_, i) => {
    const t = (i + 0.5) / 52;
    return { x: X0 + t * (XP - X0), y: yv(hindVal(t) + (r() - 0.5) * 0.24) };
  });

  const RES_Y = 692;
  const res = Array.from({ length: 58 }, (_, i) => {
    const t = (i + 0.5) / 58;
    return { x: X0 + t * (XP - X0), d: (r() - 0.5) * 24 };
  });

  const traj = (v) => {
    const ey = yv(v);
    return `M${XP} ${yNow.toFixed(1)} C ${XP + 210} ${(yNow - (yNow - ey) * 0.14).toFixed(1)} ${(X1 - 330).toFixed(1)} ${(ey + (yNow - ey) * 0.30).toFixed(1)} ${X1} ${ey.toFixed(1)}`;
  };
  const band = (lo, hi) =>
    `${traj(hi)} L${X1} ${yv(lo).toFixed(1)} C ${(X1 - 330).toFixed(1)} ${(yv(lo) + (yNow - yv(lo)) * 0.30).toFixed(1)} ${XP + 210} ${(yNow - (yNow - yv(lo)) * 0.14).toFixed(1)} ${XP} ${yNow.toFixed(1)} Z`;

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none', ...style,
    }}>
      <svg viewBox={`0 0 ${HW} ${HH}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="md-wash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.74" />
            <stop offset="0.40" stopColor={PAPER} stopOpacity="0.66" />
            <stop offset="0.74" stopColor={PAPER} stopOpacity="0.12" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0" />
          </linearGradient>
        </defs>

        {}
        <line x1={X0} y1={YZERO} x2={X1} y2={YZERO} stroke={INK} strokeWidth="1.4" opacity="0.3" />
        {[1.5, 2.0].map((v) => (
          <line key={v} x1={X0} y1={yv(v)} x2={X1} y2={yv(v)} stroke={INK} strokeWidth="1"
            opacity="0.24" strokeDasharray="7 9" />
        ))}

        {}
        <path d={band(ENDS[0], ENDS[ENDS.length - 1])} fill={NEON[3]} opacity="0.10" />
        <path d={band(ENDS[2], ENDS[9])} fill={NEON[3]} opacity="0.12" />
        <path d={band(ENDS[4], ENDS[7])} fill={NEON[3]} opacity="0.14" />

        {}
        {ENDS.map((v, i) => (
          <g key={`t${i}`}>
            <path d={traj(v)} fill="none" stroke={ramp(i / (ENDS.length - 1))} strokeWidth="1.7" opacity="0.72" />
            <circle cx={X1} cy={yv(v)} r="4.2" fill={ramp(i / (ENDS.length - 1))} opacity="0.85" />
          </g>
        ))}

        {}
        <path d={traj(MEDIAN)} fill="none" stroke={PAPER} strokeWidth="7.5" opacity="0.75" />
        <path d={traj(MEDIAN)} fill="none" stroke={NEON[3]} strokeWidth="3.4" opacity="0.95" />

        {}
        <path d={hind} fill="none" stroke={NEON[5]} strokeWidth="3" opacity="0.7" />
        {obs.map((p, i) => (
          <circle key={`o${i}`} cx={p.x} cy={p.y} r="2.6" fill={NEON[1]} opacity="0.6" />
        ))}

        {}
        <line x1={X0} y1={RES_Y} x2={XP} y2={RES_Y} stroke={INK} strokeWidth="1" opacity="0.35" />
        {res.map((t, i) => (
          <line key={`r${i}`} x1={t.x} y1={RES_Y} x2={t.x} y2={RES_Y + t.d} stroke={NEON[3]}
            strokeWidth="2" opacity="0.5" />
        ))}

        {}
        <line x1={XP} y1="70" x2={XP} y2={HH - 22} stroke={INK} strokeWidth="1.5" opacity="0.5" strokeDasharray="9 8" />
        <circle cx={XP} cy={yNow} r="10" fill={PAPER} opacity="0.9" />
        <circle cx={XP} cy={yNow} r="7" fill={INK} />
        <circle cx={XP} cy={yNow} r="13.5" fill="none" stroke={NEON[3]} strokeWidth="2" opacity="0.7" />

        {}
        <rect x="0" y="0" width={HW} height={HH} fill="url(#md-wash)" />
      </svg>
    </div>
  );
}
