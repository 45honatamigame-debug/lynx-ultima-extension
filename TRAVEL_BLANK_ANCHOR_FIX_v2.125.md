# Travel Blank Anchor Fix v2.125

- Fixes linked Travel Blank images visually shifting away from the pre-positioned MAIN / A / B slots.
- Native width/height are still used for sharp rendering.
- grid.offset is recalculated from the Blank's saved anchor ratio for every source resolution.
- Item scale remains inversely compensated, preserving the slot footprint.
- The sync equality check includes grid offset, so v2.124 displays repair themselves without relinking.
- Foreground GM sync and background Player-movement sync share the same anchor-safe behavior.
