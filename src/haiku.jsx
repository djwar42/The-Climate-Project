import React from 'react';
import { NEON } from './neon.js';
import { reading, mono, legibleInk } from './theme.jsx';

const INK = '#2a2722';

const isLight = (c) => legibleInk(c) !== c;
const markAlpha = (c) => (isLight(c) ? 0.62 : 0.34);

function tint(c, a) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(c));
  if (!m) return `rgba(42,39,34,${a})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const NEON_IX = new Map(NEON.map((c, i) => [c.toLowerCase(), i]));
function altInk(c) {
  const i = NEON_IX.get(String(c).toLowerCase());
  return NEON[(i == null ? 0 : i + 5) % NEON.length];
}

export const HAIKUS = [
  { key: 'icecore', where: 'deeptime', color: NEON[5],
    lines: ['Eight hundred thousand', 'winters pressed into the glass.', 'Each bubble, one breath.'],
    note: 'The EPICA core. Air trapped in a bubble IS a breath of that year\'s atmosphere.' },

  { key: 'keeling', where: 'state, news', color: NEON[8],
    lines: ['The forest breathes in,', 'breathes out, and the line climbs on.', 'Sawtooth up a hill.'],
    note: 'The Mauna Loa sawtooth: the northern biosphere inhaling each summer, on a rising trend.' },

  { key: 'datum', where: 'deeptime', color: NEON[3],
    lines: ['We agreed on "now"', 'and now is nineteen fifty.', 'Everything counts back.'],
    note: 'The radiocarbon datum. year = 1950 - ageBP, the line the whole deep-time axis rests on.' },

  { key: 'baseline', where: 'state', color: NEON[0],
    lines: ['Warmer. But than when?', 'The baseline is half the fact.', 'Say which years you mean.'],
    note: 'The state page\'s entire argument, at seventeen syllables.' },

  { key: 'ocean', where: 'state, models', color: NEON[1],
    lines: ['Nine tenths of the heat', 'sank quietly into the sea.', 'The sea does not shout.'],
    note: 'Ocean heat content: the smoothest record we hold, and the one nobody photographs.' },

  { key: 'model', where: 'models', color: NEON[3],
    lines: ['Two boxes of sea,', 'one quick, one slow, and the sky.', 'That is the whole thing.'],
    note: 'The two-layer energy balance model, described completely and accurately.' },

  { key: 'hindcast', where: 'models', color: NEON[0],
    lines: ['Before it may speak', 'of twenty one hundred, it', 'must first draw the past.'],
    note: 'The models page in running order. A projection with no hindcast has no standing.' },

  { key: 'spread', where: 'state', color: NEON[5],
    lines: ['Five careful answers,', 'none of them the same number.', 'The gap is the truth.'],
    note: 'Five institutions, one year, five figures. The spread is the honest uncertainty.' },

  { key: 'deeptime', where: 'deeptime', color: NEON[1],
    lines: ['The ice has come and', 'gone a hundred times before.', 'It is going now.'],
    note: 'The glacial cycles in the 800 kyr record, and the one clause that is not like them.' },

  { key: 'flask', where: 'state, methods', color: NEON[4],
    lines: ['A flask on a hill', 'in the middle of the sea.', 'Someone drove up there.'],
    note: 'Mauna Loa. Every point on that curve is a person who went and collected it.' },

  { key: 'lag', where: 'models, game', color: NEON[7],
    lines: ['What is raised tonight,', 'the wind tells the sky. The sea', 'hears, and answers late.'],
    note: 'Thermal inertia, and the hardest thing about the subject to feel. The ocean answers what was built, decades after it was built.' },

  { key: 'proxy', where: 'deeptime', color: NEON[9],
    lines: ['Tree rings, corals, ice,', 'mud at the bottom of lakes.', 'The earth wrote it down.'],
    note: 'The palaeo archives. Nobody was measuring, and there is a record anyway.' },

  { key: 'methods', where: 'methods', color: NEON[2],
    lines: ['Ask the same record', 'two questions, get two answers.', 'Both of them are true.'],
    note: 'The methods page: choosing the method is part of the claim, not a technicality.' },

  { key: 'institutions', where: 'orgs, projects', color: NEON[1],
    lines: ['Someone must measure.', 'Someone else must check the sum.', 'Neither is the same.'],
    note: 'Why the orgs page types its bodies. An assessment is not a measurement.' },

  { key: 'seawall', where: 'game, projects', color: NEON[4],
    lines: ['Build the seawall now,', 'or explain to the water', 'why you chose to wait.'],
    note: 'The game in three lines. Adaptation is a decision with a deadline you do not set.' },

  { key: 'arithmetic', where: 'home', color: NEON[6],
    lines: ['Five lines of working,', 'not one of the figures typed.', 'The page does the sum.'],
    note: 'The home page\'s arithmetic block, and the standing calculation under every page. Both compute every row at render from the loaded index, and both DROP a row whose inputs never arrived rather than filling it.' },

  { key: 'channels', where: 'home', color: NEON[7],
    lines: ['The ocean answers', 'the stars in a slower tongue.', 'We keep both records.'],
    note: 'The foot of the home page, under the index of nine channels. The two slowest things this site reads across, and the fact that both are written down here.' },

  { key: 'revision', where: 'state', color: NEON[8],
    lines: ['The figure was changed.', 'A later number replaced', 'it. Both of them true.'],
    note: 'Note 5 on the anatomy of a card. Climate figures get revised, and a superseded figure was not wrong on the day it was published.' },

  { key: 'unmoved', where: 'state', color: NEON[3],
    lines: ['Change the baseline, change', 'the dataset, change the years.', 'The world did not move.'],
    note: 'The three things that move a climate number without the world moving, which is the section this sits under.' },

  { key: 'sediment', where: 'deeptime', color: NEON[9],
    lines: ['Mud keeps better time', 'than we ever asked it to.', 'It was not for us.'],
    note: 'The sediment archives. A record laid down by nobody, for nobody, and legible anyway.' },

  { key: 'drill', where: 'deeptime, projects', color: NEON[4],
    lines: ['They drilled through the ice', 'one metre at a time, and', 'came back with the sky.'],
    note: 'The coring programmes. What comes up the borehole is old air, which is the only reason the record exists.' },

  { key: 'sensitivity', where: 'models', color: NEON[5],
    lines: ['What one doubling buys', 'is the question still open.', 'A range, not a point.'],
    note: 'Climate sensitivity. The page runs a central value and prints it as a choice, because the assessed figure is a range.' },

  { key: 'absent', where: 'models', color: NEON[6],
    lines: ['No clouds and no wind,', 'no volcano, no season.', 'One number for Earth.'],
    note: 'The list the models page prints beside its own projection. What the emulator leaves out is stated, not left to be discovered.' },

  { key: 'trend', where: 'methods', color: NEON[8],
    lines: ['Pick your start year well.', 'A trend is a line drawn, and', 'a decision made.'],
    note: 'Where a fit begins is part of the claim it makes. This page treats that choice as method rather than as a technicality.' },

  { key: 'instrument', where: 'methods', color: NEON[1],
    lines: ['Each tool here prints how', 'it can mislead you, beside', 'the answer it gives.'],
    note: 'THE ONE RULE THIS PAGE KEEPS. A catalogue that showed only outputs would teach a reader to trust outputs.' },

  { key: 'demand', where: 'game', color: NEON[9],
    lines: ['The city wants light', 'tonight, and it does not care', 'what you think of coal.'],
    note: 'Step 01 of the loop. The load has to be covered every turn, and that constraint is what makes it a game.' },

  { key: 'lifecycle', where: 'game', color: NEON[0],
    lines: ['Count the whole thing: mines,', 'concrete, the trucks, the taking', 'down. Not just the smoke.'],
    note: 'Why solar is not zero on the piece cards. The carbon figures are lifecycle medians, covering construction, fuel, operation and decommissioning.' },

  { key: 'continuity', where: 'projects', color: NEON[3],
    lines: ['A record needs hands.', 'Somebody funded the next', 'year, and then the next.'],
    note: 'A long series is not one measurement. It is a decision renewed for decades, by people who mostly did not see the end of it.' },

  { key: 'target', where: 'orgs', color: NEON[7],
    lines: ['A target is not', 'a measurement. It is what', 'a room agreed to.'],
    note: 'Why the orgs page types its bodies. A negotiated number and an observed one are different kinds of thing.' },

  { key: 'thinweek', where: 'news', color: NEON[2], form: 'terminal',
    lines: ['Nothing much this week.', 'The round says so and shows what', 'it checked to find out.'],
    note: 'The round that found little and published the checking rather than inflating the haul.' },

  { key: 'notbuilt', where: 'home', color: NEON[7], form: 'terminal',
    lines: ['The second column', 'lists what is not here. No one', 'had to write that list.'],
    note: 'THE HONEST STATUS. The NOT BUILT column exists because nothing obliged it to.' },

  { key: 'fraction', where: 'home', color: NEON[4], form: 'terminal',
    lines: ['All we ever watched', 'is a hairline on the chart.', 'The rest is inferred.'],
    note: 'The MEASURED row of the home arithmetic: the instrumental record is a computed fraction of the whole axis, and everything older is proxy.' },

  { key: 'dropped', where: 'home', color: NEON[3], form: 'terminal',
    lines: ['A row with no source', 'is not printed. The blank space', 'is the honest one.'],
    note: 'The standing calculation drops a row whose inputs never arrived rather than filling it.' },

  { key: 'label', where: 'state', color: NEON[0], form: 'terminal',
    lines: ['The label is half', 'the figure. Read the small type', 'or read nothing here.'],
    note: 'READ THIS FIRST, restated. Nearly every figure on the page is a difference from a stated reference.' },

  { key: 'reanalysis', where: 'state', color: NEON[5], form: 'terminal',
    lines: ['One of them is fed', 'each observation, and it', 'runs warm by design.'],
    note: 'Card 2 on the anatomy: a reanalysis is a weather model fed every observation, so it sits slightly warm against the station records by construction.' },

  { key: 'budget', where: 'state', color: NEON[9], form: 'terminal',
    lines: ['A budget remains.', 'It is one number, and it', 'is the loudest one.'],
    note: 'WHAT WE ARE PUTTING IN: the remaining budget is the most policy-loaded number on the page, and the page says so.' },

  { key: 'ceiling', where: 'deeptime', color: NEON[0], form: 'terminal',
    lines: ["The machine's own clock", 'runs out before the ice does.', 'So the year is plain.'],
    note: 'The CEILING row. The browser is asked at render how far back its own date type reaches, and the ice reaches further, which is why every year here is a plain number.' },

  { key: 'window', where: 'deeptime', color: NEON[5], form: 'terminal',
    lines: ['One window, and all', 'the charts look through it at once.', 'The joints, not round years.'],
    note: 'THE WINDOW. One shared range drives every open chart, and the presets sit at the joints of the record rather than at round decimal years.' },

  { key: 'ledger', where: 'deeptime', color: NEON[3], form: 'terminal',
    lines: ['Each event we mark', 'carries the note on its date.', 'A year can be wrong.'],
    note: 'THE EVENT LEDGER. Every row carries its dating provenance, because a palaeo year is an estimate with a method behind it.' },

  { key: 'bench', where: 'deeptime', color: NEON[1], form: 'terminal',
    lines: ['Open one, it climbs', 'to the bench. The rest wait, closed,', 'down along the spine.'],
    note: 'ON THE BENCH. The page is a workbench rather than a scroll: what you open rises, the rest stay collapsed.' },

  { key: 'gate', where: 'models', color: NEON[0], form: 'terminal',
    lines: ['The test it fails is', 'printed beneath the ones it', 'passes. Same size type.'],
    note: 'THE GATES. The one the projection does not pass is printed under the ones it does, at the same weight.' },

  { key: 'slider', where: 'models', color: NEON[1], form: 'terminal',
    lines: ['Move it, and the score', 'moves. A prettier future', 'costs you the past here.'],
    note: 'THE PARAMETERS. The hindcast score recomputes on every slider move, so a setting that buys a better-looking projection usually pays for it in the score.' },

  { key: 'splice', where: 'models', color: NEON[5], form: 'terminal',
    lines: ['Where the ice hands off', 'to the flask, we name the join', 'and we do not blend.'],
    note: 'The CO2 input: ice core to the year direct measurement began, flask record after. A hard join, named, both sources cited, nothing smoothed across it.' },

  { key: 'weakest', where: 'models', color: NEON[6], form: 'terminal',
    lines: ['The weakest thing here', 'wears a label saying so.', 'Read it as a floor.'],
    note: 'The semi-empirical sea level relation. It carries no ice sheet dynamics, so the page labels it the weakest model on it and asks you to read it as a lower bound.' },

  { key: 'refuse', where: 'methods', color: NEON[7], form: 'terminal',
    lines: ['A tool that cannot', 'speak here refuses, and prints', "the reason it can't."],
    note: 'NO METHOD RUNS WHERE IT DOES NOT APPLY. A method that does not fit the chosen series is marked NOT RUN with its reason, rather than producing a plausible wrong number.' },

  { key: 'smoother', where: 'methods', color: NEON[1], form: 'terminal',
    lines: ['Weigh by the year, not', 'by the point: the core is dense', 'in some centuries.'],
    note: 'Why the Gaussian filter weights by year distance and a running mean over an index window does not: an ice core is sampled unevenly in time.' },

  { key: 'breakpoint', where: 'methods', color: NEON[3], form: 'terminal',
    lines: ['Ask when it changed and', 'it will always name a year.', 'Ask if it changed first.'],
    note: 'The change-point test assumes at most one breakpoint and returns a year whether or not one exists. Its caveat is printed with its result.' },

  { key: 'pvalue', where: 'methods', color: NEON[0], form: 'terminal',
    lines: ['The p looks certain.', 'It has not been told the years', 'lean on each other.'],
    note: 'The rank trend test does not correct for serial autocorrelation, so its p-value is optimistic. The page says so under the number.' },

  { key: 'ending', where: 'game', color: NEON[5], form: 'terminal',
    lines: ['The score comes at last.', 'The ending was mostly set', 'in the early turns.'],
    note: 'Step 04 of the loop. The game is scored at the end, and the early turns decide most of it, which is the lag made playable.' },

  { key: 'bothendings', where: 'game', color: NEON[4], form: 'terminal',
    lines: ['A game that must end', 'badly lies as loudly as', 'one that must end well.'],
    note: 'HAPPY CLIMATE, in seventeen syllables: a climate game with only one possible ending is dishonest in either direction.' },

  { key: 'edges', where: 'orgs', color: NEON[5], form: 'terminal',
    lines: ['Who would go blind if', 'this one stopped? That is the edge', 'we write down as well.'],
    note: 'The knowledge graph. A data centre publishes its outputs; it rarely names the observing programme it would be blind without, so the dependency is recorded as an edge.' },

  { key: 'pledge', where: 'orgs', color: NEON[2], form: 'terminal',
    lines: ['A pledge is money', 'talking about itself. The', 'air did not hear it.'],
    note: 'The FINANCE and COALITION kinds. A portfolio commitment is a statement about capital, never a finding about the atmosphere.' },

  { key: 'dormant', where: 'projects', color: NEON[9], form: 'terminal',
    lines: ['The site still speaks in', 'the present tense. We could find', 'nobody at work.'],
    note: 'The DORMANT state. A project homepage keeps its ambition in the present tense long after the work stopped, which is what the status field is for.' },

  { key: 'registers', where: 'news', color: NEON[4], form: 'terminal',
    lines: ['A disc, then a ring.', 'The shape says who said it, and', 'greyscale keeps it true.'],
    note: 'The three registers carry colour, word AND a drawn glyph, so the epistemic shape of a round reads down its left edge without colour.' },

  { key: 'mundane', where: 'news', color: NEON[8], form: 'terminal',
    lines: ['Beside the strange thing', 'we file the dull one, so you', 'may take that instead.'],
    note: 'The MUNDANE register: the boring alternative explanation, recorded next to the interesting one rather than left out of it.' },
];

const BY_KEY = new Map(HAIKUS.map((h) => [h.key, h]));

export function haikuFor(key) {
  return BY_KEY.get(key) || HAIKUS[0];
}

const LINE_FULL = 'clamp(13.5px, calc(4.6vw - 1.2px), 23px)';
const LINE_QUIET = 'clamp(12.5px, calc(3.6vw + 0.6px), 18px)';

function Lines({ lines, fontSize, gutter }) {
  return lines.map((line, i) => (
    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: gutter ? '0.75em' : 0 }}>
      {gutter}
      <div data-hline="" style={{
        ...reading, fontSize, lineHeight: 1.55, letterSpacing: '-0.005em',
        whiteSpace: 'nowrap', color: INK, opacity: 0.94,
      }}>{line}</div>
    </div>
  ));
}

function QuoteMark({ c, size }) {
  return (
    <span aria-hidden="true" style={{
      fontFamily: 'Moderustic, sans-serif', fontSize: size,
      lineHeight: 0.72, color: c, opacity: markAlpha(c), flex: 'none',
      transform: 'translateY(0.06em)', userSelect: 'none',
    }}>&ldquo;</span>
  );
}

function QuoteLabel({ id, c, style = {} }) {
  return (
    <figcaption style={{
      ...mono, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
      color: legibleInk(c), marginTop: 12, opacity: 0.95, ...style,
    }}>
      <span style={{ opacity: 0.55 }}>[</span>
      <span style={{ padding: '0 0.4em' }}>{id}</span>
      <span style={{ opacity: 0.55 }}>]</span>
    </figcaption>
  );
}

export function Haiku({ id, color, align = 'left', style = {} }) {
  const h = haikuFor(id);
  const c = color || h.color;
  return (
    <figure data-haiku="quote" data-key={h.key} style={{
      margin: '52px 0', display: 'flex', gap: 'clamp(10px, 1.4vw, 18px)', alignItems: 'flex-start',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start', ...style,
    }}>
      <QuoteMark c={c} size="clamp(38px, 8.6vw, 92px)" />
      <blockquote style={{ margin: 0, minWidth: 0 }}>
        <Lines lines={h.lines} fontSize={LINE_FULL} />
        <QuoteLabel id={h.key} c={c} />
      </blockquote>
    </figure>
  );
}

export function HaikuRule({ id, color, style = {} }) {
  const h = haikuFor(id);
  const c = color || h.color;
  return (
    <figure data-haiku="rule" data-key={h.key} style={{
      margin: '40px 0', borderLeft: '2px solid ' + c, paddingLeft: 'clamp(12px, 1.4vw, 18px)',
      ...style,
    }}>
      <figcaption style={{
        ...mono, fontSize: 8.5, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: legibleInk(c), opacity: 0.8, marginBottom: 7,
      }}>
        <span aria-hidden="true" style={{
          display: 'inline-block', width: '0.4em', height: '0.4em', background: c,
          marginRight: '0.7em', verticalAlign: '0.02em',
        }} />
        {h.key}
      </figcaption>
      <blockquote style={{ margin: 0, minWidth: 0 }}>
        <Lines lines={h.lines} fontSize={LINE_QUIET} />
      </blockquote>
    </figure>
  );
}

const railOf = (unit, len = 260) => unit.repeat(Math.ceil(len / unit.length)).slice(0, len);
const RAIL_TOP = '+=' + railOf('==//==-');
const RAIL_MID = '|:' + railOf('::..::##..');
const RAIL_BOT = '\\_' + railOf('__//__.');
const LEADER = railOf('.');

const FADE_PX = 118;
const fadeTo = (c) => `linear-gradient(90deg, ${c} 0, ${c} calc(100% - ${FADE_PX}px), transparent 100%)`;
const FADE_MASK = { maskImage: fadeTo('#000'), WebkitMaskImage: fadeTo('#000') };

function Chrome({ c, children, size = 10, alpha = 0.85, style = {} }) {
  return (
    <div aria-hidden="true" style={{
      ...mono, fontSize: size, lineHeight: 1.35, letterSpacing: 0, whiteSpace: 'nowrap',
      overflow: 'hidden', color: legibleInk(c), opacity: alpha, userSelect: 'none',
      ...FADE_MASK, ...style,
    }}>{children}</div>
  );
}

function Block({ c, w = 0.5, h = 0.9, a = 1, style = {} }) {
  return <span aria-hidden="true" style={{
    display: 'inline-block', width: `${w}em`, height: `${h}em`, background: c,
    opacity: a, verticalAlign: '-0.08em', ...style,
  }} />;
}

function Hatch({ c, alt, h = 7, a = 0.55, style = {} }) {
  return <div aria-hidden="true" style={{
    height: h, opacity: a, ...FADE_MASK,
    background: `repeating-linear-gradient(135deg, ${c} 0 3px, transparent 3px 6px, ${alt} 6px 9px, transparent 9px 13px)`,
    ...style,
  }} />;
}

export function HaikuTerminal({ id, color, style = {} }) {
  const h = haikuFor(id);
  const c = color || h.color;
  const alt = altInk(c);
  const key = h.key.toUpperCase();
  const gutter = (
    <span aria-hidden="true" style={{
      ...mono, fontSize: LINE_QUIET, color: c, opacity: 0.5, flex: 'none', userSelect: 'none',
    }}>|</span>
  );
  const hair = {
    position: 'absolute', left: 0, right: 0, height: 1,
    background: fadeTo(tint(INK, 0.38)),
  };
  return (
    <figure data-haiku="terminal" data-key={h.key} style={{
      position: 'relative', margin: '46px 0', maxWidth: 'min(100%, 760px)',
      padding: 'clamp(11px, 1.2vw, 15px) 0 clamp(11px, 1.2vw, 15px) clamp(11px, 1.3vw, 16px)',
      background: fadeTo(tint(c, 0.11)), borderLeft: '3px solid ' + c,
      overflow: 'hidden', ...style,
    }}>
      <div aria-hidden="true" style={{ ...hair, top: 0 }} />
      <div aria-hidden="true" style={{ ...hair, bottom: 0 }} />

      <Chrome c={c} alpha={0.75}>{RAIL_TOP}</Chrome>

      <Chrome c={c} style={{ marginTop: 4 }}>
        <Block c={c} w={0.55} h={0.85} />
        <Block c={alt} w={0.28} h={0.85} a={0.85} style={{ marginLeft: 2 }} />
        {` >> TCP //// :: ${key} :: 5-7-5 ${LEADER}`}
      </Chrome>

      <Chrome c={alt} size={9} alpha={0.55}>{RAIL_MID}</Chrome>
      <Hatch c={c} alt={alt} style={{ margin: '5px 0 0' }} />

      <div style={{ margin: '12px 0 11px' }}>
        <Lines lines={h.lines} fontSize={LINE_QUIET} gutter={gutter} />
      </div>

      <Hatch c={alt} alt={c} h={5} a={0.4} style={{ margin: '0 0 5px' }} />

      <Chrome c={c} alpha={0.7}>
        {'| << '}
        <Block c={c} w={0.45} h={0.8} a={0.9} />
        {` :: END :: 5 7 5 :: OK ${LEADER}`}
      </Chrome>

      <Chrome c={alt} alpha={0.65} style={{ marginTop: 3 }}>{RAIL_BOT}</Chrome>
    </figure>
  );
}

export default Haiku;
