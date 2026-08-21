import React, { useEffect, useMemo, useState } from 'react';
import ClimateChart from './ClimateChart.jsx';
import {
  NeonCard, NeonChip, Prose, DataLine, MetaBar, GiantType, TerminalLine, CalcBlock,
  SectionRule, ListRow, TagChip, TerminalLog, SEP, mono, wrap, display, reading, HeroBlock,
} from './theme.jsx';
import { NEON } from './neon.js';
import { Haiku, HaikuRule } from './haiku.jsx';
import { runModel, hindcastScore, co2Forcing, PATHWAYS, TWO_BOX_DEFAULTS, F2X, ALPHA_CO2, C_PREINDUSTRIAL } from './models.js';
import { UNITS, unit } from './type.js';
import { Art, PageEmblem } from './art/climate_art.jsx';
import { StatementBand } from './art/abstract_art.jsx';
import ModelsHero from './art/hero/models.jsx';
import ModelsMark from './art/mark/models.jsx';
import { GateState, SourceMark, LoadingLine } from './ref_kit.jsx';

const INK = '#2a2722';
const GIS_C = '#2160ff';
const HAD_C = '#00b3a4';
const getJSON = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);

function spliceCo2(ice, mlo) {
  const out = new Map();
  if (ice) for (const [y, v] of ice.points) if (y >= 1700 && y < 1959) out.set(Math.round(y), v);
  if (mlo) for (const [y, v] of mlo.points) out.set(Math.round(y), v);
  return [...out.entries()].sort((a, b) => a[0] - b[0]);
}

function useModelData() {
  const [d, setD] = useState(null);
  useEffect(() => {
    Promise.all([
      getJSON('/data/series/co2-antarctic-800kyr.json'),
      getJSON('/data/series/co2-mauna-loa-annual.json'),
      getJSON('/data/series/gistemp-annual.json'),
      getJSON('/data/series/hadcrut5-annual.json'),
      getJSON('/data/series/sea-level-satellite.json'),
    ]).then(([ice, mlo, gis, had, sea]) => setD({ ice, mlo, gis, had, sea, co2: spliceCo2(ice, mlo) }));
  }, []);
  return d;
}

function Slider({ label, value, min, max, step, onChange, unit, note, color }) {
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + color, background: 'rgba(42,39,34,0.04)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color }}>{label}</span>
        <span style={{ ...display, fontSize: 24, color }}>{value.toFixed(2)}<span style={{ fontSize: 12, marginLeft: 4 }}>{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, marginTop: 8 }} />
      {note && <DataLine style={{ marginTop: 4, opacity: 0.85 }}>{note}</DataLine>}
    </div>
  );
}

function BigValue({ value, unit, label, note, color, size = 40 }) {
  return (
    <div style={{ borderTop: '4px solid ' + color, paddingTop: 12, minWidth: 190 }}>
      <div style={{ ...display, fontSize: size, lineHeight: 1, color, letterSpacing: '-0.02em' }}>
        {value}{unit && <span style={{ ...mono, fontSize: Math.round(size * 0.3), fontWeight: 700, marginLeft: 6 }}>{unit}</span>}
      </div>
      <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginTop: 8 }}>{label}</div>
      {note && <DataLine style={{ marginTop: 4, opacity: 0.9 }}>{note}</DataLine>}
    </div>
  );
}

export default function ModelsPage() {
  const data = useModelData();
  const [ecs, setEcs] = useState(3.0);
  const [other, setOther] = useState(1.26);
  const [picked, setPicked] = useState(['ssp126', 'ssp245', 'ssp370', 'ssp585']);

  const runs = useMemo(() => {
    if (!data || !data.co2.length) return null;
    const out = {};
    for (const p of PATHWAYS) {
      out[p.id] = runModel({ history: data.co2, pathway: p, ecs, otherForcing: other, startYear: 1850, endYear: 2100 });
    }
    return out;
  }, [data, ecs, other]);

  const bar = (extra = []) => [
    ['INDEX', 'TCP-04'],
    ['MODEL', 'Two-layer energy balance'],
    ['REGISTER', 'Model output, not observation'],
    ...extra,
  ];

  if (!data || !runs) {
    return (
      <main style={wrap}>
        <MetaBar style={{ marginTop: 28 }} items={bar()} />
        <div style={{ marginTop: 26 }}><GiantType>MODELS<span style={{ color: NEON[0] }}>.</span></GiantType></div>
        <LoadingLine style={{ marginTop: 30 }}>LOADING THE OBSERVED RECORD</LoadingLine>
      </main>
    );
  }

  const base = runs.ssp245;
  const scoreGis = hindcastScore(base.temperature, data.gis.points, 1880, 2024);
  const scoreHad = hindcastScore(base.temperature, data.had.points, 1880, 2024);
  const SCORE_PERIOD = '1880 TO 2024';

  const hindcastSeries = [
    { name: 'MODEL', points: base.temperature.filter(([y]) => y <= 2025), color: NEON[0], width: 2.5 },
    { name: 'GISTEMP', points: data.gis.points, color: GIS_C, width: 1.6 },
    { name: 'HadCRUT5', points: data.had.points, color: HAD_C, width: 1.6, dashed: true },
  ];

  const chosen = PATHWAYS.filter((p) => picked.includes(p.id));
  const projSeries = [
    { name: 'OBSERVED (GISTEMP)', points: data.gis.points, color: INK, width: 2 },
    ...chosen.map((p) => ({
      name: p.name, color: p.color, width: 2,
      points: runs[p.id].temperature.filter(([y]) => y >= 2025),
    })),
  ];
  const concSeries = chosen.map((p) => ({
    name: p.name, color: p.color, width: 2,
    points: runs[p.id].concentration.filter(([y]) => y >= 1850),
  }));
  const seaSeries = chosen.map((p) => ({
    name: p.name, color: p.color, width: 2,
    points: runs[p.id].sealevel.filter(([y]) => y >= 1993).map(([y, v], i, a) => [y, v - a[0][1]]),
  }));

  const at = (id, y) => runs[id].temperature.find(([yy]) => yy === y)?.[1];
  const preInd = base.temperature.filter(([y]) => y >= 1850 && y <= 1900);
  const preIndOffset = preInd.reduce((s, [, v]) => s + v, 0) / (preInd.length || 1);
  const atPI = (id, y) => { const v = at(id, y); return v == null ? null : v - preIndOffset; };

  const rmseGis = scoreGis.rmse != null ? `${scoreGis.rmse.toFixed(3)}` : '-';
  const lastC = base.concentration.find(([y]) => y === base.lastObserved)?.[1] ?? null;

  const stats = (pts) => {
    const v = pts.filter(([y]) => y >= 1880 && y <= 2024).map(([, x]) => x);
    if (v.length < 3) return { sd: null, noise: null };
    const mu = v.reduce((a, b) => a + b, 0) / v.length;
    const sd = Math.sqrt(v.reduce((a, b) => a + (b - mu) ** 2, 0) / v.length);
    let s2 = 0;
    for (let i = 1; i < v.length; i++) s2 += (v[i] - v[i - 1]) ** 2;
    return { sd, noise: Math.sqrt(s2 / (v.length - 1) / 2) };
  };
  const sGis = stats(data.gis.points);
  const sHad = stats(data.had.points);
  const under = (r, f) => (r == null || f == null ? null : r < f);
  const f3 = (x) => (x == null ? '-' : x.toFixed(3));
  const GATES = [
    { name: `RMSE VS GISTEMP BEATS THAT RECORD'S OWN SPREAD ${f3(sGis.sd)} K`, ok: under(scoreGis.rmse, sGis.sd), at: `${f3(scoreGis.rmse)} K` },
    { name: `RMSE VS HADCRUT5 BEATS THAT RECORD'S OWN SPREAD ${f3(sHad.sd)} K`, ok: under(scoreHad.rmse, sHad.sd), at: `${f3(scoreHad.rmse)} K` },
    { name: `MEAN BIAS UNDER GISTEMP'S YEAR-TO-YEAR NOISE ${f3(sGis.noise)} K`, ok: under(scoreGis.bias == null ? null : Math.abs(scoreGis.bias), sGis.noise), at: `${f3(scoreGis.bias == null ? null : Math.abs(scoreGis.bias))} K` },
    { name: 'SCORED AGAINST TWO INDEPENDENT RECORDS', ok: scoreGis.n > 0 && scoreHad.n > 0, at: `${scoreGis.n} YEARS` },
  ];

  return (
    <main style={wrap}>
      {}
      <HeroBlock art={<ModelsHero />}>
        <MetaBar style={{ marginTop: 28 }} items={bar([
          ['PATHWAYS', PATHWAYS.length],
          ['HINDCAST', `RMSE ${rmseGis} K vs GISTEMP`],
          ['YEARS SCORED', scoreGis.n],
        ])} />

        <div style={{ marginTop: 26 }}>
          <GiantType>THE MODEL</GiantType>
          <GiantType>IS SCORED<span style={{ color: NEON[0] }}>.</span></GiantType>
        </div>
        <TerminalLine style={{ marginTop: 12 }} items={[
          'TWO-LAYER ENERGY BALANCE',
          'RUN IN YOUR BROWSER, RECOMPUTED AS YOU MOVE A SLIDER',
          `HINDCAST ${SCORE_PERIOD} AGAINST TWO INDEPENDENT RECORDS`,
          'EVERY LINE HERE IS MODEL OUTPUT',
        ]} />

        <StatementBand mark={<ModelsMark height={300} />}>
          The line to 2100 has to earn its standing on 1850 to 2025 first.
        </StatementBand>
      </HeroBlock>

      <SectionRule label="THE HINDCAST SCORE" count={4} color={GIS_C}
        art={<Art id="datasets" color={GIS_C} size={46} />}
        right={<DataLine color={GIS_C}>MODEL OUTPUT {SEP} HINDCAST, NOT PROJECTION</DataLine>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: '30px 34px', marginTop: 22, alignItems: 'start' }}>
        {}
        <BigValue size={56} color={GIS_C} unit="K"
          value={<SourceMark register="inference" color={NEON[3]}
            source="THIS SITE'S TWO-LAYER MODEL vs NASA GISTEMP v4"
            url="https://data.giss.nasa.gov/gistemp/"
            date={data.gis.fetched}
            note={`Computed live in your browser by src/models.js at ECS ${ecs.toFixed(2)} K and a non-CO2 multiplier of ${other.toFixed(2)}, over ${scoreGis.n} years, ${SCORE_PERIOD.toLowerCase()}. The observed record is NASA's; the error is ours.`}>
            {rmseGis}
          </SourceMark>}
          label="RMSE vs GISTEMP"
          note={`ROOT MEAN SQUARE ERROR ${SCORE_PERIOD} · ${scoreGis.n} YEARS SCORED`} />
        <BigValue color={HAD_C} value={scoreHad.rmse != null ? scoreHad.rmse.toFixed(3) : '-'} unit="K"
          label="RMSE vs HadCRUT5"
          note={`THE SECOND, INDEPENDENT RECORD · ${SCORE_PERIOD}`} />
        <BigValue color={NEON[3]} value={scoreGis.bias != null ? `${scoreGis.bias >= 0 ? '+' : ''}${scoreGis.bias.toFixed(3)}` : '-'} unit="K"
          label="Mean bias vs GISTEMP"
          note="POSITIVE MEANS THE MODEL RUNS WARM OVER THE PERIOD" />
        <BigValue color={NEON[4]} value={scoreGis.n} label="Years scored"
          note={`EVERY YEAR ${SCORE_PERIOD} WITH BOTH A MODEL AND AN OBSERVED VALUE`} />
      </div>
      <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, maxWidth: '72ch', marginTop: 20 }}>
        This is the number the project stakes its honesty on, and it is printed whether it flatters the model or not. It
        re-computes as you move the parameters below, so a setting that buys a prettier 2100 line usually pays for it here.
      </p>

      {}
      <Haiku id="sensitivity" />

      <SectionRule label="THE PARAMETERS" count={2} color={NEON[0]} art={<Art id="dial" color={NEON[0]} size={46} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 18 }}>
        <Slider label="EQUILIBRIUM CLIMATE SENSITIVITY" value={ecs} min={1.5} max={6} step={0.05} unit="K" color={NEON[0]}
          onChange={setEcs} note={`AR6 assessed likely range 2.5 to 4.0 K, best estimate 3.0 K${ecs < 2.5 || ecs > 4 ? ' - YOU ARE OUTSIDE IT' : ''}`} />
        <Slider label="NON-CO2 FORCING MULTIPLIER" value={other} min={0.7} max={1.6} step={0.01} unit="x" color={NEON[1]}
          onChange={setOther} note="1.00 = CO2 alone. The default 1.26 is AR6's 2019 total anthropogenic forcing 2.72 divided by its CO2 part 2.16 - a ratio, not a fit." />
      </div>

      {}
      <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9, margin: '18px 0 2px' }}>
        THE RUN NOW ON THE PAGE {SEP} MODEL OUTPUT, RECOMPUTED AS YOU MOVE A SLIDER
      </div>
      <CalcBlock color={NEON[0]} rows={[
        lastC != null && {
          name: 'CO2',
          formula: 'observed: ice core to 1958, Mauna Loa after',
          input: `last observed year ${base.lastObserved}`,
          result: `${lastC.toFixed(2)} ppm`,
        },
        lastC != null && {
          name: 'FORCING',
          formula: `F = ${ALPHA_CO2} ln(C/C${'₀'}) × non-CO2`,
          input: `ln(${lastC.toFixed(2)}/${C_PREINDUSTRIAL}) × ${other.toFixed(2)}`,
          result: `${(co2Forcing(lastC) * other).toFixed(2)} ${UNITS.wm2}`,
        },
        {
          name: 'FEEDBACK',
          formula: 'lambda = F2x / ECS',
          input: `${F2X} / ${ecs.toFixed(2)} K`,
          result: `${base.lambda.toFixed(3)} ${unit('W m^-2 K^-1')}`,
        },
        {
          name: 'TWO-BOX',
          formula: 'C dT/dt = F - lambda T - epsilon gamma (T - Td)',
          input: `C ${TWO_BOX_DEFAULTS.C}, Cd ${TWO_BOX_DEFAULTS.Cd}, gamma ${TWO_BOX_DEFAULTS.gamma}, epsilon ${TWO_BOX_DEFAULTS.epsilon}`,
          result: `${base.temperature.length} annual steps`,
          note: 'HELD ET AL. 2010, GEOFFROY ET AL. 2013 CMIP5 MULTI-MODEL MEAN CALIBRATION. FORWARD EULER, DT = 1 YR',
        },
        {
          name: 'SCORE',
          formula: 'RMSE = sqrt(mean (model - obs)²)',
          input: `${scoreGis.n} years vs GISTEMP, ${SCORE_PERIOD.toLowerCase()}`,
          result: `${rmseGis} K`,
        },
      ].filter(Boolean)} />

      <SectionRule label="THE HINDCAST · 1850 TO 2025 · THE MODEL AGAINST THE OBSERVED RECORD" color={GIS_C} />
      <div style={{ marginTop: 18 }}>
        <ClimateChart series={hindcastSeries} height={340} yName="K vs 1951-1980" showLegend window={[1848, 2028]} />
      </div>
      <Prose style={{ marginTop: 12 }}>
        The model sees one input: the observed CO2 concentration, ice core before 1959 and Mauna Loa after. It has no
        volcanoes, no El Nino and no aerosol history, so it cannot reproduce the single-year spikes and dips, and it runs
        warm through the mid-century aerosol cooling that it does not know about. What it does get is the shape and the
        magnitude of the century-scale rise, which is what a global-mean emulator is for.
      </Prose>

      {}
      <HaikuRule id="hindcast" />

      <SectionRule label="THE PROJECTION · TO 2100" count={chosen.length} color={NEON[0]}
        art={<Art id="projection" color={NEON[0]} size={46} />}
        right={<DataLine color={NEON[0]}>PROJECTION {SEP} HINDCAST RMSE {rmseGis} K VS GISTEMP</DataLine>} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
        {PATHWAYS.map((p) => (
          <NeonChip key={p.id} label={p.name} color={p.color} active={picked.includes(p.id)}
            onClick={() => setPicked(picked.includes(p.id) ? picked.filter((x) => x !== p.id) : [...picked, p.id])} />
        ))}
      </div>
      {}
      <GateState gates={GATES} color={NEON[0]} title="WHAT THE PROJECTION HAD TO PASS" style={{ marginTop: 18 }} />
      <DataLine style={{ marginTop: 8, opacity: 0.95 }}>
        AND THE ONE IT DOES NOT PASS {SEP} RMSE {rmseGis} K IS STILL LARGER THAN GISTEMP&rsquo;S OWN
        YEAR-TO-YEAR NOISE OF {f3(sGis.noise)} K {SEP} A GLOBAL-MEAN EMULATOR WITH NO ENSO, NO VOLCANOES
        AND NO AEROSOL HISTORY CANNOT TRACK A SINGLE YEAR, AND THIS IS THE SIZE OF THAT GAP
      </DataLine>
      <div style={{ marginTop: 16 }}>
        <ClimateChart series={projSeries} height={380} yName="K vs 1951-1980" showLegend window={[1850, 2100]} />
      </div>
      <DataLine style={{ marginTop: 10, opacity: 0.95 }}>
        EVERY LINE PAST 2025 IS MODEL OUTPUT, NOT OBSERVATION {SEP} THE SAME PARAMETERS SCORED RMSE {rmseGis} K AGAINST
        GISTEMP OVER {scoreGis.n} YEARS, {SCORE_PERIOD} {SEP} THE INK LINE IS THE OBSERVED RECORD
      </DataLine>

      <SectionRule label="THE PATHWAYS THAT DRIVE IT" count={PATHWAYS.length} color={HAD_C}
        art={<Art id="molecule" color={HAD_C} size={46} />} />
      <DataLine style={{ marginTop: 14, opacity: 0.95 }}>
        CLICK A ROW TO PUT IT ON THE CHARTS, OR TAKE IT OFF {SEP} ALL SIX RUN REGARDLESS
      </DataLine>
      <div style={{ marginTop: 8 }}>
        {PATHWAYS.map((p) => {
          const on = picked.includes(p.id);
          return (
            <ListRow
              key={p.id}
              code={p.id}
              name={p.name}
              color={p.color}
              desc={p.blurb}
              meta={(
                <>
                  <span style={{ display: 'block' }}>{p.note}</span>
                  <span style={{ display: 'block', marginTop: 2 }}>
                    {at(p.id, 2100)?.toFixed(2)} K IN 2100 ON THE 1951-1980 BASELINE THE CHARTS USE
                  </span>
                </>
              )}
              onClick={() => setPicked(on ? picked.filter((x) => x !== p.id) : [...picked, p.id])}
              right={(
                <span style={{ display: 'flex', gap: 18, alignItems: 'flex-start', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <span style={{ textAlign: 'right' }}>
                    <div style={{ ...display, fontSize: 26, color: p.color, lineHeight: 1 }}>{atPI(p.id, 2050)?.toFixed(2)} K</div>
                    <DataLine style={{ marginTop: 3 }}>2050 VS 1850-1900</DataLine>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <div style={{ ...display, fontSize: 26, color: p.color, lineHeight: 1 }}>{atPI(p.id, 2100)?.toFixed(2)} K</div>
                    <DataLine style={{ marginTop: 3 }}>2100 VS 1850-1900</DataLine>
                  </span>
                  <span style={{ minWidth: 74, textAlign: 'right' }}>{on ? <TagChip label="ON CHART" color={p.color} /> : null}</span>
                </span>
              )}
            />
          );
        })}
      </div>
      <TerminalLog style={{ marginTop: 18 }} lines={[
        'PATHWAYS ARE ANCHOR POINTS INTERPOLATED, NOT THE FULL SSP CONCENTRATION FILES',
        'REPLACING THEM WITH THE ANNUAL RCMIP DATA IS A NAMED NEXT STEP',
        'EVERY FIGURE ABOVE IS MODEL OUTPUT AT ECS ' + ecs.toFixed(2) + ' K, NON-CO2 MULTIPLIER ' + other.toFixed(2),
      ]} />
      <div style={{ marginTop: 20 }}>
        <ClimateChart series={concSeries} height={300} yName="ppm CO2" showLegend window={[1850, 2100]} />
      </div>

      <SectionRule label="SEA LEVEL · SEMI-EMPIRICAL, FROM THE SAME TEMPERATURE" color={GIS_C}
        art={<Art id="ocean" color={GIS_C} size={46} />} />
      <div style={{ marginTop: 18 }}>
        <ClimateChart
          series={[
            { name: 'OBSERVED (ALTIMETRY)', points: data.sea.points.map(([y, v], i, a) => [y, v - a[0][1]]), color: INK, width: 1.6 },
            ...seaSeries,
          ]}
          height={300} yName="mm since 1993" showLegend window={[1993, 2100]} />
      </div>
      <Prose style={{ marginTop: 12 }}>
        This is the weakest model on the page and it is here labelled as such. Rahmstorf's relation says sea level rises in
        proportion to how far temperature sits above a threshold - a statistical fit to the twentieth century, not physics.
        It carries no ice sheet dynamics, so it cannot represent the one thing that would matter most if it happened. Read
        it as a lower-bound shape, and read the altimetry record beside it as the fact.
      </Prose>

      <SectionRule label="WHAT THIS MODEL IS, AND WHAT IT IS NOT" color={NEON[3]}
        art={<Art id="energy" color={NEON[3]} size={46} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22, marginTop: 20, alignItems: 'start' }}>
        <NeonCard color={NEON[4]} title="THE PHYSICS IT HAS">
          <ul style={{ ...reading, fontSize: 13.5, lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>Logarithmic CO2 forcing, F = {ALPHA_CO2} ln(C/C0), giving {F2X} W/m2 per doubling (Myhre et al. 1998)</li>
            <li>Two heat reservoirs: a fast surface layer and a slow deep ocean, exchanging heat (Held et al. 2010, Geoffroy et al. 2013)</li>
            <li>Feedback parameter lambda = {(F2X / ecs).toFixed(2)} W/m2/K, set by your ECS of {ecs.toFixed(2)} K</li>
            <li>Deep ocean heat uptake efficacy {TWO_BOX_DEFAULTS.epsilon}, exchange coefficient {TWO_BOX_DEFAULTS.gamma} W/m2/K</li>
          </ul>
        </NeonCard>
        <div style={{ borderTop: '4px solid ' + NEON[6], paddingTop: 12 }}>
          <div style={{ ...mono, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: NEON[6], marginBottom: 8 }}>
            THE PHYSICS IT DOES NOT HAVE
          </div>
          <TerminalLog color={NEON[6]} style={{ fontSize: 12.5, lineHeight: 1.85 }} lines={[
            'NO REGIONS, NO SEASONS, NO WEATHER - ONE GLOBAL NUMBER',
            'NO VOLCANOES, NO SOLAR CYCLE, NO ENSO, SO NO YEAR-TO-YEAR WIGGLE',
            'NO EXPLICIT AEROSOLS; EVERYTHING NON-CO2 IS THE ONE MULTIPLIER ABOVE',
            'NO CARBON CYCLE FEEDBACK: THE PATHWAY IS IMPOSED, NOT RESPONDED TO',
            'NO ICE SHEET DYNAMICS, NO TIPPING POINTS, NO AMOC',
            'THE SEA LEVEL RELATION IS STATISTICAL, NOT PHYSICAL',
          ]} />
        </div>
      </div>

      {}
      <Haiku id="model" align="right" />

      <SectionRule label="THE ORDER ON THIS PAGE IS THE ARGUMENT" color={NEON[5]} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(240px, 1fr)', gap: 26, marginTop: 20, alignItems: 'start' }}>
        <div>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
            The same parameters that draw the line to 2100 have to draw 1850 to 2025 first, against two independent
            observed records, and the error is printed whether it flatters the model or not. A projection whose hindcast
            is poor is shown as poor.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, marginTop: 12 }}>
            This is a simple model of the kind used as an emulator, the same structure at the core of FaIR and MAGICC.
            It is not a general circulation model: no dynamics, no clouds, no regions, one global number. Everything it
            says is about global mean temperature, and the gaps are listed above rather than left for you to discover.
          </p>
        </div>
        <PageEmblem page="models" width={300} />
      </div>

      {}
      <HaikuRule id="absent" />
      <div style={{ height: 140 }} />
    </main>
  );
}
