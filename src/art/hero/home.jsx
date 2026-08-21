import React, { useLayoutEffect, useRef, useState } from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const VW = 1600;

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
  const u0 = Math.min(1, Math.max(0, t));
  for (let i = 1; i < stops.length; i++) {
    if (u0 <= stops[i][0]) {
      const [t0, a] = stops[i - 1], [t1, b] = stops[i];
      const u = (u0 - t0) / (t1 - t0);
      return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * u)).join(',')})`;
    }
  }
  return `rgb(${stops[stops.length - 1][1].join(',')})`;
}

const WRAP_OUTER = 1288, WRAP_PAD = 24;

function useBleedGeometry(heightFactor) {
  const ref = useRef(null);
  const [g, setG] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const parent = el.parentElement;
    if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const measure = () => {
      const br = document.body.getBoundingClientRect();
      const vw = Math.max(1, br.width || document.documentElement.clientWidth);
      const pr = parent ? parent.getBoundingClientRect() : { left: 0 };
      const blockH = parent ? parent.offsetHeight : el.offsetHeight;
      const left = Math.round((br.left - pr.left) * 100) / 100;
      const outer = Math.min(WRAP_OUTER, vw);
      const wrapL = (vw - outer) / 2 + WRAP_PAD;
      setG((prev) => (prev && prev.vw === vw && prev.left === left && prev.blockH === blockH
        ? prev
        : { vw, left, blockH, wrapL, wrapR: vw - wrapL }));
    };
    measure();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    if (ro && parent) ro.observe(parent);
    window.addEventListener('resize', measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [heightFactor]);
  return [ref, g];
}

export default function Hero({ height = '200%', style = {} }) {
  const [ref, g] = useBleedGeometry(height);

  const vw = g ? g.vw : 1600;
  const elW = vw;
  const elH = g ? Math.max(240, g.blockH * (parseFloat(height) || 200) / 100) : 1214;
  const VH = Math.round(VW * (elH / elW));
  const S = g ? Math.round(VH * Math.min(0.92, g.blockH / elH)) : Math.round(VH * 0.5);
  const xL = Math.round(VW * ((g ? g.wrapL : 180) / elW));
  const xR = Math.round(VW * ((g ? g.wrapR : 1420) / elW));
  const xLf = xL / VW, xRf = xR / VW;

  const r = rng(2026);

  const nStripes = 96;
  const sw = VW / nStripes;
  const stripes = Array.from({ length: nStripes }, (_, i) => {
    const t = i / (nStripes - 1);
    return warmRamp(Math.min(1, Math.max(0, t * 0.88 + (r() - 0.5) * 0.19)));
  });

  const strataW = Math.max(120, xL - 12);
  const bands = [];
  {
    let y = 20, gap = Math.max(30, S * 0.078);
    while (y < VH - 40 && gap > 1.3) {
      bands.push({ y, h: Math.max(1.2, gap * 0.36), o: 0.26 + r() * 0.34 });
      y += gap; gap *= 0.928;
    }
  }
  const strataEnd = bands.length ? bands[bands.length - 1].y : 40;

  const fanX = Math.round(strataW * 0.62), fanY = Math.round(S * 1.04);
  const fanEnds = Array.from({ length: 11 }, (_, i) => fanY - 70 - (i / 10) * (S * 1.02));
  const fanPath = (ey) => `M${fanX} ${fanY} C ${fanX + 300} ${fanY - 26} ${VW * 0.56} ${(fanY + ey) / 2} ${VW} ${ey}`;

  const spCx = Math.round(VW * 0.885), spCy = Math.round(S * 0.44);
  const spR = Math.min(236, S * 0.44);
  let spiral = '';
  for (let i = 0; i <= 460; i++) {
    const t = i / 460, a = t * 4.8 * Math.PI * 2 - Math.PI / 2;
    const rad = 14 + Math.pow(t, 1.18) * spR;
    spiral += `${i ? 'L' : 'M'}${(spCx + Math.cos(a) * rad).toFixed(1)} ${(spCy + Math.sin(a) * rad).toFixed(1)}`;
  }

  const net = Array.from({ length: 78 }, () => {
    const yb = Math.pow(r(), 1.5);
    return {
      x: 26 + r() * (VW - 52),
      y: 26 + yb * (VH - 90),
      s: 1.3 + r() * 3.2,
      hub: r() > 0.86,
    };
  });
  const hubs = net.filter((p) => p.hub).slice(0, 7);

  const events = [0.19, 0.32, 0.47, 0.63, 0.72, 0.94].map((f, i) => ({
    x: Math.round(VW * f), h: S * (0.42 + (i % 3) * 0.16),
  }));

  const sawPath = (teeth, x0, x1, yAt, amp) => {
    let d = `M${x0} ${yAt(0).toFixed(1)}`;
    for (let i = 0; i < teeth; i++) {
      const t1 = (i + 0.55) / teeth, t2 = (i + 1) / teeth;
      d += `L${(x0 + t1 * (x1 - x0)).toFixed(1)} ${(yAt(t1) - amp).toFixed(1)}`;
      d += `L${(x0 + t2 * (x1 - x0)).toFixed(1)} ${yAt(t2).toFixed(1)}`;
    }
    return d;
  };
  const seamSaw = sawPath(34, 0, VW, (t) => S + 10 - t * 96, 17);
  const floorY = VH - 54;
  const floorSaw = sawPath(28, 0, VW, (t) => floorY - t * 44, 11);

  const gCols = 9, gRows = 5;
  const gX = Math.round(VW * 0.70), gY = Math.max(S + 40, VH - 300);
  const gW = (VW - gX + 30) / gCols, gH = Math.min(44, (VH - gY - 70) / gRows);

  const isoCx = Math.round(VW * 0.965), isoCy = Math.round(S + (VH - S) * 0.28);
  const iso = [];
  for (let a = 0; a < 7; a++) {
    for (let b = 0; b < 7; b++) {
      const solid = (a + b) / 12;
      iso.push({
        x: isoCx + (a - b) * 24, y: isoCy + (a + b) * 12,
        o: 0.1 + solid * 0.5, fill: solid > 0.78,
      });
    }
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: g ? g.left : 0, width: g ? g.vw : '100%',
        height, overflow: 'hidden', pointerEvents: 'none', zIndex: -1, ...style,
      }}
    >
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          {}
          <linearGradient id="tcp00-wash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.10" />
            <stop offset={Math.max(0.001, xLf - 0.045).toFixed(3)} stopColor={PAPER} stopOpacity="0.30" />
            <stop offset={Math.min(0.998, xLf + 0.015).toFixed(3)} stopColor={PAPER} stopOpacity="0.60" />
            <stop offset={(xLf + (xRf - xLf) * 0.80).toFixed(3)} stopColor={PAPER} stopOpacity="0.58" />
            <stop offset={Math.min(0.999, xRf).toFixed(3)} stopColor={PAPER} stopOpacity="0.22" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0.07" />
          </linearGradient>
          {}
          <linearGradient id="tcp00-calm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PAPER} stopOpacity="0" />
            <stop offset="0.4" stopColor={PAPER} stopOpacity="0.30" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0.42" />
          </linearGradient>
          {}
          <linearGradient id="tcp00-dissolve" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PAPER} stopOpacity="0" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0.94" />
          </linearGradient>
          {}
          <linearGradient id="tcp00-core" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.42" />
            <stop offset="0.72" stopColor={PAPER} stopOpacity="0.34" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0" />
          </linearGradient>
        </defs>

        {}
        {stripes.map((c, i) => (
          <rect key={`w${i}`} x={i * sw} y="0" width={sw + 0.7} height={VH} fill={c} opacity="0.17" />
        ))}
        {}
        {stripes.map((c, i) => (i % 8 === 0
          ? <rect key={`wl${i}`} x={i * sw} y="0" width="1.2" height={VH} fill={INK} opacity="0.06" />
          : null))}

        {}
        <rect x="0" y="14" width={strataW} height={Math.min(VH - 28, strataEnd + 60)} fill="url(#tcp00-core)" />
        <rect x="0" y="14" width={strataW} height={Math.min(VH - 28, strataEnd + 26)} fill={NEON[5]} opacity="0.08" />
        {bands.map((b, i) => (
          <rect key={`st${i}`} x={(i % 3) * 4} y={b.y} width={strataW - (i % 3) * 9} height={b.h}
            fill={NEON[5]} opacity={b.o * (1 - 0.45 * Math.min(1, b.y / (strataEnd || 1)))} />
        ))}
        {}
        {Array.from({ length: 22 }, (_, i) => {
          const y = strataEnd + 24 + i * ((VH - strataEnd - 60) / 22);
          return y < VH - 30 ? (
            <line key={`dp${i}`} x1="0" y1={y} x2={i % 4 === 0 ? 44 : 24} y2={y}
              stroke={NEON[5]} strokeWidth="1.1" opacity="0.34" />
          ) : null;
        })}
        <line x1={strataW} y1="14" x2={strataW} y2={Math.min(VH - 20, strataEnd + 26)}
          stroke={INK} strokeWidth="1.3" opacity="0.3" />

        {}
        <path
          d={`${fanPath(fanEnds[10])} L${VW} ${fanEnds[0]} C ${VW * 0.56} ${(fanY + fanEnds[0]) / 2} ${fanX + 300} ${fanY - 26} ${fanX} ${fanY} Z`}
          fill={NEON[3]} opacity="0.07"
        />
        {fanEnds.map((ey, i) => (
          <path key={`fn${i}`} d={fanPath(ey)} fill="none" stroke={NEON[3]}
            strokeWidth={i === 5 ? 2.8 : 1.2} opacity={i === 5 ? 0.5 : 0.2} />
        ))}
        <circle cx={fanX} cy={fanY} r="6" fill={INK} opacity="0.55" />

        {}
        {[spR * 0.34, spR * 0.62, spR * 0.9].map((rad, i) => (
          <circle key={`sr${i}`} cx={spCx} cy={spCy} r={rad} fill="none" stroke={INK}
            strokeWidth="1" opacity="0.14" strokeDasharray="5 10" />
        ))}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={`sp${i}`} x1={spCx} y1={spCy}
            x2={spCx + Math.cos(a) * spR} y2={spCy + Math.sin(a) * spR}
            stroke={INK} strokeWidth="0.9" opacity="0.1" />;
        })}
        <path d={spiral} fill="none" stroke={NEON[0]} strokeWidth="2.1" opacity="0.5" />

        {}
        {net.map((p, i) => hubs.map((h, j) => (
          Math.hypot(p.x - h.x, p.y - h.y) < 150 && p !== h
            ? <line key={`nl${i}-${j}`} x1={p.x} y1={p.y} x2={h.x} y2={h.y}
              stroke={NEON[1]} strokeWidth="0.8" opacity="0.2" />
            : null
        )))}
        {net.map((p, i) => (p.hub
          ? <circle key={`n${i}`} cx={p.x} cy={p.y} r={p.s + 4.5} fill="none" stroke={NEON[1]} strokeWidth="1.7" opacity="0.5" />
          : <circle key={`n${i}`} cx={p.x} cy={p.y} r={p.s} fill={NEON[1]} opacity="0.3" />
        ))}

        {}
        {events.map((e, i) => (
          <g key={`ev${i}`}>
            <line x1={e.x} y1="18" x2={e.x} y2={18 + e.h} stroke={INK} strokeWidth="1" opacity="0.18" />
            <circle cx={e.x} cy="18" r="5" fill="none" stroke={NEON[7]} strokeWidth="1.6" opacity="0.55" />
          </g>
        ))}

        {}
        <path d={`${seamSaw}L${VW} ${S + 120}L0 ${S + 120}Z`} fill={NEON[8]} opacity="0.06" />
        <line x1="0" y1={S + 10} x2={VW} y2={S - 86} stroke={INK} strokeWidth="1.2"
          strokeDasharray="7 9" opacity="0.22" />
        <path d={seamSaw} fill="none" stroke={NEON[8]} strokeWidth="2" opacity="0.5" strokeLinejoin="round" />

        {}

        {}
        {Array.from({ length: gRows }, (_, y) => Array.from({ length: gCols }, (_, x) => {
          const v = r();
          const warm = Math.min(1, Math.max(0, 0.5 + (v - 0.5) * 1.5 + (1 - y / gRows) * 0.24));
          return <rect key={`ag${x}-${y}`} x={gX + x * gW} y={gY + y * gH}
            width={gW - 2} height={gH - 2} fill={warmRamp(warm)} opacity={0.16 + v * 0.24} />;
        }))}
        <rect x={gX} y={gY} width={gCols * gW - 2} height={gRows * gH - 2} fill="none"
          stroke={INK} strokeWidth="1.1" opacity="0.18" />

        {}
        {iso.map((t, i) => (
          <polygon key={`is${i}`}
            points={`${t.x},${t.y - 13} ${t.x + 26},${t.y} ${t.x},${t.y + 13} ${t.x - 26},${t.y}`}
            fill={t.fill ? NEON[4] : 'none'} stroke={NEON[4]} strokeWidth="1" opacity={t.o} />
        ))}

        {}
        {[0.26, 0.5, 0.74].map((f, i) => (
          <line key={`lr${i}`} x1="0" y1={S + (VH - S) * f} x2={VW} y2={S + (VH - S) * f}
            stroke={INK} strokeWidth="1" opacity="0.13" strokeDasharray="3 11" />
        ))}

        {}
        <path d={floorSaw} fill="none" stroke={NEON[8]} strokeWidth="1.5" opacity="0.34" strokeLinejoin="round" />
        <line x1="0" y1={VH - 26} x2={VW} y2={VH - 26} stroke={INK} strokeWidth="1.2" opacity="0.24" />
        {Array.from({ length: 41 }, (_, i) => (
          <line key={`ft${i}`} x1={i * (VW / 40)} y1={VH - 26} x2={i * (VW / 40)}
            y2={VH - 26 + (i % 5 === 0 ? 11 : 6)} stroke={INK} strokeWidth="1" opacity="0.2" />
        ))}

        {}
        <rect x="0" y={S * 0.82} width={VW} height={VH - S * 0.82} fill="url(#tcp00-calm)" />
        <rect x="0" y="0" width={VW} height={VH} fill="url(#tcp00-wash)" />
        <rect x="0" y={VH - 270} width={VW} height="270" fill="url(#tcp00-dissolve)" />

        {}
        <line x1="0" y1={S} x2={xL - 20} y2={S} stroke={INK} strokeWidth="1.3" opacity="0.34" />
        <line x1={xR + 20} y1={S} x2={VW} y2={S} stroke={INK} strokeWidth="1.3" opacity="0.34" />
      </svg>
    </div>
  );
}
