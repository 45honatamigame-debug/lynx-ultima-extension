# v3.0.8 — Invoke System

Base: v3.0.7 Group Check recheck (itself based directly on v3.0.6).

## Invoke Trait
- Player-character rolls expose Identity / Origin / Theme in the result popup.
- Spend 1 FP to reroll LEFT, RIGHT, or BOTH dice.
- May be repeated while FP remains.
- Disabled when the current Check is a Fumble.
- Each reroll replaces the old die result and recalculates Total, Critical/Fumble/Double, Study result, target damage comparison, and Group Check Final outcome.

## Invoke Bond
- Bonds now store Strength 1–3 (legacy Bonds normalize to Strength 1).
- Spend 1 FP to add the selected Bond Strength to the Check Result.
- Can be used once per Check.
- Bond bonus affects Check/Accuracy Result only; it does not increase High Roll or damage.

## Synchronization
- Invoke revisions replace the original roll in Latest Result, feed, combat history, and any still-open roll popup instead of creating duplicate rolls.
- Revised rolls are broadcast to the room so observers use the same dice/total/result.
- Group Check Final sends post-Invoke dice/bonus revisions back to the GM result.
- Study can only raise the previously unlocked tier; an Invoke reroll never reduces already revealed Study information.

## Coverage
- Character Action rolls
- Manual and Suggested Checks
- Study rolls
- Main Token Action HUD rolls
- Token Action HUD popover result routing
- Group Check Final

Optional "Invoke to Fail" is intentionally not added.
