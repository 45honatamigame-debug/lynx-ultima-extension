# V3.0.14 — COMPANION POPOVER SHORTCUTS

Base: V3.0.13.

- Added a local Settings toggle for **COMPANION POPOVERS**.
- Added nine independent Owlbear popover shortcut buttons: Class, Equipment, Spheres, Items, Bond, Arcana, Actions, Study / Hinder, and Travel.
- Every shortcut button is its own small popover instead of one full-screen transparent iframe, so empty space between buttons stays the real Owlbear canvas and does not block token selection/dragging.
- Each button can be dragged independently; positions are stored in browser localStorage and restored on the next load.
- Added **↺ ตำแหน่ง** in Settings to restore the default shortcut layout.
- Clicking a shortcut opens a compact companion menu beside that button. Only one companion menu is open at a time.
- Companion menus are read/use focused: they do not expose sheet-editor form fields.
- Class Skills and Arcana can pay their saved resource costs before use/share.
- Equipment, Spheres, Items and Bonds can be surfaced to the room from the shortcut UI.
- Actions can roll from the saved character action data and use a currently selected linked Monster as target when available.
- Study / Hinder can select a Scene Monster, roll Study, and apply/remove Hinder statuses using the existing Scene metadata flow.
- Travel shows the current group/node and connected routes and sends movement through the existing Travel move request protocol.
- Companion HUD startup is non-blocking; failure to create a shortcut popover cannot hold up the extension background initialization.
- Companion roll/share events are recognized as external-HUD results by the normal Fabula action window, so an open main window can show the standard roll overlay/history and Player rolls remain compatible with the existing Invoke controls.
- Action shortcut targeting supports the linked tokens currently selected on the Owlbear canvas, including multiple selected targets.
- Study / Hinder shortcut cards preserve Study spoiler visibility: unrevealed HP/MP and status immunities are not exposed by the shortcut UI.
