import {
  POSITION_ORDER,
  formatMarketValue,
  formatMarketValueTooltip,
  compareByNumber,
  compareByName,
  compareByAge,
  compareByValue,
} from "../utils/format.js";

const POSITION_CHIP_CLASS = {
  GK: "position-chip--gk",
  DF: "position-chip--df",
  MF: "position-chip--mf",
  FW: "position-chip--fw",
};

const COMPARATORS = {
  number: compareByNumber,
  name: compareByName,
  age: compareByAge,
  value: compareByValue,
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
  const columns = [
    { key: "number", label: "#", className: "squad-table__col-number", sortable: true },
    { key: "name", label: "Player", className: "squad-table__col-player", sortable: true },
    { key: "pos", label: "Pos", className: "squad-table__col-pos", sortable: false },
    { key: "age", label: "Age", className: "squad-table__col-age", sortable: true },
    { key: "value", label: "Value", className: "squad-table__col-value", sortable: true },
    { key: "counterpart", label: counterpartLabel, className: "squad-table__col-counterpart", sortable: true },
  ];

  let sortKey = "role";
  let sortDir = "asc";

  const wrapper = document.createElement("div");
  wrapper.className = "squad-table-wrapper";

  wrapper.innerHTML = `
    <div class="squad-table-controls">
      <select class="squad-table__sort-select" aria-label="Sort by">
        <option value="role">Role (default)</option>
        ${columns
          .filter((col) => col.sortable)
          .map((col) => `<option value="${col.key}">${col.label}</option>`)
          .join("")}
      </select>
      <button class="squad-table__sort-dir" type="button" aria-label="Toggle sort direction">
        <span class="squad-table__sort-icon" aria-hidden="true">▲</span>
      </button>
    </div>
    <table class="squad-table">
      <thead>
        <tr></tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const headRow = wrapper.querySelector("thead tr");
  const tbody = wrapper.querySelector("tbody");
  const select = wrapper.querySelector(".squad-table__sort-select");
  const dirButton = wrapper.querySelector(".squad-table__sort-dir");
  const dirIcon = dirButton.querySelector(".squad-table__sort-icon");

  function getSortedPlayers() {
    if (sortKey === "role") return sortByPosition(players);

    const comparator =
      sortKey === "counterpart"
        ? (a, b) => getCounterpart(a).name.localeCompare(getCounterpart(b).name)
        : COMPARATORS[sortKey];

    const sorted = [...players].sort(comparator);
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }

  function renderHead() {
    headRow.innerHTML = columns
      .map((col) => {
        if (!col.sortable) {
          return `<th class="${col.className}">${col.label}</th>`;
        }
        const isActive = sortKey === col.key;
        const classes = [col.className, "squad-table__th--sortable", isActive ? "squad-table__th--active" : ""]
          .filter(Boolean)
          .join(" ");
        const icon = isActive
          ? `<span class="squad-table__sort-icon" aria-hidden="true">${sortDir === "asc" ? "▲" : "▼"}</span>`
          : "";
        return `<th class="${classes}" data-sort-key="${col.key}">${col.label}${icon}</th>`;
      })
      .join("");

    for (const th of headRow.querySelectorAll(".squad-table__th--sortable")) {
      th.addEventListener("click", () => setSort(th.dataset.sortKey));
    }
  }

  function renderBody() {
    tbody.innerHTML = "";

    for (const player of getSortedPlayers()) {
      const counterpart = getCounterpart(player);
      const row = document.createElement("tr");
      row.className = "squad-table__row";

      const valueText = formatMarketValue(player.marketValue);
      const valueTooltip = formatMarketValueTooltip(player.marketValue);
      const valueMarkup = valueTooltip
        ? `<span class="squad-table__value-tooltip" tabindex="0">${valueText}<span class="squad-table__value-bubble" role="tooltip">${valueTooltip}</span></span>`
        : valueText;

      row.innerHTML = `
        <td class="squad-table__col-number">${player.number}</td>
        <td class="squad-table__col-player">${player.name}</td>
        <td class="squad-table__col-pos">
          <span class="position-chip ${POSITION_CHIP_CLASS[player.pos]}">${player.pos}</span>
        </td>
        <td class="squad-table__col-age">${player.age}</td>
        <td class="squad-table__col-value">${valueMarkup}</td>
        ${renderCounterpartCell(counterpart)}
      `;

      tbody.appendChild(row);
    }
  }

  function syncControls() {
    select.value = sortKey;
    dirButton.disabled = sortKey === "role";
    dirIcon.textContent = sortDir === "asc" ? "▲" : "▼";
  }

  function setSort(key) {
    if (key === sortKey) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDir = "asc";
    }
    syncControls();
    renderHead();
    renderBody();
  }

  select.addEventListener("change", () => setSort(select.value));
  dirButton.addEventListener("click", () => {
    if (sortKey === "role") return;
    sortDir = sortDir === "asc" ? "desc" : "asc";
    syncControls();
    renderHead();
    renderBody();
  });

  syncControls();
  renderHead();
  renderBody();

  return wrapper;
}
