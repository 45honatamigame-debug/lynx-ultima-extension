# v3.0.20 · Companion Shared Windows + Initiative Tracker

- CLOCK / CODEX / SHOP / ROLL now open dedicated Companion popovers instead of the main Fabula window.
- CLOCK uses Scene shared tracker metadata, so every player sees the same clocks/projects and progress.
- SHOP adds category tabs for ACCESSORY / WEAPON / LIGHT ARMOR / HEAVY ARMOR / SHIELD.
- ROLL routes manual checks through the original roll/result/invoke pipeline without opening the main window.
- STATUS can edit HP / MP / IP / FP in addition to DEF, M.DEF, attributes, statuses and temp modifiers.
- CLOCK / CODEX / SHOP default positions moved below TRAVEL.
- Initiative Tracker now stays visible whenever Companion HUD is enabled and the Scene is ready; before combat it shows the initiative queue in READY state, and during combat rotates Current Turn to the front while showing HP/MP.
- Fixed Companion preference layoutVersion mismatch between app.js and background.js.
