import { useEffect, useLayoutEffect, useRef } from 'react';
import './motion.css';

export const MOTION = {
  easeCss: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeName: 'quarticOut',
  t1: 250,
  t2: 300,
  t3: 400,
  t4: 500,
  stagger: 50,
  delay: 250,
  staggerCap: 11,
};

export const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const hasWindow = typeof window !== 'undefined';
const OFF_CLASS = 'cm-off';
const OFF_KEY = 'climate-motion';

let reducedMq = null;
function mq() {
  if (!hasWindow || !window.matchMedia) return null;
  if (!reducedMq) reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  return reducedMq;
}

export function prefersReduced() {
  const m = mq();
  return !!(m && m.matches);
}

export function motionEnabled() {
  if (!hasWindow) return false;
  if (prefersReduced()) return false;
  return !document.documentElement.classList.contains(OFF_CLASS);
}

export function setMotion(on) {
  if (!hasWindow) return;
  document.documentElement.classList.toggle(OFF_CLASS, !on);
  try { window.localStorage.setItem(OFF_KEY, on ? 'on' : 'off'); } catch (e) {  }
  if (!on) unarmAll();
}

function restoreSwitch() {
  try {
    if (window.localStorage.getItem(OFF_KEY) === 'off') {
      document.documentElement.classList.add(OFF_CLASS);
    }
  } catch (e) {  }
}

const armed = new Set();
const settings = new WeakMap();
const observers = new Map();
let sweeping = false;
let inited = false;

const ANIM_CLASS = {
  rise: 'cm-a-rise',
  fade: 'cm-a-fade',
  wipe: 'cm-a-wipe',
  rule: 'cm-a-rule',
  art: 'cm-a-art',
};

export function unarmAll() {
  armed.forEach((el) => {
    el.classList.remove('cm-armed');
    el.style.removeProperty('--cm-d');
  });
  armed.clear();
  stopSweep();
}

function fire(el) {
  if (!armed.has(el)) return;
  armed.delete(el);
  if (!armed.size) stopSweep();
  const s = settings.get(el) || {};
  el.classList.remove('cm-armed');
  el.classList.add('cm-in');
  const done = (e) => {
    if (e && e.target !== el) return;
    el.classList.remove('cm-in');
    if (s.anim && ANIM_CLASS[s.anim] && !s.keepClass) el.classList.remove(ANIM_CLASS[s.anim]);
    el.style.removeProperty('--cm-d');
    el.removeEventListener('animationend', done);
    el.removeEventListener('animationcancel', done);
  };
  el.addEventListener('animationend', done);
  el.addEventListener('animationcancel', done);
}

function getObserver(margin) {
  let io = observers.get(margin);
  if (io) return io;
  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      fire(entry.target);
      io.unobserve(entry.target);
    }
  }, { rootMargin: margin, threshold: 0 });
  observers.set(margin, io);
  return io;
}

let sweepQueued = false;
function sweep() {
  sweepQueued = false;
  if (!armed.size) return;
  const h = window.innerHeight || document.documentElement.clientHeight;
  [...armed].forEach((el) => {
    if (el.getBoundingClientRect().top < h) fire(el);
  });
}
function onScroll() {
  if (sweepQueued) return;
  sweepQueued = true;
  requestAnimationFrame(sweep);
}
function startSweep() {
  if (sweeping || !hasWindow) return;
  sweeping = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
function stopSweep() {
  if (!sweeping) return;
  sweeping = false;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
}

export function initMotion() {
  if (inited || !hasWindow) return;
  inited = true;
  restoreSwitch();

  const m = mq();
  if (m) {
    const onChange = () => { if (m.matches) unarmAll(); };
    if (m.addEventListener) m.addEventListener('change', onChange);
    else if (m.addListener) m.addListener(onChange);
  }

  window.addEventListener('beforeprint', unarmAll);
  window.addEventListener('pageshow', (e) => { if (e.persisted) sweep(); });
}

export function reveal(el, opts = {}) {
  if (!el || !hasWindow) return () => {};
  initMotion();
  if (!motionEnabled() || typeof IntersectionObserver !== 'function') return () => {};

  const anim = ANIM_CLASS[opts.anim] ? opts.anim : 'rise';
  const margin = opts.margin || '0px 0px -8% 0px';
  const rect = el.getBoundingClientRect();
  const h = window.innerHeight || document.documentElement.clientHeight;
  if (!(rect.height > 0 || rect.width > 0) || rect.top < h) return () => {};

  settings.set(el, { anim, keepClass: !!opts.keepClass });
  el.classList.add('cm-armed', ANIM_CLASS[anim]);
  if (opts.delay) el.style.setProperty('--cm-d', `${opts.delay}ms`);
  armed.add(el);
  startSweep();

  const io = getObserver(margin);
  io.observe(el);
  return () => {
    io.unobserve(el);
    if (armed.has(el)) {
      armed.delete(el);
      el.classList.remove('cm-armed');
      if (!armed.size) stopSweep();
    }
  };
}

export function revealAll(root, selector = '[data-cm]', opts = {}) {
  if (!root) return () => {};
  const nodes = [...root.querySelectorAll(selector)];
  const offs = nodes.map((el, i) => reveal(el, {
    anim: opts.anim || el.getAttribute('data-cm') || 'rise',
    delay: opts.stagger === false ? 0 : Math.min(i, MOTION.staggerCap) * MOTION.stagger,
    margin: opts.margin,
  }));
  return () => offs.forEach((f) => f());
}

export function useReveal(opts = {}) {
  const ref = useRef(null);
  const o = JSON.stringify(opts);
  useLayoutEffect(() => {
    const off = reveal(ref.current, JSON.parse(o));
    return off;
  }, [o]);
  return ref;
}

export function useStagger(opts = {}) {
  const ref = useRef(null);
  const o = JSON.stringify(opts);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !hasWindow) return undefined;
    const p = JSON.parse(o);
    initMotion();
    if (!motionEnabled()) return undefined;
    const kids = p.selector ? [...root.querySelectorAll(p.selector)] : [...root.children];
    const h = window.innerHeight || document.documentElement.clientHeight;
    if (root.getBoundingClientRect().top < h) return undefined;
    const offs = kids.map((el, i) => reveal(el, {
      anim: p.anim || 'rise',
      delay: Math.min(i, MOTION.staggerCap) * (p.stagger || MOTION.stagger),
      margin: p.margin || '0px 0px -4% 0px',
    }));
    return () => offs.forEach((f) => f());
  }, [o]);
  return ref;
}

export function useRevealAll(deps = [], opts = {}) {
  const ref = useRef(null);
  const o = JSON.stringify(opts);
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    initMotion();
    if (!motionEnabled()) return undefined;
    const p = JSON.parse(o);
    return revealAll(ref.current, p.selector || '[data-cm]', p);
  }, [o, ...deps]);
  return ref;
}

const NUM_RE = /^([^0-9+-]*)([+-]?[0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/s;

export function countTo(el, opts = {}) {
  const noop = () => {};
  if (!el || !hasWindow) return noop;
  if (el.childElementCount > 0) return noop;

  const final = el.textContent;
  const m = NUM_RE.exec(final || '');
  if (!m) return noop;
  const [, prefix, numStr, suffix] = m;
  const target = parseFloat(numStr.replace(/,/g, ''));
  if (!Number.isFinite(target)) return noop;

  if (!motionEnabled()) return noop;

  const decimals = (numStr.split('.')[1] || '').length;
  const grouped = numStr.includes(',');
  const abs = Math.abs(target);
  const intDigits = abs >= 1 ? Math.floor(Math.log10(abs)) + 1 : 1;
  const steps = intDigits + decimals;
  if (steps < 2) return noop;

  const fmt = (x) => (grouped
    ? x.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : x.toFixed(decimals));

  const sign = target < 0 ? -1 : 1;
  const floorMag = intDigits > 1 ? Math.pow(10, intDigits - 1) * sign : 0;
  const clampMag = (x) => (intDigits < 2 ? x : (sign > 0 ? Math.max(floorMag, x) : Math.min(floorMag, x)));

  const from = Number.isFinite(opts.from) ? opts.from : 0;
  const dur = opts.duration || MOTION.t4;
  const t0 = (window.performance || Date).now();
  let raf = 0;
  let live = true;

  const finish = () => { live = false; el.textContent = final; };

  const frame = () => {
    if (!live) return;
    const p = Math.min(1, ((window.performance || Date).now() - t0) / dur);
    if (p >= 1) { finish(); return; }
    const locked = Math.floor(p * steps);
    const e = intDigits - 1 - locked;
    const q = Math.pow(10, e);
    const v = from + (target - from) * easeOutQuart(p);
    el.textContent = prefix + fmt(clampMag(Math.round(v / q) * q)) + suffix;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => { if (raf) cancelAnimationFrame(raf); finish(); };
}

export function useCount(value, opts = {}) {
  const ref = useRef(null);
  const done = useRef(null);
  const o = JSON.stringify(opts);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasWindow) return undefined;
    initMotion();
    if (!motionEnabled()) return undefined;
    if (done.current === String(value)) return undefined;
    const p = JSON.parse(o);
    let cancel = noopFn;
    const start = () => { done.current = String(value); cancel = countTo(el, p); };
    if (typeof IntersectionObserver !== 'function') { start(); return () => cancel(); }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((x) => x.isIntersecting)) { io.disconnect(); start(); }
    }, { threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); cancel(); };
  }, [value, o]);
  return ref;
}
const noopFn = () => {};

export const RECORD_SPAN = 805744;

export function spanFraction(span) {
  const years = Array.isArray(span) ? Math.abs(span[1] - span[0]) : Math.abs(span || 0);
  if (!(years > 1)) return 0;
  const f = Math.log10(years) / Math.log10(RECORD_SPAN);
  return Math.max(0, Math.min(1, f));
}

export function useSpanRail(span, opts = {}) {
  const ref = useRef(null);
  const f = spanFraction(span);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.style.setProperty('--cm-span', String(f));
    el.classList.add('cm-spanrail');
    return reveal(el, { anim: 'rule', keepClass: true, margin: opts.margin });
  }, [f]);
  return ref;
}

export function echartsMotion(opts = {}) {
  const on = motionEnabled() && opts.first !== false;
  if (!on) return { animation: false };
  return {
    animation: true,
    animationDuration: MOTION.t4,
    animationEasing: MOTION.easeName,
    animationDelay: opts.stagger ? (i) => Math.min(i, MOTION.staggerCap) * MOTION.stagger : 0,
    animationDurationUpdate: 0,
    animationEasingUpdate: MOTION.easeName,
  };
}

export function pageProps(route) {
  return { key: route, className: 'cm-page' };
}

export function useScrollTopOnRoute(route) {
  useEffect(() => {
    if (!hasWindow) return;
    window.scrollTo(0, 0);
  }, [route]);
}

export function smoothAnchors(on = true) {
  if (!hasWindow) return;
  document.documentElement.classList.toggle('cm-smooth', !!on && motionEnabled());
}
