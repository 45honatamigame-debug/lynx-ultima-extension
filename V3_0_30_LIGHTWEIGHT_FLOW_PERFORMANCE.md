# v3.0.30 · Lightweight Flow Performance

Base: v3.0.28 UX/Flow behavior.

- Keeps the separate Companion Flow interaction instead of v3.0.29 NO-FLOW menu replacement.
- `companion-flow.html` no longer loads the ~800 KB main `app.js` or ~330 KB main stylesheet.
- New `companion-flow-lite.js` uses the shortcut action engine only (Cost → Roll/Send → Result → Invoke).
- Flow command is passed inline in the popover URL; pending localStorage command queues and `main-action-ready` retry broadcasts are removed from the active path.
- Skips pointless menu/flow `popover.close()` waits when that surface is not currently open.
- Shortens close waits when replacing an already-open shortcut surface.
- Main window, shortcut layout persistence, Initiative Tracker, Dominion, and v3.0.28 menu layout are otherwise preserved.
