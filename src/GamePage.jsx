import React, { useMemo } from 'react';
import {
  SectionRule, NeonCard, NeonStat, DataLine, TerminalLine,
  GiantType, OutlineButton, MetaBar, FolderPanel, SEP, mono, wrap, display, reading, HeroBlock,
} from './theme.jsx';
import { NEON } from './neon.js';
import { Haiku, HaikuRule } from './haiku.jsx';
import { IsoWorld, IsoPiece, PIECES, PROMO_PLANS } from './art/iso_art.jsx';
import { Art, PageEmblem } from './art/climate_art.jsx';
import { StatementBand } from './art/abstract_art.jsx';
import GameHero from './art/hero/game.jsx';
import GameMark from './art/mark/game.jsx';
import { co2Forcing, twoBox, C_PREINDUSTRIAL } from './models.js';

const INK = '#2a2722';

function gridOutcome(plan, ecs = 3.0) {
  let mw = 0, gco2 = 0;
  for (const t of plan) {
    const p = t.piece && PIECES[t.piece];
    if (!p) continue;
    if (p.mw > 0) { mw += p.mw; gco2 += p.mw * p.gco2; }
  }
  const intensity = mw > 0 ? gco2 / mw : 0;
  const twh = (mw / 1000) * 4.38;
  const mtco2 = (twh * 1e9 * intensity) / 1e12;
  const ppm = (mtco2 * 100) / 1000 / 3.664 / 2.124;
  const forcing = co2Forcing(C_PREINDUSTRIAL + ppm) ;
  const years = Array.from({ length: 100 }, (_, i) => [2026 + i, forcing * ((i + 1) / 100)]);
  const { temperature } = twoBox(years, { ecs });
  return { mw, intensity, mtco2, ppm, warming: temperature[temperature.length - 1][1] };
}

function Shot({ plan, caption, label, color }) {
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.4)', borderTop: '3px solid ' + color, background: `linear-gradient(170deg, ${color}18, rgba(42,39,34,0.03))` }}>
      <div style={{ padding: '10px 12px 0' }}>
        <DataLine color={color} style={{ fontWeight: 700 }}>{label}</DataLine>
      </div>
      <IsoWorld plan={plan} width={470} height={330} scale={0.95} style={{ padding: '4px 0 10px' }} />
      <div style={{ borderTop: '1px solid rgba(42,39,34,0.25)', padding: '8px 12px' }}>
        <p style={{ ...reading, fontSize: 13.2, lineHeight: 1.55, margin: 0 }}>{caption}</p>
      </div>
    </div>
  );
}

function PieceCard({ id, color }) {
  const p = PIECES[id];
  const clean = p.gco2 <= 50;
  return (
    <div style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '3px solid ' + color, background: 'rgba(42,39,34,0.035)', padding: '10px 12px 12px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: 'none' }}><IsoPiece id={id} size={72} color={color} /></div>
      <div style={{ minWidth: 0 }}>
        <DataLine color={color} style={{ fontWeight: 700 }}>{p.label}</DataLine>
        <div style={{ ...display, fontSize: 24, color, lineHeight: 1.05, marginTop: 2 }}>
          {p.gco2 < 0 ? p.gco2 : p.gco2}<span style={{ ...mono, fontSize: 10, fontWeight: 700, marginLeft: 5 }}>gCO2/kWh</span>
        </div>
        <DataLine style={{ marginTop: 3, opacity: 0.9 }}>
          {p.mw > 0 ? `${p.mw.toLocaleString()} MW` : p.mw < 0 ? `${Math.abs(p.mw).toLocaleString()} MW DEMAND` : 'NO CAPACITY'}
        </DataLine>
        <DataLine color={clean ? NEON[4] : NEON[9]} style={{ marginTop: 3, fontWeight: 700 }}>
          {p.gco2 < 0 ? 'REMOVES CARBON' : clean ? 'LOW CARBON' : 'HIGH CARBON'}
        </DataLine>
      </div>
    </div>
  );
}

export default function GamePage() {
  const outcomes = useMemo(() => {
    const fossil = gridOutcome(PROMO_PLANS.fossil);
    const mixed = gridOutcome(PROMO_PLANS.mixed);
    return {
      fossil, mixed,
      cleaner: Math.round(fossil.intensity / mixed.intensity),
      warmer: Math.round(fossil.warming / mixed.warming),
    };
  }, []);

  const spread = useMemo(() => {
    const gen = Object.values(PIECES).filter((p) => p.mw > 0);
    const best = gen.reduce((a, b) => (b.gco2 < a.gco2 ? b : a));
    const worst = gen.reduce((a, b) => (b.gco2 > a.gco2 ? b : a));
    return {
      gen: gen.length,
      low: gen.filter((p) => p.gco2 <= 50).length,
      best, worst,
      factor: Math.round(worst.gco2 / best.gco2),
    };
  }, []);

  return (
    <main style={wrap}>
      {}
      <HeroBlock art={<GameHero />}>
        <MetaBar style={{ marginTop: 28 }} items={[
          ['PROJECT', 'Climate City'],
          ['ENGINE', 'Godot 4'],
          ['CATEGORY', 'City builder'],
          ['STATUS', 'Not playable yet'],
          ['INDEX', 'TCP-07'],
        ]} />

        {}
        <div style={{ marginTop: 26 }}>
          <GiantType>HAPPY</GiantType>
          <GiantType>CLIMATE<span style={{ color: NEON[0] }}>.</span></GiantType>
        </div>
        <TerminalLine style={{ marginTop: 12 }} items={[
          'A CITY BUILDER ABOUT BIG-CITY RESILIENCE', 'REAL STANDARDS AS THE MECHANICS', 'DRIVEN BY THIS SITE’S OWN CLIMATE MODEL', 'GODOT 4', 'NOT PLAYABLE YET',
        ]} />
        <StatementBand mark={<GameMark height={300} />}>
          The grid you build, scored by the same two-box model this site hindcasts in public.
        </StatementBand>
      </HeroBlock>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 26 }}>
        <Shot plan={PROMO_PLANS.fossil} label="CONCEPT ART 01 - THE GRID YOU INHERIT" color={NEON[9]}
          caption="You start on somebody else's grid. Two coal plants, a city that wants power tonight, and a carbon intensity you did not choose." />
        <Shot plan={PROMO_PLANS.mixed} label="CONCEPT ART 02 - THE GRID YOU BUILD" color={NEON[1]}
          caption="Wind, solar, hydro on the river, nuclear on the far tile. Same demand met, and the number under the board falls as you place them." />
        <Shot plan={PROMO_PLANS.restored} label="CONCEPT ART 03 - THE LONG GAME" color={NEON[4]}
          caption="Forest on the tiles you freed, ice still on the northern edge. The slowest scoring in the game, and the only one that runs past 2100." />
      </div>
      <DataLine style={{ marginTop: 8, opacity: 0.85 }}>
        THESE ARE OUR OWN VECTOR SCENES, NOT SCREENSHOTS {SEP} NOTHING IS PLAYABLE YET AND THE PAGE WILL SAY SO UNTIL IT IS
      </DataLine>

      <SectionRule label="THE ONE IDEA" color={NEON[0]} art={<Art id="energy" color={NEON[0]} size={46} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, marginTop: 14 }}>
        <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
          The game runs on the SAME two-layer energy balance model as the MODELS page, imported from the same file. Place a
          coal plant and the grid's carbon intensity moves; the intensity drives the emissions; the emissions drive the
          concentration; the concentration drives the temperature through the identical equations that are hindcast
          against the observed record one page away, in public, with the error printed.
        </p>
        <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
          That is the whole reason to build it here rather than anywhere else. A climate game normally has to invent its
          physics and then ask you to trust it. This one cannot tell you a comforting lie about what a grid does, because
          the physics is not the game's - it is the project's, already scored against observation before the game was
          allowed to use it.
        </p>
      </div>

      {}
      <HaikuRule id="demand" />

      <FolderPanel label="WHAT THE TWO CONCEPT GRIDS ACTUALLY DO" color={NEON[3]}>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            <NeonStat label="FOSSIL GRID INTENSITY" value={`${Math.round(outcomes.fossil.intensity)}`} color={NEON[9]} />
            <NeonStat label="MIXED GRID INTENSITY" value={`${Math.round(outcomes.mixed.intensity)}`} color={NEON[1]} />
            <NeonStat label="FOSSIL, 100 YEARS" value={`+${outcomes.fossil.warming < 0.01 ? outcomes.fossil.warming.toFixed(4) : outcomes.fossil.warming.toFixed(2)} K`} color={NEON[9]} />
            <NeonStat label="MIXED, 100 YEARS" value={`+${outcomes.mixed.warming < 0.01 ? outcomes.mixed.warming.toFixed(4) : outcomes.mixed.warming.toFixed(2)} K`} color={NEON[1]} />
          </div>
          <p style={{ ...reading, fontSize: 13.8, lineHeight: 1.6, marginTop: 12, marginBottom: 0 }}>
            Intensity is grams of CO2 per kilowatt hour, capacity-weighted across whatever is on the board. The warming
            figures run each board's emissions for a century through the project's model at an ECS of 3.0 K. They are
            computed live in your browser from the two concept grids above, and they are ILLUSTRATIVE OF THE MECHANISM
            rather than a projection of anything: a five-by-five board is not a power system, and a real grid has storage,
            transmission, load factors that differ by technology, and a demand curve that moves.
          </p>
        </div>
      </FolderPanel>

      {}
      <Haiku id="seawall" />

      <SectionRule label={`THE PIECES ${SEP} AND THE REAL NUMBER EACH ONE CARRIES`} count={Object.keys(PIECES).length - 1} color={NEON[4]} art={<Art id="carbon" color={NEON[4]} size={46} />} />
      <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, maxWidth: '82ch', marginTop: 10 }}>
        Every piece carries its LIFECYCLE carbon intensity, in grams of CO2-equivalent per kilowatt hour: the IPCC AR5
        Annex III medians, covering construction, fuel, operation and decommissioning rather than just the smoke. That is
        why solar is 48 and not zero, and why nuclear at 12 sits below solar. The art registry and the simulation read the
        same table, so a piece cannot look one way and score another.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14, marginTop: 16 }}>
        {Object.keys(PIECES).filter((k) => k !== 'flare').map((id, i) => (
          <PieceCard key={id} id={id} color={PIECES[id].tint === NEON[8] ? NEON[7] : PIECES[id].tint} />
        ))}
      </div>

      {}
      <Haiku id="lifecycle" align="right" />

      <SectionRule label="THE LOOP" count={4} color={NEON[5]} art={<Art id="dial" color={NEON[5]} size={46} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginTop: 14 }}>
        {[
          ['01', 'MEET THE DEMAND', NEON[7], 'The city wants power tonight, and it does not care how you feel about coal. Every turn you have to cover the load, which is the constraint that makes the game a game rather than a slideshow.'],
          ['02', 'PLACE AND PAY', NEON[1], 'Each piece costs money, land and time to build. Wind is cheap and intermittent, nuclear is slow and steady, coal is available right now, which is exactly why it got built.'],
          ['03', 'WATCH THE MODEL', NEON[0], 'The temperature line at the bottom of the screen is the real two-box model running on your grid. It responds slowly, because the ocean does, and that lag is the hardest thing about the subject to feel.'],
          ['04', 'LIVE WITH THE LAG', NEON[3], 'What you build now shows up decades later. The game is scored at 2100, and the ending you get was mostly decided by the first twenty turns. That is the lesson and it is not a comfortable one.'],
        ].map(([n, t, c, body]) => (
          <div key={n} style={{ border: '1px solid rgba(42,39,34,0.35)', borderTop: '3px solid ' + c, background: 'rgba(42,39,34,0.035)', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
              <span style={{ ...display, fontSize: 26, color: c }}>{n}</span>
              <DataLine color={c} style={{ fontWeight: 700 }}>{t}</DataLine>
            </div>
            <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.58, margin: '7px 0 0' }}>{body}</p>
          </div>
        ))}
      </div>

      {}
      <HaikuRule id="lag" />

      {}
      <SectionRule label="HAPPY CLIMATE" count={6} color={NEON[4]} art={<Art id="energy" color={NEON[4]} size={46} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, marginTop: 14 }}>
        <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
          The banner on this page is not a mood. It is a claim that a good ending is reachable inside the same physics
          that scores the bad one, and it is the harder half of the design: a climate game that can only end badly is as
          dishonest as one that can only end well, and both are easier to build than this.
        </p>
        <p style={{ ...reading, fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
          So HAPPY CLIMATE is a board you can actually reach, scored by the model rather than by the writing. It is not a
          win screen, it is not a promise about the world, and the last card below is the case against it. If the honest
          version of a hopeful point is a qualified one, the qualified one is what this section prints.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 18 }}>
        <NeonStat label={`CLEANEST GENERATOR ${SEP} ${spread.best.label}`} value={`${spread.best.gco2}`} color={NEON[1]} />
        <NeonStat label={`DIRTIEST GENERATOR ${SEP} ${spread.worst.label}`} value={`${spread.worst.gco2}`} color={NEON[9]} />
        <NeonStat label="THE FACTOR BETWEEN THEM" value={`${spread.factor}x`} color={NEON[3]} />
        <NeonStat label="LOW CARBON, OF THE GENERATORS" value={`${spread.low} OF ${spread.gen}`} color={NEON[4]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 14 }}>
        <NeonCard color={NEON[1]} title="THE GAP IS ALREADY PUBLISHED">
          <p style={{ ...reading, fontSize: 13.6, lineHeight: 1.62, margin: 0 }}>
            Coal at {PIECES.coal.gco2} against wind at {PIECES.wind.gco2} grams per kilowatt hour is not a balance
            decision somebody took to make the game winnable. Both are IPCC AR5 Annex III lifecycle medians, published
            years before this page existed. The good ending is available here because the literature says it is
            available, which is a different thing from a designer deciding it should be.
          </p>
        </NeonCard>
        <NeonCard color={NEON[5]} title="SAME BOARD, SAME DEMAND MET">
          <p style={{ ...reading, fontSize: 13.6, lineHeight: 1.62, margin: 0 }}>
            The two concept grids at the top of this page cover the same load. One runs at
            {' '}{Math.round(outcomes.fossil.intensity)} grams a kilowatt hour and the other at
            {' '}{Math.round(outcomes.mixed.intensity)}: the same demand met, about {outcomes.cleaner} times cleaner. Push each
            through a century of the project's model and the fossil board comes back near {outcomes.warmer} times the warming
            of the mixed one. Nothing changed but what was placed on the tiles, and that is the whole argument behind the
            banner: arithmetic, not encouragement.
          </p>
        </NeonCard>
        <NeonCard color={NEON[8]} title="LOW CARBON IS NOT NO CARBON">
          <p style={{ ...reading, fontSize: 13.6, lineHeight: 1.62, margin: 0 }}>
            Solar is {PIECES.solar.gco2} on these cards, hydro {PIECES.hydro.gco2}, nuclear {PIECES.nuclear.gco2}. None
            of them is zero, because building a thing costs carbon before it saves any. A happy climate is not the board
            with nothing on it. It is the board with a defensible number underneath it, and a game that drew renewables
            at zero would be teaching something false in the shape of good news.
          </p>
        </NeonCard>
        <NeonCard color={NEON[0]} title="THE LOAD IS NOT OPTIONAL">
          <p style={{ ...reading, fontSize: 13.6, lineHeight: 1.62, margin: 0 }}>
            The demand piece asks for {Math.abs(PIECES.city.mw).toLocaleString()} MW and does not negotiate. That is what
            stops a cheerful reading collapsing into an empty board: the good ending has to light the city tonight, with
            what is standing on the tiles. Every low number in this section is worth something only while the load above
            it is still covered.
          </p>
        </NeonCard>
        <NeonCard color={NEON[3]} title="EARLY IS WHERE THE LEVERAGE IS">
          <p style={{ ...reading, fontSize: 13.6, lineHeight: 1.62, margin: 0 }}>
            Step 04 of the loop above is the bad news about thermal inertia: what you build now arrives decades later, so
            a late correction barely moves 2100. The same slowness is the good news at turn one. Emissions not made are
            not committed, and what is avoided early stays avoided. That is a statement about the timing of decisions,
            not a claim that anything gets undone - the ocean does not give the heat back because you asked.
          </p>
        </NeonCard>
        <NeonCard color={NEON[7]} title="WHAT WOULD MAKE THIS SECTION WRONG">
          <p style={{ ...reading, fontSize: 13.6, lineHeight: 1.62, margin: 0 }}>
            The model behind the cheerful number is the two-box emulator, and the models page prints its own gaps: no
            carbon cycle feedback, no tipping points, no ice sheet dynamics, no AMOC. A world with those in it can
            answer differently. On this board specifically, FOREST carries {PIECES.forest.gco2} and no capacity, and the
            century arithmetic above only reads pieces that generate - so the one removal piece is drawn and does not
            yet count. A happy ending computed here is a happy ending in a simple model, and that is all it is.
          </p>
        </NeonCard>
      </div>
      <DataLine style={{ marginTop: 10, opacity: 0.9 }}>
        EVERY FIGURE IN THIS SECTION IS READ FROM THE SAME PIECE TABLE THE CARDS ABOVE USE {SEP} NONE OF IT IS TYPED HERE
      </DataLine>

      <SectionRule label={`WHAT IS BUILT ${SEP} AND WHAT IT IS FOR`} color={NEON[7]} art={<Art id="budget" color={NEON[7]} size={46} />} />
      <div className="tcp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(240px, 1fr)', gap: 26, marginTop: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <NeonCard color={NEON[4]} title="DONE">
            <ul style={{ ...reading, fontSize: 13.5, lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
              <li>The isometric art set: eight pieces, five ground types, the projection and the draw-order sort</li>
              <li>The physics it will run on, already built and scored, in <span style={{ ...mono }}>src/models.js</span></li>
              <li>The carbon table, from IPCC AR5 Annex III, shared by the art and the simulation</li>
              <li>A Godot 4 build in progress, drawing the same green-to-amber world as the art on this page: cel-shaded, bright, and legible at a glance</li>
            </ul>
          </NeonCard>
          <NeonCard color={NEON[7]} title="WHAT IT IS FOR">
            <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.66, margin: 0 }}>
              Climate City is in development. The idea is a city that has to be lit tonight and still be worth living in at
              2100, on a board where every piece carries the published number it costs the air.
            </p>
            <p style={{ ...reading, fontSize: 13.5, lineHeight: 1.66, margin: '9px 0 0' }}>
              There is no persuasion in the design and there is not meant to be. A player would be asked to meet a load,
              not to hold an opinion, and then to watch a temperature line answer at the ocean's speed instead of theirs.
              That distance between a decision and its consequence is the subject of this entire site, which is why the
              game is being built here rather than beside it.
            </p>
          </NeonCard>
        </div>
        <PageEmblem page="game" width={300} />
      </div>

      <SectionRule label={`WHAT SPEAKS ${SEP} AND HOW IT IS DRAWN`} color={NEON[6]} art={<Art id="telescope" color={NEON[6]} size={46} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, marginTop: 14 }}>
        <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, margin: 0 }}>
          The sky speaks first and slowly. What is burned on a Tuesday morning leaves the ground, crosses an ocean and
          comes back years later as a season nobody recognises, and the wind carries the whole sentence without once
          raising its voice. A game about a grid is a game about learning to hear that early enough for the hearing to
          matter.
        </p>
        <p style={{ ...reading, fontSize: 15, lineHeight: 1.68, margin: 0 }}>
          So it is drawn the way the rest of this site is drawn: flat vector, hard ink outlines, the neon-on-paper
          palette, every scene built as geometry in a file with no assets. Nothing is photographed and nothing is
          rendered. The concept boards above come out of the same code that draws the pieces and their numbers.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
        <OutlineButton href="#/models" color={NEON[0]}>THE MODEL THIS RUNS ON</OutlineButton>
        <OutlineButton href="#/methods" color={NEON[6]}>HOW THE NUMBERS ARE MADE</OutlineButton>
      </div>
      <div style={{ height: 70 }} />
    </main>
  );
}
