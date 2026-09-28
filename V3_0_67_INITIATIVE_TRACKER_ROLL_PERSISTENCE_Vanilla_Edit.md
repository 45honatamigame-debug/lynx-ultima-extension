# V3_0_67 Initiative Tracker Roll Persistence — Vanilla Edit

## Change

Fixes the Companion HUD Initiative Tracker disappearing when any player or GM rolls Initiative.

## Root cause

`background.js` closed the Initiative Tracker popover before opening every cinematic roll result modal. If the modal close/restore signal was missed, the tracker stayed hidden until the main Fabula window forced a full HUD re-sync.

## Patch

Added `isInitiativeRollPayload(payload)` and changed `openCinematicAlert(payload)` so Initiative roll result modals do **not** close the tracker popover. Other roll/action modals keep the existing behavior.

## Files changed

- `background.js` only

## Verification

- `node --check background.proposed.js` passed before upload.
- Original folder was not modified; this is a copied Vanilla Edit version folder.
