# v2.147 · Reachable Node Names

Player navigation visibility rule:

- OPEN + directly connected to the viewer group's current Node: show the Node name even if it has not been discovered yet.
- LOCKED + undiscovered: keep the Node name hidden and display `🔒 LOCKED`.
- Nodes that are not currently reachable continue to use the normal discovery visibility rules.
- Undiscovered cross-map routes reveal only the reachable Node name, not the destination Map name.
- This feature does not mutate discovery state.
