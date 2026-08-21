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

const X0 = 22, XP = 92, X1 = 282;
const YZERO = 402, PPU = 62;
const yv = (v) => YZERO - v * PPU;

const ENDS = [1.3, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.3, 3.65, 4.0, 4.4, 4.8];
const MEDIAN = 2.62;

const hindVal = (t) => -0.3 + 1.6 * Math.pow(t, 2.3) + Math.sin(t * 3.4 + 0.5) * 0.06;

export default function Mark({ height = 300, color, style = {} }) {
  const r = rng(2035);
  const violet = color || NEON[3];
  const yNow = yv(hindVal(1));

  let hind = '';
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    hind += `${i ? 'L' : 'M'}${(X0 + t * (XP - X0)).toFixed(1)} ${yv(hindVal(t)).toFixed(1)}`;
  }
  const obs = Array.from({ length: 20 }, (_, i) => {
    const t = (i + 0.5) / 20;
    return { x: X0 + t * (XP - X0), y: yv(hindVal(t) + (r() - 0.5) * 0.26) };
  });

  const traj = (v) => {
    const ey = yv(v);
    return `M${XP} ${yNow.toFixed(1)} C ${XP + 62} ${(yNow - (yNow - ey) * 0.13).toFixed(1)} ${(X1 - 96).toFixed(1)} ${(ey + (yNow - ey) * 0.31).toFixed(1)} ${X1} ${ey.toFixed(1)}`;
  };
  const band = (lo, hi) =>
    `${traj(hi)} L${X1} ${yv(lo).toFixed(1)} C ${(X1 - 96).toFixed(1)} ${(yv(lo) + (yNow - yv(lo)) * 0.31).toFixed(1)} ${XP + 62} ${(yNow - (yNow - yv(lo)) * 0.13).toFixed(1)} ${XP} ${yNow.toFixed(1)} Z`;

  return (
    <div aria-hidden="true" style={{ height, minWidth: 0, ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}>

        {}
        <line x1={X0} y1="34" x2={X0} y2="428" stroke={INK} strokeWidth="1.6" />
        <line x1={X0} y1={YZERO} x2={X1 + 6} y2={YZERO} stroke={INK} strokeWidth="1.6" />
        {[1, 2, 3, 4, 5].map((v) => (
          <line key={v} x1={X0 - 6} y1={yv(v)} x2={X0 + 5} y2={yv(v)} stroke={INK} strokeWidth="1.4" />
        ))}
        {[1.5, 2.0].map((v) => (
          <line key={`g${v}`} x1={X0} y1={yv(v)} x2={X1} y2={yv(v)} stroke={INK} strokeWidth="1"
            opacity="0.42" strokeDasharray="5 7" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`d${i}`} x1={X0 + (i / 10) * (X1 - X0)} y1={YZERO} x2={X0 + (i / 10) * (X1 - X0)} y2={YZERO + 7}
            stroke={INK} strokeWidth="1.2" opacity="0.55" />
        ))}

        {}
        <path d={band(ENDS[0], ENDS[12])} fill={violet} opacity="0.14" />
        <path d={band(ENDS[2], ENDS[10])} fill={violet} opacity="0.15" />
        <path d={band(ENDS[4], ENDS[8])} fill={violet} opacity="0.17" />

        {}
        {ENDS.map((v, i) => (
          <g key={`t${i}`}>
            <path d={traj(v)} fill="none" stroke={ramp(i / (ENDS.length - 1))} strokeWidth="1.9" opacity="0.85" />
            <circle cx={X1} cy={yv(v)} r="4" fill={ramp(i / (ENDS.length - 1))} />
          </g>
        ))}

        {}
        <path d={traj(MEDIAN)} fill="none" stroke={PAPER} strokeWidth="8" opacity="0.85" />
        <path d={traj(MEDIAN)} fill="none" stroke={violet} strokeWidth="3.6" />
        <circle cx={X1} cy={yv(MEDIAN)} r="8" fill={PAPER} />
        <circle cx={X1} cy={yv(MEDIAN)} r="5.6" fill={violet} />
        <circle cx={X1} cy={yv(MEDIAN)} r="9.6" fill="none" stroke={violet} strokeWidth="1.6" opacity="0.6" />

        {}
        <path d={hind} fill="none" stroke={PAPER} strokeWidth="6.5" opacity="0.8" />
        <path d={hind} fill="none" stroke={NEON[5]} strokeWidth="3.2" />
        {obs.map((p, i) => (
          <circle key={`o${i}`} cx={p.x} cy={p.y} r="2.4" fill={NEON[1]} opacity="0.9" />
        ))}

        {}
        <line x1={XP} y1="34" x2={XP} y2="428" stroke={INK} strokeWidth="1.4" opacity="0.6" strokeDasharray="6 6" />
        <circle cx={XP} cy={yNow} r="10.5" fill={PAPER} />
        <circle cx={XP} cy={yNow} r="6.4" fill={INK} />
        <circle cx={XP} cy={yNow} r="13" fill="none" stroke={violet} strokeWidth="2.2" />
      </svg>
    </div>
  );
}
