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

function formatEur(millions) {
  return millions >= 1 ? `€${millions.toFixed(1)}m` : `€${Math.round(millions * 1000)}k`;
}

export function formatMarketValue(marketValue) {
  if (!marketValue) return "—";
  return formatEur(marketValue.current);
}

export function formatMarketValueTooltip(marketValue) {
  if (!marketValue || marketValue.peak <= marketValue.current) return null;
  return `Peak: ${formatEur(marketValue.peak)}`;
}
