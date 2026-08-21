import React from 'react';
import { NEON } from '../neon.js';
import { Statement } from '../theme.jsx';

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

function warmRamp(t) {
  const stops = [
    [0.00, [33, 96, 255]], [0.35, [150, 190, 235]], [0.5, [232, 226, 210]],
    [0.7, [255, 138, 0]], [1.00, [204, 42, 15]],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, a] = stops[i - 1], [t1, b] = stops[i];
      const u = (t - t0) / (t1 - t0);
      return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * u)).join(',')})`;
    }
  }
  return `rgb(${stops[stops.length - 1][1].join(',')})`;
}

const Frame = ({ children, w = W, h = H }) => (
  <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
    aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>{children}</svg>
);

const Stripes = ({ c }) => {
  const r = rng(1880);
  const n = 44;
  return (
    <Frame>
      {Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        const warm = Math.min(1, Math.max(0, t * 0.82 + (r() - 0.5) * 0.22));
        return <rect key={i} x="18" y={20 + i * ((H - 40) / n)} width={W - 36}
          height={(H - 40) / n + 0.6} fill={warmRamp(warm)} opacity="0.92" />;
      })}
      <rect x="18" y="20" width={W - 36} height={H - 40} fill="none" stroke={INK} strokeWidth="1.4" />
    </Frame>
  );
};

const Network = ({ c }) => {
  const r = rng(9091);
  const pts = Array.from({ length: 46 }, () => {
    const x = 26 + Math.pow(r(), 0.7) * (W - 52);
    const y = 30 + Math.pow(r(), 1.5) * (H - 60);
    return { x, y, s: 1.8 + r() * 3.6, hub: r() > 0.84 };
  });
  const hubs = pts.filter((p) => p.hub);
  return (
    <Frame>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={`h${i}`} x1="18" y1={40 + i * 76} x2={W - 18} y2={40 + i * 76}
          stroke={INK} strokeWidth="1" opacity="0.22" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path key={`v${i}`} d={`M${44 + i * 71} 24 Q${44 + i * 71 + (i - 1.5) * 20} ${H / 2} ${44 + i * 71} ${H - 24}`}
          fill="none" stroke={INK} strokeWidth="1" opacity="0.22" />
      ))}
      {pts.map((p, i) => hubs.slice(0, 6).map((h, j) => (
        Math.hypot(p.x - h.x, p.y - h.y) < 96
          ? <line key={`l${i}-${j}`} x1={p.x} y1={p.y} x2={h.x} y2={h.y} stroke={c} strokeWidth="0.9" opacity="0.4" />
          : null
      )))}
      {pts.map((p, i) => (
        p.hub
          ? <circle key={i} cx={p.x} cy={p.y} r={p.s + 3.5} fill="none" stroke={c} strokeWidth="1.8" />
          : <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={c} opacity="0.75" />
      ))}
    </Frame>
  );
};

const Strata = ({ c }) => {
  const r = rng(7717);
  const bands = [];
  let y = 26, gap = 36;
  while (y < H - 26 && gap > 1.4) {
    bands.push({ y, h: Math.max(1.1, gap * 0.4), o: 0.25 + r() * 0.65 });
    y += gap; gap *= 0.885;
  }
  return (
    <Frame>
      <rect x="40" y="20" width={W - 80} height={H - 40} fill={c} opacity="0.07" />
      {bands.map((b, i) => (
        <rect key={i} x={44 + (i % 3) * 3} y={b.y} width={W - 88 - (i % 3) * 6} height={b.h} fill={c} opacity={b.o} />
      ))}
      <line x1="40" y1="20" x2="40" y2={H - 20} stroke={INK} strokeWidth="1.5" />
      <line x1={W - 40} y1="20" x2={W - 40} y2={H - 20} stroke={INK} strokeWidth="1.5" />
      <ellipse cx={W / 2} cy="20" rx={(W - 80) / 2} ry="8" fill="none" stroke={INK} strokeWidth="1.5" />
    </Frame>
  );
};

const Fan = ({ c }) => {
  const ox = 30, oy = H - 74;
  const ends = Array.from({ length: 11 }, (_, i) => oy - 30 - (i / 10) * (H - 168));
  const path = (ey) => `M${ox} ${oy} C ${ox + 88} ${oy - 8} ${W - 140} ${(oy + ey) / 2} ${W - 18} ${ey}`;
  return (
    <Frame>
      <path d={`${path(ends[10])} L${W - 18} ${ends[0]} C ${W - 140} ${(oy + ends[0]) / 2} ${ox + 88} ${oy - 8} ${ox} ${oy} Z`}
        fill={c} opacity="0.11" />
      {ends.map((ey, i) => (
        <path key={i} d={path(ey)} fill="none" stroke={c} strokeWidth={i === 5 ? 2.6 : 1.1} opacity={i === 5 ? 1 : 0.45} />
      ))}
      <path d={`M14 ${oy + 44} C 38 ${oy + 38} ${ox - 4} ${oy + 6} ${ox} ${oy}`} fill="none" stroke={INK} strokeWidth="2.4" />
      <circle cx={ox} cy={oy} r="5.5" fill={INK} />
      <line x1="14" y1={oy + 56} x2={W - 14} y2={oy + 56} stroke={INK} strokeWidth="1.5" />
    </Frame>
  );
};

const AnomalyGrid = ({ c }) => {
  const r = rng(4441);
  const cols = 7, rows = 11, cw = (W - 44) / cols, ch = (H - 48) / rows;
  return (
    <Frame>
      {Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => {
        const v = r();
        const warm = Math.min(1, Math.max(0, 0.5 + (v - 0.5) * 1.5 + (1 - y / rows) * 0.28));
        return <rect key={`${x}-${y}`} x={22 + x * cw} y={24 + y * ch} width={cw - 1.5} height={ch - 1.5}
          fill={warmRamp(warm)} opacity={0.35 + v * 0.5} />;
      }))}
      <rect x="22" y="24" width={cols * cw - 1.5} height={rows * ch - 1.5} fill="none" stroke={INK} strokeWidth="1.4" />
    </Frame>
  );
};

const Spiral = ({ c }) => {
  const cx = W / 2, cy = H / 2;
  const turns = 5.2, steps = 460;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2 - Math.PI / 2;
    const rad = 22 + Math.pow(t, 1.22) * 150 + Math.sin(a * 6) * 4;
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return (
    <Frame>
      {[60, 110, 160].map((rad) => (
        <circle key={rad} cx={cx} cy={cy} r={rad} fill="none" stroke={INK} strokeWidth="1" opacity="0.25" strokeDasharray="4 7" />
      ))}
      <path d={d} fill="none" stroke={c} strokeWidth="2.1" strokeLinecap="round" opacity="0.92" />
      <circle cx={cx} cy={cy} r="6" fill={INK} />
    </Frame>
  );
};

const Lattice = ({ c }) => {
  const cells = [];
  for (let gx = 0; gx < 7; gx++) for (let gy = 0; gy < 7; gy++) {
    const x = W / 2 + (gx - gy) * 21, y = 120 + (gx + gy) * 10.5;
    const solid = (gx + gy) / 12;
    cells.push({ x, y, o: 0.12 + solid * 0.82, fill: solid > 0.72 });
  }
  return (
    <Frame>
      {cells.map((t, i) => (
        <polygon key={i} points={`${t.x},${t.y - 10.5} ${t.x + 21},${t.y} ${t.x},${t.y + 10.5} ${t.x - 21},${t.y}`}
          fill={t.fill ? c : 'none'} stroke={c} strokeWidth="1.1" opacity={t.o} />
      ))}
      <line x1="14" y1={H - 40} x2={W - 14} y2={H - 40} stroke={INK} strokeWidth="1.5" />
    </Frame>
  );
};

const Sawtooth = ({ c }) => {
  const n = 17, x0 = 26, x1 = W - 26, base = H - 40, rise = H - 130;
  let d = `M${x0} ${base}`;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 0.5) / n, t2 = (i + 1) / n;
    const y = (t) => base - t * rise;
    const x = (t) => x0 + t * (x1 - x0);
    d += `L${x(t1).toFixed(1)} ${(y(t1) - 13).toFixed(1)}L${x(t2).toFixed(1)} ${y(t2).toFixed(1)}`;
  }
  return (
    <Frame>
      <path d={`${d}L${x1} ${base}Z`} fill={c} opacity="0.10" />
      <line x1={x0} y1={base} x2={x1} y2={base - rise} stroke={INK} strokeWidth="1.3" strokeDasharray="6 6" opacity="0.55" />
      <path d={d} fill="none" stroke={c} strokeWidth="2.2" strokeLinejoin="round" />
      <line x1="16" y1={base} x2={W - 16} y2={base} stroke={INK} strokeWidth="1.5" />
      <line x1="16" y1="24" x2="16" y2={base} stroke={INK} strokeWidth="1.5" />
    </Frame>
  );
};

export const ABSTRACTS = {
  home: { draw: Spiral, color: NEON[0] },
  state: { draw: Stripes, color: NEON[0] },
  projects: { draw: Network, color: NEON[7] },
  deeptime: { draw: Strata, color: NEON[5] },
  models: { draw: Fan, color: NEON[3] },
  methods: { draw: AnomalyGrid, color: NEON[2] },
  orgs: { draw: Spiral, color: NEON[1] },
  game: { draw: Lattice, color: NEON[4] },
  news: { draw: Sawtooth, color: NEON[8] },
};

export function StatementMark({ page = 'home', color, height = 300, style = {} }) {
  const a = ABSTRACTS[page] || ABSTRACTS.home;
  const D = a.draw;
  return (
    <div aria-hidden="true" style={{ height, minWidth: 0, ...style }}>
      <D c={color || a.color} />
    </div>
  );
}

export function StatementBand({ page, color, height = 280, mark, children, style = {} }) {
  return (
    <div className="tcp-statementband" style={{
      display: 'grid', gridTemplateColumns: 'minmax(170px, 1fr) minmax(0, 2.6fr)',
      gap: 'clamp(24px, 4vw, 64px)', alignItems: 'center', marginTop: 40, ...style,
    }}>
      {mark || <StatementMark page={page} color={color} height={height} />}
      <Statement style={{ marginLeft: 0, marginTop: 0 }}>{children}</Statement>
    </div>
  );
}

export function HeroField({ height = 560, style = {} }) {
  const r = rng(2026);
  const HW = 1400, HH = 620;
  const stripes = 64;
  const net = Array.from({ length: 54 }, () => ({
    x: 40 + r() * (HW - 80), y: 30 + r() * (HH - 60), s: 1.4 + r() * 3.4, hub: r() > 0.86,
  }));
  const spiralCx = HW - 250, spiralCy = HH / 2;
  let spiral = '';
  for (let i = 0; i <= 420; i++) {
    const t = i / 420, a = t * 4.6 * Math.PI * 2 - Math.PI / 2;
    const rad = 16 + Math.pow(t, 1.2) * 190;
    spiral += `${i ? 'L' : 'M'}${(spiralCx + Math.cos(a) * rad).toFixed(1)} ${(spiralCy + Math.sin(a) * rad).toFixed(1)}`;
  }
  const fanOx = 90, fanOy = HH - 70;
  const fan = Array.from({ length: 9 }, (_, i) => {
    const ey = fanOy - 60 - (i / 8) * (HH - 210);
    return `M${fanOx} ${fanOy} C ${fanOx + 260} ${fanOy - 20} ${HW * 0.55} ${(fanOy + ey) / 2} ${HW - 60} ${ey}`;
  });
  let saw = `M40 ${HH - 40}`;
  for (let i = 0; i < 26; i++) {
    const x = (t) => 40 + (t / 26) * (HW - 80);
    const y = (t) => HH - 40 - (t / 26) * 120;
    saw += `L${x(i + 0.5).toFixed(1)} ${(y(i + 0.5) - 16).toFixed(1)}L${x(i + 1).toFixed(1)} ${y(i + 1).toFixed(1)}`;
  }

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <svg viewBox={`0 0 ${HW} ${HH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block' }}>
        {}
        {Array.from({ length: stripes }, (_, i) => {
          const t = i / (stripes - 1);
          const warm = Math.min(1, Math.max(0, t * 0.86 + (r() - 0.5) * 0.2));
          return <rect key={i} x={i * (HW / stripes)} y="0" width={HW / stripes + 0.7} height={HH}
            fill={warmRamp(warm)} opacity="0.17" />;
        })}
        {}
        {(() => {
          const out = []; let y = 24, gap = 40;
          while (y < HH - 20 && gap > 1.4) { out.push({ y, h: Math.max(1, gap * 0.34) }); y += gap; gap *= 0.9; }
          return out.map((b, i) => (
            <rect key={`s${i}`} x="0" y={b.y} width="210" height={b.h} fill={NEON[5]} opacity={0.16 + i * 0.02} />
          ));
        })()}
        {}
        {fan.map((d, i) => (
          <path key={`f${i}`} d={d} fill="none" stroke={NEON[3]} strokeWidth={i === 4 ? 2.6 : 1.2} opacity={i === 4 ? 0.5 : 0.22} />
        ))}
        {}
        <path d={spiral} fill="none" stroke={NEON[0]} strokeWidth="2" opacity="0.42" />
        {[70, 130, 190].map((rad) => (
          <circle key={rad} cx={spiralCx} cy={spiralCy} r={rad} fill="none" stroke={INK} strokeWidth="1" opacity="0.13" strokeDasharray="5 9" />
        ))}
        {}
        {net.map((p, i) => (
          p.hub
            ? <circle key={`n${i}`} cx={p.x} cy={p.y} r={p.s + 4} fill="none" stroke={NEON[1]} strokeWidth="1.6" opacity="0.5" />
            : <circle key={`n${i}`} cx={p.x} cy={p.y} r={p.s} fill={NEON[1]} opacity="0.3" />
        ))}
        {}
        <path d={saw} fill="none" stroke={NEON[8]} strokeWidth="1.8" opacity="0.45" strokeLinejoin="round" />
        {}
        <line x1="0" y1={HH - 40} x2={HW} y2={HH - 40} stroke={INK} strokeWidth="1.4" opacity="0.3" />
        <rect x="0" y="0" width={HW * 0.62} height={HH} fill="#eae6dc" opacity="0.55" />
      </svg>
    </div>
  );
}

export default StatementMark;
