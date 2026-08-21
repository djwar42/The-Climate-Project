export const FONT_HREF =
  'https://fonts.googleapis.com/css2' +
  '?family=IBM+Plex+Mono:wght@400;500;700' +
  '&family=Moderustic:wght@400;500' +
  '&family=Montserrat:wght@500;700' +
  '&display=swap';

export const FACE = {
  display: "Montserrat, 'Montserrat Fallback', Moderustic, Helvetica, Arial, sans-serif",
  reading: "Moderustic, 'Moderustic Fallback', Helvetica, Arial, sans-serif",
  mono: "'IBM Plex Mono', 'Plex Mono Fallback', Moderustic, ui-monospace, Menlo, monospace",
};

export const FACE_RULE = {
  display: 'Montserrat. Uppercase display and the one sentence-case Statement. Tabular figures for the VALUE register. Never body text.',
  reading: 'Moderustic. Reading prose and metadata values. NEVER a number that must align: it has no tabular figures.',
  mono: 'IBM Plex Mono. Data, labels, codes, terminal register, anything on a grid. Never a paragraph.',
};

export const WEIGHT = { regular: 400, medium: 500, bold: 700 };

export const MEASURED = {
  Montserrat: { ascent: 0.968, descent: 0.251, cap: 0.700, xHeight: 0.5255, avgLowerAdv: 0.5624, digitAdv: 0.6623, tabDigitAdv: 0.700, hasTnum: true, hasGreek: false },
  Moderustic: { ascent: 1.000, descent: 0.250, cap: 0.700, xHeight: 0.5000, avgLowerAdv: 0.5256, digitAdv: 0.6271, tabDigitAdv: 0.6271, hasTnum: false, hasGreek: true },
  PlexMono: { ascent: 1.025, descent: 0.275, cap: 0.698, xHeight: 0.5160, avgLowerAdv: 0.6000, digitAdv: 0.6000, tabDigitAdv: 0.6000, hasTnum: 'monospaced', hasGreek: false },
  Arial: { ascent: 0.905, descent: 0.212, cap: 0.7158, xHeight: 0.5186, avgLowerAdv: 0.4817 },
  Menlo: { ascent: 0.928, descent: 0.236, cap: 0.7290, xHeight: 0.5469, avgLowerAdv: 0.6021 },
};

export const RATIO = {
  text: 1.125,
  textRoot: 16,
  display: 1.2,
  displayRoot: 148,
  joint: 'text +2 (20.25px) meets display d11 (19.92px), 1.7 percent apart',
};

const round2 = (n) => Math.round(n * 100) / 100;

export const t = (n) => round2(RATIO.textRoot * Math.pow(RATIO.text, n));
export const d = (n) => round2(RATIO.displayRoot / Math.pow(RATIO.display, n));

export const T = {
  micro: t(-4),
  label: t(-3),
  code: t(-2),
  secondary: t(-1),
  reading: t(0),
  lede: t(1),
  h3: t(2),
  h2: t(3),
};

export const D = {
  d0: d(0),
  d1: d(1),
  d2: d(2),
  d3: d(3),
  d4: d(4),
  d5: d(5),
  d6: d(6),
  d7: d(7),
  d8: d(8),
  d9: d(9),
  d10: d(10),
  d11: d(11),
};

export const FLUID = {
  giant: `clamp(${D.d6}px, 11.5vw, ${D.d0}px)`,
  giantTight: `clamp(${D.d7}px, 9.2vw, ${D.d1}px)`,
  statement: `clamp(${D.d9}px, 3.2vw, ${D.d6}px)`,
  valueHero: `clamp(${D.d8}px, 4.2vw, ${D.d5}px)`,
};

const BASE_TRACK = [
  [10, 0.006], [12, 0.002], [14, -0.002], [16, -0.006], [20, -0.010],
  [28, -0.015], [46, -0.020], [60, -0.026], [100, -0.038], [148, -0.049],
];
const MONO_TRACK = [[10, 0.14], [11.25, 0.12], [12.65, 0.10], [14.25, 0.08], [16, 0.06]];

const interp = (table, px) => {
  if (px <= table[0][0]) return table[0][1];
  if (px >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 1; i < table.length; i++) {
    const [x0, y0] = table[i - 1], [x1, y1] = table[i];
    if (px <= x1) return y0 + ((px - x0) / (x1 - x0)) * (y1 - y0);
  }
  return table[table.length - 1][1];
};

export function track(px, mode = 'sentence') {
  if (mode === 'monoLabel') return round4(interp(MONO_TRACK, px));
  if (mode === 'monoData') return px <= 11 ? 0.02 : 0.01;
  const base = interp(BASE_TRACK, px);
  return round4(mode === 'upper' ? base + 0.004 : base);
}
const round4 = (n) => Math.round(n * 10000) / 10000;
export const ls = (px, mode) => `${track(px, mode)}em`;

const LH_READING = [[13, 1.75], [14.25, 1.72], [16, 1.68], [18, 1.62], [20.25, 1.55]];
const LH_DISPLAY = [[20, 1.30], [22.8, 1.24], [28.7, 1.18], [41.3, 1.12], [59.5, 1.06], [100, 0.90], [148, 0.82]];

export function lh(px, role = 'reading') {
  switch (role) {
    case 'caption': return 1.55;
    case 'label': return 1.45;
    case 'terminal': return 1.95;
    case 'value': return 1.0;
    case 'giant': return 0.82;
    case 'display': return round2(interp(LH_DISPLAY, px));
    default: return round2(interp(LH_READING, px));
  }
}

export const MEASURE = {
  reading: '66ch',
  lede: '62ch',
  caption: '60ch',
  hint: '52ch',
  statement: '40ch',
  terminal: '90ch',
  glyphsPerCh: round2(MEASURED.Moderustic.digitAdv / MEASURED.Moderustic.avgLowerAdv),
};

export const RHYTHM = {
  unit: 4,
  inBlock: [8, 12, 16],
  betweenBlocks: [24, 40],
  betweenSections: 96,
  aboveFooter: 140,
  u: (n) => n * 4,
};

export const OPACITY = { floor: 0.9, quiet: 0.9, full: 1 };

export const TABULAR = { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: "'tnum' 1" };

export const NNBSP = ' ';
export const HAIRSP = ' ';
export const FIGSP = ' ';
export const MINUS = '−';
export const PM = '±';

const SUPS = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺', '(': '⁽', ')': '⁾', 'n': 'ⁿ' };
const SUBS = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '-': '₋', '+': '₊' };

export const sup = (s) => String(s).split('').map((c) => SUPS[c] || c).join('');
export const sub = (s) => String(s).split('').map((c) => SUBS[c] || c).join('');

export function unit(s) {
  return String(s)
    .replace(/\^([-+]?\w+)/g, (_, g) => sup(g))
    .replace(/_([-+]?\w+)/g, (_, g) => sub(g));
}

export const nn = (a, b) => `${a}${NNBSP}${b}`;

export const GLYPH = {
  safe: [
    '± plus-minus', '° degree', '× multiplication', '· middle dot (not in Montserrat)',
    '⁰-⁹ superior digits', '⁻ superior minus', '₀-₉ inferior digits',
    '• bullet', '▪ small black square', '↑ ↓ up and down arrows',
    '✓ check', 'µ micro sign', '′ prime', '… ellipsis',
    '  figure space', '  narrow no-break space', '█ ░ blocks', '─ │ box rules',
  ],
  avoid: {
    '■': { why: 'BLACK SQUARE is missing from IBM Plex Mono and every terminal line is mono', use: '▪ U+25AA SMALL BLACK SQUARE, present in all three' },
    '−': { why: 'true MINUS is absent from Moderustic', use: 'a hyphen in prose; U+2212 is fine in mono and display' },
    '→': { why: 'RIGHTWARDS ARROW is only in IBM Plex Mono', use: 'keep arrows in the mono register, or write the word' },
    '≥': { why: 'not in any of the three', use: '>= in mono, "at least" in prose' },
    '≤': { why: 'not in any of the three', use: '<= in mono, "at most" in prose' },
    '≈': { why: 'not in any of the three', use: '~ in mono, "about" in prose' },
    '∞': { why: 'not in any of the three', use: 'write the word' },
    'Δ': { why: 'Greek is absent from Google Montserrat and IBM Plex Mono', use: 'it lands on Moderustic via the named fallback in FACE; do not be surprised by the face change' },
    ['\u2013']: { why: 'en dash is absent from Montserrat, and this site writes hyphens', use: 'a hyphen' },
    '‰': { why: 'per mille is in none of the three', use: 'write "per mille"' },
  },
  sep: '▪',
  noItalic: true,
};

const upper = { textTransform: 'uppercase' };

export const TYPE = {
  giant: (o = {}) => ({
    fontFamily: FACE.display, fontWeight: WEIGHT.bold, ...upper,
    fontSize: o.tight ? FLUID.giantTight : FLUID.giant,
    lineHeight: lh(D.d0, 'giant'), letterSpacing: ls(D.d0, 'upper'),
    ...strip(o),
  }),

  statement: (o = {}) => ({
    fontFamily: FACE.display, fontWeight: WEIGHT.medium,
    fontSize: FLUID.statement, lineHeight: lh(46, 'display'),
    letterSpacing: ls(46, 'sentence'), maxWidth: MEASURE.statement,
    ...strip(o),
  }),

  value: (o = {}) => {
    const px = o.hero ? D.d5 : (o.size || D.d9);
    return {
      fontFamily: FACE.display, fontWeight: WEIGHT.bold,
      fontSize: o.hero ? FLUID.valueHero : px,
      lineHeight: lh(px, 'value'), letterSpacing: ls(px, 'figures'),
      ...TABULAR, ...strip(o),
    };
  },

  section: (o = {}) => ({
    fontFamily: FACE.mono, fontWeight: WEIGHT.bold, ...upper,
    fontSize: T.label, lineHeight: lh(T.label, 'label'), letterSpacing: ls(T.label, 'monoLabel'),
    ...strip(o),
  }),

  label: (o = {}) => ({
    fontFamily: FACE.mono, fontWeight: o.bold ? WEIGHT.bold : WEIGHT.medium, ...upper,
    fontSize: T.label, lineHeight: lh(T.label, 'label'), letterSpacing: ls(T.label, 'monoLabel'),
    ...strip(o),
  }),

  micro: (o = {}) => ({
    fontFamily: FACE.mono, fontWeight: o.bold ? WEIGHT.bold : WEIGHT.regular, ...upper,
    fontSize: T.micro, lineHeight: lh(T.micro, 'label'), letterSpacing: ls(T.micro, 'monoLabel'),
    ...strip(o),
  }),

  code: (o = {}) => ({
    fontFamily: FACE.mono, fontWeight: o.bold ? WEIGHT.bold : WEIGHT.regular, ...upper,
    fontSize: T.code, lineHeight: lh(T.code, 'label'), letterSpacing: ls(T.code, 'monoData'),
    ...TABULAR, ...strip(o),
  }),

  data: (o = {}) => ({
    fontFamily: FACE.mono, fontWeight: o.bold ? WEIGHT.bold : WEIGHT.regular,
    fontSize: o.size || T.code, lineHeight: lh(T.code, 'label'),
    letterSpacing: ls(o.size || T.code, 'monoData'), ...TABULAR, ...strip(o),
  }),

  reading: (o = {}) => ({
    fontFamily: FACE.reading, fontWeight: WEIGHT.regular,
    fontSize: T.reading, lineHeight: lh(T.reading, 'reading'),
    letterSpacing: ls(T.reading, 'sentence'), maxWidth: MEASURE.reading,
    ...strip(o),
  }),

  lede: (o = {}) => ({
    fontFamily: FACE.reading, fontWeight: WEIGHT.regular,
    fontSize: T.lede, lineHeight: lh(T.lede, 'reading'),
    letterSpacing: ls(T.lede, 'sentence'), maxWidth: MEASURE.lede,
    ...strip(o),
  }),

  caption: (o = {}) => ({
    fontFamily: FACE.reading, fontWeight: WEIGHT.regular,
    fontSize: T.secondary, lineHeight: lh(T.secondary, 'caption'),
    letterSpacing: ls(T.secondary, 'sentence'), maxWidth: MEASURE.caption,
    ...strip(o),
  }),

  metaValue: (o = {}) => ({
    fontFamily: FACE.reading, fontWeight: WEIGHT.medium,
    fontSize: T.reading, lineHeight: lh(T.reading, 'caption'),
    letterSpacing: ls(T.reading, 'sentence'), ...strip(o),
  }),

  terminal: (o = {}) => ({
    fontFamily: FACE.mono, fontWeight: WEIGHT.regular, ...upper,
    fontSize: T.label, lineHeight: lh(T.label, 'terminal'),
    letterSpacing: ls(T.label, 'monoLabel'), maxWidth: MEASURE.terminal,
    ...strip(o),
  }),

  year: (size = T.code, o = {}) => {
    const isDisplay = o.face === 'display';
    const eraPx = isDisplay
      ? Math.max(round2(size / Math.pow(RATIO.display, 3)), T.label)
      : Math.max(round2(size / Math.pow(RATIO.text, 2)), T.micro);
    const cells = o.cells || 7;
    const digit = isDisplay ? MEASURED.Montserrat.tabDigitAdv : MEASURED.PlexMono.digitAdv;
    return {
      root: {
        display: 'inline-flex', alignItems: 'baseline',
        gap: `${round2(size * (isDisplay ? 0.26 : 0.34))}px`,
        whiteSpace: 'nowrap', ...strip(o),
      },
      num: {
        fontFamily: isDisplay ? FACE.display : FACE.mono,
        fontWeight: isDisplay ? WEIGHT.bold : WEIGHT.medium,
        fontSize: size, lineHeight: isDisplay ? lh(size, 'value') : lh(size, 'label'),
        letterSpacing: ls(size, isDisplay ? 'figures' : 'monoData'),
        ...TABULAR, fontVariantNumeric: 'tabular-nums lining-nums',
        minWidth: o.column ? `${round2(size * digit * cells)}px` : undefined,
        textAlign: o.column ? 'right' : undefined,
      },
      era: {
        fontFamily: FACE.mono, fontWeight: WEIGHT.medium,
        fontSize: eraPx, lineHeight: 1, letterSpacing: ls(eraPx, 'monoLabel'),
        opacity: OPACITY.quiet, flex: 'none',
      },
    };
  },

  quantity: (size = T.code, o = {}) => {
    const isDisplay = o.face === 'display';
    const qualPx = isDisplay
      ? Math.max(round2(size / Math.pow(RATIO.display, 3)), T.label)
      : Math.max(round2(size / Math.pow(RATIO.text, 2)), T.micro);
    const unitPx = qualPx, uncPx = qualPx;
    return {
      root: {
        display: 'inline-flex', alignItems: 'baseline',
        gap: `${round2(size * 0.16)}px`, whiteSpace: 'nowrap', ...strip(o),
      },
      num: {
        fontFamily: isDisplay ? FACE.display : FACE.mono,
        fontWeight: isDisplay ? WEIGHT.bold : WEIGHT.medium,
        fontSize: size, lineHeight: isDisplay ? lh(size, 'value') : lh(size, 'label'),
        letterSpacing: ls(size, isDisplay ? 'figures' : 'monoData'), ...TABULAR,
      },
      unit: {
        fontFamily: FACE.mono, fontWeight: WEIGHT.regular,
        fontSize: unitPx, lineHeight: 1, letterSpacing: ls(unitPx, 'monoData'),
        opacity: OPACITY.quiet,
      },
      unc: {
        fontFamily: FACE.mono, fontWeight: WEIGHT.regular,
        fontSize: uncPx, lineHeight: 1, letterSpacing: ls(uncPx, 'monoData'),
        marginLeft: round2(size * 0.30), opacity: OPACITY.quiet, ...TABULAR,
      },
    };
  },

  register: (kind, o = {}) => REGISTER[kind] ? REGISTER[kind](o) : REGISTER.observed(o),
};

function strip(o) {
  const { tight, hero, size, face, column, cells, bold, ...rest } = o || {};
  return rest;
}

export const REGISTER = {
  observed: (o = {}) => ({
    fontFamily: FACE.reading, fontWeight: WEIGHT.regular,
    fontSize: T.reading, lineHeight: lh(T.reading, 'reading'),
    letterSpacing: ls(T.reading, 'sentence'), maxWidth: MEASURE.reading, ...o,
  }),
  inference: (o = {}) => ({
    fontFamily: FACE.reading, fontWeight: WEIGHT.regular,
    fontSize: T.reading, lineHeight: 1.78,
    letterSpacing: ls(T.reading, 'sentence'), maxWidth: MEASURE.reading, ...o,
  }),
  mundane: (o = {}) => ({
    fontFamily: FACE.reading, fontWeight: WEIGHT.regular,
    fontSize: T.secondary, lineHeight: lh(T.secondary, 'reading'),
    letterSpacing: ls(T.secondary, 'sentence'), maxWidth: MEASURE.caption,
    opacity: OPACITY.quiet, ...o,
  }),
  mark: (o = {}) => ({
    fontFamily: FACE.mono, fontWeight: WEIGHT.bold, ...upper,
    fontSize: T.micro, lineHeight: lh(T.reading, 'reading'),
    letterSpacing: ls(T.micro, 'monoLabel'), ...o,
  }),
  MARKS: { observed: 'OBS', inference: 'INF', mundane: 'ALT' },
};

export function yearParts(str) {
  const s = String(str).trim();
  const m = /^([-−]?[\d.,]+)\s*(.*)$/.exec(s);
  if (!m) return { num: s, era: '' };
  return { num: m[1], era: m[2] || '' };
}

export function qty(value, unitStr, uncertainty) {
  const u = unitStr ? unit(String(unitStr).replace(/^deg/, '°')) : '';
  let out = String(value);
  if (u) out += NNBSP + u;
  if (uncertainty !== undefined && uncertainty !== null && uncertainty !== '') {
    out += ` ${PM}${NNBSP}${uncertainty}`;
  }
  return out;
}

export const UNITS = {
  degC: '°C',
  ppm: 'ppm',
  ppb: 'ppb',
  wm2: unit('W m^-2'),
  zj: 'ZJ',
  e22j: '10' + sup('22') + NNBSP + 'J',
  mm: 'mm',
  mmyr: unit('mm yr^-1'),
  gt: 'Gt',
  gtyr: unit('Gt yr^-1'),
  km2: unit('km^2'),
  millionkm2: unit('million km^2'),
  co2: 'CO' + sub('2'),
  ch4: 'CH' + sub('4'),
  n2o: 'N' + sub('2') + 'O',
  kaBP: 'ka BP',
  maBP: 'Ma BP',
};

export default TYPE;
