# Travel Room Unlock Rules · v2.123

- Every Node/room owns its own `unlockRule`.
- The editor field is bound directly to `mapId|nodeId`, so switching selection cannot redirect an in-flight edit to another room.
- Locked-route broadcast reads the destination Node rule.
- Duplicating a Node clears `unlockRule` and starts the copy unlocked.
