import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const W = 1240, H = 660;

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

function Arrow({ x1, y1, x2, y2, bow, fill, opacity = 0.55, size = 5, t = 0.62 }) {
  const c1x = x1 + bow, c2x = x2 - bow;
  const px = cubic(x1, c1x, c2x, x2, t);
  const py = cubic(y1, y1, y2, y2, t);
  const tx = cubicTan(x1, c1x, c2x, x2, t);
  const ty = cubicTan(y1, y1, y2, y2, t);
  const a = Math.atan2(ty, tx);
  const p = (ang, r) => `${(px + Math.cos(a + ang) * r).toFixed(1)},${(py + Math.sin(a + ang) * r).toFixed(1)}`;
  return <polygon points={`${p(0, size * 1.5)} ${p(2.5, size)} ${p(-2.5, size)}`} fill={fill} opacity={opacity} />;
}

const CY = 286;
const TIERS = [
  { key: 'monitoring', n: 13, x: 700, c: NEON[1], r: 4.4, span: 440 },
  { key: 'data', n: 5, x: 856, c: NEON[5], r: 8.5, span: 330 },
  { key: 'assessment', n: 5, x: 990, c: NEON[3], r: 11, span: 230 },
  { key: 'policy', n: 3, x: 1114, c: NEON[4], r: 14, span: 146 },
];

function build() {
  const r = rng(8409);
  const stations = Array.from({ length: 58 }, () => ({
    x: 40 + Math.pow(r(), 0.82) * 640,
    y: 46 + Math.pow(r(), 1.15) * 470,
    s: 1.3 + r() * 2.9,
  }));
  const tiers = TIERS.map((t) => ({
    ...t,
    nodes: Array.from({ length: t.n }, (_, i) => ({
      x: t.x + (r() - 0.5) * 22,
      y: CY + (t.n === 1 ? 0 : (i / (t.n - 1) - 0.5) * t.span) + (r() - 0.5) * 14,
    })),
  }));
  const research = Array.from({ length: 12 }, () => ({
    x: 772 + r() * 240,
    y: 34 + Math.pow(r(), 1.2) * 88,
    s: 3 + r() * 2.4,
  }));
  const links = [];
  for (let k = 0; k < tiers.length - 1; k++) {
    const from = tiers[k], to = tiers[k + 1];
    from.nodes.forEach((a, i) => {
      const base = Math.floor((i / from.n) * to.n);
      const targets = [base % to.n];
      if (r() > 0.42) targets.push((base + 1 + Math.floor(r() * (to.n - 1))) % to.n);
      targets.forEach((j) => links.push({ a, b: to.nodes[j], c: from.c }));
    });
  }
  const nearest = (p, nodes) => nodes.reduce((best, n) =>
    (Math.abs(n.y - p.y) < Math.abs(best.y - p.y) ? n : best), nodes[0]);
  const feeders = stations
    .filter((s) => s.x > 420)
    .slice(0, 18)
    .map((s) => ({ a: s, b: nearest(s, tiers[0].nodes) }));
  const rlinks = research.map((p) => ({
    a: p,
    b: tiers[2].nodes.reduce((best, n) => (Math.abs(n.x - p.x) < Math.abs(best.x - p.x) ? n : best), tiers[2].nodes[0]),
  }));
  return { stations, tiers, research, links, feeders, rlinks };
}

export default function Hero({ height = '100%', style = {} }) {
  const { stations, tiers, research, links, feeders, rlinks } = build();

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none', ...style,
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>

        {}
        <defs>
          <linearGradient id="tcpOrgsWash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.62" />
            <stop offset="0.48" stopColor={PAPER} stopOpacity="0.6" />
            <stop offset="0.8" stopColor={PAPER} stopOpacity="0" />
          </linearGradient>
        </defs>

        {}
        {Array.from({ length: 8 }, (_, i) => {
          const y = 34 + i * ((H - 68) / 7);
          const bow = (i - 3.5) * 9;
          return <path key={`lat${i}`} d={`M0 ${y} Q ${W / 2} ${y + bow} ${W} ${y}`}
            fill="none" stroke={INK} strokeWidth="1" opacity="0.13" />;
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const x = 60 + i * 122;
          return <path key={`lon${i}`} d={`M${x} 20 Q ${x + (i - 3) * 26} ${H / 2} ${x} ${H - 20}`}
            fill="none" stroke={INK} strokeWidth="1" opacity="0.11" />;
        })}

        {}
        {feeders.map((f, i) => (
          <line key={`fd${i}`} x1={f.a.x} y1={f.a.y} x2={f.b.x} y2={f.b.y}
            stroke={NEON[1]} strokeWidth="0.9" opacity="0.16" />
        ))}
        {stations.map((s, i) => (
          <circle key={`st${i}`} cx={s.x} cy={s.y} r={s.s} fill={NEON[1]} opacity="0.42" />
        ))}

        {}
        {rlinks.map((l, i) => (
          <path key={`rl${i}`}
            d={`M${l.a.x} ${l.a.y} C ${l.a.x + 30} ${(l.a.y + l.b.y) / 2} ${l.b.x - 90} ${l.b.y - 40} ${l.b.x} ${l.b.y}`}
            fill="none" stroke={NEON[7]} strokeWidth="1" opacity="0.2" />
        ))}
        {research.map((p, i) => (
          <circle key={`rn${i}`} cx={p.x} cy={p.y} r={p.s} fill={NEON[7]} opacity="0.5" />
        ))}

        {}
        {links.map((l, i) => {
          const bow = Math.max(40, (l.b.x - l.a.x) * 0.45);
          return (
            <g key={`ln${i}`}>
              <path d={`M${l.a.x} ${l.a.y} C ${l.a.x + bow} ${l.a.y} ${l.b.x - bow} ${l.b.y} ${l.b.x} ${l.b.y}`}
                fill="none" stroke={l.c} strokeWidth="1.3" opacity="0.34" />
              <Arrow x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} bow={bow} fill={l.c} opacity="0.42" />
            </g>
          );
        })}

        {}
        {tiers.map((t, k) => t.nodes.map((n, i) => (
          <g key={`t${k}-${i}`}>
            {t.r > 7 && <circle cx={n.x} cy={n.y} r={t.r + 7} fill={t.c} opacity="0.10" />}
            <circle cx={n.x} cy={n.y} r={t.r} fill={t.c} opacity="0.55" />
            <circle cx={n.x} cy={n.y} r={t.r} fill="none" stroke={INK} strokeWidth="1" opacity="0.22" />
          </g>
        )))}

        {}
        {tiers.map((t, k) => (
          <line key={`tr${k}`} x1={t.x} y1="22" x2={t.x} y2={CY + t.span / 2 + 34}
            stroke={t.c} strokeWidth="1" opacity="0.18" strokeDasharray="3 10" />
        ))}

        {}
        <line x1="0" y1={H - 30} x2={W} y2={H - 30} stroke={INK} strokeWidth="1.4" opacity="0.26" />

        {}
        <rect x="0" y="0" width={W} height={H} fill="url(#tcpOrgsWash)" />
      </svg>
    </div>
  );
}
