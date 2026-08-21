const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PRESENT = 1950;

export const kaBP = (y) => (PRESENT - y) / 1000;
export const MaBP = (y) => (PRESENT - y) / 1e6;
export const yearFromKaBP = (k) => PRESENT - k * 1000;
export const yearFromMaBP = (m) => PRESENT - m * 1e6;

const MA_EDGE = -1e6;

export function monthOf(y) {
  const frac = y - Math.floor(y);
  if (frac < 1e-6 || frac > 1 - 1e-6) return null;
  const m = Math.min(11, Math.max(0, Math.floor(frac * 12)));
  return MONTHS[m];
}

const commas = (n) => Math.round(Math.abs(n)).toLocaleString('en-US');

export function fmtYear(y, { month = false, ka = true } = {}) {
  if (!Number.isFinite(y)) return '';
  if (ka && y < MA_EDGE) {
    const m = MaBP(y);
    return `${m >= 100 ? Math.round(m) : m.toFixed(1)} Ma BP`;
  }
  if (ka && y < -10000) {
    const k = kaBP(y);
    return `${k >= 100 ? Math.round(k) : k.toFixed(1)} ka BP`;
  }
  if (y < 0) return `${commas(y)} BCE`;
  if (y < 1000) return `${Math.round(y)} CE`;
  const whole = Math.floor(y + 1e-9);
  const mo = month ? monthOf(y) : null;
  return mo ? `${whole} ${mo}` : String(whole);
}

export const fmtYearShort = (y) => {
  if (!Number.isFinite(y)) return '';
  if (y < MA_EDGE) {
    const m = MaBP(y);
    return `${m >= 100 ? Math.round(m) : m.toFixed(1)}Ma`;
  }
  if (y < -10000) {
    const k = kaBP(y);
    return `${k >= 100 ? Math.round(k) : k.toFixed(0)}ka`;
  }
  if (y < 0) return `${commas(y)}BC`;
  return String(Math.round(y));
};

export function fmtYearFull(y) {
  if (!Number.isFinite(y)) return '';
  if (y < MA_EDGE) {
    const m = MaBP(y);
    return `${m >= 100 ? Math.round(m).toLocaleString('en-US') : m.toFixed(2)} million years before present`;
  }
  if (y < -10000) {
    const k = kaBP(y);
    return `${k >= 100 ? Math.round(k).toLocaleString('en-US') : k.toFixed(1)} thousand years before present (${commas(y)} BCE)`;
  }
  if (y < 0) return `${commas(y)} BCE`;
  if (y < 1000) return `${Math.round(y)} CE`;
  const mo = monthOf(y);
  return mo ? `${Math.floor(y)} ${mo}` : String(Math.round(y));
}

export function spanOf(a, b) {
  const n = Math.abs(b - a);
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)} million years`;
  if (n >= 10000) return `${Math.round(n / 1000).toLocaleString('en-US')} thousand years`;
  return `${Math.round(n).toLocaleString('en-US')} years`;
}

export function niceTicks(min, max, target = 7) {
  const span = max - min;
  if (!(span > 0)) return [min];
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const out = [];
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) out.push(Number(t.toFixed(6)));
  return out;
}
