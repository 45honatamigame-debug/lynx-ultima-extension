# v3.0.38 — Inline Attribute Buff / Debuff Controls

- STATUS > ATTRIBUTES now owns the temporary die-step controls directly.
- DEX / INS / MIG / WLP each have a distinct color identity.
- Minus/plus modifies `attributeBuffs` from -3 to +3 steps and preserves the character base die.
- Current die still includes active status penalties through the existing `currentDie()` calculation.
- The separate TEMP MODIFIERS section was removed from the Companion STATUS popover.
