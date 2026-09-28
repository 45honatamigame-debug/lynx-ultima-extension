# TRAVEL — v2.105 live sync + visited preview

- Player movement is now requested through the GM background worker instead of writing the whole Travel state from each player.
- GM Travel saves are serialized and broadcast immediately as `travel-sync`; Scene metadata remains persistent fallback.
- GM node dragging sends lightweight throttled live position patches so player boards update without full-page rerenders on every pointer move.
- Incoming Travel metadata ignores older revisions to prevent stale echoes from reverting the UI.
- Visited/discovered nodes can show a hover preview popup.
- Each node has an optional Preview Image URL. When blank, the linked Owlbear Background/MAP image is used automatically.
- Preview remains spoiler-safe: undiscovered nodes do not expose the popup to players.
