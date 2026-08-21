import React from 'react';
import { NEON } from '../neon.js';

const INK = '#2a2722';
const HALF_W = 30, HALF_H = 15, LIFT = 1.0;

export const iso = (gx, gy, gz = 0) => ({
  x: (gx - gy) * HALF_W,
  y: (gx + gy) * HALF_H - gz * HALF_H * 2 * LIFT,
});

function shade(hex, t) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const ir = 0x2a, ig = 0x27, ib = 0x22;
  const m = (a, i) => Math.round(a + (i - a) * t).toString(16).padStart(2, '0');
  return `#${m(r, ir)}${m(g, ig)}${m(b, ib)}`;
}

const pts = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

function Box({ gx, gy, w = 0.6, d = 0.6, h = 1, color, z = 0, stroke = 0.9 }) {
  const a = iso(gx - w / 2, gy - d / 2, z), b = iso(gx + w / 2, gy - d / 2, z);
  const c = iso(gx + w / 2, gy + d / 2, z), e = iso(gx - w / 2, gy + d / 2, z);
  const up = (p) => ({ x: p.x, y: p.y - h * HALF_H * 2 * LIFT });
  return (
    <g>
      <polygon points={pts([e, c, b, a].map(up))} fill={color} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
      <polygon points={pts([e, c, { ...c }, { ...e }].map((p, i) => (i < 2 ? up(p) : p)).reverse())}
        fill={shade(color, 0.28)} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
      <polygon points={pts([up(c), up(b), b, c])} fill={shade(color, 0.46)} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
    </g>
  );
}

export function Tile({ gx, gy, color = '#9fd8a8', z = 0, stroke = 0.9 }) {
  const t = iso(gx, gy - 0.5, z), r = iso(gx + 0.5, gy, z);
  const b = iso(gx, gy + 0.5, z), l = iso(gx - 0.5, gy, z);
  const D = HALF_H * 1.1;
  return (
    <g>
      <polygon points={pts([t, r, b, l])} fill={color} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
      <polygon points={pts([l, b, { x: b.x, y: b.y + D }, { x: l.x, y: l.y + D }])}
        fill={shade(color, 0.3)} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
      <polygon points={pts([b, r, { x: r.x, y: r.y + D }, { x: b.x, y: b.y + D }])}
        fill={shade(color, 0.48)} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
    </g>
  );
}

const Wind = ({ gx, gy, c }) => {
  const base = iso(gx, gy), hub = { x: base.x, y: base.y - 52 };
  return (
    <g>
      <polygon points={pts([{ x: base.x - 3, y: base.y }, { x: base.x + 3, y: base.y }, { x: hub.x + 1.6, y: hub.y }, { x: hub.x - 1.6, y: hub.y }])}
        fill={c} stroke={INK} strokeWidth="1" strokeLinejoin="round" />
      {[0, 120, 240].map((a) => {
        const r = (a - 90) * Math.PI / 180;
        return <line key={a} x1={hub.x} y1={hub.y} x2={hub.x + 17 * Math.cos(r)} y2={hub.y + 17 * Math.sin(r)}
          stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
      })}
      <circle cx={hub.x} cy={hub.y} r="3.4" fill={c} stroke={INK} strokeWidth="1.2" />
    </g>
  );
};

const Solar = ({ gx, gy, c }) => {
  const p = (dx, dy, dz) => iso(gx + dx, gy + dy, dz);
  const a = p(-0.34, -0.3, 0.34), b = p(0.34, -0.3, 0.34), d = p(0.34, 0.3, 0.05), e = p(-0.34, 0.3, 0.05);
  return (
    <g>
      <line x1={iso(gx, gy).x} y1={iso(gx, gy).y} x2={(a.x + d.x) / 2} y2={(a.y + d.y) / 2} stroke={INK} strokeWidth="2" />
      <polygon points={pts([a, b, d, e])} fill={c} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={a.x + (b.x - a.x) * t} y1={a.y + (b.y - a.y) * t}
          x2={e.x + (d.x - e.x) * t} y2={e.y + (d.y - e.y) * t} stroke={INK} strokeWidth="0.7" opacity="0.6" />
      ))}
    </g>
  );
};

const Hydro = ({ gx, gy, c }) => (
  <g>
    <Box gx={gx} gy={gy} w={1.05} d={0.28} h={0.9} color={c} />
    {[-0.3, 0, 0.3].map((o) => <Box key={o} gx={gx + o} gy={gy - 0.02} w={0.14} d={0.16} h={1.25} color={shade(c, 0.15)} stroke={0.7} />)}
    <path d={`M${iso(gx - 0.5, gy + 0.2).x} ${iso(gx - 0.5, gy + 0.2).y} q14 8 30 0 q14 -8 28 2`}
      fill="none" stroke={NEON[5]} strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
  </g>
);

const Coal = ({ gx, gy, c }) => {
  const s = iso(gx + 0.18, gy - 0.1);
  return (
    <g>
      <Box gx={gx - 0.08} gy={gy + 0.06} w={0.7} d={0.6} h={0.7} color={c} />
      <Box gx={gx + 0.18} gy={gy - 0.1} w={0.2} d={0.2} h={1.7} color={shade(c, 0.12)} stroke={0.8} />
      <path d={`M${s.x} ${s.y - 54} q-11 -9 0 -17 q11 -8 2 -16`} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    </g>
  );
};

const Nuclear = ({ gx, gy, c }) => {
  const b = iso(gx, gy);
  return (
    <g>
      <path d={`M${b.x - 15} ${b.y} C${b.x - 12} ${b.y - 22} ${b.x - 8} ${b.y - 26} ${b.x - 9} ${b.y - 40}
                L${b.x + 9} ${b.y - 40} C${b.x + 8} ${b.y - 26} ${b.x + 12} ${b.y - 22} ${b.x + 15} ${b.y} Z`}
        fill={c} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <ellipse cx={b.x} cy={b.y - 40} rx="9" ry="3.4" fill={shade(c, 0.35)} stroke={INK} strokeWidth="1" />
      <path d={`M${b.x - 4} ${b.y - 48} q-7 -7 1 -13`} fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
    </g>
  );
};

const Forest = ({ gx, gy, c }) => (
  <g>
    {[[-0.22, 0.12, 15], [0.16, -0.14, 20], [0.2, 0.22, 12]].map(([dx, dy, h], i) => {
      const b = iso(gx + dx, gy + dy);
      return (
        <g key={i}>
          <line x1={b.x} y1={b.y} x2={b.x} y2={b.y - h * 0.35} stroke={INK} strokeWidth="1.6" />
          <polygon points={`${b.x},${b.y - h - 5} ${b.x + 7},${b.y - h * 0.3} ${b.x - 7},${b.y - h * 0.3}`}
            fill={c} stroke={INK} strokeWidth="1" strokeLinejoin="round" />
        </g>
      );
    })}
  </g>
);

const City = ({ gx, gy, c }) => (
  <g>
    <Box gx={gx - 0.2} gy={gy + 0.18} w={0.34} d={0.34} h={0.8} color={c} />
    <Box gx={gx + 0.2} gy={gy + 0.1} w={0.3} d={0.3} h={1.35} color={shade(c, 0.14)} />
    <Box gx={gx + 0.02} gy={gy - 0.24} w={0.36} d={0.3} h={1.05} color={shade(c, 0.06)} />
  </g>
);

const Flare = ({ gx, gy, c }) => {
  const b = iso(gx, gy);
  return (
    <g>
      <circle cx={b.x} cy={b.y - 26} r="13" fill={c} opacity="0.2" />
      <circle cx={b.x} cy={b.y - 26} r="7" fill={c} stroke={INK} strokeWidth="1.2" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = a * Math.PI / 180;
        return <line key={a} x1={b.x + 10 * Math.cos(r)} y1={b.y - 26 + 10 * Math.sin(r)}
          x2={b.x + 15 * Math.cos(r)} y2={b.y - 26 + 15 * Math.sin(r)} stroke={c} strokeWidth="2" strokeLinecap="round" />;
      })}
    </g>
  );
};

export const PIECES = {
  wind: { label: 'WIND', draw: Wind, tint: NEON[1], mw: 1000, gco2: 11 },
  solar: { label: 'SOLAR', draw: Solar, tint: NEON[8], mw: 1000, gco2: 48 },
  hydro: { label: 'HYDRO', draw: Hydro, tint: NEON[5], mw: 1000, gco2: 24 },
  nuclear: { label: 'NUCLEAR', draw: Nuclear, tint: NEON[3], mw: 1000, gco2: 12 },
  coal: { label: 'COAL', draw: Coal, tint: NEON[9], mw: 1000, gco2: 820 },
  forest: { label: 'FOREST', draw: Forest, tint: NEON[4], mw: 0, gco2: -30 },
  city: { label: 'DEMAND', draw: City, tint: NEON[7], mw: -1000, gco2: 0 },
  flare: { label: 'HEAT', draw: Flare, tint: NEON[0], mw: 0, gco2: 0 },
};

const GROUND = { land: '#a8d4a2', water: '#7fc4e8', ice: '#dfeef5', bare: '#d9c9a3', city: '#c9c2b4' };

export function IsoPiece({ id, size = 64, color }) {
  const p = PIECES[id];
  if (!p) return null;
  const D = p.draw;
  return (
    <svg width={size} height={size} viewBox="-42 -74 84 96" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      <Tile gx={0} gy={0} color={GROUND.land} />
      <D gx={0} gy={0} c={color || p.tint} />
    </svg>
  );
}

export function IsoWorld({ plan = [], width = 560, height = 340, scale = 1, style = {} }) {
  const items = [...plan].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
  return (
    <svg width="100%" viewBox={`${-width / 2} ${-height * 0.62} ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible', ...style }} aria-hidden="true">
      <g transform={`scale(${scale})`}>
        {items.map((it, i) => (
          <g key={i}>
            <Tile gx={it.gx} gy={it.gy} color={GROUND[it.ground || 'land']} />
            {it.piece && PIECES[it.piece] && React.createElement(PIECES[it.piece].draw, {
              gx: it.gx, gy: it.gy, c: it.tint || PIECES[it.piece].tint,
            })}
          </g>
        ))}
      </g>
    </svg>
  );
}

const field = (w, h, ground = 'land') => {
  const out = [];
  for (let gx = 0; gx < w; gx++) for (let gy = 0; gy < h; gy++) out.push({ gx, gy, ground });
  return out;
};
const put = (plan, gx, gy, piece, ground) => {
  const t = plan.find((p) => p.gx === gx && p.gy === gy);
  if (t) { t.piece = piece; if (ground) t.ground = ground; }
  return plan;
};

export const PROMO_PLANS = {
  fossil: (() => {
    const p = field(5, 5);
    put(p, 1, 1, 'coal'); put(p, 3, 1, 'coal'); put(p, 2, 3, 'city');
    put(p, 0, 3, 'forest'); put(p, 4, 4, 'city'); put(p, 4, 0, 'flare');
    return p;
  })(),
  mixed: (() => {
    const p = field(5, 5);
    p.forEach((t) => { if (t.gy === 4) t.ground = 'water'; });
    put(p, 1, 0, 'wind'); put(p, 3, 0, 'wind'); put(p, 0, 2, 'solar');
    put(p, 2, 4, 'hydro', 'water'); put(p, 4, 2, 'nuclear'); put(p, 2, 2, 'city');
    put(p, 3, 3, 'forest');
    return p;
  })(),
  restored: (() => {
    const p = field(5, 5);
    p.forEach((t) => { if (t.gy === 4) t.ground = 'water'; if (t.gx === 0 && t.gy < 2) t.ground = 'ice'; });
    put(p, 1, 1, 'forest'); put(p, 3, 1, 'forest'); put(p, 2, 2, 'forest');
    put(p, 1, 3, 'forest'); put(p, 4, 0, 'wind'); put(p, 3, 3, 'solar');
    return p;
  })(),
};
