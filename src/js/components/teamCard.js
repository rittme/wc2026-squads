export function renderTeamCard(team) {
  const card = document.createElement("a");
  card.className = "team-card";
  card.href = `#/team/${team.fifaCode}`;

  const crest = team.crestUrl
    ? `<img class="team-card__crest" src="./${team.crestUrl}" alt="" aria-hidden="true" onerror="this.outerHTML='<span class=&quot;team-card__flag&quot; aria-hidden=&quot;true&quot;>${team.flag}</span>'" />`
    : `<span class="team-card__flag" aria-hidden="true">${team.flag}</span>`;

  card.innerHTML = `
    ${crest}
    <span class="team-card__body">
      <span class="team-card__name">${team.name}</span>
      <span class="team-card__meta">${team.fifaCode} · ${team.confed}</span>
    </span>
  `;

  return card;
}
