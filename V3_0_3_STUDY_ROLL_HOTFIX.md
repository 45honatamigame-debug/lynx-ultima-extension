# V3.0.3 — Study Roll Hotfix

Root cause: the restricted Monster HUD rendered `ROLL STUDY` with a native `disabled` attribute whenever `playerSheet(me.id)` returned null. The HUD had no matching disabled style, so the control looked active but the browser suppressed its click event entirely.

Fixes:
- Removed the silent native-disabled path from ROLL STUDY.
- Added `limitedStudyPlayerSheet()` with ownerId-based registry recovery for legacy/offline sheet records.
- Added a safe transient d8 fallback only when no Player sheet can be recovered.
- Render the rolled result locally before IPC/broadcast, so the click always gives immediate feedback.
- Added an explicit disabled visual rule as regression protection.
