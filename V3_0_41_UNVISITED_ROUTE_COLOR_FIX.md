# v3.0.41 — Unvisited Route Color Fix

- Fixed the v3.0.40 route-memory CSS block being appended with literal `\n` text instead of real line breaks.
- `ROUTE FOUND · UNVISITED` nodes now render amber/yellow in both the main Travel board and the player holographic Travel shortcut.
- Unvisited routes render amber dashed lines.
- Current node, reachable node and locked-route priorities remain intact; locked stays red.
- No travel discovery/spoiler logic changed in this patch.
