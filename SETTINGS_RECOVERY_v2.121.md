# v2.121 · Settings Recovery

- Restored the missing `settingsHTML()` renderer.
- Regression was introduced in v2.109 when the Travel marker patch replaced a code range that also contained Settings.
- Existing Settings CSS, local preference storage, UI-size/theme/Scene-width handlers, reset-tab-order, and sound-test actions were preserved.
- Added build-time static assertions during this release to verify the Settings renderer, controls, handlers, and styles are all present.
