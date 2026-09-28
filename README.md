# V3.0.66 — COLLAPSIBLE COMPANION TRAVEL SESSIONS

- Added a compact `SESSIONS` toggle to the GM Canvas Travel shortcut header.
- The large active-session and `NEW SESSION` cards start collapsed in the shortcut, freeing vertical room for Node context menus.
- The expanded/collapsed choice is saved locally and restored the next time Canvas Travel opens.
- Session cards remain unchanged in the main extension window; only the shortcut overlay receives this compact behavior.
- Toggling the Session strip safely dismisses any stale Node or board context menu before reflowing the map.
- Node and board context menus now measure their rendered height, stay inside the Travel workspace, and scroll internally only when the available height is too small.
- Built directly from V3.0.65.

# V3.0.65 — ROLL POPUP CLEARANCE + RELOCATED UNDO

- Companion Roll and Action flows now reserve the Initiative Tracker band instead of opening underneath it.
- Canvas Roll result modals temporarily hide the separate Initiative Tracker popover and restore it immediately when the result closes, avoiding Owlbear's cross-popover stacking conflict.
- On short viewports where both surfaces cannot remain readable, the tracker temporarily hides and returns automatically when the flow closes.
- Moved the GM `UNDO` control from the crowded left control grid to a dedicated bottom-right slot beside the Initiative queue.
- Reserved horizontal room for the new `UNDO` slot so it never covers combatant cards or their HP/MP/IP values.
- Rebalanced `START`, `NEXT`, `RESET`, and `HIDE` into two equal-width rows after moving `UNDO`.
- Built directly from V3.0.64.

# V3.0.64 — ZERO POWER CLEAN DIVIDER

- Restored the complete V3.0.62 Zero Power Cut-in layout and behavior without selectable frame styles.
- Moved the Zero Power slash below both the portrait and copy layers, so it can no longer pass over the GIF, character art, or details.
- Changed the Zero Power slash from a thick white streak to a narrow gold accent while preserving the original entrance timing.
- Skill Cut-ins and other V3.0.62 systems are unchanged.
- Built directly from V3.0.62.

# V3.0.62 — RAPID CLOCK INPUT STABILITY

- Clock and Project controls now update optimistically on every press, so rapid `+ / −` input feels immediate.
- Hologram controls no longer discard clicks while an Owlbear metadata write is in progress.
- Companion Clock writes are serialized and rebased onto the latest Scene metadata, preventing older requests from overwriting newer progress.
- Incoming metadata echoes are held back while local Clock writes are pending, eliminating the visible bounce to an earlier value.
- Zero Power charge controls now coalesce rapid input into the latest value and protect that optimistic value until Owlbear confirms it.
- Zero Power activation flushes the final 6/6 value before release and then safely settles at 0/6.
- Built directly from V3.0.61.

# V3.0.61 — CENTERED ZERO POWER CUT-IN + TRACKER FIT

- Zero Power Release now opens as a large cinematic Cut-in at the center of the canvas, matching the presentation of a Boss Phase transition.
- The Cut-in displays the player, power name, Charge/Trigger, Ability/Effect, Description, and linked GIF/image in dedicated readable sections.
- Long Zero Power details are preserved and can be scrolled inside the Cut-in instead of being clipped after five lines.
- Reflowed GM Initiative controls into two compact rows and increased the expanded tracker safety height so `RESET`, `HIDE`, and conditional `END TURN` remain inside the frame.
- Kept HP, MP, and IP cards compact while preserving their complete numeric values.
- Built directly from V3.0.60.

# V3.0.60 — ZERO POWER RELEASE CUT-IN + HUD EDGE FIXES

- Moved the Zero Power charge badge inward and tightened its label so `0/6`, `FULL`, and `ZERO POWER` remain fully visible without enlarging the shortcut footprint.
- Adjusted Initiative card height, bottom padding, and resource value columns so the IP row and value no longer clip while remaining compact.
- Added owner-only `ACTIVATE` controls to Zero Power in both the main Player Sheet and the shortcut popover.
- `ACTIVATE` unlocks at 6/6, broadcasts a dedicated gold Zero Power Cut-in with the entered name, ability, description, and linked GIF/image, then resets charge to 0/6.
- Zero Power Cut-ins stay visible until closed with their own close button.
- Built directly from V3.0.59.

# V3.0.59 — ZERO POWER + COMPACT COMBAT HUD

- Added a fully manual six-step Zero Power system to every Player Sheet, including custom name, charge condition, ability/effect, description, and linked GIF/image preview.
- Added a dedicated movable Zero Power shortcut that always shows the local player's `0/6` charge and changes to `FULL` when ready.
- The Zero Power shortcut lists all available party sheets like Dominion; everyone can inspect another player's power, while charge controls remain owner-only.
- Reduced pinned Clock/Project hologram width, height, dial, artwork, text, and controls while keeping Description-linked GIFs visible.
- Reduced Initiative Tracker card height and compacted HP, MP, and IP labels, bars, and values to preserve more canvas space.
- Existing sheets migrate safely to the new Zero Power data without changing their other content.
- Built directly from V3.0.58.

# V3.0.58 — CLOCK MILESTONE HOLOGRAM + GIF

- Pinned Scene Clock and Project holograms now display the first `.gif` URL found in their Description, using the same Description-link convention as Actions.
- The raw GIF URL is removed from the hologram's readable detail text while the animation remains visible beside the Clock dial.
- Increasing a pinned Clock from the main window, Companion Clock shortcut, or hologram controls triggers a lightweight holographic wave on that Clock for every player.
- Completing a pinned Clock or Project opens a synchronized `CLOCK COMPLETE` banner at the center of every player's canvas, including its name and GIF.
- Decreasing progress never plays the milestone effect; lowering a completed Clock and filling it again correctly allows the completion banner to replay.
- Added GIF preview directly below the Description editor in the Companion Clock shortcut.
- Reduced Motion disables wave/impact movement while preserving all milestone information.
- Built directly from V3.0.57.

# V3.0.57 — TEN-COLOR CUT-IN FOR ALL ACTIONS + ARCANA

- Added a per-entry 10-color Cut-in palette: Violet, Cyan, Blue, Green, Lime, Gold, Orange, Red, Pink, and White.
- Skill Cut-in is now available on every Player Action mode and category, including NO ROLL, Guard, and Cover Ally.
- Arcana entries now have their own Skill Cut-in switch and color palette.
- Action and Arcana cards show the selected Cut-in color in their badge.
- Non-roll Action and Arcana Cut-ins remain open beside their matching result card and close with it.
- Main window, Companion shortcuts, and Token Action HUD pass the selected color through the same Cut-in pipeline.
- Existing Actions and Arcana default safely to the original Violet style.
- Built directly from V3.0.56.

# V3.0.56 — DOMINION NEXT PHASE + PERSISTENT CUT-IN

- Added `NEXT PHASE` to the GM-only Dominion Monster Sheet shortcut, including current-to-next phase labels and a final-phase state.
- Changing phase from Dominion recalculates phase HP/MP caps, preserves damaged values safely, and broadcasts the existing Boss Phase Transition to the room.
- Removed the 1.2-second roll delay from Skill Cut-in Actions.
- Skill Cut-in now opens immediately in its bottom-right popover and remains visible until that local player closes or replaces the matching Roll popup.
- Cut-in entrance animation is shorter and no longer runs continuous speed-line animation, reducing visual stutter.
- Built directly from V3.0.55.

# V3.0.55 — MONSTER EDITOR RECOVERY FIX

- Fixed `displayArt is not defined` crashing the main-window Monster Library editor.
- Restored both NEW MONSTER creation and editing existing Monster templates.
- Monster header artwork and the SHEET portrait now resolve from the selected template Phase inside their own render scopes.
- Rechecked SHEET, ACTIONS, SPECIAL RULE, and Phase-tab rendering paths.
- Built directly from V3.0.54.

# V3.0.54 — BOTTOM-RIGHT SKILL CUT-IN WINDOW

- Skill Cut-in no longer renders inside or replaces the main Action/roll-result overlay.
- It now opens as a compact independent canvas popover pinned to the bottom-right corner.
- The roll result continues in the existing main/Companion window after the Cut-in sequence.
- Main sheet, Companion shortcut, Token Action HUD, and remote room viewers share the same placement.
- Built directly from V3.0.53.

# V3.0.53 — BOSS PHASE TRANSITION / SKILL CUT-IN

- Boss phase changes now play a synchronized three-second cinematic transition using the active phase Portrait, phase label, and old-to-new form names.
- Player ROLL Actions now have a per-Action `SKILL CUT-IN` switch beside `FRENZY`.
- Enabled Actions show a `CUT-IN` badge and play the Player Portrait/action-name animation before revealing the roll result.
- Cut-ins work from the main sheet, Companion Action shortcut, and Token Action HUD; cut-ins and phase transitions also use the Owlbear canvas modal fallback when the main Action window is closed.
- Reduced-motion preferences disable moving/glitch layers while keeping the information visible.
- Built directly from V3.0.52.

# V3.0.52 — UNDO / END TURN / YOU'RE NEXT

- Added a one-step `UNDO` for the GM. It restores only the most recent successful `NEXT` transition and cannot jump behind the initial combat state.
- Added `END TURN` for the Player whose character currently owns the turn. Requests are validated against Player ID, active key, and round before the GM tracker advances.
- Added a pulsing `YOU'RE NEXT` card state and a one-time Owlbear notification for the upcoming Player.
- Enlarged `NEXT` across the full GM control pad width while keeping `START / UNDO / RESET / HIDE` separated.
- Built directly from V3.0.51.

# V3.0.51 — INITIATIVE TRACKER CONTROLS + PLAYER IP

- Removed the compact helper text beneath `ROLL INITIATIVE`.
- Enlarged and rearranged GM `START / NEXT / RESET / HIDE` controls into a two-column pad.
- Player Initiative cards now show live HP, MP, and IP bars; monster cards remain HP and MP only.
- Built directly from V3.0.50.

# V3.0.15 — COMPANION POPOVER SHORTCUTS

- Added Settings → COMPANION POPOVERS with nine draggable, browser-persisted shortcut popovers.
- Shortcuts: Class, Equipment, Spheres, Items, Bond, Arcana, Actions, Study / Hinder, Travel.
- Each shortcut is a separate Owlbear popover, leaving the empty space between buttons as the real map canvas for token selection and dragging.
- Added **↺ ตำแหน่ง** to restore default shortcut positions.
- Shortcut menus are read/use focused and do not expose sheet editing controls.
- Built directly from V3.0.13.

# V3.0.13 — ADMIN PLAYER TRAVEL GROUP

Base: v3.0.8 stable. Rebuilds GM-started A/B player selection and linked-player-token movement without using v3.0.9–v3.0.11 as code bases.

# V3.0.8 — INVOKE SYSTEM + GROUP CHECK RECHECK

- Rechecked V3.0.6 against the Fabula Ultima Group Check rules and hardened the new GM GROUP CHECK flow.
- A Group Check now requires a Leader plus at least one online Supporter; a leader-only Group Check can no longer start.
- Highest Bond bonus is available only when at least one Support Check succeeded and is frozen once the Final Check is sent.
- Late/duplicate Support results are ignored after the support phase closes.
- GM revalidates received Support dice/result data against the active session instead of trusting stale result flags.
- Final results are accepted only from the selected Leader while the session is waiting for the Final Check.
- Final Check has a submitted guard so rapid double-clicks cannot produce duplicate final rolls/results.
- JavaScript syntax, manifest/version consistency, local HTML asset references, duplicate function names, and ZIP integrity were checked before packaging.

# V3.0.6 — GM START GROUP CHECK

- Added GM TOOLS > GROUP CHECK.
- GM chooses check name, attributes, common modifier, final DL, Leader, and online Supporters.
- Supporters receive an interactive DL 10 Support Check prompt. Each success grants +1.
- Critical/Fumble on Support Checks are automatic success/failure and are explicitly marked as no-Opportunity support results.
- GM confirms the single highest Bond strength (0–3) among successful Supporters, then sends the Final Check to the Leader.
- Leader rolls the Final Check with common modifier + Support bonus + highest Bond; the result is broadcast through the normal roll pipeline and stored in Combat History.
- Pending prompts survive the action window being closed: background stores the request and opens Fabula for the participant.

# V3.0.5 — Study / Hinder Target Selector Hotfix

- Fixed TARGET MONSTER dropdown in the STUDY & HINDER tab not actually changing the active target.
- Root cause: `data-hinder-target` is a boolean data attribute, so `dataset.hinderTarget` is an empty string and the old truthy check skipped every change event.
- Target changes now resolve through the canonical Scene Monster instance resolver before re-rendering.
- `NO TARGET · STUDY CHECK ONLY` remains supported.
- Built directly from V3.0.3.

# V3.0.3 — RESTRICTED STUDY ROLL HOTFIX

- Fixed the Player Monster HINDER / STUDY HUD `ROLL STUDY` button appearing usable while being silently disabled.
- Study now resolves the current Player sheet through direct metadata and legacy/offline `ownerId` registry records.
- The Study button is always an active button and gives immediate local roll feedback before IPC/broadcast delivery.
- If no persisted Player sheet can be recovered, Study remains usable with a clearly reported transient d8 fallback instead of doing nothing.
- HINDER / STUDY target resolution from V3.0.2 is preserved.

# V3.0.2 — STUDY / HINDER TARGET RESOLUTION

- Fixes Study and Hinder target identity across every current entry point.
- Monster Scene Instance IDs are canonical strings after normalization.
- Study/Hinder comparisons no longer fail when legacy/imported IDs are numeric while UI/data attributes are strings.
- Main Study/Hinder tab, GM Quick Target, Hinder status writes, Study auto-apply, and restricted Monster HUD now resolve the same Scene instance.
- Restricted Monster HUD pins both linked Token ID and Scene Monster ID; Study payload also carries the linked Token ID as a fallback identity.
- Built directly from V3.0.1, which was built from the user-supplied V3.0 archive.

# v3.0 — Header Reset

- Display branding is now `LYNX EDITION · V3.0.1`.
- Removed long build suffixes such as `TRAVEL PERFORMANCE` from the top bar.
- Fixed top navigation pressure/overlap by constraining brand width and giving tabs a safe horizontal scroll fallback.
- Base feature set remains the v2.163.10 Travel Performance build.

# v2.163.10 Travel Performance Pass

Performance-only follow-up to v2.163.9. Travel rules/data stay unchanged.

- Pan / wheel zoom / node dragging are frame-throttled.
- Expensive neon shadows, SVG drop-shadows, pulse animation and grid overlay are temporarily disabled only while the board is moving, then restored automatically.
- Dragged connection-line updates use cached node positions instead of repeated full-array searches.
- MAP image discovery is de-duplicated, cached longer, and no longer forces a full Travel render when nothing changed.
- Self-echo `travel-sync` no longer causes a duplicate graph rebuild after a GM save.
- Finished movement-marker FX are removed directly instead of triggering another full Travel render.
- Background Travel sync coalesces generic Owlbear item-change bursts while keeping Travel metadata changes fast.

# v2.163.9 Travel Inspector Cleanup

- Travel GM sidebar is now a context inspector: **MAP / NODES / TOOLS / ⚙**.
- **NODE EDITOR + NODE STATES are unified**. The background already linked to a Node is its automatic **DEFAULT state**; add only alternate versions.
- Selected Node editor is compact with collapsible Detail / Unlock Rule / Token Template / Advanced sections.
- Node search/filter list and cleaner tool grouping reduce sidebar clutter without changing Travel data behavior.

# v2.163.8 Token Action HUD — SPECIAL RULE POPUP HOTFIX

- Fixed Monster SPECIAL RULE hover popup on the Main Canvas HUD.
- The preview engine already supported Special Rules; the missing CSS hover selector prevented it from becoming visible.
- Hovering a Special Rule now opens the same side popup used by Action / Item / Arcana, including image/GIF URLs and full rule details.
- GM-only Special Rule privacy behavior is unchanged.
- Built only on the v2.162 → v2.163.x branch.

# v2.163.7 Token Action HUD — MONSTER HP / MP / ULTIMA POINT

- Monster Token HUD resources are now HP / MP / UP only.
- IP / FP removed from Monster HUD and Monster HUD cost prompt.
- UP supports relative (`+/-`) and direct value edits.
- Player resources are unchanged.

# v2.163.6 Token Action HUD — MONSTER SPECIAL RULE TAB

- Monster HUD: ACTION / SPECIAL RULE / ROLL.
- SPECIAL RULE remains GM-only and is loaded from the private monster-rule store, not public Scene metadata.
- Hover a Special Rule to open the same side preview used by Action/Item/Arcana.
- Player HUD unchanged.

# v2.163.5 Token Action HUD — MONSTER SHEET PARITY

Built on the v2.162 → v2.163.x line only.

- Monster HUD now follows the Monster Sheet model instead of the Player HUD layout.
- Monster resources show HP / MP / IP / FP together, plus UP when Villain Type grants UP.
- Monster SETUP edits current-phase Normal Level, Desired Level, Rank, Species, Initiative, HP/MP Mod, Attributes, DEF/M.DEF Mod and Affinities.
- Status, Status Immunity and Temp Modifiers remain shared across Monster phases.
- Rank / Level / MIG / WLP / HP-MP Mod edits recalculate automatic HP/MP caps using the same formulas as the Monster Sheet.
- Villain Type enforces UP max (None 0 / Minor 5 / Major 10 / Supreme 15).
- Monster ITEM and ARCANA tabs are removed because Monster Sheets do not contain those Player collections.
- Monster action costs may include UP.

# v2.163.4 Token Action HUD — MAIN CANVAS + RELIABLE LOCAL RESULT IPC

- Token Action HUD is now a dedicated Owlbear **main-interface popover**, not part of the Fabula extension window.
- The background runtime watches the local selection, so selecting a controllable LinkStat token can open the HUD even while the Fabula action window is collapsed/closed.
- Actor stays pinned while later map selections can be used as targets.
- ACTION: roll/use prepared actions, pay costs, and reorder actions.
- Hover an Action to show its image/GIF, formula, cost, target/type, and description in a separate preview card.
- ITEM: send/use inventory cards without opening the Sheet.
- ARCANA: access and send Arcana cards directly from the Token HUD.
- Resource command fields accept `+10`, `-5`, or an absolute value such as `20`.
- STATS beside DEF/M.DEF opens Base Attributes, Status, Temp Modifiers, and Defense Mod editing without opening the Sheet.
- ROLL: quick and manual Checks using the pinned actor's current Sheet.
- Player controls own linked token only; GM can control linked Player/Ally/Monster tokens.
- Close suppresses immediate reopen for the same unchanged selection; selecting another linked token can open it again.

## v2.161 — Travel Node States
- Each Travel Node can store multiple visual States such as BEFORE DESTRUCTION / AFTER DESTRUCTION while remaining the same graph Node.
- GM can capture a selected MAP image as a new State, rename it, swap its source Background, set an optional State preview, activate it, or delete it.
- Right-clicking a Node gives the GM a quick State switcher.
- Switching State updates the active MAIN / A / B Travel Blank immediately without changing links, discovery, locks, Unlock Rules, or Node Token Templates.
- Deleted source images remain usable through the saved per-State image snapshot.
- Existing single-background Nodes remain fully backward compatible through DEFAULT mode.


## v2.153
- Added a dedicated **TOKEN LINK** image field to Inventory Items, Spheres, and Arcana cards.
- TOKEN LINK now controls the large card artwork without requiring an image URL inside DETAILS / GIF LINK.
- Existing cards remain backward compatible: when TOKEN LINK is empty, the board still falls back to an image/GIF URL found in the old detail field.

# LYNX // FABULA UNIFIED v2.127


## v2.127 Travel crossfade viewport anchor hotfix
- Travel fade no longer uses MAIN / A / B Blank item bounds.
- Each client computes the visible Owlbear viewport in scene coordinates and places a large local MAP-layer fade there.
- Blank position, scale, native image resolution, and grid.offset corrections can no longer shift the fade to a different place.
- A 2.6x viewport overscan prevents edges appearing during a quick pan/zoom while fading.
- Character-layer tokens remain visible above the MAP-layer fade.

Travel hotfix: per-room Unlock Rules. Each Node stores its own unlock rule keyed by mapId + nodeId. Duplicate Node starts with an empty rule and unlocked state.

# v2.112 — Travel Movement / Blank Sync Hotfix

- Fixed player one-step Node movement after Travel Groups / explorer markers.
- Manual player markers now follow accepted group movement instead of visually staying on the old Node.
- GM background worker serializes Travel Blank updates and applies the new Node background before broadcasting the accepted movement state.
- Right-clicking the same visited Node again now shows **REMOVE I'M HERE** and removes that player marker.
- Presence removal remains GM-authoritative and room-shared.


## v2.125 Travel Blank anchor fix
- Keeps each MAIN/A/B Blank at its established canvas alignment when linked image resolutions differ.
- Scales Owlbear image grid.offset together with native width/height so the local image origin does not drift.
- Existing v2.124 displays with stale offsets are detected and repaired automatically on the next Travel sync.


## v2.126 Travel feel FX
- Player/Ally explorer portraits glide from Node A to Node B for ~440ms instead of snapping.
- Group A/B motions remain independent when the party is split.
- A local-only MAP-layer fade veil softens each Travel Blank image swap without touching Character tokens or writing animation frames to room metadata.
- Shared background replacement is held until the fade reaches its midpoint, then the new background is revealed as the marker arrives.


## v2.142 Node DETAIL GM-only
- Player hover preview no longer renders Node DETAIL.
- GM hover preview still shows DETAIL for both revealed and hidden Nodes.

## v2.143 High-visibility Travel Nodes
- Travel Node borders are much thicker and use stronger contrast against map artwork.
- Normal, reachable, current, locked, GM-hidden, selected, and multi-selected states now have distinct high-visibility rings/glows.
- Selected Node uses a thick yellow focus ring; multi-selection uses a thick cyan ring.
- Visual-only change: Node hitboxes, world positions, travel rules, lock/reveal rules, and shared state are unchanged.


## v2.144 Ultra-visible Reachable Nodes
- Nodes the active explorer can move to now use a thick neon-green/lime frame.
- Reachable Nodes get a strong double glow and a slow pulse so they remain obvious over busy map art.
- Current stays white/cyan; Locked stays red. Locked-but-adjacent Nodes do not receive the green move-ready frame.
- Visual-only change; travel adjacency and movement rules are unchanged.


## v2.145 Ultra-visible Travel Connection Lines
- Connection lines are now dramatically thicker and brighter so the node graph remains readable over busy maps.
- Normal edges are cyan 5px; reachable routes are neon-green 9px; locked routes are red dashed 8px.
- Strong glow and dark separation keep edges visible while zoomed out.
- Visual-only change; graph/travel logic is unchanged.


## v2.146 Travel Move Approval Mode

- GM toggle requires approval before every player Node move.
- Requests persist in Scene metadata and show APPROVE / DENY confirmation to GM.
- Player remains at the current Node until approval; stale/locked/non-adjacent requests are rejected.
## v2.147 Reachable Node Names
- Players can see the real name of an undiscovered OPEN Node when it is directly reachable from their current Node.
- Undiscovered LOCKED Nodes remain anonymous and show only `🔒 LOCKED`.
- For an undiscovered cross-map exit, only the reachable Node name is revealed; the destination Map name stays hidden until discovered.
- This is display-only and does not mark the Node or Map as discovered.



## v2.149
- Rebuilt from the last known-good v2.147 package while restoring the v2.148 explored/total counter.
- Right-click GM Shop GENERATE to set a persistent maximum random item price; 0/blank disables the limit.


## v2.152

- Monster SEND TO ENEMY / SEND TO ALLY now creates the Scene instance and automatically spawns a CHARACTER token at Default View.
- The new token is linked to that exact monster instance immediately, reusing the existing linked-token HUD/stat synchronization.
- TOKEN ART is preferred; the current Phase PORTRAIT is used as fallback for older monster templates.
- If neither TOKEN ART nor PORTRAIT exists, the monster is still added to Scene and the GM receives a clear warning instead of creating a broken token.

## v2.151
- Rebuilt the complete 2,063-item SELLABLE SHOP list instead of deleting duplicate items.
- Redesigned all 1,221 formerly duplicated entries into mechanically distinct variants.
- Price-aware balancing: higher-price duplicates gain a benefit/stat upgrade; lower-price duplicates gain a drawback; equal-price duplicates become sidegrades.
- Armor and Shield variants remain Stat-based (DEF / M.DEF / INIT + drawbacks) rather than receiving hidden positive effects.
- Validation result: 2,063 sellable items, 2,063 distinct mechanical signatures, 0 duplicate groups.
- TRADE-OFF ROLL stock remains untouched.
- Audit: `SHOP_UNIQUE_VARIANTS_AUDIT_v2.151.md`.


## v2.154
- BOND cards now support a dedicated TOKEN LINK for card art, matching Items / Spheres / Arcana.


## v2.155
- Corrected CARD TOKEN LINK semantics for Items, Spheres, Arcana, and Bonds.
- LINK TOKEN now links to an existing selected Owlbear IMAGE token instead of accepting an image URL.
- Cards store the linked token id and a fallback art snapshot; live token image changes refresh card art automatically.
- Added RELINK SELECTED TOKEN and UNLINK controls.
- Existing v2.153/v2.154 URL card art remains as a legacy fallback until a real token is linked/unlinked.


## v2.156
- Core player-sheet sync parity fix between app.js and background.js.
- Background now preserves linkedTokenId, linkedTokenArt and tokenLink on Inventory, Spheres, Bonds and Arcana.
- Background remote edits now support reorder-path, link-card-token and unlink-card-token.
- Card creation and Shop purchase paths initialize the same token-link fields as the foreground app.


## v2.157
- Roll page now places MANUAL CHECK and LATEST RESULT at the very top of the page.
- Suggested checks remain below the priority controls; TRADE-OFF ROLL remains below the main check tools.
- Roll calculation and event logic are unchanged.


## v2.159
- Fixed GM Roll CHARACTER selector: `data-roll-actor` is now detected by attribute presence instead of a truthy empty dataset value.
- GM-selected Player/Monster Sheet now remains the active Roll actor for MANUAL CHECK and Suggested Checks.
- Player ownership lock remains unchanged: Players can roll only their own Sheet.

## v2.158
- Removed TRADE-OFF ROLL from the Roll page.
- CHARACTER now controls the Sheet used by Manual Check and Suggested Checks.
- GM can roll using any available Player/Monster Sheet.
- Players are hard-locked to their own Sheet in both UI and roll resolution logic.

## v2.163.3
- Fixed Main Canvas Token Action HUD ROLL / USE result routing.
- HUD-generated Roll/Share events now show in the normal Fabula window when it is open.
- If the Fabula window is closed, the same result is shown on the main Owlbear canvas through the existing cinematic alert renderer.
- Added hover popup previews for Item and Arcana cards, matching Action hover previews.


## v2.163.4
- Fixes Token Action HUD ROLL / USE result delivery.
- Same-player HUD results now use same-origin BroadcastChannel IPC between token-action-hud, app and background instead of depending on Owlbear self-broadcast routing.
- Owlbear broadcast is used for REMOTE room members only for roll/share results.
- If the Fabula action window is open, it receives the classic popup/feed/latest-result path.
- If the action window is closed, background opens the cinematic result on the main Owlbear canvas.
- HUD shows immediate execution/result feedback.


## V3.0.1 — Player Monster Click
- Built directly from the user-provided V3.0 archive.
- When no HUD is open, Player selecting a linked Monster opens a restricted HINDER / STUDY HUD.
- GM selecting a Monster still opens the full Monster Action HUD.
- Existing Actor PIN behavior is preserved so selecting a Monster as an Action target does not replace an already-open character HUD.
