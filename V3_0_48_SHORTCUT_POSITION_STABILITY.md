# v3.0.48 — Shortcut Position Stability

- Saved shortcut coordinates are now authoritative and are no longer clamped when Owlbear briefly reports a smaller viewport.
- Companion shortcut popovers open sequentially so concurrent anchor updates cannot stack several buttons at one position.
- Release/layout patches no longer overwrite existing custom shortcut positions.
- Settings preserves the complete shortcut-position preference record when toggling or saving.
- A layout is automatically repaired only when at least four shortcuts are detected at the same corrupted coordinate.
- Manual `↺ ตำแหน่ง` remains available when the user intentionally wants the canonical default layout.
