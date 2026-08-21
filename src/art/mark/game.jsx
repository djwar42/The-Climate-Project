import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const W = 300, H = 460;

const GREEN = NEON[4];
const AMBER = NEON[7];

const HW2 = 21, HH2 = 10.5, N = 7;
const OX = 150, OY = 244;

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
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
  const [ar, ag, ab] = p(a), [br, bg, bb] = p(b);
  const c = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
}

const iso = (gx, gy, z = 0) => ({
  x: OX + (gx - gy) * HW2,
  y: OY + (gx + gy) * HH2 - z * HH2 * 2,
});
const pts = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

function Box({ gx, gy, w, h, color }) {
  const a = iso(gx - w / 2, gy - w / 2), b = iso(gx + w / 2, gy - w / 2);
  const c = iso(gx + w / 2, gy + w / 2), e = iso(gx - w / 2, gy + w / 2);
  const up = (p) => ({ x: p.x, y: p.y - h * HH2 * 2 });
  return (
    <g>
      <polygon points={pts([a, b, c, e].map(up))} fill={color} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <polygon points={pts([up(e), up(c), c, e])} fill={mix(color, INK, 0.28)} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <polygon points={pts([up(c), up(b), b, c])} fill={mix(color, INK, 0.46)} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
    </g>
  );
}

export default function Mark({ height = '100%' }) {
  const r = rng(60613);

  const heatAt = (gx, gy) => Math.min(1, Math.max(0, (gx + (N - 1 - gy)) / (2 * (N - 1))));
  const tileOf = (t) => mix(mix(GREEN, PAPER, 0.34), mix(AMBER, PAPER, 0.26), t);
  const massOf = (t) => mix(mix(GREEN, PAPER, 0.06), mix(AMBER, PAPER, 0.04), t);

  const tiles = [];
  for (let gx = 0; gx < N; gx++) {
    for (let gy = 0; gy < N; gy++) {
      const p = iso(gx, gy);
      tiles.push(
        <polygon key={`t${gx}-${gy}`}
          points={pts([{ x: p.x, y: p.y - HH2 }, { x: p.x + HW2, y: p.y }, { x: p.x, y: p.y + HH2 }, { x: p.x - HW2, y: p.y }])}
          fill={tileOf(heatAt(gx, gy))} stroke={INK} strokeWidth="0.8" strokeOpacity="0.5" strokeLinejoin="round" />,
      );
    }
  }

  const items = [];
  const mid = (N - 1) / 2;
  for (let gx = 0; gx < N; gx++) {
    for (let gy = 0; gy < N; gy++) {
      if (gx === 3 || gy === 3) continue;
      const central = 1 - Math.min(1, Math.hypot(gx - mid, gy - mid) / (mid * 1.2));
      if (r() > 0.34 + central * 0.62) continue;
      const h = 0.4 + r() * 0.5 + central * central * 1.5;
      const w = 0.52 + r() * 0.22;
      items.push({ k: gx + gy, el: <Box key={`b${gx}-${gy}`} gx={gx} gy={gy} w={w} h={h} color={massOf(heatAt(gx, gy))} /> });
    }
  }
  [[-1.3, 1.1], [-1.4, 4.3]].forEach(([gx, gy], i) => {
    const p = iso(gx, gy), hub = { x: p.x, y: p.y - 34 };
    items.push({
      k: gx + gy,
      el: (
        <g key={`w${i}`}>
          <line x1={p.x} y1={p.y} x2={hub.x} y2={hub.y} stroke={INK} strokeWidth="2" />
          {[0, 120, 240].map((a) => {
            const rad = ((a + i * 30) - 90) * Math.PI / 180;
            return <line key={a} x1={hub.x} y1={hub.y} x2={hub.x + 13 * Math.cos(rad)} y2={hub.y + 13 * Math.sin(rad)}
              stroke={INK} strokeWidth="2" strokeLinecap="round" />;
          })}
          <circle cx={hub.x} cy={hub.y} r="3" fill={GREEN} stroke={INK} strokeWidth="1.2" />
        </g>
      ),
    });
  });
  [[7.4, 2.2], [7.5, 5.0], [2.0, 7.4]].forEach(([gx, gy], i) => {
    const p = iso(gx, gy);
    items.push({
      k: gx + gy,
      el: (
        <g key={`tr${i}`}>
          <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 7} stroke={INK} strokeWidth="1.6" />
          <polygon points={`${p.x},${p.y - 24} ${p.x + 8},${p.y - 6} ${p.x - 8},${p.y - 6}`}
            fill={GREEN} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
        </g>
      ),
    });
  });
  items.sort((a, b) => a.k - b.k);

  const T = iso(-0.5, -0.5), R = iso(N - 0.5, -0.5), B = iso(N - 0.5, N - 0.5), L = iso(-0.5, N - 0.5);
  const D = 17;
  const down = (p) => ({ x: p.x, y: p.y + D });

  const TX0 = 26, TX1 = 288, TB = 176, TT = 62;
  const curve = `M${TX0} ${TB} C ${TX0 + 96} ${TB - 6} ${TX1 - 118} ${TB - 42} ${TX1} ${TT}`;

  return (
    <div aria-hidden="true" style={{ height, minWidth: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}>

        {}
        <path d={`${curve} L${TX1} ${TB} L${TX0} ${TB} Z`} fill={AMBER} opacity="0.16" />
        <line x1={TX0} y1={TB} x2={TX1} y2={TB} stroke={INK} strokeWidth="2" />
        <line x1={TX0} y1="96" x2={TX1} y2="96" stroke={INK} strokeWidth="1.6" strokeDasharray="7 6" opacity="0.55" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={TX0 + i * 64} y1={TB} x2={TX0 + i * 64} y2={TB + 7} stroke={INK} strokeWidth="1.6" opacity="0.6" />
        ))}
        <path d={curve} fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        <path d={curve} fill="none" stroke={AMBER} strokeWidth="4.2" strokeLinecap="round" />
        <circle cx={TX1} cy={TT} r="7.5" fill={AMBER} stroke={INK} strokeWidth="2" />

        {}
        <polygon points={pts([L, B, down(B), down(L)])} fill={mix(tileOf(0.2), INK, 0.34)} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        <polygon points={pts([B, R, down(R), down(B)])} fill={mix(tileOf(0.8), INK, 0.5)} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />

        {}
        {tiles}
        <polygon points={pts([T, R, B, L])} fill="none" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        {items.map((it) => it.el)}

        {}
        <line x1="18" y1={down(B).y + 22} x2={W - 12} y2={down(B).y + 22} stroke={INK} strokeWidth="2" opacity="0.6" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={22 + i * 38} y={down(B).y + 26} width="12" height="10"
            fill={i < 4 ? GREEN : AMBER} opacity={i < 4 ? 0.9 : 0.85} stroke={INK} strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}
