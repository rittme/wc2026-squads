const routes = [];

export function registerRoute(pattern, handler) {
  routes.push({ pattern, handler });
}

function parseHash() {
  const hash = window.location.hash.slice(1) || "/teams";
  return hash.split("/").filter(Boolean);
}

function matchRoute(segments) {
  for (const route of routes) {
    const patternSegments = route.pattern.split("/").filter(Boolean);
    if (patternSegments.length !== segments.length) continue;

    const params = {};
    const isMatch = patternSegments.every((part, i) => {
      if (part.startsWith(":")) {
        params[part.slice(1)] = segments[i];
        return true;
      }
      return part === segments[i];
    });

    if (isMatch) return { handler: route.handler, params };
  }
  return null;
}

function handleRouteChange() {
  const segments = parseHash();
  const match = matchRoute(segments);
  if (match) {
    match.handler(match.params);
  } else {
    window.location.hash = "#/teams";
  }
}

export function startRouter() {
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange();
}
