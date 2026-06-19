import { setData } from "./state.js";
import { registerRoute, startRouter } from "./router.js";
import { renderTeamsView } from "./views/teamsView.js";
import { renderRosterView } from "./views/rosterView.js";
import { renderClubView } from "./views/clubView.js";
import { mountSearchBar } from "./components/searchBar.js";

async function main() {
  const res = await fetch("./data/players.json");
  const data = await res.json();
  setData(data);

  mountSearchBar(document.querySelector("[data-search-root]"));

  const viewRoot = document.querySelector("[data-view-root]");
  registerRoute("/teams", () => renderTeamsView(viewRoot));
  registerRoute("/team/:fifaCode", ({ fifaCode }) => renderRosterView(viewRoot, fifaCode));
  registerRoute("/club/:clubSlug", ({ clubSlug }) =>
    renderClubView(viewRoot, decodeURIComponent(clubSlug))
  );

  startRouter();
}

main();
