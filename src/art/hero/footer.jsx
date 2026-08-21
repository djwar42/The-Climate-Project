import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NEON } from '../../neon.js';

const PAPER = '#f4f0e4';
const STRIP = 52;
const WRAP_OUTER = 1288, WRAP_PAD = 24;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export const FOOTER_CHANNELS = [
  { code: 'TCP-00', name: 'HOME', color: NEON[6] },
  { code: 'TCP-01', name: 'THE STATE OF IT', color: NEON[8] },
  { code: 'TCP-02', name: 'THE PROJECTS', color: NEON[7] },
  { code: 'TCP-03', name: 'DEEP TIME', color: NEON[1] },
  { code: 'TCP-04', name: 'MODELS', color: NEON[0] },
  { code: 'TCP-05', name: 'METHODS', color: NEON[3] },
  { code: 'TCP-06', name: 'THE ORGANISATIONS', color: NEON[5] },
  { code: 'TCP-07', name: 'THE GAME', color: NEON[2] },
  { code: 'TCP-08', name: 'NEWS', color: NEON[4] },
];

export const NODE_FOR_PAGE = Object.fromEntries(FOOTER_CHANNELS.map((c, i) => [c.code, i]));

const resolveActive = (v) => {
  if (v == null) return -1;
  if (typeof v === 'string') return NODE_FOR_PAGE[v.toUpperCase()] ?? -1;
  return Number.isInteger(v) && v >= 0 && v < FOOTER_CHANNELS.length ? v : -1;
};

function useBandGeometry() {
  const ref = useRef(null);
  const [g, setG] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const parent = el.parentElement;
    if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const measure = () => {
      const vw = document.documentElement.clientWidth;
      const pr = parent ? parent.getBoundingClientRect() : { left: 0 };
      const h = Math.max(160, Math.round(parent ? parent.offsetHeight : el.offsetHeight));
      const left = Math.round(-pr.left);
      const outer = Math.min(WRAP_OUTER, vw);
      const wrapL = Math.round((vw - outer) / 2 + WRAP_PAD);
      setG((p) => (p && p.W === vw && p.H === h && p.left === left
        ? p : { W: vw, H: h, left, xL: wrapL, xR: vw - wrapL }));
    };
    measure();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    if (ro && parent) ro.observe(parent);
    window.addEventListener('resize', measure);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  return [ref, g];
}

function traceY(x, W, teeth) {
  const t = Math.min(1, Math.max(0, x / W));
  const base = 45 - t * 23;
  const ph = (t * teeth) % 1;
  const season = ph < 0.64 ? ph / 0.64 : 1 - (ph - 0.64) / 0.36;
  return base - season * 13;
}

export default function FooterInstrument({ active = -1, height = '100%', frozenPhase = null, style = {} }) {
  const [ref, g] = useBandGeometry();
  const ai = resolveActive(active);
  const chan = ai >= 0 ? FOOTER_CHANNELS[ai] : null;

  const traceRef = useRef(null);
  const headRef = useRef(null);
  const cursorRef = useRef(null);
  const sweepRef = useRef(null);
  const dialRef = useRef(null);

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  const W = g ? g.W : 1600;
  const H = g ? g.H : 348;
  const xL = g ? g.xL : 180;
  const xR = g ? g.xR : 1420;
  const gutL = xL, gutR = W - xR;

  const readoutW = Math.min(300, Math.max(150, W * 0.19));
  const traceX1 = Math.round(W - readoutW - 26);
  const teeth = Math.max(8, Math.round(traceX1 / 78));
  const nameSize = W < 620 ? 9 : 10;
  const tracePts = useMemo(() => {
    const out = [];
    for (let x = -12; x <= traceX1; x += 5) out.push(`${x} ${traceY(x, traceX1, teeth).toFixed(1)}`);
    return `M${out.join('L')}`;
  }, [traceX1, teeth]);

  const nodeX0 = Math.round(Math.max(26, gutL * 0.18 + 20));
  const nodeSpan = traceX1 - nodeX0 - 26;
  const nodes = FOOTER_CHANNELS.map((c, i) => {
    const x = nodeX0 + (nodeSpan * i) / (FOOTER_CHANNELS.length - 1);
    return { ...c, x, y: traceY(x, traceX1, teeth) };
  });

  const registers = useMemo(() => {
    const r = rng(4104);
    const out = [];
    let y = STRIP + 26, gap = Math.max(12, (H - STRIP - 60) / 12);
    while (y < H - 26 && gap > 3) {
      out.push({ y, h: Math.max(1.6, gap * 0.30), w: 0.3 + r() * 0.7, lit: r() > 0.8, o: 0.24 + r() * 0.4 });
      y += gap; gap *= 0.95;
    }
    return out;
  }, [H]);
  const regX0 = 14, regX1 = Math.max(200, xL + 74);
  const quiet = gutL > 120 ? 0.20 : 0.30;

  const dialR = Math.min(gutR / 2 - 14, H * 0.24);
  const dialOn = gutR > 96 && dialR > 26;
  const dialCx = Math.round(xR + gutR / 2), dialCy = Math.round(H * 0.60);
  const dialArcs = useMemo(() => {
    if (!dialOn) return [];
    const n = FOOTER_CHANNELS.length, r = dialR * 0.80, GAP = 0.10;
    const step = (Math.PI * 2) / n;
    return FOOTER_CHANNELS.map((c, i) => {
      const a0 = i * step - Math.PI / 2 + GAP / 2;
      const a1 = (i + 1) * step - Math.PI / 2 - GAP / 2;
      const p = (a) => `${(dialCx + Math.cos(a) * r).toFixed(1)} ${(dialCy + Math.sin(a) * r).toFixed(1)}`;
      return {
        color: c.color,
        d: `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`,
        tx0: dialCx + Math.cos(a0 - GAP / 2) * (r - 5), ty0: dialCy + Math.sin(a0 - GAP / 2) * (r - 5),
        tx1: dialCx + Math.cos(a0 - GAP / 2) * dialR, ty1: dialCy + Math.sin(a0 - GAP / 2) * dialR,
        mx: dialCx + Math.cos((a0 + a1) / 2) * (r - 4), my: dialCy + Math.sin((a0 + a1) / 2) * (r - 4),
      };
    });
  }, [dialOn, dialR, dialCx, dialCy]);

  useEffect(() => {
    const path = traceRef.current;
    if (!path || !g) return undefined;
    let L = 0;
    try { L = path.getTotalLength(); } catch { L = 0; }
    if (!L) return undefined;
    path.setAttribute('stroke-dasharray', `${L} ${L}`);

    const frame = (phase, sweepPhase, dialDeg) => {
      path.setAttribute('stroke-dashoffset', String(L * (1 - 2 * phase)));
      const headAt = L * ((2 * phase) % 1);
      let p = null;
      try { p = path.getPointAtLength(headAt); } catch { p = null; }
      if (p) {
        if (headRef.current) headRef.current.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        if (cursorRef.current) {
          cursorRef.current.setAttribute('x1', p.x.toFixed(1));
          cursorRef.current.setAttribute('x2', p.x.toFixed(1));
        }
      }
      if (sweepRef.current) {
        sweepRef.current.setAttribute('transform', `translate(0 ${(-H * 0.3 + sweepPhase * (H * 1.6)).toFixed(1)})`);
      }
      if (dialRef.current) dialRef.current.setAttribute('transform', `rotate(${dialDeg.toFixed(1)} ${dialCx} ${dialCy})`);
    };

    if (reduced || frozenPhase != null) {
      const ph = frozenPhase == null ? 0.36 : frozenPhase;
      frame(ph, frozenPhase == null ? 0.34 : (ph * 2) % 1, frozenPhase == null ? 214 : ph * 720 % 360);
      return undefined;
    }

    let raf = 0, t0 = 0, visible = true;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const t = (ts - t0) / 1000;
      frame((t / 34) % 1, (t / 15) % 1, (t / 48) * 360 % 360);
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && visible && !document.hidden) { t0 = 0; raf = requestAnimationFrame(tick); } };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    const io = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); if (visible) start(); else stop(); }, { rootMargin: '120px' })
      : null;
    if (io && ref.current) io.observe(ref.current); else visible = true;
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    frame(0.0, 0.0, 0);
    start();
    return () => { stop(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, [g, reduced, frozenPhase, tracePts, H, dialCx, dialCy, ref]);

  const mono = "'IBM Plex Mono', monospace";
  const uid = 'tcpfoot';

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: g ? g.left : 0, width: g ? g.W : '100%',
        height, overflow: 'hidden', pointerEvents: 'none', ...style,
      }}
    >
      <style>{`
        @keyframes ${uid}-breathe { 0%,100% { opacity: .30 } 50% { opacity: .95 } }
        @keyframes ${uid}-ring    { 0% { r: 7; opacity: .95 } 100% { r: 21; opacity: 0 } }
        @keyframes ${uid}-blink   { 0%,45% { opacity: 1 } 55%,100% { opacity: .25 } }
        .${uid}-reg  { animation: ${uid}-breathe 7s ease-in-out infinite }
        .${uid}-ring { animation: ${uid}-ring 2.4s ease-out infinite }
        .${uid}-cur  { animation: ${uid}-blink 1.1s steps(1,end) infinite }
        @media (prefers-reduced-motion: reduce) {
          .${uid}-reg, .${uid}-ring, .${uid}-cur { animation: none }
          .${uid}-ring { opacity: .5 }
        }
      `}</style>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none"
        style={{ display: 'block' }}>
        <defs>
          {}
          <pattern id={`${uid}-scan`} width="6" height="5" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="6" height="1" fill={PAPER} opacity="0.035" />
          </pattern>
          {}
          <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={NEON[1]} stopOpacity="0" />
            <stop offset="0.5" stopColor={NEON[1]} stopOpacity="0.10" />
            <stop offset="1" stopColor={NEON[1]} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={NEON[3]} stopOpacity="0.15" />
            <stop offset="1" stopColor={NEON[3]} stopOpacity="0" />
          </radialGradient>
          {}
          <mask id={`${uid}-hot`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect x="0" y="0" width={W} height={H} fill="#fff" fillOpacity={quiet} />
            <rect x="0" y="0" width={W} height={STRIP} fill="#fff" />
            <rect x="0" y={STRIP} width={Math.max(0, xL - 16)} height={H - STRIP} fill="#fff" />
            <rect x={xR + 16} y={STRIP} width={Math.max(0, W - xR - 16)} height={H - STRIP} fill="#fff" />
          </mask>
        </defs>

        {}
        <ellipse cx={W * 0.80} cy={H * 0.86} rx={W * 0.42} ry={H * 0.62} fill={`url(#${uid}-glow)`} />
        <rect x="0" y="0" width={W} height={H} fill={`url(#${uid}-scan)`} />

        {}
        <g opacity="0.5">
          <line x1={xL - 18} y1={STRIP + 4} x2={xR + 18} y2={STRIP + 4} stroke={PAPER} strokeWidth="1" opacity="0.28" />
          {[[xL - 18, 1], [xR + 18, -1]].map(([x, dir], i) => (
            <path key={`br${i}`} d={`M${x + dir * 26} ${STRIP + 4} L${x} ${STRIP + 4} L${x} ${STRIP + 30}`}
              fill="none" stroke={NEON[1]} strokeWidth="1.6" />
          ))}
          {[[xL - 18, 1], [xR + 18, -1]].map(([x, dir], i) => (
            <path key={`bb${i}`} d={`M${x + dir * 26} ${H - 4} L${x} ${H - 4} L${x} ${H - 30}`}
              fill="none" stroke={NEON[1]} strokeWidth="1.6" opacity="0.8" />
          ))}
        </g>
        {}
        {Array.from({ length: Math.floor((xR - xL) / 78) + 1 }, (_, i) => (
          <line key={`pr${i}`} x1={xL + i * 78} y1={STRIP + 10} x2={xL + i * 78} y2={H}
            stroke={PAPER} strokeWidth="1" opacity="0.03" />
        ))}

        {}
        <g mask={`url(#${uid}-hot)`}>
          {}
          {registers.map((b, i) => (
            <rect key={`rg${i}`} className={b.lit ? `${uid}-reg` : undefined}
              style={b.lit ? { animationDelay: `${(i % 7) * 0.9}s` } : undefined}
              x={regX0} y={b.y} width={(regX1 - regX0) * b.w} height={b.h}
              fill={b.lit ? NEON[4] : NEON[5]} opacity={b.lit ? 0.9 : b.o * 0.75} />
          ))}
          <line x1={regX0 - 6} y1={STRIP + 18} x2={regX0 - 6} y2={H - 16} stroke={NEON[5]} strokeWidth="1.4" opacity="0.65" />

          {}
          {dialOn && (
            <g>
              {}
              <circle cx={dialCx} cy={dialCy} r={dialR} fill="none" stroke={PAPER} strokeWidth="1" opacity="0.18" />
              {}
              {dialArcs.map((a, i) => (
                <line key={`dt${i}`} x1={a.tx0} y1={a.ty0} x2={a.tx1} y2={a.ty1}
                  stroke={PAPER} strokeWidth="1" opacity={i === ai ? 0.55 : 0.28} />
              ))}
              {}
              <g ref={dialRef}>
                <path d={`M${dialCx} ${dialCy}L${dialCx + dialR} ${dialCy}A${dialR} ${dialR} 0 0 0 ${(dialCx + Math.cos(-0.46) * dialR).toFixed(1)} ${(dialCy + Math.sin(-0.46) * dialR).toFixed(1)}Z`}
                  fill={NEON[8]} opacity="0.16" />
                <line x1={dialCx} y1={dialCy} x2={dialCx + dialR} y2={dialCy} stroke={NEON[8]} strokeWidth="1.2" opacity="0.55" />
              </g>
              {}
              {dialArcs.map((a, i) => (
                <path key={`da${i}`} d={a.d} fill="none" stroke={a.color}
                  strokeWidth={i === ai ? 4.2 : 2.2} opacity={ai < 0 ? 0.72 : i === ai ? 1 : 0.30} />
              ))}
              {ai >= 0 && dialArcs[ai] && (
                <line x1={dialCx} y1={dialCy} x2={dialArcs[ai].mx} y2={dialArcs[ai].my}
                  stroke={dialArcs[ai].color} strokeWidth="1.4" opacity="0.85" />
              )}
              <circle cx={dialCx} cy={dialCy} r="3" fill={PAPER} opacity="0.85" />
            </g>
          )}

          {}
          {chan && (
            <g>
              <line x1={nodes[ai].x} y1={nodes[ai].y} x2={nodes[ai].x} y2={H}
                stroke={chan.color} strokeWidth="1.4" opacity="0.9" />
              <rect x={nodes[ai].x - 13} y={STRIP + 6} width="26" height={H - STRIP - 6}
                fill={chan.color} opacity="0.10" />
              <path d={`M${nodes[ai].x - 7} ${H - 12} L${nodes[ai].x} ${H - 4} L${nodes[ai].x + 7} ${H - 12}`}
                fill="none" stroke={chan.color} strokeWidth="1.6" />
            </g>
          )}
        </g>

        {}
        <g ref={sweepRef}>
          <rect x="0" y="0" width={W} height={Math.max(70, H * 0.30)} fill={`url(#${uid}-sweep)`} />
        </g>

        {}

        {}
        {Array.from({ length: Math.floor(W / 78) + 1 }, (_, i) => i)
          .filter((i) => i >= 1 && i * 78 + 44 < W - 44)
          .map((i) => (
          <text key={`lg${i}`} x={i * 78 + 44} y="8"
            fill={i % 4 === 0 ? NEON[0] : NEON[1]} fillOpacity={i % 4 === 0 ? 0.8 : 0.48}
            style={{ font: `${i % 4 === 0 ? 700 : 400} 7px ${mono}`, letterSpacing: '0.2em' }}>
            {i % 4 === 0 ? '//' : (i % 2 === 0 ? '\u00a6' : '\u00b7')}
          </text>
        ))}

        {}
        <line x1="0" y1="11.5" x2={W} y2="11.5" stroke={PAPER} strokeWidth="1" opacity="0.22" />
        {Array.from({ length: Math.ceil(W / 13) + 1 }, (_, i) => (
          <line key={`tk${i}`} x1={i * 13} y1="11.5" x2={i * 13} y2={11.5 + (i % 5 === 0 ? 7 : 3.5)}
            stroke={NEON[1]} strokeWidth="1" opacity={i % 5 === 0 ? 0.5 : 0.26} />
        ))}

        {}
        <path d={tracePts} fill="none" stroke={PAPER} strokeWidth="1" opacity="0.16" strokeLinejoin="round" />
        <path ref={traceRef} d={tracePts} fill="none" stroke={NEON[4]} strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" opacity="0.95" />

        {}
        {nodes.map((n, i) => {
          const on = i === ai;
          return (
            <g key={n.code}>
              <rect x={n.x - (on ? 5.5 : 3.4)} y={n.y - (on ? 5.5 : 3.4)}
                width={on ? 11 : 6.8} height={on ? 11 : 6.8}
                fill={on ? n.color : '#2a2722'} stroke={n.color}
                strokeWidth={on ? 1.6 : 1.4} opacity={on ? 1 : 0.8} />
              {on && <circle className={`${uid}-ring`} cx={n.x} cy={n.y} r="7" fill="none" stroke={n.color} strokeWidth="1.4" />}
            </g>
          );
        })}

        {}
        <line ref={cursorRef} className={`${uid}-cur`} x1="-20" y1="6" x2="-20" y2={STRIP - 2}
          stroke={NEON[4]} strokeWidth="1" opacity="0.55" />
        <g ref={headRef} transform="translate(-20 30)">
          <rect x="-3.5" y="-3.5" width="7" height="7" fill={NEON[4]} />
          <rect x="-7" y="-7" width="14" height="14" fill="none" stroke={NEON[4]} strokeWidth="1" opacity="0.6" />
        </g>

        {}
        <g>
          <line x1={traceX1 + 8} y1="14" x2={traceX1 + 8} y2={STRIP - 6} stroke={PAPER} strokeWidth="1" opacity="0.25" />
          {}
          <text x={traceX1 + 20} y="26" fill={NEON[0]} fillOpacity="0.9"
            style={{ font: `700 ${nameSize + 1}px ${mono}`, letterSpacing: '0.04em' }}>//</text>
          <text x={traceX1 + 20 + (nameSize + 1) * 2.1} y="26" fill={chan ? chan.color : PAPER} fillOpacity={chan ? 1 : 0.75}
            style={{ font: `700 ${nameSize + 1}px ${mono}`, letterSpacing: '0.14em' }}>
            {chan ? `[ ${chan.code} ]` : '[ INDEX ]'}
          </text>
          <text x={traceX1 + 20} y="42" fill={PAPER} fillOpacity={chan ? 0.95 : 0.6}
            style={{ font: `400 ${nameSize}px ${mono}`, letterSpacing: '0.12em' }}>
            {chan ? chan.name : '9 PAGES'}
            <tspan fill={chan ? chan.color : NEON[1]} fillOpacity="0.9">{' \u00bb '}</tspan>
            {chan ? `${ai + 1}/9` : 'TCP-00/08'}
          </text>
          {}
          <rect x={traceX1 + 20} y="46" width={Math.max(40, readoutW - 46)} height="3" fill={PAPER} opacity="0.16" />
          <rect x={traceX1 + 20} y="46" width={Math.max(40, readoutW - 46) * (chan ? (ai + 1) / 9 : 1)} height="3"
            fill={chan ? chan.color : NEON[1]} opacity={chan ? 1 : 0.35} />
        </g>

        {}
        {[[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].map(([x, y, dx, dy], i) => (
          <g key={`cb${i}`}>
            <path d={`M${x + dx * 40} ${y + dy * 1} L${x + dx * 1} ${y + dy * 1} L${x + dx * 1} ${y + dy * 26}`}
              fill="none" stroke={NEON[0]} strokeWidth="2" opacity="0.9" />
            <text x={x + dx * 14} y={y + dy * 20} textAnchor="middle" fill={NEON[0]} fillOpacity="0.55"
              style={{ font: `400 9px ${mono}` }}>+</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
