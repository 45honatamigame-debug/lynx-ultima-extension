# v2.161 — Travel Node States

A single Travel Node may now hold multiple visual versions.

- Add a State from the currently selected Owlbear MAP image.
- Each State stores its own name, Background source, saved image snapshot, and optional preview URL.
- Set any State ACTIVE from the Node Editor or right-click Node menu.
- USE DEFAULT returns to the Node's original/default Background.
- State changes are room-shared and the background worker resolves the same active State as the main app.
- Node identity, position, connections, lock/reveal state, Unlock Rule, and embedded Token Templates are not duplicated or changed.
- Old Nodes with no `states` data continue to use their previous Background fields.
