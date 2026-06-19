import { getData, getTeam } from "../state.js";
import { renderTeamCard } from "../components/teamCard.js";

export function renderTeamsView(root) {
  const data = getData();

  const view = document.createElement("div");
  view.className = "teams-view";

  for (const group of data.groups) {
    const section = document.createElement("section");
    section.className = "group-section";

    const heading = document.createElement("h2");
    heading.className = "group-section__title";
    heading.textContent = group.name;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "group-section__grid";
    for (const fifaCode of group.teamFifaCodes) {
      const team = getTeam(fifaCode);
      grid.appendChild(renderTeamCard(team));
    }
    section.appendChild(grid);

    view.appendChild(section);
  }

  root.replaceChildren(view);
}
