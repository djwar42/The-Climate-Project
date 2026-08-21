import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { mono, reading, legibleInk, Bracket, SepMark } from './theme.jsx';
import { fmtYear } from './years.js';

const PAPER = '#f4f0e4';
const INK = 'var(--sui-ink, #2a2722)';
const INK_HEX = '#2a2722';

const RULE_WEIGHTS = {
  hair: { border: '1px solid rgba(42,39,34,0.3)' },
  rule: { border: '1px solid ' + INK },
  heavy: { border: '2px solid ' + INK },
};
export function Rule({ weight = 'hair', color, lead = 0, style = {} }) {
  const w = RULE_WEIGHTS[weight] || RULE_WEIGHTS.hair;
  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }} aria-hidden="true">
      {lead > 0 && color && (
        <span style={{ width: lead, height: weight === 'heavy' ? 3 : 2, background: color, flex: 'none' }} />
      )}
      <span style={{ flex: 1, borderTop: w.border }} />
    </div>
  );
}

export function CropFrame({ children, color, size = 14, inset = -10, weight = 2, style = {} }) {
  const c = color || INK;
  const arm = (extra) => ({ position: 'absolute', background: c, ...extra });
  return (
    <div style={{ position: 'relative', ...style }}>
      <span aria-hidden="true" style={{ position: 'absolute', inset, pointerEvents: 'none' }}>
        <span style={arm({ left: 0, top: 0, width: size, height: weight })} />
        <span style={arm({ left: 0, top: 0, width: weight, height: size })} />
        <span style={arm({ right: 0, top: 0, width: size, height: weight })} />
        <span style={arm({ right: 0, top: 0, width: weight, height: size })} />
        <span style={arm({ left: 0, bottom: 0, width: size, height: weight })} />
        <span style={arm({ left: 0, bottom: 0, width: weight, height: size })} />
        <span style={arm({ right: 0, bottom: 0, width: size, height: weight })} />
        <span style={arm({ right: 0, bottom: 0, width: weight, height: size })} />
      </span>
      {children}
    </div>
  );
}

export function StackButton({ children, href, onClick, color, disabled, title, style = {} }) {
  const c = color || INK;
  const base = {
    ...mono, fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase',
    display: 'block', width: '100%', textAlign: 'left', boxSizing: 'border-box',
    border: '1px solid ' + c, background: 'transparent', color: legibleInk(c),
    padding: '9px 12px', cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none', '--tcp-focus': c, ...style,
  };
  const cls = 'tcp-focus tcp-hoverfill' + (disabled ? ' tcp-disabled' : '');
  return href
    ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={cls} title={title} style={base}>{children}</a>
    : <button type="button" onClick={disabled ? undefined : onClick} disabled={!!disabled} className={cls} title={title} style={base}>{children}</button>;
}

export function ButtonStack({ children, style = {} }) {
  return <div style={{ display: 'grid', gap: 5, marginTop: 14, ...style }}>{children}</div>;
}

export function InlineLink({ href, children, color, external, style = {} }) {
  const ext = external ?? /^https?:/.test(String(href || ''));
  return (
    <a
      href={href}
      target={ext ? '_blank' : undefined}
      rel={ext ? 'noreferrer' : undefined}
      className="tcp-link tcp-focus"
      style={{ '--tcp-neon': color || 'currentColor', '--tcp-focus': color || INK, ...style }}
    >
      {children}
      {ext && <span style={{ ...mono, fontSize: '0.8em', paddingLeft: 4 }} aria-hidden="true">&#8599;</span>}
      {ext && <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}> (opens in a new tab)</span>}
    </a>
  );
}

function useDismiss(open, close, ref) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [open, close, ref]);
}

const CORNERS = {
  'bottom-left': { bottom: 16, left: 16 },
  'bottom-right': { bottom: 16, right: 16 },
  'top-left': { top: 16, left: 16 },
  'top-right': { top: 16, right: 16 },
};
export function SideFolder({
  label, title, children, actions, corner = 'bottom-left', color, onClose,
  width = 330, fixed = true, style = {},
}) {
  const c = color || INK;
  const ref = useRef(null);
  const close = useCallback(() => onClose && onClose(), [onClose]);
  useDismiss(!!onClose, close, ref);
  return (
    <aside
      ref={ref}
      style={{
        position: fixed ? 'fixed' : 'relative', ...(fixed ? CORNERS[corner] || CORNERS['bottom-left'] : null),
        width, maxWidth: 'calc(100vw - 32px)', zIndex: 80, ...style,
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <div style={{
          ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: legibleInk(c), background: PAPER, borderTop: '1px solid ' + INK, borderLeft: '1px solid ' + INK,
          padding: '5px 20px 4px 12px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)',
          display: 'inline-flex', alignItems: 'center', gap: 7,
        }}>
          <svg width="13" height="11" viewBox="0 0 13 11" aria-hidden="true">
            <path d="M0.6 10.4 V1.6 h4.3 l1.3 1.7 H12.4 V10.4 Z" fill={legibleInk(c)} />
          </svg>
          {label}
        </div>
        <span style={{ flex: 1 }} />
        {onClose && (
          <button type="button" onClick={close} aria-label={`Close ${label || 'panel'}`} className="tcp-focus tcp-hoverfill"
            style={{ ...mono, fontSize: 11, lineHeight: 1, background: PAPER, border: '1px solid ' + INK, borderBottom: 'none', color: INK, padding: '5px 8px 4px', cursor: 'pointer', '--tcp-focus': c }}>
            &#215;
          </button>
        )}
      </div>
      <div className="tcp-pop" style={{ background: PAPER, border: '1px solid ' + INK, borderTop: '3px solid ' + c, padding: '14px 16px 16px', color: INK }}>
        {title && <div style={{ ...mono, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>}
        <div style={{ ...reading, fontSize: 13.2, lineHeight: 1.6 }}>{children}</div>
        {actions && <ButtonStack>{actions}</ButtonStack>}
      </div>
    </aside>
  );
}

export function DataTable({ cols = [], rows = [], color, caption, style = {} }) {
  const c = legibleInk(color || INK);
  return (
    <div role="region" tabIndex={0} aria-label={caption || 'Data table'} className="tcp-focus" style={{ overflowX: 'auto', '--tcp-focus-offset': '1px' }}>
    <table className="tcp-table" style={{ ...mono, fontSize: 12, ...style }}>
      {caption && <caption style={{ ...mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'left', paddingBottom: 8, color: c }}>{caption}</caption>}
      <thead>
        <tr>
          {cols.map((col) => (
            <th key={col.key} scope="col" className={col.num ? 'tcp-num' : undefined}
              style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', width: col.width }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.key ?? i}>
            {cols.map((col) => (
              <td key={col.key} className={col.num ? 'tcp-num' : undefined}
                style={{ ...(col.num ? mono : reading), fontSize: col.num ? 12.5 : 13.4, color: col.color || 'inherit' }}>
                {r[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

export function Cursor({ color }) {
  return <span className="tcp-cursor" aria-hidden="true" style={{ display: 'inline-block', width: '0.55em', height: '1em', verticalAlign: '-0.15em', marginLeft: '0.35em', background: color || 'currentColor' }} />;
}

export function LoadingLine({ children, color, style = {} }) {
  return (
    <div role="status" aria-live="polite" style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: color || 'inherit', opacity: color ? 1 : 0.9, ...style }}>
      <span style={{ opacity: 0.6 }}>$ </span>{children}<Cursor color={color} />
    </div>
  );
}

export function Counter({ n, total, color, style = {} }) {
  const c = legibleInk(color || INK);
  return (
    <Bracket color={c} style={{ ...mono, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', ...style }}>
      {total == null ? n : `${n}/${total}`}
    </Bracket>
  );
}

export const REGISTER_META = {
  observed: {
    color: '#00d084', tag: 'OBSERVED', shape: 'disc',
    gloss: 'A measurement or a published figure from a named source, with a date. It has a URL.',
  },
  inference: {
    color: '#7b1fe0', tag: 'INFERENCE', shape: 'diamond',
    gloss: 'Our reading of what the observed facts imply. Never presented in the voice of a measurement.',
  },
  mundane: {
    color: '#2a2722', tag: 'MUNDANE READING', shape: 'ring',
    gloss: 'The boring alternative explanation, recorded beside the interesting one so you can take it.',
  },
};

export function RegisterGlyph({ register, size = 9, color, style = {} }) {
  const r = REGISTER_META[register];
  if (!r) return null;
  const c = color || (r.color === '#2a2722' ? INK : r.color);
  const base = { display: 'inline-block', width: size, height: size, flex: 'none', ...style };
  if (r.shape === 'ring') return <span aria-hidden="true" style={{ ...base, border: '1.6px solid ' + c, borderRadius: '50%', boxSizing: 'border-box' }} />;
  if (r.shape === 'diamond') return <span aria-hidden="true" style={{ ...base, background: c, transform: 'rotate(45deg)' }} />;
  return <span aria-hidden="true" style={{ ...base, background: c, borderRadius: '50%' }} />;
}

export function RegisterBlock({ register, children, tag, style = {} }) {
  const r = REGISTER_META[register];
  if (!r) return <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, maxWidth: '72ch', margin: '12px 0', ...style }}>{children}</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 10, margin: '12px 0', ...style }}>
      <div style={{ position: 'relative', borderLeft: '3px solid ' + r.color }}>
        <span style={{ position: 'absolute', left: 6, top: 4, lineHeight: 0 }}>
          <RegisterGlyph register={register} size={9} />
        </span>
      </div>
      <div>
        <div style={{ ...mono, fontSize: 11.5, letterSpacing: '0.06em', fontWeight: 700, color: r.color === '#2a2722' ? INK : r.color }}>{tag || r.tag}</div>
        <p style={{ ...reading, fontSize: 15, lineHeight: 1.65, maxWidth: '72ch', margin: '3px 0 0' }}>{children}</p>
      </div>
    </div>
  );
}

export function RegisterKey({ counts = {}, style = {} }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', alignItems: 'center', ...style }}>
      {Object.entries(REGISTER_META).map(([k, r]) => (
        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <RegisterGlyph register={k} size={9} />
          <span style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{r.tag}</span>
          <Counter n={counts[k] ?? 0} color={r.color} />
        </span>
      ))}
    </div>
  );
}

export function SourceMark({ source, url, date, register = 'observed', note, color, children, style = {} }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);
  const r = REGISTER_META[register] || REGISTER_META.observed;
  const c = color || (r.color === '#2a2722' ? INK_HEX : r.color);
  const onFill = legibleInk(c) === c ? PAPER : INK_HEX;
  return (
    <span ref={ref} style={{ position: 'relative', whiteSpace: 'nowrap', ...style }}>
      {children}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`Source for this figure: ${source}`}
        className="tcp-focus tcp-hoverfill"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 19, height: 19, verticalAlign: 'super', marginLeft: 4, padding: 0,
          border: '1px solid ' + c, background: open ? c : 'transparent',
          cursor: 'pointer', '--tcp-focus': c,
        }}>
        {}
        <svg width="11" height="9" viewBox="0 0 13 11" aria-hidden="true">
          <path d="M0.8 10.2 V1.8 h4.2 l1.3 1.7 H12.2 V10.2 Z"
            fill="none" stroke={open ? onFill : legibleInk(c)} strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <span
          id={id}
          role="dialog"
          aria-label={`Source: ${source}`}
          className="tcp-pop"
          style={{
            position: 'absolute', left: 0, top: 'calc(100% + 10px)', zIndex: 90, width: 300,
            maxWidth: 'calc(100vw - 40px)', whiteSpace: 'normal', display: 'block',
            background: PAPER, border: '1px solid ' + INK, borderTop: '3px solid ' + c,
            padding: '11px 13px 13px', textAlign: 'left', color: INK,
          }}>
          <span style={{ ...mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: legibleInk(c), display: 'block' }}>
            {r.tag}
          </span>
          <span style={{ ...mono, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', display: 'block', marginTop: 5 }}>{source}</span>
          {date && (
            <span style={{ ...mono, fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', display: 'block', marginTop: 5, opacity: 0.9 }}>
              ACCESSED {date}
            </span>
          )}
          {note && <span style={{ ...reading, fontSize: 12.6, lineHeight: 1.55, display: 'block', marginTop: 8 }}>{note}</span>}
          {url && (
            <span style={{ display: 'block', marginTop: 11 }}>
              <StackButton href={url} color={c}>[ ] OPEN THE SOURCE</StackButton>
            </span>
          )}
        </span>
      )}
    </span>
  );
}

const DT_DEFAULT_SPAN = [-803718, 2026];
export function DeepTimeTick({ year, span = DT_DEFAULT_SPAN, color, width = 150, label = true, scale = true, style = {} }) {
  const [oldest, now] = span;
  const total = Math.log10(1 + Math.max(1, now - oldest));
  const pos = (y) => {
    const back = Math.max(0, Math.min(now - oldest, now - y));
    return 1 - Math.log10(1 + back) / total;
  };
  const c = color || INK;
  const marks = [1e3, 1e4, 1e5].filter((k) => now - k > oldest);
  const x = Number.isFinite(year) ? pos(year) : null;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, ...style }}>
      <span
        role="img"
        aria-label={`${fmtYear(year)} on the record, ${Math.round((x ?? 0) * 100)} per cent of the way from ${fmtYear(oldest)} to ${fmtYear(now)}, log scale`}
        style={{ position: 'relative', display: 'block', width, height: 13, borderBottom: '1px solid ' + INK }}>
        {marks.map((k) => (
          <span key={k} aria-hidden="true" style={{ position: 'absolute', left: `${pos(now - k) * 100}%`, bottom: 0, width: 1, height: 5, background: INK, opacity: 0.45 }} />
        ))}
        {x != null && (
          <>
            <span aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: 0, width: `${x * 100}%`, height: 3, background: c, opacity: 0.28 }} />
            <span aria-hidden="true" style={{ position: 'absolute', left: `calc(${x * 100}% - 1px)`, bottom: 0, width: 2, height: 13, background: c }} />
          </>
        )}
      </span>
      {label && (
        <span style={{ ...mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', gap: 6, alignItems: 'baseline' }}>
          <span style={{ color: legibleInk(c), fontWeight: 700 }}>{fmtYear(year)}</span>
          {scale && <span style={{ opacity: 0.85 }}><SepMark />LOG SCALE, {fmtYear(oldest)} TO {fmtYear(now)}</span>}
        </span>
      )}
    </span>
  );
}

export function GateState({ gates = [], color, title = 'THE GATES', style = {} }) {
  const state = (g) => (g.ok === true ? 'OK' : g.ok === false ? 'FAIL' : 'UNKNOWN');
  const worst = gates.some((g) => g.ok === false) ? 'FAIL' : gates.some((g) => g.ok !== true) ? 'UNKNOWN' : 'OK';
  const c = color || INK;
  return (
    <div style={{ ...mono, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontWeight: 700, color: legibleInk(c) }}>{title}</span>
        <Bracket color={legibleInk(c)} style={{ fontSize: 10.5, fontWeight: 700 }}>{worst}</Bracket>
      </div>
      <div style={{ marginTop: 6, lineHeight: 1.95 }}>
        {gates.map((g, i) => (
          <div key={g.name || i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <span style={{ opacity: 0.6 }}>$</span>
            <span style={{ flex: 1, minWidth: 0 }}>{g.name}</span>
            {g.at && <span style={{ opacity: 0.85 }}>{g.at}</span>}
            <Bracket color={legibleInk(c)} style={{ fontSize: 10, fontWeight: 700 }}>{state(g)}</Bracket>
          </div>
        ))}
        {gates.length === 0 && <div><span style={{ opacity: 0.6 }}>$ </span>NO GATE RESULT IN HAND</div>}
      </div>
    </div>
  );
}

export function SkipLink({ href = '#main', children = 'SKIP TO THE CONTENT' }) {
  const jump = (e) => {
    if (typeof document === 'undefined' || !href.startsWith('#')) return;
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    e.preventDefault();
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'start' });
  };
  return (
    <a href={href} onClick={jump} className="tcp-skip tcp-focus" style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: PAPER, border: '1px solid ' + INK, color: INK, padding: '7px 12px', textDecoration: 'none' }}>
      {children}
    </a>
  );
}
