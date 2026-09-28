# v2.106 — TRAVEL NODE BACKGROUND → BLANK SLOT

- Travel now creates/uses one reusable **Background Blank** rectangle on Owlbear's MAP layer.
- Background sources are assigned **per Node**, not per Map Tab.
- When Current Node changes, the previous source is hidden and the new Node background is shown and fitted into the Blank bounds.
- The Blank itself is visible only when the Current Node has no linked Background.
- Existing v2.105 map-level Background links remain as a migration fallback until a Node-specific Background is assigned.
- Player one-step travel, Live Sync, locking, zoom/pan and visited-node preview remain intact.
