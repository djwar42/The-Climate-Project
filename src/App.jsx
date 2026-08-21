import React, { useEffect, useState } from 'react';
import DeepTimePage from './DeepTimePage.jsx';
import ModelsPage from './ModelsPage.jsx';
import MethodsPage from './MethodsPage.jsx';
import NewsPage from './NewsPage.jsx';
import StatePage from './StatePage.jsx';
import OrgsPage from './OrgsPage.jsx';
import ProjectsPage from './ProjectsPage.jsx';
import GamePage from './GamePage.jsx';
import {
  Prose, Bracket, TerminalLine, TerminalLog, CalcBlock, GiantType, Statement, SectionRule, ListRow,
  InkBand, MetaBar, SEP, SEP_SAFE, SepMark, mono, wrap, display,
} from './theme.jsx';
import { NEON } from './neon.js';
import { Haiku, HaikuRule } from './haiku.jsx';
import { co2Forcing, lambdaFromEcs, ALPHA_CO2, C_PREINDUSTRIAL, F2X, GTC_PER_PPM, TWO_BOX_DEFAULTS } from './models.js';
import { fmtYear, kaBP, PRESENT } from './years.js';
import { UNITS, unit } from './type.js';
import { Art } from './art/climate_art.jsx';
import HomeHero from './art/hero/home.jsx';
import FooterInstrument, { NODE_FOR_PAGE } from './art/hero/footer.jsx';
import { SkipLink } from './ref_kit.jsx';
import { pageProps, useScrollTopOnRoute, useCount } from './motion.js';

const PAPER = '#f4f0e4';
const INK = 'var(--sui-ink, #2a2722)';

function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  useEffect(() => {
    const on = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

let indexPromise = null;
function useSeriesIndex() {
  const [ix, setIx] = useState(null);
  useEffect(() => {
    if (!indexPromise) indexPromise = fetch('/data/series/index.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
    let live = true;
    indexPromise.then((d) => { if (live) setIx(d); });
    return () => { live = false; };
  }, []);
  const series = ix?.series || [];
  const inst = series.filter((x) => x.era === 'instrumental');
  return {
    loaded: !!ix,
    built: ix?.built || null,
    n: series.length,
    points: series.reduce((s, x) => s + (x.n || 0), 0),
    first: series.length ? Math.min(...series.map((x) => x.first)) : null,
    last: series.length ? Math.max(...series.map((x) => x.last)) : null,
    instFirst: inst.length ? Math.min(...inst.map((x) => x.first)) : null,
  };
}

const yearLabel = (y) => (y == null ? '' : y < 0 ? fmtYear(y, { ka: false }) : `${Math.trunc(y)} CE`);

let co2Promise = null;
function useLatestCo2() {
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!co2Promise) co2Promise = fetch('/data/series/co2-mauna-loa-annual.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
    let live = true;
    co2Promise.then((x) => { if (live) setD(x); });
    return () => { live = false; };
  }, []);
  const pts = d?.points || [];
  const last = pts.length ? pts[pts.length - 1] : null;
  return last ? { year: last[0], ppm: last[1], institution: d.institution, source: d.source } : null;
}

const D = ({ children }) => <span style={{ ...mono, fontWeight: 700, fontSize: '0.92em' }}>{children}</span>;

const PAGE_INDEX = [
  ['TCP-00', '#/', 'HOME', NEON[6], <>the state of the project itself: what is built, what is not, and what every other page is for</>],
  ['TCP-01', '#/state', 'THE STATE OF IT', NEON[8], <>what is happening right now, in the numbers the measuring institutions publish - each with its period, its producer, its publication date and a link straight to the source</>],
  ['TCP-02', '#/projects', 'THE PROJECTS', NEON[7], <>the big coordinated efforts - model intercomparisons, observing systems, drilling programmes, attribution services - each leading with where the work has actually got to</>],
  ['TCP-03', '#/deeptime', 'DEEP TIME', NEON[1], <>every series on one numeric year axis, from <D>800,000</D> years of Antarctic ice to last month's flask sample, with significant climate events marked and described on every chart</>],
  ['TCP-04', '#/models', 'MODELS', NEON[0], <>a two-layer energy balance model run live in the browser: hindcast against the observed record and scored, then projected to <D>2100</D> on six concentration pathways</>],
  ['TCP-05', '#/methods', 'METHODS', NEON[3], <>the analysis catalogue - trend, anomaly, variability, change point, relation - each run on a real series with its mathematics and its caveat printed beside the answer</>],
  ['TCP-06', '#/orgs', 'THE ORGANISATIONS', NEON[5], <>who actually produces climate knowledge worldwide, sorted by what kind of body they are, because an assessment, a measurement and a negotiated target are three different things</>],
  ['TCP-07', '#/game', 'THE GAME', NEON[2], <>Climate City: a city builder about big-city resilience, driven by this site's own two-layer model, so the grid you build is scored by physics already hindcast in public - nothing is playable yet and the page says so</>],
  ['TCP-08', '#/news', 'NEWS', NEON[4], <>news runs read through the knowledge graph, observed and inferred kept structurally separate</>],
];

function CroppedGiant({ children, cut, height, size, color, style = {} }) {
  return (
    <div style={{ overflow: 'hidden', height, ...style }}>
      <div style={{ marginTop: cut ? `calc(-1 * ${cut})` : 0 }}>
        <GiantType size={size} color={color}>{children}</GiantType>
      </div>
    </div>
  );
}

const Signature = () => <span style={{ color: NEON[0], fontSize: '0.6em' }}>.</span>;

function NavLink({ href, label, active }) {
  return (
    <a href={href} className={'cm-link cm-link--2' + (active ? ' cm-link--on' : '')} style={{
      ...mono, fontSize: 12, letterSpacing: '0.1em', textDecoration: 'none',
      color: active ? NEON[0] : INK, paddingBottom: 2,
    }}>{active ? <Bracket color={NEON[0]}>{label}</Bracket> : label}</a>
  );
}

function Nav({ route }) {
  const ix = useSeriesIndex();
  const callsign = (
    <span>TCP<span style={{ opacity: 0.45 }}>{SEP_SAFE}</span>
      <span style={{ color: NEON[0], letterSpacing: '0.06em' }}>///</span></span>
  );
  const status = [callsign, ix.loaded ? `${ix.n} SERIES` : 'READING INDEX'];
  return (
    <nav style={{ ...wrap, display: 'flex', gap: 26, padding: '14px 24px', borderBottom: '1px solid ' + INK, alignItems: 'center', flexWrap: 'wrap' }}>
      <a href="#/" style={{ ...display, fontSize: 15, letterSpacing: '0.02em', textDecoration: 'none', color: INK }}>
        THE CLIMATE PROJECT<span style={{ color: NEON[0] }}>.</span>
      </a>
      {PAGE_INDEX.filter(([, href]) => href !== '#/').map(([, href]) => (
        <NavLink key={href} href={href} label={NAV_LABEL[href]} active={route === href} />
      ))}
      <span style={{ flex: 1, minWidth: 12 }} />
      <TerminalLine items={status} style={{ fontSize: 10.5, opacity: 0.85 }} />
    </nav>
  );
}

const NAV_LABEL = {
  '#/state': 'THE STATE', '#/projects': 'THE PROJECTS', '#/deeptime': 'DEEP TIME',
  '#/models': 'MODELS', '#/methods': 'METHODS', '#/orgs': 'ORGS', '#/game': 'GAME',
  '#/news': 'NEWS',
};

function Stat({ label, value, color, count }) {
  const ref = useCount(count ? value : null);
  return (
    <span style={{ display: 'block' }}>
      <span style={{ ...mono, display: 'block', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9, marginBottom: 6 }}>{label}</span>
      <span ref={ref} className={count ? 'cm-count' : undefined}
        style={{ ...display, fontSize: 'clamp(30px, 3.6vw, 46px)', lineHeight: 1, letterSpacing: '-0.02em', color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </span>
  );
}

function StatStrip({ items }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '22px 64px', alignItems: 'flex-end',
      borderTop: '1px solid ' + INK, borderBottom: '1px solid ' + INK, padding: '18px 0 20px', marginTop: 22,
    }}>
      {items.map(([label, value, color, count]) => (
        <Stat key={label} label={label} value={value} color={color} count={!!count} />
      ))}
    </div>
  );
}

function SiteFooter() {
  const ix = useSeriesIndex();
  const co2 = useLatestCo2();
  const [channel, setChannel] = useState(-1);
  const lit = (code) => ({
    onMouseEnter: () => setChannel(NODE_FOR_PAGE[code]),
    onMouseLeave: () => setChannel(-1),
    onFocus: () => setChannel(NODE_FOR_PAGE[code]),
    onBlur: () => setChannel(-1),
  });
  const n = (x, p = 2) => x.toFixed(p);
  const F = co2 ? co2Forcing(co2.ppm) : null;
  const lam = lambdaFromEcs(TWO_BOX_DEFAULTS.ecs);
  const excess = co2 ? (co2.ppm - C_PREINDUSTRIAL) * GTC_PER_PPM : null;
  const rows = [
    co2 && {
      name: 'FORCING',
      formula: `F = ${ALPHA_CO2} ln(C/C${'₀'})`,
      input: `C = ${n(co2.ppm)} ppm ${co2.year}, C${'₀'} = ${C_PREINDUSTRIAL}`,
      result: `${n(F)} ${UNITS.wm2}`,
    },
    {
      name: 'FEEDBACK',
      formula: `lambda = F2x / ECS`,
      input: `${F2X} / ${n(TWO_BOX_DEFAULTS.ecs, 1)} K`,
      result: `${n(lam)} ${unit('W m^-2 K^-1')}`,
    },
    co2 && {
      name: 'AIRBORNE',
      formula: `(C - C${'₀'}) × ${GTC_PER_PPM} GtC/ppm`,
      input: `${n(co2.ppm)} - ${C_PREINDUSTRIAL} = ${n(co2.ppm - C_PREINDUSTRIAL)} ppm`,
      result: `${Math.round(excess).toLocaleString()} GtC`,
    },
    ix.first != null && {
      name: 'DATUM',
      formula: `year = ${PRESENT} - ageBP`,
      input: `oldest age ${Math.round(kaBP(ix.first) * 1000).toLocaleString()} yr BP`,
      result: yearLabel(ix.first),
    },
    ix.loaded && {
      name: 'RECORD',
      formula: 'span = last - first',
      input: `${ix.n} series, ${ix.points.toLocaleString()} points`,
      result: `${Math.round(ix.last - ix.first).toLocaleString()} years`,
    },
  ].filter(Boolean);
  return (
    <InkBand pad="0 0 0" style={{ marginTop: 140, position: 'relative' }}>
      <FooterInstrument active={channel} />
      <div style={{ ...wrap, paddingTop: 60, position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px 56px', alignItems: 'start' }}>
          <div>
            <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 12 }}>THE INDEX</div>
            {}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(5, auto)', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)', gap: '2px 26px' }}>
              {PAGE_INDEX.map(([code, href, name]) => (
                <a key={code} href={href} className="cm-link" {...lit(code)} style={{
                  ...mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: PAPER, textDecoration: 'none', display: 'flex', gap: 12, padding: '3px 0',
                }}>
                  <span style={{ opacity: 0.65 }}>{code}</span>
                  <span>{name}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 10 }}>THE STANDING CALCULATION</div>
            <CalcBlock rows={rows} color={NEON[4]} base={PAPER} />
            {}
            <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9, marginTop: 10, lineHeight: 1.7 }}>
              <span style={{ color: NEON[0], letterSpacing: '0.04em' }}>//</span>
              <span style={{ color: NEON[4], fontWeight: 700, padding: '0 0.55em 0 0.4em' }}>PROVENANCE</span>
              {[
                'COMPUTED IN THIS BROWSER',
                'MYHRE ET AL. 1998',
                'AR6 CENTRAL ECS 3.0 K',
                `PRESENT = ${PRESENT}, THE RADIOCARBON DATUM`,
                ix.built ? `INDEX BUILT ${ix.built}` : null,
              ].filter(Boolean).map((t, i) => (
                <span key={i}>
                  {i > 0 && <SepMark color={NEON[4]} size={0.4} gap="0.6em" />}
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ ...mono, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.75, marginTop: 44 }}>
          THE CLIMATE PROJECT {SEP} READ THE RECORD HONESTLY, MODEL WHERE IT GOES, GRAPH BOTH
        </div>
        {}
        <CroppedGiant size="clamp(34px, 7.4vw, 96px)" height="clamp(28px, 5.6vw, 74px)"
          color={PAPER} style={{ marginTop: 34 }}>
          THE CLIMATE PROJECT<Signature />
        </CroppedGiant>
      </div>
    </InkBand>
  );
}

function HomePage() {
  const ix = useSeriesIndex();

  return (
    <main style={wrap}>
      {}
      <div style={{ position: 'relative' }}>
        <HomeHero />
        <div style={{ position: 'relative' }}>
          <MetaBar style={{ marginTop: 28 }} items={[
            ['INDEX', 'TCP-00'],
            ['PAGE', 'Home'],
            ['PAGES', String(PAGE_INDEX.length - 1)],
            ['SERIES', ix.loaded ? String(ix.n) : 'Reading the index'],
            ['INDEX BUILT', ix.built || '-'],
          ]} />

          <div style={{ height: 84 }} />
          <GiantType>THE CLIMATE</GiantType>
          <GiantType>PROJECT<Signature /></GiantType>
          <TerminalLine style={{ marginTop: 16 }}
            items={['CLIMATE DATA', 'MODELLING', 'PREDICTIONS', 'GRAPHED HONESTLY']} />

          <Statement>
            The whole record on one axis. Every model scored before it speaks.
          </Statement>
          <div style={{ height: 56 }} />
        </div>
      </div>

      <SectionRule label="THE RECORD, IN NUMBERS" count={4} color={NEON[1]} />
      <StatStrip items={[
        ['SERIES BUILT', ix.loaded ? ix.n : '-', NEON[1], ix.loaded],
        ['DATA POINTS', ix.loaded ? ix.points.toLocaleString() : '-', NEON[4], ix.loaded],
        ['RECORD BEGINS', ix.first != null ? `${Math.round((1950 - ix.first) / 1000)} ka BP` : '-', NEON[3], ix.first != null],
        ['CHART ENGINE', 'ECHARTS 6', NEON[0], false],
      ]} />
      {}
      {ix.loaded && (
        <CalcBlock style={{ marginTop: 20 }} color={NEON[1]} rows={[
          {
            name: 'SPAN', formula: 'span = last - first',
            input: `${yearLabel(ix.last)} back to ${yearLabel(ix.first)}`,
            result: `${Math.round(ix.last - ix.first).toLocaleString()} years`,
          },
          {
            name: 'DATUM', formula: `ka BP = (${PRESENT} - year) / 1000`,
            input: `oldest point ${yearLabel(ix.first)}`,
            result: `${kaBP(ix.first).toFixed(1)} ka BP`,
          },
          ix.instFirst != null && {
            name: 'MEASURED', formula: '(last - instrumental first) / span',
            input: `${Math.round(ix.last - ix.instFirst)} of ${Math.round(ix.last - ix.first).toLocaleString()} years`,
            result: `${((ix.last - ix.instFirst) / (ix.last - ix.first) * 100).toFixed(3)} % of the axis`,
          },
        ].filter(Boolean)} />
      )}

      {}
      <HaikuRule id="deeptime" />

      <SectionRule label="WHAT THIS IS" color={NEON[0]} art={<Art id="energy" color={NEON[0]} size={44} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(200px, 1fr)', gap: 40, marginTop: 22, alignItems: 'start' }}>
        <Prose style={{ fontSize: 16, maxWidth: '72ch' }}>
          A working instrument for reading the climate record and modelling where it goes. Every series here was pulled from
          the institution that produces it, converted once into one house format, and is charted on a numeric year axis that
          holds the whole record - the ice core and the satellite pass on the same line. Every model runs in front of you,
          and is scored against the observations before it is allowed to say anything about the future.
        </Prose>
        <div style={{ justifySelf: 'end', lineHeight: 0 }}>
          <Art id="globe" color={NEON[5]} size={168} />
        </div>
      </div>

      {}
      <Haiku id="arithmetic" />

      <SectionRule label="THE PAGES" count={PAGE_INDEX.length - 1} color={NEON[4]} />
      <div style={{ marginTop: 22 }}>
        {PAGE_INDEX.filter(([code]) => code !== 'TCP-00').map(([code, href, name, color, body]) => (
          <ListRow key={code} code={code} name={name} desc={body} color={color} href={href}
            right={<span style={{ ...mono, fontSize: 10.5, letterSpacing: '0.1em', opacity: 0.85 }}>READ</span>} />
        ))}
      </div>

      {}
      <Haiku id="spread" align="right" />

      <SectionRule label="THE HONEST STATUS" count={2} color={NEON[3]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, marginTop: 22 }}>
        <div>
          <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: NEON[4], marginBottom: 10 }}>BUILT</div>
          <TerminalLog lines={[
            `${ix.loaded ? ix.n : '-'} observed series, ingested and provenance-stamped`,
            'The house chart on a numeric year axis, with event markers',
            'A two-layer energy balance model, hindcast and scored',
            'An analysis catalogue that states its own caveats',
          ]} />
        </div>
        <div>
          <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: NEON[7], marginBottom: 10 }}>NOT BUILT</div>
          <TerminalLog lines={[
            'Pathways are anchor points interpolated, not the annual SSP files',
            'No CMIP ensemble output, no regional anything',
            'No aerosol, volcanic or solar forcing history in the model',
            'The knowledge graph is being seeded, not finished',
          ]} />
        </div>
      </div>

      {}
      <HaikuRule id="channels" />
    </main>
  );
}

export default function App() {
  const route = useHashRoute();
  useScrollTopOnRoute(route);
  const { key: pageKey, ...transition } = pageProps(route);
  const page = route === '#/deeptime' ? <DeepTimePage />
    : route === '#/models' ? <ModelsPage />
      : route === '#/methods' ? <MethodsPage />
        : route === '#/news' ? <NewsPage />
          : route === '#/state' ? <StatePage />
            : route === '#/orgs' ? <OrgsPage />
              : route === '#/projects' ? <ProjectsPage />
                : route === '#/game' ? <GamePage />
                  : <HomePage />;
  return (
    <>
      <SkipLink />
      <Nav route={route} />
      {}
      <div id="main" key={pageKey} {...transition}>{page}</div>
      <SiteFooter />
    </>
  );
}
