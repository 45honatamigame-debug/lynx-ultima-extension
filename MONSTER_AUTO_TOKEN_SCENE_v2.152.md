# v2.152 — Monster Scene Auto Token + Stat Link

When the GM uses **SEND TO ENEMY** or **SEND TO ALLY** from the Monster Library, Fabula now performs one combined action:

1. Create a new monster instance in Scene.
2. Resolve art from the active Phase (`TOKEN ART` first, `PORTRAIT` fallback).
3. Spawn a CHARACTER token at Default View / viewport fallback.
4. Link that token ID to the exact Scene monster instance.
5. Existing Fabula token HUD/stat sync takes over automatically.

The explicit `SPAWN TOKEN + LINK STATS` controls remain available for manual replacement/relinking.

If no art exists, the Scene monster is preserved and the GM is warned; no broken/blank Owlbear token is created.
