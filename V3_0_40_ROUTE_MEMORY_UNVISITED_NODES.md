# v3.0.40 · Route Memory / Unvisited Nodes

- Player Travel now remembers first-step routes exposed by every previously visited Node.
- A Node connected to a visited Node remains visible even if the party walks down another branch.
- Unknown routes beyond an unvisited Node remain hidden (one-hop spoiler boundary).
- Route-found but unvisited Nodes use an amber/yellow visual state in both Main Travel and the Companion Travel overlay.
- Lines leading to an unvisited discovered Node use an amber dashed route style.
- Visited Nodes keep the existing travel colors; Current and Locked states still override discovery styling.
- Cross-map destinations discovered from a visited Node can appear as known Travel maps without revealing deeper Nodes.
- Monster/Combat/Companion position persistence behavior is unchanged.
