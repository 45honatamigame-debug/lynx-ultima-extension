# v3.0.28 · Dominion Spawn + Shortcut Performance

- Moves STUDY / HINDER, STATUS and DOMINION into one control row directly above ACTIONS.
- Keeps the stable position schema; only those three requested controls receive a one-time placement patch.
- Dominion Monster List now spawns a Scene monster directly, creates its Owlbear token at Default View/current viewport, and writes the linkedTokenId back to the Scene monster.
- Dominion Monster Sheet now includes the monster instance's private Special Rules.
- Companion menus use cached viewport measurements, batched button creation and menu-open timeout/retry logic.
- Companion menu refresh reads Player/Scene/Selection in parallel and does not block initial render on Shop stock loading.
- Companion action popovers use a fast Companion Flow bootstrap that skips full-window-only work such as token image cache and legacy prompt restoration.
