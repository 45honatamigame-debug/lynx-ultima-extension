# v3.0.22 · HUD Layout / Initiative Tracker / Equipment Editor

- Rebuilt default Companion HUD into non-overlapping left, top-right, and lower-right zones.
- Bumped Companion layoutVersion to 6 so the corrected default layout is applied cleanly.
- Initiative Tracker widened and redesigned: fixed-width combatant cards, complete HP/MP current/max display, horizontal queue scrolling instead of shrinking cards, and current-turn emphasis.
- Added ROLL INITIATIVE (DEX + INS) directly inside the Initiative Tracker; it routes through the existing main roll/overlay/Invoke pipeline.
- Equipment shortcut is now an editor rather than a read-only shortcut. It edits the same character metadata as the main window and supports equipment name/type/image/detail plus Sphere sockets 1–4, Add/Remove, SEND, and live Sphere effect summaries.
