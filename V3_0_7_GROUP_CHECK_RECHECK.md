# V3.0.7 · GROUP CHECK RECHECK / HARDENING

Base: V3.0.6. No unrelated feature branch was merged.

## Fixed

1. **Leader-only Group Check blocked**
   - START requires at least one online Supporter in addition to the Leader.
   - Runtime validation remains in place in case availability changes after the UI renders.

2. **Bond bonus validity**
   - Highest Bond is forced to 0 until at least one Support Check succeeds.
   - Bond editing is locked after the GM sends the Final Check, preventing the GM display from drifting away from the already-sent final payload.

3. **Late Support result overwrite**
   - GM accepts Support results only while the active session is in the support phase.
   - Sender/player identity and Fabula die ranges are validated.
   - Success, Critical, Fumble, total, and common MOD are recalculated from the active session.

4. **Final result ownership/state validation**
   - GM accepts the Final result only while waiting for final and only from the selected Leader.
   - Final total and outcome are recalculated from the frozen active Group Check bonuses.

5. **Double Final roll guard**
   - The Leader's Final button locks immediately on submit and displays ROLLING… while the result is being delivered.

## Regression / package checks

- `node --check` PASS: alert.js, app.js, background.js, fabula-ai-data.js, gm-shop-stock.js, soundscape.js, token-action-hud.js.
- Manifest version and visible UI recovery branding: V3.0.7.
- All local `src` / `href` assets referenced by HTML exist.
- No duplicate named function declarations in app.js, background.js, or token-action-hud.js.
- No merge-conflict markers / TODO / FIXME markers in JS/HTML/CSS.
- Final ZIP integrity checked with `unzip -t`.

## Manual Owlbear checks recommended after install

- GM cannot start without at least one Supporter.
- Failed-only Support set keeps Bond disabled and final bonus at +0 Support / +0 Bond.
- Successful Support enables Bond 0–3; sending Final freezes it.
- Rapid double-click on Leader Final produces one Final result.
- Late Support event cannot alter a Final-ready or Complete session.
- Only the selected Leader's Final result completes the session.
