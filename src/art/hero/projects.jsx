import React from 'react';
import { NEON } from '../../neon.js';

const INK = '#2a2722';
const PAPER = '#eae6dc';
const W = 1240, H = 660;
const X0 = 88;
const NOW = 1004;
const X1 = 1152;
const Y0 = 40, Y1 = 292;
const FADE = 7;
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
  rows.sort((a, b) => a.s - b.s);
  const step = (Y1 - Y0) / (N - 1);
  return rows.map((t, i) => ({ ...t, y: Y0 + i * step }));
}

const xOf = (t) => X0 + t * (NOW - X0);

export default function Hero({ height = '100%', style = {} }) {
  const rows = threads();

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none', ...style,
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>

        {}
        <defs>
          <linearGradient id="tcpProjWash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.6" />
            <stop offset="0.5" stopColor={PAPER} stopOpacity="0.58" />
            <stop offset="0.82" stopColor={PAPER} stopOpacity="0" />
          </linearGradient>
        </defs>

        {}
        <rect x={NOW} y="0" width={X1 - NOW + 26} height={Y1 + 34} fill={NEON[7]} opacity="0.04" />

        {}
        {Array.from({ length: 8 }, (_, i) => {
          const x = X0 + (i / 7) * (NOW - X0);
          return <line key={`d${i}`} x1={x} y1="18" x2={x} y2={Y1 + 26}
            stroke={INK} strokeWidth="1" opacity="0.14" />;
        })}

        {}
        {rows.map((t, i) => {
          const c = STATE[t.state];
          const xs = xOf(t.s);
          const xe = (t.state === 'active' || t.state === 'underway') ? NOW : xOf(t.e);
          const fade = i >= N - FADE ? 0.24 + (N - 1 - i) / FADE * 0.76 : 1;
          return (
            <g key={i} opacity={fade}>
              {}
              <line x1={xs} y1={t.y} x2={xe} y2={t.y} stroke={c} strokeWidth="4.6" opacity="0.09" />
              <line x1={xs} y1={t.y} x2={xe} y2={t.y} stroke={c} strokeWidth="1.7" opacity="0.5" />
              {}
              <line x1={xs} y1={t.y - 3.2} x2={xs} y2={t.y + 3.2} stroke={c} strokeWidth="1.6" opacity="0.55" />

              {t.state === 'active' && (
                <>
                  <line x1={NOW} y1={t.y} x2={X1} y2={t.y} stroke={c} strokeWidth="1.4"
                    opacity="0.3" strokeDasharray="7 8" />
                  <polygon points={`${X1},${t.y} ${X1 - 7},${t.y - 3.2} ${X1 - 7},${t.y + 3.2}`}
                    fill={c} opacity="0.42" />
                </>
              )}
              {t.state === 'underway' && (
                <circle cx={NOW} cy={t.y} r="4.2" fill={c} opacity="0.85" />
              )}
              {t.state === 'complete' && (
                <line x1={xe} y1={t.y - 5} x2={xe} y2={t.y + 5} stroke={c} strokeWidth="2.4" opacity="0.8" />
              )}
              {t.state === 'dormant' && (
                <>
                  <circle cx={xe} cy={t.y} r="3.6" fill="none" stroke={c} strokeWidth="1.8" opacity="0.85" />
                  {}
                  <line x1={xe + 6} y1={t.y} x2={X1} y2={t.y} stroke={c} strokeWidth="1.2"
                    opacity="0.16" strokeDasharray="2 9" />
                </>
              )}
            </g>
          );
        })}

        {}
        <line x1={NOW} y1="14" x2={NOW} y2={Y1 + 34} stroke={NEON[7]} strokeWidth="2.2" opacity="0.5" />
        <line x1={NOW} y1="14" x2={NOW} y2={Y1 + 34} stroke={INK} strokeWidth="1" opacity="0.25" />

        {}
        <rect x="0" y="0" width={W} height={H} fill="url(#tcpProjWash)" />

        {}
        {(() => {
          const order = ['active', 'underway', 'complete', 'dormant'];
          const counts = { active: 34, underway: 6, complete: 10, dormant: 7 };
          const bx = 0, bw = W;
          let acc = 0;
          return order.map((k) => {
            const w = (counts[k] / N) * bw;
            const x = bx + acc; acc += w;
            return <rect key={k} x={x} y={H - 52} width={w - 2} height="10" fill={STATE[k]} opacity="0.5" />;
          });
        })()}

        {}
        <line x1="0" y1={H - 36} x2={W} y2={H - 36} stroke={INK} strokeWidth="1.4" opacity="0.28" />
      </svg>
    </div>
  );
}
