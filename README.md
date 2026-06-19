# WC26 Players Dashboard

Browse every 2026 World Cup squad: national team, roster by position, and each
player's current club (with the club's country).

## Data

`npm run build:data` fetches and joins the three [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
2026 sources (squads, teams, groups) into `src/data/players.json`. Re-run it if
the upstream source data changes.

## Crests (team/club logos)

Crests are sourced manually, not fetched automatically. After running
`npm run build:data`, open `data/crest-manifest.json` for the full list of
expected crests: each entry has a `targetPath` (where to save the SVG). Save
each SVG at its exact `targetPath` under `src/data/crests/teams/` or
`src/data/crests/clubs/`, then re-run `npm run build:data` — it picks up
whatever files exist on disk and re-checks the rest. Anything still missing
falls back to a flag emoji (teams) or an initials chip (clubs) in the UI, so
the app works correctly with partial crest coverage.

## Run locally

```
npm run serve
```

Then open the printed local URL. The app is a static site (no build step):
`src/` can be served by any static file host.
