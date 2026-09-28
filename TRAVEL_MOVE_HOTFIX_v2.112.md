# v2.112 — Travel Movement / Blank Sync Hotfix

- Fixed player one-step Node movement after Travel Groups / explorer markers.
- Manual player markers now follow accepted group movement instead of visually staying on the old Node.
- GM background worker serializes Travel Blank updates and applies the new Node background before broadcasting the accepted movement state.
- Right-clicking the same visited Node again now shows **REMOVE I'M HERE** and removes that player marker.
- Presence removal remains GM-authoritative and room-shared.
