# v3.0.15 · Gamepad Companion + Main Flow Routing

- Companion shortcut buttons are now circular game-HUD controls with a dark metallic core and gold ring.
- All nine controls remain separate Owlbear popovers and stay individually draggable. Empty space remains native Owlbear canvas.
- Companion USE/ROLL no longer implements a second cost/roll system. It queues a command to the main Fabula action and routes through the original handlers.
- Class Skill, Arcana and Action therefore use the same resource Cost prompt as the main sheet.
- Player Action and Study use the original Roll overlay, including Invoke Trait / Invoke Bond and the normal roll/history/feed pipeline.
- Equipment, Spheres, Items and Bonds call the same SEND handlers as the main sheet.
- Hinder and Travel call the original main handlers.
- Hovering menu entries shows a floating detail card with description and available image/GIF/portrait/node preview art.
- Existing saved button positions remain compatible; Settings → ↺ positions uses the new HUD-oriented default layout.
