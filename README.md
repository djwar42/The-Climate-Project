# THE CLIMATE PROJECT

**Live: https://the-climate-project.vercel.app**

A site that reads the climate record and says where every number came from. Nine
pages, built from measured series with their periods, their producers, their
publication dates and their source links.

## RUN IT

```
npm install
npm run dev      # http://localhost:5188
npm run build    # -> dist/
```

Node 18+. No server, no database, no API keys. The data is static JSON in
`public/data`.

## DEPLOY IT

Vercel, connected to `djwar42/the-climate-project`. Vite is auto-detected, the
output is `dist`, and the router is hash-based, so there is nothing to configure
and no rewrite rules to write. A push to `main` deploys.

## THE PAGES

Hash routes, registered in `src/App.jsx`.

| route | page | what it is |
|---|---|---|
| `#/` | HOME | what is built, what is not, and the standing calculation |
| `#/state` | THE STATE OF IT | the current figures, each with its source |
| `#/projects` | THE PROJECTS | the big coordinated efforts |
| `#/deeptime` | DEEP TIME | every series on one numeric year axis, 800,000 years to last month |
| `#/models` | MODELS | a two-layer energy balance model, run and scored in the browser |
| `#/methods` | METHODS | the analysis catalogue, each with its caveat |
| `#/orgs` | THE ORGANISATIONS | who produces climate knowledge, by kind of body |
| `#/game` | THE GAME | Climate City. In development, and the page says so |
| `#/news` | NEWS | news rounds, with observed and inferred kept apart |

## THE DATA

```
public/data/
├─ series/                 15 observed series + index.json
├─ news/                   index.json + one <YYYY-MM-DD>.json per round
├─ state.json              the current figures
├─ orgs.json               the organisations
├─ projects.json           the projects
├─ standards.json          standards and definitions
└─ events_deeptime.json    dated events marked on the charts
```

Do not hand-edit these to make a page read better. A page that prints a number
from a file is making a claim on that file's authority.

## THE ONE LAW

**A number on screen is a claim.** Everything printed is either computed in front
of the reader or read from a file that names its producer. Model output says it is
model output. Where two institutions disagree, both are shown rather than
averaged. Where a method can mislead, the caveat sits at the same weight as the
result. A page with no data says so instead of showing a placeholder.

The corollary, and it is easy to break by accident: **never type a number that
looks measured.** Derive it, or make it true, or take it out.

## ADDING A PAGE

Copy the closest existing page - they are the style law, and a page you can read
beats a guide describing pages. `OrgsPage.jsx` is a good catalogue, `ModelsPage.jsx`
a good computed page. Then register it in `src/App.jsx` in four places: the import,
a `PAGE_INDEX` row, a `NAV_LABEL` entry, and a branch in the route chain. Miss the
`NAV_LABEL` and the nav renders a link with no words in it.

## LAYOUT

```
src/
├─ App.jsx          router, nav, home page
├─ theme.jsx        the shared components
├─ type.js          the type ladder
├─ base.css         root custom properties, body, links
├─ ui/              vendored design-system CSS
├─ art/             heroes, marks, emblems - geometry in files, no image assets
├─ haiku.jsx        the pull quotes and their three forms
└─ <Name>Page.jsx   one file per page
```
