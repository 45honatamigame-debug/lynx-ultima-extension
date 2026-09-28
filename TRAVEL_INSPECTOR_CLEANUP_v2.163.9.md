# Travel Inspector Cleanup · v2.163.9

- Rebuilt the GM Travel right sidebar as a context inspector with MAP / NODES / TOOLS / SETTINGS tabs.
- NODE EDITOR and NODE STATES are now one unified workflow.
- A Node's background already linked in Node Editor is automatically the DEFAULT State. You never need to link it again just to start using Node States.
- Alternate States only store alternate backgrounds / previews; DEFAULT continues to use the original Node background and snapshot fallback.
- NODES adds compact search/filter/list controls and only shows the selected Node's editor.
- DETAIL, UNLOCK RULE, TOKEN TEMPLATE and ADVANCED are collapsible to reduce clutter.
- MAP owns Travel Blank setup; TOOLS owns Link Mode / GM Walk / Move Approval / multi-select; SETTINGS owns session administration.
- No Travel graph, movement, discovery, lock, background snapshot, split-party, or token-template data schema was removed.
