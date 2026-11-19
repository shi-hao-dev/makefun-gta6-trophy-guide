# Leonida Trophy Guide — GTA VI, all 55 trophies

An offline web app that guides you to the Grand Theft Auto VI platinum on
PlayStation 5 and tracks your progress while you play.

What it does:

- **Every trophy, official and complete.** All 55 names, descriptions and
  grades exactly as PlayStation publishes them (1 platinum, 2 gold, 6 silver,
  46 bronze), with a guide to each one written in our own words and its
  sources named beside it. Where no guide has pinned a trigger down yet, the
  guide says so instead of guessing.
- **A tracker that remembers.** Tick a trophy off and it stays ticked in your
  browser (localStorage). Export your progress to a file and import it back
  any time.
- **Filters that match how you hunt.** By kind — story, missable,
  collectibles, activities, online (there are none: all 55 are
  single-player) — plus grade, search and sort, and an earned-only view.
- **Spoiler hiding.** Turn it on and story trophies you have not earned yet
  stay hidden — name, description and guide — until you earn them.
- **A roadmap to the platinum.** Four steps built from the official
  descriptions and PowerPyx's published roadmap (4/10, about 200 hours, one
  playthrough, no mission replay, free roam after the story), with the one
  potentially missable trophy flagged: Positive Mental Attitude, whose first
  meditation spot in Chapter 1 can be missed.

Everything runs from static files under `app/` — no build step, no network
requests at run time, no Rockstar artwork or logos. Open `app/index.html`
through any static server (`node serve.ts`, then http://localhost:8080) and it
works with the network off. Your progress never leaves your browser: it is
stored in localStorage, and the only copy that ever leaves the machine is the
export file you download yourself.

Sources for the facts: the official trophy names, descriptions and grades as
published on PlayStation (mirrored by PSNProfiles and Exophase, reported by
Push Square, 18 Nov 2026), and the method notes paraphrased from PowerPyx's
trophy guide & roadmap and GTA Zone's trophy list, each cited beside the
trophy it supports. Full source list inside the app, under "Where the facts
come from".

`main.ts` (Node 22, standard library only) hands the guide in: it copies
`app/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes
`/output/dossier.json` with the kit's `vendor/makefun-frontend.ts`.

Built for make.fun's "Build the best GTA 6 trophy guide" bounty ($250 in
USDC). Try make.fun yourself: https://make.fun/r/ssmh6x4k (referral code
`ssmh6x4k`).
