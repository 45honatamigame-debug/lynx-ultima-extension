import OBR, { buildLabel, buildShape, buildImage } from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
import { playStandaloneContainmentSound } from "./soundscape.js";

const NS = "com.lynx.fabula-unified";
const META_KEY = `${NS}/sheet`;
const SCENE_MONSTERS_KEY = `${NS}/scene-monsters-v1`;
const SCENE_COMBAT_KEY = `${NS}/scene-combat-v1`;
const SCENE_TRACKERS_KEY = `${NS}/scene-trackers-v1`;
const SCENE_INIT_TRACKER_UI_KEY = `${NS}/initiative-tracker-ui-v1`;
const SCENE_PLAYER_SHEETS_KEY = `${NS}/scene-player-sheets-v1`;
const SCENE_GUARD_COVER_KEY = `${NS}/guard-cover-v1`;
const GUARD_COVER_ITEM_META_KEY = `${NS}/guard-cover-item-v1`;
const SCENE_TRAVEL_KEY = `${NS}/travel-shared-v1`;
const SCENE_TRAVEL_APPROVAL_KEY = `${NS}/travel-move-approval-v1`;
const TRAVEL_FRAME_META_KEY = `${NS}/travel-map-frame-v1`;
const TRAVEL_DISPLAY_META_KEY = `${NS}/travel-display-slot-v2`;
const TRAVEL_EMBEDDED_TOKEN_META_KEY = `${NS}/travel-embedded-token-v1`;
const TRAVEL_BLANK_IMAGE_URL = new URL("./travel-blank.svg", import.meta.url).href;
const TRAVEL_MOVE_FX_MS = 440;
const HUD_KEY = `${NS}/hud-v2`;
const CHANNEL = `${NS}/events`;
const HUD_LOCAL_RESULT_KEY = `${NS}/token-action-hud-local-result-v1`;
const ALERT_KEY = `${NS}/cinematic-alert`;
const ALERT_MODAL_ID = `${NS}/cinematic-alert-modal`;
const ALERT_CONTROL_CHANNEL = `${NS}/cinematic-alert-control-v1`;
const SKILL_CUTIN_KEY = `${NS}/skill-cutin-v1`;
const SKILL_CUTIN_POPOVER_ID = `${NS}/skill-cutin-canvas-v1`;
const SKILL_CUTIN_CONTROL_CHANNEL = `${NS}/skill-cutin-control-v1`;
const GROUP_CHECK_PENDING_KEY = `${NS}/group-check-pending-v1`;
const TRAVEL_GROUP_PENDING_KEY = `${NS}/travel-group-pending-v1`;
const LOOT_PENDING_KEY = `${NS}/loot-offer-pending-v1`;
const LOOT_ACCEPTED_KEY = `${NS}/loot-offer-accepted-v1`;
const LOOT_MODAL_ID = `${NS}/loot-offer-modal-v1`;
const MAIN_TOKEN_HUD_POPOVER_ID = `${NS}/token-action-hud-main-v1`;
const PLAYER_TOKEN_QUICK_MENU_KEY = `${NS}/player-token-quick-menu-v1`;
const COMPANION_HUD_PREF_KEY = `${NS}/companion-hud-v1`;
const COMPANION_HUD_POSITION_SCHEMA = "stable-v1";
const COMPANION_HUD_POSITION_PATCH = "v3088-gm-row";
const COMPANION_HUD_CONTROL_CHANNEL = `${NS}/companion-hud-control-v1`;
const COMPANION_HUD_MENU_ID = `${NS}/companion-hud-menu-v1`;
const COMPANION_HUD_MAIN_MODAL_ID = `${NS}/companion-hud-main-modal-v1`;
const COMPANION_HUD_FLOW_ID = `${NS}/companion-hud-flow-v1`;
const COMPANION_HUD_TRACKER_ID = `${NS}/companion-initiative-tracker-v1`;
const COMPANION_HUD_TRAVEL_ID = `${NS}/companion-travel-overlay-v1`;
const TRAVEL_APPROVAL_POPOVER_ID = `${NS}/travel-approval-canvas-v1`;
const CLOCK_HOLOGRAM_POPOVER_ID = `${NS}/clock-hologram-canvas-v1`;
const CLOCK_MILESTONE_POPOVER_ID = `${NS}/clock-milestone-canvas-v1`;
const COMPANION_HUD_PENDING_ACTION_KEY = `${NS}/companion-hud-pending-main-action-v1`;
const COMPANION_HUD_COMMAND_PREFIX = `${NS}/companion-hud-command-v2:`;
const COMPANION_HUD_MAIN_NAV_KEY = `${NS}/companion-hud-main-nav-v1`;
const COMPANION_HUD_TRACKER_COLLAPSED_KEY = `${NS}/initiative-tracker-collapsed-local-v1`;
const COMPANION_HUD_TRACKER_LAYOUT_KEY = `${NS}/initiative-tracker-layout-local-v1`;
const COMPANION_HUD_TRACKER_POSITION_KEY = `${NS}/initiative-tracker-positions-local-v1`;
const COMPANION_HUD_TRACKER_PREVIEW_ID = `${NS}/initiative-tracker-drag-preview-v1`;
const COMPANION_HUD_BUTTONS = [
  { key: "clock", label: "CLOCK", width: 76, height: 72, tone: "system" },
  { key: "codex", label: "CODEX", width: 76, height: 72, tone: "system" },
  { key: "shop", label: "SHOP", width: 76, height: 72, tone: "system" },
  { key: "notes", label: "NOTES", width: 82, height: 72, tone: "system" },
  { key: "broadcast", label: "GM BROADCAST", width: 116, height: 72, tone: "danger", adminOnly: true },
  { key: "loot", label: "LOOT", width: 84, height: 72, tone: "danger", adminOnly: true },
  { key: "groupcheck", label: "GROUP CHECK", width: 112, height: 72, tone: "danger", adminOnly: true },
  { key: "roll", label: "ROLL", width: 84, height: 72, mainView: "roll" },
  { key: "settings", label: "SETTING", width: 88, height: 72, mainView: "settings" },
  { key: "vault", label: "VAULT", width: 84, height: 72, mainView: "vault" },
  { key: "class", label: "CLASS", width: 84, height: 72, mainSheetTab: "class" },
  { key: "equipment", label: "EQUIPMENT", width: 92, height: 72 },
  { key: "spheres", label: "SPHERES", width: 86, height: 72 },
  { key: "items", label: "ITEMS", width: 84, height: 72, mainSheetTab: "inventory" },
  { key: "bond", label: "BOND", width: 82, height: 72 },
  { key: "arcana", label: "ARCANA", width: 84, height: 72, mainSheetTab: "arcana" },
  { key: "actions", label: "ACTIONS", width: 86, height: 72, mainSheetTab: "actions" },
  { key: "zero", label: "ZERO POWER", width: 96, height: 82, tone: "zero" },
  { key: "studyhinder", label: "STUDY / HINDER", width: 132, height: 82 },
  { key: "travel", label: "TRAVEL", width: 132, height: 100 },
  { key: "status", label: "STATUS", width: 86, height: 72 },
  { key: "dominion", label: "DOMINION", width: 96, height: 78, tone: "danger", adminOnly: true }
];
const CODEX_KEY = `${NS}/codex-v1`;
const CODEX_DELETED_KEY = `${NS}/codex-deleted-v1`;
const TOKEN_FRAME_TOOL_ID = `${NS}/dm-token-frame-tool-v2`;
const TOKEN_FRAME_MODE_ID = `${NS}/dm-token-frame-mode-v2`;
const TOKEN_FRAME_ACTIVE_KEY = `${NS}/dm-token-frame-active-v2`;
const TOKEN_FRAME_META_KEY = `${NS}/dm-token-frame-item-v1`;
const DIE_STEPS = [6, 8, 10, 12];
const ATTRS = ["DEX", "INS", "MIG", "WLP"];
const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const sameId = (a, b) => String(a ?? "") === String(b ?? "");
const STATUS_NAMES = ["slow", "enraged", "dazed", "weak", "poisoned", "shaken"];
const STATUS_PENALTIES = {
  slow: { DEX: 1 }, enraged: { DEX: 1, INS: 1 }, dazed: { INS: 1 },
  weak: { MIG: 1 }, poisoned: { MIG: 1, WLP: 1 }, shaken: { WLP: 1 }
};
const ELEMENTS = ["physical", "air", "bolt", "dark", "earth", "fire", "ice", "light", "poison"];
let me = { id: "", name: "", role: "PLAYER" }, party = [], hudTimer;
let mainTokenHudOpen = false, mainTokenHudTokenId = "", mainTokenHudActorKind = "", mainTokenHudSelectionSig = "", mainTokenHudDismissedSig = "", mainTokenHudTimer = null;
let dmFrameToolRegistered = false, dmFrameSelectionBusy = false;
let guardCoverVisualTimer = null, guardCoverVisualSig = "", guardCoverSyncChain = Promise.resolve(), guardCoverLastTurnSig = "";
const crisisState = new Map();

const blankAction = () => ({ name: "New Action", mode: "ROLL", category: "MELEE ATTACK", element: "none", cost: "", target: "", actionTypeText: "", attr1: "DEX", attr2: "INS", mod: 0, damageHR: 0, note: "", frenzy: false, randomTarget: true });
const defaultSheet = (name = "NEW CHARACTER") => ({
  schema: 12, deleted: false, name, identity: "", theme: "", origin: "", portrait: "", tokenArt: null, studyGif: "", initiativeGif: "", classTitle: "", classLore: "", level: 5, xp: 0, zenit: 0, fp: 3,
  initiative: 0, defense: 8, magicDefense: 8, defenseMod: "", magicDefenseMod: "", hp: { current: 40, max: 40 }, mp: { current: 30, max: 30 }, ip: { current: 6, max: 6 },
  attributes: { DEX: 8, INS: 8, MIG: 8, WLP: 8 }, attributeBuffs: { DEX: 0, INS: 0, MIG: 0, WLP: 0 },
  statuses: Object.fromEntries(STATUS_NAMES.map(x => [x, false])), affinities: Object.fromEntries(ELEMENTS.map(x => [x, "NORMAL"])),
  classes: [], quirks: [], equipment: [], spheres: [], inventory: [], lists: { bonds: [], arcana: [] }, clocks: [], projects: [], actions: [], zeroPower: { name: "", trigger: "", effect: "", detail: "", current: 0, max: 6 }, defeatOutcome: "", defeatedRestoreHp: 0, linkedTokenId: "", showHud: true, canvasTextLinks: { hp: "", mp: "", ip: "", fp: "", defense: "", magicDefense: "" }, accent: "cyan", updatedAt: Date.now()
});
function normalize(raw) {
  if (raw?.deleted) return { ...defaultSheet(), deleted: true, updatedAt: raw.updatedAt || Date.now() };
  const d = defaultSheet(raw?.name || me.name), s = raw || {};
  const out = {
    ...d, ...s, deleted: false,
    hp: { ...d.hp, ...(s.hp || {}) }, mp: { ...d.mp, ...(s.mp || {}) }, ip: { ...d.ip, ...(s.ip || {}) },
    attributes: { ...d.attributes, ...(s.attributes || {}) }, attributeBuffs: { ...d.attributeBuffs, ...(s.attributeBuffs || {}) },
    statuses: { ...d.statuses, ...(s.statuses || {}) }, affinities: { ...d.affinities, ...(s.affinities || {}) },
    lists: { ...d.lists, ...(s.lists || {}) }, zeroPower: { ...d.zeroPower, ...(s.zeroPower || {}) }, canvasTextLinks: { ...d.canvasTextLinks, ...(s.canvasTextLinks || {}) }
  };
  out.classes = (Array.isArray(s.classes) ? s.classes : []).map(c => ({ ...c, classSkills: (Array.isArray(c.classSkills) ? c.classSkills : []).map(x => ({ ...x, level: Math.max(0, Number(x.level) || 1) })) }));
  out.quirks = Array.isArray(s.quirks) ? s.quirks : [];
  out.spheres = (Array.isArray(s.spheres) ? s.spheres : []).map(x => ({ id: x.id || makeId(), name: x.name || "Sphere", sphereType: x.sphereType ?? x.type ?? "", linkedTokenId: String(x.linkedTokenId || ""), linkedTokenArt: normalizeTokenArt(x.linkedTokenArt), tokenLink: String(x.tokenLink || ""), detail: x.detail || "" }));
  out.inventory = (Array.isArray(s.inventory) ? s.inventory : []).map(x => ({ id: x.id || makeId(), name: x.name || "Item", itemType: x.itemType ?? x.type ?? "", linkedTokenId: String(x.linkedTokenId || ""), linkedTokenArt: normalizeTokenArt(x.linkedTokenArt), tokenLink: String(x.tokenLink || ""), detail: x.detail || "", shopPurchaseId: String(x.shopPurchaseId || ""), shopStockId: String(x.shopStockId || ""), purchasePrice: Math.max(0, Number(x.purchasePrice) || 0) }));
  out.lists = {
    bonds: (Array.isArray(out.lists?.bonds) ? out.lists.bonds : []).map(x => ({ ...x, strength: clamp(Number(x?.strength) || 1, 1, 3), linkedTokenId: String(x?.linkedTokenId || ""), linkedTokenArt: normalizeTokenArt(x?.linkedTokenArt), tokenLink: String(x?.tokenLink || "") })),
    arcana: (Array.isArray(out.lists?.arcana) ? out.lists.arcana : []).map(x => ({ ...x, linkedTokenId: String(x?.linkedTokenId || ""), linkedTokenArt: normalizeTokenArt(x?.linkedTokenArt), tokenLink: String(x?.tokenLink || "") }))
  };
  const ids = new Set(out.spheres.map(x => x.id));
  out.equipment = (Array.isArray(s.equipment) ? s.equipment : []).map(e => ({ ...e, imageUrl: e.imageUrl || "", sphereIds: Array.from({ length: 4 }, (_, i) => ids.has(e.sphereIds?.[i]) ? e.sphereIds[i] : "") }));
  out.clocks = Array.isArray(s.clocks) ? s.clocks : [];
  out.projects = Array.isArray(s.projects) ? s.projects : [];
  out.actions = (Array.isArray(s.actions) ? s.actions : []).map(a => ({ ...blankAction(), ...a }));
  out.studyGif = String(s.studyGif || ""); out.initiativeGif = String(s.initiativeGif || ""); out.classTitle = String(s.classTitle || ""); out.classLore = String(s.classLore || "");
  out.defeatedRestoreHp = Math.max(0, Number(s.defeatedRestoreHp) || 0);
  out.defeatOutcome = ["pending","surrender","sacrifice"].includes(String(s.defeatOutcome || "").toLowerCase()) ? String(s.defeatOutcome).toLowerCase() : "";
  if ((Number(out.hp?.current) || 0) <= 0) {
    if (!out.defeatOutcome) out.defeatOutcome = "pending";
  } else {
    out.defeatOutcome = "";
    out.defeatedRestoreHp = 0;
  }
  out.zeroPower.max = 6; out.zeroPower.current = clamp(out.zeroPower.current, 0, 6); out.zeroPower.name = String(out.zeroPower.name || ""); out.zeroPower.trigger = String(out.zeroPower.trigger || ""); out.zeroPower.effect = String(out.zeroPower.effect || ""); out.zeroPower.detail = String(out.zeroPower.detail || "");
  out.schema = 12; return out;
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, Number(n) || 0)); }
function isPlayerDefeated(s) { return !!s && Number(s?.hp?.current) <= 0; }
function syncPlayerDefeatTransition(s, beforeHp = null) {
  if (!s?.hp) return;
  const afterHp = Number(s.hp.current) || 0;
  const before = beforeHp === null || beforeHp === undefined ? afterHp : Number(beforeHp) || 0;
  if (afterHp <= 0) {
    if (before > 0) {
      s.defeatedRestoreHp = before;
      s.defeatOutcome = "pending";
    } else if (!["pending","surrender","sacrifice"].includes(String(s.defeatOutcome || "").toLowerCase())) {
      s.defeatOutcome = "pending";
    }
  } else {
    s.defeatOutcome = "";
    s.defeatedRestoreHp = 0;
  }
}
function setByPath(obj, path, value) {
  const parts = path.split("."); let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { if (o[parts[i]] === undefined) o[parts[i]] = /^\d+$/.test(parts[i + 1]) ? [] : {}; o = o[parts[i]]; }
  o[parts.at(-1)] = value;
}
function moveItem(arr, from, to) {
  from = Number(from); to = Number(to); if (!Array.isArray(arr) || from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
  const [x] = arr.splice(from, 1); arr.splice(to, 0, x);
}
function getByPath(obj, path) { return String(path || "").split(".").filter(Boolean).reduce((o, k) => o?.[k], obj); }
function normalizeTokenArt(raw) {
  if (!raw) return null;
  const source = typeof raw === "string" ? { image: { url: raw } } : raw;
  const imageRaw = source.image || source;
  const url = String(imageRaw?.url || source.url || "").trim();
  if (!url) return null;
  const width = Math.max(1, Number(imageRaw?.width || source.width) || 300);
  const height = Math.max(1, Number(imageRaw?.height || source.height) || 300);
  const mime = String(imageRaw?.mime || source.mime || "image/png");
  const gridRaw = source.grid || {};
  const dpi = Math.max(1, Number(gridRaw.dpi) || Math.max(width, height));
  const offsetRaw = gridRaw.offset || { x: width / 2, y: height / 2 };
  const scaleRaw = source.scale || { x: 1, y: 1 };
  return {
    name: String(source.name || "TOKEN ART"),
    image: { url, width, height, mime },
    grid: { dpi, offset: { x: Number(offsetRaw?.x) || width / 2, y: Number(offsetRaw?.y) || height / 2 } },
    scale: { x: Number(scaleRaw?.x) || 1, y: Number(scaleRaw?.y) || 1 },
    rotation: Number(source.rotation) || 0
  };
}
function cardEntryByKind(sheet, kind, index) {
  if (!sheet) return null;
  const i = Number(index);
  if (kind === "sphere") return sheet.spheres?.[i] || null;
  if (kind === "inventory") return sheet.inventory?.[i] || null;
  if (kind === "arcana" || kind === "bonds") return sheet.lists?.[kind]?.[i] || null;
  return null;
}
function applyOp(s, op) {
  if (!s || !op) return;
  const defeatBeforeHp = Number(s?.hp?.current) || 0;
  if (op.kind === "set") setByPath(s, op.path, op.value);
  else if (op.kind === "adjust") {
    if (op.path === "fp") s.fp = Math.max(0, (Number(s.fp) || 0) + Number(op.delta || 0));
    else { const [key] = op.path.split("."); if (s[key]?.current !== undefined) s[key].current = clamp((Number(s[key].current) || 0) + Number(op.delta || 0), 0, Number(s[key].max) || 0); }
  }
  else if (op.kind === "pay-cost") {
    const c = op.costs || {};
    s.hp.current = clamp((Number(s.hp.current) || 0) - Math.max(0, Number(c.hp) || 0), 0, s.hp.max);
    s.mp.current = clamp((Number(s.mp.current) || 0) - Math.max(0, Number(c.mp) || 0), 0, s.mp.max);
    s.ip.current = clamp((Number(s.ip.current) || 0) - Math.max(0, Number(c.ip) || 0), 0, s.ip.max);
    s.fp = Math.max(0, (Number(s.fp) || 0) - Math.max(0, Number(c.fp) || 0));
  }
  else if (op.kind === "restore-cost") {
    const v = op.values || {};
    if (v.hp !== undefined) s.hp.current = clamp(v.hp, 0, s.hp.max);
    if (v.mp !== undefined) s.mp.current = clamp(v.mp, 0, s.mp.max);
    if (v.ip !== undefined) s.ip.current = clamp(v.ip, 0, s.ip.max);
    if (v.fp !== undefined) s.fp = Math.max(0, Number(v.fp) || 0);
  }
  else if (op.kind === "toggle-status") s.statuses[op.key] = !s.statuses[op.key];
  else if (op.kind === "buff") s.attributeBuffs[op.key] = clamp((Number(s.attributeBuffs[op.key]) || 0) + op.delta, -3, 3);
  else if (op.kind === "add-list") (s.lists[op.type] ||= []).push(op.type === "arcana" ? { name: "", cost: "", linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: "" } : op.type === "bonds" ? { name: "", strength: 1, linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: "" } : { name: "", detail: "" });
  else if (op.kind === "remove-list") s.lists[op.type]?.splice(op.index, 1);
  else if (op.kind === "add-class") s.classes.push({ name: "New Class", freeBenefit: "", level: 1, classSkills: [] });
  else if (op.kind === "remove-class") s.classes.splice(op.index, 1);
  else if (op.kind === "add-class-skill") s.classes[op.classIndex]?.classSkills.push({ name: "New Class Skill", level: 1, cost: "", detail: "" });
  else if (op.kind === "remove-class-skill") s.classes[op.classIndex]?.classSkills.splice(op.index, 1);
  else if (op.kind === "add-quirk") s.quirks.push({ name: "New Quirk", detail: "" });
  else if (op.kind === "remove-quirk") s.quirks.splice(op.index, 1);
  else if (op.kind === "add-equipment") s.equipment.push({ name: "New Equipment", weaponType: "", imageUrl: "", detail: "", sphereIds: ["", "", "", ""] });
  else if (op.kind === "remove-equipment") s.equipment.splice(op.index, 1);
  else if (op.kind === "add-sphere") s.spheres.push({ id: makeId(), name: "New Sphere", sphereType: "", linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: "" });
  else if (op.kind === "add-inventory") s.inventory.push({ id: makeId(), name: "New Item", itemType: "", linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: "" });
  else if (op.kind === "shop-purchase") {
    const price = Math.max(0, Number(op.price) || 0), purchaseId = String(op.purchaseId || ""), item = op.item || {};
    const duplicate = purchaseId && (s.inventory || []).some(x => String(x.shopPurchaseId || "") === purchaseId);
    if (!duplicate && (Number(s.zenit) || 0) >= price) {
      s.zenit = Math.max(0, (Number(s.zenit) || 0) - price);
      s.inventory.push({ id: item.id || makeId(), name: item.name || "Shop Item", itemType: item.itemType || "ACCESSORY", linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: item.detail || "", shopPurchaseId: purchaseId, shopStockId: String(item.shopStockId || ""), purchasePrice: price });
    }
  }
  else if (op.kind === "remove-inventory") s.inventory.splice(op.index, 1);
  else if (op.kind === "remove-sphere") { const removed = s.spheres[op.index]?.id; s.spheres.splice(op.index, 1); if (removed) for (const e of s.equipment) e.sphereIds = (e.sphereIds || []).map(id => id === removed ? "" : id); }
  else if (op.kind === "reorder") moveItem(s[op.collection], op.from, op.to);
  else if (op.kind === "reorder-path") moveItem(getByPath(s, op.path), op.from, op.to);
  else if (op.kind === "link-card-token") {
    const entry = cardEntryByKind(s, op.cardKind, op.index);
    if (entry) { entry.linkedTokenId = String(op.tokenId || ""); entry.linkedTokenArt = normalizeTokenArt(op.tokenArt); entry.tokenLink = ""; }
  }
  else if (op.kind === "unlink-card-token") {
    const entry = cardEntryByKind(s, op.cardKind, op.index);
    if (entry) { entry.linkedTokenId = ""; entry.linkedTokenArt = null; entry.tokenLink = ""; }
  }
  else if (op.kind === "add-clock") s.clocks.push({ id: makeId(), name: "New Clock", detail: "", segments: 6, progress: 0 });
  else if (op.kind === "remove-clock") s.clocks.splice(op.index, 1);
  else if (op.kind === "clock-general" && s.clocks[op.index]) s.clocks[op.index].progress = clamp(op.progress, 0, s.clocks[op.index].segments);
  else if (op.kind === "add-project") s.projects.push({ id: `p-${Date.now()}`, name: "New Project", detail: "", segments: 6, progress: 0 });
  else if (op.kind === "remove-project") s.projects.splice(op.index, 1);
  else if (op.kind === "clock" && s.projects[op.index]) s.projects[op.index].progress = clamp(op.progress, 0, s.projects[op.index].segments);
  else if (op.kind === "add-action") s.actions.push(blankAction());
  else if (op.kind === "remove-action") s.actions.splice(op.index, 1);
  else if (op.kind === "link-token") { s.linkedTokenId = op.tokenId || ""; s.showHud = true; }
  else if (op.kind === "unlink-token") { s.linkedTokenId = ""; s.showHud = false; }
  else if (op.kind === "set-defeat-outcome") {
    const outcome = String(op.outcome || "").toLowerCase();
    if (isPlayerDefeated(s) && ["surrender","sacrifice"].includes(outcome)) s.defeatOutcome = outcome;
  }
  else if (op.kind === "delete-sheet") s.deleted = true;
  s.updatedAt = Date.now();
  for (const k of ["hp", "mp", "ip"]) if (s[k]) { s[k].max = Math.max(0, Number(s[k].max) || 0); s[k].current = clamp(s[k].current, 0, s[k].max); }
  syncPlayerDefeatTransition(s, defeatBeforeHp);
}
function relevant(m) { if (!m || m.senderId === me.id) return false; if (m.target === "ALL") return true; if (m.target === "GM") return me.role === "GM"; return m.target === me.id; }
function relevantGMBroadcast(m) {
  if (!m || m.senderId === me.id) return false;
  const targets = Array.isArray(m.targets) ? m.targets.map(String) : [];
  if (targets.includes("ALL_PLAYERS")) return me.role !== "GM";
  return targets.includes(String(me.id));
}

function groupCheckRelevant(kind, p={}) {
  if (kind === "group-check-start") return sameId(p.leaderId,me.id) || (Array.isArray(p.supporters)&&p.supporters.some(x=>sameId(x?.id,me.id)));
  if (kind === "group-check-final-ready") return sameId(p.leaderId,me.id);
  return false;
}
function saveBackgroundGroupCheckPending(kind,payload){try{localStorage.setItem(GROUP_CHECK_PENDING_KEY,JSON.stringify({kind,payload,receivedAt:Date.now()}));}catch{}}
function clearBackgroundGroupCheckPending(id=""){try{const rec=JSON.parse(localStorage.getItem(GROUP_CHECK_PENDING_KEY)||"null");if(!id||!rec?.payload?.id||sameId(rec.payload.id,id))localStorage.removeItem(GROUP_CHECK_PENDING_KEY);}catch{try{localStorage.removeItem(GROUP_CHECK_PENDING_KEY)}catch{}}}
async function openGroupCheckActionPrompt(kind,payload){
  if(!groupCheckRelevant(kind,payload))return;
  saveBackgroundGroupCheckPending(kind,payload);
  try{const open=await OBR.action.isOpen();if(!open)await OBR.action.open();await OBR.action.setBadgeText("!");}catch(e){console.warn("group check action prompt",e);}
}

function travelGroupRelevant(payload={}) {
  return (Array.isArray(payload.players) ? payload.players : []).some(x => sameId(x?.id, me.id));
}
function saveBackgroundTravelGroupPending(payload={}) { try { localStorage.setItem(TRAVEL_GROUP_PENDING_KEY, JSON.stringify({ payload, receivedAt:Date.now() })); } catch {} }
function clearBackgroundTravelGroupPending(id="") { try { const rec=JSON.parse(localStorage.getItem(TRAVEL_GROUP_PENDING_KEY)||"null"); if(!id||!rec?.payload?.id||sameId(rec.payload.id,id))localStorage.removeItem(TRAVEL_GROUP_PENDING_KEY); } catch { try{localStorage.removeItem(TRAVEL_GROUP_PENDING_KEY)}catch{} } }
async function openTravelGroupActionPrompt(payload={}) {
  if(!travelGroupRelevant(payload))return;saveBackgroundTravelGroupPending(payload);
  try{const open=await OBR.action.isOpen();if(!open)await OBR.action.open();await OBR.action.setBadgeText("!");}catch(e){console.warn("travel group action prompt",e);}
}
const lootProcessing = new Set();
let lootModalOpen = false;
let lootModalTransition = Promise.resolve();
function lootOffers(){
  try {const saved=JSON.parse(localStorage.getItem(LOOT_PENDING_KEY)||"null");
    const rows=Array.isArray(saved)?saved:(saved?.payload?[saved]:[]);
    return rows.filter(row=>row?.payload?.id&&Date.now()-Number(row.receivedAt||0)<7200000&&!handledLootIds().includes(String(row.payload.id)));
  }catch{return []}
}
function saveLootOffers(rows){localStorage.setItem(LOOT_PENDING_KEY,JSON.stringify(rows))}
function handledLootIds(){try{const ids=JSON.parse(localStorage.getItem(LOOT_ACCEPTED_KEY)||"[]");return Array.isArray(ids)?ids.map(String):[]}catch{return []}}
function markLootHandled(id){localStorage.setItem(LOOT_ACCEPTED_KEY,JSON.stringify([String(id),...handledLootIds().filter(x=>x!==String(id))].slice(0,150)))}
function syncLootModal(){
  // Serialize open/close requests when several Loot cards arrive together.
  lootModalTransition=lootModalTransition.catch(()=>{}).then(async()=>{
    if(!lootOffers().length){if(lootModalOpen){lootModalOpen=false;try{await OBR.modal.close(LOOT_MODAL_ID)}catch{}}return}
    if(lootModalOpen)return;
    try{await OBR.modal.open({id:LOOT_MODAL_ID,url:"/loot-offer.html",width:460,height:390,hideBackdrop:true,hidePaper:true});lootModalOpen=true}
    catch(e){console.warn("loot offer modal",e);lootModalOpen=false;try{await OBR.notification.show("Loot waiting · retrying popup","INFO")}catch{};setTimeout(()=>syncLootModal().catch(console.warn),3000)}
  });
  return lootModalTransition;
}
async function openLootActionPrompt(loot={}){
  const targets=Array.isArray(loot.targets)?loot.targets.map(String):[];
  if(!loot.id||!(targets.includes("ALL_PLAYERS")||targets.includes(String(me.id||""))))return;
  try{const id=String(loot.id),rows=lootOffers();if(!handledLootIds().includes(id)&&!rows.some(row=>String(row.payload.id)===id))saveLootOffers([...rows,{payload:loot,receivedAt:Date.now()}]);await syncLootModal()}
  catch(e){console.warn("loot offer prompt",e)}
}
async function resolveLootOffer(command={}){
  const id=String(command.offerId||"");if(!id||lootProcessing.has(id))return;
  const row=lootOffers().find(x=>String(x.payload.id)===id);
  if(!row)return;
  const targets=Array.isArray(row.payload.targets)?row.payload.targets.map(String):[];
  if(!targets.includes("ALL_PLAYERS")&&!targets.includes(String(me.id)))return;
  lootProcessing.add(id);
  const reply=(ok,error="")=>{try{companionHudBus?.postMessage({type:"loot-offer-result",offerId:id,ok,error})}catch{}};
  try{
    if(command.type==="loot-offer-accept"&&!handledLootIds().includes(id)){
      const md=await OBR.player.getMetadata(),raw=md[META_KEY];
      if(!raw||raw.deleted)throw new Error("Create a character sheet before receiving Loot.");
      const sheet=normalize(raw),offer=row.payload,kind=String(offer.kind||"item");
      const card={id:makeId(),lootOfferId:id,name:String(offer.name||"NEW CARD").slice(0,80),itemType:String(offer.itemType||"").slice(0,80),linkedTokenId:"",linkedTokenArt:null,tokenLink:"",detail:String(offer.description||"").slice(0,1800)};
      if(kind==="fp"){
        sheet.claimedLootIds=Array.isArray(sheet.claimedLootIds)?sheet.claimedLootIds:[];
        if(!sheet.claimedLootIds.includes(id)){sheet.fp=Math.max(0,(Number(sheet.fp)||0)+1);sheet.claimedLootIds=[id,...sheet.claimedLootIds].slice(0,150)}
      }else if(kind==="sphere"){
        if(!sheet.spheres.some(x=>x.lootOfferId===id))sheet.spheres.push({...card,sphereType:card.itemType});
      }else if(!sheet.inventory.some(x=>x.lootOfferId===id))sheet.inventory.push(card);
      sheet.updatedAt=Math.max(Date.now(),Number(raw.updatedAt||0)+1);
      await OBR.player.setMetadata({[META_KEY]:sheet});
      await persistMySheet(sheet);
    }
    markLootHandled(id);saveLootOffers(lootOffers().filter(x=>String(x.payload.id)!==id));reply(true);
    await syncLootModal();
  }catch(e){console.warn("resolve loot offer",e);reply(false,String(e?.message||"Could not save Loot. Try again."))}
  finally{lootProcessing.delete(id)}
}
function gmBroadcastSound(type) { return ({ warning:"crisis", objective:"message", anomaly:"critical", phase:"phase" })[String(type||"").toLowerCase()] || "message"; }
const COMPANION_SFX_CUES = new Set(["message","status","clock","clockup","clockdown","roll","critical","hpup","hpdown","mpup","mpdown","ipup","ipdown","fpup","fpdown","arcana","zero","initiative","turnmine","immune","crisis","spawn","phase","surrender","defeated","sacrifice"]);
function companionSfxCue(value, fallback="message") { const cue=String(value||"").toLowerCase(); return COMPANION_SFX_CUES.has(cue)?cue:fallback; }
function beep(kind) {
  try { playStandaloneContainmentSound(companionSfxCue(kind)); } catch (e) { console.warn("background sound", e); }
}
function ownTurnCueForPayload(payload = {}) {
  const activeKey=String(payload.activeKey||"");
  if(activeKey && activeKey===`player:${String(me.id||"")}`) return companionSfxCue(payload.ownerCue,"turnmine");
  return companionSfxCue(payload.cue,"message");
}
async function companionHudPlaySfx(message = {}) {
  const payload={id:String(message.id||`sfx-${Date.now()}-${Math.random().toString(36).slice(2,7)}`),senderId:String(me.id||""),senderName:String(me.name||""),cue:companionSfxCue(message.cue),ownerCue:companionSfxCue(message.ownerCue||"turnmine","turnmine"),activeKey:String(message.activeKey||""),label:String(message.label||""),time:Date.now()};
  beep(ownTurnCueForPayload(payload));
  if(message.broadcast){
    try{await OBR.broadcast.sendMessage(CHANNEL,{type:"companion-sfx","companion-sfx":payload},{destination:"ALL"})}catch(e){console.warn("companion sfx broadcast",e)}
  }
}

let skillCutInSequence = 0, activeSkillCutInRollId = "", skillCutInControlBus = null;
let cinematicAlertHidTracker = false, cinematicAlertControlBus = null;
function restoreTrackerAfterCinematicAlert(){
  if(!cinematicAlertHidTracker)return;
  cinematicAlertHidTracker=false;
  if(!companionHudSuppressedByMain)companionHudSyncTracker().catch(()=>{});
}
function registerCinematicAlertControlBus(){
  if(cinematicAlertControlBus)return;
  const handle=data=>{if(data?.type==="close")restoreTrackerAfterCinematicAlert()};
  try{
    if(typeof BroadcastChannel!=="undefined"){
      cinematicAlertControlBus=new BroadcastChannel(ALERT_CONTROL_CHANNEL);
      cinematicAlertControlBus.onmessage=e=>handle(e.data||{});
    }else{
      cinematicAlertControlBus={fallback:true};
      window.addEventListener("storage",e=>{if(e.key!==`${ALERT_CONTROL_CHANNEL}:event`||!e.newValue)return;try{handle(JSON.parse(e.newValue))}catch{}});
    }
  }catch(e){console.warn("cinematic alert control",e)}
}
async function closeSkillCutInPopover(rollId = "") {
  const requested = String(rollId || "");
  if (requested && activeSkillCutInRollId && requested !== activeSkillCutInRollId) return;
  skillCutInSequence += 1;
  activeSkillCutInRollId = "";
  try { await OBR.popover.close(SKILL_CUTIN_POPOVER_ID); } catch {}
}
function registerSkillCutInControlBus() {
  if (skillCutInControlBus) return;
  const handle = data => { if (data?.type === "close") closeSkillCutInPopover(data.rollId).catch(()=>{}); };
  try {
    if (typeof BroadcastChannel !== "undefined") {
      skillCutInControlBus = new BroadcastChannel(SKILL_CUTIN_CONTROL_CHANNEL);
      skillCutInControlBus.onmessage = e => handle(e.data || {});
    } else {
      skillCutInControlBus = { fallback: true };
      window.addEventListener("storage", e => { if (e.key !== `${SKILL_CUTIN_CONTROL_CHANNEL}:event` || !e.newValue) return; try { handle(JSON.parse(e.newValue)); } catch {} });
    }
  } catch (e) { console.warn("skill cut-in control", e); }
}
async function openSkillCutInPopover(payload = {}) {
  const seq = ++skillCutInSequence;
  activeSkillCutInRollId = String(payload.rollId || "");
  try {
    localStorage.setItem(SKILL_CUTIN_KEY, JSON.stringify({ ...payload, receivedAt: Date.now() }));
    const [rawWidth, rawHeight] = await Promise.all([OBR.viewport.getWidth(), OBR.viewport.getHeight()]);
    if (seq !== skillCutInSequence) return;
    const viewportWidth = Math.max(320, Number(rawWidth) || 900), viewportHeight = Math.max(240, Number(rawHeight) || 700);
    const zeroPower = String(payload.kind || "") === "zero-power";
    const desiredWidth = zeroPower
      ? Math.min(900, Math.max(300, viewportWidth - 24))
      : Math.max(300, Math.min(430, viewportWidth - 110));
    const surface=companionHudSafeSurface({width:viewportWidth,height:viewportHeight},desiredWidth,280);
    const width=surface.width;
    const desiredHeight = zeroPower
      ? Math.min(540, Math.max(220, viewportHeight - 24))
      : Math.max(150, Math.min(205, viewportHeight - 100));
    const height=Math.min(desiredHeight,Math.max(1,surface.maxTop-surface.safeTop));
    const rightToolbarSafe = viewportWidth >= 700 ? 84 : 10;
    const bottomToolbarSafe = viewportHeight >= 500 ? 72 : 10;
    const left = zeroPower ? surface.left : Math.max(surface.safeLeft, viewportWidth - width - rightToolbarSafe);
    const top = companionHudSurfaceTop(surface,{height:viewportHeight},height,zeroPower?Math.round((viewportHeight-height)/2):viewportHeight-height-bottomToolbarSafe);
    try { await OBR.popover.close(SKILL_CUTIN_POPOVER_ID); } catch {}
    if (seq !== skillCutInSequence) return;
    beep("phase");
    await OBR.popover.open({
      id: SKILL_CUTIN_POPOVER_ID,
      url: `/skill-cutin.html?event=${encodeURIComponent(String(payload.id || seq))}`,
      width, height,
      anchorReference: "POSITION",
      anchorPosition: { left, top },
      anchorOrigin: { horizontal: "LEFT", vertical: "TOP" },
      transformOrigin: { horizontal: "LEFT", vertical: "TOP" },
      hidePaper: true,
      disableClickAway: true,
      marginThreshold: 0
    });
  } catch (e) { console.warn("skill cut-in popover", e); }
}

function zeroPowerMedia(text = "") { return String(text || "").match(/https?:\/\/[^\s<>"']+?\.(?:gif|png|jpe?g|webp)(?:\?[^\s<>"']*)?/i)?.[0] || ""; }
function zeroPowerText(text = "") { return String(text || "").replace(/https?:\/\/[^\s<>"']+/gi, "").replace(/\n{3,}/g, "\n\n").trim(); }
async function activateOwnZeroPower() {
  const md = await OBR.player.getMetadata(), raw = md?.[META_KEY];
  if (!raw || raw.deleted) return OBR.notification.show("Create a Fabula character first", "INFO");
  const s = normalize(raw), z = s.zeroPower || {};
  if (Number(z.current) < 6) return OBR.notification.show(`ZERO POWER · ${Number(z.current) || 0}/6`, "INFO");
  const payload = { kind:"zero-power", id:`zero-${makeId()}`, rollId:`zero-${makeId()}`, senderId:me.id, senderName:me.name, actorId:me.id, actorName:s.name || me.name, actionName:z.name || "ZERO POWER", portrait:s.portrait || "", media:zeroPowerMedia(z.detail), trigger:zeroPowerText(z.trigger), effect:zeroPowerText(z.effect), detail:zeroPowerText(z.detail), description:[zeroPowerText(z.effect),zeroPowerText(z.detail)].filter(Boolean).join("\n\n") || "ZERO POWER ACTIVATED", element:"none", cutInColor:"gold", time:Date.now() };
  await OBR.broadcast.sendMessage(CHANNEL, { type:"skill-cutin", "skill-cutin":payload }, { destination:"ALL" });
  s.zeroPower.current = 0; s.updatedAt = Date.now();
  await OBR.player.setMetadata({ [META_KEY]:s }); await persistMySheet(s); scheduleHud();
}

function rollHasDamage(roll) {
  if (roll?.rollStyle === "check") return false;
  return roll?.damage !== null && roll?.damage !== "" && roll?.damage !== undefined && Number.isFinite(Number(roll?.damage));
}
function cinematicAlertSize(payload = {}) {
  if (payload.kind === "phase-change") return { width: 920, height: 540 };
  if (payload.kind === "share" && payload.shareType === "equipment") return { width: 1060, height: 760 };
  if (payload.kind === "share") return { width: 820, height: 600 };
  if (payload.kind === "roll" && payload.isStudy) return { width: 760, height: 650 };
  if (payload.kind === "roll" && rollHasDamage(payload)) return { width: 820, height: 650 };
  return { width: 720, height: 560 };
}
function isInitiativeRollPayload(payload = {}) {
  if (String(payload?.kind || "") !== "roll") return false;
  const haystack = `${payload?.label || ""} ${payload?.detail || ""}`;
  return /\bINITIATIVE\b/i.test(haystack);
}
async function openCinematicAlert(payload) {
  // v2.163.4: when the Fabula action window is closed, rolls and USE/SEND cards
  // still need a visible result on the main Owlbear canvas. The alert page is the
  // same renderer used by the classic result popup, opened here only as fallback.
  try {
    if (activeSkillCutInRollId && String(payload?.id || "") !== activeSkillCutInRollId) await closeSkillCutInPopover(activeSkillCutInRollId);
    // v3.0.xx: Initiative rolls update the tracker itself, so do not tear down
    // the tracker popover for these result modals. If the alert close signal is
    // missed, closing the tracker here is what made the INIT tab disappear until
    // the main action window forced a full Companion HUD re-sync.
    if(companionHudTrackerOpen&&!isInitiativeRollPayload(payload)){cinematicAlertHidTracker=true;await companionHudCloseTracker();}
    localStorage.setItem(ALERT_KEY, JSON.stringify({ ...payload, receivedAt: Date.now() }));
    try { await OBR.modal.close(ALERT_MODAL_ID); } catch {}
    const size = cinematicAlertSize(payload || {});
    await OBR.modal.open({
      id: ALERT_MODAL_ID,
      url: "/alert.html",
      width: size.width,
      height: size.height,
      hideBackdrop: true,
      hidePaper: true
    });
  } catch (e) {
    console.warn("cinematic alert fallback", e);
    restoreTrackerAfterCinematicAlert();
    try { await OBR.notification.show(payload?.kind === "roll" ? `${payload?.label || "ROLL"} · ${Number(payload?.total) || 0}` : `${payload?.title || "FABULA"}`, "INFO"); } catch {}
  }
}
async function openGMBroadcastAlert(payload) {
  try {
    localStorage.setItem(ALERT_KEY, JSON.stringify({ kind: "gm-broadcast", ...payload, receivedAt: Date.now() }));
    try { await OBR.modal.close(ALERT_MODAL_ID); } catch {}
    await OBR.modal.open({ id: ALERT_MODAL_ID, url: "/alert.html", width: 900, height: 500, hideBackdrop: false, hidePaper: true });
  } catch (e) { console.warn("gm broadcast modal", e); }
}
function normalizedStudyTier(value) { const t = Number(value) || 0; return t >= 13 ? 13 : t >= 10 ? 10 : t >= 7 ? 7 : 0; }
function monsterTier(s, phaseIndex = null) {
  const phases = Array.isArray(s?.phases) ? s.phases : [], index = phaseIndex === null ? Math.max(0, Math.min(Number(s?.activePhase) || 0, phases.length)) : Math.max(0, Math.min(Number(phaseIndex) || 0, phases.length));
  return index ? normalizedStudyTier(phases[index - 1]?.studyTier) : normalizedStudyTier(s?.studyTier);
}
function monsterPhaseView(s) {
  const phases = Array.isArray(s?.phases) ? s.phases : [], index = Math.max(0, Math.min(Number(s?.activePhase) || 0, phases.length));
  const phase = index ? phases[index - 1] : null;
  if (!phase) return s;
  return { ...s, ...phase, id: s.id, villainType: s.villainType, faction: s.faction, hp: s.hp, mp: s.mp, up: s.up, statuses: s.statuses, statusImmunities: s.statusImmunities, attributeBuffs: s.attributeBuffs, studyTier: normalizedStudyTier(phase.studyTier), linkedTokenId: s.linkedTokenId, showHud: s.showHud, phases: s.phases, activePhase: s.activePhase };
}
function studyTierFromTotal(total) { const n = Number(total) || 0; return n >= 13 ? 13 : n >= 10 ? 10 : n >= 7 ? 7 : 0; }
async function autoApplyRemoteStudy(r) {
  if (me.role !== "GM" || !r?.isStudy || !r.studyTargetId || r.senderId === me.id) return;
  const tier = studyTierFromTotal(r.total); if (!tier) return;
  try {
    if (!await OBR.scene.isReady()) return;
    const md = await OBR.scene.getMetadata();
    const monsters = Array.isArray(md[SCENE_MONSTERS_KEY]) ? md[SCENE_MONSTERS_KEY].map(m => ({ ...m })) : [];
    let i = monsters.findIndex(m => sameId(m.id, r.studyTargetId));
    if (i < 0 && r.studyTargetTokenId) i = monsters.findIndex(m => sameId(m.linkedTokenId, r.studyTargetTokenId));
    if (i < 0) return;
    const phaseIndex = Math.max(0, Math.min(Number(r.studyPhaseIndex) || 0, Array.isArray(monsters[i].phases) ? monsters[i].phases.length : 0));
    const current = monsterTier(monsters[i], phaseIndex); if (tier <= current) return;
    const next = { ...monsters[i], phases: Array.isArray(monsters[i].phases) ? monsters[i].phases.map(p => ({ ...p })) : [] };
    if (phaseIndex > 0 && next.phases[phaseIndex - 1]) next.phases[phaseIndex - 1].studyTier = tier;
    else next.studyTier = tier;
    next.updatedAt = Date.now();
    monsters[i] = next;
    await OBR.scene.setMetadata({ [SCENE_MONSTERS_KEY]: monsters });
  } catch (e) { console.warn("auto Study", e); }
}
function currentDie(s, attr) {
  const base = Number(s?.attributes?.[attr]) || 8;
  let idx = Math.max(0, DIE_STEPS.indexOf(base));
  let penalty = 0;
  for (const [status, on] of Object.entries(s?.statuses || {})) if (on) penalty += STATUS_PENALTIES[status]?.[attr] || 0;
  idx = clamp(idx + (Number(s?.attributeBuffs?.[attr]) || 0) - penalty, 0, DIE_STEPS.length - 1);
  return DIE_STEPS[idx];
}
function defenseModifierResult(raw, base) {
  const t = String(raw ?? "").trim();
  if (!t) return Math.max(0, Number(base) || 0);
  if (/^[+-]\d+$/.test(t)) return Math.max(0, (Number(base) || 0) + Number(t));
  if (/^\d+$/.test(t)) return Math.max(0, Number(t));
  return Math.max(0, Number(base) || 0);
}
function defenseValue(s, kind = "defense") {
  const attr = kind === "magicDefense" ? "INS" : "DEX";
  const modKey = kind === "magicDefense" ? "magicDefenseMod" : "defenseMod";
  return defenseModifierResult(s?.[modKey], currentDie(s, attr));
}
const HUD_STATUS_SHORT = { slow: "SLOW", enraged: "ENRAGED", dazed: "DAZED", weak: "WEAK", poisoned: "POISONED", shaken: "SHAKEN" };
function hudName(name = "") {
  return String(name || "").replace(/\s+/g, " ").trim() || "UNIT";
}
function isHudCrisis(s) {
  const max = Number(s?.hp?.max) || 0, cur = Number(s?.hp?.current) || 0;
  return max > 0 && cur > 0 && cur <= max / 2;
}
function hudStatuses(s) {
  const active = Object.entries(s?.statuses || {}).filter(([, v]) => v).map(([k]) => HUD_STATUS_SHORT[k] || k.toUpperCase());
  // v2.92: NORMAL is implicit. Do not spend HUD space on an empty status line.
  if (!active.length) return "";
  const chips = active.map(x => `[${x}]`), rows = [];
  for (let i = 0; i < chips.length; i += 3) rows.push(chips.slice(i, i + 3).join(" "));
  return rows.join("\n");
}
function playerTokenDebuffs(s) {
  const active = Object.entries(s?.statuses || {}).filter(([, v]) => v).map(([k]) => HUD_STATUS_SHORT[k] || String(k || "").toUpperCase());
  if (isPlayerDefeated(s)) {
    const outcome = String(s?.defeatOutcome || "").toLowerCase();
    active.unshift(outcome === "surrender" ? "SURRENDER" : outcome === "sacrifice" ? "SACRIFICE" : "DEFEAT DECISION");
  } else if (isHudCrisis(s)) active.push("CRISIS");
  return active.length ? active.map(x => `[${x}]`).join(" ") : "";
}
function monsterHudName(s, view) {
  const base = hudName(view?.name || s?.name || "MONSTER");
  const activeIndex = Math.max(0, Math.min(Number(s?.activePhase) || 0, Array.isArray(s?.phases) ? s.phases.length : 0));
  const phase = activeIndex >= 1 ? ` · PHASE ${activeIndex + 1}` : "";
  const defeated = Number(s?.hp?.current) <= 0;
  const state = defeated ? " · DEFEATED" : (isHudCrisis(s) ? " · CRISIS" : "");
  return `${base}${phase}${state}`;
}
function playerHudName(s) {
  if (isPlayerDefeated(s)) {
    const outcome = String(s?.defeatOutcome || "").toLowerCase();
    const label = outcome === "surrender" ? "SURRENDER" : outcome === "sacrifice" ? "SACRIFICE" : "DEFEAT DECISION";
    return `${hudName(s?.name || "CHARACTER")} · ${label}`;
  }
  return `${hudName(s?.name || "CHARACTER")}${isHudCrisis(s) ? " · CRISIS" : ""}`;
}
function trackCrisis(key, sheet) {
  const now = isHudCrisis(sheet);
  if (!crisisState.has(key)) { crisisState.set(key, now); return; }
  const before = crisisState.get(key);
  crisisState.set(key, now);
  if (!before && now) beep("crisis");
}
function hudText(s, monster = false) {
  const v = monster ? monsterPhaseView(s) : s;
  const name = monster ? monsterHudName(s, v) : playerHudName(s);
  const status = hudStatuses(s);
  const withStatus = base => status ? `${base}\n${status}` : base;
  if (monster) {
    const tier = monsterTier(s);
    // v2.93: before the first successful Study, linked monster tokens hide numerical/combat-sheet data,
    // but active Debuffs are public combat information and remain visible at every Study tier.
    // NORMAL stays implicit; CRISIS is appended to the name line.
    if (tier <= 0) {
      const hiddenName = hudName(v?.name || s?.name || "MONSTER");
      return withStatus(`${hiddenName}${isHudCrisis(s) ? " · CRISIS" : ""}`);
    }
    if (me.role !== "GM") {
      const hp = tier >= 7 ? `${s.hp?.current ?? 0}/${s.hp?.max ?? 0}` : "???";
      const mp = tier >= 7 ? `${s.mp?.current ?? 0}/${s.mp?.max ?? 0}` : "???";
      const df = tier >= 10 ? `${defenseValue(v, "defense")}` : "???";
      const mdf = tier >= 10 ? `${defenseValue(v, "magicDefense")}` : "???";
      return withStatus(`${name}\n[HP ${hp}] [MP ${mp}] [DEF. ${df}] [M.DEF ${mdf}]`);
    }
    return withStatus(`${name}\n[HP ${s.hp?.current ?? 0}/${s.hp?.max ?? 0}] [MP ${s.mp?.current ?? 0}/${s.mp?.max ?? 0}] [DEF. ${defenseValue(v, "defense")}] [M.DEF ${defenseValue(v, "magicDefense")}]`);
  }
  return withStatus(`${name}\n[HP ${s.hp?.current ?? 0}/${s.hp?.max ?? 0}] [MP ${s.mp?.current ?? 0}/${s.mp?.max ?? 0}] [IP ${s.ip?.current ?? 0}/${s.ip?.max ?? 0}] [DEF. ${defenseValue(s, "defense")}] [M.DEF ${defenseValue(s, "magicDefense")}]`);
}
function buildCompactHudLabel(token, text, monster = false, metadataValue = "") {
  return buildLabel()
    .plainText(text)
    .fontSize(12)
    .fontWeight(600)
    .fillColor(monster ? "#ffe9df" : "#eaf7fa")
    .backgroundColor(monster ? "#160b0d" : "#071015")
    .backgroundOpacity(.88)
    .padding(4)
    .cornerRadius(4)
    .pointerDirection("UP")
    .pointerHeight(4)
    .pointerWidth(6)
    .position({ x: token.position.x, y: token.position.y + 64 })
    .attachedTo(token.id)
    .layer("ATTACHMENT")
    .disableHit(true)
    .metadata({ [HUD_KEY]: metadataValue })
    .build();
}
function buildTurnMarkerLabel(token, metadataValue = "") {
  return buildLabel().plainText("◆ TURN").fontSize(10).fontWeight(800).fillColor("#8cffe0").backgroundColor("#063527").backgroundOpacity(.95).padding(4).cornerRadius(5).pointerDirection("DOWN").pointerHeight(4).pointerWidth(6).position({ x: token.position.x, y: token.position.y - 58 }).attachedTo(token.id).layer("ATTACHMENT").disableHit(true).metadata({ [HUD_KEY]: `${metadataValue}:turn` }).build();
}
function buildPlayerDebuffLabel(token, text, metadataValue = "") {
  return buildLabel()
    .plainText(text)
    .fontSize(10)
    .fontWeight(700)
    .fillColor("#f3f8fa")
    .backgroundColor("#141015")
    .backgroundOpacity(.92)
    .padding(3)
    .cornerRadius(4)
    .pointerDirection("UP")
    .pointerHeight(3)
    .pointerWidth(5)
    .position({ x: token.position.x, y: token.position.y + 54 })
    .attachedTo(token.id)
    .layer("ATTACHMENT")
    .disableHit(true)
    .metadata({ [HUD_KEY]: `${metadataValue}:debuffs` })
    .build();
}
async function currentAsPlayer() { const metadata = await OBR.player.getMetadata(); return { id: me.id, name: me.name, role: me.role, metadata }; }
function scheduleHud() { clearTimeout(hudTimer); hudTimer = setTimeout(renderHuds, 12); }
function tokenFrameTargetValid(item) {
  return !!item && item.type === "IMAGE" && item.layer === "CHARACTER" && !item.metadata?.[TOKEN_FRAME_META_KEY];
}
async function replaceTokenFrame(target) {
  if (!tokenFrameTargetValid(target)) return false;
  const old = await OBR.scene.items.getItems(item => String(item?.metadata?.[TOKEN_FRAME_META_KEY] || "") === String(target.id));
  // Clicking an already framed Character removes its frame. This is deliberately
  // checked before frame construction so one click can never replace it by mistake.
  if (old.length) { await OBR.scene.items.deleteItems(old.map(x => x.id)); return false; }

  // v2.98: native Owlbear SHAPE frame; no external asset loading is required.
  // The supplied token_4 image is a solid white circle on transparency, so a
  // native circle is visually identical and cannot fail because of asset loading/CORS.
  const bounds = await OBR.scene.items.getItemBounds([target.id]);
  const diameter = Math.max(8, Number(bounds?.width) || 0, Number(bounds?.height) || 0);
  const center = bounds?.center && Number.isFinite(Number(bounds.center.x)) && Number.isFinite(Number(bounds.center.y))
    ? { x: Number(bounds.center.x), y: Number(bounds.center.y) }
    : { x: Number(target.position?.x) || 0, y: Number(target.position?.y) || 0 };

  const frame = buildShape()
    .name(`DM TOKEN FRAME · ${String(target.name || "CHARACTER")}`)
    .width(diameter)
    .height(diameter)
    .shapeType("CIRCLE")
    .fillColor("#ffffff")
    .fillOpacity(1)
    .strokeColor("#ffffff")
    .strokeOpacity(0)
    .strokeWidth(0)
    .layer("PROP")
    .position(center)
    .attachedTo(target.id)
    .locked(true)
    .disableHit(true)
    .metadata({ [TOKEN_FRAME_META_KEY]: String(target.id) })
    .build();
  await OBR.scene.items.addItems([frame]);
  return true;
}
function guardCoverState(md={}){const raw=md?.[SCENE_GUARD_COVER_KEY]||{};return{revision:Math.max(0,Number(raw.revision)||0),entries:(Array.isArray(raw.entries)?raw.entries:[]).filter(x=>x&&x.guardTokenId),uses:raw.uses&&typeof raw.uses==="object"?{...raw.uses}:{}}}
function guardVisualMeta(entry,kind){return`${kind}:${String(entry.guardTokenId||"")}:${String(entry.coverTokenId||"")}`}
function guardTokenPoint(token){const x=Number(token?.position?.x),y=Number(token?.position?.y);return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null}
async function guardTokenMetrics(token){
  const fallback=guardTokenPoint(token);if(!fallback)return null;
  try{
    const bounds=await OBR.scene.items.getItemBounds([token.id]),width=Math.max(1,Number(bounds?.width)||1),height=Math.max(1,Number(bounds?.height)||1);
    const center=bounds?.center&&Number.isFinite(Number(bounds.center.x))&&Number.isFinite(Number(bounds.center.y))?{x:Number(bounds.center.x),y:Number(bounds.center.y)}:fallback;
    return{center,radius:Math.max(width,height)/2,diameter:Math.max(width,height)};
  }catch{return{center:fallback,radius:47,diameter:94}}
}
function buildGuardRing(token,entry,metrics){
  const diameter=Math.max(36,Number(metrics?.diameter)||94)+18;
  return buildShape().name(`GUARD SHIELD RING · ${String(entry.guardName||token.name||"GUARD")}`).width(diameter).height(diameter).shapeType("CIRCLE").fillColor("#26d9ff").fillOpacity(.08).strokeColor("#76edff").strokeOpacity(.95).strokeWidth(7).layer("ATTACHMENT").position(metrics.center).locked(true).disableHit(true).metadata({[GUARD_COVER_ITEM_META_KEY]:guardVisualMeta(entry,"ring")}).build();
}
function buildCoveredRing(coverToken,entry,metrics){
  const diameter=Math.max(36,Number(metrics?.diameter)||94)+12;
  return buildShape().name(`COVERED SHIELD RING · ${String(entry.coverName||coverToken.name||"ALLY")}`).width(diameter).height(diameter).shapeType("CIRCLE").fillColor("#ffd166").fillOpacity(.05).strokeColor("#ffd166").strokeOpacity(.92).strokeWidth(4).layer("ATTACHMENT").position(metrics.center).locked(true).disableHit(true).metadata({[GUARD_COVER_ITEM_META_KEY]:guardVisualMeta(entry,"covered-ring")}).build();
}
function buildGuardBadge(guardToken,entry,metrics){
  return buildLabel().plainText(`🛡 COVERING ${String(entry.coverName||"ALLY").toUpperCase()}`).fontSize(11).fontWeight(800).fillColor("#e8fbff").backgroundColor("#073345").backgroundOpacity(.95).padding(4).cornerRadius(6).pointerDirection("UP").pointerHeight(4).pointerWidth(6).position({x:metrics.center.x,y:metrics.center.y+metrics.radius+16}).layer("ATTACHMENT").disableHit(true).metadata({[GUARD_COVER_ITEM_META_KEY]:guardVisualMeta(entry,"guard-badge")}).build();
}
function buildCoverBadge(coverToken,entry,metrics){
  return buildLabel().plainText(`🛡 COVERED BY ${String(entry.guardName||"ALLY").toUpperCase()}`).fontSize(11).fontWeight(800).fillColor("#e8fbff").backgroundColor("#073345").backgroundOpacity(.95).padding(4).cornerRadius(6).pointerDirection("DOWN").pointerHeight(4).pointerWidth(6).position({x:metrics.center.x,y:metrics.center.y-metrics.radius-16}).layer("ATTACHMENT").disableHit(true).metadata({[GUARD_COVER_ITEM_META_KEY]:guardVisualMeta(entry,"badge")}).build();
}
async function reconcileGuardCoverVisuals(md=null){
  if(me.role!=="GM"||!await OBR.scene.isReady())return;
  const sceneMd=md||await OBR.scene.getMetadata(),state=guardCoverState(sceneMd),tokenIds=[...new Set(state.entries.flatMap(x=>[String(x.guardTokenId||""),String(x.coverTokenId||"")]).filter(Boolean))];
  const tokens=tokenIds.length?await OBR.scene.items.getItems(tokenIds):[],byId=new Map(tokens.map(x=>[String(x.id),x]));
  const sig=JSON.stringify([state.revision,state.entries.map(x=>[x.id,x.guardTokenId,x.coverTokenId,x.guardName,x.coverName]),tokens.map(x=>[String(x.id),Number(x.position?.x)||0,Number(x.position?.y)||0,Number(x.rotation)||0,Number(x.scale?.x)||1,Number(x.scale?.y)||1])]);
  if(sig===guardCoverVisualSig)return;guardCoverVisualSig=sig;
  const existing=await OBR.scene.items.getItems(item=>!!item?.metadata?.[GUARD_COVER_ITEM_META_KEY]);if(existing.length)await OBR.scene.items.deleteItems(existing.map(x=>x.id));
  const add=[];
  for(const entry of state.entries){
    const guard=byId.get(String(entry.guardTokenId||""));if(!guard)continue;
    const guardMetrics=await guardTokenMetrics(guard);if(!guardMetrics)continue;
    add.push(buildGuardRing(guard,entry,guardMetrics));
    const cover=byId.get(String(entry.coverTokenId||""));if(cover){const coverMetrics=await guardTokenMetrics(cover);if(coverMetrics)add.push(buildGuardBadge(guard,entry,guardMetrics),buildCoveredRing(cover,entry,coverMetrics),buildCoverBadge(cover,entry,coverMetrics));}
  }
  if(add.length)await OBR.scene.items.addItems(add);
}
function scheduleGuardCoverVisuals(md=null,delay=45){clearTimeout(guardCoverVisualTimer);guardCoverVisualTimer=setTimeout(()=>{const run=()=>reconcileGuardCoverVisuals(md);guardCoverSyncChain=(guardCoverSyncChain||Promise.resolve()).then(run,run)},Math.max(20,Number(delay)||45))}
async function expireGuardAtTurnStart(md){
  if(me.role!=="GM")return;const combat=md?.[SCENE_COMBAT_KEY]||{},turnSig=combat.started?`${Math.max(0,Number(combat.round)||0)}|${String(combat.activeKey||"")}`:"";
  if(!guardCoverLastTurnSig){guardCoverLastTurnSig=turnSig;return}if(!turnSig||turnSig===guardCoverLastTurnSig){guardCoverLastTurnSig=turnSig;return}guardCoverLastTurnSig=turnSig;
  const active=String(combat.activeKey||""),state=guardCoverState(md),before=state.entries.length;state.entries=state.entries.filter(x=>{const key=`${x.guardKind}:${x.guardId}`;return !(active===key||active.startsWith(`${key}:turn:`))});
  if(state.entries.length!==before){state.revision+=1;await OBR.scene.setMetadata({[SCENE_GUARD_COVER_KEY]:state})}
}
async function ensureDMTokenFrameTool() {
  if (me.role !== "GM" || dmFrameToolRegistered) return dmFrameToolRegistered;
  try {
    if (!await OBR.scene.isReady()) return false;
    // Clean up a partial v2 registration before creating the pair again.
    try { await OBR.tool.removeMode(TOKEN_FRAME_MODE_ID); } catch {}
    try { await OBR.tool.remove(TOKEN_FRAME_TOOL_ID); } catch {}
    await OBR.tool.create({
      id: TOKEN_FRAME_TOOL_ID,
      icons: [{ icon: "/action-icon-v213.svg", label: "DM Token Frame", filter: { roles: ["GM"] } }],
      defaultMode: TOKEN_FRAME_MODE_ID,
    });
    await OBR.tool.createMode({
      id: TOKEN_FRAME_MODE_ID,
      icons: [{ icon: "/action-icon-v213.svg", label: "Apply Token Frame", filter: { activeTools: [TOKEN_FRAME_TOOL_ID], roles: ["GM"] } }],
      cursors: [{ cursor: "crosshair", filter: { activeTools: [TOKEN_FRAME_TOOL_ID], activeModes: [TOKEN_FRAME_MODE_ID], roles: ["GM"] } }],
      // v2.98: while this custom mode is active, let Owlbear keep its normal
      // Move-tool drag behavior. Without preventDrag the mode owns the drag and
      // Character tokens feel frozen.
      preventDrag: { roles: ["GM"] },
      async onActivate() {
        try { await OBR.player.setMetadata({ [TOKEN_FRAME_ACTIVE_KEY]: true }); } catch {}
      },
      async onDeactivate() {
        // Switching to any other Owlbear tool is an explicit cancel. This also
        // prevents the selection fallback from remaining armed invisibly.
        try { await OBR.player.setMetadata({ [TOKEN_FRAME_ACTIVE_KEY]: false }); } catch {}
      },
      async onToolClick(_context, event) {
        const target = event?.target;
        // IMPORTANT: return true so Owlbear still performs its normal click
        // (selection / deselection). A wrong click must never be trapped by us.
        if (!tokenFrameTargetValid(target)) return true;
        try {
          await replaceTokenFrame(target);
        } catch (e) {
          console.warn("dm token frame click", e);
        }
        return true;
      },
      async onKeyDown(_context, event) {
        if (event?.key !== "Escape") return;
        try { await OBR.player.setMetadata({ [TOKEN_FRAME_ACTIVE_KEY]: false }); } catch {}
      }
    });
    dmFrameToolRegistered = true;
    return true;
  } catch (e) {
    console.warn("dm token frame tool registration", e);
    try { await OBR.tool.removeMode(TOKEN_FRAME_MODE_ID); } catch {}
    try { await OBR.tool.remove(TOKEN_FRAME_TOOL_ID); } catch {}
    dmFrameToolRegistered = false;
    return false;
  }
}
async function handleDMTokenFrameSelection(player) {
  if (dmFrameSelectionBusy || me.role !== "GM" || !player?.metadata?.[TOKEN_FRAME_ACTIVE_KEY]) return;
  try {
    if (!await OBR.scene.isReady()) return;
    // If the dedicated tool is active, onToolClick handles the click directly.
    // This path is a fallback for rooms where custom mode activation is blocked.
    let activeMode = "";
    try { activeMode = String(await OBR.tool.getActiveToolMode() || ""); } catch {}
    if (activeMode === TOKEN_FRAME_MODE_ID) return;
    const ids = Array.isArray(player.selection) ? player.selection : [];
    if (!ids.length) return;
    const selected = await OBR.scene.items.getItems(ids);
    const target = selected.find(tokenFrameTargetValid);
    if (!target) return;
    dmFrameSelectionBusy = true;
    await replaceTokenFrame(target);
    // v2.98: deliberately KEEP the Character selected. Deselecting here could
    // interrupt Owlbear's own selection/drag workflow and made tokens awkward
    // or impossible to move in fallback mode.
  } catch (e) {
    console.warn("dm token frame selection fallback", e);
  } finally {
    dmFrameSelectionBusy = false;
  }
}

const CANVAS_TEXT_STATS = ["hp","mp","ip","fp","defense","magicDefense"];
function canvasTextValue(s, key) {
  if (key === "hp" || key === "mp" || key === "ip") return `${Number(s?.[key]?.current) || 0}/${Number(s?.[key]?.max) || 0}`;
  if (key === "fp") return String(Number(s?.fp) || 0);
  if (key === "defense") return String(defenseValue(s, "defense"));
  if (key === "magicDefense") return String(defenseValue(s, "magicDefense"));
  return "";
}
function richTextPlain(nodes) { let out = ""; const walk = arr => { for (const n of arr || []) { if (typeof n?.text === "string") out += n.text; if (Array.isArray(n?.children)) walk(n.children); } }; walk(nodes); return out; }
function canvasTextCurrent(item) { return item?.text?.type === "RICH" ? richTextPlain(item.text.richText) : String(item?.text?.plainText || ""); }
function replaceRichTextContentPreserveFormat(nodes, value) {
  let wrote = false; const next = String(value ?? "");
  const walk = arr => { for (const node of arr || []) { if (!node || typeof node !== "object") continue; if (typeof node.text === "string") { node.text = wrote ? "" : next; wrote = true; } if (Array.isArray(node.children)) walk(node.children); } };
  walk(nodes); return wrote;
}
function setCanvasTextValue(item, value) {
  if (!item?.text) return; const next = String(value ?? "");
  if (item.text.type === "RICH") { if (!replaceRichTextContentPreserveFormat(item.text.richText, next)) return; }
  else item.text.plainText = next;
}
async function syncCanvasTextLinks(players) {
  const tasks = [];
  for (const p of players || []) {
    const raw = p?.metadata?.[META_KEY]; if (!raw || raw.deleted) continue;
    const s = normalize(raw), links = s.canvasTextLinks || {};
    for (const key of CANVAS_TEXT_STATS) if (links[key]) tasks.push({ id: String(links[key]), value: canvasTextValue(s, key) });
  }
  if (!tasks.length) return;
  const uniqueIds = [...new Set(tasks.map(x => x.id))], items = await OBR.scene.items.getItems(uniqueIds), itemMap = new Map(items.map(x => [x.id,x]));
  const wanted = new Map(); for (const t of tasks) wanted.set(t.id,t.value);
  const changed = items.filter(x => x.type === "TEXT" && wanted.has(x.id) && canvasTextCurrent(x) !== wanted.get(x.id));
  if (changed.length) await OBR.scene.items.updateItems(changed, xs => { for (const item of xs) setCanvasTextValue(item, wanted.get(item.id)); });
}


function hudMetadataValue(item) { return String(item?.metadata?.[HUD_KEY] || ""); }
function labelPlainText(item) { return item?.text?.type === "RICH" ? richTextPlain(item.text.richText) : String(item?.text?.plainText || ""); }
function sameHudPosition(a, b) { return Number(a?.x) === Number(b?.x) && Number(a?.y) === Number(b?.y); }
async function syncLocalHudLabels(desired = []) {
  const local = await OBR.scene.local.getItems();
  const existing = local.filter(i => i.metadata?.[HUD_KEY]);
  const desiredByKey = new Map(desired.map(item => [hudMetadataValue(item), item]).filter(([key]) => key));
  const existingByKey = new Map();
  const duplicateIds = [];
  for (const item of existing) {
    const key = hudMetadataValue(item);
    if (!key) continue;
    if (existingByKey.has(key)) duplicateIds.push(item.id);
    else existingByKey.set(key, item);
  }
  const staleIds = existing.filter(item => !desiredByKey.has(hudMetadataValue(item))).map(item => item.id);
  const deleteIds = [...new Set([...duplicateIds, ...staleIds])];
  const add = [];
  const update = [];
  for (const [key, wanted] of desiredByKey) {
    const current = existingByKey.get(key);
    if (!current) { add.push(wanted); continue; }
    const textChanged = labelPlainText(current) !== labelPlainText(wanted);
    const attachmentChanged = String(current.attachedTo || "") !== String(wanted.attachedTo || "");
    const positionChanged = !sameHudPosition(current.position, wanted.position);
    const visibleChanged = current.visible !== wanted.visible;
    if (textChanged || attachmentChanged || positionChanged || visibleChanged) update.push(current);
  }
  if (update.length) {
    await OBR.scene.local.updateItems(update, items => {
      for (const item of items) {
        const wanted = desiredByKey.get(hudMetadataValue(item));
        if (!wanted) continue;
        item.text = wanted.text;
        item.position = wanted.position;
        item.attachedTo = wanted.attachedTo;
        item.visible = wanted.visible;
        item.style = wanted.style;
      }
    });
  }
  if (add.length) await OBR.scene.local.addItems(add);
  if (deleteIds.length) await OBR.scene.local.deleteItems(deleteIds);
}

async function renderHuds() {
  try {
    if (!await OBR.scene.isReady()) return;
    const sceneMd = await OBR.scene.getMetadata();
      scheduleTravelBackgroundSync(sceneMd);
    const onlinePlayers = [await currentAsPlayer(), ...party], playerMap = new Map(onlinePlayers.map(p => [p.id, p]));
    const persisted = sceneMd[SCENE_PLAYER_SHEETS_KEY] && typeof sceneMd[SCENE_PLAYER_SHEETS_KEY] === "object" ? sceneMd[SCENE_PLAYER_SHEETS_KEY] : {};
    for (const [id, rec] of Object.entries(persisted)) {
      const existing = playerMap.get(id), saved = rec?.sheet;
      if (!saved) continue;
      const onlineRaw = existing?.metadata?.[META_KEY];
      if (!existing || (Number(saved.updatedAt)||0) > (Number(onlineRaw?.updatedAt)||0)) playerMap.set(id, { id, name: rec.ownerName || saved.name || "PLAYER", role: "PLAYER", metadata: { ...(existing?.metadata || {}), [META_KEY]: saved } });
    }
    const players = [...playerMap.values()], labels = [], seenCrisisKeys = new Set();
    const combat = sceneMd[SCENE_COMBAT_KEY] || {}, activeKey = combat?.started ? String(combat.activeKey || "") : "";
    await syncCanvasTextLinks(players);
    for (const p of players) {
      const raw = p.metadata?.[META_KEY]; if (!raw || raw.deleted) continue; const s = normalize(raw), crisisKey = `player:${p.id}`;
      seenCrisisKeys.add(crisisKey); trackCrisis(crisisKey, s);
      if (!s.linkedTokenId) continue; const token = (await OBR.scene.items.getItems([s.linkedTokenId]))[0]; if (!token) continue;
      const debuffs = playerTokenDebuffs(s);
      if (s.showHud !== false && debuffs) labels.push(buildPlayerDebuffLabel(token, debuffs, `player:${p.id}`));
      if (!isPlayerDefeated(s) && activeKey === `player:${p.id}`) labels.push(buildTurnMarkerLabel(token, `player:${p.id}`));
    }
    const monsters = Array.isArray(sceneMd[SCENE_MONSTERS_KEY]) ? sceneMd[SCENE_MONSTERS_KEY] : [];
    for (const m of monsters) {
      const crisisKey = `monster:${m.id}`; seenCrisisKeys.add(crisisKey); trackCrisis(crisisKey, m);
      if (!m?.linkedTokenId) continue; const token = (await OBR.scene.items.getItems([m.linkedTokenId]))[0]; if (!token) continue;
      if (m.showHud !== false) labels.push(buildCompactHudLabel(token, hudText(m, true), true, `monster:${m.id}`));
      if (Number(m.hp?.current) > 0 && activeKey.startsWith(`monster:${m.id}:turn:`)) labels.push(buildTurnMarkerLabel(token, `monster:${m.id}`));
    }
    for (const key of [...crisisState.keys()]) if (!seenCrisisKeys.has(key)) crisisState.delete(key);
    await syncLocalHudLabels(labels);
  } catch (e) { console.warn("Fabula HUD", e); }
}
async function persistMySheet(sheet) {
  try {
    if (!await OBR.scene.isReady()) return;
    const md = await OBR.scene.getMetadata();
    const registry = md[SCENE_PLAYER_SHEETS_KEY] && typeof md[SCENE_PLAYER_SHEETS_KEY] === "object" ? { ...md[SCENE_PLAYER_SHEETS_KEY] } : {};
    const copy = normalize(sheet);
    registry[me.id] = { ownerId: me.id, ownerName: me.name || copy.name || "PLAYER", sheet: copy, updatedAt: Number(copy.updatedAt) || Date.now() };
    await OBR.scene.setMetadata({ [SCENE_PLAYER_SHEETS_KEY]: registry });
  } catch (e) { console.warn("persist player sheet", e); }
}

async function handleEdit(edit) {
  if (!edit || edit.ownerId !== me.id || edit.editorId === me.id) return;
  try {
    const md = await OBR.player.getMetadata(), raw = md[META_KEY]; if (raw?.deleted && edit.op?.kind !== "delete-sheet") return;
    const s = normalize(raw || defaultSheet(me.name)), oldHp = Number(s.hp?.current) || 0;
    applyOp(s, edit.op);
    const reachedZero = !s.deleted && oldHp > 0 && Number(s.hp?.current) <= 0;
    const output = s.deleted ? { deleted: true, updatedAt: Date.now() } : s;
    await OBR.player.setMetadata({ [META_KEY]: output });
    await persistMySheet(output);
    if (!s.deleted && ((edit.op?.kind === "set" && edit.op.path === "hp.current") || (edit.op?.kind === "adjust" && edit.op.path === "hp.current")) && Number(s.hp.current) !== oldHp) {
      const open = await OBR.action.isOpen();
      if (!open) beep(Number(s.hp.current) > oldHp ? "hpup" : "hpdown");
    }
    if (reachedZero) {
      try { await OBR.action.setBadgeText("!"); } catch {}
      await OBR.notification.show(`HP reached 0 — open Fabula and choose Surrender or Sacrifice`, "INFO");
    } else {
      await OBR.notification.show(s.deleted ? `${edit.editorName} deleted your Fabula character sheet` : `${edit.editorName} updated your Fabula sheet`, "INFO");
    }
    scheduleHud();
  } catch (e) { console.warn("remote edit", e); }
}

function normalizeCodexRef(v) { return String(v || "").replace(/\s+#\d+$/i, "").trim().toLowerCase(); }
function updateCodexTemplateLocal(ref = {}) {
  try {
    const template = ref.template || {};
    const idKey = normalizeCodexRef(ref.templateId || template.templateId || template.id);
    const nameKey = normalizeCodexRef(ref.templateName || template.baseName || template.name);
    if (!idKey && !nameKey) return 0;
    const list = JSON.parse(localStorage.getItem(CODEX_KEY) || "[]");
    let changed = 0;
    const next = (Array.isArray(list) ? list : []).map(entry => {
      const old = entry?.monster || {};
      const entryId = normalizeCodexRef(old.templateId || entry?.key);
      const entryName = normalizeCodexRef(old.baseName || old.name);
      const match = (idKey && (entryId === idKey || normalizeCodexRef(entry?.key) === idKey)) || (!entryId && nameKey && entryName === nameKey);
      if (!match) return entry;

      // Refresh content only. Preserve each player's Codex wrapper (including U.E./NPC grouping)
      // and preserve Study separately for BASE and every Phase.
      const oldPhases = Array.isArray(old.phases) ? old.phases : [];
      const templatePhases = Array.isArray(template.phases) ? template.phases : [];
      const baseTier = monsterTier(old, 0);
      const phaseTiers = templatePhases.map((_, i) => monsterTier(old, i + 1));
      const learnedTier = Math.max(Number(entry.learnedTier) || 0, baseTier, ...phaseTiers);
      const safe = {
        ...template,
        templateId: ref.templateId || template.templateId || template.id || old.templateId || "",
        baseName: template.name || template.baseName || old.baseName || old.name || "MONSTER",
        name: template.name || template.baseName || old.name || "MONSTER",
        studyTier: baseTier,
        phases: templatePhases.map((p, i) => ({ ...p, studyTier: phaseTiers[i] || 0 })),
        activePhase: Math.max(0, Math.min(Number(old.activePhase) || 0, templatePhases.length)),
        specialRules: [], linkedTokenId: "", showHud: false
      };
      changed += 1;
      return { ...entry, learnedTier, monster: safe, updatedAt: Date.now() };
    }).sort((a,z)=>String(a?.monster?.name||"").localeCompare(String(z?.monster?.name||""),undefined,{sensitivity:"base",numeric:true}));
    if (changed) localStorage.setItem(CODEX_KEY, JSON.stringify(next));
    return changed;
  } catch (e) { console.warn("codex template update", e); return 0; }
}

function refreshCodexFromLibrarySnapshot(payload = {}) {
  try {
    const templates = Array.isArray(payload.templates) ? payload.templates : [];
    const byId = new Map(), byName = new Map();
    for (const template of templates) {
      const id = normalizeCodexRef(template.templateId || template.id);
      const name = normalizeCodexRef(template.baseName || template.name);
      if (id) byId.set(id, template);
      if (name) byName.set(name, template);
    }
    const list = JSON.parse(localStorage.getItem(CODEX_KEY) || "[]");
    const next = [];
    for (const entry of Array.isArray(list) ? list : []) {
      const old = entry?.monster || {};
      const entryId = normalizeCodexRef(old.templateId || old.id || entry?.key);
      const entryName = normalizeCodexRef(old.baseName || old.name || entry?.key);
      const template = (entryId && byId.get(entryId)) || (entryName && byName.get(entryName));
      if (!template) continue;
      const templatePhases = Array.isArray(template.phases) ? template.phases : [];
      const baseTier = monsterTier(old, 0);
      const phaseTiers = templatePhases.map((_, i) => monsterTier(old, i + 1));
      const learnedTier = Math.max(Number(entry.learnedTier) || 0, baseTier, ...phaseTiers);
      const safe = {
        ...template,
        templateId: template.templateId || template.id || old.templateId || "",
        baseName: template.name || template.baseName || old.baseName || old.name || "MONSTER",
        name: template.name || template.baseName || old.name || "MONSTER",
        studyTier: baseTier,
        phases: templatePhases.map((p, i) => ({ ...p, studyTier: phaseTiers[i] || 0 })),
        activePhase: Math.max(0, Math.min(Number(old.activePhase) || 0, templatePhases.length)),
        specialRules: [], linkedTokenId: "", showHud: false
      };
      // Preserve each player's local Codex wrapper (group / selected phase / organization).
      next.push({ ...entry, learnedTier, monster: safe, updatedAt: Date.now() });
    }
    next.sort((a,z)=>String(a?.monster?.name||"").localeCompare(String(z?.monster?.name||""),undefined,{sensitivity:"base",numeric:true}));
    localStorage.setItem(CODEX_KEY, JSON.stringify(next));
  } catch (e) { console.warn("codex full refresh", e); }
}

function purgeCodexLocal(ref = {}) {
  try {
    const idKey = normalizeCodexRef(ref.templateId || ref.id);
    const nameKey = normalizeCodexRef(ref.templateName || ref.name || ref.baseName);
    const list = JSON.parse(localStorage.getItem(CODEX_KEY) || "[]");
    const kept = (Array.isArray(list) ? list : []).filter(entry => {
      const m = entry?.monster || {};
      const entryId = normalizeCodexRef(m.templateId || m.id);
      const entryName = normalizeCodexRef(m.baseName || m.name);
      const entryKey = normalizeCodexRef(entry?.key);
      if (idKey && (entryKey === idKey || entryId === idKey)) return false;
      if (nameKey && !entryId && (entryKey === nameKey || entryName === nameKey)) return false;
      return true;
    });
    localStorage.setItem(CODEX_KEY, JSON.stringify(kept));
    const deleted = JSON.parse(localStorage.getItem(CODEX_DELETED_KEY) || "{}");
    if (idKey) deleted[idKey] = 99;
    if (nameKey) deleted[nameKey] = 99;
    localStorage.setItem(CODEX_DELETED_KEY, JSON.stringify(deleted));
  } catch (e) { console.warn("codex purge", e); }
}


let travelBackgroundTimer = null, travelBackgroundItemTimer = null, travelBackgroundSyncChain = Promise.resolve(), travelBackgroundPendingMetadata = null, travelBackgroundHoldUntil = 0;
function bgTravelBlankContent(width=1400,height=900){return{width:Math.max(8,Math.round(Number(width)||1400)),height:Math.max(8,Math.round(Number(height)||900)),url:TRAVEL_BLANK_IMAGE_URL,mime:"image/svg+xml"}}
function bgTravelBlankGrid(width=1400,height=900){const w=Math.max(8,Math.round(Number(width)||1400)),h=Math.max(8,Math.round(Number(height)||900));return{dpi:150,offset:{x:w/2,y:h/2}}}
function bgTravelFrameId(s,slot="MAIN"){return slot==="MAIN"?String(s?.frameId||""):String(s?.groupFrameIds?.[slot]||"")}
function bgTravelSetFrameId(s,slot,id){if(slot==="MAIN")s.frameId=String(id||"");else{s.groupFrameIds=(s.groupFrameIds&&typeof s.groupFrameIds==="object")?s.groupFrameIds:{A:"",B:""};s.groupFrameIds[slot]=String(id||"")}}
function bgTravelCurrent(s,slot="MAIN"){if(!s)return{mapId:"",nodeId:""};if(!s.splitActive||slot==="MAIN")return s.current||{mapId:"",nodeId:""};return s.groups?.[slot]?.current||s.current||{mapId:"",nodeId:""}}
function bgTravelSetCurrent(s,slot,current){const next={mapId:String(current?.mapId||""),nodeId:String(current?.nodeId||"")};if(!s.splitActive||slot==="MAIN"){s.current=next;return;}s.groups=(s.groups&&typeof s.groups==="object")?s.groups:{};s.groups[slot]=s.groups[slot]||{id:slot,current:{...s.current}};s.groups[slot].current=next;if(slot==="A")s.current={...next};}
function bgTravelNodeAt(s,current){const maps=Array.isArray(s?.maps)?s.maps:[],m=maps.find(x=>String(x.id)===String(current?.mapId)),n=m?.nodes?.find(x=>String(x.id)===String(current?.nodeId));return{map:m,node:n}}
function bgTravelActiveState(node){const id=String(node?.activeStateId||"");return id?(Array.isArray(node?.states)?node.states:[]).find(x=>String(x?.id||"")===id)||null:null;}
function bgTravelNodeSource(map,node){const st=bgTravelActiveState(node),sourceId=String(st?.backgroundItemId||node?.backgroundItemId||map?.itemId||""),snapshot=(st?.backgroundSnapshot&&st.backgroundSnapshot.url?st.backgroundSnapshot:(node?.backgroundSnapshot&&node.backgroundSnapshot.url?node.backgroundSnapshot:null));return{state:st,sourceId,snapshot};}
function bgTravelLinks(node){const seen=new Set(),out=[];for(const l of Object.values(node?.links||{})){const mapId=String(l?.mapId||""),nodeId=String(l?.nodeId||"");if(!mapId||!nodeId)continue;const k=`${mapId}|${nodeId}`;if(seen.has(k))continue;seen.add(k);out.push({mapId,nodeId});}return out;}
function bgTravelTokenTemplate(raw={}){
  const src=raw?.template||raw?.tokenTemplate||raw,image=src?.image||{},url=String(image?.url||"").trim();if(!url)return null;const width=Math.max(1,Number(image.width)||300),height=Math.max(1,Number(image.height)||300),grid=src?.grid||{},off=grid.offset||{};return{name:String(src?.name||"NODE TOKEN"),image:{url,width,height,mime:String(image.mime||"image/png")},grid:{dpi:Math.max(1,Number(grid.dpi)||Math.max(width,height)),offset:{x:Number.isFinite(Number(off.x))?Number(off.x):width/2,y:Number.isFinite(Number(off.y))?Number(off.y):height/2}}};
}
function bgEmbeddedMapForNode(session,node){return (session?.maps||[]).find(m=>(m?.nodes||[]).some(n=>String(n?.id||"")===String(node?.id||"")))||null;}
function bgEmbeddedMeta(session,map,node,rec,slot){return{sessionId:String(session?.id||""),mapId:String(map?.id||""),nodeId:String(node?.id||""),recordId:String(rec?.id||""),slot:String(slot||"MAIN")};}
function bgEmbeddedMetaMatches(meta,session,map,node,rec,slot=null){return!!meta&&String(meta.sessionId||"")===String(session?.id||"")&&String(meta.mapId||"")===String(map?.id||"")&&String(meta.nodeId||"")===String(node?.id||"")&&String(meta.recordId||"")===String(rec?.id||"")&&(!slot||String(meta.slot||"MAIN")===String(slot));}
function bgEmbeddedPlacement(rec,bounds){const left=bounds.center.x-bounds.width/2,top=bounds.center.y-bounds.height/2,rx=bounds.width/Math.max(1,Number(rec?.refWidth)||bounds.width),ry=bounds.height/Math.max(1,Number(rec?.refHeight)||bounds.height);return{position:{x:left+bounds.width*(Number(rec?.u)||0),y:top+bounds.height*(Number(rec?.v)||0)},rotation:Number(rec?.rotation)||0,scale:{x:(Number(rec?.scale?.x)||1)*rx,y:(Number(rec?.scale?.y)||1)*ry}};}
async function bgEmbeddedInstances(session,map,node,rec,slot){try{return await OBR.scene.items.getItems(item=>item?.type==="IMAGE"&&bgEmbeddedMetaMatches(item?.metadata?.[TRAVEL_EMBEDDED_TOKEN_META_KEY],session,map,node,rec,slot));}catch(e){console.warn("Node Token lookup",e);return[];}}
async function bgNodeTokenBounds(session,groupId){const slot=["A","B"].includes(String(groupId))?String(groupId):"MAIN",frameId=bgTravelFrameId(session,slot);if(!frameId)return null;try{const b=await OBR.scene.items.getItemBounds([frameId]);if(!b?.center)return null;return{slot,bounds:{center:{x:Number(b.center.x)||0,y:Number(b.center.y)||0},width:Math.max(1,Number(b.width)||1),height:Math.max(1,Number(b.height)||1)}};}catch(e){console.warn("Node Token bounds",e);return null;}}
async function bgHideNodeTokens(session,node,groupId="MAIN"){
  const list=Array.isArray(node?.embeddedTokens)?node.embeddedTokens:[];if(!list.length)return false;const map=bgEmbeddedMapForNode(session,node);if(!map)return false;const slot=["A","B"].includes(String(groupId))?String(groupId):"MAIN";let ids=[];for(const rec of list){const items=await bgEmbeddedInstances(session,map,node,rec,slot);ids.push(...items.map(x=>String(x.id)));}ids=[...new Set(ids.filter(Boolean))];if(!ids.length)return false;await OBR.scene.items.updateItems(ids,xs=>{for(const x of xs)x.visible=false;});return true;
}
async function bgSpawnHiddenNodeTokens(session,node,groupId="MAIN"){
  const list=Array.isArray(node?.embeddedTokens)?node.embeddedTokens:[];if(!list.length)return false;const map=bgEmbeddedMapForNode(session,node);if(!map)return false;const frame=await bgNodeTokenBounds(session,groupId);if(!frame)return false;let changed=false;
  for(const rec of list){try{let items=await bgEmbeddedInstances(session,map,node,rec,frame.slot),item=items[0]||null;const tpl=bgTravelTokenTemplate(rec?.template||{});if(!tpl)continue;const place=bgEmbeddedPlacement(rec,frame.bounds),meta=bgEmbeddedMeta(session,map,node,rec,frame.slot);if(!item){const token=buildImage(tpl.image,tpl.grid).name(String(rec?.name||tpl.name||"NODE TOKEN")).layer("CHARACTER").position(place.position).rotation(place.rotation).scale(place.scale).visible(false).metadata({[TRAVEL_EMBEDDED_TOKEN_META_KEY]:meta}).build();await OBR.scene.items.addItems([token]);changed=true;}else{await OBR.scene.items.updateItems([item.id],xs=>{for(const x of xs){x.position=place.position;x.rotation=place.rotation;x.scale=place.scale;x.visible=false;x.layer="CHARACTER";x.metadata||={};x.metadata[TRAVEL_EMBEDDED_TOKEN_META_KEY]=meta;}});changed=true;}}catch(e){console.warn("spawn hidden Node Token",e);}}
  return changed;
}
function bgScheduleNodeTokenTransition(session,groupId,fromNode,targetNode){
  // Critical v2.138 invariant: this helper is NEVER awaited by Travel request handling.
  setTimeout(()=>{Promise.race([Promise.allSettled([fromNode?bgHideNodeTokens(session,fromNode,groupId):Promise.resolve(false),targetNode?bgSpawnHiddenNodeTokens(session,targetNode,groupId):Promise.resolve(false)]),new Promise(resolve=>setTimeout(()=>resolve(false),1400))]).catch(e=>console.warn("Node Token transition",e));},0);
}

async function migrateTravelBlankShape(t,s,shape,slot="MAIN"){
  const sx=Math.abs(Number(shape.scale?.x)||1),sy=Math.abs(Number(shape.scale?.y)||1),w=Math.max(8,Math.round((Number(shape.width)||1400)*sx)),h=Math.max(8,Math.round((Number(shape.height)||900)*sy));
  const image=bgTravelBlankContent(w,h),grid=bgTravelBlankGrid(w,h),label=slot==="MAIN"?"MAIN":`GROUP ${slot}`;
  const display=buildImage(image,grid).name(`LYNX TRAVEL ${label} BLANK · ${s.name||"TRAVEL"}`).layer("MAP").position(shape.position||{x:0,y:0}).rotation(Number(shape.rotation)||0).scale({x:1,y:1}).locked(false).visible(true)
    .metadata({...(shape.metadata||{}),[TRAVEL_FRAME_META_KEY]:String(s.id||""),[TRAVEL_DISPLAY_META_KEY]:{blankImage:image,blankGrid:grid,sourceItemId:"",slot}}).build();
  await OBR.scene.items.addItems([display]);await OBR.scene.items.deleteItems([shape.id]);bgTravelSetFrameId(s,slot,display.id);t.revision=Math.max(0,Number(t.revision)||0)+1;
  await OBR.scene.setMetadata({[SCENE_TRAVEL_KEY]:t});await broadcastTravelSyncPayload({senderId:me.id,reason:"blank-upgrade",revision:Number(t.revision)||0,travel:JSON.parse(JSON.stringify(t)),time:Date.now()});
  return display;
}
// v2.125: preserve the Blank image-grid anchor as well as its world-space footprint.
// grid.offset is the image-local origin in Owlbear; it must scale with native pixel dimensions or the
// displayed map appears to slide when a linked source has a different resolution.
function bgTravelResolutionAwareImageSwap(item,desiredImage,slotMeta=null){
  const oldW=Math.max(1,Number(item?.image?.width)||Number(desiredImage?.width)||1),oldH=Math.max(1,Number(item?.image?.height)||Number(desiredImage?.height)||1),rawSX=Number(item?.scale?.x),rawSY=Number(item?.scale?.y),sx=Number.isFinite(rawSX)&&rawSX!==0?rawSX:1,sy=Number.isFinite(rawSY)&&rawSY!==0?rawSY:1,requestedW=Math.round(Number(desiredImage?.width)||0),requestedH=Math.round(Number(desiredImage?.height)||0),nextW=Math.max(1,requestedW||oldW),nextH=Math.max(1,requestedH||oldH),worldW=oldW*Math.abs(sx),worldH=oldH*Math.abs(sy),baseImage=slotMeta?.blankImage||item?.image||{},baseGrid=slotMeta?.blankGrid||item?.grid||{},baseW=Math.max(1,Number(baseImage?.width)||oldW),baseH=Math.max(1,Number(baseImage?.height)||oldH),baseOffX=Number(baseGrid?.offset?.x),baseOffY=Number(baseGrid?.offset?.y),anchorX=Number.isFinite(baseOffX)?baseOffX/baseW:0.5,anchorY=Number.isFinite(baseOffY)?baseOffY/baseH:0.5,currentDpi=Math.max(1,Number(item?.grid?.dpi)||Number(baseGrid?.dpi)||150);
  return{width:nextW,height:nextH,scale:{x:(sx<0?-1:1)*(worldW/nextW),y:(sy<0?-1:1)*(worldH/nextH)},grid:{...(item?.grid||baseGrid||{}),dpi:currentDpi,offset:{x:anchorX*nextW,y:anchorY*nextH}}};
}
function bgTravelDisplayGridMatches(item,desiredImage,slotMeta=null){
  const w=Math.max(1,Math.round(Number(desiredImage?.width)||Number(item?.image?.width)||1)),h=Math.max(1,Math.round(Number(desiredImage?.height)||Number(item?.image?.height)||1)),baseImage=slotMeta?.blankImage||item?.image||{},baseGrid=slotMeta?.blankGrid||item?.grid||{},bw=Math.max(1,Number(baseImage?.width)||w),bh=Math.max(1,Number(baseImage?.height)||h),bx=Number(baseGrid?.offset?.x),by=Number(baseGrid?.offset?.y),ax=Number.isFinite(bx)?bx/bw:0.5,ay=Number.isFinite(by)?by/bh:0.5,ox=Number(item?.grid?.offset?.x),oy=Number(item?.grid?.offset?.y);
  return Number.isFinite(ox)&&Number.isFinite(oy)&&Math.abs(ox-ax*w)<0.01&&Math.abs(oy-ay*h)<0.01;
}
async function syncTravelBackground(md = null) {
  if (me.role !== "GM") return;
  if(md) travelBackgroundPendingMetadata=md;
  const run=async()=>{
    if(!await OBR.scene.isReady())return;
    const nextMd=travelBackgroundPendingMetadata||md;travelBackgroundPendingMetadata=null;
    try {
    const workMd=nextMd||await OBR.scene.getMetadata();
    const t=workMd?.[SCENE_TRAVEL_KEY];if(!t||!Array.isArray(t.sessions))return;
    const s=t.sessions.find(x=>String(x.id)===String(t.activeSessionId))||t.sessions[0];if(!s)return;
    const desired=s.splitActive?[["MAIN",null],["A",bgTravelCurrent(s,"A")],["B",bgTravelCurrent(s,"B")]]:[["MAIN",bgTravelCurrent(s,"MAIN")],["A",null],["B",null]];
    const ids=new Set();const details=[];
    for(const [slot,cur] of desired){const fid=bgTravelFrameId(s,slot);if(fid)ids.add(fid);let map=null,node=null,sourceId="",snapshot=null,state=null;if(cur){({map,node}=bgTravelNodeAt(s,cur));const src=bgTravelNodeSource(map,node);sourceId=src.sourceId;snapshot=src.snapshot;state=src.state;if(sourceId)ids.add(sourceId);}details.push({slot,cur,fid,map,node,state,sourceId,snapshot});}
    if(!ids.size)return;const items=await OBR.scene.items.getItems([...ids]),byId=new Map(items.map(x=>[String(x.id),x]));
    for(const d of details){let frame=byId.get(String(d.fid||""));if(!frame)continue;if(frame.type==="SHAPE")frame=await migrateTravelBlankShape(t,s,frame,d.slot);if(!frame||frame.type!=="IMAGE")continue;const source=byId.get(d.sourceId),oldSlot=frame.metadata?.[TRAVEL_DISPLAY_META_KEY]||{},blank=oldSlot.blankImage||bgTravelBlankContent(frame.image?.width,frame.image?.height),snap=d.snapshot&&d.snapshot.url?d.snapshot:null,desiredImage=source?.type==="IMAGE"?source.image:(snap?{url:String(snap.url),mime:String(snap.mime||"image/png"),width:Number(snap.width)||0,height:Number(snap.height)||0}:blank),sourceId=String(source?.id||d.sourceId||""),sourceName=String(source?.name||snap?.name||d.state?.name||d.node?.name||"NODE"),label=d.slot==="MAIN"?"MAIN":`GROUP ${d.slot}`;
      const desiredW=Math.round(Number(desiredImage?.width)||0),desiredH=Math.round(Number(desiredImage?.height)||0),same=String(frame.image?.url||"")===String(desiredImage?.url||"")&&String(frame.image?.mime||"")===String(desiredImage?.mime||"")&&(!desiredW||Number(frame.image?.width)===desiredW)&&(!desiredH||Number(frame.image?.height)===desiredH)&&bgTravelDisplayGridMatches(frame,desiredImage,{...oldSlot,blankImage:blank})&&String(oldSlot.sourceItemId||"")===sourceId&&frame.visible!==false;
      if(!same)await OBR.scene.items.updateItems([frame],xs=>{for(const x of xs){const resolution=bgTravelResolutionAwareImageSwap(x,desiredImage,{...oldSlot,blankImage:blank});x.image={...(x.image||{}),url:String(desiredImage?.url||TRAVEL_BLANK_IMAGE_URL),mime:String(desiredImage?.mime||"image/svg+xml"),width:resolution.width,height:resolution.height};x.grid=resolution.grid;x.scale=resolution.scale;x.visible=true;x.metadata||={};x.metadata[TRAVEL_FRAME_META_KEY]=String(s.id||"");x.metadata[TRAVEL_DISPLAY_META_KEY]={...oldSlot,blankImage:blank,blankGrid:oldSlot.blankGrid||bgTravelBlankGrid(x.image?.width,x.image?.height),sourceItemId:sourceId,slot:d.slot};x.name=(source||snap)?`LYNX TRAVEL ${label} DISPLAY · ${d.node?.name||sourceName}`:`LYNX TRAVEL ${label} BLANK · ${s.name||"TRAVEL"}`;}});
    }
    // MAIN / A / B display slots stay at their pre-positioned canvas locations. Source Background items are read-only templates.
    } catch(e) { console.warn("travel background sync",e); }
  };
  travelBackgroundSyncChain=(travelBackgroundSyncChain||Promise.resolve()).then(run,run);
  return travelBackgroundSyncChain;
}
function scheduleTravelBackgroundSync(md = null) { if(md)travelBackgroundPendingMetadata=md;clearTimeout(travelBackgroundTimer);const delay=Math.max(35,(Number(travelBackgroundHoldUntil)||0)-Date.now());travelBackgroundTimer=setTimeout(()=>syncTravelBackground(travelBackgroundPendingMetadata),delay); }

function travelFxSleep(ms){return new Promise(r=>setTimeout(r,ms));}
// v2.127: Crossfade is anchored to each client's current Owlbear viewport, NOT to the Blank item.
// Blank items intentionally change native resolution / scale / grid.offset, so using their bounds for FX
// can drift after a resolution-aware swap. Screen corners transformed back into scene coordinates are stable
// regardless of where MAIN / A / B Blank slots were pre-positioned.
async function travelViewportFadeBounds(frameId=""){
  try{
    const [vw,vh]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight()]);
    if(Number(vw)>0&&Number(vh)>0){
      const pts=await Promise.all([
        OBR.viewport.inverseTransformPoint({x:0,y:0}),
        OBR.viewport.inverseTransformPoint({x:Number(vw),y:0}),
        OBR.viewport.inverseTransformPoint({x:Number(vw),y:Number(vh)}),
        OBR.viewport.inverseTransformPoint({x:0,y:Number(vh)})
      ]);
      const xs=pts.map(p=>Number(p?.x)).filter(Number.isFinite),ys=pts.map(p=>Number(p?.y)).filter(Number.isFinite);
      if(xs.length===4&&ys.length===4){
        const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=Math.max(8,maxX-minX),h=Math.max(8,maxY-minY);
        // Overscan prevents a fast pan/zoom during the ~400 ms fade from exposing an edge.
        return{center:{x:(minX+maxX)/2,y:(minY+maxY)/2},width:w*2.6,height:h*2.6,zIndex:900000000,source:"viewport"};
      }
    }
  }catch(e){console.warn("travel viewport fade bounds",e);}
  // Compatibility fallback only. Normally v2.127 never needs Blank bounds.
  try{
    if(frameId){
      const [frame]=await OBR.scene.items.getItems([frameId]);
      const bounds=await OBR.scene.items.getItemBounds([frameId]);
      if(frame&&bounds?.center&&Number.isFinite(Number(bounds.width))&&Number.isFinite(Number(bounds.height)))return{center:{x:Number(bounds.center.x)||0,y:Number(bounds.center.y)||0},width:Math.max(8,Number(bounds.width)||8),height:Math.max(8,Number(bounds.height)||8),zIndex:(Number(frame.zIndex)||0)+100000,source:"blank-fallback"};
    }
  }catch(e){console.warn("travel blank fade fallback",e);}
  return null;
}
const travelLocalFadeRuns=new Map();
async function handleTravelMoveFx(fx={}){
  const frameId=String(fx.frameId||"");if(!await OBR.scene.isReady())return;
  const fxId=String(fx.fxId||fx.requestId||`${frameId||"viewport"}|${Number(fx.time)||Date.now()}`);if(travelLocalFadeRuns.has(fxId))return;
  const run=(async()=>{
    let overlay=null;
    try{
      const fadeDelay=Math.max(0,Math.min(700,Number(fx.fadeDelay)||200));
      if(fadeDelay)await travelFxSleep(fadeDelay);
      const bounds=await travelViewportFadeBounds(frameId);if(!bounds)return;
      overlay=buildShape().name("LYNX TRAVEL VIEWPORT CROSSFADE").width(bounds.width).height(bounds.height).shapeType("RECTANGLE").fillColor("#05090d").fillOpacity(0).strokeColor("#05090d").strokeOpacity(0).strokeWidth(0).layer("MAP").position(bounds.center).zIndex(bounds.zIndex).disableAutoZIndex(true).locked(true).disableHit(true).build();
      await OBR.scene.local.addItems([overlay]);
      for(const a of [0.18,0.42,0.66,0.88]){await OBR.scene.local.updateItems([overlay.id],xs=>{for(const x of xs){x.style={...(x.style||{}),fillOpacity:a};}});await travelFxSleep(50);}
      for(const a of [0.66,0.42,0.18,0]){await OBR.scene.local.updateItems([overlay.id],xs=>{for(const x of xs){x.style={...(x.style||{}),fillOpacity:a};}});await travelFxSleep(50);}
    }catch(e){console.warn("travel local crossfade",e);}finally{if(overlay?.id){try{await OBR.scene.local.deleteItems([overlay.id]);}catch{}}travelLocalFadeRuns.delete(fxId);}
  })();
  travelLocalFadeRuns.set(fxId,run);
  await run;
}


async function travelHostIsGM() {
  if (me.role === "GM") return true;
  try { me.role = await Promise.race([OBR.player.getRole(), new Promise((_,reject)=>setTimeout(()=>reject(new Error("role timeout")),2500))]); }
  catch(e) { console.warn("travel host role",e); }
  return me.role === "GM";
}
function travelWithTimeout(promise, ms, label) {
  return Promise.race([promise, new Promise((_, reject)=>setTimeout(()=>reject(new Error(`${label||"Travel operation"} timed out`)), ms))]);
}
function bgNormalizeTravelApproval(raw={}){const seen=new Set(),requests=[];for(const x of (Array.isArray(raw?.requests)?raw.requests:[])){const id=String(x?.requestId||"");if(!id||seen.has(id))continue;seen.add(id);requests.push({...x,requestId:id,senderId:String(x?.senderId||""),sessionId:String(x?.sessionId||""),groupId:String(x?.groupId||"MAIN"),time:Number(x?.time)||Date.now()});}return{enabled:!!raw?.enabled,revision:Math.max(0,Number(raw?.revision)||0),requests:requests.slice(-30)};}
function bgTravelValidateRequest(t,req={}){
  const session=t&&Array.isArray(t.sessions)?t.sessions.find(x=>String(x.id)===String(req.sessionId)):null;if(!session||String(t.activeSessionId||session.id)!==String(session.id))return{ok:false,reason:"move-reject"};
  let groupId="MAIN";if(session.splitActive){const assigned=String(session.memberGroups?.[String(req.senderId||"")]||"A").toUpperCase();groupId=assigned==="B"?"B":"A";}
  const cur=bgTravelCurrent(session,groupId),cm=Array.isArray(session.maps)?session.maps.find(m=>String(m.id)===String(cur?.mapId)):null,cn=cm?.nodes?.find(n=>String(n.id)===String(cur?.nodeId));
  const tm=Array.isArray(session.maps)?session.maps.find(m=>String(m.id)===String(req.targetMapId||"")):null,tn=tm?.nodes?.find(n=>String(n.id)===String(req.targetNodeId||""));
  const link=(cn&&bgTravelLinks(cn).find(l=>String(l?.mapId)===String(req.targetMapId||"")&&String(l?.nodeId)===String(req.targetNodeId||"")))||(tn&&bgTravelLinks(tn).find(l=>String(l?.mapId)===String(cur?.mapId||"")&&String(l?.nodeId)===String(cur?.nodeId||"")));
  const originMatches=(!req.fromMapId||String(cur?.mapId||"")===String(req.fromMapId))&&(!req.fromNodeId||String(cur?.nodeId||"")===String(req.fromNodeId));
  return{ok:!!(originMatches&&link&&tm&&tn&&!tn.locked),reason:"move-reject",session,groupId,cur,cm,cn,tm,tn};
}
async function bgSetApprovalBadge(count){try{await OBR.action.setBadgeText(count?String(Math.min(99,count)):"");}catch{}}
const travelMoveReplies = new Map();
const travelMoveSeen = new Set();
function travelReplyPayload(t, senderId, requestId, accepted, reason = "move") {
  return { senderId, requestId, accepted: !!accepted, reason, revision: Number(t?.revision)||0, travel: JSON.parse(JSON.stringify(t || {})), time: Date.now() };
}
async function broadcastTravelSyncPayload(payload) {
  try { await OBR.broadcast.sendMessage(CHANNEL, { type: "travel-sync", "travel-sync": payload }, { destination: "ALL" }); } catch(e) { console.warn("travel sync broadcast",e); }
}
async function handleTravelMoveRequest(req = {}, options = {}) {
  const forceApproval=!!options.forceApproval;
  if (!(await travelHostIsGM())) return;
  let ready=false;try{ready=await travelWithTimeout(OBR.scene.isReady(),2500,"Scene ready check");}catch(e){console.warn("travel ready",e);}if(!ready)return;
  const requestId=String(req.requestId||"");
  if(!forceApproval&&requestId && travelMoveReplies.has(requestId)){ await broadcastTravelSyncPayload(travelMoveReplies.get(requestId)); return; }
  if(!forceApproval&&requestId){ if(travelMoveSeen.has(requestId))return; travelMoveSeen.add(requestId); if(travelMoveSeen.size>200){const first=travelMoveSeen.values().next().value;travelMoveSeen.delete(first);} }
  if(!forceApproval){
    try{const gateMd=await travelWithTimeout(OBR.scene.getMetadata(),3500,"Travel approval read"),approval=bgNormalizeTravelApproval(gateMd?.[SCENE_TRAVEL_APPROVAL_KEY]);if(approval.enabled||req.requireApproval){
      const t0=gateMd?.[SCENE_TRAVEL_KEY],v=bgTravelValidateRequest(t0,req);if(!v.ok){const reject=travelReplyPayload(t0||{},String(req.senderId||""),requestId,false,"move-reject");if(requestId)travelMoveReplies.set(requestId,reject);await broadcastTravelSyncPayload(reject);return;}
      let rec=approval.requests.find(x=>String(x.requestId)===requestId);if(!rec){const player=(party||[]).find(x=>String(x?.id||"")===String(req.senderId||""));rec={requestId,senderId:String(req.senderId||""),senderName:String(player?.name||"PLAYER"),sessionId:String(v.session.id||""),groupId:String(v.groupId||"MAIN"),fromMapId:String(v.cm?.id||""),fromNodeId:String(v.cn?.id||""),fromMapName:String(v.cm?.name||""),fromName:String(v.cn?.name||"CURRENT NODE"),targetMapId:String(v.tm?.id||""),targetNodeId:String(v.tn?.id||""),targetMapName:String(v.tm?.name||""),targetName:String(v.tn?.name||"TARGET NODE"),time:Date.now()};approval.requests.push(rec);approval.revision++;await OBR.scene.setMetadata({[SCENE_TRAVEL_APPROVAL_KEY]:approval});}
      try{await OBR.broadcast.sendMessage(CHANNEL,{type:"travel-move-approval-pending","travel-move-approval-pending":{request:rec}},{destination:"ALL"});}catch{}
      try{await OBR.notification.show(`${rec.senderName} requests travel · ${rec.fromName} → ${rec.targetName}`,"INFO");}catch{}await bgSetApprovalBadge(approval.requests.length);await travelApprovalSyncPopup({...gateMd,[SCENE_TRAVEL_APPROVAL_KEY]:approval});return;
    }}catch(e){console.warn("travel approval gate",e);}
  }
  let md,t,accepted=false,reason="move-reject",tokenSession=null,tokenGroup="MAIN",tokenFrom=null,tokenTarget=null;
  try{
    md=await travelWithTimeout(OBR.scene.getMetadata(),3500,"Travel metadata read");
    t=md?.[SCENE_TRAVEL_KEY];
    const session=t&&Array.isArray(t.sessions)?t.sessions.find(x=>String(x.id)===String(req.sessionId)):null;
    if(session&&String(t.activeSessionId||session.id)===String(session.id)){
      let groupId="MAIN";if(session.splitActive){const assigned=String(session.memberGroups?.[String(req.senderId||"")]||"A").toUpperCase();groupId=assigned==="B"?"B":"A";}
      const cur=bgTravelCurrent(session,groupId),cm=Array.isArray(session.maps)?session.maps.find(m=>String(m.id)===String(cur?.mapId)):null,cn=cm?.nodes?.find(n=>String(n.id)===String(cur?.nodeId));
      const tm=Array.isArray(session.maps)?session.maps.find(m=>String(m.id)===String(req.targetMapId||"")):null,tn=tm?.nodes?.find(n=>String(n.id)===String(req.targetNodeId||""));
      // v2.117: edges are undirected. Accept either stored side so legacy one-way directional data
      // still behaves as an undirected route before the GM performs the first migrated save.
      const link=(cn&&bgTravelLinks(cn).find(l=>String(l?.mapId)===String(req.targetMapId||"")&&String(l?.nodeId)===String(req.targetNodeId||"")))||(tn&&bgTravelLinks(tn).find(l=>String(l?.mapId)===String(cur?.mapId||"")&&String(l?.nodeId)===String(cur?.nodeId||"")));
      const originMatches=(!req.fromMapId||String(cur?.mapId||"")===String(req.fromMapId))&&(!req.fromNodeId||String(cur?.nodeId||"")===String(req.fromNodeId));
      if(originMatches&&link&&tm&&tn&&!tn.locked){
        tokenSession=session;tokenGroup=groupId;tokenFrom=cn;tokenTarget=tn;for(const r of (cn?.embeddedTokens||[]))r.shown=false;for(const r of (tn?.embeddedTokens||[])){r.shown=false;r.lastSlot=groupId;}
        const fx={fxId:requestId||`move-fx-${Date.now()}`,requestId,senderId:String(req.senderId||""),sessionId:String(session.id||""),groupId,fromMapId:String(cur?.mapId||""),fromNodeId:String(cur?.nodeId||""),targetMapId:String(tm.id),targetNodeId:String(tn.id),frameId:bgTravelFrameId(session,groupId),duration:TRAVEL_MOVE_FX_MS,fadeDelay:200,swapDelay:400,time:Date.now()};
        travelBackgroundHoldUntil=Math.max(Number(travelBackgroundHoldUntil)||0,Date.now()+400);
        try{await OBR.broadcast.sendMessage(CHANNEL,{type:"travel-move-fx","travel-move-fx":fx},{destination:"ALL"});}catch(e){console.warn("travel move fx broadcast",e);}
        bgTravelSetCurrent(session,groupId,{mapId:String(tm.id),nodeId:String(tn.id)});
        session.discoveredMaps=Array.isArray(session.discoveredMaps)?session.discoveredMaps:[];if(!session.discoveredMaps.map(String).includes(String(tm.id)))session.discoveredMaps.push(String(tm.id));
        session.discoveredNodes=(session.discoveredNodes&&typeof session.discoveredNodes==="object")?session.discoveredNodes:{};session.discoveredNodes[tm.id]=Array.isArray(session.discoveredNodes[tm.id])?session.discoveredNodes[tm.id]:[];if(!session.discoveredNodes[tm.id].map(String).includes(String(tn.id)))session.discoveredNodes[tm.id].push(String(tn.id));
        session.memberLocations=(session.memberLocations&&typeof session.memberLocations==="object")?session.memberLocations:{};for(const [owner,rec] of Object.entries(session.memberLocations)){const assigned=session.splitActive?String(session.memberGroups?.[owner]||"A").toUpperCase():"MAIN";if(session.splitActive&&assigned!==groupId)continue;if(rec){rec.mapId=String(tm.id);rec.nodeId=String(tn.id);rec.updatedAt=Date.now();}}
        t.revision=Math.max(0,Number(t.revision)||0)+1;
        await travelWithTimeout(OBR.scene.setMetadata({[SCENE_TRAVEL_KEY]:t}),3500,"Travel metadata save");
        accepted=true;reason="move";
      }
    }
  }catch(e){console.warn("travel move request",e);reason="move-error";}
  const payload=travelReplyPayload(t||{},String(req.senderId||""),requestId,accepted,reason);
  if(requestId){travelMoveReplies.set(requestId,payload);if(travelMoveReplies.size>200)travelMoveReplies.delete(travelMoveReplies.keys().next().value);}
  // ACK first. Background image replacement must never block player movement/UI sync.
  await broadcastTravelSyncPayload(payload);
  if(accepted){ scheduleTravelBackgroundSync(md&&t?{...md,[SCENE_TRAVEL_KEY]:t}:null); bgScheduleNodeTokenTransition(tokenSession,tokenGroup,tokenFrom,tokenTarget); }
}

async function handleTravelApprovalDecision(msg={}){
  if(!(await travelHostIsGM())||!await OBR.scene.isReady())return;if(String(msg.senderId||"")!==String(me.id||""))return;const requestId=String(msg.requestId||"");if(!requestId)return;
  try{const md=await OBR.scene.getMetadata(),approval=bgNormalizeTravelApproval(md?.[SCENE_TRAVEL_APPROVAL_KEY]),idx=approval.requests.findIndex(x=>String(x.requestId)===requestId);if(idx<0)return;const req=approval.requests[idx];approval.requests.splice(idx,1);approval.revision++;await OBR.scene.setMetadata({[SCENE_TRAVEL_APPROVAL_KEY]:approval});await bgSetApprovalBadge(approval.requests.length);await travelApprovalSyncPopup({...md,[SCENE_TRAVEL_APPROVAL_KEY]:approval});
    if(msg.approved){await handleTravelMoveRequest(req,{forceApproval:true});}
    else{const t=md?.[SCENE_TRAVEL_KEY]||{};const payload=travelReplyPayload(t,String(req.senderId||""),requestId,false,"approval-denied");travelMoveReplies.set(requestId,payload);await broadcastTravelSyncPayload(payload);}
  }catch(e){console.warn("travel approval decision",e);}
}
const travelSplitSeen=new Set();
async function handleTravelSplitRequest(req={}){
  if(!(await travelHostIsGM())||!await OBR.scene.isReady())return;const requestId=String(req.requestId||"");if(requestId){if(travelSplitSeen.has(requestId))return;travelSplitSeen.add(requestId);if(travelSplitSeen.size>100)travelSplitSeen.delete(travelSplitSeen.values().next().value);}let t,tokenSession=null,tokenNode=null;
  try{const md=await OBR.scene.getMetadata();t=md?.[SCENE_TRAVEL_KEY];if(!t||!Array.isArray(t.sessions))return;const s=t.sessions.find(x=>String(x.id)===String(req.sessionId||""));let accepted=false;
    if(s&&!s.splitActive&&bgTravelFrameId(s,"A")&&bgTravelFrameId(s,"B")){const cur=bgTravelCurrent(s,"MAIN"),m=s.maps?.find(x=>String(x.id)===String(cur.mapId)),n=m?.nodes?.find(x=>String(x.id)===String(cur.nodeId)),branchCount=bgTravelLinks(n).length;if(m&&n&&branchCount>=2&&String(cur.mapId)===String(req.mapId||"")&&String(cur.nodeId)===String(req.nodeId||"")){for(const r of (n.embeddedTokens||[]))r.shown=false;tokenSession=s;tokenNode=n;s.splitActive=true;s.groups={A:{id:"A",current:{...cur}},B:{id:"B",current:{...cur}}};s.memberGroups={};for(const rec of Object.keys(s.memberLocations||{}))s.memberGroups[String(rec)]="A";try{for(const pl of party||[])if(pl?.id)s.memberGroups[String(pl.id)]="A";}catch{}if(me?.id)s.memberGroups[String(me.id)]="A";if(req.senderId)s.memberGroups[String(req.senderId)]="B";t.revision=Math.max(0,Number(t.revision)||0)+1;await OBR.scene.setMetadata({[SCENE_TRAVEL_KEY]:t});accepted=true;scheduleTravelBackgroundSync({...md,[SCENE_TRAVEL_KEY]:t});}}
    await broadcastTravelSyncPayload(travelReplyPayload(t,String(req.senderId||""),requestId,accepted,accepted?"split":"split-reject"));
    if(accepted&&tokenSession&&tokenNode){bgScheduleNodeTokenTransition(tokenSession,"MAIN",tokenNode,null);bgScheduleNodeTokenTransition(tokenSession,"A",null,tokenNode);bgScheduleNodeTokenTransition(tokenSession,"B",null,tokenNode);}
  }catch(e){console.warn("travel split request",e);if(t)await broadcastTravelSyncPayload(travelReplyPayload(t,String(req.senderId||""),requestId,false,"split-reject"));}
}

const travelPresenceSeen = new Set();
async function handleTravelPresenceRequest(req = {}) {
  if (me.role !== "GM" || !await OBR.scene.isReady()) return;
  const requestId=String(req.requestId||"");
  if(requestId){if(travelPresenceSeen.has(requestId))return;travelPresenceSeen.add(requestId);if(travelPresenceSeen.size>200){const first=travelPresenceSeen.values().next().value;travelPresenceSeen.delete(first);}}
  let t;
  try{
    const md=await OBR.scene.getMetadata();t=md?.[SCENE_TRAVEL_KEY];if(!t||!Array.isArray(t.sessions))return;
    const session=t.sessions.find(x=>String(x.id)===String(req.sessionId||""));let accepted=false;
    if(session && String(t.activeSessionId||session.id)===String(session.id)){
      const map=Array.isArray(session.maps)?session.maps.find(m=>String(m.id)===String(req.mapId||"")):null;
      const node=map?.nodes?.find(n=>String(n.id)===String(req.nodeId||""));
      const visited=(Array.isArray(session.discoveredNodes?.[map?.id])?session.discoveredNodes[map.id]:[]).map(String).includes(String(node?.id||""));
      if(map&&node&&visited&&req.senderId){
        session.memberLocations=(session.memberLocations&&typeof session.memberLocations==="object")?session.memberLocations:{};
        const ownerId=String(req.senderId), action=String(req.action||"set").toLowerCase(), old=session.memberLocations[ownerId];
        if(action==="remove"){
          if(old&&String(old.mapId)===String(map.id)&&String(old.nodeId)===String(node.id))delete session.memberLocations[ownerId];
          accepted=true;
        }else{
          session.memberLocations[ownerId]={ownerId,mapId:String(map.id),nodeId:String(node.id),name:String(req.name||"CHARACTER").slice(0,100),portrait:String(req.portrait||"").slice(0,2000),updatedAt:Date.now()};
          accepted=true;
        }
        if(accepted){t.revision=Math.max(0,Number(t.revision)||0)+1;await OBR.scene.setMetadata({[SCENE_TRAVEL_KEY]:t});}
      }
    }
    await broadcastTravelSyncPayload(travelReplyPayload(t,String(req.senderId||""),requestId,accepted,accepted?"presence":"presence-reject"));
  }catch(e){console.warn("travel presence request",e);if(t)await broadcastTravelSyncPayload(travelReplyPayload(t,String(req.senderId||""),requestId,false,"presence-reject"));}
}

function mainTokenHudSelectionSignature(ids = []) {
  return (Array.isArray(ids) ? ids : []).map(String).sort().join("|");
}
function mainTokenHudBestSheet(...rows) {
  return rows.filter(Boolean).sort((a,b)=>(Number(b?.updatedAt)||0)-(Number(a?.updatedAt)||0))[0] || null;
}
function playerTokenQuickMenuEnabled() {
  try { return localStorage.getItem(PLAYER_TOKEN_QUICK_MENU_KEY) === "1"; }
  catch { return false; }
}
async function mainTokenHudActorForToken(tokenId = "") {
  const wanted = String(tokenId || "");
  if (!wanted || !await OBR.scene.isReady()) return null;
  try {
    const [selfMd, sceneMd] = await Promise.all([OBR.player.getMetadata(), OBR.scene.getMetadata()]);
    const registry = sceneMd?.[SCENE_PLAYER_SHEETS_KEY] || {};
    const allowPlayerTokenMenu = playerTokenQuickMenuEnabled();
    const ownRaw = selfMd?.[META_KEY];
    if (allowPlayerTokenMenu && ownRaw && !ownRaw.deleted && String(ownRaw.linkedTokenId || "") === wanted) {
      return { kind: "player", id: String(me.id), tokenId: wanted, name: ownRaw.name || me.name || "CHARACTER" };
    }
    if (allowPlayerTokenMenu && me.role === "GM") {
      const ids = new Set([...(party || []).map(p => String(p.id)), ...Object.keys(registry || {})]);
      for (const id of ids) {
        const p = (party || []).find(x => String(x.id) === id);
        const raw = mainTokenHudBestSheet(p?.metadata?.[META_KEY], registry?.[id]?.sheet);
        if (raw && !raw.deleted && String(raw.linkedTokenId || "") === wanted) return { kind: "player", id, tokenId: wanted, name: raw.name || p?.name || registry?.[id]?.ownerName || "CHARACTER" };
      }
    }
    // V3.0.1: a Player selecting a linked Monster gets the restricted HINDER / STUDY HUD.
    // GM still receives the full Monster Action HUD.
    for (const raw of Array.isArray(sceneMd?.[SCENE_MONSTERS_KEY]) ? sceneMd[SCENE_MONSTERS_KEY] : []) {
      if (String(raw?.linkedTokenId || "") !== wanted) continue;
      return { kind: "monster", id: String(raw.id), tokenId: wanted, name: monsterPhaseView(raw)?.name || raw.name || "MONSTER", limited: me.role !== "GM" };
    }
  } catch (e) { console.warn("main token hud actor", e); }
  return null;
}
async function mainTokenHudActuallyOpen() {
  if (!mainTokenHudOpen) return false;
  try { return Number(await OBR.popover.getWidth(MAIN_TOKEN_HUD_POPOVER_ID)) > 0; }
  catch { mainTokenHudOpen = false; mainTokenHudTokenId = ""; mainTokenHudActorKind = ""; return false; }
}
async function openMainTokenHud(tokenId = "") {
  const actor = await mainTokenHudActorForToken(tokenId);
  if (!actor) return false;
  try {
    const [items, vw, vh] = await Promise.all([
      OBR.scene.items.getItems([String(tokenId)]), OBR.viewport.getWidth(), OBR.viewport.getHeight()
    ]);
    const viewport={width:Math.max(320,Number(vw)||900),height:Math.max(240,Number(vh)||700)};
    const surface=companionHudSafeSurface(viewport,Math.max(360,Math.min(720,viewport.width-20)),300);
    const width = surface.width;
    const height = Math.min(Math.max(360, Math.min(650, Number(vh || 700) - 20)),Math.max(1,surface.maxTop-surface.safeTop));
    let screen = { x: 20, y: 100 };
    const token = items?.[0];
    if (token?.position) { try { screen = await OBR.viewport.transformPoint(token.position); } catch {} }
    let left = Number(screen?.x) || 20;
    let top = (Number(screen?.y) || 100) - 100;
    if (left + width + 80 <= Number(vw || 900)) left += 54;
    else left -= width + 54;
    left = Math.max(surface.safeLeft, Math.min(left, Math.max(surface.safeLeft, Number(vw || 900) - width - 8)));
    top = companionHudSurfaceTop(surface,viewport,height,top);
    try { await OBR.popover.close(MAIN_TOKEN_HUD_POPOVER_ID); } catch {}
    await OBR.popover.open({
      id: MAIN_TOKEN_HUD_POPOVER_ID,
      url: `/token-action-hud.html?token=${encodeURIComponent(String(tokenId))}${actor.limited ? `&mode=hinder-study&monster=${encodeURIComponent(String(actor.id || ""))}` : ""}`,
      width, height,
      anchorReference: "POSITION",
      anchorPosition: { left, top },
      anchorOrigin: { horizontal: "LEFT", vertical: "TOP" },
      transformOrigin: { horizontal: "LEFT", vertical: "TOP" },
      hidePaper: true,
      disableClickAway: true
    });
    mainTokenHudOpen = true;
    mainTokenHudTokenId = String(tokenId);
    mainTokenHudActorKind = String(actor.kind || "");
    mainTokenHudDismissedSig = "";
    return true;
  } catch (e) { console.warn("open main token hud", e); mainTokenHudOpen = false; mainTokenHudTokenId = ""; mainTokenHudActorKind = ""; return false; }
}
async function syncMainTokenHudSelection(selection = null, force = false) {
  if (!await OBR.scene.isReady()) return;
  const ids = Array.isArray(selection) ? selection : (await OBR.player.getSelection() || []);
  const sig = mainTokenHudSelectionSignature(ids);
  const changed = sig !== mainTokenHudSelectionSig;
  mainTokenHudSelectionSig = sig;
  if (changed && mainTokenHudDismissedSig && sig !== mainTokenHudDismissedSig) mainTokenHudDismissedSig = "";
  if (await mainTokenHudActuallyOpen()) return; // Actor remains pinned while map selection is reused as target selection.
  if (!force && (!changed || (sig && sig === mainTokenHudDismissedSig))) return;
  for (const id of ids) if (await mainTokenHudActorForToken(id)) { await openMainTokenHud(id); return; }
}
function scheduleMainTokenHudSelection(selection = null, delay = 35, force = false) {
  clearTimeout(mainTokenHudTimer);
  mainTokenHudTimer = setTimeout(() => syncMainTokenHudSelection(selection, force).catch(e => console.warn("main token hud selection", e)), Math.max(0, Number(delay) || 0));
}

let hudLocalResultBus = null;
const hudLocalSeen = new Set();
const hudLocalAcked = new Set();
function hudLocalEventId(data={}){const p=data?.[data?.type]||{};return String(data?._localEventId||p?.id||"");}
async function handleHudLocalResult(data){
  if(!data || String(data.origin||data?.[data.type]?.origin||"")!=="TOKEN_ACTION_HUD") return;
  if(!["roll","share","skill-cutin"].includes(String(data.type||""))) return;
  const payload=data?.[data.type]||{};
  if(String(payload.senderId||"")!==String(me.id||"")) return;
  const id=hudLocalEventId(data);
  if(id && hudLocalSeen.has(id)) return;
  if(id){hudLocalSeen.add(id);if(hudLocalSeen.size>80)hudLocalSeen.delete(hudLocalSeen.values().next().value);}
  if(data.type==="skill-cutin"){await openSkillCutInPopover(payload);return;}
  let open=false; try{open=await OBR.action.isOpen()}catch{}
  if(open){
    // Give the action iframe a brief chance to render and acknowledge the event.
    await new Promise(resolve=>setTimeout(resolve,180));
    if(id && hudLocalAcked.has(id)){hudLocalAcked.delete(id);return;}
  }
  if(data.type==="roll"){
    const r=data.roll||{}; beep(r.critical?"critical":"roll");
    await openCinematicAlert({kind:"roll",...r});
    try{await OBR.notification.show(`${r.label||"ROLL"} · ${Number(r.total)||0}`,"INFO");await OBR.action.setBadgeText(r.critical?"★":"!")}catch{}
  }else if(data.type==="share"){
    const x=data.share||{}; beep("message");
    await openCinematicAlert({kind:"share",...x});
    try{await OBR.notification.show(`${x.title||"FABULA"}`,"INFO");await OBR.action.setBadgeText("!")}catch{}
  }
}
function registerHudLocalResultBus(){
  if(!me.id || hudLocalResultBus) return;
  const key=`${HUD_LOCAL_RESULT_KEY}:${me.id}`;
  try{
    if(typeof BroadcastChannel!=="undefined"){
      hudLocalResultBus=new BroadcastChannel(key);
      hudLocalResultBus.onmessage=e=>{
        const d=e.data||{};
        if(d.type==="hud-result-ack"&&String(d.playerId||"")===String(me.id)){if(d.eventId)hudLocalAcked.add(String(d.eventId));return;}
        handleHudLocalResult(d).catch(err=>console.warn("HUD local result",err));
      };
    } else window.addEventListener("storage",e=>{if(e.key!==key||!e.newValue)return;try{handleHudLocalResult(JSON.parse(e.newValue)).catch(()=>{})}catch{}});
  }catch(e){console.warn("HUD local result bus",e);}
}

let backgroundBroadcastRegistered = false;
let travelMoveRequestQueue = Promise.resolve();
function registerBackgroundBroadcast() {
  if (backgroundBroadcastRegistered) return;
  backgroundBroadcastRegistered = true;
  OBR.broadcast.onMessage(CHANNEL, async e => {
      const d = e.data;
      if (d?.type === "token-hud-ui-opened") { const x=d["token-hud-ui-opened"]||{}; if(String(x.ownerId||"")===String(me.id)){mainTokenHudOpen=true;mainTokenHudTokenId=String(x.tokenId||"");} return; }
      if (d?.type === "token-hud-ui-closed") { const x=d["token-hud-ui-closed"]||{}; if(String(x.ownerId||"")===String(me.id)){mainTokenHudOpen=false;mainTokenHudTokenId="";mainTokenHudActorKind="";mainTokenHudDismissedSig=mainTokenHudSelectionSig||"";} return; }
      if (d?.type === "companion-sfx") { const s=d["companion-sfx"]||{}; if(String(s.senderId||"")!==String(me.id||"")) beep(ownTurnCueForPayload(s)); return; }
      if (d?.type === "edit") return handleEdit(d.edit);
      if (d?.type === "travel-move-fx") { const fx=d["travel-move-fx"]||{}; if(me.role==="GM")travelBackgroundHoldUntil=Math.max(Number(travelBackgroundHoldUntil)||0,Date.now()+Math.max(0,Number(fx.swapDelay)||400)); handleTravelMoveFx(fx).catch(()=>{}); return; }
      if (d?.type === "travel-move-request") { const req=d["travel-move-request"] || {}; travelMoveRequestQueue=(travelMoveRequestQueue||Promise.resolve()).then(()=>handleTravelMoveRequest(req),()=>handleTravelMoveRequest(req)); await travelMoveRequestQueue; return; }
      if (d?.type === "travel-move-approval-decision") { await handleTravelApprovalDecision(d["travel-move-approval-decision"]||{}); return; }
      if (d?.type === "travel-split-request") { const req=d["travel-split-request"]||{}; if(String(req.senderId||"")===String(me.id||""))await handleTravelSplitRequest(req); return; }
      if (d?.type === "travel-presence-request") { await handleTravelPresenceRequest(d["travel-presence-request"] || {}); return; }
      if (d?.type === "skill-cutin") { await openSkillCutInPopover(d["skill-cutin"] || {}); return; }
      if (d?.type === "roll" && d.roll?.isStudy && d.roll?.senderId !== me.id) await autoApplyRemoteStudy(d.roll);
      if (d?.type === "tracker-tick") { const t = d["tracker-tick"] || {}; if (t.senderId !== me.id) { const open = await OBR.action.isOpen(); if (!open) beep("clock"); } return; }
      if (d?.type === "combat-outcome") {
        const o = d["combat-outcome"] || {};
        if (o.senderId !== me.id) {
          const outcome = ["surrender","sacrifice","defeated"].includes(String(o.outcome || "").toLowerCase()) ? String(o.outcome).toLowerCase() : "defeated";
          const open = await OBR.action.isOpen();
          if (!open) {
            beep(outcome);
            await OBR.notification.show(`${o.name || "Combatant"} · ${outcome.toUpperCase()}`, outcome === "sacrifice" ? "ERROR" : "INFO");
            await OBR.action.setBadgeText(outcome === "sacrifice" ? "‼" : "!");
          }
        }
        return;
      }

      if (d?.type === "travel-group-choice-start") { await openTravelGroupActionPrompt(d["travel-group-choice-start"]||{}); return; }
      if (d?.type === "travel-group-choice-cancel" || d?.type === "travel-group-choice-complete") { clearBackgroundTravelGroupPending(d[d.type]?.id||""); return; }
      if (d?.type === "group-check-start") { await openGroupCheckActionPrompt("group-check-start", d["group-check-start"]||{}); return; }
      if (d?.type === "group-check-progress") {
        const p=d["group-check-progress"]||{};
        if(sameId(p.leaderId,me.id)){try{const rec=JSON.parse(localStorage.getItem(GROUP_CHECK_PENDING_KEY)||"null");if(rec?.kind==="group-check-start"&&sameId(rec?.payload?.id,p.id)){rec.payload.responded=Number(p.responded)||0;rec.payload.totalSupporters=Number(p.totalSupporters)||0;rec.payload.successes=Number(p.successes)||0;localStorage.setItem(GROUP_CHECK_PENDING_KEY,JSON.stringify(rec));}}catch{}}
        return;
      }
      if (d?.type === "group-check-final-ready") { await openGroupCheckActionPrompt("group-check-final-ready", d["group-check-final-ready"]||{}); return; }
      if (d?.type === "group-check-cancel") { clearBackgroundGroupCheckPending(d["group-check-cancel"]?.id||""); return; }
      if (d?.type === "gm-broadcast") {
        const g = d["gm-broadcast"] || {};
        if (relevantGMBroadcast(g)) {
          const open = await OBR.action.isOpen();
          if (!open) {
            beep(gmBroadcastSound(g.broadcastType));
            await openGMBroadcastAlert(g);
            await OBR.action.setBadgeText("!");
          }
        }
        return;
      }
      if (d?.type === "loot-card") { await openLootActionPrompt(d["loot-card"]||{}); return; }
      if (d?.type === "codex-library-refresh") { refreshCodexFromLibrarySnapshot(d["codex-library-refresh"] || {}); return; }
      if (d?.type === "codex-template-update") { updateCodexTemplateLocal(d["codex-template-update"] || {}); return; }
      if (d?.type === "codex-template-delete") { purgeCodexLocal(d["codex-template-delete"] || {}); return; }
      let title = "", body = "", kind = "message";
      if (d?.type === "chat" && relevant(d.chat)) { title = d.chat.senderName; body = String(d.chat.text).slice(0, 100); }
      else if (d?.type === "roll" && (d.roll?.senderId !== me.id || ["TOKEN_ACTION_HUD","COMPANION_HUD"].includes(String(d.roll?.origin || d?.origin || "")))) {
        title = `${d.roll.senderName} rolled`;
        const r = d.roll, mod = Number(r.mod) || 0;
        if (rollHasDamage(r)) {
          const high = Number.isFinite(Number(r.highResult)) ? Number(r.highResult) : Math.max(Number(r.d1)||0, Number(r.d2)||0);
          const damageHigh = Number.isFinite(Number(r.damageHighRoll)) ? Number(r.damageHighRoll) : ((r.twoWeapon || String(r.actionCategory || "").toUpperCase() === "TWO WEAPON") ? 0 : high);
          const aff = String(r.affinity||"NORMAL").toUpperCase();
          const affText = aff === "VULNERABILITY" ? ` · VU ${Number(r.adjustedDamage)||0}` : aff === "RESISTANCE" ? ` · RS ${Number(r.adjustedDamage)||0}` : "";
          body = `${r.attr1} ${r.d1} + ${r.attr2} ${r.d2} + MOD ${mod} = ACC ${r.total} · ${r.twoWeapon ? "TWO WEAPON · HR 0" : `HIGH ${damageHigh}`} + DAMAGE BONUS ${Number(r.damageHR)||0} = DMG ${Number(r.damage)||0}${affText}`;
        } else body = `${r.label}: ${r.d1}+${r.d2}${mod ? (mod > 0 ? `+${mod}` : `${mod}`) : ""} = ${r.total}`;
        kind = r.critical ? "critical" : "roll";
      }
      else if (d?.type === "share" && (d.share?.senderId !== me.id || ["TOKEN_ACTION_HUD","COMPANION_HUD"].includes(String(d.share?.origin || d?.origin || "")))) { title = d.share.senderName; body = `${d.share.title} sent to chat`; }
      else if (d?.type === "phase-change" && (d["phase-change"]?.senderId !== me.id || d["phase-change"]?.origin === "COMPANION_DOMINION")) { const p = d["phase-change"]; title = `${p.name || "MONSTER"} · ${p.phaseLabel || "PHASE"}`; body = "FORM CHANGE"; kind = "phase"; }
      if (title) {
        const open = await OBR.action.isOpen();
        if (!open) {
          beep(kind);
          if (d?.type === "roll") await openCinematicAlert({ kind: "roll", ...d.roll });
          else if (d?.type === "share") await openCinematicAlert({ kind: "share", ...d.share });
          else if (d?.type === "phase-change") await openCinematicAlert({ kind: "phase-change", ...d["phase-change"] });
          await OBR.notification.show(`${title}: ${body}`, "INFO");
          await OBR.action.setBadgeText(d?.type === "roll" && d.roll?.critical ? "★" : "!");
        }
      }
    });
}


let companionHudBus = null;
let companionHudActiveMenu = "";
let companionHudSuppressedByMain = false;
let companionHudMainOpen = false;
let companionHudMainModalKnownOpen = false;
let companionHudRedirectingAction = false;
let companionHudTrackerOpen = false;
let companionHudFlowOpen = false;
let companionHudFlowHidTracker = false;
let companionHudTravelOpen = false;
let travelApprovalPopoverRequestId = "";
let companionHudTrackerMode = "";
let companionHudEditQueue = Promise.resolve();
let companionHudMenuSeq = 0;
let companionHudRuntimeViewport={width:900,height:700};
let companionHudRuntimePositions={};
const companionHudMainNavAckWaiters=new Map();
let companionHudDragPreviewOpen=false, companionHudDragPreviewSig="", companionHudDragPreviewAt=0;
let companionHudTrackerPreviewOpen=false, companionHudTrackerPreviewSig="",companionHudTrackerPreviewSeq=0;
let companionHudTrackerPreviewQueue=Promise.resolve();
let clockHologramOpen=false, clockHologramLayoutSig="",clockMilestoneSnapshot=null,clockMilestoneTimer=null,clockMilestoneQueue=Promise.resolve();
let companionHudPrewarmed=false;
function companionHudPrewarmAssets(){
  if(companionHudPrewarmed)return;companionHudPrewarmed=true;
  const urls=["/companion-menu.html","/companion-menu.css","/companion-menu.js","/companion-flow.html","/styles.css","/app.js","/fabula-ai-data.js","/alert.html","/alert.css","/alert.js","/travel-approval.html","/travel-approval.css","/travel-approval.js","/clock-hologram.html","/clock-hologram.css","/clock-hologram.js","/clock-milestone.html","/clock-milestone.css","/clock-milestone.js","/companion-drag-preview.html","/companion-drag-preview.css","/companion-drag-preview.js"];
  Promise.allSettled(urls.map(url=>fetch(url,{cache:"force-cache"}).catch(()=>null))).catch(()=>{});
}
function companionHudWithTimeout(p,ms=1400){return Promise.race([Promise.resolve(p),new Promise((_,reject)=>setTimeout(()=>reject(new Error("COMPANION UI TIMEOUT")),ms))])}
function companionHudButtonId(key) { return `${NS}/companion-hud-button-${key}-v1`; }
function companionHudLoadPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPANION_HUD_PREF_KEY) || "null");
    if (!raw || typeof raw !== "object") return { enabled: false, positions: {}, positionSchema: COMPANION_HUD_POSITION_SCHEMA };
    // v3.0.26: never invalidate saved coordinates just because the extension version changed.
    // Older versioned layouts migrate ONCE to stable-v1; after that updates preserve positions.
    const compatible = raw.positionSchema === COMPANION_HUD_POSITION_SCHEMA;
    return {
      enabled: !!raw.enabled,
      positions: compatible && raw.positions && typeof raw.positions === "object" ? raw.positions : {},
      positionSchema: COMPANION_HUD_POSITION_SCHEMA,
      positionPatch: String(raw.positionPatch || "")
    };
  } catch { return { enabled: false, positions: {}, positionSchema: COMPANION_HUD_POSITION_SCHEMA, positionPatch: "" }; }
}
function companionHudSavePrefs(prefs) {
  try {
    localStorage.setItem(COMPANION_HUD_PREF_KEY, JSON.stringify({
      enabled: !!prefs?.enabled,
      positions: prefs?.positions && typeof prefs.positions === "object" ? prefs.positions : {},
      positionSchema: COMPANION_HUD_POSITION_SCHEMA,
      positionPatch: String(prefs?.positionPatch || "")
    }));
  } catch {}
}
let companionHudViewportCache={time:0,value:{width:900,height:700}};
async function companionHudViewport(force=false) {
  const now=Date.now();
  if(!force&&now-companionHudViewportCache.time<900)return companionHudViewportCache.value;
  try {
    const [width,height]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight()]);
    const value={ width: Math.max(320, Number(width)||900), height: Math.max(240, Number(height)||700) };
    companionHudViewportCache={time:now,value}; companionHudRuntimeViewport=value; return value;
  } catch { return companionHudViewportCache.value||{ width: 900, height: 700 }; }
}
// Initiative is a permanent left-side rail. Every canvas HUD uses the same
// boundary so no shortcut, menu, flow, or token sheet can cover the tracker.
function companionHudTrackerOrientationLocal(){try{return localStorage.getItem(COMPANION_HUD_TRACKER_LAYOUT_KEY)==="horizontal"?"horizontal":"vertical"}catch{return "vertical"}}
function companionHudTrackerPositionsLocal(){try{const positions=JSON.parse(localStorage.getItem(COMPANION_HUD_TRACKER_POSITION_KEY)||"{}");return positions&&typeof positions==="object"?positions:{}}catch{return {}}}
function companionHudTrackerPositionSave(orientation,pos){try{const positions=companionHudTrackerPositionsLocal();positions[orientation]={x:pos.left,y:pos.top};localStorage.setItem(COMPANION_HUD_TRACKER_POSITION_KEY,JSON.stringify(positions))}catch{}}
function companionHudTrackerLayout(vpArg={width:900,height:700},collapsed=false,orientation=companionHudTrackerOrientationLocal()){
  const vp={width:Math.max(320,Number(vpArg?.width)||900),height:Math.max(240,Number(vpArg?.height)||700)};
  const left=8,top=orientation==="horizontal"?10:72;
  const expandedWidth=Math.max(214,Math.min(268,Math.round(vp.width*.27)));
  let width,height,defaultLeft=left,defaultTop=top;
  if(orientation==="horizontal"){
    width=vp.width<980?Math.max(420,Math.min(700,vp.width-24)):Math.max(520,Math.min(820,vp.width-520));
    height=me.role==="GM"?180:132;
    defaultLeft=Math.max(8,Math.round((vp.width-width)/2));
  }else{
    width=expandedWidth;
    height=Math.max(300,Math.min(480,vp.height-top-24));
  }
  const saved=companionHudTrackerPositionsLocal()[orientation];
  const preferredLeft=Number.isFinite(Number(saved?.x))?Number(saved.x):defaultLeft;
  const preferredTop=Number.isFinite(Number(saved?.y))?Number(saved.y):defaultTop;
  const actualWidth=Math.min(collapsed?52:width,vp.width-16);
  const actualHeight=Math.min(collapsed?156:height,vp.height-(orientation==="vertical"?80:16));
  const clampedLeft=Math.max(8,Math.min(vp.width-actualWidth-8,preferredLeft));
  const clampedTop=Math.max(orientation==="vertical"?72:8,Math.min(vp.height-actualHeight-8,preferredTop));
  return {orientation,collapsed,left:clampedLeft,top:clampedTop,width:actualWidth,height:actualHeight,expandedWidth,
    safeLeft:orientation==="vertical"?clampedLeft+actualWidth+12:8,
    safeTop:orientation==="horizontal"?clampedTop+actualHeight+12:8};
}
function companionHudTrackerOverlaps(rect,layout,gap=8){return rect.left<layout.left+layout.width+gap&&rect.left+rect.width>layout.left-gap&&rect.top<layout.top+layout.height+gap&&rect.top+rect.height>layout.top-gap}
function companionHudAvoidTracker(vp,rect,rightInset=8){
  const layout=companionHudTrackerLayout(vp,companionHudTrackerCollapsedLocal());
  const maxX=Math.max(8,vp.width-rect.width-rightInset),maxY=Math.max(8,vp.height-rect.height-8);
  const initial={left:Math.max(8,Math.min(maxX,rect.left)),top:Math.max(8,Math.min(maxY,rect.top)),width:rect.width,height:rect.height};
  if(!companionHudTrackerOverlaps(initial,layout))return initial;
  const candidates=[
    {...initial,left:layout.left+layout.width+10},
    {...initial,left:layout.left-rect.width-10},
    {...initial,top:layout.top+layout.height+10},
    {...initial,top:layout.top-rect.height-10}
  ].filter(p=>p.left>=8&&p.left<=maxX&&p.top>=8&&p.top<=maxY&&!companionHudTrackerOverlaps(p,layout));
  candidates.sort((a,b)=>Math.abs(a.left-initial.left)+Math.abs(a.top-initial.top)-Math.abs(b.left-initial.left)-Math.abs(b.top-initial.top));
  return candidates[0]||initial;
}
function companionHudSafeSurface(vpArg,desiredWidth,minWidth=320){
  const vp=vpArg||{width:900,height:700},layout=companionHudTrackerLayout(vp,companionHudTrackerCollapsedLocal());
  const vertical=layout.orientation==="vertical",start=vertical?(layout.left+layout.width+12):(layout.top+layout.height+12);
  const end=vertical?(layout.left-12):(layout.top-12);
  const after=vertical?vp.width-start-8:vp.height-start-8,before=end-8;
  const useAfter=after>=before;
  const safeLeft=vertical?(useAfter?start:8):8,safeTop=vertical?8:(useAfter?start:8);
  const available=vertical?(useAfter?after:before):vp.width-16;
  const width=Math.min(Math.max(1,Number(desiredWidth)||minWidth),Math.max(1,available));
  const maxTop=vertical?vp.height-8:(useAfter?vp.height-8:end);
  return {safeLeft,safeTop,maxTop,available,width,left:Math.max(safeLeft,safeLeft+Math.round((available-width)/2))};
}
function companionHudSurfaceTop(surface,vp,height,preferred){return Math.max(surface.safeTop,Math.min(Math.max(surface.safeTop,surface.maxTop-height),preferred))}
function clockHologramPinnedRows(md={}){
  const raw=md?.[SCENE_TRACKERS_KEY]||{};
  const rows=[];
  for(const [kind,list] of [["clocks",raw.clocks],["projects",raw.projects]])for(const x of (Array.isArray(list)?list:[]))if(x?.pinned)rows.push({kind,id:String(x.id||"")});
  return rows;
}
async function clockHologramClose(){
  if(!clockHologramOpen&& !clockHologramLayoutSig)return;
  try{await OBR.popover.close(CLOCK_HOLOGRAM_POPOVER_ID)}catch{}
  clockHologramOpen=false;clockHologramLayoutSig="";
}
async function clockHologramSync(mdArg=null){
  try{
    if(!await OBR.scene.isReady()){await clockHologramClose();return;}
    const md=mdArg||await OBR.scene.getMetadata(),rows=clockHologramPinnedRows(md);
    if(!rows.length){await clockHologramClose();return;}
    const vp=await companionHudViewport(),surface=companionHudSafeSurface(vp,Math.max(290,Math.min(390,vp.width-24)),260),width=surface.width;
    const visible=Math.min(rows.length,3),height=Math.min(Math.max(96,Math.min(330,42+visible*80+(rows.length>3?22:0))),Math.max(1,surface.maxTop-surface.safeTop));
    const left=Math.max(surface.safeLeft,Math.min(vp.width-width-92,surface.safeLeft));
    const top=companionHudSurfaceTop(surface,vp,height,Math.min(vp.height-height-64,Math.round(vp.height*0.30)));
    const sig=`${rows.length}:${width}:${height}:${left}:${top}`;
    if(clockHologramOpen&&clockHologramLayoutSig===sig)return;
    if(clockHologramOpen){try{await OBR.popover.close(CLOCK_HOLOGRAM_POPOVER_ID)}catch{}}
    await OBR.popover.open({id:CLOCK_HOLOGRAM_POPOVER_ID,url:"/clock-hologram.html",width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0});
    clockHologramOpen=true;clockHologramLayoutSig=sig;
  }catch(e){console.warn("clock hologram",e);}
}

function clockMilestoneGif(text=""){
  return String(text||"").match(/https?:\/\/[^\s<>"']+?\.gif(?:\?[^\s<>"']*)?/i)?.[0]||"";
}
function clockMilestoneRows(md={}){
  const raw=md?.[SCENE_TRACKERS_KEY]||{},rows=[];
  for(const [kind,list] of [["clocks",raw.clocks],["projects",raw.projects]])for(const x of (Array.isArray(list)?list:[])){
    const segments=Math.max(1,Math.min(12,Number(x?.segments)||6));
    rows.push({key:`${kind}|${String(x?.id||"")}`,kind,id:String(x?.id||""),name:String(x?.name||(kind==="projects"?"PROJECT":"CLOCK")),detail:String(x?.detail||""),segments,progress:Math.max(0,Math.min(segments,Number(x?.progress)||0)),pinned:!!x?.pinned,objective:kind==="clocks"&&!!x?.objective});
  }
  return rows;
}
function clockMilestonePrime(md={}){
  clockMilestoneSnapshot=new Map(clockMilestoneRows(md).map(x=>[x.key,x.progress]));
}
async function clockMilestoneClose(){
  clearTimeout(clockMilestoneTimer);clockMilestoneTimer=null;
  try{await OBR.popover.close(CLOCK_MILESTONE_POPOVER_ID)}catch{}
}
async function clockMilestoneOpen(row){
  await clockMilestoneClose();
  const vp=await companionHudViewport(),surface=companionHudSafeSurface(vp,Math.max(360,Math.min(680,vp.width-24)),300),width=surface.width,height=Math.min(Math.max(180,Math.min(260,vp.height-24)),Math.max(1,surface.maxTop-surface.safeTop));
  const left=surface.left,top=companionHudSurfaceTop(surface,vp,height,Math.round((vp.height-height)/2));
  const q=new URLSearchParams({name:row.name,gif:clockMilestoneGif(row.detail),segments:String(row.segments),objective:row.objective?"1":"0",t:String(Date.now())});
  await OBR.popover.open({id:CLOCK_MILESTONE_POPOVER_ID,url:`/clock-milestone.html?${q}`,width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0});
  clockMilestoneTimer=setTimeout(()=>{OBR.popover.close(CLOCK_MILESTONE_POPOVER_ID).catch(()=>{});clockMilestoneTimer=null},2900);
}
function clockMilestoneObserve(md={}){
  const rows=clockMilestoneRows(md),next=new Map(rows.map(x=>[x.key,x.progress]));
  if(clockMilestoneSnapshot){
    const completed=rows.filter(x=>x.pinned&&x.progress>=x.segments&&x.progress>(clockMilestoneSnapshot.get(x.key)??x.progress));
    for(const row of completed)clockMilestoneQueue=clockMilestoneQueue.then(()=>clockMilestoneOpen(row)).catch(e=>console.warn("clock milestone",e));
  }
  clockMilestoneSnapshot=next;
}

async function companionHudDefaultPositions(vpArg=null) {
  const vp=vpArg||await companionHudViewport(),out={},edge=12,gap=8;
  const def=k=>COMPANION_HUD_BUTTONS.find(x=>x.key===k);
  const trackerSafeLeft=companionHudSafeSurface(vp,260).safeLeft;

  // stable-v1 · canonical visual zones. This layout is a reset target, not a release migration.
  // LEFT RAIL: Initiative Tracker only. Utilities begin after its protected lane.
  // RIGHT: roll/gear/system controls and action pad. Existing user coordinates are never
  // replaced by a future release unless the user explicitly presses ↺ ตำแหน่ง.
  out.travel={x:trackerSafeLeft,y:vp.width<980?200:Math.max(66,Math.round(vp.height*0.075))};
  const sharedY=out.travel.y+def("travel").height+10;
  let sx=trackerSafeLeft;
  for(const k of ["clock","codex","shop","notes"]){out[k]={x:sx,y:sharedY};sx+=def(k).width+gap;}
  const gmRow=["broadcast","groupcheck","loot","dominion"],gmY=Math.max(edge,vp.height-Math.max(...gmRow.map(k=>def(k).height))-16);let gx=trackerSafeLeft;
  for(const k of gmRow){out[k]={x:gx,y:gmY};gx+=def(k).width+gap;}

  const topRow=["roll","equipment","spheres","bond"];
  const topW=topRow.reduce((n,k)=>n+def(k).width,0)+gap*(topRow.length-1);
  const safeRight=vp.width>=1200?118:(vp.width>=1000?82:18); // match the display clamp so default rows never collapse together
  let tx=Math.max(edge,vp.width-topW-safeRight),ty=12;
  for(const k of topRow){out[k]={x:tx,y:ty};tx+=def(k).width+gap;}

  const sysRow=["settings","vault"];
  const sysW=sysRow.reduce((n,k)=>n+def(k).width,0)+gap*(sysRow.length-1);
  let ux=Math.max(edge,vp.width-sysW-safeRight),uy=ty+Math.max(...topRow.map(k=>def(k).height))+10;
  for(const k of sysRow){out[k]={x:ux,y:uy};ux+=def(k).width+gap;}

  const actionRow=["class","actions","arcana"];
  const actionW=actionRow.reduce((n,k)=>n+def(k).width,0)+gap*(actionRow.length-1);
  const actionX=Math.max(edge,vp.width-actionW-safeRight);
  const clusterCenter=actionX+actionW/2;
  const actionY=Math.max(350,Math.min(vp.height-150,Math.round(vp.height*0.66)));
  const controlRow=["studyhinder","status"];
  const controlW=controlRow.reduce((n,k)=>n+def(k).width,0)+gap*(controlRow.length-1);
  const controlX=Math.max(edge,Math.min(vp.width-controlW-safeRight,clusterCenter-controlW/2));
  const controlY=Math.max(uy+Math.max(...sysRow.map(k=>def(k).height))+14,actionY-Math.max(...controlRow.map(k=>def(k).height))-10);
  let cx=controlX;
  for(const k of controlRow){out[k]={x:cx,y:controlY+Math.max(0,(Math.max(...controlRow.map(x=>def(x).height))-def(k).height)/2)};cx+=def(k).width+gap;}
  let ax=actionX;
  for(const k of actionRow){out[k]={x:ax,y:actionY};ax+=def(k).width+gap;}
  out.items={x:Math.max(edge,Math.min(vp.width-def("items").width-edge,out.actions.x+(def("actions").width-def("items").width)/2)),y:Math.min(vp.height-def("items").height-edge,actionY+def("actions").height+8)};
  out.zero={x:Math.max(edge,Math.min(vp.width-def("zero").width-safeRight,out.arcana.x+(def("arcana").width-def("zero").width)/2)),y:Math.min(vp.height-def("zero").height-edge,actionY+def("arcana").height+8)};
  return out;
}
function companionHudClampPosition(def,pos,vp){
  const rightInset=vp.width>=1000?82:18;
  const placed=companionHudAvoidTracker(vp,{left:Number(pos?.x)||0,top:Number(pos?.y)||0,width:def.width,height:def.height},rightInset);
  return {x:placed.left,y:placed.top};
}
function companionHudHasSavedPosition(pos){
  return !!pos && Number.isFinite(Number(pos.x)) && Number.isFinite(Number(pos.y));
}
async function companionHudResolvedPositions(prefs=null,vpArg=null,defaultsArg=null){
  const p=prefs||companionHudLoadPrefs(),vp=vpArg||await companionHudViewport(),defaults=defaultsArg||await companionHudDefaultPositions(vp),out={};
  // Saved coordinates remain authoritative except when they enter the protected
  // Initiative lane or leave the visible viewport.
  for(const def of COMPANION_HUD_BUTTONS){
    const saved=p.positions?.[def.key];
    out[def.key]=companionHudClampPosition(def,companionHudHasSavedPosition(saved)?saved:defaults[def.key],vp);
  }
  return out;
}
function companionHudPositionsCollapsed(positions={},keys=[]){
  const buckets=new Map();
  for(const key of keys){const pos=positions?.[key];if(!companionHudHasSavedPosition(pos))continue;const sig=`${Math.round(Number(pos.x)/3)}:${Math.round(Number(pos.y)/3)}`;buckets.set(sig,(buckets.get(sig)||0)+1)}
  return [...buckets.values()].some(count=>count>=4);
}
async function companionHudCloseButtons(){
  await Promise.allSettled(COMPANION_HUD_BUTTONS.map(def=>OBR.popover.close(companionHudButtonId(def.key))));
}
async function companionHudCloseDragPreview(){
  if(!companionHudDragPreviewOpen&&!companionHudDragPreviewSig)return;
  try{await OBR.popover.close(`${NS}/companion-hud-drag-preview-v1`)}catch{}
  companionHudDragPreviewOpen=false;companionHudDragPreviewSig="";companionHudDragPreviewAt=0;
}
async function companionHudCloseMenu(){companionHudMenuSeq++;try{await OBR.popover.close(COMPANION_HUD_MENU_ID)}catch{} companionHudActiveMenu="";}
async function companionHudCloseFlow(){
  if(!companionHudFlowOpen)return;
  const restoreTracker=companionHudFlowHidTracker;
  try{await OBR.popover.close(COMPANION_HUD_FLOW_ID)}catch{}finally{companionHudFlowOpen=false;companionHudFlowCommandId="";companionHudFlowHidTracker=false}
  if(restoreTracker&&!companionHudMainOpen)companionHudSyncTracker().catch(()=>{});
}
async function companionHudCloseTracker(){try{await OBR.popover.close(COMPANION_HUD_TRACKER_ID)}catch{} companionHudTrackerOpen=false;companionHudTrackerMode="";}
async function companionHudCloseTrackerPreview(){
  companionHudTrackerPreviewSeq++;
  companionHudTrackerPreviewSig="";
  if(!companionHudTrackerPreviewOpen)return;
  companionHudTrackerPreviewOpen=false;
  try{await OBR.popover.close(COMPANION_HUD_TRACKER_PREVIEW_ID)}catch{}
}
async function companionHudPreviewTrackerMove(dx,dy){
  if(!companionHudTrackerOpen)return;
  const vp=await companionHudViewport(),layout=companionHudTrackerLayout(vp,companionHudTrackerCollapsedLocal());
  const left=Math.max(8,Math.min(vp.width-layout.width-8,layout.left+(Number(dx)||0)));
  const top=Math.max(layout.orientation==="vertical"?72:8,Math.min(vp.height-layout.height-8,layout.top+(Number(dy)||0)));
  const sig=`${Math.round(left/5)}:${Math.round(top/5)}`;
  if(sig===companionHudTrackerPreviewSig)return;
  const seq=++companionHudTrackerPreviewSeq;
  companionHudTrackerPreviewSig=sig;
  try{
    if(companionHudTrackerPreviewOpen)await OBR.popover.close(COMPANION_HUD_TRACKER_PREVIEW_ID);
    if(seq!==companionHudTrackerPreviewSeq)return;
    const width=128,height=60;
    const q=new URLSearchParams({label:"INIT TRACKER",x:String(Math.round(left)),y:String(Math.round(top))});
    await OBR.popover.open({id:COMPANION_HUD_TRACKER_PREVIEW_ID,url:`/companion-drag-preview.html?${q}`,width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0});
    companionHudTrackerPreviewOpen=true;
  }catch(e){console.warn("tracker drag preview",e)}
}
async function companionHudMoveTracker(dx,dy){
  const vp=await companionHudViewport(true),layout=companionHudTrackerLayout(vp,companionHudTrackerCollapsedLocal());
  const left=Math.max(8,Math.min(vp.width-layout.width-8,layout.left+(Number(dx)||0)));
  const top=Math.max(layout.orientation==="vertical"?72:8,Math.min(vp.height-layout.height-8,layout.top+(Number(dy)||0)));
  await companionHudCloseTrackerPreview();
  if(left===layout.left&&top===layout.top)return;
  companionHudTrackerPositionSave(layout.orientation,{left,top});
  await companionHudCloseTracker();
  await Promise.allSettled([companionHudCloseMenu(),companionHudCloseFlow(),companionHudCloseTravel(),clockHologramClose()]);
  if(mainTokenHudOpen){try{await OBR.popover.close(MAIN_TOKEN_HUD_POPOVER_ID)}catch{}mainTokenHudOpen=false;scheduleMainTokenHudSelection(null,60,true)}
  await companionHudSyncButtons();
  await companionHudSyncTracker();
  clockHologramSync().catch(()=>{});
}
async function companionHudCloseTravel(){if(!companionHudTravelOpen)return;try{await OBR.popover.close(COMPANION_HUD_TRAVEL_ID)}catch{}finally{companionHudTravelOpen=false}}
async function travelApprovalClosePopup(){try{await OBR.popover.close(TRAVEL_APPROVAL_POPOVER_ID)}catch{} travelApprovalPopoverRequestId="";}
async function companionHudCloseSurface(){await Promise.allSettled([companionHudCloseMenu(),companionHudCloseButtons(),companionHudCloseTracker(),companionHudCloseTravel(),companionHudCloseDragPreview(),companionHudCloseTrackerPreview()]);}
async function companionHudPrepareForMain(){
  // Keep shortcut buttons alive. Menus and canvas-sized overlays are transient and
  // must close before the main action window takes focus.
  await Promise.allSettled([companionHudCloseFlow(),companionHudCloseMenu(),companionHudCloseTravel(),companionHudCloseDragPreview(),companionHudCloseTrackerPreview(),companionHudCloseTracker(),travelApprovalClosePopup(),clockHologramClose()]);
}
async function companionHudOpenButton(def,pos){
  try{await OBR.popover.close(companionHudButtonId(def.key))}catch{}
  const vp=companionHudRuntimeViewport?.width?companionHudRuntimeViewport:await companionHudViewport();
  const buttonUrl=`/companion-button.html?key=${encodeURIComponent(def.key)}&label=${encodeURIComponent(def.label)}&tone=${encodeURIComponent(def.tone||"")}&x=${encodeURIComponent(Math.round(Number(pos.x)||0))}&y=${encodeURIComponent(Math.round(Number(pos.y)||0))}&vw=${encodeURIComponent(Math.round(Number(vp.width)||0))}&vh=${encodeURIComponent(Math.round(Number(vp.height)||0))}`;
  await OBR.popover.open({id:companionHudButtonId(def.key),url:buttonUrl,width:def.width,height:def.height,anchorReference:"POSITION",anchorPosition:{left:pos.x,top:pos.y},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0});
}
async function companionHudSyncButtons(){
  const prefs=companionHudLoadPrefs();
  if(!prefs.enabled){await companionHudCloseMenu();await companionHudCloseButtons();await companionHudCloseTracker();await companionHudCloseFlow();return;}
  const vp=await companionHudViewport(),defaults=await companionHudDefaultPositions(vp);
  let changed=false;
  prefs.positions=prefs.positions&&typeof prefs.positions==="object"?{...prefs.positions}:{};
  if(prefs.positionPatch!==COMPANION_HUD_POSITION_PATCH){for(const k of ["broadcast","groupcheck","loot","dominion"])prefs.positions[k]={...defaults[k]};prefs.positionPatch=COMPANION_HUD_POSITION_PATCH;changed=true;}
  // Repair only a genuinely corrupted layout where four or more buttons occupy the
  // same point. Normal custom arrangements are never migrated or overwritten.
  const visibleKeys=COMPANION_HUD_BUTTONS.filter(def=>!def.adminOnly||me.role==="GM").map(def=>def.key);
  if(companionHudPositionsCollapsed(prefs.positions,visibleKeys)){prefs.positions={...defaults};changed=true;}
  // Fill only genuinely missing buttons. Existing coordinates are sacred across releases.
  for(const def of COMPANION_HUD_BUTTONS){
    if(!companionHudHasSavedPosition(prefs.positions[def.key])){prefs.positions[def.key]={...defaults[def.key]};changed=true;}
  }
  if(changed)companionHudSavePrefs(prefs);
  const positions=await companionHudResolvedPositions(prefs,vp,defaults);
  companionHudRuntimeViewport=vp; companionHudRuntimePositions={...positions};
  if(me.role!=="GM"){try{await OBR.popover.close(companionHudButtonId("dominion"))}catch{}}
  const visible=COMPANION_HUD_BUTTONS.filter(def=>!def.adminOnly||me.role==="GM");
  // Owlbear can apply one anchor to several popovers when close/open calls race.
  // Serial opening is slightly less aggressive but keeps every shortcut on its own anchor.
  for(const def of visible){try{await companionHudOpenButton(def,positions[def.key])}catch(e){console.warn("companion button open",def.key,e)}}
}
async function companionHudPreviewMoveButton(key,dx,dy){
  const def=COMPANION_HUD_BUTTONS.find(x=>x.key===String(key));if(!def)return;
  const prefs=companionHudLoadPrefs();if(!prefs.enabled)return;
  const vp=companionHudRuntimeViewport?.width?companionHudRuntimeViewport:await companionHudViewport();
  const positions=companionHudRuntimePositions?.[def.key]?companionHudRuntimePositions:await companionHudResolvedPositions(prefs,vp);
  const cur=positions[def.key]||{x:0,y:0};
  const next=companionHudClampPosition(def,{x:cur.x+(Number(dx)||0),y:cur.y+(Number(dy)||0)},vp);
  const sig=`${def.key}:${Math.round(next.x/3)}:${Math.round(next.y/3)}`;
  const now=Date.now();
  if(companionHudDragPreviewOpen&&companionHudDragPreviewSig===sig)return;
  if(now-companionHudDragPreviewAt<65)return;
  companionHudDragPreviewAt=now;companionHudDragPreviewSig=sig;
  const q=new URLSearchParams({label:def.label||def.key.toUpperCase(),key:def.key,x:String(Math.round(next.x)),y:String(Math.round(next.y))});
  try{
    if(companionHudDragPreviewOpen)try{await OBR.popover.close(`${NS}/companion-hud-drag-preview-v1`)}catch{}
    await OBR.popover.open({id:`${NS}/companion-hud-drag-preview-v1`,url:`/companion-drag-preview.html?${q}`,width:def.width,height:def.height,anchorReference:"POSITION",anchorPosition:{left:next.x,top:next.y},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0});companionHudDragPreviewOpen=true;
  }catch(e){console.warn("companion drag preview",e)}
}
async function companionHudMoveButton(key,dx,dy){
  const def=COMPANION_HUD_BUTTONS.find(x=>x.key===String(key));if(!def)return;
  await companionHudCloseDragPreview();
  const prefs=companionHudLoadPrefs();if(!prefs.enabled)return;
  const vp=await companionHudViewport(),positions=await companionHudResolvedPositions(prefs,vp),cur=positions[def.key];
  const next=companionHudClampPosition(def,{x:cur.x+(Number(dx)||0),y:cur.y+(Number(dy)||0)},vp);
  // Save ONLY the button the user actually dragged. Never overwrite the rest with viewport-clamped values.
  prefs.positions={...(prefs.positions&&typeof prefs.positions==="object"?prefs.positions:{}),[def.key]:next};
  companionHudRuntimePositions={...companionHudRuntimePositions,[def.key]:next};
  companionHudSavePrefs(prefs);
  try{await companionHudOpenButton(def,next)}catch(e){console.warn("companion move",e)}
  if(companionHudActiveMenu===def.key)await companionHudOpenMenu(def.key);
}
async function companionHudOpenTravelOverlay(){
  const prefs=companionHudLoadPrefs();if(!prefs.enabled)return;
  if(companionHudTravelOpen){await companionHudCloseTravel();return;}
  const vp=companionHudRuntimeViewport?.width?companionHudRuntimeViewport:await companionHudViewport();companionHudRuntimeViewport=vp;
  const isPlayer=me.role!=="GM";
  const desiredWidth=isPlayer
    ? Math.max(520,Math.min(1500,Math.max(520,vp.width-(vp.width>=1100?210:34))))
    : Math.max(420,Math.min(1180,Math.max(420,vp.width-54)));
  const surface=companionHudSafeSurface(vp,desiredWidth,420),width=surface.width;
  const desiredHeight=isPlayer
    ? Math.max(430,Math.min(900,Math.max(430,vp.height-(vp.height>=700?145:34))))
    : Math.max(430,Math.min(780,Math.max(430,vp.height-66)));
  const height=Math.min(desiredHeight,Math.max(1,surface.maxTop-surface.safeTop));
  const left=surface.left;
  const top=companionHudSurfaceTop(surface,vp,height,isPlayer&&vp.height>=700?88:Math.round((vp.height-height)/2));
  await companionHudCloseMenu();
  const opts={id:COMPANION_HUD_TRAVEL_ID,url:"/index.html?companionTravel=1",width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0};
  try{await companionHudWithTimeout(OBR.popover.open(opts),1900);companionHudTravelOpen=true;}catch(e){console.warn("companion travel overlay",e);try{await OBR.popover.close(COMPANION_HUD_TRAVEL_ID)}catch{}await companionHudWithTimeout(OBR.popover.open(opts),2500);companionHudTravelOpen=true;}
}
async function travelApprovalSyncPopup(mdArg=null){
  if(me.role!=="GM"){await travelApprovalClosePopup();return;}
  try{
    if(!await OBR.scene.isReady()){await travelApprovalClosePopup();return;}
    const md=mdArg||await OBR.scene.getMetadata(),approval=bgNormalizeTravelApproval(md?.[SCENE_TRAVEL_APPROVAL_KEY]);
    const req=approval.requests?.[0];
    if(!req){await travelApprovalClosePopup();return;}
    const id=String(req.requestId||"");if(id&&travelApprovalPopoverRequestId===id)return;
    await travelApprovalClosePopup();
    const vp=companionHudRuntimeViewport?.width?companionHudRuntimeViewport:await companionHudViewport();companionHudRuntimeViewport=vp;
    const surface=companionHudSafeSurface(vp,Math.max(360,Math.min(520,vp.width-30)),300),width=surface.width,height=Math.min(Math.max(220,Math.min(300,vp.height-30)),Math.max(1,surface.maxTop-surface.safeTop));
    const left=surface.left,top=companionHudSurfaceTop(surface,vp,height,Math.round((vp.height-height)/2));
    const payload=encodeURIComponent(JSON.stringify(req));
    await OBR.popover.open({id:TRAVEL_APPROVAL_POPOVER_ID,url:`/travel-approval.html?request=${payload}`,width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0});
    travelApprovalPopoverRequestId=id;
  }catch(e){console.warn("travel approval canvas popup",e)}
}
async function companionHudOpenMenu(key){
  const seq=++companionHudMenuSeq;
  const def=COMPANION_HUD_BUTTONS.find(x=>x.key===String(key));if(!def)return;
  if(def.adminOnly&&me.role!=="GM")return;
  const prefs=companionHudLoadPrefs();if(!prefs.enabled)return;
  if(def.mainView){await companionHudOpenMainView(def.mainView);return;}
  if(def.mainSheetTab){await companionHudOpenMainSheetTab(def.mainSheetTab);return;}
  if(def.key==="travel"){await companionHudOpenTravelOverlay();return;}
  // Fast path: use the exact screen position already used to render the shortcut.
  // Avoid round-tripping through viewport/default-layout APIs on every click.
  let vp=companionHudRuntimeViewport||{width:900,height:700};
  let pos=companionHudRuntimePositions?.[def.key];
  if(!pos){
    vp=await companionHudViewport();
    const positions=await companionHudResolvedPositions(prefs,vp);
    companionHudRuntimeViewport=vp;companionHudRuntimePositions={...positions};pos=positions[def.key];
  }
  if(seq!==companionHudMenuSeq)return;
  const wide=["shop","codex","clock","notes","roll","equipment","dominion","zero","broadcast","loot","groupcheck"].includes(def.key);
  const desiredWidth=Math.max(wide?390:330,Math.min(wide?620:430,vp.width-20));
  const surface=companionHudSafeSurface(vp,desiredWidth,300),width=surface.width,height=Math.min(Math.max(wide?380:320,Math.min(wide?650:560,vp.height-20)),Math.max(1,surface.maxTop-surface.safeTop));
  let left=pos.x+def.width+8;if(left+width>vp.width-8)left=pos.x-width-8;
  left=Math.max(surface.safeLeft,Math.min(Math.max(surface.safeLeft,vp.width-width-8),left));
  const top=companionHudSurfaceTop(surface,vp,height,pos.y-6);
  // Same menu is already visible: do not destroy/recreate its iframe.
  if(companionHudActiveMenu===def.key)return;
  if(companionHudActiveMenu){try{await companionHudWithTimeout(OBR.popover.close(COMPANION_HUD_MENU_ID),180)}catch{} companionHudActiveMenu="";}
  if(seq!==companionHudMenuSeq)return;
  // Stable URLs allow the browser to reuse HTML/CSS/module cache instead of treating every click as a new document.
  const toolUrl=def.key==="broadcast"?"/gm-broadcast.html":def.key==="loot"?"/gm-loot.html":def.key==="groupcheck"?"/gm-group-check.html":"/companion-menu.html?section="+encodeURIComponent(def.key);
  const opts={id:COMPANION_HUD_MENU_ID,url:toolUrl,width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true};
  try{await companionHudWithTimeout(OBR.popover.open(opts),1100)}catch(e){
    console.warn("companion menu open retry",def.key,e);
    if(seq!==companionHudMenuSeq)return;
    try{await OBR.popover.close(COMPANION_HUD_MENU_ID)}catch{}
    try{await companionHudWithTimeout(OBR.popover.open(opts),1500)}catch(retryError){
      console.error("companion menu open failed",def.key,retryError);
      return;
    }
  }
  if(seq===companionHudMenuSeq)companionHudActiveMenu=def.key;
}
async function companionHudOpenMonsterStudySheet(monsterId){
  const id=String(monsterId||"").trim();if(!id)return;
  const seq=++companionHudMenuSeq,prefs=companionHudLoadPrefs();if(!prefs.enabled)return;
  const vp=companionHudRuntimeViewport||await companionHudViewport();companionHudRuntimeViewport=vp;
  const surface=companionHudSafeSurface(vp,Math.max(420,Math.min(760,vp.width-24)),320),width=surface.width,height=Math.min(Math.max(380,Math.min(680,vp.height-24)),Math.max(1,surface.maxTop-surface.safeTop));
  const left=surface.left,top=companionHudSurfaceTop(surface,vp,height,116);
  const activeKey=`studysheet:${id}`;if(companionHudActiveMenu===activeKey)return;
  if(companionHudActiveMenu){try{await companionHudWithTimeout(OBR.popover.close(COMPANION_HUD_MENU_ID),180)}catch{} companionHudActiveMenu="";}
  if(seq!==companionHudMenuSeq)return;
  const opts={id:COMPANION_HUD_MENU_ID,url:`/companion-menu.html?section=studysheet&monsterId=${encodeURIComponent(id)}`,width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true};
  try{await companionHudWithTimeout(OBR.popover.open(opts),1100)}catch(e){console.warn("studied monster sheet open retry",id,e);if(seq!==companionHudMenuSeq)return;try{await OBR.popover.close(COMPANION_HUD_MENU_ID)}catch{}await companionHudWithTimeout(OBR.popover.open(opts),1500);}
  if(seq===companionHudMenuSeq)companionHudActiveMenu=activeKey;
}
async function companionHudResetPositions(){
  const prefs=companionHudLoadPrefs();prefs.positions=await companionHudDefaultPositions();companionHudSavePrefs(prefs);await companionHudCloseMenu();if(prefs.enabled)await companionHudSyncButtons();
}
async function companionHudSetEnabled(enabled){
  const prefs=companionHudLoadPrefs();prefs.enabled=!!enabled;companionHudSavePrefs(prefs);
  if(prefs.enabled){await companionHudSyncButtons();await companionHudSyncTracker();}else{await companionHudCloseFlow();await companionHudCloseSurface();}
}
function companionHudTrackerCollapsedLocal(){try{return localStorage.getItem(COMPANION_HUD_TRACKER_COLLAPSED_KEY)==="1"}catch{return false}}
function companionHudSetTrackerCollapsedLocal(collapsed){try{localStorage.setItem(COMPANION_HUD_TRACKER_COLLAPSED_KEY,collapsed?"1":"0")}catch{}}
function companionHudSetTrackerOrientationLocal(orientation){try{localStorage.setItem(COMPANION_HUD_TRACKER_LAYOUT_KEY,orientation==="horizontal"?"horizontal":"vertical")}catch{}}
async function companionHudApplyTrackerCollapse(collapsed){
  companionHudSetTrackerCollapsedLocal(!!collapsed);
  // Only the tracker changes size. Reopening every shortcut made their windows
  // flash and could move saved positions while the tracker was closing.
  await companionHudSyncTracker();
}
async function companionHudApplyTrackerOrientation(orientation){
  companionHudSetTrackerOrientationLocal(orientation);
  await companionHudCloseTracker();
  await companionHudSyncTracker();
}
async function companionHudSyncTracker(sceneMd=null){
  const prefs=companionHudLoadPrefs();
  if(!prefs.enabled){await companionHudCloseTracker();return;}
  try{
    if(!await OBR.scene.isReady()){await companionHudCloseTracker();return;}
    const collapsed=companionHudTrackerCollapsedLocal();
    const orientation=companionHudTrackerOrientationLocal();
    const mode=collapsed?"collapsed":`expanded-${orientation}`;
    if(companionHudTrackerOpen&&companionHudTrackerMode===mode)return;
    const vp=await companionHudViewport();
    const {width,height,left,top}=companionHudTrackerLayout(vp,collapsed,orientation);
    try{await OBR.popover.close(COMPANION_HUD_TRACKER_ID)}catch{}
    await OBR.popover.open({id:COMPANION_HUD_TRACKER_ID,url:"/initiative-tracker.html",width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0});
    companionHudTrackerOpen=true;companionHudTrackerMode=mode;
  }catch(e){console.warn("companion tracker",e)}
}
async function companionHudOpenMainTarget(nav={}){
  // Remove stale transparent popovers before the full main modal opens. A Flow
  // whose inner page failed can otherwise remain invisible while eating clicks.
  await Promise.allSettled([companionHudCloseFlow(),companionHudCloseMenu()]);
  try{localStorage.setItem(COMPANION_HUD_MAIN_NAV_KEY,JSON.stringify({...nav,time:Date.now()}))}catch{}
  // Reuse a live main window. The iframe acknowledges only after it has actually
  // applied the requested tab, so a stale modal flag can never trap navigation.
  const requestId=`main-nav-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  if(companionHudMainModalKnownOpen){
    const liveAck=new Promise(resolve=>{
      const timer=setTimeout(()=>{companionHudMainNavAckWaiters.delete(requestId);resolve(false)},280);
      companionHudMainNavAckWaiters.set(requestId,()=>{clearTimeout(timer);companionHudMainNavAckWaiters.delete(requestId);resolve(true)});
    });
    try{companionHudBus?.postMessage({type:"open-main-nav",surface:"modal",...nav,requestId,time:Date.now()})}catch{}
    if(await liveAck){
      try{localStorage.removeItem(COMPANION_HUD_MAIN_NAV_KEY)}catch{}
      companionHudMainOpen=true;companionHudSuppressedByMain=false;
      return;
    }
    companionHudMainModalKnownOpen=false;
  }
  // Native popovers always render above an Action surface in Owlbear. The main
  // Fabula UI therefore uses a Modal, which is the topmost extension layer.
  try{
    try{await OBR.modal.close(COMPANION_HUD_MAIN_MODAL_ID)}catch{}finally{companionHudMainModalKnownOpen=false}
    await OBR.modal.open({id:COMPANION_HUD_MAIN_MODAL_ID,url:"/index.html?companionMainModal=1",width:900,height:580,hideBackdrop:true,hidePaper:true});
    companionHudMainModalKnownOpen=true;
  }catch(e){companionHudMainModalKnownOpen=false;console.warn("companion main open",e);return;}
  companionHudMainOpen=true;companionHudSuppressedByMain=false;
  setTimeout(()=>{try{companionHudBus?.postMessage({type:"open-main-nav",surface:"modal",...nav,requestId,time:Date.now()})}catch{}},60);
}
async function companionHudOpenMainSheet(){return companionHudOpenMainTarget({kind:"sheet",ownerId:String(me.id||"")});}
async function companionHudOpenMainSheetTab(tab="sheet"){
  const safe=["sheet","class","equipment","spheres","inventory","bond","arcana","actions","zero","hinder"].includes(String(tab))?String(tab):"sheet";
  return companionHudOpenMainTarget({kind:"sheet",ownerId:String(me.id||""),tab:safe});
}
async function companionHudOpenMainView(view){const safe=["clock","roll","codex","shop","vault","settings"].includes(String(view))?String(view):"scene";return companionHudOpenMainTarget({kind:"view",view:safe});}
async function companionHudHandleMainOpen(open){
  // Opening the action from Owlbear's toolbar must follow the same Modal route
  // as Companion shortcuts, otherwise HUD popovers can physically sit on top.
  if(open&&!companionHudRedirectingAction){
    companionHudRedirectingAction=true;
    try{await OBR.action.close();}catch(e){console.warn("companion action close",e);}
    try{await companionHudOpenMainTarget({});}
    catch(e){console.warn("companion action redirect",e);}
    finally{setTimeout(()=>{companionHudRedirectingAction=false;},120);}
    return;
  }
  companionHudMainOpen=!!open;companionHudSuppressedByMain=false;
  if(!open)clockHologramSync().catch(()=>{});
}
async function companionHudOpenFlow(id="",command={}){
  // v3.0.32: the shortcut flow uses the exact main-window overlay renderer again.
  // Reuse the viewport snapshot already collected for the HUD so clicking an action does
  // not wait on another Owlbear viewport round-trip before the modal can open.
  const vp=companionHudRuntimeViewport?.width?companionHudRuntimeViewport:await companionHudViewport();
  const surface=companionHudSafeSurface(vp,Math.max(460,Math.min(780,vp.width-24)),320),width=surface.width;
  if(companionHudFlowOpen){await OBR.popover.close(COMPANION_HUD_FLOW_ID);companionHudFlowOpen=false;}
  // Flows live beside the tracker; the tracker stays visible and keeps priority.
  companionHudFlowHidTracker=false;
  const height=Math.min(Math.max(320,Math.min(610,vp.height-20)),Math.max(1,surface.maxTop-surface.safeTop));
  const left=surface.left,top=companionHudSurfaceTop(surface,vp,height,Math.round((vp.height-height)/2));
  companionHudFlowOpen=true;companionHudFlowCommandId=String(id||command?.id||"");
  const inline=encodeURIComponent(JSON.stringify({...command,id:String(id||command?.id||"")}));
  const opts={id:COMPANION_HUD_FLOW_ID,url:`/companion-flow.html?companionFlow=1&commandId=${encodeURIComponent(id)}&command=${inline}`,width,height,anchorReference:"POSITION",anchorPosition:{left,top},anchorOrigin:{horizontal:"LEFT",vertical:"TOP"},transformOrigin:{horizontal:"LEFT",vertical:"TOP"},hidePaper:true,disableClickAway:true,marginThreshold:0};
  try{
    await companionHudWithTimeout(OBR.popover.open(opts),8000);
  }catch(e){
    console.warn("companion flow open failed",e);
    try{await OBR.popover.close(COMPANION_HUD_FLOW_ID)}catch{}
    companionHudFlowOpen=false;
    throw e;
  }
}
let companionHudFlowQueue=Promise.resolve(),companionHudFlowCommandId="";
function companionHudQueueMainAction(message={}){
  const id=String(message.id||message.command?.id||`${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  const command={...(message.command||{}),id};
  const task=companionHudFlowQueue.catch(()=>{}).then(async()=>{
    try{await companionHudOpenFlow(id,command);companionHudBus?.postMessage({type:"main-action-result",id,key:message.key,ok:true})}
    catch(e){console.warn("companion flow popover",e);companionHudBus?.postMessage({type:"main-action-result",id,key:message.key,ok:false,error:"FLOW COULD NOT OPEN · TRY AGAIN"})}
  });
  companionHudFlowQueue=task;
  return task;
}

async function companionHudApplyOwnStatusEdit(op={}){
  try{
    const md=await OBR.player.getMetadata(),raw=md?.[META_KEY];
    if(raw?.deleted)return;
    const s=normalize(raw||defaultSheet(me.name));
    applyOp(s,op);
    await OBR.player.setMetadata({[META_KEY]:s});
    await persistMySheet(s);
    scheduleHud();
  }catch(e){console.warn("companion status edit",e)}
}

async function companionHudSendGMBroadcast(message={}){
  const requestId=String(message.requestId||"");
  const reply=(ok,error="")=>{try{companionHudBus?.postMessage({type:"gm-broadcast-result",requestId,ok:!!ok,error:String(error||"")})}catch{}};
  if(me.role!=="GM"){reply(false,"GM only");return;}
  const raw=message.payload&&typeof message.payload==="object"?message.payload:{};
  const broadcastType=["warning","objective","anomaly","phase"].includes(String(raw.broadcastType||""))?String(raw.broadcastType):"warning";
  const title=String(raw.title||"").trim().slice(0,100)||broadcastType.toUpperCase();
  const body=String(raw.body||"").trim().slice(0,1800);
  const requested=Array.isArray(raw.targets)?raw.targets.map(String):[];
  const online=new Set([String(me.id),...(party||[]).filter(x=>x&&x.role!=="GM"&&!x.offline).map(x=>String(x.id))]);
  const targets=requested.includes("ALL_PLAYERS")?["ALL_PLAYERS"]:[...new Set(requested.filter(id=>online.has(id)))];
  if(!targets.length){reply(false,"Select at least one player");return;}
  const payload={id:`gm-broadcast-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,senderId:String(me.id||""),senderName:String(me.name||"GAME MASTER"),broadcastType,title,body,targets,time:Date.now()};
  try{
    await OBR.broadcast.sendMessage(CHANNEL,{type:"gm-broadcast","gm-broadcast":payload},{destination:"ALL"});
    // Reply first: the sender popup must be able to close before the GM preview opens.
    reply(true);
    setTimeout(()=>{
      beep(gmBroadcastSound(payload.broadcastType));
      openGMBroadcastAlert(payload).catch(e=>console.warn("gm broadcast preview",e));
    },80);
  }catch(e){console.warn("gm broadcast send",e);reply(false,"Broadcast failed. Try again.");}
}

function registerCompanionHudControl(){
  if(companionHudBus)return;
  try{
    companionHudBus=new BroadcastChannel(COMPANION_HUD_CONTROL_CHANNEL);
    companionHudBus.onmessage=e=>{
      const d=e.data||{};
      Promise.resolve().then(async()=>{
        if(d.type==="main-nav-ack"&&d.surface==="modal")companionHudMainNavAckWaiters.get(String(d.requestId||""))?.();
        else if(d.type==="gm-broadcast-send")await companionHudSendGMBroadcast(d);
        else if(d.type==="loot-self-offer")await openLootActionPrompt(d.payload);
        else if(d.type==="loot-offer-accept"||d.type==="loot-offer-decline")await resolveLootOffer(d);
        else if(d.type==="group-self-prompt")await openGroupCheckActionPrompt(d.kind,d.payload);
        else if(d.type==="toggle")await companionHudSetEnabled(!!d.enabled);
        else if(d.type==="reset")await companionHudResetPositions();
        else if(d.type==="move")await companionHudMoveButton(d.key,d.dx,d.dy);
        else if(d.type==="move-preview")await companionHudPreviewMoveButton(d.key,d.dx,d.dy);
        else if(d.type==="move-preview-end")await companionHudCloseDragPreview();
        else if(d.type==="menu")await companionHudOpenMenu(d.key);
        else if(d.type==="monster-study-sheet")await companionHudOpenMonsterStudySheet(d.monsterId);
        else if(d.type==="menu-close")await companionHudCloseMenu();
        else if(d.type==="flow-close"&&(!d.id||String(d.id)===companionHudFlowCommandId))await companionHudCloseFlow();
        else if(d.type==="travel-close")await companionHudCloseTravel();
        else if(d.type==="travel-approval-close")await travelApprovalClosePopup();
        else if(d.type==="tracker-collapse")await companionHudApplyTrackerCollapse(!!d.collapsed);
        else if(d.type==="tracker-layout")await companionHudApplyTrackerOrientation(d.orientation);
        else if(d.type==="tracker-move-preview")companionHudTrackerPreviewQueue=companionHudTrackerPreviewQueue.then(()=>companionHudPreviewTrackerMove(d.dx,d.dy)).catch(e=>console.warn("tracker preview",e));
        else if(d.type==="tracker-move-preview-end"){await companionHudTrackerPreviewQueue;await companionHudCloseTrackerPreview()}
        else if(d.type==="tracker-move"){await companionHudTrackerPreviewQueue;await companionHudMoveTracker(d.dx,d.dy)}
        else if(d.type==="main-action")await companionHudQueueMainAction(d);
        else if(d.type==="status-edit"){companionHudEditQueue=companionHudEditQueue.then(()=>companionHudApplyOwnStatusEdit(d.op||{}));await companionHudEditQueue;}
        else if(d.type==="zero-activate"){await companionHudPlaySfx({cue:"zero"});companionHudEditQueue=companionHudEditQueue.then(()=>activateOwnZeroPower());await companionHudEditQueue;}
        else if(d.type==="sfx"){await companionHudPlaySfx(d);}
        else if(d.type==="player-token-quick-menu"){
          if(!d.enabled && mainTokenHudOpen && mainTokenHudActorKind==="player"){
            try{await OBR.popover.close(MAIN_TOKEN_HUD_POPOVER_ID)}catch{}
            mainTokenHudOpen=false;mainTokenHudTokenId="";mainTokenHudActorKind="";mainTokenHudDismissedSig=mainTokenHudSelectionSig||"";
          }
        }
        else if(d.type==="restore-layout"){await companionHudCloseMenu();await companionHudCloseButtons();await companionHudCloseTracker();await companionHudSyncButtons();await companionHudSyncTracker();}
        else if(d.type==="sync"){await companionHudSyncButtons();await companionHudSyncTracker();}
      }).catch(err=>console.warn("companion HUD control",err));
    };
  }catch(e){console.warn("companion HUD BroadcastChannel",e)}
}

OBR.onReady(async () => {
  me.id = OBR.player.id;
  registerBackgroundBroadcast();
  registerSkillCutInControlBus();
  registerCinematicAlertControlBus();
  try { await OBR.action.setIcon("/action-icon-v213.svg"); } catch (e) { console.warn("action icon", e); }
  me = { id: OBR.player.id, name: await OBR.player.getName(), role: await OBR.player.getRole() };
  registerHudLocalResultBus();
  registerCompanionHudControl();
  syncLootModal().catch(e=>console.warn("restore loot offers",e));
  companionHudPrewarmAssets();
  try{companionHudMainOpen=!!(await OBR.action.isOpen());companionHudSuppressedByMain=false}catch{}
  companionHudSyncButtons().then(()=>companionHudSyncTracker()).catch(err => console.warn("companion HUD startup", err));
  clockHologramSync().catch(err=>console.warn("clock hologram startup",err));
  await ensureDMTokenFrameTool();
  const firstMd = await OBR.player.getMetadata();
  if (!(META_KEY in firstMd)) {
    let initial = null;
    for (const k of [`${NS}/local-v5`, `${NS}/local-v4`, `${NS}/local-v3`, `${NS}/local-v2`, `${NS}/local-v1`]) { try { initial = JSON.parse(localStorage.getItem(k) || "null"); if (initial) break; } catch {} }
    await OBR.player.setMetadata({ [META_KEY]: normalize(initial || defaultSheet(me.name)) });
  } else if (!firstMd[META_KEY]?.deleted) {
    const raw = firstMd[META_KEY];
    const needsMigration = Number(raw.schema || 0) < 12 || !raw.zeroPower || !Array.isArray(raw.clocks) || (raw.spheres || []).some(x => !x?.id) || (raw.equipment || []).some(x => !Array.isArray(x?.sphereIds));
    if (needsMigration) await OBR.player.setMetadata({ [META_KEY]: normalize(raw) });
  }
  try {
    if (await OBR.scene.isReady()) {
      const sceneMd = await OBR.scene.getMetadata();
      clockMilestonePrime(sceneMd);
      const combat=sceneMd?.[SCENE_COMBAT_KEY]||{};guardCoverLastTurnSig=combat.started?`${Math.max(0,Number(combat.round)||0)}|${String(combat.activeKey||"")}`:"";
      scheduleGuardCoverVisuals(sceneMd,20);
      scheduleTravelBackgroundSync(sceneMd);
      if(me.role==="GM")travelApprovalSyncPopup(sceneMd).catch(()=>{});
      const rec = sceneMd[SCENE_PLAYER_SHEETS_KEY]?.[me.id];
      const currentMd = await OBR.player.getMetadata();
      const current = currentMd[META_KEY];
      if (rec?.sheet && (Number(rec.sheet.updatedAt) || 0) > (Number(current?.updatedAt) || 0)) {
        await OBR.player.setMetadata({ [META_KEY]: normalize(rec.sheet) });
      } else if (current) await persistMySheet(current);
    }
  } catch (e) { console.warn("reconcile persistent sheet", e); }
  party = await OBR.party.getPlayers();
  OBR.party.onChange(p => { party = p; scheduleHud(); });
  OBR.player.onChange(player => { scheduleHud(); handleDMTokenFrameSelection(player); scheduleMainTokenHudSelection(player?.selection, 30); });
  OBR.scene.items.onChange(() => {
    scheduleHud();
    if (me.role === "GM") {
      scheduleGuardCoverVisuals(null,70);
      // Token movement / HUD art / display swaps can fire this event many times
      // in one gesture. Travel state itself is metadata-driven, so keep metadata
      // changes fast and coalesce generic item churn into one quiet follow-up.
      clearTimeout(travelBackgroundItemTimer);
      travelBackgroundItemTimer=setTimeout(()=>scheduleTravelBackgroundSync(),420);
    }
  });
  OBR.scene.onMetadataChange(md => { scheduleHud(); companionHudSyncTracker(md).catch(()=>{}); clockHologramSync(md).catch(()=>{}); clockMilestoneObserve(md); if (me.role === "GM") { expireGuardAtTurnStart(md).catch(e=>console.warn("guard expiry",e)); scheduleGuardCoverVisuals(md); scheduleTravelBackgroundSync(md); travelApprovalSyncPopup(md).catch(()=>{}); } });
  OBR.scene.onReadyChange(ready => { if (ready) { ensureDMTokenFrameTool(); scheduleHud(); companionHudSyncTracker().catch(()=>{}); clockHologramSync().catch(()=>{}); OBR.scene.getMetadata().then(clockMilestonePrime).catch(()=>{}); if (me.role === "GM") { guardCoverVisualSig="";scheduleGuardCoverVisuals(); scheduleTravelBackgroundSync(); travelApprovalSyncPopup().catch(()=>{}); } } else { guardCoverVisualSig="";clockMilestoneSnapshot=null;clockHologramClose().catch(()=>{});clockMilestoneClose().catch(()=>{}); if(me.role==="GM") travelApprovalClosePopup().catch(()=>{}); } });
  OBR.action.onOpenChange(open => { if (open) OBR.action.setBadgeText(undefined); companionHudHandleMainOpen(open).catch(e=>console.warn("companion main visibility",e)); });
  registerBackgroundBroadcast();
  try {
    await OBR.contextMenu.create({ id: `${NS}/open`, icons: [{ icon: "/action-icon-v213.svg", label: "Link Fabula Sheet", filter: { min: 1, max: 1, every: [{ key: "type", value: "IMAGE" }] } }], onClick: async ctx => {
      const item = ctx.items?.[0]; if (item) { const md = await OBR.player.getMetadata(), raw = md[META_KEY]; if (!raw?.deleted) { const s = normalize(raw); s.linkedTokenId = item.id; s.showHud = true; s.updatedAt = Date.now(); await OBR.player.setMetadata({ [META_KEY]: s }); await persistMySheet(s); scheduleHud(); } else await OBR.notification.show("Create a Fabula character first", "INFO"); }
      await OBR.action.open();
    } });
  } catch (e) { console.warn("context menu", e); }
  try {
    await OBR.contextMenu.create({
      id: `${NS}/dm-token-frame-context-v2`,
      icons: [{
        icon: "/action-icon-v213.svg",
        label: "Apply DM Token Frame",
        filter: { min: 1, max: 1, roles: ["GM"], every: [{ key: "type", value: "IMAGE" }, { key: "layer", value: "CHARACTER" }] }
      }],
      onClick: async ctx => {
        const target = ctx.items?.find(tokenFrameTargetValid);
        if (!target) return;
        try { await replaceTokenFrame(target); }
        catch (e) { console.warn("dm frame context", e); }
      }
    });
  } catch (e) { console.warn("dm frame context menu", e); }
  scheduleHud();
  scheduleMainTokenHudSelection(null, 120, true);
});
