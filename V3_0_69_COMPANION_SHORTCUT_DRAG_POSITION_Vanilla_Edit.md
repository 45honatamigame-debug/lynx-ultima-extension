# V3_0_69 Companion Shortcut Drag Position — Vanilla Edit

## Change

Adds a live coordinate readout while dragging Companion shortcut popup buttons, so players can place buttons more accurately.

## Behavior

- When pressing/dragging a shortcut button, a small coordinate pill appears under the button.
- While moving, it shows the target `X` / `Y` anchor position plus approximate viewport percentage and drag delta.
- The readout updates live during drag and the button still saves position only on release, preserving existing behavior.

## Files changed in place

- `background.js` — passes current button anchor/viewport to each button iframe.
- `companion-button.js` — computes and displays live target coordinates while dragging.
- `companion-button.css` — styles the coordinate pill and drag highlight.

## Verification

- Edited in the existing latest Vanilla Edit folder to avoid duplicating Drive storage.
- `node --check` passed for `background.js` and `companion-button.js` before upload.
