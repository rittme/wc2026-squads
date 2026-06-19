const state = {
  data: null,
  teamsByFifaCode: new Map(),
  playersByTeam: new Map(),
  clubsByName: new Map(),
};

export function setData(data) {
  state.data = data;
  state.teamsByFifaCode = new Map(data.teams.map((t) => [t.fifaCode, t]));

  state.playersByTeam = new Map();
  state.clubsByName = new Map();

  for (const player of data.players) {
    const teamList = state.playersByTeam.get(player.teamFifaCode) ?? [];
    teamList.push(player);
    state.playersByTeam.set(player.teamFifaCode, teamList);

    const clubName = player.club.name;
    if (!state.clubsByName.has(clubName)) {
      state.clubsByName.set(clubName, {
        name: clubName,
        countryCode: player.club.countryCode,
        countryName: player.club.countryName,
        countryFlag: player.club.countryFlag,
        crestUrl: player.club.crestUrl,
        players: [],
      });
    }
    state.clubsByName.get(clubName).players.push(player);
  }
}

export function getData() {
  return state.data;
}

export function getTeam(fifaCode) {
  return state.teamsByFifaCode.get(fifaCode);
}

export function getTeamPlayers(fifaCode) {
  return state.playersByTeam.get(fifaCode) ?? [];
}

export function getClub(name) {
  return state.clubsByName.get(name);
}

export function getAllClubNames() {
  return [...state.clubsByName.keys()].sort();
}
