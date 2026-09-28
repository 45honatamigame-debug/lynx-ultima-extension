# v2.163.3 — Token Action HUD result routing hotfix

Base lineage: v2.162 -> v2.163 Token Action HUD -> v2.163.1 Main Canvas HUD -> v2.163.2 HUD Controls.

- Token Action HUD events are tagged with `origin: TOKEN_ACTION_HUD`.
- The open Fabula action window now accepts self-origin HUD `roll` and `share` events, so HUD ROLL/USE uses the original result overlay/feed pipeline.
- Background only falls back to the main Owlbear canvas when the Fabula action window is closed.
- The fallback uses the existing `alert.html` renderer for Roll, Action USE, Item USE, and Arcana SEND results.
- Normal self-generated events from the Sheet keep their old anti-duplicate behavior.
- Item and Arcana rows now have hover previews using the same side preview surface as Actions.
- Action, Item, and Arcana preview art supports existing linked-token art / GIF-link fallbacks.
