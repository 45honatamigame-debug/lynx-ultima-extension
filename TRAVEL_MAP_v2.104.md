# TRAVEL MAP v2.104

- Player movement is now direct node clicking rather than direction buttons.
- Only a node connected directly to the current node can be entered; the move function validates this again before changing shared state.
- Unknown adjacent destinations are shown as `????` without revealing future map names.
- Locked adjacent nodes remain blocked until the GM right-clicks and unlocks them.
- Cross-map connections appear as edge proxy nodes; clicking one switches the current Map Tab and linked Owlbear Background.
- Travel node board is a large logical canvas (1800×1100) with local zoom/pan controls.
- Controls: `−`, `+`, `FIT`, `100%`, Ctrl/Cmd + wheel, middle-mouse drag, or Space + left drag.
- GM node dragging and double-click creation correctly invert the zoom/pan transform.
