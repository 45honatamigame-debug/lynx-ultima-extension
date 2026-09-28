# Token Action HUD v2.163

Clean implementation based directly on v2.162.

## Behavior
- Selecting a token whose `linkedTokenId` belongs to a controllable Sheet opens the HUD.
- The actor is pinned after opening so selecting targets does not replace the actor.
- GM: Player/Ally/Monster. Player: own linked token only.
- ACTION tab uses the existing cost/roll/send pipelines.
- Hover preview shows action art/GIF, formula, cost, target/type, and description.
- Up/down buttons reorder the underlying Action list.
- ITEM tab sends/uses the existing Inventory card.
- ROLL tab performs check-only rolls from the pinned Sheet.

