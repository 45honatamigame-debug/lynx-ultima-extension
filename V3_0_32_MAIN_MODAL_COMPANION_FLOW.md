# v3.0.32 — Main Modal Companion Flow

## Goal
Shortcut buttons remain shortcuts: they do not open the main Fabula window, but Cost / Roll / Study / Send / Use / Invoke must look and behave exactly like the main-window overlays.

## Regression fixed
v3.0.30–v3.0.31 routed shortcut actions through `companion-flow-lite.js`. That runtime had separate simplified `direct-cost` and `direct-roll` cards, causing the raw compact panels seen by the user instead of the cinematic modal UI used by `app.js`.

## Changes
- `companion-flow.html` now loads `/styles.css` and `/app.js`, the same renderer used by the main Fabula action window.
- The existing `COMPANION_FLOW` fast boot in `app.js` remains active, so Flow does not initialize the full Party/Travel/GM-tool application state.
- Commands remain inline in the Flow URL; no pending localStorage command queue or ready-broadcast retry loop is reintroduced.
- Removed the timestamp cache-buster from Flow URLs so the browser can reuse cached HTML/CSS/modules.
- Background prewarms `styles.css`, `app.js`, `fabula-ai-data.js`, and the Flow shell as soon as the HUD starts.
- Flow placement uses the cached HUD viewport snapshot instead of waiting for a fresh viewport read on every click.
- Removed the unused `companion-flow-lite.js` runtime to prevent accidental regression back to the simplified UI.

## Expected shortcut sequence
Shortcut menu -> Main-style PAY COST modal -> Main-style Roll/Send/Use popup -> Main-style Invoke controls.
The main Fabula window itself remains closed.
