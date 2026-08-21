export const F2X = 3.71;
export const ALPHA_CO2 = 5.35;
export const C_PREINDUSTRIAL = 278;

export const co2Forcing = (c, c0 = C_PREINDUSTRIAL) => (c > 0 ? ALPHA_CO2 * Math.log(c / c0) : 0);
export const lambdaFromEcs = (ecs) => F2X / ecs;
export const ecsFromLambda = (lambda) => F2X / lambda;

export const TWO_BOX_DEFAULTS = {
  C: 7.3,
  Cd: 106,
  gamma: 0.73,
  epsilon: 1.28,
  ecs: 3.0,
};

export function twoBox(forcing, p = {}) {
  const { C, Cd, gamma, epsilon, ecs } = { ...TWO_BOX_DEFAULTS, ...p };
  const lambda = lambdaFromEcs(ecs);
  let T = p.T0 || 0;
  let Td = p.Td0 || 0;
  const temperature = [], deep = [], imbalance = [];
  for (let i = 0; i < forcing.length; i++) {
    const [year, F] = forcing[i];
    const dt = i === 0 ? 1 : forcing[i][0] - forcing[i - 1][0];
    const N = F - lambda * T - epsilon * gamma * (T - Td);
    const dT = N / C;
    const dTd = (gamma * (T - Td)) / Cd;
    T += dT * dt;
    Td += dTd * dt;
    temperature.push([year, T]);
    deep.push([year, Td]);
    imbalance.push([year, N]);
  }
  return { temperature, deep, imbalance, lambda };
}

const JOOS = { a: [0.2173, 0.2240, 0.2824, 0.2763], tau: [Infinity, 394.4, 36.54, 4.304] };

export function joosIRF(t) {
  let f = JOOS.a[0];
  for (let i = 1; i < 4; i++) f += JOOS.a[i] * Math.exp(-t / JOOS.tau[i]);
  return f;
}

export const GTC_PER_PPM = 2.124;
const PPM_PER_GTC = 1 / GTC_PER_PPM;

export function emissionsToConcentration(emissions, c0 = C_PREINDUSTRIAL) {
  const out = [];
  for (let i = 0; i < emissions.length; i++) {
    let airborne = 0;
    for (let j = 0; j <= i; j++) {
      const dt = emissions[i][0] - emissions[j][0];
      airborne += emissions[j][1] * joosIRF(dt);
    }
    out.push([emissions[i][0], c0 + airborne * PPM_PER_GTC]);
  }
  return out;
}

export function seaLevelSemiEmpirical(temperature, p = {}) {
  const a = p.a == null ? 3.4 : p.a;
  const T0 = p.T0 == null ? -0.5 : p.T0;
  let h = p.h0 || 0;
  const out = [];
  for (let i = 0; i < temperature.length; i++) {
    const dt = i === 0 ? 1 : temperature[i][0] - temperature[i - 1][0];
    h += a * (temperature[i][1] - T0) * dt;
    out.push([temperature[i][0], h]);
  }
  return out;
}

export const PATHWAYS = [
  {
    id: 'ssp119', name: 'SSP1-1.9', color: '#00d084',
    blurb: 'Deep and immediate cuts. CO2 peaks within a decade and falls; net zero around mid-century.',
    note: 'Anchors shaped to the SSP1-1.9 marker: early peak near 440 ppm, decline to about 394 ppm by 2100.',
    anchors: [[2025, 424], [2030, 437], [2040, 443], [2050, 435], [2070, 412], [2100, 394]],
  },
  {
    id: 'ssp126', name: 'SSP1-2.6', color: '#00b3a4',
    blurb: 'Strong mitigation. Concentration peaks mid-century then declines slowly.',
    note: 'Anchors shaped to the SSP1-2.6 marker: peak near 470 ppm around 2060, about 446 ppm by 2100.',
    anchors: [[2025, 424], [2030, 442], [2040, 460], [2060, 470], [2080, 460], [2100, 446]],
  },
  {
    id: 'ssp245', name: 'SSP2-4.5', color: '#2160ff',
    blurb: 'The middle of the road. Current-policy-ish: growth slows but the concentration keeps rising.',
    note: 'Anchors shaped to the SSP2-4.5 marker: about 603 ppm by 2100.',
    anchors: [[2025, 424], [2040, 470], [2060, 522], [2080, 567], [2100, 603]],
  },
  {
    id: 'ssp370', name: 'SSP3-7.0', color: '#ff8a00',
    blurb: 'Regional rivalry, little coordinated mitigation. Emissions roughly double by 2100.',
    note: 'Anchors shaped to the SSP3-7.0 marker: about 867 ppm by 2100.',
    anchors: [[2025, 424], [2040, 487], [2060, 590], [2080, 720], [2100, 867]],
  },
  {
    id: 'ssp585', name: 'SSP5-8.5', color: '#ff3c1a',
    blurb: 'Fossil-fuelled development. Now widely treated as a high-end reference rather than a likely future.',
    note: 'Anchors shaped to the SSP5-8.5 marker: about 1135 ppm by 2100. Read as a high-end bound.',
    anchors: [[2025, 424], [2040, 502], [2060, 640], [2080, 850], [2100, 1135]],
  },
  {
    id: 'flat', name: 'HELD AT TODAY', color: '#7b1fe0',
    blurb: 'A physics reference, not a scenario: concentration frozen at its present value forever.',
    note: 'Not an SSP. Shows the warming still in the pipeline at constant composition.',
    anchors: [[2025, 424], [2100, 424]],
  },
];

export function pathwayConcentration(pathway, year) {
  const a = pathway.anchors;
  if (year <= a[0][0]) return a[0][1];
  if (year >= a[a.length - 1][0]) return a[a.length - 1][1];
  for (let i = 1; i < a.length; i++) {
    if (year <= a[i][0]) {
      const [y0, c0] = a[i - 1], [y1, c1] = a[i];
      return c0 + ((c1 - c0) * (year - y0)) / (y1 - y0);
    }
  }
  return a[a.length - 1][1];
}

export function runModel(o) {
  const {
    history, pathway = null, ecs = 3.0, otherForcing = 1.0,
    startYear = 1850, endYear = 2100, baseline = [1951, 1980],
  } = o;

  const hist = new Map();
  for (const [y, c] of history) {
    const yr = Math.round(y);
    if (yr >= startYear) hist.set(yr, c);
  }
  const lastObserved = Math.max(...hist.keys());
  const conc = [];
  for (let y = startYear; y <= endYear; y++) {
    if (hist.has(y)) conc.push([y, hist.get(y)]);
    else if (y < lastObserved) conc.push([y, null]);
    else if (pathway) conc.push([y, pathwayConcentration(pathway, y)]);
  }
  for (let i = 0; i < conc.length; i++) {
    if (conc[i][1] != null) continue;
    let a = i - 1; while (a >= 0 && conc[a][1] == null) a--;
    let b = i + 1; while (b < conc.length && conc[b][1] == null) b++;
    if (a < 0 || b >= conc.length) { conc[i][1] = conc[Math.max(a, 0)]?.[1] ?? conc[b]?.[1] ?? C_PREINDUSTRIAL; continue; }
    const t = (conc[i][0] - conc[a][0]) / (conc[b][0] - conc[a][0]);
    conc[i][1] = conc[a][1] + t * (conc[b][1] - conc[a][1]);
  }

  const forcing = conc.map(([y, c]) => [y, co2Forcing(c) * otherForcing]);

  const { temperature, imbalance, lambda } = twoBox(forcing, { ecs });

  const inBase = temperature.filter(([y]) => y >= baseline[0] && y <= baseline[1]);
  const offset = inBase.length ? inBase.reduce((s, [, v]) => s + v, 0) / inBase.length : 0;
  const anomaly = temperature.map(([y, v]) => [y, v - offset]);

  const sea = seaLevelSemiEmpirical(anomaly, { h0: 0 });

  return {
    concentration: conc, forcing, temperature: anomaly, imbalance, sealevel: sea,
    lambda, ecs, lastObserved,
    at: (year) => anomaly.find(([y]) => y === year)?.[1] ?? null,
  };
}

export function hindcastScore(model, obs, from = 1880, to = 2024) {
  const m = new Map(model.map(([y, v]) => [Math.round(y), v]));
  let n = 0, se = 0, bias = 0;
  for (const [y, v] of obs) {
    const yr = Math.round(y);
    if (yr < from || yr > to) continue;
    const mv = m.get(yr);
    if (mv == null) continue;
    se += (mv - v) ** 2; bias += mv - v; n++;
  }
  return n ? { rmse: Math.sqrt(se / n), bias: bias / n, n } : { rmse: null, bias: null, n: 0 };
}
