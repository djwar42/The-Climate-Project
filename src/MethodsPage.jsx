import React, { useEffect, useMemo, useState } from 'react';
import ClimateChart from './ClimateChart.jsx';
import {
  MetaBar, GiantType, TerminalLine, SectionRule, ListRow, ViewToggle,
  OutlineButton, NeonChip, DataLine, mono, wrap, display, reading, SEP, HeroBlock,
} from './theme.jsx';
import { neonFull, NEON } from './neon.js';
import { Haiku, HaikuRule } from './haiku.jsx';
import { METHODS, CATEGORIES, BY_CATEGORY, runMethod } from './methods/climate_methods.js';
import { fmtYear, spanOf } from './years.js';
import { Art, ArtBand, PageEmblem } from './art/climate_art.jsx';
import { StatementBand } from './art/abstract_art.jsx';
import MethodsHero from './art/hero/methods.jsx';
import MethodsMark from './art/mark/methods.jsx';
import { LoadingLine } from './ref_kit.jsx';

const cache = new Map();
const getJSON = (u) => {
  if (!cache.has(u)) cache.set(u, fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  return cache.get(u);
};

const CATEGORY_META = {
  TREND: { color: NEON[0], mark: 'rate', asks: 'Is it going up, and how fast?',
    body: 'Fits a line or a curve through the record and reports the slope. The whole family is sensitive to which years you start and end on, which is why every trend here states its window.' },
  ANOMALY: { color: NEON[2], mark: 'anomaly', asks: 'How does this compare with normal?',
    body: 'Expresses a value as a difference from a stated reference period. This is what the word anomaly means in climate work, and choosing the reference is a decision that changes every number downstream.' },
  VARIABILITY: { color: NEON[1], mark: 'ocean', asks: 'How much does it bounce around?',
    body: 'Measures the spread rather than the level. It sets the noise floor a trend has to be detected against, and it answers the extremes question: not how hot on average, but how often over the line.' },
  CHANGE: { color: NEON[3], mark: 'attribution', asks: 'When did it change, and is it accelerating?',
    body: 'Finds breakpoints and curvature rather than straight-line slope. The sea level literature reports exactly this kind of acceleration coefficient, and the breakpoint tests are how you ask a record when it stopped behaving as it had been.' },
  RELATION: { color: NEON[5], mark: 'network', asks: 'Does it move with something else?',
    body: 'Compares a series with itself at a lag, or with a second series. This is the only family that needs the second picker below, and the only one whose x axis is a lag or a period rather than a year.' },
};
const catOf = (c) => CATEGORY_META[c] || { color: NEON[0], mark: 'network', asks: '', body: '' };

function useIndex() {
  const [ix, setIx] = useState([]);
  useEffect(() => { getJSON('/data/series/index.json').then((d) => setIx(d?.series || [])); }, []);
  return ix;
}
function useSeries(id) {
  const [d, setD] = useState(null);
  useEffect(() => { setD(null); if (id) getJSON(`/data/series/${id}.json`).then(setD); }, [id]);
  return d;
}

function evenEnough(s) {
  if (!s || s.points.length < 6) return false;
  const gaps = [];
  for (let i = 1; i < s.points.length; i++) gaps.push(s.points[i][0] - s.points[i - 1][0]);
  const sorted = [...gaps].sort((a, b) => a - b);
  const med = sorted[sorted.length >> 1] || 1;
  return Math.max(...gaps) / med <= 3;
}
const isMonthly = (s) => s && s.cadence && /month|10-day|daily/.test(s.cadence);

function why(m, s, hasOther) {
  if (m.needs === 'even' && !evenEnough(s)) return 'NEEDS REGULAR SAMPLING - THIS SERIES IS IRREGULAR';
  if (m.needs === 'monthly' && !isMonthly(s)) return 'NEEDS SUB-ANNUAL DATA - THIS SERIES IS ANNUAL';
  if (m.needs === 'pair' && !hasOther) return 'NEEDS A SECOND SERIES - PICK ONE ABOVE';
  return null;
}

const NEEDS_LABEL = {
  any: 'ANY SERIES',
  even: 'REGULAR SAMPLING',
  monthly: 'SUB-ANNUAL DATA',
  pair: 'A SECOND SERIES',
};
const needsLabel = (n) => NEEDS_LABEL[n] || String(n).toUpperCase();

const ERA_MARK = { paleo: 'icecore', instrumental: 'thermometer', satellite: 'satellite' };
const ERA_NAME = { paleo: 'PALAEO', instrumental: 'INSTRUMENTAL', satellite: 'SATELLITE' };

function Specimen({ s, color }) {
  if (!s) return <LoadingLine style={{ marginTop: 14 }}>LOADING</LoadingLine>;
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + color, background: 'rgba(42,39,34,0.035)', marginTop: 24, paddingBottom: 14 }}>
      <ArtBand id={ERA_MARK[s.era] || 'globe'} color={color} height={112} echoes={4} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ ...display, fontSize: 'clamp(19px, 2.3vw, 27px)', color, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{s.name}</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 7 }}>
          <DataLine color={color}>{s.institution}</DataLine>
          <DataLine>{s.n.toLocaleString()} POINTS</DataLine>
          <DataLine>{fmtYear(s.first)} TO {fmtYear(s.last)}</DataLine>
          <DataLine>{spanOf(s.first, s.last).toUpperCase()}</DataLine>
          <DataLine>{String(s.unit).toUpperCase()}</DataLine>
          <DataLine color={evenEnough(s) ? NEON[4] : NEON[7]}>{evenEnough(s) ? 'REGULARLY SAMPLED' : 'IRREGULARLY SAMPLED'}</DataLine>
        </div>
        <div style={{ marginTop: 12 }}>
          <ClimateChart series={[{ name: s.name, points: s.points, band: s.band, color, width: 2 }]} height={230} yName={s.unit} slideout={false} />
        </div>
        {s.note && <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.6, maxWidth: '80ch', marginTop: 10 }}>{s.note}</p>}
      </div>
    </div>
  );
}

function MethodRunner({ m, s, other, color }) {
  const result = useMemo(() => {
    if (!s) return null;
    try { return runMethod(m, s.points, m.needs === 'pair' ? { other: other?.points } : undefined); }
    catch (e) { return { lines: {}, stats: { error: e.message } }; }
  }, [m, s, other]);

  if (!result) return null;
  const lineKeys = Object.keys(result.lines);
  const ownAxis = m.category === 'RELATION';
  const chartSeries = lineKeys.length
    ? (ownAxis
      ? lineKeys.map((k, i) => ({ name: k, points: result.lines[k], color: neonFull(i + 2), width: 2.2 }))
      : [
        { name: s.name, points: s.points, color: 'rgba(42,39,34,0.5)', width: 1.3 },
        ...lineKeys.map((k, i) => ({ name: k, points: result.lines[k], color: neonFull(i), width: 2.4 })),
      ])
    : [];

  return (
    <div style={{ borderLeft: '4px solid ' + color, paddingLeft: 16, margin: '4px 0 28px' }}>
      <DataLine color={color} style={{ fontWeight: 700 }}>RUNNING {m.id.toUpperCase()} ON {s.id ? s.id.toUpperCase() : String(s.name).toUpperCase()}</DataLine>
      {chartSeries.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <ClimateChart series={chartSeries} height={ownAxis ? 240 : 280} showLegend slideout={false}
            yName={ownAxis ? '' : s.unit} />
          {ownAxis && <DataLine style={{ opacity: 0.9, marginTop: 2 }}>X AXIS IS LAG OR PERIOD, NOT YEAR</DataLine>}
        </div>
      )}
      {Object.keys(result.stats).length > 0 && (
        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 12 }}>
          {Object.entries(result.stats).map(([k, v]) => (
            <div key={k}>
              <div style={{ ...display, fontSize: 34, lineHeight: 1, color }}>
                {typeof v === 'number' ? (Math.abs(v) < 0.001 && v !== 0 ? v.toExponential(2) : String(Number(v.toFixed(4)))) : String(v)}
              </div>
              <DataLine style={{ opacity: 0.9, marginTop: 5 }}>{k.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()}</DataLine>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MethodRow({ m, s, other, color, open, onToggle }) {
  const blocked = s ? why(m, s, !!other) : null;
  return (
    <div>
      <ListRow
        code={m.id.toUpperCase()}
        name={m.name}
        color={color}
        desc={(
          <>
            <span style={{ display: 'block' }}>{m.desc}</span>
            {m.note && (
              <span style={{ display: 'block', marginTop: 8, borderLeft: '3px solid ' + color, paddingLeft: 11 }}>
                <span style={{ ...mono, display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color, marginBottom: 2 }}>
                  HOW THIS ONE CAN MISLEAD
                </span>
                <span style={{ display: 'block' }}>{m.note}</span>
              </span>
            )}
          </>
        )}
        meta={<>NEEDS {needsLabel(m.needs)} <span style={{ opacity: 0.5, padding: '0 0.6em' }}>{SEP}</span> {m.math}</>}
        right={blocked
          ? (
            <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: 250 }}>
              <OutlineButton color={NEON[7]} disabled title={blocked}>RUN</OutlineButton>
              <span style={{ display: 'inline-block', border: '1px dashed ' + NEON[7], padding: '5px 9px' }}>
                <span style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: NEON[7], display: 'block' }}>NOT RUN</span>
                <span style={{ ...mono, fontSize: 9.5, letterSpacing: '0.07em', color: NEON[7], display: 'block', marginTop: 2 }}>{blocked}</span>
              </span>
            </span>
          )
          : (
            <OutlineButton color={color} active={open} onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); onToggle(); }}>
              {open ? 'CLOSE' : 'RUN'}
            </OutlineButton>
          )}
      />
      {open && !blocked && s && <MethodRunner m={m} s={s} other={other} color={color} />}
    </div>
  );
}

export default function MethodsPage() {
  const index = useIndex();
  const [sid, setSid] = useState('gistemp-annual');
  const [oid, setOid] = useState('co2-mauna-loa-annual');
  const [cat, setCat] = useState('ALL');
  const [view, setView] = useState('CATALOGUE');
  const [open, setOpen] = useState(() => new Set());
  const s = useSeries(sid);
  const other = useSeries(oid);
  const shown = cat === 'ALL' ? METHODS : BY_CATEGORY.get(cat) || [];
  const shownCats = cat === 'ALL' ? CATEGORIES : [cat];
  const byEra = ['instrumental', 'satellite', 'paleo'].map((era) => ({ era, items: index.filter((x) => x.era === era) }));
  const runnable = s ? METHODS.filter((m) => !why(m, s, !!other)).length : 0;
  const toggle = (id) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const isOpen = (m) => view === 'RUN ALL' || open.has(m.id);

  return (
    <main style={wrap}>
      {}
      <HeroBlock art={<MethodsHero />}>
        <MetaBar style={{ marginTop: 28 }} items={[
          ['INDEX', 'TCP-05'],
          ['CATALOGUE', 'Analysis methods'],
          ['METHODS', String(METHODS.length)],
          ['CATEGORIES', String(CATEGORIES.length)],
          ['SERIES AVAILABLE', String(index.length)],
          ['RUNS', 'Live in your browser'],
        ]} />

        <div style={{ marginTop: 30 }}>
          <GiantType>METHODS<span style={{ color: NEON[0] }}>.</span></GiantType>
        </div>
        {}
        <TerminalLine style={{ marginTop: 12 }} items={[
          `RUNNING ON ${sid.toUpperCase()}`,
          s ? `${runnable} OF ${METHODS.length} APPLY TO THIS SERIES` : 'LOADING THE SERIES',
          'NO METHOD RUNS WHERE IT DOES NOT APPLY',
        ]} />
        <StatementBand mark={<MethodsMark height={300} />}>A series does not speak for itself. The method is part of the claim.</StatementBand>
      </HeroBlock>

      <SectionRule label="WHY THIS PAGE EXISTS" color={NEON[3]} art={<Art id="datasets" color={NEON[3]} size={40} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(240px, 1fr)', gap: 40, marginTop: 22, alignItems: 'start' }}>
        <div>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0, maxWidth: '72ch' }}>
            A climate series does not speak for itself. Ask the same record how fast it is warming and you get a different
            number depending on whether you fit a straight line, take a median of pairwise slopes, or smooth it first - and
            all three are legitimate. The method is part of the claim, not a technicality that comes after it.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: '16px 0 0', maxWidth: '72ch' }}>
            So this page runs all of them, in front of you, on data you choose, and prints beside every answer the way that
            answer can be wrong. A method that does not apply to the series you picked is marked NOT RUN with the reason
            rather than run anyway - producing a plausible wrong number is the failure mode this page is built to avoid.
          </p>
        </div>
        <PageEmblem page="methods" width={300} />
      </div>

      <Haiku id="methods" />

      <SectionRule label="THE FIVE QUESTIONS" count={CATEGORIES.length} color={NEON[0]}
        art={<Art id="records" color={NEON[0]} size={40} />}
        right={<DataLine style={{ opacity: 0.9 }}>CLICK A QUESTION TO FILTER THE CATALOGUE</DataLine>} />
      <div style={{ marginTop: 14 }}>
        {CATEGORIES.map((c) => {
          const meta = catOf(c);
          const active = cat === c;
          return (
            <ListRow key={c}
              code={c}
              name={meta.asks}
              color={meta.color}
              desc={meta.body}
              meta={`${BY_CATEGORY.get(c).length} METHODS`}
              onClick={() => setCat(active ? 'ALL' : c)}
              style={active ? { background: `${meta.color}14` } : undefined}
              right={(
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: meta.color }}>
                    {active ? '[ FILTERED ]' : 'FILTER'}
                  </span>
                  <Art id={meta.mark} color={meta.color} size={40} />
                </span>
              )} />
          );
        })}
      </div>

      <SectionRule label="STEP ONE - THE SERIES EVERYTHING RUNS ON" count={index.length} color={NEON[1]}
        art={<Art id="globe" color={NEON[1]} size={40} />} />
      <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, maxWidth: '72ch', marginTop: 18 }}>
        Every method below recomputes on whichever series is selected here. The palaeo records are irregularly sampled,
        so some methods will correctly refuse to run on them.
      </p>
      {byEra.filter((g) => g.items.length).map(({ era, items }) => (
        <div key={era} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
            <Art id={ERA_MARK[era]} color={NEON[1]} size={22} />
            <DataLine color={NEON[1]} style={{ fontWeight: 700 }}>{ERA_NAME[era]} <span style={{ opacity: 0.7 }}>[{items.length}]</span></DataLine>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {items.map((x) => (
              <NeonChip key={x.id} label={x.name.length > 44 ? x.name.slice(0, 42) + '..' : x.name}
                color={neonFull(index.indexOf(x))} active={sid === x.id} onClick={() => setSid(x.id)} />
            ))}
          </div>
        </div>
      ))}
      <Specimen s={s} color={neonFull(index.findIndex((x) => x.id === sid))} />

      <HaikuRule id="flask" />

      <SectionRule label="STEP TWO - THE SECOND SERIES, FOR THE RELATION METHODS ONLY" color={NEON[5]}
        art={<Art id="network" color={NEON[5]} size={40} />} />
      <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, maxWidth: '72ch', marginTop: 18 }}>
        Only the paired methods use this. Lagged cross-correlation compares the series above against this one at every
        lead and lag, which is how you ask whether one record moves before the other. Correlation at a lag is not
        causation at a lag, and the method's caveat says so.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        {index.map((x, i) => (
          <NeonChip key={x.id} label={x.id} color={neonFull(i + 3)} active={oid === x.id} onClick={() => setOid(x.id)} />
        ))}
      </div>
      <DataLine style={{ marginTop: 10 }}>
        COMPARING <span style={{ color: NEON[1], fontWeight: 700 }}>{sid}</span> AGAINST <span style={{ color: NEON[5], fontWeight: 700 }}>{oid}</span>
      </DataLine>

      <HaikuRule id="trend" />

      <SectionRule label="STEP THREE - THE CATALOGUE" count={shown.length} color={NEON[0]}
        right={(
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
            <ViewToggle options={['CATALOGUE', 'RUN ALL']} value={view} onChange={setView} color={NEON[0]} />
          </span>
        )} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, alignItems: 'center' }}>
        <NeonChip label={`ALL (${METHODS.length})`} color={NEON[0]} active={cat === 'ALL'} onClick={() => setCat('ALL')} />
        {CATEGORIES.map((c) => (
          <NeonChip key={c} label={`${c} (${BY_CATEGORY.get(c).length})`} color={catOf(c).color} active={cat === c} onClick={() => setCat(c)} />
        ))}
      </div>
      <DataLine style={{ marginTop: 12, opacity: 0.9 }}>
        {view === 'RUN ALL'
          ? 'EVERY APPLICABLE METHOD IS RUNNING - EACH CHART IS COMPUTED LIVE IN YOUR BROWSER'
          : 'OPEN A ROW WITH [ RUN ] TO COMPUTE IT - THE CAVEAT IS PRINTED WHETHER OR NOT YOU RUN IT'}
      </DataLine>

      {!s ? <LoadingLine style={{ marginTop: 20 }}>LOADING {sid}</LoadingLine> : shownCats.map((c) => {
        const meta = catOf(c);
        const items = BY_CATEGORY.get(c) || [];
        return (
          <div key={c}>
            <SectionRule label={c} count={items.length} color={meta.color} gap={64}
              art={<Art id={meta.mark} color={meta.color} size={34} />}
              right={<DataLine color={meta.color}>{meta.asks.toUpperCase()}</DataLine>} />
            <div style={{ marginTop: 12 }}>
              {items.map((m) => (
                <MethodRow key={m.id} m={m} s={s} other={other} color={meta.color}
                  open={isOpen(m)} onToggle={() => toggle(m.id)} />
              ))}
            </div>
          </div>
        );
      })}

      <SectionRule label="THE ONE RULE THIS PAGE KEEPS" color={NEON[2]} art={<Art id="anomaly" color={NEON[2]} size={40} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(240px, 1fr)', gap: 40, marginTop: 22, alignItems: 'start' }}>
        <div>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0, maxWidth: '72ch' }}>
            Every method prints how it can mislead, at the same weight as its result. Mann-Kendall does not correct for
            the serial autocorrelation that climate series have in abundance, so its p-value is optimistic. Pettitt's test
            assumes at most one breakpoint and will always return a year whether or not one exists. A moving average over
            an index window silently over-weights the densely sampled stretches of an ice core.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: '16px 0 0', maxWidth: '72ch' }}>
            None of that makes these methods bad. It makes them instruments with known behaviour, which is the only kind
            worth using. A catalogue that showed only outputs would teach a reader to trust outputs, and that is the
            opposite of what this project is for.
          </p>
        </div>
        <Art id="fingerprint" color={NEON[2]} size={240} />
      </div>

      <Haiku id="instrument" align="right" />
      <div style={{ height: 140 }} />
    </main>
  );
}
