# v2.117 · Undirected Travel Graph

- Removed the four-direction route limit from the Travel Node graph.
- GM can toggle LINK NODES, click Node A, then Node B to create a bidirectional route.
- A Node can have unlimited connections.
- Existing LEFT/RIGHT/FORWARD/BACK links are migrated into undirected reciprocal edges automatically.
- Node movement still allows one connected edge per click and respects locks.
- Node editor lists all connected Nodes and provides UNLINK buttons.
- Cross-map connections remain supported without directional labels.
