import React from 'react';
import { NEON, neonFull } from '../neon.js';

const INK = '#2a2722';

function Frame({ children, size = 100, color, title }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={title || 'illustration'}
      style={{ display: 'block', overflow: 'visible' }}>
      {children}
    </svg>
  );
}

const S = (color, w = 2) => ({ fill: 'none', stroke: color, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' });
const W = (color, o = 0.13) => ({ fill: color, opacity: o, stroke: 'none' });

export const EnergyBalance = ({ color = NEON[0], size }) => (
  <Frame size={size} title="energy balance">
    <circle cx="20" cy="20" r="11" {...W(color, 0.18)} />
    <circle cx="20" cy="20" r="11" {...S(color, 2)} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const r = (a * Math.PI) / 180;
      return <line key={a} x1={20 + 14 * Math.cos(r)} y1={20 + 14 * Math.sin(r)}
        x2={20 + 18 * Math.cos(r)} y2={20 + 18 * Math.sin(r)} {...S(color, 1.6)} />;
    })}
    <path d="M8 84 Q50 66 100 78" {...S(INK, 2)} />
    <path d="M8 92 Q50 76 100 88" {...S(INK, 1)} strokeOpacity="0.35" />
    {[38, 52, 66, 80].map((x, i) => (
      <g key={x}>
        <line x1={x - 6} y1="34" x2={x} y2={62 - i * 2} {...S(color, 2)} />
        <path d={`M${x - 3} ${57 - i * 2} L${x} ${62 - i * 2} L${x - 6} ${60 - i * 2}`} {...S(color, 2)} />
      </g>
    ))}
    {[46, 74].map((x) => (
      <g key={`u${x}`}>
        <line x1={x} y1="60" x2={x + 5} y2="30" {...S(color, 1.4)} strokeDasharray="3 3" />
        <path d={`M${x + 2} 34 L${x + 5} 30 L${x + 8} 35`} {...S(color, 1.4)} />
      </g>
    ))}
  </Frame>
);

export const Greenhouse = ({ color = NEON[0], size }) => (
  <Frame size={size} title="greenhouse effect">
    <path d="M4 74 Q50 58 100 70" {...S(INK, 2)} />
    <path d="M2 40 Q40 30 100 38" {...S(color, 1.6)} strokeDasharray="6 4" />
    <path d="M2 52 Q40 43 100 50" {...S(color, 1.6)} strokeDasharray="6 4" />
    <path d="M2 40 Q40 30 100 38 L100 50 Q40 43 2 52 Z" {...W(color, 0.10)} />
    {[22, 44, 66].map((x, i) => (
      <g key={x}>
        <line x1={x} y1="14" x2={x + 4} y2="66" {...S(color, 2)} />
        <path d={`M${x + 1} 61 L${x + 4} 66 L${x - 2} 64`} {...S(color, 2)} />
      </g>
    ))}
    {[34, 58, 82].map((x) => (
      <path key={`b${x}`} d={`M${x} 66 L${x + 3} 44 M${x + 3} 44 L${x + 8} 56`} {...S(color, 1.5)} />
    ))}
  </Frame>
);

export const IceCore = ({ color = NEON[5], size }) => (
  <Frame size={size} title="ice core">
    <path d="M30 8 L30 96 M62 8 L62 96" {...S(color, 2.2)} />
    <ellipse cx="46" cy="8" rx="16" ry="5" {...S(color, 2.2)} />
    <ellipse cx="46" cy="8" rx="16" ry="5" {...W(color, 0.16)} />
    {[20, 30, 39, 47, 54, 60, 65, 69, 73, 76, 79, 82, 85, 87, 89].map((y, i) => (
      <line key={y} x1="30" y1={y} x2="62" y2={y} {...S(color, i % 3 === 0 ? 1.7 : 0.9)} strokeOpacity={0.85} />
    ))}
    <line x1="70" y1="20" x2="96" y2="20" {...S(INK, 1)} strokeOpacity="0.4" />
    <line x1="70" y1="60" x2="96" y2="60" {...S(INK, 1)} strokeOpacity="0.4" />
    <line x1="70" y1="88" x2="96" y2="88" {...S(INK, 1)} strokeOpacity="0.4" />
  </Frame>
);

export const KeelingCurve = ({ color = NEON[0], size }) => (
  <Frame size={size} title="the rising sawtooth">
    <path d="M10 92 L10 10 M10 92 L98 92" {...S(INK, 1.6)} />
    <path d="M14 84 l6 -6 l4 8 l6 -8 l4 8 l6 -10 l4 8 l6 -10 l4 8 l6 -12 l4 9 l6 -13 l4 9 l6 -14 l4 9 l6 -16"
      {...S(color, 2.4)} />
    <circle cx="96" cy="20" r="3" fill={color} />
  </Frame>
);

export const Glacier = ({ color = NEON[5], size }) => (
  <Frame size={size} title="glacier">
    <path d="M2 78 L26 30 L40 52 L56 18 L78 60 L100 44" {...S(INK, 2)} />
    <path d="M2 78 L26 30 L40 52 L56 18 L78 60 L100 44 L100 96 L2 96 Z" {...W(color, 0.10)} />
    <path d="M20 62 Q34 52 44 66 Q56 80 74 72" {...S(color, 2.4)} />
    <path d="M24 74 Q40 66 50 78 Q62 90 82 84" {...S(color, 1.6)} strokeDasharray="5 4" />
    <path d="M84 78 l6 -5 M88 86 l7 -6" {...S(color, 1.4)} />
  </Frame>
);

export const OceanHeat = ({ color = NEON[1], size }) => (
  <Frame size={size} title="ocean heat">
    {[34, 48, 62, 76, 90].map((y, i) => (
      <path key={y} d={`M0 ${y} Q20 ${y - 7} 40 ${y} T80 ${y} T120 ${y}`} {...S(color, 2.2 - i * 0.25)}
        strokeOpacity={1 - i * 0.13} />
    ))}
    {[26, 52, 78].map((x, i) => (
      <g key={x}>
        <line x1={x} y1="82" x2={x} y2={30 + i * 4} {...S(color, 1.6)} strokeDasharray="4 3" />
        <path d={`M${x - 4} ${35 + i * 4} L${x} ${29 + i * 4} L${x + 4} ${35 + i * 4}`} {...S(color, 1.6)} />
      </g>
    ))}
    <line x1="0" y1="20" x2="100" y2="20" {...S(INK, 1)} strokeOpacity="0.35" />
  </Frame>
);

export const Satellite = ({ color = NEON[4], size }) => (
  <Frame size={size} title="satellite">
    <path d="M-6 96 Q50 58 106 96" {...S(INK, 2.2)} />
    <path d="M-6 96 Q50 58 106 96 L106 100 L-6 100 Z" {...W(color, 0.10)} />
    <rect x="42" y="24" width="16" height="12" {...S(color, 2)} />
    <rect x="20" y="25" width="18" height="10" {...S(color, 1.8)} />
    <rect x="62" y="25" width="18" height="10" {...S(color, 1.8)} />
    <line x1="30" y1="25" x2="30" y2="35" {...S(color, 1)} />
    <line x1="70" y1="25" x2="70" y2="35" {...S(color, 1)} />
    <line x1="50" y1="36" x2="50" y2="44" {...S(color, 1.6)} />
    <path d="M42 52 L50 44 L58 52" {...S(color, 1.6)} strokeDasharray="3 3" />
    <path d="M34 62 L50 44 L66 62" {...S(color, 1.2)} strokeDasharray="3 3" strokeOpacity="0.6" />
  </Frame>
);

export const CarbonCycle = ({ color = NEON[4], size }) => (
  <Frame size={size} title="carbon cycle">
    <path d="M50 14 A36 36 0 1 1 22 68" {...S(color, 2.4)} />
    <path d="M16 62 L22 70 L30 66" {...S(color, 2.4)} />
    <circle cx="50" cy="50" r="9" {...W(color, 0.2)} />
    <circle cx="50" cy="50" r="9" {...S(color, 2)} />
    <text x="50" y="54" textAnchor="middle" fill={color}
      style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 700 }}>C</text>
    <path d="M78 34 l7 -4 M84 58 l8 3 M30 24 l-6 -5" {...S(INK, 1.2)} strokeOpacity="0.4" />
  </Frame>
);

export const Thermometer = ({ color = NEON[0], size }) => (
  <Frame size={size} title="thermometer">
    <path d="M42 14 a8 8 0 0 1 16 0 v50 a14 14 0 1 1 -16 0 z" {...S(color, 2.2)} />
    <circle cx="50" cy="76" r="9" fill={color} />
    <rect x="46" y="40" width="8" height="34" fill={color} />
    {[22, 30, 38, 46, 54].map((y) => <line key={y} x1="60" y1={y} x2={y % 16 === 6 ? 76 : 70} y2={y} {...S(INK, 1.2)} strokeOpacity="0.5" />)}
  </Frame>
);

export const SeaIce = ({ color = NEON[5], size }) => (
  <Frame size={size} title="sea ice">
    {[34, 52, 70, 88].map((y, i) => (
      <path key={y} d={`M-4 ${y} Q18 ${y - 5} 38 ${y} T78 ${y} T118 ${y}`} {...S(color, 1.2)} strokeOpacity="0.35" />
    ))}
    <path d="M18 34 L36 26 L52 34 L44 46 L24 46 Z" {...W(color, 0.18)} />
    <path d="M18 34 L36 26 L52 34 L44 46 L24 46 Z" {...S(color, 2)} />
    <path d="M56 52 L74 46 L88 56 L78 66 L60 64 Z" {...W(color, 0.14)} />
    <path d="M56 52 L74 46 L88 56 L78 66 L60 64 Z" {...S(color, 1.8)} />
    <path d="M26 62 L40 58 L48 68 L36 74 Z" {...S(color, 1.5)} />
    <path d="M62 78 L76 76 L80 84 L66 86 Z" {...S(color, 1.3)} />
  </Frame>
);

export const Globe = ({ color = NEON[3], size }) => (
  <Frame size={size} title="globe">
    <circle cx="50" cy="50" r="34" {...S(color, 2.2)} />
    <circle cx="50" cy="50" r="34" {...W(color, 0.09)} />
    <ellipse cx="50" cy="50" rx="34" ry="13" {...S(color, 1.4)} />
    <ellipse cx="50" cy="50" rx="34" ry="26" {...S(color, 1)} strokeOpacity="0.6" />
    <ellipse cx="50" cy="50" rx="13" ry="34" {...S(color, 1.4)} />
    <line x1="16" y1="50" x2="84" y2="50" {...S(color, 1.8)} />
    <line x1="50" y1="16" x2="50" y2="84" {...S(color, 1)} strokeOpacity="0.6" />
  </Frame>
);

export const Assembly = ({ color = NEON[1], size }) => (
  <Frame size={size} title="assembly">
    <path d="M8 34 L50 12 L92 34" {...S(color, 2.4)} />
    <line x1="6" y1="34" x2="94" y2="34" {...S(color, 2.4)} />
    {[18, 34, 50, 66, 82].map((x) => <line key={x} x1={x} y1="38" x2={x} y2="76" {...S(color, 2)} />)}
    <line x1="6" y1="80" x2="94" y2="80" {...S(color, 2.4)} />
    <line x1="2" y1="88" x2="98" y2="88" {...S(INK, 1.6)} />
    <circle cx="50" cy="24" r="3.4" fill={color} />
  </Frame>
);

export const Network = ({ color = NEON[3], size }) => {
  const pts = [[20, 24], [62, 16], [86, 44], [50, 50], [16, 62], [40, 86], [78, 78]];
  const edges = [[0, 3], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6], [1, 2], [4, 5], [5, 6]];
  return (
    <Frame size={size} title="network">
      {edges.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} {...S(color, 1.3)} strokeOpacity="0.75" />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 ? 8 : 5} fill={i === 3 ? color : 'none'} stroke={color} strokeWidth="2" />
      ))}
    </Frame>
  );
};

export const Buoy = ({ color = NEON[1], size }) => (
  <Frame size={size} title="ocean float">
    <path d="M-4 44 Q20 38 44 44 T92 44 T136 44" {...S(color, 2)} />
    <rect x="42" y="20" width="14" height="24" rx="6" {...S(color, 2.2)} />
    <line x1="49" y1="20" x2="49" y2="8" {...S(color, 1.6)} />
    <circle cx="49" cy="6" r="3" fill={color} />
    <line x1="49" y1="44" x2="49" y2="82" {...S(color, 1.4)} strokeDasharray="4 4" />
    <path d="M42 82 L49 92 L56 82" {...S(color, 1.6)} />
    {[56, 66, 76].map((y) => <line key={y} x1="24" y1={y} x2="74" y2={y} {...S(INK, 0.9)} strokeOpacity="0.3" />)}
  </Frame>
);

export const Attribution = ({ color = NEON[6], size }) => (
  <Frame size={size} title="attribution">
    <path d="M6 84 Q26 84 34 62 Q42 40 50 40 Q58 40 66 62 Q74 84 94 84" {...S(INK, 1.6)} strokeOpacity="0.45" />
    <path d="M18 84 Q38 84 46 56 Q54 28 62 28 Q70 28 78 56 Q86 84 106 84" {...S(color, 2.4)} />
    <line x1="6" y1="88" x2="100" y2="88" {...S(INK, 1.6)} />
    <line x1="50" y1="40" x2="50" y2="88" {...S(INK, 1)} strokeDasharray="3 3" strokeOpacity="0.5" />
    <line x1="62" y1="28" x2="62" y2="88" {...S(color, 1.2)} strokeDasharray="3 3" />
    <path d="M52 20 L60 20" {...S(color, 2)} />
    <path d="M56 16 L60 20 L56 24" {...S(color, 2)} />
  </Frame>
);

export const Telescope = ({ color = NEON[8], size }) => (
  <Frame size={size} title="observation">
    <path d="M14 74 L66 26" {...S(color, 6)} strokeOpacity="0.9" />
    <path d="M60 20 L78 38 L70 46 L52 28 Z" {...W(color, 0.2)} />
    <path d="M60 20 L78 38 L70 46 L52 28 Z" {...S(color, 2)} />
    <line x1="20" y1="80" x2="34" y2="66" {...S(color, 2)} />
    <path d="M10 92 L30 70 L44 92" {...S(INK, 2)} />
    <line x1="4" y1="92" x2="56" y2="92" {...S(INK, 1.6)} />
    <circle cx="86" cy="14" r="2.6" fill={color} />
    <circle cx="94" cy="26" r="1.8" fill={color} />
  </Frame>
);

export const Sediment = ({ color = NEON[9], size }) => (
  <Frame size={size} title="sediment core">
    <path d="M-4 30 Q24 24 52 30 T108 30" {...S(color, 1.6)} strokeOpacity="0.7" />
    <path d="M-4 40 Q24 34 52 40 T108 40" {...S(color, 1.2)} strokeOpacity="0.5" />
    <rect x="34" y="44" width="30" height="52" {...S(color, 2.2)} />
    {[52, 60, 66, 72, 77, 82, 86, 90, 93].map((y, i) => (
      <line key={y} x1="34" y1={y} x2="64" y2={y} {...S(color, i % 2 ? 0.9 : 1.6)} strokeOpacity="0.8" />
    ))}
    <line x1="49" y1="18" x2="49" y2="44" {...S(INK, 2)} />
    <path d="M43 24 L49 18 L55 24" {...S(INK, 2)} />
  </Frame>
);

export const RecordBars = ({ color = NEON[0], size }) => (
  <Frame size={size} title="record year">
    {[[10, 62], [20, 58], [30, 64], [40, 52], [50, 46], [60, 50], [70, 30], [80, 18], [90, 26]].map(([x, y], i) => (
      <g key={x}>
        <rect x={x - 6} y={y} width="11" height={92 - y} {...(i === 7 ? { fill: color } : W(color, 0.22))} />
        <rect x={x - 6} y={y} width="11" height={92 - y} {...S(color, 1.6)} />
      </g>
    ))}
    <line x1="0" y1="92" x2="100" y2="92" {...S(INK, 2)} />
    <path d="M74 10 L80 4 L86 10" {...S(color, 2.4)} />
  </Frame>
);

export const Fingerprint = ({ color = NEON[3], size }) => (
  <Frame size={size} title="human fingerprint">
    {[10, 19, 28, 37].map((r, i) => (
      <path key={r} d={`M${50 - r} 58 a${r} ${r} 0 0 1 ${2 * r} 0`} {...S(color, 2.2 - i * 0.25)} />
    ))}
    <path d="M50 58 L50 92" {...S(color, 2.2)} />
    <path d="M31 58 q19 26 38 0" {...S(color, 1.4)} strokeDasharray="4 4" />
    <line x1="0" y1="92" x2="100" y2="92" {...S(INK, 2)} />
  </Frame>
);

export const Datasets = ({ color = NEON[5], size }) => (
  <Frame size={size} title="independent datasets">
    {[0, 1, 2, 3].map((k) => (
      <path key={k}
        d={`M4 ${76 - k * 5} Q30 ${70 - k * 5} 52 ${52 - k * 4} T100 ${20 - k * 5}`}
        {...S(color, 2.2 - k * 0.35)} strokeOpacity={1 - k * 0.18} />
    ))}
    <line x1="4" y1="92" x2="100" y2="92" {...S(INK, 2)} />
    <line x1="4" y1="8" x2="4" y2="92" {...S(INK, 1.6)} />
  </Frame>
);

export const RateArrow = ({ color = NEON[0], size }) => (
  <Frame size={size} title="rate of change">
    <line x1="6" y1="92" x2="100" y2="92" {...S(INK, 2)} />
    <line x1="6" y1="8" x2="6" y2="92" {...S(INK, 1.6)} />
    <path d="M10 82 L46 60 L70 34 L94 12" {...S(color, 3)} />
    <path d="M78 14 L94 12 L92 28" {...S(color, 3)} />
    <path d="M10 82 L46 60 L70 34 L94 12 L94 92 L10 92 Z" {...W(color, 0.10)} />
    <path d="M46 60 l10 0 M70 34 l10 0" {...S(color, 1.2)} strokeOpacity="0.5" />
  </Frame>
);

export const Budget = ({ color = NEON[7], size }) => (
  <Frame size={size} title="remaining budget">
    <rect x="6" y="30" width="88" height="34" {...S(INK, 2)} />
    <rect x="8" y="32" width="58" height="30" {...W(color, 0.5)} />
    <line x1="66" y1="22" x2="66" y2="72" {...S(color, 2.6)} />
    <path d="M60 26 L66 20 L72 26" {...S(color, 2.2)} />
    {[20, 34, 48].map((x) => <line key={x} x1={x} y1="32" x2={x} y2="62" {...S('#f4f0e4', 1.4)} strokeOpacity="0.55" />)}
    <text x="80" y="52" textAnchor="middle" fill={color}
      style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 700 }}>?</text>
    <line x1="6" y1="80" x2="94" y2="80" {...S(INK, 1)} strokeOpacity="0.3" />
  </Frame>
);

export const Smokestack = ({ color = NEON[9], size }) => (
  <Frame size={size} title="emissions">
    <path d="M26 92 L26 40 L44 40 L44 92" {...S(color, 2.4)} />
    <path d="M26 40 L26 92 L44 92 L44 40 Z" {...W(color, 0.13)} />
    <path d="M56 92 L56 54 L70 54 L70 92" {...S(color, 2)} />
    {[34, 62].map((x, i) => (
      <path key={x} d={`M${x} ${i ? 48 : 34} q-9 -11 1 -18 q10 -7 3 -16`} {...S(color, 2 - i * 0.4)} strokeOpacity={0.9 - i * 0.2} />
    ))}
    <line x1="0" y1="92" x2="100" y2="92" {...S(INK, 2.2)} />
    <line x1="30" y1="52" x2="40" y2="52" {...S(color, 1.2)} strokeOpacity="0.6" />
  </Frame>
);

export const Dial = ({ color = NEON[4], size }) => (
  <Frame size={size} title="probability">
    <path d="M12 76 A38 38 0 0 1 88 76" {...S(INK, 2)} />
    <path d="M12 76 A38 38 0 0 1 74 46" {...S(color, 6)} />
    <line x1="50" y1="76" x2="72" y2="48" {...S(color, 2.6)} />
    <circle cx="50" cy="76" r="5" fill={color} />
    {[14, 50, 86].map((x, i) => <line key={x} x1={x} y1={i === 1 ? 34 : 70} x2={x} y2={i === 1 ? 40 : 76} {...S(INK, 1.4)} />)}
  </Frame>
);

export const ProjectionFan = ({ color = NEON[7], size }) => (
  <Frame size={size} title="projection">
    <line x1="6" y1="92" x2="100" y2="92" {...S(INK, 2)} />
    <path d="M8 74 Q28 68 48 56" {...S(INK, 2.6)} />
    <path d="M48 56 Q70 48 100 42 L100 6 Q70 34 48 56 Z" {...W(color, 0.14)} />
    <path d="M48 56 Q70 26 100 6" {...S(color, 2.2)} />
    <path d="M48 56 Q72 44 100 26" {...S(color, 2.6)} />
    <path d="M48 56 Q70 50 100 44" {...S(color, 2.2)} />
    <circle cx="48" cy="56" r="4" fill={INK} />
    <line x1="48" y1="12" x2="48" y2="92" {...S(INK, 1)} strokeDasharray="3 3" strokeOpacity="0.45" />
  </Frame>
);

export const Molecule = ({ color = NEON[8], size }) => (
  <Frame size={size} title="greenhouse gas molecule">
    <line x1="26" y1="50" x2="47" y2="50" {...S(color, 2)} />
    <line x1="26" y1="56" x2="47" y2="56" {...S(color, 2)} />
    <line x1="53" y1="50" x2="74" y2="50" {...S(color, 2)} />
    <line x1="53" y1="56" x2="74" y2="56" {...S(color, 2)} />
    <circle cx="50" cy="53" r="13" {...W(color, 0.22)} />
    <circle cx="50" cy="53" r="13" {...S(color, 2.4)} />
    <circle cx="18" cy="53" r="9" {...S(color, 2.2)} />
    <circle cx="82" cy="53" r="9" {...S(color, 2.2)} />
    <path d="M50 26 q8 -8 0 -16 M38 30 q-9 -7 -2 -15" {...S(color, 1.5)} strokeOpacity="0.75" />
  </Frame>
);

export const GlacierMass = ({ color = NEON[5], size }) => (
  <Frame size={size} title="glacier mass loss">
    <path d="M4 70 L30 24 L52 52 L70 30 L96 70" {...S(color, 2.4)} />
    <path d="M4 70 L30 24 L52 52 L70 30 L96 70 Z" {...W(color, 0.13)} />
    <path d="M18 70 L96 70" {...S(INK, 2)} />
    <path d="M22 78 L34 78 M44 78 L60 78 M70 78 L88 78" {...S(color, 1.6)} strokeOpacity="0.7" />
    {[30, 52, 74].map((x, i) => (
      <g key={x}>
        <line x1={x} y1="82" x2={x} y2="93" {...S(color, 1.8)} />
        <path d={`M${x - 4} 89 L${x} 94 L${x + 4} 89`} {...S(color, 1.8)} />
      </g>
    ))}
  </Frame>
);

export const Anomaly = ({ color = NEON[2], size }) => (
  <Frame size={size} title="anomaly against a baseline">
    <line x1="4" y1="52" x2="100" y2="52" {...S(INK, 2.4)} strokeDasharray="7 4" />
    {[[12, 60], [22, 56], [32, 62], [42, 50], [52, 46], [62, 40], [72, 32], [82, 26], [92, 20]].map(([x, y]) => (
      <rect key={x} x={x - 4} y={Math.min(y, 52)} width="8" height={Math.abs(52 - y)}
        fill={y < 52 ? color : 'none'} stroke={color} strokeWidth="1.6" opacity={y < 52 ? 0.85 : 1} />
    ))}
    <text x="6" y="46" fill={INK} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8 }}>0</text>
  </Frame>
);

export const ART = {
  records: RecordBars, fingerprint: Fingerprint, datasets: Datasets, rate: RateArrow,
  budget: Budget, smokestack: Smokestack, dial: Dial, projection: ProjectionFan,
  molecule: Molecule, glaciermass: GlacierMass, anomaly: Anomaly,
  energy: EnergyBalance, greenhouse: Greenhouse, icecore: IceCore, keeling: KeelingCurve,
  glacier: Glacier, ocean: OceanHeat, satellite: Satellite, carbon: CarbonCycle,
  thermometer: Thermometer, seaice: SeaIce, globe: Globe, assembly: Assembly,
  network: Network, buoy: Buoy, attribution: Attribution, telescope: Telescope,
  sediment: Sediment,
};
const KEYS = Object.keys(ART);

export function artFor(key) {
  const s = String(key || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return KEYS[h % KEYS.length];
}

export function Art({ id, color, size = 64, forKey }) {
  const chosen = (id && ART[id]) ? id : artFor(forKey || id || '');
  const C = ART[chosen];
  return <C color={color || neonFull(KEYS.indexOf(chosen))} size={size} />;
}

export function ArtBand({ id, forKey, color = NEON[0], height = 130, echoes = 3 }) {
  const big = height - 14;
  return (
    <div style={{
      position: 'relative', height, overflow: 'hidden', marginBottom: 10,
      borderBottom: '2px solid ' + color,
      background: `linear-gradient(100deg, ${color}30 0%, ${color}12 42%, ${color}05 100%)`,
    }}>
      <svg width="100%" height={height} style={{ position: 'absolute', inset: 0, opacity: 0.16 }} aria-hidden="true">
        <defs>
          <pattern id={`hatch-${color.slice(1)}`} width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="11" stroke={color} strokeWidth="2.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#hatch-${color.slice(1)})`} />
      </svg>
      {Array.from({ length: echoes }).map((_, i) => {
        const s = big * (1 - i * 0.26);
        return (
          <div key={i} aria-hidden={i > 0} style={{
            position: 'absolute', left: 10 + i * (big * 0.82), top: (height - s) / 2,
            opacity: i === 0 ? 1 : 0.3 - i * 0.09,
          }}>
            <Art id={id} forKey={forKey} color={color} size={s} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 46, background: 'linear-gradient(90deg, transparent, rgba(244,240,228,0.85))' }} />
    </div>
  );
}

const EMBLEMS = {
  state: { marks: [['thermometer', NEON[0], 150, 0, 40], ['records', NEON[4], 118, 132, 66], ['dial', NEON[1], 96, 224, 20]], rule: NEON[0] },
  projects: { marks: [['network', NEON[3], 150, 8, 34], ['satellite', NEON[5], 112, 138, 12], ['buoy', NEON[1], 104, 218, 96]], rule: NEON[3] },
  orgs: { marks: [['assembly', NEON[1], 148, 4, 44], ['globe', NEON[5], 118, 128, 20], ['network', NEON[2], 100, 214, 90]], rule: NEON[1] },
  deeptime: { marks: [['icecore', NEON[5], 156, 6, 30], ['sediment', NEON[9], 120, 130, 74], ['glacier', NEON[1], 112, 208, 20]], rule: NEON[5] },
  models: { marks: [['energy', NEON[0], 150, 0, 36], ['projection', NEON[7], 126, 126, 22], ['globe', NEON[5], 100, 214, 86]], rule: NEON[7] },
  methods: { marks: [['anomaly', NEON[2], 148, 2, 40], ['datasets', NEON[5], 120, 128, 18], ['rate', NEON[8], 104, 210, 88]], rule: NEON[2] },
  news: { marks: [['telescope', NEON[8], 148, 4, 26], ['attribution', NEON[6], 122, 130, 66], ['carbon', NEON[4], 100, 214, 18]], rule: NEON[8] },
  game: { marks: [['energy', NEON[2], 150, 0, 38], ['carbon', NEON[4], 120, 128, 70], ['budget', NEON[7], 100, 214, 18]], rule: NEON[2] },
};

export function PageEmblem({ page, width = 300, style = {} }) {
  const e = EMBLEMS[page] || EMBLEMS.state;
  const box = React.useRef(null);
  const [w, setW] = React.useState(width);
  React.useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => setW(Math.min(width, el.clientWidth || width));
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  const scale = w / 300;
  return (
    <div ref={box} aria-hidden="true" style={{ position: 'relative', width: '100%', maxWidth: width, height: 240 * scale, ...style }}>
      <svg width={w} height={240 * scale} viewBox="0 0 300 240" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={`emb-${page}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={e.rule} stopOpacity="0.16" />
            <stop offset="100%" stopColor={e.rule} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="240" fill={`url(#emb-${page})`} />
        <line x1="0" y1="6" x2="300" y2="6" stroke={e.rule} strokeWidth="4" />
        <line x1="0" y1="232" x2="240" y2="232" stroke={INK} strokeWidth="2" opacity="0.35" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={i * 42 + 8} y1="222" x2={i * 42 + 8} y2="232" stroke={e.rule} strokeWidth="2" opacity={0.5 - i * 0.05} />
        ))}
      </svg>
      {e.marks.map(([id, color, size, x, y], i) => (
        <div key={i} style={{ position: 'absolute', left: x * scale, top: y * scale }}>
          <Art id={id} color={color} size={size * scale} />
        </div>
      ))}
    </div>
  );
}
