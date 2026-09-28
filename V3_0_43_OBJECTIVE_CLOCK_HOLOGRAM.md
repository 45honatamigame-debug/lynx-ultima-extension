# v3.0.43 — Objective / Clock Hologram

- Scene-wide Clock/Project records now preserve `pinned` and `objective` flags.
- GM can mark a normal Clock as an OBJECTIVE and pin any Clock/Project to the Canvas from both the main Clock page and the Companion CLOCK shortcut.
- Pinned trackers render in `/clock-hologram.html` as a transparent Canvas HUD for every player.
- Hologram reads/writes the same `${NS}/scene-trackers-v1` Scene Metadata used by the main window and shortcut.
- GM can change progress or unpin directly from the hologram; players receive a read-only live view.
- Hologram closes while the main Fabula action window is open so it cannot block clicks, then restores when the main window closes.
