export const ROUTE_GROUPS = ['ascii', 'web2', 'newspaper', 'vaporwave'] as const;
export type RouteGroup = (typeof ROUTE_GROUPS)[number];

export function pickRandomVariant(): RouteGroup {
  return ROUTE_GROUPS[Math.floor(Math.random() * ROUTE_GROUPS.length)];
}
