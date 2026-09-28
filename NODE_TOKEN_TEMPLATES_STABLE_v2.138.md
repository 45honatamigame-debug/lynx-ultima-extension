# Node Token Templates v2.138

Stable reintroduction on top of the user-confirmed v2.137 base.

- Ping remains removed.
- Capture a selected CHARACTER image token as a Node template.
- Stores image, relative position, scale, and rotation against the active Travel Blank.
- Source token is removed only after the Travel template is saved.
- Entering the Node spawns/repositions the instance HIDDEN.
- GM reveals manually with SHOW / SHOW ALL.
- SAVE POS explicitly stores a moved visible token position.
- Departure/entry scene-item work is fire-and-forget and never awaited by Travel ACK or metadata save.
- Player movement ACK is broadcast before Node Token scene-item work is scheduled.
- Node Ping is intentionally not included.
