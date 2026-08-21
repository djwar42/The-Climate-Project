export const years = (s) => s.map((p) => p[0]);
export const vals = (s) => s.map((p) => p[1]);
export const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
export const median = (a) => {
  if (!a.length) return NaN;
  const b = [...a].sort((x, y) => x - y);
  const m = b.length >> 1;
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
export const stdev = (a) => {
  if (a.length < 2) return NaN;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
};

export function olsSlope(xs, ys) {
  const n = xs.length;
  if (n < 2) return { slope: NaN, intercept: NaN, r2: NaN };
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  const slope = sxx ? sxy / sxx : NaN;
  return { slope, intercept: my - slope * mx, r2: sxx && syy ? (sxy * sxy) / (sxx * syy) : NaN };
}

function normSf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? p : 1 - p;
}

export function linearTrend(s) {
  const { slope, intercept, r2 } = olsSlope(years(s), vals(s));
  return {
    lines: { FIT: s.map(([y]) => [y, intercept + slope * y]) },
    stats: { slopePerYear: slope, slopePerDecade: slope * 10, r2, intercept },
  };
}

export function decadalRate(s, { window = 30 } = {}) {
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const from = s[i][0] - window;
    const seg = s.filter(([y]) => y >= from && y <= s[i][0]);
    if (seg.length < 5) continue;
    const { slope } = olsSlope(years(seg), vals(seg));
    out.push([s[i][0], slope * 10]);
  }
  return { lines: { RATE_PER_DECADE: out } };
}

export function theilSen(s, { maxPairs = 200000 } = {}) {
  const xs = years(s), ys = vals(s), n = s.length;
  const slopes = [];
  const stride = Math.max(1, Math.ceil(Math.sqrt((n * (n - 1)) / 2 / maxPairs)));
  for (let i = 0; i < n; i += stride) {
    for (let j = i + 1; j < n; j += stride) {
      const dx = xs[j] - xs[i];
      if (dx !== 0) slopes.push((ys[j] - ys[i]) / dx);
    }
  }
  const slope = median(slopes);
  const intercept = median(ys.map((y, i) => y - slope * xs[i]));
  return {
    lines: { SEN_FIT: s.map(([y]) => [y, intercept + slope * y]) },
    stats: { slopePerYear: slope, slopePerDecade: slope * 10, pairsUsed: slopes.length },
  };
}

export function mannKendall(s) {
  const y = vals(s), n = y.length;
  let S = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) S += Math.sign(y[j] - y[i]);
  }
  const counts = new Map();
  for (const v of y) counts.set(v, (counts.get(v) || 0) + 1);
  let tieTerm = 0;
  for (const t of counts.values()) if (t > 1) tieTerm += t * (t - 1) * (2 * t + 5);
  const varS = (n * (n - 1) * (2 * n + 5) - tieTerm) / 18;
  const z = S > 0 ? (S - 1) / Math.sqrt(varS) : S < 0 ? (S + 1) / Math.sqrt(varS) : 0;
  const p = 2 * normSf(Math.abs(z));
  const tau = S / (0.5 * n * (n - 1));
  return { lines: {}, stats: { S, z, p, tau, n, approximate: n < 10 } };
}

export function runningMean(s, { window = 11 } = {}) {
  const half = Math.floor(window / 2), out = [];
  for (let i = 0; i < s.length; i++) {
    const a = Math.max(0, i - half), b = Math.min(s.length - 1, i + half);
    if (b - a + 1 < Math.min(window, 3)) continue;
    out.push([s[i][0], mean(vals(s.slice(a, b + 1)))]);
  }
  return { lines: { [`MEAN_${window}`]: out } };
}

export function gaussianFilter(s, { sigma = 5 } = {}) {
  const xs = years(s), ys = vals(s), out = [];
  const reach = sigma * 3;
  for (let i = 0; i < s.length; i++) {
    let num = 0, den = 0;
    for (let j = 0; j < s.length; j++) {
      const d = xs[j] - xs[i];
      if (Math.abs(d) > reach) continue;
      const w = Math.exp((-d * d) / (2 * sigma * sigma));
      num += w * ys[j]; den += w;
    }
    if (den > 0) out.push([xs[i], num / den]);
  }
  return { lines: { [`GAUSS_${sigma}`]: out } };
}

export function loess(s, { span = 0.25 } = {}) {
  const xs = years(s), ys = vals(s), n = s.length;
  const k = Math.max(3, Math.floor(span * n));
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = xs.map((x) => Math.abs(x - xs[i]));
    const cut = [...d].sort((a, b) => a - b)[Math.min(k, n - 1)] || 1;
    let sw = 0, swx = 0, swy = 0, swxx = 0, swxy = 0;
    for (let j = 0; j < n; j++) {
      const u = d[j] / cut;
      if (u >= 1) continue;
      const w = (1 - u ** 3) ** 3;
      sw += w; swx += w * xs[j]; swy += w * ys[j];
      swxx += w * xs[j] * xs[j]; swxy += w * xs[j] * ys[j];
    }
    const den = sw * swxx - swx * swx;
    if (!den) continue;
    const b = (sw * swxy - swx * swy) / den;
    const a = (swy - b * swx) / sw;
    out.push([xs[i], a + b * xs[i]]);
  }
  return { lines: { LOESS: out } };
}

export function anomaly(s, { from = 1951, to = 1980 } = {}) {
  const base = s.filter(([y]) => y >= from && y <= to);
  const m = base.length ? mean(vals(base)) : mean(vals(s));
  return {
    lines: { ANOMALY: s.map(([y, v]) => [y, v - m]) },
    stats: { baselineMean: m, baselineFrom: from, baselineTo: to, baselineN: base.length },
  };
}

export function standardise(s, { from = 1951, to = 1980 } = {}) {
  const base = s.filter(([y]) => y >= from && y <= to);
  const use = base.length > 2 ? base : s;
  const m = mean(vals(use)), sd = stdev(vals(use));
  return {
    lines: { Z: s.map(([y, v]) => [y, sd ? (v - m) / sd : 0]) },
    stats: { baselineMean: m, baselineStdev: sd },
  };
}

export function deseasonalise(s) {
  const byMonth = new Map();
  for (const [y, v] of s) {
    const m = Math.floor((y - Math.floor(y)) * 12 + 1e-9);
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m).push(v);
  }
  const grand = mean(vals(s));
  const adj = new Map([...byMonth.entries()].map(([m, a]) => [m, mean(a) - grand]));
  return {
    lines: {
      DESEASONALISED: s.map(([y, v]) => {
        const m = Math.floor((y - Math.floor(y)) * 12 + 1e-9);
        return [y, v - (adj.get(m) || 0)];
      }),
    },
    stats: { monthsFound: byMonth.size },
  };
}

export function cumulativeSum(s) {
  const m = mean(vals(s));
  let acc = 0;
  return { lines: { CUSUM: s.map(([y, v]) => { acc += v - m; return [y, acc]; }) }, stats: { mean: m } };
}

export function rollingStdev(s, { window = 31 } = {}) {
  const half = Math.floor(window / 2), out = [];
  for (let i = half; i < s.length - half; i++) {
    out.push([s[i][0], stdev(vals(s.slice(i - half, i + half + 1)))]);
  }
  return { lines: { [`SD_${window}`]: out } };
}

export function rollingRange(s, { window = 31 } = {}) {
  const half = Math.floor(window / 2), lo = [], hi = [];
  for (let i = half; i < s.length - half; i++) {
    const w = vals(s.slice(i - half, i + half + 1));
    lo.push([s[i][0], Math.min(...w)]); hi.push([s[i][0], Math.max(...w)]);
  }
  return { lines: { MIN: lo, MAX: hi } };
}

export function exceedanceCount(s, { threshold = 1.0, window = 31 } = {}) {
  const half = Math.floor(window / 2), out = [];
  for (let i = half; i < s.length - half; i++) {
    const w = vals(s.slice(i - half, i + half + 1));
    out.push([s[i][0], w.filter((v) => v >= threshold).length]);
  }
  return { lines: { [`OVER_${threshold}`]: out } };
}

export function recordRun(s) {
  let hi = -Infinity, lo = Infinity;
  const highs = [], lows = [];
  for (const [y, v] of s) {
    if (v > hi) { hi = v; highs.push([y, v]); }
    if (v < lo) { lo = v; lows.push([y, v]); }
  }
  return { lines: { RECORD_HIGHS: highs, RECORD_LOWS: lows }, stats: { highs: highs.length, lows: lows.length } };
}

export function rateOfChange(s, { step = 1 } = {}) {
  const out = [];
  for (let i = step; i < s.length; i++) {
    const dy = s[i][0] - s[i - step][0];
    if (dy > 0) out.push([s[i][0], (s[i][1] - s[i - step][1]) / dy]);
  }
  return { lines: { RATE: out } };
}

export function acceleration(s) {
  const xs = years(s), ys = vals(s), n = xs.length;
  if (n < 3) return { lines: {}, stats: {} };
  const x0 = mean(xs);
  let S = [0, 0, 0, 0, 0], T = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const x = xs[i] - x0;
    S[0] += 1; S[1] += x; S[2] += x * x; S[3] += x ** 3; S[4] += x ** 4;
    T[0] += ys[i]; T[1] += x * ys[i]; T[2] += x * x * ys[i];
  }
  const A = [[S[0], S[1], S[2]], [S[1], S[2], S[3]], [S[2], S[3], S[4]]];
  const b = [...T];
  for (let c = 0; c < 3; c++) {
    let piv = c;
    for (let r = c + 1; r < 3; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]]; [b[c], b[piv]] = [b[piv], b[c]];
    if (!A[c][c]) return { lines: {}, stats: {} };
    for (let r = c + 1; r < 3; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 3; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const co = [0, 0, 0];
  for (let r = 2; r >= 0; r--) {
    let v = b[r];
    for (let k = r + 1; k < 3; k++) v -= A[r][k] * co[k];
    co[r] = v / A[r][r];
  }
  return {
    lines: { QUAD_FIT: xs.map((x) => [x, co[0] + co[1] * (x - x0) + co[2] * (x - x0) ** 2]) },
    stats: { curvature: co[2], curvaturePerCenturySq: co[2] * 10000, linearAtCentre: co[1] },
  };
}

export function pettittBreak(s) {
  const y = vals(s), n = y.length;
  let best = { k: -1, U: 0 };
  const Us = [];
  for (let k = 1; k < n; k++) {
    let U = 0;
    for (let i = 0; i < k; i++) for (let j = k; j < n; j++) U += Math.sign(y[j] - y[i]);
    Us.push([s[k][0], U]);
    if (Math.abs(U) > Math.abs(best.U)) best = { k, U };
  }
  const K = Math.abs(best.U);
  const p = 2 * Math.exp((-6 * K * K) / (n ** 3 + n ** 2));
  return {
    lines: { U_STATISTIC: Us },
    stats: { breakYear: best.k >= 0 ? s[best.k][0] : null, K, p: Math.min(1, p), n },
  };
}

export function cusum(s, { from = null, to = null } = {}) {
  const ref = s.filter(([y]) => (from == null || y >= from) && (to == null || y <= to));
  const m = mean(vals(ref.length ? ref : s));
  const sd = stdev(vals(ref.length ? ref : s)) || 1;
  let acc = 0;
  return {
    lines: { CUSUM_Z: s.map(([y, v]) => { acc += (v - m) / sd; return [y, acc]; }) },
    stats: { referenceMean: m, referenceStdev: sd },
  };
}

export function autocorrelation(s, { maxLag = 40 } = {}) {
  const y = vals(s), n = y.length, m = mean(y);
  const d = y.map((v) => v - m);
  const c0 = d.reduce((a, v) => a + v * v, 0);
  const out = [];
  for (let k = 0; k <= Math.min(maxLag, n - 2); k++) {
    let c = 0;
    for (let i = 0; i < n - k; i++) c += d[i] * d[i + k];
    out.push([k, c0 ? c / c0 : 0]);
  }
  return { lines: { ACF: out }, stats: { lag1: out[1] ? out[1][1] : NaN } };
}

export function lagCorrelation(s, { other = null, maxLag = 20 } = {}) {
  if (!other || !other.length) return { lines: {}, stats: { note: 'needs a second series' } };
  const A = new Map(s.map(([y, v]) => [Math.round(y), v]));
  const B = new Map(other.map(([y, v]) => [Math.round(y), v]));
  const out = [];
  let best = { lag: 0, r: 0 };
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    const xs = [], ys = [];
    for (const [y, v] of A) {
      const w = B.get(y - lag);
      if (w != null) { xs.push(v); ys.push(w); }
    }
    if (xs.length < 5) continue;
    const mx = mean(xs), my = mean(ys);
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < xs.length; i++) {
      const dx = xs[i] - mx, dy = ys[i] - my;
      sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
    }
    const r = sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
    out.push([lag, r]);
    if (Math.abs(r) > Math.abs(best.r)) best = { lag, r };
  }
  return { lines: { CROSS_CORR: out }, stats: { bestLag: best.lag, bestR: best.r } };
}

export function periodogram(s, { minPeriod = 2, maxPeriod = 200 } = {}) {
  const xs = years(s), ys = vals(s), m = mean(ys);
  const d = ys.map((v) => v - m);
  const out = [];
  let best = { period: null, power: 0 };
  for (let P = minPeriod; P <= maxPeriod; P *= 1.03) {
    const w = (2 * Math.PI) / P;
    let re = 0, im = 0;
    for (let i = 0; i < xs.length; i++) { re += d[i] * Math.cos(w * xs[i]); im += d[i] * Math.sin(w * xs[i]); }
    const power = (re * re + im * im) / xs.length;
    out.push([P, power]);
    if (power > best.power) best = { period: P, power };
  }
  return { lines: { POWER: out }, stats: { peakPeriod: best.period, peakPower: best.power } };
}

const M = (id, category, name, desc, math, fn, params = {}, needs = 'any', note = null) =>
  ({ id, category, name, desc, math, compute: fn, params, needs, note });

export const METHODS = [
  M('trend_ols', 'TREND', 'Linear trend (OLS)',
    'Least squares straight line through the series, reported as units per decade.',
    'slope = sum((x-xbar)(y-ybar)) / sum((x-xbar)^2)', linearTrend, {},
    'any', 'The workhorse. Sensitive to the endpoints you choose - always state the window.'),
  M('trend_decadal', 'TREND', 'Running decadal rate',
    'The trend over a trailing window, stepped along the series, in units per decade.',
    'OLS slope over [t-w, t], times 10', decadalRate, { window: 30 },
    'any', 'Shows when the rate itself changed. A 30-year window is the WMO climate-normal length.'),
  M('trend_theilsen', 'TREND', 'Theil-Sen slope',
    'Median of all pairwise slopes - a trend that outliers cannot drag.',
    'slope = median over i<j of (y_j - y_i)/(x_j - x_i)', theilSen, {},
    'any', 'Compare against OLS: where they disagree, an outlier is doing the work.'),
  M('trend_mannkendall', 'TREND', 'Mann-Kendall test',
    'Non-parametric test of whether a monotonic trend exists at all, with tau and p.',
    'S = sum sign(y_j - y_i) for i<j; z from the tie-corrected variance', mannKendall, {},
    'any', 'Does NOT correct for autocorrelation, which climate series have - read p as optimistic.'),
  M('trend_running', 'TREND', 'Running mean',
    'The centred moving average, the simplest smoother there is.',
    'centred mean over a window of n points', runningMean, { window: 11 },
    'even', 'On irregular palaeo sampling this weights densely-sampled stretches - prefer the Gaussian filter there.'),
  M('trend_gauss', 'TREND', 'Gaussian filter',
    'Smoothing by a Gaussian kernel in TIME, so irregular sampling is handled correctly.',
    'y_hat(t) = sum w_i y_i / sum w_i, w = exp(-d^2 / 2 sigma^2)', gaussianFilter, { sigma: 5 },
    'any', 'The right smoother for ice cores: weights by year distance, not by index.'),
  M('trend_loess', 'TREND', 'LOESS',
    'Local linear regression with tricube weights - the smoother on most published figures.',
    'weighted least squares in a moving neighbourhood of span fraction', loess, { span: 0.25 },
    'any', null),

  M('anom_baseline', 'ANOMALY', 'Anomaly against a baseline',
    'Subtract the mean of a stated reference period. This is what "anomaly" means.',
    'a(t) = v(t) - mean(v over [from, to])', anomaly, { from: 1951, to: 1980 },
    'any', 'The baseline is a choice, not a fact - GISTEMP uses 1951-1980, HadCRUT 1961-1990, WMO 1850-1900.'),
  M('anom_z', 'ANOMALY', 'Standardised anomaly',
    'The anomaly divided by the baseline standard deviation - how unusual, in sigmas.',
    'z(t) = (v(t) - mu) / sigma', standardise, { from: 1951, to: 1980 }, 'any', null),
  M('anom_deseason', 'ANOMALY', 'Remove the seasonal cycle',
    'Strip the mean annual cycle from a monthly series, leaving the interannual signal.',
    'v(t) - (monthly mean - grand mean)', deseasonalise, {}, 'monthly',
    'Only meaningful on sub-annual data - the Mauna Loa sawtooth is what this removes.'),
  M('anom_cumsum', 'ANOMALY', 'Cumulative departure',
    'Running total of departures from the mean - a slope change here is a regime change.',
    'C(t) = sum (v_i - vbar) for i <= t', cumulativeSum, {}, 'any', null),

  M('var_stdev', 'VARIABILITY', 'Rolling standard deviation',
    'How much the series wobbles, as a function of when.',
    'sample sd over a centred window', rollingStdev, { window: 31 }, 'even', null),
  M('var_range', 'VARIABILITY', 'Rolling range',
    'The min and the max in a moving window - the envelope of the record.',
    'min and max over a centred window', rollingRange, { window: 31 }, 'even', null),
  M('var_exceed', 'VARIABILITY', 'Threshold exceedance count',
    'How many points in a moving window sit at or above a threshold.',
    'count(v >= T) over a centred window', exceedanceCount, { threshold: 1.0, window: 31 },
    'even', 'The simplest extremes diagnostic: not how hot on average, but how often over the line.'),
  M('var_records', 'VARIABILITY', 'Record highs and lows',
    'Every point that set a new record when it arrived.',
    'running max and running min', recordRun, {}, 'any',
    'In a stationary series records get rarer as 1/n. If they are not thinning out, the series is not stationary.'),

  M('chg_rate', 'CHANGE', 'Rate of change',
    'First difference divided by the time gap - the local slope, unsmoothed.',
    '(v_t - v_{t-k}) / (x_t - x_{t-k})', rateOfChange, { step: 1 }, 'any', null),
  M('chg_accel', 'CHANGE', 'Acceleration (quadratic fit)',
    'Fits a parabola and reports the curvature - is the rise itself speeding up.',
    'least squares fit of a + b(x-x0) + c(x-x0)^2; the answer is c', acceleration, {},
    'any', 'The sea level literature reports exactly this coefficient.'),
  M('chg_pettitt', 'CHANGE', 'Pettitt change point',
    'Finds the single most likely break in the series, rank-based, with an approximate p.',
    'U_{k} = sum sign differences across the split; take the largest |U|', pettittBreak, {},
    'any', 'Assumes AT MOST ONE break. It will always return a year - the p-value is what tells you whether to believe it.'),
  M('chg_cusum', 'CHANGE', 'CUSUM against a reference period',
    'Cumulative standardised departure from a chosen reference window.',
    'sum (v - mu_ref)/sigma_ref', cusum, { from: 1961, to: 1990 }, 'any', null),

  M('rel_acf', 'RELATION', 'Autocorrelation function',
    'How much each value tells you about the next, at every lag.',
    'r_k = sum d_i d_{i+k} / sum d_i^2', autocorrelation, { maxLag: 40 },
    'even', 'High lag-1 autocorrelation is why naive trend significance tests overstate their case.'),
  M('rel_lagcorr', 'RELATION', 'Lagged cross-correlation',
    'Correlation with a second series at every lead and lag - which one moves first.',
    'Pearson r on the overlap, for each integer lag', lagCorrelation, { maxLag: 20 },
    'pair', 'Pick the second series on the page. Correlation at a lag is not causation at a lag.'),
  M('rel_periodogram', 'RELATION', 'Periodogram',
    'Power against period, scanned directly - finds cycles without needing even sampling.',
    'P(f) = |sum d_i e^{-i w x_i}|^2 / n, scanned over periods', periodogram,
    { minPeriod: 2, maxPeriod: 200 }, 'any',
    'A direct scan rather than an FFT, so it works on the irregularly sampled palaeo series.'),
];

export const BY_CATEGORY = METHODS.reduce((m, x) => {
  if (!m.has(x.category)) m.set(x.category, []);
  m.get(x.category).push(x);
  return m;
}, new Map());
export const CATEGORIES = [...BY_CATEGORY.keys()];

export function runMethod(m, series, params) {
  const r = m.compute(series, { ...m.params, ...(params || {}) });
  if (Array.isArray(r)) return { lines: { VALUE: r }, stats: {} };
  return { lines: r.lines || {}, stats: r.stats || {} };
}

for (const m of METHODS) {
  for (const f of ['id', 'category', 'name', 'desc', 'math', 'compute', 'params', 'needs']) {
    if (m[f] === undefined) throw new Error(`METHODS: ${m.id || '(no id)'} missing ${f}`);
  }
}
const ids = new Set();
for (const m of METHODS) {
  if (ids.has(m.id)) throw new Error(`METHODS: duplicate id ${m.id}`);
  ids.add(m.id);
}
