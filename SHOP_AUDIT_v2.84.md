# SHOP / BOOT AUDIT — v2.84

Audit range: v2.69 through v2.83, focusing on changes introduced with GM SHOP and later shared shop / trade-off features.

## Critical findings

1. v2.78 contained an ES Module syntax regression inside `shopInventoryCard()` caused by literal line breaks embedded inside a quoted `.join(...)` separator. This can prevent `app.js` from parsing and leaves the Owlbear popover blank.
2. v2.79-v2.80 parsed correctly.
3. v2.81-v2.83 contained another ES Module syntax regression in `sendTradeoffRollResult()` with the same literal-line-break pattern. This is the direct cause of the all-black / blank extension window in v2.83.
4. Earlier QA used `node --check app.js`. Because `app.js` is loaded as an ES Module, the reliable syntax check is to parse the same source as `.mjs` (or another explicit module-mode check). v2.84 QA uses module-mode checks.
5. Since v2.70, `gm-shop-stock.js` was a synchronous boot dependency in `index.html`. It grew from about 1.2 MB to about 3.0 MB by v2.83. The entire extension therefore waited for shop data before `app.js` could start, even when the user only wanted Scene, Chat, Sheet, or Roll.
6. Shared-shop normalization also performed item lookups while processing room metadata. This unnecessarily coupled ordinary Scene sync to the full shop stock.

## v2.84 fixes

- Fixed the malformed `TRADE-OFF -> SEND TO CHAT` string construction.
- Removed synchronous `gm-shop-stock.js` from `index.html`.
- Added lazy shop stock loading with retry UI.
- Scene / Chat / Sheet can render before shop stock finishes loading.
- Shared-shop metadata normalization preserves valid stock references without requiring the stock database to be loaded first.
- Purchase host/client paths explicitly wait for stock data before resolving an item.
- Added a render error boundary. A runtime render exception now produces a visible Recovery Mode panel instead of a silent black rectangle.
- Added idle warmup so stock normally finishes loading before the user opens Shop while still not blocking boot.

## Historical ES Module syntax audit

- v2.69: PASS
- v2.70: PASS
- v2.71: PASS
- v2.72: PASS
- v2.73: PASS
- v2.74: PASS
- v2.75: PASS
- v2.76: PASS
- v2.77: PASS
- v2.78: FAIL (Shop inventory-card newline regression)
- v2.79: PASS
- v2.80: PASS
- v2.81: FAIL (Trade-Off send newline regression)
- v2.82: FAIL (same regression)
- v2.83: FAIL (same regression)
- v2.84: PASS

## Browser smoke coverage used for v2.84

Preview runtime was executed in Chromium with shop stock loaded and the following views were opened without runtime exceptions: Scene, Clock, Roll, Codex, Monster Library, Chat, Player Shop, Vault, GM Tools, Settings. Chat Room / Combat History / Fabula AI subtabs were switched. GM Shop Stock rendered 18 paged cards, item Detail opened, Trade-Off was rolled and sent to Chat. A second boot test ran without shop stock loaded and confirmed the main shell still rendered and the Shop tab showed a loading panel rather than blanking the extension.

This smoke test is a browser preview test, not a live multi-client Owlbear room test.
