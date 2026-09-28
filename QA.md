# v2.96 regression check — DM Token Frame

- [ ] GM TOOLS > TOKEN FRAME is visible to GM only.
- [ ] START TOKEN FRAME TOOL activates pointer/crosshair mode.
- [ ] Clicking CHARACTER image creates one attached `token-frame.png` PROP behind it.
- [ ] Clicking the same token again replaces the old frame rather than duplicating it.
- [ ] Moving/scaling/rotating/deleting the Character carries the frame with it.
- [ ] Clicking non-Character items does not create a frame.
- [ ] REMOVE FRAME · SELECTED TOKEN deletes only that token's frame.
- [ ] Player/Ally NO TURN, Token HUD, Scene Spawn and GM Shop still work.

# v2.95 regression check — Player NO TURN

- Player card shows NO TURN / JOIN TURN to GM.
- NO TURN player is absent from initiativeCombatants().
- Current-turn player toggled NO TURN advances to next valid combatant.
- Player resources/status/token controls remain available.
- Ally NO TURN and Token HUD Study/Debuff behavior remain unchanged.

# v2.94 regression check — Ally NO TURN
- Ally Scene cards: GM sees NO TURN; toggled card shows NO TURN badge and JOIN TURN.
- NO TURN Ally must not appear in initiative strip or initiativeCombatants().
- NO TURN Ally remains in Scene and resource/status/token controls remain usable.
- Toggling the current Ally to NO TURN must advance to a remaining combatant or stop combat if none remain.

# v2.93 regression check — Token HUD Debuffs Always Visible

- Study 0 + no Debuff: NAME only (or NAME · CRISIS).
- Study 0 + Debuff: NAME (or NAME · CRISIS) plus active Debuff chips.
- `[NORMAL]` never renders.
- Study 0 still exposes no HP/MP/DEF/M.DEF values.
- Study 7/10/13 unlock logic remains unchanged.

# v2.92 regression check — Token HUD Study Privacy

- Study 0 linked Monster/NPC token HUD shows only the monster name.
- If that Study 0 monster enters Crisis, the HUD becomes `NAME · CRISIS` and still reveals no HP/MP/DEF/M.DEF.
- Empty status state does not render `[NORMAL]` anywhere on the linked-token HUD.
- Manual status chips render only when the HUD has passed Study 0; Scene/Hinder status visibility is otherwise unchanged.
- Study 7/10 player visibility continues to reveal resources/defenses using the existing thresholds.

# Fabula v1.37 QA

### Monster derived defense
- Empty DEF MOD: Monster DEF equals its current DEX die size.
- Empty M.DEF MOD: Monster M.DEF equals its current INS die size.
- `+2` / `-1` modify the derived value; `12` overrides it.
- Apply Slow/Enraged/Dazed or TEMP Attribute steps and confirm DEF/M.DEF show the before → after value.
- Confirm Monster Library, Scene Monster Sheet, Scene card, SEND COMBAT, and Study/Codex use the derived values.

### Persistent player sheets
- Open a character while its owner is online, then have the owner leave the Owlbear room.
- Confirm the character remains in Scene Characters with `OFFLINE SHEET`.
- Edit HP, Attributes, Actions, Inventory, etc. while the owner is away and confirm edits persist after refresh.
- Rejoin as the owner and confirm the offline edits are restored to the owner's live Player Metadata.
- Delete a character while its owner is offline and confirm it does not resurrect when the owner rejoins.

### HINDER
- Open any Player Sheet → HINDER.
- Select an Enemy or Ally Monster from Scene.
- Click each debuff and confirm the button changes immediately, then the Monster Scene status synchronizes for all clients.
- Click an active debuff again to remove it.
- Confirm the HINDER target summary immediately shows active status plus updated DEX / INS / DEF / M.DEF.
- Confirm Slow/Dazed/etc. also alter the Monster's current dice and derived DEF/M.DEF.
- Confirm HINDER participates in draggable Player Sheet tab order and Monster tabs remain non-draggable.


## v1.38 regression check

- Player sees monster abnormal STATUS on Scene cards even when Study is still 0.
- Other hidden info (rank/species/open sheet and guarded stats) still respects Study rules.


## v1.39 regression check

- Superseded by v2.92: Study 0 linked monster HUD is name-only (no ??? resource placeholders).
- At Study 7+, player monster HUD shows HP MAX / MP MAX while UP remains hidden.
- Superseded by v2.92 for Study 0: token HUD is name-only; abnormal statuses remain visible in Scene/Hinder per their own rules.


## v1.40 regression check

- Superseded by v2.92 for token HUD: before Study, Scene/Hinder keep their visibility rules but linked-token HUD is name-only.
- Study 0 still hides HP / MP / UP.
- Study 7+ shows HP current/max and MP current/max; UP remains ??? for players.
- Moving either a Clock or Project segment plays the ominous tick locally and on other room clients (popover or background).


## v1.41 regression check

- In Hinder, players can always see monster STATUS.
- In Hinder, DEX / INS / DEF / M.DEF are hidden as ??? until Study 10+.
- GM still sees full monster stats in Hinder.


## v1.42 responsiveness / audio regression check

- Shared-sheet button edits render optimistically before Owlbear network sync finishes.
- Sheet / Scene / Clock / Project saves use a short 55 ms debounce instead of 180 ms.
- Linked HUD refresh uses 45 ms debounce instead of 120 ms.
- When the action popover is open, background audio does not duplicate roll/share/chat/HP sounds already handled by the app.
- Hinder and Spawn each produce only one local sound per click.
- Sound-test action produces a single sound.


## v1.43 regression check

- Linked player/monster HUD labels render in compact form.
- Font size is reduced to 12 with smaller padding and pointer.
- Long names are truncated with an ellipsis.
- Monster study visibility rules for HP/MP/UP still apply.


## v1.44 regression check

- HUD line 1 shows full name with no truncation.
- HUD line 2 shows [HP] [MP] [UP/IP] [DEF.] [M.DEF].
- HUD status line shows bracketed active STATUS values only; v2.92 removes the empty [NORMAL] line.
- Monster Study gating still hides HP/MP until 7 and DEF/M.DEF until 10 for players.


## v1.45 regression check

- Monster HUD line 2 contains HP, MP, DEF, M.DEF and no UP.
- REFRESH CODEX removes orphaned Codex records but preserves records whose template ID or name still exists.
- Suggested Roll situations display in Thai.


## v1.46 regression check

- Open a Player Sheet → STUDY & HINDER and confirm Study Check shows INS + INS + editable MOD.
- Roll Study and confirm both dice use the character's current INS die (including status/temp-step changes).
- Confirm total <7 suggests no unlock, 7–9 suggests Study 7, 10–12 suggests Study 10, and 13+ suggests Study 13.
- On GM, APPLY RESULT upgrades the target but never downgrades an already higher Study tier.
- Manual GM Study tier buttons can still override/lock the tier.
- Confirm other clients receive the Study roll result and GM sees it in STUDY & HINDER.
- Confirm Scene monster GM QUICK CONTROL changes HP/MP, Status, Study, target, HUD, HP 0, and Remove without opening the full Monster Sheet.


## v1.47 regression check

- Target a monster and roll Study: tier auto-applies from INS + INS + MOD.
- Select NO TARGET: Study rolls but does not modify any monster.
- Study popup contains no damage comparison or damage value.
- Manual GM Study tier buttons remain available only as override controls.


## v1.48 regression check

- Monster Template and active Monster Sheet use TYPE instead of IDENTITY.
- None Villain = UP 0/0 and no UP resource panel.
- Minor Villain = UP max 5; Major = 10; Supreme = 15.
- Changing TYPE immediately clamps current UP and refreshes the resource panel.


## v1.49 regression check

- Long SEND Details are fully visible without scrolling the Details box.
- Long Action Details are fully visible before roll results.
- Equipment Details/Sphere effects do not use internal scrollbars.
- Popup refits after GIF/image load and browser resize.


## v1.50 regression check

- Enter a different Study GIF URL on two character sheets and confirm each Study popup uses the correct character-specific GIF.
- Study GIF persists through player metadata and offline Scene sheet persistence.
- Study without a GIF still renders normally.


## v1.51 regression check

- HP <= 50% shows CRISIS automatically; healing above 50% removes it.
- CRISIS is never written into the manual statuses object.
- Chat has ROOM CHAT and COMBAT HISTORY subtabs.
- GM can clear Combat History; history persists in Scene metadata and syncs to other clients.
- HP/MP/IP/UP changes, status, Study, rolls, initiative, and tracker progress create history entries.


## v1.52 regression check

- Monster Template supports BASE + at most PHASE 1–5.
- Switching a Template Phase returns to SHEET and shows that Phase's profile/combat/attributes/affinities; ACTIONS also belong to the selected Phase.
- Scene GM can switch active Phase from the Phase strip or Quick Control.
- Active Phase changes Scene card name/portrait/stats, HUD DEF/M.DEF/name, initiative/roll actor data, and actions without resetting HP/MP/UP/status/Study/token.
- Removing a Phase safely returns/renumbers selection and never creates more than five additional phases.
- Study 0→7 reveals Rank/Species/HP/MP in the discovery popup.
- Study crossing 10 reveals Traits/Attributes/DEF/M.DEF/Affinities; crossing 13 reveals Actions.
- Repeating a Study result that does not increase the tier displays NO NEW DISCOVERY.
- Study popup remains damage-free.


## v1.53 regression check

- BASE and PHASE 1–5 retain independent Study tiers.
- Switching to a never-studied phase shows Study 0 and hides gated data. Switching back restores that form’s previous Study tier.
- Remote player Study auto-apply updates the phase that was actually rolled against.
- Normal Clock and Project controls render as circular 1–12 segment faces and clicking a wedge sets progress to that segment.


## v1.54 regression check

- GM SEND TO ENEMY / SEND TO ALLY persists the new monster in Scene even while Combat History is enabled.
- Unsaved GM Scene monster changes are protected from unrelated metadata callbacks.
- Codex phase tabs show independent Study values for BASE and each Phase; unstudied Forms are LOCKED.


## v1.56 regression check

- Clicking a Clock/Project segment fills or un-fills immediately without repeated clicks.
- Combat History metadata cannot overwrite a pending shared Clock/Project edit.
- Scene trackers still synchronize to other clients after the optimistic update.


## v1.57 regression check

- GM REFRESH CODEX broadcasts current Template Library snapshots to every player.
- Existing Codex U.E./NPC grouping is preserved per player.
- BASE and PHASE Study tiers are preserved independently.
- Missing templates are removed from every player Codex.


## v1.58 regression check

- With GM Template Library empty, REFRESH CODEX clears orphaned player Codex entries even if the player popover is closed.
- Matching Codex entries preserve player U.E./NPC grouping and BASE/PHASE Study tiers.
- A Clock at 1/N can be clicked on segment 1 again to become 0/N.
- A Clock at K/N can click segment K to decrement to K-1.


## v1.59 regression check

- Every Situation row includes a numeric MOD input.
- Suggested rolls use the MOD from the clicked row.
- Changing Roll Character does not reset entered Situation MOD values.


## v1.60 regression check

- Rank recalculates effective HP/MP from Base Max without compounding.
- Elite has 2 initiative slots; Champion X has X slots.
- Scene/Codex use active-Phase rank-derived maxima.
- Spawned monsters start at full effective HP/MP.


## v1.61 regression check

- Rank dropdown contains Soldier, Elite, Champion 1 through Champion 6.
- Elite: HP x2, MP x1, Initiative +2, 2 turns.
- Champion 6: HP x6, MP x2, Initiative +6, 6 turns.
- Rank changes do not multiply base HP/MP repeatedly.
- Monster initiative rolls include the rank Initiative bonus.


## v1.62 regression check
- [ ] Level 5, MIG d8, WLP d8 Soldier with 0 MOD shows HP 50 / MP 45.
- [ ] Elite applies HP ×2 but not MP ×2.
- [ ] Champion 6 applies HP ×6 / MP ×2 and keeps 6 turns.
- [ ] HP MOD and MP MOD recalculate immediately after committing the input.
- [ ] Phase-specific Level/MIG/WLP/MOD produce phase-specific Max HP/MP while current resources remain shared.
- [ ] Monster action at level 20 adds AUTO ACC +2 and AUTO DAMAGE +5.
- [ ] Level 40 gives AUTO ACC +4 / AUTO DAMAGE +10; level 60 gives +6 / +15.
- [ ] Player actions do not receive NPC auto Accuracy/Damage bonuses.


## v1.63 regression check
- Existing v1.62 monster: Normal Level migrates to current Level and CHECK/DMG adjustment is 0.
- Normal 5 -> Desired 20: Checks +2, Damage +5.
- Normal 20 -> Desired 10: Checks -1, Damage -5.
- Normal 40 -> Desired 60: Checks +2, Damage +5.
- Normal 60 -> Desired 5: Checks -6, Damage -15.
- Action HR remains manual; level Damage adjustment is added separately to final damage.
- Desired Level still recalculates HP/MP; Normal Level does not alter HP/MP.


## v1.64 regression check
- Drag each removable Character Sheet board inside the panel to confirm reordering still works.
- Drag each supported board outside the extension window and release; it should delete immediately and show QUICK DELETE.
- Drag outside, re-enter the extension, then release over blank space; it must not delete.
- Inputs/buttons/selects remain interactive and must not start a card drag.
- Nav tabs, Codex cards, Monster templates, and DELETE CHARACTER do not use drag-out quick delete.


### v1.65
- Removed non-functional EDIT buttons from collection/action boards. Click the card surface to open or close its editor; SEND remains an independent action.


## v1.66 regression check

- Equipment center name is readable and no longer sinks into the center image.
- Equipment SEND popup uses the same below-core label treatment.


## v1.67 regression check

- Drag `⋮⋮` on Character Sheet tabs to reorder them.
- Drag `⋮⋮` on top navigation tabs to reorder them.
- Inputs/buttons inside removable cards still do not accidentally start drag/delete gestures.


## v1.68 regression check

- GM can change monster HP / MP / UP directly from the Scene card.
- Players only see `YOUR CHARACTER` highlighting on their own character card.
- Whole nav/sheet tab surface reorders on drag while normal click still switches tabs.
- Board quick-delete and card drag sorting remain functional.


## v1.72 regression check

- No COMPACT / COMFORT density controls are shown.
- UI uses the stable wide layout from v1.68.
- AUTO / PC / NOTEBOOK sizing still works.
- Monster quick resource adjustment, own-character highlight, whole-tab drag, and board drag-delete remain available.


## v1.73 regression check

- Scene roster resizes narrow and uses one card per row.
- Opening a Scene character/monster sheet expands to normal editor width, and SCENE back returns narrow.
- WIDE VIEW / SIDEBAR toggles resize without changing data.
- Roll resizes to medium width; other tabs retain normal editor sizing.


## v1.74 regression check
- Top bar contains only play navigation and LIVE/PREVIEW status.
- SETTINGS exposes AUTO/PC/NOTEBOOK, DEFAULT/PHANTOM, Scene SIDEBAR/WIDE, reset tab order, and sound test.
- Roll at ~570–680px never renders as three squeezed columns.
- Main and Character Sheet tab dragging still works.


## v1.75 regression check

- Open a studied monster in Codex: the active Codex group uses full width and the other group moves below.
- Verify long stats, affinities and action cards do not clip on the right edge.


## v1.76 regression check

- Player and monster Action Type selectors expose Melee Attack / Range Attack / Spell / Other Action.
- Legacy Normal Attack entries load as Melee Attack without losing action data.


## v1.78 regression check

- Class / Build header name saves per character.
- TOTAL LV updates from Class card LEVEL inputs only.
- Class Skill LEVEL inputs never affect TOTAL LV.
- v1.77 Action Art controls are absent.


## v1.79 regression check

- With the Fabula action window open, local and remote Roll/SEND events appear on the main Owlbear canvas, not inside the action window.
- While an alert is visible, map pan/token interaction and Fabula action-window controls remain clickable.
- No dark full-screen backdrop is visible; alerts auto-dismiss after several seconds and a newer alert replaces the old one.


## v1.80 regression check

- Roll/Study alerts never create a full-screen iframe/backdrop.
- Owlbear remains interactive behind alerts because disablePointerEvents stays enabled.
- Alert images are reduced/faded and the HUD auto-closes.


## v1.81 popup regression
- Roll/Study popup uses original readable font/dice/media/detail sizing.
- No fullScreen modal is used; map and Fabula remain interactive behind the popup.
- Auto-fit only compacts if the full content genuinely exceeds the popup viewport.


## v1.82 regression check

- Popup remains on screen indefinitely until clicked.
- Clicking anywhere on the popup closes it.
- Modal is not fullscreen and does not dim the whole canvas.


## v1.83 regression check

- Action Roll popup shows a visible HR chip.
- Damage formula shows HR + Damage Bonus (+ Level adjustment) before VU/NORMAL/RES values.
- Check-only Roll popup shows HR with Check Total.


## v1.84 regression check

- CHARACTERS → ROLL → CODEX keeps the same action-window dimensions.
- ROLL-specific internal layout remains available without a dedicated narrow popover size.


## v1.85 regression check

- Repeatedly click HP minus/plus quickly: value must move continuously without reverting between clicks.
- MP/IP/FP quick adjust uses the same stale-write protection.
- Remote edits with genuinely newer sheet metadata still update normally.


## v1.86 regression check

- In Scene, press START: the roster should scroll so the active card is visible and centered.
- Press NEXT TURN repeatedly: the roster should smoothly follow the new current-turn card.
- Non-Scene tabs should not auto-scroll.


## v1.87 regression check

- Trigger a roll/share popup: it should appear inside the Fabula window again.
- No Owlbear full-screen/modal popup should open on the main canvas.
- Clicking the popup close button or backdrop should dismiss the in-window popup.


## v1.88 regression check

- Open an Action card, enter a long Details text, then collapse it: the summary card should show the full text with no internal scroll area.
- Type into Action / collection editor fields and collapse the editor immediately: the latest text should remain saved after re-opening or switching tabs.


## v1.89 regression check

- Set a character Initiative GIF in SHEET → Combat Parameters, roll that player initiative, and verify the popup uses the GIF.
- SHEET sections are read-only summaries until clicked; closing them saves pending changes.
- CLASS cards show full Free Benefit and all Class Skill details while closed; click to edit. Quirks and Build name behave the same way.


## v1.90 regression check

- SHEET live combat controls must be editable without opening a details card.
- HP/MP/IP controls remain directly usable in the portrait column.
- Profile, progression, Initiative GIF, base attributes, CLASS and QUIRK remain read-first/click-to-edit.


## v1.91 regression check

- SHEET should show LEVEL, XP, and ZENIT inputs without opening an editor.
- INITIATIVE GIF should still require clicking its read card to edit.


## v1.92 regression check

- Open SCENE with many entries and scroll downward.
- The Scene header and round/turn controls should remain fixed at the top of the Scene panel.
- Only the roster list below should scroll.


## v1.93 regression check

- Open SHEET and verify Character Profile shows only one card.
- Press EDIT: the same card should switch to editable inputs in place.
- Press DONE: pending changes should save and the card should return to read mode without a duplicated section.


## v1.94 regression check

- On CLASS, BUILD / CLASS / QUIRK should each show a single card.
- Press EDIT: that same card becomes editable instead of opening a second block below.
- Press DONE immediately after typing: changes should remain saved and full Details should be visible again.


## v1.95 regression check

- Every Class card should show SEND in both read and edit modes.
- BASE ATTRIBUTES should be editable without pressing EDIT.
- No visible ALWAYS EDITABLE label should remain in the app UI.


## v1.96 regression check

- Open CLASS with a class that has multiple Class Skills.
- Without pressing EDIT, each Class Skill should show its own SEND button.
- Pressing SEND should share only that Class Skill.


## v1.97 regression check

- As GM, each monster Scene card should show REMOVE in its initiative bar.
- As a player, the direct REMOVE button should not appear.
- Pressing REMOVE should use the existing confirmation before deleting the Scene instance.


## v1.98 regression check

- Open INITIATIVE GIF and switch to edit mode: only the URL field and helper text should be visible, with no duplicate preview image.
- Close edit mode: the GIF should display in a large full-view area inside the read card.


## v1.99 regression check

- Open a Monster Action editor and verify the TARGET · RANDOM CHARACTER toggle is no longer shown.
- Other Action fields and rolling behavior should remain intact.


## v2.00 regression check

- Open a Monster ACTIONS tab: TARGET · RANDOM CHARACTER should appear beside + NEW ACTION.
- Toggle OFF and roll any Monster Action: it should not auto-pick a random character. Toggle ON and verify random targeting resumes.
- Switching monster phases should preserve each form's own Random Target setting.


## v2.01 regression check

- Open a monster SPECIAL RULE tab: each rule should show full Details in Read Mode.
- Press EDIT: fields should replace the read content inside the same card.
- Press DONE: edits should remain saved and the same card should return to Read Mode.


## v2.02 regression check

- Edit a Player or Monster Action and enter COST such as MP 10 or IP 1.
- Close the editor: COST should remain visible on the Action card.
- SEND the Action: COST should appear in the shared Action details.


## v2.03 regression check

- Verify Action Type badge colors for all four types.
- Player roll cards should show one compact formula such as DEX d10 + INS d8 +3 → HR +10.
- Monster cards should show final level-adjusted Accuracy and damage bonuses in the same compact formula.
- NO ROLL actions should show only NO ROLL.


## v2.04 regression check

- Player and Monster Action editors show COST, TARGET, and TYPE fields.
- TARGET / TYPE values appear on closed Action cards only when populated.
- SEND includes COST, TARGET, TYPE, roll data, and description.


## v2.05 regression check

- In Monster Actions, press RANDOM TARGET and enter 2 or more. ROLL TARGETS should return unique names only.
- Candidate pool must include currently online player sheets and Scene Allies, and exclude offline player sheets.
- Rolling a Monster Action after selecting targets should show those targets in the roll popup/history.


## v2.06 regression check

- Select exactly one Owlbear TEXT item and link HP; it should immediately become current/max HP.
- Change HP rapidly and verify the linked Text follows the final value. Repeat for MP, IP, FP, DEF and M.DEF.
- Close the Fabula action window, then change the sheet from another connected client/GM and verify linked Text continues syncing.
- UNLINK should stop future sheet-driven changes without deleting the Text item.


## v2.07 regression check

- Player SHEET > Portrait edit should show PORTRAIT, TOKEN ART, then HP/MP/IP/FP/DEF/M.DEF Canvas Text Links.
- Player LINK SELECTED TOKEN / UNLINK TOKEN controls should no longer be visible.
- Monster sheet must still show LINK SELECTED TOKEN / UNLINK TOKEN as before.


## v2.08 regression check

- In Player Sheet LIVE COMBAT, FP and Initiative values should be large, centered, and fill the available box height.


## v2.09 regression check

- Top-left brand should display FABULA with LYNX EDITION · v2.09 underneath.


## v2.10 regression check

- Open Equipment with a Sphere Set. The equipment name should appear in the top-left corner of the orbit panel and no longer overlap Sphere 3 or the center image.


## v2.11 regression check

- Player Sheet order should be LIVE COMBAT → BASE ATTRIBUTES → STATUS & TEMP MODIFIERS → ELEMENT AFFINITY.


## v2.12 regression check

- Reinstall/reload the extension and verify the Owlbear toolbar displays the Lynx icon instead of a blank white square.
- Context menu entries should use the same icon.


## v2.13 regression check

- Reload the extension/room and verify the top-left Owlbear Action Bar shows a Lynx head silhouette instead of a solid white square.
- The action should still open the Fabula popover normally.


## v2.14 regression check

- Drag a removable card outside the extension window and release.
- A confirmation dialog should appear.
- OK deletes the card. Cancel keeps it.


## v2.15 regression check

- Open ARCANA and create/edit an Arcana card.
- Confirm there is a COST field in the editor.
- Confirm COST appears in the collapsed/read card.
- Confirm SEND includes the COST line.


## v2.16 regression check

- Roll a damaging Player Action while enemy monsters are in Scene. On the GM client, the popup should show enemy monster rows only.
- Click the same monster three times / + three times: it should show ×3 and total damage.
- Switch VU/NORMAL/RES independently per monster and APPLY. Monster HP should decrease accordingly.
- Player characters and ally-faction Scene monsters must not appear in this distributor.


## v2.17 regression check

- Roll a player action with damage while enemy monsters are in Scene.
- The popup should open wider and show APPLY DAMAGE in a side panel.
- The GM should be able to click + / - / mode / APPLY more easily.
- With normal room size, the popup should usually fit without scrolling.


## v2.18 regression check

- Open a player action roll popup and confirm the extension menus/tabs remain clickable outside the popup.
- In APPLY DAMAGE, confirm the new DMG MOD stepper updates VU/NORMAL/RES and totals.
- Confirm APPLY / APPLY ALL reduce HP using the adjusted values and log the MOD in Combat History.


## v2.19 regression check

- Roll a damaging player Action as GM.
- Confirm +/- HITS, direct HITS input, DMG MOD input, VU/NORMAL/RES, APPLY, and APPLY ALL are clickable/editable.
- Confirm clicking outside the popup can still operate the extension UI.


## v2.20 regression check

- Open a Player Action damage popup as GM.
- Click monster name / + / - and verify Hits changes.
- Click VU, NORMAL and RES and verify the selected mode changes.
- Type directly into Hits and DMG MOD.
- Click APPLY and APPLY ALL and verify enemy HP is reduced.
- Confirm menus outside the popup remain usable because the action-roll backdrop is pointer-through.


## v2.21 regression check

- Roll initiative as Player A and confirm Player B sees the same initiative/check popup style, not the action damage popup.
- Confirm initiative popups do not show VU / NORMAL / RES or APPLY DAMAGE.
- Confirm true attack rolls still show the full action damage popup.


## v2.22 regression check

- Roll Initiative, Manual Check, and Suggested Check from one player.
- On both the roller and other players, all three should use the large dice + CHECK TOTAL popup family.
- Check rolls must not show ACCURACY/HR/VU/NORMAL/RES/APPLY DAMAGE controls.
- True damaging Actions should still use the Action Damage popup.


## v2.23 regression check

- Open Monster SPECIAL RULE and verify there is one EDIT button in the section header.
- Press EDIT once: all Special Rules should become editable.
- Press DONE once: all pending rule edits should save and every card should return to read mode.


## v2.24 regression check

- Open CLASS / BUILD and press EDIT. Confirm BUILD NAME and LORE can be edited in the same card.
- Press DONE and confirm Lore is shown in full in Read Mode and remains saved after switching tabs/reloading.


## v2.26 regression check

- Link a styled Owlbear Text item to HP or another sheet value.
- Change the linked value repeatedly. The visible number should update while the Text size/style remains unchanged.
- Verify both plain Text and Rich Text items preserve their formatting.


## v2.26 regression check
- Linked player token HUD shows separate colored chips for HP, MP, DEF, M.DEF, FP, and IP.
- Linked monster HUD shows separate colored chips for HP, MP, DEF, M.DEF, and UP when applicable.
- CRISIS must appear as a red status chip when current HP is at or below half max HP.
- Status chips should use distinct colors: SLOW, ENRAGED, DAZED, WEAK, POISONED, SHAKEN, CRISIS, NORMAL.


## v2.27 regression check
- Linked-token HUD should stay centered and compact directly under the token.
- HP/MP/DEF/M.DEF/IP/FP/UP keep their colors.
- Status colors remain distinct and CRISIS remains red, but status chips should no longer spread far apart.


## v2.28 regression check

- Linked player and monster HUDs must render as one compact attached label instead of many separate chips.
- Verify three-line structure: name, resources/defenses, statuses.
- Verify CRISIS/status text still appears correctly.


## v2.29 regression check

- Link a token HUD, then zoom the Owlbear scene in and out. The HUD should remain approximately the same small on-screen size.
- The HUD must remain one label rather than split into multiple colored labels.
- With many statuses, status text should wrap into compact rows instead of making an extremely wide frame.


## v2.30 regression check

- Monster BASE tab must display PHASE 1. First added form must display PHASE 2 and the fifth added form PHASE 6.
- Monster token HUD on Phase 1 must not append PHASE 1 to the name. Phase 2+ must append PHASE N.
- CRISIS must appear after the name, or after PHASE N when Phase 2+. It must not also appear in the lower status row.
- Lower HP from above 50% to 50% or below for a player and a monster; each transition should play the Crisis sound. Recover above 50% and enter Crisis again to verify it can trigger again.


## v2.31 regression check

- At normal play zoom, linked token HUD should stay small and readable.
- Zoom far out: HUD should shrink instead of remaining a large fixed-screen block over tiny tokens.
- Zoom in/out around normal combat scale: HUD should remain stable without sudden large jumps.


## v2.33 regression check

- Linked Token HUD should use the original size: font 12, padding 4, pointer 4/6, y offset +64.
- No custom minViewScale/maxViewScale override should remain.
- Monster Phase 2+ and Crisis suffixes must still appear in the HUD name.


## v2.34 regression check
- Select a linked enemy token, roll a Player Action, and verify GM Apply Damage seeds that monster at ×1.
- Change HP/MP/IP/FP, statuses, tracker progress, or Apply Damage; `UNDO LAST` should restore the prior value once.
- NEXT PHASE should advance one phase and show a form-change popup/sound.
- Starting/advancing initiative should move a `◆ TURN` label to the linked active token.
- Monster HP 0 should mark its Scene card/HUD DEFEATED, remove it from initiative ordering, and RESTORE should return it to its remembered pre-defeat HP.


## v2.35 regression check

- Reduce a Scene monster to 0 HP. Its Scene card must remain visible and show DEFEATED.
- The defeated monster must not appear in initiativeCombatants / future turn cycling.
- It must not display CURRENT TURN after reaching 0 HP.
- RESTORE and REMOVE must remain available on its Scene card.


## v2.36 regression check
- A linked player token with no debuffs and not on turn should show no Fabula HUD.
- On that player's turn, the token should show only ◆ TURN.
- Active SLOW/ENRAGED/DAZED/WEAK/POISONED/SHAKEN and CRISIS should appear below the player token.
- Player HP/MP/IP/DEF/M.DEF/name must not appear on the token HUD.
- Monster token HUD must remain unchanged.


## v2.37 regression check
- CODEX has no fixed U.E./NPC columns.
- Any player can create, rename, reorder, and delete folders; changes appear for everyone through Scene metadata.
- Deleting a folder moves its cards to UNFILED.
- Drag cards between folders and reorder them.
- Study 7/10/13 learned by one player must be visible to all players and persist in the shared Codex.


## v2.38 regression check

- Cards inside each Codex folder should display A → Z by monster name regardless of previous card order.
- Click the folder arrow or folder title to collapse/expand it.
- Collapsing a folder on one client must not collapse it for other players.
- Shared Study and card folder assignment must remain room-shared.


## v2.39 regression check
- Scroll down inside a Monster Action editor and type in Name, Cost, Target, Type, Accuracy Mod, HR Mod, and Description.
- Wait for Scene save/metadata sync; the workspace must remain at the same scroll position.
- Changing Roll Mode may rerender the action layout but must preserve scroll/focus.


## v2.40 regression check
- Monster STATUS section shows IMMUNITY checkboxes for all six statuses.
- Immunity is shared across phases.
- Turning immunity on clears that active status.
- Sheet / GM Quick Control / Hinder cannot apply an immune status.


## v2.41 regression check
- Mark a monster immune to SLOW, then apply SLOW from a player HINDER panel. The button should briefly show ACTIVE/APPLIED, then clear after about 0.4 seconds with NO EFFECT.
- Confirm the monster status remains false in shared Scene data and its DEX/DEF do not remain reduced.
- Confirm GM Quick Control still refuses an immune status immediately.


## v2.42 regression check

- HINDER an immune status. It should appear briefly, disappear after about 0.4 seconds, show NO EFFECT, and play the distinct IMMUNE warning sound at removal time.


## v2.43 regression check
- Open a player Sheet portrait editor. Confirm PORTRAIT, TOKEN ART, LINK SELECTED TOKEN, UNLINK TOKEN, and Canvas Text Links are all present.
- Link a selected Owlbear token and confirm player TURN / Debuff / Crisis HUD can appear on that token.
- Confirm Monster token-link UI is unchanged.


## v2.45 regression check
- Toggle player debuffs repeatedly; the token label should update in place without disappearing between changes.
- All active player debuffs (and CRISIS if applicable) should stay on one line.
- TURN marker should remain a separate label above the token.
- Monster HUD should still render normally.


## v2.46 regression check
- Create a Prepared Action with both Target and Type filled in, then ROLL it.
- Confirm TARGET and TYPE appear directly below the popup title before description, formulas, or damage cards.
- Confirm the values are visible on other clients receiving the same roll.
- If a concrete/random combat target is resolved, confirm that target list still appears separately and damage affinity behavior is unchanged.
- ROLL an Action with only Target or only Type; the single metadata row should span the available width without breaking the popup.


## v2.47 regression check
- Monster Actions header shows `TARGET`, `RANDOM TARGET`, and `+ NEW ACTION`.
- TARGET opens a manual multi-select list of online player sheets and active Player Allies.
- Selected targets appear as removable chips and are passed to monster Rolls.
- RANDOM TARGET still supports count-based selection and replaces the same target selection.
- Offline players and defeated/removed Allies cannot remain selected.


## v2.48 regression check
- TARGET picker stays open while selecting/unselecting multiple names.
- Multiple PCs + Allies can coexist in the selected target list.
- ROLL receives every selected targetRef.
- SELECT ALL / CLEAR / DONE work without changing Random Target behavior.


## v2.49 regression check
- Change Player and Monster affinities through every value and confirm the dropdown updates color immediately.
- VULNERABILITY is red; RESISTANCE is gold/yellow; IMMUNITY is violet; ABSORPTION is green; NORMAL remains neutral.
- Confirm Study/read-only affinity pills use the same colors.
- Reload/reopen sheets and confirm saved affinity values retain the correct color.


## v2.50 regression check
- [ ] With GM/admin online and an active character sheet, Monster ACTIONS > TARGET lists the GM character alongside online player sheets and player Allies.
- [ ] GM character can be selected together with multiple other targets.
- [ ] RANDOM TARGET can choose the GM character.
- [ ] SELECT ALL includes the GM character.
- [ ] Deleted/offline character sheets remain excluded according to existing target-pool rules.


## v2.51 regression check

1. Player Action SEND opens PAY COST with HP/MP/IP/FP; confirm deducts chosen resources then sends the card.
2. Player Action ROLL opens PAY COST; confirm deducts resources then rolls and preserves current token auto-target behavior.
3. Class Skill SEND and Arcana SEND open PAY COST. Bonds and unrelated SEND buttons do not.
4. Action/Arcana configured Cost text is displayed as CARD COST but does not force a fixed payment amount.
5. Insufficient HP, MP, IP, or FP blocks the SEND/ROLL and keeps the prompt open with an error.
6. Entering all zeroes is valid and performs the original SEND/ROLL without resource changes.
7. Active Monster Action SEND/ROLL uses the monster's HP/MP plus custom IP/FP cost pools.
8. Monster template Action SEND/ROLL also opens PAY COST and persists template cost pools.
9. PAY COST closes correctly after confirmation; resource deduction is visible immediately and Combat History records the resource change/payment.
10. Existing Monster UP remains separate from IP and is not consumed by the new IP cost field.


## v2.52 audit / regression check

- PAY & SEND / PAY & ROLL buttons inside PAY COST must respond; CANCEL and the X button must also respond. Clicking inside the payment card must not dismiss it, while clicking the dark backdrop may close it.
- Local Player Action SEND/ROLL deducts HP/MP/IP/FP exactly once before the original action resolves.
- Class Skill SEND and Arcana SEND deduct exactly once; insufficient resources leave PAY COST open with an error.
- GM editing or paying from another online player's sheet must deduct on the owner's actual Owlbear metadata too (background edit handler supports pay-cost / restore-cost).
- Offline persisted player sheets must apply relative edits exactly once; no double deduction.
- Active Monster Action SEND/ROLL and Monster Template Action SEND/ROLL deduct from monster HP/MP/IP/FP.
- Legacy pre-schema-17 monster `ip` data migrates to UP only; it must not become the new Inventory Point cost pool. Schema-17+ monster IP remains the new cost pool.
- Existing UP stays independent from new IP.


## v2.53 Template Library folder regression
- Verify + FOLDER creates a folder.
- Verify rename/delete/collapse work and persist after reload.
- Verify deleting a folder moves templates to UNFILED.
- Verify template cards drag between folders and folder order can be dragged.
- Verify EDIT / SEND TO ENEMY / SEND TO ALLY / delete buttons still work inside draggable cards.


## v2.54 Duplicate / Folder Count regression
- [ ] `DUPLICATE` creates one independent monster template in the same folder.
- [ ] Duplicate naming increments without collisions: `Copy`, `Copy 2`, `Copy 3`.
- [ ] Editing/deleting the copy does not mutate/delete the source.
- [ ] Duplicate does not retain a linked scene token/template instance identity.
- [ ] Phase IDs are regenerated on duplicate.
- [ ] Every Template Library folder, including UNFILED, displays `(N)` and updates after duplicate/move/delete.

## v2.57 Player defeat-choice regression
- Verify HP transition `>0 -> 0` sets `defeatOutcome = pending` and remembers the pre-zero HP for RESTORE.
- Verify owner sees a mandatory SURRENDER / SACRIFICE popup; backdrop and generic close cannot dismiss it.
- Verify selecting SURRENDER or SACRIFICE persists the exact status and removes the character from Initiative.
- Verify defeated/pending players are excluded from monster TARGET, SELECT ALL, and RANDOM TARGET pools.
- Verify GM RESTORE returns HP to the remembered pre-zero value (fallback Max HP) and clears the defeat outcome.
- Verify a remote GM edit that drops an online/offline player to 0 HP persists the pending state through the background worker.

## v2.57 regression repair
- Restored Study/Codex helper functions accidentally removed while adding Player Surrender/Sacrifice in v2.55.
- Verified definitions exist for: normalizedStudyTier, monsterTier, monsterMaxStudyTier, setMonsterStudyTierForPhase, studyAtLeast, maskedResource, maskedStat, maskedMaxResource.
- This specifically repairs Codex rendering, Monster Scene cards, Monster Sheet/Study visibility and masked monster data.
- Player Surrender/Sacrifice behavior remains enabled and does not intentionally disable Sheet or Codex navigation.


## v2.58 combat outcome sound regression
- Choose SURRENDER at 0 HP: hear the unique softer Surrender cue exactly once locally.
- Choose SACRIFICE at 0 HP: hear the unique, longest severe cue exactly once locally.
- Reduce an active Scene monster from HP > 0 to 0 through quick HP, KILL, applied damage, or HP cost: hear DEFEATED instead of only the generic HP-down cue.
- With a second client and Fabula open, verify the outcome broadcast plays the matching cue once.
- With the second client popover closed, verify background audio and notification still use the matching outcome cue.
- Restore a defeated player/monster and defeat them again to verify sounds can trigger again.


## v2.59 containment sound QA
- `soundscape.js` is imported by both `app.js` and `background.js`.
- Every sound kind used by the UI resolves to a designed cue or the message fallback.
- No square-wave/chiptune default sound path remains in app/background code.
- Background audio contexts auto-close after their cue to avoid leaking contexts while the popover is minimized.
- Sacrifice has the longest cue duration and highest-severity layered design.


## v2.60 audio latency / anti-stack QA

- [x] `soundscape.js` syntax passes Node check.
- [x] `app.js`, `background.js`, and `alert.js` syntax pass Node check.
- [x] HP up/down share a monophonic `resource` channel and use cue cooldowns.
- [x] Repeated cue requests while AudioContext is suspended are coalesced to the newest pending cue.
- [x] Background sounds reuse a persistent AudioContext rather than creating/closing one per event.
- [x] Procedural noise buffers are cached and reused.
- [x] Combat outcome cues interrupt lower-priority channels; Sacrifice has top priority.
- [x] Manifest and visible version updated to v2.60.


## v2.61 GM Tools / Broadcast QA
- [ ] In Owlbear, verify `GM TOOLS` is visible to GM and absent for PLAYER role.
- [ ] Verify `ALL PLAYERS` receives a broadcast but another GM does not.
- [ ] Verify multi-select targets only selected online players.
- [ ] Verify open Fabula panels render in-window broadcast overlay.
- [ ] Verify closed Fabula panels receive centered Owlbear modal from the background extension.
- [ ] Verify WARNING / OBJECTIVE / ANOMALY / PHASE visual styles and cue mappings.
- [ ] Verify PREVIEW does not send any room broadcast.


## v2.62 Scene Redesign QA
- Verify Player/Ally/Enemy columns render each entity once; Champion/Elite extra turns appear only in the Initiative Strip.
- Verify direct HP/MP/IP/FP fields use existing quick edit paths; monster UP remains available to GM.
- Verify Roll Init uses the existing DEX + INS formula and monster rank bonus.
- Verify DEF/M.DEF keep existing derived + mod calculations.
- Verify player HP 0 still opens Surrender/Sacrifice for the owner and leaves the card visible as defeated.
- Verify monster HP 0 still triggers Defeated audio/state and Restore.
- Verify Study 7/10/13 masking is unchanged for non-GM viewers.
- Verify Scene search/filter only changes presentation and never mutates metadata.


## v2.63 Scene Status / Readability QA
- Verify Scene portrait is visibly larger for Player, Ally, and Enemy cards without cropping the full portrait.
- Verify six active player debuffs render as STATUS 6 rather than six stacked chips.
- Open STATUS and verify BASE ATTRIBUTES and STATUS & TEMP MODIFIERS render and remain editable through the pre-existing shared player edit handlers.
- Verify GM monster STATUS panel can edit attributes/status/temp modifiers and non-GM viewers cannot bypass Study 10+ masking.
- Verify Crisis / Surrender / Sacrifice / Defeated indicators remain visible on the Scene card even when debuffs are collapsed into STATUS.
- Verify HP/MP/IP/FP/UP labels, MAX values, current inputs, Roll Init, DEF and M.DEF do not overlap at 900px popover width and Scene Sidebar mode.
- Verify opening/closing STATUS does not alter initiative, resource values, Scene filters, Codex Study tier, or GM Quick Control state.


## v2.65 Scene Card Click QA
- Verify no Scene player card shows `OPEN SHEET` or the dedicated `HP 0` shortcut.
- Verify no Scene monster card shows `OPEN SHEET`; GM `REMOVE` and GM Quick Control remain available.
- Verify clicking portrait/name/DEF/M.DEF/card background opens the correct Sheet.
- Verify clicking HP/MP/IP/FP inputs or +/- buttons changes resources without opening the Sheet.
- Verify Roll Init, Status, Next Phase, Restore, Remove, and GM Quick Control do not accidentally open the Sheet.
- Verify a player cannot open an unstudied locked monster by clicking its card.


## v2.66 FABULA AI regression checks
- CHAT retains ROOM CHAT and COMBAT HISTORY behavior.
- FABULA AI is a third CHAT sub-tab and does not appear under GM TOOLS.
- Book filters use original book names and remain local to the current client.
- Enter sends AI query; Shift+Enter inserts a newline.
- AI query does not broadcast to room chat or mutate Scene metadata.


## v2.67 FABULA AI page reader checks
- Citation buttons carry original book key and exact page number.
- Reader resolves pages only from the existing local 4-book index.
- Previous/next navigation respects each original book page count.
- Reader overlay uses existing overlay host and close behavior; no Room Chat / Combat History state is changed.
- Original book titles are preserved unchanged.


## v2.68 Chat / FABULA AI regression checks
- Main CHAT nav resets `runtime.chatPanel` to `chat`.
- ROOM CHAT / COMBAT HISTORY / FABULA AI subtabs remain independently clickable.
- Completing a FABULA AI search after navigating away does not call a cross-view render.
- FABULA AI page reader is cleared on main navigation.
- Existing Room Chat send/clear and Combat History logic are unchanged.


## v2.70 GM Shop checks
- Verify GM-only SHOP tab renders without changing Broadcast.
- Verify stock count = 999 and unique name/description/benefits/drawbacks.
- Verify generator creates non-duplicate picks and history can reload.
- Verify Active Shop add/remove/clear persists locally.


## v2.72 CHAT regression checks
- COMBAT HISTORY renderer no longer references an undefined undo helper.
- All three CHAT subpanels render independently.
- Combat History state remains Scene-scoped and metadata writes are serialized per client.
- AI async render remains guarded by current view/subpanel.


## v2.73 GM Shop
- GM TOOLS > SHOP: Generator, Stock 999, Active Shop, History.
- Mix/Core-Based/Homebrew generation.
- Detail overlay for every item with add/remove Active Shop actions.
- Shop state remains GM-local in this version; no player shop broadcast/purchase workflow is enabled.


## v2.74 U.E. description cleanup
- Homebrew stock: 999 items.
- No `UE-###` identifiers remain in Homebrew descriptions.
- Description uniqueness remains 999/999.
- JavaScript syntax and ZIP integrity checked.

## v2.75 Scene Status Inspector
- Rapidly click the same player DEX/INS/MIG/WLP control several times; the panel must remain open and the button must not jump away.
- Rapidly toggle Status and TEMP +/-; values update immediately, then the Scene roster catches up after input settles.
- Test narrow and wide extension sizes; attribute/status/temp grids must remain inside the right-side panel with no horizontal overflow.
- Verify remote metadata echoes do not close/rebuild the panel while clicking.

## v2.76 GM Shop trade-off checks
- 999 rebalanced Homebrew + 999 TRADE-OFF items.
- No one-third-HP activation text remains.
- TRADE-OFF benefit and drawback dimensions are validated to never directly cancel each other.
- IDs, names, descriptions, benefits, and drawbacks are validated within each 999-item set.
- Flaw pricing is 25% below base price, rounded to nearest 50z.

## v2.143 Travel Node visibility checks
- Verify normal Nodes have a clearly visible thick outline on both bright and dark map backgrounds.
- Verify reachable Nodes are cyan, current Node is white/cyan, locked Nodes are red, and GM-hidden Nodes are amber dashed.
- Verify Direct Node selection has a thick yellow ring and marquee multi-selection has a thick cyan ring.
- Verify Node positions and pointer hit areas do not move when the thicker visual border is applied.


## v3.0.7 Group Check recheck
- Group Check requires one Leader and at least one online Supporter.
- Bond remains 0/disabled until at least one Support succeeds.
- Once Final is sent, Bond and Support-result state are frozen.
- Final button locks on first click; no duplicate Final roll/result.
- GM accepts Final result only from the selected Leader and recalculates the final outcome from the active session.
- JavaScript syntax / local asset references / ZIP integrity pass.


## v3.0.8 Invoke System
- [x] Trait Invoke uses 1 FP per reroll and can reroll left/right/both.
- [x] Trait Invoke is disabled on Fumble.
- [x] Bond Strength is normalized to 1–3 and Invoke Bond costs 1 FP once per Check.
- [x] Bond bonus changes Result only; damage/High Roll are not increased.
- [x] Invoke recalculates Critical/Fumble/Double and Study thresholds.
- [x] Invoke revisions replace the original roll in feed/history instead of duplicating it.
- [x] Group Check Final revisions are sent back to GM after Invoke.
- [x] Actor IDs are retained for Action, Manual, Suggested, Study, and Token HUD rolls.
- [x] JS syntax and manifest/package references rechecked after integration.
