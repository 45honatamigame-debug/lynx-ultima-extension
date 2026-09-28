# v2.145 — Ultra-visible Travel Connection Lines

- Connection/Edge lines between Travel Nodes are now dramatically thicker and brighter.
- Normal graph edges: bright cyan, 5px, with dark separation + glow.
- Reachable/open routes from the current Node: neon green, 9px, with strong multi-layer glow.
- Locked routes: bright red dashed, 8px, with red glow; locked red always overrides reachable green.
- Uses `vector-effect: non-scaling-stroke`, so line thickness remains readable while zooming the Travel board.
- Visual-only change. No travel adjacency, link, lock, reveal, movement, or sync behavior changed.
