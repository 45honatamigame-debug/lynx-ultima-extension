# V3_0_70 Per-User Initiative Tracker Hide — Vanilla Edit

## Change

Initiative Tracker hide/show is now per-user instead of a GM-only global scene setting.

## Behavior

- Every player can press `HIDE` on their own Initiative Tracker.
- `SHOW` reopens only that same player’s tracker.
- One person hiding the tracker no longer hides it for everyone else.
- GM combat controls (`START`, `NEXT`, `RESET`, `UNDO`) remain GM-only.
- Initiative tracker size still changes between expanded/collapsed via the background popover sync, but now reads a local preference instead of scene metadata.

## Files changed in place

- `initiative-tracker.js` — local hide/show state and all-user HIDE/SHOW buttons.
- `background.js` — stores local collapsed preference and reopens tracker at per-user collapsed/expanded size.

## Verification

- Edited in the existing latest Vanilla Edit folder to avoid duplicating Drive storage.
- `node --check` passed for both changed JavaScript files before upload.
