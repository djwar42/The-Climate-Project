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
import OrgsHero from './art/hero/orgs.jsx';
import OrgsMark from './art/mark/orgs.jsx';
import { Counter, InlineLink, LoadingLine } from './ref_kit.jsx';
import { useStagger } from './motion.js';

const KIND_META = {
  assessment: { color: '#7b1fe0', label: 'ASSESSMENT', gloss: 'Reads the whole literature and assesses it. Produces judgements with stated confidence, not measurements.' },
  'data-centre': { color: '#2160ff', label: 'DATA CENTRE', gloss: 'Measures, processes and publishes the series everyone else uses. Produces numbers with uncertainties.' },
  monitoring: { color: '#00b3a4', label: 'MONITORING', gloss: 'Runs the instruments and the observing networks the data centres depend on.' },
  research: { color: '#ff8a00', label: 'RESEARCH', gloss: 'Publishes papers and builds models. Where new understanding comes from.' },
  policy: { color: '#00d084', label: 'POLICY', gloss: 'Negotiates, tracks commitments and reports on the gap between them and reality.' },
  finance: { color: '#ff2d8b', label: 'FINANCE', gloss: 'Commits and steers capital, or gives it away. It neither measures nor assesses: a pledge to align a portfolio is a statement about money, not a finding about the climate.' },
  coalition: { color: '#e8324a', label: 'COALITION', gloss: 'Aggregates what its members have already promised. Its headline figure is a sum of pledges made elsewhere, so it says what a group intends, never what the atmosphere did.' },
  advocacy: { color: '#cc2a0f', label: 'ADVOCACY', gloss: 'Argues for a course of action and campaigns for it. Its output is persuasion, not a measurement and not an assessment, however well sourced the argument behind it is.' },
};
const FALLBACK = { color: '#ff5a2e', label: 'BODY', gloss: 'A kind of body we have not typed yet. It is shown as it comes from the feed rather than being forced into one of the eight.' };
const kindOf = (o) => KIND_META[o.kind] || { ...FALLBACK, label: String(o.kind || 'BODY').toUpperCase() };

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

function OrgRow({ o }) {
  const k = kindOf(o);
  const meta = [
    o.full && o.full !== o.name ? String(o.full).toUpperCase() : null,
    o.country ? String(o.country).toUpperCase() : null,
    o.founded ? `SINCE ${o.founded}` : null,
    o.latest?.date ? `MOST RECENT ${o.latest.date}` : null,
  ].filter(Boolean).join(`  ${SEP}  `);
  const link = o.readFirst?.url
    ? { url: o.readFirst.url, label: 'READ FIRST' }
    : o.url ? { url: o.url, label: 'HOME' } : null;
  return (
    <ListRow
      code={String(o.id || o.name).toUpperCase()}
      color={k.color}
      name={<span>{o.name} <TagChip label={k.label} color={k.color} style={{ marginLeft: 6, verticalAlign: '1px' }} /></span>}
      desc={lede(o.what)}
      meta={meta}
      right={link && (
        <a href={link.url} target="_blank" rel="noreferrer" style={{
          ...mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: k.color, border: '1px solid ' + k.color, padding: '4px 9px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>{link.label}</a>
      )}
    />
  );
}

function OrgCard({ o }) {
  const k = kindOf(o);
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '4px solid ' + k.color, background: 'rgba(42,39,34,0.035)', paddingBottom: 14 }}>
      <ArtBand forKey={o.id || o.name} color={k.color} height={118} echoes={3} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ ...display, fontSize: 24, color: k.color, letterSpacing: '-0.01em' }}>{o.name}</span>
          <TagChip label={k.label} color={k.color} />
        </div>
        <DataLine style={{ marginTop: 3 }}>
          {o.full}{o.country ? ` · ${String(o.country).toUpperCase()}` : ''}{o.founded ? ` · SINCE ${o.founded}` : ''}
        </DataLine>
        {Array.isArray(o.founders) && o.founders.length > 0 && (
          <DataLine style={{ marginTop: 3 }}>FOUNDED BY {o.founders.join(' · ').toUpperCase()}</DataLine>
        )}
        {o.what && <p style={{ ...reading, fontSize: 14.5, lineHeight: 1.62, margin: '10px 0 0' }}>{o.what}</p>}
        {o.publishes && (
          <div style={{ borderLeft: '3px solid ' + k.color, paddingLeft: 10, marginTop: 10 }}>
            <DataLine color={k.color} style={{ fontWeight: 700 }}>PUBLISHES</DataLine>
            <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.55, margin: '2px 0 0' }}>{o.publishes}</p>
          </div>
        )}
        {o.latest?.title && (
          <div style={{ marginTop: 10 }}>
            <DataLine style={{ opacity: 0.9 }}>MOST RECENT · {o.latest.date || 'UNDATED'}</DataLine>
            <InlineLink href={o.latest.url} color={k.color} external
              style={{ ...reading, fontSize: 13.5, lineHeight: 1.5 }}>
              {o.latest.title}
            </InlineLink>
          </div>
        )}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
          {o.readFirst?.url && (
            <a href={o.readFirst.url} target="_blank" rel="noreferrer" style={{ ...mono, fontSize: 10.5, letterSpacing: '0.08em', color: '#f4f0e4', background: k.color, padding: '4px 10px', textDecoration: 'none' }}>
              READ FIRST: {String(o.readFirst.label || 'THE ENTRY POINT').toUpperCase()}
            </a>
          )}
          {o.url && (
            <a href={o.url} target="_blank" rel="noreferrer" style={{ ...mono, fontSize: 10.5, letterSpacing: '0.08em', color: k.color, border: '1px solid ' + k.color, padding: '4px 10px', textDecoration: 'none' }}>
              HOME
            </a>
          )}
        </div>
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

export default function OrgsPage() {
  const { data, loading } = useFeed('/data/orgs.json');
  const orgs = data?.orgs || [];
  const [kind, setKind] = useState('ALL');
  const [view, setView] = useState(DEFAULT_ENTRY_VIEW);
  const kinds = [...new Set(orgs.map((o) => o.kind).filter(Boolean))];
  const shown = kind === 'ALL' ? orgs : orgs.filter((o) => o.kind === kind);
  const countOf = (k) => orgs.filter((o) => o.kind === k).length;
  const kindKeys = [...Object.keys(KIND_META), ...kinds.filter((k) => !KIND_META[k])];

  return (
    <main style={wrap}>
      {}
      <HeroBlock art={<OrgsHero />}>
        <MetaBar style={{ marginTop: 28 }} items={[
          ['INDEX', 'TCP-06'],
          ['CATALOGUE', 'Who produces climate knowledge'],
          ['BODIES', loading ? 'loading' : String(orgs.length)],
          ['KINDS', loading ? 'loading' : String(kinds.length)],
          ['FEED UPDATED', data?.updated || 'not written yet'],
        ]} />

        <div style={{ marginTop: 26 }}>
          <GiantType>THE</GiantType>
          {}
          <GiantType size="clamp(44px, 9.2vw, 122px)">ORGANISATIONS<span style={{ color: NEON[0] }}>.</span></GiantType>
        </div>
        <TerminalLine style={{ marginTop: 12 }} items={[
          'WHO MEASURES', 'WHO ASSESSES', 'WHO NEGOTIATES', 'WHO PAYS', 'WHO CAMPAIGNS',
          'ONE READ-FIRST LINK EACH',
        ]} />
        <StatementBand mark={<OrgsMark height={300} />}>
          An assessment, a measurement, a negotiated target and a pledge of capital are four different
          things, and telling them apart is most of what it takes to read a headline safely.
        </StatementBand>
      </HeroBlock>

      <SectionRule label="THE KINDS, AND WHY THE DIFFERENCE MATTERS" count={kindKeys.length} color={NEON[3]}
        art={<Art id="assembly" color={NEON[3]} size={40} />} />
      <Prose style={{ marginTop: 18, maxWidth: '74ch' }}>
        Who actually produces climate knowledge, worldwide, sorted by what kind of body each one is. The kind is
        not a label of convenience: it is what tells you how much weight the body's own numbers can carry, and
        what they are numbers about.
      </Prose>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 22 }}>
        {kindKeys.map((k) => {
          const m = KIND_META[k] || { ...FALLBACK, label: String(k).toUpperCase() };
          return (
            <NeonCard key={k} color={m.color} title={m.label}>
              <p style={{ ...reading, fontSize: 13.2, lineHeight: 1.55, margin: 0 }}>{m.gloss}</p>
              {!loading && <DataLine color={m.color} style={{ marginTop: 8, fontWeight: 700 }}>{countOf(k)} BODIES</DataLine>}
            </NeonCard>
          );
        })}
      </div>

      {}
      <Haiku id="institutions" />

      {loading && <LoadingLine style={{ marginTop: 96 }}>LOADING THE ORGANISATION FEED</LoadingLine>}

      {!loading && !orgs.length && (
        <>
          <SectionRule label="ALL BODIES" count={0} color={NEON[7]} />
          <EmptyFolder
            code="0"
            label="THIS FEED IS EMPTY"
            hint="This page reads public/data/orgs.json. Until that file exists the page says so, rather than listing organisations from memory."
            action="GO BACK HOME"
            href="#/"
          />
        </>
      )}

      {orgs.length > 0 && (
        <>
          <SectionRule
            label="ALL BODIES"
            count={orgs.length}
            color={NEON[0]}
            right={(
              <span style={{ display: 'inline-flex', gap: 20, alignItems: 'baseline', flexWrap: 'wrap' }}>
                {}
                <Counter n={shown.length} total={orgs.length} color={NEON[0]} />
                <ViewToggle options={ENTRY_VIEWS} value={view} onChange={setView} color={NEON[0]} />
              </span>
            )}
            art={<Art id="globe" color={NEON[0]} size={40} />}
          />
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'baseline', marginTop: 16 }}>
            <FilterChip label="ALL" count={orgs.length} color={NEON[0]} active={kind === 'ALL'} onClick={() => setKind('ALL')} />
            {kinds.map((k) => (
              <FilterChip key={k} label={(KIND_META[k]?.label) || k.toUpperCase()} count={countOf(k)}
                color={KIND_META[k]?.color || FALLBACK.color} active={kind === k} onClick={() => setKind(k)} />
            ))}
          </div>
          <DataLine style={{ marginTop: 12, opacity: 0.9 }}>
            FEED UPDATED {data.updated || 'UNDATED'} {SEP}{' '}
            {view === 'LIST' ? 'LIST GIVES THE OPENING LINES - GRID CARRIES THE WHOLE ENTRY' : 'GRID CARRIES THE WHOLE ENTRY, WHAT IT PUBLISHES AND ITS MOST RECENT ITEM'}
          </DataLine>

          {view === 'LIST' ? (
            <div style={{ marginTop: 22, borderBottom: '1px solid rgba(42,39,34,0.3)' }}>
              {shown.map((o, i) => <OrgRow key={o.id || i} o={o} />)}
            </div>
          ) : (
            <CardGrid>
              {shown.map((o, i) => <OrgCard key={o.id || i} o={o} />)}
            </CardGrid>
          )}
        </>
      )}

      <SectionRule label="WHAT WE DO WITH THEM" color={NEON[3]}
        art={<Art id="network" color={NEON[3]} size={40} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(240px, 1fr)', gap: 40, marginTop: 22, alignItems: 'start' }}>
        <div>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0, maxWidth: '72ch' }}>
            Every organisation here is in the project's knowledge graph as an Institution node, with edges recording what
            it produces and who feeds it: the observing network that supplies the data centre, the data centre that
            supplies the assessment, the assessment that constrains the model. When we discover a new one we graph it,
            and we graph its neighbours too, so the network of who-depends-on-whom stays visible rather than being a
            list of logos.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, marginTop: 14, maxWidth: '72ch' }}>
            That network is the part you cannot get from any single organisation's website. A data centre will tell you
            what it publishes; it will rarely tell you which observing programme it would be blind without, or which
            assessment is downstream of it. Those dependencies are what make the whole thing either robust or fragile,
            so they are recorded as edges rather than left as background knowledge.
          </p>
        </div>
        <PageEmblem page="orgs" width={300} />
      </div>

      {}
      <HaikuRule id="target" />
      <div style={{ height: 140 }} />
    </main>
  );
}
