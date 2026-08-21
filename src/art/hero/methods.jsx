import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const W = 1400, H = 620;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function divergeRamp(t) {
  const stops = [
    [0.00, [33, 96, 255]], [0.30, [128, 174, 250]], [0.5, [230, 224, 208]],
    [0.70, [255, 45, 139]], [1.00, [123, 31, 224]],
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

function ols(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  const m = num / den;
  return { m, b: my - m * mx, mx, my };
}

function theilSen(xs, ys, minGap) {
  const slopes = [];
  for (let i = 0; i < xs.length; i += 3) {
    for (let j = i + minGap; j < xs.length; j += 11) {
      slopes.push((ys[j] - ys[i]) / (xs[j] - xs[i]));
    }
  }
  slopes.sort((a, b) => a - b);
  return { slopes, median: slopes[Math.floor(slopes.length / 2)] };
}

function loess(ys, win) {
  return ys.map((_, i) => {
    let s = 0, n = 0;
    for (let k = -win; k <= win; k++) { const j = i + k; if (j >= 0 && j < ys.length) { s += ys[j]; n++; } }
    return s / n;
  });
}

export default function Hero({ height = '100%' }) {
  const N = 168;
  const r = rng(1957);
  const raw = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    return 0.94 * t + 0.27 * Math.sin(t * 5.6 + 0.5) + 0.13 * Math.sin(t * 13.1 + 2.0)
      + 0.07 * Math.sin(t * 31 + 1.1) + (r() - 0.5) * 0.26;
  });
  const lo = Math.min(...raw), hi = Math.max(...raw);
  const xL = 54, xR = W - 6, yT = 112, yB = 386;
  const CALIPER = 1042;
  const xs = raw.map((_, i) => xL + (i / (N - 1)) * (xR - xL));
  const ys = raw.map((u) => yB - ((u - lo) / (hi - lo)) * (yB - yT));

  const { m, b, mx, my } = ols(xs, ys);
  const { slopes, median } = theilSen(xs, ys, Math.round(N * 0.18));
  const sm = loess(ys, 11);
  const cut = Math.round(N * 0.56);
  const segA = ols(xs.slice(0, cut), ys.slice(0, cut));
  const segB = ols(xs.slice(cut), ys.slice(cut));

  const lineAt = (x, slope, px0, py0) => py0 + slope * (x - px0);
  const PENCIL_X = 858;
  const pencil = slopes.filter((_, i) => i % 3 === 0);

  const iC = Math.max(0, Math.min(N - 1, Math.round(((CALIPER - xL) / (xR - xL)) * (N - 1))));
  const endTS = lineAt(CALIPER, median, mx, my);
  const endOLS = m * CALIPER + b;
  const endSM = sm[iC];
  const endSEG = segB.m * CALIPER + segB.b;
  const endpoints = [
    { y: endTS, c: NEON[2] }, { y: endOLS, c: NEON[5] },
    { y: endSM, c: NEON[4] }, { y: endSEG, c: NEON[7] },
  ];
  const eLo = Math.min(...endpoints.map((e) => e.y)), eHi = Math.max(...endpoints.map((e) => e.y));

  const resid = ys.map((y, i) => y - (m * xs[i] + b));
  const rMax = Math.max(...resid.map(Math.abs));

  const smPath = sm.map((y, i) => `${i ? 'L' : 'M'}${xs[i].toFixed(1)} ${y.toFixed(1)}`).join('');
  const dataPath = ys.map((y, i) => `${i ? 'L' : 'M'}${xs[i].toFixed(1)} ${y.toFixed(1)}`).join('');

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none',
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="tcp05-wash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.80" />
            <stop offset="0.44" stopColor={PAPER} stopOpacity="0.70" />
            <stop offset="0.68" stopColor={PAPER} stopOpacity="0.34" />
            <stop offset="0.86" stopColor={PAPER} stopOpacity="0.12" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0.04" />
          </linearGradient>
          {}
          <linearGradient id="tcp05-foot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PAPER} stopOpacity="0" />
            <stop offset="0.38" stopColor={PAPER} stopOpacity="0.24" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`g${i}`} x1={xL} y1={yT + i * ((yB - yT) / 4)} x2={xR + 40} y2={yT + i * ((yB - yT) / 4)}
            stroke={INK} strokeWidth="0.9" opacity="0.14" strokeDasharray="3 10" />
        ))}
        <line x1={xL} y1={yT - 22} x2={xL} y2={yB + 24} stroke={INK} strokeWidth="1.4" opacity="0.5" />
        <line x1={xL} y1={yB + 24} x2={W} y2={yB + 24} stroke={INK} strokeWidth="1.4" opacity="0.5" />

        {}
        <path d={dataPath} fill="none" stroke={INK} strokeWidth="1" opacity="0.3" />
        {ys.map((y, i) => (i % 2 === 0
          ? <circle key={`p${i}`} cx={xs[i]} cy={y} r="2.1" fill={INK} opacity="0.42" />
          : null))}

        {}
        {pencil.map((s, i) => {
          const sx = PENCIL_X - 70 + ((i * 37) % 190);
          return <line key={`k${i}`} x1={sx} y1={lineAt(sx, s, mx, my)} x2={W} y2={lineAt(W, s, mx, my)}
            stroke={NEON[2]} strokeWidth="1" opacity="0.22" />;
        })}
        <circle cx={mx} cy={my} r="5" fill={INK} />
        <circle cx={mx} cy={my} r="11" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.5" />

        {}
        {}
        <line x1={xL} y1={m * xL + b} x2={xR} y2={m * xR + b} stroke={PAPER} strokeWidth="5" opacity="0.5" />
        <line x1={xL} y1={m * xL + b} x2={xR} y2={m * xR + b} stroke={NEON[5]} strokeWidth="2.4" />
        {}
        <line x1={xL} y1={lineAt(xL, median, mx, my)} x2={xR} y2={lineAt(xR, median, mx, my)} stroke={PAPER} strokeWidth="6" opacity="0.5" />
        <line x1={xL} y1={lineAt(xL, median, mx, my)} x2={xR} y2={lineAt(xR, median, mx, my)} stroke={NEON[2]} strokeWidth="3.2" />
        {}
        <path d={smPath} fill="none" stroke={PAPER} strokeWidth="5" opacity="0.5" />
        <path d={smPath} fill="none" stroke={NEON[4]} strokeWidth="2.4" />
        {}
        <line x1={xL} y1={segA.m * xL + segA.b} x2={xs[cut]} y2={segA.m * xs[cut] + segA.b}
          stroke={NEON[7]} strokeWidth="2" opacity="0.9" />
        <line x1={xs[cut]} y1={segB.m * xs[cut] + segB.b} x2={xR} y2={segB.m * xR + segB.b}
          stroke={NEON[7]} strokeWidth="2" opacity="0.9" />
        <line x1={xs[cut]} y1={yT - 16} x2={xs[cut]} y2={yB + 16} stroke={NEON[7]} strokeWidth="1" opacity="0.45" strokeDasharray="6 6" />

        {}
        {resid.map((d, i) => (
          <rect key={`r${i}`} x={xs[i] - 3.6} y={H - 64} width="7.4" height="22"
            fill={divergeRamp(0.5 + Math.sign(d) * 0.5 * Math.pow(Math.abs(d) / rMax, 0.7))} opacity="0.9" />
        ))}
        <rect x={xs[0] - 3.6} y={H - 64} width={xs[N - 1] - xs[0] + 7.4} height="22"
          fill="none" stroke={INK} strokeWidth="1.1" opacity="0.6" />
        <line x1="0" y1={H - 26} x2={W} y2={H - 26} stroke={INK} strokeWidth="1.2" opacity="0.3" />

        {}
        <rect x="0" y="0" width={W} height={H} fill="url(#tcp05-wash)" />
        <rect x="0" y={H * 0.44} width={W} height={H * 0.56} fill="url(#tcp05-foot)" />

        {}
        <line x1={CALIPER} y1={eLo - 12} x2={CALIPER} y2={eHi + 22} stroke={INK} strokeWidth="1" opacity="0.5" strokeDasharray="4 5" />
        <line x1={CALIPER + 28} y1={eLo - 11} x2={CALIPER + 28} y2={eHi + 11} stroke={INK} strokeWidth="1.6" />
        <line x1={CALIPER + 21} y1={eLo - 11} x2={CALIPER + 35} y2={eLo - 11} stroke={INK} strokeWidth="1.6" />
        <line x1={CALIPER + 21} y1={eHi + 11} x2={CALIPER + 35} y2={eHi + 11} stroke={INK} strokeWidth="1.6" />
        {endpoints.map((e, i) => (
          <g key={`e${i}`}>
            <line x1={CALIPER} y1={e.y} x2={CALIPER + 22} y2={e.y} stroke={e.c} strokeWidth="1.4" opacity="0.85" />
            <rect x={CALIPER - 4} y={e.y - 4} width="8" height="8" fill={e.c} stroke={PAPER} strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  );
}
