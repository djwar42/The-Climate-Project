import React, { useEffect, useRef, useState } from 'react';
import ClimateChart from './ClimateChart.jsx';
import {
  MetaBar, GiantType, TerminalLine, TerminalLog, CalcBlock, SectionRule, ListRow,
  EmptyFolder, NeonCard, DataLine, mono, wrap, display, reading, SEP, HeroBlock,
} from './theme.jsx';
import { NEON } from './neon.js';
import { Haiku, HaikuRule } from './haiku.jsx';
import { Art, PageEmblem } from './art/climate_art.jsx';
import { StatementBand } from './art/abstract_art.jsx';
import NewsHero from './art/hero/news.jsx';
import NewsMark from './art/mark/news.jsx';
import { NewsIcon, typeOf } from './art/news_icons.jsx';
import { RegisterBlock, RegisterKey, REGISTER_META, LoadingLine } from './ref_kit.jsx';
import { useStagger } from './motion.js';

const REGISTER = REGISTER_META;

const getJSON = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);

function hostOf(url) {
  try { return new URL(url).host.replace(/^www\./, '').toUpperCase(); }
  catch (e) { return String(url || '').slice(0, 40).toUpperCase(); }
}

function ChartBlock({ b }) {
  const [s, setS] = useState(null);
  const [full, setFull] = useState(false);
  useEffect(() => { getJSON(`/data/series/${b.series}.json`).then(setS); }, [b.series]);
  if (!s) return <LoadingLine style={{ margin: '10px 0' }}>LOADING {b.series}</LoadingLine>;
  return (
    <div style={{ margin: '14px 0', cursor: full ? 'default' : 'pointer' }} onClick={() => !full && setFull(true)}>
      <ClimateChart series={[{ name: s.name, points: s.points, color: NEON[0] }]}
        events={full ? (b.events || []) : []} height={full ? 320 : 110} slideout={full} yName={full ? s.unit : ''} />
      <DataLine style={{ marginTop: 4, opacity: 0.9 }}>{b.caption || s.name}{!full && ' · CLICK TO EXPAND'}</DataLine>
    </div>
  );
}

function Block({ b }) {
  if (b.type === 'h') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 26, marginBottom: 6 }}>
        <NewsIcon type={typeOf(b.text)} size={26} />
        <div style={{ ...display, fontSize: 20 }}>{b.text}</div>
      </div>
    );
  }
  if (b.type === 'chart') return <ChartBlock b={b} />;
  if (REGISTER[b.type]) return <RegisterBlock register={b.type}>{b.text}</RegisterBlock>;
  return <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, maxWidth: '72ch', margin: '12px 0' }}>{b.text}</p>;
}

function RegisterLegend({ blocks = [] }) {
  const counts = Object.fromEntries(Object.keys(REGISTER).map((k) => [k, blocks.filter((b) => b.type === k).length]));
  return <RegisterKey counts={counts} />;
}

function SourceList({ children }) {
  const ref = useStagger();
  return <div ref={ref} style={{ marginTop: 14 }}>{children}</div>;
}

export default function NewsPage() {
  const [index, setIndex] = useState(null);
  const [post, setPost] = useState(null);
  const registersRef = useRef(null);
  useEffect(() => {
    getJSON('/data/news/index.json').then((ix) => {
      setIndex(ix);
      const first = ix?.posts?.[0];
      if (first) getJSON(`/data/news/${first}`).then(setPost);
    });
  }, []);

  const rounds = index?.posts?.length || 0;
  const blocks = post?.blocks?.length || 0;
  const sources = post?.sources?.length || 0;

  return (
    <main style={wrap}>
      {}
      <HeroBlock art={<NewsHero />}>
        <MetaBar style={{ marginTop: 28 }} items={[
          ['INDEX', 'TCP-08'],
          ['ROUND', post ? post.date : rounds ? 'Loading' : 'None published yet'],
          ['SOURCES', String(sources)],
          ['BLOCKS', String(blocks)],
          ['ROUNDS PUBLISHED', String(rounds)],
        ]} />

        <div style={{ marginTop: 30 }}>
          <GiantType>NEWS<span style={{ color: NEON[0] }}>.</span></GiantType>
        </div>
        <TerminalLine style={{ marginTop: 12 }} items={[
          'ONE RUN IS ONE ROUND',
          'INGEST THE SOURCES',
          'THINK OVER THE HAUL',
          'CREATE REAL KNOWLEDGE',
          'PUBLISH ONE POST',
        ]} />
        <StatementBand mark={<NewsMark height={300} />}>Observed, inference and mundane are kept apart so you can see which is which.</StatementBand>
      </HeroBlock>

      {!index || !rounds ? (
        <>
          <SectionRule label="THE ROUNDS" count={0} color={NEON[4]} />
          <EmptyFolder
            code="0"
            label="NO ROUNDS PUBLISHED YET"
            hint="The news run publishes here. Each round writes one dated post into public/data/news, adds its filename to the index, and lands its findings in the knowledge graph in the same commit."
            action="READ THE THREE REGISTERS BELOW"
            onClick={() => registersRef.current && registersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
          <TerminalLog style={{ marginTop: 4 }} lines={[
            'NO ROUND HAS BEEN PUBLISHED YET',
            `ONE ROUND IS ONE PASS: INGEST THE SOURCES ${SEP} THINK OVER THE HAUL ${SEP} CREATE REAL KNOWLEDGE ${SEP} PUBLISH ONE POST`,
            'EVERY FINDING IS FILED AS OBSERVED, INFERENCE OR MUNDANE BEFORE A WORD OF IT IS WRITTEN',
            'A FIGURE WITH NO NAMED SOURCE AND NO DATE DOES NOT GO IN',
            'THE FINDINGS AND THE POST LAND IN THE SAME BEAT, OR NEITHER DOES',
          ]} />
        </>
      ) : !post ? (
        <>
          <SectionRule label="THE ROUND" color={NEON[0]} />
          <LoadingLine style={{ marginTop: 18 }}>LOADING THE LATEST ROUND</LoadingLine>
        </>
      ) : (
        <>
          <SectionRule label={`THE ROUND ${SEP} ${post.date}`} count={blocks} color={NEON[0]}
            right={<RegisterLegend blocks={post.blocks} />} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, margin: '20px 0 6px' }}>
            <span style={{ flex: 'none', lineHeight: 0, paddingTop: 4 }}><NewsIcon type={typeOf(post.title)} size={40} /></span>
            <div style={{ ...display, fontSize: 'clamp(24px, 3.4vw, 38px)', letterSpacing: '-0.015em', maxWidth: '30ch', lineHeight: 1.06 }}>{post.title}</div>
          </div>
          {post.blocks?.map((b, i) => <Block key={i} b={b} />)}

          {post.knowledge && (
            <NeonCard color={NEON[8]} title="KNOWLEDGE CREATED THIS ROUND" style={{ marginTop: 26 }}>
              <p style={{ ...reading, fontSize: 15, lineHeight: 1.65, margin: 0, maxWidth: '72ch' }}>{post.knowledge}</p>
            </NeonCard>
          )}

          {sources > 0 && (
            <>
              <SectionRule label="SOURCES" count={sources} color={REGISTER.observed.color}
                art={<Art id="records" color={REGISTER.observed.color} size={40} />} />
              <SourceList>
                {post.sources.map((s, i) => (
                  <ListRow key={i}
                    code={String(i + 1).padStart(2, '0')}
                    name={s.title || hostOf(s.url)}
                    color={REGISTER.observed.color}
                    meta={hostOf(s.url)}
                    href={s.url}
                    right={<span style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', opacity: 0.9 }}>OPEN</span>} />
                ))}
              </SourceList>
            </>
          )}

          {rounds > 1 && (
            <>
              <SectionRule label="EARLIER ROUNDS" count={rounds - 1} color={NEON[5]} />
              <div style={{ marginTop: 14 }}>
                {index.posts.slice(1).map((f, i) => (
                  <ListRow key={f}
                    code={String(i + 2).padStart(2, '0')}
                    name={f.replace('.json', '')}
                    color={NEON[5]}
                    meta={f}
                    onClick={() => getJSON(`/data/news/${f}`).then(setPost)}
                    right={<span style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', opacity: 0.9 }}>LOAD</span>} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {}
      <Haiku id="keeling" align="right" />

      <div ref={registersRef} />
      <SectionRule label="THE THREE REGISTERS, KEPT APART ON PURPOSE" count={3}
        art={<Art id="telescope" color={NEON[3]} size={40} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(240px, 1fr)', gap: 40, marginTop: 22, alignItems: 'start' }}>
        <div>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0, maxWidth: '72ch' }}>
            A post here is not written as one voice. It is built from typed blocks, and three of those types are
            registers of knowledge that stay visually separate: OBSERVED is a fact from a named source with a date,
            INFERENCE is our reading of what those facts imply, and MUNDANE is the boring alternative explanation
            recorded beside the interesting one so you can take it instead.
          </p>
          <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: '16px 0 0', maxWidth: '72ch' }}>
            Climate is a subject where the difference between a measurement, an assessment and an opinion is the whole
            game, and prose blurs those together effortlessly. Keeping them structurally apart means you can scan the
            colours alone and see how much of a post is fact and how much is us talking.
          </p>
          <div style={{ marginTop: 22 }}>
            {}
            {Object.entries(REGISTER).map(([k, r]) => (
              <RegisterBlock key={k} register={k}>{r.gloss}</RegisterBlock>
            ))}
          </div>
        </div>
        <div>
          {}
          {post && blocks > 0 && (
            <>
              <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9, marginBottom: 4 }}>
                THIS ROUND, BY REGISTER {SEP} {post.date}
              </div>
              {}
              {Object.entries(REGISTER).map(([k, r]) => {
                const c = post.blocks.filter((b) => b.type === k).length;
                return (
                  <CalcBlock key={k} color={r.color} rows={[{
                    name: r.tag,
                    formula: `${k} blocks / all blocks`,
                    input: `${c} of ${blocks}`,
                    result: `${(c / blocks * 100).toFixed(0)} %`,
                  }]} />
                );
              })}
              <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9, marginTop: 10, lineHeight: 1.7 }}>
                THE REMAINDER IS HEADINGS, PLAIN PROSE AND CHARTS
              </div>
            </>
          )}
          <PageEmblem page="news" width={300} />
        </div>
      </div>

      <HaikuRule id="thinweek" />
      <div style={{ height: 140 }} />
    </main>
  );
}
