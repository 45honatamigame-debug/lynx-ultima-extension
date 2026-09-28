# Travel Crossfade Viewport Fix v2.127

The v2.126 fade rectangle followed the Travel Blank item bounds. That became incorrect after resolution-aware Blank swaps changed image dimensions, scale and grid offset.

v2.127 computes the current client viewport from `OBR.viewport.getWidth/getHeight` + `inverseTransformPoint` and renders a temporary local MAP-layer rectangle over that viewport with overscan. It therefore does not depend on MAIN/A/B Blank position or image anchoring.
