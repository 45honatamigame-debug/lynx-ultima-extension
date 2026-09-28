# V3_0_71 Shared Notes Popup — Vanilla Edit

## Change

Adds a new Companion HUD `NOTES` popup button for room-shared notes.

## Behavior

- New `NOTES` shortcut appears in the shared utility row next to Clock / Codex / Shop.
- Opens in `READ MODE` by default.
- Press `EDIT MODE` before editing the selected page.
- Notes are shared through Owlbear Scene metadata, so everyone in the room sees the same pages/content.
- Supports multiple pages.
- `+ PAGE` adds a new shared page.
- `DELETE PAGE` requires a confirm dialog before deleting, and the last page cannot be deleted.
- Pasted image/GIF links (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`) render as media in read mode; raw URLs are hidden from the read text.

## Files changed in place

- `background.js` — registers the new Notes shortcut, default position, and wide popup sizing.
- `companion-button.js` — adds the Notes icon.
- `companion-menu.js` — adds shared notes metadata, read/edit modes, page add/delete/save logic, media URL rendering.
- `companion-menu.css` — styles tabs, toolbar, reader, editor, and media grid.

## Verification

- Edited in the existing latest Vanilla Edit folder to avoid duplicating Drive storage.
- `node --check` passed for `background.js`, `companion-button.js`, and `companion-menu.js` before upload.
