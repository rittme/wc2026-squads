export function renderPlayerRow(player) {
  const row = document.createElement("li");
  row.className = "player-row";

  row.innerHTML = `
    <span class="player-row__number">${player.number}</span>
    <span class="player-row__name">${player.name}</span>
    <span class="player-row__age">${player.age}</span>
    <span class="player-row__club">
      <span class="player-row__club-name">${player.club.name}</span>
      <span class="player-row__club-country">
        <span aria-hidden="true">${player.club.countryFlag}</span>
        ${player.club.countryName}
      </span>
    </span>
  `;

  return row;
}
