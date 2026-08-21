import React, { useEffect, useState } from 'react';
import ClimateChart from './ClimateChart.jsx';
import {
  NeonCard, DataLine, MetaBar, GiantType, SectionRule,
  TerminalLine, TerminalLog, CalcBlock, EmptyFolder, SEP, mono, wrap, display, reading, legibleInk, HeroBlock,
} from './theme.jsx';
import { NEON, neonFull } from './neon.js';
import { Haiku, HaikuRule } from './haiku.jsx';
import { Art, ArtBand, PageEmblem, artFor } from './art/climate_art.jsx';
import { StatementBand } from './art/abstract_art.jsx';
import StateHero from './art/hero/state.jsx';
import StateMark from './art/mark/state.jsx';
import { useStagger } from './motion.js';

const INK = '#2a2722';
const cache = new Map();
const getJSON = (u) => {
  if (!cache.has(u)) cache.set(u, fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  return cache.get(u);
};

export function useFeed(url) {
  const [state, setState] = useState({ data: null, loading: true });
  useEffect(() => { getJSON(url).then((d) => setState({ data: d, loading: false })); }, [url]);
  return state;
}

const ART_FOR = {
  'gmst-2025-wmo': 'thermometer', 'warmest-year-on-record': 'records',
  'gmst-2023-2025': 'anomaly', 'gistemp-2025': 'datasets', 'hadcrut5-2025': 'globe',
  'berkeley-2025': 'telescope', 'era5-2025': 'satellite', 'noaa-2025': 'network',
  'human-induced-warming-decade': 'fingerprint', 'warming-rate': 'rate',
  'co2-mauna-loa-annual-2025': 'keeling', 'co2-mauna-loa-monthly-latest': 'molecule',
  'co2-global-annual-2025': 'carbon', 'co2-growth-rate-2025': 'rate',
  'co2-wmo-gaw-2024': 'telescope', 'ch4-2025': 'greenhouse', 'n2o-2025': 'molecule',
  'aggi-2024': 'dial',
  'fossil-co2-2025': 'smokestack', 'total-co2-2025': 'carbon',
  'remaining-carbon-budget-1p5': 'budget', 'ghg-emissions-2024': 'greenhouse',
  'sea-level-total': 'ocean', 'sea-level-rate': 'rate',
  'arctic-sea-ice-min-2025': 'seaice', 'arctic-sea-ice-max-2026': 'glacier',
  'antarctic-sea-ice-min-2026': 'globe', 'ocean-heat-content-2025': 'buoy',
  'glacier-mass-loss': 'glaciermass',
  'earth-energy-imbalance': 'energy', 'warming-projection-current-policies': 'projection',
  'gadcu-1p5-probability': 'dial',
};

const FAMILIES = [
  {
    key: 'temperature', title: 'HOW WARM IT IS', color: NEON[0], mark: 'thermometer',
    ids: /^(gmst|warmest|gistemp|hadcrut|berkeley|era5|noaa-2025|human-induced|warming-rate)/,
    blurb: 'The headline number, and the reason there is more than one of it. Five institutions each build a global temperature from the same underlying measurements and get answers a few hundredths of a degree apart, because they make different defensible choices about the places nobody measured. They are shown side by side rather than averaged, because the spread between them is itself information: it is roughly the size of the honest uncertainty.',
  },
  {
    key: 'composition', title: 'WHAT IS IN THE AIR', color: NEON[8], mark: 'molecule',
    ids: /^(co2-|ch4|n2o|aggi)/,
    blurb: 'The cause, measured directly. These are not estimates or model output: they are the concentration of gas in air, sampled at observatories and flasks around the world, and the record is one of the least contested things in the whole subject. The growth RATE matters as much as the level, because it says whether the cause is still accelerating.',
  },
  {
    key: 'emissions', title: 'WHAT WE ARE PUTTING IN', color: NEON[9], mark: 'smokestack',
    ids: /^(fossil-|total-co2|remaining-|ghg-)/,
    blurb: 'What human activity emits each year, and how much room is left. Emissions are ESTIMATED from energy statistics and land-use data, not measured directly, so they carry a wider uncertainty than the concentration figures above. The remaining budget is the most policy-loaded number on this page and the most sensitive to its assumptions.',
  },
  {
    key: 'oceanice', title: 'THE OCEAN AND THE ICE', color: NEON[5], mark: 'seaice',
    ids: /^(sea-level|arctic-|antarctic-|ocean-heat|glacier-)/,
    blurb: 'Where the consequences are slowest and hardest to reverse. Ocean heat content is the single best measure of how much energy the planet is actually accumulating, because more than nine tenths of it ends up in the sea rather than the air. It is also the smoothest of these records: no El Nino wobble, just a rise.',
  },
  {
    key: 'outlook', title: 'THE BALANCE AND THE OUTLOOK', color: NEON[3], mark: 'energy',
    ids: /^(earth-energy|warming-projection|gadcu)/,
    blurb: 'The imbalance driving all of it, and where the current path leads. The energy imbalance is the closest thing to a real-time gauge of the whole system: it is the rate the planet is gaining energy, measured from orbit and cross-checked against the warming ocean. The projections are model output and are labelled as such.',
  },
];

const familyOf = (id) => FAMILIES.find((f) => f.ids.test(id)) || null;
const markFor = (ind) => ART_FOR[ind.id] || familyOf(ind.id)?.mark || artFor(ind.id + ind.label);

function Anatomy() {
  const c = NEON[3];
  const Note = ({ n, title, children }) => (
    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
      <span style={{ ...mono, fontSize: 10.5, fontWeight: 700, color: '#f4f0e4', background: c, width: 20, height: 20, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
      <div>
        <DataLine color={c} style={{ fontWeight: 700 }}>{title}</DataLine>
        <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.55, margin: '2px 0 0' }}>{children}</p>
      </div>
    </div>
  );
  const tag = (n) => (
    <span style={{ ...mono, fontSize: 9.5, fontWeight: 700, color: '#f4f0e4', background: c, padding: '1px 5px', marginLeft: 6, verticalAlign: 'middle' }}>{n}</span>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, marginTop: 16 }}>
      <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + NEON[0], background: 'rgba(42,39,34,0.035)', paddingBottom: 14 }}>
        <ArtBand id="thermometer" color={NEON[0]} height={104} />
        <div style={{ padding: '0 16px' }}>
          <DataLine color={NEON[0]} style={{ fontWeight: 700 }}>GLOBAL SURFACE TEMPERATURE, 2025 {tag(1)}</DataLine>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ ...display, fontSize: 44, color: NEON[0], letterSpacing: '-0.02em', lineHeight: 1 }}>1.43</span>
            <span style={{ ...mono, fontSize: 12, fontWeight: 700 }}>C above 1850-1900 {tag(2)}</span>
          </div>
          <DataLine style={{ marginTop: 6 }}>FOR 2025 {tag(3)} · WMO {tag(4)} · PUBLISHED 2026-03-23 {tag(5)}</DataLine>
          <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.55, margin: '9px 0 0' }}>
            Then a plain-English paragraph {tag(6)} saying what the number means, what it does not mean, and anything
            about the year that a reader would otherwise misread.
          </p>
          <DataLine color={NEON[0]} style={{ marginTop: 8, fontWeight: 700 }}>THE SOURCE {tag(7)}</DataLine>
        </div>
      </div>
      <div>
        <Note n="1" title="THE QUANTITY AND ITS PERIOD">What is being measured, and over what stretch of time. Not always a single year.</Note>
        <Note n="2" title="THE BASELINE - THE PART MOST OFTEN DROPPED">
          A temperature anomaly is a difference FROM something. The same year reads 1.43 C above 1850-1900 and about
          1.19 C above 1951-1980. Neither is more correct. A figure quoted without its baseline is not a figure, and
          most of the apparent disagreement you see in the press is two people using two baselines.
        </Note>
        <Note n="3" title="THE PERIOD IT COVERS">A calendar year contains El Nino, volcanoes and weather. A decade contains much less of it. When an assessment wants to say something about the trend rather than the weather, it quotes a decade.</Note>
        <Note n="4" title="WHO PRODUCED IT">Different institutions, different methods, different answers. That is normal and healthy, not a scandal.</Note>
        <Note n="5" title="WHEN THEY PUBLISHED IT">Climate figures get revised. A number from March supersedes the one from January, and both are real.</Note>
        <Note n="6" title="WHAT IT ACTUALLY MEANS">Written in ordinary language, including the caveat. If a number can be misread, the card says how.</Note>
        <Note n="7" title="THE LINK TO THE PUBLISHER">Every figure on this page goes back to the institution that produced it, in one click. Nothing here is ours.</Note>
      </div>
    </div>
  );
}

function Spark({ seriesId, color }) {
  const [s, setS] = useState(null);
  useEffect(() => { if (seriesId) getJSON(`/data/series/${seriesId}.json`).then(setS); }, [seriesId]);
  if (!seriesId || !s) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <ClimateChart series={[{ name: s.name, points: s.points, color, width: 1.8 }]} height={92} slideout={false} />
      <DataLine style={{ opacity: 0.8, marginTop: 2 }}>{s.name.toUpperCase()} · {s.n.toLocaleString()} PTS</DataLine>
    </div>
  );
}

function IndicatorCard({ ind, color }) {
  const t = legibleInk(color);
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + color, background: 'rgba(42,39,34,0.035)', paddingBottom: 14 }}>
      <ArtBand id={markFor(ind)} color={color} height={130} />
      <div style={{ padding: '0 16px' }}>
        <DataLine color={t} style={{ fontWeight: 700 }}>{String(ind.label || '').toUpperCase()}</DataLine>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ ...display, fontSize: 'clamp(32px, 4.6vw, 50px)', color: t, letterSpacing: '-0.02em', lineHeight: 1 }}>{ind.value}</span>
          <span style={{ ...mono, fontSize: 12, fontWeight: 700, opacity: 0.95 }}>{ind.unit}</span>
        </div>
        <DataLine style={{ marginTop: 6 }}>{ind.period ? `FOR ${ind.period}` : ''}{ind.org ? ` · ${ind.org}` : ''}{ind.published ? ` · PUBLISHED ${ind.published}` : ''}</DataLine>
        {ind.note && <p style={{ ...reading, fontSize: 14, lineHeight: 1.6, margin: '9px 0 0' }}>{ind.note}</p>}
        <Spark seriesId={ind.series} color={color} />
        {ind.url && (
          <a href={ind.url} target="_blank" rel="noreferrer" style={{ ...mono, fontSize: 10.5, letterSpacing: '0.08em', color: t, display: 'inline-block', marginTop: 8, fontWeight: 700 }}>
            THE SOURCE
          </a>
        )}
      </div>
    </div>
  );
}

function CardGrid({ children }) {
  const ref = useStagger();
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginTop: 22 }}>
      {children}
    </div>
  );
}

export default function StatePage() {
  const { data, loading } = useFeed('/data/state.json');
  const inds = data?.indicators || [];
  const grouped = FAMILIES.map((f) => ({ f, items: inds.filter((i) => familyOf(i.id)?.key === f.key) }));
  const orphans = inds.filter((i) => !familyOf(i.id));

  const familiesShown = grouped.filter((g) => g.items.length).length;

  const num = (id) => { const v = parseFloat(inds.find((i) => i.id === id)?.value); return Number.isFinite(v) ? v : null; };
  const ind = (id) => inds.find((i) => i.id === id) || null;
  const wmo = num('gmst-2025-wmo');
  const giss = num('gistemp-2025');
  const pi2025 = inds
    .filter((i) => i.period === '2025' && /1850-1900/.test(i.unit || ''))
    .map((i) => ({ v: parseFloat(i.value), org: i.org }))
    .filter((x) => Number.isFinite(x.v))
    .sort((a, b) => a.v - b.v);
  const shortOrg = (o) => {
    const s = (o || '').replace(/^(NASA|NOAA|Met Office).*/, '$1').split(/[,(]/)[0].trim();
    return s.length > 18 ? s.split(' ')[0] : s;
  };
  const linked = inds.filter((i) => i.url).length;

  const calcRows = [
    wmo != null && giss != null && {
      name: 'BASELINE',
      formula: 'T(1850-1900) - T(1951-1980)',
      input: `${wmo.toFixed(2)} ${ind('gmst-2025-wmo').org} - ${giss.toFixed(2)} GISTEMP, both for 2025`,
      result: `${(wmo - giss).toFixed(2)} K apart`,
      note: 'THE SAME YEAR. MOSTLY THE REFERENCE PERIOD, PARTLY THAT THESE ARE TWO DIFFERENT GROUPS - WHICH IS THE POINT',
    },
    pi2025.length >= 2 && {
      name: 'SPREAD',
      formula: 'max - min over the 1850-1900 figures',
      input: `${pi2025.length} groups, ${pi2025[0].v.toFixed(2)} ${shortOrg(pi2025[0].org)} to ${pi2025[pi2025.length - 1].v.toFixed(2)} ${shortOrg(pi2025[pi2025.length - 1].org)}`,
      result: `${(pi2025[pi2025.length - 1].v - pi2025[0].v).toFixed(2)} K`,
      note: 'ROUGHLY THE SIZE OF THE GENUINE UNCERTAINTY. NOT AVERAGED HERE',
    },
    inds.length > 0 && {
      name: 'FEED',
      formula: 'indicators / families',
      input: `${inds.length} in ${familiesShown} families, updated ${data?.updated || 'undated'}`,
      result: `${linked} source links`,
    },
  ].filter(Boolean);

  return (
    <main style={wrap}>
      {}
      <HeroBlock art={<StateHero />}>
          <MetaBar style={{ marginTop: 28 }} items={[
            ['INDEX', 'TCP-01'],
            ['PAGE', 'The state of it'],
            ['INDICATORS', loading ? 'Reading the feed' : String(inds.length)],
            ['FAMILIES', loading ? '-' : String(familiesShown)],
            ['FEED UPDATED', data?.updated || (loading ? '-' : 'Undated')],
          ]} />

          <div style={{ marginTop: 40 }}>
            <GiantType>THE STATE</GiantType>
            <GiantType>OF IT<span style={{ color: NEON[0], fontSize: '0.6em' }}>.</span></GiantType>
          </div>
          <TerminalLine style={{ marginTop: 14 }} items={[
            'MEASURED NUMBERS ONLY', 'EACH WITH ITS PERIOD', 'ITS PRODUCER', 'ITS PUBLICATION DATE', 'AND ITS SOURCE LINK',
          ]} />

          <StatementBand mark={<StateMark height={300} />}>
            Every number here is a difference from something, and the something is half the number.
          </StatementBand>
      </HeroBlock>

      <SectionRule label="WHAT YOU ARE LOOKING AT / READ THIS FIRST" color={NEON[3]}
        art={<Art id="fingerprint" color={NEON[3]} size={44} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(220px, 1fr)', gap: 48, marginTop: 22, alignItems: 'start' }}>
        <div>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0, maxWidth: '72ch' }}>
            What is happening right now, in the numbers the measuring institutions actually publish. Every figure carries
            the period it covers, who produced it, when they published it, and a link straight to the source.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: '14px 0 0', maxWidth: '72ch' }}>
            Each card below is one measured number about the climate, taken from the body that measures it. None of these
            are ours and none are model output unless the card says so.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: '14px 0 0', maxWidth: '72ch' }}>
            The reason a page like this needs an explainer at all is that climate numbers are almost never absolute. Nearly
            every one is a DIFFERENCE - from a reference period, from a pre-industrial estimate, from a satellite era that
            began in 1979. Change the reference and the number changes while the world does not. So the label is not
            decoration around the figure; the label is half the figure.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: '14px 0 0', maxWidth: '72ch' }}>
            The second thing worth knowing before you read any of it: these institutions DISAGREE with each other slightly,
            on purpose. Five groups build a global temperature from overlapping raw measurements and arrive at answers a
            few hundredths of a degree apart, because the Arctic is thinly observed and each group fills the gap by a
            different defensible method.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: '14px 0 0', maxWidth: '72ch' }}>
            That spread is not a weakness in the science and it is not a controversy. It is roughly the size of the
            genuine uncertainty, made visible by independent groups doing the work separately. Where two of them publish
            different values for the same quantity, this page shows both rather than averaging them into a false
            precision.
          </p>
        </div>
        <div>
          <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9, marginBottom: 4 }}>
            THE LABEL IS HALF THE FIGURE, IN ARITHMETIC
          </div>
          {loading
            ? <TerminalLog lines={['READING THE FEED']} />
            : <CalcBlock rows={calcRows} color={NEON[3]} />}
          <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9, marginTop: 10, lineHeight: 1.7 }}>
            COMPUTED FROM THE FEED ON THIS PAGE {SEP} NOTHING HERE IS OURS BUT THE SUBTRACTION
          </div>
          <div style={{ marginTop: 24, lineHeight: 0 }}>
            <Art id="datasets" color={NEON[5]} size={150} />
          </div>
        </div>
      </div>

      {}
      <Haiku id="baseline" />

      <SectionRule label="THE ANATOMY OF ONE CARD" count={7} color={NEON[3]}
        art={<Art id="records" color={NEON[3]} size={44} />} />
      <Anatomy />

      {}
      <HaikuRule id="revision" />

      {!loading && !inds.length && (
        <EmptyFolder
          code="0"
          label="THE FEED IS NOT WRITTEN YET"
          hint="This page reads public/data/state.json. Until that file exists the page says so, rather than showing numbers from nowhere."
          action="BACK TO THE INDEX"
          href="#/"
        />
      )}

      {grouped.filter((g) => g.items.length).map(({ f, items }) => (
        <section key={f.key}>
          <SectionRule label={f.title} count={items.length} color={f.color}
            art={<Art id={f.mark} color={f.color} size={48} />} />
          <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, maxWidth: '78ch', margin: '18px 0 0' }}>{f.blurb}</p>
          <CardGrid>
            {items.map((ind, i) => <IndicatorCard key={ind.id} ind={ind} color={neonFull(i + FAMILIES.indexOf(f) * 3)} />)}
          </CardGrid>
          {}
          {f.key === 'oceanice' && <HaikuRule id="ocean" />}
        </section>
      ))}

      {orphans.length > 0 && (
        <section>
          <SectionRule label="ALSO IN THE FEED" count={orphans.length} color={NEON[6]}
            art={<Art id="network" color={NEON[6]} size={44} />} />
          <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, maxWidth: '78ch', margin: '18px 0 0' }}>
            Indicators the feed carries that match none of the families above. They are shown rather than dropped: the
            page never silently loses a number.
          </p>
          <CardGrid>
            {orphans.map((ind, i) => <IndicatorCard key={ind.id} ind={ind} color={neonFull(i + 7)} />)}
          </CardGrid>
        </section>
      )}

      <SectionRule label="THREE THINGS THAT MOVE A CLIMATE NUMBER WITHOUT THE WORLD MOVING" count={3} color={NEON[3]}
        art={<Art id="anomaly" color={NEON[3]} size={44} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(240px, 1fr)', gap: 40, marginTop: 22, alignItems: 'start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 18 }}>
          <NeonCard color={NEON[0]} title="1 · THE BASELINE">
            <p style={{ ...reading, fontSize: 13.8, lineHeight: 1.6, margin: 0 }}>
              The same year is about 1.43 C warm against 1850-1900 and about 1.19 C warm against 1951-1980. The
              difference is arithmetic, not physics. WMO and the Paris Agreement use the pre-industrial baseline;
              NASA's GISTEMP publishes against the mid-century one.
            </p>
          </NeonCard>
          <NeonCard color={NEON[5]} title="2 · THE DATASET">
            <p style={{ ...reading, fontSize: 13.8, lineHeight: 1.6, margin: 0 }}>
              GISTEMP, HadCRUT5, NOAA, Berkeley Earth and ERA5 differ by a few hundredths because they infill the thinly
              measured Arctic differently. ERA5 is a reanalysis - a weather model fed every observation - so it runs
              slightly warm against the station-based records by construction.
            </p>
          </NeonCard>
          <NeonCard color={NEON[8]} title="3 · THE PERIOD">
            <p style={{ ...reading, fontSize: 13.8, lineHeight: 1.6, margin: 0 }}>
              A single calendar year carries El Nino, La Nina and volcanoes inside it. That is why the assessments quote
              decadal averages when they want to say something about the trend, and why one cool year is never evidence
              that the trend stopped.
            </p>
          </NeonCard>
          <NeonCard color={NEON[3]} title="AND SO">
            <p style={{ ...reading, fontSize: 13.8, lineHeight: 1.6, margin: 0 }}>
              A figure is only meaningful with its label attached, which is why every card carries one. Where two
              institutions publish different values for the same quantity, both are shown rather than averaged. Where a
              number is model output rather than measurement, the card says so.
            </p>
          </NeonCard>
        </div>
        <PageEmblem page="state" width={300} style={{ justifySelf: 'end' }} />
      </div>

      {}
      <Haiku id="unmoved" align="right" />
    </main>
  );
}
