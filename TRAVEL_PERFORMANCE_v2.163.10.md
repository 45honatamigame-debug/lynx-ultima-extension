# v2.163.10 — Travel Performance Pass

This release keeps the v2.163.9 Travel Inspector and all Travel mechanics unchanged while reducing UI/canvas work during navigation.

## Interaction path
- requestAnimationFrame coalescing for pan/zoom transforms and dragged-node DOM updates.
- temporary `.travel-perf-interacting` mode disables expensive glow/filter/animation effects only during active movement.
- preview movement is rAF-throttled.

## Render path
- unchanged MAP item lists no longer trigger full Travel re-renders.
- GM self-echo `travel-sync` does not rebuild a graph already rendered locally.
- completed marker-motion overlays are removed directly.

## Owlbear background path
- generic `scene.items.onChange` bursts are coalesced before the background Travel consistency pass.
- metadata-driven Travel changes remain immediate.
