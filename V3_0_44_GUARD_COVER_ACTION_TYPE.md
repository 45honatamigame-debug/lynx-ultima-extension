# v3.0.44 — Guard / Cover Ally Action Types

- Added `GUARD` and `COVER ALLY` to Player and Monster Action Type selectors.
- These types automatically use `NO ROLL` and expose a `USE` action in the Sheet, Token Action HUD, and Companion flow.
- `GUARD` creates a Shield Ring on the linked actor Token.
- `COVER ALLY` opens an allied linked-Token chooser, then creates a shield link and `COVERED BY ...` badge.
- Enemy Melee Attacks are stopped before rolling or paying their action cost when a covered target is selected.
- Guard is limited to once per turn and expires at the start of the guarding creature's next turn.
- While Guard is active, typed damage resolution treats the guarding creature as having Resistance unless its existing affinity is Immunity or Absorption.
- The action message reminds players of the `+2` bonus to Opposed Checks; this remains manual because generic rolls do not identify whether a check is Opposed.

Rules implementation follows the Core Rulebook: Cover prevents foes from performing melee attacks against the covered creature. It does not transfer damage and does not ask the guarding player whether to receive damage.
