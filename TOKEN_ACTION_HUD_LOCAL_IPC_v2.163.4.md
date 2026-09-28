# v2.163.4 — Token Action HUD local result IPC

Fix for ROLL / USE buttons appearing to do nothing.

The main-canvas HUD, action window, and background page are separate extension iframes. Roll/share results from the HUD now use same-origin `BroadcastChannel` IPC for the current player. Owlbear `OBR.broadcast` is reserved for remote room members.

Routing:
- Action window open: `app.js` receives the local HUD event and uses the existing feed/latest-result/overlay renderer.
- Action window closed: `background.js` receives the local HUD event and opens `alert.html` on the main canvas.
- Remote players: receive the normal Owlbear room broadcast.

A localStorage storage-event fallback is used when BroadcastChannel is unavailable.
