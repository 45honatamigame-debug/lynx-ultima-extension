# TRAVEL — v2.108

- Node Plan is no longer limited to the original 0–100 area. It auto-expands as nodes are placed farther away.
- Existing v2.107 node coordinates keep their visual layout.
- Pan/zoom remain available; FIT NODES fits the actual node bounds and CURRENT centers the active node.
- GM always sees every node and gets clear OPEN / LOCKED / HIDDEN / REVEALED state labels.
- A locked adjacent route remains visible to players even when its destination has not been discovered.
- Unknown locked destinations display as `LOCKED` instead of revealing the destination name.
- Each node has an `UNLOCK RULE` field.
- Clicking a locked route opens the existing cinematic Broadcast window with that Unlock Rule.
- Unlock Rules never auto-unlock a node. The GM must right-click the node and choose `UNLOCK NODE`.
- One-step movement validation remains enforced by both the extension UI and GM background worker.
