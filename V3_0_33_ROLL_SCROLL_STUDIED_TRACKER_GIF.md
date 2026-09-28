# v3.0.33 — Roll Scroll / Studied Tracker Sheet / Initiative GIF

- Roll/Apply Damage overlays preserve their scroll position across same-roll re-renders, including DMG MOD, hit count, affinity mode, scene metadata refreshes and Flow updates.
- Monster entries in the Initiative Tracker become clickable for GM or when the active monster phase has Study 7+.
- Clicking a studied monster opens a read-only Studied Monster sheet in the Companion menu popover.
  - Study 7+: profile + HP/MP + public status.
  - Study 10+: DEF/M.DEF, traits, attributes and affinities.
  - Study 13+: actions.
  - GM: full studied data plus GM-only Special Rules.
- Initiative rolls made from the Initiative Tracker now include the character's saved `initiativeGif` in the normal cinematic roll payload.
