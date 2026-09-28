# Token Action HUD · Monster Sheet Parity · v2.163.5

This patch keeps the v2.162-derived Token Action HUD branch and aligns the Monster main-canvas HUD with the existing Monster Sheet schema.

## Shared across phases
- HP / MP current pools
- IP / FP / UP
- Villain Type
- Status effects
- Status Immunities
- Attribute Temp Modifiers

## Current phase
- Normal / Desired Level
- Rank / Species / Initiative
- HP / MP Mod
- Base Attributes
- DEF / M.DEF Mod
- Element Affinities
- Actions

HP/MP caps are re-synchronized after Monster HUD mutations using the same formulas/rank behavior already present in app.js.
