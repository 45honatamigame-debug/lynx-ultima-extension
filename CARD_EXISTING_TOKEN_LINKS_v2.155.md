# CARD EXISTING TOKEN LINKS · v2.155

Corrected the meaning of `LINK TOKEN` for Items, Spheres, Arcana and Bonds.

- Select an existing Owlbear IMAGE token on the Scene.
- Open the card editor and press `LINK SELECTED TOKEN`.
- The card stores the actual Scene token id (`linkedTokenId`) and uses that token's image.
- If the linked token image is updated while keeping the same token id, the card image refreshes from Owlbear scene items.
- `RELINK SELECTED TOKEN` switches the card to another selected token.
- `UNLINK` removes the association and falls back to media in Details (or legacy v2.153/v2.154 URL art if present before the first relink/unlink).
- The linked token image is also used when sending the card to chat.
