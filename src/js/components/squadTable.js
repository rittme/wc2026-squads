import { POSITION_ORDER } from "../utils/format.js";

const POSITION_CHIP_CLASS = {
  GK: "position-chip--gk",
  DF: "position-chip--df",
  MF: "position-chip--mf",
  FW: "position-chip--fw",
};

function sortByPosition(players) {
  const order = new Map(POSITION_ORDER.map((pos, i) => [pos, i]));
  return [...players].sort((a, b) => {
    const posDiff = order.get(a.pos) - order.get(b.pos);
    if (posDiff !== 0) return posDiff;
    return a.number - b.number;
  });
}

function renderCounterpartCell(counterpart) {
  const flagOrCrest = counterpart.crestUrl
    ? `<img class="squad-table__crest" src="./${counterpart.crestUrl}" alt="" aria-hidden="true" onerror="this.classList.add('squad-table__crest--broken')" />`
    : `<span aria-hidden="true">${counterpart.flag ?? ""}</span>`;

  const nameMarkup = counterpart.href
    ? `<a class="squad-table__counterpart-link" href="${counterpart.href}">${counterpart.name}</a>`
    : counterpart.name;

  return `
    <td class="squad-table__counterpart">
      <span class="squad-table__counterpart-name">${flagOrCrest} ${nameMarkup}</span>
      <span class="squad-table__counterpart-country">${counterpart.countryName ?? ""}</span>
    </td>
  `;
}

export function renderSquadTable(players, { counterpartLabel, getCounterpart }) {
  const wrapper = document.createElement("table");
  wrapper.className = "squad-table";

  wrapper.innerHTML = `
    <thead>
      <tr>
        <th class="squad-table__col-number">#</th>
        <th class="squad-table__col-player">Player</th>
        <th class="squad-table__col-pos">Pos</th>
        <th class="squad-table__col-age">Age</th>
        <th class="squad-table__col-counterpart" colspan="1">${counterpartLabel}</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = wrapper.querySelector("tbody");

  for (const player of sortByPosition(players)) {
    const counterpart = getCounterpart(player);
    const row = document.createElement("tr");
    row.className = "squad-table__row";

    row.innerHTML = `
      <td class="squad-table__col-number">${player.number}</td>
      <td class="squad-table__col-player">${player.name}</td>
      <td class="squad-table__col-pos">
        <span class="position-chip ${POSITION_CHIP_CLASS[player.pos]}">${player.pos}</span>
      </td>
      <td class="squad-table__col-age">${player.age}</td>
      ${renderCounterpartCell(counterpart)}
    `;

    tbody.appendChild(row);
  }

  return wrapper;
}
