import React, { useEffect } from 'react';
import { TYPE, D, FLUID, FACE, ls, TABULAR } from './type.js';

const KIT_CSS = `
:root { --tcp-ease: var(--cm-ease, var(--ease-power2Out, cubic-bezier(0.165, 0.84, 0.44, 1))); }

.tcp-focus { position: relative; }
.tcp-focus:focus { outline: none; }
.tcp-focus:focus-visible { outline: 2px solid var(--tcp-focus, #2a2722); outline-offset: var(--tcp-focus-offset, 3px); }
.tcp-focus:focus-visible::after {
  content: ''; position: absolute; pointer-events: none;
  inset: calc(-1 * (var(--tcp-focus-offset, 3px) + 4px));
  background:
    linear-gradient(var(--tcp-focus,#2a2722),var(--tcp-focus,#2a2722)) 0 0/12px 2px no-repeat,
    linear-gradient(var(--tcp-focus,#2a2722),var(--tcp-focus,#2a2722)) 0 0/2px 12px no-repeat,
    linear-gradient(var(--tcp-focus,#2a2722),var(--tcp-focus,#2a2722)) 100% 0/12px 2px no-repeat,
    linear-gradient(var(--tcp-focus,#2a2722),var(--tcp-focus,#2a2722)) 100% 0/2px 12px no-repeat,
    linear-gradient(var(--tcp-focus,#2a2722),var(--tcp-focus,#2a2722)) 0 100%/12px 2px no-repeat,
    linear-gradient(var(--tcp-focus,#2a2722),var(--tcp-focus,#2a2722)) 0 100%/2px 12px no-repeat,
    linear-gradient(var(--tcp-focus,#2a2722),var(--tcp-focus,#2a2722)) 100% 100%/12px 2px no-repeat,
    linear-gradient(var(--tcp-focus,#2a2722),var(--tcp-focus,#2a2722)) 100% 100%/2px 12px no-repeat;
}
.tcp-skip { position: absolute; left: -9999px; top: 0; z-index: 200; }
.tcp-skip:focus { left: 8px; top: 8px; }

.tcp-row { transition: box-shadow 0.25s var(--tcp-ease); }
.tcp-row-live:hover {
  box-shadow: inset 3px 0 0 var(--tcp-neon, #2a2722), inset 0 0 0 999px rgba(42,39,34,0.045);
}
.tcp-row-live > :last-child { transition: transform 0.25s var(--tcp-ease); }
.tcp-row-live:hover > :last-child { transform: translateX(3px); }

@media (max-width: 620px) {
  .tcp-row { grid-template-columns: minmax(0, 1fr) !important; gap: 5px 0 !important; }
  .tcp-row > :last-child { justify-self: start !important; }
}

@media (max-width: 760px) {
  .tcp-statementband { grid-template-columns: minmax(0, 1fr) !important; gap: 18px !important; }
  .tcp-statementband > :first-child { height: 210px !important; }
}

@media (max-width: 760px) {
  .tcp-split { grid-template-columns: minmax(0, 1fr) !important; gap: 24px !important; }
}

a { overflow-wrap: break-word; }

.tcp-link {
  color: inherit; text-decoration: none; padding-bottom: 1px;
  border-bottom: 1px solid rgba(42,39,34,0.45);
  background-image: linear-gradient(var(--tcp-neon, currentColor), var(--tcp-neon, currentColor));
  background-repeat: no-repeat; background-position: 0 100%; background-size: 0% 2px;
  transition: background-size 0.4s var(--tcp-ease);
}
.tcp-link:hover, .tcp-link:focus-visible { background-size: 100% 2px; }

.tcp-hoverfill { transition: box-shadow 0.25s var(--tcp-ease); }
.tcp-hoverfill:hover:not(.tcp-disabled) { box-shadow: inset 0 0 0 999px rgba(42,39,34,0.09); }

.tcp-disabled { cursor: not-allowed; position: relative; }
.tcp-disabled::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(45deg, rgba(42,39,34,0.20) 0 1px, transparent 1px 6px);
}

.tcp-table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
.tcp-table th, .tcp-table td { text-align: left; padding: 8px 14px 8px 0; vertical-align: baseline; }
.tcp-table thead th { border-bottom: 1px solid #2a2722; }
.tcp-table tbody td { border-bottom: 1px solid rgba(42,39,34,0.22); }
.tcp-table tbody tr { transition: background-color 0.25s var(--tcp-ease); }
.tcp-table tbody tr:hover { background: rgba(42,39,34,0.05); }
.tcp-num { text-align: right !important; font-variant-numeric: tabular-nums; }

@keyframes tcp-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
.tcp-cursor { animation: tcp-blink 1.05s steps(1) infinite; }

.tcp-pop { box-shadow: 5px 5px 0 rgba(42,39,34,0.16); }

@media (prefers-reduced-motion: reduce) {
  .tcp-row, .tcp-row-live > :last-child, .tcp-link, .tcp-hoverfill, .tcp-table tbody tr { transition: none !important; }
  .tcp-cursor { animation: none !important; }
  .tcp-link { background-size: 100% 2px; }
}
.animations-disabled .tcp-row, .animations-disabled .tcp-link,
.animations-disabled .tcp-hoverfill, .animations-disabled .tcp-cursor { transition: none !important; animation: none !important; }
`;

let kitInstalled = false;
export function installKitStyles() {
  if (kitInstalled || typeof document === 'undefined') return;
  kitInstalled = true;
  const el = document.createElement('style');
  el.setAttribute('data-tcp-kit', '1');
  el.textContent = KIT_CSS;
  document.head.appendChild(el);
}
if (typeof document !== 'undefined') installKitStyles();
export function KitStyles() { useEffect(installKitStyles, []); return null; }

export const mono = { fontFamily: FACE.mono };
export const wrap = { maxWidth: 1240, margin: '0 auto', padding: '0 24px' };
export const reading = { fontFamily: FACE.reading };
export const display = { fontFamily: FACE.display, fontWeight: 700, textTransform: 'uppercase' };

export function PageTitle({ children, sub }) {
  return (
    <>
      <h1 style={{ ...display, fontSize: 'clamp(30px, 5vw, 60px)', margin: '44px 0 8px', letterSpacing: '-0.01em' }}>
        {children}<span style={{ color: 'var(--sui-blue, #ff3c1a)' }}>.</span>
      </h1>
      {sub && <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, maxWidth: '78ch', margin: '0 0 8px' }}>{sub}</p>}
    </>
  );
}

export function RidingLabel({ children, color, art }) {
  const c = color || 'var(--sui-ink, #2a2722)';
  return (
    <div style={{ marginTop: 44 }}>
      <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: color || 'inherit', opacity: color ? 1 : 0.85, marginBottom: 6 }}>{children}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ borderTop: '2px solid ' + c, flex: 1 }} />
        {art && <div style={{ flex: 'none', lineHeight: 0, transform: 'translateY(-2px)' }}>{art}</div>}
      </div>
    </div>
  );
}

export function NeonStat({ label, value, color = 'var(--sui-blue, #ff3c1a)', valueColor }) {
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + color, background: 'rgba(42,39,34,0.04)', padding: '14px 16px' }}>
      <div style={TYPE.value({ color: valueColor || color })}>{value}</div>
      <div style={TYPE.micro({ opacity: 0.9, marginTop: 4 })}>{label}</div>
    </div>
  );
}

export function NeonCard({ color = 'var(--sui-blue, #ff3c1a)', title, children, style = {}, ...rest }) {
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + color, background: 'rgba(42,39,34,0.04)', padding: '12px 14px', ...style }} {...rest}>
      {title && <div style={TYPE.label({ bold: true, color: chipIsLightInk(color) ? 'var(--sui-ink, #2a2722)' : color, marginBottom: 6 })}>{title}</div>}
      {children}
    </div>
  );
}

export function NeonChip({ label, active, color = 'var(--sui-blue, #ff3c1a)', onClick, disabled, title }) {
  const light = chipIsLightInk(color);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={!!disabled}
      aria-pressed={active ? true : undefined}
      title={title}
      className={'tcp-focus tcp-hoverfill' + (disabled ? ' tcp-disabled' : '')}
      style={{
        ...TYPE.label({ bold: !!active }),
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: active ? '2px solid ' + color : light ? '1px solid ' + color : '1px solid rgba(42,39,34,0.5)',
        color: active ? (light ? '#2a2722' : '#f4f0e4') : (light ? '#2a2722' : color),
        background: active ? color : 'transparent', padding: '4px 12px',
        '--tcp-focus': color,
      }}>{label}</button>
  );
}
const chipIsLightInk = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec(String(hex));
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 165;
};
export const legibleInk = (color) => (chipIsLightInk(color) ? 'var(--sui-ink, #2a2722)' : color);

export function Prose({ children, style = {} }) {
  return <p style={TYPE.reading(style)}>{children}</p>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function DropCapDate({ value, color }) {
  const m = /^(\d{3,4})-(\d{2})-(\d{2})/.exec(String(value));
  const year = m ? String(parseInt(m[1], 10)) : String(value);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ ...TYPE.value({ size: D.d9, color }), lineHeight: 0.95 }}>{year}</span>
      {m && (m[2] !== '01' || m[3] !== '01') && (
        <span style={{ ...TYPE.code({ bold: true, color }), textTransform: 'none' }}>
          {MONTHS[parseInt(m[2], 10) - 1]} {parseInt(m[3], 10)}
        </span>
      )}
    </span>
  );
}

export function TimelineRow({ left, icon, color = 'var(--sui-blue, #ff3c1a)', onClick, children, right, style = {} }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: onClick ? 'pointer' : 'default', padding: '6px 0', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 172, flex: 'none' }}>
        <DropCapDate value={left} color={color} />
        {icon && <span style={{ width: 30, height: 30, color, display: 'inline-flex', alignItems: 'center', fontSize: 18, flex: 'none' }}>{icon}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      {right}
    </div>
  );
}

export function SpineNode({ color, size = 14, left, connector = 0, style = {} }) {
  return (
    <span aria-hidden="true" style={{ position: 'absolute', left, top: '50%', transform: 'translateY(-50%)', width: size + connector, height: size, display: 'inline-block', ...style }}>
      <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', position: 'absolute', left: 0, top: 0 }}>
        <circle cx="8" cy="8" r="6" fill={color} />
        <path d="M10.6 2.7 A6.3 6.3 0 0 0 4.4 13.1" fill="none" stroke="var(--sui-ink, #2a2722)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {connector > 0 && (
        <span style={{ position: 'absolute', left: size + 2, top: '50%', width: connector - 4, height: 2, background: 'var(--sui-ink, #2a2722)', opacity: 0.3, transform: 'translateY(-50%)' }} />
      )}
    </span>
  );
}

export function DataLine({ children, color, style = {} }) {
  return <div style={TYPE.data({ color: color || 'inherit', opacity: color ? 1 : 0.9, ...style })}>{children}</div>;
}

export const SEP = '■';
export const SEP_SAFE = '·';

export function SepMark({ color, size = 0.46, gap = '0.7em', style = {} }) {
  return (
    <span aria-hidden="true" style={{
      display: 'inline-block', width: `${size}em`, height: `${size}em`,
      background: color || 'currentColor', opacity: color ? 0.85 : 0.5,
      margin: `0 ${gap}`, verticalAlign: '0.06em', ...style,
    }} />
  );
}

export function withSepMarks(node) {
  if (typeof node !== 'string' || node.indexOf(SEP) === -1) return node;
  const parts = node.split(SEP);
  const last = parts.length - 1;
  return parts.map((p, i) => {
    let t = p;
    if (i > 0) t = t.replace(/^[ \t]+/, '');
    if (i < last) t = t.replace(/[ \t]+$/, '');
    return <React.Fragment key={i}>{i > 0 && <SepMark />}{t}</React.Fragment>;
  });
}

export function Bracket({ children, color, style = {} }) {
  const c = color || 'inherit';
  return (
    <span style={{ ...mono, color: c, ...style }}>
      <span style={{ opacity: 0.55 }}>[</span>
      <span style={{ padding: '0 0.35em' }}>{children}</span>
      <span style={{ opacity: 0.55 }}>]</span>
    </span>
  );
}

export function TerminalLine({ items = [], color, style = {} }) {
  return (
    <div style={TYPE.label({ color: color || 'inherit', opacity: color ? 1 : 0.9, ...style })}>
      {items.filter(Boolean).map((t, i) => (
        <span key={i}>
          {i > 0 && <SepMark />}
          {t}
        </span>
      ))}
    </div>
  );
}

export function FolderPanel({ label, color = 'var(--sui-blue, #ff3c1a)', children, style = {}, tabStyle = {} }) {
  return (
    <div style={{ marginTop: 18, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <div style={{
          ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#f4f0e4', background: color, padding: '4px 14px 3px',
          clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)', paddingRight: 22,
          display: 'inline-flex', alignItems: 'center', gap: 7, ...tabStyle,
        }}>
          <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
            <path d="M0.5 9.5 V1.5 h4 l1.2 1.6 H11.5 V9.5 Z" fill="none" stroke="#f4f0e4" strokeWidth="1.2" />
          </svg>
          {label}
        </div>
      </div>
      <div style={{ border: '1px solid rgba(42,39,34,0.4)', borderTop: '3px solid ' + color, background: 'rgba(42,39,34,0.035)' }}>
        {children}
      </div>
    </div>
  );
}

const GIANT_PAD = 0.14;

const GLYPH_EM = { ' ': 0.26, '.': 0.30, ',': 0.30, "'": 0.26, I: 0.32, J: 0.52, M: 0.92, W: 0.96 };
const DEFAULT_EM = 0.70;
function textOf(node) {
  if (node == null || node === false) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node.props) return textOf(node.props.children);
  return '';
}
const emWidth = (str) => {
  let w = 0;
  for (const ch of str) w += GLYPH_EM[ch] ?? GLYPH_EM[ch.toUpperCase()] ?? DEFAULT_EM;
  return Math.max(1, w);
};

export function GiantType({ children, size = FLUID.giant, color, style = {} }) {
  const fit = `calc((min(100vw, ${1288}px) - 64px) / ${emWidth(textOf(children)).toFixed(2)})`;
  const fs = `min(${size}, ${fit})`;
  return (
    <div className="tcp-giant" style={{
      overflow: 'hidden',
      marginTop: `calc(${fs} * ${-GIANT_PAD})`, marginBottom: `calc(${fs} * ${-GIANT_PAD})`,
      ...style,
    }}>
      <div style={{
        ...display, fontSize: fs, lineHeight: 0.82, letterSpacing: ls(D.d0, 'upper'),
        padding: `${GIANT_PAD}em 0`,
        color: color || 'var(--sui-ink, #2a2722)', whiteSpace: 'nowrap',
      }}>{children}</div>
    </div>
  );
}

export function OutlineButton({ children, href, onClick, color, active, disabled, title, style = {} }) {
  const c = color || 'var(--sui-ink, #2a2722)';
  const base = {
    ...TYPE.micro(),
    border: '1px solid ' + c, background: active ? c : 'transparent',
    color: active ? '#f4f0e4' : c, padding: '5px 13px', cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none', display: 'inline-block', '--tcp-focus': c, ...style,
  };
  const cls = 'tcp-focus tcp-hoverfill' + (disabled ? ' tcp-disabled' : '');
  return href
    ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={cls} title={title} style={base}>{children}</a>
    : <button onClick={disabled ? undefined : onClick} disabled={!!disabled} className={cls} title={title} style={base}>{children}</button>;
}

const PAPER = '#f4f0e4';
const INK_V = 'var(--sui-ink, #2a2722)';

export function HeroBlock({ art, wash = true, washFrom = 0.42, washTo = 0.62, children, style = {} }) {
  const P = '234, 230, 220';
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {art}
      {wash && (
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(to bottom, rgba(${P},0) ${washFrom * 100}%, rgba(${P},0.52) ${washTo * 100}%, rgba(${P},0.74) 100%)`,
        }} />
      )}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

export function Statement({ children, color, style = {} }) {
  return (
    <div style={TYPE.statement({
      color: color || INK_V, marginLeft: 'min(30%, 360px)', marginTop: 34, ...style,
    })}>{children}</div>
  );
}

const FolderGlyph = ({ color = 'currentColor', size = 13 }) => (
  <svg width={size} height={Math.round(size * 0.82)} viewBox="0 0 13 11" aria-hidden="true" style={{ flex: 'none' }}>
    <path d="M0.5 10.5 V1.5 h4.4 l1.3 1.7 H12.5 V10.5 Z" fill="none" stroke={color} strokeWidth="1.2" />
  </svg>
);

export function SectionRule({ label, count, color, right, art, gap = 96, style = {} }) {
  const c = legibleInk(color || INK_V);
  return (
    <div style={{ marginTop: gap, borderTop: '1px solid ' + INK_V, paddingTop: 10, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: c }}>
          <FolderGlyph color={c} />
          <span style={TYPE.section()}>{withSepMarks(label)}</span>
          {(count || count === 0) && <Bracket color={c} style={{ fontSize: 11, fontWeight: 700 }}>{count}</Bracket>}
        </span>
        <span style={{ flex: 1 }} />
        {right}
        {art && <span style={{ lineHeight: 0 }}>{art}</span>}
      </div>
    </div>
  );
}

export function ListRow({ code, name, desc, meta, color, href, onClick, right, style = {} }) {
  const c = color || INK_V;
  const clickable = !!(href || onClick);
  const key = onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined;
  const body = (
    <div
      onClick={onClick}
      onKeyDown={key}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={'tcp-row tcp-focus' + (clickable ? ' tcp-row-live' : '')}
      style={{
        display: 'grid', gridTemplateColumns: 'minmax(84px, 150px) 1fr auto',
        gap: '4px 22px', alignItems: 'baseline', borderTop: '1px solid rgba(42,39,34,0.3)',
        padding: '13px 0 15px', cursor: clickable ? 'pointer' : 'default',
        '--tcp-neon': c, '--tcp-focus': c, '--tcp-focus-offset': '1px', ...style,
      }}>
      <span style={TYPE.micro({ opacity: 0.9, paddingTop: 2 })}>{code}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ ...TYPE.code({ bold: true, color: legibleInk(c) }), textTransform: 'uppercase' }}>{name}</span>
        {desc && <span style={TYPE.caption({ display: 'block', marginTop: 3 })}>{withSepMarks(desc)}</span>}
        {meta && <span style={TYPE.micro({ display: 'block', opacity: 0.9, marginTop: 5 })}>{withSepMarks(meta)}</span>}
      </span>
      <span style={{ justifySelf: 'end' }}>{right}</span>
    </div>
  );
  return href
    ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
         className="tcp-focus" style={{ textDecoration: 'none', color: 'inherit', display: 'block', '--tcp-focus': c, '--tcp-focus-offset': '1px' }}>{body}</a>
    : body;
}

export const ENTRY_VIEWS = ['LIST', 'GRID'];
export const DEFAULT_ENTRY_VIEW = 'GRID';

export function ViewToggle({ options = [], value, onChange, color }) {
  const c = color || INK_V;
  return (
    <span style={{ display: 'inline-flex', gap: 14, alignItems: 'baseline' }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} aria-pressed={o === value} className="tcp-focus" style={{
          ...TYPE.micro({ bold: o === value }),
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          color: o === value ? c : 'inherit', opacity: o === value ? 1 : 0.9,
          '--tcp-focus': c,
        }}>{o === value ? <Bracket color={c}>{o}</Bracket> : o}</button>
      ))}
    </span>
  );
}

export function TerminalLog({ lines = [], color, style = {} }) {
  return (
    <div style={TYPE.terminal({ color: color || 'inherit', opacity: color ? 1 : 0.9, ...style })}>
      {lines.map((l, i) => Array.isArray(l)
        ? <div key={i}><span style={{ opacity: 0.6 }}>{l[0]} </span>{withSepMarks(l[1])}</div>
        : <div key={i}>{withSepMarks(l)}</div>)}
    </div>
  );
}

export function CalcBlock({ rows = [], color, base, rule, size, style = {} }) {
  const c = base ? (color || base) : legibleInk(color || INK_V);
  const b = base || INK_V;
  const r = rule || (base ? 'rgba(244,240,228,0.26)' : 'rgba(42,39,34,0.28)');
  const px = size || 11.5;
  const cell = { fontFamily: FACE.mono, fontSize: px, letterSpacing: ls(px, 'monoData'), ...TABULAR };
  return (
    <div style={{ color: b, ...style }}>
      {rows.filter(Boolean).map((row, i) => (
        <div key={i} style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '2px 16px',
          borderTop: '1px solid ' + r, padding: '7px 0 8px', lineHeight: 1.5,
        }}>
          {row.name && (
            <span style={{
              ...cell, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: ls(px, 'monoLabel'), flex: 'none', minWidth: 84, opacity: 0.9,
            }}>{row.name}</span>
          )}
          {row.formula && (
            <span style={{ ...cell, flex: '1 1 190px', minWidth: 0, opacity: 0.9 }}>{row.formula}</span>
          )}
          {row.input && (
            <span style={{ ...cell, flex: '0 1 auto', opacity: 0.9 }}>{row.input}</span>
          )}
          {row.result && (
            <span style={{ ...cell, fontWeight: 700, color: c, marginLeft: 'auto', flex: 'none' }}>{row.result}</span>
          )}
          {row.note && (
            <span style={{ ...cell, fontSize: px - 1.5, flexBasis: '100%', opacity: 0.9 }}>{row.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function OpenFolderGlyph({ code, size = 56, color = INK_V }) {
  return (
    <svg width={size} height={Math.round(size * 0.79)} viewBox="0 0 56 44" aria-hidden="true">
      <path d="M1 41 V3 h15 l4.5 5.5 H52 V41 Z" fill={color} />
      <path d="M5 16 L53.5 13.5 L50 41 L3.5 41 Z" fill={PAPER} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {code != null && code !== '' && (
        <text x="27" y="33" textAnchor="middle" style={{ font: "500 14px 'IBM Plex Mono', monospace", fill: color }}>{code}</text>
      )}
    </svg>
  );
}

export function EmptyFolder({ code = '0', label, hint, action, href, onClick, color }) {
  const c = color || INK_V;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '110px 24px 120px', textAlign: 'center' }}>
      <OpenFolderGlyph code={code} />
      <div style={{ ...mono, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: PAPER, background: INK_V, padding: '3px 9px', marginTop: 14 }}>
        {String(label || 'THIS FOLDER IS EMPTY').replace(/\s+/g, '.')}
      </div>
      {hint && <p style={{ ...reading, fontSize: 13.8, lineHeight: 1.6, maxWidth: '52ch', margin: '16px 0 0', opacity: 0.95 }}>{hint}</p>}
      {action && (
        href
          ? <a href={href} className="tcp-focus" style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'inherit', textDecoration: 'none', marginTop: 18, '--tcp-focus': c }}><span style={{ opacity: 0.55 }}>[ ]</span> {action}</a>
          : <button onClick={onClick} className="tcp-focus" style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: 18, color: 'inherit', '--tcp-focus': c }}><span style={{ opacity: 0.55 }}>[ ]</span> {action}</button>
      )}
    </div>
  );
}

export function InkBand({ children, pad = '56px 0', style = {} }) {
  return (
    <div style={{ background: '#2a2722', color: PAPER, padding: pad, ...style }}>
      {children}
    </div>
  );
}

const isLightInk = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec(String(hex));
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 165;
};
export function TagChip({ label, color = 'var(--sui-blue, #ff3c1a)', style = {} }) {
  return (
    <span style={TYPE.micro({ bold: true, color: isLightInk(color) ? '#2a2722' : PAPER, background: color, padding: '2px 7px', ...style })}>{label}</span>
  );
}

export function MetaBar({ items = [], color, right, style = {} }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '10px 40px', alignItems: 'baseline',
      borderTop: '1px solid var(--sui-ink, #2a2722)', borderBottom: '1px solid var(--sui-ink, #2a2722)',
      padding: '10px 0', ...style,
    }}>
      {items.map(([k, v], i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
          <span style={TYPE.micro({ opacity: 0.9 })}>{k}</span>
          <span style={TYPE.metaValue({ color: color || 'inherit' })}>{withSepMarks(v)}</span>
        </span>
      ))}
      {right && <span style={{ marginLeft: 'auto', ...TYPE.micro() }}>{right}</span>}
    </div>
  );
}
