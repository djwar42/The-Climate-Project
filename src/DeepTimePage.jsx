import React, { useEffect, useState, useCallback } from 'react';
import ClimateChart from './ClimateChart.jsx';
import {
  NeonChip, DataLine, SpineNode, MetaBar, GiantType, TerminalLine, CalcBlock,
  SectionRule, TagChip, EmptyFolder, OutlineButton, SEP, mono, wrap, display, reading, legibleInk, HeroBlock,
} from './theme.jsx';
import { neonFull, NEON } from './neon.js';
import { Haiku, HaikuRule } from './haiku.jsx';
import { fmtYear, spanOf, kaBP, PRESENT } from './years.js';
import { KIND_COLOR } from './ClimateChart.jsx';
import { Art, PageEmblem } from './art/climate_art.jsx';
import { StatementBand } from './art/abstract_art.jsx';
import DeepTimeHero from './art/hero/deeptime.jsx';
import DeepTimeMark from './art/mark/deeptime.jsx';
import { DeepTimeTick, SourceMark, LoadingLine } from './ref_kit.jsx';

const INK = '#2a2722';
const cache = new Map();

const JS_DATE_FLOOR_YEAR = new Date(-8640000000000000).getUTCFullYear();

async function getJSON(url) {
  if (cache.has(url)) return cache.get(url);
  const p = fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  cache.set(url, p);
  return p;
}

export const PERIODS = [
  ['ALL', null],
  ['444 Ma', [-444.5e6, 2030]],
  ['66 Ma', [-66.5e6, 2030]],
  ['800 ka', [-798050, 2030]],
  ['130 ka', [-128050, 2030]],
  ['21 ka LGM', [-19050, 2030]],
  ['HOLOCENE', [-9750, 2030]],
  ['2 ka', [25, 2030]],
  ['1850+', [1845, 2030]],
  ['1958+', [1957, 2030]],
  ['2000+', [1999, 2030]],
];

const ERA_LABEL = { paleo: 'PALAEO', instrumental: 'INSTRUMENTAL', satellite: 'SATELLITE', derived: 'DERIVED' };

function useSeriesIndex() {
  const [state, setState] = useState({ series: [], events: [], loading: true });
  useEffect(() => {
    let live = true;
    Promise.all([getJSON('/data/series/index.json'), getJSON('/data/events_deeptime.json')])
      .then(([idx, ev]) => {
        if (!live) return;
        setState({
          series: idx?.series || [],
          events: Array.isArray(ev) ? ev : (ev?.events || []),
          loading: false,
        });
      });
    return () => { live = false; };
  }, []);
  return state;
}

function useSeries(id) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let live = true;
    getJSON(`/data/series/${id}.json`).then((d) => { if (live) setData(d); });
    return () => { live = false; };
  }, [id]);
  return data;
}

function Meta({ s, color }) {
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 8 }}>
      <DataLine color={color}>{s.n.toLocaleString()} POINTS</DataLine>
      <DataLine color={color}>{fmtYear(s.first)} TO {fmtYear(s.last)}</DataLine>
      <DataLine color={color}>{spanOf(s.first, s.last).toUpperCase()}</DataLine>
      <DataLine color={color}>{String(s.cadence).toUpperCase()}</DataLine>
      <DataLine color={color}>{String(s.unit).toUpperCase()}</DataLine>
    </div>
  );
}

function SeriesCard({ meta, color, win, onClose, events }) {
  const s = useSeries(meta.id);
  const inWin = events.filter((e) => {
    if (!s) return false;
    const lo = win ? win[0] : s.first, hi = win ? win[1] : s.last;
    return e.year >= lo && e.year <= hi && e.year >= s.first - 500 && e.year <= s.last + 500;
  });
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + color, background: 'rgba(42,39,34,0.035)', padding: '16px 18px 12px', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <DataLine color={color} style={{ fontSize: 10, letterSpacing: '0.12em' }}>{meta.id.toUpperCase()}</DataLine>
          <div style={{ ...display, fontSize: 'clamp(19px, 2.4vw, 28px)', color, lineHeight: 1.1, letterSpacing: '-0.01em', marginTop: 3 }}>{meta.name}</div>
          <DataLine style={{ marginTop: 5 }}>{meta.institution}</DataLine>
        </div>
        <span style={{ flex: 'none' }}><OutlineButton onClick={onClose}>MINIMISE</OutlineButton></span>
      </div>
      <Meta s={{ ...meta, ...(s || {}) }} color={color} />
      {s ? (
        <div style={{ marginTop: 12 }}>
          <ClimateChart
            series={[{ name: s.name, points: s.points, band: s.band, color }]}
            events={inWin} window={win} height={330} yName={s.unit}
          />
          {s.note && <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.6, maxWidth: '76ch', marginTop: 10, opacity: 0.95 }}>{s.note}</p>}
          <DataLine style={{ marginTop: 8, opacity: 0.9 }}>
            SOURCE <a href={s.source} target="_blank" rel="noreferrer" style={{ color }}>{s.source}</a> · FETCHED {s.fetched}
            {s.baseline ? ` · BASELINE ${s.baseline}` : ''}
          </DataLine>
        </div>
      ) : (
        <LoadingLine style={{ marginTop: 14 }}>LOADING {meta.id}</LoadingLine>
      )}
    </div>
  );
}

function SeriesRowLine({ s, color, onOpen }) {
  return (
    <div onClick={onOpen}
      style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap', padding: '13px 0 15px', borderTop: '1px solid rgba(42,39,34,0.3)', cursor: 'pointer' }}>
      <SpineNode color={color} size={13} left={-33} connector={14} />
      <span style={{ ...display, fontSize: 19, color: legibleInk(color), letterSpacing: '-0.02em', minWidth: 126 }}>{fmtYear(s.first)}</span>
      <span style={{ flex: 1, minWidth: 260 }}>
        <span style={{ ...mono, fontSize: 12.5, fontWeight: 700, color: legibleInk(color), display: 'block' }}>{s.name}</span>
        <span style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>{s.id}</span>
      </span>
      <DataLine>{ERA_LABEL[s.era] || String(s.era || '').toUpperCase()} · {s.n.toLocaleString()} PTS · {s.unit}</DataLine>
    </div>
  );
}

function hostOf(url) {
  try { return new URL(url).host.replace(/^www\./, '').toUpperCase(); }
  catch (e) { return String(url || '').slice(0, 40).toUpperCase(); }
}

function EventTimeline({ events, color }) {
  if (!events.length) return null;
  const rows = [...events].sort((a, b) => b.year - a.year);
  const LEDGER_SPAN = [Math.min(...events.map((e) => e.year)), 2026];
  return (
    <div style={{ position: 'relative', paddingLeft: 34, marginTop: 14 }}>
      <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 1, background: INK, opacity: 0.45 }} />
      <div style={{ position: 'absolute', left: 3.5, top: -5, width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '7px solid ' + INK }} />
      {rows.map((e, i) => {
        const c = KIND_COLOR[e.kind] || color;
        return (
          <div key={i} style={{ position: 'relative', padding: '13px 0 15px', borderTop: '1px solid rgba(42,39,34,0.3)' }}>
            <SpineNode color={c} size={13} left={-33} connector={14} />
            <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
              {}
              <span style={{ minWidth: 132 }}>
                <SourceMark
                  source={e.source ? hostOf(e.source) : 'NO SOURCE RECORDED'}
                  url={e.source}
                  date={e.uncertainty ? `DATING ${String(e.uncertainty).toUpperCase()}` : null}
                  note={e.detail} register="observed" color={c}>
                  <span style={{ ...display, fontSize: 20, color: legibleInk(c), letterSpacing: '-0.02em' }}>{fmtYear(e.year)}</span>
                </SourceMark>
              </span>
              <span style={{ ...mono, fontSize: 12.5, fontWeight: 700, color: legibleInk(c) }}>{e.label}</span>
              {e.kind && <TagChip label={e.kind} color={c} />}
              {}
              <DeepTimeTick year={e.year} span={LEDGER_SPAN} color={c} width={130} scale={false} />
            </div>
            <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.6, maxWidth: '74ch', margin: '4px 0 0 0', opacity: 0.94 }}>{e.detail}</p>
            <DataLine style={{ marginTop: 5, opacity: 0.9 }}>
              {e.uncertainty ? `DATING ${String(e.uncertainty).toUpperCase()} ` : ''}
              {e.uncertainty && e.source ? <span style={{ opacity: 0.5 }}>{SEP} </span> : null}
              {e.source && <a href={e.source} target="_blank" rel="noreferrer" style={{ color: legibleInk(c) }}>SOURCE</a>}
            </DataLine>
          </div>
        );
      })}
    </div>
  );
}

export default function DeepTimePage() {
  const { series, events, loading } = useSeriesIndex();
  const [openIds, setOpenIds] = useState([]);
  const [periodIdx, setPeriodIdx] = useState(0);
  const [win, setWin] = useState(null);

  useEffect(() => {
    if (!series.length || openIds.length) return;
    const oldest = series[0], newest = series[series.length - 1];
    setOpenIds([oldest.id, newest.id].filter((v, i, a) => a.indexOf(v) === i));
  }, [series]);

  const setPeriod = useCallback((i) => { setPeriodIdx(i); setWin(PERIODS[i][1]); }, []);
  const open = openIds.map((id) => series.find((s) => s.id === id)).filter(Boolean);
  const closed = series.filter((s) => !openIds.includes(s.id)).slice().reverse();

  const winEvents = events.filter((e) => !win || (e.year >= win[0] && e.year <= win[1]));

  const points = series.reduce((n, s) => n + (s.n || 0), 0);
  const oldest = series.length ? Math.min(...series.map((s) => s.first)) : null;
  const newest = series.length ? Math.max(...series.map((s) => s.last)) : null;
  const oldestSeries = oldest == null ? null : series.find((s) => s.first === oldest);
  const subAnnual = series
    .filter((s) => s.cadence === 'monthly' && Number.isFinite(s.first))
    .sort((a, b) => (b.first - Math.floor(b.first)) - (a.first - Math.floor(a.first)))[0];

  return (
    <main style={wrap}>
      {}
      <HeroBlock art={<DeepTimeHero />}>
        <MetaBar style={{ marginTop: 28 }} items={[
          ['INDEX', 'TCP-03'],
          ['SERIES', series.length || '-'],
          ['POINTS', points ? points.toLocaleString() : '-'],
          ['EVENTS', events.length || '-'],
          ['OLDEST', oldest != null ? fmtYear(oldest) : '-'],
          ['NEWEST', newest != null ? fmtYear(newest) : '-'],
        ]} />

        <div style={{ marginTop: 26 }}>
          <GiantType>DEEP TIME<span style={{ color: NEON[0] }}>.</span></GiantType>
        </div>
        <TerminalLine style={{ marginTop: 12 }} items={[
          'ONE NUMERIC YEAR AXIS',
          series.length ? `${series.length} SERIES` : null,
          events.length ? `${events.length} VERIFIED EVENTS` : null,
          oldest != null ? `${fmtYear(oldest)} TO ${fmtYear(newest)}` : null,
          'NO DATE OBJECT ANYWHERE IN THE DATA PATH',
        ]} />

        <StatementBand mark={<DeepTimeMark height={300} />}>
          Eight hundred thousand years of Antarctic ice, and last month&rsquo;s flask sample, on one axis.
        </StatementBand>
      </HeroBlock>

      <SectionRule label="THE WINDOW" count={PERIODS.length} color={NEON[5]}
        right={<DataLine color={NEON[5]}>{winEvents.length} EVENTS IN VIEW{events.length ? ` OF ${events.length}` : ''}</DataLine>} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        {}
        {PERIODS.map(([label], i) => (
          <NeonChip key={label} label={label} active={i === periodIdx} color={i === periodIdx ? NEON[5] : INK} onClick={() => setPeriod(i)} />
        ))}
      </div>
      <DataLine style={{ marginTop: 12, opacity: 0.9 }}>
        {win ? `WINDOW ${fmtYear(win[0])} TO ${fmtYear(win[1])} · ${spanOf(win[0], win[1]).toUpperCase()}` : 'WINDOW: THE WHOLE RECORD'}
      </DataLine>
      <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, maxWidth: '72ch', marginTop: 10 }}>
        One window drives every open chart at once, which is how you compare an ice core against the instrumental record
        honestly. Significant climate events are marked on every chart: hover a marker for the short reading, click it for
        the full entry and its source.
      </p>

      {loading && <LoadingLine style={{ marginTop: 30 }}>LOADING THE SERIES INDEX</LoadingLine>}

      <SectionRule label="ON THE BENCH" count={open.length} color={NEON[0]}
        art={<Art id="icecore" color={NEON[0]} size={46} />} />
      <div style={{ marginTop: 18 }}>
        {open.length === 0 && !loading ? (
          <EmptyFolder
            code="0" label="NOTHING IS OPEN"
            hint="Every series is minimised. Open one from the record below and it moves to the top of the bench, on the shared window."
            action={series.length ? `OPEN ${series[0].id}` : null}
            onClick={() => series.length && setOpenIds([series[0].id])}
          />
        ) : open.map((s) => (
          <SeriesCard
            key={s.id} meta={s} color={neonFull(series.indexOf(s))} win={win} events={events}
            onClose={() => setOpenIds(openIds.filter((id) => id !== s.id))}
          />
        ))}
      </div>

      {}
      <Haiku id="icecore" />

      {closed.length > 0 && (
        <>
          <SectionRule label="THE RECORD · CLOSED, NEWEST FIRST" count={closed.length} color={NEON[1]}
            art={<Art id="sediment" color={NEON[1]} size={46} />} />
          <div style={{ position: 'relative', paddingLeft: 34, marginTop: 14 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 1, background: INK, opacity: 0.45 }} />
            <div style={{ position: 'absolute', left: 3.5, top: -5, width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '7px solid ' + INK }} />
            {closed.map((s) => (
              <SeriesRowLine key={s.id} s={s} color={neonFull(series.indexOf(s))}
                onOpen={() => setOpenIds([...openIds, s.id])} />
            ))}
          </div>
        </>
      )}

      {}
      <HaikuRule id="sediment" />

      {winEvents.length > 0 && (
        <>
          <SectionRule label="THE EVENT LEDGER · IN THE WINDOW, NEWEST FIRST" count={winEvents.length} color={NEON[3]}
            art={<Art id="glacier" color={NEON[3]} size={46} />} />
          <EventTimeline events={winEvents} color={NEON[0]} />
        </>
      )}

      {}
      <HaikuRule id="datum" />

      <SectionRule label="WHY THE AXIS IS A PLAIN NUMBER" color={NEON[5]} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(240px, 1fr)', gap: 26, marginTop: 20, alignItems: 'start' }}>
        <div>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
            Every point on every chart here is a pair of numbers, and the first one is the year: 1880, or 1958.375 for
            mid-May 1958, or -798000 for 798,000 BCE. No date object appears anywhere in the data, because the standard
            one cannot hold a year beyond about 271,821 BCE and the ice core reaches 801,662 years before present.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, marginTop: 12 }}>
            That one decision is what lets a marker for the Hirnantian glaciation and a flask sample from last month sit
            on the same axis. Palaeo archives publish ages as years before present with present fixed at 1950, so the
            conversion happens once, at ingest, and everything downstream sees only numbers.
          </p>
        </div>
        <div>
          {}
          {oldest != null && (
            <>
              <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9, marginBottom: 4 }}>
                THE CONVERSION, ON THE OLDEST POINT IN THE INDEX
                {oldestSeries ? ` ${SEP} ${oldestSeries.id}` : ''}
              </div>
              <CalcBlock color={NEON[5]} rows={[
                {
                  name: 'DATUM',
                  formula: `year = ${PRESENT} - ageBP`,
                  input: `oldest age ${Math.round(kaBP(oldest) * 1000).toLocaleString()} yr BP`,
                  result: fmtYear(oldest, { ka: false }),
                },
                {
                  name: 'SCALE',
                  formula: `ka BP = (${PRESENT} - year) / 1000`,
                  input: `(${PRESENT} + ${Math.round(-oldest).toLocaleString()}) / 1000`,
                  result: `${kaBP(oldest).toFixed(1)} ka BP`,
                },
                subAnnual && {
                  name: 'MONTH',
                  formula: `month = floor(frac(year) × 12)`,
                  input: `${subAnnual.id} begins ${subAnnual.first.toFixed(4)}`,
                  result: fmtYear(subAnnual.first, { month: true }),
                },
                {
                  name: 'CEILING',
                  formula: 'what a JS Date can hold at all',
                  input: `${Math.abs(JS_DATE_FLOOR_YEAR).toLocaleString()} BCE at the earliest`,
                  result: `${Math.round(Math.abs(oldest) + JS_DATE_FLOOR_YEAR).toLocaleString()} years short`,
                  note: 'ASKED OF THE BROWSER AT RENDER, NOT REMEMBERED. THIS SUBTRACTION IS WHY THE YEAR IS A PLAIN NUMBER HERE',
                },
              ].filter(Boolean)} />
            </>
          )}
          <PageEmblem page="deeptime" width={300} />
        </div>
      </div>

      {}
      <Haiku id="drill" align="right" />
      <div style={{ height: 140 }} />
    </main>
  );
}
