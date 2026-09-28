# V3_0_72 Shortcut Drag Drop Shadow Preview — Vanilla Edit

## Change

Improves shortcut-button dragging so players can see exactly where a button will land before releasing the mouse.

## Behavior

- While dragging a Companion shortcut button, the existing coordinate pill still updates.
- A new gold dashed “drop shadow” preview appears at the predicted release position on the Owlbear screen.
- The shadow follows the drag target while moving, so users can line up placement before releasing.
- When the drag ends or is cancelled, the preview closes automatically.
- The real button position is still saved only on release, preserving existing behavior.

## Files changed / added in place

- `background.js` — listens for live drag-preview events and opens/closes the predicted-position preview popover.
- `companion-button.js` — sends throttled preview updates while dragging.
- `companion-drag-preview.html` — new lightweight preview popover.
- `companion-drag-preview.css` — dashed gold shadow/drop target styling.
- `companion-drag-preview.js` — fills label and coordinates for the preview.

## Verification

- Edited in the existing latest Vanilla Edit folder to avoid duplicating Drive storage.
- `node --check` passed for all changed/new JavaScript files before upload.
