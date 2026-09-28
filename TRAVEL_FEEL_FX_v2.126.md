# Travel Feel FX v2.126

- Animated Travel Marker: room-wide `travel-move-fx` cue animates player/ally portraits along same-map graph edges without per-frame Scene metadata writes.
- Background Crossfade: every connected client background page renders a temporary local MAP-layer dark veil; the authoritative Blank image swap is delayed to the veil midpoint. Character-layer tokens remain visible.
- GM direct moves and player validated moves share the same FX cue.
- Cross-map movement keeps the background fade but skips line-marker interpolation because the two Nodes live on different map tabs.
