# v3.0.27

- Shrunk Companion shortcut hitboxes/icons and reserved a larger right-side safe inset.
- Fixed Study shortcut race: Study commands are no longer consumed until the Scene monster target is available; performStudyRoll now returns its roll result.
- Added GM-only red DOMINION shortcut.
  - MONSTER LIST reads the existing local Monster Library and can spawn Enemy/Ally instances through the original spawn pipeline.
  - MONSTER SHEET follows the active monster Initiative slot, exposes HP/MP/IP/FP + statuses, and routes Action Roll/Send through the original monster Cost/Roll pipeline.
- Existing saved shortcut coordinates remain stable; only display clamping reserves more space from Owlbear's right tool rail.
