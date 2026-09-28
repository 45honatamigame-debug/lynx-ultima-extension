# v2.159 · Roll Actor Selection Hotfix

- Fixes GM Roll CHARACTER selection reverting to the GM/local Sheet when MANUAL CHECK is pressed.
- Root cause: `<select data-roll-actor>` exposes `dataset.rollActor` as an empty string, so the previous truthy check never handled the change event.
- The handler now checks `hasAttribute("data-roll-actor")`, stores the selected actor ref, rerenders, and preserves the selected Sheet.
- Applies to Player and Monster Sheet selections for GM Roll.
- Player Roll remains hard-locked to the local player's own Sheet.
