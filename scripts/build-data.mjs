// One-time/repeatable data build: fetches the 3 openfootball worldcup.json 2026
// sources, joins them, and emits a single normalized data/players.json that the
// static frontend fetches at runtime. Re-run with `node scripts/build-data.mjs`
// whenever the upstream source data changes.
//
// Crests (team/club logos) are NOT fetched automatically. Run this script,
// then check data/crest-manifest.json (and the printed summary) for the list
// of expected filenames; Re-run this script and it
// will pick up whatever files exist under src/data/crests/{teams,clubs}/.

import { writeFile, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/";
const AGE_REFERENCE_DATE = "2026-06-11"; // World Cup 2026 opening date, fixed for determinism
const CLUB_SUFFIX_DENYLIST = [
  "fc",
  "cf",
  "sc",
  "sk",
  "ac",
  "afc",
  "cfc",
  "fk",
  "ssc",
  "ssd",
  "us",
  "usd",
  "as",
  "ca",
  "cd",
  "ud",
  "rc",
  "rcd",
  "club",
  "national team",
];

function slugify(name) {
  let slug = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  for (const suffix of CLUB_SUFFIX_DENYLIST) {
    slug = slug.replace(new RegExp(`(^|\\s)${suffix}(\\s|$)`, "g"), " ");
  }

  return slug.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function fileExists(absPath) {
  try {
    await access(absPath);
    return true;
  } catch {
    return false;
  }
}

// club.country uses a mix of FIFA/IOC-style 3-letter codes. Only 43 of the 71
// distinct codes observed belong to the 48 WC nations (covered by teams.json);
// the rest need their own lookup since they're countries whose players' clubs
// are based there but who aren't at the tournament themselves.
const COUNTRY_CODES = {
  ALG: { name: "Algeria", flag: "🇩🇿" },
  ARG: { name: "Argentina", flag: "🇦🇷" },
  ARM: { name: "Armenia", flag: "🇦🇲" },
  AUS: { name: "Australia", flag: "🇦🇺" },
  AUT: { name: "Austria", flag: "🇦🇹" },
  AZE: { name: "Azerbaijan", flag: "🇦🇿" },
  BEL: { name: "Belgium", flag: "🇧🇪" },
  BIH: { name: "Bosnia & Herzegovina", flag: "🇧🇦" },
  BRA: { name: "Brazil", flag: "🇧🇷" },
  BUL: { name: "Bulgaria", flag: "🇧🇬" },
  CAN: { name: "Canada", flag: "🇨🇦" },
  CHI: { name: "Chile", flag: "🇨🇱" },
  CHN: { name: "China", flag: "🇨🇳" },
  COL: { name: "Colombia", flag: "🇨🇴" },
  CRC: { name: "Costa Rica", flag: "🇨🇷" },
  CRO: { name: "Croatia", flag: "🇭🇷" },
  CYP: { name: "Cyprus", flag: "🇨🇾" },
  CZE: { name: "Czechia", flag: "🇨🇿" },
  DEN: { name: "Denmark", flag: "🇩🇰" },
  ECU: { name: "Ecuador", flag: "🇪🇨" },
  EGY: { name: "Egypt", flag: "🇪🇬" },
  ENG: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  ESP: { name: "Spain", flag: "🇪🇸" },
  FIN: { name: "Finland", flag: "🇫🇮" },
  FRA: { name: "France", flag: "🇫🇷" },
  GER: { name: "Germany", flag: "🇩🇪" },
  GHA: { name: "Ghana", flag: "🇬🇭" },
  GRE: { name: "Greece", flag: "🇬🇷" },
  HAI: { name: "Haiti", flag: "🇭🇹" },
  HON: { name: "Honduras", flag: "🇭🇳" },
  HUN: { name: "Hungary", flag: "🇭🇺" },
  IDN: { name: "Indonesia", flag: "🇮🇩" },
  IRL: { name: "Republic of Ireland", flag: "🇮🇪" },
  IRN: { name: "Iran", flag: "🇮🇷" },
  IRQ: { name: "Iraq", flag: "🇮🇶" },
  ISR: { name: "Israel", flag: "🇮🇱" },
  ITA: { name: "Italy", flag: "🇮🇹" },
  JOR: { name: "Jordan", flag: "🇯🇴" },
  JPN: { name: "Japan", flag: "🇯🇵" },
  KAZ: { name: "Kazakhstan", flag: "🇰🇿" },
  KOR: { name: "Korea Republic", flag: "🇰🇷" },
  KSA: { name: "Saudi Arabia", flag: "🇸🇦" },
  MAR: { name: "Morocco", flag: "🇲🇦" },
  MAS: { name: "Malaysia", flag: "🇲🇾" },
  MEX: { name: "Mexico", flag: "🇲🇽" },
  NED: { name: "Netherlands", flag: "🇳🇱" },
  NOR: { name: "Norway", flag: "🇳🇴" },
  NZL: { name: "New Zealand", flag: "🇳🇿" },
  PAN: { name: "Panama", flag: "🇵🇦" },
  PAR: { name: "Paraguay", flag: "🇵🇾" },
  POL: { name: "Poland", flag: "🇵🇱" },
  POR: { name: "Portugal", flag: "🇵🇹" },
  QAT: { name: "Qatar", flag: "🇶🇦" },
  ROU: { name: "Romania", flag: "🇷🇴" },
  RSA: { name: "South Africa", flag: "🇿🇦" },
  RUS: { name: "Russia", flag: "🇷🇺" },
  SCO: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  SRB: { name: "Serbia", flag: "🇷🇸" },
  SUI: { name: "Switzerland", flag: "🇨🇭" },
  SVK: { name: "Slovakia", flag: "🇸🇰" },
  SVN: { name: "Slovenia", flag: "🇸🇮" },
  SWE: { name: "Sweden", flag: "🇸🇪" },
  THA: { name: "Thailand", flag: "🇹🇭" },
  TUN: { name: "Tunisia", flag: "🇹🇳" },
  TUR: { name: "Türkiye", flag: "🇹🇷" },
  UAE: { name: "United Arab Emirates", flag: "🇦🇪" },
  URU: { name: "Uruguay", flag: "🇺🇾" },
  USA: { name: "United States", flag: "🇺🇸" },
  UZB: { name: "Uzbekistan", flag: "🇺🇿" },
  VEN: { name: "Venezuela", flag: "🇻🇪" },
  WAL: { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
};

function ageAt(dateOfBirth, referenceDate) {
  const dob = new Date(dateOfBirth);
  const ref = new Date(referenceDate);
  let age = ref.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    ref.getMonth() > dob.getMonth() ||
    (ref.getMonth() === dob.getMonth() && ref.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

async function fetchJson(file) {
  const res = await fetch(BASE + file, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Failed to fetch ${file}: ${res.status}`);
  return res.json();
}

async function main() {
  const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
  const crestsRoot = path.join(rootDir, "src", "data", "crests");
  await mkdir(path.join(crestsRoot, "teams"), { recursive: true });
  await mkdir(path.join(crestsRoot, "clubs"), { recursive: true });

  const [squads, teamsRaw, groupsRaw] = await Promise.all([
    fetchJson("worldcup.squads.json"),
    fetchJson("worldcup.teams.json"),
    fetchJson("worldcup.groups.json"),
  ]);

  const teamsByName = new Map(teamsRaw.map((t) => [t.name, t]));
  const squadsByFifaCode = new Map(squads.map((s) => [s.fifa_code, s]));

  const groups = [];
  const teams = [];
  const players = [];
  const usedCountryCodes = new Set();
  const clubCountryByName = new Map();

  for (const group of groupsRaw.groups) {
    const teamFifaCodes = [];

    for (const teamName of group.teams) {
      const teamMeta = teamsByName.get(teamName);
      if (!teamMeta) {
        throw new Error(`No teams.json entry for group team "${teamName}"`);
      }
      const squad = squadsByFifaCode.get(teamMeta.fifa_code);
      if (!squad) {
        throw new Error(
          `No squads.json entry for fifa_code "${teamMeta.fifa_code}" (team "${teamName}")`
        );
      }

      teamFifaCodes.push(teamMeta.fifa_code);

      teams.push({
        fifaCode: teamMeta.fifa_code,
        name: teamMeta.name_normalised ?? teamMeta.name,
        continent: teamMeta.continent,
        confed: teamMeta.confed,
        flag: teamMeta.flag_icon,
        group: group.name,
        playerCount: squad.players.length,
      });

      for (const p of squad.players) {
        usedCountryCodes.add(p.club.country);
        const countryInfo = COUNTRY_CODES[p.club.country];
        if (!countryInfo) {
          throw new Error(
            `Unknown club country code "${p.club.country}" for player "${p.name}", add it to COUNTRY_CODES`
          );
        }

        clubCountryByName.set(p.club.name, countryInfo.name);

        players.push({
          id: `${teamMeta.fifa_code}-${p.number}`,
          name: p.name,
          number: p.number,
          pos: p.pos,
          dateOfBirth: p.date_of_birth,
          age: ageAt(p.date_of_birth, AGE_REFERENCE_DATE),
          teamFifaCode: teamMeta.fifa_code,
          teamName: teamMeta.name_normalised ?? teamMeta.name,
          club: {
            name: p.club.name,
            countryCode: p.club.country,
            countryName: countryInfo.name,
            countryFlag: countryInfo.flag,
          },
        });
      }
    }

    groups.push({ name: group.name, teamFifaCodes });
  }

  const countryCodes = {};
  for (const code of usedCountryCodes) {
    countryCodes[code] = COUNTRY_CODES[code];
  }

  // Crests: manual sourcing only (see header comment). A team/club gets a
  // crestUrl if and only if a file already exists at its expected path under
  // src/data/crests/. Anything missing falls back to the flag emoji (teams)
  // or an initials chip (clubs) in the UI - no network calls here at all.
  const uniqueClubNames = [...clubCountryByName.keys()];
  const manifest = [];

  for (const team of teams) {
    const slug = slugify(team.name);
    const relPath = `data/crests/teams/${slug}.svg`;
    const absPath = path.join(crestsRoot, "teams", `${slug}.svg`);
    const exists = await fileExists(absPath);
    team.crestUrl = exists ? relPath : null;
    manifest.push({
      type: "team",
      name: team.name,
      countryName: team.name,
      targetPath: relPath,
      found: exists,
    });
  }

  const crestUrlByClubName = new Map();
  for (const clubName of uniqueClubNames) {
    const countryName = clubCountryByName.get(clubName);
    const countrySlug = slugify(countryName);
    const clubSlug = slugify(clubName);
    const fileSlug = `${countrySlug}-${clubSlug}`;
    const relPath = `data/crests/clubs/${fileSlug}.svg`;
    const absPath = path.join(crestsRoot, "clubs", `${fileSlug}.svg`);
    const exists = await fileExists(absPath);
    crestUrlByClubName.set(clubName, exists ? relPath : null);
    manifest.push({
      type: "club",
      name: clubName,
      countryName,
      targetPath: relPath,
      found: exists,
    });
  }

  for (const player of players) {
    player.club.crestUrl = crestUrlByClubName.get(player.club.name) ?? null;
  }

  const manifestPath = path.join(rootDir, "data", "crest-manifest.json");
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  const output = {
    tournament: { name: "World Cup 2026", ageReferenceDate: AGE_REFERENCE_DATE },
    groups,
    teams,
    players,
    countryCodes,
  };

  const outPath = path.join(rootDir, "src", "data", "players.json");
  await writeFile(outPath, JSON.stringify(output, null, 2));

  const teamsFound = manifest.filter((m) => m.type === "team" && m.found).length;
  const clubsFound = manifest.filter((m) => m.type === "club" && m.found).length;
  const teamsTotal = manifest.filter((m) => m.type === "team").length;
  const clubsTotal = manifest.filter((m) => m.type === "club").length;

  console.log(`Wrote ${outPath}`);
  console.log(`groups: ${groups.length}, teams: ${teams.length}, players: ${players.length}`);
  console.log(`crests on disk: ${teamsFound}/${teamsTotal} teams, ${clubsFound}/${clubsTotal} clubs`);
  console.log(`Wrote full manifest (incl. source hints) to ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
