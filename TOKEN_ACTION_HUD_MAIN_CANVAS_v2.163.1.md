# Token Action HUD — Main Canvas v2.163.1

Clean continuation of the v2.162-based Token Action HUD branch.

- HUD is opened with `OBR.popover` over the Owlbear main interface, not inside the extension action window.
- `background.js` watches the local player's selection and opens the HUD for controllable LinkStat tokens even while the Fabula action popover is closed.
- The acting token stays pinned while subsequent map selection can be used as action targets.
- Action hover preview, Action roll/use, Item send/use, manual/quick checks, resource +/- and Action reorder remain available in the main-canvas HUD.
- Player permissions: own linked player token only. GM permissions: linked Player/Ally/Monster tokens.
- Closing the HUD suppresses immediate reopen for the same unchanged selection; changing selection allows it to open again.
