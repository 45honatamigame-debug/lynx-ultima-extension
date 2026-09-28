# v3.0.23 · Tracker Controls + Transparent Companion Flow

- Fixes Initiative Tracker ROLL INITIATIVE path by starting own-sheet Companion commands immediately after player bootstrap.
- Adds GM START / NEXT / RESET INIT controls directly in Initiative Tracker; these update shared Scene combat state without opening Companion Flow.
- Replaces the large black Companion Flow pseudo-window with a dedicated transparent `companion-flow.html` execution surface.
- Cost / Roll / Study / Send / Invoke still use the exact existing `app.js` pipeline, but only the actual interactive card is visible over the Owlbear canvas.
- Waiting splash is hidden during normal startup and appears only as a compact RETRY/CLOSE recovery card on a real failure.
