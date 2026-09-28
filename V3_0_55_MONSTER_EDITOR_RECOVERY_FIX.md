# V3.0.55 — Monster Editor Recovery Fix

## Fixed

- Main window → MONSTER → NEW MONSTER no longer enters Recovery Mode.
- Editing an existing Monster template works again.
- The Monster template header and SHEET portrait each resolve `displayArt` in the correct local scope.
- Phase-specific Portrait fallback continues through `monsterDisplayArt(m, "lib")`.

## Verified paths

- Monster Library list
- New Monster creation
- Existing Monster edit
- SHEET
- ACTIONS
- SPECIAL RULE
- Base form and additional Phase tabs
