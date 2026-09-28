# SHOP STAT EXPANSION — v2.91

Added the missing stat-focused equipment request to the main GM Shop stock.

## New stock (500 items)

- **200 Stat Trade-Off Weapons** — `WPN-101` through `WPN-300`
  - Positive benefits: **0**
  - Strong-stat tier: **150 items**, exactly **1 drawback** each
  - Extreme-stat tier: **50 items**, exactly **2 drawbacks** each
- **100 Pure Stat Weapons** — `WPN-301` through `WPN-400`
  - Positive benefits: **0**
  - Drawbacks: **0**
  - Uses good but restrained Accuracy/Damage profiles instead of effects
- **100 Stat Trade-Off Armor**
  - `LA-101` through `LA-150`: 50 Light Armor
  - `HA-101` through `HA-150`: 50 Heavy Armor
  - Positive benefits: **0**
  - 76 strong-stat pieces with 1 drawback; 24 extreme-stat pieces with 2 drawbacks
- **100 Stat Trade-Off Shields** — `SH-101` through `SH-200`
  - Positive benefits: **0**
  - 75 strong-stat pieces with 1 drawback; 25 extreme-stat pieces with 2 drawbacks

## Integration

- Items are part of the normal lazy-loaded `gm-shop-stock.js` database.
- They appear in the existing WEAPON / LIGHT ARMOR / HEAVY ARMOR / SHIELD tabs.
- Generator, Stock search, Active Shop, purchase flow, and inventory-card conversion use the existing pipeline.
- Existing effect-based equipment remains available; this expansion is additive.
