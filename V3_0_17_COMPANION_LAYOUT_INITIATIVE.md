# v3.0.17 · Companion Layout + Sheet + Initiative Tracker

- Reworked the default Companion HUD layout to match the provided game-HUD reference: large Travel on upper-left, utility shortcuts on upper-right, combat shortcuts grouped on lower-right.
- Added SHEET shortcut. It opens the main Fabula action directly on the current user's editable Sheet tab.
- Added a transparent live Initiative Tracker popover at the top-center during active combat.
- Tracker uses the existing Scene combat state; it rotates the displayed order so the current turn is first and already-passed turns move to the tail.
- Tracker shows HP/MP and portrait; enemy resources remain masked for players until the existing Study 7+ visibility rule allows them.
- Companion buttons and tracker are hidden while the main Fabula action window is open and restored afterward, preventing HUD popovers from rendering through the main window.
- Companion layout version bumped to 3 so the new default arrangement is applied once without stale v3.0.16 positions.
