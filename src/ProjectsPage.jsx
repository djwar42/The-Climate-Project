import React, { useState } from 'react';
import { useFeed } from './StatePage.jsx';
import {
  NeonCard, DataLine, Prose, Bracket, TerminalLine, GiantType, MetaBar,
  SectionRule, ListRow, ViewToggle, ENTRY_VIEWS, DEFAULT_ENTRY_VIEW,
  TagChip, EmptyFolder, SEP, mono, wrap, display, reading, HeroBlock,
} from './theme.jsx';
import { NEON } from './neon.js';
import { Haiku, HaikuRule } from './haiku.jsx';
import { Art, ArtBand, PageEmblem } from './art/climate_art.jsx';
import { StatementBand } from './art/abstract_art.jsx';
import ProjectsHero from './art/hero/projects.jsx';
import ProjectsMark from './art/mark/projects.jsx';
import { Counter, InlineLink, LoadingLine } from './ref_kit.jsx';
import { useStagger } from './motion.js';

const STATUS_META = {
  underway: {
    color: '#ff8a00', label: 'UNDERWAY',
    gloss: 'Work is happening right now, and the result is not in yet.',
  },
  active: {
    color: '#00d084', label: 'ACTIVE',
    gloss: 'A running service rather than a finite job - an observing system does not finish.',
  },
  complete: {
    color: '#7b1fe0', label: 'COMPLETE',
    gloss: 'Delivered what it set out to deliver and stopped. The data outlives the project.',
  },
  dormant: {
    color: '#cc2a0f', label: 'DORMANT',
    gloss: 'The website is still up and still speaks in the present tense, but no real activity could be found. The entry carries the date of the last activity we could find, so you can judge the gap yourself rather than take our word for it.',
  },
};
const FALLBACK = { color: '#e8324a', label: 'UNCONFIRMED', gloss: 'We could not confirm what state this one is in, so the page says so rather than assuming it is running.' };
const statusOf = (p) => STATUS_META[p.status] || { ...FALLBACK, label: String(p.status || 'unconfirmed').toUpperCase() };
const latestLabel = (p) => (p.status === 'dormant' ? 'LAST ACTIVITY FOUND' : 'WHERE IT HAS GOT TO');

function lede(text, min = 120, max = 300) {
  const t = String(text || '').trim();
  if (t.length <= max) return t;
  const parts = t.split(/(?<=[.!?])\s+/);
  let out = '';
  for (const s of parts) {
    if (out && (out.length >= min || (out + ' ' + s).length > max)) break;
    out = out ? out + ' ' + s : s;
  }
  if (out.length > max) out = out.slice(0, max).replace(/\s+\S*$/, '') + ' ...';
  return out;
}

function FilterChip({ label, count, color, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...mono, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
      background: 'transparent', border: 'none', padding: '2px 0', cursor: 'pointer',
      color: active ? color : 'var(--sui-ink, #2a2722)', fontWeight: active ? 700 : 500,
    }}>
      {active
        ? <Bracket color={color}>{label} {count}</Bracket>
        : <span>{label} <span style={{ color }}>{count}</span></span>}
    </button>
  );
}

function ProjectRow({ p }) {
  const st = statusOf(p);
  const meta = [
    p.runBy ? `RUN BY ${String(p.runBy).toUpperCase()}` : null,
    p.since ? `SINCE ${p.since}` : null,
    p.latest?.date ? `${latestLabel(p)} ${p.latest.date}` : null,
  ].filter(Boolean).join(`  ${SEP}  `);
  return (
    <ListRow
      code={String(p.id || p.name).toUpperCase()}
      color={st.color}
      name={<span>{p.name} <TagChip label={st.label} color={st.color} style={{ marginLeft: 6, verticalAlign: '1px' }} /></span>}
      desc={lede(p.what)}
      meta={meta}
      right={p.url && (
        <a href={p.url} target="_blank" rel="noreferrer" style={{
          ...mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: st.color, border: '1px solid ' + st.color, padding: '4px 9px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>THE PROJECT</a>
      )}
    />
  );
}

function ProjectCard({ p }) {
  const st = statusOf(p);
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + st.color, background: 'rgba(42,39,34,0.035)', paddingBottom: 14 }}>
      <ArtBand forKey={p.id || p.name} color={st.color} height={118} echoes={3} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ ...display, fontSize: 24, color: st.color, letterSpacing: '-0.01em' }}>{p.name}</span>
          <TagChip label={st.label} color={st.color} />
        </div>
        <DataLine style={{ marginTop: 3 }}>
          {p.full}{p.runBy ? ` · RUN BY ${String(p.runBy).toUpperCase()}` : ''}{p.since ? ` · SINCE ${p.since}` : ''}
        </DataLine>
        {Array.isArray(p.founders) && p.founders.length > 0 && (
          <DataLine style={{ marginTop: 3 }}>FOUNDED BY {p.founders.join(' · ').toUpperCase()}</DataLine>
        )}
        {p.what && <p style={{ ...reading, fontSize: 14.5, lineHeight: 1.62, margin: '10px 0 0' }}>{p.what}</p>}
        {p.produces && (
          <div style={{ borderLeft: '3px solid ' + st.color, paddingLeft: 10, marginTop: 10 }}>
            <DataLine color={st.color} style={{ fontWeight: 700 }}>PRODUCES</DataLine>
            <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.55, margin: '2px 0 0' }}>{p.produces}</p>
          </div>
        )}
        {p.latest?.title && (
          <div style={{ marginTop: 10 }}>
            <DataLine style={{ opacity: 0.9 }}>{latestLabel(p)} · {p.latest.date || 'UNDATED'}</DataLine>
            <InlineLink href={p.latest.url} color={st.color} external
              style={{ ...reading, fontSize: 13.5, lineHeight: 1.5 }}>
              {p.latest.title}
            </InlineLink>
          </div>
        )}
        {p.url && (
          <div style={{ marginTop: 12 }}>
            <a href={p.url} target="_blank" rel="noreferrer" style={{ ...mono, fontSize: 10.5, letterSpacing: '0.08em', color: st.color, border: '1px solid ' + st.color, padding: '4px 10px', textDecoration: 'none' }}>
              THE PROJECT
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function CardGrid({ children }) {
  const ref = useStagger();
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 16, marginTop: 22 }}>
      {children}
    </div>
  );
}

export default function ProjectsPage() {
  const { data, loading } = useFeed('/data/projects.json');
  const projects = data?.projects || [];
  const [st, setSt] = useState('ALL');
  const [view, setView] = useState(DEFAULT_ENTRY_VIEW);
  const states = [...new Set(projects.map((p) => p.status).filter(Boolean))];
  const shown = st === 'ALL' ? projects : projects.filter((p) => p.status === st);
  const countOf = (k) => projects.filter((p) => p.status === k).length;
  const stateKeys = [...Object.keys(STATUS_META), ...states.filter((k) => !STATUS_META[k])];

  return (
    <main style={wrap}>
      {}
      <HeroBlock art={<ProjectsHero />}>
        <MetaBar style={{ marginTop: 28 }} items={[
          ['INDEX', 'TCP-02'],
          ['CATALOGUE', 'Coordinated climate efforts'],
          ['PROJECTS', loading ? 'loading' : String(projects.length)],
          ['STATES', loading ? 'loading' : String(states.length)],
          ['FEED UPDATED', data?.updated || 'not written yet'],
        ]} />

        <div style={{ marginTop: 26 }}>
          <GiantType>THE</GiantType>
          <GiantType>PROJECTS<span style={{ color: NEON[0] }}>.</span></GiantType>
        </div>
        <TerminalLine style={{ marginTop: 12 }} items={[
          'THE MODEL INTERCOMPARISONS', 'THE OBSERVING SYSTEMS', 'THE DRILLING PROGRAMMES',
          'THE ATTRIBUTION SERVICES', 'EVERY ENTRY LEADS WITH ITS STATE',
        ]} />
        <StatementBand mark={<ProjectsMark height={300} />}>
          An organisation is a permanent address, and a project is a finite effort whose ending is
          the hardest thing to find out from the outside.
        </StatementBand>
      </HeroBlock>

      <SectionRule label="THE STATES, AND WHY WE SHOW THEM" count={stateKeys.length} color={NEON[4]}
        art={<Art id="dial" color={NEON[4]} size={40} />} />
      <Prose style={{ marginTop: 18, maxWidth: '74ch' }}>
        The big coordinated efforts: the model intercomparisons, the observing systems, the drilling programmes,
        the attribution services, and the finance and diplomacy initiatives that promise to change the emissions
        themselves. Organisations are permanent and projects are not, so every entry here leads with where the
        work has actually got to.
      </Prose>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20, marginTop: 22 }}>
        {stateKeys.map((k) => {
          const m = STATUS_META[k] || { ...FALLBACK, label: k.toUpperCase() };
          return (
            <NeonCard key={k} color={m.color} title={m.label}>
              <p style={{ ...reading, fontSize: 13.2, lineHeight: 1.55, margin: 0 }}>{m.gloss}</p>
              {!loading && <DataLine color={m.color} style={{ marginTop: 8, fontWeight: 700 }}>{countOf(k)} PROJECTS</DataLine>}
            </NeonCard>
          );
        })}
      </div>
      <Prose style={{ marginTop: 20, maxWidth: '74ch' }}>
        A project homepage will describe its ambition in the present tense for years after the funding ended, and a
        reader cannot tell from the site whether the thing was done. That gap is what the status field is for. Where
        we could not confirm a project's current state, the entry says unconfirmed rather than assuming it is running.
      </Prose>

      {loading && <LoadingLine style={{ marginTop: 96 }}>LOADING THE PROJECT FEED</LoadingLine>}

      {!loading && !projects.length && (
        <>
          <SectionRule label="ALL PROJECTS" count={0} color={NEON[7]} />
          <EmptyFolder
            code="0"
            label="THIS FEED IS EMPTY"
            hint="This page reads public/data/projects.json. Until that file exists the page says so, rather than describing projects from memory."
            action="GO BACK HOME"
            href="#/"
          />
        </>
      )}

      {projects.length > 0 && (
        <>
          <SectionRule
            label="ALL PROJECTS"
            count={projects.length}
            color={NEON[0]}
            right={(
              <span style={{ display: 'inline-flex', gap: 20, alignItems: 'baseline', flexWrap: 'wrap' }}>
                {}
                <Counter n={shown.length} total={projects.length} color={NEON[0]} />
                <ViewToggle options={ENTRY_VIEWS} value={view} onChange={setView} color={NEON[0]} />
              </span>
            )}
            art={<Art id="network" color={NEON[0]} size={40} />}
          />
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'baseline', marginTop: 16 }}>
            <FilterChip label="ALL" count={projects.length} color={NEON[0]} active={st === 'ALL'} onClick={() => setSt('ALL')} />
            {states.map((k) => (
              <FilterChip key={k} label={(STATUS_META[k]?.label) || k.toUpperCase()} count={countOf(k)}
                color={STATUS_META[k]?.color || FALLBACK.color} active={st === k} onClick={() => setSt(k)} />
            ))}
          </div>
          <DataLine style={{ marginTop: 12, opacity: 0.9 }}>
            FEED UPDATED {data.updated || 'UNDATED'} {SEP}{' '}
            {view === 'LIST' ? 'LIST GIVES THE OPENING LINES - GRID CARRIES THE WHOLE ENTRY' : 'GRID CARRIES THE WHOLE ENTRY, ITS OUTPUT AND ITS LATEST ACTIVITY'}
          </DataLine>

          {view === 'LIST' ? (
            <div style={{ marginTop: 22, borderBottom: '1px solid rgba(42,39,34,0.3)' }}>
              {shown.map((p, i) => <ProjectRow key={p.id || i} p={p} />)}
            </div>
          ) : (
            <CardGrid>
              {shown.map((p, i) => <ProjectCard key={p.id || i} p={p} />)}
            </CardGrid>
          )}
        </>
      )}

      {}
      <Haiku id="proxy" />

      <SectionRule label="WHY PROJECTS GET THEIR OWN PAGE" color={NEON[3]}
        art={<Art id="satellite" color={NEON[3]} size={40} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(240px, 1fr)', gap: 40, marginTop: 22, alignItems: 'start' }}>
        <div>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0, maxWidth: '72ch' }}>
            Almost everything we know about the climate came out of a coordinated project rather than a single
            institution: the model intercomparisons that let anyone compare like with like, the float array that finally
            measured the deep ocean, the drilling programmes that reached back eight hundred thousand years. An
            organisation is a permanent address; a project is a finite effort with an aim, a result and an ending.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, marginTop: 14, maxWidth: '72ch' }}>
            That ending is the thing hardest to find out from the outside, and the reason every entry here leads with its
            status. The data outlives the project, and a reader trying to use that data needs to know whether they are
            looking at a live programme or a finished one whose website was never updated.
          </p>
        </div>
        <PageEmblem page="projects" width={300} />
      </div>

      {}
      <HaikuRule id="continuity" />
      <div style={{ height: 140 }} />
    </main>
  );
}
