export const POSITION_LABELS = {
  GK: "Goalkeepers",
  DF: "Defenders",
  MF: "Midfielders",
  FW: "Forwards",
};

export const POSITION_ORDER = ["GK", "DF", "MF", "FW"];

export function groupPlayersByPosition(players) {
  const byPos = new Map(POSITION_ORDER.map((pos) => [pos, []]));
  for (const player of players) {
    byPos.get(player.pos)?.push(player);
  }
  return byPos;
}
