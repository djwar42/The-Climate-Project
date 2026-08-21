import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const W = 300, H = 460;
const X0 = 20, XW = 262;
const Y0 = 30;
const YN = 400;
const YG = 442;
const N = 57;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const STATE = {
  active: NEON[4],
  underway: NEON[7],
  complete: NEON[3],
  dormant: NEON[9],
};
const POPULATION = [['active', 34], ['complete', 10], ['dormant', 7], ['underway', 6]];

const GROUPS = ['active', 'underway', 'complete', 'dormant'];

function lifespan(state, r) {
  const s = Math.pow(r(), 0.62) * 0.8;
  if (state === 'complete') return { state, s, e: Math.min(0.86, s + 0.14 + r() * 0.42) };
  if (state === 'dormant') return { state, s: s * 0.7, e: 0.6 + r() * 0.26 };
  return { state, s, e: 1 };
}

function threads() {
  const r = rng(5709);
  const bag = [];
  POPULATION.forEach(([k, n]) => { for (let i = 0; i < n; i++) bag.push(k); });
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = bag[i]; bag[i] = bag[j]; bag[j] = t;
  }
  const rows = bag.map((state) => lifespan(state, r));
  rows.sort((a, b) => (GROUPS.indexOf(a.state) - GROUPS.indexOf(b.state)) || (a.s - b.s));
  const step = XW / (N - 1);
  return rows.map((t, i) => ({ ...t, x: X0 + i * step, first: i > 0 && rows[i - 1].state !== t.state }));
}

const yOf = (t) => Y0 + t * (YN - Y0);

export default function Mark({ height = 300, color, style = {} }) {
  const rows = threads();
  const prime = color || NEON[7];

  return (
    <div aria-hidden="true" style={{ height, minWidth: 0, ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>

        {}
        <rect x={X0 - 8} y={Y0 - 12} width={XW + 16} height={YG - Y0 + 24} fill={prime} opacity="0.05" />
        <rect x={X0 - 8} y={YN} width={XW + 16} height={YG - YN + 12} fill={prime} opacity="0.05" />

        {}
        {Array.from({ length: 6 }, (_, i) => {
          const y = Y0 + (i / 5) * (YN - Y0);
          return <line key={`r${i}`} x1={X0 - 8} y1={y} x2={X0 + XW + 8} y2={y}
            stroke={INK} strokeWidth="1" opacity="0.16" />;
        })}

        {}
        {rows.map((t, i) => {
          const c = STATE[t.state];
          const ys = yOf(t.s);
          const ye = (t.state === 'active' || t.state === 'underway') ? YN : yOf(t.e);
          return (
            <g key={i}>
              {}
              {t.first && <line x1={t.x - 2.4} y1={Y0 - 12} x2={t.x - 2.4} y2={YG + 8}
                stroke={INK} strokeWidth="1" opacity="0.45" />}
              <line x1={t.x} y1={ys} x2={t.x} y2={ye} stroke={c} strokeWidth="5.4" opacity="0.15" />
              <line x1={t.x} y1={ys} x2={t.x} y2={ye} stroke={c} strokeWidth="2.3" opacity="0.92" />
              <line x1={t.x - 2.6} y1={ys} x2={t.x + 2.6} y2={ys} stroke={c} strokeWidth="1.6" opacity="0.8" />

              {t.state === 'active' && (
                <line x1={t.x} y1={YN} x2={t.x} y2={YG} stroke={c} strokeWidth="1.6"
                  opacity="0.3" strokeDasharray="3 7" />
              )}
              {}
              {t.state === 'underway' && (
                <circle cx={t.x} cy={YN} r="3.4" fill={c} stroke={INK} strokeWidth="1.1" />
              )}
              {t.state === 'complete' && (
                <line x1={t.x - 3.4} y1={ye} x2={t.x + 3.4} y2={ye} stroke={c} strokeWidth="2.6" />
              )}
              {t.state === 'dormant' && (
                <>
                  <circle cx={t.x} cy={ye} r="2.9" fill="none" stroke={c} strokeWidth="1.8" />
                  {}
                  <line x1={t.x} y1={ye + 5} x2={t.x} y2={YG} stroke={c} strokeWidth="1.4"
                    opacity="0.26" strokeDasharray="1.5 6" />
                </>
              )}
            </g>
          );
        })}

        {}
        <line x1={X0 - 12} y1={YN} x2={X0 + XW + 12} y2={YN} stroke={prime} strokeWidth="2.6" opacity="0.95" />
        <line x1={X0 - 12} y1={YN} x2={X0 + XW + 12} y2={YN} stroke={INK} strokeWidth="1" opacity="0.35" />
        {[0, 1, 2, 3, 4].map((i) => {
          const x = X0 + (i / 4) * XW;
          return <line key={`tk${i}`} x1={x} y1={YN} x2={x} y2={YN + 6} stroke={INK} strokeWidth="1.2" opacity="0.45" />;
        })}

        {}
        <line x1={X0 - 12} y1={Y0 - 12} x2={X0 - 12} y2={YG + 8} stroke={INK} strokeWidth="1.5" />
        <line x1={X0 - 12} y1={YG + 8} x2={X0 + XW + 12} y2={YG + 8} stroke={INK} strokeWidth="1.5" />
        <line x1={X0 - 12} y1={Y0 - 12} x2={X0 + XW + 12} y2={Y0 - 12} stroke={INK} strokeWidth="1.2" opacity="0.5" />
      </svg>
    </div>
  );
}
