# v3.0.26 · Stable Companion Layout Persistence

- Replaced release-coupled `layoutVersion` position invalidation with a stable `positionSchema` (`stable-v1`).
- Legacy v3.0.25-and-earlier shortcut coordinates migrate once to the corrected default layout. Future releases keep saved browser positions unless the user explicitly presses `↺ ตำแหน่ง`.
- Rendering/clamping positions to a temporarily smaller Owlbear viewport no longer writes those clamped coordinates back to localStorage.
- Dragging one shortcut now saves only that shortcut; it no longer rewrites every other button using their current clamped screen coordinates.
- Missing future shortcut keys receive a default position without resetting existing saved buttons.
