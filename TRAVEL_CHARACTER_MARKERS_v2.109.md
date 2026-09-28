# Travel Character Markers — v2.109

- Player and GM characters can right-click a previously visited Travel Node and choose **I'M HERE · MOVE MY MARKER**.
- The marker uses the local Character Sheet name/portrait and is stored in room-shared Travel state.
- One character has one marker per active Travel Session; moving it removes that character from the previous Node automatically.
- Multiple characters can appear inside the same Node card.
- Unvisited Nodes cannot receive a character marker.
- Player marker changes are validated/persisted by the GM background worker to avoid shared-state collisions.
- This does not move the party Current Node or change the Background Blank.
