# V3.0.62 — Rapid Clock Input Stability

## Fixed

- Rapid Hologram Clock presses are queued instead of discarded.
- Rapid Companion Clock and Project presses apply immediately and save in order.
- Intermediate metadata echoes cannot temporarily roll the displayed progress backward.
- Zero Power rapid input is coalesced to the latest charge value.
- Activating Zero Power after a rapid charge sequence commits 6/6 before resetting to 0/6.

## Verification

- Six immediate Hologram presses reached 6/6 with zero dropped operations.
- Six immediate Companion Clock presses reached 6/6 with zero overwritten operations.
- Six immediate Zero Power changes produced one final save at 6/6.
