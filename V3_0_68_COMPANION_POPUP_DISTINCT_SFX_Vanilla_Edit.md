# V3_0_68 Companion Popup Distinct SFX — Vanilla Edit

## Change

Adds distinct procedural sound cues for shortcut popup actions. No external audio files are required; the new cues are generated in `soundscape.js`.

## Covered shortcuts / surfaces

- Clock / Project add, remove, increment, decrement, set-progress, pin/objective toggles.
  - Clock changes broadcast to everyone through the background script.
  - Canvas Clock HUD (`clock-hologram.js`) also triggers the same broadcast cues.
- Quick Status resources in popup: HP, MP, IP, FP use separate up/down cues.
- Status toggles / attribute buffs / defense changes get their own UI/status cues.
- Invoke Arcana uses a distinct `arcana` cue.
- Zero Power charge/release uses distinct FP/Zero-style cues.
- Initiative START/NEXT in the tracker broadcasts to everyone; the active player gets the special `turnmine` alert cue while others hear the normal initiative cue.
- Other shortcut menu actions route through reasonable distinct cues: roll/action, study, hinder, travel, shop, equipment/class/sphere/item/bond.

## Files changed

- `soundscape.js`
- `background.js`
- `companion-menu.js`
- `initiative-tracker.js`
- `clock-hologram.js`

## Verification

- `node --check` passed for all five changed JavaScript files before upload.
- This version was copied from `V3_0_67_INITIATIVE_TRACKER_ROLL_PERSISTENCE - Vanilla Edit`, so it includes the previous Initiative Tracker persistence fix.
- Original folders were not modified.
