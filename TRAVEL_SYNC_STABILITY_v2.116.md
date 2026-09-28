# v2.116 Travel Sync Stability

- Fixed a literal `\n\n` token accidentally embedded before `OBR.onReady` in `background.js`; browser module loading could fail, leaving no authoritative travel request handler.
- Background broadcast listener now registers before slower metadata/player reconciliation.
- Player movement is request/ACK based instead of optimistic Current mutation.
- One movement request per Session/Group at a time; 5-second watchdog clears stale pending state and reloads Scene Travel metadata.
- Movement ACK is broadcast before Background Blank image replacement, so a slow MAP item update cannot freeze player movement.
- Duplicate request IDs replay cached ACKs instead of being silently discarded.
- Initial Owlbear onReady registration happens before the first risky full UI render, preventing a player-specific render exception from leaving the header on CONNECTING forever.
- Removed the redundant local `current node must already be discovered` movement guard; GM-authoritative one-edge validation remains strict.
