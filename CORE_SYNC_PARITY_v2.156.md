# v2.156 Core Sync Parity

- Synced player-sheet card normalization between app.js and background.js.
- Added background handlers for `reorder-path`, `link-card-token`, and `unlink-card-token`.
- Preserves `linkedTokenId`, `linkedTokenArt`, and legacy `tokenLink` during background normalization/persistence.
- New Sphere, Inventory, Bond, Arcana, and Shop-purchased item records initialize the same link fields on both execution paths.
