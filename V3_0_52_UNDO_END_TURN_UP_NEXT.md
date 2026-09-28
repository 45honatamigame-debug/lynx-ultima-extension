# V3.0.52 — UNDO / END TURN / YOU'RE NEXT

- GM `UNDO` restores the single previous turn transition recorded alongside the shared tracker UI state.
- `UNDO` is unavailable immediately after combat starts and clears after use, reset, or a new start.
- The active Player receives an `END TURN` button. Its request includes Player ID, active key, and round, and only a matching GM tracker can advance it.
- The next Player card shows `YOU'RE NEXT` with a reduced-motion-safe pulse and receives one Owlbear notification per upcoming turn.
- GM `NEXT` spans the control pad width for faster repeated use.
- Built directly from V3.0.51.
