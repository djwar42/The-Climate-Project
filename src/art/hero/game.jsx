import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const HW = 1400, HH = 780;

const GREEN = NEON[4];
const AMBER = NEON[7];

const HW2 = 38, HH2 = 19, N = 11;
const OX = 906, OY = 196;

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

function Box({ gx, gy, w, d, h, color }) {
  const a = iso(gx - w / 2, gy - d / 2), b = iso(gx + w / 2, gy - d / 2);
  const c = iso(gx + w / 2, gy + d / 2), e = iso(gx - w / 2, gy + d / 2);
  const up = (p) => ({ x: p.x, y: p.y - h * HH2 * 2 });
  return (
    <g>
      <polygon points={pts([a, b, c, e].map(up))} fill={color} stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
      <polygon points={pts([up(e), up(c), c, e])} fill={mix(color, INK, 0.26)} stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
      <polygon points={pts([up(c), up(b), b, c])} fill={mix(color, INK, 0.44)} stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
    </g>
  );
}

export default function Hero({ height = '100%' }) {
  const r = rng(31417);

  const heatAt = (gx, gy) => Math.min(1, Math.max(0, (gx + (N - 1 - gy)) / (2 * (N - 1))));
  const groundOf = (t) => mix(mix(GREEN, PAPER, 0.5), mix(AMBER, PAPER, 0.42), t);
  const massOf = (t) => mix(mix(GREEN, PAPER, 0.22), mix(AMBER, PAPER, 0.16), t);

  const items = [];

  const ground = [];
  for (let gx = 0; gx < N; gx++) {
    for (let gy = 0; gy < N; gy++) {
      const p = iso(gx, gy);
      ground.push(
        <polygon key={`t${gx}-${gy}`}
          points={pts([{ x: p.x, y: p.y - HH2 }, { x: p.x + HW2, y: p.y }, { x: p.x, y: p.y + HH2 }, { x: p.x - HW2, y: p.y }])}
          fill={groundOf(heatAt(gx, gy))} />,
      );
    }
  }

  const mid = (N - 1) / 2;
  for (let gx = 0; gx < N; gx++) {
    for (let gy = 0; gy < N; gy++) {
      if (gx % 4 === 0 || gy % 4 === 0) continue;
      const keep = r();
      const central = 1 - Math.min(1, Math.hypot(gx - mid, gy - mid) / (mid * 1.15));
      if (keep > 0.2 + central * 0.68) continue;
      const h = 0.34 + r() * 0.55 + central * central * 1.85;
      const w = 0.5 + r() * 0.26;
      items.push({
        k: gx + gy,
        el: <Box key={`b${gx}-${gy}`} gx={gx} gy={gy} w={w} d={w} h={h} color={massOf(heatAt(gx, gy))} />,
      });
    }
  }

  [[-1.5, 2.6], [-1.6, 5.6], [-1.3, 8.6], [1.6, 11.6], [4.4, 11.8], [7.6, 11.5], [-1.7, 0.6]].forEach(([gx, gy], i) => {
    const p = iso(gx, gy);
    const s = 16 + (i % 3) * 5;
    items.push({
      k: gx + gy,
      el: (
        <g key={`tr${i}`}>
          <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - s * 0.42} stroke={INK} strokeWidth="1.5" />
          <polygon points={`${p.x},${p.y - s - 5} ${p.x + 7},${p.y - s * 0.3} ${p.x - 7},${p.y - s * 0.3}`}
            fill={mix(GREEN, PAPER, 0.18)} stroke={INK} strokeWidth="1" strokeLinejoin="round" />
        </g>
      ),
    });
  });
  [[12.2, 1.2], [12.4, 4.4], [11.9, 7.6]].forEach(([gx, gy], i) => {
    const p = iso(gx, gy);
    const hub = { x: p.x, y: p.y - 50 };
    items.push({
      k: gx + gy,
      el: (
        <g key={`w${i}`}>
          <line x1={p.x} y1={p.y} x2={hub.x} y2={hub.y} stroke={INK} strokeWidth="2" />
          {[10, 130, 250].map((a) => {
            const rad = ((a + i * 24) - 90) * Math.PI / 180;
            return <line key={a} x1={hub.x} y1={hub.y} x2={hub.x + 17 * Math.cos(rad)} y2={hub.y + 17 * Math.sin(rad)}
              stroke={INK} strokeWidth="2.2" strokeLinecap="round" />;
          })}
          <circle cx={hub.x} cy={hub.y} r="3.2" fill={mix(GREEN, PAPER, 0.2)} stroke={INK} strokeWidth="1.2" />
        </g>
      ),
    });
  });

  items.sort((a, b) => a.k - b.k);

  const corner = (gx, gy) => iso(gx, gy);
  const groundDiamond = pts([corner(-0.5, -0.5), corner(N - 0.5, -0.5), corner(N - 0.5, N - 0.5), corner(-0.5, N - 0.5)]);

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none',
    }}>
      <svg viewBox={`0 0 ${HW} ${HH}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>

        {}
        {[150, 178, 206].map((y, i) => (
          <line key={`hz${y}`} x1={620 + i * 48} y1={y} x2={HW} y2={y}
            stroke={AMBER} strokeWidth={7 - i * 1.6} opacity={0.22 - i * 0.055} />
        ))}

        <g opacity="0.6">
          {ground}
          <polygon points={groundDiamond} fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />

          {}
          {Array.from({ length: N + 1 }, (_, i) => (
            <g key={`g${i}`}>
              <line x1={iso(i - 0.5, -0.5).x} y1={iso(i - 0.5, -0.5).y} x2={iso(i - 0.5, N - 0.5).x} y2={iso(i - 0.5, N - 0.5).y}
                stroke={INK} strokeWidth="0.9" opacity="0.16" />
              <line x1={iso(-0.5, i - 0.5).x} y1={iso(-0.5, i - 0.5).y} x2={iso(N - 0.5, i - 0.5).x} y2={iso(N - 0.5, i - 0.5).y}
                stroke={INK} strokeWidth="0.9" opacity="0.16" />
            </g>
          ))}

          {items.map((it) => it.el)}
        </g>

        {}
        <defs>
          <linearGradient id="gameHeroWash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={PAPER} stopOpacity="0.7" />
            <stop offset="46%" stopColor={PAPER} stopOpacity="0.6" />
            <stop offset="70%" stopColor={PAPER} stopOpacity="0.3" />
            <stop offset="88%" stopColor={PAPER} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={HW} height={HH} fill="url(#gameHeroWash)" />
      </svg>
    </div>
  );
}
