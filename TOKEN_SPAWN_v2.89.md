# Token Spawn v2.89

Token creation no longer depends on the pointer placement tool.

## New spawn flow

1. Press **SPAWN TOKEN + LINK STATS**.
2. Fabula looks for the invisible Scene item created by the **Default View** Owlbear extension (`uk.co.davidsev.owlbear-default-view/item`).
3. The token is created on the CHARACTER layer at the snapped center of that Default View area.
4. Fabula links the token to the player/monster stats immediately.

## Fallback

If no Default View item exists, Fabula converts the center of the currently visible viewport from screen coordinates to scene coordinates with `OBR.viewport.inverseTransformPoint`, then grid-snaps that point.

## Compatibility

Any stale v2.87/v2.88 token-placement session is cancelled before direct spawning so the pointer tool cannot remain trapped in placement mode. Legacy placement functions remain in the build only to safely clean up old pending state.
