# v2.85 Chat / Fabula AI restoration

Compared v2.84 against the stable v2.72 Chat/Fabula AI implementation.

Findings:
- Core Fabula AI JS functions in v2.84 are identical to v2.72.
- The complete `fabula-ai-*` stylesheet block was missing in v2.84.
- v2.72 contains 69 `fabula-ai-` style references; v2.84 contained 0.

Fix:
- Restored the stable v2.72 Fabula AI tab, message, composer, source-button and PDF page-reader CSS without reverting Shop/Scene code.
- Retained v2.84 lazy Shop loading and runtime recovery.
- Version bumped to 2.85.0.
