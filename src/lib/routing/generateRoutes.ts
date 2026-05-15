import type { Edge } from "@/lib/routing/types";

export function generateRoutes(source: string, target: string, edges: Edge[], maxLegs = 3): Edge[][] {
  const outgoing = new Map<string, Edge[]>();

  edges.forEach((edge) => {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge);
    outgoing.set(edge.from, list);
  });

  const routes: Edge[][] = [];

  function walk(current: string, visited: Set<string>, route: Edge[]) {
    if (route.length >= maxLegs) {
      return;
    }

    const candidates = outgoing.get(current) ?? [];

    candidates.forEach((edge) => {
      if (edge.to !== target && visited.has(edge.to)) {
        return;
      }

      const nextRoute = [...route, edge];

      if (edge.to === target) {
        routes.push(nextRoute);
        return;
      }

      walk(edge.to, new Set([...visited, edge.to]), nextRoute);
    });
  }

  walk(source, new Set([source]), []);

  return routes;
}
