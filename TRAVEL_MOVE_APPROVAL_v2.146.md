# v2.146 · Travel Move Approval Mode

- GM can toggle `MOVE APPROVAL · ON/OFF` from the Travel group controls.
- When enabled, every player Node movement request is queued instead of auto-approved.
- Pending requests are persisted in Scene metadata, so they survive the action panel being closed/reopened.
- GM receives an Owlbear notification and a confirmation popup showing player, group, FROM Node and TARGET Node.
- `APPROVE MOVE` performs the original authoritative one-edge movement flow; `DENY` leaves the party in place and releases the player's pending request.
- Locked/non-adjacent/stale requests are still rejected by the existing movement validation.
- GM movement remains immediate and never asks the GM to approve their own move.
