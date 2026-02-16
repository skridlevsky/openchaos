/**
 * Chaos Router - Modify routing in ONE place
 *
 * Add variant: Add to ROUTE_GROUPS + create folder
 * Change routing: Edit pickRandomVariant() function
 * Add feature: Add to FEATURE_FLAGS
 */

export const ROUTE_GROUPS = ['geocities', 'teletext'] as const;

export const FEATURE_FLAGS = [
  'clippy',      // Clippy assistant
  'guestbook',   // Guestbook modal
  'treeGame',    // Tree game modal
  'midiPlayer',  // MIDI player
  'doom',        // Doom game
] as const;

export type RouteGroup = typeof ROUTE_GROUPS[number];
export type FeatureFlags = Record<typeof FEATURE_FLAGS[number], boolean>;

/**
 * THE function to modify for different routing strategies.
 * Current: Pure random on every request.
 * Future: IP-based, user-agent, time-based, weighted, etc.
 */
export function pickRandomVariant(): RouteGroup {
  return ROUTE_GROUPS[Math.floor(Math.random() * ROUTE_GROUPS.length)];
}

/**
 * Generate random feature flags for this request.
 * 50/50 chance for each flag.
 */
export function getRandomFeatureFlags(): FeatureFlags {
  return Object.fromEntries(
    FEATURE_FLAGS.map(flag => [flag, Math.random() > 0.5])
  ) as FeatureFlags;
}
