# Token Placement v2.87

Player and Monster token spawning now uses a two-step placement flow.

1. Click PLACE TOKEN + LINK STATS.
2. Fabula creates and selects an unlinked placement token.
3. Drag that token to the desired position on the Owlbear map.
4. Re-open Fabula if needed and click CONFIRM POSITION + LINK.
5. The final position is snapped using the current Owlbear grid preference and stats are linked.

CANCEL PLACEMENT removes the temporary token. Pending placement is stored locally so closing the action popover does not lose the workflow. Monster Templates are not added to Scene until confirmation.
