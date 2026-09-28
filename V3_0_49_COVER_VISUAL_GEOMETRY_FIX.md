# V3.0.49 — Cover Visual Geometry Fix

- Fixed Guard/Cover shapes inheriting the token scale twice, which could stretch the Cover link across the whole scene.
- Guard rings, Cover links, and Cover badges now use stable scene-space coordinates.
- Cover links now begin and end outside the two token edges instead of crossing through their portraits.
- Visuals continue to resync when either linked token moves or changes size.
