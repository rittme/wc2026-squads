import { getClub, getTeam } from "../state.js";
import { renderSquadTable } from "../components/squadTable.js";

export function renderClubView(root, clubName) {
  const club = getClub(clubName);

  if (!club) {
    root.innerHTML = `<p class="not-found">Club not found.</p>`;
    return;
  }

  const view = document.createElement("div");
  view.className = "roster-view";

  const crest = club.crestUrl
    ? `<img class="roster-view__crest" src="./${club.crestUrl}" alt="" aria-hidden="true" onerror="this.outerHTML='<span class=&quot;club-header__initials&quot; aria-hidden=&quot;true&quot;>${initials(club.name)}</span>'" />`
    : `<span class="club-header__initials" aria-hidden="true">${initials(club.name)}</span>`;

  const nationCount = new Set(club.players.map((p) => p.teamFifaCode)).size;

  view.innerHTML = `
    <a class="roster-view__back" href="#/teams">&larr; All teams</a>
    <header class="roster-view__header">
      ${crest}
      <div>
        <h1 class="roster-view__name">${club.name}</h1>
        <p class="roster-view__meta">
          <span aria-hidden="true">${club.countryFlag}</span> ${club.countryName}
        </p>
        <p class="club-header__stat-line">${club.players.length} players · ${nationCount} nations represented</p>
      </div>
    </header>
  `;

  view.appendChild(
    renderSquadTable(club.players, {
      counterpartLabel: "Nation",
      getCounterpart: (player) => {
        const team = getTeam(player.teamFifaCode);
        return {
          name: player.teamName,
          flag: team?.flag,
          crestUrl: team?.crestUrl,
          countryName: team?.group,
        };
      },
    })
  );

  root.replaceChildren(view);
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter((word) => /[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
