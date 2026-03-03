/**
 * Catalog of optional features available for themes.
 *
 * Theme creators can import any of these into their page.tsx / layout.tsx.
 * Features are composed manually (no runtime flag system) — just import
 * the component and add it to your layout.
 */
export const THEME_FEATURES = {
  clippy:          { description: "Helpful assistant character (Web2 or ASCII variant)", location: "layout" },
  cat:             { description: "Draggable cat companion", location: "layout" },
  controlledChaos: { description: "World chaos display with encrypt/decrypt toggle", location: "page" },
  cursorTrail:     { description: "Emoji cursor trail with Konami code", location: "layout" },
  statusBar:       { description: "Scrolling status messages", location: "layout" },
  midiPlayer:      { description: "Retro MIDI music player", location: "layout" },
  worldChaos:      { description: "Real-time world chaos data display", location: "page" },
  fartscroll:      { description: "Fart sounds on scroll", location: "page" },
  welcomePopup:    { description: "One-time welcome popup for first-time visitors", location: "root layout" },
} as const;

// Current feature distribution:
// root layout:      welcomePopup (all themes)
// museum page:      fartscroll
// ascii layout:     clippy(ascii), cat, midiPlayer
// ascii page:       controlledChaos
// web2 layout:      midiPlayer
// web2 page:        controlledChaos (+ clippy, cat, cursorTrail, statusBar via Web2Layout)
// newspaper:        (none currently — contributors can add any)
