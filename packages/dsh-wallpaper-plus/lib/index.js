// dsh-wallpaper-plus — Host half.
// This plugin's logic is browser-side (wallpaper layer + settings row), so the
// Host half is a no-op loader. Persistence is via localStorage (visual prefs
// survive reloads on the same origin; DSH's Host settings wire only exposes an
// allowlisted set of namespaces to browser clients).

export const name = 'dsh-wallpaper-plus'

export function apply() {
  // Browser half does the work (see ./client.js).
}
