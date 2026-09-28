# v3.0.25 · Direct Initiative Roll + MOD

- Initiative Tracker ROLL INITIATIVE no longer depends on Companion Flow.
- Clicking it opens a small tracker-local MOD prompt.
- The click always rolls the current Owlbear player’s own Fabula character with DEX + INS + MOD.
- Initiative is persisted through the serialized Companion status editor, using the same player sheet metadata.
- The normal room roll event is broadcast with COMPANION_HUD origin so existing roll alerts can still display.
- The tracker shows the Initiative result locally and updates after the sheet save.
- Existing app.js roll-initiative command now also accepts an optional manual MOD as a fallback.
