# Player Explored Node Counter · v2.140

Base: `v2.139` with Direct Node Editor and stable Node Token Templates retained.

Restores the v2.132 player-facing explored counter:

- Player sees `EXPLORED N NODE(S)` at the top-right of the Travel Node Board.
- Counts only discovered Nodes on the currently open Map.
- Hidden / undiscovered Nodes are not counted.
- The total number of Nodes is never shown, preventing map-size spoilers.
- The counter is derived from shared `discoveredNodes` state, so it updates with normal Travel state rendering/sync.
- GM does not see the badge.

No Ping behavior was reintroduced.
