# V3.0.2 — Study / Hinder Target Fix

Root cause: target IDs crossed UI boundaries as strings (select/data attributes/URL/broadcast), while several Scene Monster lookups still used strict raw `===` comparisons. Legacy/imported numeric IDs therefore failed to match the same Scene instance.

Fixes:
- Canonical Monster instance IDs to strings in app normalization.
- Central Study/Hinder target resolver.
- String-safe comparisons in dropdown, GM quick target, status update, Study apply, and result matching.
- Background remote Study auto-apply resolves by Scene Monster ID and falls back to linked Token ID.
- Restricted Monster HUD pins both Monster ID and Token ID, preventing a stale/relinked token from silently targeting another instance.
