import React from 'react';
import { NEON, NEON_EXTENDED } from '../neon.js';

const INK = '#2a2722';

const S = (color, w = 5) => ({ fill: 'none', stroke: color, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' });
const K = (w = 3.4) => ({ fill: 'none', stroke: INK, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' });
const FILL = (color, o = 1) => ({ fill: color, opacity: o, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' });

function Frame({ children, size = 32, label }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label || 'news type'}
      style={{ display: 'block', overflow: 'visible' }}>
      {children}
    </svg>
  );
}

export const TemperatureIcon = ({ color, size }) => (
  <Frame size={size} label="temperature record">
    <rect x="14" y="54" width="20" height="34" {...FILL(color, 0.24)} />
    <rect x="40" y="42" width="20" height="46" {...FILL(color, 0.42)} />
    <rect x="66" y="22" width="20" height="66" {...FILL(color, 1)} />
    <path d="M66 14 L76 4 L86 14" {...S(color, 5.5)} />
    <line x1="6" y1="88" x2="96" y2="88" {...K(4)} />
  </Frame>
);

export const CompositionIcon = ({ color, size }) => (
  <Frame size={size} label="atmospheric composition">
    <line x1="22" y1="34" x2="34" y2="34" {...K(3)} />
    <line x1="22" y1="46" x2="34" y2="46" {...K(3)} />
    <line x1="66" y1="34" x2="78" y2="34" {...K(3)} />
    <line x1="66" y1="46" x2="78" y2="46" {...K(3)} />
    <circle cx="14" cy="40" r="10" {...FILL(color, 0.35)} />
    <circle cx="86" cy="40" r="10" {...FILL(color, 0.35)} />
    <circle cx="50" cy="40" r="16" {...FILL(color, 1)} />
    <line x1="8" y1="76" x2="94" y2="76" {...K(3.4)} />
    {[8, 29, 50, 71, 92].map((x) => <line key={x} x1={x} y1="76" x2={x} y2="86" {...K(2.6)} />)}
    <rect x="66" y="68" width="12" height="16" {...FILL(color, 1)} />
  </Frame>
);

export const AssessmentIcon = ({ color, size }) => (
  <Frame size={size} label="assessment published">
    <rect x="18" y="10" width="58" height="78" {...FILL(color, 0.16)} />
    <rect x="18" y="10" width="58" height="16" {...FILL(color, 1)} />
    {[40, 52, 64].map((y) => <line key={y} x1="27" y1={y} x2={y === 64 ? 55 : 67} y2={y} {...K(3.6)} />)}
    <circle cx="76" cy="72" r="15" {...FILL(color, 1)} />
    <path d="M70 72 L75 78 L84 66" {...S('#eae6dc', 4)} />
  </Frame>
);

export const CryosphereIcon = ({ color, size }) => (
  <Frame size={size} label="sea ice">
    <path d="M2 74 Q18 66 34 74 T66 74 T98 74" {...K(3.2)} />
    <path d="M2 88 Q18 80 34 88 T66 88 T98 88" {...K(2.6)} />
    <polygon points="12,40 40,24 62,38 50,58 20,58" {...FILL(color, 1)} />
    <polygon points="64,52 84,44 94,58 78,68 64,66" {...FILL(color, 0.45)} />
    <line x1="26" y1="34" x2="34" y2="44" {...S('#eae6dc', 3)} />
  </Frame>
);

export const OceanIcon = ({ color, size }) => (
  <Frame size={size} label="ocean and sea level">
    <path d="M2 46 Q16 36 30 46 T58 46 T88 46 L88 90 L2 90 Z" fill={color} opacity="0.9" />
    <path d="M2 46 Q16 36 30 46 T58 46 T88 46" {...K(3.2)} />
    <path d="M4 62 Q18 54 32 62 T60 62 T90 62" {...S('#eae6dc', 2.8)} />
    <line x1="4" y1="70" x2="90" y2="70" {...K(2.6)} strokeDasharray="6 5" />
    <line x1="88" y1="8" x2="88" y2="94" {...K(4)} />
    {[20, 36, 52, 68].map((y) => <line key={y} x1="78" y1={y} x2="88" y2={y} {...K(2.6)} />)}
    <path d="M22 34 L22 12 M14 20 L22 10 L30 20" {...S(color, 5)} />
  </Frame>
);

export const EmissionsIcon = ({ color, size }) => (
  <Frame size={size} label="emissions">
    <rect x="18" y="36" width="26" height="52" {...FILL(color, 1)} />
    <rect x="54" y="54" width="20" height="34" {...FILL(color, 0.4)} />
    <path d="M31 28 q-12 -12 1 -22 q13 -10 3 -22" {...K(4)} />
    <line x1="4" y1="88" x2="96" y2="88" {...K(4.4)} />
    <line x1="22" y1="50" x2="40" y2="50" {...S('#eae6dc', 3)} />
  </Frame>
);

export const PolicyIcon = ({ color, size }) => (
  <Frame size={size} label="policy or agreement">
    <circle cx="50" cy="50" r="34" {...K(3.4)} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const r = (a - 90) * Math.PI / 180;
      return <circle key={a} cx={50 + 34 * Math.cos(r)} cy={50 + 34 * Math.sin(r)} r="7.5"
        fill={color} stroke={INK} strokeWidth="2.4" />;
    })}
    <rect x="38" y="38" width="24" height="24" {...FILL(color, 1)} />
  </Frame>
);

export const AttributionIcon = ({ color, size }) => (
  <Frame size={size} label="attribution study">
    <path d="M4 82 Q22 82 30 58 Q36 38 44 38 Q52 38 58 58 Q66 82 84 82" {...K(3)} strokeOpacity="0.5" />
    <path d="M22 82 Q40 82 48 50 Q54 26 62 26 Q70 26 76 50 Q84 82 102 82 L102 86 L22 86 Z"
      fill={color} opacity="0.28" />
    <path d="M22 82 Q40 82 48 50 Q54 26 62 26 Q70 26 76 50 Q84 82 102 82" {...S(color, 5)} />
    <line x1="4" y1="88" x2="96" y2="88" {...K(4)} />
    <path d="M44 16 L62 16 M56 10 L64 16 L56 22" {...S(color, 4.4)} />
  </Frame>
);

export const DatasetIcon = ({ color, size }) => (
  <Frame size={size} label="dataset release">
    <rect x="10" y="66" width="56" height="18" {...FILL(color, 0.22)} />
    <rect x="10" y="42" width="56" height="18" {...FILL(color, 0.45)} />
    <rect x="10" y="18" width="56" height="18" {...FILL(color, 1)} />
    <path d="M84 76 L84 26 M74 36 L84 22 L94 36" {...S(color, 5.5)} />
  </Frame>
);

export const CorrectionIcon = ({ color, size }) => (
  <Frame size={size} label="correction">
    <rect x="14" y="60" width="58" height="22" fill={INK} opacity="0.18" stroke={INK} strokeWidth="3" />
    <line x1="16" y1="82" x2="70" y2="60" {...K(4.6)} />
    <line x1="16" y1="60" x2="70" y2="82" {...K(4.6)} />
    <rect x="14" y="14" width="58" height="22" {...FILL(color, 1)} />
    <path d="M43 56 L43 44 M34 52 L43 40 L52 52" {...S(color, 4.6)} />
    <circle cx="85" cy="25" r="7" fill={color} stroke={INK} strokeWidth="2.6" />
  </Frame>
);

export const ForecastIcon = ({ color, size }) => (
  <Frame size={size} label="forecast">
    <path d="M6 70 Q22 66 38 60" {...K(4.2)} />
    <path d="M38 60 Q62 52 96 46 L96 10 Q62 34 38 60 Z" fill={color} opacity="0.26" />
    <path d="M38 60 Q62 30 96 12" {...S(color, 3.6)} />
    <path d="M38 60 Q64 42 96 28" {...S(color, 5.5)} />
    <path d="M38 60 Q62 54 96 46" {...S(color, 3.6)} />
    <line x1="38" y1="8" x2="38" y2="88" {...K(2.6)} strokeDasharray="6 5" />
    <circle cx="38" cy="60" r="7" fill={INK} />
    <line x1="4" y1="88" x2="96" y2="88" {...K(4)} />
  </Frame>
);

export const GeneralIcon = ({ color, size }) => (
  <Frame size={size} label="news round">
    {[[22, 74, 1], [42, 58, 0.6], [62, 40, 0.32]].map(([y, w, o]) => (
      <g key={y}>
        <rect x="12" y={y} width="10" height="14" fill={color} opacity={o} stroke={INK} strokeWidth="2.4" />
        <rect x="28" y={y} width={w - 12} height="14" fill={color} opacity={o * 0.5} stroke={INK} strokeWidth="2.4" />
      </g>
    ))}
    <line x1="12" y1="12" x2="88" y2="12" {...K(3.6)} />
  </Frame>
);

export const NEWS_TYPES = {
  correction: { label: 'CORRECTION', color: NEON_EXTENDED[0], draw: CorrectionIcon },
  dataset: { label: 'DATASET', color: NEON[6], draw: DatasetIcon },
  attribution: { label: 'ATTRIBUTION', color: NEON[2], draw: AttributionIcon },
  forecast: { label: 'FORECAST', color: NEON_EXTENDED[3], draw: ForecastIcon },
  policy: { label: 'POLICY', color: NEON[1], draw: PolicyIcon },
  cryosphere: { label: 'CRYOSPHERE', color: NEON[5], draw: CryosphereIcon },
  ocean: { label: 'OCEAN', color: NEON_EXTENDED[2], draw: OceanIcon },
  emissions: { label: 'EMISSIONS', color: NEON[9], draw: EmissionsIcon },
  composition: { label: 'COMPOSITION', color: NEON[8], draw: CompositionIcon },
  temperature: { label: 'TEMPERATURE', color: NEON[0], draw: TemperatureIcon },
  assessment: { label: 'ASSESSMENT', color: NEON[7], draw: AssessmentIcon },
  general: { label: 'ROUND', color: NEON_EXTENDED[1], draw: GeneralIcon },
};

export const NEWS_TYPE_KEYS = Object.keys(NEWS_TYPES);

const MATCHERS = {
  correction: [/\bcorrect(ion|ions|ed)\b/, /\bretract/, /\berrat(um|a)\b/, /\bwe were wrong\b/,
    /\bwe got (it|this) wrong\b/, /\bamend(ed|ment)\b/, /\bwithdrawn\b/, /\brather than hiding\b/],
  dataset: [/\bversion\b/, /\bv\d+(\.\d+)+\b/, /\bdataset[s]?\b/, /\bdata file\b/, /\breprocess/,
    /\bsupersed/, /\breleased?\b/, /\bcsv\b/, /\brevision\b/, /\bfile server\b/, /\bapi\b/],
  attribution: [/\battribution\b/, /\bmore likely\b/, /\breturn period\b/, /\bfingerprint\b/,
    /\btimes as likely\b/, /\bpre-industrial climate\b/, /\bworld weather attribution\b/, /\bcounterfactual\b/],
  forecast: [/\bforecast/, /\bel ni[nñ]o\b/, /\bla ni[nñ]a\b/, /\boutlook\b/, /\bensemble\b/,
    /\bseasonal\b/, /\bexpected to\b/, /\bprojection[s]?\b/, /\benso\b/, /\bpredict/],
  policy: [/\bpolicy\b/, /\bagreement\b/, /\bparis\b/, /\bcop\d+\b/, /\bndc[s]?\b/, /\btreaty\b/,
    /\bpledge/, /\blegislation\b/, /\bfunding\b/, /\bnegotiat/, /\bmandate/, /\bsummit\b/],
  cryosphere: [/\bsea ice\b/, /\bice\b/, /\barctic\b/, /\bantarctic\b/, /\bglacier[s]?\b/,
    /\bgreenland\b/, /\bsnow\b/, /\bmelt\b/, /\bcryospher/, /\bice sheet\b/, /\bpermafrost\b/, /\bextent\b/],
  ocean: [/\bocean\b/, /\bsea level\b/, /\bsea surface\b/, /\bsst\b/, /\bmarine\b/,
    /\bheat content\b/, /\bargo\b/, /\bcoral\b/, /\bcirculation\b/],
  emissions: [/\bemission[s]?\b/, /\binventor(y|ies)\b/, /\bghg\b/, /\bcarbon budget\b/, /\bfossil\b/,
    /\bglobal carbon\b/, /\bgtco2\b/, /\bnet zero\b/, /\bcoal\b/, /\bflux\b/],
  composition: [/\bppm\b/, /\bco2\b/, /\bcarbon dioxide\b/, /\bmethane\b/, /\bch4\b/, /\bn2o\b/,
    /\bmauna loa\b/, /\bconcentration[s]?\b/, /\bkeeling\b/, /\bppb\b/, /\bgrowth rate\b/],
  temperature: [/\btemperature\b/, /\bwarmest\b/, /\bhottest\b/, /\banomal(y|ies)\b/, /\branking\b/,
    /\brecord\b/, /\bgistemp\b/, /\bhadcrut\b/, /\bera5\b/, /\bdegrees?\b/, /\bheatwave\b/, /\bwarming\b/],
  assessment: [/\breport\b/, /\bassessment\b/, /\bipcc\b/, /\bwmo\b/, /\bbulletin\b/, /\bar6\b/,
    /\bpublished\b/, /\bstudy\b/, /\bpaper\b/, /\bnature\b/, /\bindicator\b/, /\bfindings\b/],
};

const STRONG = /ppm|ppb|co2|ch4|n2o|gistemp|hadcrut|era5|ipcc|wmo|ar6|ghg|sst|argo|enso|csv|cryospher|attribution|forecast|retract|errat|keeling|permafrost|glacier|coral|ndc/;

export function typeOf(text) {
  const s = String(text || '').toLowerCase();
  if (!s) return 'general';
  let best = 'general', bestScore = 0;
  for (const key of NEWS_TYPE_KEYS) {
    const pats = MATCHERS[key];
    if (!pats) continue;
    let score = 0;
    for (const p of pats) if (p.test(s)) score += (/[ -]/.test(p.source) || STRONG.test(p.source)) ? 2 : 1;
    if (score > bestScore) { best = key; bestScore = score; }
  }
  return best;
}

export function NewsIcon({ type, size = 32, color, title }) {
  const key = NEWS_TYPES[type] ? type : typeOf(type);
  const t = NEWS_TYPES[key];
  const D = t.draw;
  return <D color={color || t.color} size={size} label={title || t.label} />;
}

export default NewsIcon;
