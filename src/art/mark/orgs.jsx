import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
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

const cubic = (a, b, c, d, t) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};
const cubicTan = (a, b, c, d, t) => {
  const u = 1 - t;
  return 3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c);
};

function Arrow({ a, b, bow, fill, opacity = 0.7, size = 4.4, t = 0.58 }) {
  const c1y = a.y - bow, c2y = b.y + bow;
  const px = cubic(a.x, a.x, b.x, b.x, t);
  const py = cubic(a.y, c1y, c2y, b.y, t);
  const tx = cubicTan(a.x, a.x, b.x, b.x, t);
  const ty = cubicTan(a.y, c1y, c2y, b.y, t);
  const ang = Math.atan2(ty, tx);
  const p = (o, r) => `${(px + Math.cos(ang + o) * r).toFixed(1)},${(py + Math.sin(ang + o) * r).toFixed(1)}`;
  return <polygon points={`${p(0, size * 1.5)} ${p(2.5, size)} ${p(-2.5, size)}`} fill={fill} opacity={opacity} />;
}

const TIERS = [
  { key: 'monitoring', n: 13, y: 330, c: NEON[1], r: 5.2, span: 254 },
  { key: 'data', n: 5, y: 246, c: NEON[5], r: 7.5, span: 200 },
  { key: 'assessment', n: 5, y: 158, c: NEON[3], r: 9.5, span: 158 },
  { key: 'policy', n: 3, y: 70, c: NEON[4], r: 13, span: 104 },
];

function build() {
  const r = rng(8409);
  const stations = Array.from({ length: 46 }, () => ({
    x: 20 + Math.pow(r(), 0.85) * 260,
    y: 360 + Math.pow(r(), 0.9) * 78,
    s: 1.5 + r() * 2.4,
  }));
  const tiers = TIERS.map((t) => ({
    ...t,
    nodes: Array.from({ length: t.n }, (_, i) => ({
      x: W / 2 + (t.n === 1 ? 0 : (i / (t.n - 1) - 0.5) * t.span) + (r() - 0.5) * 8,
      y: t.y + (r() - 0.5) * 12,
    })),
  }));
  const research = Array.from({ length: 5 }, (_, i) => ({
    x: 26 + Math.sin(i * 0.72) * 26,
    y: 176 + i * 20,
    s: 3.6 + r() * 1.6,
  }));
  const links = [];
  for (let k = 0; k < tiers.length - 1; k++) {
    const from = tiers[k], to = tiers[k + 1];
    from.nodes.forEach((a, i) => {
      const base = Math.floor((i / from.n) * to.n);
      const targets = [base % to.n];
      if (r() > 0.45) targets.push((base + 1 + Math.floor(r() * (to.n - 1))) % to.n);
      targets.forEach((j) => links.push({ a, b: to.nodes[j], c: from.c }));
    });
  }
  const nearest = (p, nodes) => nodes.reduce((best, n) =>
    (Math.abs(n.x - p.x) < Math.abs(best.x - p.x) ? n : best), nodes[0]);
  const feeders = stations.slice(0, 26).map((s) => ({ a: s, b: nearest(s, tiers[0].nodes) }));
  const rlinks = research.map((p, i) => ({ a: p, b: tiers[2].nodes[i % 2] }));
  return { stations, tiers, research, links, feeders, rlinks };
}

export default function Mark({ height = 300, color, style = {} }) {
  const { stations, tiers, research, links, feeders, rlinks } = build();
  const prime = color || NEON[1];

  return (
    <div aria-hidden="true" style={{ height, minWidth: 0, ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>

        {}
        <rect x="10" y="352" width={W - 20} height="94" fill={prime} opacity="0.07" />
        {[0, 1, 2, 3].map((i) => (
          <path key={`g${i}`} d={`M10 ${372 + i * 22} Q ${W / 2} ${372 + i * 22 + 11} ${W - 10} ${372 + i * 22}`}
            fill="none" stroke={INK} strokeWidth="1" opacity="0.18" />
        ))}

        {}
        {tiers.map((t, k) => (
          <line key={`tr${k}`} x1="10" y1={t.y} x2={W - 10} y2={t.y}
            stroke={INK} strokeWidth="1" opacity="0.15" strokeDasharray="3 9" />
        ))}

        {}
        {feeders.map((f, i) => (
          <line key={`fd${i}`} x1={f.a.x} y1={f.a.y} x2={f.b.x} y2={f.b.y}
            stroke={NEON[1]} strokeWidth="1" opacity="0.3" />
        ))}
        {stations.map((s, i) => (
          <circle key={`st${i}`} cx={s.x} cy={s.y} r={s.s} fill={NEON[1]} opacity="0.8" />
        ))}

        {}
        {rlinks.map((l, i) => (
          <path key={`rl${i}`} d={`M${l.a.x} ${l.a.y} Q ${l.a.x + 18} ${l.b.y + 26} ${l.b.x} ${l.b.y}`}
            fill="none" stroke={NEON[7]} strokeWidth="1.3" opacity="0.55" />
        ))}
        {research.map((p, i) => (
          <circle key={`rn${i}`} cx={p.x} cy={p.y} r={p.s} fill={NEON[7]} opacity="0.9" />
        ))}

        {}
        {links.map((l, i) => {
          const bow = Math.max(24, (l.a.y - l.b.y) * 0.45);
          return (
            <g key={`ln${i}`}>
              <path d={`M${l.a.x} ${l.a.y} C ${l.a.x} ${l.a.y - bow} ${l.b.x} ${l.b.y + bow} ${l.b.x} ${l.b.y}`}
                fill="none" stroke={l.c} strokeWidth="1.5" opacity="0.6" />
              <Arrow a={l.a} b={l.b} bow={bow} fill={l.c} />
            </g>
          );
        })}

        {}
        {tiers.map((t, k) => t.nodes.map((n, i) => (
          <g key={`t${k}-${i}`}>
            {t.r > 6 && <circle cx={n.x} cy={n.y} r={t.r + 6.5} fill={t.c} opacity="0.16" />}
            <circle cx={n.x} cy={n.y} r={t.r} fill={t.c} opacity="0.95" />
            <circle cx={n.x} cy={n.y} r={t.r} fill="none" stroke={INK} strokeWidth="1.1" opacity="0.4" />
            {t.r > 11 && <circle cx={n.x} cy={n.y} r={t.r * 0.42} fill="none" stroke={INK} strokeWidth="1.2" opacity="0.55" />}
          </g>
        )))}

        {}
        <line x1="10" y1="18" x2="10" y2={H - 8} stroke={INK} strokeWidth="1.5" />
        <line x1="10" y1={H - 8} x2={W - 10} y2={H - 8} stroke={INK} strokeWidth="1.5" />
        <line x1="10" y1="18" x2={W - 10} y2="18" stroke={INK} strokeWidth="1.2" opacity="0.5" />
      </svg>
    </div>
  );
}
