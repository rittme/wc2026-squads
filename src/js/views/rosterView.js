import { getTeam, getTeamPlayers } from "../state.js";
import { renderSquadTable } from "../components/squadTable.js";

export function renderRosterView(root, fifaCode) {
  const team = getTeam(fifaCode);
  const players = getTeamPlayers(fifaCode);

  if (!team) {
    root.innerHTML = `<p class="not-found">Team not found.</p>`;
    return;
  }

  const view = document.createElement("div");
  view.className = "roster-view";

  const crest = team.crestUrl
    ? `<img class="roster-view__crest" src="./${team.crestUrl}" alt="" aria-hidden="true" onerror="this.outerHTML='<span class=&quot;roster-view__flag&quot; aria-hidden=&quot;true&quot;>${team.flag}</span>'" />`
    : `<span class="roster-view__flag" aria-hidden="true">${team.flag}</span>`;

  view.innerHTML = `
    <a class="roster-view__back" href="#/teams">&larr; All teams</a>
    <header class="roster-view__header">
      ${crest}
      <div>
        <h1 class="roster-view__name">${team.name}</h1>
        <p class="roster-view__meta">${team.group} · ${team.confed}</p>
      </div>
    </header>
  `;

  view.appendChild(
    renderSquadTable(players, {
      counterpartLabel: "Club",
      getCounterpart: (player) => ({
        name: player.club.name,
        crestUrl: player.club.crestUrl,
        countryName: player.club.countryName,
        flag: player.club.countryFlag,
        href: `#/club/${encodeURIComponent(player.club.name)}`,
      }),
    })
  );

  root.replaceChildren(view);
}
