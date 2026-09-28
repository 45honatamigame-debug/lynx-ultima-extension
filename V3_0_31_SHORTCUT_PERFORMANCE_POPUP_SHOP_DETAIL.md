# v3.0.31 — Shortcut Performance + Cinematic Popup Restore + Shop Detail

- Fixed shortcut labels clipping by shrinking the visual ring while keeping a safe transparent popover frame.
- Menu opening now uses cached button/viewport positions, stable menu URLs, shorter close/open waits, and prewarmed local assets.
- Shop cards now include an explicit DETAIL button with a full item detail panel before purchase.
- Lightweight Companion Flow roll/share payloads now restore `origin: COMPANION_HUD`, so the background cinematic alert path once again shows the classic Roll/SEND/USE popup (including linked media).
- Study rolls attach the target monster art/name to the cinematic popup.
