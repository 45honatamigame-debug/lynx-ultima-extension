# V3.0 — Header / Top Tabs Reset

Root cause: the top-left build label was non-shrinkable while the top navigation was nowrap and later overflow-visible. Longer suffixes such as `TRAVEL PERFORMANCE` consumed enough width for tabs to collide/clip.

Changes:
- Header label shortened to `LYNX EDITION · V3.0`.
- Brand width is bounded.
- Top tabs own remaining flex width and use hidden-scrollbar horizontal overflow instead of overlapping.
- Tabs are explicitly vertically centered.
- Top actions remain isolated on the right.

No Travel graph, movement, Node State, or combat behavior was changed.
