import { getData, getClub, getAllClubNames } from "../state.js";

function matchesPlayer(player, query) {
  const haystack = [player.name, player.teamName, player.club.name, player.club.countryName]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function mountSearchBar(root) {
  root.innerHTML = `
    <div class="search-bar">
      <input
        class="search-bar__input"
        type="search"
        placeholder="Search players, clubs, teams…"
        data-search-input
        autocomplete="off"
      />
      <ul class="search-bar__results" data-search-results hidden></ul>
    </div>
  `;

  const input = root.querySelector("[data-search-input]");
  const results = root.querySelector("[data-search-results]");

  function close() {
    results.hidden = true;
    results.innerHTML = "";
  }

  function renderResultGroup(label, items) {
    const heading = document.createElement("li");
    heading.className = "search-bar__group-label";
    heading.textContent = label;
    results.appendChild(heading);

    for (const item of items) results.appendChild(item);
  }

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      close();
      return;
    }

    const data = getData();
    const clubMatches = getAllClubNames()
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 6)
      .map((name) => getClub(name));
    const playerMatches = data.players.filter((p) => matchesPlayer(p, query)).slice(0, 12);

    if (clubMatches.length === 0 && playerMatches.length === 0) {
      results.hidden = false;
      results.innerHTML = `<li class="search-bar__empty">No matches found</li>`;
      return;
    }

    results.hidden = false;
    results.innerHTML = "";

    if (clubMatches.length > 0) {
      renderResultGroup(
        "Clubs",
        clubMatches.map((club) => {
          const item = document.createElement("li");
          item.className = "search-bar__result";
          const link = document.createElement("a");
          link.href = `#/club/${encodeURIComponent(club.name)}`;
          link.innerHTML = `
            <span class="search-bar__result-name">${club.name}</span>
            <span class="search-bar__result-meta">${club.countryName} · ${club.players.length} at the World Cup</span>
          `;
          link.addEventListener("click", () => {
            input.value = "";
            close();
          });
          item.appendChild(link);
          return item;
        })
      );
    }

    if (playerMatches.length > 0) {
      renderResultGroup(
        "Players",
        playerMatches.map((player) => {
          const item = document.createElement("li");
          item.className = "search-bar__result";
          const link = document.createElement("a");
          link.href = `#/team/${player.teamFifaCode}`;
          link.innerHTML = `
            <span class="search-bar__result-name">${player.name}</span>
            <span class="search-bar__result-meta">${player.teamName} · ${player.club.name}</span>
          `;
          link.addEventListener("click", () => {
            input.value = "";
            close();
          });
          item.appendChild(link);
          return item;
        })
      );
    }
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) close();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      close();
      input.blur();
    }
  });
}
