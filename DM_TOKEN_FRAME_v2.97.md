# DM TOKEN FRAME — v2.97 rebuild

- Rebuilt the tool instead of patching v2.96.
- Uses a dedicated Owlbear custom Tool + Tool Mode registered after the Scene is ready.
- Uses a native white CIRCLE shape, matching token_4.png, so frame creation no longer depends on an image URL.
- Adds a selection-based fallback while DM Token Frame is active.
- Adds a GM context-menu fallback: Apply DM Token Frame.
- Existing frame is replaced instead of stacked.
- Frame is PROP-layer, hit-disabled, locked, and attached to the CHARACTER token.
