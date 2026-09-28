import { createContainmentContext, playContainmentSound } from "./soundscape.js";

const PARAMS = new URLSearchParams(location.search);
const PREVIEW = PARAMS.has("preview");
const IS_MODAL = PREVIEW || PARAMS.get("modal") === "1";
const COMPANION_FLOW = PARAMS.get("companionFlow") === "1";
const COMPANION_TRAVEL = PARAMS.get("companionTravel") === "1";
const COMPANION_MAIN_MODAL = PARAMS.get("companionMainModal") === "1";
const COMPANION_FLOW_COMMAND_ID = String(PARAMS.get("commandId") || "");
if (COMPANION_FLOW) document.documentElement.dataset.companionFlow = "1";
if (COMPANION_TRAVEL) document.documentElement.dataset.companionTravel = "1";
let OBR = null, OBRSDK = null;
if (!PREVIEW) {
  const sdk = await import("https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm");
  OBR = sdk.default;
  OBRSDK = sdk;
}

const NS = "com.lynx.fabula-unified";
const COMPANION_FLOW_INLINE_COMMAND = (() => {
  if (!COMPANION_FLOW) return null;
  try {
    const raw = PARAMS.get("command");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (e) { console.warn("companion inline command", e); return null; }
})();
const META_KEY = `${NS}/sheet`;
const SCENE_MONSTERS_KEY = `${NS}/scene-monsters-v1`;
const SCENE_COMBAT_KEY = `${NS}/scene-combat-v1`;
const SCENE_INIT_TRACKER_UI_KEY = `${NS}/initiative-tracker-ui-v1`;
const SCENE_TRACKERS_KEY = `${NS}/scene-trackers-v1`;
const SCENE_PLAYER_SHEETS_KEY = `${NS}/scene-player-sheets-v1`;
const SCENE_GUARD_COVER_KEY = `${NS}/guard-cover-v1`;
const SCENE_HISTORY_KEY = `${NS}/combat-history-v1`;
const SCENE_CODEX_KEY = `${NS}/codex-shared-v1`;
const SCENE_SHOP_KEY = `${NS}/active-shop-v1`;
const SCENE_TRAVEL_KEY = `${NS}/travel-shared-v1`;
const SCENE_TRAVEL_APPROVAL_KEY = `${NS}/travel-move-approval-v1`;
const TRAVEL_FRAME_META_KEY = `${NS}/travel-map-frame-v1`;
const TRAVEL_DISPLAY_META_KEY = `${NS}/travel-display-slot-v2`;
const TRAVEL_EMBEDDED_TOKEN_META_KEY = `${NS}/travel-embedded-token-v1`;
const TRAVEL_MAP_META_KEY = `${NS}/travel-map-link-v1`;
const TRAVEL_BLANK_IMAGE_URL = new URL("./travel-blank.svg", import.meta.url).href;
const CHANNEL = `${NS}/events`;
const HUD_LOCAL_RESULT_KEY = `${NS}/token-action-hud-local-result-v1`;
const ALERT_KEY = `${NS}/cinematic-alert`;
const ALERT_MODAL_ID = `${NS}/cinematic-alert-modal`;
const SKILL_CUTIN_CONTROL_CHANNEL = `${NS}/skill-cutin-control-v1`;
const STORAGE_KEY = `${NS}/local-v5`;
const OLD_STORAGE_KEYS = [`${NS}/local-v4`, `${NS}/local-v3`, `${NS}/local-v2`, `${NS}/local-v1`];
const FEED_KEY = `${NS}/feed-v3`;
const FABULA_AI_CHAT_KEY = `${NS}/fabula-ai-chat-v1`;
const GM_SHOP_STATE_KEY = `${NS}/gm-shop-state-v1`;
const GM_GROUP_CHECK_STATE_KEY = `${NS}/gm-group-check-state-v1`;
const GROUP_CHECK_PENDING_KEY = `${NS}/group-check-pending-v1`;
const TRAVEL_GROUP_PENDING_KEY = `${NS}/travel-group-pending-v1`;
const TOKEN_PLACEMENT_KEY = `${NS}/token-placement-v1`;
const TOKEN_PLACEMENT_MODE_ID = `${NS}/token-placement-click-v1`;
const OBR_POINTER_TOOL_ID = "rodeo.owlbear.tools/pointer";
const DEFAULT_VIEW_META_KEY = "uk.co.davidsev.owlbear-default-view/item";
const TOKEN_FRAME_TOOL_ID = `${NS}/dm-token-frame-tool-v2`;
const TOKEN_FRAME_MODE_ID = `${NS}/dm-token-frame-mode-v2`;
const TOKEN_FRAME_ACTIVE_KEY = `${NS}/dm-token-frame-active-v2`;
const TOKEN_FRAME_META_KEY = `${NS}/dm-token-frame-item-v1`;
const UI_PREF_KEY = `${NS}/ui-v3`;
const COMPANION_HUD_PREF_KEY = `${NS}/companion-hud-v1`;
const COMPANION_HUD_POSITION_SCHEMA = "stable-v1";
const COMPANION_HUD_CONTROL_CHANNEL = `${NS}/companion-hud-control-v1`;
const HUD_LAYOUT_VAULT_KEY=`${NS}/hud-layout-presets-v1`;
const COMPANION_HUD_PENDING_ACTION_KEY = `${NS}/companion-hud-pending-main-action-v1`;
const COMPANION_HUD_COMMAND_PREFIX = `${NS}/companion-hud-command-v2:`;
const COMPANION_HUD_MAIN_NAV_KEY = `${NS}/companion-hud-main-nav-v1`;
const PLAYER_TOKEN_QUICK_MENU_KEY = `${NS}/player-token-quick-menu-v1`;
const UI_THEME_KEY = `${NS}/theme-v1`;
const MONSTER_LIB_KEY = `${NS}/monster-library-v1`;
const MONSTER_LIB_FOLDERS_KEY = `${NS}/monster-library-folders-v1`;
const MONSTER_INSTANCE_RULES_KEY = `${NS}/monster-instance-rules-v1`;
const CODEX_KEY = `${NS}/codex-v1`;
const CODEX_DELETED_KEY = `${NS}/codex-deleted-v1`;
const PLAYER_SHEET_TABS = ["sheet", "class", "equipment", "spheres", "inventory", "bond", "arcana", "actions", "zero", "hinder"];
const VAULT_KEY = `${NS}/vault`;
const DIE_STEPS = [6, 8, 10, 12];
const ATTRS = ["DEX", "INS", "MIG", "WLP"];
const STATUS_NAMES = ["slow", "enraged", "dazed", "weak", "poisoned", "shaken"];
const STATUS_PENALTIES = {
  slow: { DEX: 1 }, enraged: { DEX: 1, INS: 1 }, dazed: { INS: 1 },
  weak: { MIG: 1 }, poisoned: { MIG: 1, WLP: 1 }, shaken: { WLP: 1 }
};
const VILLAIN_TYPES = ["none", "minor", "major", "supreme"];
const VILLAIN_TYPE_LABELS = { none: "None Villain", minor: "Minor Villain", major: "Major Villain", supreme: "Supreme Villain" };
const VILLAIN_UP_MAX = { none: 0, minor: 5, major: 10, supreme: 15 };
const MAX_MONSTER_PHASES = 5;
const MONSTER_PHASE_FIELDS = ["name","portrait","tokenArt","normalLevel","level","rank","species","traits","initiative","defenseMod","magicDefenseMod","hpMod","mpMod","attributes","affinities","actions"];
const MONSTER_RANKS = ["Soldier", "Elite", "Champion 1", "Champion 2", "Champion 3", "Champion 4", "Champion 5", "Champion 6"];
function normalizeMonsterRank(value) {
  const raw = String(value || "Soldier").trim();
  if (/^elite$/i.test(raw)) return "Elite";
  if (/^soldier$/i.test(raw) || !raw) return "Soldier";
  const m = raw.match(/^champion[\s_-]*([1-6])$/i);
  return m ? `Champion ${m[1]}` : "Soldier";
}
function monsterRankInfo(value) {
  const rank = normalizeMonsterRank(value);
  if (rank === "Elite") return { rank, hpMultiplier: 2, mpMultiplier: 1, mpBonus: 0, turns: 2, initiativeBonus: 2 };
  const m = rank.match(/^Champion ([1-6])$/);
  if (m) { const x = Number(m[1]); return { rank, hpMultiplier: x, mpMultiplier: 2, mpBonus: 0, turns: x, initiativeBonus: x }; }
  return { rank: "Soldier", hpMultiplier: 1, mpMultiplier: 1, mpBonus: 0, turns: 1, initiativeBonus: 0 };
}
function monsterRankTurns(value) { return monsterRankInfo(value).turns; }
function monsterRankInitiativeBonus(value) { return monsterRankInfo(value).initiativeBonus || 0; }
function monsterAdjustmentLevel(value) { return clamp(Math.round(Number(value) || 5), 5, 60); }
function monsterCheckTier(level) {
  const lv = monsterAdjustmentLevel(level);
  return lv >= 60 ? 6 : Math.max(0, Math.floor(lv / 10));
}
function monsterDamageTier(level) {
  const lv = monsterAdjustmentLevel(level);
  return lv >= 60 ? 15 : lv >= 40 ? 10 : lv >= 20 ? 5 : 0;
}
function monsterLevelAccuracyBonus(normalLevel, desiredLevel) { return monsterCheckTier(desiredLevel) - monsterCheckTier(normalLevel); }
function monsterLevelDamageBonus(normalLevel, desiredLevel) { return monsterDamageTier(desiredLevel) - monsterDamageTier(normalLevel); }
function monsterSigned(value) { const n = Number(value) || 0; return n > 0 ? `+${n}` : String(n); }
function monsterLevelCombatRule(normalLevel, desiredLevel) {
  const normal = monsterAdjustmentLevel(normalLevel), desired = monsterAdjustmentLevel(desiredLevel);
  const acc = monsterLevelAccuracyBonus(normal, desired), dmg = monsterLevelDamageBonus(normal, desired);
  return normal === desired ? `LV ${normal} · NO LEVEL ADJUSTMENT` : `LV ${normal}→${desired} · CHECKS ${monsterSigned(acc)} · DAMAGE ${monsterSigned(dmg)}`;
}
function normalizeVillainType(value) { const v = String(value || "none").toLowerCase(); return VILLAIN_TYPES.includes(v) ? v : "none"; }
function villainTypeLabel(value) { return VILLAIN_TYPE_LABELS[normalizeVillainType(value)]; }
function enforceMonsterUltima(m) {
  m.villainType = normalizeVillainType(m.villainType);
  const max = VILLAIN_UP_MAX[m.villainType];
  m.up ||= { current: 0, max };
  m.up.max = max;
  m.up.current = max <= 0 ? 0 : clamp(m.up.current, 0, max);
  return m;
}
const ELEMENTS = ["physical", "air", "bolt", "dark", "earth", "fire", "ice", "light", "poison"];
const ACTION_ELEMENTS = ["none", ...ELEMENTS];
const ELEMENT_UI = {
  none: { label: "UNTYPED", option: "◌ UNTYPED", color: "none", svg: '<circle cx="8" cy="8" r="5"/><path d="M4.5 11.5 11.5 4.5"/>' },
  physical: { label: "PHYSICAL", option: "⚔ PHYSICAL", color: "physical", svg: '<path d="M4 12 12 4M9 4h3v3M3 13l3-1-2-2-1 3Z"/>' },
  air: { label: "AIR", option: "≋ AIR", color: "air", svg: '<path d="M2 5h8c2 0 2-3 0-3M2 8h11c2 0 2 3 0 3M2 11h6"/>' },
  bolt: { label: "BOLT", option: "ϟ BOLT", color: "bolt", svg: '<path d="M9 1 4 8h4l-1 7 5-8H8l1-6Z"/>' },
  dark: { label: "DARK", option: "◒ DARK", color: "dark", svg: '<path d="M11.5 2.5A6 6 0 1 0 13.5 12 5.2 5.2 0 0 1 11.5 2.5Z"/>' },
  earth: { label: "EARTH", option: "⬢ EARTH", color: "earth", svg: '<path d="M8 1.5 14 6v5L8 14.5 2 11V6l6-4.5Z"/><path d="m2 6 6 3 6-3M8 9v5.5"/>' },
  fire: { label: "FIRE", option: "🔥 FIRE", color: "fire", svg: '<path d="M8.2 1.5c.7 3-2.7 3.5-2.2 6 .3 1.2 1.1 1.8 2 2.2-.3-1.5.8-2.5 2-3.4.3 2.3 2.7 3 2 5.6-.5 1.7-2 2.6-4 2.6-3 0-5-1.8-5-4.5 0-3.3 3.1-4.7 5.2-8.5Z"/>' },
  ice: { label: "ICE", option: "❄ ICE", color: "ice", svg: '<path d="M8 1v14M2 4.5l12 7M14 4.5l-12 7M5.5 2.5 8 4l2.5-1.5M5.5 13.5 8 12l2.5 1.5"/>' },
  light: { label: "LIGHT", option: "☀ LIGHT", color: "light", svg: '<circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5 13 13M13 3l-1.5 1.5M4.5 11.5 3 13"/>' },
  poison: { label: "POISON", option: "☠ POISON", color: "poison", svg: '<path d="M6 2h4M7 2v3l-3.5 5.5A2 2 0 0 0 5.2 14h5.6a2 2 0 0 0 1.7-3.5L9 5V2"/><path d="M5 10h6"/>' }
};
function elementInfo(value = "none") { return ELEMENT_UI[ACTION_ELEMENTS.includes(String(value).toLowerCase()) ? String(value).toLowerCase() : "none"]; }
function elementIcon(value = "none", cls = "") { const e = elementInfo(value); return `<span class="element-icon el-${e.color} ${cls}" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${e.svg}</svg></span>`; }
function elementChip(value = "none", compact = false) { const e = elementInfo(value); return `<span class="element-chip el-${e.color} ${compact ? "compact" : ""}">${elementIcon(value)}<span>${e.label}</span></span>`; }
const AFFINITY_VALUES = ["VULNERABILITY", "NORMAL", "RESISTANCE", "IMMUNITY", "ABSORPTION"];
function affinityTone(value) {
  const v = String(value || "NORMAL").toUpperCase();
  return AFFINITY_VALUES.includes(v) ? `affinity-${v.toLowerCase()}` : "affinity-normal";
}
function paintAffinitySelect(el) {
  if (!el) return;
  el.classList.remove(...AFFINITY_VALUES.map(v => `affinity-${v.toLowerCase()}`));
  el.classList.add("affinity-select", affinityTone(el.value));
}
const GM_BROADCAST_TYPES = {
  warning: { label: "WARNING", kicker: "EMERGENCY BROADCAST", sound: "crisis" },
  objective: { label: "OBJECTIVE UPDATED", kicker: "MISSION CONTROL", sound: "message" },
  anomaly: { label: "ANOMALY DETECTED", kicker: "ANOMALY ALERT", sound: "critical" },
  phase: { label: "PHASE CHANGE", kicker: "CONTAINMENT UPDATE", sound: "phase" }
};
function normalizeGMBroadcastType(value) { const v = String(value || "warning").toLowerCase(); return GM_BROADCAST_TYPES[v] ? v : "warning"; }
function gmBroadcastTypeInfo(value) { return GM_BROADCAST_TYPES[normalizeGMBroadcastType(value)]; }

function defaultGMGroupCheckState() {
  return {
    draft: { label: "GROUP CHECK", attr1: "DEX", attr2: "INS", mod: 0, finalDL: 10, leaderId: "", supporters: [] },
    active: null
  };
}
function normalizeGMGroupCheckState(raw) {
  const d = defaultGMGroupCheckState(), src = raw && typeof raw === "object" ? raw : {};
  const draftRaw = src.draft && typeof src.draft === "object" ? src.draft : {};
  const draft = {
    label: String(draftRaw.label || d.draft.label).slice(0, 72),
    attr1: ATTRS.includes(String(draftRaw.attr1 || "").toUpperCase()) ? String(draftRaw.attr1).toUpperCase() : "DEX",
    attr2: ATTRS.includes(String(draftRaw.attr2 || "").toUpperCase()) ? String(draftRaw.attr2).toUpperCase() : "INS",
    mod: clamp(Number(draftRaw.mod) || 0, -99, 99),
    finalDL: clamp(Number(draftRaw.finalDL) || 10, 1, 99),
    leaderId: String(draftRaw.leaderId || ""),
    supporters: Array.isArray(draftRaw.supporters) ? [...new Set(draftRaw.supporters.map(String).filter(Boolean))] : []
  };
  let active = null;
  if (src.active && typeof src.active === "object" && src.active.id) {
    const a = src.active;
    active = {
      id: String(a.id), label: String(a.label || "GROUP CHECK").slice(0,72),
      attr1: ATTRS.includes(String(a.attr1 || "").toUpperCase()) ? String(a.attr1).toUpperCase() : "DEX",
      attr2: ATTRS.includes(String(a.attr2 || "").toUpperCase()) ? String(a.attr2).toUpperCase() : "INS",
      mod: clamp(Number(a.mod) || 0, -99, 99), finalDL: clamp(Number(a.finalDL) || 10, 1, 99),
      leaderId: String(a.leaderId || ""), leaderName: String(a.leaderName || "LEADER"),
      supporters: (Array.isArray(a.supporters) ? a.supporters : []).map(x => ({ id:String(x?.id||""), name:String(x?.name||"PLAYER") })).filter(x=>x.id),
      results: a.results && typeof a.results === "object" ? deepClone(a.results) : {},
      bondBonus: clamp(Number(a.bondBonus) || 0, 0, 3),
      status: ["support","final-ready","complete"].includes(String(a.status)) ? String(a.status) : "support",
      startedAt: Number(a.startedAt) || Date.now(), finalResult: a.finalResult && typeof a.finalResult === "object" ? deepClone(a.finalResult) : null
    };
  }
  return { draft, active };
}
function loadGMGroupCheckState() {
  try { return normalizeGMGroupCheckState(JSON.parse(localStorage.getItem(GM_GROUP_CHECK_STATE_KEY) || "null")); }
  catch { return defaultGMGroupCheckState(); }
}
function saveGMGroupCheckState() {
  if (runtime?.currentPlayer?.role !== "GM") return;
  try { localStorage.setItem(GM_GROUP_CHECK_STATE_KEY, JSON.stringify(runtime.gmGroupCheck)); } catch (e) { console.warn("group check save", e); }
}
function savePendingGroupCheck(kind, payload) {
  try { localStorage.setItem(GROUP_CHECK_PENDING_KEY, JSON.stringify({ kind, payload: deepClone(payload || {}), receivedAt: Date.now() })); } catch {}
}
function clearPendingGroupCheck(sessionId = "") {
  try {
    const current = JSON.parse(localStorage.getItem(GROUP_CHECK_PENDING_KEY) || "null");
    if (!sessionId || !current?.payload?.id || sameId(current.payload.id, sessionId)) localStorage.removeItem(GROUP_CHECK_PENDING_KEY);
  } catch { try { localStorage.removeItem(GROUP_CHECK_PENDING_KEY); } catch {} }
}
window.addEventListener("storage",e=>{if(e.key===GROUP_CHECK_PENDING_KEY&&e.newValue)restorePendingGroupCheckPrompt();if(e.key===TRAVEL_GROUP_PENDING_KEY&&e.newValue)restorePendingTravelGroupPrompt()});
function groupCheckPromptForPlayer(kind, payload) {
  const me = String(runtime.currentPlayer.id || ""), supporters = Array.isArray(payload?.supporters) ? payload.supporters : [];
  if (kind === "group-check-start") {
    if (supporters.some(x => sameId(x?.id, me))) return { kind: "group-check-support", ...deepClone(payload) };
    if (sameId(payload?.leaderId, me)) return { kind: "group-check-leader-wait", ...deepClone(payload), responded: 0, totalSupporters: supporters.length, successes: 0 };
  }
  if (kind === "group-check-final-ready" && sameId(payload?.leaderId, me)) return { kind: "group-check-final", ...deepClone(payload) };
  return null;
}
function restorePendingGroupCheckPrompt() {
  if (PREVIEW || !runtime.currentPlayer.id) return;
  try {
    const rec = JSON.parse(localStorage.getItem(GROUP_CHECK_PENDING_KEY) || "null");
    if (!rec?.payload?.id || Date.now() - Number(rec.receivedAt || 0) > 2 * 60 * 60 * 1000) { clearPendingGroupCheck(); return; }
    const prompt = groupCheckPromptForPlayer(rec.kind, rec.payload);
    if (prompt && (!runtime.overlay || String(runtime.overlay.kind || "").startsWith("group-check-"))) { runtime.overlay = prompt; renderOverlay(); }
  } catch {}
}

function savePendingTravelGroup(payload) {
  try { localStorage.setItem(TRAVEL_GROUP_PENDING_KEY, JSON.stringify({ payload: deepClone(payload || {}), receivedAt: Date.now() })); } catch {}
}
function clearPendingTravelGroup(id = "") {
  try {
    const rec = JSON.parse(localStorage.getItem(TRAVEL_GROUP_PENDING_KEY) || "null");
    if (!id || !rec?.payload?.id || sameId(rec.payload.id, id)) localStorage.removeItem(TRAVEL_GROUP_PENDING_KEY);
  } catch { try { localStorage.removeItem(TRAVEL_GROUP_PENDING_KEY); } catch {} }
}
function travelGroupPromptForPlayer(payload = {}) {
  const me = String(runtime.currentPlayer.id || "");
  const players = Array.isArray(payload.players) ? payload.players : [];
  if (!players.some(x => sameId(x?.id, me))) return null;
  return { kind: "travel-group-choice", ...deepClone(payload), selected: String(payload.selected || "") };
}
function restorePendingTravelGroupPrompt() {
  if (PREVIEW || !runtime.currentPlayer.id) return;
  try {
    const rec = JSON.parse(localStorage.getItem(TRAVEL_GROUP_PENDING_KEY) || "null");
    if (!rec?.payload?.id || Date.now() - Number(rec.receivedAt || 0) > 2 * 60 * 60 * 1000) { clearPendingTravelGroup(); return; }
    const prompt = travelGroupPromptForPlayer(rec.payload);
    if (prompt && (!runtime.overlay || runtime.overlay.kind === "travel-group-choice")) { runtime.overlay = prompt; renderOverlay(); }
  } catch {}
}
const MAIN_NAV = ["scene", "clock", "travel", "roll", "codex", "monster", "chat", "shop", "vault", "gmtools", "settings"];
const NAV_LABEL = {
  scene: "SCENE",
  clock: "CLOCK",
  travel: "TRAVEL",
  roll: "ROLL",
  codex: "CODEX",
  monster: "MONS",
  chat: "CHAT",
  shop: "SHOP",
  vault: "VAULT",
  gmtools: "GM TOOLS",
  settings: "SETTINGS"
};
const STUDY_TIERS = [0, 7, 10, 13];
const STUDY_LABELS = { 0: "LOCKED", 7: "7+", 10: "10+", 13: "13+" };
const SUGGESTED_CHECKS = [
  { label: "เคลื่อนที่อย่างเงียบ ๆ ทรงตัว หรือแสดงกายกรรมที่ต้องใช้ความแม่นยำ", attr1: "DEX", attr2: "DEX" },
  { label: "เคลื่อนที่ตามจังหวะหรือฝ่าอุปสรรคขณะถูกโจมตี", attr1: "DEX", attr2: "INS" },
  { label: "สังเกตการเคลื่อนไหวของอีกฝ่ายและตอบสนองตามสัญชาตญาณ", attr1: "DEX", attr2: "INS" },
  { label: "ทำงานอย่างละเอียดแม่นยำหรือปลดกลไก", attr1: "DEX", attr2: "INS" },
  { label: "เคลื่อนไหวอย่างสง่างามเพื่อดึงดูดความสนใจ", attr1: "DEX", attr2: "WLP" },
  { label: "ค้นหาหรือตรวจสอบบุคคล สถานที่ หรือวัตถุ", attr1: "INS", attr2: "INS" },
  { label: "นึกข้อมูลที่เป็นประโยชน์เกี่ยวกับบุคคล สถานที่ หรือวัตถุ", attr1: "INS", attr2: "INS" },
  { label: "จับพิรุธหรือดึงข้อมูลจากอีกฝ่ายระหว่างการสนทนา", attr1: "INS", attr2: "WLP" },
  { label: "หลอกลวงด้วยคำโกหก การแสดง หรือการเบี่ยงเบนความสนใจ", attr1: "INS", attr2: "WLP" },
  { label: "ใช้แรงอย่างหนักเพื่อพัง ยก ดัด หรือฝืนบางสิ่ง", attr1: "MIG", attr2: "MIG" },
  { label: "อดทนต่อความเจ็บปวด ความทรหด หรือความเหนื่อยล้ารุนแรง", attr1: "MIG", attr2: "WLP" },
  { label: "ข่มขู่อีกฝ่ายด้วยรูปร่างหรือพละกำลังของตน", attr1: "MIG", attr2: "WLP" }
];

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
const sameId = (a, b) => String(a ?? "") === String(b ?? "");
const deepClone = v => JSON.parse(JSON.stringify(v));
const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
const pct = (cur, max) => max > 0 ? clamp((Number(cur) || 0) / max * 100, 0, 100) : 0;
const formatTime = ts => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
function getByPath(obj, path) { return path.split(".").reduce((o, k) => o?.[k], obj); }
function setByPath(obj, path, value) {
  const parts = path.split("."); let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (o[k] === undefined) o[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    o = o[k];
  }
  o[parts.at(-1)] = value;
}
function moveItem(arr, from, to) {
  from = Number(from); to = Number(to);
  if (!Array.isArray(arr) || from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
  const [x] = arr.splice(from, 1); arr.splice(to, 0, x);
}
function gifFromText(text = "") {
  const m = String(text).match(/https?:\/\/[^\s<>"']+\.gif(?:\?[^\s<>"']*)?/i);
  return m ? m[0] : "";
}
function mediaFromText(text = "") {
  const m = String(text).match(/https?:\/\/[^\s<>"']+\.(?:gif|png|jpe?g|webp)(?:\?[^\s<>"']*)?/i);
  return m ? m[0] : "";
}
function stripMediaUrls(text = "") {
  return String(text).replace(/https?:\/\/[^\s<>"']+\.(?:gif|png|jpe?g|webp)(?:\?[^\s<>"']*)?/ig, "").replace(/\n{3,}/g, "\n\n").trim();
}
function gifPreview(text = "", cls = "detail-gif") {
  const url = gifFromText(text);
  return url ? `<div class="${cls}"><img src="${esc(url)}" alt="GIF preview"></div>` : "";
}
function imageLinkPreview(url = "", cls = "detail-gif") {
  const u = String(url || "").trim();
  return /^https?:\/\//i.test(u) ? `<div class="${cls}"><img src="${esc(u)}" alt="Image preview"></div>` : "";
}
function formatText(text = "") { return esc(text).replace(/\n/g, "<br>"); }
function blankAffinities() { return Object.fromEntries(ELEMENTS.map(e => [e, "NORMAL"])); }
function blankStudy() { return { tier: 0 }; }
// Constructors used by every Add/New button. Keep these centralized so local
// edits and collaborative edits create the same schema.
function blankClass() { return { name: "New Class", freeBenefit: "", level: 1, classSkills: [] }; }
function blankClassSkill() { return { name: "New Class Skill", level: 1, cost: "", detail: "" }; }
function blankQuirk() { return { name: "New Quirk", detail: "" }; }
function blankEquipment() { return { name: "New Equipment", weaponType: "", imageUrl: "", detail: "", sphereIds: ["", "", "", ""] }; }
function blankSphere() { return { id: uid(), name: "New Sphere", sphereType: "", linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: "" }; }
function blankInventoryItem() { return { id: uid(), name: "New Item", itemType: "", linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: "" }; }
function blankClock() { return { id: uid(), name: "New Clock", detail: "", segments: 6, progress: 0 }; }
const ACTION_TYPES = ["MELEE ATTACK", "RANGE ATTACK", "TWO WEAPON", "SPELL", "GUARD", "COVER ALLY", "OTHER ACTION"];
const CUTIN_COLORS = [
  { key:"violet", label:"VIOLET", hex:"#a984ff" }, { key:"cyan", label:"CYAN", hex:"#55e8ff" },
  { key:"blue", label:"BLUE", hex:"#6699ff" }, { key:"green", label:"GREEN", hex:"#5ce6a0" },
  { key:"lime", label:"LIME", hex:"#b9ef58" }, { key:"gold", label:"GOLD", hex:"#ffd35a" },
  { key:"orange", label:"ORANGE", hex:"#ff9557" }, { key:"red", label:"RED", hex:"#ff626f" },
  { key:"pink", label:"PINK", hex:"#ff75c8" }, { key:"white", label:"WHITE", hex:"#e9f2ff" }
];
function normalizeCutInColor(value){const key=String(value||"violet").toLowerCase();return CUTIN_COLORS.some(x=>x.key===key)?key:"violet"}
function cutInColorInfo(value){return CUTIN_COLORS.find(x=>x.key===normalizeCutInColor(value))||CUTIN_COLORS[0]}
function isTwoWeaponAction(value) { return normalizeActionType(typeof value === "object" ? value?.category : value) === "TWO WEAPON"; }
function isGuardAction(value) { return normalizeActionType(typeof value === "object" ? value?.category : value) === "GUARD"; }
function isCoverAllyAction(value) { return normalizeActionType(typeof value === "object" ? value?.category : value) === "COVER ALLY"; }
function isGuardFamilyAction(value) { return isGuardAction(value) || isCoverAllyAction(value); }
function normalizeActionType(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "NORMAL ATTACK") return "MELEE ATTACK";
  if (raw === "RANGED ATTACK") return "RANGE ATTACK";
  if (raw === "TWO-WEAPON" || raw === "TWO WEAPON ATTACK" || raw === "TWO-WEAPON ATTACK") return "TWO WEAPON";
  return ACTION_TYPES.includes(raw) ? raw : "MELEE ATTACK";
}
function attackDefenseKind(category) {
  if (category === "SPELL") return "magicDefense";
  return ["MELEE ATTACK", "RANGE ATTACK", "TWO WEAPON"].includes(category) ? "defense" : "";
}
function attackHitsDefense(total, defense, critical, fumble) {
  return !fumble && (critical || total >= defense);
}
function actionTypeOptionsHTML(selected) {
  const value = normalizeActionType(selected);
  return ACTION_TYPES.map(type => `<option value="${type}" ${value === type ? "selected" : ""}>${type}</option>`).join("");
}
function blankAction() { return { name: "New Action", mode: "ROLL", category: "MELEE ATTACK", element: "none", cost: "", target: "", actionTypeText: "", attr1: "DEX", attr2: "INS", mod: 0, damageHR: 0, note: "", frenzy: false, cutIn: false, cutInColor: "violet", randomTarget: true }; }
function blankMonsterAction() { return { ...blankAction(), damageHR: 5 }; }
function blankRule() { return { name: "New Special Rule", detail: "" }; }
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
function tokenArtFromDownload(download) {
  if (!download?.image?.url) return null;
  return normalizeTokenArt({ name: download.name || "TOKEN ART", image: download.image, grid: download.grid, scale: download.scale, rotation: download.rotation });
}
function tokenArtFromSceneItem(item) {
  if (!item?.image?.url) return null;
  return normalizeTokenArt({ name: item.name || "TOKEN ART", image: item.image, grid: item.grid, scale: item.scale, rotation: item.rotation });
}
function tokenArtURL(value) { return normalizeTokenArt(value)?.image?.url || ""; }
function tokenArtPreviewHTML(value, label = "TOKEN ART") {
  const art = normalizeTokenArt(value), url = art?.image?.url || "";
  return `<div class="token-art-preview ${url ? "has-art" : "empty"}"><small>${esc(label)}</small>${url ? `<img src="${esc(url)}" alt="${esc(label)}"><span>${esc(art.name || label)}</span>` : `<div class="token-art-empty">NO TOKEN ART</div>`}</div>`;
}
function defaultState(name = "NEW CHARACTER") {
  return {
    schema: 12, deleted: false, name, identity: "", theme: "", origin: "", portrait: "", tokenArt: null, studyGif: "", initiativeGif: "", classTitle: "", classLore: "",
    level: 5, xp: 0, zenit: 0, fp: 3, initiative: 0, defense: 8, magicDefense: 8, defenseMod: "", magicDefenseMod: "",
    hp: { current: 40, max: 40 }, mp: { current: 30, max: 30 }, ip: { current: 6, max: 6 },
    attributes: { DEX: 8, INS: 8, MIG: 8, WLP: 8 }, attributeBuffs: { DEX: 0, INS: 0, MIG: 0, WLP: 0 },
    statuses: Object.fromEntries(STATUS_NAMES.map(x => [x, false])), affinities: blankAffinities(),
    classes: [], quirks: [], equipment: [], spheres: [], inventory: [], lists: { bonds: [], arcana: [] },
    clocks: [], projects: [], actions: [], zeroPower: { name: "", trigger: "", effect: "", detail: "", current: 0, max: 6 }, defeatOutcome: "", defeatedRestoreHp: 0, sceneNoTurn: false, linkedTokenId: "", showHud: true, linkedNoteId: "", canvasTextLinks: { hp: "", mp: "", ip: "", fp: "", defense: "", magicDefense: "" }, accent: "cyan", updatedAt: Date.now()
  };
}
function defaultMonster(name = "NEW MONSTER") {
  const p = defaultState(name);
  return {
    schema: 17, id: uid(), name: p.name, villainType: "none", portrait: "", tokenArt: null, normalLevel: 5, level: 5, species: "", rank: "Soldier", traits: "", faction: "enemy", folderId: "",
    initiative: 0, defense: 8, magicDefense: 8, defenseMod: "", magicDefenseMod: "", hpMod: 0, mpMod: 0,
    hp: { current: 50, max: 50, baseMax: 50 }, mp: { current: 45, max: 45, baseMax: 45 }, ip: { current: 0, max: 0 }, fp: 0, up: { current: 0, max: 0 },
    attributes: p.attributes, attributeBuffs: p.attributeBuffs, statuses: p.statuses, statusImmunities: Object.fromEntries(STATUS_NAMES.map(x => [x, false])), affinities: p.affinities,
    actions: [], randomTarget: true, phases: [], activePhase: 0, specialRules: [], linkedTokenId: "", showHud: true, studyTier: 0, sceneNoTurn: false, defeatedRestoreHp: 0, updatedAt: Date.now()
  };
}
function normalizeState(raw) {
  if (raw?.deleted) return { ...defaultState(), deleted: true, updatedAt: raw.updatedAt || Date.now() };
  const d = defaultState(raw?.name || "NEW CHARACTER"), r = raw || {};
  const lists = { ...d.lists, ...(r.lists || {}) };
  const oldClasses = Array.isArray(r.lists?.classes) ? r.lists.classes : [];
  const oldEquipment = Array.isArray(r.lists?.equipment) ? r.lists.equipment : [];
  const out = {
    ...d, ...r, deleted: false,
    hp: { ...d.hp, ...(r.hp || {}) }, mp: { ...d.mp, ...(r.mp || {}) }, ip: { ...d.ip, ...(r.ip || {}) },
    attributes: { ...d.attributes, ...(r.attributes || {}) }, attributeBuffs: { ...d.attributeBuffs, ...(r.attributeBuffs || {}) },
    statuses: { ...d.statuses, ...(r.statuses || {}) }, affinities: { ...d.affinities, ...(r.affinities || {}) }, lists, zeroPower: { ...d.zeroPower, ...(r.zeroPower || {}) },
    canvasTextLinks: { ...d.canvasTextLinks, ...(r.canvasTextLinks || {}) }
  };
  out.classes = (Array.isArray(r.classes) ? r.classes : oldClasses).map(c => ({
    name: c.name || c.group || "New Class", freeBenefit: c.freeBenefit ?? c.detail ?? "", level: Math.max(0, Number(c.level) || 1),
    classSkills: (Array.isArray(c.classSkills) ? c.classSkills : []).map(x => ({ name: x.name || "Class Skill", level: Math.max(0, Number(x.level) || 1), cost: x.cost || "", detail: x.detail || "" }))
  }));
  out.quirks = (Array.isArray(r.quirks) ? r.quirks : []).map(q => ({ name: q.name || "Quirk", detail: q.detail || "" }));
  out.spheres = (Array.isArray(r.spheres) ? r.spheres : []).map(e => ({ id: e.id || uid(), name: e.name || "Sphere", sphereType: e.sphereType ?? e.type ?? "", linkedTokenId: String(e.linkedTokenId || ""), linkedTokenArt: normalizeTokenArt(e.linkedTokenArt), tokenLink: String(e.tokenLink || ""), detail: e.detail || "" }));
  out.inventory = (Array.isArray(r.inventory) ? r.inventory : []).map(e => ({ id: e.id || uid(), name: e.name || "Item", itemType: e.itemType ?? e.type ?? "", linkedTokenId: String(e.linkedTokenId || ""), linkedTokenArt: normalizeTokenArt(e.linkedTokenArt), tokenLink: String(e.tokenLink || ""), detail: e.detail || "", shopPurchaseId: String(e.shopPurchaseId || ""), shopStockId: String(e.shopStockId || ""), purchasePrice: Math.max(0, Number(e.purchasePrice) || 0) }));
  const sphereIds = new Set(out.spheres.map(x => x.id));
  out.equipment = (Array.isArray(r.equipment) ? r.equipment : oldEquipment).map(e => ({ name: e.name || "Equipment", weaponType: e.weaponType ?? e.group ?? "", imageUrl: e.imageUrl || "", detail: e.detail || "", sphereIds: Array.from({ length: 4 }, (_, i) => sphereIds.has(e.sphereIds?.[i]) ? e.sphereIds[i] : "") }));
  out.lists = {
    bonds: (Array.isArray(lists.bonds) ? lists.bonds : []).map(x => ({ ...x, strength: clamp(Number(x?.strength) || 1, 1, 3), linkedTokenId: String(x?.linkedTokenId || ""), linkedTokenArt: normalizeTokenArt(x?.linkedTokenArt), tokenLink: String(x?.tokenLink || "") })),
    arcana: (Array.isArray(lists.arcana) ? lists.arcana : []).map(x => ({ ...x, cutIn: !!x?.cutIn, cutInColor: normalizeCutInColor(x?.cutInColor), linkedTokenId: String(x?.linkedTokenId || ""), linkedTokenArt: normalizeTokenArt(x?.linkedTokenArt), tokenLink: String(x?.tokenLink || "") }))
  };
  out.clocks = (Array.isArray(r.clocks) ? r.clocks : []).map(p => ({ id: p.id || uid(), name: p.name || "Clock", detail: p.detail || "", segments: clamp(p.segments || 6, 1, 12), progress: clamp(p.progress || 0, 0, clamp(p.segments || 6, 1, 12)) }));
  out.projects = (Array.isArray(r.projects) ? r.projects : []).map(p => ({ id: p.id || uid(), name: p.name || "Project", detail: p.detail || "", segments: clamp(p.segments || 6, 1, 12), progress: clamp(p.progress || 0, 0, clamp(p.segments || 6, 1, 12)) }));
  out.actions = (Array.isArray(r.actions) ? r.actions : []).map(a => ({ ...blankAction(), ...a, category: normalizeActionType(a.category), element: ACTION_ELEMENTS.includes(a.element) ? a.element : "none", mod: Number(a.mod) || 0, damageHR: Number(a.damageHR ?? (Number.isFinite(Number(a.damage)) ? Number(a.damage) : 0)) || 0, frenzy: !!a.frenzy, cutIn: !!a.cutIn, cutInColor: normalizeCutInColor(a.cutInColor), randomTarget: a.randomTarget !== false }));
  out.zeroPower = { ...d.zeroPower, ...(r.zeroPower || {}), max: 6 };
  out.zeroPower.current = clamp(out.zeroPower.current, 0, 6); out.zeroPower.name = String(out.zeroPower.name || ""); out.zeroPower.trigger = String(out.zeroPower.trigger || ""); out.zeroPower.effect = String(out.zeroPower.effect || ""); out.zeroPower.detail = String(out.zeroPower.detail || "");
  out.tokenArt = normalizeTokenArt(r.tokenArt);
  out.classTitle = String(r.classTitle || "");
  out.classLore = String(r.classLore || "");
  out.initiativeGif = String(r.initiativeGif || "");
  out.sceneNoTurn = !!r.sceneNoTurn;
  out.defeatedRestoreHp = Math.max(0, Number(r.defeatedRestoreHp) || 0);
  out.defeatOutcome = ["pending","surrender","sacrifice"].includes(String(r.defeatOutcome || "").toLowerCase()) ? String(r.defeatOutcome).toLowerCase() : "";
  if ((Number(out.hp?.current) || 0) <= 0) {
    if (!out.defeatOutcome) out.defeatOutcome = "pending";
  } else {
    out.defeatOutcome = "";
    out.defeatedRestoreHp = 0;
  }
  out.schema = 12; out.updatedAt = Number(out.updatedAt) || Date.now();
  return out;
}
function defaultMonsterPhaseLabel(index = 0) { return `PHASE ${Math.max(0, Number(index) || 0) + 1}`; }
function normalizeMonsterPhaseLabel(label, index = 0) {
  const raw = String(label || "").trim();
  if (!raw || /^PHASE\s+\d+$/i.test(raw)) return defaultMonsterPhaseLabel(index);
  return raw;
}
function monsterPhaseSnapshot(source, index = 1, label = "") {
  const s = source || defaultMonster("NEW MONSTER");
  return {
    id: s.id && String(s.id).startsWith("phase-") ? s.id : `phase-${uid()}`,
    label: normalizeMonsterPhaseLabel(label || s.label, index),
    name: String(s.name || "NEW MONSTER"), portrait: String(s.portrait || ""), tokenArt: normalizeTokenArt(s.tokenArt), normalLevel: Math.max(1, Number(s.normalLevel ?? s.level) || 1), level: Math.max(1, Number(s.level) || 1),
    rank: normalizeMonsterRank(s.rank), species: String(s.species || ""), traits: String(s.traits || ""), initiative: Number(s.initiative) || 0,
    defenseMod: String(s.defenseMod ?? ""), magicDefenseMod: String(s.magicDefenseMod ?? ""), hpMod: Number(s.hpMod) || 0, mpMod: Number(s.mpMod) || 0,
    attributes: { DEX: Number(s.attributes?.DEX) || 8, INS: Number(s.attributes?.INS) || 8, MIG: Number(s.attributes?.MIG) || 8, WLP: Number(s.attributes?.WLP) || 8 },
    affinities: { ...blankAffinities(), ...(s.affinities || {}) },
    studyTier: [0, 7, 10, 13].includes(Number(s.studyTier)) ? Number(s.studyTier) : 0,
    randomTarget: s.randomTarget !== false,
    actions: (Array.isArray(s.actions) ? s.actions : []).map(a => ({ ...blankMonsterAction(), ...deepClone(a), category: normalizeActionType(a.category), element: ACTION_ELEMENTS.includes(a.element) ? a.element : "none", mod: Number(a.mod) || 0, damageHR: Number(a.damageHR ?? 5) || 0, frenzy: !!a.frenzy, randomTarget: a.randomTarget !== false }))
  };
}
function normalizeMonsterPhase(raw, fallback, index) {
  const base = monsterPhaseSnapshot(fallback || defaultMonster("NEW MONSTER"), index);
  const r = raw || {};
  const out = monsterPhaseSnapshot({ ...base, ...r, attributes: { ...base.attributes, ...(r.attributes || {}) }, affinities: { ...base.affinities, ...(r.affinities || {}) }, actions: Array.isArray(r.actions) ? r.actions : base.actions, id: r.id || base.id }, index, normalizeMonsterPhaseLabel(r.label, index));
  // v1.53 migration: old phase sheets never had independent Study, so start them locked.
  out.studyTier = [0, 7, 10, 13].includes(Number(r.studyTier)) ? Number(r.studyTier) : 0;
  // v1.63 migration: an old Phase's current Level becomes its Normal Level, so upgrading does not invent an adjustment.
  out.normalLevel = Math.max(1, Number(r.normalLevel ?? r.level ?? out.level) || Math.max(1, Number(out.level) || 1));
  return out;
}
function monsterPhaseIndex(m, mode = "active") {
  const max = Math.min(MAX_MONSTER_PHASES, Array.isArray(m?.phases) ? m.phases.length : 0);
  const wanted = mode === "lib" ? Number(runtime?.monsterPhase || 0) : Number(m?.activePhase || 0);
  return clamp(wanted, 0, max);
}
function monsterPhaseView(m, mode = "active") {
  if (!m) return m;
  const index = monsterPhaseIndex(m, mode);
  if (!index) return m;
  const phase = m.phases?.[index - 1]; if (!phase) return m;
  return {
    ...m, ...phase,
    id: m.id, villainType: m.villainType, faction: m.faction,
    hp: m.hp, mp: m.mp, ip: m.ip, fp: m.fp, up: m.up, statuses: m.statuses, statusImmunities: m.statusImmunities, attributeBuffs: m.attributeBuffs,
    studyTier: [0, 7, 10, 13].includes(Number(phase.studyTier)) ? Number(phase.studyTier) : 0, linkedTokenId: m.linkedTokenId, showHud: m.showHud,
    phases: m.phases, activePhase: m.activePhase, specialRules: m.specialRules,
    templateId: m.templateId, baseName: m.baseName, spawnIndex: m.spawnIndex, instanceId: m.instanceId
  };
}
function monsterDisplayArt(m, mode = "active") {
  const v = monsterPhaseView(m, mode);
  return String(v?.portrait || v?.tokenArt?.image?.url || v?.tokenArt?.url || m?.portrait || m?.tokenArt?.image?.url || m?.tokenArt?.url || "").trim();
}

function monsterPhaseTarget(m, mode = "active") {
  const index = monsterPhaseIndex(m, mode);
  return index ? m.phases?.[index - 1] || m : m;
}
function monsterPhasePath(m, mode, path) {
  const shared = /^(?:hp|mp|ip|up|statuses|attributeBuffs)\./.test(path) || ["fp","villainType","linkedTokenId","showHud","faction"].includes(path);
  const index = monsterPhaseIndex(m, mode);
  return !shared && index ? `phases.${index - 1}.${path}` : path;
}
function monsterPhaseLabel(m, index) {
  const i = Math.max(0, Number(index) || 0);
  if (!i) return "PHASE 1";
  return normalizeMonsterPhaseLabel(m?.phases?.[i - 1]?.label, i);
}
function monsterRankForPhase(m, phaseIndex = null) {
  if (!m) return "Soldier";
  const phases = Array.isArray(m.phases) ? m.phases : [];
  const idx = phaseIndex === null ? clamp(Number(m.activePhase) || 0, 0, phases.length) : clamp(Number(phaseIndex) || 0, 0, phases.length);
  return normalizeMonsterRank(idx > 0 ? phases[idx - 1]?.rank : m.rank);
}
function monsterFormulaView(m, phaseIndex = null) {
  if (!m) return m;
  const phases = Array.isArray(m.phases) ? m.phases : [];
  const idx = phaseIndex === null ? clamp(Number(m.activePhase) || 0, 0, phases.length) : clamp(Number(phaseIndex) || 0, 0, phases.length);
  return idx > 0 ? (phases[idx - 1] || m) : m;
}
function monsterResourceMod(m, key, phaseIndex = null) {
  const v = monsterFormulaView(m, phaseIndex);
  return Number(v?.[`${key}Mod`]) || 0;
}
function monsterBaseMax(m, key, phaseIndex = null) {
  const v = monsterFormulaView(m, phaseIndex);
  if (!v) return 0;
  const level = Math.max(1, Number(v.level) || 1);
  const mod = monsterResourceMod(m, key, phaseIndex);
  if (key === "hp") return Math.max(0, Math.round((level * 2) + ((Number(v.attributes?.MIG) || 8) * 5) + mod));
  if (key === "mp") return Math.max(0, Math.round(level + ((Number(v.attributes?.WLP) || 8) * 5) + mod));
  return 0;
}
function monsterEffectiveMax(m, key, phaseIndex = null) {
  const base = monsterBaseMax(m, key, phaseIndex), info = monsterRankInfo(monsterRankForPhase(m, phaseIndex));
  if (key === "hp") return Math.max(0, Math.round(base * info.hpMultiplier));
  if (key === "mp") return Math.max(0, Math.round(base * info.mpMultiplier + info.mpBonus));
  return base;
}
function syncMonsterResourceCaps(m) {
  if (!m) return m;
  for (const key of ["hp", "mp"]) {
    m[key] ||= { current: 0, max: 0, baseMax: 0 };
    const oldMax = Math.max(0, Number(m[key].max) || 0), oldCurrent = Math.max(0, Number(m[key].current) || 0);
    const wasFull = oldMax > 0 && oldCurrent >= oldMax;
    m[key].baseMax = monsterBaseMax(m, key);
    const nextMax = monsterEffectiveMax(m, key);
    m[key].max = nextMax;
    m[key].current = wasFull ? nextMax : clamp(oldCurrent, 0, nextMax);
  }
  return m;
}
function monsterRankSelect(m, mode) {
  const v = monsterPhaseView(m, mode), rank = normalizeMonsterRank(v.rank), path = monsterPhasePath(m, mode, "rank");
  const attr = mode === "lib" ? `data-monster-lib-field="${m.id}:${path}"` : `data-active-monster-field="${m.id}:${path}"`;
  const info = monsterRankInfo(rank);
  const levelRule = monsterLevelCombatRule(v.normalLevel, v.level);
  const rule = (rank === "Elite" ? "HP ×2 · MP ×1 · INIT +2 · 2 TURNS" : rank.startsWith("Champion") ? `HP ×${info.hpMultiplier} · MP ×2 · INIT +${info.initiativeBonus} · ${info.turns} TURN${info.turns === 1 ? "" : "S"}` : "BASE HP/MP · INIT +0 · 1 TURN") + ` · ${levelRule}`;
  return `<select ${attr}>${MONSTER_RANKS.map(x => `<option value="${x}" ${x === rank ? "selected" : ""}>${x}</option>`).join("")}</select><small class="rank-rule">${rule}</small>`;
}
function normalizeMonster(raw) {
  const d = defaultMonster(raw?.name || "NEW MONSTER"), r = raw || {};
  let migratedTier = Number(r.studyTier);
  if (![0, 7, 10, 13].includes(migratedTier)) {
    const old = r.study || {};
    migratedTier = old.actions ? 13 : (old.attributes || old.defense || old.magicDefense || old.affinities ? 10 : (old.hp || old.mp || old.origin || old.level || r.revealed ? 7 : 0));
  }
  // Before schema 17, some old monster data stored Ultima Points in `ip`.
  // Schema 17 introduces a real Inventory Point cost pool, so never reinterpret
  // legacy `ip` as the new IP pool unless the record is already schema 17+.
  const rawSchema = Number(r.schema) || 0;
  const legacyUltimaIp = rawSchema < 17 && !r.up && r.ip && !r.costIp ? r.ip : null;
  const rawCostIp = r.costIp || (rawSchema >= 17 ? r.ip : null) || {};
  const rawUltima = r.up || legacyUltimaIp || {};
  const out = {
    ...d, ...r,
    normalLevel: Math.max(1, Number(r.normalLevel ?? r.level ?? d.level) || 5),
    villainType: normalizeVillainType(r.villainType),
    species: r.species ?? r.origin ?? "",
    rank: normalizeMonsterRank(r.rank),
    traits: r.traits ?? "",
    faction: r.faction === "ally" ? "ally" : "enemy",
    folderId: String(r.folderId || ""),
    tokenArt: normalizeTokenArt(r.tokenArt),
    hp: { ...d.hp, ...(r.hp || {}), baseMax: Math.max(0, Number(r.hp?.baseMax ?? r.hp?.max ?? d.hp.max) || 0) }, mp: { ...d.mp, ...(r.mp || {}), baseMax: Math.max(0, Number(r.mp?.baseMax ?? r.mp?.max ?? d.mp.max) || 0) }, ip: { ...d.ip, ...rawCostIp }, fp: Math.max(0, Number(r.costFp ?? r.fp ?? d.fp) || 0), up: { ...d.up, ...rawUltima },
    attributes: { ...d.attributes, ...(r.attributes || {}) }, attributeBuffs: { ...d.attributeBuffs, ...(r.attributeBuffs || {}) },
    statuses: { ...d.statuses, ...(r.statuses || {}) }, statusImmunities: { ...d.statusImmunities, ...(r.statusImmunities || {}) }, affinities: { ...d.affinities, ...(r.affinities || {}) }, studyTier: migratedTier
  };
  // v1.62+: NPC HP/MP are derived from Desired Level + base MIG/WLP. v1.63 adds Normal Level for Compendium level-adjustment Checks/Damage. Preserve legacy manual BASE MAX as an equivalent MOD.
  const legacyHpBase = Math.max(0, Number(r.hp?.baseMax ?? r.hp?.max ?? d.hp.baseMax ?? d.hp.max) || 0);
  const legacyMpBase = Math.max(0, Number(r.mp?.baseMax ?? r.mp?.max ?? d.mp.baseMax ?? d.mp.max) || 0);
  const rawHpFormula = (Math.max(1, Number(out.level) || 1) * 2) + ((Number(out.attributes?.MIG) || 8) * 5);
  const rawMpFormula = Math.max(1, Number(out.level) || 1) + ((Number(out.attributes?.WLP) || 8) * 5);
  out.hpMod = r.hpMod !== undefined ? (Number(r.hpMod) || 0) : legacyHpBase - rawHpFormula;
  out.mpMod = r.mpMod !== undefined ? (Number(r.mpMod) || 0) : legacyMpBase - rawMpFormula;
  // v1.36: Monster DEF/M.DEF are derived from current DEX/INS like player characters.
  // Preserve legacy non-default manual defenses as explicit overrides during migration.
  if (r.defenseMod === undefined && Number(r.defense) !== 8) out.defenseMod = String(Number(r.defense) || "");
  if (r.magicDefenseMod === undefined && Number(r.magicDefense) !== 8) out.magicDefenseMod = String(Number(r.magicDefense) || "");
  delete out.identity; delete out.origin; delete out.zenit; delete out.study; delete out.revealed;
  out.randomTarget = r.randomTarget !== false;
  out.sceneNoTurn = !!r.sceneNoTurn;
  out.actions = (Array.isArray(r.actions) ? r.actions : []).map(a => ({ ...blankMonsterAction(), ...a, category: normalizeActionType(a.category), element: ACTION_ELEMENTS.includes(a.element) ? a.element : "none", mod: Number(a.mod) || 0, damageHR: Number(a.damageHR ?? (Number.isFinite(Number(a.damage)) ? Number(a.damage) : 5)) || 0, frenzy: !!a.frenzy, randomTarget: a.randomTarget !== false }));
  out.phases = (Array.isArray(r.phases) ? r.phases : []).slice(0, MAX_MONSTER_PHASES).map((x, i) => {
    const p = normalizeMonsterPhase(x, out, i + 1); p.rank = normalizeMonsterRank(p.rank);
    if (x?.hpMod === undefined) p.hpMod = legacyHpBase - ((Math.max(1, Number(p.level) || 1) * 2) + ((Number(p.attributes?.MIG) || 8) * 5));
    if (x?.mpMod === undefined) p.mpMod = legacyMpBase - (Math.max(1, Number(p.level) || 1) + ((Number(p.attributes?.WLP) || 8) * 5));
    return p;
  });
  out.activePhase = clamp(Number(r.activePhase) || 0, 0, out.phases.length);
  out.specialRules = (Array.isArray(r.specialRules) ? r.specialRules : []).map(x => ({ name: x.name || "Special Rule", detail: x.detail || "" }));
  out.defeatedRestoreHp = Math.max(0, Number(r.defeatedRestoreHp) || 0);
  out.schema = 17; out.id = String(r.id || uid()); out.updatedAt = Number(out.updatedAt) || Date.now();
  out.ip ||= { current: 0, max: 0 }; out.ip.max = Math.max(0, Number(out.ip.max) || 0); out.ip.current = clamp(out.ip.current, 0, out.ip.max); out.fp = Math.max(0, Number(out.fp) || 0);
  out.rank = normalizeMonsterRank(out.rank);
  syncMonsterResourceCaps(out);
  enforceMonsterUltima(out);
  return out;
}
function loadLocal() {
  for (const key of [STORAGE_KEY, ...OLD_STORAGE_KEYS]) {
    try { const v = localStorage.getItem(key); if (v) return normalizeState(JSON.parse(v)); } catch {}
  }
  return defaultState();
}
function loadFeed() { try { return JSON.parse(localStorage.getItem(FEED_KEY) || "[]"); } catch { return []; } }
function saveFeed() { localStorage.setItem(FEED_KEY, JSON.stringify(runtime.feed.slice(-150))); }
function defaultFabulaAiChat() {
  return [{ role: "ai", text: "ถามกฎ Fabula Ultima เป็นภาษาไทยได้เลยครับ ระบบจะค้นจากหนังสือ Original ทั้ง 4 เล่มและแสดงชื่อหนังสือกับเลขหน้าที่เกี่ยวข้อง", sources: [], time: Date.now() }];
}
function loadFabulaAiChat() {
  try {
    const rows = JSON.parse(localStorage.getItem(FABULA_AI_CHAT_KEY) || "[]");
    return Array.isArray(rows) && rows.length ? rows.slice(-60) : defaultFabulaAiChat();
  } catch { return defaultFabulaAiChat(); }
}
function saveFabulaAiChat() { localStorage.setItem(FABULA_AI_CHAT_KEY, JSON.stringify((runtime.aiChat || []).slice(-60))); }
function defaultGMShopState() {
  return { panel: "generator", mode: "mix", category: "ACCESSORY", size: 7, role: "all", maxPrice: 0, stockRole: "all", stockCategory: "ACCESSORY", stockSearch: "", stockPage: 1, generated: [], active: [], history: [], cycleId: uid(), soldThisCycle: [] };
}
function normalizeGMShopState(raw) {
  const base = defaultGMShopState(), r = raw && typeof raw === "object" ? raw : {};
  const validId = value => /^(?:HB-\d{3}|WPN-\d{3}|LA-\d{3}|HA-\d{3}|SH-\d{3}|RW-\d{3}|RA-\d{3}|RS-\d{3}|CORE-[A-Z0-9-]+)$/.test(String(value || ""));
  const cleanIds = value => [...new Set((Array.isArray(value) ? value : []).map(String).filter(validId))].slice(0, 50);
  const cats = ["ACCESSORY","WEAPON","LIGHT ARMOR","HEAVY ARMOR","SHIELD"];
  const normalizeCat = value => cats.includes(String(value || "")) ? String(value) : "ACCESSORY";
  const mode = ["mix","homebrew","core"].includes(r.mode) ? r.mode : "mix";
  const history = (Array.isArray(r.history) ? r.history : []).map(h => ({
    id: String(h?.id || uid()), time: Number(h?.time) || Date.now(),
    mode: ["mix","homebrew","core"].includes(h?.mode) ? h.mode : "mix",
    category: normalizeCat(h?.category), items: cleanIds(h?.items)
  })).filter(h => h.items.length).slice(0, 20);
  return {
    panel: ["generator","stock","active","history"].includes(r.panel) ? r.panel : base.panel,
    mode, category: normalizeCat(r.category), size: clamp(Number(r.size) || base.size, 3, 12), maxPrice: Math.max(0, Math.min(999999999, Number(r.maxPrice) || 0)),
    role: ["all","โจมตี","ป้องกัน","สนับสนุน","สถานะ","อรรถประโยชน์"].includes(r.role) ? r.role : "all",
    stockRole: ["all","โจมตี","ป้องกัน","สนับสนุน","สถานะ","อรรถประโยชน์"].includes(r.stockRole) ? r.stockRole : "all",
    stockCategory: normalizeCat(r.stockCategory), stockSearch: String(r.stockSearch || "").slice(0, 80),
    stockPage: Math.max(1, Number(r.stockPage) || 1), generated: cleanIds(r.generated), active: cleanIds(r.active), history,
    cycleId: String(r.cycleId || uid()), soldThisCycle: cleanIds(r.soldThisCycle)
  };
}
function loadGMShopState() {
  try { return normalizeGMShopState(JSON.parse(localStorage.getItem(GM_SHOP_STATE_KEY) || "null")); }
  catch { return defaultGMShopState(); }
}
function saveGMShopState() {
  try { localStorage.setItem(GM_SHOP_STATE_KEY, JSON.stringify(runtime.gmShop)); } catch (err) { console.warn("gm shop save", err); }
}
const GM_SHOP_STOCK_SRC = "/gm-shop-stock.js";
let gmShopStockPromise = null;
let gmShopStockLoadError = "";
function gmShopStockLoaded() {
  return Array.isArray(window.GM_SHOP_HOMEBREW_STOCK) && Array.isArray(window.GM_SHOP_CORE_STOCK);
}
function gmShopValidStockId(value) {
  return /^(?:HB-\d{3}|TO-\d{3}|WPN-\d{3}|LA-\d{3}|HA-\d{3}|SH-\d{3}|RW-\d{3}|RA-\d{3}|RS-\d{3}|CORE-[A-Z0-9-]+)$/.test(String(value || ""));
}
function ensureGMShopStockLoaded() {
  if (gmShopStockLoaded()) return Promise.resolve(true);
  if (gmShopStockPromise) return gmShopStockPromise;
  gmShopStockLoadError = "";
  gmShopStockPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-fabula-shop-stock]');
    const script = existing || document.createElement("script");
    const done = () => { gmShopStockLoadError = ""; resolve(true); };
    const fail = () => { const err = new Error("SHOP stock data failed to load"); gmShopStockLoadError = err.message; gmShopStockPromise = null; try { script.remove(); } catch {} reject(err); };
    if (existing) {
      if (gmShopStockLoaded()) return done();
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", fail, { once: true });
      return;
    }
    script.src = GM_SHOP_STOCK_SRC;
    script.async = true;
    script.dataset.fabulaShopStock = "1";
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", fail, { once: true });
    document.head.appendChild(script);
  }).then(() => {
    if (["shop","roll","gmtools"].includes(runtime?.view)) render();
    return true;
  }).catch(err => {
    console.error("GM SHOP stock load failed", err);
    if (["shop","roll","gmtools"].includes(runtime?.view)) render();
    return false;
  });
  return gmShopStockPromise;
}
function gmShopLoadingHTML(label = "SHOP") {
  ensureGMShopStockLoaded();
  return `<div class="shop-data-loading"><b>${esc(label)} DATA</b><span>${gmShopStockLoadError ? esc(gmShopStockLoadError) : "LOADING ITEM STOCK…"}</span>${gmShopStockLoadError ? `<button type="button" class="mini-btn" data-action="retry-shop-stock">RETRY</button>` : ""}</div>`;
}
function scheduleGMShopStockWarmup() {
  const start = () => ensureGMShopStockLoaded();
  if (typeof requestIdleCallback === "function") requestIdleCallback(start, { timeout: 2500 });
  else setTimeout(start, 1200);
}

function gmShopHomebrewStock() { return Array.isArray(window.GM_SHOP_HOMEBREW_STOCK) ? window.GM_SHOP_HOMEBREW_STOCK : []; }
function gmShopTradeoffStock() { return Array.isArray(window.GM_SHOP_TRADEOFF_STOCK) ? window.GM_SHOP_TRADEOFF_STOCK : []; }
function gmShopCoreStock() { return Array.isArray(window.GM_SHOP_CORE_STOCK) ? window.GM_SHOP_CORE_STOCK : []; }
function gmShopRareWeaponStock() { return Array.isArray(window.GM_SHOP_RARE_WEAPON_STOCK) ? window.GM_SHOP_RARE_WEAPON_STOCK : []; }
function gmShopRareArmorStock() { return Array.isArray(window.GM_SHOP_RARE_ARMOR_STOCK) ? window.GM_SHOP_RARE_ARMOR_STOCK : []; }
function gmShopRareShieldStock() { return Array.isArray(window.GM_SHOP_RARE_SHIELD_STOCK) ? window.GM_SHOP_RARE_SHIELD_STOCK : []; }
function gmShopCustomWeaponStock() { return Array.isArray(window.GM_SHOP_CUSTOM_WEAPON_STOCK) ? window.GM_SHOP_CUSTOM_WEAPON_STOCK : []; }
function gmShopLightArmorStock() { return Array.isArray(window.GM_SHOP_LIGHT_ARMOR_STOCK) ? window.GM_SHOP_LIGHT_ARMOR_STOCK : []; }
function gmShopHeavyArmorStock() { return Array.isArray(window.GM_SHOP_HEAVY_ARMOR_STOCK) ? window.GM_SHOP_HEAVY_ARMOR_STOCK : []; }
function gmShopCustomShieldStock() { return Array.isArray(window.GM_SHOP_CUSTOM_SHIELD_STOCK) ? window.GM_SHOP_CUSTOM_SHIELD_STOCK : []; }
function gmShopOriginalLightArmorStock() { return gmShopRareArmorStock().filter(x => !x.martial); }
function gmShopOriginalHeavyArmorStock() { return gmShopRareArmorStock().filter(x => !!x.martial); }
function gmShopWeaponStock() { return [...gmShopRareWeaponStock(), ...gmShopCustomWeaponStock()]; }
function gmShopLightArmorCombinedStock() { return [...gmShopOriginalLightArmorStock(), ...gmShopLightArmorStock()]; }
function gmShopHeavyArmorCombinedStock() { return [...gmShopOriginalHeavyArmorStock(), ...gmShopHeavyArmorStock()]; }
function gmShopShieldStock() { return [...gmShopRareShieldStock(), ...gmShopCustomShieldStock()]; }
function gmShopCustomStock() { return [...gmShopHomebrewStock(), ...gmShopCustomWeaponStock(), ...gmShopLightArmorStock(), ...gmShopHeavyArmorStock(), ...gmShopCustomShieldStock()]; }
function gmShopRareStock() { return [...gmShopRareWeaponStock(), ...gmShopRareArmorStock(), ...gmShopRareShieldStock()]; }
function gmShopOriginalStock() { return [...gmShopCoreStock(), ...gmShopRareWeaponStock(), ...gmShopRareArmorStock(), ...gmShopRareShieldStock()]; }
function gmShopAllStock() { return [...gmShopOriginalStock(), ...gmShopCustomStock()]; }
function gmShopLookupStock() { return [...gmShopAllStock(), ...gmShopTradeoffStock()]; }
function gmShopItemCategory(item) {
  const raw = String(item?.itemCategory || "ACCESSORY").toUpperCase();
  if (raw === "RARE WEAPON") return "WEAPON";
  if (raw === "RARE SHIELD") return "SHIELD";
  if (raw === "RARE ARMOR") return item?.martial ? "HEAVY ARMOR" : "LIGHT ARMOR";
  return ["ACCESSORY","WEAPON","LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(raw) ? raw : "ACCESSORY";
}
function gmShopCategoryLabel(category) {
  return category === "WEAPON" ? "RARE WEAPONS" : category === "LIGHT ARMOR" ? "RARE LIGHT ARMOR" : category === "HEAVY ARMOR" ? "RARE HEAVY ARMOR" : category === "SHIELD" ? "RARE SHIELDS" : "ACCESSORIES";
}
function gmShopCategoryCount(category) {
  return gmShopAllStock().filter(x => gmShopItemCategory(x) === category).length;
}
function gmShopItemDataText(item) {
  const cat = gmShopItemCategory(item);
  if (cat === "WEAPON") return `${item.weaponCategory || "WEAPON"}${item.martial ? " · MARTIAL" : ""} · ${item.accuracy || "-"} · ${item.damage || "-"} · ${item.hands || "-"} · ${item.range || "-"}`;
  if (["LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(cat)) return `DEF ${item.defense || "-"} · M.DEF ${item.mDefense || "-"} · INIT ${item.initiative || "-"}${item.martial ? " · MARTIAL" : ""}`;
  return "ACCESSORY";
}
function gmShopBenefits(item) {
  if (["LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(gmShopItemCategory(item))) return [];
  if (Array.isArray(item?.benefits) && item.benefits.length) return item.benefits.map(String).filter(Boolean);
  const effect = String(item?.effect || "").trim();
  return effect ? [effect] : [];
}
function gmShopDrawbacks(item) { return Array.isArray(item?.drawbacks) ? item.drawbacks.map(String).filter(Boolean) : []; }
function gmShopActivationHTML(item, compact = false) {
  const cat = gmShopItemCategory(item);
  if (["LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(cat)) return "";
  const activation = String(item?.activation || "PASSIVE").toUpperCase();
  const timing = String(item?.timing || "").trim();
  const unique = !!item?.unique;
  return `<div class="gm-shop-activation ${compact ? "compact" : ""}"><span class="${activation === "ACTIVE" ? "active" : "passive"}">${esc(activation)}</span>${unique ? `<span class="unique">UNIQUE</span>` : ""}${timing ? `<small>${esc(timing)}</small>` : ""}</div>`;
}
function gmShopProsConsHTML(item, compact = false) {
  const benefits = gmShopBenefits(item), drawbacks = gmShopDrawbacks(item);
  const pros = benefits.length ? `<div class="gm-shop-pros"><b>ข้อดี</b><span>${benefits.map(v => `+ ${esc(v)}`).join("<br>")}</span></div>` : "";
  const cons = drawbacks.length ? `<div class="gm-shop-cons"><b>ข้อเสีย</b><span>${drawbacks.map(v => `− ${esc(v)}`).join("<br>")}</span></div>` : "";
  return `<div class="gm-shop-pros-cons ${compact ? "compact" : ""}">${pros}${cons}</div>`;
}
function gmShopItemById(id) { return gmShopLookupStock().find(x => String(x?.id) === String(id)) || null; }
function gmShopIsSellable(item) { return !!item && item.type !== "TRADE-OFF" && ["ACCESSORY","WEAPON","LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(gmShopItemCategory(item)); }
function gmShopModeLabel(mode = runtime.gmShop?.mode) { return mode === "core" ? "CORE-INSPIRED" : mode === "homebrew" ? "HOMEBREW" : "MIX"; }
function defaultSharedShop() {
  return { open: false, cycleId: "", revision: 0, publishedAt: 0, updatedAt: 0, publishedById: "", publishedByName: "", items: [], sold: [] };
}
function normalizeSharedShop(raw) {
  const base = defaultSharedShop(), r = raw && typeof raw === "object" ? raw : {};
  const seen = new Set();
  const items = (Array.isArray(r.items) ? r.items : []).map(x => ({ instanceId: String(x?.instanceId || ""), stockId: String(x?.stockId || ""), addedAt: Number(x?.addedAt) || 0 })).filter(x => x.instanceId && gmShopValidStockId(x.stockId) && !seen.has(x.instanceId) && seen.add(x.instanceId)).slice(0, 24);
  const sold = (Array.isArray(r.sold) ? r.sold : []).map(x => ({ instanceId: String(x?.instanceId || ""), stockId: String(x?.stockId || ""), buyerId: String(x?.buyerId || ""), buyerName: String(x?.buyerName || ""), price: Math.max(0, Number(x?.price) || 0), time: Number(x?.time) || Date.now() })).filter(x => x.instanceId && gmShopValidStockId(x.stockId)).slice(-120);
  return { ...base, open: !!r.open, cycleId: String(r.cycleId || ""), revision: Math.max(0, Number(r.revision) || 0), publishedAt: Number(r.publishedAt) || 0, updatedAt: Number(r.updatedAt) || 0, publishedById: String(r.publishedById || ""), publishedByName: String(r.publishedByName || ""), items, sold };
}
function sharedShopItem(instanceId) { return (runtime.sharedShop?.items || []).find(x => String(x.instanceId) === String(instanceId)) || null; }
function sharedShopSignature(shop = runtime.sharedShop) { const s = normalizeSharedShop(shop); return `${s.open?1:0}:${s.revision}:${s.cycleId}:${s.items.map(x=>`${x.instanceId}:${x.stockId}`).join(",")}`; }
function gmShopHostCanProcess(shop = runtime.sharedShop) { return runtime.currentPlayer.role === "GM" && (!shop?.publishedById || String(shop.publishedById) === String(runtime.currentPlayer.id)); }
function queueShopTransaction(task) {
  const prior = runtime.shopTxnPromise || Promise.resolve();
  const next = prior.catch(() => {}).then(task);
  runtime.shopTxnPromise = next.catch(err => console.warn("shop transaction", err));
  return next;
}
function shopInventoryCard(item, instanceId, price) {
  const benefits = gmShopBenefits(item), drawbacks = gmShopDrawbacks(item);
  const benefitText = benefits.length ? `ข้อดี:\n${benefits.map(x => `+ ${x}`).join("\n")}` : "";
  const drawbackText = drawbacks.length ? `ข้อเสีย:\n${drawbacks.map(x => `- ${x}`).join("\n")}` : "";
  const category = gmShopItemCategory(item), data = gmShopItemDataText(item);
  const activeText = ["LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(category) ? "" : `TYPE: ${String(item?.activation || "PASSIVE").toUpperCase()}${item?.unique ? " · UNIQUE" : ""}\nTIMING: ${String(item?.timing || "-")}`;
  return { id: uid(), name: String(item?.name || "Shop Item"), itemType: category, detail: `PURCHASED: ${Number(price)||0}z\nSOURCE: ${String(item?.source || "U.E. EQUIPMENT")}\nITEM DATA: ${data}${activeText ? `\n${activeText}` : ""}\n\n${String(item?.description || "")}\n\n${[benefitText, drawbackText].filter(Boolean).join("\n\n")}`.trim(), shopPurchaseId: String(instanceId || ""), shopStockId: String(item?.id || ""), purchasePrice: Math.max(0, Number(price) || 0) };
}
async function writeSharedShop(snapshot) {
  const next = normalizeSharedShop(snapshot); runtime.sharedShop = next;
  if (PREVIEW || !runtime.online) { if (["shop","gmtools"].includes(runtime.view)) render(); return next; }
  if (runtime.currentPlayer.role !== "GM") return next;
  await OBR.scene.setMetadata({ [SCENE_SHOP_KEY]: deepClone(next) });
  broadcast("shop-sync", { id: uid(), senderId: runtime.currentPlayer.id, shop: deepClone(next), time: Date.now() });
  return next;
}
async function syncGMShopActiveToPlayers({ forceOpen = false, quiet = true } = {}) {
  if (runtime.currentPlayer.role !== "GM") return normalizeSharedShop(runtime.sharedShop);
  return queueShopTransaction(async () => {
    let current = normalizeSharedShop(runtime.sharedShop);
    if (!PREVIEW && runtime.online && await OBR.scene.isReady()) { const md = await OBR.scene.getMetadata(); current = normalizeSharedShop(md[SCENE_SHOP_KEY]); }
    const shouldOpen = !!forceOpen || !!current.open;
    if (!shouldOpen) return current;
    const sameCycle = String(current.cycleId || "") === String(runtime.gmShop.cycleId || "");
    const oldByStock = new Map((sameCycle ? current.items : []).map(x => [x.stockId, x]));
    const soldSet = new Set(runtime.gmShop.soldThisCycle || []);
    const items = runtime.gmShop.active.filter(id => !soldSet.has(id)).map(stockId => oldByStock.get(stockId) || { instanceId: uid(), stockId, addedAt: Date.now() });
    const now = Date.now();
    const next = { open: true, cycleId: runtime.gmShop.cycleId, revision: (Number(current.revision)||0)+1, publishedAt: sameCycle && current.publishedAt ? current.publishedAt : now, updatedAt: now, publishedById: runtime.currentPlayer.id, publishedByName: runtime.currentPlayer.name, items, sold: sameCycle ? current.sold : [] };
    await writeSharedShop(next);
    if (!quiet) showToast("PLAYER SHOP", `${items.length} ITEMS SYNCED`, "message", false);
    return next;
  });
}
async function publishGMShopToPlayers() {
  if (runtime.currentPlayer.role !== "GM") return;
  if (!runtime.gmShop.active.length) { showToast("GM SHOP", "Active Shop is empty", "message"); return; }
  await syncGMShopActiveToPlayers({ forceOpen: true, quiet: false });
  render();
}
async function closeGMShopToPlayers() {
  if (runtime.currentPlayer.role !== "GM") return;
  await queueShopTransaction(async () => {
    const current = normalizeSharedShop(runtime.sharedShop), now = Date.now();
    await writeSharedShop({ ...current, open: false, revision: current.revision + 1, updatedAt: now, items: [] });
    showToast("PLAYER SHOP", "SHOP CLOSED", "message", false); render();
  });
}
function shopPurchaseResult(buyerId, requestId, ok, message, extra = {}) {
  broadcast("shop-purchase-result", { id: uid(), requestId, buyerId, ok: !!ok, message: String(message || ""), ...extra, senderId: runtime.currentPlayer.id, time: Date.now() });
}
async function processShopPurchaseRequest(req = {}) {
  if (!gmShopHostCanProcess(runtime.sharedShop)) return;
  if (!await ensureGMShopStockLoaded()) { shopPurchaseResult(String(req.buyerId || ""), String(req.requestId || ""), false, "ข้อมูลร้านยังโหลดไม่สำเร็จ"); return; }
  return queueShopTransaction(async () => {
    const buyerId = String(req.buyerId || ""), requestId = String(req.requestId || ""), instanceId = String(req.instanceId || "");
    if (!buyerId || !requestId || !instanceId) return;
    let latest = runtime.sharedShop;
    if (!PREVIEW && runtime.online && await OBR.scene.isReady()) { const md = await OBR.scene.getMetadata(); latest = normalizeSharedShop(md[SCENE_SHOP_KEY]); }
    if (!latest.open) { shopPurchaseResult(buyerId, requestId, false, "ร้านปิดแล้ว"); return; }
    const rec = latest.items.find(x => x.instanceId === instanceId);
    if (!rec) { shopPurchaseResult(buyerId, requestId, false, "สินค้าชิ้นนี้ถูกซื้อไปแล้ว"); return; }
    const item = gmShopItemById(rec.stockId); if (!item) { shopPurchaseResult(buyerId, requestId, false, "ไม่พบข้อมูลสินค้า"); return; }
    const partyRec = runtime.party.find(p => String(p.id) === buyerId);
    const raw = bestPlayerSheetRaw(buyerId, partyRec?.metadata?.[META_KEY]);
    if (!raw || raw.deleted) { shopPurchaseResult(buyerId, requestId, false, "ไม่พบ Character Sheet ของผู้ซื้อ"); return; }
    const sheet = normalizeState(raw), price = Math.max(0, Number(item.cost) || 0);
    if ((Number(sheet.zenit) || 0) < price) { shopPurchaseResult(buyerId, requestId, false, `Zenit ไม่พอ · ต้องใช้ ${price.toLocaleString()}z`); return; }
    const now = Date.now(), sale = { instanceId, stockId: rec.stockId, buyerId, buyerName: partyRec?.name || sheet.name || "PLAYER", price, time: now };
    latest = { ...latest, revision: latest.revision + 1, updatedAt: now, items: latest.items.filter(x => x.instanceId !== instanceId), sold: [...latest.sold, sale].slice(-120) };
    await writeSharedShop(latest);
    runtime.gmShop.active = runtime.gmShop.active.filter(x => x !== rec.stockId);
    runtime.gmShop.soldThisCycle = [...new Set([...(runtime.gmShop.soldThisCycle || []), rec.stockId])];
    saveGMShopState();
    const card = shopInventoryCard(item, instanceId, price);
    await sendRemoteEdit(buyerId, { kind: "shop-purchase", purchaseId: instanceId, price, item: card });
    shopPurchaseResult(buyerId, requestId, true, `${item.name} ถูกเพิ่มเข้า ITEMS แล้ว`, { instanceId, stockId: rec.stockId, itemName: item.name, price });
    if (runtime.view === "gmtools") render();
  });
}
async function requestShopPurchase(instanceId) {
  if (!await ensureGMShopStockLoaded()) { showToast("SHOP", "โหลดข้อมูลสินค้าไม่สำเร็จ", "message"); return; }
  const rec = sharedShopItem(instanceId), item = rec ? gmShopItemById(rec.stockId) : null;
  if (!runtime.sharedShop?.open || !rec || !item) { showToast("SHOP", "สินค้าชิ้นนี้ไม่มีในร้านแล้ว", "message"); return; }
  const price = Math.max(0, Number(item.cost) || 0);
  if ((Number(state.zenit) || 0) < price) { showToast("NOT ENOUGH ZENIT", `ต้องใช้ ${price.toLocaleString()}z`, "message"); return; }
  runtime.shopPurchasePending ||= {};
  if (runtime.shopPurchasePending[instanceId]) return;
  const requestId = uid(); runtime.shopPurchasePending[instanceId] = { requestId, time: Date.now() }; render();
  const req = { requestId, instanceId: String(instanceId), buyerId: runtime.currentPlayer.id, buyerName: state.name || runtime.currentPlayer.name, observedZenit: Number(state.zenit)||0, senderId: runtime.currentPlayer.id, time: Date.now() };
  if (gmShopHostCanProcess(runtime.sharedShop)) processShopPurchaseRequest(req); else broadcast("shop-purchase-request", req);
  setTimeout(() => { const p = runtime.shopPurchasePending?.[instanceId]; if (p?.requestId === requestId) { delete runtime.shopPurchasePending[instanceId]; if (runtime.view === "shop") render(); showToast("SHOP", "ยังไม่ได้รับการยืนยันจาก GM", "message"); } }, 9000);
}
async function openGMShopDetail(id) {
  if (!await ensureGMShopStockLoaded()) return;
  const item = gmShopItemById(id); if (!item) return;
  runtime.overlay = { kind: "gm-shop-detail", itemId: String(item.id) };
  renderOverlay();
}
function gmShopDetailHTML(x) {
  const item = gmShopItemById(x?.itemId); if (!item) return "";
  const trade = item.type === "TRADE-OFF", hb = item.type === "HOMEBREW" || trade, active = runtime.gmShop.active.includes(item.id), category = gmShopItemCategory(item);
  const price = item.flawDiscount ? `<div class="gm-shop-price-breakdown"><span>BASE ${Number(item.baseCost || item.cost || 0).toLocaleString()}z</span><b>FLAW −${Number(item.flawDiscount)}%</b><strong>FINAL ${Number(item.cost || 0).toLocaleString()}z</strong></div>` : "";
  return `<div class="cinematic-backdrop gm-shop-detail-backdrop" data-overlay-backdrop-close><div class="cinematic-card gm-shop-detail-card"><button type="button" class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">GM SHOP · ${esc(category)}</div><div class="gm-shop-detail-title"><div><small>${esc(item.id)} · ${esc(item.role || "UTILITY")}</small><h2>${esc(item.name)}</h2><span>${esc(item.source || "U.E. EQUIPMENT")}</span></div><strong>${Number(item.cost || 0).toLocaleString()}z</strong></div>${price}<div class="gm-shop-detail-tags"><span class="${trade ? "trade" : hb ? "hb" : "core"}">${esc(category)}</span><span>${esc(item.type || "ITEM")}</span></div><div class="gm-shop-detail-description">${esc(item.description || "")}</div>${gmShopActivationHTML(item)}<div class="gm-shop-detail-grid"><section><b>ITEM DATA</b><p>${esc(gmShopItemDataText(item))}</p></section><section class="gm-shop-detail-mechanics"><b>${["LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(category) ? "ข้อเสีย" : "ข้อดี / ข้อเสีย"}</b>${gmShopProsConsHTML(item)}</section></div><div class="gm-shop-detail-footer"><span>${item.redesigned ? "CAMPAIGN REDESIGN" : hb ? "HOMEBREW · GM APPROVAL · FLAW PRICING REFERENCE" : "ORIGINAL / CORE RULE ITEM"}</span>${active ? `<button type="button" class="mini-btn danger-soft" data-gm-shop-remove="${esc(item.id)}" data-close-shop-detail>REMOVE FROM ACTIVE</button>` : `<button type="button" class="mini-btn active" data-gm-shop-add="${esc(item.id)}" data-close-shop-detail>ADD TO ACTIVE SHOP</button>`}</div></div></div>`;
}

const FABULA_AI_BOOKS = {
  core: { name: "Fabula Ultima Core Rulebook v1.1", pages: 362, pdf: "books/fabula-ultima-core-rulebook-v1.1.pdf" },
  high: { name: "High Fantasy Atlas v1.1", pages: 202, pdf: "books/high-fantasy-atlas-v1.1.pdf" },
  natural: { name: "Natural Fantasy Atlas v1.1", pages: 210, pdf: "books/natural-fantasy-atlas-v1.1.pdf" },
  techno: { name: "Techno Fantasy Atlas v1.1", pages: 218, pdf: "books/techno-fantasy-atlas-v1.1.pdf" }
};
let fabulaAiIndex = null;
let fabulaAiIndexPromise = null;
async function ensureFabulaAiIndex() {
  if (fabulaAiIndex) return fabulaAiIndex;
  if (fabulaAiIndexPromise) return fabulaAiIndexPromise;
  fabulaAiIndexPromise = (async () => {
    const packed = String(window.FABULA_AI_PACKED_BOOKS || "");
    if (!packed) throw new Error("Fabula AI book index is missing");
    if (!("DecompressionStream" in window)) throw new Error("This browser cannot open the local rule index");
    const bytes = Uint8Array.from(atob(packed), c => c.charCodeAt(0));
    const ds = new DecompressionStream("gzip");
    const raw = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid Fabula AI index");
    fabulaAiIndex = parsed;
    return fabulaAiIndex;
  })().catch(err => { fabulaAiIndexPromise = null; throw err; });
  return fabulaAiIndexPromise;
}
function fabulaAiNorm(value = "") {
  return String(value || "").toLowerCase().normalize("NFKC").replace(/[“”"'.:,;!?()[\]{}]/g, " ").replace(/\s+/g, " ").trim();
}
const FABULA_AI_THAI_MAP = [
  ["อินิช", "initiative"], ["ความคิดริเริ่ม", "initiative"], ["เครื่องประดับ", "accessory"], ["แอคเซสซอรี่", "accessory"],
  ["ป้องกัน", "defense"], ["เวทป้องกัน", "magic defense"], ["สถานะ", "status effect"], ["คริซิส", "crisis"],
  ["นักบิน", "pilot"], ["รถส่วนตัว", "personal vehicle"], ["โมดูล", "module"], ["อินโวคเกอร์", "invoker"],
  ["เทคโนสเฟียร์", "technosphere"], ["หลอม", "forging"], ["ตีของ", "forging"], ["วัตถุดิบ", "materials"],
  ["คลาส", "class"], ["สกิล", "skill"], ["ฮีโรอิค", "heroic skill"], ["ควิร์ก", "quirk"], ["ซีโร่พาวเวอร์", "zero power"],
  ["มอน", "npc"], ["ความเสียหาย", "damage"], ["ต้านทาน", "resistance"], ["ภูมิคุ้มกัน", "immunity"]
];
function fabulaAiTerms(query = "") {
  const n = fabulaAiNorm(query), extra = [];
  for (const [th, en] of FABULA_AI_THAI_MAP) if (n.includes(fabulaAiNorm(th))) extra.push(en);
  return [...new Set([...n.split(" ").filter(x => x.length > 1), ...extra.flatMap(x => x.split(" "))])].filter(Boolean);
}
function fabulaAiSelectedBookSet() {
  const active = Object.entries(runtime.aiBooks || {}).filter(([, on]) => on !== false).map(([key]) => key);
  return new Set(active.length ? active : Object.keys(FABULA_AI_BOOKS));
}
function fabulaAiPageScore(page, terms, phrase) {
  const body = fabulaAiNorm(page?.t || ""); if (!body) return 0;
  let score = phrase && phrase.length > 4 && body.includes(phrase) ? 25 : 0;
  for (const term of terms) {
    let pos = 0, count = 0;
    while ((pos = body.indexOf(term, pos)) !== -1 && count < 12) { count++; pos += term.length; }
    score += count * (term.length >= 7 ? 4 : 2);
    if (body.includes(` ${term} `)) score += 1;
  }
  return score;
}
async function fabulaAiSearch(query = "") {
  const index = await ensureFabulaAiIndex(), books = fabulaAiSelectedBookSet(), terms = fabulaAiTerms(query), phrase = fabulaAiNorm(query);
  if (!terms.length) return [];
  const scored = [];
  for (const page of index) {
    if (!books.has(page.b)) continue;
    const score = fabulaAiPageScore(page, terms, phrase);
    if (score > 0) scored.push({ page, score });
  }
  scored.sort((a,b) => b.score - a.score);
  const out = [], seen = new Set();
  for (const row of scored) {
    const key = `${row.page.b}:${row.page.p}`; if (seen.has(key)) continue;
    seen.add(key); out.push({ book: row.page.b, page: row.page.p });
    if (out.length >= 5) break;
  }
  return out;
}
function fabulaAiSourceLabel(source) { return `${FABULA_AI_BOOKS[source?.book]?.name || "Fabula Ultima"} · หน้า ${Number(source?.page) || "?"}`; }
function fabulaAiPageEntry(index, book, page) {
  const key = String(book || ""), num = Number(page) || 0;
  return (Array.isArray(index) ? index : []).find(row => row?.b === key && Number(row?.p) === num) || null;
}
async function openFabulaAiPage(book, page) {
  const key = String(book || ""), info = FABULA_AI_BOOKS[key], num = Number(page) || 0;
  if (!info || num < 1 || num > Number(info.pages || 0)) { showToast("FABULA AI", "Page reference is invalid", "message"); return; }
  try {
    const index = await ensureFabulaAiIndex();
    const row = fabulaAiPageEntry(index, key, num);
    runtime.overlay = {
      kind: "fabula-ai-page",
      book: key,
      page: num,
      pdf: String(info.pdf || ""),
      text: String(row?.t || "")
    };
    renderOverlay();
  } catch (err) {
    console.error("Fabula AI page reader failed", err);
    showToast("FABULA AI", err?.message || "Could not open page", "message");
  }
}
function fabulaAiPageReaderHTML(x) {
  const key = String(x?.book || ""), info = FABULA_AI_BOOKS[key] || { name: "Fabula Ultima", pages: 0, pdf: "" }, page = Number(x?.page) || 0;
  const prev = page > 1 ? `<button type="button" class="mini-btn fabula-ai-page-nav" data-action="open-fabula-ai-page" data-ai-source-book="${esc(key)}" data-ai-source-page="${page - 1}">← PAGE ${page - 1}</button>` : `<span></span>`;
  const next = page < Number(info.pages || 0) ? `<button type="button" class="mini-btn fabula-ai-page-nav" data-action="open-fabula-ai-page" data-ai-source-book="${esc(key)}" data-ai-source-page="${page + 1}">PAGE ${page + 1} →</button>` : `<span></span>`;
  const body = String(x?.text || "").trim();
  const pdf = String(x?.pdf || info.pdf || "").trim();
  const src = pdf ? `${esc(pdf)}#page=${page}&zoom=page-width` : "";
  const viewer = src
    ? `<div class="fabula-ai-page-canvas-wrap"><iframe class="fabula-ai-page-frame" src="${src}" loading="lazy" title="${esc(info.name)} page ${page}"></iframe></div>`
    : `<div class="fabula-ai-page-missing">PDF preview is not available for this book.</div>`;
  const fallback = `<details class="fabula-ai-page-fallback"><summary>อ่านข้อความ extracted ของหน้านี้</summary><pre class="fabula-ai-page-text">${esc(body || "NO PARSED TEXT ON THIS PAGE")}</pre></details>`;
  return `<div class="cinematic-backdrop fabula-ai-page-backdrop" data-overlay-backdrop-close><div class="cinematic-card fabula-ai-page-reader"><button type="button" class="overlay-close" data-action="close-overlay">×</button><div class="fabula-ai-page-head"><div><div class="cinematic-kicker">FABULA AI · ORIGINAL PAGE</div><h2>${esc(info.name)}</h2><div class="fabula-ai-page-number">PAGE ${page} / ${Number(info.pages || 0)}</div></div></div><div class="fabula-ai-page-toolbar">${prev}<b>${esc(info.name)} · หน้า ${page}</b>${next}</div><div class="fabula-ai-page-viewer">${viewer}${fallback}</div><div class="fabula-ai-page-footer"><span>ORIGINAL BOOK PAGE · LOCAL PDF PREVIEW</span><button type="button" class="mini-btn" data-action="close-overlay">BACK TO AI CHAT</button></div></div></div>`;
}

function fabulaAiThaiAnswer(query = "", hits = []) {
  const n = fabulaAiNorm(query), primary = hits[0] ? ` อ้างอิงหลักที่พบ: ${fabulaAiSourceLabel(hits[0])}` : "";
  if (n.includes("accessor") || n.includes("เครื่องประดับ") || n.includes("แอคเซส")) return `Accessory ใน Fabula Ultima ออกแบบโดยกำหนด Quality ที่อุปกรณ์มอบให้ และราคาสัมพันธ์กับ Quality นั้น หนังสือยังสนับสนุนเอฟเฟกต์เฉพาะตัวที่มีลูกเล่นและส่งเสริมวิธีเล่นที่แตกต่าง ไม่จำเป็นต้องเป็นเพียงโบนัสตัวเลข${primary}`;
  if (n.includes("initiative") || n.includes("อินิช") || n.includes("ความคิดริเริ่ม")) return `Initiative ใช้กับการเริ่ม Conflict และมี Initiative modifier ที่อาจได้รับผลจากอุปกรณ์หรือเอฟเฟกต์ต่าง ๆ หากต้องการสูตรเฉพาะของ Group Initiative Check ให้ระบุชื่อนี้ในคำถามเพื่อค้นหน้ากฎที่ตรงขึ้น${primary}`;
  if (n.includes("technosphere") || n.includes("เทคโนสเฟียร์")) return `Technospheres เป็นกฎเสริมจาก Techno Fantasy Atlas ซึ่งทำให้หลายองค์ประกอบของ Class, Skills, Qualities และ Equipment กลายเป็นระบบแบบ modular และแบ่งหลัก ๆ เป็น mnemospheres กับ hoplospheres${primary}`;
  if (n.includes("invoker") || n.includes("อินโวคเกอร์")) return `Invoker เป็น Class จาก Natural Fantasy Atlas และใช้ Invocations เป็นแกนหลักของความสามารถคลาส${primary}`;
  if (n.includes("pilot") || n.includes("นักบิน") || n.includes("personal vehicle")) return `Pilot เป็น Class จาก Techno Fantasy Atlas และมีระบบ Personal Vehicle กับ Modules โดย Personal Vehicle ถูกถือเป็นส่วนขยายของ Pilot มากกว่าจะมีค่าสถานะแยกเป็นตัวละครอีกชุด${primary}`;
  if (n.includes("forging") || n.includes("หลอม") || n.includes("ตีของ")) return `Natural Fantasy Atlas มี optional rules สำหรับ Materials & Forging ซึ่งใช้สร้าง weapons, armor, shields และ accessories โดยอิงกฎ rare items จาก Core Rulebook${primary}`;
  if (n.includes("champion") || n.includes("elite") || n.includes("soldier") || n.includes("rank")) return `NPC Rank ใช้แบ่งระดับความสำคัญและความอันตรายของ NPC เช่น Soldier, Elite และ Champion และมีผลต่อแนวทางการออกแบบ NPC ตามกฎ Game Master${primary}`;
  if (n.includes("crisis")) return `Crisis เป็นเงื่อนไขสำคัญเมื่อ HP ปัจจุบันของตัวละครลดลงถึงครึ่งหนึ่งของ HP สูงสุดหรือต่ำกว่า และ Skill หรือ Item หลายชนิดตรวจเงื่อนไขนี้เพื่อเปิดใช้เอฟเฟกต์${primary}`;
  if (n.includes("status") || n.includes("สถานะ") || n.includes("dazed") || n.includes("slow") || n.includes("shaken") || n.includes("weak") || n.includes("enraged") || n.includes("poisoned")) return `Status Effects เป็นเงื่อนไขที่ลดความสามารถของตัวละครผ่าน Attribute ที่เกี่ยวข้อง และสามารถถูกป้องกัน ลบ หรือใช้เป็นเงื่อนไขของ Skill และ Item บางชนิดได้${primary}`;
  if (n.includes("accuracy") || n.includes("damage") || n.includes("high roll") || /(^|\s)hr($|\s)/.test(n)) return `การโจมตีใช้ Accuracy Check เพื่อตรวจว่าถูกเป้าหมายหรือไม่ ส่วนความเสียหายจำนวนมากจะอิง High Roll (HR) และค่าคงที่จากอาวุธ, Spell หรือ Skill ที่กำลังใช้ จึงควรอ่านสูตรของแอ็กชันนั้นร่วมกัน${primary}`;
  if (hits.length) return `พบเนื้อหาที่เกี่ยวข้องในหนังสือแล้ว ด้านล่างคือหน้าที่ตรงกับคำถามมากที่สุด รุ่นนี้ใช้ Local Rule Search จึงยังไม่สังเคราะห์คำตอบอิสระแบบโมเดล AI เต็มรูปแบบ${primary}`;
  return `ยังไม่พบเนื้อหาที่ตรงพอ ลองใช้ชื่อกฎหรือคำศัพท์ Original เช่น Accuracy Check, Champion Rank, Invoker, Pilot, Technospheres, Accessory หรือ Forging`;
}
function fabulaAiMessagesHTML() {
  return (runtime.aiChat || []).map(msg => {
    const user = msg.role === "user";
    const sources = !user && Array.isArray(msg.sources) && msg.sources.length ? `<div class="fabula-ai-sources">${msg.sources.map(s => `<button type="button" class="fabula-ai-source" data-action="open-fabula-ai-page" data-ai-source-book="${esc(s.book || "")}" data-ai-source-page="${Number(s.page) || 0}" title="OPEN ORIGINAL PAGE">${esc(fabulaAiSourceLabel(s))}<small>READ PAGE</small></button>`).join("")}</div>` : "";
    return `<div class="fabula-ai-msg ${user ? "user" : "ai"}"><div class="fabula-ai-msg-meta">${user ? "YOU" : "FABULA AI"}</div><div class="fabula-ai-bubble">${formatText(msg.text || "")}${sources}</div></div>`;
  }).join("");
}
function fabulaAiBooksHTML() {
  return Object.entries(FABULA_AI_BOOKS).map(([key, book]) => `<label class="fabula-ai-book"><input type="checkbox" data-ai-book="${key}" ${runtime.aiBooks?.[key] === false ? "" : "checked"}><span><b>${esc(book.name)}</b><small>ORIGINAL BOOK</small></span></label>`).join("");
}
function fabulaAiPanelHTML() {
  const busy = !!runtime.aiBusy;
  return `<div class="fabula-ai-chat"><div class="fabula-ai-log">${fabulaAiMessagesHTML()}${busy ? `<div class="fabula-ai-thinking">กำลังค้นจากหนังสือที่เลือก…</div>` : ""}</div><div class="fabula-ai-compose"><textarea data-ai-input placeholder="ถามกฎ Fabula Ultima เป็นภาษาไทย…"></textarea><button class="primary" data-action="ask-fabula-ai" ${busy ? "disabled" : ""}>ASK AI</button></div></div>`;
}
async function askFabulaAi() {
  if (runtime.aiBusy) return;
  const input = document.querySelector("[data-ai-input]"), query = input?.value?.trim(); if (!query) return;
  const aiPanelVisible = () => runtime.view === "chat" && runtime.chatPanel === "ai";
  runtime.aiChat.push({ role: "user", text: query, sources: [], time: Date.now() });
  runtime.aiBusy = true; saveFabulaAiChat();
  if (aiPanelVisible()) render();
  try {
    const hits = await fabulaAiSearch(query);
    runtime.aiChat.push({ role: "ai", text: fabulaAiThaiAnswer(query, hits), sources: hits, time: Date.now() });
  } catch (err) {
    console.error("Fabula AI search failed", err);
    runtime.aiChat.push({ role: "ai", text: `ไม่สามารถเปิดฐานข้อมูลกฎได้: ${err?.message || "Unknown error"}`, sources: [], time: Date.now() });
  } finally {
    runtime.aiBusy = false; saveFabulaAiChat();
    // v2.68: an AI request is not allowed to repaint another view/subtab after the user has navigated away.
    if (aiPanelVisible()) {
      render();
      requestAnimationFrame(() => { const log = document.querySelector(".fabula-ai-log"); if (log) log.scrollTop = log.scrollHeight; });
    }
  }
}

function loadVault() { try { return JSON.parse(localStorage.getItem(VAULT_KEY) || "[]").map(normalizeState).filter(x => !x.deleted); } catch { return []; } }
function saveVault(v) { localStorage.setItem(VAULT_KEY, JSON.stringify(v)); }
function loadMonsterLibrary() { try { return JSON.parse(localStorage.getItem(MONSTER_LIB_KEY) || "[]").map(normalizeMonster); } catch { return []; } }
function saveMonsterLibrary(v) { localStorage.setItem(MONSTER_LIB_KEY, JSON.stringify(v)); }
function normalizeMonsterLibraryFolders(v) {
  return (Array.isArray(v) ? v : []).map((x, i) => ({ id: String(x?.id || uid()), name: String(x?.name || `FOLDER ${i + 1}`).trim() || `FOLDER ${i + 1}`, order: Number.isFinite(Number(x?.order)) ? Number(x.order) : i })).sort((a,b)=>a.order-b.order).map((x,i)=>({ ...x, order:i }));
}
function loadMonsterLibraryFolders() { try { return normalizeMonsterLibraryFolders(JSON.parse(localStorage.getItem(MONSTER_LIB_FOLDERS_KEY) || "[]")); } catch { return []; } }
function saveMonsterLibraryFolders(v) { localStorage.setItem(MONSTER_LIB_FOLDERS_KEY, JSON.stringify(normalizeMonsterLibraryFolders(v))); }
function normalizeCodexGroup(v) { return String(v || "").toLowerCase() === "npc" ? "npc" : "ue"; }
function codexSort(a, b) {
  const ao = Number.isFinite(Number(a?.order)) ? Number(a.order) : 999999;
  const bo = Number.isFinite(Number(b?.order)) ? Number(b.order) : 999999;
  if (ao !== bo) return ao - bo;
  return String(a?.monster?.name || a?.name || "").localeCompare(String(b?.monster?.name || b?.name || ""), undefined, { sensitivity: "base", numeric: true });
}
function loadCodex() {
  try {
    return JSON.parse(localStorage.getItem(CODEX_KEY) || "[]")
      .map((x, i) => ({ ...x, folderId: String(x.folderId || ""), order: Number.isFinite(Number(x.order)) ? Number(x.order) : i, monster: normalizeMonster(x.monster || x) }))
      .sort(codexSort);
  } catch { return []; }
}
function cacheCodex(v) { try { localStorage.setItem(CODEX_KEY, JSON.stringify(v || [])); } catch {} }
function normalizeCodexFolders(v) {
  const seen = new Set();
  return (Array.isArray(v) ? v : []).map((x, i) => ({ id: String(x?.id || uid()), name: String(x?.name || `FOLDER ${i + 1}`).trim() || `FOLDER ${i + 1}`, order: Number.isFinite(Number(x?.order)) ? Number(x.order) : i })).filter(x => x.id && !seen.has(x.id) && seen.add(x.id)).sort((a,b) => a.order - b.order).map((x,i) => ({ ...x, order: i }));
}
function normalizeSharedCodexState(raw, fallbackEntries = []) {
  const folders = normalizeCodexFolders(raw?.folders);
  const validFolders = new Set(folders.map(x => x.id));
  const sourceEntries = Array.isArray(raw?.entries) ? raw.entries : (Array.isArray(fallbackEntries) ? fallbackEntries : []);
  const entries = sourceEntries.map((x, i) => ({
    ...x,
    key: String(x?.key || codexKeyForMonster(x?.monster || x)),
    folderId: validFolders.has(String(x?.folderId || "")) ? String(x.folderId) : "",
    order: Number.isFinite(Number(x?.order)) ? Number(x.order) : i,
    learnedTier: Number(x?.learnedTier) || monsterMaxStudyTier(x?.monster || x),
    monster: normalizeMonster(x?.monster || x),
    updatedAt: Number(x?.updatedAt) || Date.now()
  })).filter(x => x.key);
  return { folders, entries, updatedAt: Number(raw?.updatedAt) || 0 };
}
function sharedCodexSnapshot() {
  return { version: 1, folders: deepClone(runtime.codexFolders || []), entries: deepClone(runtime.codex || []), updatedAt: Date.now() };
}
async function saveSharedCodex() {
  if (PREVIEW || !runtime.online) { runtime.codexDirty = false; return; }
  const saveVersion = Number(runtime.codexSaveVersion) || 0;
  try {
    if (!await OBR.scene.isReady()) return;
    cacheCodex(runtime.codex || []);
    await OBR.scene.setMetadata({ [SCENE_CODEX_KEY]: sharedCodexSnapshot() });
    if ((Number(runtime.codexSaveVersion) || 0) === saveVersion) runtime.codexDirty = false;
  } catch (e) {
    runtime.codexDirty = true;
    console.warn("save shared codex", e);
    notify("Could not save shared Codex.");
  }
}
function scheduleCodexSave(delay = 40) {
  cacheCodex(runtime.codex || []);
  runtime.codexDirty = true;
  runtime.codexSaveVersion = (Number(runtime.codexSaveVersion) || 0) + 1;
  clearTimeout(runtime.codexSaveTimer);
  runtime.codexSaveTimer = setTimeout(() => saveSharedCodex().catch(e => console.warn("codex save scheduled", e)), delay);
}
function saveCodex(v) { runtime.codex = Array.isArray(v) ? v : []; scheduleCodexSave(); }
function loadCodexDeleted() { try { return JSON.parse(localStorage.getItem(CODEX_DELETED_KEY) || "{}"); } catch { return {}; } }
function saveCodexDeleted(v) { try { localStorage.setItem(CODEX_DELETED_KEY, JSON.stringify(v || {})); } catch {} }
function normalizeCodexRef(v) { return String(v || "").replace(/\s+#\d+$/i, "").trim().toLowerCase(); }
function purgeCodexForTemplateRef(ref = {}, tombstone = true) {
  const idKey = normalizeCodexRef(ref.templateId || ref.id);
  const nameKey = normalizeCodexRef(ref.templateName || ref.name || ref.baseName);
  const before = (runtime.codex || []).length;
  runtime.codex = (runtime.codex || []).filter(entry => {
    const m = entry?.monster || {};
    const entryId = normalizeCodexRef(m.templateId || m.id);
    const entryName = normalizeCodexRef(m.baseName || m.name);
    const entryKey = normalizeCodexRef(entry?.key);
    if (idKey && (entryKey === idKey || entryId === idKey)) return false;
    if (nameKey && !entryId && (entryKey === nameKey || entryName === nameKey)) return false;
    return true;
  });
  if (runtime.codex.length !== before) saveCodex(runtime.codex);
  return before - runtime.codex.length;
}
function codexTemplateSnapshot(template) {
  const src = normalizeMonster(template || defaultMonster("MONSTER"));
  const templateId = String(template?.id || template?.templateId || src.id || "");
  const safe = normalizeMonster({ ...deepClone(src), id: templateId || src.id, templateId, baseName: src.name, name: src.name, specialRules: [], studyTier: 0, linkedTokenId: "", showHud: false });
  safe.templateId = templateId;
  safe.baseName = src.name;
  safe.name = src.name;
  safe.specialRules = [];
  safe.studyTier = 0;
  safe.phases = (safe.phases || []).map(p => ({ ...p, studyTier: 0 }));
  safe.linkedTokenId = "";
  safe.showHud = false;
  return safe;
}
function applyCodexTemplateUpdate(ref = {}) {
  const rawTemplate = ref.template || {};
  const templateId = String(ref.templateId || rawTemplate.templateId || rawTemplate.id || "");
  const idKey = normalizeCodexRef(templateId);
  const nameKey = normalizeCodexRef(ref.templateName || rawTemplate.baseName || rawTemplate.name);
  if (!idKey && !nameKey) return 0;
  const safeTemplate = codexTemplateSnapshot({ ...rawTemplate, id: templateId || rawTemplate.id });
  let changed = 0;
  runtime.codex = (runtime.codex || []).map(entry => {
    const old = entry?.monster || {};
    const entryId = normalizeCodexRef(old.templateId || entry?.key);
    const entryName = normalizeCodexRef(old.baseName || old.name);
    const match = (idKey && (entryId === idKey || normalizeCodexRef(entry?.key) === idKey)) || (!entryId && nameKey && entryName === nameKey);
    if (!match) return entry;
    const nextMonster = normalizeMonster({ ...deepClone(safeTemplate), templateId: templateId || safeTemplate.templateId, baseName: safeTemplate.name, name: safeTemplate.name, specialRules: [], linkedTokenId: "", showHud: false });
    nextMonster.studyTier = monsterTier(old, 0);
    nextMonster.phases = nextMonster.phases.map((p, i) => ({ ...p, studyTier: monsterTier(old, i + 1) }));
    nextMonster.activePhase = clamp(Number(old.activePhase) || 0, 0, nextMonster.phases.length);
    const learnedTier = Math.max(Number(entry.learnedTier) || 0, monsterMaxStudyTier(old));
    nextMonster.specialRules = [];
    changed += 1;
    return { ...entry, learnedTier, monster: nextMonster, updatedAt: Date.now() };
  }).sort(codexSort);
  if (changed) saveCodex(runtime.codex);
  return changed;
}
function applyCodexLibrarySnapshot(payload = {}) {
  const templates = Array.isArray(payload.templates) ? payload.templates.map(codexTemplateSnapshot) : [];
  const byId = new Map(), byName = new Map();
  for (const template of templates) {
    const id = normalizeCodexRef(template.templateId || template.id);
    const name = normalizeCodexRef(template.baseName || template.name);
    if (id) byId.set(id, template);
    if (name) byName.set(name, template);
  }
  let refreshed = 0, removed = 0;
  const next = [];
  for (const entry of runtime.codex || []) {
    const old = entry?.monster || {};
    const entryId = normalizeCodexRef(old.templateId || old.id || entry?.key);
    const entryName = normalizeCodexRef(old.baseName || old.name || entry?.key);
    const template = (entryId && byId.get(entryId)) || (entryName && byName.get(entryName));
    if (!template) { removed += 1; continue; }
    const updated = normalizeMonster({ ...deepClone(template), templateId: template.templateId || template.id || old.templateId || "", baseName: template.name || template.baseName || old.baseName || old.name || "MONSTER", name: template.name || template.baseName || old.name || "MONSTER", specialRules: [], linkedTokenId: "", showHud: false });
    updated.studyTier = monsterTier(old, 0);
    updated.phases = (updated.phases || []).map((p, i) => ({ ...p, studyTier: monsterTier(old, i + 1) }));
    updated.activePhase = clamp(Number(old.activePhase) || 0, 0, updated.phases.length);
    const learnedTier = Math.max(Number(entry.learnedTier) || 0, monsterMaxStudyTier(old));
    // Preserve the player's wrapper exactly (group / selected Codex phase / other local organization).
    next.push({ ...entry, learnedTier, monster: updated, updatedAt: Date.now() });
    refreshed += 1;
  }
  runtime.codex = next.sort(codexSort);
  saveCodex(runtime.codex);
  return { refreshed, removed };
}

const codexTemplateSyncTimers = new Map();
function scheduleCodexTemplateSync(templateId, delay = 180) {
  if (!templateId) return;
  clearTimeout(codexTemplateSyncTimers.get(templateId));
  codexTemplateSyncTimers.set(templateId, setTimeout(() => {
    codexTemplateSyncTimers.delete(templateId);
    const template = libraryMonsterById(templateId); if (!template) return;
    const payload = { id: uid(), senderId: runtime.currentPlayer?.id || "", templateId: template.id, templateName: template.name, template: codexTemplateSnapshot(template), time: Date.now() };
    const changed = applyCodexTemplateUpdate(payload);
    broadcast("codex-template-update", payload);
    if (changed && runtime.view === "codex") render();
  }, delay));
}
function deleteCodexEntry(key) {
  const entry = (runtime.codex || []).find(x => x.key === key); if (!entry) return;
  const label = entry.monster?.name || "this Codex entry";
  if (!confirm(`Delete ${label} from the shared Codex?`)) return;
  runtime.codex = (runtime.codex || []).filter(x => x.key !== key);
  saveCodex(runtime.codex);
  showToast("CODEX", `${label} deleted from shared Codex`, "message");
  render();
}
function codexKeyForMonster(m) { return String(m?.templateId || m?.baseName || m?.name || "").replace(/\s+#\d+$/i, "").trim().toLowerCase(); }
function learnCodexFromScene() {
  const current = Array.isArray(runtime?.codex) ? runtime.codex : [];
  let changed = false;
  for (const src of runtime?.sceneMonsters || []) {
    const maxTier = monsterMaxStudyTier(src);
    if (maxTier < 7) continue;
    const key = codexKeyForMonster(src); if (!key) continue;
    const safe = normalizeMonster({ ...deepClone(src), name: src.baseName || src.name, specialRules: [], linkedTokenId: "", showHud: false });
    safe.specialRules = [];
    let entry = current.find(x => x.key === key);
    if (!entry) {
      const unfiled = current.filter(x => !x.folderId);
      entry = { key, folderId: "", order: unfiled.length, learnedTier: maxTier, monster: safe, updatedAt: Date.now() };
      current.push(entry); changed = true;
    } else {
      const previousMonster = normalizeMonster(entry.monster || entry);
      safe.studyTier = Math.max(monsterTier(previousMonster, 0), monsterTier(safe, 0));
      safe.phases = safe.phases.map((p, i) => ({ ...p, studyTier: Math.max(monsterTier(previousMonster, i + 1), monsterTier(safe, i + 1)) }));
      const nextTier = Math.max(Number(entry.learnedTier) || 0, monsterMaxStudyTier(safe));
      if (nextTier !== entry.learnedTier || Number(src.updatedAt) >= Number(entry.updatedAt || 0)) {
        entry.learnedTier = nextTier; entry.monster = safe; entry.updatedAt = Date.now(); changed = true;
      }
    }
  }
  runtime.codex = current;
  if (changed) saveCodex(runtime.codex);
}
function loadMonsterInstanceRules() { try { return JSON.parse(localStorage.getItem(MONSTER_INSTANCE_RULES_KEY) || "{}"); } catch { return {}; } }
function saveMonsterInstanceRules(v) { localStorage.setItem(MONSTER_INSTANCE_RULES_KEY, JSON.stringify(v || {})); }
function stashMonsterRules(monsters = []) {
  if (runtime?.currentPlayer?.role !== "GM") return;
  const map = loadMonsterInstanceRules();
  for (const m of monsters) if (m?.id && Array.isArray(m.specialRules) && m.specialRules.length) map[m.id] = deepClone(m.specialRules);
  saveMonsterInstanceRules(map);
}
function rehydrateMonsterRules(monsters = []) {
  if (runtime?.currentPlayer?.role !== "GM") return monsters.map(m => ({ ...m, specialRules: [] }));
  const map = loadMonsterInstanceRules();
  let changed = false;
  const out = monsters.map(m => {
    const sceneRules = Array.isArray(m.specialRules) ? m.specialRules : [];
    if (sceneRules.length) { map[m.id] = deepClone(sceneRules); changed = true; }
    return { ...m, specialRules: deepClone(map[m.id] || sceneRules || []) };
  });
  if (changed) saveMonsterInstanceRules(map);
  return out;
}
function loadUIPrefs() {
  try { return JSON.parse(localStorage.getItem(UI_PREF_KEY) || "{}"); } catch { return {}; }
}
function saveUIPrefs(patch = {}) {
  const next = { ...loadUIPrefs(), ...patch };
  localStorage.setItem(UI_PREF_KEY, JSON.stringify(next));
  return next;
}
function loadPlayerTokenQuickMenuEnabled() {
  try { return localStorage.getItem(PLAYER_TOKEN_QUICK_MENU_KEY) === "1"; }
  catch { return false; }
}
function savePlayerTokenQuickMenuEnabled(enabled) {
  try { localStorage.setItem(PLAYER_TOKEN_QUICK_MENU_KEY, enabled ? "1" : "0"); } catch {}
  return !!enabled;
}
let companionHudControlBus = null;
function loadCompanionHudPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPANION_HUD_PREF_KEY) || "null");
    if (!raw || typeof raw !== "object") return { enabled: false, positions: {}, positionSchema: COMPANION_HUD_POSITION_SCHEMA };
    // v3.0.26: positionSchema is intentionally NOT tied to the release version.
    // Legacy layouts are reset once into the stable schema; future releases keep the same coordinates.
    const compatible = raw.positionSchema === COMPANION_HUD_POSITION_SCHEMA;
    return {
      enabled: !!raw.enabled,
      positions: compatible && raw.positions && typeof raw.positions === "object" ? raw.positions : {},
      positionSchema: COMPANION_HUD_POSITION_SCHEMA,
      positionPatch: String(raw.positionPatch || "")
    };
  } catch { return { enabled: false, positions: {}, positionSchema: COMPANION_HUD_POSITION_SCHEMA }; }
}
function saveCompanionHudPrefs(prefs = {}) {
  const next = {
    enabled: !!prefs.enabled,
    positions: prefs.positions && typeof prefs.positions === "object" ? prefs.positions : {},
    positionSchema: COMPANION_HUD_POSITION_SCHEMA,
    positionPatch: String(prefs.positionPatch || "")
  };
  try { localStorage.setItem(COMPANION_HUD_PREF_KEY, JSON.stringify(next)); } catch {}
  return next;
}
function sendCompanionHudControl(message = {}) {
  try {
    if (!companionHudControlBus) companionHudControlBus = new BroadcastChannel(COMPANION_HUD_CONTROL_CHANNEL);
    companionHudControlBus.postMessage(message);
  } catch (err) { console.warn("companion HUD control", err); }
}
function closeCompanionFlowPopover() { if (COMPANION_FLOW) sendCompanionHudControl({ type: "flow-close", time: Date.now() }); }
function closeCompanionTravelPopover() { if (COMPANION_TRAVEL) sendCompanionHudControl({ type: "travel-close", time: Date.now() }); }
let companionHudCommandBus = null;
let companionHudCommandBusy = false;
const companionHudProcessedCommands = new Set();
function companionHudCommandStorageKey(id="") { return `${COMPANION_HUD_COMMAND_PREFIX}${String(id||"")}`; }
function companionHudReadPendingCommand(expectedId="") {
  const wanted=String(expectedId||"");
  if(COMPANION_FLOW_INLINE_COMMAND){
    const inlineId=String(COMPANION_FLOW_INLINE_COMMAND.id||COMPANION_FLOW_COMMAND_ID||"");
    if(!wanted||!inlineId||wanted===inlineId)return {id:inlineId||wanted,command:{...COMPANION_FLOW_INLINE_COMMAND,id:inlineId||wanted}};
  }
  if(wanted){
    try{const keyed=JSON.parse(localStorage.getItem(companionHudCommandStorageKey(wanted))||"null");if(keyed?.command)return keyed}catch{}
  }
  try {
    const raw=JSON.parse(localStorage.getItem(COMPANION_HUD_PENDING_ACTION_KEY)||"null");
    if(!raw||typeof raw!=="object")return null;
    const id=String(raw.id||raw.command?.id||"");
    if(wanted&&id&&wanted!==id)return null;
    return raw;
  } catch { return null; }
}
function companionHudClearPendingCommand(id="") {
  const target=String(id||"");
  try{if(target)localStorage.removeItem(companionHudCommandStorageKey(target))}catch{}
  try {
    const cur=JSON.parse(localStorage.getItem(COMPANION_HUD_PENDING_ACTION_KEY)||"null");
    const curId=String(cur?.id||cur?.command?.id||"");
    if(!cur||!target||!curId||curId===target)localStorage.removeItem(COMPANION_HUD_PENDING_ACTION_KEY);
  } catch {}
}
async function executeCompanionHudMainCommand(command={}) {
  const action=String(command.action||"").toLowerCase();
  const owner=String(command.owner||runtime.currentPlayer?.id||"");
  if(!action||!owner)return false;
  if(owner!==String(runtime.currentPlayer?.id||"")&&runtime.currentPlayer?.role!=="GM")return false;
  if(action==="class-skill") {
    const ci=Number(command.classIndex),si=Number(command.skillIndex),sh=sourceSheet(owner),c=sh?.classes?.[ci],sk=c?.classSkills?.[si];
    if(!sh||!sk)return false;
    openResourceCostPrompt({actorKind:"player",actorId:owner,title:`${c?.name||"CLASS"} · ${sk.name||"CLASS SKILL"}`,verb:"SEND",listedCost:sk.cost||"",intent:{kind:"send-class-skill",owner,classIndex:ci,skillIndex:si}}); return true;
  }
  if(action==="equipment") { if(!sourceSheet(owner)?.equipment?.[Number(command.index)])return false; sendEquipment(owner,Number(command.index)); return true; }
  if(action==="sphere") { if(!sourceSheet(owner)?.spheres?.[Number(command.index)])return false; sendSphere(owner,Number(command.index)); return true; }
  if(action==="item") { if(!sourceSheet(owner)?.inventory?.[Number(command.index)])return false; sendInventory(owner,Number(command.index)); return true; }
  if(action==="bond") { if(!sourceSheet(owner)?.lists?.bonds?.[Number(command.index)])return false; sendList(owner,"bonds",Number(command.index)); return true; }
  if(action==="arcana") {
    const idx=Number(command.index),sh=sourceSheet(owner),x=sh?.lists?.arcana?.[idx]; if(!sh||!x)return false;
    openResourceCostPrompt({actorKind:"player",actorId:owner,title:`ARCANA · ${x.name||"ENTRY"}`,verb:"SEND",listedCost:x.cost||"",intent:{kind:"send-arcana",owner,index:idx}}); return true;
  }
  if(action==="player-action") {
    const idx=Number(command.index),sh=sourceSheet(owner),a=sh?.actions?.[idx]; if(!sh||!a)return false;
    if(isGuardFamilyAction(a)){startGuardAction("player",owner,idx,"player");return true}
    const roll=String(a.mode||"ROLL").toUpperCase()==="ROLL";
    openResourceCostPrompt({actorKind:"player",actorId:owner,title:`ACTION · ${a.name||"ACTION"}`,verb:roll?"ROLL":"SEND",listedCost:a.cost||"",intent:{kind:roll?"roll-player-action":"send-action",owner,index:idx}}); return true;
  }
  if(action==="study") {
    if(!sourceSheet(owner))return false;
    const monsterId=String(command.monsterId||"__study_only__");
    // v3.0.27: do not consume a Study command before Scene monsters finish loading.
    // Earlier builds called performStudyRoll(), received a no-target notification, then still
    // returned true and deleted the pending command. That made the Study shortcut appear dead.
    if(monsterId!=="__study_only__"&&!studyHinderMonsterTarget({id:monsterId}))return false;
    runtime.studyMod=Number(command.mod)||0;
    return !!performStudyRoll(owner,monsterId);
  }
  if(action==="spawn-monster") {
    if(runtime.currentPlayer?.role!=="GM")return false;
    const templateId=String(command.templateId||"");if(!templateId||!libraryMonsterById(templateId))return false;
    const spawned=await addMonsterToSceneWithToken(templateId,String(command.faction||"")==="ally"?"ally":"enemy",Number(command.phaseIndex)||0);
    return !!spawned;
  }
  if(action==="monster-action") {
    if(runtime.currentPlayer?.role!=="GM")return false;
    const id=String(command.monsterId||""),idx=Number(command.index),raw=monsterById(id),m=raw?monsterPhaseView(raw,"active"):null,a=m?.actions?.[idx];
    if(!raw||!a)return false;
    if(isGuardFamilyAction(a)){startGuardAction("monster",id,idx,"active");return true}
    const roll=String(a.mode||"ROLL").toUpperCase()==="ROLL";
    openResourceCostPrompt({actorKind:"monster",actorId:id,mode:"active",title:`ACTION · ${a.name||"ACTION"}`,verb:roll?"ROLL":"SEND",listedCost:a.cost||"",intent:{kind:roll?"monster-roll-action":"monster-send-action",mode:"active",id,index:idx}});
    return true;
  }
  if(action==="hinder") {
    const monsterId=String(command.monsterId||""),status=String(command.status||"").toLowerCase();
    if(!monsterId||!STATUS_NAMES.includes(status)||!monsterById(monsterId))return false;
    await setMonsterStatusFromHinder(monsterId,status); return true;
  }
  if(action==="roll-initiative") {
    const kind=String(command.kind||"player").toLowerCase()==="monster"?"monster":"player";
    const id=String(command.id||owner||"");
    if(kind==="monster"&&runtime.currentPlayer?.role!=="GM")return false;
    if(kind==="player"&&id!==String(runtime.currentPlayer?.id||"")&&runtime.currentPlayer?.role!=="GM")return false;
    await rollInitiative(kind,id,Number(command.mod)||0); return true;
  }
  if(action==="manual-roll") {
    const sh=sourceSheet(owner); if(!sh)return false;
    const attr1=ATTRS.includes(String(command.attr1||"").toUpperCase())?String(command.attr1).toUpperCase():"DEX";
    const attr2=ATTRS.includes(String(command.attr2||"").toUpperCase())?String(command.attr2).toUpperCase():"INS";
    const mod=Number(command.mod)||0,label=String(command.label||"Custom Check").trim()||"Custom Check";
    doRollWithSheet(sh,{name:label,label,attr1,attr2,mod,element:"none",note:"Companion HUD · Manual Check"},sh.name||runtime.currentPlayer?.name||"Character","",{damage:false,hr:false,actorKind:"player",actorId:owner}); return true;
  }
  if(action==="shop-buy") {
    if(owner!==String(runtime.currentPlayer?.id||""))return false;
    await requestShopPurchase(String(command.instanceId||"")); return true;
  }
  if(action==="travel-move") {
    if(!travelSession())return false;
    await travelMoveToTarget(String(command.raw||"")); return true;
  }
  return false;
}
async function consumeCompanionHudPendingCommand(expectedId="") {
  if(companionHudCommandBusy||!runtime.online||!runtime.currentPlayer?.id)return false;
  const pending=companionHudReadPendingCommand(expectedId); if(!pending?.command)return false;
  const id=String(pending.id||pending.command?.id||"");
  if(expectedId&&id&&String(expectedId)!==id)return false;
  if(id&&companionHudProcessedCommands.has(id)){companionHudClearPendingCommand(id);if(COMPANION_FLOW&&!runtime.overlay)setTimeout(closeCompanionFlowPopover,80);return true;}
  companionHudCommandBusy=true;
  try {
    const ok=await executeCompanionHudMainCommand(pending.command);
    if(ok){if(id){companionHudProcessedCommands.add(id);if(companionHudProcessedCommands.size>80){const first=companionHudProcessedCommands.values().next().value;companionHudProcessedCommands.delete(first)}}companionHudClearPendingCommand(id);if(COMPANION_FLOW&&!runtime.overlay)setTimeout(closeCompanionFlowPopover,180);return true;}
    return false;
  } catch(e){console.error("companion main flow",e);showToast("COMPANION",e?.message||"Main action could not be completed","message");return false;}
  finally{companionHudCommandBusy=false;}
}
let companionHudFlowRetryTimer=0;
let companionHudFlowRetryCount=0;
function companionHudFlowStatus(message="FABULA · COMPANION FLOW",failed=false){
  if(!COMPANION_FLOW)return;
  const el=document.querySelector("[data-companion-flow-status]");
  if(el)el.textContent=String(message||"FABULA · COMPANION FLOW");
  const box=document.querySelector(".companion-flow-wait");if(box)box.classList.toggle("failed",!!failed);
  document.querySelectorAll("[data-companion-flow-retry],[data-companion-flow-close]").forEach(btn=>btn.hidden=!failed);
}
async function startCompanionHudFlow(expectedId=COMPANION_FLOW_COMMAND_ID,reset=false){
  if(!COMPANION_FLOW)return false;
  if(reset){clearTimeout(companionHudFlowRetryTimer);companionHudFlowRetryCount=0;}
  const id=String(expectedId||COMPANION_FLOW_COMMAND_ID||COMPANION_FLOW_INLINE_COMMAND?.id||"");
  try{
    const ok=await consumeCompanionHudPendingCommand(id);
    if(ok){clearTimeout(companionHudFlowRetryTimer);companionHudFlowRetryCount=0;return true;}
  }catch(e){console.warn("companion flow attempt",e)}
  companionHudFlowRetryCount+=1;
  if(companionHudFlowRetryCount<=28){
    companionHudFlowStatus(companionHudFlowRetryCount<5?"FABULA · COMPANION FLOW":`FABULA · RESTORING FLOW ${companionHudFlowRetryCount-4}/24`);
    const delay=Math.min(500,120+companionHudFlowRetryCount*18);
    clearTimeout(companionHudFlowRetryTimer);
    companionHudFlowRetryTimer=setTimeout(()=>startCompanionHudFlow(id,false).catch(console.error),delay);
  }else{
    companionHudFlowStatus("FLOW DID NOT START · RETRY OR CLOSE",true);
  }
  return false;
}
function registerCompanionHudCommandBus() {
  if(!COMPANION_FLOW||companionHudCommandBus)return;
  try {
    companionHudCommandBus=new BroadcastChannel(COMPANION_HUD_CONTROL_CHANNEL);
    companionHudCommandBus.onmessage=e=>{const d=e.data||{};if(d.type!=="main-action-ready")return;setTimeout(()=>startCompanionHudFlow(String(d.id||COMPANION_FLOW_COMMAND_ID),true).catch(console.error),20)};
  } catch(e){console.warn("companion command bus",e)}
}
function companionHudReadMainNav(){try{const x=JSON.parse(localStorage.getItem(COMPANION_HUD_MAIN_NAV_KEY)||"null");return x&&typeof x==="object"?x:null}catch{return null}}
function companionHudOpenOwnSheet(tab="sheet"){
  if(!runtime.currentPlayer?.id)return false;
  runtime.view="scene";runtime.sceneStatusPanel=null;runtime.monsterEditId=null;
  runtime.inspect={kind:"player",id:String(runtime.currentPlayer.id)};
  runtime.partyEditTab=PLAYER_SHEET_TABS.includes(String(tab))?String(tab):"sheet";
  render();return true;
}
function companionHudOpenView(view){
  const safe=["clock","roll","codex","chat","shop","vault","settings"].includes(String(view))?String(view):"scene";
  runtime.view=safe;runtime.inspect=null;runtime.sceneStatusPanel=null;runtime.monsterEditId=null;
  if(safe==="chat")runtime.chatPanel="chat";
  render();return true;
}
function companionHudApplyMainNav(nav){if(!nav||typeof nav!=="object")return false;if(String(nav.kind||"")==="sheet")return companionHudOpenOwnSheet(nav.tab);if(String(nav.kind||"")==="view")return companionHudOpenView(nav.view);return false;}
function consumeCompanionHudMainNav(){
  const nav=companionHudReadMainNav();if(!nav)return false;
  try{localStorage.removeItem(COMPANION_HUD_MAIN_NAV_KEY)}catch{}
  return companionHudApplyMainNav(nav);
}
let companionHudMainNavBus=null;
function registerCompanionHudMainNavBus(){
  if(COMPANION_FLOW||companionHudMainNavBus)return;
  try{companionHudMainNavBus=new BroadcastChannel(COMPANION_HUD_CONTROL_CHANNEL);companionHudMainNavBus.onmessage=e=>{const d=e.data||{};if(d.surface==="modal"&&!COMPANION_MAIN_MODAL)return;let applied=false;if(d.type==="open-main-sheet")applied=companionHudOpenOwnSheet(d.tab);else if(d.type==="open-main-nav")applied=companionHudApplyMainNav(d);if(applied&&d.requestId)companionHudMainNavBus.postMessage({type:"main-nav-ack",surface:COMPANION_MAIN_MODAL?"modal":"app",requestId:String(d.requestId),time:Date.now()})};}catch(e){console.warn("companion main nav",e)}
}
function loadNavOrder() {
  try {
    const x = loadUIPrefs().navOrder;
    if (Array.isArray(x)) {
      const kept = x.filter(t => MAIN_NAV.includes(t));
      if (!kept.includes("clock")) kept.splice(Math.max(0, kept.indexOf("scene") + 1), 0, "clock");
      if (!kept.includes("travel")) kept.splice(Math.max(0, kept.indexOf("clock") + 1), 0, "travel");
      return [...new Set([...kept, ...MAIN_NAV])];
    }
  } catch {}
  return [...MAIN_NAV];
}
function loadUISizeMode() {
  const mode = String(loadUIPrefs().uiSizeMode || "auto").toLowerCase();
  return ["auto", "pc", "notebook"].includes(mode) ? mode : "auto";
}
function loadSceneWideMode() { return !!loadUIPrefs().sceneWideMode; }
function loadSceneSummaryCollapsed() { return !!loadUIPrefs().sceneSummaryCollapsed; }
function loadCodexFolderCollapsed() {
  const raw = loadUIPrefs().codexFolderCollapsed;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...raw } : {};
}
function saveCodexFolderCollapsed() { saveUIPrefs({ codexFolderCollapsed: { ...(runtime.codexFolderCollapsed || {}) } }); }
function loadMonsterFolderCollapsed() {
  const raw = loadUIPrefs().monsterFolderCollapsed;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...raw } : {};
}
function saveMonsterFolderCollapsed() { saveUIPrefs({ monsterFolderCollapsed: { ...(runtime.monsterFolderCollapsed || {}) } }); }
function loadUILayoutMode() { return "wide"; }
function saveNavOrder() { saveUIPrefs({ navOrder: runtime.navOrder }); }
function loadSheetTabOrder() {
  try {
    const x = loadUIPrefs().sheetTabOrder;
    if (Array.isArray(x)) {
      const kept = x.filter(t => PLAYER_SHEET_TABS.includes(t));
      return [...new Set([...kept, ...PLAYER_SHEET_TABS])];
    }
  } catch {}
  return [...PLAYER_SHEET_TABS];
}
function saveSheetTabOrder() { saveUIPrefs({ sheetTabOrder: runtime.sheetTabOrder }); }
function loadUITheme() {
  try { const v = localStorage.getItem(UI_THEME_KEY); return v === "phantom" ? "phantom" : "default"; } catch { return "default"; }
}
function saveUITheme(v) {
  try { localStorage.setItem(UI_THEME_KEY, v === "phantom" ? "phantom" : "default"); } catch {}
}
function uiPopoverProfile() {
  if (runtime.view === "scene" && runtime.inspect) return "editor";
  if (runtime.view === "scene") return runtime.sceneWideMode ? "scene-wide" : "scene-sidebar";
  if (runtime.view === "roll") return "roll";
  if (runtime.view === "settings") return "settings";
  return "editor";
}
function sceneSidebarActive() { return uiPopoverProfile() === "scene-sidebar"; }
function resolveUISize(mode = runtime.uiSizeMode, profile = uiPopoverProfile()) {
  const sw = Number(window.screen?.availWidth) || Number(window.innerWidth) || 1366;
  const sh = Number(window.screen?.availHeight) || Number(window.innerHeight) || 768;
  const actual = mode === "auto" ? ((sw >= 1600 && sh >= 900) ? "pc" : "notebook") : mode;
  let width, height;
  if (actual === "pc") {
    width = Math.round(Math.min(1280, Math.max(1040, sw * 0.70), Math.max(0, sw - 120)));
    height = Math.round(Math.min(820, Math.max(680, sh * 0.76), Math.max(0, sh - 150)));
    width = Math.min(width, Math.max(760, sw - 72));
    height = Math.min(height, Math.max(520, sh - 96));
  } else {
    width = Math.round(Math.min(920, Math.max(780, sw * (sw <= 1366 ? 0.66 : 0.60))));
    height = Math.round(Math.min(620, Math.max(520, sh * (sh <= 800 ? 0.72 : 0.68))));
    width = Math.min(width, Math.max(720, sw - 56));
    height = Math.min(height, Math.max(500, sh - 80));
  }
  if (profile === "scene-sidebar") {
    width = actual === "pc" ? Math.round(Math.min(580, Math.max(540, sw * 0.22))) : Math.round(Math.min(550, Math.max(510, sw * 0.38)));
    width = Math.min(width, Math.max(480, sw - 48));
    height = Math.min(Math.max(height, actual === "pc" ? 700 : 560), Math.max(520, sh - 96));
  } else if (profile === "settings") {
    width = actual === "pc" ? Math.round(Math.min(700, Math.max(620, sw * 0.27))) : Math.round(Math.min(640, Math.max(560, sw * 0.42)));
    width = Math.min(width, Math.max(520, sw - 48));
  }
  return { width, height, actual, layout: "wide", profile };
}
async function applyUISize(mode = runtime.uiSizeMode, announce = false) {
  runtime.uiSizeMode = ["auto", "pc", "notebook"].includes(mode) ? mode : "auto";
  runtime.uiLayoutMode = "wide";
  saveUIPrefs({ uiSizeMode: runtime.uiSizeMode });
  const profile = uiPopoverProfile();
  const size = resolveUISize(runtime.uiSizeMode, profile);
  const sizeKey = `${size.width}x${size.height}:${profile}`;
  runtime.popoverSize = size;
  runtime.popoverSizeKey = sizeKey;
  runtime.popoverProfile = profile;
  document.documentElement.dataset.uiSize = size.actual;
  document.documentElement.dataset.uiChoice = runtime.uiSizeMode;
  document.documentElement.dataset.uiContext = profile;
  delete document.documentElement.dataset.uiLayout;
  if (!PREVIEW && !COMPANION_FLOW && !COMPANION_TRAVEL && runtime.online) {
    try {
      await OBR.action.setWidth(size.width);
      await OBR.action.setHeight(size.height);
    } catch (e) { console.warn("popover size", e); }
  }
  if (announce) showToast("UI", `${profile === "scene-sidebar" ? "SCENE SIDEBAR" : profile === "roll" ? "ROLL" : profile === "settings" ? "SETTINGS" : "EDITOR"} · ${size.width} × ${size.height}`, "message");
  return size;
}
function syncAdaptivePopoverSize() {
  const profile = uiPopoverProfile();
  const size = resolveUISize(runtime.uiSizeMode, profile);
  const key = `${size.width}x${size.height}:${profile}`;
  document.documentElement.dataset.uiContext = profile;
  if (runtime.popoverSizeKey === key) return;
  runtime.popoverSizeKey = key;
  runtime.popoverProfile = profile;
  runtime.popoverSize = size;
  if (!PREVIEW && !COMPANION_FLOW && !COMPANION_TRAVEL && runtime.online) {
    Promise.all([OBR.action.setWidth(size.width), OBR.action.setHeight(size.height)]).catch(e => console.warn("adaptive popover size", e));
  }
}


let state = loadLocal();
let runtime = {
  view: COMPANION_TRAVEL ? "travel" : (PREVIEW && MAIN_NAV.includes(PARAMS.get("view")) ? PARAMS.get("view") : "scene"), navOrder: loadNavOrder(), sheetTabOrder: loadSheetTabOrder(), party: [], currentPlayer: { id: "preview-me", name: "YOU", role: COMPANION_TRAVEL ? "PLAYER" : "GM" }, online: false,
  inspect: null, partyEditTab: "sheet", monsterLibrary: loadMonsterLibrary(), monsterLibraryFolders: loadMonsterLibraryFolders(), monsterFolderCollapsed: loadMonsterFolderCollapsed(), monsterEditId: null, monsterTab: "sheet", monsterPhase: 0,
  sceneMonsters: [], sceneMonstersDirty: false, sceneSaveVersion: 0, playerSheetDirty: false, playerSaveVersion: 0, sceneCombat: { started: false, round: 0, activeKey: "" }, sceneTrackers: { clocks: [], projects: [] }, sceneTrackersDirty: false, sceneTrackerSaveVersion: 0, scenePlayerSheets: {}, guardCover: {revision:0,entries:[]}, combatHistory: [], sharedShop: defaultSharedShop(), shopPurchasePending: {}, shopTxnPromise: null, chatPanel: "chat", aiChat: loadFabulaAiChat(), aiBooks: { core: true, high: true, natural: true, techno: true }, aiBusy: false, codex: loadCodex(), codexFolders: [], codexDirty: false, codexSaveVersion: 0, codexSaveTimer: null, codexPhase: {}, codexFolderCollapsed: loadCodexFolderCollapsed(), feed: loadFeed(), chatTarget: "ALL", gmToolTab: "broadcast", gmShop: loadGMShopState(), gmGroupCheck: loadGMGroupCheckState(), gmTravelGroup: { active: null }, gmBroadcastDraft: { type: "warning", title: "WARNING", body: "", allPlayers: true, targets: [] }, dmFrameToolActive: false, dmFramePreviousTool: "", dmFramePreviousMode: "", toast: null, overlay: null, audio: null, audioResumePromise: null, pendingSoundType: "", hinderTargetId: "",
  saveTimer: null, sceneSaveTimer: null, persistentSheetSaveTimer: null, drag: null, lastRoll: null, rollActor: "", rollTarget: "", studyMod: 0, suggestedMods: Array(SUGGESTED_CHECKS.length).fill(0), randomNumber: { min: "1", max: "21", result: null },
  uiScroll: {}, lastRenderedContext: "", popoverSize: null, popoverSizeKey: "", popoverProfile: "", uiSizeMode: loadUISizeMode(), uiLayoutMode: "wide", sceneWideMode: loadSceneWideMode(), sceneSummaryCollapsed: loadSceneSummaryCollapsed(), sceneRosterFilter: "all", sceneRosterSearch: "", sceneStatusPanel: null, uiTheme: loadUITheme(),
  renderFrame: 0, renderDirty: false, lastShellHTML: "", partySig: "", sceneSig: "", pendingSceneFocusKey: "", inlineEdit: {}, damageApplyDraft: { rollId: "", targets: {} }, monsterDamageApplyDraft: { rollId: "", targets: {} }, canvasTextSyncTimers: {}, monsterRandomTargets: {}, suppressCombatHistory: false,
  sceneStatusInteractionUntil: 0, sceneStatusRenderTimer: null,
  travel: null, travelLoaded: false, travelLoading: false, travelLoadFailed: false, travelApproval: { enabled:false, revision:0, requests:[] }, travelApprovalDeciding:"", travelDirty: false, travelSaveTimer: null, travelEditorMapId: "", travelSelectedNodeId: "", travelMapItems: [], travelMapItemIndex: new Map(), travelMapItemsAt: 0, travelMapItemsSig: "", travelMapItemsRefreshPromise: null, travelDrag: null, travelDragDomFrame: 0, travelDragDomPending: null, travelContextNodeId: "", travelContextMapId: "", travelBoardViews: {}, travelBoardViewFrames: {}, travelBoardPerfTimers: {}, travelPan: null, travelSpaceDown: false, travelSaveChain: null, travelLiveAt: 0, travelPreviewNodeKey: "", travelPreviewMoveFrame: 0, travelPreviewMovePoint: null, travelControlGroup: "A", travelSessionsCollapsed: COMPANION_TRAVEL ? loadUIPrefs().travelSessionsCollapsed !== false : false, travelSidebarCollapsed: !!loadUIPrefs().travelSidebarCollapsed, travelInspectorTab: String(loadUIPrefs().travelInspectorTab || "NODES").toUpperCase(), travelNodeFilter: "ALL", travelNodeSearch: "", travelGMPlayerMode: !!loadUIPrefs().travelGMPlayerMode, travelConnectMode: false, travelConnectAnchor: null, travelMultiSelected: {}, travelMarquee: null, travelMovePending: {}, travelMoveSeq: 0, travelMoveLastAckAt: 0, travelMarkerMotions: [], travelMarkerMotionSeq: 0, travelBackgroundFxHoldUntil: 0, travelAppliedBackgroundSig: "", travelAppliedBackgroundAt: 0, cardTokenImages: {}, cardTokenRefreshTimer: null,
  tokenActionHud: { tokenId: "", tab: "actions", selectionSig: "", dismissedSig: "" }, tokenActionHudSyncTimer: null
};

function normalizeSceneCombat(raw) {
  return { started: !!raw?.started, round: Math.max(0, Number(raw?.round) || 0), activeKey: String(raw?.activeKey || "") };
}
function normalizeGuardCover(raw){return{revision:Math.max(0,Number(raw?.revision)||0),entries:(Array.isArray(raw?.entries)?raw.entries:[]).filter(x=>x&&x.guardTokenId),uses:raw?.uses&&typeof raw.uses==="object"?{...raw.uses}:{}}}
function guardTurnSignature(combat=runtime.sceneCombat){return combat?.started?`${Math.max(0,Number(combat.round)||0)}|${String(combat.activeKey||"")}`:""}
function guardActor(kind,id,mode="active"){
  if(kind==="monster"){
    const raw=findMonsterTarget(mode,id),sheet=raw?monsterPhaseView(raw,mode):null;
    return raw&&sheet?{kind:"monster",id:String(id),mode,name:sheet.name||raw.name||"MONSTER",tokenId:String(raw.linkedTokenId||sheet.linkedTokenId||""),sheet,raw}:null;
  }
  const sheet=sourceSheet(id);return sheet?{kind:"player",id:String(id),mode:"player",name:sheet.name||sourceParty(id)?.name||"CHARACTER",tokenId:String(sheet.linkedTokenId||""),sheet}:null;
}
function guardSide(actor){return actor?.kind==="player"||actor?.sheet?.faction==="ally"?"ally":"enemy"}
function guardAvailableTargets(actor){
  if(!actor)return[];const side=guardSide(actor),out=[];
  for(const p of allParty()){const raw=p.metadata?.[META_KEY];if(!raw||raw.deleted)continue;const sheet=normalizeState(raw),id=String(p.id);if(isPlayerDefeated(sheet)||!sheet.linkedTokenId||actor.kind==="player"&&id===actor.id)continue;if(side==="ally")out.push({kind:"player",id,tokenId:String(sheet.linkedTokenId),name:sheet.name||p.name||"CHARACTER"})}
  for(const raw of runtime.sceneMonsters){const sheet=monsterPhaseView(raw,"active"),id=String(raw.id);if(isMonsterDefeated(raw)||!raw.linkedTokenId||actor.kind==="monster"&&id===actor.id)continue;if((sheet.faction==="ally"?"ally":"enemy")===side)out.push({kind:"monster",id,tokenId:String(raw.linkedTokenId),name:sheet.name||raw.name||"MONSTER"})}
  return out;
}
function guardCoverTargetHTML(x){
  const targets=Array.isArray(x.targets)?x.targets:[];
  return `<div class="cinematic-backdrop guard-cover-target-backdrop" data-overlay-backdrop-close><div class="cinematic-card guard-cover-target-pop"><button class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">COVER ALLY · CHOOSE TOKEN</div><h2>${esc(x.actorName||"GUARD")} COVERS…</h2><p>Choose one allied linked Token. Enemies cannot perform Melee Attacks against that creature until this Guard ends.</p><div class="guard-cover-target-list">${targets.length?targets.map(t=>`<button type="button" data-guard-cover-target="${esc(t.kind)}|${esc(t.id)}|${esc(t.tokenId)}"><span>🛡</span><b>${esc(t.name)}</b><small>${t.kind==="player"?"PLAYER":"ALLY MONSTER"}</small></button>`).join(""):`<div class="empty">NO OTHER ALLIED LINKED TOKENS</div>`}</div><small class="guard-cover-raw-note">Core Rule: no damage transfer prompt. The covered creature cannot be selected by enemy Melee Attacks.</small></div></div>`;
}
function guardCanActivate(actor){
  if(!actor?.tokenId){notify("GUARD · LINKED TOKEN REQUIRED");return false}
  const sig=guardTurnSignature(),key=`${actor.kind}:${actor.id}`;
  if(sig&&runtime.guardCover?.uses?.[key]===sig){showToast("GUARD ALREADY USED", "Guard may be performed only once per turn.", "crisis", false);return false}
  return true;
}
function queueGuardCost(actor,index,target=null){
  const action=actor?.sheet?.actions?.[index];if(!action)return;
  openResourceCostPrompt({actorKind:actor.kind,actorId:actor.id,mode:actor.mode,title:`ACTION · ${action.name||normalizeActionType(action.category)}`,verb:"USE",listedCost:action.cost||"",intent:{kind:"guard-cover-activate",actorKind:actor.kind,actorId:actor.id,mode:actor.mode,index,target}});
}
function startGuardAction(kind,id,index,mode="active"){
  const actor=guardActor(kind,id,mode),action=actor?.sheet?.actions?.[Number(index)];if(!actor||!action||!isGuardFamilyAction(action))return notify("Guard action is no longer available.");
  if(!guardCanActivate(actor))return;
  if(isCoverAllyAction(action)){const targets=guardAvailableTargets(actor);runtime.overlay={kind:"guard-cover-target",actorKind:actor.kind,actorId:actor.id,mode:actor.mode,index:Number(index),actorName:actor.name,targets};renderOverlay();return}
  queueGuardCost(actor,Number(index),null);
}
async function activateGuardCover(kind,id,index,mode="active",target=null){
  const actor=guardActor(kind,id,mode),action=actor?.sheet?.actions?.[Number(index)];if(!actor||!action||!guardCanActivate(actor))return;
  let cover=null;if(isCoverAllyAction(action)){cover=guardAvailableTargets(actor).find(t=>t.kind===target?.kind&&t.id===String(target?.id)&&t.tokenId===String(target?.tokenId))||null;if(!cover)return notify("Covered Ally is no longer available.")}
  const latest=await OBR.scene.getMetadata(),state=normalizeGuardCover(latest[SCENE_GUARD_COVER_KEY]),guardKey=`${actor.kind}:${actor.id}`,coverKey=cover?`${cover.kind}:${cover.id}`:"";
  state.entries=state.entries.filter(x=>String(x.guardTokenId)!==actor.tokenId&&`${x.guardKind}:${x.guardId}`!==guardKey&&(!cover||(String(x.coverTokenId)!==cover.tokenId&&`${x.coverKind}:${x.coverId}`!==coverKey)));
  state.entries.push({id:uid(),guardKind:actor.kind,guardId:actor.id,guardTokenId:actor.tokenId,guardName:actor.name,guardSide:guardSide(actor),coverKind:cover?.kind||"",coverId:cover?.id||"",coverTokenId:cover?.tokenId||"",coverName:cover?.name||"",createdAt:Date.now(),turnSig:guardTurnSignature()});
  const sig=guardTurnSignature();if(sig)state.uses[guardKey]=sig;state.revision+=1;await OBR.scene.setMetadata({[SCENE_GUARD_COVER_KEY]:state});runtime.guardCover=state;
  const body=cover?`Covering ${cover.name}. Enemy Melee Attacks cannot select them.`:"Resistance to all damage types · +2 to Opposed Checks.";makeShare(`${actor.name} · ${cover?"COVER ALLY":"GUARD"}`,body,actor.kind==="player"?playerCutInExtra(actor.id,actor.sheet,action,action.element):{});showToast(cover?`COVERING · ${cover.name}`:"GUARD ACTIVE",body,"message",false);
}
function normalizeSceneTrackers(raw) {
  const r = raw || {};
  const norm = (p, project = false) => {
    const segments = clamp(p?.segments || 6, 1, 12);
    return {
      id: p?.id || uid(),
      name: p?.name || (project ? "Project" : "Clock"),
      detail: p?.detail || "",
      segments,
      progress: clamp(p?.progress || 0, 0, segments),
      pinned: !!p?.pinned,
      objective: project ? false : !!p?.objective
    };
  };
  return {
    clocks: (Array.isArray(r.clocks) ? r.clocks : []).map(p => norm(p, false)),
    projects: (Array.isArray(r.projects) ? r.projects : []).map(p => norm(p, true))
  };
}
function normalizeScenePlayerSheets(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, rec] of Object.entries(raw)) {
    const sheetRaw = rec?.sheet ?? rec;
    if (!sheetRaw || typeof sheetRaw !== "object") continue;
    const sheet = normalizeState(sheetRaw);
    out[id] = { ownerId: id, ownerName: String(rec?.ownerName || sheet.name || "PLAYER"), sheet, updatedAt: Math.max(Number(rec?.updatedAt) || 0, Number(sheet.updatedAt) || 0) };
  }
  return out;
}
function persistedSheetRecord(owner) { return runtime.scenePlayerSheets?.[owner] || null; }
function absorbOnlinePartySheets(players = runtime.party) {
  let changed = false;
  for (const p of players || []) {
    const raw = p.metadata?.[META_KEY]; if (!raw) continue;
    const sheet = normalizeState(raw), old = persistedSheetRecord(p.id);
    if (!old || (Number(sheet.updatedAt) || 0) > (Number(old.updatedAt) || 0)) {
      runtime.scenePlayerSheets[p.id] = { ownerId: p.id, ownerName: p.name || sheet.name || "PLAYER", sheet: deepClone(sheet), updatedAt: Number(sheet.updatedAt) || Date.now() };
      changed = true;
    }
  }
  if (changed) { clearTimeout(runtime.persistentSheetSaveTimer); runtime.persistentSheetSaveTimer = setTimeout(writeScenePlayerSheets, 160); }
  return changed;
}
function bestPlayerSheetRaw(owner, onlineRaw = null) {
  const rec = persistedSheetRecord(owner);
  const saved = rec?.sheet || null;
  if (!onlineRaw) return saved;
  if (!saved) return onlineRaw;
  return (Number(saved.updatedAt) || 0) > (Number(onlineRaw.updatedAt) || 0) ? saved : onlineRaw;
}
async function writeScenePlayerSheets() {
  if (PREVIEW || !runtime.online) return;
  try {
    if (!await OBR.scene.isReady()) return;
    const md = await OBR.scene.getMetadata();
    const current = normalizeScenePlayerSheets(md[SCENE_PLAYER_SHEETS_KEY]);
    for (const [id, rec] of Object.entries(runtime.scenePlayerSheets || {})) {
      const old = current[id];
      if (!old || (Number(rec?.updatedAt) || 0) >= (Number(old?.updatedAt) || 0)) current[id] = deepClone(rec);
    }
    runtime.scenePlayerSheets = current;
    await OBR.scene.setMetadata({ [SCENE_PLAYER_SHEETS_KEY]: deepClone(current) });
  } catch (e) { console.warn("save persistent player sheets", e); notify("Could not save persistent character sheets to this Scene."); }
}
function schedulePersistentSheetSave(ownerId = runtime.currentPlayer.id, ownerName = runtime.currentPlayer.name, sheet = state) {
  const copy = normalizeState(deepClone(sheet));
  const rec = { ownerId, ownerName: ownerName || copy.name || "PLAYER", sheet: copy, updatedAt: Number(copy.updatedAt) || Date.now() };
  runtime.scenePlayerSheets[ownerId] = rec;
  clearTimeout(runtime.persistentSheetSaveTimer);
  runtime.persistentSheetSaveTimer = setTimeout(writeScenePlayerSheets, 140);
}
async function updateOfflineSheet(ownerId, op) {
  const rec = persistedSheetRecord(ownerId); if (!rec?.sheet) return false;
  const copy = normalizeState(deepClone(rec.sheet)); applyOp(copy, op);
  runtime.scenePlayerSheets[ownerId] = { ...rec, sheet: copy, updatedAt: copy.updatedAt };
  await writeScenePlayerSheets();
  return true;
}

function currentDie(s, attr) {
  const base = Number(s.attributes?.[attr]) || 8;
  let idx = Math.max(0, DIE_STEPS.indexOf(base)), penalty = 0;
  for (const [status, on] of Object.entries(s.statuses || {})) if (on) penalty += STATUS_PENALTIES[status]?.[attr] || 0;
  idx = clamp(idx + (Number(s.attributeBuffs?.[attr]) || 0) - penalty, 0, DIE_STEPS.length - 1);
  return DIE_STEPS[idx];
}
function attrDelta(s, attr) { return DIE_STEPS.indexOf(currentDie(s, attr)) - DIE_STEPS.indexOf(Number(s.attributes?.[attr]) || 8); }
function defenseModifierResult(raw, base) {
  const t = String(raw ?? "").trim();
  if (!t) return Math.max(0, Number(base) || 0);
  if (/^[+-]\d+$/.test(t)) return Math.max(0, (Number(base) || 0) + Number(t));
  if (/^\d+$/.test(t)) return Math.max(0, Number(t));
  return Math.max(0, Number(base) || 0);
}
function playerDefenseInfo(s, kind = "defense") {
  const attr = kind === "magicDefense" ? "INS" : "DEX";
  const modKey = kind === "magicDefense" ? "magicDefenseMod" : "defenseMod";
  const original = Number(s.attributes?.[attr]) || 8;
  const derived = currentDie(s, attr);
  const value = defenseModifierResult(s?.[modKey], derived);
  const delta = value - original;
  return { attr, modKey, original, derived, value, delta, mod: String(s?.[modKey] ?? "").trim() };
}
function playerDefense(s, kind = "defense") { return playerDefenseInfo(s, kind).value; }
function defenseValue(s, kind = "defense") { return playerDefenseInfo(s, kind).value; }
function defenseDisplay(s, kind = "defense") {
  const x = playerDefenseInfo(s, kind);
  return x.value === x.original ? `${x.value}` : `${x.original} → ${x.value}`;
}
function playerDefenseDisplay(s, kind = "defense") {
  const x = playerDefenseInfo(s, kind);
  return x.value === x.original ? `${x.value}` : `${x.original} → ${x.value}`;
}
function isCrisis(s) {
  const max = Number(s?.hp?.max) || 0, cur = Number(s?.hp?.current) || 0;
  return max > 0 && cur > 0 && cur <= max / 2;
}
function isMonsterDefeated(m) { return !!m && Number(m?.hp?.current) <= 0; }
function isPlayerDefeated(s) { return !!s && Number(s?.hp?.current) <= 0; }
function playerDefeatOutcome(s) {
  if (!isPlayerDefeated(s)) return "";
  const outcome = String(s?.defeatOutcome || "").toLowerCase();
  return outcome === "surrender" || outcome === "sacrifice" ? outcome : "pending";
}
function playerDefeatLabel(s) {
  const outcome = playerDefeatOutcome(s);
  return outcome === "surrender" ? "SURRENDER" : outcome === "sacrifice" ? "SACRIFICE" : outcome === "pending" ? "DECISION PENDING" : "";
}
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
function activeStatuses(s) {
  const out = STATUS_NAMES.filter(k => s.statuses?.[k]);
  if (isCrisis(s)) out.push("crisis");
  return out;
}
function publicSnapshot() { return state.deleted ? { deleted: true, updatedAt: Date.now() } : { ...deepClone(state), updatedAt: Date.now() }; }
async function publish() {
  const saveVersion = Number(runtime.playerSaveVersion) || 0;
  state.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (PREVIEW || !runtime.online) { if (saveVersion === runtime.playerSaveVersion) runtime.playerSheetDirty = false; return; }
  try {
    await OBR.player.setMetadata({ [META_KEY]: publicSnapshot() });
    schedulePersistentSheetSave(runtime.currentPlayer.id, runtime.currentPlayer.name, state);
    if (saveVersion === runtime.playerSaveVersion) runtime.playerSheetDirty = false;
  } catch (e) { console.warn("publish", e); }
}
function scheduleSave() {
  runtime.playerSheetDirty = true;
  runtime.playerSaveVersion = (Number(runtime.playerSaveVersion) || 0) + 1;
  clearTimeout(runtime.saveTimer);
  runtime.saveTimer = setTimeout(() => { publish().catch(e => console.warn("publish scheduled", e)); }, 55);
}
function scheduleSceneSave() {
  runtime.sceneMonstersDirty = true;
  runtime.sceneSaveVersion = (Number(runtime.sceneSaveVersion) || 0) + 1;
  clearTimeout(runtime.sceneSaveTimer);
  runtime.sceneSaveTimer = setTimeout(() => { saveSceneMonsters().catch(e => console.warn("scene save scheduled", e)); }, 55);
}

function resumeRuntimeAudio() {
  runtime.audio = createContainmentContext(runtime.audio);
  const ctx = runtime.audio;
  if (!ctx || ctx.state === "closed") return Promise.resolve(null);
  if (ctx.state !== "suspended") return Promise.resolve(ctx);
  if (!runtime.audioResumePromise) {
    runtime.audioResumePromise = ctx.resume()
      .then(() => ctx)
      .catch(() => null)
      .finally(() => { runtime.audioResumePromise = null; });
  }
  return runtime.audioResumePromise;
}

function primeRuntimeAudio() {
  try { resumeRuntimeAudio().catch(() => {}); } catch {}
}

function playSound(type) {
  try {
    const stamp = performance.now();
    // A tiny front-door debounce prevents duplicate handlers from requesting the exact same
    // cue in the same frame. Cue-specific anti-stack/cooldowns live in soundscape.js.
    if (runtime.lastSoundType === type && stamp - (runtime.lastSoundAt || 0) < 30) return;
    runtime.lastSoundType = type; runtime.lastSoundAt = stamp;
    runtime.audio = createContainmentContext(runtime.audio);
    const ctx = runtime.audio;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      // Keep only the newest sound while the browser wakes Web Audio. This is what removes the
      // old delayed "machine-gun burst" after several fast HP changes.
      runtime.pendingSoundType = type;
      resumeRuntimeAudio().then(running => {
        if (!running || running.state === "closed") return;
        const pending = runtime.pendingSoundType;
        runtime.pendingSoundType = "";
        if (pending) playContainmentSound(running, pending);
      }).catch(() => {});
      return;
    }

    playContainmentSound(ctx, type);
  } catch (e) { console.warn("sound", e); }
}

// Warm the AudioContext on the first real user interaction so later combat events can sound
// immediately, including remote HP changes. Capture phase lets this happen before the button action.
document.addEventListener("pointerdown", primeRuntimeAudio, { capture: true, passive: true });
document.addEventListener("keydown", primeRuntimeAudio, { capture: true });

function showToast(title, body, type = "message", withSound = true) {
  runtime.toast = { title, body, time: Date.now() }; if (withSound) playSound(type); renderToast();
  setTimeout(() => { if (runtime.toast && Date.now() - runtime.toast.time > 3000) { runtime.toast = null; renderToast(); } }, 3400);
}
function renderToast() {
  const host = document.getElementById("toast-host");
  if (host) host.innerHTML = runtime.toast ? `<div class="live-toast"><b>${esc(runtime.toast.title)}</b><span>${esc(runtime.toast.body)}</span></div>` : "";
}
let alertSequence = 0;
function rollHasDamage(roll) {
  if (roll?.rollStyle === "check") return false;
  return roll?.damage !== null && roll?.damage !== "" && roll?.damage !== undefined && Number.isFinite(Number(roll?.damage));
}
function cinematicAlertSize(item = {}) {
  if (item.kind === "share" && item.shareType === "equipment") return { width: 1060, height: 760 };
  if (item.kind === "share") return { width: 820, height: 600 };
  if (item.kind === "roll" && item.isStudy) return { width: 760, height: 650 };
  if (item.kind === "roll" && rollHasDamage(item)) return { width: 820, height: 650 };
  return { width: 720, height: 560 };
}
async function showOverlay(item) {
  // v1.87: revert cinematic events back into the extension window overlay.
  const previous = runtime.overlay;
  if (previous?.cutIn && String(previous.id || "") !== String(item?.id || "")) closeSkillCutInForRoll(previous.id);
  runtime.overlay = item || null;
  renderOverlay();
  if (PREVIEW || !OBR) return;
  const seq = ++alertSequence;
  try {
    localStorage.setItem(ALERT_KEY, JSON.stringify({ ...item, receivedAt: Date.now() }));
    try { await OBR.modal.close(ALERT_MODAL_ID); } catch {}
    if (seq !== alertSequence) return;
  } catch (e) { console.warn("in-window cinematic alert", e); }
}
function closeSkillCutInForRoll(rollId = "") {
  const message = { type: "close", rollId: String(rollId || ""), playerId: String(runtime.currentPlayer?.id || ""), time: Date.now() };
  try {
    const bus = new BroadcastChannel(SKILL_CUTIN_CONTROL_CHANNEL);
    bus.postMessage(message);
    setTimeout(() => bus.close(), 0);
  } catch {
    try { localStorage.setItem(`${SKILL_CUTIN_CONTROL_CHANNEL}:event`, JSON.stringify({ ...message, id: uid() })); } catch {}
  }
}
function dismissOverlay() {
  const closing = runtime.overlay;
  if (closing?.cutIn) closeSkillCutInForRoll(closing.id);
  runtime.overlay = null;
  renderOverlay();
  maybeShowPendingPlayerDefeatChoice();
  closeCompanionFlowPopover();
}
function showTimedOverlay(item, duration = 1200) {
  const overlay = item || null, overlayId = String(overlay?.id || "");
  showOverlay(overlay);
  setTimeout(() => {
    if (!runtime.overlay || runtime.overlay.kind !== overlay?.kind) return;
    if (overlayId && String(runtime.overlay.id || "") !== overlayId) return;
    runtime.overlay = null;
    renderOverlay();
  }, Math.max(250, Number(duration) || 1200));
}
function equipmentSharePopupHTML(x) {
  const e = x.equipment || {};
  const spheres = Array.from({ length: 4 }, (_, i) => e.spheres?.[i] || null);
  const slots = spheres.map((sp, i) => `<div class="equipment-share-slot slot-${i}"><span class="equipment-share-orb"></span><small>SPHERE ${i + 1}</small><b>${sp ? esc(sp.name || "SPHERE") : "EMPTY"}</b>${sp?.sphereType ? `<em>${esc(sp.sphereType)}</em>` : ""}</div>`).join("");
  const center = e.imageUrl ? `<img src="${esc(e.imageUrl)}" alt="${esc(e.name || "Equipment")}">` : `<div class="equipment-share-empty">NO IMAGE</div>`;
  const effects = Array.isArray(e.effects) ? e.effects : [];
  const effectsHTML = effects.length ? effects.map(v => `<div class="equipment-share-effect"><b>${esc(v.name || "SPHERE EFFECT")}</b>${v.sphereType ? `<small>${esc(v.sphereType)}</small>` : ""}<div>${formatText(stripMediaUrls(v.detail || ""))}</div>${mediaFromText(v.detail || "") ? `<img src="${esc(mediaFromText(v.detail || ""))}" alt="Sphere effect">` : ""}</div>`).join("") : `<div class="equipment-share-none">SELECTED SPHERES HAVE NO SET EFFECT DETAILS</div>`;
  const detail = stripMediaUrls(e.detail || "");
  return `<div class="cinematic-backdrop" data-overlay-backdrop-close><div class="cinematic-card share-pop equipment-share-pop" ><button class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">${esc(x.senderName)} · SENT EQUIPMENT</div><h2>${esc(e.name || x.title || "EQUIPMENT")}</h2>${e.weaponType ? `<div class="equipment-share-type">${esc(e.weaponType)}</div>` : ""}<div class="equipment-share-popup-layout"><div class="equipment-share-orbit"><div class="equipment-share-ring"></div>${slots}<div class="equipment-share-center">${center}</div><div class="equipment-share-center-name">${esc(e.name || "EQUIPMENT")}</div></div><aside class="equipment-share-side"><div class="equipment-share-section-title">SPHERE SET EFFECTS</div><div class="equipment-share-effects">${effectsHTML}</div><div class="equipment-share-section-title detail-title">EQUIPMENT DETAIL</div>${detail ? `<div class="equipment-share-detail popup-detail-scroll">${formatText(detail)}</div>` : `<div class="equipment-share-none">NO EQUIPMENT DETAIL</div>`}</aside></div></div></div>`;
}
function damageApplyModeForMonster(roll, monster) {
  const element = String(roll?.element || "none");
  if (!monster || element === "none") return "normal";
  if((runtime.guardCover?.entries||[]).some(x=>`${x.guardKind}:${x.guardId}`===`monster:${monster.id}`||String(x.guardTokenId)===String(monster.linkedTokenId||"")))return "resist";
  const v = monsterPhaseView(monster, "active");
  const affinity = String(v?.affinities?.[element] || "NORMAL").toUpperCase();
  if (affinity === "VULNERABILITY") return "vuln";
  if (affinity === "RESISTANCE") return "resist";
  return "normal";
}
function damageApplyValue(roll, mode = "normal", mod = 0) {
  const base = Math.max(0, Number(roll?.damage) || 0);
  const extra = Number(mod) || 0;
  let value = base;
  if (mode === "vuln") value = base * 2;
  else if (mode === "resist") value = Math.ceil(base / 2);
  return Math.max(0, value + extra);
}
function ensureDamageApplyDraft(roll) {
  const id = String(roll?.id || "");
  if (!runtime.damageApplyDraft || runtime.damageApplyDraft.rollId !== id) runtime.damageApplyDraft = { rollId: id, targets: {} };
  const draft = runtime.damageApplyDraft.targets;
  if (!Number.isFinite(Number(draft._mod))) draft._mod = 0;
  const seeded = new Set((Array.isArray(roll?.targetRefs) ? roll.targetRefs : []).filter(x => String(x).startsWith("monster:")).map(x => String(x).slice(8)));
  for (const m of runtime.sceneMonsters.filter(x => x.faction !== "ally" && !isMonsterDefeated(x))) {
    if (!draft[m.id]) draft[m.id] = { hits: seeded.has(m.id) ? 1 : 0, mode: damageApplyModeForMonster(roll, m) };
  }
  return draft;
}
function playerDamageApplyHTML(roll) {
  if (runtime.currentPlayer.role !== "GM" || roll?.actorKind !== "player" || !rollHasDamage(roll)) return "";
  const enemies = runtime.sceneMonsters.filter(m => m.faction !== "ally" && !isMonsterDefeated(m));
  if (!enemies.length) return "";
  const draft = ensureDamageApplyDraft(roll), globalMod = Number(draft._mod) || 0;
  const rows = enemies.map(m => {
    const v = monsterPhaseView(m, "active"), d = draft[m.id] || { hits: 0, mode: "normal" };
    const hits = Math.max(0, Number(d.hits) || 0), per = damageApplyValue(roll, d.mode, globalMod), total = hits * per;
    return `<div class="damage-apply-row ${hits ? "selected" : ""}"><button class="damage-target-name" data-damage-target-add="${esc(m.id)}"><b>${esc(v?.name || m.name || "MONSTER")}</b><small>HP ${Number(m.hp?.current) || 0}/${Number(m.hp?.max) || 0}</small></button><div class="damage-hit-stepper"><button type="button" data-damage-target-sub="${esc(m.id)}">−</button><input type="number" min="0" max="99" step="1" value="${hits}" data-damage-hits-input="${esc(m.id)}" aria-label="Hits on ${esc(v?.name || m.name || "monster")}"><button type="button" data-damage-target-add="${esc(m.id)}">+</button></div><div class="damage-mode-pills"><button type="button" class="vuln ${d.mode === "vuln" ? "active" : ""}" data-damage-mode="${esc(m.id)}:vuln">VU ${damageApplyValue(roll,"vuln",globalMod)}</button><button type="button" class="normal ${d.mode === "normal" ? "active" : ""}" data-damage-mode="${esc(m.id)}:normal">NORMAL ${damageApplyValue(roll,"normal",globalMod)}</button><button type="button" class="resist ${d.mode === "resist" ? "active" : ""}" data-damage-mode="${esc(m.id)}:resist">RES ${damageApplyValue(roll,"resist",globalMod)}</button></div><div class="damage-apply-total"><span>TOTAL</span><b>${total}</b><button type="button" class="primary" data-apply-damage-target="${esc(m.id)}" ${hits ? "" : "disabled"}>APPLY</button></div></div>`;
  }).join("");
  const any = Object.values(draft).some(x => Number(x?.hits) > 0);
  return `<section class="damage-distributor"><div class="damage-distributor-head"><div><b>APPLY DAMAGE · ENEMY MONSTERS ONLY</b><small>Click a monster or + for each hit. Player/Ally damage stays manual.</small></div><button type="button" class="primary" data-apply-damage-all ${any ? "" : "disabled"}>APPLY ALL</button></div><div class="damage-mod-row"><span>DMG MOD</span><div class="damage-mod-stepper"><button type="button" data-damage-mod-step="-1">−</button><input type="number" min="-999" max="999" step="1" value="${globalMod}" data-damage-mod-input aria-label="Damage modifier"><button type="button" data-damage-mod-step="1">+</button></div><small>เพิ่ม/ลดความเสียหายต่อ hit หลังเลือก VU / NORMAL / RES</small></div>${rows}</section>`;
}
async function applyPlayerRollDamage(targetId, all = false) {
  const roll = runtime.overlay;
  if (runtime.currentPlayer.role !== "GM" || roll?.kind !== "roll" || roll?.actorKind !== "player" || !rollHasDamage(roll)) return;
  const draft = ensureDamageApplyDraft(roll), globalMod = Number(draft._mod) || 0;
  const ids = all ? Object.keys(draft) : [targetId];
  let changed = 0, defeatedNow = 0;
  for (const id of ids) {
    const rec = draft[id], hits = Math.max(0, Number(rec?.hits) || 0), m = monsterById(id);
    if (!m || m.faction === "ally" || !hits) continue;
    const per = damageApplyValue(roll, rec.mode, globalMod), total = per * hits, before = Number(m.hp?.current) || 0;
    runtime.suppressCombatHistory = true;
    try { updateMonster("active", id, x => { x.hp.current = clamp(before - total, 0, x.hp.max); }); } finally { runtime.suppressCombatHistory = false; }
    const after = Number(monsterById(id)?.hp?.current) || 0, v = monsterPhaseView(monsterById(id), "active");
    if (before > 0 && after <= 0) defeatedNow++;
    recordCombatHistory("damage", `${v?.name || "MONSTER"} · ${String(rec.mode || "normal").toUpperCase()} ${per} ×${hits}${globalMod ? ` (${monsterSigned(globalMod)} MOD)` : ""} · ${before} → ${after} HP`, `damage:${roll.id}:${id}:${Date.now()}`, { type: "monster", monsterId: id, path: "hp.current", value: before });
    rec.hits = 0;
    changed++;
  }
  if (changed && !defeatedNow) playSound("hpdown");
  renderOverlay();
}
function monsterDamageTargetInfo(ref=""){
  const [kind,id]=String(ref).split(":");
  if(kind==="player"){const sheet=sourceSheet(id);return sheet&&!sheet.deleted?{kind,id,name:sheet.name||sourceParty(id)?.name||"PLAYER",sheet,current:{hp:Number(sheet.hp?.current)||0,mp:Number(sheet.mp?.current)||0},max:{hp:Number(sheet.hp?.max)||0,mp:Number(sheet.mp?.max)||0}}:null}
  if(kind==="monster"){const raw=monsterById(id),sheet=raw?monsterPhaseView(raw,"active"):null;return raw&&sheet&&raw.faction==="ally"?{kind,id,name:sheet.name||raw.name||"ALLY",sheet,raw,current:{hp:Number(raw.hp?.current)||0,mp:Number(raw.mp?.current)||0},max:{hp:Number(raw.hp?.max)||0,mp:Number(raw.mp?.max)||0}}:null}
  return null;
}
function ensureMonsterDamageApplyDraft(roll){
  const id=String(roll?.id||"");if(!runtime.monsterDamageApplyDraft||runtime.monsterDamageApplyDraft.rollId!==id)runtime.monsterDamageApplyDraft={rollId:id,mod:0,targets:{}};
  const draft=runtime.monsterDamageApplyDraft,results=new Map((roll.targetResults||[]).map(t=>[`${t.kind}:${t.id}`,t]));
  for(const ref of Array.isArray(roll.targetRefs)?roll.targetRefs:[]){const target=monsterDamageTargetInfo(ref);if(!target)continue;const result=results.get(ref),affinity=String(result?.affinity||"NORMAL").toUpperCase(),mode=affinity==="VULNERABILITY"?"vuln":affinity==="RESISTANCE"?"resist":"normal";draft.targets[ref]||={hits:result?.hit===false?0:1,mode,resource:"hp",base:Math.max(0,Number(roll.damage)||0)}}
  return draft;
}
function monsterDamageApplyHTML(roll){
  if(runtime.currentPlayer.role!=="GM"||roll?.actorKind!=="monster"||!rollHasDamage(roll))return"";const draft=ensureMonsterDamageApplyDraft(roll),mod=Number(draft.mod)||0;
  const refs=(Array.isArray(roll.targetRefs)?roll.targetRefs:[]).filter((ref,i,a)=>a.indexOf(ref)===i&&monsterDamageTargetInfo(ref));if(!refs.length)return"";
  const rows=refs.map(ref=>{const target=monsterDamageTargetInfo(ref),rec=draft.targets[ref],hits=Math.max(0,Number(rec.hits)||0),base=Math.max(0,Number(rec.base)||0),resource=rec.resource==="mp"?"mp":"hp",per=damageApplyValue({damage:base},rec.mode,mod),total=per*hits;return `<div class="damage-apply-row monster-damage-row ${hits?"selected":""}"><div class="damage-target-name"><b>${esc(target.name)}</b><small>HP ${target.current.hp}/${target.max.hp} · MP ${target.current.mp}/${target.max.mp}</small></div><div class="monster-damage-inputs"><label>BASE<input type="number" min="0" max="9999" step="1" value="${base}" data-monster-damage-base="${esc(ref)}"></label><div class="damage-hit-stepper"><button type="button" data-monster-damage-target-sub="${esc(ref)}">−</button><input type="number" min="0" max="99" step="1" value="${hits}" data-monster-damage-hits="${esc(ref)}" aria-label="Hits on ${esc(target.name)}"><button type="button" data-monster-damage-target-add="${esc(ref)}">+</button></div></div><div class="damage-mode-pills"><button type="button" class="vuln ${rec.mode==="vuln"?"active":""}" data-monster-damage-mode="${esc(ref)}|vuln">VU ${damageApplyValue({damage:base},"vuln",mod)}</button><button type="button" class="normal ${rec.mode==="normal"?"active":""}" data-monster-damage-mode="${esc(ref)}|normal">NORMAL ${damageApplyValue({damage:base},"normal",mod)}</button><button type="button" class="resist ${rec.mode==="resist"?"active":""}" data-monster-damage-mode="${esc(ref)}|resist">RES ${damageApplyValue({damage:base},"resist",mod)}</button></div><div class="monster-damage-resource"><button type="button" class="${resource==="hp"?"active hp":""}" data-monster-damage-resource="${esc(ref)}|hp">HP</button><button type="button" class="${resource==="mp"?"active mp":""}" data-monster-damage-resource="${esc(ref)}|mp">MP</button></div><div class="damage-apply-total"><span>TOTAL</span><b>${total}</b><button type="button" class="primary" data-monster-damage-apply="${esc(ref)}" ${hits&&total?"":"disabled"}>APPLY</button></div></div>`}).join("");
  const any=refs.some(ref=>{const rec=draft.targets[ref],hits=Math.max(0,Number(rec?.hits)||0),base=Math.max(0,Number(rec?.base)||0);return hits*damageApplyValue({damage:base},rec?.mode,mod)>0});return `<section class="damage-distributor monster-damage-distributor"><div class="damage-distributor-head"><div><b>APPLY DAMAGE · SELECTED PLAYERS / ALLIES</b><small>Set BASE, hits, affinity, then choose HP or MP.</small></div><button type="button" class="primary" data-monster-damage-apply-all ${any?"":"disabled"}>APPLY ALL</button></div><div class="damage-mod-row"><span>DMG MOD</span><div class="damage-mod-stepper"><button type="button" data-monster-damage-mod-step="-1">−</button><input type="number" min="-999" max="999" step="1" value="${mod}" data-monster-damage-mod><button type="button" data-monster-damage-mod-step="1">+</button></div><small>Mod applies to each hit after VU / NORMAL / RES.</small></div>${rows}</section>`;
}
async function applyMonsterRollDamage(ref="",all=false){
  const roll=runtime.overlay;if(runtime.currentPlayer.role!=="GM"||roll?.kind!=="roll"||roll.actorKind!=="monster")return;const draft=ensureMonsterDamageApplyDraft(roll),refs=all?Object.keys(draft.targets):[ref];let changed=0;
  for(const key of refs){const rec=draft.targets[key],target=monsterDamageTargetInfo(key),hits=Math.max(0,Number(rec?.hits)||0);if(!rec||!target||!hits)continue;const resource=rec.resource==="mp"?"mp":"hp",per=damageApplyValue({damage:Math.max(0,Number(rec.base)||0)},rec.mode,Number(draft.mod)||0),total=per*hits;if(!total)continue;const before=target.current[resource],after=clamp(before-total,0,target.max[resource]);
    if(target.kind==="player")await sendRemoteEdit(target.id,{kind:"set",path:`${resource}.current`,value:after});else{runtime.suppressCombatHistory=true;try{updateMonster("active",target.id,m=>{m[resource].current=after})}finally{runtime.suppressCombatHistory=false}}
    recordCombatHistory("damage",`${target.name} · ${resource.toUpperCase()} ${before} → ${after} · ${String(rec.mode||"normal").toUpperCase()} ${per} ×${hits}${Number(draft.mod)?` (${monsterSigned(Number(draft.mod))} MOD)`:""}`);rec.hits=0;changed++;
  }
  if(changed)playSound("hpdown");renderOverlay();
}

function playerDefeatChoiceHTML(x) {
  const name = x?.name || state.name || runtime.currentPlayer.name || "CHARACTER";
  return `<div class="cinematic-backdrop player-defeat-choice-backdrop"><div class="cinematic-card player-defeat-choice-pop"><div class="cinematic-kicker">HP 0 · DEFEAT</div><h2>${esc(name)}</h2><p class="player-defeat-choice-lead">Choose how this character leaves the conflict.</p><div class="player-defeat-choice-grid"><button type="button" class="player-defeat-choice surrender" data-player-defeat-choice="surrender"><small>CHOOSE</small><b>SURRENDER</b><span>Mark the character as SURRENDER and remove them from active combat.</span></button><button type="button" class="player-defeat-choice sacrifice" data-player-defeat-choice="sacrifice"><small>CHOOSE</small><b>SACRIFICE</b><span>Mark the character as SACRIFICE and remove them from active combat.</span></button></div><div class="player-defeat-choice-note">This choice remains on the sheet and Scene card while HP is 0.</div></div></div>`;
}
function maybeShowPendingPlayerDefeatChoice() {
  if (state.deleted || !isPlayerDefeated(state)) {
    if (runtime.overlay?.kind === "player-defeat-choice") { runtime.overlay = null; renderOverlay(); }
    return;
  }
  if (playerDefeatOutcome(state) !== "pending") {
    if (runtime.overlay?.kind === "player-defeat-choice") { runtime.overlay = null; renderOverlay(); }
    return;
  }
  if (runtime.overlay && runtime.overlay.kind !== "player-defeat-choice") return;
  if (runtime.overlay?.kind !== "player-defeat-choice") {
    runtime.overlay = { kind: "player-defeat-choice", name: state.name || runtime.currentPlayer.name || "CHARACTER" };
    renderOverlay();
  }
}

function rollOutcomeInfo(x = {}) {
  const d1 = Number(x?.d1), d2 = Number(x?.d2);
  const same = Number.isFinite(d1) && Number.isFinite(d2) && d1 === d2;
  const fumble = !!x?.fumble || (same && d1 === 1);
  const critical = !fumble && !!x?.critical;
  const double = same && !critical && !fumble;
  if (fumble) return { key: "fumble", label: "FUMBLE" };
  if (critical) return { key: "critical", label: "CRITICAL" };
  if (double) return { key: "double", label: "DOUBLE" };
  return { key: "", label: "" };
}
function rollOutcomeBadgeHTML(x, extraClass = "") {
  const info = rollOutcomeInfo(x);
  return info.key ? `<span class="roll-outcome-badge ${info.key} ${esc(extraClass)}">${info.label}</span>` : "";
}
function rollOutcomeText(x) { return rollOutcomeInfo(x).label; }

function rollTargetChipHTML(roll, target) {
  const hasOutcome = roll.actorKind === "monster" && typeof target.hit === "boolean";
  if (!hasOutcome) return `<span>${esc(target.name)}${Number.isFinite(Number(target.damage)) ? ` · ${esc(target.affinity)} · ${Number(target.damage)}` : ""}</span>`;
  const damage = target.hit && target.damage != null && Number.isFinite(Number(target.damage))
    ? ` · ${esc(target.affinity)} · ${Number(target.damage)}` : "";
  return `<span class="target-${target.hit ? "hit" : "miss"}">${esc(target.name)} · <b>${target.hit ? "HIT" : "MISS"}</b>${damage}</span>`;
}
function overlayHTML(x) {
  if (!x) return "";
  if (x.kind === "guard-cover-target") return guardCoverTargetHTML(x);
  if (x.kind === "fabula-ai-page") return fabulaAiPageReaderHTML(x);
  if (x.kind === "gm-shop-detail") return gmShopDetailHTML(x);
  if (x.kind === "player-shop-detail") return playerShopDetailHTML(x);
  if (x.kind === "player-defeat-choice") return playerDefeatChoiceHTML(x);
  if (x.kind === "cost-payment") return resourceCostPromptHTML(x);
  if (x.kind === "travel-move-approval") {
    const req=x.request||{}, from=String(req.fromName||"CURRENT NODE"), to=String(req.targetName||"TARGET NODE"), player=String(req.senderName||"PLAYER"), group=String(req.groupId||"MAIN");
    const deciding=String(runtime.travelApprovalDeciding||"")===String(req.requestId||"");
    return `<div class="cinematic-backdrop travel-approval-backdrop"><div class="cinematic-card travel-approval-pop"><div class="travel-approval-icon">↗</div><div class="cinematic-kicker">TRAVEL REQUEST · ${esc(group)}</div><h2>${esc(player)} WANTS TO MOVE</h2><div class="travel-approval-route"><span>${esc(from)}</span><b>→</b><span>${esc(to)}</span></div><div class="travel-approval-map">${esc(req.fromMapName||"")} ${req.targetMapName&&req.targetMapName!==req.fromMapName?`→ ${esc(req.targetMapName)}`:""}</div><div class="travel-approval-actions"><button type="button" class="danger-soft" data-action="deny-travel-move" data-travel-approval-request="${esc(req.requestId||"")}" ${deciding?"disabled":""}>DENY</button><button type="button" class="primary" data-action="approve-travel-move" data-travel-approval-request="${esc(req.requestId||"")}" ${deciding?"disabled":""}>${deciding?"PROCESSING…":"APPROVE MOVE"}</button></div><small>Movement will not occur until the GM approves this request.</small></div></div>`;
  }

  if (x.kind === "travel-group-choice") {
    const selected = ["A","B"].includes(String(x.selected || "").toUpperCase()) ? String(x.selected).toUpperCase() : "";
    return `<div class="cinematic-backdrop group-check-backdrop"><div class="cinematic-card group-check-pop"><div class="cinematic-kicker">TRAVEL GROUP · GM REQUEST</div><h2>CHOOSE YOUR GROUP</h2><div class="group-check-prompt-meta"><span>NODE <b>${esc(x.nodeName || "CURRENT NODE")}</b></span><span>SESSION <b>${esc(x.sessionName || "TRAVEL")}</b></span></div><div class="group-check-support-copy">Choose which route group your character will travel with. You may change A/B until the GM confirms the split.</div><div class="gm-group-active-actions"><button class="primary ${selected === "A" ? "active" : ""}" data-action="travel-group-choose-a">${selected === "A" ? "✓ " : ""}GROUP A</button><button class="primary ${selected === "B" ? "active" : ""}" data-action="travel-group-choose-b">${selected === "B" ? "✓ " : ""}GROUP B</button></div><div class="group-check-note">${selected ? `SELECTED · GROUP ${selected} · WAITING FOR GM` : "WAITING FOR YOUR CHOICE"}</div></div></div>`;
  }

  if (x.kind === "group-check-support") {
    const submitted = !!x.submitted, result = x.result || null;
    return `<div class="cinematic-backdrop group-check-backdrop"><div class="cinematic-card group-check-pop"><button class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">GROUP CHECK · SUPPORT</div><h2>${esc(x.label || "GROUP CHECK")}</h2><div class="group-check-prompt-meta"><span>LEADER <b>${esc(x.leaderName || "LEADER")}</b></span><span>CHECK <b>${esc(x.attr1)} + ${esc(x.attr2)}${Number(x.mod)?` ${monsterSigned(Number(x.mod))}`:""}</b></span><span>DL <b>10</b></span></div>${submitted && result ? `<div class="group-check-result ${result.passed?"pass":"fail"}"><div><small>d${result.size1}</small><b>${result.d1}</b></div><span>+</span><div><small>d${result.size2}</small><b>${result.d2}</b></div>${Number(result.mod)?`<span>${Number(result.mod)>=0?"+":"−"}</span><div><small>MOD</small><b>${Math.abs(Number(result.mod))}</b></div>`:""}<strong>${result.total}</strong><em>${result.passed?"SUPPORT SUCCESS · +1":"SUPPORT FAILED"}${result.critical?" · CRITICAL AUTO SUCCESS":result.fumble?" · FUMBLE AUTO FAILURE":""}</em></div><div class="group-check-note">Support result submitted to the GM. Critical/Fumble determine automatic success/failure here, but Support Checks do not generate Opportunities.</div>` : `<div class="group-check-support-copy">Roll the same Attribute Check as the Leader. A Support Check always uses <b>DL 10</b>.</div><button class="primary group-check-roll-btn" data-action="group-check-roll-support">ROLL SUPPORT · DL 10</button>`}</div></div>`;
  }
  if (x.kind === "group-check-leader-wait") {
    return `<div class="cinematic-backdrop group-check-backdrop"><div class="cinematic-card group-check-pop"><button class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">GROUP CHECK · LEADER</div><h2>${esc(x.label || "GROUP CHECK")}</h2><div class="group-check-leader-wait"><b>WAITING FOR SUPPORT</b><strong>${Number(x.responded)||0} / ${Number(x.totalSupporters)||0}</strong><span>${Number(x.successes)||0} SUCCESSFUL SUPPORT CHECKS</span></div><div class="group-check-prompt-meta"><span>CHECK <b>${esc(x.attr1)} + ${esc(x.attr2)}</b></span><span>FINAL DL <b>${Number(x.finalDL)||10}</b></span></div><div class="group-check-note">The GM will send the Final Check once support results and the highest applicable Bond are confirmed.</div></div></div>`;
  }
  if (x.kind === "group-check-final") {
    const support = Number(x.supportBonus)||0, bond = Number(x.bondBonus)||0, bonus = support + bond, rolling = !!x.submitted;
    return `<div class="cinematic-backdrop group-check-backdrop"><div class="cinematic-card group-check-pop final"><button class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">GROUP CHECK · FINAL</div><h2>${esc(x.label || "GROUP CHECK")}</h2><div class="group-check-final-bonus"><div><small>SUPPORT</small><b>+${support}</b></div><div><small>BEST BOND</small><b>+${bond}</b></div><div class="total"><small>TOTAL BONUS</small><b>+${bonus}</b></div></div><div class="group-check-prompt-meta"><span>CHECK <b>${esc(x.attr1)} + ${esc(x.attr2)}${Number(x.mod)?` ${monsterSigned(Number(x.mod))}`:""}</b></span><span>FINAL DL <b>${Number(x.finalDL)||10}</b></span></div><button class="primary group-check-roll-btn" data-action="group-check-roll-final" ${rolling?"disabled":""}>${rolling?"ROLLING…":`ROLL FINAL CHECK · +${bonus}`}</button></div></div>`;
  }
  if (x.kind === "gm-broadcast") {
    const type = normalizeGMBroadcastType(x.broadcastType), info = gmBroadcastTypeInfo(type);
    const cleanBody = stripMediaUrls(x.body || "");
    return `<div class="cinematic-backdrop gm-broadcast-backdrop gm-broadcast-${type}" data-overlay-backdrop-close><div class="cinematic-card gm-broadcast-pop gm-broadcast-${type}"><button class="overlay-close" data-action="close-overlay">×</button><div class="gm-broadcast-scan"></div><div class="gm-broadcast-symbol">${type === "warning" ? "!" : type === "objective" ? "◆" : type === "anomaly" ? "◉" : "Ⅱ"}</div><div class="cinematic-kicker">${esc(info.kicker)}</div><h2>${esc(x.title || info.label)}</h2>${cleanBody ? `<div class="gm-broadcast-body">${formatText(cleanBody)}</div>` : ""}<div class="gm-broadcast-footer">GM BROADCAST · ${esc(x.senderName || "GAME MASTER")}</div></div></div>`;
  }
  if (x.kind === "phase-change") {
    const media = x.portrait ? `<div class="phase-change-portrait"><img src="${esc(x.portrait)}" alt="${esc(x.name || "New form")}"></div>` : `<div class="phase-change-portrait empty"><span>Ⅱ</span></div>`;
    return `<div class="cinematic-backdrop phase-change-backdrop"><div class="phase-change-scan"></div><div class="phase-change-flare"></div><div class="cinematic-card phase-change-pop"><div class="phase-change-warning">BOSS PHASE</div>${media}<div class="phase-change-copy"><div class="cinematic-kicker">PHASE TRANSITION</div><div class="phase-change-label">${esc(x.phaseLabel || "NEXT PHASE")}</div><h2>${esc(x.name || "MONSTER")}</h2>${x.fromName && x.fromName !== x.name ? `<div class="phase-change-route"><span>${esc(x.fromName)}</span><b>→</b><strong>${esc(x.name)}</strong></div>` : ""}</div></div></div>`;
  }
  if (x.kind === "share" && x.shareType === "equipment" && x.equipment) return equipmentSharePopupHTML(x);
  const media = x.gif || x.media || mediaFromText(x.detail || x.body || "");
  const mediaTop = media ? `<div class="cinematic-media-top"><img src="${esc(media)}" alt="Action media"></div>` : "";
  const rollTargets = Array.isArray(x.targetResults) && x.targetResults.length ? `<div class="cinematic-targets"><b>TARGET${x.targetResults.length > 1 ? "S" : ""}</b>${x.targetResults.map(t => rollTargetChipHTML(x,t)).join("")}</div>` : (x.targetName ? `<div class="cinematic-targets"><b>TARGET</b><span>${esc(x.targetName)}</span></div>` : "");
  const rollActionMeta = actionExtraMeta(x.actionTarget || "", x.actionTypeText || "");
  if (x.kind === "roll") {
    if (x.isStudy) {
      const suggested = studyTierFromTotal(x.total);
      const targetLine = x.studyTargetId ? `<div class="study-popup-target">TARGET · <b>${esc(x.studyTargetName || "MONSTER")}</b></div>` : `<div class="study-popup-target">NO TARGET · STUDY CHECK ONLY</div>`;
      const outcome = x.studyTargetId ? (suggested ? `AUTO STUDY ${suggested}+` : "STUDY FAILED · NO UNLOCK") : (suggested ? `CHECK RESULT · ${suggested}+` : "CHECK RESULT · BELOW 7");
      return `<div class="cinematic-backdrop" data-overlay-backdrop-close><div class="cinematic-card roll-pop check-roll-pop study-roll-pop ${x.critical ? "critical-roll" : ""}" ><button class="overlay-close" data-action="close-overlay">×</button>${mediaTop}<div class="cinematic-kicker">${esc(x.senderName)} · STUDY CHECK</div><h2>${esc(x.label)}</h2>${targetLine}<div class="cinematic-dice"><div><small>d${x.size1}</small><b>${x.d1}</b></div><span>+</span><div><small>d${x.size2}</small><b>${x.d2}</b></div>${x.mod ? `<span>${x.mod >= 0 ? "+" : "−"}</span><div class="mod-die"><small>MOD</small><b>${Math.abs(x.mod)}</b></div>` : ""}</div><div class="cinematic-result"><strong>${x.total}</strong><span>${outcome}</span>${rollOutcomeBadgeHTML(x)}</div><div class="cinematic-detail">INS + INS + MOD</div>${invokeControlsHTML(x)}</div></div>`;
    }
    const high = Number.isFinite(Number(x.highResult)) ? Number(x.highResult) : Math.max(Number(x.d1) || 0, Number(x.d2) || 0);
    const damageHigh = Number.isFinite(Number(x.damageHighRoll)) ? Number(x.damageHighRoll) : (x.twoWeapon || String(x.actionCategory || "").toUpperCase() === "TWO WEAPON" ? 0 : high);
    const hasDamage = rollHasDamage(x);
    if (hasDamage) {
      const baseDamage = Number(x.damage) || 0;
      const affinity = String(x.affinity || "NORMAL").toUpperCase();
      const vulnDamage = baseDamage * 2;
      const resistDamage = Math.ceil(baseDamage / 2);
      const element = x.element && x.element !== "none" ? String(x.element).toUpperCase() : "UNTYPED";
      const cleanDetail = stripMediaUrls(x.detail || "");
      const activeAffinity = affinity === "VULNERABILITY" ? "vuln" : affinity === "RESISTANCE" ? "resist" : "normal";
      const distributor = playerDamageApplyHTML(x) || monsterDamageApplyHTML(x);
      return `<div class="cinematic-backdrop action-roll-backdrop" data-popup-pass-through-backdrop><div class="cinematic-card roll-pop action-roll-compact ${distributor ? "has-distributor" : ""} ${x.critical ? "critical-roll" : ""}"><button type="button" class="overlay-close" data-action="close-overlay">×</button>${mediaTop}<div class="cinematic-kicker">${esc(x.senderName)} · ROLL</div><h2>${esc(x.label)}</h2>${rollActionMeta}${rollTargets}<div class="action-roll-layout"><div class="action-roll-main">${cleanDetail ? `<div class="cinematic-detail popup-detail-scroll detail-before-roll">${formatText(cleanDetail)}</div>` : ""}<div class="action-accuracy-formula"><span>${esc(x.attr1)} <b>${x.d1}</b></span><i>+</i><span>${esc(x.attr2)} <b>${x.d2}</b></span><i>+</i><span>MOD <b>${Number(x.mod) || 0}</b>${Number(x.autoAccuracyBonus) ? `<small>LEVEL ${monsterSigned(Number(x.autoAccuracyBonus))}</small>` : ""}</span><i>=</i><span class="accuracy-total">ACCURACY <b>${Number(x.total) || 0}</b></span><span class="hr-total">${x.twoWeapon ? "HR · TWO WEAPON" : "HR"} <b>${damageHigh}</b></span></div>${rollOutcomeBadgeHTML(x, "action-roll-outcome")}<div class="action-damage-compare"><div class="action-damage-cell vuln ${activeAffinity === "vuln" ? "active" : ""}"><small>VU · ×2</small><strong>${vulnDamage}</strong><span>VULNERABILITY</span></div><div class="action-damage-cell normal ${activeAffinity === "normal" ? "active" : ""}"><small>NORMAL</small><strong>${baseDamage}</strong><span>${x.twoWeapon ? "HR 0" : `HIGH ${high}`} + DAMAGE BONUS ${Number(x.damageHR) || 0}${Number(x.autoDamageBonus) ? ` · LEVEL ${monsterSigned(Number(x.autoDamageBonus))}` : ""}</span></div><div class="action-damage-cell resist ${activeAffinity === "resist" ? "active" : ""}"><small>RES · ÷2 ↑</small><strong>${resistDamage}</strong><span>ROUND UP</span></div></div><div class="action-element-pill">${elementIcon(x.element)}<span>${esc(element)}</span></div></div>${distributor ? `<aside class="action-roll-side">${distributor}</aside>` : ""}</div>${invokeControlsHTML(x)}</div></div>`;
    }
    const cleanDetail = stripMediaUrls(x.detail || "");
    return `<div class="cinematic-backdrop" data-overlay-backdrop-close><div class="cinematic-card roll-pop check-roll-pop ${x.critical ? "critical-roll" : ""}" ><button class="overlay-close" data-action="close-overlay">×</button>${mediaTop}<div class="cinematic-kicker">${esc(x.senderName)} · ROLL</div><h2>${esc(x.label)}</h2>${rollActionMeta}${rollTargets}<div class="cinematic-dice"><div><small>d${x.size1}</small><b>${x.d1}</b></div><span>+</span><div><small>d${x.size2}</small><b>${x.d2}</b></div>${x.mod ? `<span>${x.mod >= 0 ? "+" : "−"}</span><div class="mod-die"><small>MOD</small><b>${Math.abs(x.mod)}</b></div>` : ""}</div><div class="cinematic-result"><strong>${x.total}</strong><span>CHECK TOTAL</span>${rollOutcomeBadgeHTML(x)}</div>${cleanDetail ? `<div class="cinematic-detail">${formatText(cleanDetail)}</div>` : ""}${invokeControlsHTML(x)}</div></div>`;
  }
  const cleanBody = stripMediaUrls(x.body || "");
  return `<div class="cinematic-backdrop" data-overlay-backdrop-close><div class="cinematic-card share-pop" ><button class="overlay-close" data-action="close-overlay">×</button>${mediaTop}<div class="cinematic-kicker">${esc(x.senderName)} · SENT</div><h2>${esc(x.title)}</h2>${cleanBody ? `<div class="cinematic-detail">${formatText(cleanBody)}</div>` : ""}</div></div>`;
}

function overlayRenderKey(x) {
  if (!x) return "none";
  return [String(x.kind || "overlay"), String(x.id || x.instanceId || x.request?.id || x.roll?.id || "")].join(":");
}
function renderOverlay() {
  if(!runtime.overlay&&runtime.currentPlayer.role==="GM"&&travelApprovalFirstRequest())runtime.overlay={kind:"travel-move-approval",request:travelApprovalFirstRequest()};
  const host = document.getElementById("overlay-host"); if (!host) return;
  // v3.0.33: keep the exact viewport inside long Roll/Apply Damage overlays. Replacing
  // overlay-host on every scene/input update used to reset .cinematic-card scrollTop to 0.
  const nextKey=overlayRenderKey(runtime.overlay),sameKey=host.dataset.overlayRenderKey===nextKey;
  const oldBackdrop=host.querySelector(".cinematic-backdrop"),oldCard=host.querySelector(".cinematic-card"),oldContent=host.querySelector(".popup-detail-scroll");
  const backdropTop=sameKey?(oldBackdrop?.scrollTop||0):0,backdropLeft=sameKey?(oldBackdrop?.scrollLeft||0):0;
  const cardTop=sameKey?(oldCard?.scrollTop||0):0,cardLeft=sameKey?(oldCard?.scrollLeft||0):0;
  const contentTop=sameKey?(oldContent?.scrollTop||0):0;
  const pageScroller=document.scrollingElement, pageTop=sameKey?(pageScroller?.scrollTop||0):0, pageLeft=sameKey?(pageScroller?.scrollLeft||0):0;
  host.innerHTML = overlayHTML(runtime.overlay); host.dataset.overlayRenderKey=nextKey;
  if(sameKey&&(backdropTop||backdropLeft||cardTop||cardLeft||contentTop||pageTop||pageLeft)){
    requestAnimationFrame(()=>{
      const backdrop=host.querySelector(".cinematic-backdrop"),card=host.querySelector(".cinematic-card"),content=host.querySelector(".popup-detail-scroll");
      if(backdrop){backdrop.scrollTop=backdropTop;backdrop.scrollLeft=backdropLeft} if(card){card.scrollTop=cardTop;card.scrollLeft=cardLeft} if(content)content.scrollTop=contentTop;
      if(pageScroller){pageScroller.scrollTop=pageTop;pageScroller.scrollLeft=pageLeft}
    });
  }
}

function relevantMessage(m) {
  if (!m) return false; if (m.senderId === runtime.currentPlayer.id) return true; if (m.target === "ALL") return true;
  if (m.target === "GM") return runtime.currentPlayer.role === "GM"; return m.target === runtime.currentPlayer.id;
}
function relevantGMBroadcast(m) {
  if (!m || m.senderId === runtime.currentPlayer.id) return false;
  const targets = Array.isArray(m.targets) ? m.targets.map(String) : [];
  if (targets.includes("ALL_PLAYERS")) return runtime.currentPlayer.role !== "GM";
  return targets.includes(String(runtime.currentPlayer.id));
}
function pushFeed(item) { if (runtime.feed.some(x => x.id && item.id && x.id === item.id)) return; runtime.feed.push(item); runtime.feed = runtime.feed.slice(-150); saveFeed(); }
function mergeCombatHistory(...lists) {
  const map = new Map();
  for (const list of lists) for (const row of normalizeCombatHistory(list)) {
    const old = map.get(row.id);
    if (!old || Number(row.time) >= Number(old.time)) map.set(row.id, row);
  }
  return [...map.values()].sort((a,b) => Number(a.time) - Number(b.time)).slice(-250);
}
function normalizeCombatHistory(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  return list.filter(x => x && typeof x === "object").map(x => ({
    id: String(x.id || uid()), category: String(x.category || "system"), text: String(x.text || ""),
    actor: String(x.actor || ""), time: Number(x.time) || Date.now(),
    undo: x.undo && typeof x.undo === "object" ? deepClone(x.undo) : null, undone: !!x.undone
  })).filter(x => x.text && !seen.has(x.id) && seen.add(x.id)).slice(-250);
}
function pushCombatHistory(entry) {
  if (!entry?.text) return false;
  if (runtime.combatHistory.some(x => x.id === entry.id)) return false;
  runtime.combatHistory.push(entry);
  runtime.combatHistory = runtime.combatHistory.slice(-250);
  if (runtime.view === "chat" && runtime.chatPanel === "history") render();
  return true;
}
let combatHistoryWriteChain = Promise.resolve();
function persistCombatHistoryEntry(entry) {
  if (PREVIEW || !runtime.online || !entry) return Promise.resolve();
  combatHistoryWriteChain = combatHistoryWriteChain.catch(() => {}).then(async () => {
    try {
      if (!await OBR.scene.isReady()) return;
      const md = await OBR.scene.getMetadata();
      const current = mergeCombatHistory(md[SCENE_HISTORY_KEY], runtime.combatHistory);
      if (!current.some(x => x.id === entry.id)) current.push(entry);
      const merged = mergeCombatHistory(current);
      await OBR.scene.setMetadata({ [SCENE_HISTORY_KEY]: deepClone(merged) });
    } catch (e) { console.warn("combat history", e); }
  });
  return combatHistoryWriteChain;
}
function recordCombatHistory(category, textValue, id = "", undo = null) {
  if (runtime.suppressCombatHistory) return null;
  const entry = { id: id || uid(), category: category || "system", text: String(textValue || ""), actor: runtime.currentPlayer.name || "PLAYER", time: Date.now(), undo: undo && typeof undo === "object" ? deepClone(undo) : null, undone: false };
  if (!entry.text) return null;
  pushCombatHistory(entry);
  broadcast("combat-history", { ...entry, senderId: runtime.currentPlayer.id });
  persistCombatHistoryEntry(entry);
  return entry;
}
async function persistCombatHistorySnapshot() {
  if (PREVIEW || !runtime.online) return;
  try { if (await OBR.scene.isReady()) await OBR.scene.setMetadata({ [SCENE_HISTORY_KEY]: deepClone(runtime.combatHistory.slice(-250)) }); } catch (e) { console.warn("combat history snapshot", e); }
}
function latestUndoableHistory() {
  return [...(runtime.combatHistory || [])].reverse().find(x => x?.undo && !x.undone) || null;
}
async function undoLastCombatChange() {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can undo combat changes");
  const entry = latestUndoableHistory(); if (!entry) return notify("No reversible combat change found");
  const u = deepClone(entry.undo); if (!u) return;
  runtime.suppressCombatHistory = true;
  try {
    if (u.type === "player" && u.ownerId && u.op) await sendRemoteEdit(u.ownerId, u.op);
    else if (u.type === "monster" && u.monsterId && u.path) updateMonster("active", u.monsterId, m => setByPath(m, u.path, deepClone(u.value)));
    else if (u.type === "scene-tracker") {
      const arr = runtime.sceneTrackers?.[u.kind]; const item = Array.isArray(arr) ? arr.find(x => x.id === u.id) : null;
      if (item) { item.progress = clamp(u.progress, 0, item.segments); scheduleTrackerSave(); }
    }
    else if (u.type === "phase" && u.monsterId) updateMonster("active", u.monsterId, m => { m.activePhase = clamp(Number(u.phase) || 0, 0, m.phases.length); });
    else return notify("That change can no longer be undone");
  } finally { runtime.suppressCombatHistory = false; }
  entry.undone = true; entry.undo = null;
  await persistCombatHistorySnapshot();
  broadcast("combat-history-undo", { id: uid(), senderId: runtime.currentPlayer.id, historyId: entry.id, time: Date.now() });
  recordCombatHistory("system", `UNDO · ${entry.text}`);
  render();
}
async function clearCombatHistory() {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can clear Combat History");
  runtime.combatHistory = [];
  if (!PREVIEW && runtime.online) {
    try { if (await OBR.scene.isReady()) await OBR.scene.setMetadata({ [SCENE_HISTORY_KEY]: [] }); } catch (e) { console.warn("clear combat history", e); }
  }
  broadcast("combat-history-clear", { id: uid(), senderId: runtime.currentPlayer.id, time: Date.now() });
  render();
}
function resourceChangeText(name, label, before, after, sheet) {
  const delta = Number(after) - Number(before), sign = delta > 0 ? `+${delta}` : `${delta}`;
  const crisis = label === "HP" && isCrisis(sheet) ? " · CRISIS" : "";
  return `${name} · ${label} ${before} → ${after} (${sign})${crisis}`;
}
function recordSheetCombatChange(owner, before, after, op) {
  if (!before || !after || !op || runtime.suppressCombatHistory) return;
  const name = after.name || sourceParty(owner)?.name || "CHARACTER";
  const paths = { "hp.current": "HP", "mp.current": "MP", "ip.current": "IP", "fp": "FP" };
  if ((op.kind === "set" || op.kind === "adjust") && paths[op.path]) {
    const b = op.path === "fp" ? Number(before.fp) : Number(getByPath(before, op.path));
    const a = op.path === "fp" ? Number(after.fp) : Number(getByPath(after, op.path));
    if (Number.isFinite(b) && Number.isFinite(a) && b !== a) recordCombatHistory("resource", resourceChangeText(name, paths[op.path], b, a, after), "", { type: "player", ownerId: owner, op: { kind: "set", path: op.path, value: b } });
  }
  if (op.kind === "pay-cost") {
    const paid = [];
    for (const [path, label] of [["hp.current","HP"],["mp.current","MP"],["ip.current","IP"],["fp","FP"]]) {
      const b = path === "fp" ? Number(before.fp) : Number(getByPath(before, path));
      const a = path === "fp" ? Number(after.fp) : Number(getByPath(after, path));
      if (Number.isFinite(b) && Number.isFinite(a) && a < b) paid.push(`${label} −${b - a}`);
    }
    if (paid.length) recordCombatHistory("resource", `${name} · COST PAID · ${paid.join(" · ")}`, "", { type: "player", ownerId: owner, op: { kind: "restore-cost", values: { hp: before.hp.current, mp: before.mp.current, ip: before.ip.current, fp: before.fp } } });
  }
  if (op.kind === "toggle-status" && STATUS_NAMES.includes(op.key)) {
    const on = !!after.statuses?.[op.key], previous = !!before.statuses?.[op.key];
    recordCombatHistory("status", `${name} · ${String(op.key).toUpperCase()} ${on ? "APPLIED" : "REMOVED"}`, "", { type: "player", ownerId: owner, op: { kind: "set", path: `statuses.${op.key}`, value: previous } });
  }
  if (op.kind === "set-defeat-outcome" && ["surrender","sacrifice"].includes(String(after.defeatOutcome || "").toLowerCase())) {
    recordCombatHistory("status", `${name} · 0 HP · ${String(after.defeatOutcome).toUpperCase()}`);
  }
}
function recordMonsterCombatDiff(before, after) {
  if (!before || !after || runtime.suppressCombatHistory) return;
  const name = monsterPhaseView(after, "active")?.name || after.name || "MONSTER", tier = monsterTier(after);
  for (const [key, label] of [["hp","HP"],["mp","MP"],["ip","IP"],["up","UP"]]) {
    const b = Number(before?.[key]?.current), a = Number(after?.[key]?.current);
    if (!Number.isFinite(b) || !Number.isFinite(a) || b === a) continue;
    const undo = { type: "monster", monsterId: after.id, path: `${key}.current`, value: b };
    if (key === "up") recordCombatHistory("resource", `${name} · UP CHANGED`, "", undo);
    else if (tier >= 7) recordCombatHistory("resource", resourceChangeText(name, label, b, a, after), "", undo);
    else recordCombatHistory("resource", `${name} · ${label} CHANGED${key === "hp" && isCrisis(after) ? " · CRISIS" : ""}`, "", undo);
  }
  const fpBefore = Number(before.fp) || 0, fpAfter = Number(after.fp) || 0;
  if (fpBefore !== fpAfter) recordCombatHistory("resource", `${name} · FP ${fpBefore} → ${fpAfter} (${fpAfter > fpBefore ? "+" : ""}${fpAfter - fpBefore})`, "", { type: "monster", monsterId: after.id, path: "fp", value: fpBefore });
  for (const k of STATUS_NAMES) {
    const b = !!before.statuses?.[k], a = !!after.statuses?.[k];
    if (b !== a) recordCombatHistory("status", `${name} · ${k.toUpperCase()} ${a ? "APPLIED" : "REMOVED"}`, "", { type: "monster", monsterId: after.id, path: `statuses.${k}`, value: b });
  }
  const bt = monsterTier(before), at = monsterTier(after);
  if (bt !== at) recordCombatHistory("study", `${name} · STUDY ${STUDY_LABELS[bt]} → ${STUDY_LABELS[at]}`);
}
async function broadcast(type, payload) {
  if (PREVIEW || !runtime.online) return false;
  try { await OBR.broadcast.sendMessage(CHANNEL, { type, [type]: payload }, { destination: "ALL" }); return true; }
  catch (e) { console.warn("broadcast", e); return false; }
}
async function activateZeroPower(owner) {
  if (String(owner) !== String(runtime.currentPlayer.id)) return notify("Only the owner can activate this Zero Power");
  const s = sourceSheet(owner), z = s?.zeroPower || {};
  if (!s || Number(z.current) < 6) return notify(`ZERO POWER · ${Number(z.current) || 0}/6`);
  const id = `zero-${uid()}`, payload = { kind:"zero-power", id, rollId:id, senderId:runtime.currentPlayer.id, senderName:runtime.currentPlayer.name, actorId:owner, actorName:s.name || runtime.currentPlayer.name, actionName:z.name || "ZERO POWER", portrait:s.portrait || "", media:mediaFromText(z.detail), trigger:stripMediaUrls(z.trigger), effect:stripMediaUrls(z.effect), detail:stripMediaUrls(z.detail), description:[stripMediaUrls(z.effect),stripMediaUrls(z.detail)].filter(Boolean).join("\n\n") || "ZERO POWER ACTIVATED", element:"none", cutInColor:"gold", time:Date.now() };
  await broadcast("skill-cutin", payload);
  await sendRemoteEdit(owner, { kind:"set", path:"zeroPower.current", value:0 });
  notify(`${z.name || "ZERO POWER"} · ACTIVATED`);
}
function announceTrackerTick(kind, name, progress, segments, undo = null) {
  playSound("clock");
  const trackerName = name || (kind === "project" ? "Project" : "Clock");
  recordCombatHistory("tracker", `${kind === "project" ? "PROJECT" : "CLOCK"} · ${trackerName} · ${Number(progress) || 0}/${Number(segments) || 0}`, "", undo);
  broadcast("tracker-tick", { id: uid(), senderId: runtime.currentPlayer.id, senderName: runtime.currentPlayer.name, trackerKind: kind, name: trackerName, progress: Number(progress) || 0, segments: Number(segments) || 0, time: Date.now() });
}
function announceCombatOutcome(outcome, name, entityKind = "combatant") {
  const kind = ["surrender","sacrifice","defeated"].includes(String(outcome || "").toLowerCase()) ? String(outcome).toLowerCase() : "defeated";
  const label = kind.toUpperCase(), actorName = name || "COMBATANT";
  playSound(kind);
  showToast(label, `${actorName} · ${label}`, kind, false);
  broadcast("combat-outcome", { id: uid(), senderId: runtime.currentPlayer.id, senderName: runtime.currentPlayer.name, outcome: kind, name: actorName, entityKind, time: Date.now() });
}
let hudLocalResultBus = null;
const hudLocalSeen = new Set();
function hudLocalEventId(data={}){ const p=data?.[data?.type]||{}; return String(data?._localEventId||p?.id||""); }
function receiveHudLocalResult(data){
  if(!data || String(data.origin||data?.[data.type]?.origin||"")!=="TOKEN_ACTION_HUD") return;
  if(!["roll","share","skill-cutin"].includes(String(data.type||""))) return;
  const payload=data?.[data.type]||{};
  if(String(payload.senderId||"")!==String(runtime.currentPlayer.id||"")) return;
  const id=hudLocalEventId(data);
  if(id && hudLocalSeen.has(id)) return;
  if(id){hudLocalSeen.add(id); if(hudLocalSeen.size>80) hudLocalSeen.delete(hudLocalSeen.values().next().value);}
  if(data.type==="skill-cutin") return;
  receiveEvent(data);
  // Ack lets background know the classic action-window renderer actually received it.
  try{if(id&&hudLocalResultBus)hudLocalResultBus.postMessage({type:"hud-result-ack",eventId:id,playerId:runtime.currentPlayer.id})}catch{}
}
function registerHudLocalResultBus(){
  if(PREVIEW || !runtime.currentPlayer.id || hudLocalResultBus) return;
  const key=`${HUD_LOCAL_RESULT_KEY}:${runtime.currentPlayer.id}`;
  try {
    if(typeof BroadcastChannel!=="undefined"){
      hudLocalResultBus=new BroadcastChannel(key);
      hudLocalResultBus.onmessage=e=>receiveHudLocalResult(e.data);
    } else {
      window.addEventListener("storage",e=>{if(e.key!==key||!e.newValue)return;try{receiveHudLocalResult(JSON.parse(e.newValue))}catch{}});
    }
  } catch(e){console.warn("HUD local result bus",e);}
}

function receiveEvent(data) {
  if (!data?.type || data.type === "edit") return;
  const payload = data[data.type];
  if (data.type === "travel-move-fx") {
    travelStartMarkerMotionFx(payload || {});
    return;
  }
  if (data.type === "travel-move-approval-pending") {
    const req=payload?.request||payload||{};
    if(runtime.currentPlayer.role === "GM") {
      const st=normalizeTravelApprovalState(runtime.travelApproval);
      if(req?.requestId&&!st.requests.some(x=>String(x.requestId)===String(req.requestId))) st.requests.push(normalizeTravelApprovalRequest(req));
      runtime.travelApproval=st;
      maybeShowTravelApprovalRequest();
    } else if(String(req?.senderId||"")===String(runtime.currentPlayer.id||"")) {
      travelMarkPendingApproval(req);
      showToast("TRAVEL REQUEST", "Waiting for GM approval", "message", false);
      if(runtime.view==="travel")render();
    }
    return;
  }
  if (data.type === "travel-sync") {
    const incoming = normalizeTravelState(payload?.travel);
    const ownReply = String(payload?.senderId || "") === String(runtime.currentPlayer.id || "") && !!payload?.requestId;
    if (ownReply) travelFinishMoveRequest(String(payload.requestId), !!payload.accepted, String(payload.reason || ""));
    if(payload?.senderId===runtime.currentPlayer.id&&payload?.reason==="move-reject") notify("Travel move was rejected · the map has been refreshed; click an adjacent unlocked Node again");
    if(payload?.senderId===runtime.currentPlayer.id&&payload?.reason==="approval-denied") notify("Travel request denied by GM");
    const incomingRev = Number(incoming.revision)||0, localRev = Number(runtime.travel?.revision)||0;
    if (runtime.travelDirty && runtime.currentPlayer.role === "GM" && ["move","presence","split"].includes(String(payload?.reason||""))) mergeTravelMoveIntoLocal(incoming);
    else if (incomingRev >= localRev || ownReply) runtime.travel = incoming;
    runtime.travelMoveLastAckAt = Date.now();
    // A GM save already mutated the local Travel object and rendered it. The
    // ALL broadcast loops back to the same connection as persistence/room sync;
    // do not rebuild the large graph a second time for that exact self-echo.
    const selfFullEcho = String(payload?.senderId||"") === String(runtime.currentPlayer.id||"") && !payload?.requestId && String(payload?.reason||"") === "full";
    if (runtime.view === "travel" && !selfFullEcho) render();
    return;
  }
  if (data.type === "travel-node-live") {
    if (payload?.senderId !== runtime.currentPlayer.id) applyTravelNodeLivePatch(payload);
    return;
  }
  if (data.type === "codex-library-refresh") {
    if (payload?.senderId !== runtime.currentPlayer.id) {
      const result = applyCodexLibrarySnapshot(payload || {});
      if ((result.refreshed || result.removed) && runtime.view === "codex") render();
    }
    return;
  }
  if (data.type === "codex-template-update") {
    if (payload?.senderId !== runtime.currentPlayer.id) {
      const changed = applyCodexTemplateUpdate(payload || {});
      if (changed && runtime.view === "codex") render();
    }
    return;
  }
  if (data.type === "codex-template-delete") {
    if (payload?.senderId !== runtime.currentPlayer.id) {
      const removed = purgeCodexForTemplateRef(payload, true);
      if (removed && runtime.view === "codex") render();
    }
    return;
  }
  if (data.type === "combat-history") {
    const entry = payload ? { id: payload.id, category: payload.category, text: payload.text, actor: payload.actor, time: payload.time, undo: payload.undo ? deepClone(payload.undo) : null, undone: !!payload.undone } : null;
    if (entry?.id && payload?.senderId !== runtime.currentPlayer.id) pushCombatHistory(entry);
    return;
  }
  if (data.type === "combat-history-undo") {
    if (payload?.senderId !== runtime.currentPlayer.id) { const entry = runtime.combatHistory.find(x => x.id === payload.historyId); if (entry) { entry.undone = true; entry.undo = null; if (runtime.view === "chat") render(); } }
    return;
  }
  if (data.type === "phase-change") {
    if (payload?.senderId !== runtime.currentPlayer.id || payload?.origin === "COMPANION_DOMINION") { playSound("phase"); showTimedOverlay({ kind: "phase-change", ...payload }, 3000); }
    return;
  }
  if (data.type === "skill-cutin") {
    // Rendered by the background page in a dedicated bottom-right canvas popover.
    return;
  }
  if (data.type === "combat-outcome") {
    if (payload?.senderId !== runtime.currentPlayer.id) {
      const outcome = ["surrender","sacrifice","defeated"].includes(String(payload?.outcome || "").toLowerCase()) ? String(payload.outcome).toLowerCase() : "defeated";
      const label = outcome.toUpperCase();
      playSound(outcome);
      showToast(label, `${payload?.name || "COMBATANT"} · ${label}`, outcome, false);
    }
    return;
  }
  if (data.type === "combat-history-clear") {
    if (payload?.senderId !== runtime.currentPlayer.id) { runtime.combatHistory = []; if (runtime.view === "chat") render(); }
    return;
  }

  if (data.type === "travel-group-choice-start") {
    const prompt = travelGroupPromptForPlayer(payload || {});
    if (prompt) { savePendingTravelGroup(payload); showOverlay(prompt); }
    return;
  }
  if (data.type === "travel-group-choice-result") {
    const active = runtime.gmTravelGroup?.active;
    if (runtime.currentPlayer.role === "GM" && active && sameId(active.id, payload?.id)) {
      const senderId = String(payload?.senderId || ""), playerId = String(payload?.playerId || senderId), group = String(payload?.group || "").toUpperCase();
      if (senderId && sameId(senderId, playerId) && ["A","B"].includes(group) && active.players.some(x => sameId(x.id, playerId))) {
        active.choices[playerId] = group;
        if ((runtime.view === "gmtools" && runtime.gmToolTab === "travelgroup") || runtime.view === "travel") render();
      }
    }
    return;
  }
  if (data.type === "travel-group-choice-cancel" || data.type === "travel-group-choice-complete") {
    clearPendingTravelGroup(payload?.id || "");
    if (runtime.overlay?.kind === "travel-group-choice" && (!payload?.id || sameId(runtime.overlay.id, payload.id))) { runtime.overlay = null; renderOverlay(); }
    return;
  }

  if (data.type === "group-check-start") {
    const prompt = groupCheckPromptForPlayer("group-check-start", payload || {});
    if (prompt) { savePendingGroupCheck("group-check-start", payload); showOverlay(prompt); }
    return;
  }
  if (data.type === "group-check-support-result") {
    if (runtime.currentPlayer.role === "GM" && runtime.gmGroupCheck?.active && sameId(runtime.gmGroupCheck.active.id, payload?.id)) {
      const a = runtime.gmGroupCheck.active, senderId = String(payload?.senderId || ""), pid = String(payload?.playerId || senderId || "");
      if (a.status === "support" && senderId && sameId(senderId, pid) && a.supporters.some(x => sameId(x.id, pid))) {
        const d1 = Number(payload?.d1), d2 = Number(payload?.d2), size1 = Number(payload?.size1), size2 = Number(payload?.size2);
        if (![6,8,10,12].includes(size1) || ![6,8,10,12].includes(size2) || !Number.isInteger(d1) || !Number.isInteger(d2) || d1 < 1 || d1 > size1 || d2 < 1 || d2 > size2) return;
        const mod = Number(a.mod)||0, total = d1 + d2 + mod, fumble = d1===1 && d2===1, critical = !fumble && d1===d2 && d1>=6, passed = critical || (!fumble && total>=10);
        a.results[pid] = { ...deepClone(payload), senderId, playerId:pid, attr1:a.attr1, attr2:a.attr2, mod, total, fumble, critical, double:d1===d2&&!critical&&!fumble, passed };
        if (gmGroupCheckSupportBonus(a) <= 0) a.bondBonus = 0;
        saveGMGroupCheckState();
        const responded = a.supporters.filter(x => a.results[String(x.id)]).length;
        const successes = gmGroupCheckSupportBonus(a);
        broadcast("group-check-progress", { id:a.id, senderId:runtime.currentPlayer.id, leaderId:a.leaderId, responded, totalSupporters:a.supporters.length, successes, time:Date.now() });
        if (runtime.view === "gmtools" && runtime.gmToolTab === "groupcheck") render();
      }
    }
    return;
  }
  if (data.type === "group-check-progress") {
    if (sameId(payload?.leaderId, runtime.currentPlayer.id) && runtime.overlay?.kind === "group-check-leader-wait" && sameId(runtime.overlay.id, payload?.id)) {
      runtime.overlay.responded = Number(payload.responded)||0; runtime.overlay.totalSupporters = Number(payload.totalSupporters)||0; runtime.overlay.successes = Number(payload.successes)||0; renderOverlay();
      try { const rec=JSON.parse(localStorage.getItem(GROUP_CHECK_PENDING_KEY)||"null"); if(rec?.kind==="group-check-start"&&sameId(rec?.payload?.id,payload?.id)){rec.payload.responded=runtime.overlay.responded;rec.payload.totalSupporters=runtime.overlay.totalSupporters;rec.payload.successes=runtime.overlay.successes;localStorage.setItem(GROUP_CHECK_PENDING_KEY,JSON.stringify(rec));} } catch {}
    }
    return;
  }
  if (data.type === "group-check-final-ready") {
    if (sameId(payload?.leaderId, runtime.currentPlayer.id)) { savePendingGroupCheck("group-check-final-ready", payload); showOverlay({ kind:"group-check-final", ...deepClone(payload) }); }
    return;
  }
  if (data.type === "group-check-final-result") {
    if (runtime.currentPlayer.role === "GM" && runtime.gmGroupCheck?.active && sameId(runtime.gmGroupCheck.active.id, payload?.id)) {
      const a = runtime.gmGroupCheck.active, senderId = String(payload?.senderId || ""), leaderId = String(payload?.leaderId || "");
      const invokeUpdate = !!payload?.invokeUpdate;
      if ((a.status === "final-ready" || (invokeUpdate && a.status === "complete")) && senderId && sameId(senderId, a.leaderId) && sameId(leaderId, a.leaderId)) {
        const d1 = Number(payload?.d1), d2 = Number(payload?.d2), size1 = Number(payload?.size1), size2 = Number(payload?.size2);
        if (![6,8,10,12].includes(size1) || ![6,8,10,12].includes(size2) || !Number.isInteger(d1) || !Number.isInteger(d2) || d1 < 1 || d1 > size1 || d2 < 1 || d2 > size2) return;
        const supportBonus = gmGroupCheckSupportBonus(a), bondBonus = gmGroupCheckBondBonus(a);
        const invokeBondBonus = invokeUpdate ? clamp(Number(payload?.invokeBondBonus) || 0, 0, 3) : 0;
        const mod = (Number(a.mod)||0) + supportBonus + bondBonus + invokeBondBonus, total = d1 + d2 + mod;
        const fumble = d1===1 && d2===1, critical = !fumble && d1===d2 && d1>=6, passed = critical || (!fumble && total>=Number(a.finalDL||10));
        a.finalResult = { ...deepClone(payload), senderId, leaderId:a.leaderId, finalDL:Number(a.finalDL)||10, supportBonus, bondBonus, invokeBondBonus, mod, total, fumble, critical, double:d1===d2&&!critical&&!fumble, passed };
        a.status = "complete"; saveGMGroupCheckState();
        if (runtime.view === "gmtools" && runtime.gmToolTab === "groupcheck") render();
      }
    }
    return;
  }
  if (data.type === "group-check-cancel") {
    clearPendingGroupCheck(payload?.id || "");
    if (runtime.overlay && String(runtime.overlay.kind||"").startsWith("group-check-") && (!payload?.id || sameId(runtime.overlay.id,payload.id))) { runtime.overlay=null; renderOverlay(); }
    return;
  }
  if (data.type === "gm-broadcast") {
    if (relevantGMBroadcast(payload)) {
      const info = gmBroadcastTypeInfo(payload?.broadcastType);
      playSound(info.sound);
      showOverlay({ kind: "gm-broadcast", ...payload });
    }
    return;
  }
  if (data.type === "shop-sync") {
    const next = normalizeSharedShop(payload?.shop); if (next.revision >= (Number(runtime.sharedShop?.revision) || 0)) runtime.sharedShop = next;
    if (["shop","gmtools"].includes(runtime.view)) render(); return;
  }
  if (data.type === "shop-purchase-request") {
    if (runtime.currentPlayer.role === "GM" && payload?.senderId !== runtime.currentPlayer.id) processShopPurchaseRequest(payload);
    return;
  }
  if (data.type === "shop-purchase-result") {
    if (String(payload?.buyerId || "") !== String(runtime.currentPlayer.id)) return;
    const instanceId = String(payload?.instanceId || "");
    for (const [key,p] of Object.entries(runtime.shopPurchasePending || {})) if (p?.requestId === payload?.requestId || key === instanceId) delete runtime.shopPurchasePending[key];
    showToast(payload?.ok ? "PURCHASE COMPLETE" : "PURCHASE FAILED", payload?.message || "", payload?.ok ? "message" : "crisis", false);
    if (payload?.ok) playSound("message");
    if (runtime.view === "shop") render(); return;
  }
  if (data.type === "roll-update") {
    const r = payload && typeof payload === "object" ? deepClone(payload) : null;
    if (!r?.id) return;
    const updatedBy = String(r.updatedBy || ""), actorId = String(r.actorId || ""), rollerId = String(r.senderId || "");
    if (!updatedBy || (updatedBy !== actorId && updatedBy !== rollerId)) return;
    if (updatedBy === String(runtime.currentPlayer.id || "")) return;
    replaceRollSnapshots(r, false);
    renderOverlay();
    if (runtime.view === "roll" || runtime.view === "chat" || r.isStudy) render();
    return;
  }
  const externalHudOrigin = String(payload?.origin || data?.origin || "");
  const fromExternalHud = ["TOKEN_ACTION_HUD", "COMPANION_HUD"].includes(externalHudOrigin);
  // Normal rolls/shares created inside the main window are already rendered locally,
  // so self broadcasts are ignored. Main-canvas HUD / Companion events originate in
  // separate popovers and need the open Fabula window to receive the result.
  if (payload?.senderId === runtime.currentPlayer.id && !fromExternalHud) return;
  if (data.type === "tracker-tick") { playSound("clock"); return; }
  if (data.type === "chat" && relevantMessage(data.chat)) {
    pushFeed({ kind: "chat", ...data.chat }); showToast(data.chat.senderName, String(data.chat.text).slice(0, 110), "message"); if (runtime.view === "chat" || runtime.view === "roll") render();
  }
  if (data.type === "roll") {
    runtime.lastRoll = data.roll ? { ...data.roll } : runtime.lastRoll;
    if (data.roll?.id) {
      const dmg = rollHasDamage(data.roll) ? ` · DMG ${Number(data.roll.adjustedDamage ?? data.roll.damage)}` : "";
      pushCombatHistory({ id: `roll:${data.roll.id}`, category: data.roll.isStudy ? "study" : "roll", text: `${data.roll.label || "ROLL"} · TOTAL ${Number(data.roll.total) || 0}${rollOutcomeText(data.roll) ? ` · ${rollOutcomeText(data.roll)}` : ""}${dmg}${data.roll.targetName ? ` · VS ${data.roll.targetName}` : ""}`, actor: data.roll.senderName || "PLAYER", time: Number(data.roll.time) || Date.now() });
    }
    pushFeed({ kind: "roll", ...data.roll }); playSound(data.roll?.critical ? "critical" : "roll"); showOverlay({ kind: "roll", ...data.roll });
    if (runtime.view === "chat" || runtime.view === "roll" || (data.roll?.isStudy && runtime.inspect?.kind === "player" && runtime.partyEditTab === "hinder")) render();
  }
  if (data.type === "share") {
    pushFeed({ kind: "share", ...data.share }); playSound("message"); showOverlay({ kind: "share", ...data.share }); if (runtime.view === "chat" || runtime.view === "roll") render();
  }
  if (data.type === "clear") { runtime.feed = []; saveFeed(); render(); }
}
async function loadSceneMonsters() {
  if (PREVIEW) return;
  try {
    if (!await OBR.scene.isReady()) { runtime.sceneMonsters = []; runtime.sceneMonstersDirty = false; return; }
    const md = await OBR.scene.getMetadata();
    const loaded = Array.isArray(md[SCENE_MONSTERS_KEY]) ? md[SCENE_MONSTERS_KEY].map(normalizeMonster) : [];
    const hadPublicRules = loaded.some(m => Array.isArray(m.specialRules) && m.specialRules.length);
    runtime.sceneMonsters = rehydrateMonsterRules(loaded);
    runtime.sceneMonstersDirty = false;
    runtime.sceneCombat = normalizeSceneCombat(md[SCENE_COMBAT_KEY]);
    runtime.guardCover = normalizeGuardCover(md[SCENE_GUARD_COVER_KEY]);
    runtime.sceneTrackers = normalizeSceneTrackers(md[SCENE_TRACKERS_KEY]);
    runtime.sceneTrackersDirty = false;
    runtime.scenePlayerSheets = normalizeScenePlayerSheets(md[SCENE_PLAYER_SHEETS_KEY]);
    runtime.combatHistory = normalizeCombatHistory(md[SCENE_HISTORY_KEY]);
    runtime.sharedShop = normalizeSharedShop(md[SCENE_SHOP_KEY]);
    runtime.travel = normalizeTravelState(md[SCENE_TRAVEL_KEY]);
    runtime.travelApproval = normalizeTravelApprovalState(md[SCENE_TRAVEL_APPROVAL_KEY]);
    if(!COMPANION_FLOW&&!COMPANION_TRAVEL&&runtime.currentPlayer.role === "GM") setTimeout(()=>maybeShowTravelApprovalRequest(),0);
    if(!COMPANION_FLOW){
      const sharedCodexRaw = md[SCENE_CODEX_KEY];
      const sharedCodex = normalizeSharedCodexState(sharedCodexRaw, loadCodex());
      runtime.codex = sharedCodex.entries;
      runtime.codexFolders = sharedCodex.folders;
      runtime.codexDirty = false;
      learnCodexFromScene();
      if (!sharedCodexRaw && ((runtime.codex || []).length || (runtime.codexFolders || []).length)) scheduleCodexSave(0);
      if (hadPublicRules && runtime.currentPlayer.role === "GM") setTimeout(() => saveSceneMonsters(), 0);
    }
  } catch (e) { console.warn("load scene monsters", e); }
}
async function saveSceneMonsters() {
  if (PREVIEW || !runtime.online || runtime.currentPlayer.role !== "GM") return;
  const saveVersion = Number(runtime.sceneSaveVersion) || 0;
  try {
    if (!await OBR.scene.isReady()) return;
    runtime.sceneMonsters = runtime.sceneMonsters.map(normalizeMonster);
    stashMonsterRules(runtime.sceneMonsters);
    const publicMonsters = runtime.sceneMonsters.map(m => ({ ...deepClone(m), specialRules: [] }));
    await OBR.scene.setMetadata({ [SCENE_MONSTERS_KEY]: publicMonsters, [SCENE_COMBAT_KEY]: deepClone(runtime.sceneCombat) });
    if ((Number(runtime.sceneSaveVersion) || 0) === saveVersion) runtime.sceneMonstersDirty = false;
  } catch (e) {
    runtime.sceneMonstersDirty = true;
    console.warn("save scene monsters", e);
    notify("Could not save Scene monsters. Try shorter Details/GIF links.");
  }
}
async function saveSceneTrackers() {
  if (PREVIEW || !runtime.online) { runtime.sceneTrackersDirty = false; return; }
  const saveVersion = Number(runtime.sceneTrackerSaveVersion) || 0;
  try {
    if (!await OBR.scene.isReady()) return;
    runtime.sceneTrackers = normalizeSceneTrackers(runtime.sceneTrackers);
    await OBR.scene.setMetadata({ [SCENE_TRACKERS_KEY]: deepClone(runtime.sceneTrackers) });
    if ((Number(runtime.sceneTrackerSaveVersion) || 0) === saveVersion) runtime.sceneTrackersDirty = false;
  } catch (e) {
    runtime.sceneTrackersDirty = true;
    console.warn("save scene trackers", e);
    notify("Could not save shared Clock & Project data.");
  }
}
function scheduleTrackerSave() {
  runtime.sceneTrackersDirty = true;
  runtime.sceneTrackerSaveVersion = (Number(runtime.sceneTrackerSaveVersion) || 0) + 1;
  clearTimeout(runtime.trackerSaveTimer);
  runtime.trackerSaveTimer = setTimeout(() => { saveSceneTrackers().catch(e => console.warn("tracker save scheduled", e)); }, 20);
}
async function loadCompanionTravelSnapshot() {
  if (!COMPANION_TRAVEL || PREVIEW || runtime.travelLoading) return false;
  runtime.travelLoading = true;
  runtime.travelLoadFailed = false;
  try {
    // The Travel shortcut can open before the scene is ready. Its first metadata
    // read must retry here; opening the main window should never be required.
    for (let attempt = 0; attempt < 18; attempt++) {
      try {
        if (await OBR.scene.isReady()) {
          const md = await OBR.scene.getMetadata();
          runtime.travel = normalizeTravelState(md?.[SCENE_TRAVEL_KEY]);
          runtime.travelApproval = normalizeTravelApprovalState(md?.[SCENE_TRAVEL_APPROVAL_KEY]);
          runtime.travelLoaded = true;
          runtime.travelLoadFailed = false;
          render();
          return true;
        }
      } catch (e) { console.warn("Travel shortcut scene read", e); }
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    runtime.travelLoadFailed = true;
    render();
    // Recover without asking the player to open the main Fabula window.
    setTimeout(() => { if (runtime.online && !runtime.travelLoaded) loadCompanionTravelSnapshot().catch(console.warn); }, 3000);
    return false;
  } finally { runtime.travelLoading = false; }
}

async function initOBR() {
  if (PREVIEW) {
    const a = normalizeState({ ...defaultState("EQUINOX"), portrait: "", hp: { current: 61, max: 70 }, mp: { current: 36, max: 50 }, ip: { current: 1, max: 6 }, fp: 2, initiative: 17, statuses: { ...defaultState().statuses, slow: true }, spheres: [
      { id: "s1", name: "Meteor Core", sphereType: "Attack", detail: "2-piece: Increase attack damage by 12%." },
      { id: "s2", name: "Orbit Thread", sphereType: "Support", detail: "2-piece: Increase attack damage by 12%." },
      { id: "s3", name: "Space Seal", sphereType: "Utility", detail: "4-piece: After acting, recover 3 MP." },
      { id: "s4", name: "Starlight Lens", sphereType: "Magic", detail: "While equipped, gain Resistance to Light." }
    ], equipment: [{ name: "Astral Railgun", weaponType: "Arcane Firearm", imageUrl: "", detail: "A weapon rebuilt from broken celestial rings.", sphereIds: ["s1", "s2", "s3", "s4"] }], actions: [{ ...blankAction(), name: "Celestial Shot", category: "MELEE ATTACK", element: "light", attr1: "DEX", attr2: "INS", damageHR: 6, note: "A compact preview action." }], clocks: [{ id: "c1", name: "Escape the Station", detail: "General scene objective", segments: 6, progress: 3 }], projects: [{ id: "p1", name: "Rebuild Ophanim Ring", detail: "Long-term personal project", segments: 8, progress: 5 }] });
    const b = normalizeState({ ...defaultState("ARINZENTINE"), hp: { current: 43, max: 55 }, mp: { current: 43, max: 50 }, ip: { current: 6, max: 6 }, fp: 2, statuses: { ...defaultState().statuses, poisoned: true, weak: true } });
    runtime.currentPlayer = { id: "preview-me", name: "GM", role: "GM" }; state = a;
    runtime.party = [{ id: "p2", name: "Arin", role: "PLAYER", metadata: { [META_KEY]: b } }];
    runtime.monsterLibrary = [normalizeMonster({ ...defaultMonster("Dino"), hp: { current: 80, max: 80 }, specialRules: [{ name: "Predator Instinct", detail: "When bloodied, gains +1 damage. https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif" }] })];
    runtime.sceneMonsters = [normalizeMonster({ ...defaultMonster("Dino"), id: "m1", instanceId: "m1", baseName: "Dino", spawnIndex: 1, hp: { current: 58, max: 80 }, statuses: { ...defaultMonster().statuses, enraged: true }, revealed: false, initiative: 12 })];
    runtime.sceneCombat = { started: true, round: 2, activeKey: "player:preview-me" };
    runtime.sceneTrackers = normalizeSceneTrackers({ clocks: a.clocks, projects: a.projects });
    runtime.travel = normalizeTravelState({ activeSessionId:"preview-travel", sessions:[{ id:"preview-travel", name:"VILLAGE INVESTIGATION", frameId:"", current:{mapId:"pv-map",nodeId:"pv-a"}, discoveredMaps:["pv-map"], discoveredNodes:{"pv-map":["pv-a"]}, maps:[{id:"pv-map",name:"VILLAGE",itemId:"",nodes:[{id:"pv-a",name:"ENTRANCE",detail:"Village entrance",x:22,y:55,links:{RIGHT:{mapId:"pv-map",nodeId:"pv-b"}}},{id:"pv-b",name:"OLD SQUARE",detail:"Central square",x:62,y:48,locked:true,links:{LEFT:{mapId:"pv-map",nodeId:"pv-a"}}}]}]}] });
    runtime.sceneMonsters[0].studyTier = 10; learnCodexFromScene();
    if (PARAMS.get("inspect") === "player") { runtime.inspect = { kind: "player", id: "preview-me" }; runtime.partyEditTab = PARAMS.get("tab") || "sheet"; }
    render(); return;
  }
  OBR.onReady(async () => {
    // Mark the Owlbear connection live immediately.
    runtime.online = true;
    render();

    // v3.0.28: Companion Flow is a transient action surface, not a second copy of the
    // full Fabula window. Boot only the data required by Cost / Roll / Study / Invoke.
    // Skipping Party rendering, token-image cache, old prompts and tool listeners removes
    // the intermittent multi-second stall that made shortcuts appear to do nothing.
    if (COMPANION_FLOW) {
      try {
        const boot=await Promise.allSettled([OBR.player.getName(),OBR.player.getRole(),OBR.player.getMetadata(),OBR.party.getPlayers()]);
        const val=(i,f)=>boot[i]?.status==="fulfilled"?boot[i].value:f;
        const name=val(0,"PLAYER"),role=val(1,"PLAYER"),metadata=val(2,{})||{};
        runtime.currentPlayer={id:OBR.player.id,name,role};
        runtime.party=val(3,[])||[];
        if(metadata[META_KEY])state=normalizeState(metadata[META_KEY]);
        registerHudLocalResultBus();
        registerCompanionHudCommandBus();
        registerCompanionHudMainNavBus();
        await loadSceneMonsters();
        OBR.party.onChange(players=>{runtime.party=players||[];if(runtime.overlay?.kind==="cost-payment")renderOverlay()});
        OBR.scene.onMetadataChange(md=>{runtime.sceneMonsters=rehydrateMonsterRules(Array.isArray(md[SCENE_MONSTERS_KEY])?md[SCENE_MONSTERS_KEY].map(normalizeMonster):[]);runtime.scenePlayerSheets=normalizeScenePlayerSheets(md[SCENE_PLAYER_SHEETS_KEY]);if(runtime.overlay?.kind==="cost-payment")renderOverlay()});
        try{OBR.broadcast.onMessage(CHANNEL,e=>receiveEvent(e.data))}catch{}
        await startCompanionHudFlow(COMPANION_FLOW_COMMAND_ID,true);
        render();
      } catch(e) {
        console.error("Fabula Companion fast boot failed",e);
        render();
        setTimeout(()=>startCompanionHudFlow(COMPANION_FLOW_COMMAND_ID,true).catch(console.error),60);
      }
      return;
    }

    try {
      await applyUISize(runtime.uiSizeMode, false);
      const boot = await Promise.allSettled([OBR.player.getName(), OBR.player.getRole(), OBR.player.getMetadata(), OBR.party.getPlayers()]);
      const val=(i,fallback)=>boot[i]?.status==="fulfilled"?boot[i].value:fallback;
      const name=val(0,runtime.currentPlayer?.name||"PLAYER"), role=val(1,runtime.currentPlayer?.role||"PLAYER"), metadata=val(2,{})||{}, party=val(3,[])||[];
      if(boot.some(x=>x.status==="rejected"))console.warn("Fabula partial bootstrap",boot.filter(x=>x.status==="rejected").map(x=>x.reason));
    runtime.currentPlayer = { id: OBR.player.id, name, role };
    if (COMPANION_TRAVEL) { await loadCompanionTravelSnapshot(); render(); }
    registerHudLocalResultBus();
    if (metadata[META_KEY]) state = normalizeState(metadata[META_KEY]);
    runtime.party = party; runtime.partySig = partyRenderSignature(party);
    // v3.0.23: own-sheet commands (notably Roll Initiative) can begin as soon as
    // player metadata is available. Study/monster commands simply retry until the
    // Scene payload finishes loading below. This removes the dead-looking delay.
    if(COMPANION_FLOW)setTimeout(()=>startCompanionHudFlow(COMPANION_FLOW_COMMAND_ID,true).catch(console.error),0);
    await loadSceneMonsters();
    registerCompanionHudCommandBus();
    registerCompanionHudMainNavBus();
    if(!COMPANION_FLOW&&!COMPANION_TRAVEL)consumeCompanionHudMainNav();
    restorePendingGroupCheckPrompt();
    restorePendingTravelGroupPrompt();
    await refreshCardTokenImageCache();
    const persistedSelf = persistedSheetRecord(runtime.currentPlayer.id)?.sheet;
    if (persistedSelf && (Number(persistedSelf.updatedAt) || 0) > (Number(state.updatedAt) || 0)) {
      state = normalizeState(persistedSelf); localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      await OBR.player.setMetadata({ [META_KEY]: publicSnapshot() });
    } else schedulePersistentSheetSave(runtime.currentPlayer.id, runtime.currentPlayer.name, state);
    absorbOnlinePartySheets(runtime.party);
    runtime.sceneSig = sceneRenderSignature();
    OBR.party.onChange(players => {
      const nextSig = partyRenderSignature(players);
      runtime.party = players;
      absorbOnlinePartySheets(players);
      if (nextSig === runtime.partySig) return;
      runtime.partySig = nextSig;
      if (["scene","chat","roll","clock","travel","codex"].includes(runtime.view) || tokenActionHudActor()) { if (!renderSceneStatusIncomingUpdate()) render(); }
    });
    if (OBR.scene.items?.onChange) OBR.scene.items.onChange(() => { scheduleCardTokenImageRefresh(80); scheduleTokenActionHudSelection(null, 40); });
    OBR.tool.onToolModeChange(modeId => {
      if (String(modeId || "") !== TOKEN_FRAME_MODE_ID || runtime.dmFrameToolActive) return;
      runtime.dmFrameToolActive = true;
      if (runtime.view === "gmtools" && runtime.gmToolTab === "frame") render();
    });
    OBR.player.onChange(player => {
      scheduleTokenActionHudSelection(player);
      const frameActive = !!player.metadata?.[TOKEN_FRAME_ACTIVE_KEY];
      if (frameActive !== runtime.dmFrameToolActive) {
        runtime.dmFrameToolActive = frameActive;
        if (runtime.view === "gmtools" && runtime.gmToolTab === "frame") render();
      }
      const incoming = player.metadata?.[META_KEY]; if (!incoming) return;
      const incomingAt = Number(incoming.updatedAt) || 0, localAt = Number(state.updatedAt) || 0;
      // v1.85: rapid +/- resource clicks update the local sheet optimistically. Never let an
      // older metadata echo from a previous save bounce HP/MP/IP/FP back while a newer value exists.
      if (incomingAt && localAt && incomingAt <= localAt) return;
      if (runtime.playerSheetDirty && incomingAt <= localAt) return;
      const oldHp = state.deleted ? null : state.hp.current;
      state = normalizeState(incoming); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); schedulePersistentSheetSave(runtime.currentPlayer.id, runtime.currentPlayer.name, state);
      if (!state.deleted && oldHp !== null && state.hp.current !== oldHp) playSound(state.hp.current > oldHp ? "hpup" : "hpdown");
      if (!renderSceneStatusIncomingUpdate()) render();
    });
    OBR.scene.onMetadataChange(md => {
      const incomingMonsters = rehydrateMonsterRules(Array.isArray(md[SCENE_MONSTERS_KEY]) ? md[SCENE_MONSTERS_KEY].map(normalizeMonster) : []);
      const protectPendingMonsterWrite = runtime.currentPlayer.role === "GM" && runtime.sceneMonstersDirty;
      if (!protectPendingMonsterWrite) runtime.sceneMonsters = incomingMonsters;
      if (!protectPendingMonsterWrite) runtime.sceneCombat = normalizeSceneCombat(md[SCENE_COMBAT_KEY]);
      runtime.guardCover = normalizeGuardCover(md[SCENE_GUARD_COVER_KEY]);
      const protectPendingTrackerWrite = runtime.sceneTrackersDirty;
      if (!protectPendingTrackerWrite) runtime.sceneTrackers = normalizeSceneTrackers(md[SCENE_TRACKERS_KEY]);
      const incomingHistory = normalizeCombatHistory(md[SCENE_HISTORY_KEY]);
      runtime.combatHistory = mergeCombatHistory(runtime.combatHistory, incomingHistory);
      const incomingShop = normalizeSharedShop(md[SCENE_SHOP_KEY]);
      if ((Number(incomingShop.revision) || 0) >= (Number(runtime.sharedShop?.revision) || 0)) runtime.sharedShop = incomingShop;
      const incomingTravel = normalizeTravelState(md[SCENE_TRAVEL_KEY]);
      const incomingTravelApproval = normalizeTravelApprovalState(md[SCENE_TRAVEL_APPROVAL_KEY]);
      runtime.travelApproval = incomingTravelApproval;
      travelResolvePendingFromState(incomingTravel);
      if (!runtime.travelDirty && (Number(incomingTravel.revision)||0) >= (Number(runtime.travel?.revision)||0)) runtime.travel = incomingTravel;
      if (COMPANION_TRAVEL) { runtime.travelLoaded = true; runtime.travelLoadFailed = false; }
      if (runtime.currentPlayer.role === "GM" && !COMPANION_TRAVEL) maybeShowTravelApprovalRequest();
      const incomingSheets = normalizeScenePlayerSheets(md[SCENE_PLAYER_SHEETS_KEY]);
      for (const [id, rec] of Object.entries(runtime.scenePlayerSheets || {})) {
        if (!incomingSheets[id] || (Number(rec?.updatedAt) || 0) > (Number(incomingSheets[id]?.updatedAt) || 0)) incomingSheets[id] = rec;
      }
      runtime.scenePlayerSheets = incomingSheets;
      if (!runtime.codexDirty) {
        const incomingCodex = normalizeSharedCodexState(md[SCENE_CODEX_KEY], runtime.codex || []);
        runtime.codex = incomingCodex.entries;
        runtime.codexFolders = incomingCodex.folders;
        cacheCodex(runtime.codex);
      }
      learnCodexFromScene();
      const nextSig = sceneRenderSignature();
      if (nextSig === runtime.sceneSig) return;
      runtime.sceneSig = nextSig;
      if (["scene","monster","roll","clock","travel","codex","chat","shop","gmtools"].includes(runtime.view) || tokenActionHudActor()) { if (!renderSceneStatusIncomingUpdate()) render(); }
    });
    OBR.scene.onReadyChange(async ready => { if (ready) { if(COMPANION_TRAVEL)await loadCompanionTravelSnapshot(); await loadSceneMonsters(); await refreshCardTokenImageCache(); render(); } else { runtime.sceneMonsters = []; runtime.cardTokenImages = {}; if(COMPANION_TRAVEL){runtime.travelLoaded=false;runtime.travel=null;} render(); } });
      OBR.broadcast.onMessage(CHANNEL, e => receiveEvent(e.data));
      if (!metadata[META_KEY]) await publish();
      if (COMPANION_FLOW) await startCompanionHudFlow(COMPANION_FLOW_COMMAND_ID,true).catch(e=>console.warn("companion pending startup",e));
      // v2.163.4: Token Action HUD runs as a main-canvas popover from background.js.
      render();
    } catch (e) {
      // Keep the extension connected and usable from its local sheet even if one
      // startup sync call fails. Surface the actual problem instead of silently
      // leaving a stale PREVIEW badge. A later party/scene event can still recover.
      console.error("Fabula Owlbear startup sync failed", e);
      showToast("SYNC WARNING", "Connected to Owlbear, but some room data could not be loaded. Refresh once if Scene data looks stale.", "message");
      render();
      if(COMPANION_FLOW)setTimeout(()=>startCompanionHudFlow(COMPANION_FLOW_COMMAND_ID,true).catch(console.error),40);
    }
  });
}


function partyRenderSignature(players = runtime.party) {
  return (players || []).map(p => `${p.id}:${Number(p.metadata?.[META_KEY]?.updatedAt) || 0}:${p.metadata?.[META_KEY]?.deleted ? 1 : 0}`).sort().join("|");
}
function sceneRenderSignature() {
  return `${runtime.sceneMonsters.map(m => `${m.id}:${Number(m.updatedAt)||0}:${m.studyTier||0}:${m.initiative||0}:${m.faction||"enemy"}:${m.sceneNoTurn?1:0}`).join("|")}#${runtime.sceneCombat.started?1:0}:${runtime.sceneCombat.round}:${runtime.sceneCombat.activeKey}#GC:${Number(runtime.guardCover?.revision)||0}#${runtime.sceneTrackers.clocks.map(x=>`${x.id}:${x.name}:${x.detail}:${x.segments}:${x.progress}:${x.pinned?1:0}:${x.objective?1:0}`).join("|")}#${runtime.sceneTrackers.projects.map(x=>`${x.id}:${x.name}:${x.detail}:${x.segments}:${x.progress}:${x.pinned?1:0}`).join("|")}#${Object.entries(runtime.scenePlayerSheets||{}).map(([id,r])=>`${id}:${Number(r?.updatedAt)||Number(r?.sheet?.updatedAt)||0}:${r?.sheet?.deleted?1:0}`).sort().join("|")}#H:${runtime.combatHistory.length}:${runtime.combatHistory.at(-1)?.id||""}#S:${sharedShopSignature()}#T:${Number(runtime.travel?.revision)||0}:${runtime.travel?.activeSessionId||""}#C:${(runtime.codexFolders||[]).map(f=>`${f.id}:${f.name}:${f.order}`).join("|")}:${(runtime.codex||[]).map(e=>`${e.key}:${e.folderId||""}:${e.order||0}:${e.learnedTier||0}:${Number(e.updatedAt)||0}`).join("|")}`;
}
function visibleNav() { return runtime.navOrder.filter(v => !["monster","gmtools"].includes(v) || runtime.currentPlayer.role === "GM"); }
function tabsHTML() {
  return visibleNav().map(v => `<button type="button" class="tab ${runtime.view === v ? "active" : ""}" data-dom-key="main-nav-${v}" data-nav="${v}" data-drop-kind="nav" data-key="${v}" data-drag-kind="nav" draggable="true" title="Hold and drag this tab to reorder">${NAV_LABEL[v]}</button>`).join("");
}
function shellHTML() {
  if (COMPANION_FLOW) return `<main class="companion-flow-shell"><div class="companion-flow-wait"><span data-companion-flow-status>FABULA · COMPANION FLOW</span><div class="companion-flow-recovery"><button type="button" class="mini-btn" data-companion-flow-retry hidden>RETRY</button><button type="button" class="mini-btn" data-companion-flow-close hidden>CLOSE</button></div></div><div id="toast-host" class="toast-host"></div><div id="overlay-host" class="overlay-host"></div></main>`;
  if (COMPANION_TRAVEL) {
    if (!runtime.travelLoaded) return `<main class="companion-travel-shell player-holo"><div class="player-travel-phonebar"><div><small>TRAVEL LINK</small><b>SYNCING MAP</b></div><button type="button" data-companion-travel-close title="Close Travel Mode">×</button></div><div class="player-travel-empty">${runtime.travelLoadFailed?'TRAVEL IS TAKING LONGER THAN EXPECTED':'CONNECTING TO THE SCENE…'}${runtime.travelLoadFailed?'<br><button type="button" class="mini-btn" data-companion-travel-retry>RETRY MAP</button>':''}</div><div id="toast-host" class="toast-host"></div><div id="overlay-host" class="overlay-host"></div></main>`;
    if (runtime.currentPlayer.role !== "GM") return companionPlayerTravelOverlayHTML();
    const sessionCount=travelState()?.sessions?.length||0,sessionCollapsed=!!runtime.travelSessionsCollapsed;
    return `<main class="companion-travel-shell companion-travel-gm"><div class="companion-travel-bar"><div><small>FABULA · CANVAS TRAVEL</small><b>GM NODE CONTROL</b></div><div class="companion-travel-bar-actions">${sessionCount?`<button type="button" class="companion-travel-session-toggle ${sessionCollapsed?'collapsed':''}" data-travel-session-collapse aria-expanded="${sessionCollapsed?'false':'true'}" title="${sessionCollapsed?'Show':'Hide'} Travel Sessions">SESSIONS · ${sessionCount} ${sessionCollapsed?'▼':'▲'}</button>`:''}<button type="button" class="companion-travel-close" data-companion-travel-close title="Close Travel Overlay">×</button></div></div><section class="companion-travel-workspace">${travelHTML()}</section><div id="toast-host" class="toast-host"></div><div id="overlay-host" class="overlay-host"></div></main>`;
  }
  const connectionText = PREVIEW ? "● DEMO" : runtime.online ? "● LIVE" : "● READY";
  const connectionClass = runtime.online ? "online" : "pending";
  return `<main class="shell"><header class="topbar"><div class="brand">FABULA<small>LYNX EDITION · V3.0.50</small></div><button type="button" class="nav-scroll" data-nav-scroll="-1" aria-label="Scroll navigation left">‹</button><nav class="tabs">${tabsHTML()}</nav><button type="button" class="nav-scroll" data-nav-scroll="1" aria-label="Scroll navigation right">›</button><div class="top-actions"><span class="${connectionClass}">${connectionText}</span></div></header>${tokenPlacementBarHTML()}<section class="workspace">${viewHTML()}</section><div id="toast-host" class="toast-host"></div><div id="overlay-host" class="overlay-host"></div></main>`;
}
function viewHTML() {
  if (["monster","gmtools"].includes(runtime.view) && runtime.currentPlayer.role !== "GM") runtime.view = "scene";
  if (runtime.view === "scene") return sceneHTML();
  if (runtime.view === "clock") return clockProjectHTML();
  if (runtime.view === "travel") return travelHTML();
  if (runtime.view === "monster") return monsterLibraryHTML();
  if (runtime.view === "roll") return rollHTML();
  if (runtime.view === "codex") return codexHTML();
  if (runtime.view === "chat") return chatHTML();
  if (runtime.view === "shop") return playerShopHTML();
  if (runtime.view === "vault") return vaultHTML();
  if (runtime.view === "gmtools") return gmToolsHTML();
  if (runtime.view === "settings") return settingsHTML();
  return sceneHTML();
}
function uiContextKey() {
  const inspect = runtime.inspect ? `${runtime.inspect.kind}:${runtime.inspect.id}` : "roster";
  const sub = runtime.inspect?.kind === "player" ? runtime.partyEditTab : runtime.inspect?.kind === "monster" ? runtime.monsterTab : runtime.monsterEditId ? `lib:${runtime.monsterEditId}:${runtime.monsterTab}` : "";
  const viewSub = runtime.view === "chat" ? `chat:${runtime.chatPanel || "chat"}` : runtime.view === "gmtools" ? `gm:${runtime.gmToolTab || "broadcast"}:${runtime.gmShop?.panel || "generator"}` : "";
  return `${runtime.view}|${inspect}|${sub}|${viewSub}`;
}
function controlSignature(el) {
  if (!el || !el.matches?.("input,textarea,select")) return "";
  const attrs = [...el.attributes]
    .filter(a => a.name === "id" || a.name === "name" || a.name.startsWith("data-"))
    .map(a => `${a.name}=${a.value}`)
    .sort()
    .join("|");
  return `${el.tagName.toLowerCase()}|${el.type || ""}|${attrs}`;
}
function findControlBySignature(sig) {
  if (!sig) return null;
  return [...document.querySelectorAll("input,textarea,select")].find(el => controlSignature(el) === sig) || null;
}
function captureRenderedUI() {
  const renderedContext = runtime.lastRenderedContext || uiContextKey();
  const workspace = document.querySelector(".workspace");
  const workspaceScroll = workspace ? { top: workspace.scrollTop, left: workspace.scrollLeft } : null;
  if (workspaceScroll) runtime.uiScroll[renderedContext] = { ...workspaceScroll };
  const scrollers = [...document.querySelectorAll(".feed,.tabs,.shared-sheet-tabs")].map((el, i) => ({
    key: `${el.className}|${i}`, top: el.scrollTop, left: el.scrollLeft
  }));
  const detailStates = [...document.querySelectorAll("details[data-persist-details]")].map(el => ({ key: el.dataset.persistDetails, open: el.open }));
  const active = document.activeElement;
  let focus = null;
  if (active?.matches?.("input,textarea,select")) {
    focus = {
      context: renderedContext,
      signature: controlSignature(active),
      value: active.type === "checkbox" ? undefined : active.value,
      checked: active.type === "checkbox" ? active.checked : undefined,
      selectionStart: typeof active.selectionStart === "number" ? active.selectionStart : null,
      selectionEnd: typeof active.selectionEnd === "number" ? active.selectionEnd : null
    };
  }
  return { renderedContext, focus, scrollers, detailStates, workspaceScroll };
}
function restoreWorkspaceScrollPosition(context, position, focusSignature = "") {
  if (!position || uiContextKey() !== context || runtime.pendingSceneFocusKey) return;
  const apply = () => {
    if (uiContextKey() !== context || runtime.pendingSceneFocusKey) return;
    const workspace = document.querySelector(".workspace");
    if (!workspace) return;
    workspace.scrollTop = Math.max(0, Number(position.top) || 0);
    workspace.scrollLeft = Math.max(0, Number(position.left) || 0);
    if (focusSignature) {
      const el = findControlBySignature(focusSignature);
      if (el && document.activeElement !== el) {
        try { el.focus({ preventScroll: true }); } catch {}
      }
    }
  };
  apply();
  requestAnimationFrame(apply);
  setTimeout(apply, 0);
  setTimeout(apply, 80);
}
function restoreRenderedUI(snapshot) {
  const context = uiContextKey();
  const workspace = document.querySelector(".workspace");
  const saved = snapshot?.renderedContext === context && snapshot?.workspaceScroll ? snapshot.workspaceScroll : runtime.uiScroll[context];
  if (workspace && saved) { workspace.scrollTop = saved.top; workspace.scrollLeft = saved.left; }
  if (snapshot?.renderedContext === context) {
    for (const entry of snapshot.scrollers || []) {
      const candidates = [...document.querySelectorAll(".feed,.tabs,.shared-sheet-tabs")];
      const el = candidates.find((x, i) => `${x.className}|${i}` === entry.key);
      if (el) { el.scrollTop = entry.top; el.scrollLeft = entry.left; }
    }
    for (const d of snapshot.detailStates || []) {
      const el = [...document.querySelectorAll("details[data-persist-details]")].find(x => x.dataset.persistDetails === d.key);
      if (el) el.open = !!d.open;
    }
    const f = snapshot.focus;
    if (f?.context === context) {
      const el = findControlBySignature(f.signature);
      if (el) {
        if (el.type === "checkbox") el.checked = !!f.checked;
        else if (f.value !== undefined) el.value = f.value;
        try { el.focus({ preventScroll: true }); } catch { el.focus(); }
        if (f.selectionStart !== null && typeof el.setSelectionRange === "function") {
          const max = String(el.value ?? "").length;
          try { el.setSelectionRange(Math.min(f.selectionStart, max), Math.min(f.selectionEnd ?? f.selectionStart, max)); } catch {}
        }
      }
    }
    restoreWorkspaceScrollPosition(context, snapshot.workspaceScroll || saved, f?.context === context ? f.signature : "");
  }
}
function queueSceneFocus(key = "") { runtime.pendingSceneFocusKey = String(key || ""); }
function isBufferedEditorControl(el) {
  return !!(el?.dataset?.remoteField || el?.dataset?.remoteAffinity || el?.dataset?.remoteAction || el?.dataset?.remoteActionCheck || el?.dataset?.monsterLibField || el?.dataset?.activeMonsterField || el?.dataset?.monsterAffinity || el?.dataset?.monsterActionField || el?.dataset?.monsterActionCheck || el?.dataset?.monsterRuleField || el?.dataset?.sceneTrackerField);
}
function flushPendingDetailEdits(root) {
  if (!root?.querySelectorAll) return;
  const pending = new Set();
  const active = document.activeElement;
  if (active && root.contains(active) && isBufferedEditorControl(active)) pending.add(active);
  root.querySelectorAll("input[data-pending-save='1'], textarea[data-pending-save='1'], select[data-pending-save='1']").forEach(el => {
    if (isBufferedEditorControl(el)) pending.add(el);
  });
  for (const el of pending) {
    try { el.dispatchEvent(new Event("change", { bubbles: true })); } catch {}
    delete el.dataset.pendingSave;
  }
}

function consumePendingSceneFocus() {
  const key = String(runtime.pendingSceneFocusKey || "");
  if (!key || runtime.view !== "scene") return;
  runtime.pendingSceneFocusKey = "";
  const selector = `.scene-character-card.current-turn[data-dom-key="${CSS.escape(key.startsWith("player:") ? `scene-player:${key.slice(7)}` : key.startsWith("monster:") ? `scene-monster:${key.split(":")[1]}` : key)}"]`;
  const target = document.querySelector(selector);
  if (!target) return;
  requestAnimationFrame(() => {
    try { target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }); }
    catch { target.scrollIntoView(); }
  });
}
function domKey(node) {
  if (!node || node.nodeType !== 1) return "";
  const el = node;
  if (el.id) return `id:${el.id}`;
  const direct = el.getAttribute("data-dom-key") || el.getAttribute("data-persist-details") || el.getAttribute("data-codex-key");
  if (direct) return `${el.tagName}:${direct}`;
  for (const name of ["data-inspect-player","data-inspect-monster","data-monster-edit","data-action-index"]) {
    const v = el.getAttribute(name); if (v) return `${el.tagName}:${name}:${v}`;
  }
  return "";
}
function syncDOMAttributes(oldEl, newEl) {
  for (const a of [...oldEl.attributes]) if (!newEl.hasAttribute(a.name)) oldEl.removeAttribute(a.name);
  for (const a of [...newEl.attributes]) if (oldEl.getAttribute(a.name) !== a.value) oldEl.setAttribute(a.name, a.value);
  if (oldEl instanceof HTMLInputElement && newEl instanceof HTMLInputElement) {
    if (oldEl !== document.activeElement) oldEl.value = newEl.value;
    oldEl.checked = newEl.checked;
  } else if (oldEl instanceof HTMLTextAreaElement && newEl instanceof HTMLTextAreaElement) {
    if (oldEl !== document.activeElement) oldEl.value = newEl.value;
  } else if (oldEl instanceof HTMLSelectElement && newEl instanceof HTMLSelectElement) {
    if (oldEl.options.length !== newEl.options.length || [...oldEl.options].some((o,i) => o.value !== newEl.options[i]?.value || o.text !== newEl.options[i]?.text)) {
      const keep = oldEl === document.activeElement ? oldEl.value : newEl.value;
      oldEl.innerHTML = newEl.innerHTML; oldEl.value = keep;
    } else if (oldEl !== document.activeElement) oldEl.value = newEl.value;
  }
}
function compatibleDOM(a, b) { return !!a && !!b && a.nodeType === b.nodeType && (a.nodeType !== 1 || a.tagName === b.tagName); }
function morphDOMNode(oldNode, newNode) {
  if (!compatibleDOM(oldNode, newNode)) { oldNode.replaceWith(newNode.cloneNode(true)); return; }
  if (oldNode.nodeType === Node.TEXT_NODE || oldNode.nodeType === Node.COMMENT_NODE) {
    if (oldNode.nodeValue !== newNode.nodeValue) oldNode.nodeValue = newNode.nodeValue; return;
  }
  const oldEl = oldNode, newEl = newNode;
  syncDOMAttributes(oldEl, newEl);
  if (oldEl.tagName === "IMG") {
    if (oldEl.src !== newEl.src) oldEl.src = newEl.src;
    return;
  }
  if (["INPUT","TEXTAREA","SELECT"].includes(oldEl.tagName)) return;
  const oldChildren = [...oldEl.childNodes], newChildren = [...newEl.childNodes];
  const keyed = new Map(oldChildren.map(n => [domKey(n), n]).filter(([k]) => k));
  let cursor = oldEl.firstChild;
  for (let i = 0; i < newChildren.length; i++) {
    const wanted = newChildren[i], key = domKey(wanted);
    let current = key ? keyed.get(key) : cursor;
    if (current && current.parentNode !== oldEl) current = null;
    if (!current || !compatibleDOM(current, wanted)) {
      const clone = wanted.cloneNode(true); oldEl.insertBefore(clone, cursor); current = clone;
    } else {
      if (current !== cursor) oldEl.insertBefore(current, cursor);
      morphDOMNode(current, wanted);
    }
    cursor = current.nextSibling;
  }
  while (cursor) { const next = cursor.nextSibling; cursor.remove(); cursor = next; }
}
function patchAppHTML(nextHTML) {
  const app = document.getElementById("app");
  if (!app) return;
  if (!app.firstChild) { app.innerHTML = nextHTML; return; }
  const template = document.createElement("template"); template.innerHTML = nextHTML;
  const holder = document.createElement("div"); holder.id = "app"; holder.append(...template.content.cloneNode(true).childNodes);
  morphDOMNode(app, holder);
}
function renderFatalScreen(err) {
  const app = document.getElementById("app"); if (!app) return;
  const message = String(err?.message || err || "Unknown render error").slice(0, 320);
  app.innerHTML = `<main class="shell runtime-fatal-shell"><section class="runtime-fatal"><small>FABULA · RECOVERY MODE</small><h2>UI RENDER ERROR</h2><p>The extension caught an interface error instead of leaving a blank window.</p><code>${esc(message)}</code><div><button type="button" class="primary" onclick="location.reload()">RELOAD EXTENSION</button></div></section></main>`;
}
function renderNow() {
  try {
    const snapshot = captureRenderedUI();const navScroll=document.querySelector(".topbar .tabs")?.scrollLeft||0;
    document.documentElement.dataset.accent = "cyan";
    document.documentElement.dataset.uiTheme = runtime.uiTheme === "phantom" ? "phantom" : "default";
    syncAdaptivePopoverSize();
    const nextHTML = shellHTML();
    if (nextHTML !== runtime.lastShellHTML) {
      patchAppHTML(nextHTML);
      runtime.lastShellHTML = nextHTML;
    }
    const tabBar=document.querySelector(".topbar .tabs");if(tabBar)tabBar.scrollLeft=navScroll;
    runtime.lastRenderedContext = uiContextKey();
    renderToast(); renderOverlay(); restoreRenderedUI(snapshot); consumePendingSceneFocus(); maybeShowPendingPlayerDefeatChoice(); applySceneRosterFilterDOM();
  } catch (err) {
    console.error("Fabula render failed", err);
    runtime.lastShellHTML = "";
    renderFatalScreen(err);
  }
}
function render() {
  runtime.renderDirty = true;
  if (runtime.renderFrame) return;
  const run = () => {
    runtime.renderFrame = 0;
    if (!runtime.renderDirty) return;
    runtime.renderDirty = false;
    renderNow();
  };
  if (!document.getElementById("app")?.firstChild) run();
  else runtime.renderFrame = requestAnimationFrame(run);
}

function allParty() {
  const self = { id: runtime.currentPlayer.id, name: runtime.currentPlayer.name, role: runtime.currentPlayer.role, offline: false, metadata: { [META_KEY]: publicSnapshot() } };
  const map = new Map([[self.id, self]]);
  for (const p of runtime.party || []) {
    if (p.id === self.id) { map.set(p.id, self); continue; }
    const raw = bestPlayerSheetRaw(p.id, p.metadata?.[META_KEY]);
    map.set(p.id, { ...p, offline: false, metadata: { ...(p.metadata || {}), [META_KEY]: raw } });
  }
  for (const [id, rec] of Object.entries(runtime.scenePlayerSheets || {})) {
    if (map.has(id)) continue;
    map.set(id, { id, name: rec.ownerName || rec.sheet?.name || "PLAYER", role: "PLAYER", offline: true, metadata: { [META_KEY]: rec.sheet } });
  }
  return [...map.values()];
}
function sourceSheet(owner) {
  if (owner === runtime.currentPlayer.id) return state;
  const onlineRaw = runtime.party.find(p => p.id === owner)?.metadata?.[META_KEY];
  const raw = bestPlayerSheetRaw(owner, onlineRaw);
  return raw ? normalizeState(raw) : null;
}
function sourceParty(owner) { return allParty().find(p => p.id === owner); }
function statusChips(s) {
  const outcome = playerDefeatOutcome(s);
  const arr = activeStatuses(s);
  if (outcome) {
    const label = playerDefeatLabel(s);
    return `<div class="status-chips player-defeat-status ${outcome}"><span class="player-defeat-chip">${label}</span>${arr.map(k => `<span class="${k === "crisis" ? "crisis" : ""}">${k.toUpperCase()}</span>`).join("")}</div>`;
  }
  return arr.length ? `<div class="status-chips">${arr.map(k => `<span class="${k === "crisis" ? "crisis" : ""}">${k.toUpperCase()}</span>`).join("")}</div>` : `<div class="status-chips empty-status"><span>NORMAL</span></div>`;
}
function partyStat(label, value, cls = "") { return `<div class="party-stat ${cls}"><span>${label}</span><b>${value}</b></div>`; }
function partyResource(label, r, cls) { return `<div class="party-resource"><div><span>${label}</span><b>${r.current}/${r.max}</b></div><div class="party-track"><i class="${cls}" style="width:${pct(r.current, r.max)}%"></i></div></div>`; }
function quickAdjust(ownerType, ownerId, key, s, allow = true) {
  const val = key === "fp" ? s.fp : s[key]?.current ?? 0;
  const max = key === "fp" ? "" : `/${s[key]?.max ?? 0}`;
  if (!allow) return `<div class="quick-adjust readonly"><b>${key.toUpperCase()}</b><span>${val}${max}</span></div>`;
  return `<div class="quick-adjust"><b>${key.toUpperCase()}</b><span>${val}${max}</span><div><button data-quick-resource="${ownerType}:${ownerId}:${key}:-1">−</button><input inputmode="numeric" data-quick-input="${ownerType}:${ownerId}:${key}" placeholder="+5 / -3"><button data-quick-resource="${ownerType}:${ownerId}:${key}:1">+</button></div></div>`;
}
function initiativeCombatants() {
  const playerSide = [], enemySide = [];
  for (const p of allParty()) {
    const raw = p.metadata?.[META_KEY]; if (!raw || raw.deleted) continue;
    const sh = normalizeState(raw);
    if (isPlayerDefeated(sh)) continue;
    // v2.95: Players can remain fully visible/targetable in Scene while being excluded from the turn cycle.
    if (sh.sceneNoTurn) continue;
    playerSide.push({ key: `player:${p.id}`, kind: "player", side: "player", id: p.id, name: sh.name || p.name || "Character", initiative: Number(sh.initiative) || 0 });
  }
  for (const m of runtime.sceneMonsters) {
    if (isMonsterDefeated(m)) continue;
    // v2.94: Allies can stay visible/targetable in Scene while being excluded from the turn cycle.
    if (m.faction === "ally" && m.sceneNoTurn) continue;
    const side = m.faction === "ally" ? "player" : "enemy", v = monsterPhaseView(m, "active"), turns = monsterRankTurns(v.rank);
    for (let slot = 1; slot <= turns; slot++) {
      const entry = { key: `monster:${m.id}:turn:${slot}`, kind: "monster", side, id: m.id, slot, turns, name: turns > 1 ? `${v.name || "Monster"} · ${slot}/${turns}` : (v.name || "Monster"), initiative: Number(v.initiative) || 0 };
      (side === "player" ? playerSide : enemySide).push(entry);
    }
  }
  const sorter = (a,b) => b.initiative - a.initiative || a.name.localeCompare(b.name) || (Number(a.slot)||0) - (Number(b.slot)||0);
  playerSide.sort(sorter); enemySide.sort(sorter);
  if (!playerSide.length) return enemySide;
  if (!enemySide.length) return playerSide;
  const firstPlayer = playerSide[0], firstEnemy = enemySide[0];
  let side = firstEnemy.initiative > firstPlayer.initiative ? "enemy" : "player";
  if (firstEnemy.initiative === firstPlayer.initiative) side = [firstPlayer, firstEnemy].sort(sorter)[0].side;
  const out = [];
  while (playerSide.length || enemySide.length) {
    if (side === "player") {
      if (playerSide.length) out.push(playerSide.shift());
      else if (enemySide.length) out.push(enemySide.shift());
      side = "enemy";
    } else {
      if (enemySide.length) out.push(enemySide.shift());
      else if (playerSide.length) out.push(playerSide.shift());
      side = "player";
    }
  }
  return out;
}
async function togglePlayerTurnParticipation(id) {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can change Player turn participation");
  const sh = sourceSheet(id);
  if (!sh || sh.deleted) return notify("Player sheet is no longer available");
  if (isPlayerDefeated(sh)) return notify(`${sh.name || "Character"} is defeated and already excluded from Initiative`);

  const before = initiativeCombatants();
  const activeKey = String(runtime.sceneCombat.activeKey || "");
  const currentIndex = before.findIndex(x => x.key === activeKey);
  const wasCurrent = currentIndex >= 0 && before[currentIndex]?.kind === "player" && before[currentIndex]?.id === id;
  const nextNoTurn = !sh.sceneNoTurn;

  await sendRemoteEdit(id, { kind: "set", path: "sceneNoTurn", value: nextNoTurn });

  let combatChanged = false;
  if (runtime.sceneCombat.started && nextNoTurn && wasCurrent) {
    const after = initiativeCombatants();
    if (!after.length) {
      runtime.sceneCombat = { started: false, round: 0, activeKey: "" };
    } else {
      const valid = new Set(after.map(x => x.key));
      let nextKey = "", wrapped = false;
      for (let step = 1; step <= before.length; step++) {
        const absolute = currentIndex + step;
        const candidate = before[absolute % before.length];
        if (candidate && valid.has(candidate.key)) {
          nextKey = candidate.key;
          wrapped = absolute >= before.length;
          break;
        }
      }
      if (!nextKey) nextKey = after[0].key;
      runtime.sceneCombat = {
        started: true,
        round: Math.max(1, Number(runtime.sceneCombat.round) || 1) + (wrapped ? 1 : 0),
        activeKey: nextKey
      };
      queueSceneFocus(nextKey);
    }
    combatChanged = true;
  }

  if (combatChanged) scheduleSceneSave();
  const updated = sourceSheet(id) || { ...sh, sceneNoTurn: nextNoTurn };
  recordCombatHistory("initiative", `${updated.name || "PLAYER"} · ${nextNoTurn ? "NO TURN" : "JOINED TURN CYCLE"}`);
  showToast("PLAYER TURN", nextNoTurn ? "Excluded from Initiative / Next Turn" : "Included in Initiative / Next Turn", "message", false);
  render();
}
function toggleAllyTurnParticipation(id) {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can change Ally turn participation");
  const m = monsterById(id);
  if (!m || m.faction !== "ally") return;

  const before = initiativeCombatants();
  const activeKey = String(runtime.sceneCombat.activeKey || "");
  const currentIndex = before.findIndex(x => x.key === activeKey);
  const wasCurrent = currentIndex >= 0 && before[currentIndex]?.kind === "monster" && before[currentIndex]?.id === id;

  m.sceneNoTurn = !m.sceneNoTurn;
  m.updatedAt = Date.now();

  if (runtime.sceneCombat.started && m.sceneNoTurn && wasCurrent) {
    const after = initiativeCombatants();
    if (!after.length) {
      runtime.sceneCombat = { started: false, round: 0, activeKey: "" };
    } else {
      const valid = new Set(after.map(x => x.key));
      let nextKey = "", wrapped = false;
      for (let step = 1; step <= before.length; step++) {
        const absolute = currentIndex + step;
        const candidate = before[absolute % before.length];
        if (candidate && valid.has(candidate.key)) {
          nextKey = candidate.key;
          wrapped = absolute >= before.length;
          break;
        }
      }
      if (!nextKey) nextKey = after[0].key;
      runtime.sceneCombat = {
        started: true,
        round: Math.max(1, Number(runtime.sceneCombat.round) || 1) + (wrapped ? 1 : 0),
        activeKey: nextKey
      };
      queueSceneFocus(nextKey);
    }
  }

  scheduleSceneSave();
  recordCombatHistory("initiative", `${monsterPhaseView(m, "active").name || "ALLY"} · ${m.sceneNoTurn ? "NO TURN" : "JOINED TURN CYCLE"}`);
  showToast("ALLY TURN", m.sceneNoTurn ? "Excluded from Initiative / Next Turn" : "Included in Initiative / Next Turn", "message", false);
  render();
}
function activeTurnName() {
  const c = initiativeCombatants().find(x => x.key === runtime.sceneCombat.activeKey);
  return c?.name || "—";
}
function saveInitiativeUndoState(undo=null){
  if(PREVIEW||!OBR)return;
  Promise.resolve().then(async()=>{const md=await OBR.scene.getMetadata(),ui=md?.[SCENE_INIT_TRACKER_UI_KEY]||{};await OBR.scene.setMetadata({[SCENE_INIT_TRACKER_UI_KEY]:{...ui,undo:undo||null,undoUpdatedAt:Date.now(),undoUpdatedBy:String(runtime.currentPlayer.id||"")}})}).catch(e=>console.warn("initiative undo state",e));
}
function turnMarker(key) {
  return runtime.sceneCombat.started && runtime.sceneCombat.activeKey === key ? `<span class="turn-marker">◆ CURRENT TURN</span>` : "";
}
async function rollInitiative(kind, id, manualMod = 0) {
  let sh, name;
  if (kind === "monster") {
    if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can roll monster initiative");
    const raw = monsterById(id); sh = raw ? monsterPhaseView(raw, "active") : null; name = sh?.name;
  } else {
    sh = sourceSheet(id); name = sh?.name || sourceParty(id)?.name;
    if (isPlayerDefeated(sh)) return notify(`${name || "Character"} is at 0 HP and cannot roll Initiative`);
  }
  if (!sh) return;
  const size1 = currentDie(sh, "DEX"), size2 = currentDie(sh, "INS");
  const rankBonus = kind === "monster" ? monsterRankInitiativeBonus(sh.rank) : 0;
  const mod = (Number(manualMod) || 0) + rankBonus;
  const d1 = 1 + Math.floor(Math.random() * size1), d2 = 1 + Math.floor(Math.random() * size2), total = d1 + d2 + mod;
  if (kind === "monster") { updateMonster("active", id, m => { monsterPhaseTarget(m, "active").initiative = total; }); render(); }
  else await sendRemoteEdit(id, { kind: "set", path: "initiative", value: total });
  const initiativeGif = kind === "player" ? String(sh.initiativeGif || "").trim() : "";
  const r = { id: uid(), senderId: runtime.currentPlayer.id, senderName: runtime.currentPlayer.name, label: `${name || "Character"} · INITIATIVE`, rollStyle: "check", attr1: "DEX", attr2: "INS", size1, size2, d1, d2, mod, manualMod: Number(manualMod)||0, total, hr: null, damage: NaN, critical: d1 === d2 && d1 >= 6, fumble: d1 === 1 && d2 === 1, double: d1 === d2 && d1 !== 1 && d1 < 6, element: "none", gif: initiativeGif, media: initiativeGif, detail: `Initiative Check · DEX + INS${Number(manualMod)?` ${Number(manualMod)>0?"+":""}${Number(manualMod)} MOD`:""}${rankBonus ? ` + RANK ${rankBonus}` : ""}`, time: Date.now() };
  runtime.lastRoll = r; recordCombatHistory("initiative", `${r.label} · ${r.total}${rollOutcomeText(r) ? ` · ${rollOutcomeText(r)}` : ""}`, `roll:${r.id}`); pushFeed({ kind: "roll", ...r }); broadcast("roll", r); playSound(r.critical ? "critical" : "roll"); showOverlay({ kind: "roll", ...r });
}
function startInitiativeCycle() {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can control the turn cycle");
  const list = initiativeCombatants(); if (!list.length) return;
  saveInitiativeUndoState(null); runtime.sceneCombat = { started: true, round: 1, activeKey: list[0].key }; queueSceneFocus(list[0].key); scheduleSceneSave(); recordCombatHistory("initiative", `COMBAT START · ROUND 1 · ${list[0].name}`); render();
}
function nextInitiativeTurn() {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can control the turn cycle");
  const list = initiativeCombatants(); if (!list.length) return;
  if (!runtime.sceneCombat.started) return startInitiativeCycle();
  let i = list.findIndex(x => x.key === runtime.sceneCombat.activeKey);
  if (i < 0) i = -1;
  const next = (i + 1) % list.length;
  const round = next === 0 ? Math.max(1, runtime.sceneCombat.round) + 1 : Math.max(1, runtime.sceneCombat.round);
  const previous={round:Math.max(1,Number(runtime.sceneCombat.round)||1),activeKey:String(runtime.sceneCombat.activeKey||""),expectedRound:round,expectedActiveKey:list[next].key};
  saveInitiativeUndoState(previous); runtime.sceneCombat = { started: true, round, activeKey: list[next].key }; queueSceneFocus(list[next].key); scheduleSceneSave(); recordCombatHistory("initiative", `ROUND ${round} · TURN ${list[next].name}`); render();
}
function resetInitiativeCycle() {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can control the turn cycle");
  saveInitiativeUndoState(null); runtime.sceneCombat = { started: false, round: 0, activeKey: "" }; scheduleSceneSave(); recordCombatHistory("initiative", "COMBAT / INITIATIVE RESET"); render();
}

function sceneResourceEditor(ownerType, ownerId, key, label, current, max = null, allow = true, cls = "") {
  const value = Math.max(0, Number(current) || 0), cap = max === null ? null : Math.max(0, Number(max) || 0);
  if (!allow) return `<div class="scene-v262-resource readonly ${cls}"><span>${esc(label)}</span><b>${value}${cap === null ? "" : ` / ${cap}`}</b></div>`;
  return `<div class="scene-v262-resource ${cls}"><div class="scene-v262-resource-head"><span>${esc(label)}</span><small>${cap === null ? "CURRENT" : `MAX ${cap}`}</small></div><div class="scene-v262-resource-input"><button type="button" data-quick-resource="${ownerType}:${esc(ownerId)}:${key}:-1">−</button><input inputmode="numeric" data-quick-input="${ownerType}:${esc(ownerId)}:${key}" value="${value}" aria-label="${esc(label)} current"><span>${cap === null ? "" : `/ ${cap}`}</span><button type="button" data-quick-resource="${ownerType}:${esc(ownerId)}:${key}:1">+</button></div><div class="scene-v262-track"><i class="${cls}" style="width:${cap === null ? 100 : pct(value, cap)}%"></i></div></div>`;
}
function sceneDefenseBox(label, value, masked = false, cls = "") {
  return `<div class="scene-v262-defense ${cls} ${masked ? "masked" : ""}"><span>${esc(label)}</span><b>${masked ? "???" : value}</b></div>`;
}
function sceneRosterMeta(side, name, crisis = false) {
  return `data-scene-side="${esc(side)}" data-scene-name="${esc(String(name || "").toLowerCase())}" data-scene-crisis="${crisis ? "1" : "0"}"`;
}
function sceneDebuffCount(s) { return STATUS_NAMES.filter(k => !!s?.statuses?.[k]).length; }
function sceneStatusTabHTML(kind, id, s, opts = {}) {
  const count = sceneDebuffCount(s), crisis = !!opts.crisis, defeated = !!opts.defeated;
  const label = defeated ? String(opts.defeatLabel || "DEFEATED") : crisis ? "CRISIS" : "";
  const cls = defeated ? "defeated" : crisis ? "crisis" : count ? "active" : "normal";
  const data = kind === "player" ? `data-scene-status-player="${esc(id)}"` : `data-scene-status-monster="${esc(id)}"`;
  return `<div class="scene-v263-status-line"><button type="button" class="scene-v263-status-tab ${cls}" ${data}><span>STATUS</span><b>${count}</b><small>${count === 1 ? "EFFECT" : "EFFECTS"}</small></button>${label ? `<span class="scene-v263-special ${cls}">${esc(label)}</span>` : ""}</div>`;
}
function sceneMonsterReadonlyStatusHTML(m, tier) {
  const base = monsterStatusHTML(m, "active", true);
  if (tier < 10) return `${base}<div class="scene-v263-study-lock">TEMP MODIFIERS · STUDY 10+ REQUIRED</div>`;
  return `${base}<div class="buff-grid scene-v263-readonly-buffs">${ATTRS.map(k => `<div class="buff-box"><b>${k} TEMP</b><span>${Number(m.attributeBuffs?.[k]) || 0}</span></div>`).join("")}</div>`;
}
function sceneStatusPanelViewData() {
  const x = runtime.sceneStatusPanel;
  if (!x || runtime.view !== "scene" || runtime.inspect) return null;
  let title = "", subtitle = "", portrait = "", side = "player", attributes = "", statuses = "";
  if (x.kind === "player") {
    const p = sourceParty(x.id), raw = p?.metadata?.[META_KEY];
    if (!raw || raw.deleted) return null;
    const sh = normalizeState(raw);
    title = sh.name || p.name || "CHARACTER"; subtitle = `${sh.identity || p.name || "PLAYER"} · LV ${sh.level}`; portrait = sh.portrait || ""; side = "player";
    attributes = attributesHTML(sh, x.id); statuses = statusHTML(sh, x.id);
  } else if (x.kind === "monster") {
    const m = monsterById(x.id); if (!m) return null;
    const gm = runtime.currentPlayer.role === "GM", tier = monsterTier(m), v = monsterPhaseView(m, "active");
    title = v.name || m.name || "MONSTER"; subtitle = `${villainTypeLabel(m.villainType)} · STUDY ${STUDY_LABELS[tier]}`; portrait = monsterDisplayArt(m, "active"); side = m.faction === "ally" ? "ally" : "enemy";
    attributes = gm ? monsterAttributesHTML(m, "active") : tier >= 10 ? monsterAttributesHTML(m, "active", true) : `<div class="scene-v263-study-lock">BASE ATTRIBUTES · STUDY 10+ REQUIRED</div>`;
    statuses = gm ? monsterStatusHTML(m, "active") : sceneMonsterReadonlyStatusHTML(m, tier);
  } else return null;
  return { title, subtitle, portrait, side, kind: x.kind, attributes, statuses };
}
function sceneStatusPanelContentHTML(view = sceneStatusPanelViewData()) {
  if (!view) return "";
  return `<article class="hud-card scene-v263-status-card" data-dom-key="scene-status-attributes"><div class="card-title">BASE ATTRIBUTES</div><div class="card-body">${view.attributes}</div></article><article class="hud-card scene-v263-status-card" data-dom-key="scene-status-modifiers"><div class="card-title">STATUS & TEMP MODIFIERS</div><div class="card-body">${view.statuses}</div></article>`;
}
function sceneStatusPanelMatchesOwner(owner) {
  const x = runtime.sceneStatusPanel;
  return !!x && x.kind === "player" && String(x.id) === String(owner) && runtime.view === "scene" && !runtime.inspect;
}
function sceneStatusPanelIsInteracting() { return Date.now() < Number(runtime.sceneStatusInteractionUntil || 0); }
function refreshSceneStatusPanelContent() {
  if (!runtime.sceneStatusPanel || runtime.view !== "scene" || runtime.inspect) return false;
  const host = document.querySelector(".scene-v263-status-content");
  const view = sceneStatusPanelViewData();
  if (!host || !view) return false;
  host.innerHTML = sceneStatusPanelContentHTML(view);
  const title = document.querySelector(".scene-v263-status-panel header h3"); if (title) title.textContent = view.title;
  const subtitle = document.querySelector(".scene-v263-status-panel header p"); if (subtitle) subtitle.textContent = view.subtitle;
  return true;
}
function holdSceneStatusInteraction(ms = 260) {
  const wait = Math.max(120, Number(ms) || 260);
  runtime.sceneStatusInteractionUntil = Date.now() + wait;
  clearTimeout(runtime.sceneStatusRenderTimer);
  runtime.sceneStatusRenderTimer = setTimeout(() => {
    runtime.sceneStatusRenderTimer = null;
    runtime.sceneStatusInteractionUntil = 0;
    if (runtime.view === "scene" && runtime.sceneStatusPanel && !runtime.inspect) render();
  }, wait + 24);
}
function renderSceneStatusEdit(owner) {
  if (!sceneStatusPanelMatchesOwner(owner)) { render(); return; }
  holdSceneStatusInteraction();
  if (!refreshSceneStatusPanelContent()) render();
}
function renderSceneStatusIncomingUpdate() {
  if (runtime.view === "scene" && runtime.sceneStatusPanel && sceneStatusPanelIsInteracting()) {
    holdSceneStatusInteraction();
    refreshSceneStatusPanelContent();
    return true;
  }
  return false;
}
function sceneStatusPanelHTML() {
  const view = sceneStatusPanelViewData();
  if (!view) return "";
  return `<div class="scene-v263-status-overlay" data-dom-key="scene-status-overlay"><button type="button" class="scene-v263-status-backdrop" data-scene-status-close aria-label="Close status panel"></button><section class="scene-v263-status-panel" data-dom-key="scene-status-panel"><header data-dom-key="scene-status-header"><div class="scene-v263-status-panel-portrait ${esc(view.side)}">${view.portrait ? `<img class="${view.kind === "monster" ? "monster-full-art" : ""}" src="${esc(view.portrait)}">` : `<span>${esc(String(view.title).slice(0,2).toUpperCase())}</span>`}</div><div><small>SCENE STATUS INSPECTOR</small><h3>${esc(view.title)}</h3><p>${esc(view.subtitle)}</p></div><button type="button" class="scene-v263-status-close" data-scene-status-close>×</button></header><div class="scene-v263-status-content" data-dom-key="scene-status-content">${sceneStatusPanelContentHTML(view)}</div></section></div>`;
}
function playerSceneCard(p) {
  const raw = p?.metadata?.[META_KEY]; if (!raw || raw.deleted) return "";
  const s = normalizeState(raw), key = `player:${p.id}`, defeated = isPlayerDefeated(s), outcome = playerDefeatOutcome(s), defeatLabel = playerDefeatLabel(s);
  const noTurn = !defeated && !!s.sceneNoTurn;
  const active = !defeated && !noTurn && runtime.sceneCombat.started && runtime.sceneCombat.activeKey === key;
  const isSelf = runtime.currentPlayer.role !== "GM" && p.id === runtime.currentPlayer.id;
  const gm = runtime.currentPlayer.role === "GM";
  const crisis = isCrisis(s);
  const restoreButton = defeated && gm ? `<button class="scene-v262-btn restore" data-restore-player="${esc(p.id)}">RESTORE</button>` : "";
  const initiativeControl = defeated
    ? `<span class="player-defeat-marker ${esc(outcome)}">${esc(defeatLabel)}</span>${restoreButton}`
    : noTurn
      ? `<span class="scene-v262-no-turn-badge">◇ NO TURN</span>`
      : `<span class="scene-v262-init-value">INIT <b>${Number(s.initiative) || 0}</b></span><button class="scene-v262-btn roll" data-roll-initiative="player:${esc(p.id)}">ROLL INIT <small>DEX + INS</small></button>`;
  const defInfo = playerDefenseInfo(s, "defense"), mdefInfo = playerDefenseInfo(s, "magicDefense");
  const statusTab = sceneStatusTabHTML("player", p.id, s, { crisis, defeated, defeatLabel });
  return `<article class="scene-character-card scene-roster-card-v262 scene-card-clickable player-card ${active ? "current-turn" : ""} ${isSelf ? "own-character" : ""} ${defeated ? `player-defeated ${esc(outcome)}` : ""} ${noTurn ? "scene-no-turn" : ""}" data-dom-key="scene-player:${esc(p.id)}" data-scene-open-player="${esc(p.id)}" ${sceneRosterMeta("friendly", s.name || p.name, crisis || defeated)}><div class="scene-v262-card-accent player"></div><div class="scene-v262-card-grid"><div class="scene-v262-portrait-wrap">${s.portrait ? `<img class="scene-v262-portrait" src="${esc(s.portrait)}">` : `<div class="scene-v262-portrait empty">PC</div>`}<span class="scene-v262-side player">PLAYER</span></div><div class="scene-v262-identity"><div class="scene-v262-name-row"><div><strong>${esc(s.name || p.name)}</strong><small>${esc(s.identity || p.name)} · LV ${s.level}${p.offline ? " · OFFLINE SHEET" : ""}</small></div>${active ? `<span class="turn-marker">◆ CURRENT TURN</span>` : isSelf ? `<span class="own-character-marker">★ YOUR CHARACTER</span>` : ""}</div>${statusTab}<div class="scene-v262-init-row">${initiativeControl}${gm && !defeated ? `<button class="scene-v262-btn no-turn ${noTurn ? "active" : ""}" data-player-no-turn="${esc(p.id)}">${noTurn ? "JOIN TURN" : "NO TURN"}<small>${noTurn ? "COUNT IN INIT" : "IGNORE INIT"}</small></button>` : ""}<button class="scene-v262-btn spawn" data-party-spawn-token="${esc(p.id)}">SPAWN TOKEN</button></div><div class="scene-v262-defense-row">${sceneDefenseBox("DEF", playerDefenseDisplay(s, "defense"), false, defInfo.delta < 0 ? "down" : defInfo.delta > 0 ? "up" : "")}${sceneDefenseBox("M.DEF", playerDefenseDisplay(s, "magicDefense"), false, mdefInfo.delta < 0 ? "down" : mdefInfo.delta > 0 ? "up" : "")}</div></div><div class="scene-v262-resources">${sceneResourceEditor("player", p.id, "hp", "HP", s.hp.current, s.hp.max, true, "hp")}${sceneResourceEditor("player", p.id, "mp", "MP", s.mp.current, s.mp.max, true, "mp")}${sceneResourceEditor("player", p.id, "ip", "IP", s.ip.current, s.ip.max, true, "ip")}${sceneResourceEditor("player", p.id, "fp", "FP", s.fp, null, true, "fp")}</div></div></article>`;
}
function maskedResource(label, r, cls, visible) {
  return visible ? partyResource(label, r, cls) : `<div class="party-resource masked"><div><span>${label}</span><b>???</b></div><div class="party-track"><i style="width:0"></i></div></div>`;
}
function maskedStat(label, value, visible) { return partyStat(label, visible ? value : "???", visible ? "" : "masked"); }
function normalizedStudyTier(value) { const t = Number(value) || 0; return t >= 13 ? 13 : t >= 10 ? 10 : t >= 7 ? 7 : 0; }
function monsterTier(m, phaseIndex = null) {
  if (!m) return 0;
  const idx = phaseIndex === null ? clamp(Number(m.activePhase) || 0, 0, Array.isArray(m.phases) ? m.phases.length : 0) : clamp(Number(phaseIndex) || 0, 0, Array.isArray(m.phases) ? m.phases.length : 0);
  if (idx > 0 && Array.isArray(m.phases)) return normalizedStudyTier(m.phases[idx - 1]?.studyTier);
  return normalizedStudyTier(m.studyTier);
}
function monsterMaxStudyTier(m) {
  return Math.max(monsterTier(m, 0), ...(Array.isArray(m?.phases) ? m.phases.map((_, i) => monsterTier(m, i + 1)) : [0]));
}
function setMonsterStudyTierForPhase(m, tier, phaseIndex = null) {
  if (!m) return;
  const t = normalizedStudyTier(tier);
  const idx = phaseIndex === null ? clamp(Number(m.activePhase) || 0, 0, Array.isArray(m.phases) ? m.phases.length : 0) : clamp(Number(phaseIndex) || 0, 0, Array.isArray(m.phases) ? m.phases.length : 0);
  if (idx > 0 && m.phases?.[idx - 1]) m.phases[idx - 1].studyTier = t;
  else m.studyTier = t;
}
function studyAtLeast(m, tier) { return monsterTier(m) >= tier; }
function maskedMaxResource(label, r, cls, visible) {
  return visible ? `<div class="party-resource"><div><span>${label}</span><b>MAX ${r.max}</b></div><div class="party-track"><i class="${cls}" style="width:100%"></i></div></div>` : `<div class="party-resource masked"><div><span>${label}</span><b>???</b></div><div class="party-track"><i style="width:0"></i></div></div>`;
}
function monsterQuickPanelHTML(m) {
  if (runtime.currentPlayer.role !== "GM") return "";
  const v = monsterPhaseView(m, "active");
  const tier = monsterTier(m);
  const targeted = sameId(runtime.hinderTargetId, m.id);
  const statuses = STATUS_NAMES.map(k => `<button class="quick-status ${m.statuses?.[k] ? "on" : ""} ${m.statusImmunities?.[k] ? "immune" : ""}" data-quick-monster-status="${esc(m.id)}:${k}" title="${m.statusImmunities?.[k] ? `${k.toUpperCase()} IMMUNE` : ""}">${k.toUpperCase()}${m.statusImmunities?.[k] ? " ⛨" : ""}</button>`).join("");
  const study = [0,7,10,13].map(t => `<button class="quick-study ${tier === t ? "on" : ""}" data-quick-monster-study="${esc(m.id)}:${t}">${t === 0 ? "LOCK" : `${t}+`}</button>`).join("");
  const phaseButtons = [0, ...m.phases.map((_, i) => i + 1)].map(i => `<button class="quick-phase ${monsterPhaseIndex(m, "active") === i ? "on" : ""}" data-quick-monster-phase="${esc(m.id)}:${i}">${esc(monsterPhaseLabel(m, i))}</button>`).join("");
  const phaseIndex = monsterPhaseIndex(m, "active"), hasNextPhase = phaseIndex < m.phases.length, defeated = isMonsterDefeated(m);
  return `<details class="monster-quick-panel" data-persist-details="monster-quick:${esc(m.id)}"><summary><b>GM QUICK CONTROL</b><span>${esc(monsterPhaseLabel(m, phaseIndex))} · ${defeated ? "DEFEATED · " : ""}${targeted ? "TARGETED · " : ""}STUDY ${STUDY_LABELS[tier]} · ${monsterRankTurns(v.rank)} TURN${monsterRankTurns(v.rank) === 1 ? "" : "S"} · HUD ${m.showHud === false ? "OFF" : "ON"}</span></summary><div class="monster-quick-body">${m.phases.length ? `<div class="monster-quick-phases"><b>PHASE</b>${phaseButtons}</div>` : ""}<div class="monster-quick-statuses">${statuses}</div><div class="monster-quick-study"><b>STUDY</b>${study}</div><div class="monster-quick-actions">${hasNextPhase ? `<button class="phase-next-btn" data-next-monster-phase="${esc(m.id)}">NEXT PHASE ›</button>` : ""}${defeated ? `<button class="restore-monster-btn" data-restore-monster="${esc(m.id)}">RESTORE</button>` : `<button class="primary ${targeted ? "active" : ""}" data-quick-monster-target="${esc(m.id)}">${targeted ? "TARGETED" : "TARGET"}</button>`}<button class="mini-btn" data-quick-monster-hud="${esc(m.id)}">${m.showHud === false ? "SHOW HUD" : "HIDE HUD"}</button>${defeated ? "" : `<button class="danger-soft" data-quick-monster-kill="${esc(m.id)}">KILL · HP 0</button>`}<button class="danger-btn" data-monster-remove-scene="${esc(m.id)}">REMOVE</button></div></div></details>`;
}
function monsterSceneCard(m) {
  const gm = runtime.currentPlayer.role === "GM";
  const v = monsterPhaseView(m, "active"), defeated = isMonsterDefeated(m);
  const tier = monsterTier(m), canOpen = gm || tier >= 7;
  const rankText = gm || tier >= 7 ? (v.rank || "—") : "???";
  const speciesText = gm || tier >= 7 ? (v.species || "—") : "???";
  const key = `monster:${m.id}`, active = !defeated && runtime.sceneCombat.started && (runtime.sceneCombat.activeKey === key || runtime.sceneCombat.activeKey.startsWith(`${key}:turn:`));
  const activeSlot = active ? Number(String(runtime.sceneCombat.activeKey).split(":turn:")[1]) || 1 : 0;
  const activeTurns = monsterRankTurns(v.rank), statsVisible = gm || tier >= 10;
  const faction = m.faction === "ally" ? "ally" : "enemy", side = faction === "ally" ? "friendly" : "enemy", factionLabel = faction === "ally" ? "ALLY" : "ENEMY";
  const noTurn = faction === "ally" && !!m.sceneNoTurn;
  const phaseIndex = monsterPhaseIndex(m, "active"), phaseMark = phaseIndex ? ` · ${monsterPhaseLabel(m, phaseIndex)}` : "", hasNextPhase = phaseIndex < m.phases.length;
  const crisis = !defeated && isCrisis(m);
  let resources = "";
  if (gm) {
    resources = sceneResourceEditor("monster", m.id, "hp", "HP", m.hp.current, m.hp.max, true, "hp") + sceneResourceEditor("monster", m.id, "mp", "MP", m.mp.current, m.mp.max, true, "mp") + sceneResourceEditor("monster", m.id, "ip", "IP", m.ip?.current || 0, m.ip?.max || 0, true, "ip") + sceneResourceEditor("monster", m.id, "fp", "FP", Number(m.fp) || 0, null, true, "fp") + (m.up?.max > 0 ? sceneResourceEditor("monster", m.id, "up", "UP", m.up.current, m.up.max, true, "up") : "");
  } else if (tier >= 7) {
    resources = sceneResourceEditor("monster", m.id, "hp", "HP", m.hp.current, m.hp.max, false, "hp") + sceneResourceEditor("monster", m.id, "mp", "MP", m.mp.current, m.mp.max, false, "mp");
  } else {
    resources = `<div class="scene-v262-hidden-resources">HP / MP · ???</div>`;
  }
  const statusTab = sceneStatusTabHTML("monster", m.id, m, { crisis, defeated, defeatLabel: "DEFEATED" });
  const initiativeControl = gm ? (defeated ? `<span class="defeated-marker">DEFEATED</span><button class="scene-v262-btn restore" data-restore-monster="${esc(m.id)}">RESTORE</button>` : noTurn ? `<span class="scene-v262-no-turn-badge">◇ NO TURN</span>` : `<span class="scene-v262-init-value">INIT <b>${Number(v.initiative) || 0}</b></span><button class="scene-v262-btn roll" data-roll-initiative="monster:${esc(m.id)}">ROLL INIT <small>DEX + INS + RANK</small></button>`) : noTurn ? `<span class="scene-v262-no-turn-badge">◇ NO TURN</span>` : `<span class="scene-v262-init-value">INIT <b>???</b></span>`;
  return `<article class="scene-character-card scene-roster-card-v262 monster-card ${canOpen ? "scene-card-clickable" : "scene-card-locked"} ${faction}-monster ${tier >= 7 ? "revealed" : "hidden-sheet"} ${active ? "current-turn" : ""} ${defeated ? "defeated" : ""} ${noTurn ? "scene-no-turn" : ""}" data-dom-key="scene-monster:${esc(m.id)}" ${canOpen ? `data-scene-open-monster="${esc(m.id)}"` : ""} ${sceneRosterMeta(side, v.name, crisis || defeated)}><div class="scene-v262-card-accent ${faction}"></div><div class="scene-v262-card-grid"><div class="scene-v262-portrait-wrap">${monsterDisplayArt(m,"active") ? `<img class="scene-v262-portrait monster-full-art" src="${esc(monsterDisplayArt(m,"active"))}">` : `<div class="scene-v262-portrait empty">M</div>`}<span class="scene-v262-side ${faction}">${factionLabel}</span></div><div class="scene-v262-identity"><div class="scene-v262-name-row"><div><strong>${esc(v.name)}</strong><small>RANK ${esc(rankText)} · SPECIES ${esc(speciesText)}${esc(phaseMark)}</small></div>${active ? `<span class="turn-marker">◆ CURRENT TURN${activeTurns > 1 ? ` · ${activeSlot}/${activeTurns}` : ""}</span>` : ""}</div>${statusTab}<div class="scene-v262-init-row">${initiativeControl}${gm && faction === "ally" && !defeated ? `<button class="scene-v262-btn no-turn ${noTurn ? "active" : ""}" data-ally-no-turn="${esc(m.id)}">${noTurn ? "JOIN TURN" : "NO TURN"}<small>${noTurn ? "COUNT IN INIT" : "IGNORE INIT"}</small></button>` : ""}${gm ? `<button class="scene-v262-btn spawn" data-active-monster-spawn-token="${esc(m.id)}">SPAWN TOKEN</button>` : ""}${gm && hasNextPhase && !defeated ? `<button class="scene-v262-btn phase" data-next-monster-phase="${esc(m.id)}">NEXT PHASE</button>` : ""}</div><div class="scene-v262-defense-row">${sceneDefenseBox("DEF", statsVisible ? defenseDisplay(v, "defense") : "???", !statsVisible)}${sceneDefenseBox("M.DEF", statsVisible ? defenseDisplay(v, "magicDefense") : "???", !statsVisible)}</div></div><div class="scene-v262-resources ${m.up?.max > 0 && gm ? "has-up" : ""}">${resources}</div>${(!canOpen || gm) ? `<div class="scene-v262-actions">${!canOpen ? `<span class="scene-v262-locked">SHEET LOCKED</span>` : ""}${gm ? `<button class="scene-v262-btn danger" data-monster-remove-scene="${esc(m.id)}">REMOVE</button>` : ""}</div>` : ""}</div>${gm ? monsterQuickPanelHTML(m) : ""}</article>`;
}
function sceneCurrentTurnInfo() {
  const entry = initiativeCombatants().find(x => x.key === runtime.sceneCombat.activeKey);
  if (!entry) return { name: "—", meta: "TURN CYCLE NOT STARTED", portrait: "", initials: "—", side: "none", kind: "none" };
  if (entry.kind === "player") {
    const p = sourceParty(entry.id), s = sourceSheet(entry.id);
    return { name: s?.name || p?.name || entry.name, meta: `PLAYER · INIT ${Number(entry.initiative) || 0}`, portrait: s?.portrait || "", initials: String(s?.name || p?.name || "P").slice(0,2).toUpperCase(), side: "player", kind: "player" };
  }
  const m = monsterById(entry.id), v = m ? monsterPhaseView(m, "active") : null, ally = m?.faction === "ally";
  const showInit = runtime.currentPlayer.role === "GM";
  return { name: v?.name || entry.name, meta: `${ally ? "ALLY" : "ENEMY"} · INIT ${showInit ? (Number(entry.initiative) || 0) : "???"}${entry.turns > 1 ? ` · TURN ${entry.slot}/${entry.turns}` : ""}`, portrait: monsterDisplayArt(m, "active"), initials: String(v?.name || "M").slice(0,2).toUpperCase(), side: ally ? "ally" : "enemy", kind: "monster" };
}
function sceneInitiativeStripHTML() {
  const gm = runtime.currentPlayer.role === "GM";
  const list = initiativeCombatants();
  if (!list.length) return `<div class="scene-v262-init-empty">NO ACTIVE COMBATANTS</div>`;
  return list.map(c => {
    let label = c.name, role = c.kind === "player" ? "PLAYER" : "ENEMY", side = c.side === "player" ? "friendly" : "enemy", init = c.initiative, domKey = c.kind === "player" ? `scene-player:${c.id}` : `scene-monster:${c.id}`, portrait = "";
    if (c.kind === "monster") {
      const m = monsterById(c.id), v = m ? monsterPhaseView(m, "active") : null; role = m?.faction === "ally" ? "ALLY" : "ENEMY"; portrait = monsterDisplayArt(m, "active");
      if (!gm) init = "???";
    } else {
      portrait = sourceSheet(c.id)?.portrait || "";
    }
    const avatar = portrait ? `<img class="${c.kind === "monster" ? "monster-full-art" : ""}" src="${esc(portrait)}" alt="">` : esc(String(label || "?").slice(0,2).toUpperCase());
    return `<button type="button" class="scene-v262-init-chip ${side} ${runtime.sceneCombat.started && runtime.sceneCombat.activeKey === c.key ? "current" : ""}" data-scene-focus-card="${esc(domKey)}"><span class="scene-v262-init-avatar ${c.kind === "monster" ? "monster-avatar" : ""}">${avatar}</span><span><small>${esc(role)}</small><b>${esc(label)}</b></span><strong>${esc(init)}</strong></button>`;
  }).join("");
}
function applySceneRosterFilterDOM() {
  if (runtime.view !== "scene" || runtime.inspect) return;
  const filter = String(runtime.sceneRosterFilter || "all"), q = String(runtime.sceneRosterSearch || "").trim().toLowerCase();
  document.querySelectorAll(".scene-roster-card-v262").forEach(card => {
    const side = card.dataset.sceneSide || "", crisis = card.dataset.sceneCrisis === "1", name = card.dataset.sceneName || "";
    const passFilter = filter === "all" || filter === side || (filter === "crisis" && crisis);
    card.hidden = !(passFilter && (!q || name.includes(q)));
  });
  for (const side of ["friendly","enemy"]) {
    const host = document.querySelector(`[data-scene-visible-count="${side}"]`);
    if (host) host.textContent = String([...document.querySelectorAll(`.scene-roster-card-v262[data-scene-side="${side}"]`)].filter(x => !x.hidden).length);
  }
}
function sceneHTML() {
  if (runtime.inspect?.kind === "player") {
    const p = sourceParty(runtime.inspect.id), raw = p?.metadata?.[META_KEY];
    if (!raw || raw.deleted) { runtime.inspect = null; return sceneHTML(); }
    return `<div class="view active"><div class="party-full">${playerEditorHTML(p, normalizeState(raw))}</div></div>`;
  }
  if (runtime.inspect?.kind === "monster") {
    const m = monsterById(runtime.inspect.id);
    if (!m) { runtime.inspect = null; return sceneHTML(); }
    if (runtime.currentPlayer.role !== "GM" && monsterTier(m) < 7) { runtime.inspect = null; return sceneHTML(); }
    return `<div class="view active"><div class="party-full">${monsterInstanceEditorHTML(m)}</div></div>`;
  }
  const party = allParty().filter(p => { const raw = p.metadata?.[META_KEY]; return raw && !raw.deleted; });
  const allies = runtime.sceneMonsters.filter(m => m.faction === "ally");
  const enemies = runtime.sceneMonsters.filter(m => m.faction !== "ally");
  const activeKey = String(runtime.sceneCombat.activeKey || "");
  const activeEntityId = activeKey.startsWith("player:") ? activeKey.slice(7) : activeKey.startsWith("monster:") ? activeKey.split(":")[1] : "";
  const sortPlayers = [...party].sort((a,b) => {
    const aa = a.id === activeEntityId ? 1 : 0, bb = b.id === activeEntityId ? 1 : 0; if (aa !== bb) return bb-aa;
    const sa = normalizeState(a.metadata[META_KEY]), sb = normalizeState(b.metadata[META_KEY]);
    const da = isPlayerDefeated(sa), db = isPlayerDefeated(sb); if (da !== db) return da ? 1 : -1;
    return (Number(sb.initiative)||0)-(Number(sa.initiative)||0) || String(sa.name||a.name).localeCompare(String(sb.name||b.name));
  });
  const sortMonsters = arr => [...arr].sort((a,b) => {
    const aa = a.id === activeEntityId ? 1 : 0, bb = b.id === activeEntityId ? 1 : 0; if (aa !== bb) return bb-aa;
    const da = isMonsterDefeated(a), db = isMonsterDefeated(b); if (da !== db) return da ? 1 : -1;
    const av=monsterPhaseView(a,"active"), bv=monsterPhaseView(b,"active"); return (Number(bv.initiative)||0)-(Number(av.initiative)||0) || String(av.name||a.name).localeCompare(String(bv.name||b.name));
  });
  const friendlyCards = [...sortPlayers.map(playerSceneCard), ...sortMonsters(allies).map(monsterSceneCard)].filter(Boolean).join("");
  const enemyCards = sortMonsters(enemies).map(monsterSceneCard).filter(Boolean).join("");
  const current = sceneCurrentTurnInfo(), selfDeleted = state.deleted;
  const friendlyAlive = party.filter(p => !isPlayerDefeated(normalizeState(p.metadata[META_KEY]))).length + allies.filter(m => !isMonsterDefeated(m)).length;
  const enemyAlive = enemies.filter(m => !isMonsterDefeated(m)).length;
  const crisisCount = party.filter(p => { const x=normalizeState(p.metadata[META_KEY]); return !isPlayerDefeated(x) && isCrisis(x); }).length + runtime.sceneMonsters.filter(m => !isMonsterDefeated(m) && isCrisis(m)).length;
  const gmControls = runtime.currentPlayer.role === "GM" ? `${runtime.sceneCombat.started ? "" : `<button class="mini-btn" data-action="start-initiative">START COMBAT</button>`}<button class="primary" data-action="next-turn">NEXT TURN</button><button class="danger-soft" data-action="reset-initiative">RESET INIT</button>` : "";
  const filter = String(runtime.sceneRosterFilter || "all");
  return `<div class="view active"><section class="scene-v262"><div class="scene-v262-hero"><div class="scene-v262-hero-head"><div><small>ACTIVE ENCOUNTER</small><h2>SCENE</h2><p>Current turn, resources, defenses and initiative in one shared combat view.</p></div><div class="scene-v262-hero-actions">${selfDeleted ? `<button class="primary" data-action="create-my-character">+ CREATE MY CHARACTER</button>` : ""}<button class="mini-btn scene-width-toggle" data-action="toggle-scene-width">${runtime.sceneWideMode ? "SIDEBAR" : "WIDE VIEW"}</button><button class="mini-btn" data-action="refresh-scene">REFRESH</button></div></div><div class="scene-v262-summary ${runtime.sceneSummaryCollapsed ? "collapsed" : ""}"><div class="scene-v262-current" data-scene-current-toggle role="button" tabindex="0" aria-expanded="${runtime.sceneSummaryCollapsed ? "false" : "true"}" title="${runtime.sceneSummaryCollapsed ? "Expand Current Turn summary" : "Collapse Current Turn summary"}"><div class="scene-v262-current-avatar ${esc(current.side)}">${current.portrait ? `<img class="${current.kind === "monster" ? "monster-full-art" : ""}" src="${esc(current.portrait)}">` : esc(current.initials)}</div><div class="scene-v265-current-copy"><small>CURRENT TURN</small><strong>${esc(current.name)}</strong><span>${esc(current.meta)}</span></div><div class="scene-v262-turn-controls">${gmControls}</div><div class="scene-v265-current-toggle" aria-hidden="true">${runtime.sceneSummaryCollapsed ? "▸" : "▾"}</div></div><div class="scene-v262-summary-box"><small>ROUND</small><b>${runtime.sceneCombat.started ? Math.max(1, Number(runtime.sceneCombat.round)||1) : "—"}</b><span>${runtime.sceneCombat.started ? "ACTIVE CYCLE" : "NOT STARTED"}</span></div><div class="scene-v262-summary-box"><small>FRIENDLY</small><b>${friendlyAlive}</b><span>PLAYER + ALLY</span></div><div class="scene-v262-summary-box"><small>ENEMIES</small><b>${enemyAlive}</b><span>ACTIVE</span></div><div class="scene-v262-summary-box"><small>CRISIS</small><b>${crisisCount}</b><span>NEED ATTENTION</span></div></div></div><div class="scene-v262-toolbar"><div class="scene-v262-filters"><button class="mini-btn ${filter === "all" ? "active" : ""}" data-scene-roster-filter="all">ALL</button><button class="mini-btn ${filter === "friendly" ? "active" : ""}" data-scene-roster-filter="friendly">PLAYERS + ALLIES</button><button class="mini-btn ${filter === "enemy" ? "active" : ""}" data-scene-roster-filter="enemy">ENEMIES</button><button class="mini-btn ${filter === "crisis" ? "active" : ""}" data-scene-roster-filter="crisis">CRISIS</button></div><input class="scene-v262-search" data-scene-roster-search value="${esc(runtime.sceneRosterSearch || "")}" placeholder="Search scene character..."></div><div class="scene-v262-init-strip">${sceneInitiativeStripHTML()}</div><div class="scene-v262-board"><section class="scene-v262-column friendly"><header><b>PLAYERS & ALLIES</b><span data-scene-visible-count="friendly">${party.length + allies.length}</span></header><div class="scene-v262-cards">${friendlyCards || `<div class="empty">NO PLAYERS OR ALLIES IN THIS SCENE</div>`}</div></section><section class="scene-v262-column enemy"><header><b>ENEMIES</b><span data-scene-visible-count="enemy">${enemies.length}</span></header><div class="scene-v262-cards">${enemyCards || `<div class="empty">NO ENEMIES IN THIS SCENE</div>`}</div></section></div></section>${sceneStatusPanelHTML()}</div>`;
}
function remoteInput(owner, path, value, type = "text", extra = "") { return `<input type="${type}" data-remote-field="${owner}:${path}" value="${esc(value)}" ${extra}>`; }
function remoteTextarea(owner, path, value, placeholder = "") { return `<textarea data-remote-field="${owner}:${path}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>${gifPreview(value)}`; }
function resourceHTMLRemote(owner, key, label, s) {
  const r = s[key];
  return `<div class="resource shared-resource"><div class="resource-head"><span>${label}</span><span class="res-controls"><button class="res-btn" data-remote-resource="${owner}:${key}:-1">−</button>${remoteInput(owner, `${key}.current`, r.current, "number")}<span>/</span>${remoteInput(owner, `${key}.max`, r.max, "number")}<button class="res-btn" data-remote-resource="${owner}:${key}:1">+</button></span></div><div class="track"><div class="fill ${key}" style="width:${pct(r.current, r.max)}%"></div></div></div>`;
}
function attributesHTML(s, owner = "") {
  return `<div class="attributes">${ATTRS.map(k => { const base = s.attributes[k], cur = currentDie(s, k), d = attrDelta(s, k); return `<button class="die-btn ${d < 0 ? "attr-down" : d > 0 ? "attr-up" : ""}" ${owner ? `data-remote-die="${owner}:${k}"` : ""}><span>${k}</span><b>d${base}${cur !== base ? ` <i>→ d${cur}</i>` : ""}</b><small>${d < 0 ? `${d} STEP` : d > 0 ? `+${d} STEP` : "NORMAL"}</small></button>`; }).join("")}</div>`;
}
function statusHTML(s, owner = "") {
  const crisis = isCrisis(s) ? `<span class="status on auto-crisis" title="Automatic: HP is at or below half Max HP">CRISIS</span>` : "";
  const outcome = playerDefeatOutcome(s);
  const defeat = outcome ? `<span class="status on player-defeat-outcome ${outcome}" title="Automatic at 0 HP">${esc(playerDefeatLabel(s))}</span>` : "";
  return `<div class="statuses">${STATUS_NAMES.map(k => `<button class="status ${s.statuses[k] ? "on" : ""}" ${owner ? `data-remote-status="${owner}:${k}"` : ""}>${k.toUpperCase()}</button>`).join("")}${defeat}${crisis}</div><div class="buff-grid">${ATTRS.map(k => `<div class="buff-box"><b>${k} TEMP</b><button ${owner ? `data-remote-buff="${owner}:${k}:-1"` : ""}>−</button><span>${Number(s.attributeBuffs?.[k]) || 0}</span><button ${owner ? `data-remote-buff="${owner}:${k}:1"` : ""}>+</button></div>`).join("")}</div>`;
}
function affinityHTML(s, owner = "", monsterId = "", readOnly = false) {
  return `<div class="affinity-grid">${ELEMENTS.map(e => { const affinity = String(s.affinities?.[e] || "NORMAL").toUpperCase(); return `<div class="affinity-row"><b>${elementIcon(e)}<span>${elementInfo(e).label}</span></b>${readOnly ? `<span class="affinity-pill ${affinity.toLowerCase()}">${esc(affinity)}</span>` : `<select class="affinity-select ${affinityTone(affinity)}" ${owner ? `data-remote-affinity="${owner}:${e}"` : monsterId ? `data-active-affinity="${monsterId}:${e}"` : ""}>${AFFINITY_VALUES.map(v => `<option ${v === affinity ? "selected" : ""}>${v}</option>`).join("")}</select>`}</div>`; }).join("")}</div>`;
}
function playerDefenseControlHTML(owner, s, kind, label) {
  const x = playerDefenseInfo(s, kind);
  const cls = x.delta < 0 ? "attr-down" : x.delta > 0 ? "attr-up" : "";
  const modHint = kind === "magicDefense" ? "INS" : "DEX";
  return `<div class="stat-box defense-derived ${cls}"><label>${label}</label><div class="defense-derived-value">${x.value === x.original ? `<b>${x.value}</b>` : `<b>${x.original}</b><i>→</i><strong>${x.value}</strong>`}</div><small>${modHint} d${x.derived}${x.mod ? ` · MOD ${esc(x.mod)}` : " · BASE"}</small><div class="defense-mod-field"><span>MOD</span>${remoteInput(owner, x.modKey, x.mod, "text", 'inputmode="text" placeholder="+2 / -1 / 12"')}</div></div>`;
}
function monsterDefenseControlHTML(m, mode, kind, label) {
  const v = monsterPhaseView(m, mode);
  const x = playerDefenseInfo(v, kind);
  const cls = x.delta < 0 ? "attr-down" : x.delta > 0 ? "attr-up" : "";
  const modHint = kind === "magicDefense" ? "INS" : "DEX";
  const path = monsterPhasePath(m, mode, x.modKey);
  const input = mode === "lib" ? monsterLibInput(m.id, path, x.mod, "text", 'inputmode="text" placeholder="+2 / -1 / 12"') : activeInput(m, path, x.mod, "text", 'inputmode="text" placeholder="+2 / -1 / 12"');
  return `<div class="stat-box defense-derived ${cls}"><label>${label}</label><div class="defense-derived-value">${x.value === x.original ? `<b>${x.value}</b>` : `<b>${x.original}</b><i>→</i><strong>${x.value}</strong>`}</div><small>${modHint} d${x.derived}${x.mod ? ` · MOD ${esc(x.mod)}` : " · BASE"}</small><div class="defense-mod-field"><span>MOD</span>${input}</div></div>`;
}
function playerSheetTabLabel(t) { return t === "hinder" ? "STUDY & HINDER" : t === "inventory" ? "ITEMS" : t === "zero" ? "ZERO POWER" : t.toUpperCase(); }
function playerEditorHTML(p, s) {
  const id = p.id;
  const order = (runtime.sheetTabOrder || PLAYER_SHEET_TABS).filter(t => PLAYER_SHEET_TABS.includes(t));
  if (!order.includes(runtime.partyEditTab)) runtime.partyEditTab = order[0] || "sheet";
  const tabs = order.map(t => `<button class="subtab player-sheet-tab ${runtime.partyEditTab === t ? "active" : ""}" data-party-tab="${t}" data-drop-kind="sheet-tabs" data-key="${t}" data-drag-kind="sheet-tabs" draggable="true" title="Hold and drag this tab to reorder">${playerSheetTabLabel(t)}</button>`).join("");
  return `<section class="shared-sheet"><div class="shared-sheet-header"><button class="mini-btn" data-action="scene-back">‹ SCENE</button><div class="shared-sheet-char">${s.portrait ? `<img src="${esc(s.portrait)}">` : `<div class="shared-head-empty">?</div>`}<div><strong>${esc(s.name || p.name)}</strong><small>SHARED CHARACTER SHEET · EVERY PLAYER CAN EDIT${p.offline ? " · OWNER OFFLINE" : ""}</small></div></div><div class="shared-head-stats"><span>HP <b>${s.hp.current}/${s.hp.max}</b></span><span>MP <b>${s.mp.current}/${s.mp.max}</b></span><span>IP <b>${s.ip.current}/${s.ip.max}</b></span><span>FP <b>${s.fp}</b></span><button class="danger-btn" data-delete-character="${esc(id)}">DELETE CHARACTER</button></div></div><div class="shared-sheet-tabs">${tabs}</div><div class="sheet-drag-delete-tip">BOARD QUICK DELETE · drag a removable card outside this window and release</div><div class="shared-sheet-body">${remotePlayerTabHTML(id, s)}</div></section>`;
}
function remoteSheetPortrait(owner, s) {
  const portrait = s.portrait ? `<img class="portrait" src="${esc(s.portrait)}">` : `<div class="portrait-empty">SELECT PORTRAIT ART<br>FROM OWLBEAR ASSETS</div>`;
  const tokenLink = `<div class="player-token-link-panel ${s.linkedTokenId ? "linked" : ""}"><div class="player-token-link-actions"><button class="primary token-spawn-btn" data-party-spawn-token="${esc(owner)}">SPAWN TOKEN + LINK STATS</button><button class="mini-btn" data-party-link-token="${esc(owner)}">LINK STATS · SELECTED TOKEN</button><button class="danger-soft" data-party-unlink-token="${esc(owner)}" ${s.linkedTokenId ? "" : "disabled"}>UNLINK STATS</button></div><span class="player-token-link-state">${s.linkedTokenId ? "● STATS LINKED · TURN / DEBUFF / CRISIS HUD ACTIVE" : "○ NO TOKEN STATS LINKED"}</span></div>`;
  const portraitEditor = `<div class="art-split-editor"><div class="art-editor-block"><b>PORTRAIT ART</b><div class="portrait-actions player-portrait-actions"><button class="mini-btn" data-party-portrait="${owner}">CHOOSE PORTRAIT ART</button><button class="mini-btn" data-party-portrait-from-token="${owner}">PORTRAIT FROM SELECTED TOKEN</button></div></div><div class="art-editor-block"><b>TOKEN ART</b>${tokenArtPreviewHTML(s.tokenArt, "TOKEN ART")}<div class="portrait-actions player-portrait-actions"><button class="mini-btn" data-party-token-art="${owner}">CHOOSE TOKEN ART</button><button class="mini-btn" data-party-token-from-selected="${owner}">TOKEN ART FROM SELECTED</button></div></div></div>${tokenLink}${canvasTextLinksPortraitPanel(owner, s)}`;
  return `<aside class="shared-portrait-panel locked-portrait-panel"><details class="locked-edit-card portrait-read-card" data-persist-details="sheet-portrait:${esc(owner)}"><summary class="locked-edit-summary portrait-read-summary"><div class="locked-edit-head"><b>PORTRAIT ART</b><span>CLICK TO EDIT ▾</span></div>${portrait}<div class="shared-nameplate"><strong>${esc(s.name)}</strong><small>${esc(s.identity || "IDENTITY UNSET")}</small></div>${tokenArtPreviewHTML(s.tokenArt, "TOKEN ART")}</summary><div class="locked-edit-body">${portraitEditor}</div></details><div class="live-combat-panel portrait-live-resources"><div class="live-combat-title"><b>LIVE RESOURCES</b></div><div class="resources">${resourceHTMLRemote(owner, "hp", "HP", s)}${resourceHTMLRemote(owner, "mp", "MP", s)}${resourceHTMLRemote(owner, "ip", "IP", s)}</div></div></aside>`;
}

function readField(label, value, cls = "") {
  const v = String(value ?? "").trim();
  return `<div class="locked-read-field ${cls}"><small>${esc(label)}</small><div>${v ? formatText(v) : '<span class="locked-empty">—</span>'}</div></div>`;
}
function readDetail(label, value) {
  const clean = stripMediaUrls(String(value || ""));
  const media = mediaFromText(String(value || ""));
  return `<div class="locked-read-detail"><small>${esc(label)}</small><div>${clean ? formatText(clean) : '<span class="locked-empty">NO DETAILS</span>'}</div>${media ? `<img src="${esc(media)}" alt="${esc(label)} media">` : ""}</div>`;
}
function lockedEditCard(title, key, readHTML, editorHTML, actions = "") {
  return `<details class="hud-card locked-edit-card" data-persist-details="${esc(key)}"><summary class="locked-edit-summary"><div class="locked-edit-head"><b>${esc(title)}</b><span>CLICK TO EDIT ▾</span></div>${readHTML}${actions ? `<div class="locked-summary-actions">${actions}</div>` : ""}</summary><div class="card-body locked-edit-body">${editorHTML}</div></details>`;
}
function inlineProfileCard(owner, s) {
  const key = `profile:${owner}`;
  const editing = !!runtime.inlineEdit?.[key];
  const readHTML = `<div class="locked-read-grid">${readField("NAME", s.name)}${readField("IDENTITY", s.identity)}${readField("THEME", s.theme)}${readField("ORIGIN", s.origin)}</div>`;
  const editHTML = `<div class="identity-grid inline-profile-grid"><div class="field"><label>NAME</label>${remoteInput(owner, "name", s.name)}</div><div class="field"><label>IDENTITY</label>${remoteInput(owner, "identity", s.identity)}</div><div class="field"><label>THEME</label>${remoteInput(owner, "theme", s.theme)}</div><div class="field"><label>ORIGIN</label>${remoteInput(owner, "origin", s.origin)}</div></div>`;
  return `<section class="hud-card inline-edit-card" data-inline-edit-id="${esc(key)}"><div class="card-title"><div class="inline-edit-title"><b>CHARACTER PROFILE</b><span>${editing ? "EDITING" : "READ MODE"}</span></div><div class="inline-card-actions"><button class="mini-btn" data-send-section-owner="${owner}:profile">SEND</button><button class="mini-btn" data-toggle-inline-edit="${esc(key)}">${editing ? "DONE" : "EDIT"}</button></div></div><div class="card-body inline-edit-body">${editing ? editHTML : readHTML}</div></section>`;
}

function zeroPowerEditorHTML(owner, s) {
  const z = { name: "", trigger: "", effect: "", detail: "", current: 0, max: 6, ...(s.zeroPower || {}) };
  z.max = 6; z.current = clamp(z.current, 0, 6);
  const full = z.current >= 6;
  const own = String(owner) === String(runtime.currentPlayer.id);
  return `<section class="zero-power-editor ${full ? "is-full" : ""}"><div class="zero-power-hero"><div class="zero-power-clock"><small>ZERO CLOCK</small>${circularClockHTML(6, z.current, "data-remote-zero-progress", owner)}<strong>${full ? "FULL" : `${z.current} / 6`}</strong></div><div class="zero-power-summary"><small>${full ? "ZERO POWER READY" : "MANUAL POWER TRACKER"}</small><h2>${esc(z.name || "UNNAMED ZERO POWER")}</h2><p>${esc(stripMediaUrls(z.effect || "No ability entered yet."))}</p><div class="zero-power-step"><button data-remote-zero-step="${esc(owner)}:-1">−</button><b>${z.current} / 6</b><button data-remote-zero-step="${esc(owner)}:1">+</button><button class="zero-reset" data-remote-zero-reset="${esc(owner)}">RESET</button><button class="zero-activate" data-zero-activate-owner="${esc(owner)}" ${own && full ? "" : "disabled"}>${own ? (full ? "ACTIVATE" : "NEED 6/6") : "OWNER ONLY"}</button></div></div>${mediaFromText(z.detail) ? `<div class="zero-power-media"><img src="${esc(mediaFromText(z.detail))}" alt="${esc(z.name || "Zero Power")}"></div>` : ""}</div><div class="zero-power-fields"><div class="field"><label>ZERO POWER NAME</label>${remoteInput(owner, "zeroPower.name", z.name, "text", 'placeholder="Power name"')}</div><div class="field"><label>TRIGGER / CHARGE CONDITION</label>${remoteTextarea(owner, "zeroPower.trigger", z.trigger, "Write the trigger or charging condition manually")}</div><div class="field"><label>ABILITY / EFFECT</label>${remoteTextarea(owner, "zeroPower.effect", z.effect, "Write the complete ability manually")}</div><div class="field"><label>DESCRIPTION / GIF LINK</label>${remoteTextarea(owner, "zeroPower.detail", z.detail, "Flavor text / direct GIF link")}</div></div><p class="zero-power-note">MANUAL CHARGE · ACTIVATE requires 6/6, broadcasts the special Cut-in, then resets this Clock to 0/6.</p></section>`;
}

function remotePlayerTabHTML(owner, s) {
  if (runtime.partyEditTab === "sheet") {
    const progressionLive = `<div class="hud-card live-combat-card"><div class="card-title">PROGRESSION </div><div class="card-body"><div class="quick-grid player-combat-grid"><div class="stat-box"><label>LEVEL</label>${remoteInput(owner, "level", s.level, "number")}</div><div class="stat-box"><label>XP</label>${remoteInput(owner, "xp", s.xp, "number")}</div><div class="stat-box wide"><label>ZENIT</label>${remoteInput(owner, "zenit", s.zenit, "number")}</div></div></div></div>`;
    const initiativeGifRead = s.initiativeGif ? `<div class="locked-media-note initiative-gif-read"><b>INITIATIVE GIF</b>${imageLinkPreview(s.initiativeGif,"initiative-gif-full")}</div>` : `<div class="locked-read-detail"><small>INITIATIVE GIF</small><div><span class="locked-empty">NO GIF SET</span></div></div>`;
    const initiativeGifEdit = `<div class="field initiative-gif-field"><label>INITIATIVE GIF · THIS CHARACTER</label>${remoteInput(owner, "initiativeGif", s.initiativeGif || "", "url", 'placeholder="https://.../initiative.gif"')}</div><small class="locked-editor-hint">Popup ROLL INITIATIVE จะใช้ GIF นี้สำหรับตัวละครนี้</small>`;

    const liveCombat = `<div class="hud-card live-combat-card"><div class="card-title">LIVE COMBAT <button class="mini-btn" data-send-section-owner="${owner}:combat">SEND</button></div><div class="card-body"><div class="quick-grid player-combat-grid"><div class="stat-box combat-primary-stat"><label>FP</label>${remoteInput(owner, "fp", s.fp, "number")}</div><div class="stat-box combat-primary-stat"><label>INITIATIVE</label>${remoteInput(owner, "initiative", s.initiative, "number")}</div>${playerDefenseControlHTML(owner, s, "defense", "DEF")}${playerDefenseControlHTML(owner, s, "magicDefense", "M.DEF")}</div></div></div>`;
    const liveAttributes = `<div class="hud-card live-combat-card base-attributes-live"><div class="card-title">BASE ATTRIBUTES <button class="mini-btn" data-send-section-owner="${owner}:attributes">SEND</button></div><div class="card-body">${attributesHTML(s, owner)}</div></div>`;
    const liveStatus = `<div class="hud-card live-combat-card"><div class="card-title">STATUS & TEMP MODIFIERS <button class="mini-btn" data-send-section-owner="${owner}:status">SEND</button></div><div class="card-body">${statusHTML(s, owner)}</div></div>`;
    const liveAffinity = `<div class="hud-card live-combat-card"><div class="card-title">ELEMENT AFFINITY <button class="mini-btn" data-send-section-owner="${owner}:affinities">SEND</button></div><div class="card-body">${affinityHTML(s, owner)}</div></div>`;

    const main = [
      liveCombat,
      liveAttributes,
      liveStatus,
      liveAffinity,
      progressionLive,
      inlineProfileCard(owner, s),
      lockedEditCard("INITIATIVE GIF", `sheet-initiative-gif:${owner}`, initiativeGifRead, initiativeGifEdit)
    ].join("");
    return `<div class="shared-sheet-grid">${remoteSheetPortrait(owner, s)}<section class="shared-main locked-sheet-main">${main}</section></div>`;
  }
  if (runtime.partyEditTab === "class") return remoteClassHTML(owner, s);
  if (runtime.partyEditTab === "equipment") return remoteEquipmentHTML(owner, s);
  if (runtime.partyEditTab === "spheres") return remoteSpheresHTML(owner, s);
  if (runtime.partyEditTab === "inventory") return remoteInventoryHTML(owner, s);
  if (runtime.partyEditTab === "bond") return remoteSimpleListHTML(owner, s, "bonds", "BONDS");
  if (runtime.partyEditTab === "arcana") return remoteSimpleListHTML(owner, s, "arcana", "ARCANA");
  if (runtime.partyEditTab === "actions") return remoteActionsHTML(owner, s);
  if (runtime.partyEditTab === "zero") return zeroPowerEditorHTML(owner, s);
  if (runtime.partyEditTab === "hinder") return hinderHTML(owner, s);
  return "";
}

function studyTierFromTotal(total) {
  const n = Number(total) || 0;
  return n >= 13 ? 13 : n >= 10 ? 10 : n >= 7 ? 7 : 0;
}
function studyDiscoveryDetails(monster, previousTier, nextTier) {
  if (!monster || nextTier <= previousTier) return [];
  const v = monsterPhaseView(monster, "active"), out = [];
  if (previousTier < 7 && nextTier >= 7) {
    out.push(`RANK · ${v.rank || "—"}`, `SPECIES · ${v.species || "—"}`, `HP · ${monster.hp.current}/${monster.hp.max}`, `MP · ${monster.mp.current}/${monster.mp.max}`);
  }
  if (previousTier < 10 && nextTier >= 10) {
    out.push(`TRAITS · ${String(v.traits || "—").replace(/\s+/g, " ").slice(0, 80)}`);
    out.push(`ATTRIBUTES · ${ATTRS.map(k => `${k} d${currentDie(v, k)}`).join(" · ")}`);
    out.push(`DEF ${defenseValue(v, "defense")} · M.DEF ${defenseValue(v, "magicDefense")}`);
    out.push("ELEMENT AFFINITIES · UNLOCKED");
  }
  if (previousTier < 13 && nextTier >= 13) out.push(`ACTIONS · ${v.actions.length} UNLOCKED`);
  return out;
}
function studyButtonsHTML(target, source = "hinder") {
  const tier = monsterTier(target);
  if (runtime.currentPlayer.role !== "GM") {
    return `<div class="study-readonly"><b>CURRENT STUDY · ${STUDY_LABELS[tier]}</b><span>GM controls Study unlocks.</span></div>`;
  }
  return `<div class="study-inline-actions">${[0,7,10,13].map(t => `<button class="study-toggle ${tier === t ? "on" : ""}" data-study-apply="${esc(target.id)}:${t}:${source}"><span>${t === 0 ? "LOCK" : `STUDY ${t}+`}</span><b>${tier === t ? "ACTIVE" : STUDY_LABELS[t]}</b></button>`).join("")}</div>`;
}
function studyRollResultHTML(target) {
  const last = runtime.lastRoll;
  if (!last?.isStudy) return `<div class="study-roll-empty">ยังไม่มีผล STUDY CHECK</div>`;
  const resultTarget = last.studyTargetId ? studyHinderMonsterTarget({ studyTargetId: last.studyTargetId, studyTargetTokenId: last.studyTargetTokenId }) : null;
  const suggested = studyTierFromTotal(last.total);
  const targetless = !last.studyTargetId;
  const sameTarget = target ? sameId(last.studyTargetId, target.id) : targetless;
  const unlocked = Number(last.studyUnlockedTier) || suggested, previous = Number(last.studyPreviousTier) || 0;
  const resultLabel = targetless
    ? (suggested ? `CHECK ONLY · RESULT ${suggested}+` : "CHECK ONLY · RESULT < 7")
    : (unlocked > previous ? `AUTO APPLY · NEW STUDY ${unlocked}+` : suggested ? `STUDY ${unlocked || previous}+ · NO NEW DISCOVERY` : "RESULT < 7 · NO UNLOCK");
  const resultView = resultTarget ? monsterPhaseView(resultTarget, "active") : null;
  const name = targetless ? "NO TARGET · STUDY CHECK ONLY" : (resultView?.name || last.studyTargetName || "MONSTER");
  return `<div class="study-roll-result ${sameTarget ? "same-target" : "other-target"}"><div><small>LATEST STUDY · ${esc(last.senderName || "PLAYER")}</small><b>${esc(name)}</b></div><div class="study-roll-dice"><span>d${last.size1} <b>${last.d1}</b></span><i>+</i><span>d${last.size2} <b>${last.d2}</b></span><i>+</i><span>MOD <b>${Number(last.mod) || 0}</b></span><i>=</i><strong>${Number(last.total) || 0}</strong></div>${rollOutcomeBadgeHTML(last, "study-inline-outcome")}<em>${resultLabel}</em>${!sameTarget ? `<small class="study-target-warning">ผลล่าสุดเป็น ${targetless ? "Study แบบไม่เลือกเป้าหมาย" : `ของ ${esc(name)}`}</small>` : ""}</div>`;
}
function performStudyRoll(owner, monsterId) {
  const sheet = sourceSheet(owner);
  const requestedId = String(monsterId ?? "");
  const noTarget = requestedId === "__study_only__" || !requestedId;
  const target = noTarget ? null : studyHinderMonsterTarget({ id: requestedId });
  if (!sheet) return notify("Character is no longer available.");
  if (!noTarget && !target) return notify("Monster is no longer available.");
  const mod = Number(runtime.studyMod) || 0;
  const actorName = sheet.name || sourceParty(owner)?.name || "CHARACTER";
  const targetView = target ? monsterPhaseView(target, "active") : null;
  const targetName = targetView?.name || "STUDY CHECK ONLY";
  const studyGif = /^https?:\/\//i.test(String(sheet.studyGif || "").trim()) ? String(sheet.studyGif || "").trim() : "";
  const studyTargetRef = target ? `monster:${String(target.id)}` : "";
  const r = doRollWithSheet(sheet, { name: target ? `STUDY · ${targetName}` : "STUDY CHECK", label: target ? `STUDY · ${targetName}` : "STUDY CHECK · NO TARGET", attr1: "INS", attr2: "INS", mod, element: "none", note: "Study Check · INS + INS + MOD" }, actorName, studyTargetRef, { damage: false, hr: false, isStudy: true, studyTargetId: target ? String(target.id) : "", studyTargetTokenId: target ? String(target.linkedTokenId || "") : "", studyTargetRef, studyTargetName: targetView?.name || "", studyPreviousTier: target ? monsterTier(target) : 0, studyPhaseIndex: target ? monsterPhaseIndex(target, "active") : 0, studyPhaseLabel: target ? monsterPhaseLabel(target, monsterPhaseIndex(target, "active")) : "", gif: studyGif, actorKind: "player", actorId: String(owner || runtime.currentPlayer.id) });
  if (target && runtime.currentPlayer.role === "GM" && r) {
    const suggested = studyTierFromTotal(r.total);
    if (suggested > 0) applyMonsterStudyTier(target.id, suggested, "study-roll", r.studyPhaseIndex);
    else showToast("STUDY", `${targetView?.name || target.name || "MONSTER"} · result below 7`, "message", false);
  }
  return r || null;
}
function hinderHTML(owner, s) {
  const monsters = runtime.sceneMonsters || [];
  const noTargetId = "__study_only__";
  runtime.hinderTargetId = String(runtime.hinderTargetId ?? "");
  if (!runtime.hinderTargetId || (runtime.hinderTargetId !== noTargetId && !monsters.some(m => sameId(m.id, runtime.hinderTargetId)))) runtime.hinderTargetId = String(monsters[0]?.id || noTargetId);
  const noTarget = runtime.hinderTargetId === noTargetId;
  const target = noTarget ? null : studyHinderMonsterTarget({ id: runtime.hinderTargetId });
  if (target) runtime.hinderTargetId = String(target.id);
  const options = `<option value="${noTargetId}" ${noTarget ? "selected" : ""}>NO TARGET · STUDY CHECK ONLY</option>` + monsters.map(m => { const v = monsterPhaseView(m, "active"); return `<option value="${esc(String(m.id))}" ${sameId(m.id, runtime.hinderTargetId) ? "selected" : ""}>${m.faction === "ally" ? "ALLY" : "ENEMY"} · ${esc(v.name || "MONSTER")}</option>`; }).join("");
  const insDie = currentDie(s, "INS");
  let targetCard = `<div class="hinder-target-summary study-only-target"><div class="hinder-target-empty">?</div><div class="hinder-target-copy"><strong>STUDY CHECK ONLY</strong><small>NO MONSTER TARGET</small><em>ผลทอยจะไม่แก้ Study ของมอนสเตอร์ตัวใด</em></div></div>`;
  let hinderCard = `<div class="hud-card"><div class="card-title">HINDER · DEBUFF</div><div class="card-body"><div class="empty compact">เลือก TARGET MONSTER ก่อนเพื่อใช้ Hinder</div></div></div>`;
  let manualStudy = "";
  if (target) {
    const targetView = monsterPhaseView(target, "active");
    const statuses = STATUS_NAMES.map(k => `<button class="hinder-status ${target.statuses?.[k] ? "on" : ""}" data-hinder-status="${esc(target.id)}:${k}"><span>${k.toUpperCase()}</span><small>${target.statuses?.[k] ? "ACTIVE · CLICK TO REMOVE" : "APPLY NOW"}</small></button>`).join("");
    const active = activeStatuses(target).map(k => k.toUpperCase()).join(" · ") || "NORMAL";
    const tier = monsterTier(target);
    const statsVisible = runtime.currentPlayer.role === "GM" || tier >= 10;
    const combat = statsVisible
      ? `<div class="hinder-live-stats"><span>DEX <b>d${currentDie(targetView, "DEX")}</b></span><span>INS <b>d${currentDie(targetView, "INS")}</b></span><span>DEF <b>${defenseValue(targetView, "defense")}</b></span><span>M.DEF <b>${defenseValue(targetView, "magicDefense")}</b></span></div>`
      : `<div class="hinder-live-stats hinder-masked-stats"><span>DEX <b>???</b></span><span>INS <b>???</b></span><span>DEF <b>???</b></span><span>M.DEF <b>???</b></span></div>`;
    targetCard = `<div class="hinder-target-summary">${targetView.portrait ? `<img src="${esc(targetView.portrait)}">` : `<div class="hinder-target-empty">M</div>`}<div class="hinder-target-copy"><strong>${esc(targetView.name || "MONSTER")}</strong><small>${target.faction === "ally" ? "ALLY MONSTER" : "ENEMY MONSTER"} · ${esc(monsterPhaseLabel(target, monsterPhaseIndex(target, "active")))} · STUDY ${STUDY_LABELS[tier]}</small><em>${esc(active)}</em></div>${combat}</div>`;
    hinderCard = `<div class="hud-card"><div class="card-title">HINDER · DEBUFF <span>CLICK TO APPLY / REMOVE INSTANTLY</span></div><div class="card-body"><div class="hinder-status-grid">${statuses}</div></div></div>`;
    manualStudy = runtime.currentPlayer.role === "GM" ? `<div class="study-manual-override"><small>GM OVERRIDE</small>${studyButtonsHTML(target, "hinder")}</div>` : studyButtonsHTML(target, "hinder");
  }
  const studyGifEditor = `<div class="study-gif-config"><div class="field"><label>STUDY GIF · THIS CHARACTER</label>${remoteInput(owner, "studyGif", s.studyGif || "", "url", 'placeholder="https://.../study.gif"')}</div>${s.studyGif ? imageLinkPreview(s.studyGif, "study-gif-preview") : ""}<small>บันทึกแยกตาม Character Sheet · Popup Study จะใช้ GIF ของตัวละครที่ทอย</small></div>`;
  return `<div class="hinder-panel"><div class="section-head">STUDY & HINDER <span>STUDY AUTO-APPLIES WHEN A MONSTER IS TARGETED</span></div><div class="hinder-target-card"><div class="field"><label>TARGET MONSTER</label><select data-hinder-target>${options}</select></div>${targetCard}</div><div class="hud-card study-hinder-card"><div class="card-title">STUDY CHECK <span>INS + INS + MOD</span></div><div class="card-body">${studyGifEditor}<div class="study-roll-control"><div class="study-formula"><span>INS <b>d${insDie}</b></span><i>+</i><span>INS <b>d${insDie}</b></span><i>+</i><label>MOD <input type="number" data-study-mod value="${Number(runtime.studyMod) || 0}" step="1"></label><button class="primary" data-study-roll="${esc(owner)}:${esc(target?.id || noTargetId)}">ROLL STUDY</button></div>${studyRollResultHTML(target)}</div><div class="study-tier-guide"><p><b>7+</b> Rank, Species, HP, MP</p><p><b>10+</b> Traits, Attributes, DEF, M.DEF, Affinities</p><p><b>13+</b> Actions</p></div>${manualStudy}</div></div>${hinderCard}<div class="drag-help">เลือกมอนสเตอร์แล้ว ROLL STUDY จะ Apply ระดับ Study ให้อัตโนมัติ. เลือก NO TARGET เพื่อทอย Study อย่างเดียวโดยไม่แก้ข้อมูลมอนสเตอร์. STATUS เป็นข้อมูลเปิดเสมอ.</div></div>`;
}

function boardDragAttrs(kind, index, owner = "", path = kind, deleteKind = kind, extra = "") {
  return `draggable="true" data-drag-kind="${esc(kind)}" data-drag-owner="${esc(owner || "self")}" data-index="${Number(index)}" data-drag-path="${esc(path || kind)}" data-delete-kind="${esc(deleteKind || kind)}" ${extra}`;
}
function dragHandle(kind, index, owner = "", path = kind, deleteKind = kind, extra = "") {
  return `<span class="drag-handle" ${boardDragAttrs(kind, index, owner, path, deleteKind, extra)} title="Drag to reorder · drag outside window to delete">⋮⋮</span>`;
}
function classTotalLevel(s) {
  return (Array.isArray(s?.classes) ? s.classes : []).reduce((sum, c) => sum + Math.max(0, Number(c?.level) || 0), 0);
}
function paintClassTotalLevel(owner) {
  const root = document.querySelector(`.class-build-header[data-class-build-owner="${CSS.escape(owner)}"]`);
  if (!root) return;
  const total = [...document.querySelectorAll(`input[data-class-level-owner="${CSS.escape(owner)}"]`)]
    .reduce((sum, el) => sum + Math.max(0, Number(el.value) || 0), 0);
  const target = root.parentElement?.querySelector('[data-class-total-level]') || root.querySelector('[data-class-total-level]');
  if (target) target.textContent = `LV ${total}`;
}
function remoteClassHTML(owner, s) {
  const classes = s.classes.map((c, i) => {
    const key = `class:${owner}:${i}`;
    const editing = !!runtime.inlineEdit?.[key];
    const skillsRead = c.classSkills.length ? `<div class="locked-class-skills-read"><small>CLASS SKILLS</small>${c.classSkills.map((sk,j)=>`<div class="locked-skill-read"><div class="locked-skill-read-head"><div><b>${esc(sk.name || `CLASS SKILL ${j+1}`)}</b><em>LV ${Number(sk.level)||0}</em></div><button class="mini-btn class-skill-send-btn" data-send-class-skill="${owner}:${i}:${j}">SEND</button></div>${sk.cost ? `<div class="action-cost-line"><b>COST</b><span>${formatText(sk.cost)}</span></div>` : ""}${readDetail("DETAILS", sk.detail)}</div>`).join("")}</div>` : `<div class="locked-empty-block">NO CLASS SKILLS</div>`;
    const readHTML = `<div class="locked-class-title"><b>${esc(c.name || `CLASS ${i+1}`)}</b><span>LV ${Number(c.level)||0}</span></div>${readDetail("FREE BENEFIT", c.freeBenefit)}${skillsRead}`;
    const editHTML = `<div class="class-fields"><div class="field"><label>CLASS NAME</label>${remoteInput(owner, `classes.${i}.name`, c.name)}</div><div class="field"><label>FREE BENEFIT</label>${remoteTextarea(owner, `classes.${i}.freeBenefit`, c.freeBenefit, "Free Benefit / details / GIF link")}</div><div class="field"><label>LEVEL</label>${remoteInput(owner, `classes.${i}.level`, c.level, "number", `min="0" data-class-level-owner="${esc(owner)}"`)}</div></div><div class="nested-section"><div class="section-head">CLASS SKILLS <button class="mini-btn" data-remote-add-class-skill="${owner}:${i}">+ SKILL</button></div>${c.classSkills.length ? c.classSkills.map((sk, j) => `<div class="nested-row sortable-card drag-delete-card" data-drop-kind="class-skills-${i}" data-drop-owner="${owner}" ${boardDragAttrs(`class-skills-${i}`, j, owner, `classes.${i}.classSkills`, "class-skill", `data-parent-index="${i}"`)}><div class="nested-main"><div class="class-skill-title-grid"><span class="nested-drag-title">${dragHandle(`class-skills-${i}`, j, owner, `classes.${i}.classSkills`, "class-skill", `data-parent-index="${i}"`)}</span><input data-remote-field="${owner}:classes.${i}.classSkills.${j}.name" value="${esc(sk.name)}" placeholder="Class skill name"><input type="number" min="0" data-remote-field="${owner}:classes.${i}.classSkills.${j}.level" value="${esc(sk.level ?? 1)}" placeholder="Level"></div><div class="class-skill-cost-edit"><label>COST</label><input data-remote-field="${owner}:classes.${i}.classSkills.${j}.cost" value="${esc(sk.cost || "")}" placeholder="MP 10 / IP 1 / HP 5 / FP 1"></div><div>${remoteTextarea(owner, `classes.${i}.classSkills.${j}.detail`, sk.detail, "Skill Details / GIF link")}</div></div><div class="row-actions"><button class="mini-btn" data-send-class-skill="${owner}:${i}:${j}">SEND</button><button class="danger-btn" data-remote-remove-class-skill="${owner}:${i}:${j}">×</button></div></div>`).join("") : `<div class="empty compact">NO CLASS SKILLS</div>`}</div>`;
    return `<article class="editor-card inline-edit-card class-read-card sortable-card drag-delete-card" data-inline-edit-id="${esc(key)}" data-drop-kind="classes" data-drop-owner="${owner}" ${boardDragAttrs("classes", i, owner, "classes", "class")}><div class="card-title inline-class-head"><div class="inline-edit-title"><b>CLASS ${i+1}</b><span>${editing ? "EDITING" : "READ MODE"}</span></div><div class="inline-card-actions"><button class="mini-btn class-send-btn" data-send-class="${owner}:${i}">SEND</button><button class="mini-btn" data-toggle-inline-edit="${esc(key)}">${editing ? "DONE" : "EDIT"}</button>${editing ? `<button class="danger-btn" data-remote-remove-class="${owner}:${i}">×</button>` : ""}</div></div><div class="card-body inline-edit-body class-inline-body">${editing ? editHTML : readHTML}</div></article>`;
  }).join("");

  const quirks = s.quirks.map((q, i) => {
    const key = `quirk:${owner}:${i}`;
    const editing = !!runtime.inlineEdit?.[key];
    const readHTML = `<div class="locked-class-title"><b>${esc(q.name || `QUIRK ${i+1}`)}</b></div>${readDetail("DETAILS", q.detail)}`;
    const editHTML = `<div class="two-fields"><div class="field"><label>QUIRK</label>${remoteInput(owner, `quirks.${i}.name`, q.name)}</div><div class="field"><label>DETAILS</label>${remoteTextarea(owner, `quirks.${i}.detail`, q.detail, "Quirk details / GIF link")}</div></div>`;
    return `<article class="editor-card inline-edit-card class-read-card sortable-card drag-delete-card" data-inline-edit-id="${esc(key)}" data-drop-kind="quirks" data-drop-owner="${owner}" ${boardDragAttrs("quirks", i, owner, "quirks", "quirk")}><div class="card-title inline-class-head"><div class="inline-edit-title"><b>QUIRK ${i+1}</b><span>${editing ? "EDITING" : "READ MODE"}</span></div><div class="inline-card-actions"><button class="mini-btn" data-send-quirk="${owner}:${i}">SEND</button><button class="mini-btn" data-toggle-inline-edit="${esc(key)}">${editing ? "DONE" : "EDIT"}</button>${editing ? `<button class="danger-btn" data-remote-remove-quirk="${owner}:${i}">×</button>` : ""}</div></div><div class="card-body inline-edit-body class-inline-body">${editing ? editHTML : readHTML}</div></article>`;
  }).join("");

  const totalLevel = classTotalLevel(s);
  const buildKey = `build:${owner}`;
  const buildEditing = !!runtime.inlineEdit?.[buildKey];
  const buildRead = `<div class="locked-class-title build"><b>${esc(s.classTitle || "UNNAMED BUILD")}</b><span data-class-total-level>LV ${totalLevel}</span></div><div class="build-lore-read ${String(s.classLore || "").trim() ? "" : "muted"}"><small>LORE</small><div>${String(s.classLore || "").trim() ? formatText(s.classLore) : "NO LORE"}</div></div>`;
  const buildEdit = `<div class="build-edit-grid"><div class="field"><label>CLASS / BUILD NAME</label>${remoteInput(owner, "classTitle", s.classTitle || "", "text", 'class="class-build-name" placeholder="Enter class / build name"')}</div><div class="locked-class-title build inline-build-total"><small>TOTAL CLASS LEVEL</small><span data-class-total-level>LV ${totalLevel}</span></div><div class="field build-lore-field"><label>LORE</label>${remoteTextarea(owner, "classLore", s.classLore || "", "Build lore / concept / story")}</div></div>`;
  const buildCard = `<section class="inline-edit-card class-build-read" data-inline-edit-id="${esc(buildKey)}"><div class="card-title inline-class-head"><div class="inline-edit-title"><b>BUILD</b><span>${buildEditing ? "EDITING" : "READ MODE"}</span></div><div class="inline-card-actions"><button class="mini-btn" data-toggle-inline-edit="${esc(buildKey)}">${buildEditing ? "DONE" : "EDIT"}</button></div></div><div class="card-body inline-edit-body">${buildEditing ? buildEdit : buildRead}</div></section>`;

  return `<div><div class="section-head class-build-header" data-class-build-owner="${esc(owner)}"><span>CLASS / BUILD</span><button class="mini-btn" data-remote-add-class="${owner}">+ CLASS</button></div>${buildCard}<div class="drag-help">TOTAL LV = sum of Class levels only · Class Skill levels are not counted. Cards stay in READ MODE until EDIT is pressed; editing happens inside the same card.</div><div class="editor-stack locked-class-stack">${classes || `<div class="empty">NO CLASSES</div>`}</div><div class="section-head quirk-section">QUIRK <button class="mini-btn" data-remote-add-quirk="${owner}">+ QUIRK</button></div><div class="editor-stack locked-class-stack">${quirks || `<div class="empty">NO QUIRKS</div>`}</div></div>`;
}

function sphereOptionsHTML(s, selected = "") {
  return `<option value="">EMPTY SPHERE SLOT</option>${s.spheres.map(x => `<option value="${esc(x.id)}" ${x.id === selected ? "selected" : ""}>${esc(x.name)}${x.sphereType ? ` · ${esc(x.sphereType)}` : ""}</option>`).join("")}`;
}
function sphereSetEffects(e, s) {
  const seen = new Set(), out = [];
  for (const id of e.sphereIds || []) {
    const sp = s.spheres.find(x => x.id === id); if (!sp) continue;
    const detail = String(sp.detail || "").trim(); if (!detail) continue;
    const key = detail.toLocaleLowerCase(); if (seen.has(key)) continue; seen.add(key);
    out.push({ name: sp.name, detail });
  }
  return out;
}
function equipmentOrbit(owner, e, i, s) {
  const slots = Array.from({ length: 4 }, (_, n) => `<div class="sphere-orbit-slot slot-${n}"><span>SPHERE ${n + 1}</span><select data-remote-field="${owner}:equipment.${i}.sphereIds.${n}">${sphereOptionsHTML(s, e.sphereIds?.[n] || "")}</select></div>`).join("");
  const effects = sphereSetEffects(e, s);
  const center = e.imageUrl ? `<img src="${esc(e.imageUrl)}" alt="${esc(e.name)}">` : `<div class="equipment-center-empty">NO IMAGE</div>`;
  return `<div class="equipment-set-layout"><div class="equipment-orbit"><div class="orbit-ring"></div>${slots}<div class="equipment-center">${center}</div><div class="equipment-center-name">${esc(e.name || "EQUIPMENT")}</div></div><aside class="set-effects"><div class="set-effects-title">SPHERE SET EFFECTS</div>${effects.length ? effects.map(x => `<div class="set-effect"><b>${esc(x.name)}</b><div>${formatText(stripMediaUrls(x.detail))}</div>${gifPreview(x.detail, "sphere-effect-gif")}</div>`).join("") : `<div class="empty compact">SELECT SPHERES TO BUILD A SET</div>`}</aside></div>`;
}
function remoteEquipmentHTML(owner, s) {
  return `<div><div class="section-head">EQUIPMENT <button class="mini-btn" data-remote-add-equipment="${owner}">+ EQUIPMENT</button></div><div class="drag-help">Drag the card to reorder · drag outside the extension window and release to delete. Each equipment can socket up to 4 Spheres from this character's Sphere inventory.</div><div class="editor-stack">${s.equipment.length ? s.equipment.map((e, i) => `<article class="editor-card sortable-card equipment-editor-card drag-delete-card" data-drop-kind="equipment" data-drop-owner="${owner}" ${boardDragAttrs("equipment", i, owner, "equipment", "equipment")}><div class="editor-card-head"><span>${dragHandle("equipment", i, owner)} EQUIPMENT ${i + 1}</span><div><button class="mini-btn" data-send-equipment="${owner}:${i}">SEND</button><button class="danger-btn" data-remote-remove-equipment="${owner}:${i}">×</button></div></div>${equipmentOrbit(owner, e, i, s)}<div class="equipment-fields"><div class="field"><label>NAME</label>${remoteInput(owner, `equipment.${i}.name`, e.name)}</div><div class="field"><label>EQUIPMENT TYPE</label>${remoteInput(owner, `equipment.${i}.weaponType`, e.weaponType)}</div><div class="field"><label>IMAGE URL</label>${remoteInput(owner, `equipment.${i}.imageUrl`, e.imageUrl || "", "url", 'placeholder="https://..."')}</div><div class="field detail-field"><label>DETAIL</label>${remoteTextarea(owner, `equipment.${i}.detail`, e.detail, "Details / GIF link")}</div></div></article>`).join("") : `<div class="empty">NO EQUIPMENT</div>`}</div></div>`;
}

function cardTokenImageInfo(entry = {}) {
  const tokenId = String(entry?.linkedTokenId || "").trim();
  const live = tokenId ? runtime.cardTokenImages?.[tokenId] : null;
  if (live?.url) return { url: live.url, name: live.name || "LINKED TOKEN", tokenId, live: true };
  const snap = normalizeTokenArt(entry?.linkedTokenArt);
  if (snap?.image?.url) return { url: snap.image.url, name: snap.name || "LINKED TOKEN", tokenId, live: false };
  const legacy = String(entry?.tokenLink || "").trim();
  if (/^https?:\/\//i.test(legacy)) return { url: legacy, name: "LEGACY CARD ART", tokenId: "", live: false };
  return null;
}
function collectionBoardMedia(detail = "", kind = "arcana", entry = null) {
  const linked = cardTokenImageInfo(entry || {});
  const url = linked?.url || mediaFromText(detail || "");
  if (url) return `<div class="collection-board-media${linked?.tokenId ? " linked-token-art" : ""}"><img src="${esc(url)}" alt="${esc(kind)} art">${linked?.tokenId ? `<span class="collection-board-token-badge">TOKEN LINKED</span>` : ""}</div>`;
  const icon = kind === "sphere" ? "◉" : kind === "bond" ? "♥" : kind === "inventory" ? "◆" : "✦";
  return `<div class="collection-board-media collection-board-media-empty ${kind}"><span>${icon}</span></div>`;
}
function cardTokenLinkControl(owner, cardKind, index, entry = {}) {
  const tokenId = String(entry?.linkedTokenId || "").trim();
  const info = cardTokenImageInfo(entry);
  const name = tokenId ? (info?.name || `TOKEN ${tokenId.slice(0, 8)}`) : "NO TOKEN LINKED";
  const key = `${owner}|${cardKind}|${index}`;
  return `<div class="field card-token-link-field"><label>LINK TOKEN</label><div class="card-token-link-actions"><button type="button" class="mini-btn ${tokenId ? "active" : ""}" data-card-token-link="${esc(key)}">${tokenId ? "RELINK SELECTED TOKEN" : "LINK SELECTED TOKEN"}</button><button type="button" class="danger-soft" data-card-token-unlink="${esc(key)}" ${tokenId ? "" : "disabled"}>UNLINK</button></div><small class="card-token-link-status">${esc(name)}${tokenId ? " · uses this Owlbear token's image" : " · select an existing image token on the map first"}</small></div>`;
}
function collectionBoardDescription(detail = "") {
  const clean = stripMediaUrls(detail || "").trim();
  return `<div class="collection-board-desc ${clean ? "" : "muted"}">${clean ? formatText(clean) : "NO DESCRIPTION"}</div>`;
}
function simpleListCostLine(type = "", cost = "") {
  const value = String(cost || "").trim();
  if (type !== "arcana" || !value) return "";
  return `<div class="action-cost-line"><b>COST</b><span>${formatText(value)}</span></div>`;
}
function remoteSpheresHTML(owner, s) {
  const cards = s.spheres.map((e, i) => `<article class="collection-board-card sphere-board-card sortable-card drag-delete-card" data-drop-kind="spheres" data-drop-owner="${owner}" ${boardDragAttrs("spheres", i, owner, "spheres", "sphere")}><details class="collection-board-details" data-persist-details="sphere:${esc(owner)}:${i}"><summary class="collection-board-summary"><div class="collection-board-top">${dragHandle("spheres", i, owner)}<span class="collection-board-badge sphere">${esc(e.sphereType || "SPHERE")}</span></div>${collectionBoardMedia(e.detail, "sphere", e)}<div class="collection-board-title"><strong>${esc(e.name || "NEW SPHERE")}</strong><span class="collection-board-open-cue" aria-hidden="true"><b>⌄</b></span></div>${collectionBoardDescription(e.detail)}<div class="collection-board-controls single"><button class="mini-btn" data-send-sphere="${owner}:${i}">SEND</button></div></summary><div class="collection-board-editor"><div class="collection-board-editor-head"><strong>EDIT SPHERE</strong><button class="danger-btn" data-remote-remove-sphere="${owner}:${i}">DELETE</button></div><div class="collection-board-fields"><div class="field"><label>NAME</label>${remoteInput(owner, `spheres.${i}.name`, e.name)}</div><div class="field"><label>SPHERE TYPE</label>${remoteInput(owner, `spheres.${i}.sphereType`, e.sphereType)}</div>${cardTokenLinkControl(owner, "sphere", i, e)}<div class="field detail-field"><label>DETAILS / GIF LINK</label>${remoteTextarea(owner, `spheres.${i}.detail`, e.detail, "Sphere effect / description / GIF link")}</div></div></div></details></article>`).join("");
  return `<div><div class="section-head">SPHERES <button class="primary" data-remote-add-sphere="${owner}">+ SPHERE</button></div><div class="drag-help">Sphere Board · drag cards to reorder · drag outside the extension window and release to delete.</div>${cards ? `<div class="collection-board sphere-board">${cards}</div>` : `<div class="empty">NO SPHERES</div>`}</div>`;
}
function remoteInventoryHTML(owner, s) {
  const cards = (s.inventory || []).map((e, i) => `<article class="collection-board-card inventory-board-card sortable-card drag-delete-card" data-drop-kind="inventory" data-drop-owner="${owner}" ${boardDragAttrs("inventory", i, owner, "inventory", "inventory")}><details class="collection-board-details" data-persist-details="inventory:${esc(owner)}:${i}"><summary class="collection-board-summary"><div class="collection-board-top">${dragHandle("inventory", i, owner)}<span class="collection-board-badge inventory">${esc(e.itemType || "ITEM")}</span></div>${collectionBoardMedia(e.detail, "inventory", e)}<div class="collection-board-title"><strong>${esc(e.name || "NEW ITEM")}</strong><span class="collection-board-open-cue" aria-hidden="true"><b>⌄</b></span></div>${collectionBoardDescription(e.detail)}<div class="collection-board-controls single"><button class="mini-btn" data-send-inventory="${owner}:${i}">SEND</button></div></summary><div class="collection-board-editor"><div class="collection-board-editor-head"><strong>EDIT ITEM</strong><button class="danger-btn" data-remote-remove-inventory="${owner}:${i}">DELETE</button></div><div class="collection-board-fields"><div class="field"><label>NAME</label>${remoteInput(owner, `inventory.${i}.name`, e.name)}</div><div class="field"><label>ITEM TYPE</label>${remoteInput(owner, `inventory.${i}.itemType`, e.itemType)}</div>${cardTokenLinkControl(owner, "inventory", i, e)}<div class="field detail-field"><label>DETAILS / GIF LINK</label>${remoteTextarea(owner, `inventory.${i}.detail`, e.detail, "Item effect / description / GIF link")}</div></div></div></details></article>`).join("");
  return `<div><div class="section-head">INVENTORY <button class="primary" data-remote-add-inventory="${owner}">+ ITEM</button></div><div class="drag-help">Inventory Board · drag cards to reorder · drag outside the extension window and release to delete.</div>${cards ? `<div class="collection-board inventory-board">${cards}</div>` : `<div class="empty">NO ITEMS</div>`}</div>`;
}

function remoteSimpleListHTML(owner, s, type, title) {
  const arr = s.lists?.[type] || [];
  const singular = title.slice(0, -1);
  const dragKind = `list-${type}`;
  const path = `lists.${type}`;
  const cards = arr.map((x, i) => {
    const costField = type === "arcana"
      ? `<div class="field"><label>COST</label>${remoteInput(owner, `lists.${type}.${i}.cost`, x.cost || "", "text", 'placeholder="Resource / requirement / payment"')}</div>`
      : "";
    const strengthField = type === "bonds"
      ? `<div class="field"><label>STRENGTH · 1–3</label>${remoteInput(owner, `lists.${type}.${i}.strength`, clamp(Number(x.strength) || 1, 1, 3), "number", 'min="1" max="3" step="1"')}</div>`
      : "";
    const cutInInfo=type==="arcana"?cutInColorInfo(x.cutInColor):null;
    const cutInBadge=type==="arcana"&&x.cutIn?`<span class="skill-cutin-badge" style="--cutin-badge:${cutInInfo.hex}">CUT-IN · ${esc(cutInInfo.label)}</span>`:"";
    const cutInEditor=type==="arcana"?arcanaCutInHTML(x,owner,i):"";
    return `<article class="collection-board-card ${type}-board-card sortable-card drag-delete-card" data-drop-kind="${dragKind}" data-drop-owner="${owner}" ${boardDragAttrs(dragKind, i, owner, path, "list", `data-list-type="${type}"`)}><details class="collection-board-details" data-persist-details="${esc(type)}:${esc(owner)}:${i}"><summary class="collection-board-summary"><div class="collection-board-top">${dragHandle(dragKind, i, owner, path, "list", `data-list-type="${type}"`)}<span class="collection-board-badge ${type}">${esc(singular)}</span>${cutInBadge}</div>${collectionBoardMedia(x.detail || "", type === "bonds" ? "bond" : "arcana", (type === "arcana" || type === "bonds") ? x : null)}<div class="collection-board-title"><strong>${esc(x.name || `NEW ${singular}`)}</strong><span class="collection-board-open-cue" aria-hidden="true"><b>⌄</b></span></div>${simpleListCostLine(type, x.cost)}${collectionBoardDescription(x.detail || "")}<div class="collection-board-controls single"><button class="mini-btn" data-send-list="${owner}:${type}:${i}">SEND</button></div></summary><div class="collection-board-editor"><div class="collection-board-editor-head"><strong>EDIT ${esc(singular)}</strong><button class="danger-btn" data-remote-remove-list="${owner}:${type}:${i}">DELETE</button></div><div class="collection-board-fields"><div class="field"><label>NAME</label>${remoteInput(owner, `lists.${type}.${i}.name`, x.name || "")}</div>${costField}${strengthField}${(type === "arcana" || type === "bonds") ? cardTokenLinkControl(owner, type, i, x) : ""}<div class="field detail-field"><label>DETAILS / GIF LINK</label>${remoteTextarea(owner, `lists.${type}.${i}.detail`, x.detail || "", "Details / GIF link")}</div>${cutInEditor}</div></div></details></article>`;
  }).join("");
  return `<div><div class="section-head">${title} <button class="primary" data-remote-add-list="${owner}:${type}">+ ${esc(singular)}</button></div><div class="drag-help">${esc(singular)} Board · drag cards to reorder. Drag outside the extension window and release to delete.</div>${cards ? `<div class="collection-board ${type}-board">${cards}</div>` : `<div class="empty">NO ${title}</div>`}</div>`;
}
function paintClockImmediately(el, next, segments) {
  const face = el?.closest?.(".clock-face-wrap"); if (!face) return;
  const n = clamp(Number(next), 0, Number(segments) || 0);
  face.querySelectorAll(".clock-wedge").forEach((w, i) => w.classList.toggle("filled", i < n));
  const count = face.querySelector(".clock-count b"); if (count) count.textContent = String(n);
  const svg = face.querySelector(".clock-face"); if (svg) svg.setAttribute("aria-label", `${n} of ${Number(segments) || 0} segments filled`);
  const card = face.closest(".project-card");
  const summary = card?.querySelector(".project-controls > span"); if (summary) summary.textContent = `${n} / ${Number(segments) || 0}`;
}
function clockSectorPath(index, total, cx = 50, cy = 50, r = 44) {
  if (total <= 1) return "";
  const step = Math.PI * 2 / total, a0 = -Math.PI / 2 + index * step, a1 = a0 + step;
  const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
  const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
  const large = step > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0.toFixed(3)} ${y0.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(3)} ${y1.toFixed(3)} Z`;
}
function circularClockHTML(seg, prog, attr, prefix, isProject = false) {
  const pieces = Array.from({ length: seg }, (_, n) => {
    const data = `${attr}="${prefix}:${n + 1}"`;
    if (seg === 1) return `<circle class="clock-wedge ${n < prog ? "filled" : ""}" cx="50" cy="50" r="44" ${data} role="button" tabindex="0"><title>Set progress to 1 · click again at 1/1 to clear to 0</title></circle>`;
    return `<path class="clock-wedge ${n < prog ? "filled" : ""}" d="${clockSectorPath(n, seg)}" ${data} role="button" tabindex="0"><title>Set progress to ${n + 1} · click the current filled edge again to reduce by 1</title></path>`;
  }).join("");
  return `<div class="clock-face-wrap ${isProject ? "project" : "normal"}"><svg class="clock-face" viewBox="0 0 100 100" aria-label="${prog} of ${seg} segments filled">${pieces}<circle class="clock-outer-ring" cx="50" cy="50" r="44"></circle></svg><div class="clock-count"><b>${prog}</b><span>/ ${seg}</span></div></div>`;
}
function clockSegmentsHTML(owner, collection, i, item) {
  const seg = clamp(item.segments, 1, 12), prog = clamp(item.progress, 0, seg);
  const attr = collection === "clocks" ? "data-remote-clock-general" : "data-remote-clock";
  return `<div class="project-controls"><label>SEGMENTS ${remoteInput(owner, `${collection}.${i}.segments`, seg, "number", 'min="1" max="12"')}</label><span>${prog} / ${seg}</span></div>${circularClockHTML(seg, prog, attr, `${owner}:${i}`, collection === "projects")}`;
}
function normalClockCard(p, i, owner = "") {
  return `<article class="project-card sortable-card drag-delete-card" data-drop-kind="clocks" data-drop-owner="${owner}" ${boardDragAttrs("clocks", i, owner, "clocks", "clock")}><div class="project-title"><span>${dragHandle("clocks", i, owner)}</span>${remoteInput(owner, `clocks.${i}.name`, p.name)}<button class="mini-btn" data-send-clock="${owner}:${i}">SEND</button><button class="danger-btn" data-remote-remove-clock="${owner}:${i}">×</button></div>${remoteTextarea(owner, `clocks.${i}.detail`, p.detail, "Clock details / GIF link")}${clockSegmentsHTML(owner, "clocks", i, p)}</article>`;
}
function projectCard(p, i, owner = "") {
  return `<article class="project-card sortable-card drag-delete-card" data-drop-kind="projects" data-drop-owner="${owner}" ${boardDragAttrs("projects", i, owner, "projects", "project")}><div class="project-title"><span>${dragHandle("projects", i, owner)}</span>${remoteInput(owner, `projects.${i}.name`, p.name)}<button class="mini-btn" data-send-project="${owner}:${i}">SEND</button><button class="danger-btn" data-remote-remove-project="${owner}:${i}">×</button></div>${remoteTextarea(owner, `projects.${i}.detail`, p.detail, "Project details / GIF link")}${clockSegmentsHTML(owner, "projects", i, p)}</article>`;
}
function sceneTrackerInput(kind, i, path, value, type = "text", extra = "") {
  return `<input type="${type}" data-scene-tracker-field="${kind}:${i}:${path}" value="${esc(value)}" ${extra}>`;
}
function sceneTrackerTextarea(kind, i, path, value, placeholder = "") {
  return `<textarea data-scene-tracker-field="${kind}:${i}:${path}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>${gifPreview(value)}`;
}
function sceneTrackerDragHandle(kind, index) {
  return `<span class="drag-handle" draggable="true" data-drag-kind="scene-${kind}" data-drag-owner="__scene__" data-index="${index}" title="Drag to reorder">⋮⋮</span>`;
}
function sceneClockSegmentsHTML(kind, i, item) {
  const seg = clamp(item.segments, 1, 12), prog = clamp(item.progress, 0, seg);
  return `<div class="project-controls"><label>SEGMENTS ${sceneTrackerInput(kind, i, "segments", seg, "number", 'min="1" max="12"')}</label><span>${prog} / ${seg}</span></div>${circularClockHTML(seg, prog, "data-scene-clock-progress", `${kind}:${i}`, kind === "projects")}`;
}
function sceneTrackerCard(kind, item, i) {
  const isProject = kind === "projects", gm = runtime.currentPlayer.role === "GM";
  const objective = !isProject && item.objective;
  const holoControls = gm ? `<div class="scene-tracker-holo-controls">${!isProject ? `<button class="mini-btn objective-toggle ${objective ? "active" : ""}" data-scene-tracker-objective="${kind}:${i}" title="Mark this Clock as a conflict Objective">${objective ? "◆ OBJECTIVE" : "◇ OBJECTIVE"}</button>` : ""}<button class="mini-btn holo-toggle ${item.pinned ? "active" : ""}" data-scene-tracker-hologram="${kind}:${i}" title="Show this tracker as a hologram on every player's Canvas">${item.pinned ? "◉ HOLOGRAM" : "○ HOLOGRAM"}</button></div>` : (item.pinned ? `<span class="tracker-holo-readonly">◉ HOLOGRAM</span>` : "");
  return `<article class="project-card sortable-card ${item.pinned ? "is-hologram-pinned" : ""} ${objective ? "is-objective" : ""}" data-drop-kind="scene-${kind}" data-index="${i}" data-drop-owner="__scene__"><div class="project-title"><span>${sceneTrackerDragHandle(kind, i)}</span>${sceneTrackerInput(kind, i, "name", item.name)}<button class="mini-btn" data-send-scene-tracker="${kind}:${i}">SEND</button><button class="danger-btn" data-scene-remove-tracker="${kind}:${i}">×</button></div>${holoControls}${sceneTrackerTextarea(kind, i, "detail", item.detail, `${isProject ? "Project" : "Clock"} details / GIF link`)}${sceneClockSegmentsHTML(kind, i, item)}</article>`;
}
function clockProjectHTML() {
  const sh = runtime.sceneTrackers || { clocks: [], projects: [] };
  return `<div class="view active"><section class="clock-project-page"><div class="card-title"><div>CLOCK & PROJECT <span>SCENE-WIDE SHARED TRACKERS · NOT TIED TO A CHARACTER</span></div></div><div class="clock-project-body"><section class="clock-zone"><div class="section-head"><div>NORMAL CLOCKS <small>GENERAL PROGRESS / THREATS / OBJECTIVES</small></div><button class="primary" data-scene-add-tracker="clocks">+ CLOCK</button></div><div class="drag-help">Shared with everyone in this Scene. Drag ⋮⋮ to reorder.</div><div class="project-grid">${sh.clocks.length ? sh.clocks.map((p, i) => sceneTrackerCard("clocks", p, i)).join("") : `<div class="empty">NO NORMAL CLOCKS</div>`}</div></section><section class="clock-zone project-zone"><div class="section-head"><div>PROJECT CLOCKS <small>SCENE / PARTY PROJECTS</small></div><button class="primary" data-scene-add-tracker="projects">+ PROJECT</button></div><div class="drag-help">Shared with everyone in this Scene. Drag ⋮⋮ to reorder.</div><div class="project-grid">${sh.projects.length ? sh.projects.map((p, i) => sceneTrackerCard("projects", p, i)).join("") : `<div class="empty">NO PROJECTS</div>`}</div></section></div></section></div>`;
}

function codexSelectedPhase(entry, m) {
  const max = Math.min(MAX_MONSTER_PHASES, Array.isArray(m?.phases) ? m.phases.length : 0);
  const stored = Number(runtime.codexPhase?.[entry.key]);
  if (Number.isInteger(stored) && stored >= 0 && stored <= max) return stored;
  const active = clamp(Number(m?.activePhase) || 0, 0, max);
  if (monsterTier(m, active) >= 7) return active;
  for (let i = 0; i <= max; i++) if (monsterTier(m, i) >= 7) return i;
  return active;
}
function codexPhaseTabsHTML(entry, m) {
  const selected = codexSelectedPhase(entry, m);
  const max = Math.min(MAX_MONSTER_PHASES, Array.isArray(m?.phases) ? m.phases.length : 0);
  const tabs = [];
  for (let i = 0; i <= max; i++) {
    const tier = monsterTier(m, i), locked = tier < 7;
    tabs.push(`<button class="codex-phase-tab ${selected === i ? "active" : ""} ${locked ? "locked" : ""}" data-codex-phase-key="${esc(entry.key)}" data-codex-phase-index="${i}"><b>${esc(monsterPhaseLabel(m, i))}</b><small>${locked ? "LOCKED" : `STUDY ${tier}+`}</small></button>`);
  }
  return `<div class="codex-phase-tabs">${tabs.join("")}</div>`;
}
function codexMonsterDetails(entry) {
  const m = normalizeMonster(entry.monster || entry), phaseIndex = codexSelectedPhase(entry, m), viewMonster = { ...m, activePhase: phaseIndex }, v = monsterPhaseView(viewMonster, "active"), tier = monsterTier(m, phaseIndex);
  const tabs = codexPhaseTabsHTML(entry, m);
  if (tier < 7) return `<div class="codex-sheet">${tabs}<div class="codex-phase-locked"><b>${esc(monsterPhaseLabel(m, phaseIndex))} · NOT STUDIED</b><span>Study this Form in Scene to unlock its Codex information.</span></div></div>`;
  const codexArt = monsterDisplayArt(viewMonster, "active"), fullArt = codexArt ? `<div class="codex-full-monster-art"><img class="monster-full-art" src="${esc(codexArt)}" alt="${esc(v.name || m.name || "MONSTER")}"></div>` : "";
  const profile = `<div class="codex-stat-grid"><div><span>FORM</span><b>${esc(monsterPhaseLabel(m, phaseIndex))}</b></div><div><span>RANK</span><b>${esc(v.rank || "—")}</b></div><div><span>SPECIES</span><b>${esc(v.species || "—")}</b></div><div><span>MAX HP</span><b>${monsterEffectiveMax(m, "hp", phaseIndex)}</b></div><div><span>MAX MP</span><b>${monsterEffectiveMax(m, "mp", phaseIndex)}</b></div></div>`;
  const tier10 = tier >= 10 ? `<div class="hud-card"><div class="card-title">TRAITS</div><div class="card-body"><div class="action-view-detail">${formatText(stripMediaUrls(v.traits || "—"))}</div>${gifPreview(v.traits || "")}</div></div><div class="hud-card"><div class="card-title">COMBAT / ATTRIBUTES</div><div class="card-body"><div class="party-stat-grid big">${partyStat("DEF", defenseDisplay(v, "defense"))}${partyStat("M.DEF", defenseDisplay(v, "magicDefense"))}${ATTRS.map(k => partyStat(k, `d${currentDie(v,k)}`)).join("")}</div></div></div><div class="hud-card"><div class="card-title">AFFINITIES</div><div class="card-body">${affinityHTML(v, "", "", true)}</div></div>` : "";
  const tier13 = tier >= 13 ? `<div class="hud-card"><div class="card-title">ACTIONS</div><div class="card-body">${monsterActionEditorHTML(viewMonster, "codex", true)}</div></div>` : "";
  return `<div class="codex-sheet">${tabs}${fullArt}${profile}${tier10}${tier13}</div>`;
}
function codexCardHTML(entry) {
  const m = normalizeMonster(entry.monster || entry), phaseIndex = codexSelectedPhase(entry, m), viewMonster = { ...m, activePhase: phaseIndex }, v = monsterPhaseView(viewMonster, "active"), tier = monsterTier(m, phaseIndex);
  const displayArt = monsterDisplayArt(viewMonster, "active"), art = displayArt ? `<div class="collection-board-media monster-full-art-frame"><img class="monster-full-art" src="${esc(displayArt)}" alt="${esc(v.name)}"></div>` : `<div class="collection-board-media collection-board-media-empty codex"><span>◆</span></div>`;
  return `<article class="collection-board-card codex-board-card codex-draggable" draggable="true" data-drag-kind="codex-card" data-drop-kind="codex-card" data-key="${esc(entry.key)}" data-codex-key="${esc(entry.key)}" data-codex-folder="${esc(entry.folderId || "")}" data-codex-target-key="${esc(entry.key)}" data-dom-key="codex:${esc(entry.key)}"><details class="collection-board-details" data-persist-details="codex:${esc(entry.key)}"><summary class="collection-board-summary"><div class="collection-board-top"><span class="collection-board-badge codex">${tier >= 7 ? `STUDY ${tier}+` : "FORM LOCKED"}</span><span class="codex-shared-chip">SHARED</span></div>${art}<div class="collection-board-title"><strong>${esc(v.name || m.name || "MONSTER")}</strong><span>OPEN SHEET <b>⌄</b></span></div><div class="collection-board-desc">${esc(monsterPhaseLabel(m, phaseIndex))} · ${tier >= 7 ? `${esc(v.rank || "UNKNOWN RANK")} · ${esc(v.species || "UNKNOWN SPECIES")}` : "NOT STUDIED"}</div></summary><div class="collection-board-editor codex-editor">${codexMonsterDetails(entry)}</div></details></article>`;
}
function codexAlphabeticalSort(a, b) {
  return String(a?.monster?.name || a?.name || "").localeCompare(String(b?.monster?.name || b?.name || ""), undefined, { sensitivity: "base", numeric: true });
}
function codexEntriesForFolder(folderId = "") {
  return (runtime.codex || []).filter(x => Number(x.learnedTier) >= 7 && String(x.folderId || "") === String(folderId || "")).slice().sort(codexAlphabeticalSort);
}
function codexFolderCollapseKey(folderId = "") { return String(folderId || "__unfiled__"); }
function codexFolderCollapsedState(folderId = "") {
  const k = codexFolderCollapseKey(folderId), prefs = runtime.codexFolderCollapsed || {};
  return Object.prototype.hasOwnProperty.call(prefs, k) ? !!prefs[k] : true;
}
function codexFolderHTML(folder = null, index = -1) {
  const folderId = folder?.id || "", collapseKey = codexFolderCollapseKey(folderId), title = folder ? folder.name : "UNFILED", list = codexEntriesForFolder(folderId), collapsed = codexFolderCollapsedState(folderId);
  const controls = folder ? `<div class="codex-folder-controls"><button class="mini-btn" data-codex-folder-rename="${esc(folderId)}">RENAME</button><button class="danger-soft" data-codex-folder-delete="${esc(folderId)}">×</button></div>` : `<span class="codex-unfiled-mark">DEFAULT</span>`;
  const dragAttrs = folder ? `draggable="true" data-drag-kind="codex-folder" data-key="${esc(folderId)}" data-index="${index}"` : "";
  return `<section class="codex-group-zone codex-folder-zone codex-folder-card-zone ${collapsed ? "collapsed folder-card" : "expanded folder-open"} ${folder ? "stored-folder" : "unfiled-folder"}" data-drop-kind="codex-card" data-codex-folder="${esc(folderId)}" data-dom-key="codex-folder:${esc(folderId || "unfiled")}"><div class="codex-group-head codex-folder-head" ${dragAttrs}><button type="button" class="codex-folder-collapse" data-codex-folder-toggle="${esc(collapseKey)}" title="${collapsed ? "Open folder" : "Close folder"}">${collapsed ? "▸" : "▾"}</button><span class="codex-folder-drag-slot">${folder ? `<span class="drag-handle" title="Drag folder">⋮⋮</span>` : ""}</span><div class="codex-folder-title" data-codex-folder-toggle="${esc(collapseKey)}"><b>${esc(title)} <span class="codex-folder-card-count">(${list.length})</span></b><span>${folder ? "SHARED CODEX FOLDER · CARDS AUTO A→Z" : "CODEX RECORDS NOT YET FILED · CARDS AUTO A→Z"}</span></div>${controls}</div><div class="codex-folder-body"><div class="codex-group-drop-hint" data-drop-kind="codex-card" data-codex-folder="${esc(folderId)}">DRAG CODEX CARDS HERE · AUTO A→Z</div><div class="collection-board codex-board">${list.length ? list.map(codexCardHTML).join("") : `<div class="empty codex-empty">EMPTY FOLDER</div>`}</div></div></section>`;
}
function toggleCodexFolder(key) {
  const k = String(key || "__unfiled__"), prefs = runtime.codexFolderCollapsed || {};
  const current = Object.prototype.hasOwnProperty.call(prefs, k) ? !!prefs[k] : true;
  runtime.codexFolderCollapsed ||= {};
  runtime.codexFolderCollapsed[k] = !current;
  saveCodexFolderCollapsed();
  render();
}
function createCodexFolder() {
  const name = prompt("Folder name?"); if (name === null) return;
  const clean = String(name).trim(); if (!clean) return notify("Folder name cannot be empty");
  runtime.codexFolders ||= [];
  runtime.codexFolders.push({ id: uid(), name: clean, order: runtime.codexFolders.length });
  scheduleCodexSave(); render();
}
function renameCodexFolder(id) {
  const f = (runtime.codexFolders || []).find(x => x.id === id); if (!f) return;
  const name = prompt("Rename folder", f.name); if (name === null) return;
  const clean = String(name).trim(); if (!clean) return notify("Folder name cannot be empty");
  f.name = clean; scheduleCodexSave(); render();
}
function deleteCodexFolder(id) {
  const f = (runtime.codexFolders || []).find(x => x.id === id); if (!f) return;
  if (!confirm(`Delete folder ${f.name}? Its Codex cards will move to UNFILED.`)) return;
  const unfiled = codexEntriesForFolder("");
  let nextOrder = unfiled.length;
  for (const e of runtime.codex || []) if (e.folderId === id) { e.folderId = ""; e.order = nextOrder++; }
  runtime.codexFolders = (runtime.codexFolders || []).filter(x => x.id !== id).map((x,i) => ({ ...x, order:i }));
  if (runtime.codexFolderCollapsed) { delete runtime.codexFolderCollapsed[codexFolderCollapseKey(id)]; saveCodexFolderCollapsed(); }
  scheduleCodexSave(); render();
}
function refreshCodexAgainstTemplateLibrary() {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can refresh the Codex from Template Library.");
  const templates = (runtime.monsterLibrary || []).map(codexTemplateSnapshot);
  const payload = { id: uid(), senderId: runtime.currentPlayer.id, templates, time: Date.now() };
  const result = applyCodexLibrarySnapshot(payload);
  broadcast("codex-library-refresh", payload);
  const summary = `${result.refreshed} record${result.refreshed === 1 ? "" : "s"} refreshed · ${result.removed} removed · shared folders preserved`;
  showToast("CODEX REFRESH", summary, "message", false);
  scheduleCodexSave(); render();
}
function codexHTML() {
  const total = (runtime.codex || []).filter(x => Number(x.learnedTier) >= 7).length;
  const refresh = runtime.currentPlayer.role === "GM" ? `<button class="mini-btn" data-action="refresh-codex">REFRESH CODEX</button>` : "";
  const folders = (runtime.codexFolders || []).slice().sort((a,b)=>a.order-b.order);
  return `<div class="view active"><section class="clock-project-page codex-page"><div class="card-title"><div>CODEX <span>ROOM-SHARED STUDY & FOLDERS</span></div><div class="codex-head-actions"><small>${total} ENTRIES · EVERYONE USES THE SAME CODEX</small><button class="primary" data-action="create-codex-folder">+ FOLDER</button>${refresh}</div></div><div class="codex-shared-note">STUDY 7 / 10 / 13 IS SHARED WITH THE WHOLE ROOM · CARDS AUTO-SORT A→Z INSIDE EACH FOLDER</div><div class="monster-folder-context-help codex-folder-context-help">RIGHT-CLICK A CODEX CARD → <b>SEND TO FOLDER…</b></div><div class="codex-body codex-group-layout codex-folder-layout">${codexFolderHTML(null, -1)}${folders.map((f,i)=>`<div class="codex-folder-sort-wrap ${codexFolderCollapsedState(f.id) ? "is-collapsed" : "is-expanded"}" data-drop-kind="codex-folder" data-key="${esc(f.id)}" data-index="${i}">${codexFolderHTML(f,i)}</div>`).join("")}</div></section></div>`;
}

function attrOpts(sel, s) { return ATTRS.map(k => `<option value="${k}" ${k === sel ? "selected" : ""}>${k} · d${currentDie(s, k)}</option>`).join(""); }
function damageOpts(sel) { return ACTION_ELEMENTS.map(v => { const e = elementInfo(v); return `<option value="${v}" ${v === sel ? "selected" : ""}>${e.option}</option>`; }).join(""); }
function rollTargetOptions(selected = "") {
  const opts = [`<option value="">NO TARGET</option>`];
  for (const p of allParty()) {
    const raw = p.metadata?.[META_KEY]; if (!raw || raw.deleted) continue;
    const s = normalizeState(raw); opts.push(`<option value="player:${esc(p.id)}" ${selected === `player:${p.id}` ? "selected" : ""}>CHARACTER · ${esc(s.name || p.name)}</option>`);
  }
  for (const m of runtime.sceneMonsters) { const v = monsterPhaseView(m, "active"); opts.push(`<option value="monster:${esc(m.id)}" ${selected === `monster:${m.id}` ? "selected" : ""}>MONSTER · ${esc(v.name)}</option>`); }
  return opts.join("");
}
function actionSkillMedia(note = "", element = "none") {
  const url = mediaFromText(note || "");
  if (url) return `<div class="action-skill-media"><img src="${esc(url)}" alt="Action art"></div>`;
  return `<div class="action-skill-media action-skill-media-empty el-bg-${elementInfo(element).color}">${elementIcon(element, "action-skill-big-icon")}</div>`;
}
function actionSkillDescription(note = "") {
  const clean = stripMediaUrls(note || "");
  return clean ? `<div class="action-skill-desc">${formatText(clean)}</div>` : `<div class="action-skill-desc action-desc-empty">NO DESCRIPTION</div>`;
}
function actionCostLine(cost = "") {
  const value = String(cost || "").trim();
  return value ? `<div class="action-cost-line"><b>COST</b><span>${formatText(value)}</span></div>` : "";
}
function actionExtraMeta(target = "", typeText = "") {
  const t = String(target || "").trim(), type = String(typeText || "").trim();
  if (!t && !type) return "";
  return `<div class="action-extra-meta">${t ? `<span><b>TARGET</b>${formatText(t)}</span>` : ""}${type ? `<span><b>TYPE</b>${formatText(type)}</span>` : ""}</div>`;
}
function actionTypeClass(category = "") {
  const type = normalizeActionType(category);
  if (type === "MELEE ATTACK") return "type-melee";
  if (type === "RANGE ATTACK") return "type-range";
  if (type === "TWO WEAPON") return "type-two-weapon";
  if (type === "SPELL") return "type-spell";
  if (type === "GUARD") return "type-guard";
  if (type === "COVER ALLY") return "type-cover";
  return "type-other";
}
function cutInPaletteHTML(action, owner, index) {
  const selected = normalizeCutInColor(action?.cutInColor), name = `cutin-color-${owner}-${index}`;
  return `<fieldset class="cutin-color-picker action-edit-wide"><legend>CUT-IN COLOR · 10 COLORS</legend><div class="cutin-color-grid">${CUTIN_COLORS.map(color=>`<label title="${esc(color.label)}" style="--cutin-swatch:${color.hex}"><input type="radio" name="${esc(name)}" data-remote-action="${owner}:${index}:cutInColor" value="${color.key}" ${selected===color.key?"checked":""}><span></span><small>${color.label}</small></label>`).join("")}</div><p>${action?.cutIn?`ACTIVE · ${esc(cutInColorInfo(selected).label)}`:"Enable SKILL CUT-IN to show the selected color."}</p></fieldset>`;
}
function arcanaCutInHTML(entry, owner, index) {
  const selected=normalizeCutInColor(entry?.cutInColor),info=cutInColorInfo(selected),base=`lists.arcana.${index}`,name=`arcana-cutin-${owner}-${index}`;
  return `<div class="arcana-cutin-editor field detail-field"><label class="skill-cutin-toggle"><input type="checkbox" data-remote-field="${owner}:${base}.cutIn" ${entry?.cutIn?"checked":""}><span><b>SKILL CUT-IN</b><small>Show this Arcanum with your Portrait before its result card.</small></span></label><fieldset class="cutin-color-picker"><legend>CUT-IN COLOR · 10 COLORS</legend><div class="cutin-color-grid">${CUTIN_COLORS.map(color=>`<label title="${esc(color.label)}" style="--cutin-swatch:${color.hex}"><input type="radio" name="${esc(name)}" data-remote-field="${owner}:${base}.cutInColor" value="${color.key}" ${selected===color.key?"checked":""}><span></span><small>${color.label}</small></label>`).join("")}</div><p>${entry?.cutIn?`ACTIVE · ${esc(info.label)}`:"Enable SKILL CUT-IN to show the selected color."}</p></fieldset></div>`;
}
function signedCompact(value, hideZero = false) {
  const n = Number(value) || 0;
  if (hideZero && !n) return "";
  return `${n >= 0 ? "+" : ""}${n}`;
}
function actionCompactFormula(a, sheet, accMod = null, damageBonus = null) {
  if (isGuardAction(a)) return `<div class="action-compact-formula no-roll guard-rule">RESIST ALL DAMAGE · OPPOSED +2</div>`;
  if (isCoverAllyAction(a)) return `<div class="action-compact-formula no-roll guard-rule">GUARD + COVER 1 ALLY · BLOCK ENEMY MELEE</div>`;
  if (a.mode !== "ROLL") return `<div class="action-compact-formula no-roll">NO ROLL</div>`;
  const acc = accMod === null ? (Number(a.mod) || 0) : Number(accMod) || 0;
  const hr = damageBonus === null ? (Number(a.damageHR) || 0) : Number(damageBonus) || 0;
  const accText = signedCompact(acc, true);
  const twoWeapon = isTwoWeaponAction(a);
  const hrText = twoWeapon ? `HR 0${hr ? ` · BONUS ${signedCompact(hr)}` : ""}` : (hr ? `HR ${signedCompact(hr)}` : "HR");
  return `<div class="action-compact-formula${twoWeapon ? " two-weapon" : ""}"><span><b>${esc(a.attr1)}</b> d${currentDie(sheet, a.attr1)}</span><i>+</i><span><b>${esc(a.attr2)}</b> d${currentDie(sheet, a.attr2)}</span>${accText ? `<strong>${accText}</strong>` : ""}<em>→</em><span class="formula-hr">${hrText}</span></div>`;
}
function remoteActionRow(a, i, owner, s) {
  const af = key => `data-remote-action="${owner}:${i}:${key}"`;
  const cutInColor = cutInColorInfo(a.cutInColor);
  const rollFields = a.mode === "ROLL" ? `
    <label class="action-edit-field"><span>STAT A</span><select ${af("attr1")}>${attrOpts(a.attr1, s)}</select></label>
    <label class="action-edit-field"><span>STAT B</span><select ${af("attr2")}>${attrOpts(a.attr2, s)}</select></label>
    <label class="action-edit-field"><span>ACCURACY MOD</span><input type="number" ${af("mod")} value="${a.mod || 0}" inputmode="numeric"></label>
    <label class="action-edit-field hr-field"><span>${isTwoWeaponAction(a) ? "DAMAGE BONUS" : "HR / DAMAGE BONUS"}</span><input class="action-hr-input" type="number" ${af("damageHR")} value="${Number(a.damageHR) || 0}" inputmode="numeric">${isTwoWeaponAction(a) ? `<small>TWO WEAPON · HR is treated as 0 for damage.</small>` : ""}</label>` : `<div class="no-roll-label action-edit-wide">NO CHECK REQUIRED</div>`;
  return `<div class="action-card sortable-card action-skill-card drag-delete-card" data-drop-kind="actions" data-drop-owner="${owner}" ${boardDragAttrs("actions", i, owner, "actions", "action")}><details class="action-editor-details action-skill-details" data-persist-details="action:${esc(owner)}:${i}"><summary class="action-skill-summary"><div class="action-skill-top">${dragHandle("actions", i, owner)}<span class="action-type-badge ${actionTypeClass(a.category)}">${esc(normalizeActionType(a.category))}</span>${elementChip(a.element, true)}${a.cutIn ? `<span class="skill-cutin-badge" style="--cutin-badge:${cutInColor.hex}">CUT-IN · ${esc(cutInColor.label)}</span>` : ""}</div>${actionSkillMedia(a.note, a.element)}<div class="action-skill-title"><strong>${esc(a.name || "NEW ACTION")}</strong><span class="action-edit-cue action-open-cue" aria-hidden="true"><b>⌄</b></span></div>${actionCompactFormula(a, s)}${actionExtraMeta(a.target, a.actionTypeText)}${actionCostLine(a.cost)}${actionSkillDescription(a.note)}<div class="action-skill-controls"><button class="mini-btn" data-send-action="${owner}:${i}">SEND</button>${isGuardFamilyAction(a) ? `<button class="primary" data-use-guard-action="player:${owner}:${i}">USE</button>` : a.mode === "ROLL" ? `<button class="primary" data-roll-shared="${owner}:${i}">ROLL</button>` : ""}</div></summary><div class="action-editor-inner"><div class="action-editor-heading"><strong>EDIT ACTION</strong><small>Player actions do not use Random Target.</small></div><div class="action-editor-form">
    <label class="action-edit-field action-edit-name"><span>ACTION NAME</span><div class="action-name-wrap">${dragHandle("actions", i, owner)}<input class="action-name" ${af("name")} value="${esc(a.name)}"></div></label>
    <label class="action-edit-field"><span>ROLL MODE</span><select ${af("mode")}><option ${a.mode === "ROLL" ? "selected" : ""}>ROLL</option><option ${a.mode === "NO ROLL" ? "selected" : ""}>NO ROLL</option></select></label>
    <label class="action-edit-field"><span>ACTION TYPE</span><select ${af("category")}>${actionTypeOptionsHTML(a.category)}</select></label>
    <label class="action-edit-field"><span>ELEMENT</span><div class="element-select-field">${elementIcon(a.element)}<select ${af("element")}>${damageOpts(a.element)}</select></div></label>
    <label class="action-edit-field"><span>COST</span><input ${af("cost")} value="${esc(a.cost || "")}" placeholder="MP 10 / IP 1 / HP 5 / Other"></label>
    <label class="action-edit-field"><span>TARGET</span><input ${af("target")} value="${esc(a.target || "")}" placeholder="1 Enemy / Self / All Allies / Area"></label>
    <label class="action-edit-field"><span>TYPE</span><input ${af("actionTypeText")} value="${esc(a.actionTypeText || "")}" placeholder="Area / Reaction / Utility / Multi"></label>
    ${rollFields}
    <label class="action-edit-field action-edit-wide"><span>DESCRIPTION / GIF LINK</span><textarea class="action-note" ${af("note")} placeholder="Effect / description / GIF link">${esc(a.note || "")}</textarea></label>
    <div class="action-edit-wide">${gifPreview(a.note || "")}</div>
    <div class="action-effect-toggles action-edit-wide ${a.mode === "ROLL" ? "" : "single"}">${a.mode === "ROLL" ? `<label class="frenzy"><input type="checkbox" data-remote-action-check="${owner}:${i}:frenzy" ${a.frenzy ? "checked" : ""}><span><b>FRENZY</b><small>Matching dice can become a Critical.</small></span></label>` : ""}<label class="skill-cutin-toggle"><input type="checkbox" data-remote-action-check="${owner}:${i}:cutIn" ${a.cutIn ? "checked" : ""}><span><b>SKILL CUT-IN</b><small>Show your Portrait with the selected color beside this Action result.</small></span></label></div>${cutInPaletteHTML(a,owner,i)}
    <div class="action-full-controls action-edit-wide"><button class="danger-btn" data-remote-remove-action="${owner}:${i}">DELETE ACTION</button></div>
  </div></div></details></div>`;
}
function remoteActionsHTML(owner, s) {
  return `<div><div class="section-head">PREPARED ACTIONS <button class="primary" data-remote-add-action="${owner}">+ NEW ACTION</button></div><div class="drag-help">Skill Board · drag cards to reorder · drag outside the extension window and release to delete.</div>${s.actions.length ? `<div class="actions-skill-board">${s.actions.map((a, i) => remoteActionRow(a, i, owner, s)).join("")}</div>` : `<div class="empty">NO PREPARED ACTIONS</div>`}</div>`;
}

function monsterLibraryAlphabeticalSort(a, b) { return String(a?.name || "").localeCompare(String(b?.name || ""), undefined, { sensitivity: "base", numeric: true }); }
function monsterTemplatesForFolder(folderId = "") { return (runtime.monsterLibrary || []).filter(m => String(m.folderId || "") === String(folderId || "")).slice().sort(monsterLibraryAlphabeticalSort); }
function monsterFolderCollapseKey(folderId = "") { return String(folderId || "__unfiled__"); }
function monsterFolderCollapsedState(folderId = "") {
  const k = monsterFolderCollapseKey(folderId), prefs = runtime.monsterFolderCollapsed || {};
  return Object.prototype.hasOwnProperty.call(prefs, k) ? !!prefs[k] : true;
}
function monsterLibraryCardHTML(m) {
  return `<article class="monster-library-card monster-template-card" draggable="true" data-drag-kind="monster-template-card" data-key="${esc(m.id)}"><div class="monster-lib-portrait">${m.portrait ? `<img src="${esc(m.portrait)}">` : `<span>MONSTER</span>`}</div><div class="monster-lib-body"><div class="monster-template-card-title"><span class="drag-handle" title="Drag template to a folder">⋮⋮</span><strong>${esc(m.name)}</strong></div><small>${esc(villainTypeLabel(m.villainType))} · ${esc(m.species || "SPECIES UNSET")} · RANK ${esc(normalizeMonsterRank(m.rank))} · LV ${m.normalLevel ?? m.level}→${m.level}</small>${statusChips(m)}<div class="monster-lib-stats"><span>HP <b>${monsterEffectiveMax(m, "hp", 0)}</b></span><span>MP <b>${monsterEffectiveMax(m, "mp", 0)}</b></span><span>IP <b>${m.ip?.current || 0}/${m.ip?.max || 0}</b></span><span>FP <b>${Number(m.fp) || 0}</b></span><span>DEF <b>${defenseValue(m, "defense")}</b></span><span>M.DEF <b>${defenseValue(m, "magicDefense")}</b></span><span>TURNS <b>${monsterRankTurns(m.rank)}</b></span><span>CHECK ADJ <b>${monsterSigned(monsterLevelAccuracyBonus(m.normalLevel, m.level))}</b></span><span>DMG ADJ <b>${monsterSigned(monsterLevelDamageBonus(m.normalLevel, m.level))}</b></span><span>ACTIONS <b>${m.actions.length}</b></span><span>PHASES <b>${m.phases.length + 1}/${MAX_MONSTER_PHASES + 1}</b></span></div><div class="monster-lib-actions"><button class="mini-btn" data-monster-edit="${esc(m.id)}">EDIT</button><button class="mini-btn duplicate-template-btn" data-monster-duplicate-template="${esc(m.id)}" title="Create an independent copy in this folder">DUPLICATE</button><button class="primary enemy-spawn-btn" data-monster-spawn-enemy="${esc(m.id)}">SEND TO ENEMY</button><button class="mini-btn ally-spawn-btn" data-monster-spawn-ally="${esc(m.id)}">SEND TO ALLY</button><button class="danger-btn" data-monster-delete-template="${esc(m.id)}">×</button></div></div></article>`;
}

function closeMonsterTemplateContextMenu() {
  document.getElementById("monster-template-context-menu")?.remove();
}
function moveMonsterTemplateToFolder(monsterId, folderId = "") {
  const m = (runtime.monsterLibrary || []).find(x => String(x.id) === String(monsterId));
  if (!m) return;
  const target = String(folderId || "");
  if (String(m.folderId || "") === target) { closeMonsterTemplateContextMenu(); return; }
  m.folderId = target;
  m.updatedAt = Date.now();
  saveMonsterLibrary(runtime.monsterLibrary);
  closeMonsterTemplateContextMenu();
  render();
}
function positionMonsterTemplateContextMenu(menu, x, y) {
  if (!menu) return;
  const pad = 8;
  menu.style.left = `${Math.max(pad, Number(x) || pad)}px`;
  menu.style.top = `${Math.max(pad, Number(y) || pad)}px`;
  requestAnimationFrame(() => {
    if (!menu.isConnected) return;
    const r = menu.getBoundingClientRect();
    const left = Math.max(pad, Math.min(Number(x) || pad, window.innerWidth - r.width - pad));
    const top = Math.max(pad, Math.min(Number(y) || pad, window.innerHeight - r.height - pad));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  });
}
function openMonsterTemplateContextMenu(e, monsterId) {
  if (runtime.currentPlayer.role !== "GM") return;
  const m = (runtime.monsterLibrary || []).find(x => String(x.id) === String(monsterId));
  if (!m) return;
  e.preventDefault();
  closeMonsterTemplateContextMenu();
  closeCodexContextMenu();
  const folders = (runtime.monsterLibraryFolders || []).slice().sort((a,b) => Number(a.order) - Number(b.order));
  const current = String(m.folderId || "");
  const folderButtons = [{ id: "", name: "UNFILED" }, ...folders].map(f => {
    const id = String(f.id || ""), active = id === current;
    return `<button type="button" class="monster-context-folder${active ? " current" : ""}" data-context-folder="${esc(id)}" ${active ? "disabled" : ""}><span>${active ? "✓" : ""}</span><b>${esc(f.name || "UNFILED")}</b></button>`;
  }).join("");
  const menu = document.createElement("div");
  menu.id = "monster-template-context-menu";
  menu.className = "monster-template-context-menu";
  menu.dataset.monsterId = String(m.id);
  menu.innerHTML = `<div class="monster-context-title"><b>${esc(m.name || "MONSTER")}</b><span>TEMPLATE</span></div><button type="button" class="monster-context-main" data-context-send-folder>SEND TO FOLDER… <b>›</b></button><div class="monster-context-folder-list" data-context-folder-list hidden>${folderButtons}</div>`;
  document.body.appendChild(menu);
  positionMonsterTemplateContextMenu(menu, e.clientX, e.clientY);
  menu.addEventListener("click", ev => {
    const send = ev.target.closest("[data-context-send-folder]");
    if (send) {
      ev.preventDefault(); ev.stopPropagation();
      const list = menu.querySelector("[data-context-folder-list]");
      list.hidden = !list.hidden;
      send.classList.toggle("open", !list.hidden);
      positionMonsterTemplateContextMenu(menu, e.clientX, e.clientY);
      return;
    }
    const folder = ev.target.closest("[data-context-folder]");
    if (folder && !folder.disabled) {
      ev.preventDefault(); ev.stopPropagation();
      moveMonsterTemplateToFolder(menu.dataset.monsterId, folder.dataset.contextFolder || "");
    }
  });
}
function handleMonsterTemplateContextMenu(e) {
  const card = e.target?.closest?.(".monster-template-card[data-key]");
  if (!card || !card.isConnected) return;
  openMonsterTemplateContextMenu(e, card.dataset.key);
}
function closeCodexContextMenu() {
  document.getElementById("codex-context-menu")?.remove();
}
function moveCodexEntryToFolder(codexKey, folderId = "") {
  const entry = (runtime.codex || []).find(x => String(x.key) === String(codexKey));
  if (!entry) return;
  const target = String(folderId || ""), current = String(entry.folderId || "");
  if (current === target) { closeCodexContextMenu(); return; }
  const oldList = (runtime.codex || []).filter(x => String(x.folderId || "") === current && x.key !== entry.key).sort(codexAlphabeticalSort);
  oldList.forEach((x, i) => x.order = i);
  const targetList = (runtime.codex || []).filter(x => String(x.folderId || "") === target && x.key !== entry.key).sort(codexAlphabeticalSort);
  entry.folderId = target;
  targetList.push(entry);
  targetList.sort(codexAlphabeticalSort).forEach((x, i) => x.order = i);
  scheduleCodexSave();
  closeCodexContextMenu();
  render();
}
function openCodexContextMenu(e, codexKey) {
  const entry = (runtime.codex || []).find(x => String(x.key) === String(codexKey));
  if (!entry) return;
  e.preventDefault();
  closeCodexContextMenu();
  closeMonsterTemplateContextMenu();
  const folders = (runtime.codexFolders || []).slice().sort((a,b) => Number(a.order) - Number(b.order));
  const current = String(entry.folderId || "");
  const folderButtons = [{ id: "", name: "UNFILED" }, ...folders].map(f => {
    const id = String(f.id || ""), active = id === current;
    return `<button type="button" class="monster-context-folder${active ? " current" : ""}" data-codex-context-folder="${esc(id)}" ${active ? "disabled" : ""}><span>${active ? "✓" : ""}</span><b>${esc(f.name || "UNFILED")}</b></button>`;
  }).join("");
  const m = normalizeMonster(entry.monster || entry);
  const menu = document.createElement("div");
  menu.id = "codex-context-menu";
  menu.className = "monster-template-context-menu codex-context-menu";
  menu.dataset.codexKey = String(entry.key);
  menu.innerHTML = `<div class="monster-context-title"><b>${esc(m.name || "CODEX ENTRY")}</b><span>CODEX</span></div><button type="button" class="monster-context-main" data-codex-context-send-folder>SEND TO FOLDER… <b>›</b></button><div class="monster-context-folder-list" data-codex-context-folder-list hidden>${folderButtons}</div>`;
  document.body.appendChild(menu);
  positionMonsterTemplateContextMenu(menu, e.clientX, e.clientY);
  menu.addEventListener("click", ev => {
    const send = ev.target.closest("[data-codex-context-send-folder]");
    if (send) {
      ev.preventDefault(); ev.stopPropagation();
      const list = menu.querySelector("[data-codex-context-folder-list]");
      list.hidden = !list.hidden;
      send.classList.toggle("open", !list.hidden);
      positionMonsterTemplateContextMenu(menu, e.clientX, e.clientY);
      return;
    }
    const folder = ev.target.closest("[data-codex-context-folder]");
    if (folder && !folder.disabled) {
      ev.preventDefault(); ev.stopPropagation();
      moveCodexEntryToFolder(menu.dataset.codexKey, folder.dataset.codexContextFolder || "");
    }
  });
}
function handleCodexContextMenu(e) {
  const card = e.target?.closest?.(".codex-board-card[data-codex-key]");
  if (!card || !card.isConnected) return;
  openCodexContextMenu(e, card.dataset.codexKey);
}
function monsterLibraryFolderHTML(folder = null, index = -1) {
  const folderId = folder?.id || "", collapseKey = monsterFolderCollapseKey(folderId), title = folder ? folder.name : "UNFILED", list = monsterTemplatesForFolder(folderId), collapsed = monsterFolderCollapsedState(folderId);
  const controls = folder ? `<div class="codex-folder-controls monster-folder-controls"><button class="mini-btn" data-monster-folder-rename="${esc(folderId)}">RENAME</button><button class="danger-soft" data-monster-folder-delete="${esc(folderId)}">×</button></div>` : `<span class="codex-unfiled-mark">DEFAULT</span>`;
  const dragAttrs = folder ? `draggable="true" data-drag-kind="monster-template-folder" data-key="${esc(folderId)}" data-index="${index}"` : "";
  return `<section class="codex-group-zone codex-folder-zone monster-template-folder-zone ${collapsed ? "collapsed folder-card" : "expanded folder-open"} ${folder ? "stored-folder" : "unfiled-folder"}" data-drop-kind="monster-template-card" data-monster-template-folder="${esc(folderId)}"><div class="codex-group-head codex-folder-head monster-template-folder-head" ${dragAttrs}><button type="button" class="codex-folder-collapse" data-monster-folder-toggle="${esc(collapseKey)}" title="${collapsed ? "Open folder" : "Close folder"}">${collapsed ? "▸" : "▾"}</button><span class="codex-folder-drag-slot">${folder ? `<span class="drag-handle" title="Drag folder">⋮⋮</span>` : ""}</span><div class="codex-folder-title" data-monster-folder-toggle="${esc(collapseKey)}"><b>${esc(title)} <span class="monster-folder-count">(${list.length})</span></b><span>${folder ? "TEMPLATE FOLDER · DRAG TO REORDER · CARDS AUTO A→Z" : "TEMPLATES NOT YET FILED · CARDS AUTO A→Z"}</span></div>${controls}</div><div class="codex-folder-body"><div class="codex-group-drop-hint" data-drop-kind="monster-template-card" data-monster-template-folder="${esc(folderId)}">DRAG MONSTER TEMPLATES HERE · AUTO A→Z</div><div class="monster-library-grid">${list.length ? list.map(monsterLibraryCardHTML).join("") : `<div class="empty monster-template-empty">EMPTY FOLDER</div>`}</div></div></section>`;
}
function toggleMonsterFolder(key) {
  const k = String(key || "__unfiled__"), prefs = runtime.monsterFolderCollapsed || {};
  const current = Object.prototype.hasOwnProperty.call(prefs, k) ? !!prefs[k] : true;
  runtime.monsterFolderCollapsed ||= {}; runtime.monsterFolderCollapsed[k] = !current; saveMonsterFolderCollapsed(); render();
}
function createMonsterFolder() {
  if (runtime.currentPlayer.role !== "GM") return;
  const name = prompt("New Template Library folder name:", "NEW FOLDER"); if (name == null) return;
  const clean = String(name).trim(); if (!clean) return notify("Folder name cannot be empty.");
  runtime.monsterLibraryFolders ||= []; runtime.monsterLibraryFolders.push({ id: uid(), name: clean, order: runtime.monsterLibraryFolders.length }); saveMonsterLibraryFolders(runtime.monsterLibraryFolders); render();
}
function renameMonsterFolder(id) {
  const f = (runtime.monsterLibraryFolders || []).find(x => x.id === id); if (!f) return;
  const name = prompt("Rename Template Library folder:", f.name); if (name == null) return;
  const clean = String(name).trim(); if (!clean) return notify("Folder name cannot be empty.");
  f.name = clean; saveMonsterLibraryFolders(runtime.monsterLibraryFolders); render();
}
function deleteMonsterFolder(id) {
  const f = (runtime.monsterLibraryFolders || []).find(x => x.id === id); if (!f) return;
  if (!confirm(`Delete folder ${f.name}? Its monster templates will move to UNFILED.`)) return;
  for (const m of runtime.monsterLibrary || []) if (String(m.folderId || "") === String(id)) m.folderId = "";
  runtime.monsterLibraryFolders = (runtime.monsterLibraryFolders || []).filter(x => x.id !== id).map((x,i)=>({ ...x, order:i }));
  if (runtime.monsterFolderCollapsed) { delete runtime.monsterFolderCollapsed[monsterFolderCollapseKey(id)]; saveMonsterFolderCollapsed(); }
  saveMonsterLibrary(runtime.monsterLibrary); saveMonsterLibraryFolders(runtime.monsterLibraryFolders); render();
}
function monsterLibraryHTML() {
  if (runtime.monsterEditId) {
    const m = runtime.monsterLibrary.find(x => x.id === runtime.monsterEditId);
    if (!m) { runtime.monsterEditId = null; return monsterLibraryHTML(); }
    return `<div class="view active">${monsterTemplateEditorHTML(m)}</div>`;
  }
  const folders = (runtime.monsterLibraryFolders || []).slice().sort((a,b)=>a.order-b.order);
  const total = (runtime.monsterLibrary || []).length;
  return `<div class="view active"><section class="party-roster monster-library"><div class="card-title"><div>MONSTER <span>GM ONLY · TEMPLATE LIBRARY</span></div><div class="monster-library-head-actions"><small>${total} TEMPLATES</small><button class="mini-btn" data-action="create-monster-folder">+ FOLDER</button><button class="primary" data-action="add-monster">+ NEW MONSTER</button></div></div><div class="monster-folder-context-help">RIGHT-CLICK A MONSTER CARD → <b>SEND TO FOLDER…</b></div><div class="party-roster-body"><div class="monster-template-folder-layout">${monsterLibraryFolderHTML(null, -1)}${folders.map((f,i)=>`<div class="monster-template-folder-sort-wrap ${monsterFolderCollapsedState(f.id) ? "is-collapsed" : "is-expanded"}" data-drop-kind="monster-template-folder" data-key="${esc(f.id)}" data-index="${i}">${monsterLibraryFolderHTML(f,i)}</div>`).join("")}</div></div></section></div>`;
}
function monsterPhaseTabsHTML(m, mode = "lib") {
  const selected = monsterPhaseIndex(m, mode);
  const buttons = [0, ...m.phases.map((_, i) => i + 1)].map(i => {
    const study = mode === "active" ? `<em>STUDY ${STUDY_LABELS[monsterTier(m, i)]}</em>` : "";
    return `<button class="monster-phase-tab ${selected === i ? "active" : ""}" data-monster-phase-tab="${mode}:${esc(m.id)}:${i}"><span>${esc(monsterPhaseLabel(m, i))}</span>${i ? `<small>${esc(m.phases[i - 1]?.name || "FORM")}</small>` : `<small>${esc(m.name || "BASE FORM")}</small>`}${study}</button>`;
  }).join("");
  const canEdit = runtime.currentPlayer.role === "GM";
  const add = canEdit && m.phases.length < MAX_MONSTER_PHASES ? `<button class="monster-phase-add" data-monster-add-phase="${mode}:${esc(m.id)}">+ PHASE</button>` : "";
  const remove = canEdit && selected > 0 ? `<button class="monster-phase-remove" data-monster-remove-phase="${mode}:${esc(m.id)}:${selected}">REMOVE ${esc(monsterPhaseLabel(m, selected))}</button>` : "";
  return `<div class="monster-phase-strip"><div class="monster-phase-tabs">${buttons}${add}</div><div class="monster-phase-meta"><b>FORM ${esc(monsterPhaseLabel(m, selected))}</b><span>MAX ${MAX_MONSTER_PHASES + 1} PHASES</span>${remove}</div></div>`;
}
function monsterTemplateEditorHTML(m) {
  runtime.monsterPhase = clamp(Number(runtime.monsterPhase) || 0, 0, m.phases.length);
  const v = monsterPhaseView(m, "lib");
  const displayArt = monsterDisplayArt(m, "lib");
  const tabs = ["sheet", "actions", "rules"].map(t => `<button class="subtab ${runtime.monsterTab === t ? "active" : ""}" data-monster-tab="${t}">${t === "rules" ? "SPECIAL RULE" : t.toUpperCase()}</button>`).join("");
  return `<section class="shared-sheet monster-editor"><div class="shared-sheet-header"><button class="mini-btn" data-action="monster-back">‹ MONSTER</button><div class="shared-sheet-char">${displayArt ? `<img class="monster-full-art" src="${esc(displayArt)}">` : `<div class="shared-head-empty">M</div>`}<div><strong>${esc(v.name)}</strong><small>MONSTER TEMPLATE · ${esc(monsterPhaseLabel(m, runtime.monsterPhase))} · GM ONLY</small></div></div><div class="shared-head-stats"><span>HP <b>${monsterEffectiveMax(m, "hp", runtime.monsterPhase)}</b></span><span>MP <b>${monsterEffectiveMax(m, "mp", runtime.monsterPhase)}</b></span><span>IP <b>${m.ip?.current || 0}/${m.ip?.max || 0}</b></span><span>FP <b>${Number(m.fp) || 0}</b></span><span>TURNS <b>${monsterRankTurns(v.rank)}</b></span><span>CHECK ADJ <b>${monsterSigned(monsterLevelAccuracyBonus(v.normalLevel, v.level))}</b></span><span>DMG ADJ <b>${monsterSigned(monsterLevelDamageBonus(v.normalLevel, v.level))}</b></span><span>DEF <b>${defenseValue(v, "defense")}</b></span><span>M.DEF <b>${defenseValue(v, "magicDefense")}</b></span><button class="primary enemy-spawn-btn" data-monster-spawn-enemy="${esc(m.id)}">SEND TO ENEMY</button><button class="mini-btn ally-spawn-btn" data-monster-spawn-ally="${esc(m.id)}">SEND TO ALLY</button></div></div>${monsterPhaseTabsHTML(m, "lib")}<div class="shared-sheet-tabs">${tabs}</div><div class="shared-sheet-body">${monsterTemplateTabHTML(m)}</div></section>`;
}
function monsterLibInput(id, path, value, type = "text", extra = "") { return `<input type="${type}" data-monster-lib-field="${id}:${path}" value="${esc(value)}" ${extra}>`; }
function monsterVillainTypeSelect(m, mode = "lib") {
  const attr = mode === "lib" ? `data-monster-lib-field="${m.id}:villainType"` : `data-active-monster-field="${m.id}:villainType"`;
  return `<select ${attr}>${VILLAIN_TYPES.map(v => `<option value="${v}" ${normalizeVillainType(m.villainType) === v ? "selected" : ""}>${VILLAIN_TYPE_LABELS[v]}</option>`).join("")}</select>`;
}
function monsterUltimaResourceHTML(m, mode = "lib") {
  const max = VILLAIN_UP_MAX[normalizeVillainType(m.villainType)];
  if (!max) return "";
  const current = mode === "lib" ? monsterLibInput(m.id, "up.current", m.up.current, "number", `min="0" max="${max}"`) : activeInput(m, "up.current", m.up.current, "number", `min="0" max="${max}"`);
  const adjust = mode === "active" ? `<button class="res-btn" data-quick-resource="monster:${m.id}:up:-1">−</button>` : "";
  const adjustUp = mode === "active" ? `<button class="res-btn" data-quick-resource="monster:${m.id}:up:1">+</button>` : "";
  return `<div class="resource"><div class="resource-head"><span>ULTIMA POINT (UP)</span><span class="res-controls">${adjust}${current}<span>/ ${max}</span>${adjustUp}</span></div><div class="track"><div class="fill up" style="width:${pct(m.up.current, max)}%"></div></div></div>`;
}
function monsterManualPoolHTML(m, mode = "active", key = "ip", label = "IP") {
  const r = m[key] || { current: 0, max: 0 };
  const input = (path, value, extra = "") => mode === "lib" ? monsterLibInput(m.id, path, value, "number", extra) : activeInput(m, path, value, "number", extra);
  const minus = mode === "active" ? `<button class="res-btn" data-quick-resource="monster:${m.id}:${key}:-1">−</button>` : "";
  const plus = mode === "active" ? `<button class="res-btn" data-quick-resource="monster:${m.id}:${key}:1">+</button>` : "";
  return `<div class="resource monster-manual-resource"><div class="resource-head"><span>${label}</span><span class="res-controls">${minus}${input(`${key}.current`, r.current, 'min="0" inputmode="numeric"')}<span>/</span>${input(`${key}.max`, r.max, 'min="0" inputmode="numeric"')}${plus}</span></div><div class="track"><div class="fill ${key}" style="width:${pct(r.current, r.max)}%"></div></div></div>`;
}
function monsterFpResourceHTML(m, mode = "active") {
  const input = mode === "lib" ? monsterLibInput(m.id, "fp", m.fp, "number", 'min="0" inputmode="numeric"') : activeInput(m, "fp", m.fp, "number", 'min="0" inputmode="numeric"');
  const minus = mode === "active" ? `<button class="res-btn" data-quick-resource="monster:${m.id}:fp:-1">−</button>` : "";
  const plus = mode === "active" ? `<button class="res-btn" data-quick-resource="monster:${m.id}:fp:1">+</button>` : "";
  return `<div class="resource monster-manual-resource fp-resource"><div class="resource-head"><span>FP</span><span class="res-controls">${minus}${input}${plus}</span></div><div class="track"><div class="fill fp" style="width:${Math.min(100, Math.max(0, Number(m.fp) || 0) * 20)}%"></div></div></div>`;
}
function monsterLibTextarea(id, path, value, placeholder = "") { return `<textarea data-monster-lib-field="${id}:${path}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>${gifPreview(value)}`; }
function monsterTemplateTabHTML(m) {
  const v = monsterPhaseView(m, "lib");
  const displayArt = monsterDisplayArt(m, "lib");
  const path = key => monsterPhasePath(m, "lib", key);
  if (runtime.monsterTab === "sheet") return `<div class="shared-sheet-grid"><aside class="shared-portrait-panel">${displayArt ? `<img class="portrait monster-full-art" src="${esc(displayArt)}">` : `<div class="portrait-empty">SELECT MONSTER PORTRAIT ART</div>`}${tokenArtPreviewHTML(v.tokenArt, `TOKEN ART · ${monsterPhaseLabel(m, runtime.monsterPhase)}`)}<div class="resources">${monsterTemplateResource(m, "hp", "HP")}${monsterTemplateResource(m, "mp", "MP")}${monsterManualPoolHTML(m, "lib", "ip", "IP")}${monsterFpResourceHTML(m, "lib")}${monsterUltimaResourceHTML(m, "lib")}</div><div class="portrait-actions monster-art-actions"><button class="mini-btn" data-monster-lib-portrait="${m.id}">PORTRAIT ART · ${esc(monsterPhaseLabel(m, runtime.monsterPhase))}</button><button class="mini-btn" data-monster-lib-portrait-from-token="${m.id}">PORTRAIT FROM TOKEN</button><button class="mini-btn" data-monster-lib-token-art="${m.id}">TOKEN ART · ${esc(monsterPhaseLabel(m, runtime.monsterPhase))}</button><button class="mini-btn" data-monster-lib-token-from-selected="${m.id}">TOKEN ART FROM SELECTED</button><button class="primary token-spawn-btn" data-monster-template-spawn-token="${m.id}:enemy">SPAWN ENEMY TOKEN + LINK STATS</button><button class="mini-btn ally-spawn-btn" data-monster-template-spawn-token="${m.id}:ally">SPAWN ALLY TOKEN + LINK STATS</button></div></aside><section class="shared-main"><div class="hud-card"><div class="card-title">MONSTER PROFILE <span>${esc(monsterPhaseLabel(m, runtime.monsterPhase))}</span></div><div class="card-body"><div class="identity-grid"><div class="field"><label>NAME</label>${monsterLibInput(m.id, path("name"), v.name)}</div><div class="field"><label>TYPE · SHARED</label>${monsterVillainTypeSelect(m, "lib")}</div><div class="field"><label>NORMAL LEVEL</label>${monsterLibInput(m.id, path("normalLevel"), v.normalLevel ?? v.level, "number", 'min="5" max="60"')}</div><div class="field"><label>DESIRED LEVEL</label>${monsterLibInput(m.id, path("level"), v.level, "number", 'min="5" max="60"')}</div><div class="field"><label>RANK</label>${monsterRankSelect(m, "lib")}</div><div class="field"><label>SPECIES</label>${monsterLibInput(m.id, path("species"), v.species)}</div></div>${runtime.monsterPhase > 0 ? `<div class="field phase-label-field"><label>PHASE TAB NAME</label>${monsterLibInput(m.id, `phases.${runtime.monsterPhase - 1}.label`, m.phases[runtime.monsterPhase - 1]?.label || `PHASE ${runtime.monsterPhase + 1}`)}</div>` : ""}<div class="field monster-traits-field"><label>TRAITS</label>${monsterLibTextarea(m.id, path("traits"), v.traits, "Monster traits / notable characteristics")}</div></div></div><div class="hud-card"><div class="card-title">RESOURCES & COMBAT <span>HP/MP AUTO FROM DESIRED LEVEL + MIG/WLP · MOD PER PHASE · RANK MODIFIES MAX</span></div><div class="card-body"><div class="quick-grid player-combat-grid"><div class="stat-box"><label>INITIATIVE</label>${monsterLibInput(m.id, path("initiative"), v.initiative, "number")}</div>${monsterDefenseControlHTML(m, "lib", "defense", "DEF")}${monsterDefenseControlHTML(m, "lib", "magicDefense", "M.DEF")}</div></div></div><div class="hud-card"><div class="card-title">ATTRIBUTES</div><div class="card-body">${monsterAttributesHTML(m, "lib")}</div></div><div class="hud-card"><div class="card-title">STATUS <span>SHARED ACROSS PHASES</span></div><div class="card-body">${monsterStatusHTML(m, "lib")}</div></div><div class="hud-card"><div class="card-title">ELEMENT AFFINITY</div><div class="card-body">${monsterAffinityHTML(m, "lib")}</div></div></section></div>`;
  if (runtime.monsterTab === "actions") return monsterActionEditorHTML(m, "lib");
  return monsterRulesEditorHTML(m, "lib");
}
function monsterTemplateResource(m, key, label) {
  const phaseIndex = monsterPhaseIndex(m, "lib"), v = monsterPhaseView(m, "lib"), max = monsterEffectiveMax(m, key, phaseIndex), base = monsterBaseMax(m, key, phaseIndex);
  const modKey = `${key}Mod`, modPath = monsterPhasePath(m, "lib", modKey), mod = Number(v[modKey]) || 0;
  const formula = key === "hp" ? `2×LV ${v.level} + 5×MIG d${v.attributes.MIG} + MOD` : `LV ${v.level} + 5×WLP d${v.attributes.WLP} + MOD`;
  return `<div class="resource monster-ranked-resource"><div class="resource-head"><span>${label} · AUTO</span><span class="res-controls"><b>${base} → MAX ${max}</b></span></div><div class="rank-base-row"><span>${label} MOD · ${formula}</span>${monsterLibInput(m.id, modPath, mod, "number", 'inputmode="numeric" placeholder="MOD"')}</div><div class="track"><div class="fill ${key}" style="width:100%"></div></div></div>`;
}
function monsterAttributesHTML(m, mode, readOnly = false) {
  const v = monsterPhaseView(m, mode);
  return `<div class="attributes">${ATTRS.map(k => { const base = v.attributes[k], cur = currentDie(v, k), d = attrDelta(v, k); return readOnly ? `<div class="die-btn ${d < 0 ? "attr-down" : d > 0 ? "attr-up" : ""}"><span>${k}</span><b>d${base}${cur !== base ? ` <i>→ d${cur}</i>` : ""}</b></div>` : `<button class="die-btn ${d < 0 ? "attr-down" : d > 0 ? "attr-up" : ""}" data-monster-die="${mode}:${m.id}:${k}"><span>${k}</span><b>d${base}${cur !== base ? ` <i>→ d${cur}</i>` : ""}</b><small>${d < 0 ? `${d} STEP` : d > 0 ? `+${d} STEP` : "NORMAL"}</small></button>`; }).join("")}</div>`;
}
function monsterStatusHTML(m, mode, readOnly = false) {
  const crisis = isCrisis(m) ? `<span class="status on auto-crisis" title="Automatic: HP is at or below half Max HP">CRISIS</span>` : "";
  const statusRow = `<div class="statuses">${STATUS_NAMES.map(k => readOnly ? `<span class="status ${m.statuses[k] ? "on" : ""}">${k.toUpperCase()}</span>` : `<button class="status ${m.statuses[k] ? "on" : ""} ${m.statusImmunities?.[k] ? "immune-locked" : ""}" data-monster-status="${mode}:${m.id}:${k}" title="${m.statusImmunities?.[k] ? `${k.toUpperCase()} is IMMUNE` : `Toggle ${k.toUpperCase()}`}">${k.toUpperCase()}</button>`).join("")}${crisis}</div>`;
  if (readOnly) return statusRow;
  const immunityRow = `<div class="monster-status-immunity"><div class="monster-status-immunity-title"><b>STATUS IMMUNITY</b><span>SHARED ACROSS PHASES</span></div><div class="monster-status-immunity-grid">${STATUS_NAMES.map(k => `<label class="monster-status-immune ${m.statusImmunities?.[k] ? "on" : ""}"><input type="checkbox" data-monster-status-immune="${mode}:${m.id}:${k}" ${m.statusImmunities?.[k] ? "checked" : ""}><span>${k.toUpperCase()}</span></label>`).join("")}</div></div>`;
  return `${statusRow}${immunityRow}<div class="buff-grid">${ATTRS.map(k => `<div class="buff-box"><b>${k} TEMP</b><button data-monster-buff="${mode}:${m.id}:${k}:-1">−</button><span>${Number(m.attributeBuffs[k]) || 0}</span><button data-monster-buff="${mode}:${m.id}:${k}:1">+</button></div>`).join("")}</div>`;
}
function monsterAffinityHTML(m, mode, readOnly = false) {
  const v = monsterPhaseView(m, mode);
  return `<div class="affinity-grid">${ELEMENTS.map(e => { const affinity = String(v.affinities?.[e] || "NORMAL").toUpperCase(); return `<div class="affinity-row"><b>${elementIcon(e)}<span>${elementInfo(e).label}</span></b>${readOnly ? `<span class="affinity-pill ${affinity.toLowerCase()}">${esc(affinity)}</span>` : `<select class="affinity-select ${affinityTone(affinity)}" data-monster-affinity="${mode}:${m.id}:${e}">${AFFINITY_VALUES.map(x => `<option ${x === affinity ? "selected" : ""}>${x}</option>`).join("")}</select>`}</div>`; }).join("")}</div>`;
}
function monsterRandomTargetKey(m, mode = "active") {
  return `${mode}:${m?.id || "monster"}:${monsterPhaseIndex(m, mode)}`;
}
function onlinePlayerAndAllyTargetPool(actorId = "") {
  const out = [], seen = new Set();
  const add = x => { if (!x?.id || seen.has(`${x.kind}:${x.id}`)) return; seen.add(`${x.kind}:${x.id}`); out.push(x); };
  // Any online participant with an active character sheet can be targeted, including
  // the GM/admin when they also run a player-side character. The local sheet is
  // included explicitly because some OBR party snapshots can omit metadata for self.
  if (!state.deleted && !isPlayerDefeated(state)) add({ kind: "player", id: runtime.currentPlayer.id, name: state.name || runtime.currentPlayer.name || "Character", sheet: state, role: runtime.currentPlayer.role });
  for (const p of runtime.party || []) {
    if (!p?.id || p.id === runtime.currentPlayer.id) continue;
    const raw = bestPlayerSheetRaw(p.id, p.metadata?.[META_KEY]);
    if (!raw || raw.deleted) continue;
    const sh = normalizeState(raw);
    if (isPlayerDefeated(sh)) continue;
    add({ kind: "player", id: p.id, name: sh.name || p.name || "Character", sheet: sh });
  }
  for (const m of runtime.sceneMonsters || []) {
    if (m.id === actorId || m.faction !== "ally" || isMonsterDefeated(m)) continue;
    const v = monsterPhaseView(m, "active");
    add({ kind: "monster", id: m.id, name: v.name || "Ally", sheet: v });
  }
  return out;
}
function shuffledTargets(list = []) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function monsterRandomTargetState(m, mode = "active") {
  const key = monsterRandomTargetKey(m, mode);
  runtime.monsterRandomTargets ||= {};
  const st = runtime.monsterRandomTargets[key] ||= { open: false, manualOpen: false, count: 1, targets: [] };
  if (typeof st.manualOpen !== "boolean") st.manualOpen = false;
  if (!Array.isArray(st.targets)) st.targets = [];
  return st;
}
function sanitizeMonsterTargets(m, mode = "active") {
  const st = monsterRandomTargetState(m, mode), pool = onlinePlayerAndAllyTargetPool(m.id);
  const valid = new Map(pool.map(t => [`${t.kind}:${t.id}`, t]));
  st.targets = st.targets.map(t => valid.get(`${t.kind}:${t.id}`)).filter(Boolean).map(t => ({ kind: t.kind, id: t.id, name: t.name }));
  return { st, pool };
}
function monsterTargetControlHTML(m, mode) {
  const { st, pool } = sanitizeMonsterTargets(m, mode);
  const selected = new Set(st.targets.map(t => `${t.kind}:${t.id}`));
  const manualPicker = st.manualOpen ? `<div class="monster-target-picker"><div class="monster-target-picker-head"><b>MULTI TARGET SELECT</b><small>เลือกได้หลายชื่อพร้อมกัน · กดชื่อเดิมอีกครั้งเพื่อยกเลิก</small></div><div class="monster-target-list">${pool.length ? pool.map(t => {
    const key = `${t.kind}:${t.id}`, on = selected.has(key), label = t.kind === "player" ? "PC" : "ALLY";
    return `<button class="mini-btn monster-target-option ${on ? "on" : ""}" data-monster-target-pick="${mode}:${m.id}:${t.kind}:${t.id}" aria-pressed="${on ? "true" : "false"}"><i class="monster-target-check" aria-hidden="true">${on ? "✓" : ""}</i><small>${label}</small><span>${esc(t.name)}</span></button>`;
  }).join("") : `<span class="monster-target-empty">NO ONLINE PLAYER SHEETS OR ALLIES</span>`}</div><div class="monster-target-picker-foot"><small>${st.targets.length} SELECTED · ${pool.length} AVAILABLE</small><div class="monster-target-picker-actions">${pool.length ? `<button class="mini-btn" data-monster-target-all="${mode}:${m.id}">SELECT ALL</button>` : ""}${st.targets.length ? `<button class="mini-btn monster-target-clear" data-monster-target-clear="${mode}:${m.id}">CLEAR</button>` : ""}<button class="mini-btn monster-target-done" data-monster-target-open="${mode}:${m.id}">DONE</button></div></div></div>` : "";
  const randomPicker = st.open ? `<div class="monster-random-picker"><label>COUNT <input type="number" min="1" max="${Math.max(1,pool.length)}" value="${Math.max(1,Number(st.count)||1)}" data-monster-random-count="${mode}:${m.id}"></label><button class="primary" data-monster-random-roll="${mode}:${m.id}" ${pool.length ? "" : "disabled"}>ROLL TARGETS</button><small>${pool.length} AVAILABLE · ONLINE CHARACTER SHEETS + PLAYER ALLIES</small></div>` : "";
  const targetChips = st.targets.length ? `<div class="monster-random-picked"><b>TARGETS · ${st.targets.length}</b>${st.targets.map(t => `<button class="monster-picked-target" data-monster-target-remove="${mode}:${m.id}:${t.kind}:${t.id}" title="Remove ${esc(t.name)}"><span>${esc(t.name)}</span><i>×</i></button>`).join("")}</div>` : "";
  return `<div class="monster-random-target-control"><button class="mini-btn monster-target-select-toggle ${st.targets.length ? "on" : ""}" data-monster-target-open="${mode}:${m.id}">TARGET${st.targets.length ? ` · ${st.targets.length}` : ""}</button><button class="mini-btn monster-random-target-toggle" data-monster-random-open="${mode}:${m.id}">RANDOM TARGET</button>${manualPicker}${randomPicker}${targetChips}</div>`;
}
function selectedMonsterTargets(m, mode = "active") {
  return sanitizeMonsterTargets(m, mode).st.targets;
}

function monsterActionEditorHTML(m, mode, readOnly = false) {
  const v = monsterPhaseView(m, mode);
  const list = v.actions || [];
  const actionsHead = readOnly ? "" : `<div class="monster-actions-head-controls">${monsterTargetControlHTML(m, mode)}<button class="primary" data-monster-add-action="${mode}:${m.id}">+ NEW ACTION</button></div>`;
  return `<div><div class="section-head">ACTIONS ${actionsHead}</div><div class="drag-help">Skill Board · click a card to ${readOnly ? "view" : "edit"}.</div>${list.length ? `<div class="actions-skill-board monster-actions-board">${list.map((a, i) => monsterActionRow(m, a, i, mode, readOnly)).join("")}</div>` : `<div class="empty">NO ACTIONS</div>`}</div>`;
}
function monsterActionRow(m, a, i, mode, readOnly) {
  const v = monsterPhaseView(m, mode);
  const autoAcc = monsterLevelAccuracyBonus(v.normalLevel, v.level), autoDmg = monsterLevelDamageBonus(v.normalLevel, v.level);
  const finalAccMod = (Number(a.mod) || 0) + autoAcc, manualHR = Number(a.damageHR) || 0;
  const finalDamageBonus = manualHR + autoDmg;
  const skillSummary = (controls, drag = "") => `<summary class="action-skill-summary">${`<div class="action-skill-top">${drag}<span class="action-type-badge ${actionTypeClass(a.category)}">${esc(normalizeActionType(a.category))}</span>${elementChip(a.element, true)}</div>`}${actionSkillMedia(a.note, a.element)}<div class="action-skill-title"><strong>${esc(a.name || "NEW ACTION")}</strong><span class="action-edit-cue">${readOnly ? "VIEW" : "EDIT"} <b>⌄</b></span></div>${actionCompactFormula(a, v, finalAccMod, finalDamageBonus)}${actionExtraMeta(a.target, a.actionTypeText)}${actionCostLine(a.cost)}${actionSkillDescription(a.note)}${controls}</summary>`;
  if (readOnly) return `<div class="action-card action-skill-card read-only-action"><details class="action-readonly-details action-skill-details">${skillSummary("")}<div class="action-readonly-body"><div class="action-view-roll">${a.mode === "ROLL" ? `ACC ${monsterSigned(finalAccMod)} · ${isTwoWeaponAction(a) ? `HR 0 · BONUS ${monsterSigned(manualHR)}` : `HR ${monsterSigned(manualHR)}`} · DMG ADJ ${monsterSigned(autoDmg)} · LV ${v.normalLevel ?? v.level}→${v.level}` : "NO ROLL"}</div><div class="action-view-detail">${formatText(stripMediaUrls(a.note || ""))}</div>${gifPreview(a.note || "")}</div></details></div>`;
  const prefix = `${mode}:${m.id}:${i}`;
  const controls = `<div class="action-skill-controls"><button class="mini-btn" data-monster-send-action="${mode}:${m.id}:${i}">SEND</button>${isGuardFamilyAction(a) ? `<button class="primary" data-use-guard-action="monster:${m.id}:${i}:${mode}">USE</button>` : a.mode === "ROLL" ? `<button class="primary" data-monster-roll-action="${mode}:${m.id}:${i}">ROLL</button>` : ""}</div>`;
  const rollFields = a.mode === "ROLL" ? `
    <label class="action-edit-field"><span>STAT A</span><select data-monster-action-field="${prefix}:attr1">${attrOpts(a.attr1, v)}</select></label>
    <label class="action-edit-field"><span>STAT B</span><select data-monster-action-field="${prefix}:attr2">${attrOpts(a.attr2, v)}</select></label>
    <label class="action-edit-field"><span>ACCURACY MOD · MANUAL</span><input type="number" data-monster-action-field="${prefix}:mod" value="${a.mod || 0}" inputmode="numeric"><small>LEVEL ADJ ${monsterSigned(autoAcc)} · FINAL ${monsterSigned(finalAccMod)}</small></label>
    <label class="action-edit-field hr-field"><span>${isTwoWeaponAction(a) ? "DAMAGE BONUS · MANUAL" : "HR MOD · MANUAL"}</span><input class="action-hr-input" type="number" data-monster-action-field="${prefix}:damageHR" value="${Number(a.damageHR) || 0}" inputmode="numeric"><small>${isTwoWeaponAction(a) ? `TWO WEAPON · HR = 0 · LEVEL DAMAGE ADJ ${monsterSigned(autoDmg)}` : `LEVEL DAMAGE ADJ ${monsterSigned(autoDmg)} · HR remains ${monsterSigned(manualHR)}`}</small></label>
    ` : `<div class="no-roll-label action-edit-wide">NO CHECK REQUIRED</div>`;
  return `<div class="action-card action-skill-card"><details class="action-editor-details action-skill-details" data-persist-details="monster-action:${esc(mode)}:${esc(m.id)}:${i}">${skillSummary(controls)}<div class="action-editor-inner"><div class="action-editor-heading"><strong>EDIT MONSTER ACTION</strong><small>Use TARGET for manual online Player / Ally selection, or RANDOM TARGET.</small></div><div class="action-editor-form">
    <label class="action-edit-field action-edit-name"><span>ACTION NAME</span><input class="action-name" data-monster-action-field="${prefix}:name" value="${esc(a.name)}"></label>
    <label class="action-edit-field"><span>ROLL MODE</span><select data-monster-action-field="${prefix}:mode"><option ${a.mode === "ROLL" ? "selected" : ""}>ROLL</option><option ${a.mode === "NO ROLL" ? "selected" : ""}>NO ROLL</option></select></label>
    <label class="action-edit-field"><span>ACTION TYPE</span><select data-monster-action-field="${prefix}:category">${actionTypeOptionsHTML(a.category)}</select></label>
    <label class="action-edit-field"><span>ELEMENT</span><div class="element-select-field">${elementIcon(a.element)}<select data-monster-action-field="${prefix}:element">${damageOpts(a.element)}</select></div></label>
    <label class="action-edit-field"><span>COST</span><input data-monster-action-field="${prefix}:cost" value="${esc(a.cost || "")}" placeholder="MP 10 / IP 1 / HP 5 / Other"></label>
    <label class="action-edit-field"><span>TARGET</span><input data-monster-action-field="${prefix}:target" value="${esc(a.target || "")}" placeholder="1 Enemy / Self / All Allies / Area"></label>
    <label class="action-edit-field"><span>TYPE</span><input data-monster-action-field="${prefix}:actionTypeText" value="${esc(a.actionTypeText || "")}" placeholder="Area / Reaction / Utility / Multi"></label>
    ${rollFields}
    <label class="action-edit-field action-edit-wide"><span>DESCRIPTION / GIF LINK</span><textarea class="action-note" data-monster-action-field="${prefix}:note" placeholder="Effect / Details / GIF link">${esc(a.note || "")}</textarea></label>
    <div class="action-edit-wide">${gifPreview(a.note || "")}</div>
    ${a.mode === "ROLL" ? `<label class="frenzy action-edit-wide"><input type="checkbox" data-monster-action-check="${prefix}:frenzy" ${a.frenzy ? "checked" : ""}> FRENZY</label>` : ""}
    <div class="action-full-controls action-edit-wide"><button class="danger-btn" data-monster-remove-action="${mode}:${m.id}:${i}">DELETE ACTION</button></div>
  </div></div></details></div>`;
}

function monsterRulesEditorHTML(m, mode, readOnly = false) {
  const rules = m.specialRules || [];
  if (readOnly) return redactedBlock("SPECIAL RULES · GM ONLY");
  const key = `monster-rules:${mode}:${m.id}`;
  const editing = !!runtime.inlineEdit?.[key];
  const cards = rules.map((r, i) => {
    const readHTML = `<div class="locked-class-title"><b>${esc(r.name || `SPECIAL RULE ${i + 1}`)}</b></div>${readDetail("DETAILS", r.detail)}`;
    const editHTML = `<div class="two-fields"><div class="field"><label>NAME</label><input data-monster-rule-field="${mode}:${m.id}:${i}:name" value="${esc(r.name)}"></div><div class="field"><label>DETAILS</label><textarea data-monster-rule-field="${mode}:${m.id}:${i}:detail" placeholder="GM-only ability details / GIF link">${esc(r.detail)}</textarea>${gifPreview(r.detail)}</div></div>`;
    return `<article class="editor-card inline-edit-card special-rule-read-card"><div class="card-title inline-class-head"><div class="inline-edit-title"><b>SPECIAL RULE ${i + 1}</b><span>${editing ? "EDITING" : "READ MODE"}</span></div><div class="inline-card-actions">${editing ? `<button class="danger-btn" data-monster-remove-rule="${mode}:${m.id}:${i}">×</button>` : ""}</div></div><div class="card-body inline-edit-body special-rule-inline-body">${editing ? editHTML : readHTML}</div></article>`;
  }).join("");
  return `<div class="special-rule-page inline-edit-card" data-inline-edit-id="${esc(key)}"><div class="section-head"><div>SPECIAL RULE · GM ONLY <span>${editing ? "EDITING ALL" : "READ MODE"}</span></div><div class="special-rule-page-actions"><button class="mini-btn" data-toggle-inline-edit="${esc(key)}">${editing ? "DONE" : "EDIT"}</button><button class="primary" data-monster-add-rule="${mode}:${m.id}">+ SPECIAL RULE</button></div></div><div class="editor-stack special-rule-stack">${cards || `<div class="empty">NO SPECIAL RULES</div>`}</div></div>`;
}

function monsterStudyHTML(m) {
  const tier = monsterTier(m);
  const button = t => `<button class="study-toggle ${tier === t ? "on" : ""}" data-monster-study-tier="${m.id}:${t}"><span>${t === 0 ? "LOCK ALL" : `UNLOCK STUDY ${t}+`}</span><b>${tier === t ? "ACTIVE" : STUDY_LABELS[t]}</b></button>`;
  return `<div class="hud-card study-card"><div class="card-title">STUDY UNLOCK <span>SPECIAL RULES ARE ALWAYS GM ONLY</span></div><div class="card-body"><div class="study-tier-guide"><p><b>7+</b> Rank, Species, Max HP, Max MP</p><p><b>10+</b> 7+ + Traits, Attributes, DEF, M.DEF, Affinities</p><p><b>13+</b> 10+ + Actions</p></div><div class="study-grid study-tier-grid">${[0,7,10,13].map(button).join("")}</div></div></div>`;
}
function monsterInstanceEditorHTML(m) {
  const gm = runtime.currentPlayer.role === "GM";
  const tier = monsterTier(m);
  const v = monsterPhaseView(m, "active");
  const availableTabs = gm ? ["sheet", "actions", "rules"] : ["sheet", ...(tier >= 13 ? ["actions"] : [])];
  if (!availableTabs.includes(runtime.monsterTab)) runtime.monsterTab = "sheet";
  const tabs = availableTabs.map(t => `<button class="subtab ${runtime.monsterTab === t ? "active" : ""}" data-monster-tab="${t}">${t === "rules" ? "SPECIAL RULE · GM ONLY" : t.toUpperCase()}</button>`).join("");
  const phaseIndex = monsterPhaseIndex(m, "active"), phaseName = monsterPhaseLabel(m, phaseIndex), displayArt = monsterDisplayArt(m, "active");
  const phaseStrip = gm ? monsterPhaseTabsHTML(m, "active") : `<div class="monster-phase-public"><b>${esc(phaseName)}</b><span>${esc(v.name)}</span></div>`;
  return `<section class="shared-sheet monster-editor"><div class="shared-sheet-header"><button class="mini-btn" data-action="scene-back">‹ SCENE</button><div class="shared-sheet-char">${v.portrait ? `<img class="monster-full-art" src="${esc(v.portrait)}">` : `<div class="shared-head-empty">M</div>`}<div><strong>${esc(v.name)}</strong><small>${m.faction === "ally" ? "ALLY MONSTER" : "ENEMY MONSTER"} INSTANCE · ${esc(phaseName)} · STUDY ${STUDY_LABELS[tier]}</small></div></div><div class="shared-head-stats">${gm ? `<span>HP <b>${m.hp.current}/${m.hp.max}</b></span><span>MP <b>${m.mp.current}/${m.mp.max}</b></span><span>IP <b>${m.ip?.current || 0}/${m.ip?.max || 0}</b></span><span>FP <b>${Number(m.fp) || 0}</b></span>${m.up.max > 0 ? `<span>UP <b>${m.up.current}/${m.up.max}</b></span>` : ""}<button class="mini-btn monster-header-link-stats" data-active-monster-link="${m.id}">LINK STATS</button><button class="danger-btn" data-monster-remove-scene="${m.id}">REMOVE</button>` : `<span>STUDY <b>${STUDY_LABELS[tier]}</b></span>${tier >= 7 ? `<span>HP <b>${m.hp.current}/${m.hp.max}</b></span><span>MP <b>${m.mp.current}/${m.mp.max}</b></span>` : ""}`}</div></div>${phaseStrip}<div class="shared-sheet-tabs">${tabs}</div><div class="shared-sheet-body">${monsterInstanceTabHTML(m, gm)}</div></section>`;
}
function activeInput(m, path, value, type = "text", extra = "") { return `<input type="${type}" data-active-monster-field="${m.id}:${path}" value="${esc(value)}" ${extra}>`; }
function activeTextarea(m, path, value, placeholder = "") { return `<textarea data-active-monster-field="${m.id}:${path}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>${gifPreview(value)}`; }
function redactedBlock(title) { return `<div class="hud-card redacted"><div class="card-title">${title}</div><div class="card-body"><div class="redacted-value">???</div></div></div>`; }
function monsterInstanceTabHTML(m, gm) {
  const tier = monsterTier(m);
  const v = monsterPhaseView(m, "active"), displayArt = monsterDisplayArt(m, "active");
  const path = key => monsterPhasePath(m, "active", key);
  if (runtime.monsterTab === "actions") return gm ? monsterActionEditorHTML(m, "active", false) : (tier >= 13 ? monsterActionEditorHTML(m, "active", true) : redactedBlock("ACTIONS"));
  if (runtime.monsterTab === "rules") return gm ? monsterRulesEditorHTML(m, "active", false) : redactedBlock("GM ONLY");
  if (!gm) {
    return `<div class="shared-sheet-grid"><aside class="shared-portrait-panel">${displayArt ? `<img class="portrait monster-full-art" src="${esc(displayArt)}">` : `<div class="portrait-empty">MONSTER</div>`}</aside><section class="shared-main"><div class="hud-card"><div class="card-title">MONSTER PROFILE · ${esc(monsterPhaseLabel(m, monsterPhaseIndex(m, "active")))} · STUDY ${STUDY_LABELS[tier]}</div><div class="card-body"><div class="read-profile"><b>Rank: ${tier >= 7 ? esc(v.rank || "—") : "???"}</b><span>Type: ${tier >= 7 ? esc(villainTypeLabel(m.villainType)) : "???"}</span><span>Species: ${tier >= 7 ? esc(v.species || "—") : "???"}</span></div></div></div><div class="hud-card"><div class="card-title">STUDIED RESOURCES</div><div class="card-body"><div class="party-resource-grid">${maskedResource("HP", m.hp, "hp", tier >= 7)}${maskedResource("MP", m.mp, "mp", tier >= 7)}</div><div class="party-stat-grid big">${maskedStat("DEF", defenseDisplay(v, "defense"), tier >= 10)}${maskedStat("M.DEF", defenseDisplay(v, "magicDefense"), tier >= 10)}</div></div></div><div class="hud-card"><div class="card-title">STATUS <span>PUBLIC INFO</span></div><div class="card-body">${monsterStatusHTML(m, "active", true)}</div></div>${tier >= 10 ? `<div class="hud-card"><div class="card-title">TRAITS</div><div class="card-body"><div class="action-view-detail">${formatText(v.traits || "—")}</div>${gifPreview(v.traits || "")}</div></div><div class="hud-card"><div class="card-title">ATTRIBUTES</div><div class="card-body">${monsterAttributesHTML(m, "active", true)}</div></div><div class="hud-card"><div class="card-title">ELEMENT AFFINITY</div><div class="card-body">${monsterAffinityHTML(m, "active", true)}</div></div>` : `${redactedBlock("TRAITS")}${redactedBlock("ATTRIBUTES")}${redactedBlock("ELEMENT AFFINITY")}`}</section></div>`;
  }
  const phaseIndex = monsterPhaseIndex(m, "active");
  return `<div class="shared-sheet-grid"><aside class="shared-portrait-panel">${v.portrait ? `<img class="portrait monster-full-art" src="${esc(v.portrait)}">` : `<div class="portrait-empty">SELECT MONSTER PORTRAIT ART</div>`}${tokenArtPreviewHTML(v.tokenArt, `TOKEN ART · ${monsterPhaseLabel(m, phaseIndex)}`)}<div class="resources">${activeMonsterResource(m, "hp", "HP")}${activeMonsterResource(m, "mp", "MP")}${monsterManualPoolHTML(m, "active", "ip", "IP")}${monsterFpResourceHTML(m, "active")}${monsterUltimaResourceHTML(m, "active")}</div><div class="portrait-actions monster-art-actions"><button class="mini-btn" data-active-monster-portrait="${m.id}">PORTRAIT ART · ${esc(monsterPhaseLabel(m, phaseIndex))}</button><button class="mini-btn" data-active-monster-portrait-from-token="${m.id}">PORTRAIT FROM TOKEN</button><button class="mini-btn" data-active-monster-token-art="${m.id}">TOKEN ART · ${esc(monsterPhaseLabel(m, phaseIndex))}</button><button class="mini-btn" data-active-monster-token-from-selected="${m.id}">TOKEN ART FROM SELECTED</button><button class="primary token-spawn-btn" data-active-monster-spawn-token="${m.id}">SPAWN TOKEN + LINK STATS</button><button class="mini-btn" data-active-monster-link="${m.id}">LINK STATS · SELECTED TOKEN</button><button class="danger-soft" data-active-monster-unlink="${m.id}" ${m.linkedTokenId ? "" : "disabled"}>UNLINK STATS</button><span class="shared-link-state">${m.linkedTokenId ? `STATS LINKED · ${esc(m.linkedTokenId)}` : "NO TOKEN STATS LINKED"}</span></div></aside><section class="shared-main"><div class="hud-card"><div class="card-title">MONSTER PROFILE <span>${esc(monsterPhaseLabel(m, phaseIndex))}</span><button class="mini-btn" data-monster-send-section="${m.id}:profile">SEND</button></div><div class="card-body"><div class="identity-grid"><div class="field"><label>NAME</label>${activeInput(m, path("name"), v.name)}</div><div class="field"><label>TYPE · SHARED</label>${monsterVillainTypeSelect(m, "active")}</div><div class="field"><label>NORMAL LEVEL</label>${activeInput(m, path("normalLevel"), v.normalLevel ?? v.level, "number", 'min="5" max="60"')}</div><div class="field"><label>DESIRED LEVEL</label>${activeInput(m, path("level"), v.level, "number", 'min="5" max="60"')}</div><div class="field"><label>RANK</label>${monsterRankSelect(m, "active")}</div><div class="field"><label>SPECIES</label>${activeInput(m, path("species"), v.species)}</div></div>${phaseIndex > 0 ? `<div class="field phase-label-field"><label>PHASE TAB NAME</label>${activeInput(m, `phases.${phaseIndex - 1}.label`, m.phases[phaseIndex - 1]?.label || `PHASE ${phaseIndex + 1}`)}</div>` : ""}<div class="field monster-traits-field"><label>TRAITS</label>${activeTextarea(m, path("traits"), v.traits, "Monster traits / notable characteristics")}</div></div></div><div class="hud-card"><div class="card-title">COMBAT PARAMETERS <span>HP/MP AUTO FROM DESIRED LEVEL + STATS · STATUS SHARED · STUDY PER PHASE</span><button class="mini-btn" data-monster-send-section="${m.id}:combat">SEND</button></div><div class="card-body"><div class="quick-grid player-combat-grid"><div class="stat-box"><label>INITIATIVE</label>${activeInput(m, path("initiative"), v.initiative, "number")}</div>${monsterDefenseControlHTML(m, "active", "defense", "DEF")}${monsterDefenseControlHTML(m, "active", "magicDefense", "M.DEF")}</div></div></div><div class="hud-card"><div class="card-title">ATTRIBUTES <button class="mini-btn" data-monster-send-section="${m.id}:attributes">SEND</button></div><div class="card-body">${monsterAttributesHTML(m, "active")}</div></div><div class="hud-card"><div class="card-title">STATUS <span>GM ONLY · SHARED ACROSS PHASES</span></div><div class="card-body">${monsterStatusHTML(m, "active")}</div></div><div class="hud-card"><div class="card-title">ELEMENT AFFINITY <button class="mini-btn" data-monster-send-section="${m.id}:affinities">SEND</button></div><div class="card-body">${monsterAffinityHTML(m, "active")}</div></div>${monsterStudyHTML(m)}</section></div>`;
}
function activeMonsterResource(m, key, label) {
  const r = m[key], phaseIndex = monsterPhaseIndex(m, "active"), v = monsterPhaseView(m, "active"), base = monsterBaseMax(m, key, phaseIndex);
  const modKey = `${key}Mod`, modPath = monsterPhasePath(m, "active", modKey), mod = Number(v[modKey]) || 0;
  const formula = key === "hp" ? `2×LV ${v.level} + 5×MIG d${v.attributes.MIG}` : `LV ${v.level} + 5×WLP d${v.attributes.WLP}`;
  return `<div class="resource monster-ranked-resource"><div class="resource-head"><span>${label}</span><span class="res-controls"><button class="res-btn" data-quick-resource="monster:${m.id}:${key}:-1">−</button>${activeInput(m, `${key}.current`, r.current, "number")}<span>/</span><b>${r.max}</b><button class="res-btn" data-quick-resource="monster:${m.id}:${key}:1">+</button></span></div><div class="rank-base-row"><span>${label} MOD · ${formula} + MOD → BASE ${base}</span>${activeInput(m, modPath, mod, "number", 'inputmode="numeric" placeholder="MOD"')}</div><div class="track"><div class="fill ${key}" style="width:${pct(r.current, r.max)}%"></div></div></div>`;
}
function applyOp(s, op) {
  if (!s || !op) return;
  const defeatBeforeHp = Number(s?.hp?.current) || 0;
  if (op.kind === "set") setByPath(s, op.path, op.value);
  else if (op.kind === "adjust") {
    if (op.path === "fp") s.fp = Math.max(0, (Number(s.fp) || 0) + Number(op.delta || 0));
    else {
      const [key] = op.path.split(".");
      if (s[key]?.current !== undefined) s[key].current = clamp((Number(s[key].current) || 0) + Number(op.delta || 0), 0, Number(s[key].max) || 0);
    }
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
  else if (op.kind === "add-list") (s.lists[op.type] ||= []).push(op.type === "arcana" ? { name: "", cost: "", linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: "", cutIn:false, cutInColor:"violet" } : op.type === "bonds" ? { name: "", strength: 1, linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: "" } : { name: "", detail: "" });
  else if (op.kind === "remove-list") s.lists[op.type]?.splice(op.index, 1);
  else if (op.kind === "add-class") (s.classes ||= []).push(blankClass());
  else if (op.kind === "remove-class") s.classes.splice(op.index, 1);
  else if (op.kind === "add-class-skill") { const c = (s.classes ||= [])[op.classIndex]; if (c) (c.classSkills ||= []).push(blankClassSkill()); }
  else if (op.kind === "remove-class-skill") s.classes[op.classIndex]?.classSkills.splice(op.index, 1);
  else if (op.kind === "add-quirk") (s.quirks ||= []).push(blankQuirk());
  else if (op.kind === "remove-quirk") s.quirks.splice(op.index, 1);
  else if (op.kind === "add-equipment") (s.equipment ||= []).push(blankEquipment());
  else if (op.kind === "remove-equipment") s.equipment.splice(op.index, 1);
  else if (op.kind === "add-sphere") (s.spheres ||= []).push(blankSphere());
  else if (op.kind === "add-inventory") (s.inventory ||= []).push(blankInventoryItem());
  else if (op.kind === "shop-purchase") {
    const price = Math.max(0, Number(op.price) || 0), purchaseId = String(op.purchaseId || ""), item = op.item || {};
    const duplicate = purchaseId && (s.inventory || []).some(x => String(x.shopPurchaseId || "") === purchaseId);
    if (!duplicate && (Number(s.zenit) || 0) >= price) {
      s.zenit = Math.max(0, (Number(s.zenit) || 0) - price);
      (s.inventory ||= []).push({ id: item.id || uid(), name: item.name || "Shop Item", itemType: item.itemType || "ACCESSORY", linkedTokenId: "", linkedTokenArt: null, tokenLink: "", detail: item.detail || "", shopPurchaseId: purchaseId, shopStockId: String(item.shopStockId || ""), purchasePrice: price });
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
  else if (op.kind === "add-clock") (s.clocks ||= []).push(blankClock());
  else if (op.kind === "remove-clock") s.clocks.splice(op.index, 1);
  else if (op.kind === "clock-general" && s.clocks[op.index]) s.clocks[op.index].progress = clamp(op.progress, 0, s.clocks[op.index].segments);
  else if (op.kind === "add-project") (s.projects ||= []).push({ id: uid(), name: "New Project", detail: "", segments: 6, progress: 0 });
  else if (op.kind === "remove-project") s.projects.splice(op.index, 1);
  else if (op.kind === "clock" && s.projects[op.index]) s.projects[op.index].progress = clamp(op.progress, 0, s.projects[op.index].segments);
  else if (op.kind === "add-action") (s.actions ||= []).push(blankAction());
  else if (op.kind === "remove-action") s.actions.splice(op.index, 1);
  else if (op.kind === "link-token") { s.linkedTokenId = op.tokenId || ""; s.showHud = true; }
  else if (op.kind === "unlink-token") { s.linkedTokenId = ""; s.showHud = false; }
  else if (op.kind === "set-defeat-outcome") {
    const outcome = String(op.outcome || "").toLowerCase();
    if (isPlayerDefeated(s) && ["surrender","sacrifice"].includes(outcome)) s.defeatOutcome = outcome;
  }
  else if (op.kind === "delete-sheet") { s.deleted = true; }
  s.updatedAt = Date.now();
  for (const k of ["hp", "mp", "ip"]) if (s[k]) { s[k].max = Math.max(0, Number(s[k].max) || 0); s[k].current = clamp(s[k].current, 0, s[k].max); }
  syncPlayerDefeatTransition(s, defeatBeforeHp);
}
async function sendRemoteEdit(owner, op, options = {}) {
  if (owner === runtime.currentPlayer.id) {
    const before = deepClone(state);
    applyOp(state, op);
    recordSheetCombatChange(owner, before, state, op);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    scheduleCanvasTextSync(owner, state);
    if (options.sceneStatusFast) renderSceneStatusEdit(owner); else render();
    scheduleSave();
    return;
  }
  const p = runtime.party.find(x => x.id === owner), raw = bestPlayerSheetRaw(owner, p?.metadata?.[META_KEY]);
  if (raw) {
    const before = normalizeState(raw), copy = normalizeState(raw); applyOp(copy, op);
    recordSheetCombatChange(owner, before, copy, op);
    if (p) p.metadata = { ...(p.metadata || {}), [META_KEY]: copy };
    runtime.scenePlayerSheets[owner] = { ownerId: owner, ownerName: p?.name || copy.name || "PLAYER", sheet: deepClone(copy), updatedAt: copy.updatedAt };
    schedulePersistentSheetSave(owner, p?.name || copy.name, copy);
    scheduleCanvasTextSync(owner, copy);
    if (options.sceneStatusFast) renderSceneStatusEdit(owner); else render();
  }
  if (PREVIEW) { if (!raw) render(); return; }
  if (!p) {
    // The optimistic copy above has already applied the operation exactly once.
    // Persist that copy directly; applying `op` again here would double resource
    // costs and every other relative edit on offline sheets.
    try { await writeScenePlayerSheets(); }
    catch (e) { console.warn("offline edit", e); notify("Could not update that offline character sheet."); }
    return;
  }
  broadcast("edit", { id: uid(), ownerId: owner, editorId: runtime.currentPlayer.id, editorName: runtime.currentPlayer.name, op, time: Date.now() });
  if (!raw) render();
}
function parseAdjustment(text, current) {
  const t = String(text || "").trim(); if (!t) return null;
  if (/^[+-]\d+(?:\.\d+)?$/.test(t)) return { kind: "adjust", delta: Number(t) };
  if (/^\d+(?:\.\d+)?$/.test(t)) return { kind: "set", value: Number(t) };
  return null;
}
async function adjustPlayer(owner, key, delta) {
  const s = sourceSheet(owner); if (!s || s.deleted) return;
  const path = key === "fp" ? "fp" : `${key}.current`;
  const before = key === "fp" ? Number(s.fp) : Number(s[key].current);
  await sendRemoteEdit(owner, { kind: "adjust", path, delta: Number(delta) });
  if (key === "hp" && Number(delta)) playSound(Number(delta) > 0 ? "hpup" : "hpdown");
  return before;
}
function applyMonsterStudyTier(monsterId, tier, source = "", phaseIndex = null) {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can change Study");
  let t = normalizedStudyTier(tier);
  const m = studyHinderMonsterTarget({ id: monsterId }); if (!m) return notify("Monster is no longer in this Scene.");
  monsterId = String(m.id);
  const idx = phaseIndex === null ? monsterPhaseIndex(m, "active") : clamp(Number(phaseIndex) || 0, 0, m.phases.length);
  const previous = monsterTier(m, idx);
  if (source === "study-roll") t = Math.max(previous, t);
  updateMonster("active", monsterId, x => { setMonsterStudyTierForPhase(x, t, idx); });
  runtime.hinderTargetId = monsterId;
  const updated = monsterById(monsterId) || m;
  const label = monsterPhaseLabel(updated, idx);
  const view = idx === monsterPhaseIndex(updated, "active") ? monsterPhaseView(updated, "active") : (idx ? updated.phases?.[idx - 1] : updated);
  showToast("STUDY", `${view?.name || updated.name || "MONSTER"} · ${label} · ${STUDY_LABELS[t]}`, "message", false);
  render();
}
async function setMonsterStatusFromHinder(monsterId, status, source = "hinder") {
  if (!STATUS_NAMES.includes(status)) return;
  const local = studyHinderMonsterTarget({ id: monsterId }); if (!local) return notify("Monster is no longer in this Scene.");
  monsterId = String(local.id);
  local.statuses ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
  local.statusImmunities ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
  const previousValue = !!local.statuses[status];
  const immuneAttempt = source === "hinder" && !previousValue && !!local.statusImmunities?.[status];
  if (immuneAttempt) {
    const localView = monsterPhaseView(local, "active");
    const name = localView?.name || local.name || "MONSTER";
    // Let HINDER visibly land first, then immediately fall off. We do not write the
    // temporary state to Scene metadata, so an immune debuff can never affect real stats.
    local.statuses[status] = true;
    local.updatedAt = Date.now();
    playSound("status");
    showToast("HINDER", `${name} · ${status.toUpperCase()} APPLIED`, "status", false);
    render();
    setTimeout(() => {
      const current = monsterById(monsterId); if (!current) return;
      current.statuses ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
      if (!current.statusImmunities?.[status]) return;
      current.statuses[status] = false;
      current.updatedAt = Date.now();
      playSound("immune");
      recordCombatHistory("status", `${name} · ${status.toUpperCase()} APPLIED → NO EFFECT · IMMUNE`);
      showToast("NO EFFECT", `${name} · ${status.toUpperCase()} did not stick`, "status", false);
      render();
    }, 420);
    return;
  }
  if (!previousValue && local.statusImmunities?.[status]) {
    const localView = monsterPhaseView(local, "active");
    playSound("status");
    showToast("IMMUNE", `${localView?.name || local.name || "MONSTER"} · ${status.toUpperCase()} IMMUNE`, "status", false);
    return;
  }
  const nextValue = !previousValue;
  const optimisticTime = Date.now();
  local.statuses[status] = nextValue;
  local.updatedAt = optimisticTime;
  playSound("status");
  render();
  if (PREVIEW) return;
  try {
    if (!await OBR.scene.isReady()) throw new Error("Scene is not ready");
    const md = await OBR.scene.getMetadata();
    const monsters = Array.isArray(md[SCENE_MONSTERS_KEY]) ? md[SCENE_MONSTERS_KEY].map(normalizeMonster) : [];
    const idx = monsters.findIndex(m => sameId(m.id, monsterId)); if (idx < 0) throw new Error("Monster is no longer in this Scene.");
    monsters[idx].statuses ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
    monsters[idx].statusImmunities ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
    if (nextValue && monsters[idx].statusImmunities?.[status]) throw new Error(`${status.toUpperCase()} IMMUNE`);
    monsters[idx].statuses[status] = nextValue;
    monsters[idx].updatedAt = Math.max(Date.now(), optimisticTime);
    await OBR.scene.setMetadata({ [SCENE_MONSTERS_KEY]: monsters.map(m => ({ ...deepClone(m), specialRules: [] })) });
    local.statuses[status] = nextValue;
    local.updatedAt = monsters[idx].updatedAt;
    const localView = monsterPhaseView(local, "active");
    recordCombatHistory("status", `${localView.name || "MONSTER"} · ${status.toUpperCase()} ${nextValue ? "APPLIED" : "REMOVED"}`);
    showToast("HINDER", `${localView.name || "MONSTER"} · ${status.toUpperCase()} ${nextValue ? "APPLIED" : "REMOVED"}`, "status", false);
    render();
  } catch (e) {
    console.warn("hinder status", e);
    local.statuses[status] = previousValue;
    local.updatedAt = Date.now();
    render();
    notify(e?.message || "Could not update monster debuff.");
  }
}

async function setPlayerQuick(owner, key, raw) {
  const s = sourceSheet(owner); if (!s) return;
  const cur = key === "fp" ? Number(s.fp) : Number(s[key].current), parsed = parseAdjustment(raw, cur); if (!parsed) return notify("Use +5, -3 or a number");
  const path = key === "fp" ? "fp" : `${key}.current`;
  if (parsed.kind === "adjust") await adjustPlayer(owner, key, parsed.delta);
  else {
    let value = parsed.value;
    if (key === "fp") value = Math.max(0, value); else value = clamp(value, 0, Number(s[key].max) || 0);
    await sendRemoteEdit(owner, { kind: "set", path, value });
    if (key === "hp" && value !== cur) playSound(value > cur ? "hpup" : "hpdown");
  }
}
function monsterById(id) { return runtime.sceneMonsters.find(x => sameId(x.id, id)); }
function libraryMonsterById(id) { return runtime.monsterLibrary.find(x => sameId(x.id, id)); }
function studyHinderMonsterTarget(ref = {}) {
  const id = typeof ref === "object" ? (ref.id ?? ref.studyTargetId ?? ref.monsterId ?? "") : ref;
  const tokenId = typeof ref === "object" ? (ref.tokenId ?? ref.studyTargetTokenId ?? ref.linkedTokenId ?? "") : "";
  if (id !== "" && id != null) { const byId = monsterById(id); if (byId) return byId; }
  if (tokenId) return runtime.sceneMonsters.find(x => sameId(x.linkedTokenId, tokenId)) || null;
  return null;
}
function canonicalStudyHinderTargetId(ref = {}) { const m = studyHinderMonsterTarget(ref); return m ? String(m.id) : ""; }
function updateMonster(mode, id, fn) {
  const m = mode === "lib" ? libraryMonsterById(id) : monsterById(id); if (!m) return;
  const before = mode === "active" ? deepClone(m) : null;
  const beforeHp = mode === "active" ? Number(m.hp?.current) || 0 : 0;
  fn(m);
  const becameDefeated = mode === "active" && beforeHp > 0 && Number(m.hp?.current) <= 0;
  if (becameDefeated) m.defeatedRestoreHp = beforeHp;
  m.rank = normalizeMonsterRank(m.rank);
  for (const p of (m.phases || [])) p.rank = normalizeMonsterRank(p.rank);
  m.ip ||= { current: 0, max: 0 }; m.ip.max = Math.max(0, Number(m.ip.max) || 0); m.ip.current = clamp(m.ip.current, 0, m.ip.max); m.fp = Math.max(0, Number(m.fp) || 0);
  syncMonsterResourceCaps(m);
  enforceMonsterUltima(m); m.updatedAt = Date.now();
  if (mode === "lib") { saveMonsterLibrary(runtime.monsterLibrary); scheduleCodexTemplateSync(id); } else {
    scheduleSceneSave(); recordMonsterCombatDiff(before, m); learnCodexFromScene();
    if (becameDefeated) { const v = monsterPhaseView(m, "active"); announceCombatOutcome("defeated", v?.name || m.name || "MONSTER", "monster"); }
  }
}
function addMonsterPhase(mode, id) {
  if (runtime.currentPlayer.role !== "GM") return;
  const m = findMonsterTarget(mode, id); if (!m) return;
  if (m.phases.length >= MAX_MONSTER_PHASES) return notify(`Maximum ${MAX_MONSTER_PHASES} phases reached.`);
  const nextIndex = m.phases.length + 1;
  const source = monsterPhaseView(m, mode);
  updateMonster(mode, id, raw => {
    const phase = monsterPhaseSnapshot(source, nextIndex, `PHASE ${nextIndex + 1}`);
    phase.id = `phase-${uid()}`;
    phase.studyTier = 0;
    raw.phases.push(phase);
    if (mode === "active") raw.activePhase = nextIndex;
  });
  if (mode === "lib") runtime.monsterPhase = nextIndex;
  else recordCombatHistory("phase", `${source.name || m.name || "MONSTER"} · ENTERED PHASE ${nextIndex + 1}`);
  runtime.monsterTab = "sheet";
  render();
}
function removeMonsterPhase(mode, id, index) {
  if (runtime.currentPlayer.role !== "GM") return;
  const m = findMonsterTarget(mode, id), i = Number(index); if (!m || i < 1 || i > m.phases.length) return;
  const label = monsterPhaseLabel(m, i), oldName = monsterPhaseView(m, mode)?.name || m.name;
  if (!confirm(`Remove ${label}? This deletes that phase sheet and its actions.`)) return;
  updateMonster(mode, id, raw => {
    raw.phases.splice(i - 1, 1);
    raw.phases.forEach((p, n) => { if (!String(p.label || "").trim() || /^PHASE\s+\d+$/i.test(p.label)) p.label = `PHASE ${n + 2}`; });
    if (mode === "active") raw.activePhase = clamp(raw.activePhase === i ? 0 : (raw.activePhase > i ? raw.activePhase - 1 : raw.activePhase), 0, raw.phases.length);
  });
  if (mode === "lib") runtime.monsterPhase = 0;
  else recordCombatHistory("phase", `${oldName} · ${label} REMOVED · RETURNED TO ${monsterPhaseLabel(m, m.activePhase)}`);
  runtime.monsterTab = "sheet";
  render();
}
function announceMonsterPhaseChange(monster, fromName = "") {
  if (!monster) return;
  const v = monsterPhaseView(monster, "active"), index = monsterPhaseIndex(monster, "active");
  const payload = { id: uid(), senderId: runtime.currentPlayer.id, senderName: runtime.currentPlayer.name, monsterId: monster.id, name: v?.name || monster.name || "MONSTER", fromName, phaseLabel: monsterPhaseLabel(monster, index), phaseIndex: index, portrait: String(v?.portrait || ""), time: Date.now() };
  playSound("phase"); showTimedOverlay({ kind: "phase-change", ...payload }, 3000); broadcast("phase-change", payload);
}
function switchMonsterPhase(mode, id, index) {
  const m = findMonsterTarget(mode, id); if (!m) return;
  const i = clamp(Number(index) || 0, 0, m.phases.length);
  if (mode === "lib") { runtime.monsterPhase = i; runtime.monsterTab = "sheet"; render(); return; }
  if (runtime.currentPlayer.role !== "GM") return;
  const beforeIndex = monsterPhaseIndex(m, "active"); if (beforeIndex === i) return;
  const beforeName = monsterPhaseView(m, "active")?.name || m.name;
  updateMonster("active", id, raw => { raw.activePhase = i; });
  const after = monsterById(id), afterView = after ? monsterPhaseView(after, "active") : null;
  recordCombatHistory("phase", `${beforeName} · ${monsterPhaseLabel(m, beforeIndex)} → ${monsterPhaseLabel(after, i)}${afterView?.name && afterView.name !== beforeName ? ` · ${afterView.name}` : ""} · STUDY ${STUDY_LABELS[monsterTier(after, i)]}`, "", { type: "phase", monsterId: id, phase: beforeIndex });
  announceMonsterPhaseChange(after, beforeName);
  runtime.monsterTab = "sheet";
  render();
}
async function adjustMonster(id, key, delta) {
  if (runtime.currentPlayer.role !== "GM") return;
  const m = monsterById(id); if (!m) return;
  if (key === "fp") {
    const old = Math.max(0, Number(m.fp) || 0);
    updateMonster("active", id, x => { x.fp = Math.max(0, old + Number(delta || 0)); });
    render(); return;
  }
  const resource = m[key]; if (!resource || resource.current === undefined) return;
  const old = Number(resource.current) || 0;
  updateMonster("active", id, x => { if (x[key]) x[key].current = clamp(old + Number(delta || 0), 0, Number(x[key].max) || 0); });
  if (key === "hp") { const now = Number(monsterById(id)?.hp?.current) || 0; if (!(old > 0 && now <= 0)) playSound(Number(delta) > 0 ? "hpup" : "hpdown"); } render();
}
async function setMonsterQuick(id, key, raw) {
  const m = monsterById(id); if (!m || runtime.currentPlayer.role !== "GM") return;
  if (key === "fp") {
    const cur = Math.max(0, Number(m.fp) || 0), p = parseAdjustment(raw, cur); if (!p) return notify("Use +5, -3 or a number");
    const value = Math.max(0, p.kind === "adjust" ? cur + p.delta : p.value);
    updateMonster("active", id, x => { x.fp = value; }); render(); return;
  }
  const resource = m[key]; if (!resource || resource.current === undefined) return;
  const cur = Number(resource.current) || 0, p = parseAdjustment(raw, cur); if (!p) return notify("Use +5, -3 or a number");
  const value = p.kind === "adjust" ? clamp(cur + p.delta, 0, Number(resource.max) || 0) : clamp(p.value, 0, Number(resource.max) || 0);
  updateMonster("active", id, x => { if (x[key]) x[key].current = value; }); if (key === "hp" && value !== cur && !(cur > 0 && value <= 0)) playSound(value > cur ? "hpup" : "hpdown"); render();
}

async function notify(msg) { if (!PREVIEW && runtime.online) try { return OBR.notification.show(msg, "INFO"); } catch {} console.log(msg); }
async function getSelectedSceneItems() {
  if (PREVIEW) return [{ id: "preview-token", type: "IMAGE", layer: "CHARACTER", name: "Preview Token", image: { url: state.portrait || "" } }];
  if (!await OBR.scene.isReady()) throw new Error("Open a Scene before linking a token");
  const ids = await OBR.player.getSelection(); if (!ids?.length) return [];
  return OBR.scene.items.getItems(ids);
}
function bestSelectedToken(items = []) { return items.find(x => x.type === "IMAGE" && x.layer === "CHARACTER") || items.find(x => x.type === "IMAGE") || items.find(x => x.layer === "CHARACTER") || items[0] || null; }
function cardEntryByKind(sheet, kind, index) {
  if (!sheet) return null;
  const i = Number(index);
  if (kind === "sphere") return sheet.spheres?.[i] || null;
  if (kind === "inventory") return sheet.inventory?.[i] || null;
  if (kind === "arcana" || kind === "bonds") return sheet.lists?.[kind]?.[i] || null;
  return null;
}
function cardKindLabel(kind) { return kind === "sphere" ? "SPHERE" : kind === "inventory" ? "ITEM" : kind === "bonds" ? "BOND" : kind === "arcana" ? "ARCANA" : "CARD"; }
async function linkCardToSelectedToken(owner, kind, index) {
  if (PREVIEW) return notify("Token linking is available inside Owlbear");
  const sheet = sourceSheet(owner), entry = cardEntryByKind(sheet, kind, index);
  if (!entry) return notify(`${cardKindLabel(kind)} not found`);
  const items = await getSelectedSceneItems();
  if (!items.length) return notify("Select an existing token on the Owlbear Scene first");
  const token = bestSelectedToken(items), art = tokenArtFromSceneItem(token);
  if (!token || !art) return notify("Select an IMAGE token with artwork first");
  runtime.cardTokenImages ||= {};
  runtime.cardTokenImages[String(token.id)] = { url: art.image.url, name: token.name || art.name || "LINKED TOKEN" };
  await sendRemoteEdit(owner, { kind: "link-card-token", cardKind: kind, index: Number(index), tokenId: token.id, tokenArt: art });
  notify(`${cardKindLabel(kind)} linked to ${token.name || "selected token"}`);
}
async function unlinkCardToken(owner, kind, index) {
  const sheet = sourceSheet(owner), entry = cardEntryByKind(sheet, kind, index);
  if (!entry) return;
  await sendRemoteEdit(owner, { kind: "unlink-card-token", cardKind: kind, index: Number(index) });
  notify(`${cardKindLabel(kind)} token link removed`);
}
function cardTokenCacheSignature(map = {}) {
  return Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).map(([id,x]) => `${id}:${x?.url || ""}:${x?.name || ""}`).join("|");
}
async function refreshCardTokenImageCache() {
  if (PREVIEW || !runtime.online || !OBR) return false;
  try {
    if (!await OBR.scene.isReady()) return false;
    const items = await OBR.scene.items.getItems(item => item?.type === "IMAGE" && !!item?.image?.url);
    const next = {};
    for (const item of items || []) next[String(item.id)] = { url: String(item.image.url), name: String(item.name || "LINKED TOKEN") };
    const changed = cardTokenCacheSignature(next) !== cardTokenCacheSignature(runtime.cardTokenImages || {});
    runtime.cardTokenImages = next;
    return changed;
  } catch (e) { console.warn("card token image cache", e); return false; }
}
function scheduleCardTokenImageRefresh(delay = 80) {
  clearTimeout(runtime.cardTokenRefreshTimer);
  runtime.cardTokenRefreshTimer = setTimeout(async () => {
    const changed = await refreshCardTokenImageCache();
    if (changed && ((runtime.inspect?.kind === "player" && ["spheres","inventory","bond","arcana"].includes(runtime.partyEditTab)) || tokenActionHudActor())) render();
  }, Math.max(0, Number(delay) || 0));
}
async function selectedEnemyMonsterTargetRefs() {
  try {
    const selected = await getSelectedSceneItems(); if (!selected.length) return [];
    const ids = new Set(selected.map(x => String(x.id)));
    return runtime.sceneMonsters.filter(m => m.faction !== "ally" && !isMonsterDefeated(m) && m.linkedTokenId && ids.has(String(m.linkedTokenId))).map(m => `monster:${m.id}`);
  } catch (e) { console.warn("selected token auto target", e); return []; }
}
const CANVAS_TEXT_STATS = [
  { key: "hp", label: "HP" }, { key: "mp", label: "MP" }, { key: "ip", label: "IP" },
  { key: "fp", label: "FP" }, { key: "defense", label: "DEF" }, { key: "magicDefense", label: "M.DEF" }
];
function canvasTextValue(s, key) {
  if (!s) return "";
  if (key === "hp" || key === "mp" || key === "ip") return `${Number(s[key]?.current) || 0}/${Number(s[key]?.max) || 0}`;
  if (key === "fp") return String(Number(s.fp) || 0);
  if (key === "defense") return String(playerDefense(s, "defense"));
  if (key === "magicDefense") return String(playerDefense(s, "magicDefense"));
  return "";
}
function richTextPlain(nodes) {
  if (!Array.isArray(nodes)) return "";
  let out = "";
  const walk = arr => { for (const n of arr || []) { if (typeof n?.text === "string") out += n.text; if (Array.isArray(n?.children)) walk(n.children); } };
  walk(nodes); return out;
}
function canvasTextCurrent(item) {
  if (!item?.text) return "";
  return item.text.type === "RICH" ? richTextPlain(item.text.richText) : String(item.text.plainText || "");
}
function replaceRichTextContentPreserveFormat(nodes, value) {
  let wrote = false;
  const next = String(value ?? "");
  const walk = arr => {
    for (const node of arr || []) {
      if (!node || typeof node !== "object") continue;
      if (typeof node.text === "string") {
        node.text = wrote ? "" : next;
        wrote = true;
      }
      if (Array.isArray(node.children)) walk(node.children);
    }
  };
  walk(nodes);
  return wrote;
}
function setCanvasTextValue(item, value) {
  if (!item?.text) return;
  const next = String(value ?? "");
  // Never replace the Text/RichText object itself: Owlbear stores font/size/alignment
  // information in that existing structure. Mutate only the visible characters.
  if (item.text.type === "RICH") {
    if (!replaceRichTextContentPreserveFormat(item.text.richText, next)) return;
  } else {
    item.text.plainText = next;
  }
}
async function syncCanvasTextLinksForSheet(owner, sheet) {
  if (PREVIEW || !OBR || !sheet || !await OBR.scene.isReady()) return;
  const links = sheet.canvasTextLinks || {};
  const pairs = CANVAS_TEXT_STATS.map(x => ({ ...x, id: String(links[x.key] || ""), value: canvasTextValue(sheet, x.key) })).filter(x => x.id);
  if (!pairs.length) return;
  const items = await OBR.scene.items.getItems(pairs.map(x => x.id));
  const itemMap = new Map(items.map(x => [x.id, x]));
  const changed = pairs.filter(x => { const item = itemMap.get(x.id); return item?.type === "TEXT" && canvasTextCurrent(item) !== x.value; });
  if (!changed.length) return;
  const ids = new Set(changed.map(x => x.id));
  const values = new Map(changed.map(x => [x.id, x.value]));
  await OBR.scene.items.updateItems(items.filter(x => ids.has(x.id)), xs => { for (const item of xs) setCanvasTextValue(item, values.get(item.id) ?? ""); });
}
function scheduleCanvasTextSync(owner, sheet) {
  runtime.canvasTextSyncTimers ||= {};
  clearTimeout(runtime.canvasTextSyncTimers[owner]);
  const snapshot = deepClone(sheet);
  runtime.canvasTextSyncTimers[owner] = setTimeout(() => syncCanvasTextLinksForSheet(owner, snapshot).catch(e => console.warn("canvas text sync", e)), 40);
}
async function linkCanvasTextForPlayer(owner, key) {
  if (!CANVAS_TEXT_STATS.some(x => x.key === key)) return;
  try {
    const items = await getSelectedSceneItems(), texts = items.filter(x => x.type === "TEXT");
    if (texts.length !== 1) return notify(texts.length ? "Select exactly one Text item" : "Select one Text item on the Owlbear Scene first");
    const item = texts[0];
    await sendRemoteEdit(owner, { kind: "set", path: `canvasTextLinks.${key}`, value: item.id });
    const s = sourceSheet(owner); if (s) await syncCanvasTextLinksForSheet(owner, s);
    notify(`${CANVAS_TEXT_STATS.find(x => x.key === key)?.label || key} linked to selected Text`);
  } catch (e) { console.warn(e); notify(e?.message || "Text link failed"); }
}
async function unlinkCanvasTextForPlayer(owner, key) {
  await sendRemoteEdit(owner, { kind: "set", path: `canvasTextLinks.${key}`, value: "" });
  notify(`${CANVAS_TEXT_STATS.find(x => x.key === key)?.label || key} Text unlinked`);
}
function canvasTextLinksPortraitPanel(owner, s) {
  const links = s.canvasTextLinks || {};
  const rows = CANVAS_TEXT_STATS.map(x => {
    const linked = !!links[x.key];
    return `<div class="portrait-text-link ${linked ? "linked" : ""}"><div class="portrait-text-link-value"><b>${x.label}</b><span>${esc(canvasTextValue(s, x.key))}</span></div><div class="portrait-text-link-actions"><button class="mini-btn" data-link-canvas-text="${esc(owner)}:${x.key}">${linked ? "RELINK" : "LINK"}</button><button class="danger-soft" data-unlink-canvas-text="${esc(owner)}:${x.key}" ${linked ? "" : "disabled"}>×</button></div></div>`;
  }).join("");
  return `<div class="portrait-text-links"><div class="portrait-text-links-head"><b>CANVAS TEXT LINKS</b><small>SELECT ONE TEXT · LINK EACH VALUE</small></div><div class="portrait-text-links-grid">${rows}</div></div>`;
}

async function choosePortraitFor(owner) {
  if (PREVIEW) return notify("Portrait picker is available inside Owlbear");
  try {
    const s = sourceSheet(owner), imgs = await OBR.assets.downloadImages(false, s?.name || "CHARACTER", "CHARACTER");
    if (imgs?.[0]?.image?.url) await sendRemoteEdit(owner, { kind: "set", path: "portrait", value: imgs[0].image.url });
  } catch (e) { console.warn(e); notify("Portrait selection failed"); }
}
async function portraitArtFromSelectedTokenForPlayer(owner) {
  try {
    const items = await getSelectedSceneItems(), img = items.find(x => x.image?.url);
    if (!img?.image?.url) return notify("Selected token has no image");
    await sendRemoteEdit(owner, { kind: "set", path: "portrait", value: img.image.url });
  } catch (e) { notify(e?.message || "Portrait art failed"); }
}
async function tokenArtForPlayer(owner) {
  if (PREVIEW) return notify("Token Art picker is available inside Owlbear");
  try {
    const s = sourceSheet(owner), imgs = await OBR.assets.downloadImages(false, `${s?.name || "CHARACTER"} TOKEN`, "CHARACTER");
    const art = tokenArtFromDownload(imgs?.[0]);
    if (!art) return;
    await sendRemoteEdit(owner, { kind: "set", path: "tokenArt", value: art });
    notify("Token Art updated");
  } catch (e) { console.warn(e); notify("Token Art selection failed"); }
}
async function tokenArtFromSelectedForPlayer(owner) {
  try {
    const items = await getSelectedSceneItems(), img = items.find(x => x.image?.url), art = tokenArtFromSceneItem(img);
    if (!art) return notify("Selected token has no image");
    await sendRemoteEdit(owner, { kind: "set", path: "tokenArt", value: art });
    notify("Token Art copied from selected token");
  } catch (e) { notify(e?.message || "Token Art failed"); }
}
function loadTokenPlacement() {
  try {
    const raw = JSON.parse(localStorage.getItem(TOKEN_PLACEMENT_KEY) || "null");
    if (!raw || typeof raw !== "object" || !raw.kind) return null;
    return raw;
  } catch { return null; }
}
function saveTokenPlacement(value) {
  if (!value) localStorage.removeItem(TOKEN_PLACEMENT_KEY);
  else localStorage.setItem(TOKEN_PLACEMENT_KEY, JSON.stringify(value));
}
function tokenPlacementBarHTML() {
  const p = loadTokenPlacement();
  if (!p) return "";
  const label = String(p.name || "TOKEN");
  return `<section class="token-placement-bar token-placement-click" data-dom-key="token-placement-bar"><div class="token-placement-copy"><b>CLICK A MAP SQUARE TO PLACE TOKEN</b><span><strong>${esc(label)}</strong> is waiting for a position. Click the exact point on the Owlbear map; Fabula will snap it to grid and link stats automatically.</span></div><div class="token-placement-actions"><button type="button" class="danger-soft" data-token-placement-cancel>CANCEL PLACEMENT</button></div></section>`;
}
async function restoreToolAfterTokenPlacement(p) {
  if (PREVIEW || !OBR || !p) return;
  const toolId = String(p.previousTool || ""), modeId = String(p.previousMode || "");
  if (!toolId || !modeId || modeId === TOKEN_PLACEMENT_MODE_ID) return;
  try { await OBR.tool.activateMode(toolId, modeId); } catch (e) { console.warn("restore previous tool mode", e); }
}
async function cancelTokenPlacement({ silent = false } = {}) {
  const p = loadTokenPlacement();
  if (!p) return;
  if (!PREVIEW && OBR && p.markerId && await OBR.scene.isReady()) {
    try { await OBR.scene.items.deleteItems([p.markerId]); } catch (e) { console.warn("delete legacy placement marker", e); }
    try { await OBR.player.deselect([p.markerId]); } catch {}
  }
  saveTokenPlacement(null);
  await restoreToolAfterTokenPlacement(p);
  render();
  if (!silent) notify("Token placement cancelled");
}
async function ensureTokenPlacementSlot() {
  const p = loadTokenPlacement();
  if (!p) return true;
  if (!confirm(`A token is already waiting for placement: ${p.name || "TOKEN"}. Cancel that placement and start a new one?`)) return false;
  await cancelTokenPlacement({ silent: true });
  return true;
}
let tokenPlacementModeReady = false;
async function ensureTokenPlacementMode() {
  if (PREVIEW || tokenPlacementModeReady) return;
  await OBR.tool.createMode({
    id: TOKEN_PLACEMENT_MODE_ID,
    icons: [{ icon: "/action-icon-v213.svg", label: "Place Fabula Token", filter: { activeTools: [OBR_POINTER_TOOL_ID] } }],
    cursors: [{ cursor: "crosshair", filter: { activeTools: [OBR_POINTER_TOOL_ID], activeModes: [TOKEN_PLACEMENT_MODE_ID] } }],
    async onToolClick(_context, event) {
      const pending = loadTokenPlacement();
      if (!pending) return false;
      await placePendingTokenAtPosition(pending, event.pointerPosition);
      return false;
    },
    onKeyDown(_context, event) {
      if (event?.key === "Escape") cancelTokenPlacement();
    }
  });
  tokenPlacementModeReady = true;
}
async function startTokenPlacement(request, rawArt, name = "TOKEN") {
  if (PREVIEW) return notify("Token placement is available inside Owlbear");
  if (!await OBR.scene.isReady()) return notify("Open an Owlbear Scene first");
  const art = normalizeTokenArt(rawArt);
  if (!art) return notify("Set TOKEN ART first");
  if (!await ensureTokenPlacementSlot()) return;
  await ensureTokenPlacementMode();
  let previousTool = "", previousMode = "";
  try { previousTool = await OBR.tool.getActiveTool(); } catch {}
  try { previousMode = await OBR.tool.getActiveToolMode(); } catch {}
  const pending = { ...request, art, name: String(name || "TOKEN"), previousTool, previousMode, createdAt: Date.now() };
  saveTokenPlacement(pending);
  render();
  try { await OBR.tool.activateMode(OBR_POINTER_TOOL_ID, TOKEN_PLACEMENT_MODE_ID); }
  catch (e) { saveTokenPlacement(null); render(); throw e; }
  notify("Placement mode active · click the desired square on the Owlbear map");
}
async function linkPlacedToken(p, token) {
  let finalName = p.name || token.name || "TOKEN";
  if (p.kind === "player") {
    const sheet = sourceSheet(p.owner);
    if (!sheet || sheet.deleted) throw new Error("Character sheet not found");
    await sendRemoteEdit(p.owner, { kind: "link-token", tokenId: token.id });
    finalName = sheet.name || finalName;
  } else if (p.kind === "active-monster") {
    const m = monsterById(p.monsterId);
    if (!m) throw new Error("Monster is no longer in this Scene");
    updateMonster("active", p.monsterId, x => { x.linkedTokenId = token.id; x.showHud = true; });
    finalName = monsterPhaseView(m, "active")?.name || m.name || finalName;
  } else if (p.kind === "monster-template") {
    const template = libraryMonsterById(p.templateId);
    if (!template) throw new Error("Monster Template not found");
    const instance = spawnMonster(p.templateId, p.faction || "enemy", Number(p.phaseIndex) || 0);
    if (!instance) throw new Error("Could not create Monster Instance");
    updateMonster("active", instance.id, x => { x.linkedTokenId = token.id; x.showHud = true; });
    finalName = monsterPhaseView(instance, "active")?.name || instance.name || finalName;
  } else throw new Error("Unknown token placement target");
  try {
    await OBR.scene.items.updateItems([token], items => {
      for (const item of items) item.name = String(finalName || "TOKEN");
    });
  } catch (e) { console.warn("rename placed token", e); }
  return finalName;
}
async function placePendingTokenAtPosition(p, rawPosition) {
  if (!p || !loadTokenPlacement()) return;
  if (PREVIEW || !OBR || !await OBR.scene.isReady()) return notify("Open the Owlbear Scene first");
  try {
    let position = rawPosition;
    try { position = await OBR.scene.grid.snapPosition(rawPosition); } catch {}
    const token = await createSceneTokenFromArt(p.art, `PLACE · ${String(p.name || "TOKEN")}`, position);
    if (!token) return;
    let finalName;
    try { finalName = await linkPlacedToken(p, token); }
    catch (e) {
      try { await OBR.scene.items.deleteItems([token.id]); } catch {}
      throw e;
    }
    saveTokenPlacement(null);
    await restoreToolAfterTokenPlacement(p);
    render();
    notify(`${finalName} · token placed + stats linked`);
  } catch (e) {
    console.warn("click token placement", e);
    notify(e?.message || "Token spawn failed");
  }
}
async function finalizeTokenPlacement() {
  const p = loadTokenPlacement();
  if (!p) return notify("No token is waiting for placement");
  if (!p.markerId) return notify("Click a position on the Owlbear map to place this token");
  if (PREVIEW || !OBR || !await OBR.scene.isReady()) return notify("Open the Owlbear Scene first");
  try {
    const items = await OBR.scene.items.getItems([p.markerId]);
    const token = items.find(x => x.id === p.markerId);
    if (!token) { saveTokenPlacement(null); render(); return notify("Placement token no longer exists"); }
    let snapped = token.position;
    try { snapped = await OBR.scene.grid.snapPosition(token.position); } catch {}
    try { await OBR.scene.items.updateItems([token], xs => { for (const x of xs) x.position = snapped; }); } catch {}
    const finalName = await linkPlacedToken(p, token);
    saveTokenPlacement(null);
    await restoreToolAfterTokenPlacement(p);
    render();
    notify(`${finalName} · token placed + stats linked`);
  } catch (e) { console.warn("legacy finalize token placement", e); notify(e?.message || "Token spawn failed"); }
}
async function sceneTokenSpawnPosition() {
  // Prefer the exact area created by David Severwright's Default View extension.
  // It stores an invisible MAP shape with metadata key
  // "uk.co.davidsev.owlbear-default-view/item". Spawning in the center of that
  // shape makes token creation deterministic and independent of the popover/tool state.
  let pos = null;
  try {
    const defaultViewItems = await OBR.scene.items.getItems(item => item?.metadata?.[DEFAULT_VIEW_META_KEY] === true);
    if (defaultViewItems.length) {
      const bounds = await OBR.scene.items.getItemBounds(defaultViewItems.map(item => item.id));
      if (bounds && Number.isFinite(bounds?.min?.x) && Number.isFinite(bounds?.min?.y) && Number.isFinite(bounds?.width) && Number.isFinite(bounds?.height)) {
        pos = { x: bounds.min.x + bounds.width / 2, y: bounds.min.y + bounds.height / 2 };
      }
    }
  } catch (e) { console.warn("default view token position", e); }

  // If Set Default View is not installed/configured, use the center of the
  // player's currently visible Owlbear viewport. getPosition() is not the
  // viewport center, so convert the screen center back into scene coordinates.
  if (!pos) {
    try {
      const [width, height] = await Promise.all([OBR.viewport.getWidth(), OBR.viewport.getHeight()]);
      if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        pos = await OBR.viewport.inverseTransformPoint({ x: width / 2, y: height / 2 });
      }
    } catch (e) { console.warn("viewport center token position", e); }
  }

  // Last-resort compatibility fallback for older SDK behavior.
  if (!pos) pos = await OBR.viewport.getPosition();
  try { return await OBR.scene.grid.snapPosition(pos); } catch { return pos; }
}
async function createSceneTokenFromArt(rawArt, name = "TOKEN", explicitPosition = null) {
  if (PREVIEW) { notify("Token spawning is available inside Owlbear"); return null; }
  if (!OBRSDK?.buildImage) { notify("Owlbear image builder is unavailable"); return null; }
  if (!await OBR.scene.isReady()) { notify("Open an Owlbear Scene first"); return null; }
  const art = normalizeTokenArt(rawArt);
  if (!art) { notify("Set TOKEN ART first"); return null; }
  const position = explicitPosition || await sceneTokenSpawnPosition();
  const token = OBRSDK.buildImage(art.image, art.grid)
    .name(String(name || "TOKEN"))
    .layer("CHARACTER")
    .position(position)
    .rotation(art.rotation || 0)
    .scale(art.scale || { x: 1, y: 1 })
    .build();
  await OBR.scene.items.addItems([token]);
  return token;
}
async function spawnTokenAtDefaultViewAndLink(request, rawArt, name = "TOKEN") {
  if (PREVIEW) return notify("Token spawning is available inside Owlbear");
  if (!OBR || !await OBR.scene.isReady()) return notify("Open an Owlbear Scene first");
  const art = normalizeTokenArt(rawArt);
  if (!art) return notify("Set TOKEN ART first");

  // Clear any stale v2.87/v2.88 click-placement session so it cannot hijack
  // the pointer tool or leave the UI waiting for a map click.
  if (loadTokenPlacement()) await cancelTokenPlacement({ silent: true });

  let token = null;
  try {
    const position = await sceneTokenSpawnPosition();
    token = await createSceneTokenFromArt(art, `SPAWN · ${String(name || "TOKEN")}`, position);
    if (!token) return;
    const finalName = await linkPlacedToken({ ...request, art, name: String(name || "TOKEN") }, token);
    render();
    notify(`${finalName} · token spawned at Default View + stats linked`);
    return token;
  } catch (e) {
    if (token?.id) {
      try { await OBR.scene.items.deleteItems([token.id]); } catch {}
    }
    console.warn("default view token spawn", e);
    notify(e?.message || "Token spawn failed");
    return null;
  }
}
async function spawnPlayerTokenAndLink(owner) {
  try {
    const s = sourceSheet(owner); if (!s || s.deleted) return notify("Character sheet not found");
    if (!normalizeTokenArt(s.tokenArt)) return notify("Set TOKEN ART before spawning");
    if (s.linkedTokenId && !confirm("This character already has linked stats. Spawn a new token at Default View and relink stats to it? The old token will stay on the map.")) return;
    await spawnTokenAtDefaultViewAndLink({ kind: "player", owner }, s.tokenArt, s.name || "CHARACTER");
  } catch (e) { console.warn(e); notify(e?.message || "Token spawn failed"); }
}
async function linkTokenForPlayer(owner) {
  try {
    const items = await getSelectedSceneItems(); if (!items.length) return notify("Select a token on the Owlbear Scene first");
    const token = bestSelectedToken(items); if (!token) return notify("Selected Scene item could not be linked");
    await sendRemoteEdit(owner, { kind: "link-token", tokenId: token.id }); await notify(`Stats linked${token.name ? `: ${token.name}` : ""}`);
  } catch (e) { console.warn(e); notify(e?.message || "Token stat link failed"); }
}
async function unlinkTokenForPlayer(owner) { await sendRemoteEdit(owner, { kind: "unlink-token" }); await notify("Token stats unlinked"); }
async function chooseMonsterPortrait(mode, id) {
  if (runtime.currentPlayer.role !== "GM") return;
  if (PREVIEW) return notify("Portrait picker is available inside Owlbear");
  try {
    const m = mode === "lib" ? libraryMonsterById(id) : monsterById(id), v = m ? monsterPhaseView(m, mode) : null;
    const imgs = await OBR.assets.downloadImages(false, v?.name || "MONSTER", "CHARACTER");
    if (imgs?.[0]?.image?.url) { updateMonster(mode, id, x => { monsterPhaseTarget(x, mode).portrait = imgs[0].image.url; }); render(); }
  } catch { notify("Portrait selection failed"); }
}
async function monsterPortraitFromSelectedToken(mode, id) {
  try {
    const items = await getSelectedSceneItems(), img = items.find(x => x.image?.url);
    if (!img?.image?.url) return notify("Selected token has no image");
    updateMonster(mode, id, x => { monsterPhaseTarget(x, mode).portrait = img.image.url; }); render();
  } catch (e) { notify(e?.message || "Portrait art failed"); }
}
async function monsterTokenArt(mode, id) {
  if (runtime.currentPlayer.role !== "GM") return;
  if (PREVIEW) return notify("Token Art picker is available inside Owlbear");
  try {
    const m = mode === "lib" ? libraryMonsterById(id) : monsterById(id), v = m ? monsterPhaseView(m, mode) : null;
    const imgs = await OBR.assets.downloadImages(false, `${v?.name || "MONSTER"} TOKEN`, "CHARACTER"), art = tokenArtFromDownload(imgs?.[0]);
    if (!art) return;
    updateMonster(mode, id, x => { monsterPhaseTarget(x, mode).tokenArt = art; }); render(); notify("Monster Token Art updated");
  } catch (e) { console.warn(e); notify("Monster Token Art selection failed"); }
}
async function monsterTokenArtFromSelected(mode, id) {
  try {
    const items = await getSelectedSceneItems(), img = items.find(x => x.image?.url), art = tokenArtFromSceneItem(img);
    if (!art) return notify("Selected token has no image");
    updateMonster(mode, id, x => { monsterPhaseTarget(x, mode).tokenArt = art; }); render(); notify("Monster Token Art copied from selected token");
  } catch (e) { notify(e?.message || "Token Art failed"); }
}
async function linkActiveMonsterToken(id) {
  if (runtime.currentPlayer.role !== "GM") return;
  try {
    const items = await getSelectedSceneItems(); if (!items.length) return notify("Select a token first");
    const token = bestSelectedToken(items); if (!token) return;
    updateMonster("active", id, x => { x.linkedTokenId = token.id; x.showHud = true; }); render(); notify("Monster stats linked to selected token");
  } catch (e) { notify(e?.message || "Monster stat link failed"); }
}
async function spawnActiveMonsterTokenAndLink(id) {
  if (runtime.currentPlayer.role !== "GM") return;
  try {
    const m = monsterById(id); if (!m) return notify("Monster is no longer in this Scene");
    const v = monsterPhaseView(m, "active"), art = normalizeTokenArt(v.tokenArt);
    if (!art) return notify("Set TOKEN ART for this Monster Phase before spawning");
    if (m.linkedTokenId && !confirm("This monster already has linked stats. Spawn a new token at Default View and relink stats to it? The old token will stay on the map.")) return;
    await spawnTokenAtDefaultViewAndLink({ kind: "active-monster", monsterId: id }, art, v.name || m.name || "MONSTER");
  } catch (e) { console.warn(e); notify(e?.message || "Monster token spawn failed"); }
}
function unlinkActiveMonsterToken(id) { updateMonster("active", id, x => { x.linkedTokenId = ""; x.showHud = false; }); render(); notify("Monster stats unlinked"); }

function makeShare(title, body, extra = {}) {
  const msg = { id: uid(), senderId: runtime.currentPlayer.id, senderName: runtime.currentPlayer.name, title, body, gif: gifFromText(body), media: mediaFromText(body), time: Date.now(), ...extra };
  const publishShare=()=>{pushFeed({ kind: "share", ...msg });broadcast("share",msg);playSound("message");showOverlay({kind:"share",...msg});if(runtime.view==="chat"||runtime.view==="roll")render()};
  if(msg.cutIn){const cutIn={id:`cutin-${msg.id}`,rollId:msg.id,senderId:msg.senderId,senderName:msg.senderName,actorId:String(msg.actorId||msg.senderId),actorName:String(msg.actorName||msg.senderName),actionName:String(msg.actionName||msg.title||"ACTION"),portrait:String(msg.actorPortrait||""),element:String(msg.element||"none"),cutInColor:normalizeCutInColor(msg.cutInColor),time:Date.now()};broadcast("skill-cutin",cutIn).finally(publishShare)}else publishShare();
}
function playerCutInExtra(owner, sheet, entry, element="none") {
  return entry?.cutIn ? {cutIn:true,cutInColor:normalizeCutInColor(entry.cutInColor),actorId:String(owner||runtime.currentPlayer.id),actorName:String(sheet?.name||runtime.currentPlayer.name),actorPortrait:String(sheet?.portrait||""),actionName:String(entry?.name||"ACTION"),element:String(element||"none")} : {};
}
function sectionShare(which, s, isMonster = false) {
  const fp = isMonster ? "" : ` · FP ${s.fp}`;
  if (which === "profile") return makeShare(`${s.name} · PROFILE`, isMonster ? `Type: ${villainTypeLabel(s.villainType)}\nLevel: ${(s.normalLevel ?? s.level) || "—"} → ${s.level || "—"}\nRank: ${s.rank || "—"}\nSpecies: ${s.species || "—"}\nTraits: ${s.traits || "—"}` : `${s.identity || ""}\nTheme: ${s.theme || "—"}\nOrigin: ${s.origin || "—"}`);
  if (which === "combat") return makeShare(`${s.name} · COMBAT`, isMonster ? `HP ${s.hp.current}/${s.hp.max} · MP ${s.mp.current}/${s.mp.max} · IP ${s.ip?.current || 0}/${s.ip?.max || 0} · FP ${Number(s.fp) || 0} · UP ${s.up.current}/${s.up.max}\nLV ${s.level} · INIT ${s.initiative} · DEF ${defenseValue(s, "defense")} · M.DEF ${defenseValue(s, "magicDefense")}` : `HP ${s.hp.current}/${s.hp.max} · MP ${s.mp.current}/${s.mp.max} · IP ${s.ip.current}/${s.ip.max}\nLV ${s.level}${fp} · INIT ${s.initiative} · DEF ${playerDefense(s, "defense")} · M.DEF ${playerDefense(s, "magicDefense")}`);
  if (which === "attributes") return makeShare(`${s.name} · ATTRIBUTES`, ATTRS.map(k => `${k} d${s.attributes[k]} → d${currentDie(s, k)}`).join(" · "));
  if (which === "status") {
    const statusList = activeStatuses(s).map(k => k.toUpperCase());
    if (!isMonster && playerDefeatOutcome(s)) statusList.unshift(playerDefeatLabel(s));
    return makeShare(`${s.name} · STATUS`, statusList.join(" · ") || "No status effects");
  }
  if (which === "affinities") return makeShare(`${s.name} · ELEMENT AFFINITY`, ELEMENTS.map(e => `${e.toUpperCase()}: ${s.affinities[e]}`).join("\n"));
}

function parseResourceCostPrefill(text = "") {
  const src = String(text || "");
  const out = { hp: 0, mp: 0, ip: 0, fp: 0 };
  for (const key of ["hp", "mp", "ip", "fp"]) {
    const upper = key.toUpperCase();
    const before = new RegExp(`\\b${upper}\\s*(?:[:=x×-]\\s*)?(\\d+)\\b`, "i").exec(src);
    const after = new RegExp(`\\b(\\d+)\\s*${upper}\\b`, "i").exec(src);
    const match = before || after;
    if (match) out[key] = Math.max(0, Math.floor(Number(match[1]) || 0));
  }
  return out;
}
function resourceCostActor(actorKind, actorId, mode = "active") {
  if (actorKind === "monster") {
    const raw = findMonsterTarget(mode, actorId); if (!raw) return null;
    const view = monsterPhaseView(raw, mode);
    raw.ip ||= { current: 0, max: 0 }; raw.fp = Math.max(0, Number(raw.fp) || 0);
    return { kind: "monster", id: actorId, mode, name: view?.name || raw.name || "MONSTER", raw, sheet: view || raw };
  }
  const sheet = sourceSheet(actorId); if (!sheet) return null;
  return { kind: "player", id: actorId, mode: "player", name: sheet.name || sourceParty(actorId)?.name || "CHARACTER", sheet };
}
function resourceCostSnapshot(actorKind, actorId, mode = "active") {
  const actor = resourceCostActor(actorKind, actorId, mode); if (!actor) return null;
  const s = actor.kind === "monster" ? actor.raw : actor.sheet;
  return {
    actor,
    hp: Math.max(0, Number(s.hp?.current) || 0), hpMax: Math.max(0, Number(s.hp?.max) || 0),
    mp: Math.max(0, Number(s.mp?.current) || 0), mpMax: Math.max(0, Number(s.mp?.max) || 0),
    ip: Math.max(0, Number(s.ip?.current) || 0), ipMax: Math.max(0, Number(s.ip?.max) || 0),
    fp: Math.max(0, Number(s.fp) || 0)
  };
}
function openResourceCostPrompt({ actorKind = "player", actorId = "", mode = "active", title = "ACTION", verb = "SEND", listedCost = "", intent = null } = {}) {
  const snap = resourceCostSnapshot(actorKind, actorId, mode);
  if (!snap) return notify("Could not find the sheet that should pay this cost.");
  const prefill = parseResourceCostPrefill(listedCost);
  runtime.overlay = { kind: "cost-payment", actorKind, actorId, mode, actorName: snap.actor.name, title, verb, listedCost: String(listedCost || "").trim(), prefill, intent };
  renderOverlay();
}
function snapshotCostPromptInputs() {
  const x=runtime.overlay;if(x?.kind!=="cost-payment")return;
  x.prefill=readResourceCostInputs();x.rollModifiers=readResourceCostModifiers();
  const count=document.querySelector("[data-cost-target-random-count]");if(count)x.targetRandomCount=clamp(Number(count.value)||1,1,99);
}
function monsterCostTargetContext(x){
  if(x?.intent?.kind!=="monster-roll-action")return null;
  const raw=findMonsterTarget(x.intent.mode,x.intent.id),sheet=raw?monsterPhaseView(raw,x.intent.mode):null,action=sheet?.actions?.[x.intent.index];
  if(!raw||!sheet||!action)return null;
  const {st,pool}=sanitizeMonsterTargets(raw,x.intent.mode);return{raw,sheet,action,st,pool};
}
function monsterCostTargetPickerHTML(x){
  const ctx=monsterCostTargetContext(x);if(!ctx)return"";const selected=new Set(ctx.st.targets.map(t=>`${t.kind}:${t.id}`)),count=clamp(Number(x.targetRandomCount)||Number(ctx.st.count)||1,1,Math.max(1,ctx.pool.length));
  const list=ctx.pool.length?ctx.pool.map(t=>{const on=selected.has(`${t.kind}:${t.id}`),covered=!!coveredMeleeEntry(resolveRollTarget(`${t.kind}:${t.id}`));return `<button type="button" class="cost-target-option ${on?"on":""} ${covered?"covered":""}" data-cost-target-pick="${esc(t.kind)}|${esc(t.id)}"><i>${on?"✓":""}</i><span><b>${esc(t.name)}</b><small>${t.kind==="player"?"PLAYER":"ALLY MONSTER"}${covered?" · COVERED":""}</small></span></button>`}).join(""):`<div class="cost-target-empty">NO ONLINE PLAYERS OR ALLIES</div>`;
  const chips=ctx.st.targets.length?`<div class="cost-target-chips">${ctx.st.targets.map(t=>`<span>${esc(t.name)}</span>`).join("")}</div>`:"";
  return `<section class="cost-target-selector"><div class="cost-target-head"><div><b>SELECT TARGETS</b><small>PLAYER + ALLY ONLY · CHOOSE BEFORE ROLL</small></div><button type="button" class="mini-btn" data-cost-target-clear ${ctx.st.targets.length?"":"disabled"}>CLEAR</button></div><div class="cost-target-list">${list}</div><div class="cost-target-random"><label>RANDOM COUNT<input type="number" min="1" max="${Math.max(1,ctx.pool.length)}" value="${count}" data-cost-target-random-count></label><button type="button" class="primary" data-cost-target-random ${ctx.pool.length?"":"disabled"}>RANDOM TARGET</button><small>สุ่มเฉพาะผู้เล่นและ Ally ตามจำนวนที่กรอก</small></div>${chips}</section>`;
}
function resourceCostPromptHTML(x) {
  const snap = resourceCostSnapshot(x.actorKind, x.actorId, x.mode);
  if (!snap) return `<div class="cinematic-backdrop" data-overlay-backdrop-close><div class="cinematic-card cost-payment-pop" ><button class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">PAY COST</div><h2>SHEET NOT AVAILABLE</h2><div class="cost-payment-error visible">The paying sheet could not be found.</div></div></div>`;
  const pre = x.prefill || {};
  const row = (key, label, current, max = null) => `<label class="cost-payment-resource cost-${key}"><span>${label}<small>CURRENT ${current}${max === null ? "" : ` / ${max}`}</small></span><input type="number" min="0" step="1" inputmode="numeric" value="${Math.max(0, Number(pre[key]) || 0)}" data-cost-pay-input="${key}" aria-label="${label} cost"></label>`;
  const rollIntent = ["roll-player-action","monster-roll-action"].includes(String(x.intent?.kind || ""));
  const savedMods=x.rollModifiers||{};
  const mods = rollIntent ? `<section class="cost-roll-modifiers"><div class="cost-roll-mod-head"><b>ROLL MODIFIERS</b><small>OPTIONAL · USE + / − VALUES</small></div><div class="cost-roll-mod-grid"><label class="cost-roll-mod accuracy"><span>ACCURACY MOD</span><input type="number" step="1" inputmode="numeric" value="${Number(savedMods.accuracy)||0}" data-cost-roll-mod="accuracy" aria-label="Accuracy modifier"><small>Added to the action Accuracy Check</small></label><label class="cost-roll-mod damage"><span>DAMAGE MOD</span><input type="number" step="1" inputmode="numeric" value="${Number(savedMods.damage)||0}" data-cost-roll-mod="damage" aria-label="Damage modifier"><small>Added to the action Damage Bonus</small></label></div></section>` : "";
  const targetPicker=x.intent?.kind==="monster-roll-action"?monsterCostTargetPickerHTML(x):"";
  return `<div class="cinematic-backdrop cost-payment-backdrop" data-overlay-backdrop-close><div class="cinematic-card cost-payment-pop ${targetPicker?"monster-roll-payment":""}" ><button class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">${esc(x.actorName || snap.actor.name)} · ${esc(x.verb || "SEND")}</div><h2>${esc(x.title || "PAY RESOURCE COST")}</h2><div class="cost-payment-subtitle">PAY COST BEFORE ${esc(x.verb || "SEND")}</div>${targetPicker}${x.listedCost ? `<div class="cost-listed"><b>LISTED COST</b><span>${formatText(x.listedCost)}</span></div>` : `<div class="cost-listed muted"><b>LISTED COST</b><span>NONE / ENTER MANUALLY</span></div>`}<div class="cost-payment-grid">${row("hp","HP",snap.hp,snap.hpMax)}${row("mp","MP",snap.mp,snap.mpMax)}${row("ip","IP",snap.ip,snap.ipMax)}${row("fp","FP",snap.fp,null)}</div>${mods}<div class="cost-payment-error" data-cost-payment-error></div><div class="cost-payment-actions"><button type="button" class="mini-btn" data-action="close-overlay">CANCEL</button><button type="button" class="primary" data-cost-pay-confirm>PAY & ${esc(x.verb || "SEND")}</button></div></div></div>`;
}
function readResourceCostInputs() {
  const out = { hp: 0, mp: 0, ip: 0, fp: 0 };
  for (const key of Object.keys(out)) {
    const el = document.querySelector(`[data-cost-pay-input="${key}"]`);
    const n = Number(el?.value);
    out[key] = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }
  return out;
}
function readResourceCostModifiers() {
  const out = { accuracy: 0, damage: 0 };
  for (const key of Object.keys(out)) {
    const el = document.querySelector(`[data-cost-roll-mod="${key}"]`);
    const n = Number(el?.value);
    out[key] = Number.isFinite(n) ? Math.trunc(n) : 0;
  }
  return out;
}
function showCostPaymentError(message = "") {
  const el = document.querySelector("[data-cost-payment-error]");
  if (el) { el.textContent = String(message || ""); el.classList.toggle("visible", !!message); }
}
async function payResourceCost(actorKind, actorId, mode, costs) {
  const snap = resourceCostSnapshot(actorKind, actorId, mode); if (!snap) return { ok: false, error: "Paying sheet is no longer available." };
  const need = { hp: Math.max(0, Number(costs.hp) || 0), mp: Math.max(0, Number(costs.mp) || 0), ip: Math.max(0, Number(costs.ip) || 0), fp: Math.max(0, Number(costs.fp) || 0) };
  const missing = [];
  for (const key of ["hp","mp","ip","fp"]) if (need[key] > snap[key]) missing.push(`${key.toUpperCase()} ${need[key]} / ${snap[key]}`);
  if (missing.length) return { ok: false, error: `NOT ENOUGH · ${missing.join(" · ")}` };
  if (actorKind === "monster") {
    updateMonster(mode, actorId, m => {
      m.ip ||= { current: 0, max: 0 };
      m.hp.current = clamp((Number(m.hp.current) || 0) - need.hp, 0, m.hp.max);
      m.mp.current = clamp((Number(m.mp.current) || 0) - need.mp, 0, m.mp.max);
      m.ip.current = clamp((Number(m.ip.current) || 0) - need.ip, 0, m.ip.max);
      m.fp = Math.max(0, (Number(m.fp) || 0) - need.fp);
    });
  } else {
    await sendRemoteEdit(actorId, { kind: "pay-cost", costs: need });
  }
  return { ok: true, costs: need };
}
async function executeResourceCostIntent(intent, rollModifiers = { accuracy: 0, damage: 0 }) {
  if (!intent) return;
  if (intent.kind === "guard-cover-activate") return activateGuardCover(intent.actorKind,intent.actorId,intent.index,intent.mode,intent.target||null);
  if (intent.kind === "send-class-skill") return sendClassSkill(intent.owner, intent.classIndex, intent.skillIndex);
  if (intent.kind === "send-arcana") return sendList(intent.owner, "arcana", intent.index);
  if (intent.kind === "send-action") return sendAction(intent.owner, intent.index);
  if (intent.kind === "roll-player-action") {
    const s = sourceSheet(intent.owner), a = s?.actions?.[intent.index]; if (!a) return;
    const targetRefs = await selectedEnemyMonsterTargetRefs();
    return doRollWithSheet(s, a, s.name, "", { randomTarget: false, actorKind: "player", actorId: String(intent.owner), targetRefs, accuracyMod: Number(rollModifiers.accuracy) || 0, damageMod: Number(rollModifiers.damage) || 0 });
  }
  if (intent.kind === "monster-send-action") return sendMonsterAction(intent.mode, intent.id, intent.index);
  if (intent.kind === "monster-roll-action") {
    const raw = findMonsterTarget(intent.mode, intent.id), m = raw ? monsterPhaseView(raw, intent.mode) : null, a = m?.actions?.[intent.index];
    if (!m || !a) return;
    const picked = raw ? selectedMonsterTargets(raw, intent.mode) : [];
    return doRollWithSheet(m, a, m.name, "", { targetRefs: picked.map(t => `${t.kind}:${t.id}`), actorKind: "monster", actorId: String(intent.id), accuracyMod: Number(rollModifiers.accuracy) || 0, damageMod: Number(rollModifiers.damage) || 0 });
  }
}
async function confirmResourceCostPayment() {
  const prompt = runtime.overlay;
  if (!prompt || prompt.kind !== "cost-payment") return;
  const intent=prompt.intent;
  if(intent?.kind==="guard-cover-activate"){const actor=guardActor(intent.actorKind,intent.actorId,intent.mode);if(!actor||!guardCanActivate(actor))return}
  if(intent?.kind==="monster-roll-action"){
    const raw=findMonsterTarget(intent.mode,intent.id),m=raw?monsterPhaseView(raw,intent.mode):null,a=m?.actions?.[intent.index],picked=raw?selectedMonsterTargets(raw,intent.mode):[],targets=picked.map(t=>resolveRollTarget(`${t.kind}:${t.id}`)).filter(Boolean);
    if(m&&a&&stopCoveredEnemyMelee(m,a,normalizeActionType(a.category),targets))return;
  }
  const costs = readResourceCostInputs();
  const rollModifiers = readResourceCostModifiers();
  const result = await payResourceCost(prompt.actorKind, prompt.actorId, prompt.mode, costs);
  if (!result.ok) return showCostPaymentError(result.error || "Could not pay this cost.");
  const paid = Object.entries(result.costs || {}).filter(([,v]) => Number(v) > 0).map(([k,v]) => `${k.toUpperCase()} −${v}`).join(" · ");
  runtime.overlay = null; renderOverlay();
  if (paid) showToast("COST PAID", paid, "message", false);
  await executeResourceCostIntent(intent, rollModifiers);
  maybeShowPendingPlayerDefeatChoice();
}

function sendClass(owner, i) { const s = sourceSheet(owner), c = s?.classes[i]; if (c) makeShare(`${s.name} · CLASS · ${c.name}`, `LV ${c.level}\nFree Benefit: ${c.freeBenefit || "—"}`); }
function sendClassSkill(owner, ci, si) { const s = sourceSheet(owner), c = s?.classes[ci], x = c?.classSkills[si]; if (x) makeShare(`${s.name} · ${c.name} · ${x.name}`, `Level ${x.level ?? 1}${x.cost ? `\nCOST · ${x.cost}` : ""}\n${x.detail || "—"}`); }
function sendQuirk(owner, i) { const s = sourceSheet(owner), x = s?.quirks[i]; if (x) makeShare(`${s.name} · QUIRK · ${x.name}`, x.detail || "—"); }
function sendEquipment(owner, i) {
  const s = sourceSheet(owner), x = s?.equipment[i];
  if (!x) return;
  const selected = Array.from({ length: 4 }, (_, n) => s.spheres.find(sp => sp.id === x.sphereIds?.[n]) || null);
  const seen = new Set();
  const effects = [];
  for (const sp of selected) {
    if (!sp || !String(sp.detail || "").trim()) continue;
    const key = stripMediaUrls(sp.detail || "").trim().toLowerCase() || String(sp.detail || "").trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    effects.push({ name: sp.name || "Sphere", sphereType: sp.sphereType || "", detail: sp.detail || "" });
  }
  makeShare(`${s.name} · EQUIPMENT · ${x.name}`, `${x.weaponType || ""}${x.detail ? `\n${x.detail}` : ""}`, {
    shareType: "equipment",
    equipment: { name: x.name || "Equipment", weaponType: x.weaponType || "", imageUrl: x.imageUrl || "", detail: x.detail || "", spheres: selected.map(sp => sp ? ({ name: sp.name || "Sphere", sphereType: sp.sphereType || "", detail: sp.detail || "" }) : null), effects }
  });
}
function sendSphere(owner, i) { const s = sourceSheet(owner), x = s?.spheres[i]; if (x) { const body = `${x.sphereType || ""}${x.detail ? `\n${x.detail}` : ""}`, art = cardTokenImageInfo(x)?.url; makeShare(`${s.name} · SPHERE · ${x.name}`, body, art ? { media: art } : {}); } }
function sendInventory(owner, i) { const s = sourceSheet(owner), x = s?.inventory?.[i]; if (x) { const body = `${x.itemType || ""}${x.detail ? `\n${x.detail}` : ""}`, art = cardTokenImageInfo(x)?.url; makeShare(`${s.name} · ITEM · ${x.name}`, body, art ? { media: art } : {}); } }
function sendList(owner, type, i) {
  const s = sourceSheet(owner), x = s?.lists?.[type]?.[i];
  if (!x) return;
  const parts = [];
  if (type === "arcana" && String(x.cost || "").trim()) parts.push(`COST: ${String(x.cost).trim()}`);
  if (type === "bonds") parts.push(`STRENGTH: ${clamp(Number(x.strength) || 1, 1, 3)}`);
  parts.push(x.detail || "—");
  { const art = (type === "arcana" || type === "bonds") ? cardTokenImageInfo(x)?.url : "",cutIn=type==="arcana"?playerCutInExtra(owner,s,x,"none"):{}; makeShare(`${s.name} · ${type.toUpperCase()} · ${x.name || "ENTRY"}`, parts.join("\n\n"), {...(art?{media:art}:{}),...cutIn}); }
}
function sendClock(owner, i) { const s = sourceSheet(owner), x = s?.clocks[i]; if (x) makeShare(`${s.name} · CLOCK · ${x.name}`, `${x.progress}/${x.segments}\n${x.detail || ""}`); }
function sendProject(owner, i) { const s = sourceSheet(owner), x = s?.projects[i]; if (x) makeShare(`${s.name} · PROJECT · ${x.name}`, `${x.progress}/${x.segments}\n${x.detail || ""}`); }
function sendAction(owner, i) { const s = sourceSheet(owner), a = s?.actions[i]; if (a) makeShare(`${s.name} · ACTION · ${a.name}`, `${a.mode} · ${a.category} · ${a.element === "none" ? "UNTYPED" : a.element.toUpperCase()}${a.cost ? `
COST · ${a.cost}` : ""}${a.target ? `
TARGET · ${a.target}` : ""}${a.actionTypeText ? `
TYPE · ${a.actionTypeText}` : ""}${a.mode === "ROLL" ? `
${a.attr1}+${a.attr2} ${a.mod ? `${a.mod >= 0 ? "+" : ""}${a.mod}` : ""} · ${isTwoWeaponAction(a) ? `TWO WEAPON · HR 0 · DAMAGE BONUS ${Number(a.damageHR) || 0}` : `HR ${Number(a.damageHR) || 0}`}` : ""}
${a.note || ""}`,playerCutInExtra(owner,s,a,a.element)); }
function sendMonsterAction(mode, id, i) {
  const raw = mode === "lib" ? libraryMonsterById(id) : monsterById(id), m = raw ? monsterPhaseView(raw, mode) : null, a = m?.actions[i];
  if (!a) return;
  const accAdj = monsterLevelAccuracyBonus(m.normalLevel, m.level), dmgAdj = monsterLevelDamageBonus(m.normalLevel, m.level);
  const acc = (Number(a.mod) || 0) + accAdj, hr = Number(a.damageHR) || 0;
  makeShare(`${m.name} · ACTION · ${a.name}`, `${a.mode} · ${a.category} · ${a.element === "none" ? "UNTYPED" : a.element.toUpperCase()}${a.cost ? `\nCOST · ${a.cost}` : ""}${a.target ? `\nTARGET · ${a.target}` : ""}${a.actionTypeText ? `\nTYPE · ${a.actionTypeText}` : ""}${a.mode === "ROLL" ? `\n${a.attr1}+${a.attr2} ${monsterSigned(acc)} · ${isTwoWeaponAction(a) ? `TWO WEAPON · HR 0 · DAMAGE BONUS ${monsterSigned(hr)}` : `HR ${monsterSigned(hr)}`} · DMG ADJ ${monsterSigned(dmgAdj)} · ${monsterLevelCombatRule(m.normalLevel, m.level)}` : ""}\n${a.note || ""}`);
}
function sendMonsterRule() { notify("Special Rules are GM only and cannot be sent to players"); }
function safeCalc(expr, vars = {}) {
  let s = String(expr || "").toUpperCase().replace(/\bHR\b/g, String(vars.HR ?? 0)); if (!/^[0-9+\-*/().\s]+$/.test(s)) throw new Error("bad formula");
  return Function(`"use strict";return (${s})`)();
}
function resolveRollTarget(ref) {
  if (!ref) return null;
  const [kind, id] = String(ref).split(":");
  if (kind === "player") { const s = sourceSheet(id); return s && !isPlayerDefeated(s) ? { kind, id, tokenId:String(s.linkedTokenId||""), name: s.name || sourceParty(id)?.name || "Character", sheet: s } : null; }
  if (kind === "monster") { const raw = monsterById(id), m = raw && !isMonsterDefeated(raw) ? monsterPhaseView(raw, "active") : null; return m ? { kind, id, tokenId:String(raw.linkedTokenId||m.linkedTokenId||""), name: m.name || "Monster", sheet: m } : null; }
  return null;
}
function coveredMeleeEntry(target){return(runtime.guardCover?.entries||[]).find(x=>String(x.coverTokenId||"")===String(target?.tokenId||target?.sheet?.linkedTokenId||"")||`${x.coverKind}:${x.coverId}`===`${target?.kind}:${target?.id}`)||null}
function guardingEntry(target){return(runtime.guardCover?.entries||[]).find(x=>String(x.guardTokenId||"")===String(target?.tokenId||target?.sheet?.linkedTokenId||"")||`${x.guardKind}:${x.guardId}`===`${target?.kind}:${target?.id}`)||null}
function mainRollIsMelee(action,category){return category==="MELEE ATTACK"||(category==="TWO WEAPON"&&/\bMELEE\b/i.test(`${action?.actionTypeText||""} ${action?.target||""}`))}
function stopCoveredEnemyMelee(sheet,action,category,targets){
  if(sheet?.faction==="ally"||!mainRollIsMelee(action,category))return false;const hit=(targets||[]).map(t=>coveredMeleeEntry(t)).find(Boolean);if(!hit)return false;const title=`COVERED BY ${String(hit.guardName||"ALLY").toUpperCase()}`;showToast(title,"Enemy Melee Attack cannot select this covered target.","crisis",false);notify(title);return true;
}
function randomActionTarget(actorKind, actorSheet = null) {
  if (actorKind === "monster") {
    const actorFaction = actorSheet?.faction === "ally" ? "ally" : "enemy";
    let candidates = [];
    if (actorFaction === "ally") {
      candidates = runtime.sceneMonsters.filter(m => m.faction !== "ally" && !isMonsterDefeated(m) && m.id !== actorSheet?.id).map(m => { const v = monsterPhaseView(m, "active"); return { kind: "monster", id: m.id, name: v.name || "Monster", sheet: v }; });
    } else {
      candidates = allParty().map(p => {
        const raw = p.metadata?.[META_KEY];
        if (!raw || raw.deleted) return null;
        const sh = normalizeState(raw);
        if (isPlayerDefeated(sh)) return null;
        return { kind: "player", id: p.id, name: sh.name || p.name || "Character", sheet: sh };
      }).filter(Boolean);
      candidates.push(...runtime.sceneMonsters.filter(m => m.faction === "ally" && !isMonsterDefeated(m) && m.id !== actorSheet?.id).map(m => { const v = monsterPhaseView(m, "active"); return { kind: "monster", id: m.id, name: v.name || "Monster", sheet: v }; }));
    }
    return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
  }
  const candidates = runtime.sceneMonsters.filter(m => m.faction !== "ally" && !isMonsterDefeated(m)).map(m => { const v = monsterPhaseView(m, "active"); return { kind: "monster", id: m.id, name: v.name || "Monster", sheet: v }; });
  return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
}
function doRollWithSheet(sheet, action, characterName = "", targetRef = "", options = {}) {
  const s = sheet, attr1 = action.attr1 || "DEX", attr2 = action.attr2 || "INS", size1 = currentDie(s, attr1), size2 = currentDie(s, attr2);
  const actionBaseMod = Number(action.mod) || 0, costAccuracyMod = Number(options.accuracyMod) || 0;
  const manualMod = actionBaseMod + costAccuracyMod, autoAccuracyBonus = options.actorKind === "monster" ? monsterLevelAccuracyBonus(s.normalLevel ?? s.level, s.level) : 0;
  const d1 = 1 + Math.floor(Math.random() * size1), d2 = 1 + Math.floor(Math.random() * size2), mod = manualMod + autoAccuracyBonus, total = d1 + d2 + mod;
  const highResult = Math.max(d1, d2);
  const actionCategory = normalizeActionType(action.category);
  const twoWeapon = actionCategory === "TWO WEAPON" && options.damage !== false;
  const damageHighRoll = twoWeapon ? 0 : highResult;
  const actionBaseDamageHR = Number(action.damageHR) || 0, costDamageMod = Number(options.damageMod) || 0;
  const manualDamageHR = actionBaseDamageHR + costDamageMod, autoDamageBonus = options.actorKind === "monster" ? monsterLevelDamageBonus(s.normalLevel ?? s.level, s.level) : 0;
  const damageHR = manualDamageHR;
  const hr = options.hr === false ? null : (twoWeapon ? 0 : damageHR);
  const fumble = d1 === 1 && d2 === 1, match = d1 === d2, critical = (match && d1 >= 6) || (!!action.frenzy && match && !fumble);
  const damage = options.damage === false ? NaN : damageHighRoll + damageHR + autoDamageBonus;
  const explicitTargets = (Array.isArray(options.targetRefs) ? options.targetRefs : []).map(resolveRollTarget).filter(Boolean);
  const target = explicitTargets[0] || (options.randomTarget ? randomActionTarget(options.actorKind || "player", s) : resolveRollTarget(targetRef));
  if(options.actorKind==="monster"&&stopCoveredEnemyMelee(s,action,actionCategory,explicitTargets.length?explicitTargets:(target?[target]:[])))return null;
  const resolvedTargetRef = target ? `${target.kind}:${target.id}` : "";
  const element = action.element || "none";
  const rawAffinity = target && element !== "none" ? String(target.sheet.affinities?.[element] || "NORMAL").toUpperCase() : "NORMAL";
  const affinity = target&&element!=="none"&&guardingEntry(target)&&!["IMMUNITY","ABSORPTION"].includes(rawAffinity)?"RESISTANCE":rawAffinity;
  const adjustedDamage = Number.isFinite(damage) ? (affinity === "VULNERABILITY" ? damage * 2 : affinity === "RESISTANCE" ? Math.ceil(damage / 2) : damage) : NaN;
  const hitDefenseKind = options.actorKind === "monster" ? attackDefenseKind(actionCategory) : "";
  const rollTargets = explicitTargets.length ? explicitTargets : (options.actorKind === "monster" && target ? [target] : []);
  const targetResults = rollTargets.map(t => {
    const baseAffinity = element !== "none" ? String(t.sheet.affinities?.[element] || "NORMAL").toUpperCase() : "NORMAL";
    const a = element!=="none"&&guardingEntry(t)&&!["IMMUNITY","ABSORPTION"].includes(baseAffinity)?"RESISTANCE":baseAffinity;
    const d = Number.isFinite(damage) ? (a === "VULNERABILITY" ? damage * 2 : a === "RESISTANCE" ? Math.ceil(damage / 2) : damage) : NaN;
    const defense = hitDefenseKind ? defenseValue(t.sheet, hitDefenseKind) : null;
    return { kind: t.kind, id: t.id, name: t.name, affinity: a, damage: d,
      ...(hitDefenseKind ? { defenseKind: hitDefenseKind, defense, hit: attackHitsDefense(total, defense, critical, fumble) } : {}) };
  });
  const suggestedStudyTier = options.isStudy ? studyTierFromTotal(total) : 0;
  const studyMonster = options.isStudy && options.studyTargetId ? monsterById(options.studyTargetId) : null;
  const studyPreviousTier = options.isStudy ? (Number(options.studyPreviousTier) || monsterTier(studyMonster)) : 0;
  const studyUnlockedTier = options.isStudy && studyMonster ? Math.max(studyPreviousTier, suggestedStudyTier) : suggestedStudyTier;
  const studyDiscoveries = options.isStudy && studyMonster ? studyDiscoveryDetails(studyMonster, studyPreviousTier, studyUnlockedTier) : [];
  const actionTarget = String(action.target || "").trim();
  const actionTypeText = String(action.actionTypeText || "").trim();
  const r = { id: uid(), senderId: runtime.currentPlayer.id, senderName: runtime.currentPlayer.name, label: `${characterName || s.name} · ${action.label || action.name || "CHECK"}`, rollStyle: options.damage === false ? "check" : "action", actionCategory, twoWeapon, actionTarget, actionTypeText, attr1, attr2, size1, size2, d1, d2, mod, manualMod, actionBaseMod, costAccuracyMod, autoAccuracyBonus, total, hr, highResult, damageHighRoll, damageHR, manualDamageHR, actionBaseDamageHR, costDamageMod, autoDamageBonus, damage, adjustedDamage, accuracyFormula: `${attr1} ${d1} + ${attr2} ${d2} + MOD ${actionBaseMod}${costAccuracyMod ? ` + PAY MOD ${costAccuracyMod >= 0 ? "+" : ""}${costAccuracyMod}` : ""}${autoAccuracyBonus ? ` + LEVEL ADJ ${autoAccuracyBonus}` : ""} = ACCURACY ${total}`, damageFormula: options.damage === false ? "" : `${twoWeapon ? "TWO WEAPON · HR 0" : `HIGH ${highResult}`} + DAMAGE BONUS ${actionBaseDamageHR}${costDamageMod ? ` + PAY MOD ${costDamageMod >= 0 ? "+" : ""}${costDamageMod}` : ""}${autoDamageBonus ? ` + LEVEL DAMAGE ${autoDamageBonus}` : ""} = ${damage}`, critical, fumble, double: match && !critical && !fumble, element, detail: action.note || "", gif: String(options.gif || "").trim() || gifFromText(action.note || ""), targetName: explicitTargets.length ? explicitTargets.map(t => t.name).join(" · ") : (target?.name || (options.randomTarget ? "NO VALID TARGET" : "")), targetRef: resolvedTargetRef, targetRefs: rollTargets.map(t => `${t.kind}:${t.id}`), targetResults, affinity, isStudy: !!options.isStudy, studyTargetId: options.studyTargetId || "", studyTargetTokenId: options.studyTargetTokenId || "", studyTargetRef: options.studyTargetRef || "", studyTargetName: options.studyTargetName || "", studyPhaseIndex: Number(options.studyPhaseIndex) || 0, studyPhaseLabel: options.studyPhaseLabel || "", studyPreviousTier, suggestedStudyTier, studyUnlockedTier, studyDiscoveries, actorKind: options.actorKind || "player", actorId: String(options.actorId || ""), frenzy: !!action.frenzy, invokeBaseMod: mod, invoke: { traitRerolls: 0, traitName: "", bondUsed: false, bondName: "", bondStrength: 0, bondBonus: 0, log: [] }, time: Date.now() };
  r.actorName = characterName || s.name || runtime.currentPlayer.name;
  r.actorPortrait = String(s.portrait || "");
  r.actionName = action.label || action.name || "CHECK";
  r.cutIn = options.actorKind !== "monster" && !!action.cutIn && !options.isStudy;
  r.cutInColor = normalizeCutInColor(action.cutInColor);
  runtime.lastRoll = r;
  const historyDamage = rollHasDamage(r) ? ` · DMG ${Number(r.adjustedDamage ?? r.damage)}` : "";
  recordCombatHistory(r.isStudy ? "study" : "roll", `${r.label} · TOTAL ${r.total}${rollOutcomeText(r) ? ` · ${rollOutcomeText(r)}` : ""}${historyDamage}${r.targetName ? ` · VS ${r.targetName}` : ""}`, `roll:${r.id}`);
  const publishRoll = () => { pushFeed({ kind: "roll", ...r }); broadcast("roll", r); playSound(r.critical ? "critical" : "roll"); showOverlay({ kind: "roll", ...r }); if (runtime.view === "chat" || runtime.view === "roll" || (r.isStudy && runtime.inspect?.kind === "player" && runtime.partyEditTab === "hinder")) render(); };
  if (r.cutIn) {
    const cutIn = { id: `cutin-${r.id}`, rollId: r.id, senderId: r.senderId, senderName: r.senderName, actorId: r.actorId, actorName: r.actorName, actionName: r.actionName, portrait: r.actorPortrait, element: r.element, cutInColor:r.cutInColor, time: Date.now() };
    broadcast("skill-cutin", cutIn).finally(publishRoll);
  } else publishRoll();
  return r;
}

function invokeStateForRoll(roll) {
  const r = roll || {};
  const inv = r.invoke && typeof r.invoke === "object" ? r.invoke : {};
  r.invoke = {
    traitRerolls: Math.max(0, Number(inv.traitRerolls) || 0),
    traitName: String(inv.traitName || ""),
    bondUsed: !!inv.bondUsed,
    bondName: String(inv.bondName || ""),
    bondStrength: clamp(Number(inv.bondStrength) || 0, 0, 3),
    bondBonus: clamp(Number(inv.bondBonus) || 0, 0, 3),
    log: Array.isArray(inv.log) ? inv.log.map(String).slice(-20) : []
  };
  if (!Number.isFinite(Number(r.invokeBaseMod))) r.invokeBaseMod = Number(r.mod) || 0;
  return r.invoke;
}
function invokeRollController(roll) {
  if (!roll || String(roll.actorKind || "player") !== "player" || !roll.actorId) return false;
  const me = String(runtime.currentPlayer?.id || ""), actor = String(roll.actorId || ""), roller = String(roll.senderId || "");
  return !!me && (roller ? me === roller : me === actor);
}
function invokeTraitOptions(sheet) {
  return [["identity","IDENTITY"],["origin","ORIGIN"],["theme","THEME"]]
    .map(([key,label]) => ({ key, label, name: String(sheet?.[key] || "").trim() }))
    .filter(x => x.name);
}
function invokeBondOptions(sheet) {
  return (sheet?.lists?.bonds || []).map((b, index) => ({
    index, name: String(b?.name || `BOND ${index + 1}`).trim() || `BOND ${index + 1}`,
    strength: clamp(Number(b?.strength) || 1, 1, 3)
  }));
}
function invokeControlsHTML(roll) {
  if (!invokeRollController(roll)) return "";
  const sheet = sourceSheet(String(roll.actorId || ""));
  if (!sheet || sheet.deleted) return "";
  const inv = invokeStateForRoll(roll), fp = Math.max(0, Number(sheet.fp) || 0);
  const traits = invokeTraitOptions(sheet), bonds = invokeBondOptions(sheet);
  const traitLocked = !!roll.fumble || fp <= 0 || !traits.length;
  const traitNote = roll.fumble ? "FUMBLE · TRAIT INVOKE LOCKED" : !traits.length ? "NO IDENTITY / ORIGIN / THEME" : fp <= 0 ? "NO FABULA POINTS" : `1 FP EACH REROLL · FP ${fp}`;
  const traitSelect = traits.length ? `<select data-invoke-trait-select>${traits.map(t => `<option value="${esc(t.key)}">${esc(t.label)} · ${esc(t.name)}</option>`).join("")}</select>` : "";
  const bondLocked = inv.bondUsed || fp <= 0 || !bonds.length;
  const bondNote = inv.bondUsed ? `USED · ${esc(inv.bondName || "BOND")} +${Number(inv.bondStrength) || 0}` : !bonds.length ? "NO BONDS" : fp <= 0 ? "NO FABULA POINTS" : `ONCE PER CHECK · FP ${fp}`;
  const bondSelect = bonds.length ? `<select data-invoke-bond-select>${bonds.map(b => `<option value="${b.index}">${esc(b.name)} · +${b.strength}</option>`).join("")}</select>` : "";
  const log = inv.log.length ? `<div class="invoke-log">${inv.log.map(x => `<span>${esc(x)}</span>`).join("")}</div>` : "";
  return `<section class="invoke-panel"><div class="invoke-head"><b>INVOKE</b><span>FABULA POINTS · ${fp}</span></div><div class="invoke-row"><div class="invoke-copy"><b>TRAIT</b><small>${traitNote}</small></div>${traitSelect}<div class="invoke-buttons"><button type="button" class="mini-btn" data-invoke-trait-roll="left" ${traitLocked ? "disabled" : ""}>REROLL LEFT · 1 FP</button><button type="button" class="mini-btn" data-invoke-trait-roll="right" ${traitLocked ? "disabled" : ""}>REROLL RIGHT · 1 FP</button><button type="button" class="mini-btn" data-invoke-trait-roll="both" ${traitLocked ? "disabled" : ""}>REROLL BOTH · 1 FP</button></div></div><div class="invoke-row bond"><div class="invoke-copy"><b>BOND</b><small>${bondNote}</small></div>${bondSelect}<button type="button" class="primary" data-invoke-bond-apply ${bondLocked ? "disabled" : ""}>APPLY BOND · 1 FP</button></div>${log}</section>`;
}
function rollHistoryText(r) {
  const dmg = rollHasDamage(r) ? ` · DMG ${Number(r.adjustedDamage ?? r.damage)}` : "";
  const group = r.groupCheck ? ` VS DL ${Number(r.groupCheckDL) || 10} · ${r.groupCheckPassed ? "SUCCESS" : "FAILED"}` : "";
  const inv = r.invoke?.log?.length ? ` · INVOKE ${r.invoke.log.join(" / ")}` : "";
  return `${r.label || "ROLL"} · TOTAL ${Number(r.total) || 0}${group}${rollOutcomeText(r) ? ` · ${rollOutcomeText(r)}` : ""}${dmg}${r.targetName ? ` · VS ${r.targetName}` : ""}${inv}`;
}
function recalculateInvokedRoll(roll) {
  const r = roll, inv = invokeStateForRoll(r);
  const baseMod = Number(r.invokeBaseMod);
  r.mod = (Number.isFinite(baseMod) ? baseMod : Number(r.mod) || 0) + (Number(inv.bondBonus) || 0);
  r.total = (Number(r.d1) || 0) + (Number(r.d2) || 0) + r.mod;
  const same = Number(r.d1) === Number(r.d2);
  r.fumble = same && Number(r.d1) === 1;
  r.critical = !r.fumble && same && (Number(r.d1) >= 6 || !!r.frenzy);
  r.double = same && !r.critical && !r.fumble;
  r.highResult = Math.max(Number(r.d1) || 0, Number(r.d2) || 0);
  r.damageHighRoll = r.twoWeapon || String(r.actionCategory || "").toUpperCase() === "TWO WEAPON" ? 0 : r.highResult;
  if (Array.isArray(r.targetResults)) r.targetResults = r.targetResults.map(t =>
    (t.defenseKind && Number.isFinite(Number(t.defense)))
      ? { ...t, hit: attackHitsDefense(r.total, Number(t.defense), r.critical, r.fumble) }
      : t);
  if (rollHasDamage(r)) {
    r.damage = r.damageHighRoll + (Number(r.manualDamageHR ?? r.damageHR) || 0) + (Number(r.autoDamageBonus) || 0);
    const adjust = affinity => String(affinity || "NORMAL").toUpperCase() === "VULNERABILITY" ? r.damage * 2 : String(affinity || "NORMAL").toUpperCase() === "RESISTANCE" ? Math.ceil(r.damage / 2) : r.damage;
    r.adjustedDamage = adjust(r.affinity);
    if (Array.isArray(r.targetResults)) r.targetResults = r.targetResults.map(t => ({ ...t, damage: adjust(t.affinity) }));
    const manual = Number(r.manualMod) || 0, auto = Number(r.autoAccuracyBonus) || 0;
    r.accuracyFormula = `${r.attr1} ${r.d1} + ${r.attr2} ${r.d2} + MOD ${manual}${auto ? ` + LEVEL ADJ ${auto}` : ""}${inv.bondBonus ? ` + INVOKE BOND ${inv.bondBonus}` : ""} = ACCURACY ${r.total}`;
    r.damageFormula = `${r.twoWeapon ? "TWO WEAPON · HR 0" : `HIGH ${r.highResult}`} + DAMAGE BONUS ${Number(r.manualDamageHR ?? r.damageHR) || 0}${Number(r.autoDamageBonus) ? ` + LEVEL DAMAGE ${Number(r.autoDamageBonus)}` : ""} = ${r.damage}`;
  }
  if (r.isStudy) {
    r.suggestedStudyTier = studyTierFromTotal(r.total);
    const monster = r.studyTargetId ? monsterById(r.studyTargetId) : null;
    const currentTier = monster ? monsterTier(monster, r.studyPhaseIndex) : 0;
    const previous = Math.max(Number(r.studyPreviousTier) || 0, currentTier);
    r.studyUnlockedTier = monster ? Math.max(previous, r.suggestedStudyTier) : r.suggestedStudyTier;
    r.studyDiscoveries = monster ? studyDiscoveryDetails(monster, previous, r.studyUnlockedTier) : [];
  }
  if (r.groupCheck) r.groupCheckPassed = r.critical || (!r.fumble && r.total >= (Number(r.groupCheckDL) || 10));
  return r;
}
async function spendInvokeFP(roll) {
  const actorId = String(roll?.actorId || "");
  const sheet = sourceSheet(actorId);
  if (!actorId || !sheet || (Number(sheet.fp) || 0) < 1) { notify("Not enough Fabula Points"); return false; }
  await sendRemoteEdit(actorId, { kind: "adjust", path: "fp", delta: -1 });
  return true;
}
function replaceRollSnapshots(r, persistHistory = true) {
  runtime.lastRoll = { ...deepClone(r) };
  const fi = runtime.feed.findIndex(x => x?.kind === "roll" && String(x.id || "") === String(r.id || ""));
  if (fi >= 0) runtime.feed[fi] = { kind: "roll", ...deepClone(r) }; else runtime.feed.push({ kind: "roll", ...deepClone(r) });
  runtime.feed = runtime.feed.slice(-150); saveFeed();
  const hi = runtime.combatHistory.findIndex(x => String(x?.id || "") === `roll:${r.id}`);
  const history = { id:`roll:${r.id}`, category:r.isStudy ? "study" : "roll", text:rollHistoryText(r), actor:r.senderName || "PLAYER", time:Number(r.time) || Date.now(), undo:null, undone:false };
  if (hi >= 0) runtime.combatHistory[hi] = { ...runtime.combatHistory[hi], ...history }; else runtime.combatHistory.push(history);
  runtime.combatHistory = runtime.combatHistory.slice(-250); if (persistHistory) persistCombatHistorySnapshot();
  if (runtime.overlay?.kind === "roll" && String(runtime.overlay.id || "") === String(r.id || "")) runtime.overlay = { kind:"roll", ...deepClone(r) };
}
async function syncInvokedRoll(r) {
  replaceRollSnapshots(r);
  renderOverlay();
  if (runtime.view === "roll" || runtime.view === "chat" || r.isStudy) render();
  await broadcast("roll-update", { ...deepClone(r), updatedBy:runtime.currentPlayer.id, updateTime:Date.now() });
  if (r.groupCheck && r.groupCheckId) {
    await broadcast("group-check-final-result", {
      id:String(r.groupCheckId), senderId:String(r.actorId || runtime.currentPlayer.id), leaderId:String(r.actorId || runtime.currentPlayer.id),
      leaderName:r.senderName || "", d1:Number(r.d1), d2:Number(r.d2), size1:Number(r.size1), size2:Number(r.size2),
      invokeBondBonus:Number(r.invoke?.bondBonus) || 0, invokeUpdate:true, rollId:r.id, time:Date.now()
    });
  }
  if (r.isStudy && runtime.currentPlayer.role === "GM" && r.studyTargetId && Number(r.studyUnlockedTier) > Number(r.studyPreviousTier || 0)) {
    applyMonsterStudyTier(r.studyTargetId, r.studyUnlockedTier, "study-roll", r.studyPhaseIndex);
  }
}
async function invokeTraitReroll(side) {
  const current = runtime.overlay?.kind === "roll" ? runtime.overlay : runtime.lastRoll;
  if (!current?.id || !invokeRollController(current)) return;
  const r = deepClone(current), inv = invokeStateForRoll(r);
  if (r.fumble) return notify("Trait Invoke cannot be used on a Fumble");
  const sheet = sourceSheet(String(r.actorId || "")), traits = invokeTraitOptions(sheet);
  const select = document.querySelector("#overlay-host [data-invoke-trait-select]");
  const trait = traits.find(t => t.key === select?.value) || traits[0];
  if (!trait) return notify("This character has no Trait to invoke");
  if (!await spendInvokeFP(r)) return;
  const mode = ["left","right","both"].includes(String(side)) ? String(side) : "both";
  if (mode === "left" || mode === "both") r.d1 = 1 + Math.floor(Math.random() * (Number(r.size1) || 6));
  if (mode === "right" || mode === "both") r.d2 = 1 + Math.floor(Math.random() * (Number(r.size2) || 6));
  inv.traitRerolls += 1; inv.traitName = trait.name;
  inv.log.push(`TRAIT ${trait.label} · ${trait.name} · REROLL ${mode.toUpperCase()}`);
  recalculateInvokedRoll(r);
  await syncInvokedRoll(r);
  playSound(r.critical ? "critical" : "roll");
}
async function invokeBondOnRoll() {
  const current = runtime.overlay?.kind === "roll" ? runtime.overlay : runtime.lastRoll;
  if (!current?.id || !invokeRollController(current)) return;
  const r = deepClone(current), inv = invokeStateForRoll(r);
  if (inv.bondUsed) return notify("A Bond can only be invoked once per Check");
  const sheet = sourceSheet(String(r.actorId || "")), bonds = invokeBondOptions(sheet);
  const select = document.querySelector("#overlay-host [data-invoke-bond-select]");
  const chosen = bonds.find(b => b.index === Number(select?.value)) || bonds[0];
  if (!chosen) return notify("This character has no Bond to invoke");
  if (!await spendInvokeFP(r)) return;
  inv.bondUsed = true; inv.bondName = chosen.name; inv.bondStrength = chosen.strength; inv.bondBonus = chosen.strength;
  inv.log.push(`BOND ${chosen.name} +${chosen.strength}`);
  recalculateInvokedRoll(r);
  await syncInvokedRoll(r);
}

function rollActorOptions(selected = "") {
  const selfRef = `player:${runtime.currentPlayer.id}`;
  if (runtime.currentPlayer.role !== "GM") {
    const selfName = state.name || runtime.currentPlayer.name || "Character";
    return `<option value="${esc(selfRef)}" selected>${esc(selfName)}</option>`;
  }
  const out = [];
  for (const p of allParty()) { const raw = p.metadata?.[META_KEY]; if (!raw || raw.deleted) continue; const s = normalizeState(raw); out.push(`<option value="player:${esc(p.id)}" ${selected === `player:${p.id}` ? "selected" : ""}>${esc(s.name || p.name)}</option>`); }
  for (const m of runtime.sceneMonsters) { const v = monsterPhaseView(m, "active"); out.push(`<option value="monster:${esc(m.id)}" ${selected === `monster:${m.id}` ? "selected" : ""}>MONSTER · ${esc(v.name)}</option>`); }
  return out.join("");
}
function resolveRollActor() {
  const selfRef = `player:${runtime.currentPlayer.id}`;
  if (runtime.currentPlayer.role !== "GM") {
    return { ref: selfRef, name: state.name || runtime.currentPlayer.name || "Character", sheet: state };
  }
  let ref = runtime.rollActor || selfRef;
  const [kind, id] = String(ref).split(":");
  if (kind === "monster") { const raw = monsterById(id), m = raw ? monsterPhaseView(raw, "active") : null; if (m) return { ref, name: m.name, sheet: m }; }
  const s = sourceSheet(id); if (s) return { ref: `player:${id}`, name: s.name || sourceParty(id)?.name || "Character", sheet: s };
  return { ref: selfRef, name: state.name || runtime.currentPlayer.name || "Character", sheet: state };
}

// v2.163 clean branch from v2.162: Token Action HUD.
// Selecting a linked token opens the HUD once and pins the actor so the player/GM
// can freely select map targets without the acting sheet changing underneath them.
function tokenActionHudCanControl(kind, id) {
  if (runtime.currentPlayer.role === "GM") return kind === "player" || kind === "monster";
  return kind === "player" && String(id) === String(runtime.currentPlayer.id);
}
function tokenActionHudActorByTokenId(tokenId = "") {
  const wanted = String(tokenId || ""); if (!wanted) return null;
  for (const p of allParty()) {
    const sh = sourceSheet(p.id); if (!sh || sh.deleted || String(sh.linkedTokenId || "") !== wanted) continue;
    if (!tokenActionHudCanControl("player", p.id)) continue;
    return { kind: "player", id: String(p.id), tokenId: wanted, name: sh.name || p.name || "CHARACTER", sheet: sh, raw: sh, portrait: sh.portrait || "" };
  }
  if (runtime.currentPlayer.role === "GM") {
    for (const raw of runtime.sceneMonsters || []) {
      if (String(raw.linkedTokenId || "") !== wanted) continue;
      const sh = monsterPhaseView(raw, "active");
      if (!sh) continue;
      return { kind: "monster", id: String(raw.id), tokenId: wanted, name: sh.name || raw.name || "MONSTER", sheet: sh, raw, portrait: sh.portrait || "" };
    }
  }
  return null;
}
function tokenActionHudActor() { return tokenActionHudActorByTokenId(runtime.tokenActionHud?.tokenId); }
function tokenActionHudSelectionSignature(ids = []) { return (Array.isArray(ids) ? ids : []).map(String).sort().join("|"); }
async function controlledActorFromSelection(ids = null) {
  if (PREVIEW || !runtime.online || !OBR) return null;
  const selected = Array.isArray(ids) ? ids : await OBR.player.getSelection();
  for (const id of selected || []) { const actor = tokenActionHudActorByTokenId(id); if (actor) return actor; }
  return null;
}
async function syncTokenActionHudSelection(player = null, forceOpen = false) {
  if (PREVIEW || !runtime.online || !OBR) return false;
  try {
    const ids = Array.isArray(player?.selection) ? player.selection : await OBR.player.getSelection();
    const sig = tokenActionHudSelectionSignature(ids);
    const hud = runtime.tokenActionHud ||= { tokenId: "", tab: "actions", selectionSig: "", dismissedSig: "" };
    const changed = sig !== hud.selectionSig; hud.selectionSig = sig;
    if (changed && hud.dismissedSig && sig !== hud.dismissedSig) hud.dismissedSig = "";
    // Once an actor is pinned, normal map selection is free for targeting.
    if (hud.tokenId && tokenActionHudActor()) return false;
    if (!forceOpen && (!changed || (sig && sig === hud.dismissedSig))) return false;
    const actor = await controlledActorFromSelection(ids);
    if (!actor) return false;
    hud.tokenId = actor.tokenId; hud.dismissedSig = "";
    if (!["actions","items","roll"].includes(hud.tab)) hud.tab = "actions";
    render(); return true;
  } catch (e) { console.warn("Token Action HUD selection", e); return false; }
}
function scheduleTokenActionHudSelection(player = null, delay = 20) { /* v2.163.4: main-canvas HUD is owned by background popover */ return; }
async function switchTokenActionHudToSelection() {
  if (PREVIEW || !runtime.online || !OBR) return;
  const ids = await OBR.player.getSelection();
  const actor = await controlledActorFromSelection(ids);
  if (!actor) return notify(runtime.currentPlayer.role === "GM" ? "Select a linked Player / Ally / Monster token first" : "Select the token linked to your own sheet first");
  runtime.tokenActionHud.tokenId = actor.tokenId; runtime.tokenActionHud.dismissedSig = ""; runtime.tokenActionHud.selectionSig = tokenActionHudSelectionSignature(ids); render();
}
function closeTokenActionHud() {
  const hud = runtime.tokenActionHud; if (!hud) return;
  hud.dismissedSig = hud.selectionSig || ""; hud.tokenId = ""; render();
}
function tokenActionHudResource(kind, id, key, label, current, max = null) {
  const cap = max === null ? "" : `/${Math.max(0, Number(max) || 0)}`;
  return `<div class="token-action-hud-resource ${key}"><span>${esc(label)}</span><button type="button" data-quick-resource="${esc(kind)}:${esc(id)}:${esc(key)}:-1">−</button><b>${Math.max(0, Number(current) || 0)}${cap}</b><button type="button" data-quick-resource="${esc(kind)}:${esc(id)}:${esc(key)}:1">+</button></div>`;
}
function tokenActionHudResources(actor) {
  if (!actor) return "";
  if (actor.kind === "monster") {
    const r = actor.raw || {}, sh = actor.sheet || r;
    return `${tokenActionHudResource("monster",actor.id,"hp","HP",r.hp?.current,r.hp?.max)}${tokenActionHudResource("monster",actor.id,"mp","MP",r.mp?.current,r.mp?.max)}${tokenActionHudResource("monster",actor.id,"ip","IP",r.ip?.current,r.ip?.max)}${r.up?.max ? tokenActionHudResource("monster",actor.id,"up","UP",r.up?.current,r.up?.max) : ""}${tokenActionHudResource("monster",actor.id,"fp","FP",r.fp,null)}<div class="token-action-hud-defense"><span>DEF <b>${defenseValue(sh,"defense")}</b></span><span>M.DEF <b>${defenseValue(sh,"magicDefense")}</b></span></div>`;
  }
  const s = actor.sheet;
  return `${tokenActionHudResource("player",actor.id,"hp","HP",s.hp?.current,s.hp?.max)}${tokenActionHudResource("player",actor.id,"mp","MP",s.mp?.current,s.mp?.max)}${tokenActionHudResource("player",actor.id,"ip","IP",s.ip?.current,s.ip?.max)}${tokenActionHudResource("player",actor.id,"fp","FP",s.fp,null)}<div class="token-action-hud-defense"><span>DEF <b>${playerDefense(s,"defense")}</b></span><span>M.DEF <b>${playerDefense(s,"magicDefense")}</b></span></div>`;
}
function tokenActionHudPreviewHTML(action, sheet) {
  const a = action || {};
  return `<div class="token-action-hud-action-preview"><div class="token-action-hud-preview-kicker">ACTION PREVIEW</div>${actionSkillMedia(a.note || "", a.element || "none")}<h4>${esc(a.name || "ACTION")}</h4><div class="token-action-hud-preview-meta"><span class="action-type-badge ${actionTypeClass(a.category)}">${esc(normalizeActionType(a.category))}</span>${elementChip(a.element || "none", true)}</div>${actionCompactFormula(a, sheet)}${actionExtraMeta(a.target,a.actionTypeText)}${actionCostLine(a.cost)}${actionSkillDescription(a.note || "")}</div>`;
}
function tokenActionHudActionRow(actor, a, i, count) {
  const moveUp = i > 0 ? `<button type="button" class="token-action-hud-order" data-token-hud-action-move="${esc(actor.kind)}|${esc(actor.id)}|${i}|-1" title="Move action up">▲</button>` : `<button type="button" class="token-action-hud-order" disabled>▲</button>`;
  const moveDown = i < count - 1 ? `<button type="button" class="token-action-hud-order" data-token-hud-action-move="${esc(actor.kind)}|${esc(actor.id)}|${i}|1" title="Move action down">▼</button>` : `<button type="button" class="token-action-hud-order" disabled>▼</button>`;
  const verb = isGuardFamilyAction(a) ? "USE" : a.mode === "ROLL" ? "ROLL" : "USE";
  return `<div class="token-action-hud-action" data-dom-key="token-hud-action:${esc(actor.kind)}:${esc(actor.id)}:${i}"><div class="token-action-hud-action-main"><span class="action-type-badge ${actionTypeClass(a.category)}">${esc(normalizeActionType(a.category))}</span><div><b>${esc(a.name || "ACTION")}</b><small>${isGuardAction(a)?"RESIST ALL · OPPOSED +2":isCoverAllyAction(a)?"CHOOSE 1 ALLY · BLOCK ENEMY MELEE":a.mode === "ROLL" ? `${esc(a.attr1)} d${currentDie(actor.sheet,a.attr1)} + ${esc(a.attr2)} d${currentDie(actor.sheet,a.attr2)}${isTwoWeaponAction(a) ? " · HR 0" : ""}` : "NO ROLL"}</small></div></div><div class="token-action-hud-action-buttons">${moveUp}${moveDown}<button type="button" class="primary" data-token-hud-action="${esc(actor.kind)}|${esc(actor.id)}|${i}">${verb}</button></div>${tokenActionHudPreviewHTML(a, actor.sheet)}</div>`;
}
function tokenActionHudActionsHTML(actor) {
  const actions = Array.isArray(actor.sheet?.actions) ? actor.sheet.actions : [];
  return actions.length ? `<div class="token-action-hud-list">${actions.map((a,i)=>tokenActionHudActionRow(actor,a,i,actions.length)).join("")}</div>` : `<div class="token-action-hud-empty">NO PREPARED ACTIONS</div>`;
}
function tokenActionHudItemRow(actor, item, i) {
  const art = cardTokenImageInfo(item)?.url || gifFromText(item.detail || "") || "";
  return `<div class="token-action-hud-item"><div class="token-action-hud-item-art">${art ? `<img src="${esc(art)}" alt="">` : `<span>ITEM</span>`}</div><div class="token-action-hud-item-copy"><b>${esc(item.name || "ITEM")}</b><small>${esc(item.itemType || "ITEM")}</small><p>${esc(stripMediaUrls(item.detail || "") || "NO DESCRIPTION")}</p></div><button type="button" class="primary" data-token-hud-item="player|${esc(actor.id)}|${i}">USE</button></div>`;
}
function tokenActionHudItemsHTML(actor) {
  if (actor.kind !== "player") return `<div class="token-action-hud-empty">MONSTER SHEETS DO NOT HAVE PLAYER ITEMS</div>`;
  const items = Array.isArray(actor.sheet?.inventory) ? actor.sheet.inventory : [];
  return items.length ? `<div class="token-action-hud-list items">${items.map((x,i)=>tokenActionHudItemRow(actor,x,i)).join("")}</div>` : `<div class="token-action-hud-empty">NO ITEMS</div>`;
}
function tokenActionHudAttrOptions(sheet, selected) { return ATTRS.map(k=>`<option value="${k}" ${k===selected?"selected":""}>${k} · d${currentDie(sheet,k)}</option>`).join(""); }
function tokenActionHudRollHTML(actor) {
  return `<div class="token-action-hud-roll"><div class="token-action-hud-quick-rolls"><button type="button" data-token-hud-quick-roll="DEX|INS">DEX + INS</button><button type="button" data-token-hud-quick-roll="INS|INS">INS + INS</button><button type="button" data-token-hud-quick-roll="MIG|MIG">MIG + MIG</button><button type="button" data-token-hud-quick-roll="WLP|WLP">WLP + WLP</button></div><div class="token-action-hud-manual"><label>STAT A<select data-token-hud-roll-a>${tokenActionHudAttrOptions(actor.sheet,"DEX")}</select></label><label>STAT B<select data-token-hud-roll-b>${tokenActionHudAttrOptions(actor.sheet,"INS")}</select></label><label>MOD<input type="number" value="0" data-token-hud-roll-mod></label><label>NAME<input value="Custom Check" data-token-hud-roll-label></label><button type="button" class="primary" data-token-hud-manual-roll>ROLL CHECK</button></div><small class="token-action-hud-roll-note">CHECK ONLY · HR is not added. Uses the pinned token's current Sheet.</small></div>`;
}
function tokenActionHudHTML() {
  const actor = tokenActionHudActor(); if (!actor) return "";
  const hud = runtime.tokenActionHud || {}, tab = ["actions","items","roll"].includes(hud.tab) ? hud.tab : "actions";
  const status = activeStatuses(actor.sheet || {}).filter(x=>x!=="crisis");
  const body = tab === "items" ? tokenActionHudItemsHTML(actor) : tab === "roll" ? tokenActionHudRollHTML(actor) : tokenActionHudActionsHTML(actor);
  return `<aside class="token-action-hud" data-dom-key="token-action-hud"><header><div class="token-action-hud-portrait">${actor.portrait ? `<img class="${actor.kind === "monster" ? "monster-full-art" : ""}" src="${esc(actor.portrait)}" alt="">` : `<span>${esc((actor.name||"?").slice(0,1).toUpperCase())}</span>`}</div><div class="token-action-hud-title"><small>${actor.kind === "monster" ? "MONSTER TOKEN" : "LINKED CHARACTER TOKEN"}</small><b>${esc(actor.name)}</b><span>${status.length ? status.map(x=>x.toUpperCase()).join(" · ") : "NORMAL"}</span></div><button type="button" class="token-action-hud-switch" data-token-hud-switch title="Use the currently selected linked token as actor">↻ SELECTED</button><button type="button" class="token-action-hud-close" data-token-hud-close aria-label="Close Token Action HUD">×</button></header><div class="token-action-hud-resources">${tokenActionHudResources(actor)}</div><nav><button type="button" class="${tab==="actions"?"active":""}" data-token-hud-tab="actions">ACTION <b>${actor.sheet?.actions?.length||0}</b></button><button type="button" class="${tab==="items"?"active":""}" data-token-hud-tab="items">ITEM${actor.kind!=="player"?" · —":` <b>${actor.sheet?.inventory?.length||0}</b>`}</button><button type="button" class="${tab==="roll"?"active":""}" data-token-hud-tab="roll">ROLL</button></nav><section class="token-action-hud-body">${body}</section><footer>ACTOR PINNED · SELECT MAP TARGETS WITHOUT CHANGING THIS HUD</footer></aside>`;
}
async function tokenActionHudUseAction(payload = "") {
  const [kind,id,rawIndex] = String(payload).split("|"), index = Number(rawIndex);
  if (!tokenActionHudCanControl(kind,id)) return notify("You cannot control that token.");
  if (kind === "monster") {
    const raw = monsterById(id), sh = raw ? monsterPhaseView(raw,"active") : null, a = sh?.actions?.[index]; if (!raw || !sh || !a) return notify("Action is no longer available.");
    if(isGuardFamilyAction(a))return startGuardAction("monster",id,index,"active");
    const intentKind = a.mode === "ROLL" ? "monster-roll-action" : "monster-send-action";
    return openResourceCostPrompt({ actorKind:"monster", actorId:id, mode:"active", title:`ACTION · ${a.name||"ACTION"}`, verb:a.mode === "ROLL" ? "ROLL" : "SEND", listedCost:a.cost||"", intent:{ kind:intentKind, mode:"active", id, index } });
  }
  const sh = sourceSheet(id), a = sh?.actions?.[index]; if (!sh || !a) return notify("Action is no longer available.");
  if(isGuardFamilyAction(a))return startGuardAction("player",id,index,"player");
  const intentKind = a.mode === "ROLL" ? "roll-player-action" : "send-action";
  return openResourceCostPrompt({ actorKind:"player", actorId:id, title:`ACTION · ${a.name||"ACTION"}`, verb:a.mode === "ROLL" ? "ROLL" : "SEND", listedCost:a.cost||"", intent:{ kind:intentKind, owner:id, index } });
}
async function tokenActionHudMoveAction(payload = "") {
  const [kind,id,ri,rd] = String(payload).split("|"), from = Number(ri), delta = Number(rd);
  if (!tokenActionHudCanControl(kind,id) || !Number.isInteger(from) || !delta) return;
  if (kind === "monster") {
    if (runtime.currentPlayer.role !== "GM") return;
    const raw = monsterById(id), arr = raw ? monsterPhaseTarget(raw,"active")?.actions : null; if (!Array.isArray(arr)) return;
    const to = clamp(from + delta,0,arr.length-1); if (to===from) return;
    updateMonster("active",id,m=>moveItem(monsterPhaseTarget(m,"active").actions,from,to)); render(); return;
  }
  const sh = sourceSheet(id), arr = sh?.actions; if (!Array.isArray(arr)) return;
  const to = clamp(from + delta,0,arr.length-1); if (to===from) return;
  await sendRemoteEdit(id,{kind:"reorder-path",path:"actions",from,to});
}
function tokenActionHudRoll(actor, attr1, attr2, mod = 0, label = "Custom Check") {
  if (!actor || !tokenActionHudCanControl(actor.kind,actor.id)) return;
  return doRollWithSheet(actor.sheet,{name:label,label,attr1,attr2,mod:Number(mod)||0,element:"none",note:"Token Action HUD · Manual Check"},actor.name,"",{damage:false,hr:false,actorKind:actor.kind,actorId:String(actor.id)});
}

function playerShopCardHTML(rec) {
  const item = gmShopItemById(rec?.stockId); if (!item) return "";
  const price = Math.max(0, Number(item.cost)||0), pending = !!runtime.shopPurchasePending?.[rec.instanceId], afford = (Number(state.zenit)||0) >= price, trade = item.type === "TRADE-OFF", hb = item.type === "HOMEBREW" || trade;
  return `<article class="gm-shop-item player-shop-item ${trade ? "trade-off" : hb ? "homebrew" : "core-based"}"><div class="gm-shop-item-top"><div><small>${esc(item.id)} · ${esc(item.role || "UTILITY")}</small><h4>${esc(item.name)}</h4></div><div class="gm-shop-card-price"><b>${price.toLocaleString()}z</b></div></div><div class="gm-shop-tags"><span class="${trade ? "trade" : hb ? "hb" : "core"}">${esc(gmShopItemCategory(item))}</span><span>${esc(item.type || "ITEM")}</span></div>${gmShopActivationHTML(item, true)}<p>${esc(item.description || "")}</p>${gmShopProsConsHTML(item, true)}<div class="gm-shop-item-actions"><button class="mini-btn" data-player-shop-detail="${esc(rec.instanceId)}">DETAIL</button><button class="primary player-shop-buy" data-shop-buy="${esc(rec.instanceId)}" ${pending || !afford ? "disabled" : ""}>${pending ? "WAITING GM…" : afford ? "BUY" : "NOT ENOUGH ZENIT"}</button></div></article>`;
}
function shopCategoryOrder() { return ["ACCESSORY","WEAPON","LIGHT ARMOR","HEAVY ARMOR","SHIELD"]; }
function playerShopGroupedHTML(rows = []) {
  return shopCategoryOrder().map(cat => {
    const group = rows.filter(rec => { const item = gmShopItemById(rec?.stockId); return item && gmShopItemCategory(item) === cat; });
    if (!group.length) return "";
    return `<section class="player-shop-category"><div class="player-shop-category-head"><b>${gmShopCategoryLabel(cat)}</b><span>${group.length}</span></div><div class="gm-shop-grid player-shop-grid">${group.map(playerShopCardHTML).filter(Boolean).join("")}</div></section>`;
  }).join("");
}
function gmShopActiveGroupedHTML(items = []) {
  return shopCategoryOrder().map(cat => {
    const group = items.filter(item => gmShopItemCategory(item) === cat); if (!group.length) return "";
    return `<section class="gm-shop-active-category"><div class="gm-shop-active-category-head"><b>${gmShopCategoryLabel(cat)}</b><span>${group.length}</span></div><div class="gm-shop-grid">${group.map(x => gmShopCardHTML(x,"active")).join("")}</div></section>`;
  }).join("");
}
function playerShopHTML() {
  if (!gmShopStockLoaded()) return gmShopLoadingHTML("PLAYER SHOP");
  const shop = normalizeSharedShop(runtime.sharedShop), rows = shop.open ? shop.items : [], host = shop.publishedByName || "GM";
  const groups = playerShopGroupedHTML(rows);
  return `<div class="view active player-shop-view"><section class="player-shop-page"><div class="player-shop-hero"><div><small>ROOM MARKET · SHARED STOCK</small><h2>ACTIVE SHOP</h2><p>ซื้อสินค้าแล้วระบบจะหัก Zenit และสร้างการ์ดเข้า <b>ITEMS</b> ของ Character Sheet อัตโนมัติ สินค้าที่ขายแล้วจะหายจากร้านรอบนี้ แต่ยังคงอยู่ใน Stock และอาจสุ่มกลับมาในร้านรอบถัดไป</p></div><div class="player-shop-wallet"><small>YOUR ZENIT</small><strong>${(Number(state.zenit)||0).toLocaleString()}z</strong></div></div><div class="player-shop-status"><span class="${shop.open ? "open" : "closed"}">${shop.open ? "● SHOP OPEN" : "○ SHOP CLOSED"}</span><small>${shop.open ? `PUBLISHED BY ${esc(host)} · ${rows.length} ITEM${rows.length===1?"":"S"}` : "WAITING FOR GM TO PUBLISH ACTIVE SHOP"}</small></div>${shop.open ? (groups ? groups : `<div class="gm-shop-empty player-shop-soldout">SOLD OUT · รอ GM เปิดร้านรอบถัดไป</div>`) : `<div class="gm-shop-empty">NO ACTIVE SHOP</div>`}<div class="player-shop-note">ONE-COPY PER SHOP CYCLE · ผู้เล่นคนแรกที่ซื้อสำเร็จจะได้สินค้า และระบบจะถอดสินค้านั้นออกจากร้านให้ทุกคนทันที</div></section></div>`;
}
function openPlayerShopDetail(instanceId) { const rec = sharedShopItem(instanceId); if (!rec) { showToast("SHOP", "สินค้าชิ้นนี้ไม่มีในร้านแล้ว", "message"); return; } runtime.overlay = { kind: "player-shop-detail", instanceId: String(instanceId) }; renderOverlay(); }
function playerShopDetailHTML(x) {
  const rec = sharedShopItem(x?.instanceId), item = rec ? gmShopItemById(rec.stockId) : null; if (!rec || !item) return "";
  const price = Math.max(0,Number(item.cost)||0), pending=!!runtime.shopPurchasePending?.[rec.instanceId], afford=(Number(state.zenit)||0)>=price, trade=item.type==="TRADE-OFF", hb=item.type==="HOMEBREW"||trade, category=gmShopItemCategory(item);
  return `<div class="cinematic-backdrop gm-shop-detail-backdrop" data-overlay-backdrop-close><div class="cinematic-card gm-shop-detail-card"><button type="button" class="overlay-close" data-action="close-overlay">×</button><div class="cinematic-kicker">PLAYER SHOP · ${esc(category)}</div><div class="gm-shop-detail-title"><div><small>${esc(item.id)} · ${esc(item.role||"UTILITY")}</small><h2>${esc(item.name)}</h2><span>${esc(item.source||"U.E. EQUIPMENT")}</span></div><strong>${price.toLocaleString()}z</strong></div><div class="gm-shop-detail-tags"><span class="${trade?"trade":hb?"hb":"core"}">${esc(category)}</span><span>${esc(item.type||"ITEM")}</span></div><div class="gm-shop-detail-description">${esc(item.description||"")}</div>${gmShopActivationHTML(item)}<div class="gm-shop-detail-grid"><section><b>ITEM DATA</b><p>${esc(gmShopItemDataText(item))}</p></section><section class="gm-shop-detail-mechanics"><b>${["LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(category) ? "ข้อเสีย" : "ข้อดี / ข้อเสีย"}</b>${gmShopProsConsHTML(item)}</section></div><div class="gm-shop-detail-footer"><span>BUY → ZENIT DEDUCTED → ITEM CARD ADDED TO ITEMS</span><button type="button" class="primary player-shop-buy" data-shop-buy="${esc(rec.instanceId)}" ${pending||!afford?"disabled":""}>${pending?"WAITING GM…":afford?`BUY · ${price.toLocaleString()}z`:"NOT ENOUGH ZENIT"}</button></div></div></div>`;
}

function gmShopPool(mode = runtime.gmShop.mode, role = runtime.gmShop.role, category = runtime.gmShop.category) {
  let pool = mode === "homebrew" ? gmShopCustomStock() : mode === "core" ? gmShopOriginalStock() : gmShopAllStock();
  if (category) pool = pool.filter(x => gmShopItemCategory(x) === category);
  if (role && role !== "all") pool = pool.filter(x => x.role === role);
  return pool.filter(gmShopIsSellable);
}
function gmShopRandomIds(pool, count) {
  const rows = [...pool];
  for (let i = rows.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rows[i], rows[j]] = [rows[j], rows[i]]; }
  return rows.slice(0, Math.max(0, count)).map(x => String(x.id));
}
function generateGMShop() {
  const shop = runtime.gmShop, maxPrice = Math.max(0, Number(shop.maxPrice) || 0);
  const pool = gmShopPool(shop.mode, shop.role, shop.category).filter(item => !maxPrice || Math.max(0, Number(item.cost) || 0) <= maxPrice);
  const count = clamp(shop.size, 3, 12);
  if (!pool.length) { showToast("GM SHOP", maxPrice ? `No items match the selected filters at ≤ ${maxPrice.toLocaleString()}z` : "No items match the selected filters", "message"); return; }
  shop.generated = gmShopRandomIds(pool, Math.min(count, pool.length));
  shop.cycleId = uid(); shop.soldThisCycle = [];
  shop.history.unshift({ id: uid(), time: Date.now(), mode: shop.mode, category: shop.category, items: [...shop.generated] });
  shop.history = shop.history.slice(0, 20); saveGMShopState(); render();
  showToast("GM SHOP", `${shop.generated.length} ITEMS · ${gmShopModeLabel(shop.mode)} · ${gmShopCategoryLabel(shop.category)}${maxPrice ? ` · MAX ≤ ${maxPrice.toLocaleString()}z` : ""}`, "message", false);
}
async function addGMShopActive(id) {
  const item = gmShopItemById(id); if (!item) return;
  if ((runtime.gmShop.soldThisCycle || []).includes(item.id)) { showToast("SOLD THIS CYCLE", "Generate ร้านรอบใหม่ก่อนจึงจะนำสินค้าชิ้นนี้กลับมาได้", "message"); return; }
  if (!runtime.gmShop.active.includes(item.id)) runtime.gmShop.active.push(item.id);
  saveGMShopState(); render();
  await syncGMShopActiveToPlayers({ forceOpen: true, quiet: true });
  if (runtime.view === "gmtools" && runtime.gmToolTab === "shop") render();
  showToast("ACTIVE SHOP", `${item.name} · ADDED`, "message", false);
}
async function removeGMShopActive(id) {
  const stockId = String(id), item = gmShopItemById(stockId);
  runtime.gmShop.active = runtime.gmShop.active.filter(x => x !== stockId);
  saveGMShopState(); render();
  if (runtime.sharedShop?.open) await syncGMShopActiveToPlayers({ forceOpen: false, quiet: true });
  if (runtime.view === "gmtools" && runtime.gmToolTab === "shop") render();
  if (item) showToast("ACTIVE SHOP", `${item.name} · REMOVED`, "message", false);
}
function gmShopCardHTML(item, context = "stock") {
  if (!item) return "";
  const active = runtime.gmShop.active.includes(item.id), trade = item.type === "TRADE-OFF", hb = item.type === "HOMEBREW" || trade, category = gmShopItemCategory(item);
  const action = active ? `<button class="mini-btn danger-soft" data-gm-shop-remove="${esc(item.id)}">REMOVE FROM ACTIVE</button>` : `<button class="mini-btn" data-gm-shop-add="${esc(item.id)}">ADD TO ACTIVE</button>`;
  const price = item.flawDiscount ? `<small class="gm-shop-card-price-note">BASE ${Number(item.baseCost || item.cost || 0).toLocaleString()}z · ข้อเสีย −${Number(item.flawDiscount)}%</small>` : "";
  return `<article class="gm-shop-item ${trade ? "trade-off" : hb ? "homebrew" : "core-based"}"><div class="gm-shop-item-top"><div><small>${esc(item.id)} · ${esc(item.role || "UTILITY")}</small><h4>${esc(item.name)}</h4></div><div class="gm-shop-card-price"><b>${Number(item.cost || 0).toLocaleString()}z</b>${price}</div></div><div class="gm-shop-tags"><span class="${trade ? "trade" : hb ? "hb" : "core"}">${esc(category)}</span><span>${esc(item.type || "ITEM")}</span></div>${gmShopActivationHTML(item, true)}<p>${esc(item.description || "")}</p>${gmShopProsConsHTML(item, true)}<div class="gm-shop-option"><b>ITEM DATA</b><span>${esc(gmShopItemDataText(item))}</span></div><div class="gm-shop-item-actions"><button class="mini-btn" data-gm-shop-detail="${esc(item.id)}">DETAIL</button>${action}</div></article>`;
}
function gmShopSectionTabsHTML(selected = runtime.gmShop.category) {
  const cats = ["ACCESSORY","WEAPON","LIGHT ARMOR","HEAVY ARMOR","SHIELD"];
  return `<div class="gm-shop-section-tabs">${cats.map(cat => `<button type="button" class="${selected === cat ? "active" : ""}" data-gm-shop-section="${cat}"><b>${gmShopCategoryLabel(cat)}</b><small>${gmShopCategoryCount(cat).toLocaleString()}</small></button>`).join("")}</div>`;
}
function gmShopGeneratorHTML() {
  const shop = runtime.gmShop, items = shop.generated.map(gmShopItemById).filter(x => gmShopIsSellable(x) && gmShopItemCategory(x) === shop.category);
  const roles = ["all","โจมตี","ป้องกัน","สนับสนุน","สถานะ","อรรถประโยชน์"];
  return `${gmShopSectionTabsHTML(shop.category)}<div class="gm-shop-generator"><div class="gm-shop-config"><div class="gm-shop-mode-row">${[["mix","MIX"],["core","CORE-INSPIRED"],["homebrew","HOMEBREW"]].map(([key,label]) => `<button class="gm-shop-mode ${shop.mode === key ? "active" : ""}" data-gm-shop-mode="${key}">${label}</button>`).join("")}</div><div class="gm-shop-form"><label><span>SHOP SIZE</span><input type="number" min="3" max="12" data-gm-shop-size value="${shop.size}"></label><label><span>ROLE</span><select data-gm-shop-role>${roles.map(r => `<option value="${r}" ${shop.role === r ? "selected" : ""}>${r === "all" ? "ALL ROLES" : esc(r)}</option>`).join("")}</select></label></div><button class="primary gm-shop-generate" data-action="generate-gm-shop" title="Left-click: Generate · Right-click: Set maximum item price">GENERATE ${gmShopCategoryLabel(shop.category)}</button><div class="gm-shop-price-cap ${Number(shop.maxPrice)>0?"active":""}">RIGHT-CLICK GENERATE · MAX PRICE ${Number(shop.maxPrice)>0?`≤ ${Number(shop.maxPrice).toLocaleString()}z`:"ANY"}</div><div class="gm-shop-info"><b>${gmShopCategoryLabel(shop.category)}: ${gmShopCategoryCount(shop.category).toLocaleString()} ITEMS</b><span>STAT EXPANSION: WEAPON +300 ชิ้น (200 Stat Trade-Off: Stat สูง = 1 ข้อเสีย, Stat สูงมาก = 2 ข้อเสีย · 100 Pure Stat: ไม่มี Positive Effect และไม่มีข้อเสีย) · ARMOR +100 ชิ้น (Light 50 + Heavy 50) · SHIELD +100 ชิ้น · Armor / Shield ชุดใหม่นี้ไม่มี Positive Effect และใช้ข้อเสียถ่วง Stat ตามระดับ</span></div></div><div class="gm-shop-results"><div class="gm-shop-result-head"><b>GENERATED ${gmShopCategoryLabel(shop.category)}</b><span>${items.length} ITEMS · ${gmShopModeLabel(shop.mode)}</span></div>${items.length ? `<div class="gm-shop-grid">${items.map(x => gmShopCardHTML(x,"generated")).join("")}</div>` : `<div class="gm-shop-empty">ยังไม่ได้ Generate ${gmShopCategoryLabel(shop.category)}</div>`}</div></div>`;
}
function gmShopStockHTML() {
  const shop = runtime.gmShop, q = String(shop.stockSearch || "").trim().toLowerCase(), role = shop.stockRole, category = shop.stockCategory;
  let rows = gmShopAllStock().filter(x => gmShopItemCategory(x) === category && gmShopIsSellable(x));
  if (role !== "all") rows = rows.filter(x => x.role === role);
  if (q) rows = rows.filter(x => [x.id,x.name,x.description,x.effect,x.source,x.weaponCategory,...gmShopBenefits(x),...gmShopDrawbacks(x),gmShopItemDataText(x)].some(v => String(v || "").toLowerCase().includes(q)));
  const per = 18, pages = Math.max(1, Math.ceil(rows.length / per)); shop.stockPage = clamp(shop.stockPage, 1, pages);
  const page = shop.stockPage, view = rows.slice((page - 1) * per, page * per), roles = ["all","โจมตี","ป้องกัน","สนับสนุน","สถานะ","อรรถประโยชน์"];
  return `${gmShopSectionTabsHTML(category)}<div class="gm-shop-stock-head"><div><b>${gmShopCategoryLabel(category)} STOCK ${gmShopCategoryCount(category).toLocaleString()}</b><small>${rows.length.toLocaleString()} MATCHING ITEMS</small></div><div class="gm-shop-stock-tools"><input data-gm-shop-search value="${esc(shop.stockSearch)}" placeholder="Search name / effect / stats..."><select data-gm-shop-stock-role>${roles.map(r => `<option value="${r}" ${role === r ? "selected" : ""}>${r === "all" ? "ALL ROLES" : esc(r)}</option>`).join("")}</select><button class="mini-btn" data-action="apply-gm-shop-search">SEARCH</button><button class="mini-btn" data-action="clear-gm-shop-search">CLEAR</button></div></div><div class="gm-shop-pager"><button class="mini-btn" data-gm-shop-stock-page="${Math.max(1,page-1)}" ${page<=1?"disabled":""}>← PREV</button><b>PAGE ${page} / ${pages}</b><button class="mini-btn" data-gm-shop-stock-page="${Math.min(pages,page+1)}" ${page>=pages?"disabled":""}>NEXT →</button></div><div class="gm-shop-grid">${view.map(x => gmShopCardHTML(x,"stock")).join("")}</div>`;
}
function gmShopActiveHTML() {
  const items = runtime.gmShop.active.map(gmShopItemById).filter(gmShopIsSellable), shared = normalizeSharedShop(runtime.sharedShop), published = shared.open ? shared.items.length : 0;
  const groups = gmShopActiveGroupedHTML(items);
  return `<div class="gm-shop-result-head gm-shop-active-head"><div><b>ACTIVE SHOP</b><small>GM DRAFT ${items.length} · PLAYER SHOP ${shared.open ? `OPEN ${published}` : "CLOSED"}</small></div><div class="gm-shop-publish-actions">${items.length ? `<button class="primary" data-action="publish-gm-shop">PUBLISH / UPDATE PLAYER SHOP</button>` : ""}${shared.open ? `<button class="mini-btn danger-soft" data-action="close-gm-shop">CLOSE PLAYER SHOP</button>` : ""}${items.length ? `<button class="mini-btn danger-soft" data-action="clear-gm-shop-active">CLEAR ACTIVE SHOP</button>` : ""}</div></div><div class="gm-shop-publish-note">สินค้าใน ACTIVE SHOP แยกตามหมวด ACCESSORY / WEAPON / LIGHT ARMOR / HEAVY ARMOR / SHIELD และ Sync ไปยัง SHOP ของผู้เล่นทันทีเมื่อเพิ่มหรือลบ · ซื้อสำเร็จแล้วสินค้าจะถูกถอดจากร้านรอบนี้ แต่ไม่ถูกลบจาก Stock</div>${groups || `<div class="gm-shop-empty">ยังไม่มีสินค้าใน Active Shop</div>`}`;
}
function deleteGMShopHistory(id) {
  if (runtime.currentPlayer.role !== "GM") return;
  const key = String(id || ""), rows = Array.isArray(runtime.gmShop.history) ? runtime.gmShop.history : [];
  const row = rows.find(h => String(h?.id || "") === key);
  if (!row) return;
  const label = `${new Date(row.time).toLocaleString()} · ${Number(row.items?.length) || 0} ITEMS`;
  if (!window.confirm(`Delete this shop history?\n${label}`)) return;
  runtime.gmShop.history = rows.filter(h => String(h?.id || "") !== key);
  saveGMShopState();
  render();
}
function clearGMShopHistory() {
  if (runtime.currentPlayer.role !== "GM") return;
  const count = Array.isArray(runtime.gmShop.history) ? runtime.gmShop.history.length : 0;
  if (!count) return;
  if (!window.confirm(`Clear all ${count} shop history entries?\nThis does not delete Stock, Active Shop, or purchased Items.`)) return;
  runtime.gmShop.history = [];
  saveGMShopState();
  render();
}
function gmShopHistoryHTML() {
  const rows = runtime.gmShop.history || [];
  if (!rows.length) return `<div class="gm-shop-empty">ยังไม่มีประวัติการ Generate ร้าน</div>`;
  return `<div class="gm-shop-history-head"><div><b>SHOP HISTORY</b><small>${rows.length} SAVED GENERATIONS</small></div><button type="button" class="danger-soft" data-gm-shop-history-clear>CLEAR HISTORY</button></div><div class="gm-shop-history">${rows.map(h => `<div class="gm-shop-history-row"><button type="button" class="gm-shop-history-load" data-gm-shop-history="${esc(h.id)}"><span><b>${new Date(h.time).toLocaleString()}</b><small>${esc(gmShopModeLabel(h.mode))} · ${esc(gmShopCategoryLabel(h.category || "all"))}</small></span><strong>${h.items.length} ITEMS</strong></button><button type="button" class="danger-soft gm-shop-history-delete" data-gm-shop-history-delete="${esc(h.id)}">DELETE</button></div>`).join("")}</div>`;
}
function gmShopHTML() {
  if (!gmShopStockLoaded()) return gmShopLoadingHTML("GM SHOP");
  const shop = runtime.gmShop, panel = shop.panel;
  const content = panel === "stock" ? gmShopStockHTML() : panel === "active" ? gmShopActiveHTML() : panel === "history" ? gmShopHistoryHTML() : gmShopGeneratorHTML();
  return `<section class="gm-module gm-shop-module"><div class="gm-module-head"><div><small>U.E. URBAN EQUIPMENT</small><h3>GM SHOP</h3></div><span>${gmShopAllStock().length.toLocaleString()} SELLABLE STOCK</span></div><div class="gm-shop-tabs"><button class="${panel === "generator" ? "active" : ""}" data-gm-shop-panel="generator">GENERATOR</button><button class="${panel === "stock" ? "active" : ""}" data-gm-shop-panel="stock">STOCK ${gmShopAllStock().length.toLocaleString()}</button><button class="${panel === "active" ? "active" : ""}" data-gm-shop-panel="active">ACTIVE SHOP <span>${shop.active.length}</span></button><button class="${panel === "history" ? "active" : ""}" data-gm-shop-panel="history">HISTORY <span>${shop.history.length}</span></button></div>${content}<div class="gm-shop-disclaimer">SHOP แยก ACCESSORY / WEAPON / LIGHT ARMOR / HEAVY ARMOR / SHIELD เป็นคนละหมวด · WEAPON มีทั้ง Effect Weapon และ Stat-only Weapon · Stat Trade-Off ไม่มี Positive Effect: Stat สูง = 1 ข้อเสีย, Stat สูงมาก = 2 ข้อเสีย · Pure Stat Weapon ไม่มีทั้ง Positive Effect และข้อเสีย · Armor / Shield แบบ Stat-only ใช้ Stat เป็นข้อดีโดยตรง · TRADE-OFF อยู่ใน ROLL</div></section>`;
}
function gmBroadcastPlayers() {
  return allParty().filter(p => !p.offline && (p.role !== "GM" || sameId(p.id,runtime.currentPlayer.id)));
}
function sanitizeGMBroadcastTargets() {
  const valid = new Set(gmBroadcastPlayers().map(p => String(p.id)));
  runtime.gmBroadcastDraft.targets = (runtime.gmBroadcastDraft.targets || []).map(String).filter(id => valid.has(id));
  return runtime.gmBroadcastDraft.targets;
}
function gmBroadcastDefaultTitle(type = runtime.gmBroadcastDraft.type) { return gmBroadcastTypeInfo(type).label; }
function gmBroadcastTargetHTML() {
  const draft = runtime.gmBroadcastDraft, players = gmBroadcastPlayers(); sanitizeGMBroadcastTargets();
  const selected = new Set(draft.targets || []);
  return `<div class="gm-target-grid"><button class="gm-target-all ${draft.allPlayers ? "active" : ""}" data-gm-broadcast-all><b>ALL PLAYERS</b><small>Everyone currently in the room</small></button>${players.map(p => `<button class="gm-target-player ${!draft.allPlayers && selected.has(String(p.id)) ? "active" : ""}" data-gm-broadcast-player="${esc(p.id)}" ${draft.allPlayers ? "disabled" : ""}><span class="gm-target-check">${selected.has(String(p.id)) ? "✓" : ""}</span><b>${esc(sourceSheet(p.id)?.name || p.name || "PLAYER")}</b><small>${esc(p.name || "PLAYER")}</small></button>`).join("")}${players.length ? "" : `<div class="empty compact">NO OTHER ONLINE PLAYERS</div>`}</div>`;
}

async function syncDMTokenFrameToolState() {
  if (PREVIEW || !OBR) { runtime.dmFrameToolActive = false; return false; }
  try {
    const md = await OBR.player.getMetadata();
    runtime.dmFrameToolActive = !!md?.[TOKEN_FRAME_ACTIVE_KEY];
  } catch { runtime.dmFrameToolActive = false; }
  return runtime.dmFrameToolActive;
}
async function startDMTokenFrameTool() {
  if (runtime.currentPlayer.role !== "GM") return;
  if (PREVIEW || !OBR || !await OBR.scene.isReady()) return;
  try {
    runtime.dmFramePreviousTool = await OBR.tool.getActiveTool();
    runtime.dmFramePreviousMode = await OBR.tool.getActiveToolMode() || "";
    // Clear any old selection before arming the selection fallback so an item
    // that happened to be selected earlier is never framed by accident.
    try { await OBR.player.deselect(); } catch {}
    await OBR.player.setMetadata({ [TOKEN_FRAME_ACTIVE_KEY]: true });
    let dedicated = false, lastActivationError = null;
    for (let attempt = 0; attempt < 4 && !dedicated; attempt++) {
      try {
        await OBR.tool.activateMode(TOKEN_FRAME_TOOL_ID, TOKEN_FRAME_MODE_ID);
        dedicated = true;
      } catch (e) {
        lastActivationError = e;
        if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 120 * (attempt + 1)));
      }
    }
    if (!dedicated && lastActivationError) console.warn("dedicated dm frame mode unavailable; using selection fallback", lastActivationError);
    runtime.dmFrameToolActive = true;
    render();
  } catch (e) { console.warn("start dm token frame", e); }
}
async function stopDMTokenFrameTool() {
  if (PREVIEW || !OBR) { runtime.dmFrameToolActive = false; render(); return; }
  try { await OBR.player.setMetadata({ [TOKEN_FRAME_ACTIVE_KEY]: false }); } catch (e) { console.warn("disable dm token frame metadata", e); }
  try {
    const previousTool = String(runtime.dmFramePreviousTool || ""), previousMode = String(runtime.dmFramePreviousMode || "");
    if (previousTool && previousMode && previousMode !== TOKEN_FRAME_MODE_ID) await OBR.tool.activateMode(previousTool, previousMode);
  } catch (e) { console.warn("restore tool after dm token frame", e); }
  runtime.dmFrameToolActive = false;
  runtime.dmFramePreviousTool = "";
  runtime.dmFramePreviousMode = "";
  render();
}
async function removeDMTokenFrameFromSelected() {
  if (runtime.currentPlayer.role !== "GM") return;
  if (PREVIEW || !OBR || !await OBR.scene.isReady()) return;
  try {
    const ids = await OBR.player.getSelection();
    if (!ids?.length) return;
    const selected = await OBR.scene.items.getItems(ids);
    const token = selected.find(x => x.type === "IMAGE" && x.layer === "CHARACTER");
    if (!token) return;
    const frames = await OBR.scene.items.getItems(item => String(item?.metadata?.[TOKEN_FRAME_META_KEY] || "") === String(token.id));
    if (!frames.length) return;
    await OBR.scene.items.deleteItems(frames.map(x => x.id));
  } catch (e) { console.warn("remove dm token frame", e); }
}
function gmTokenFrameHTML() {
  const active = !!runtime.dmFrameToolActive;
  return `<section class="gm-module gm-token-frame-module"><div class="gm-module-head"><div><small>MAP TOKEN UTILITY</small><h3>DM TOKEN FRAME</h3></div><span>${active ? "ACTIVE" : "READY"}</span></div><div class="gm-token-frame-layout"><div class="gm-token-frame-preview"><img src="/token-frame.png" alt="DM token circular frame"><small>NATIVE WHITE CIRCLE · CLICK AGAIN TO REMOVE</small></div><div class="gm-token-frame-copy"><b>${active ? "FRAME MODE · NORMAL MOVE ENABLED" : "SAFE CLICK-TO-FRAME MODE"}</b><p>${active ? "Click a CHARACTER to add a frame. Click the same framed Character again to remove it. Clicking empty space or another item behaves normally, and you can drag tokens while this mode is active. Press Esc, switch Owlbear tools, or use STOP to cancel." : "Start the tool, then click Character tokens to toggle their frame. Normal selection and drag behavior stays available."}</p><div class="gm-token-frame-actions">${active ? `<button class="danger-soft" data-action="stop-dm-token-frame">STOP TOKEN FRAME TOOL</button>` : `<button class="primary" data-action="start-dm-token-frame">START TOKEN FRAME TOOL</button>`}<button class="mini-btn" data-action="remove-selected-token-frame">REMOVE FRAME · SELECTED TOKEN</button></div><div class="gm-broadcast-note">SAFE MODE: normal click/select/deselect and token dragging remain available. The frame stays behind and attached to its Character.</div></div></div></section>`;
}

function gmGroupCheckPlayers() {
  return allParty().filter(p => p.role !== "GM" || sameId(p.id,runtime.currentPlayer.id)).map(p => ({ ...p, sheet: sourceSheet(p.id) })).filter(p => p.sheet && !p.sheet.deleted);
}
function sanitizeGMGroupCheckDraft() {
  const gc = runtime.gmGroupCheck ||= defaultGMGroupCheckState(), d = gc.draft ||= defaultGMGroupCheckState().draft, players = gmGroupCheckPlayers(), ids = new Set(players.map(p=>String(p.id)));
  if (!ids.has(String(d.leaderId||""))) d.leaderId = players.find(p=>!p.offline)?.id || players[0]?.id || "";
  d.supporters = [...new Set((d.supporters||[]).map(String))].filter(id => ids.has(id) && !sameId(id,d.leaderId));
  return d;
}
function gmGroupCheckParticipantName(id) { const p=gmGroupCheckPlayers().find(x=>sameId(x.id,id)); return p?.sheet?.name || p?.name || "PLAYER"; }
function gmGroupCheckSupportBonus(active = runtime.gmGroupCheck?.active) { return active ? active.supporters.filter(x => active.results?.[String(x.id)]?.passed).length : 0; }
function gmGroupCheckBondBonus(active = runtime.gmGroupCheck?.active) { return active && gmGroupCheckSupportBonus(active) > 0 ? clamp(Number(active.bondBonus)||0,0,3) : 0; }
function gmGroupCheckAllResponded(active = runtime.gmGroupCheck?.active) { return !!active && active.supporters.length > 0 && active.supporters.every(x => !!active.results?.[String(x.id)]); }
function groupCheckOutcomeHTML(r) {
  if (!r) return `<span class="waiting">WAITING</span>`;
  return `<span class="${r.passed?"pass":"fail"}">${r.passed?"SUCCESS +1":"FAILED"}</span><small>${Number(r.total)||0}${r.critical?" · CRITICAL":r.fumble?" · FUMBLE":""}</small>`;
}
function gmGroupCheckHTML() {
  const d=sanitizeGMGroupCheckDraft(), players=gmGroupCheckPlayers(), active=runtime.gmGroupCheck?.active;
  if (active) {
    const supportBonus=gmGroupCheckSupportBonus(active), bondBonus=gmGroupCheckBondBonus(active), allDone=gmGroupCheckAllResponded(active), totalBonus=supportBonus+bondBonus, final=active.finalResult, bondLocked=active.status!=="support"||supportBonus<=0;
    const rows=active.supporters.map(x=>{const r=active.results?.[String(x.id)];return `<div class="gm-group-result-row"><div><b>${esc(x.name)}</b><small>${r?`${esc(active.attr1)} d${r.size1} + ${esc(active.attr2)} d${r.size2}${Number(r.mod)?` ${monsterSigned(Number(r.mod))}`:""}`:"SUPPORT CHECK · DL 10"}</small></div>${groupCheckOutcomeHTML(r)}</div>`}).join("") || `<div class="empty compact">GROUP CHECK REQUIRES AT LEAST ONE SUPPORTER</div>`;
    return `<section class="gm-module gm-group-check-module"><div class="gm-module-head"><div><small>COOPERATIVE CHECK · ACTIVE</small><h3>${esc(active.label)}</h3></div><span>${active.status === "complete" ? "COMPLETE" : active.status === "final-ready" ? "FINAL SENT" : allDone ? "SUPPORT READY" : "WAITING"}</span></div><div class="gm-group-active-head"><div><small>LEADER</small><b>${esc(active.leaderName)}</b></div><div><small>CHECK</small><b>${esc(active.attr1)} + ${esc(active.attr2)}${Number(active.mod)?` ${monsterSigned(Number(active.mod))}`:""}</b></div><div><small>FINAL DL</small><b>${Number(active.finalDL)||10}</b></div></div><div class="gm-group-results">${rows}</div><div class="gm-group-bonus-row"><div><small>SUCCESSFUL SUPPORTERS</small><b>+${supportBonus}</b></div><label><span>HIGHEST BOND · SUCCESSFUL SUPPORTER → LEADER</span><select data-gm-group-bond ${bondLocked?"disabled":""}>${[0,1,2,3].map(n=>`<option value="${n}" ${bondBonus===n?"selected":""}>${n?`+${n}`:"NONE"}</option>`).join("")}</select></label><div class="total"><small>FINAL BONUS</small><b>+${totalBonus}</b></div></div>${final?`<div class="gm-group-final-result ${final.passed?"pass":"fail"}"><small>FINAL RESULT · ${esc(final.leaderName||active.leaderName)}</small><b>${Number(final.total)||0} VS DL ${Number(active.finalDL)||10}</b><strong>${final.passed?"GROUP CHECK SUCCESS":"GROUP CHECK FAILED"}${final.critical?" · CRITICAL":final.fumble?" · FUMBLE":""}${Number(final.invokeBondBonus)?` · LEADER INVOKE BOND +${Number(final.invokeBondBonus)}`:""}</strong></div>`:active.status==="final-ready"?`<div class="gm-group-active-actions"><button class="primary" disabled>WAITING FOR LEADER FINAL CHECK</button><button class="danger-soft" data-action="cancel-group-check">CANCEL GROUP CHECK</button></div>`:`<div class="gm-group-active-actions"><button class="primary" data-action="send-group-check-final" ${allDone?"":"disabled"}>SEND FINAL TO LEADER · +${totalBonus}</button><button class="danger-soft" data-action="cancel-group-check">CANCEL GROUP CHECK</button></div>`}${final?`<div class="gm-group-active-actions"><button class="primary" data-action="reset-group-check">NEW GROUP CHECK</button></div>`:""}<div class="gm-broadcast-note">Support Check = same Attributes + common MOD, fixed DL 10. Each successful Supporter gives +1. Add only the single highest Bond strength among successful Supporters.</div></section>`;
  }
  const leaderOptions=players.map(p=>`<option value="${esc(p.id)}" ${sameId(d.leaderId,p.id)?"selected":""} ${p.offline?"disabled":""}>${esc(p.sheet?.name||p.name||"PLAYER")}${p.offline?" · OFFLINE":""}</option>`).join("");
  const supporters=players.filter(p=>!sameId(p.id,d.leaderId)).map(p=>{const chosen=d.supporters.some(id=>sameId(id,p.id));return `<button class="gm-group-supporter ${chosen?"active":""}" data-gm-group-supporter="${esc(p.id)}" ${p.offline?"disabled":""}><span>${chosen?"✓":""}</span><b>${esc(p.sheet?.name||p.name||"PLAYER")}</b><small>${p.offline?"OFFLINE":"SUPPORTER"}</small></button>`}).join("") || `<div class="empty compact">NO OTHER ONLINE PLAYER CHARACTERS</div>`;
  const attrOpts=(value)=>ATTRS.map(a=>`<option value="${a}" ${value===a?"selected":""}>${a}</option>`).join("");
  const onlineSupporterCount=players.filter(p=>!p.offline&&!sameId(p.id,d.leaderId)&&d.supporters.some(id=>sameId(id,p.id))).length;
  return `<section class="gm-module gm-group-check-module"><div class="gm-module-head"><div><small>COOPERATIVE CHECK</small><h3>GROUP CHECK · GM START</h3></div><span>READY</span></div><div class="gm-group-rule-strip"><b>SUPPORT DL 10</b><span>EACH SUCCESS +1</span><span>HIGHEST BOND ONLY</span><span>LEADER ROLLS FINAL</span></div><div class="gm-group-draft-grid"><label class="wide"><span>CHECK NAME</span><input data-gm-group-label maxlength="72" value="${esc(d.label)}" placeholder="e.g. Break the sealed gate"></label><label><span>ATTRIBUTE 1</span><select data-gm-group-attr1>${attrOpts(d.attr1)}</select></label><label><span>ATTRIBUTE 2</span><select data-gm-group-attr2>${attrOpts(d.attr2)}</select></label><label><span>COMMON MOD</span><input data-gm-group-mod type="number" min="-99" max="99" value="${Number(d.mod)||0}"></label><label><span>FINAL DL</span><input data-gm-group-dl type="number" min="1" max="99" value="${Number(d.finalDL)||10}"></label><label class="wide"><span>LEADER</span><select data-gm-group-leader>${leaderOptions||'<option value="">NO ONLINE PLAYERS</option>'}</select></label></div><div class="gm-broadcast-target-head"><div><b>SUPPORTERS</b><small>Each selected Player receives a Support Check prompt. At least one online Supporter is required.</small></div><button class="mini-btn" data-action="group-check-select-all">SELECT ALL</button></div><div class="gm-group-supporters">${supporters}</div><div class="gm-broadcast-actions"><button class="primary gm-send-broadcast" data-action="start-group-check" ${d.leaderId&&onlineSupporterCount>0?"":"disabled"}>START GROUP CHECK</button></div><div class="gm-broadcast-note">Bond Strength is stored on each Bond card (1–3). The GM still confirms which successful Supporter has an applicable Bond toward the Leader, then uses only the single highest Strength.</div></section>`;
}
async function startGMGroupCheck() {
  if (runtime.currentPlayer.role !== "GM") return;
  const d=sanitizeGMGroupCheckDraft(), leader=gmGroupCheckPlayers().find(p=>sameId(p.id,d.leaderId));
  if (!leader || leader.offline) return notify("Choose an online Leader");
  const online = new Map(gmGroupCheckPlayers().filter(p=>!p.offline).map(p=>[String(p.id),p]));
  const supporters=d.supporters.map(id=>online.get(String(id))).filter(Boolean).filter(p=>!sameId(p.id,leader.id)).map(p=>({id:String(p.id),name:p.sheet?.name||p.name||"PLAYER"}));
  if (!supporters.length) return notify("Choose at least one online Supporter");
  const active={id:uid(),label:String(d.label||"GROUP CHECK").trim()||"GROUP CHECK",attr1:d.attr1,attr2:d.attr2,mod:Number(d.mod)||0,finalDL:Number(d.finalDL)||10,leaderId:String(leader.id),leaderName:leader.sheet?.name||leader.name||"LEADER",supporters,results:{},bondBonus:0,status:"support",startedAt:Date.now(),finalResult:null};
  runtime.gmGroupCheck.active=active; saveGMGroupCheckState();
  const startPayload={...deepClone(active),senderId:runtime.currentPlayer.id,senderName:runtime.currentPlayer.name,time:Date.now()};await broadcast("group-check-start",startPayload);if(sameId(active.leaderId,runtime.currentPlayer.id)||active.supporters.some(p=>sameId(p.id,runtime.currentPlayer.id)))receiveEvent({type:"group-check-start","group-check-start":startPayload});
  showToast("GROUP CHECK",`${active.leaderName} · ${supporters.length} SUPPORTERS`,"message",false); render();
}
async function sendGMGroupCheckFinal() {
  const a=runtime.gmGroupCheck?.active; if(runtime.currentPlayer.role!=="GM"||!a||a.status!=="support")return;
  if(!gmGroupCheckAllResponded(a))return notify("Wait for all Support Checks first");
  const supportBonus=gmGroupCheckSupportBonus(a), bondBonus=gmGroupCheckBondBonus(a);
  a.bondBonus=bondBonus; a.status="final-ready"; saveGMGroupCheckState();
  const finalPayload={id:a.id,senderId:runtime.currentPlayer.id,senderName:runtime.currentPlayer.name,label:a.label,attr1:a.attr1,attr2:a.attr2,mod:a.mod,finalDL:a.finalDL,leaderId:a.leaderId,leaderName:a.leaderName,supportBonus,bondBonus,time:Date.now()};await broadcast("group-check-final-ready",finalPayload);if(sameId(a.leaderId,runtime.currentPlayer.id))receiveEvent({type:"group-check-final-ready","group-check-final-ready":finalPayload});
  showToast("GROUP CHECK","Final Check sent to Leader","message",false); render();
}
async function cancelGMGroupCheck() {
  const a=runtime.gmGroupCheck?.active;if(!a)return; await broadcast("group-check-cancel",{id:a.id,senderId:runtime.currentPlayer.id,time:Date.now()}); runtime.gmGroupCheck.active=null;saveGMGroupCheckState();render();
}
function resetGMGroupCheck() { runtime.gmGroupCheck.active=null;saveGMGroupCheckState();render(); }
async function rollGroupCheckSupport() {
  const x=runtime.overlay;if(x?.kind!=="group-check-support"||x.submitted)return;
  const sh=state;if(!sh||sh.deleted)return notify("Create a Character Sheet first");
  const size1=currentDie(sh,x.attr1),size2=currentDie(sh,x.attr2),d1=1+Math.floor(Math.random()*size1),d2=1+Math.floor(Math.random()*size2),mod=Number(x.mod)||0,total=d1+d2+mod;
  const fumble=d1===1&&d2===1,critical=!fumble&&d1===d2&&d1>=6,passed=critical||(!fumble&&total>=10);
  const result={id:String(x.id),senderId:runtime.currentPlayer.id,playerId:runtime.currentPlayer.id,playerName:runtime.currentPlayer.name,characterName:sh.name||runtime.currentPlayer.name,attr1:x.attr1,attr2:x.attr2,size1,size2,d1,d2,mod,total,critical,fumble,double:d1===d2&&!critical&&!fumble,passed,time:Date.now()};
  x.submitted=true;x.result=result;clearPendingGroupCheck(x.id);renderOverlay();playSound(critical?"critical":"roll");
  await broadcast("group-check-support-result",result);if(runtime.currentPlayer.role==="GM"){receiveEvent({type:"group-check-support-result","group-check-support-result":result});sendCompanionHudControl({type:"group-self-result",payload:result});}
}
async function rollGroupCheckFinal() {
  const x=runtime.overlay;if(x?.kind!=="group-check-final"||x.submitted)return;
  const sh=state;if(!sh||sh.deleted)return notify("Create a Character Sheet first");
  x.submitted=true; renderOverlay();
  const size1=currentDie(sh,x.attr1),size2=currentDie(sh,x.attr2),supportBonus=Number(x.supportBonus)||0,bondBonus=Number(x.bondBonus)||0,baseMod=Number(x.mod)||0,mod=baseMod+supportBonus+bondBonus,d1=1+Math.floor(Math.random()*size1),d2=1+Math.floor(Math.random()*size2),total=d1+d2+mod;
  const fumble=d1===1&&d2===1,critical=!fumble&&d1===d2&&d1>=6,passed=critical||(!fumble&&total>=Number(x.finalDL||10));
  const r={id:uid(),senderId:runtime.currentPlayer.id,senderName:runtime.currentPlayer.name,label:`${sh.name||runtime.currentPlayer.name} · GROUP CHECK FINAL`,rollStyle:"check",attr1:x.attr1,attr2:x.attr2,size1,size2,d1,d2,mod,total,invokeBaseMod:mod,invoke:{traitRerolls:0,traitName:"",bondUsed:false,bondName:"",bondStrength:0,bondBonus:0,log:[]},actorKind:"player",actorId:String(runtime.currentPlayer.id),frenzy:false,hr:null,damage:NaN,critical,fumble,double:d1===d2&&!critical&&!fumble,element:"none",detail:`${x.label||"GROUP CHECK"} · BASE MOD ${baseMod>=0?"+":""}${baseMod} · SUPPORT +${supportBonus} · BEST BOND +${bondBonus} · FINAL DL ${Number(x.finalDL)||10}`,groupCheck:true,groupCheckId:String(x.id),groupCheckPassed:passed,groupCheckDL:Number(x.finalDL)||10,time:Date.now()};
  runtime.lastRoll=r;recordCombatHistory("roll",`${r.label} · ${r.total} VS DL ${r.groupCheckDL} · ${passed?"SUCCESS":"FAILED"}${rollOutcomeText(r)?` · ${rollOutcomeText(r)}`:""}`,`roll:${r.id}`);pushFeed({kind:"roll",...r});clearPendingGroupCheck(x.id);broadcast("roll",r);await broadcast("group-check-final-result",{id:String(x.id),senderId:runtime.currentPlayer.id,leaderId:runtime.currentPlayer.id,leaderName:sh.name||runtime.currentPlayer.name,total,finalDL:r.groupCheckDL,passed,critical,fumble,d1,d2,size1,size2,mod,supportBonus,bondBonus,time:Date.now()});playSound(critical?"critical":"roll");showOverlay({kind:"roll",...r});
}
function gmTravelGroupOnlinePlayers() {
  const out = [], seen = new Set();
  const add = (p, adminPlayer = false) => {
    const id = String(p?.id || "");
    if (!id || seen.has(id)) return;
    seen.add(id);
    const sheet = sourceSheet(id);
    out.push({ id, name:String(sheet?.name || p?.name || (adminPlayer ? "ADMIN PLAYER" : "PLAYER")), adminPlayer:!!adminPlayer });
  };
  // The room GM may also have a playable character. Include the current GM as a
  // Travel Group member, while still excluding any other GM accounts from the player list.
  if (runtime.currentPlayer?.id) add(runtime.currentPlayer, runtime.currentPlayer.role === "GM");
  for (const p of runtime.party || []) {
    if (!p || sameId(p.id, runtime.currentPlayer.id) || p.role === "GM") continue;
    add(p, false);
  }
  return out;
}
function gmTravelGroupSetAdminChoice(group) {
  if (runtime.currentPlayer.role !== "GM") return;
  const active = runtime.gmTravelGroup?.active;
  if (!active) return;
  const g = String(group || "").toUpperCase();
  const me = String(runtime.currentPlayer.id || "");
  if (!me || !["A","B"].includes(g) || !active.players.some(p => sameId(p.id, me))) return;
  active.choices = active.choices || {};
  active.choices[me] = g;
  render();
}
function gmTravelGroupChoiceRowHTML(p, choices = {}) {
  const g = String(choices?.[p.id] || "");
  const isAdminSelf = runtime.currentPlayer.role === "GM" && sameId(p.id, runtime.currentPlayer.id);
  const detail = isAdminSelf ? (g ? `ADMIN PLAYER · YOU · SELECTED GROUP ${esc(g)}` : "ADMIN PLAYER · YOU · CHOOSE A OR B") : (g ? `SELECTED GROUP ${esc(g)}` : "WAITING FOR PLAYER");
  const control = isAdminSelf
    ? `<div class="gm-travel-admin-choice"><button class="mini-btn ${g === "A" ? "active" : ""}" data-action="travel-group-admin-choose-a">${g === "A" ? "✓ " : ""}A</button><button class="mini-btn ${g === "B" ? "active" : ""}" data-action="travel-group-admin-choose-b">${g === "B" ? "✓ " : ""}B</button></div>`
    : `<span class="${g ? "pass" : "waiting"}">${g ? `GROUP ${esc(g)}` : "WAITING"}</span>`;
  return `<div class="gm-group-result-row"><div><b>${esc(p.name)}</b><small>${detail}</small></div>${control}</div>`;
}
function gmTravelGroupEligibility() {
  const session = travelSession();
  if (!session) return { ok:false, reason:"NO ACTIVE TRAVEL SESSION", session:null, map:null, node:null, players:[] };
  if (session.splitActive) return { ok:false, reason:"SPLIT ALREADY ACTIVE", session, map:null, node:null, players:gmTravelGroupOnlinePlayers() };
  const cur = travelCurrentRef(session, "MAIN"), map = session.maps.find(x => String(x.id) === String(cur.mapId)), node = map?.nodes?.find(x => String(x.id) === String(cur.nodeId));
  const players = gmTravelGroupOnlinePlayers();
  if (!map || !node) return { ok:false, reason:"SET A CURRENT NODE FIRST", session, map, node, players };
  if (travelBranchCount(node) < 2) return { ok:false, reason:"CURRENT NODE NEEDS AT LEAST 2 ROUTES", session, map, node, players };
  if (!travelFrameId(session,"A") || !travelFrameId(session,"B")) return { ok:false, reason:"SET GROUP A AND GROUP B BLANKS FIRST", session, map, node, players };
  if (players.length < 2) return { ok:false, reason:"AT LEAST 2 TRAVEL MEMBERS ARE REQUIRED", session, map, node, players };
  return { ok:true, reason:"READY", session, map, node, players };
}
function gmTravelGroupHTML() {
  const active = runtime.gmTravelGroup?.active || null, eligibility = gmTravelGroupEligibility(), session = eligibility.session || travelSession();
  if (session?.splitActive) {
    const rows = gmTravelGroupOnlinePlayers().map(p => `<div class="gm-group-result-row"><div><b>${esc(p.name)}</b><small>TRAVEL MEMBER</small></div><span class="pass">GROUP ${esc(String(session.memberGroups?.[p.id] || "A"))}</span></div>`).join("");
    return `<section class="gm-module gm-group-check-module"><div class="gm-module-head"><div><small>NODE TRAVEL · ACTIVE</small><h3>TRAVEL GROUPS</h3></div><span>SPLIT ACTIVE</span></div><div class="gm-group-results">${rows || '<div class="empty compact">NO ONLINE PLAYERS</div>'}</div><div class="gm-broadcast-note">Group A and B continue to use their existing Travel Blanks and Node paths. Merge remains available when both groups reach the same Node.</div></section>`;
  }
  if (active) {
    const choices = active.choices || {}, rows = active.players.map(p => gmTravelGroupChoiceRowHTML(p, choices)).join("");
    const complete = active.players.length > 0 && active.players.every(p => ["A","B"].includes(String(choices[p.id]||"")));
    const hasA = active.players.some(p => choices[p.id] === "A"), hasB = active.players.some(p => choices[p.id] === "B"), canConfirm = complete && hasA && hasB;
    return `<section class="gm-module gm-group-check-module"><div class="gm-module-head"><div><small>NODE TRAVEL · PLAYER CHOICE</small><h3>TRAVEL GROUPS</h3></div><span>${complete ? (canConfirm ? "READY" : "NEED A + B") : "WAITING"}</span></div><div class="gm-group-active-head"><div><small>NODE</small><b>${esc(active.nodeName || "CURRENT NODE")}</b></div><div><small>RESPONDED</small><b>${active.players.filter(p=>choices[p.id]).length} / ${active.players.length}</b></div></div><div class="gm-group-results">${rows}</div><div class="gm-group-active-actions"><button class="primary" data-action="confirm-travel-group" ${canConfirm ? "" : "disabled"}>CONFIRM SPLIT</button><button class="danger-soft" data-action="cancel-travel-group">CANCEL</button></div><div class="gm-broadcast-note">Players choose A/B on their own screen; the Admin chooses A/B on the ADMIN PLAYER row here. Both groups must contain at least one member before the split can begin.</div></section>`;
  }
  return `<section class="gm-module gm-group-check-module"><div class="gm-module-head"><div><small>NODE TRAVEL</small><h3>TRAVEL GROUPS · GM START</h3></div><span>${eligibility.ok ? "READY" : "LOCKED"}</span></div><div class="gm-group-active-head"><div><small>SESSION</small><b>${esc(session?.name || "NO SESSION")}</b></div><div><small>CURRENT NODE</small><b>${esc(eligibility.node?.name || "NOT SET")}</b></div><div><small>TRAVEL MEMBERS</small><b>${eligibility.players.length}</b></div></div><div class="gm-broadcast-actions"><button class="primary gm-send-broadcast" data-action="start-travel-group" ${eligibility.ok ? "" : "disabled"}>ASK PLAYERS · CHOOSE A / B</button></div><div class="gm-broadcast-note">${esc(eligibility.reason)} · The old right-click Split command is disabled. The GM starts every split from here.</div></section>`;
}
async function startGMTravelGroup() {
  if (runtime.currentPlayer.role !== "GM") return;
  const e = gmTravelGroupEligibility(); if (!e.ok) return notify(e.reason);
  const active = { id:uid(), sessionId:String(e.session.id), sessionName:String(e.session.name || "TRAVEL"), mapId:String(e.map.id), nodeId:String(e.node.id), nodeName:String(e.node.name || "CURRENT NODE"), players:e.players.map(x=>({id:String(x.id),name:String(x.name)})), choices:{}, startedAt:Date.now() };
  runtime.gmTravelGroup = { active };
  const travelPrompt={...deepClone(active),senderId:runtime.currentPlayer.id,senderName:runtime.currentPlayer.name||"GAME MASTER",time:Date.now()};await broadcast("travel-group-choice-start",travelPrompt);if(active.players.some(p=>sameId(p.id,runtime.currentPlayer.id)))receiveEvent({type:"travel-group-choice-start","travel-group-choice-start":travelPrompt});
  showToast("TRAVEL GROUP", `${active.players.length} MEMBERS · CHOOSE A / B`, "message", false); render();
}
async function chooseTravelGroup(group) {
  const x = runtime.overlay; if (x?.kind !== "travel-group-choice") return;
  const g = String(group || "").toUpperCase(); if (!["A","B"].includes(g)) return;
  x.selected = g;
  savePendingTravelGroup({ ...deepClone(x), kind:undefined, selected:g });
  renderOverlay();
  const choice={id:String(x.id),senderId:runtime.currentPlayer.id,playerId:runtime.currentPlayer.id,playerName:state.name||runtime.currentPlayer.name||"PLAYER",group:g,time:Date.now()};await broadcast("travel-group-choice-result",choice);if(runtime.currentPlayer.role==="GM")receiveEvent({type:"travel-group-choice-result","travel-group-choice-result":choice});
}
async function cancelGMTravelGroup() {
  const active=runtime.gmTravelGroup?.active; if(runtime.currentPlayer.role!=="GM"||!active)return;
  runtime.gmTravelGroup.active=null; render();
  await broadcast("travel-group-choice-cancel", { id:String(active.id), senderId:runtime.currentPlayer.id, time:Date.now() });
}
function travelTokenFollowTimeout(promise, ms=2600) {
  return Promise.race([promise, new Promise((_,reject)=>setTimeout(()=>reject(new Error("linked token move timeout")),ms))]);
}
function travelProjectedTokenPosition(item, sourceFrame, targetFrame, fallbackIndex=0, fallbackCount=1) {
  const src=sourceFrame.bounds,dst=targetFrame.bounds,p=item?.position||src.center,srcLeft=src.center.x-src.width/2,srcTop=src.center.y-src.height/2,dstLeft=dst.center.x-dst.width/2,dstTop=dst.center.y-dst.height/2;
  const u=(Number(p.x)-srcLeft)/src.width,v=(Number(p.y)-srcTop)/src.height;
  if(Number.isFinite(u)&&Number.isFinite(v)&&u>=-.2&&u<=1.2&&v>=-.2&&v<=1.2)return{x:dstLeft+dst.width*clamp(u,.06,.94),y:dstTop+dst.height*clamp(v,.08,.92)};
  const count=Math.max(1,Number(fallbackCount)||1),cols=Math.max(1,Math.ceil(Math.sqrt(count))),row=Math.floor(fallbackIndex/cols),col=fallbackIndex%cols,rows=Math.ceil(count/cols);
  return{x:dstLeft+dst.width*((col+1)/(cols+1)),y:dstTop+dst.height*((row+1)/(rows+1))};
}
async function travelMoveLinkedPlayerTokens(session, assignments={}, mode="split") {
  if(runtime.currentPlayer.role!=="GM"||PREVIEW||!OBR||!session)return false;
  let ready=false;try{ready=await travelTokenFollowTimeout(OBR.scene.isReady(),1200);}catch{}if(!ready)return false;
  const records=[];for(const [ownerId,groupRaw] of Object.entries(assignments||{})){const group=String(groupRaw||"A").toUpperCase()==="B"?"B":"A",sheet=sourceSheet(ownerId),tokenId=String(sheet?.linkedTokenId||"").trim();if(tokenId)records.push({ownerId:String(ownerId),group,tokenId});}
  if(!records.length)return false;
  const ids=[...new Set(records.map(x=>x.tokenId))];
  let items=[];try{items=await travelTokenFollowTimeout(OBR.scene.items.getItems(ids),1800);}catch(e){console.warn("Travel linked token lookup",e);return false;}
  const byId=new Map(items.map(x=>[String(x.id),x])),needed=new Set(["MAIN",...records.map(x=>x.group)]),frames={};
  for(const slot of needed){const info=await travelEmbeddedFrameInfo(session,slot);if(info)frames[slot]=info;}
  if(!frames.MAIN)return false;
  const groupLists={A:records.filter(x=>x.group==="A"),B:records.filter(x=>x.group==="B")};
  const destinations=new Map();
  for(const rec of records){const item=byId.get(rec.tokenId);if(!item)continue;const sourceSlot=mode==="merge"?rec.group:"MAIN",targetSlot=mode==="merge"?"MAIN":rec.group,source=frames[sourceSlot],target=frames[targetSlot];if(!source||!target)continue;const list=groupLists[rec.group],idx=Math.max(0,list.findIndex(x=>x.tokenId===rec.tokenId));destinations.set(rec.tokenId,travelProjectedTokenPosition(item,source,target,idx,list.length));}
  if(!destinations.size)return false;
  try{await travelTokenFollowTimeout(OBR.scene.items.updateItems([...destinations.keys()],xs=>{for(const item of xs){const pos=destinations.get(String(item.id));if(pos)item.position=pos;}}),2200);return true;}catch(e){console.warn("Travel linked token move",e);return false;}
}
function travelScheduleLinkedPlayerTokens(session,assignments,mode) {
  const snapshot=deepClone(assignments||{});setTimeout(()=>{travelTokenFollowTimeout(travelMoveLinkedPlayerTokens(session,snapshot,mode),3000).catch(e=>console.warn("Travel linked token schedule",e));},0);
}
async function confirmGMTravelGroup() {
  if(runtime.currentPlayer.role!=="GM")return;const active=runtime.gmTravelGroup?.active;if(!active)return;
  const choices=active.choices||{},complete=active.players.length>0&&active.players.every(p=>["A","B"].includes(String(choices[p.id]||""))),hasA=active.players.some(p=>choices[p.id]==="A"),hasB=active.players.some(p=>choices[p.id]==="B");
  if(!complete)return notify("Wait for every player to choose A or B");if(!hasA||!hasB)return notify("Group A and Group B both need at least one player");
  const s=travelSession(active.sessionId),cur=travelCurrentRef(s,"MAIN"),m=s?.maps?.find(x=>String(x.id)===String(active.mapId)),n=m?.nodes?.find(x=>String(x.id)===String(active.nodeId));
  if(!s||s.splitActive||!m||!n||String(cur.mapId)!==String(active.mapId)||String(cur.nodeId)!==String(active.nodeId)||travelBranchCount(n)<2)return notify("Travel state changed · start group selection again");
  const assignments={};for(const p of active.players)assignments[String(p.id)]=String(choices[p.id]);
  for(const r of (n.embeddedTokens||[]))r.shown=false;s.splitActive=true;s.groups={A:{id:"A",current:deepClone(cur)},B:{id:"B",current:deepClone(cur)}};s.memberGroups={...assignments};for(const owner of Object.keys(s.memberLocations||{}))if(!s.memberGroups[owner])s.memberGroups[owner]="A";s.allyGroups={};for(const ally of (runtime.sceneMonsters||[]).filter(x=>x?.faction==="ally"))s.allyGroups[String(ally.id)]="A";runtime.travelControlGroup="A";
  runtime.gmTravelGroup.active=null;render();saveTravelState().catch(e=>console.warn("Travel group save",e));travelScheduleNodeTokenTransition(s,"MAIN",cur,null);setTimeout(()=>{travelScheduleNodeTokenTransition(s,"A",null,cur);travelScheduleNodeTokenTransition(s,"B",null,cur);},25);travelScheduleLinkedPlayerTokens(s,assignments,"split");
  await broadcast("travel-group-choice-complete",{id:String(active.id),senderId:runtime.currentPlayer.id,time:Date.now()});showToast("TRAVEL GROUP","Split active · linked player tokens moved with their groups","message",false);
}

function gmToolsHTML() {
  if (!gmShopStockLoaded()) ensureGMShopStockLoaded();
  const draft = runtime.gmBroadcastDraft, type = normalizeGMBroadcastType(draft.type);
  const targets = draft.allPlayers ? "ALL PLAYERS" : `${sanitizeGMBroadcastTargets().length} SELECTED`;
  const shopCount = gmShopStockLoaded() ? gmShopAllStock().length.toLocaleString() : "…";
  const tabs = `<div class="gm-tools-subtabs"><button class="${runtime.gmToolTab === "broadcast" ? "active" : ""}" data-gm-tool-tab="broadcast">BROADCAST</button><button class="${runtime.gmToolTab === "groupcheck" ? "active" : ""}" data-gm-tool-tab="groupcheck">GROUP CHECK</button><button class="${runtime.gmToolTab === "travelgroup" ? "active" : ""}" data-gm-tool-tab="travelgroup">TRAVEL GROUP</button><button class="${runtime.gmToolTab === "frame" ? "active" : ""}" data-gm-tool-tab="frame">TOKEN FRAME</button><button class="${runtime.gmToolTab === "shop" ? "active" : ""}" data-gm-tool-tab="shop">SHOP <span>${shopCount}</span></button></div>`;
  const broadcast = `<section class="gm-module broadcast-module"><div class="gm-module-head"><div><small>ROOM DIRECTIVE</small><h3>GM BROADCAST</h3></div><span>${targets}</span></div><div class="gm-broadcast-type-grid">${Object.entries(GM_BROADCAST_TYPES).map(([key,info]) => `<button class="gm-broadcast-type ${type === key ? "active" : ""} gm-type-${key}" data-gm-broadcast-type="${key}"><b>${esc(info.label)}</b><small>${esc(info.kicker)}</small></button>`).join("")}</div><div class="gm-broadcast-editor"><label><span>TITLE</span><input data-gm-broadcast-title maxlength="72" value="${esc(draft.title || gmBroadcastDefaultTitle(type))}" placeholder="${esc(gmBroadcastDefaultTitle(type))}"></label><label><span>MESSAGE</span><textarea data-gm-broadcast-body maxlength="600" placeholder="Type the message that will appear in the center of the players' screen...">${esc(draft.body || "")}</textarea></label></div><div class="gm-broadcast-target-head"><div><b>TARGET</b><small>Send to everyone or select multiple online players.</small></div><button class="mini-btn ${draft.allPlayers ? "" : "active"}" data-gm-broadcast-all>${draft.allPlayers ? "SELECT PLAYERS" : "USE ALL PLAYERS"}</button></div>${gmBroadcastTargetHTML()}<div class="gm-broadcast-actions"><button class="mini-btn" data-action="preview-gm-broadcast">PREVIEW</button><button class="primary gm-send-broadcast" data-action="send-gm-broadcast">SEND BROADCAST</button></div><div class="gm-broadcast-note">When a player's Fabula panel is open, the broadcast appears as a cinematic overlay. If it is closed, Owlbear opens the broadcast as a centered modal so the alert is not missed.</div></section>`;
  const content = runtime.gmToolTab === "shop" ? gmShopHTML() : runtime.gmToolTab === "frame" ? gmTokenFrameHTML() : runtime.gmToolTab === "groupcheck" ? gmGroupCheckHTML() : runtime.gmToolTab === "travelgroup" ? gmTravelGroupHTML() : broadcast;
  return `<div class="view active gm-tools-view"><section class="gm-tools-page"><div class="gm-tools-hero"><div><small>GAME MASTER ONLY</small><h2>GM TOOLS</h2><p>Private control modules for directing the room. Players never see this navigation tab.</p></div><span>GM</span></div>${tabs}${content}</section></div>`;
}
function currentGMBroadcastPayload() {
  const d = runtime.gmBroadcastDraft, type = normalizeGMBroadcastType(d.type), info = gmBroadcastTypeInfo(type);
  const targets = d.allPlayers ? ["ALL_PLAYERS"] : sanitizeGMBroadcastTargets();
  return { id: uid(), senderId: runtime.currentPlayer.id, senderName: runtime.currentPlayer.name || "GAME MASTER", broadcastType: type, title: String(d.title || info.label).trim().slice(0,72) || info.label, body: String(d.body || "").trim().slice(0,600), targets, time: Date.now() };
}
function previewGMBroadcast() {
  if (runtime.currentPlayer.role !== "GM") return;
  const payload = currentGMBroadcastPayload();
  showOverlay({ kind: "gm-broadcast", ...payload });
  playSound(gmBroadcastTypeInfo(payload.broadcastType).sound);
}
async function sendGMBroadcast() {
  if (runtime.currentPlayer.role !== "GM") return notify("Only the GM can use GM Broadcast");
  const payload = currentGMBroadcastPayload();
  if (!payload.targets.length) return notify("Select at least one online player");
  const sent = await broadcast("gm-broadcast", payload);
  if (!sent) return notify("Broadcast failed. Try again.");
  const info = gmBroadcastTypeInfo(payload.broadcastType);
  playSound(info.sound);
  showOverlay({ kind: "gm-broadcast", ...payload });
  showToast("GM BROADCAST", `${info.label} · ${payload.targets.includes("ALL_PLAYERS") ? "ALL PLAYERS" : `${payload.targets.length} TARGETS`}`, "message", false);
}


// ─────────────────────────────────────────────────────────────────────────────
// v2.115 · TRAVEL SEMANTIC ZOOM + COLLAPSIBLE SIDEBAR + GM PLAYER-RULE WALK MODE
// Node graph lives in the extension UI. The visible scene background is an
// each Node owns a Background IMAGE source. One reusable blank MAP rectangle is
// replaced visually by the current Node background while keeping the same bounds.
// ─────────────────────────────────────────────────────────────────────────────
function travelUid(prefix = "travel") { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`; }
function normalizeTravelApprovalRequest(raw={}) {
  return {requestId:String(raw.requestId||""),senderId:String(raw.senderId||""),senderName:String(raw.senderName||"PLAYER"),sessionId:String(raw.sessionId||""),groupId:String(raw.groupId||"MAIN"),fromMapId:String(raw.fromMapId||""),fromNodeId:String(raw.fromNodeId||""),fromMapName:String(raw.fromMapName||""),fromName:String(raw.fromName||"CURRENT NODE"),targetMapId:String(raw.targetMapId||""),targetNodeId:String(raw.targetNodeId||""),targetMapName:String(raw.targetMapName||""),targetName:String(raw.targetName||"TARGET NODE"),time:Number(raw.time)||Date.now()};
}
function normalizeTravelApprovalState(raw={}) {
  const seen=new Set(),requests=[];for(const x of (Array.isArray(raw?.requests)?raw.requests:[])){const r=normalizeTravelApprovalRequest(x);if(!r.requestId||seen.has(r.requestId))continue;seen.add(r.requestId);requests.push(r);}
  return {enabled:!!raw?.enabled,revision:Math.max(0,Number(raw?.revision)||0),requests:requests.slice(-30)};
}
function travelApprovalEnabled(){return !!runtime.travelApproval?.enabled;}
function travelApprovalFirstRequest(){return normalizeTravelApprovalState(runtime.travelApproval).requests[0]||null;}
function maybeShowTravelApprovalRequest(){
  if(runtime.currentPlayer.role!=="GM")return;const req=travelApprovalFirstRequest();
  if(!req){if(runtime.overlay?.kind==="travel-move-approval"){runtime.overlay=null;runtime.travelApprovalDeciding="";renderOverlay();}return;}
  if(runtime.overlay&&runtime.overlay.kind!=="travel-move-approval")return;
  if(runtime.overlay?.kind==="travel-move-approval"&&String(runtime.overlay?.request?.requestId||"")===String(req.requestId))return;
  runtime.overlay={kind:"travel-move-approval",request:req};renderOverlay();
}
async function setTravelApprovalMode(enabled){
  if(runtime.currentPlayer.role!=="GM")return;enabled=!!enabled;
  if(PREVIEW||!runtime.online){runtime.travelApproval={...normalizeTravelApprovalState(runtime.travelApproval),enabled,revision:(Number(runtime.travelApproval?.revision)||0)+1};render();return;}
  try{if(!await OBR.scene.isReady())return;const md=await OBR.scene.getMetadata(),cur=normalizeTravelApprovalState(md[SCENE_TRAVEL_APPROVAL_KEY]);cur.enabled=enabled;cur.revision=Math.max(cur.revision,Number(runtime.travelApproval?.revision)||0)+1;await OBR.scene.setMetadata({[SCENE_TRAVEL_APPROVAL_KEY]:deepClone(cur)});runtime.travelApproval=cur;await broadcast("travel-move-approval-mode",{senderId:runtime.currentPlayer.id,enabled,revision:cur.revision,time:Date.now()});showToast("TRAVEL APPROVAL",enabled?"Players must request every move":"Players can move without manual approval","message",false);render();if(enabled)maybeShowTravelApprovalRequest();}
  catch(e){console.warn("travel approval mode",e);notify("Could not change Travel Approval Mode");}
}
function travelMarkPendingApproval(req={}){
  const id=String(req.requestId||"");if(!id)return;for(const rec of Object.values(runtime.travelMovePending||{})){if(String(rec?.requestId||"")!==id)continue;if(rec.timer)clearTimeout(rec.timer);rec.awaitingApproval=true;rec.timer=setTimeout(async()=>{const live=Object.values(runtime.travelMovePending||{}).find(x=>String(x?.requestId||"")===id);if(!live)return;travelFinishMoveRequest(id,false,"");notify("Travel request is still waiting for GM approval");if(runtime.view==="travel")render();},120000);}
}
async function decideTravelApproval(requestId,approved){
  if(runtime.currentPlayer.role!=="GM"||!requestId)return;runtime.travelApprovalDeciding=String(requestId);renderOverlay();
  await broadcast("travel-move-approval-decision",{requestId:String(requestId),approved:!!approved,senderId:runtime.currentPlayer.id,senderName:runtime.currentPlayer.name||"GAME MASTER",time:Date.now()});
  setTimeout(()=>{if(runtime.travelApprovalDeciding===String(requestId)){runtime.travelApprovalDeciding="";maybeShowTravelApprovalRequest();}},2500);
}
function blankTravelState() { return { version: 1, revision: 0, activeSessionId: "", sessions: [] }; }
function blankTravelSession(name = "TRAVEL SESSION") {
  const mapId = travelUid("map"), current = { mapId, nodeId: "" };
  return {
    id: travelUid("session"), name, frameId: "", groupFrameIds: { A:"", B:"" }, splitActive:false,
    current: deepClone(current), groups:{ A:{id:"A",current:deepClone(current)}, B:{id:"B",current:deepClone(current)} }, memberGroups:{}, allyGroups:{},
    discoveredMaps: [mapId], discoveredNodes: { [mapId]: [] }, memberLocations: {}, maps: [{ id: mapId, name: "MAP 1", itemId: "", nodes: [] }]
  };
}
function travelLinkKey(mapId,nodeId){ return `${String(mapId||"")}|${String(nodeId||"")}`; }
function travelNodeLinks(node){
  const seen=new Set(), out=[];
  for(const x of Object.values(node?.links||{})){
    const mapId=String(x?.mapId||""),nodeId=String(x?.nodeId||"");if(!mapId||!nodeId)continue;
    const key=travelLinkKey(mapId,nodeId);if(seen.has(key))continue;seen.add(key);out.push({mapId,nodeId});
  }
  return out;
}
function normalizeTravelImageSnapshot(raw = {}) {
  const url=String(raw?.url||""), mime=String(raw?.mime||""), name=String(raw?.name||"");
  const width=Math.max(0,Number(raw?.width)||0),height=Math.max(0,Number(raw?.height)||0);
  return url ? {url,mime:mime||"image/png",width,height,name} : null;
}
function travelImageSnapshot(item) {
  if(!item||item.type!=="IMAGE"||!item.image?.url)return null;
  return normalizeTravelImageSnapshot({url:item.image.url,mime:item.image.mime,width:item.image.width,height:item.image.height,name:item.name||""});
}
function normalizeTravelTokenTemplate(raw = {}) {
  const src=raw?.template||raw?.tokenTemplate||raw, imageRaw=src?.image||{}, url=String(imageRaw?.url||"").trim();
  if(!url)return null;
  const width=Math.max(1,Number(imageRaw.width)||300),height=Math.max(1,Number(imageRaw.height)||300),gridRaw=src?.grid||{},off=gridRaw.offset||{};
  return {name:String(src?.name||"TOKEN"),image:{url,width,height,mime:String(imageRaw.mime||"image/png")},grid:{dpi:Math.max(1,Number(gridRaw.dpi)||Math.max(width,height)),offset:{x:Number.isFinite(Number(off.x))?Number(off.x):width/2,y:Number.isFinite(Number(off.y))?Number(off.y):height/2}}};
}
function travelTokenTemplateFromItem(item) {
  if(!item?.image?.url)return null;
  return normalizeTravelTokenTemplate({name:item.name||"TOKEN",image:item.image,grid:item.grid});
}
function normalizeTravelEmbeddedToken(raw = {}) {
  const scaleRaw=raw?.scale&&typeof raw.scale==="object"?raw.scale:{},u=Number(raw?.u),v=Number(raw?.v),rw=Number(raw?.refWidth),rh=Number(raw?.refHeight),rot=Number(raw?.rotation);
  return {id:String(raw?.id||travelUid("embed")),itemId:String(raw?.itemId||raw?.tokenId||""),name:String(raw?.name||"TOKEN"),template:normalizeTravelTokenTemplate(raw?.template||raw?.tokenTemplate||{}),u:Number.isFinite(u)?u:.5,v:Number.isFinite(v)?v:.5,refWidth:Math.max(1,Number.isFinite(rw)?rw:1),refHeight:Math.max(1,Number.isFinite(rh)?rh:1),rotation:Number.isFinite(rot)?rot:0,scale:{x:Number(scaleRaw.x)||1,y:Number(scaleRaw.y)||1},shown:!!raw?.shown,lastSlot:String(raw?.lastSlot||"")};
}
function normalizeTravelNodeState(raw = {}, index = 0) {
  return {
    id: String(raw?.id || travelUid("state")),
    name: String(raw?.name || `STATE ${index + 1}`),
    backgroundItemId: String(raw?.backgroundItemId || raw?.bgItemId || ""),
    backgroundSnapshot: normalizeTravelImageSnapshot(raw?.backgroundSnapshot || raw?.bgSnapshot || raw?.backgroundImageSnapshot || {}),
    previewUrl: String(raw?.previewUrl || "")
  };
}
function normalizeTravelNode(raw = {}) {
  const links = {};
  const incoming=[];
  if(raw?.links&&typeof raw.links==="object") incoming.push(...Object.values(raw.links));
  if(Array.isArray(raw?.connections)) incoming.push(...raw.connections);
  for (const x of incoming) {
    if (!x?.mapId || !x?.nodeId) continue;
    const mapId=String(x.mapId),nodeId=String(x.nodeId);links[travelLinkKey(mapId,nodeId)]={mapId,nodeId};
  }
  const xNum = Number(raw.x), yNum = Number(raw.y);
  const states = (Array.isArray(raw?.states) ? raw.states : []).map(normalizeTravelNodeState);
  const stateIds = new Set(states.map(x => x.id));
  const activeStateId = stateIds.has(String(raw?.activeStateId || "")) ? String(raw.activeStateId) : "";
  return { id: String(raw.id || travelUid("node")), name: String(raw.name || "NEW NODE"), detail: String(raw.detail || ""), unlockRule: String(raw.unlockRule || ""), previewUrl: String(raw.previewUrl || ""), backgroundItemId: String(raw.backgroundItemId || raw.bgItemId || ""), backgroundSnapshot: normalizeTravelImageSnapshot(raw.backgroundSnapshot || raw.bgSnapshot || raw.backgroundImageSnapshot || {}), states, activeStateId, embeddedTokens: (Array.isArray(raw.embeddedTokens)?raw.embeddedTokens:[]).map(normalizeTravelEmbeddedToken).filter(x=>x.itemId||x.template?.image?.url), x: Number.isFinite(xNum) ? xNum : 50, y: Number.isFinite(yNum) ? yNum : 50, locked: !!raw.locked, secret: !!raw.secret, links };
}
function normalizeTravelMap(raw = {}, index = 0) {
  return { id: String(raw.id || travelUid("map")), name: String(raw.name || `MAP ${index+1}`), itemId: String(raw.itemId || ""), nodes: (Array.isArray(raw.nodes) ? raw.nodes : []).map(normalizeTravelNode) };
}
function normalizeTravelSession(raw = {}, index = 0) {
  let maps = (Array.isArray(raw.maps) ? raw.maps : []).map(normalizeTravelMap);
  if (!maps.length) maps = [normalizeTravelMap({ name: "MAP 1" }, 0)];
  const ids = new Set(maps.map(x => x.id));
  const first = maps[0];
  let mapId = String(raw?.current?.mapId || first.id); if (!ids.has(mapId)) mapId = first.id;
  const currentMap = maps.find(x => x.id === mapId) || first;
  let nodeId = String(raw?.current?.nodeId || ""); if (nodeId && !currentMap.nodes.some(x => x.id === nodeId)) nodeId = "";
  const discoveredMaps = [...new Set((Array.isArray(raw.discoveredMaps) ? raw.discoveredMaps : [mapId]).map(String).filter(x => ids.has(x)))];
  if (!discoveredMaps.includes(mapId)) discoveredMaps.push(mapId);
  const discoveredNodes = {};
  for (const m of maps) {
    const valid = new Set(m.nodes.map(n => n.id));
    discoveredNodes[m.id] = [...new Set((Array.isArray(raw?.discoveredNodes?.[m.id]) ? raw.discoveredNodes[m.id] : []).map(String).filter(x => valid.has(x)))];
  }
  if (nodeId && !discoveredNodes[mapId].includes(nodeId)) discoveredNodes[mapId].push(nodeId);
  const memberLocations = {};
  const rawLocations = raw?.memberLocations && typeof raw.memberLocations === "object" ? raw.memberLocations : {};
  for (const [ownerId, rec] of Object.entries(rawLocations)) {
    const mid = String(rec?.mapId || ""), nid = String(rec?.nodeId || "");
    const mm = maps.find(x => x.id === mid);
    if (!mm || !mm.nodes.some(x => x.id === nid)) continue;
    memberLocations[String(ownerId)] = { ownerId: String(ownerId), mapId: mid, nodeId: nid, name: String(rec?.name || rec?.characterName || "CHARACTER"), portrait: String(rec?.portrait || ""), updatedAt: Number(rec?.updatedAt) || 0 };
  }
  const normalizeCurrent = rec => {
    let mid=String(rec?.mapId||mapId); if(!ids.has(mid))mid=mapId; const mm=maps.find(x=>x.id===mid)||first;
    let nid=String(rec?.nodeId||""); if(nid&&!mm.nodes.some(x=>x.id===nid))nid=""; return {mapId:mid,nodeId:nid};
  };
  const groupFrameIds = { A:String(raw?.groupFrameIds?.A||raw?.frameIds?.A||""), B:String(raw?.groupFrameIds?.B||raw?.frameIds?.B||"") };
  const splitActive=!!raw.splitActive;
  const groups={ A:{id:"A",current:normalizeCurrent(raw?.groups?.A?.current||raw?.groups?.A||{mapId,nodeId})}, B:{id:"B",current:normalizeCurrent(raw?.groups?.B?.current||raw?.groups?.B||{mapId,nodeId})} };
  const memberGroups={}; for(const [ownerId,g] of Object.entries(raw?.memberGroups||{})){const gg=String(g||"").toUpperCase();if(gg==="A"||gg==="B")memberGroups[String(ownerId)]=gg;}
  const allyGroups={}; for(const [allyId,g] of Object.entries(raw?.allyGroups||{})){const gg=String(g||"").toUpperCase();if(gg==="A"||gg==="B")allyGroups[String(allyId)]=gg;}
  if(splitActive){ const a=groups.A.current; if(a.nodeId && !(discoveredNodes[a.mapId]||[]).includes(a.nodeId)) discoveredNodes[a.mapId].push(a.nodeId); const b=groups.B.current; if(b.nodeId && !(discoveredNodes[b.mapId]||[]).includes(b.nodeId)) discoveredNodes[b.mapId].push(b.nodeId); }
  return { id: String(raw.id || travelUid("session")), name: String(raw.name || `TRAVEL SESSION ${index+1}`), frameId: String(raw.frameId || ""), groupFrameIds, splitActive, current: { mapId, nodeId }, groups, memberGroups, allyGroups, discoveredMaps, discoveredNodes, memberLocations, maps };
}
function normalizeTravelState(raw) {
  const sessions = (Array.isArray(raw?.sessions) ? raw.sessions : []).map(normalizeTravelSession);
  // v2.117 migration: every route is an undirected graph edge. Old LEFT/RIGHT/FORWARD/BACK
  // links are preserved, deduplicated and mirrored automatically.
  for(const s of sessions){
    for(const m of s.maps||[])for(const n of m.nodes||[])for(const l of travelNodeLinks(n)){
      const tm=s.maps.find(x=>String(x.id)===String(l.mapId)),tn=tm?.nodes?.find(x=>String(x.id)===String(l.nodeId));
      if(!tn||String(tn.id)===String(n.id)&&String(tm.id)===String(m.id))continue;
      tn.links ||= {};tn.links[travelLinkKey(m.id,n.id)]={mapId:String(m.id),nodeId:String(n.id)};
    }
  }
  let activeSessionId = String(raw?.activeSessionId || sessions[0]?.id || "");
  if (activeSessionId && !sessions.some(x => x.id === activeSessionId)) activeSessionId = sessions[0]?.id || "";
  return { version: 1, revision: Math.max(0, Number(raw?.revision) || 0), activeSessionId, sessions };
}
function travelState() { if (!runtime.travel) runtime.travel = blankTravelState(); return runtime.travel; }
function travelSession(id = travelState().activeSessionId) { return travelState().sessions.find(x => x.id === id) || null; }
function travelGMUsesPlayerRules() { return runtime.currentPlayer.role === "GM" && !!runtime.travelGMPlayerMode; }
function travelViewerGroupId(session = travelSession()) {
  if(!session?.splitActive) return "MAIN";
  if(runtime.currentPlayer.role === "GM") {
    if (travelGMUsesPlayerRules()) {
      const own = String(session.memberGroups?.[runtime.currentPlayer.id] || "");
      if (["A","B"].includes(own)) return own;
    }
    return ["A","B"].includes(runtime.travelControlGroup) ? runtime.travelControlGroup : "A";
  }
  return ["A","B"].includes(String(session.memberGroups?.[runtime.currentPlayer.id]||"")) ? String(session.memberGroups[runtime.currentPlayer.id]) : "A";
}
function travelCurrentRef(session = travelSession(), groupId = travelViewerGroupId(session)) {
  if(!session) return {mapId:"",nodeId:""};
  if(!session.splitActive || groupId === "MAIN") return session.current || {mapId:"",nodeId:""};
  return session.groups?.[groupId]?.current || session.current || {mapId:"",nodeId:""};
}
function travelSetCurrentRef(session, groupId, current) {
  if(!session) return; const next={mapId:String(current?.mapId||""),nodeId:String(current?.nodeId||"")};
  if(!session.splitActive || groupId === "MAIN") { session.current=next; return; }
  session.groups ||= {A:{id:"A",current:deepClone(session.current)},B:{id:"B",current:deepClone(session.current)}}; session.groups[groupId] ||= {id:groupId,current:deepClone(session.current)}; session.groups[groupId].current=next;
  if(groupId==="A") session.current=deepClone(next); // legacy/current fallback follows A while split
}
function travelFrameId(session, slot="MAIN") { return slot==="MAIN"?String(session?.frameId||""):String(session?.groupFrameIds?.[slot]||""); }
function travelSetFrameId(session, slot, id) { if(!session)return; if(slot==="MAIN")session.frameId=String(id||""); else {session.groupFrameIds||={A:"",B:""};session.groupFrameIds[slot]=String(id||"");} }
function travelAllFrameIds(session){return [travelFrameId(session,"MAIN"),travelFrameId(session,"A"),travelFrameId(session,"B")].filter(Boolean);}
function travelMap(session = travelSession(), id = runtime.travelEditorMapId || travelCurrentRef(session)?.mapId) { return session?.maps?.find(x => x.id === id) || session?.maps?.[0] || null; }
function travelNode(session = travelSession(), mapId = travelCurrentRef(session)?.mapId, nodeId = travelCurrentRef(session)?.nodeId) { return session?.maps?.find(x => x.id === mapId)?.nodes?.find(x => x.id === nodeId) || null; }
function travelAllNodes(session) { return (session?.maps || []).flatMap(m => (m.nodes || []).map(n => ({ map:m,node:n }))); }
function travelMapItemById(id) { const key=String(id||""); return runtime.travelMapItemIndex?.get?.(key) || runtime.travelMapItems.find(x => String(x.id) === key) || null; }
function travelMapItemName(item) { return item ? String(item.name || item.image?.url?.split('/').pop() || item.id).slice(0,80) : "UNLINKED"; }
function travelNodeActiveState(node) {
  const id=String(node?.activeStateId||"");
  return id ? (node?.states||[]).find(x=>String(x?.id||"")===id)||null : null;
}
function travelNodeBackgroundId(map, node) {
  const st=travelNodeActiveState(node);
  return String(st?.backgroundItemId || node?.backgroundItemId || map?.itemId || "");
}
function travelNodeBackgroundSnapshot(node) {
  const st=travelNodeActiveState(node);
  return normalizeTravelImageSnapshot(st?.backgroundSnapshot || node?.backgroundSnapshot || {});
}
function travelNodePreviewURL(map, node) {
  const st=travelNodeActiveState(node);
  if(st){const stateItem=travelMapItemById(st.backgroundItemId),stateSnap=normalizeTravelImageSnapshot(st.backgroundSnapshot||{});return String(st.previewUrl||stateItem?.image?.url||stateSnap?.url||node?.previewUrl||travelMapItemById(travelNodeBackgroundId(map,node))?.image?.url||travelNodeBackgroundSnapshot(node)?.url||"");}
  const id=travelNodeBackgroundId(map,node),snap=travelNodeBackgroundSnapshot(node);return String(node?.previewUrl||travelMapItemById(id)?.image?.url||snap?.url||"");
}
function travelBackgroundIds(state = travelState()) {
  return [...new Set((state?.sessions||[]).flatMap(ss => (ss.maps||[]).flatMap(m => [m.itemId, ...(m.nodes||[]).flatMap(n=>[n.backgroundItemId,...(n.states||[]).map(st=>st.backgroundItemId)])].filter(Boolean))).map(String))];
}
function travelWasVisited(session, mapId, nodeId) {
  return (session?.discoveredNodes?.[mapId] || []).map(String).includes(String(nodeId||""));
}
// v3.0.41 · Route Memory
// A player remembers every immediate route exposed by a Node they have already visited.
// This keeps branch Nodes visible after the party walks away without revealing anything
// beyond the first unvisited step. Unknown routes behind an unvisited Node stay hidden.
function travelPlayerKnowsNode(session, mapId, nodeId) {
  const targetMapId=String(mapId||""), targetNodeId=String(nodeId||"");
  if(!session||!targetMapId||!targetNodeId)return false;
  if(travelWasVisited(session,targetMapId,targetNodeId))return true;
  const visited=session?.discoveredNodes&&typeof session.discoveredNodes==="object"?session.discoveredNodes:{};
  for(const [visitedMapId,ids] of Object.entries(visited)){
    const vm=(session.maps||[]).find(m=>String(m.id)===String(visitedMapId));
    if(!vm)continue;
    for(const visitedNodeId of (Array.isArray(ids)?ids:[])){
      const vn=(vm.nodes||[]).find(n=>String(n.id)===String(visitedNodeId));
      if(!vn)continue;
      if(travelNodeLinks(vn).some(l=>String(l?.mapId)===targetMapId&&String(l?.nodeId)===targetNodeId))return true;
    }
  }
  return false;
}
function travelPlayerKnowsMap(session,mapId){
  const id=String(mapId||"");
  if(!session||!id)return false;
  if((session.discoveredMaps||[]).map(String).includes(id))return true;
  const map=(session.maps||[]).find(m=>String(m.id)===id);
  return !!map&&(map.nodes||[]).some(n=>travelPlayerKnowsNode(session,id,n.id));
}
function travelKnownMap(session, mapId) { return runtime.currentPlayer.role === "GM" || travelPlayerKnowsMap(session,mapId); }
function travelKnownNode(session, mapId, nodeId) { return runtime.currentPlayer.role === "GM" || travelPlayerKnowsNode(session,mapId,nodeId); }
function travelReveal(session, mapId, nodeId = "") {
  session.discoveredMaps ||= []; if (!session.discoveredMaps.includes(mapId)) session.discoveredMaps.push(mapId);
  session.discoveredNodes ||= {}; session.discoveredNodes[mapId] ||= [];
  if (nodeId && !session.discoveredNodes[mapId].includes(nodeId)) session.discoveredNodes[mapId].push(nodeId);
}
function travelLocalCharacterMarker() {
  const s = sourceSheet(runtime.currentPlayer.id) || state;
  if (!s || s.deleted) return null;
  return { ownerId: String(runtime.currentPlayer.id), name: String(s.name || runtime.currentPlayer.name || "CHARACTER"), portrait: String(s.portrait || "") };
}
function travelPlayerExplorerRecords(session) {
  const out = [], seen = new Set();
  for (const p of allParty()) {
    const ownerId = String(p?.id || ""); if (!ownerId || seen.has(ownerId)) continue;
    const sh = sourceSheet(ownerId); if (!sh || sh.deleted) continue;
    seen.add(ownerId);
    const manual = session?.memberLocations?.[ownerId];
    const groupId = session?.splitActive ? String(session?.memberGroups?.[ownerId] || "A") : "MAIN";
    const cur = manual?.mapId && manual?.nodeId ? manual : travelCurrentRef(session, groupId);
    if (!cur?.mapId || !cur?.nodeId) continue;
    out.push({ ownerId, kind:"player", groupId, mapId:String(cur.mapId), nodeId:String(cur.nodeId), name:String(sh.name || p?.name || "PLAYER"), portrait:String(sh.portrait || "") });
  }
  // Keep a manually placed marker visible even if that character is currently
  // offline or no longer present in the live party collection.
  for (const rec of Object.values(session?.memberLocations || {})) {
    const ownerId = String(rec?.ownerId || ""); if (!ownerId || seen.has(ownerId)) continue;
    seen.add(ownerId);
    const groupId = session?.splitActive ? String(session?.memberGroups?.[ownerId] || "A") : "MAIN";
    out.push({ ownerId, kind:"player", groupId, mapId:String(rec?.mapId || ""), nodeId:String(rec?.nodeId || ""), name:String(rec?.name || "PLAYER"), portrait:String(rec?.portrait || "") });
  }
  return out;
}
function travelAllyExplorerRecords(session) {
  return (runtime.sceneMonsters || []).filter(m => m?.faction === "ally" && !isMonsterDefeated(m)).map(m => {
    const v = monsterPhaseView(m, "active"), groupId = session?.splitActive ? String(session?.allyGroups?.[m.id] || "A") : "MAIN";
    const cur = travelCurrentRef(session, groupId);
    return { ownerId:`ally:${m.id}`, allyId:String(m.id), kind:"ally", groupId, mapId:String(cur?.mapId || ""), nodeId:String(cur?.nodeId || ""), name:String(v?.name || m?.name || "ALLY"), portrait:String(v?.portrait || m?.portrait || "") };
  }).filter(x => x.mapId && x.nodeId);
}
const TRAVEL_MARKER_MOVE_MS = 440;
function travelMovingExplorerIds(sessionId = travelSession()?.id) {
  const sid=String(sessionId||""),now=Date.now(),out=new Set();
  runtime.travelMarkerMotions=(runtime.travelMarkerMotions||[]).filter(m=>Number(m?.endsAt||0)>now);
  for(const m of runtime.travelMarkerMotions){if(String(m?.sessionId||"")!==sid)continue;for(const x of m.members||[])out.add(String(x?.ownerId||""));}
  return out;
}
function travelStartMarkerMotionFx(payload={}) {
  const s=travelSession(String(payload.sessionId||"")); if(!s)return false;
  const groupId=s.splitActive&&["A","B"].includes(String(payload.groupId||""))?String(payload.groupId):"MAIN";
  const from={mapId:String(payload.fromMapId||""),nodeId:String(payload.fromNodeId||"")},to={mapId:String(payload.targetMapId||""),nodeId:String(payload.targetNodeId||"")};
  if(!from.mapId||!from.nodeId||!to.mapId||!to.nodeId||from.mapId!==to.mapId)return false;
  const map=s.maps?.find(m=>String(m.id)===from.mapId),a=map?.nodes?.find(n=>String(n.id)===from.nodeId),b=map?.nodes?.find(n=>String(n.id)===to.nodeId);if(!map||!a||!b)return false;
  const fxId=String(payload.fxId||payload.requestId||`${s.id}|${groupId}|${from.nodeId}|${to.nodeId}|${Math.floor(Number(payload.time||Date.now())/250)}`);
  if((runtime.travelMarkerMotions||[]).some(m=>String(m.fxId)===fxId))return true;
  const records=[...travelPlayerExplorerRecords(s),...travelAllyExplorerRecords(s)];
  let members=records.filter(x=>String(x.groupId||"MAIN")===groupId&&String(x.mapId||"")===from.mapId&&String(x.nodeId||"")===from.nodeId);
  if(!members.length)members=records.filter(x=>String(x.groupId||"MAIN")===groupId);
  if(!members.length)return false;
  const duration=Math.max(240,Math.min(900,Number(payload.duration)||TRAVEL_MARKER_MOVE_MS)),id=`travel-motion-${++runtime.travelMarkerMotionSeq}`,endsAt=Date.now()+duration+70;
  runtime.travelMarkerMotions ||= [];
  runtime.travelMarkerMotions.push({id,fxId,sessionId:String(s.id),groupId,mapId:from.mapId,fromNodeId:from.nodeId,toNodeId:to.nodeId,members:deepClone(members),duration,endsAt});
  setTimeout(()=>{
    runtime.travelMarkerMotions=(runtime.travelMarkerMotions||[]).filter(m=>m.id!==id);
    // The CSS motion has already completed; remove only the finished overlay
    // instead of rebuilding the complete Travel window.
    document.querySelectorAll(`[data-travel-motion-id="${CSS.escape(id)}"]`).forEach(el=>el.remove());
  },duration+80);
  const ownFx=String(payload?.senderId||"")===String(runtime.currentPlayer.id||"");
  // The sender commits the new Current node a few ms later and that render
  // already includes the motion. Remote viewers still need one render here.
  if(runtime.view==="travel"&&!ownFx)render();
  return true;
}
function travelMarkerMotionsHTML(session,map){
  if(!session||!map)return"";const now=Date.now();
  return (runtime.travelMarkerMotions||[]).filter(m=>String(m.sessionId)===String(session.id)&&String(m.mapId)===String(map.id)&&Number(m.endsAt||0)>now).map(m=>{
    const a=map.nodes?.find(n=>String(n.id)===String(m.fromNodeId)),b=map.nodes?.find(n=>String(n.id)===String(m.toNodeId));if(!a||!b)return"";const pa=travelNodeWorldPos(a),pb=travelNodeWorldPos(b),members=(m.members||[]).slice(0,8);
    return `<span class="travel-moving-pack group-${String(m.groupId||"MAIN").toLowerCase()}" data-travel-motion-id="${esc(String(m.id||""))}" style="--travel-from-x:${pa.x}px;--travel-from-y:${pa.y}px;--travel-to-x:${pb.x}px;--travel-to-y:${pb.y}px;--travel-motion-ms:${Number(m.duration)||TRAVEL_MARKER_MOVE_MS}ms">${members.map((x,i)=>{const nm=String(x.name||"CHARACTER"),pt=String(x.portrait||""),kind=x.kind==="ally"?"ally":"player";return `<span class="travel-moving-member ${kind}" style="--travel-member-i:${i}" title="${esc(nm)}">${pt?`<img src="${esc(pt)}" alt="${esc(nm)}">`:`<i>${esc(nm.slice(0,1).toUpperCase()||"?")}</i>`}</span>`}).join("")}${m.members?.length>members.length?`<em>+${m.members.length-members.length}</em>`:""}</span>`;
  }).join("");
}
async function travelEmitMoveFx(session,groupId,from,target){
  if(!session||!from||!target)return;const slot=session.splitActive&&["A","B"].includes(String(groupId))?String(groupId):"MAIN",swapDelay=400;
  const payload={fxId:travelUid("move-fx"),senderId:String(runtime.currentPlayer.id||""),sessionId:String(session.id),groupId:slot,fromMapId:String(from.mapId||""),fromNodeId:String(from.nodeId||""),targetMapId:String(target.mapId||""),targetNodeId:String(target.nodeId||""),frameId:travelFrameId(session,slot),duration:TRAVEL_MARKER_MOVE_MS,fadeDelay:200,swapDelay,time:Date.now()};
  runtime.travelBackgroundFxHoldUntil=Math.max(Number(runtime.travelBackgroundFxHoldUntil)||0,Date.now()+swapDelay);
  travelStartMarkerMotionFx(payload);
  await broadcast("travel-move-fx",payload);
}
function travelExplorersAt(session, mapId, nodeId) {
  const mid=String(mapId||""), nid=String(nodeId||"");
  return [...travelPlayerExplorerRecords(session), ...travelAllyExplorerRecords(session)].filter(x => x.mapId === mid && x.nodeId === nid);
}
function travelMemberMarkersHTML(session, mapId, nodeId) {
  const moving=travelMovingExplorerIds(session?.id);
  const members = travelExplorersAt(session, mapId, nodeId).filter(x=>!moving.has(String(x.ownerId||"")));
  if (!members.length) return "";
  const shown = members.slice(0, 6), extra = Math.max(0, members.length - shown.length);
  return `<span class="travel-node-members" aria-label="Players and allies exploring here">${shown.map(x=>{const nm=String(x.name||"CHARACTER"),pt=String(x.portrait||""),g=session?.splitActive?String(x.groupId||"A"):"",kind=x.kind==="ally"?"ally":"player",kindLabel=kind==="ally"?"ALLY":"PLAYER";return `<span class="travel-node-member ${kind} ${g?`group-${g.toLowerCase()}`:""}" title="${esc(nm)} · ${kindLabel}${g?` · GROUP ${g}`:""}">${pt?`<img src="${esc(pt)}" alt="${esc(nm)}">`:`<i>${esc(nm.slice(0,1).toUpperCase()||"?")}</i>`}<u>${kind==="ally"?"ALLY":"P"}</u>${g?`<em>${g}</em>`:""}</span>`}).join("")}${extra?`<span class="travel-node-member more" title="${extra} more explorers">+${extra}</span>`:""}</span>`;
}
function travelSetMyLocation(mapId, nodeId) {
  const session = travelSession(); if (!session) return;
  const map = session.maps.find(x=>x.id===mapId), node = map?.nodes.find(x=>x.id===nodeId); if (!map || !node) return;
  if (!travelWasVisited(session, map.id, node.id)) { notify("You can only mark a Node that has already been visited"); return; }
  const marker = travelLocalCharacterMarker(); if (!marker) { notify("Create or restore your Character Sheet before placing a Travel marker"); return; }
  session.memberLocations ||= {};
  const oldRec=session.memberLocations[marker.ownerId];
  const removing=!!oldRec && String(oldRec.mapId)===String(map.id) && String(oldRec.nodeId)===String(node.id);
  if(removing) delete session.memberLocations[marker.ownerId];
  else session.memberLocations[marker.ownerId] = { ...marker, mapId: map.id, nodeId: node.id, updatedAt: Date.now() };
  if (runtime.currentPlayer.role === "GM") { saveTravelState({applyBackground:false}); render(); return; }
  render();
  broadcast("travel-presence-request", { requestId:travelUid("presence"), action:removing?"remove":"set", senderId:runtime.currentPlayer.id, sessionId:session.id, mapId:map.id, nodeId:node.id, name:marker.name, portrait:marker.portrait, time:Date.now() });
}
async function saveTravelState({ applyBackground = true } = {}) {
  runtime.travel = normalizeTravelState(runtime.travel);
  runtime.travel.revision = Math.max(Number(runtime.travel.revision)||0, 0) + 1;
  const snapshot = deepClone(runtime.travel), revision = Number(snapshot.revision)||0;
  runtime.travelDirty = true;
  if (PREVIEW || !runtime.online) { runtime.travelDirty = false; render(); return; }
  const run = async () => {
    try {
      if (!await OBR.scene.isReady()) { if ((Number(runtime.travel?.revision)||0) <= revision) runtime.travelDirty = false; return; }
      await OBR.scene.setMetadata({ [SCENE_TRAVEL_KEY]: snapshot });
      // v2.107: explicit room broadcast is the fast path. Scene metadata remains
      // the persistent source of truth/fallback, while this prevents player UIs
      // from waiting on a delayed metadata callback after GM edits.
      await broadcast("travel-sync", { senderId: runtime.currentPlayer.id, reason: "full", revision, travel: snapshot, time: Date.now() });
      if ((Number(runtime.travel?.revision)||0) <= revision) runtime.travelDirty = false;
      if (applyBackground && runtime.currentPlayer.role === "GM") {
        const waitMs=Math.max(0,(Number(runtime.travelBackgroundFxHoldUntil)||0)-Date.now());
        if(waitMs)await new Promise(r=>setTimeout(r,waitMs));
        if((Number(runtime.travelBackgroundFxHoldUntil)||0)<=Date.now()+20)runtime.travelBackgroundFxHoldUntil=0;
        await applyTravelBackgroundDirect();
      }
    } catch (e) {
      console.warn("save travel", e);
      if ((Number(runtime.travel?.revision)||0) <= revision) runtime.travelDirty = false;
      notify("Could not save Travel data to this Scene");
    }
  };
  runtime.travelSaveChain = (runtime.travelSaveChain || Promise.resolve()).then(run, run);
  return runtime.travelSaveChain;
}
function scheduleTravelSave(delay = 30, options = {}) { clearTimeout(runtime.travelSaveTimer); runtime.travelSaveTimer = setTimeout(() => saveTravelState(options), delay); }
function mergeTravelMoveIntoLocal(incoming) {
  const local = travelState();
  if (!incoming?.sessions?.length) return;
  local.activeSessionId = incoming.activeSessionId || local.activeSessionId;
  for (const inc of incoming.sessions) {
    const dst = local.sessions.find(x => x.id === inc.id); if (!dst) continue;
    dst.current = deepClone(inc.current || dst.current);
    dst.splitActive = !!inc.splitActive;
    dst.groups = deepClone(inc.groups || dst.groups || {A:{id:"A",current:dst.current},B:{id:"B",current:dst.current}});
    dst.memberGroups = deepClone(inc.memberGroups || dst.memberGroups || {});
    dst.groupFrameIds = deepClone(inc.groupFrameIds || dst.groupFrameIds || {A:"",B:""});
    dst.discoveredMaps = [...new Set([...(dst.discoveredMaps||[]), ...(inc.discoveredMaps||[])])];
    dst.discoveredNodes ||= {};
    for (const [mid, ids] of Object.entries(inc.discoveredNodes || {})) dst.discoveredNodes[mid] = [...new Set([...(dst.discoveredNodes[mid]||[]), ...(ids||[])])];
    dst.memberLocations ||= {};
    for (const [ownerId, rec] of Object.entries(inc.memberLocations || {})) dst.memberLocations[String(ownerId)] = deepClone(rec);
  }
  local.revision = Math.max(Number(local.revision)||0, Number(incoming.revision)||0);
}
function applyTravelNodeLivePatch(payload = {}) {
  const s = travelSession(payload.sessionId); if (!s) return;
  const m = s.maps.find(x => x.id === payload.mapId), n = m?.nodes.find(x => x.id === payload.nodeId); if (!n) return;
  const patch = payload.patch || {};
  for (const key of ["name","detail","unlockRule","previewUrl"]) if (key in patch) n[key] = String(patch[key] ?? "");
  for (const key of ["x","y"]) if (key in patch && Number.isFinite(Number(patch[key]))) n[key] = Number(patch[key]);
  const el = document.querySelector(`.travel-node[data-travel-map-node="${CSS.escape(m.id)}"][data-travel-node="${CSS.escape(n.id)}"]`);
  if (el) {
    const pos=travelNodeWorldPos(n);
    if ("x" in patch) el.style.left = `${pos.x}px`;
    if ("y" in patch) el.style.top = `${pos.y}px`;
    if ("name" in patch) { const b=el.querySelector("b"); if(b) b.textContent=n.name; }
    const board=el.closest('.travel-board'),world=board?.querySelector('.travel-world'),svg=world?.querySelector('svg');
    if(world && ("x" in patch || "y" in patch)){const metrics=travelMapWorldMetrics(m);world.style.width=`${metrics.width}px`;world.style.height=`${metrics.height}px`;if(svg)svg.setAttribute('viewBox',`0 0 ${metrics.width} ${metrics.height}`);}
    if(svg && ("x" in patch || "y" in patch)) for(const line of svg.querySelectorAll('line')){if(line.dataset.a===n.id){line.setAttribute('x1',pos.x);line.setAttribute('y1',pos.y)}if(line.dataset.b===n.id){line.setAttribute('x2',pos.x);line.setAttribute('y2',pos.y)}}
  }
}
function broadcastTravelNodeLive(mapId,nodeId,patch={}) {
  if (PREVIEW || !runtime.online || runtime.currentPlayer.role !== "GM") return;
  const now=Date.now(); if(now-(Number(runtime.travelLiveAt)||0)<70)return; runtime.travelLiveAt=now;
  const s=travelSession(); if(!s)return;
  broadcast("travel-node-live", { senderId: runtime.currentPlayer.id, sessionId:s.id, mapId, nodeId, patch:deepClone(patch), time:now });
}
function travelMapItemsSignature(items = []) {
  return (items || []).map(item => [String(item?.id||""),String(item?.name||""),String(item?.image?.url||""),Number(item?.image?.width)||0,Number(item?.image?.height)||0].join("~")).sort().join("|");
}
async function refreshTravelMapItems(force = false) {
  if (PREVIEW || !OBR || !await OBR.scene.isReady()) return;
  if (!force && Date.now() - (Number(runtime.travelMapItemsAt)||0) < 8000) return;
  if (runtime.travelMapItemsRefreshPromise) return runtime.travelMapItemsRefreshPromise;
  const run = (async()=>{
    try {
      const next = await OBR.scene.items.getItems(item => item?.type === "IMAGE" && item?.layer === "MAP" && !item?.metadata?.[TRAVEL_FRAME_META_KEY]);
      const sig = travelMapItemsSignature(next), changed = sig !== String(runtime.travelMapItemsSig||"");
      runtime.travelMapItems = next;
      runtime.travelMapItemIndex = new Map(next.map(item=>[String(item?.id||""),item]));
      runtime.travelMapItemsSig = sig;
      runtime.travelMapItemsAt = Date.now();
      // Avoid rebuilding the entire Travel graph every few seconds when the
      // Owlbear MAP collection has not actually changed.
      if (changed && runtime.view === "travel") render();
    } catch (e) { console.warn("travel background maps", e); }
  })();
  runtime.travelMapItemsRefreshPromise = run.finally(()=>{runtime.travelMapItemsRefreshPromise=null;});
  return runtime.travelMapItemsRefreshPromise;
}
async function selectedTravelMapItem() {
  if (PREVIEW || !OBR || !await OBR.scene.isReady()) return null;
  const ids = await OBR.player.getSelection(); if (!ids?.length) return null;
  const items = await OBR.scene.items.getItems(ids);
  return items.find(x => x.type === "IMAGE" && x.layer === "MAP") || null;
}
async function selectedTravelFrameItem() {
  if (PREVIEW || !OBR || !await OBR.scene.isReady()) return null;
  const ids = await OBR.player.getSelection(); if (!ids?.length) return null;
  const items = await OBR.scene.items.getItems(ids);
  return items.find(x => (x.type === "IMAGE" && x.layer === "MAP") || (x.type === "SHAPE" && x.shapeType === "RECTANGLE")) || null;
}
async function selectedTravelTokenItem() {
  if (PREVIEW || !OBR) return null;
  let ready=false; try{ready=await OBR.scene.isReady();}catch{} if(!ready)return null;
  const ids=await OBR.player.getSelection(); if(!ids?.length)return null;
  const items=await OBR.scene.items.getItems(ids);
  return items.find(x=>x?.layer==="CHARACTER"&&x?.type==="IMAGE")||null;
}
function travelActiveSlotsForNode(session,mapId,nodeId){
  if(!session)return[];const matches=c=>String(c?.mapId||"")===String(mapId)&&String(c?.nodeId||"")===String(nodeId);
  if(session.splitActive)return ["A","B"].filter(g=>matches(travelCurrentRef(session,g))&&travelFrameId(session,g));
  return matches(travelCurrentRef(session,"MAIN"))&&travelFrameId(session,"MAIN")?["MAIN"]:[];
}
function travelPreferredEmbeddedSlot(session,mapId,nodeId,allowFallback=false){
  const active=travelActiveSlotsForNode(session,mapId,nodeId);if(active.length){const wanted=session?.splitActive?String(runtime.travelControlGroup||travelViewerGroupId(session)||"A").toUpperCase():"MAIN";return active.includes(wanted)?wanted:active[0];}
  if(!allowFallback)return"";const viewer=travelViewerGroupId(session),order=[viewer,"MAIN","A","B"].filter((x,i,a)=>["MAIN","A","B"].includes(x)&&a.indexOf(x)===i);return order.find(slot=>travelFrameId(session,slot))||"";
}
async function travelEmbeddedFrameInfo(session,slot){
  const frameId=travelFrameId(session,slot);if(!frameId||PREVIEW||!OBR)return null;let ready=false;try{ready=await OBR.scene.isReady();}catch{}if(!ready)return null;
  try{const bounds=await OBR.scene.items.getItemBounds([frameId]);if(!bounds?.center||!Number.isFinite(Number(bounds.width))||!Number.isFinite(Number(bounds.height)))return null;return{slot,frameId,bounds:{center:{x:Number(bounds.center.x)||0,y:Number(bounds.center.y)||0},width:Math.max(1,Number(bounds.width)||1),height:Math.max(1,Number(bounds.height)||1)}};}catch(e){console.warn("Node Token frame bounds",e);return null;}
}
function travelEmbeddedFind(node,recordId){return (node?.embeddedTokens||[]).find(x=>String(x.id)===String(recordId))||null;}
function travelEmbeddedRecordFromItem(item,frameInfo,existing={}){
  const b=frameInfo.bounds,p=item?.position||b.center,left=b.center.x-b.width/2,top=b.center.y-b.height/2;
  return normalizeTravelEmbeddedToken({...existing,itemId:String(existing.itemId||""),name:String(item?.name||existing.name||"TOKEN"),template:travelTokenTemplateFromItem(item)||existing.template,u:(Number(p.x)-left)/b.width,v:(Number(p.y)-top)/b.height,refWidth:b.width,refHeight:b.height,rotation:Number(item?.rotation)||0,scale:{x:Number(item?.scale?.x)||1,y:Number(item?.scale?.y)||1},lastSlot:frameInfo.slot});
}
function travelEmbeddedPlacement(rec,frameInfo){
  const b=frameInfo.bounds,left=b.center.x-b.width/2,top=b.center.y-b.height/2,rx=b.width/Math.max(1,Number(rec.refWidth)||b.width),ry=b.height/Math.max(1,Number(rec.refHeight)||b.height);
  return {position:{x:left+b.width*(Number(rec.u)||0),y:top+b.height*(Number(rec.v)||0)},rotation:Number(rec.rotation)||0,scale:{x:(Number(rec.scale?.x)||1)*rx,y:(Number(rec.scale?.y)||1)*ry}};
}
function travelEmbeddedMeta(session,map,node,rec,slot){return{sessionId:String(session?.id||""),mapId:String(map?.id||""),nodeId:String(node?.id||""),recordId:String(rec?.id||""),slot:String(slot||"MAIN")};}
function travelEmbeddedMetaMatches(meta,session,map,node,rec,slot=null){return!!meta&&String(meta.sessionId||"")===String(session?.id||"")&&String(meta.mapId||"")===String(map?.id||"")&&String(meta.nodeId||"")===String(node?.id||"")&&String(meta.recordId||"")===String(rec?.id||"")&&(!slot||String(meta.slot||"MAIN")===String(slot));}
async function travelFindEmbeddedInstances(session,map,node,rec,slot=null){
  if(PREVIEW||!OBR)return[];let ready=false;try{ready=await OBR.scene.isReady();}catch{}if(!ready)return[];
  try{return await OBR.scene.items.getItems(item=>item?.type==="IMAGE"&&travelEmbeddedMetaMatches(item?.metadata?.[TRAVEL_EMBEDDED_TOKEN_META_KEY],session,map,node,rec,slot));}catch(e){console.warn("Node Token lookup",e);return[];}
}
async function travelEnsureEmbeddedTokenInstance(session,map,node,rec,slot,{visible=false}={}){
  if(runtime.currentPlayer.role!=="GM"||PREVIEW||!OBRSDK?.buildImage)return null;
  const frame=await travelEmbeddedFrameInfo(session,slot);if(!frame)return null;
  let items=await travelFindEmbeddedInstances(session,map,node,rec,slot),item=items[0]||null;const tpl=normalizeTravelTokenTemplate(rec.template||{});if(!tpl)return item||null;
  const place=travelEmbeddedPlacement(rec,frame),meta=travelEmbeddedMeta(session,map,node,rec,slot);
  if(!item){const token=OBRSDK.buildImage(tpl.image,tpl.grid).name(String(rec.name||tpl.name||"NODE TOKEN")).layer("CHARACTER").position(place.position).rotation(place.rotation).scale(place.scale).visible(!!visible).metadata({[TRAVEL_EMBEDDED_TOKEN_META_KEY]:meta}).build();await OBR.scene.items.addItems([token]);item=token;}
  else await OBR.scene.items.updateItems([item.id],xs=>{for(const x of xs){x.position=place.position;x.rotation=place.rotation;x.scale=place.scale;x.visible=!!visible;x.layer="CHARACTER";x.metadata||={};x.metadata[TRAVEL_EMBEDDED_TOKEN_META_KEY]=meta;}});
  rec.shown=!!visible;rec.lastSlot=slot;return item;
}
async function travelEmbedSelectedToken(){
  if(runtime.currentPlayer.role!=="GM")return;const session=travelSession(),map=travelMap(session),node=travelSelectedNode();if(!session||!map||!node)return notify("Select a Node first");
  const item=await selectedTravelTokenItem();if(!item)return notify("Select a CHARACTER image token on the Owlbear map first");
  if(item?.metadata?.[TRAVEL_EMBEDDED_TOKEN_META_KEY])return notify("That token is already a Node Token instance");
  const slot=travelPreferredEmbeddedSlot(session,map.id,node.id,true);if(!slot)return notify("Set at least one MAIN / A / B Blank before capturing a Node Token");
  const frame=await travelEmbeddedFrameInfo(session,slot);if(!frame)return notify("Could not read the Travel Blank bounds");
  const rec=travelEmbeddedRecordFromItem(item,frame,{id:travelUid("embed"),itemId:"",shown:false});rec.itemId="";rec.shown=false;node.embeddedTokens ||= [];node.embeddedTokens.push(rec);
  await saveTravelState({applyBackground:false});
  try{await OBR.scene.items.deleteItems([item.id]);}catch(e){console.warn("remove Node Token capture source",e);node.embeddedTokens=node.embeddedTokens.filter(x=>x.id!==rec.id);await saveTravelState({applyBackground:false});return notify("Could not remove the source token · template capture cancelled");}
  render();notify(`${item.name||"TOKEN"} captured · spawns HIDDEN when ${node.name} is entered`);
}
async function travelSpawnHiddenTokensForEntry(session,groupId,mapId,nodeId){
  if(runtime.currentPlayer.role!=="GM")return false;const pair=travelFindNodePair(session,mapId,nodeId),map=pair.map,node=pair.node;if(!map||!node?.embeddedTokens?.length)return false;
  const slot=["A","B"].includes(String(groupId))?String(groupId):"MAIN";if(!travelFrameId(session,slot))return false;let changed=false;
  for(const rec of node.embeddedTokens){try{const item=await travelEnsureEmbeddedTokenInstance(session,map,node,rec,slot,{visible:false});changed=!!item||changed;}catch(e){console.warn("spawn hidden Node Token",e);}}return changed;
}
async function travelHideNodeTokenInstances(session,groupId,mapId,nodeId){
  const pair=travelFindNodePair(session,mapId,nodeId),map=pair.map,node=pair.node;if(!map||!node?.embeddedTokens?.length)return false;const slot=["A","B"].includes(String(groupId))?String(groupId):"MAIN";let ids=[];
  for(const rec of node.embeddedTokens){const items=await travelFindEmbeddedInstances(session,map,node,rec,slot);ids.push(...items.map(x=>String(x.id)));}
  ids=[...new Set(ids.filter(Boolean))];if(!ids.length)return false;await OBR.scene.items.updateItems(ids,xs=>{for(const x of xs)x.visible=false;});return true;
}
function travelScheduleNodeTokenTransition(session,groupId,from,target){
  // v2.138 safety rule: Node Token scene-item work is fire-and-forget and NEVER awaited by Travel movement/state saving.
  setTimeout(()=>{Promise.race([Promise.allSettled([from?.nodeId?travelHideNodeTokenInstances(session,groupId,from.mapId,from.nodeId):Promise.resolve(false),target?.nodeId?travelSpawnHiddenTokensForEntry(session,groupId,target.mapId,target.nodeId):Promise.resolve(false)]),new Promise(resolve=>setTimeout(()=>resolve(false),1400))]).catch(e=>console.warn("Node Token transition",e));},0);
}
async function travelShowEmbeddedToken(recordId,{commit=true,quiet=false}={}){
  if(runtime.currentPlayer.role!=="GM")return false;const session=travelSession(),map=travelMap(session),node=travelSelectedNode(),rec=travelEmbeddedFind(node,recordId);if(!session||!map||!node||!rec)return false;
  const slot=travelPreferredEmbeddedSlot(session,map.id,node.id,false);if(!slot){if(!quiet)notify("Set this Node CURRENT before showing its Node Tokens");return false;}
  const item=await travelEnsureEmbeddedTokenInstance(session,map,node,rec,slot,{visible:true});if(!item){if(!quiet)notify(`${rec.name} has no usable token template`);return false;}rec.shown=true;rec.lastSlot=slot;if(commit){await saveTravelState({applyBackground:false});render();}return true;
}
async function travelHideEmbeddedToken(recordId,{commit=true}={}){
  if(runtime.currentPlayer.role!=="GM")return false;const session=travelSession(),map=travelMap(session),node=travelSelectedNode(),rec=travelEmbeddedFind(node,recordId);if(!session||!map||!node||!rec)return false;
  const slot=travelPreferredEmbeddedSlot(session,map.id,node.id,false)||String(rec.lastSlot||"");const items=await travelFindEmbeddedInstances(session,map,node,rec,slot||null);if(items.length)await OBR.scene.items.updateItems(items.map(x=>x.id),xs=>{for(const x of xs)x.visible=false;});rec.shown=false;if(commit){await saveTravelState({applyBackground:false});render();}return true;
}
async function travelCaptureEmbeddedToken(recordId){
  if(runtime.currentPlayer.role!=="GM")return;const session=travelSession(),map=travelMap(session),node=travelSelectedNode(),rec=travelEmbeddedFind(node,recordId);if(!session||!map||!node||!rec)return;
  const slot=travelPreferredEmbeddedSlot(session,map.id,node.id,false);if(!slot)return notify("Set this Node CURRENT before saving a token position");const frame=await travelEmbeddedFrameInfo(session,slot);if(!frame)return;const items=await travelFindEmbeddedInstances(session,map,node,rec,slot),item=items?.[0];if(!item)return notify(`${rec.name} has not been spawned in this Node yet`);
  Object.assign(rec,travelEmbeddedRecordFromItem(item,frame,rec));await saveTravelState({applyBackground:false});render();notify(`${rec.name} position / scale / rotation saved`);
}
async function travelRemoveEmbeddedToken(recordId){
  if(runtime.currentPlayer.role!=="GM")return;const session=travelSession(),map=travelMap(session),node=travelSelectedNode(),rec=travelEmbeddedFind(node,recordId);if(!session||!map||!node||!rec)return;
  const items=await travelFindEmbeddedInstances(session,map,node,rec,null);if(items.length)try{await OBR.scene.items.deleteItems(items.map(x=>x.id));}catch(e){console.warn("delete Node Token instances",e);}node.embeddedTokens=(node.embeddedTokens||[]).filter(x=>String(x.id)!==String(recordId));await saveTravelState({applyBackground:false});render();
}
async function travelShowAllEmbeddedTokens(){const node=travelSelectedNode();if(!node?.embeddedTokens?.length)return;let changed=false;for(const rec of node.embeddedTokens)changed=(await travelShowEmbeddedToken(rec.id,{commit:false,quiet:true}))||changed;if(changed){await saveTravelState({applyBackground:false});render();}}
async function travelHideAllEmbeddedTokens(){const node=travelSelectedNode();if(!node?.embeddedTokens?.length)return;let changed=false;for(const rec of node.embeddedTokens)changed=(await travelHideEmbeddedToken(rec.id,{commit:false}))||changed;if(changed){await saveTravelState({applyBackground:false});render();}}
function travelReleaseEmbeddedItems(nodes=[]){
  if(PREVIEW||!OBR)return;const recordIds=new Set((nodes||[]).flatMap(n=>(n?.embeddedTokens||[]).map(x=>String(x.id||"")).filter(Boolean)));if(!recordIds.size)return;
  setTimeout(()=>{Promise.race([(async()=>{let ready=false;try{ready=await OBR.scene.isReady();}catch{}if(!ready)return;const generated=await OBR.scene.items.getItems(item=>recordIds.has(String(item?.metadata?.[TRAVEL_EMBEDDED_TOKEN_META_KEY]?.recordId||"")));if(generated.length)await OBR.scene.items.deleteItems(generated.map(x=>x.id));})(),new Promise(resolve=>setTimeout(resolve,1200))]).catch(e=>console.warn("release Node Tokens",e));},0);
}
function travelEmbeddedTokensEditorHTML(session,map,node){
  const list=node?.embeddedTokens||[],slot=travelPreferredEmbeddedSlot(session,map?.id,node?.id,false),canShow=!!slot;
  const rows=list.map(rec=>`<div class="travel-embedded-token ${rec.shown?'shown':'hidden'}"><div><b>${esc(rec.name||'TOKEN')}</b><small>${rec.shown?`VISIBLE · ${esc(rec.lastSlot||slot||'SCENE')}`:(canShow?`READY HIDDEN @ ${esc(slot)}`:'TEMPLATE · SPAWNS HIDDEN ON ENTRY')}</small></div><div><button class="mini-btn active" data-travel-token-show="${esc(rec.id)}" ${rec.shown||!canShow?'disabled':''}>SHOW</button><button class="mini-btn" data-travel-token-hide="${esc(rec.id)}" ${!rec.shown?'disabled':''}>HIDE</button><button class="mini-btn" data-travel-token-capture="${esc(rec.id)}" ${!rec.shown||!canShow?'disabled':''}>SAVE POS</button><button class="mini-btn danger-soft" data-travel-token-remove="${esc(rec.id)}">REMOVE</button></div></div>`).join('');
  return `<div class="travel-embedded-panel"><div class="travel-editor-title"><b>NODE TOKEN TEMPLATES · ${list.length}</b><span>${canShow?`ACTIVE @ ${esc(slot)}`:'NODE NOT CURRENT'}</span></div><small>Select a CHARACTER image token, capture it once, and the source token is removed. Entering this Node creates the token HIDDEN at its saved position / scale / rotation. Use SHOW when the reveal should happen. If you move a visible token, press SAVE POS before leaving.</small><div class="travel-editor-actions"><button class="mini-btn active" data-travel-token-embed>CAPTURE SELECTED TOKEN AS TEMPLATE</button><button class="mini-btn" data-travel-token-show-all ${!list.length||!canShow?'disabled':''}>SHOW ALL</button><button class="mini-btn" data-travel-token-hide-all ${!list.length?'disabled':''}>HIDE ALL</button></div><div class="travel-embedded-list">${rows||'<em>NO NODE TOKEN TEMPLATES</em>'}</div></div>`;
}

async function travelViewportCenter() {
  try { const [w,h] = await Promise.all([OBR.viewport.getWidth(), OBR.viewport.getHeight()]); return await OBR.viewport.inverseTransformPoint({ x:w/2, y:h/2 }); }
  catch { return OBR.viewport.getPosition(); }
}
function travelBlankContent(width = 1400, height = 900) {
  return { width: Math.max(8, Math.round(Number(width)||1400)), height: Math.max(8, Math.round(Number(height)||900)), url: TRAVEL_BLANK_IMAGE_URL, mime: "image/svg+xml" };
}
function travelBlankGrid(width = 1400, height = 900) {
  const w=Math.max(8,Math.round(Number(width)||1400)), h=Math.max(8,Math.round(Number(height)||900));
  return { dpi: 150, offset: { x: w/2, y: h/2 } };
}
function travelDisplayMeta(session, width, height, existing = null) {
  const old = existing?.metadata?.[TRAVEL_DISPLAY_META_KEY] || {};
  return { blankImage: old.blankImage || travelBlankContent(width,height), blankGrid: old.blankGrid || travelBlankGrid(width,height), sourceItemId: String(old.sourceItemId||"") };
}
async function convertTravelFrameShapeToImage(session, shape, slot="MAIN") {
  if (!session || !shape || shape.type !== "SHAPE" || PREVIEW || !OBRSDK?.buildImage) return shape;
  const sx=Math.abs(Number(shape.scale?.x)||1), sy=Math.abs(Number(shape.scale?.y)||1);
  const w=Math.max(8,Math.round((Number(shape.width)||1400)*sx)), h=Math.max(8,Math.round((Number(shape.height)||900)*sy));
  const image=travelBlankContent(w,h), grid=travelBlankGrid(w,h), label=slot==="MAIN"?"MAIN":`GROUP ${slot}`;
  const display=OBRSDK.buildImage(image,grid).name(`LYNX TRAVEL ${label} BLANK · ${session.name}`).layer("MAP")
    .position(deepClone(shape.position||{x:0,y:0})).rotation(Number(shape.rotation)||0).scale({x:1,y:1}).locked(false).visible(true)
    .metadata({ ...(shape.metadata||{}), [TRAVEL_FRAME_META_KEY]:session.id, [TRAVEL_DISPLAY_META_KEY]:{blankImage:image,blankGrid:grid,sourceItemId:"",slot} }).build();
  await OBR.scene.items.addItems([display]);
  await OBR.scene.items.deleteItems([shape.id]);
  travelSetFrameId(session,slot,display.id);
  try { await OBR.player.select([display.id]); } catch {}
  return display;
}
async function createTravelFrame(slot="MAIN") {
  if (runtime.currentPlayer.role !== "GM" || PREVIEW || !OBRSDK?.buildImage || !await OBR.scene.isReady()) return;
  const s=travelSession(); if(!s)return; slot=["MAIN","A","B"].includes(slot)?slot:"MAIN";
  const center=await travelViewportCenter(), image=travelBlankContent(1400,900), grid=travelBlankGrid(1400,900), label=slot==="MAIN"?"MAIN":`GROUP ${slot}`;
  const frame=OBRSDK.buildImage(image,grid).name(`LYNX TRAVEL ${label} BLANK · ${s.name}`).layer("MAP").position(center).locked(false).visible(true)
    .metadata({[TRAVEL_FRAME_META_KEY]:s.id,[TRAVEL_DISPLAY_META_KEY]:{blankImage:image,blankGrid:grid,sourceItemId:"",slot}}).build();
  await OBR.scene.items.addItems([frame]); travelSetFrameId(s,slot,frame.id); await saveTravelState();
  try{await OBR.player.select([frame.id])}catch{}
}
async function useSelectedTravelFrame(slot="MAIN") {
  if(runtime.currentPlayer.role!=="GM")return;
  const s=travelSession(); slot=["MAIN","A","B"].includes(slot)?slot:"MAIN"; let frame=await selectedTravelFrameItem(); if(!s||!frame)return notify("Select one MAP image or rectangular Shape to use as the Travel Blank");
  if(frame.type==="SHAPE") frame=await convertTravelFrameShapeToImage(s,frame,slot);
  if(!frame||frame.type!=="IMAGE")return notify("Travel Blank must be an Image");
  const w=Number(frame.image?.width)||1400,h=Number(frame.image?.height)||900;
  const slotMeta=travelDisplayMeta(s,w,h,frame); slotMeta.slot=slot;
  if(!frame.metadata?.[TRAVEL_DISPLAY_META_KEY]){slotMeta.blankImage=deepClone(frame.image);slotMeta.blankGrid=deepClone(frame.grid||travelBlankGrid(w,h));}
  const label=slot==="MAIN"?"MAIN":`GROUP ${slot}`;
  await OBR.scene.items.updateItems([frame],xs=>{for(const x of xs){x.metadata||={};x.metadata[TRAVEL_FRAME_META_KEY]=s.id;x.metadata[TRAVEL_DISPLAY_META_KEY]=slotMeta;x.layer="MAP";x.visible=true;x.name=`LYNX TRAVEL ${label} BLANK · ${s.name}`;}});
  travelSetFrameId(s,slot,frame.id); await saveTravelState();
}
async function linkSelectedTravelMap() {
  if (runtime.currentPlayer.role !== "GM") return;
  const s = travelSession(), m = travelMap(s); if (!s || !m) return;
  const item = await selectedTravelMapItem(); if (!item) return notify("Select one Background / MAP image in Owlbear first");
  if(travelAllFrameIds(s).includes(String(item.id)))return notify("A Travel Blank cannot be used as its own source");
  m.itemId = item.id; runtime.travelMapItemsAt = 0; await refreshTravelMapItems(true); await saveTravelState();
}
async function linkTravelMapById(itemId) {
  if (runtime.currentPlayer.role !== "GM") return;
  const s = travelSession(), m = travelMap(s); if (!s || !m) return;
  if(travelAllFrameIds(s).includes(String(itemId||"")))return;
  m.itemId = String(itemId || ""); await saveTravelState();
}
async function linkSelectedTravelNodeBackground() {
  if (runtime.currentPlayer.role !== "GM") return;
  const s = travelSession(), m = travelMap(s), n = travelSelectedNode(); if (!s || !m || !n) return;
  const item = await selectedTravelMapItem(); if (!item) return notify("Select one Background / MAP image in Owlbear first");
  if(travelAllFrameIds(s).includes(String(item.id)))return notify("A Travel Blank cannot be used as its own source");
  n.backgroundItemId = String(item.id); n.backgroundSnapshot = travelImageSnapshot(item); runtime.travelMapItemsAt = 0; await refreshTravelMapItems(true); await saveTravelState();
}
async function linkTravelNodeBackgroundById(itemId) {
  if (runtime.currentPlayer.role !== "GM") return;
  const s=travelSession(),n=travelSelectedNode(); if (!n) return;
  if(travelAllFrameIds(s).includes(String(itemId||"")))return;
  n.backgroundItemId = String(itemId || "");
  if(!n.backgroundItemId) n.backgroundSnapshot = null;
  else { const item=travelMapItemById(n.backgroundItemId); if(item) n.backgroundSnapshot=travelImageSnapshot(item); }
  await saveTravelState();
}
function travelNodeStateById(node,stateId){return (node?.states||[]).find(x=>String(x?.id||"")===String(stateId||""))||null;}
async function travelAddNodeStateFromSelected(){
  if(runtime.currentPlayer.role!=="GM")return;
  const s=travelSession(),n=travelSelectedNode();if(!s||!n)return;
  const item=await selectedTravelMapItem();if(!item)return notify("Select one Background / MAP image in Owlbear first");
  if(travelAllFrameIds(s).includes(String(item.id)))return notify("A Travel Blank cannot be used as a Node State source");
  const map=travelMap(s),defaultId=String(n.backgroundItemId||map?.itemId||"");
  if(defaultId&&String(item.id)===defaultId)return notify("This image is already the Node DEFAULT background — select a different image for an alternate State");
  const duplicate=(n.states||[]).find(st=>String(st.backgroundItemId||"")===String(item.id));
  if(duplicate)return notify(`This image is already linked to State: ${duplicate.name||"STATE"}`);
  const raw=window.prompt("NODE STATE NAME",`STATE ${(n.states||[]).length+1}`);if(raw===null)return;
  const name=String(raw||"").trim()||`STATE ${(n.states||[]).length+1}`;
  const st=normalizeTravelNodeState({id:travelUid("state"),name,backgroundItemId:String(item.id),backgroundSnapshot:travelImageSnapshot(item)},(n.states||[]).length);
  n.states||=[];n.states.push(st);
  runtime.travelMapItemsAt=0;await refreshTravelMapItems(true);await saveTravelState({applyBackground:false});render();
  showToast("NODE STATE",`${name} saved · ${n.activeStateId?"current State unchanged":"DEFAULT remains active"}`,"message",false);
}
async function travelSetNodeStateBackground(stateId,itemId){
  if(runtime.currentPlayer.role!=="GM")return;const s=travelSession(),n=travelSelectedNode(),st=travelNodeStateById(n,stateId);if(!s||!n||!st)return;
  if(travelAllFrameIds(s).includes(String(itemId||"")))return;st.backgroundItemId=String(itemId||"");
  if(!st.backgroundItemId)st.backgroundSnapshot=null;else{const item=travelMapItemById(st.backgroundItemId);if(item)st.backgroundSnapshot=travelImageSnapshot(item);}
  await saveTravelState({applyBackground:String(n.activeStateId||"")===String(st.id)});render();
}
async function travelSetNodeStateActive(stateId=""){
  if(runtime.currentPlayer.role!=="GM")return;const n=travelSelectedNode();if(!n)return;
  const next=String(stateId||"");if(next&&!travelNodeStateById(n,next))return;n.activeStateId=next;await saveTravelState();render();
  const st=travelNodeActiveState(n);showToast("NODE STATE",st?`ACTIVE · ${st.name}`:"DEFAULT BACKGROUND ACTIVE","message",false);
}
async function travelDeleteNodeState(stateId){
  if(runtime.currentPlayer.role!=="GM")return;const n=travelSelectedNode(),st=travelNodeStateById(n,stateId);if(!n||!st)return;if(!confirm(`Delete Node State ${st.name}?`))return;
  n.states=(n.states||[]).filter(x=>String(x.id)!==String(st.id));if(String(n.activeStateId||"")===String(st.id))n.activeStateId=n.states[0]?.id||"";await saveTravelState();render();
}
// v2.127 keeps v2.125 anchor stability and makes Travel crossfade viewport-anchored instead of Blank-anchored.
// v2.125: keep BOTH the reusable Blank footprint and its image-grid anchor stable.
// Owlbear Image items use grid.offset as the local image origin. v2.124 changed native width/height
// without moving that offset, so a larger source image could visually slide away from the Blank position.
// Scale the offset with the native pixel dimensions while inversely compensating item scale.
function travelResolutionAwareImageSwap(item, desiredImage, slotMeta = null) {
  const oldW=Math.max(1,Number(item?.image?.width)||Number(desiredImage?.width)||1), oldH=Math.max(1,Number(item?.image?.height)||Number(desiredImage?.height)||1);
  const rawSX=Number(item?.scale?.x), rawSY=Number(item?.scale?.y), sx=Number.isFinite(rawSX)&&rawSX!==0?rawSX:1, sy=Number.isFinite(rawSY)&&rawSY!==0?rawSY:1;
  const requestedW=Math.round(Number(desiredImage?.width)||0), requestedH=Math.round(Number(desiredImage?.height)||0);
  const nextW=Math.max(1,requestedW||oldW), nextH=Math.max(1,requestedH||oldH);
  const worldW=oldW*Math.abs(sx), worldH=oldH*Math.abs(sy);
  const baseImage=slotMeta?.blankImage||item?.image||{};
  const baseGrid=slotMeta?.blankGrid||item?.grid||{};
  const baseW=Math.max(1,Number(baseImage?.width)||oldW),baseH=Math.max(1,Number(baseImage?.height)||oldH);
  const baseOffX=Number(baseGrid?.offset?.x),baseOffY=Number(baseGrid?.offset?.y);
  const anchorX=Number.isFinite(baseOffX)?baseOffX/baseW:0.5,anchorY=Number.isFinite(baseOffY)?baseOffY/baseH:0.5;
  const currentDpi=Math.max(1,Number(item?.grid?.dpi)||Number(baseGrid?.dpi)||150);
  return {
    width:nextW,height:nextH,
    scale:{x:(sx<0?-1:1)*(worldW/nextW),y:(sy<0?-1:1)*(worldH/nextH)},
    grid:{...(item?.grid||baseGrid||{}),dpi:currentDpi,offset:{x:anchorX*nextW,y:anchorY*nextH}}
  };
}
function travelDisplayGridMatches(item, desiredImage, slotMeta = null) {
  const w=Math.max(1,Math.round(Number(desiredImage?.width)||Number(item?.image?.width)||1)),h=Math.max(1,Math.round(Number(desiredImage?.height)||Number(item?.image?.height)||1));
  const baseImage=slotMeta?.blankImage||item?.image||{},baseGrid=slotMeta?.blankGrid||item?.grid||{};
  const bw=Math.max(1,Number(baseImage?.width)||w),bh=Math.max(1,Number(baseImage?.height)||h);
  const bx=Number(baseGrid?.offset?.x),by=Number(baseGrid?.offset?.y),ax=Number.isFinite(bx)?bx/bw:0.5,ay=Number.isFinite(by)?by/bh:0.5;
  const ox=Number(item?.grid?.offset?.x),oy=Number(item?.grid?.offset?.y);
  return Number.isFinite(ox)&&Number.isFinite(oy)&&Math.abs(ox-ax*w)<0.01&&Math.abs(oy-ay*h)<0.01;
}
async function replaceTravelDisplayImage(frame, sourceItem, session, activeNode = null, slotName="MAIN", savedSnapshot = null) {
  if(!frame||frame.type!=="IMAGE"||PREVIEW)return;
  const slot=travelDisplayMeta(session,frame.image?.width,frame.image?.height,frame); slot.slot=slotName;
  const snapshot=normalizeTravelImageSnapshot(savedSnapshot||travelNodeBackgroundSnapshot(activeNode)||{});
  const source=sourceItem?.type==="IMAGE"?sourceItem.image:(snapshot?{url:snapshot.url,mime:snapshot.mime,width:snapshot.width,height:snapshot.height}:null);
  const fallback=slot.blankImage||travelBlankContent(frame.image?.width,frame.image?.height);
  const desired=source||fallback;
  const sourceId=String(sourceItem?.id||travelNodeActiveState(activeNode)?.backgroundItemId||activeNode?.backgroundItemId||"");
  const sourceName=String(sourceItem?.name||snapshot?.name||travelNodeActiveState(activeNode)?.name||activeNode?.name||"NODE");
  const desiredW=Math.round(Number(desired?.width)||0),desiredH=Math.round(Number(desired?.height)||0);
  const same=String(frame.image?.url||"")===String(desired?.url||"")&&String(frame.image?.mime||"")===String(desired?.mime||"")&&(!desiredW||Number(frame.image?.width)===desiredW)&&(!desiredH||Number(frame.image?.height)===desiredH)&&travelDisplayGridMatches(frame,desired,slot)&&String(slot.sourceItemId||"")===sourceId&&frame.visible!==false;
  if(same)return;
  await OBR.scene.items.updateItems([frame],xs=>{for(const x of xs){
    const resolution=travelResolutionAwareImageSwap(x,desired,slot);
    x.image={...(x.image||{}),url:String(desired?.url||TRAVEL_BLANK_IMAGE_URL),mime:String(desired?.mime||"image/svg+xml"),width:resolution.width,height:resolution.height};
    x.grid=resolution.grid;
    x.scale=resolution.scale;
    x.visible=true;x.metadata||={};x.metadata[TRAVEL_FRAME_META_KEY]=session.id;
    x.metadata[TRAVEL_DISPLAY_META_KEY]={...slot,sourceItemId:sourceId,slot:slotName};
    const slotLabel=slotName==="MAIN"?"MAIN":`GROUP ${slotName}`;
    x.name=source?`LYNX TRAVEL ${slotLabel} DISPLAY · ${activeNode?.name||sourceName}`:`LYNX TRAVEL ${slotLabel} BLANK · ${session.name}`;
  }});
}
async function applyTravelBackgroundDirect() {
  if (runtime.currentPlayer.role !== "GM" || PREVIEW || !OBR || !await OBR.scene.isReady()) return;
  const s=travelSession(); if(!s)return;
  const desired=[];
  if(s.splitActive){ desired.push(["MAIN",null]); desired.push(["A",travelCurrentRef(s,"A")]); desired.push(["B",travelCurrentRef(s,"B")]); }
  else { desired.push(["MAIN",travelCurrentRef(s,"MAIN")]); desired.push(["A",null]); desired.push(["B",null]); }
  const applySig=desired.map(([slot,cur])=>{const mm=cur?s.maps.find(m=>String(m.id)===String(cur.mapId)):null,nn=mm?.nodes?.find(n=>String(n.id)===String(cur?.nodeId));return [slot,travelFrameId(s,slot),cur?.mapId||"",cur?.nodeId||"",travelNodeBackgroundId(mm,nn)].join("~");}).join("|");
  if(applySig===String(runtime.travelAppliedBackgroundSig||"")&&Date.now()-(Number(runtime.travelAppliedBackgroundAt)||0)<1200)return;
  const allIds=new Set();
  for(const [slot,cur] of desired){const fid=travelFrameId(s,slot);if(fid)allIds.add(fid);if(cur){const mm=s.maps.find(m=>m.id===cur.mapId),nn=mm?.nodes.find(n=>n.id===cur.nodeId),sid=travelNodeBackgroundId(mm,nn);if(sid)allIds.add(sid);}}
  if(!allIds.size)return;
  const items=await OBR.scene.items.getItems([...allIds]),byId=new Map(items.map(x=>[String(x.id),x]));
  for(const [slot,cur] of desired){
    let frame=byId.get(travelFrameId(s,slot)); if(!frame)continue;
    if(frame.type==="SHAPE"){frame=await convertTravelFrameShapeToImage(s,frame,slot);}
    if(!frame||frame.type!=="IMAGE")continue;
    let source=null,node=null;
    if(cur){const mm=s.maps.find(m=>m.id===cur.mapId);node=mm?.nodes.find(n=>n.id===cur.nodeId)||null;source=byId.get(travelNodeBackgroundId(mm,node))||null;}
    await replaceTravelDisplayImage(frame,source,s,node,slot,travelNodeBackgroundSnapshot(node));
  }
  runtime.travelAppliedBackgroundSig=applySig;
  runtime.travelAppliedBackgroundAt=Date.now();
}

function travelSessionCardHTML(s) {
  const active = s.id === travelState().activeSessionId, nodeCount = (s.maps||[]).reduce((n,m)=>n+(m.nodes?.length||0),0);
  return `<article class="travel-session-card ${active?"active":""}"><button class="travel-session-open" data-travel-session-open="${esc(s.id)}"><span>▰</span><b>${esc(s.name)}</b><small>${s.maps.length} MAPS · ${nodeCount} NODES</small></button><div>${active?`<button class="mini-btn" data-travel-session-rename="${esc(s.id)}">RENAME</button>`:`<button class="mini-btn" data-travel-session-open="${esc(s.id)}">LOAD</button>`}<button class="mini-btn" data-travel-session-duplicate="${esc(s.id)}">COPY</button><button class="mini-btn danger-soft" data-travel-session-delete="${esc(s.id)}">DELETE</button></div></article>`;
}
function travelNodeOptions(session, selected = "") {
  return travelAllNodes(session).map(({map,node}) => `<option value="${esc(map.id)}|${esc(node.id)}" ${`${map.id}|${node.id}`===selected?"selected":""}>${esc(map.name)} · ${esc(node.name)}</option>`).join("");
}
const TRAVEL_BASE_W = 1800, TRAVEL_BASE_H = 1100, TRAVEL_WORLD_PAD = 900;
function travelNodeWorldPos(node) {
  return { x: (Number(node?.x)||0) / 100 * TRAVEL_BASE_W, y: (Number(node?.y)||0) / 100 * TRAVEL_BASE_H };
}
function travelMapWorldMetrics(map) {
  let maxX = TRAVEL_BASE_W, maxY = TRAVEL_BASE_H;
  for (const n of map?.nodes || []) {
    const p = travelNodeWorldPos(n); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  return { width: Math.max(TRAVEL_BASE_W, Math.ceil(maxX + TRAVEL_WORLD_PAD)), height: Math.max(TRAVEL_BASE_H, Math.ceil(maxY + TRAVEL_WORLD_PAD)) };
}
function travelMapNodeBounds(map) {
  const pts=(map?.nodes||[]).map(travelNodeWorldPos);
  if(!pts.length) return { minX:0,minY:0,maxX:TRAVEL_BASE_W,maxY:TRAVEL_BASE_H };
  return { minX:Math.min(...pts.map(p=>p.x)), minY:Math.min(...pts.map(p=>p.y)), maxX:Math.max(...pts.map(p=>p.x)), maxY:Math.max(...pts.map(p=>p.y)) };
}
function travelEnsurePositiveOrigin(map, mapId) {
  if(!map?.nodes?.length) return;
  let minX=Math.min(...map.nodes.map(n=>Number(n.x)||0)), minY=Math.min(...map.nodes.map(n=>Number(n.y)||0));
  const dx=minX<3?3-minX:0, dy=minY<4?4-minY:0; if(!dx&&!dy)return;
  for(const n of map.nodes){n.x=(Number(n.x)||0)+dx;n.y=(Number(n.y)||0)+dy;}
  const v=travelBoardView(travelSession(),mapId||map.id); v.panX-=dx/100*TRAVEL_BASE_W*v.zoom; v.panY-=dy/100*TRAVEL_BASE_H*v.zoom;
}
function travelMultiSelection(mapId) {
  const id=String(mapId||""); runtime.travelMultiSelected ||= {};
  const raw=Array.isArray(runtime.travelMultiSelected[id])?runtime.travelMultiSelected[id]:[];
  const map=travelSession()?.maps?.find(m=>String(m.id)===id), valid=new Set((map?.nodes||[]).map(n=>String(n.id)));
  const clean=[...new Set(raw.map(String).filter(x=>valid.has(x)))]; runtime.travelMultiSelected[id]=clean; return clean;
}
function travelSetMultiSelection(mapId, ids=[]) { runtime.travelMultiSelected ||= {}; runtime.travelMultiSelected[String(mapId||"")]=[...new Set((ids||[]).map(String))]; return runtime.travelMultiSelected[String(mapId||"")]; }
function travelClearMultiSelection(mapId=null) { runtime.travelMultiSelected ||= {}; if(mapId==null) runtime.travelMultiSelected={}; else runtime.travelMultiSelected[String(mapId||"")]=[]; }
function travelToggleMultiNode(mapId,nodeId){const cur=new Set(travelMultiSelection(mapId)),id=String(nodeId||"");if(cur.has(id))cur.delete(id);else cur.add(id);travelSetMultiSelection(mapId,[...cur]);}
function travelBoardViewKey(session, mapId) { return `${session?.id||"session"}|${mapId||"map"}`; }
function travelBoardView(session = travelSession(), mapId = runtime.travelEditorMapId || session?.current?.mapId) {
  const key = travelBoardViewKey(session, mapId); runtime.travelBoardViews ||= {};
  return runtime.travelBoardViews[key] ||= { zoom: 0.42, panX: 12, panY: 12 };
}
function travelCurrentInfo(session = travelSession(), groupId = travelViewerGroupId(session)) {
  const cur=travelCurrentRef(session,groupId);
  const map = session?.maps?.find(m=>m.id===cur?.mapId) || null;
  const node = map?.nodes?.find(n=>n.id===cur?.nodeId) || null;
  return { map, node, current:cur, groupId };
}
function travelAdjacentLinks(session = travelSession(), groupId = travelViewerGroupId(session)) {
  const {map,node}=travelCurrentInfo(session,groupId); if(!map||!node)return [];
  return travelNodeLinks(node).map((link,index)=>{
    const map2=session.maps.find(m=>String(m.id)===String(link.mapId)), node2=map2?.nodes?.find(n=>String(n.id)===String(link.nodeId));
    return {index,link,map:map2,node:node2};
  }).filter(x=>x.map&&x.node);
}
function travelTargetIsAdjacent(session,mapId,nodeId,groupId=travelViewerGroupId(session)){return travelAdjacentLinks(session,groupId).some(x=>x.map.id===mapId&&x.node.id===nodeId);}
function applyTravelBoardView(mapId = runtime.travelEditorMapId || travelSession()?.current?.mapId) {
  const session=travelSession(); if(!session)return; const board=document.querySelector(`.travel-board[data-travel-board="${CSS.escape(mapId||"")}"]`); if(!board)return;
  const world=board.querySelector('.travel-world'), label=board.querySelector('[data-travel-zoom-label]'), v=travelBoardView(session,mapId);
  if(world){world.style.transform=`translate(${v.panX}px,${v.panY}px) scale(${v.zoom})`;world.style.setProperty('--travel-inv-zoom',String(1/Math.max(v.zoom,0.25)));world.dataset.travelZoomLevel=v.zoom<0.12?'far':(v.zoom<0.25?'overview':'normal');}
  if(label)label.textContent=`${Math.round(v.zoom*100)}%`;
}
function scheduleTravelBoardView(mapId = runtime.travelEditorMapId || travelSession()?.current?.mapId) {
  const key=String(mapId||""); if(!key)return; runtime.travelBoardViewFrames||={};
  if(runtime.travelBoardViewFrames[key])return;
  runtime.travelBoardViewFrames[key]=requestAnimationFrame(()=>{delete runtime.travelBoardViewFrames[key];applyTravelBoardView(key);});
}
function travelBoardPerfMode(board, holdMs=120) {
  if(!board)return; const key=String(board.dataset?.travelBoard||"board"); runtime.travelBoardPerfTimers||={};
  board.classList.add('travel-perf-interacting');
  clearTimeout(runtime.travelBoardPerfTimers[key]);
  runtime.travelBoardPerfTimers[key]=setTimeout(()=>{board.classList.remove('travel-perf-interacting');delete runtime.travelBoardPerfTimers[key];},Math.max(40,Number(holdMs)||120));
}
function travelZoomAt(mapId,nextZoom,clientX=null,clientY=null){
  const session=travelSession(); if(!session)return; const board=document.querySelector(`.travel-board[data-travel-board="${CSS.escape(mapId||"")}"]`);if(!board)return;
  const v=travelBoardView(session,mapId), old=v.zoom, nz=clamp(Number(nextZoom)||old,0.05,3.5), r=board.getBoundingClientRect();
  const cx=clientX==null?r.left+r.width/2:clientX, cy=clientY==null?r.top+r.height/2:clientY;
  const wx=(cx-r.left-v.panX)/old, wy=(cy-r.top-v.panY)/old;
  v.zoom=nz; v.panX=(cx-r.left)-wx*nz; v.panY=(cy-r.top)-wy*nz; scheduleTravelBoardView(mapId);
}
function travelZoomAction(action,mapId=runtime.travelEditorMapId||travelSession()?.current?.mapId){
  const session=travelSession();if(!session)return;const board=document.querySelector(`.travel-board[data-travel-board="${CSS.escape(mapId||"")}"]`);if(!board)return;const v=travelBoardView(session,mapId);
  if(action==='in')travelZoomAt(mapId,v.zoom*1.22);else if(action==='out')travelZoomAt(mapId,v.zoom/1.22);else if(action==='100'){v.zoom=1;v.panX=12;v.panY=12;applyTravelBoardView(mapId);}else if(action==='current'){const cur=travelCurrentRef(session),n=travelNode(session,mapId,cur?.mapId===mapId?cur?.nodeId:'');if(n){const p=travelNodeWorldPos(n),r=board.getBoundingClientRect();v.panX=r.width/2-p.x*v.zoom;v.panY=r.height/2-p.y*v.zoom;applyTravelBoardView(mapId);}}else if(action==='fit'){
    const map=session.maps.find(x=>x.id===mapId),bounds=travelMapNodeBounds(map),r=board.getBoundingClientRect(),pad=260,bw=Math.max(500,bounds.maxX-bounds.minX+pad*2),bh=Math.max(360,bounds.maxY-bounds.minY+pad*2),z=clamp(Math.min((r.width-24)/bw,(r.height-24)/bh),0.08,2.5);v.zoom=z;v.panX=(r.width-(bounds.minX+bounds.maxX)*z)/2;v.panY=(r.height-(bounds.minY+bounds.maxY)*z)/2;applyTravelBoardView(mapId);
  }
}
function travelGroupBadgesHTML(session,mapId,nodeId){
  if(!session?.splitActive)return session?.current?.mapId===mapId&&session?.current?.nodeId===nodeId?`<span class="travel-group-badge main">MAIN</span>`:"";
  const out=[];for(const g of ["A","B"]){const c=travelCurrentRef(session,g);if(c.mapId===mapId&&c.nodeId===nodeId)out.push(`<span class="travel-group-badge group-${g.toLowerCase()}">${g}</span>`);}return out.join("");
}
function travelBranchCount(node){return travelNodeLinks(node).length;}
function travelCanSplitHere(session,mapId,nodeId,viewerGroup=travelViewerGroupId(session)){
  if(!session||session.splitActive)return false;const cur=travelCurrentRef(session,"MAIN");if(cur.mapId!==mapId||cur.nodeId!==nodeId)return false;const m=session.maps.find(x=>x.id===mapId),n=m?.nodes.find(x=>x.id===nodeId);return !!n&&travelBranchCount(n)>=2;
}
function travelGroupsSameNode(session){if(!session?.splitActive)return false;const a=travelCurrentRef(session,"A"),b=travelCurrentRef(session,"B");return !!a.nodeId&&a.mapId===b.mapId&&a.nodeId===b.nodeId;}
function travelBoardHTML(session, map) {
  if (!map) return `<div class="travel-empty">NO MAP TAB</div>`;
  const gm = runtime.currentPlayer.role === "GM", gmWalk=travelGMUsesPlayerRules(), movementActor=!gm||gmWalk, current = travelCurrentRef(session), viewerGroup=travelViewerGroupId(session), pendingMove=travelPendingMove(session,viewerGroup), adjacent=travelAdjacentLinks(session,viewerGroup);
  const adjacentKeys=new Set(adjacent.map(x=>`${x.map.id}|${x.node.id}`));
  const known = n => gm || travelKnownNode(session,map.id,n.id);
  const visited = n => travelWasVisited(session,map.id,n.id);
  const nodes = map.nodes.filter(n=>gm||known(n)||adjacentKeys.has(`${map.id}|${n.id}`));
  const item = travelMapItemById(map.itemId), bg = item?.image?.url ? `background-image:linear-gradient(rgba(4,12,17,.25),rgba(4,12,17,.55)),url('${esc(String(item.image.url).replaceAll("'","%27"))}');` : "";
  const metrics=travelMapWorldMetrics(map), lines = [], seen = new Set(), multiSelected = new Set(gm?travelMultiSelection(map.id):[]), nodeById=new Map((map.nodes||[]).map(n=>[String(n.id),n]));
  for (const a of map.nodes) for (const l of travelNodeLinks(a)) {
    if (l.mapId !== map.id) continue; const b = nodeById.get(String(l.nodeId)); if (!b) continue;
    const aPlayerKnown=travelPlayerKnowsNode(session,map.id,a.id),bPlayerKnown=travelPlayerKnowsNode(session,map.id,b.id),aKnown=gm||aPlayerKnown,bKnown=gm||bPlayerKnown,fromCurrent=current.mapId===map.id&&current.nodeId===a.id&&adjacentKeys.has(`${map.id}|${b.id}`),toCurrent=current.mapId===map.id&&current.nodeId===b.id&&adjacentKeys.has(`${map.id}|${a.id}`);
    if (!gm && !(aKnown&&bKnown) && !fromCurrent && !toCurrent) continue;
    const key=[a.id,b.id].sort().join("|"); if (seen.has(key)) continue; seen.add(key);
    const pa=travelNodeWorldPos(a),pb=travelNodeWorldPos(b),lockedRoute=(fromCurrent&&b.locked)||(toCurrent&&a.locked),aVisited=visited(a),bVisited=visited(b),routeKnown=aPlayerKnown&&bPlayerKnown,unvisitedRoute=routeKnown&&(!aVisited||!bVisited);
    lines.push(`<line class="${fromCurrent||toCurrent?'reachable':''} ${unvisitedRoute?'unvisited-route':'visited-route'} ${lockedRoute?'locked-route':''}" data-a="${esc(a.id)}" data-b="${esc(b.id)}" x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}" />`);
  }
  const v=travelBoardView(session,map.id);
  const exploredCount=(session?.discoveredNodes?.[map.id]||[]).filter(id=>nodeById.has(String(id))).length;
  const totalNodeCount=Array.isArray(map.nodes)?map.nodes.length:0;
  const remainingNodeCount=Math.max(0,totalNodeCount-exploredCount);
  const exploredBadge=!gm?`<div class="travel-explored-count" title="${remainingNodeCount} node${remainingNodeCount===1?'':'s'} remaining on this Map"><span>EXPLORED</span><b>${exploredCount}/${totalNodeCount}</b><small>NODES</small></div>`:"";
  const nodeHtml=nodes.map(n=>{
    const isCurrent=current.mapId===map.id&&current.nodeId===n.id, reachable=movementActor&&!pendingMove&&adjacentKeys.has(`${map.id}|${n.id}`), playerKnown=travelPlayerKnowsNode(session,map.id,n.id), isKnown=gm||playerKnown, wasVisited=visited(n), routeDiscovered=playerKnown&&!wasVisited, p=travelNodeWorldPos(n);
    // v3.0.41: first-step routes remain visible after discovery. They expose the Node
    // identity/location but not its preview/detail until the party actually visits it.
    const label=gm||isKnown||(reachable&&!n.locked)?n.name:(n.locked?'🔒 LOCKED':'????');
    const previewReady = (gm || wasVisited) && !!travelNodePreviewURL(map,n);
    const activeState=travelNodeActiveState(n),gmVisibility=wasVisited?'VISITED':(routeDiscovered?'ROUTE FOUND · UNVISITED':'HIDDEN'),gmStatus=[n.locked?'LOCKED':'OPEN',gmVisibility,n.secret?'SECRET':'',activeState?`STATE: ${activeState.name}`:'DEFAULT'].filter(Boolean).join(' · ');
    const playerStatus=n.locked?(reachable?'🔒 LOCKED · CLICK FOR RULE':'🔒 LOCKED'):(reachable?(routeDiscovered?'UNVISITED · CLICK TO MOVE':'CLICK TO MOVE'):(routeDiscovered?'ROUTE FOUND · UNVISITED':(previewReady?'HOVER PREVIEW':'')));
    const anchor=runtime.travelConnectAnchor, isAnchor=gm&&runtime.travelConnectMode&&anchor&&String(anchor.mapId)===String(map.id)&&String(anchor.nodeId)===String(n.id);
    return `<button class="travel-node ${isCurrent?'current':''} ${wasVisited?'visited':''} ${routeDiscovered?'route-discovered unvisited':''} ${reachable?'reachable':''} ${n.locked?'locked':''} ${n.secret?'secret':''} ${previewReady?'has-preview':''} ${gm&&!wasVisited&&!routeDiscovered?'gm-hidden':''} ${runtime.travelSelectedNodeId===n.id&&gm?'selected':''} ${multiSelected.has(String(n.id))?'multi-selected':''} ${isAnchor?'link-anchor':''} ${gm&&runtime.travelConnectMode?'link-mode':''}" style="left:${p.x}px;top:${p.y}px" data-travel-node="${esc(n.id)}" data-travel-map-node="${esc(map.id)}" ${gm&&runtime.travelConnectMode?'data-travel-connect-node="1"':''} ${previewReady?`data-travel-preview="1"`:''} ${reachable?`data-travel-node-go="${esc(map.id)}|${esc(n.id)}"`:''} aria-disabled="${n.locked?'true':'false'}"><b>${esc(label)}</b><small>${gm?`${esc(gmStatus)} · ${travelBranchCount(n)} LINK${travelBranchCount(n)===1?'':'S'} · ${Math.round(n.x)},${Math.round(n.y)}`:esc(playerStatus)}</small>${travelGroupBadgesHTML(session,map.id,n.id)}${travelMemberMarkersHTML(session,map.id,n.id)}</button>`;
  }).join("");
  const crossMap=adjacent.filter(x=>x.map.id!==map.id);
  const exits=current.mapId===map.id&&!pendingMove?crossMap.map((x,i)=>{const perCol=6,col=Math.floor(i/perCol),row=i%perCol,rows=Math.min(perCol,crossMap.length-col*perCol),px=TRAVEL_BASE_W-100-col*175,py=100+(TRAVEL_BASE_H-200)*(row+1)/(rows+1),playerKnown=travelPlayerKnowsNode(session,x.map.id,x.node.id),isKnown=gm||playerKnown,wasVisited=travelWasVisited(session,x.map.id,x.node.id),routeDiscovered=playerKnown&&!wasVisited,label=gm||isKnown?`${x.node.name} · ${x.map.name}`:(!x.node.locked?x.node.name:'🔒 LOCKED'),previewReady=(gm||wasVisited)&&!!travelNodePreviewURL(x.map,x.node);return `<button class="travel-node travel-exit-node ${wasVisited?'visited':''} ${routeDiscovered?'route-discovered unvisited':''} reachable ${x.node.locked?'locked':''} ${previewReady?'has-preview':''}" style="left:${px}px;top:${py}px" data-travel-map-node="${esc(x.map.id)}" data-travel-node="${esc(x.node.id)}" ${previewReady?'data-travel-preview="1"':''} data-travel-node-go="${esc(x.map.id)}|${esc(x.node.id)}" aria-disabled="${x.node.locked?'true':'false'}"><b>${esc(label)}</b><small>${x.node.locked?'🔒 LOCKED · CLICK FOR RULE':`${routeDiscovered?'ROUTE FOUND · UNVISITED':(gm||isKnown?'CONNECTED MAP':'ONE STEP')} · ↔`}</small>${travelGroupBadgesHTML(session,x.map.id,x.node.id)}${travelMemberMarkersHTML(session,x.map.id,x.node.id)}</button>`;}).join(''):'';
  return `<div class="travel-board ${pendingMove?'move-pending':''}" data-travel-board="${esc(map.id)}"><div class="travel-world" data-travel-world data-travel-zoom-level="${v.zoom<0.12?'far':(v.zoom<0.25?'overview':'normal')}" style="width:${metrics.width}px;height:${metrics.height}px;--travel-inv-zoom:${1/Math.max(v.zoom,0.25)};transform:translate(${v.panX}px,${v.panY}px) scale(${v.zoom});${bg}"><svg viewBox="0 0 ${metrics.width} ${metrics.height}" preserveAspectRatio="none">${lines.join("")}</svg>${travelMarkerMotionsHTML(session,map)}${nodeHtml}${exits}</div><div class="travel-marquee" data-travel-marquee-box></div><div class="travel-zoom-controls"><button data-travel-zoom="out" title="Zoom out">−</button><span data-travel-zoom-label>${Math.round(v.zoom*100)}%</span><button data-travel-zoom="in" title="Zoom in">＋</button><button data-travel-zoom="fit">FIT NODES</button><button data-travel-zoom="current">CURRENT</button><button data-travel-zoom="100">100%</button></div>${exploredBadge}<div class="travel-board-tip">${gm?(gmWalk?"GM PLAYER-RULE WALK · CLICK ANY CONNECTED NODE · SHIFT+DRAG = EDIT NODE · DRAG EMPTY AREA / MIDDLE-DRAG = PAN · WHEEL = ZOOM · RIGHT-CLICK EMPTY AREA = MODE MENU":(runtime.travelConnectMode?(runtime.travelConnectAnchor?"LINK MODE ON · PICK NODE B · CONNECTED PAIR = UNLINK · RIGHT-CLICK EMPTY AREA TO TURN OFF":"LINK MODE ON · CLICK NODE A THEN B · SAME PAIR TOGGLES LINK / UNLINK · RIGHT-CLICK EMPTY AREA TO TURN OFF") : "UNBOUNDED GRAPH · DRAG EMPTY = PAN · SHIFT+DRAG EMPTY = BOX SELECT · DRAG A SELECTED NODE = MOVE GROUP · CTRL/⌘+CLICK = TOGGLE NODE · WHEEL = ZOOM")):"AMBER = ROUTE FOUND / UNVISITED · CLICK ANY CONNECTED NODE · ONE EDGE PER STEP · DRAG EMPTY AREA / MIDDLE-DRAG = PAN · WHEEL = ZOOM"}</div></div>`;
}
function travelMovementHTML(session) {
  const {node,groupId}=travelCurrentInfo(session);
  if (!node) return `<div class="travel-click-help"><div class="empty">GM: SET A CURRENT NODE TO START TRAVEL</div></div>`;
  const pending=travelPendingMove(session,groupId),approval=(travelApprovalEnabled()||COMPANION_TRAVEL)&&runtime.currentPlayer.role!=="GM";
  const text=pending?(pending.awaitingApproval?'REQUEST SENT · WAITING FOR GM APPROVAL':'SYNCING MOVE… WAITING FOR GM ACK · AUTO-RECOVERY IN 5s'):(approval?'CLICK A CONNECTED NODE · GM MUST APPROVE EVERY STEP':'CLICK ONE CONNECTED NODE TO MOVE · ONE EDGE PER STEP');
  return `<div class="travel-click-help ${pending?'pending':''} ${approval?'approval-required':''}"><b>${session?.splitActive?`GROUP ${esc(groupId)}`:"MAIN"} · NODE MOVEMENT</b><span>${text}</span></div>`;
}
function travelNodeStatusText(session,map,node){
  if(!node)return "";
  const visited=travelWasVisited(session,map.id,node.id),routeDiscovered=travelPlayerKnowsNode(session,map.id,node.id)&&!visited;
  return [node.locked?'LOCKED':'OPEN',visited?'VISITED':(routeDiscovered?'ROUTE FOUND · UNVISITED':'HIDDEN'),node.secret?'SECRET':''].filter(Boolean).join(' · ');
}
function travelNodeDefaultBackgroundLabel(map,node){
  const id=String(node?.backgroundItemId||map?.itemId||"");
  if(!id)return "NO DEFAULT BACKGROUND";
  const live=travelMapItemById(id);
  return live?travelMapItemName(live):(node?.backgroundSnapshot?.name||"SAVED SNAPSHOT");
}
function travelNodeStatesEditorHTML(map,node,mapItems=[]){
  if(!node)return"";
  const states=Array.isArray(node.states)?node.states:[],active=travelNodeActiveState(node),activeId=String(node.activeStateId||"");
  const nodeBgId=String(node.backgroundItemId||map?.itemId||"");
  const savedBgMissing=!!(node?.backgroundSnapshot?.url&&nodeBgId&&!travelMapItemById(nodeBgId));
  const savedBgOption=savedBgMissing?`<option value="${esc(nodeBgId)}" selected>💾 SAVED SNAPSHOT · ${esc(node.backgroundSnapshot.name||"DELETED SOURCE")}</option>`:"";
  const defaultOptions=`<option value="">— NO BACKGROUND —</option>${savedBgOption}${mapItems.map(x=>`<option value="${esc(x.id)}" ${String(x.id)===nodeBgId?"selected":""}>${esc(travelMapItemName(x))}</option>`).join("")}`;
  const activeOptions=`<option value="" ${activeId?'':'selected'}>DEFAULT · ${esc(travelNodeDefaultBackgroundLabel(map,node))}</option>${states.map(st=>`<option value="${esc(st.id)}" ${String(st.id)===activeId?'selected':''}>${esc(st.name||'STATE')}</option>`).join('')}`;
  const rows=states.map((st,i)=>{
    const sid=String(st.id||""),bgid=String(st.backgroundItemId||""),missing=!!(st.backgroundSnapshot?.url&&bgid&&!travelMapItemById(bgid));
    const saved=missing?`<option value="${esc(bgid)}" selected>💾 SAVED SNAPSHOT · ${esc(st.backgroundSnapshot?.name||"DELETED SOURCE")}</option>`:"";
    const opts=`<option value="">— FALL BACK TO DEFAULT —</option>${saved}${mapItems.map(x=>`<option value="${esc(x.id)}" ${String(x.id)===bgid?"selected":""}>${esc(travelMapItemName(x))}</option>`).join("")}`;
    const isActive=activeId===sid;
    return `<details class="travel-state-compact ${isActive?'active':''}"><summary><span>${isActive?'●':'○'} ${esc(st.name||`STATE ${i+1}`)}</span><small>${isActive?'ACTIVE':(bgid?'READY':'USES DEFAULT')}</small></summary><div class="travel-state-compact-body"><label>STATE NAME<input data-travel-state-name="${esc(sid)}" value="${esc(st.name||"")}"></label><label>BACKGROUND<select data-travel-state-bg-item="${esc(sid)}">${opts}</select></label><label>PREVIEW IMAGE<input data-travel-state-preview="${esc(sid)}" value="${esc(st.previewUrl||"")}" placeholder="Optional · blank = State Background"></label><div class="travel-editor-actions"><button class="mini-btn ${isActive?'active':''}" data-travel-state-active="${esc(sid)}" ${isActive?'disabled':''}>${isActive?'ACTIVE NOW':'SET ACTIVE'}</button><button class="mini-btn danger-soft" data-travel-state-delete="${esc(sid)}">DELETE</button></div></div></details>`;
  }).join("");
  return `<div class="travel-background-state-unified"><div class="travel-editor-title"><b>BACKGROUND STATES</b><span>${active?`ACTIVE · ${esc(active.name)}`:'DEFAULT ACTIVE'}</span></div><p class="travel-inspector-note">The background already linked to this Node is automatically its <b>DEFAULT state</b>. Add only alternate versions here — no re-linking required.</p><label>ACTIVE VERSION<select data-travel-node-active-state>${activeOptions}</select></label><div class="travel-default-state-card ${activeId?'':'active'}"><div class="travel-editor-title"><b>DEFAULT · NODE EDITOR BACKGROUND</b><span>${activeId?'READY':'ACTIVE'}</span></div><label>DEFAULT BACKGROUND<select data-travel-node-bg-item>${defaultOptions}</select></label><div class="travel-editor-actions"><button class="mini-btn active" data-travel-node-bg-link-selected>LINK SELECTED AS DEFAULT</button><button class="mini-btn" data-travel-map-refresh>REFRESH LIST</button></div><small>${nodeBgId?`SOURCE · ${esc(travelNodeDefaultBackgroundLabel(map,node))}`:'No default image yet. Link one once here; it is immediately available as DEFAULT in Node States.'}</small><label>DEFAULT PREVIEW IMAGE<input data-travel-node-field="previewUrl" value="${esc(node.previewUrl||"")}" placeholder="Optional · blank = active background image"></label></div><div class="travel-state-toolbar"><b>ALTERNATE STATES · ${states.length}</b><button class="mini-btn active" data-travel-state-add-selected>+ ADD FROM SELECTED BACKGROUND</button></div><div class="travel-state-compact-list">${rows||'<div class="travel-state-empty">NO ALTERNATE STATES · DEFAULT is already ready from Node Editor.</div>'}</div></div>`;
}
function travelNodeListHTML(session,map){
  const filter=String(runtime.travelNodeFilter||'ALL').toUpperCase(),q=String(runtime.travelNodeSearch||'').trim().toLowerCase();
  const counts={ALL:map.nodes.length,OPEN:0,LOCKED:0,HIDDEN:0,VISITED:0};
  for(const n of map.nodes){if(n.locked)counts.LOCKED++;else counts.OPEN++;if(travelWasVisited(session,map.id,n.id))counts.VISITED++;else counts.HIDDEN++;}
  const matches=n=>{const visited=travelWasVisited(session,map.id,n.id);if(filter==='OPEN'&&n.locked)return false;if(filter==='LOCKED'&&!n.locked)return false;if(filter==='HIDDEN'&&visited)return false;if(filter==='VISITED'&&!visited)return false;if(q&&!`${n.name} ${n.detail||''}`.toLowerCase().includes(q))return false;return true;};
  const rows=map.nodes.filter(matches).map(n=>{const visited=travelWasVisited(session,map.id,n.id),active=String(runtime.travelSelectedNodeId||'')===String(n.id),st=travelNodeActiveState(n);return `<button class="travel-node-list-item ${active?'active':''}" data-travel-node-list-select="${esc(n.id)}"><span>${n.locked?'🔒':(visited?'●':'○')}</span><b>${esc(n.name)}</b><small>${st?`STATE · ${esc(st.name)}`:(n.backgroundItemId?'DEFAULT BG':'NO BG')}</small></button>`;}).join('');
  return `<div class="travel-node-browser"><div class="travel-inspector-title"><b>NODES · ${map.nodes.length}</b><button class="mini-btn active" data-travel-node-new>+ NODE</button></div><input class="travel-node-search" data-travel-node-search value="${esc(runtime.travelNodeSearch||'')}" placeholder="Search Node…"><div class="travel-node-filter-row">${['ALL','OPEN','LOCKED','HIDDEN','VISITED'].map(k=>`<button class="${filter===k?'active':''}" data-travel-node-filter="${k}">${k} <span>${counts[k]}</span></button>`).join('')}</div><div class="travel-node-list">${rows||'<div class="travel-state-empty">NO NODES MATCH THIS FILTER</div>'}</div></div>`;
}
function travelNodeInspectorHTML(session,map,node,mapItems=[]){
  if(!node)return `<div class="travel-empty">SELECT A NODE ON THE BOARD OR FROM THE NODE LIST</div>`;
  const wasVisited=travelWasVisited(session,map.id,node.id),status=travelNodeStatusText(session,map,node),links=travelNodeLinks(node);
  return `<div class="travel-selected-node-head"><div><small>SELECTED NODE</small><h3>${esc(node.name)}</h3><span>${esc(status)}</span></div><div class="travel-node-quick-actions"><button class="mini-btn active" data-travel-node-set-current>MOVE HERE</button><button class="mini-btn ${node.locked?'danger-soft':''}" data-travel-node-lock-toggle>${node.locked?'UNLOCK':'LOCK'}</button><button class="mini-btn" data-travel-node-reveal>${wasVisited?'HIDE':'REVEAL'}</button></div></div><label>NAME<input data-travel-node-field="name" value="${esc(node.name)}"></label>${travelNodeStatesEditorHTML(map,node,mapItems)}<details class="travel-inspector-fold"><summary>DETAIL</summary><div><textarea data-travel-node-field="detail" placeholder="GM-only Node detail">${esc(node.detail||'')}</textarea></div></details><details class="travel-inspector-fold"><summary>UNLOCK RULE</summary><div><textarea data-travel-room-unlock-rule="${esc(map.id)}|${esc(node.id)}" placeholder="Requires Keycard A, complete Clock 4/4…">${esc(node.unlockRule||'')}</textarea><small>Stored only on this Node. Locked routes remain visible but cannot be entered.</small></div></details><details class="travel-inspector-fold"><summary>TOKEN TEMPLATE <span>${(node.embeddedTokens||[]).length}</span></summary><div>${travelEmbeddedTokensEditorHTML(session,map,node)}</div></details><details class="travel-inspector-fold"><summary>ADVANCED</summary><div><div class="travel-editor-row"><label>PLAN X<input type="number" step="0.1" data-travel-node-field="x" value="${Math.round(node.x*10)/10}"></label><label>PLAN Y<input type="number" step="0.1" data-travel-node-field="y" value="${Math.round(node.y*10)/10}"></label></div><div class="travel-check-row"><label><input type="checkbox" data-travel-node-check="locked" ${node.locked?'checked':''}> LOCKED</label><label><input type="checkbox" data-travel-node-check="secret" ${node.secret?'checked':''}> SECRET</label></div><div class="travel-connection-editor"><div class="travel-editor-title"><b>CONNECTIONS · ${travelBranchCount(node)}</b><span>UNDIRECTED</span></div><div class="travel-connection-list">${links.map(l=>{const tm=session.maps.find(mm=>String(mm.id)===String(l.mapId)),tn=tm?.nodes?.find(nn=>String(nn.id)===String(l.nodeId));return tn?`<div><span>↔ ${esc(tn.name)}${String(tm.id)!==String(map.id)?` · ${esc(tm.name)}`:''}</span><button class="mini-btn danger-soft" data-travel-unlink="${esc(l.mapId)}|${esc(l.nodeId)}">UNLINK</button></div>`:''}).join('')||'<em>NO CONNECTIONS YET</em>'}</div><button class="mini-btn ${runtime.travelConnectMode?'active':''}" data-travel-connect-from-selected ${runtime.travelConnectMode?'':'disabled'}>${runtime.travelConnectMode?(runtime.travelConnectAnchor?.nodeId===node.id?'NODE A SELECTED · PICK B':'SET THIS NODE AS A'):'TOOLS → LINK MODE'}</button></div><div class="travel-editor-actions"><button class="mini-btn" data-travel-node-duplicate>DUPLICATE</button><button class="mini-btn danger-soft" data-travel-node-delete>DELETE NODE</button></div></div></details>`;
}
function travelMapInspectorHTML(session,map){
  const blankMain=travelFrameId(session,'MAIN'),blankA=travelFrameId(session,'A'),blankB=travelFrameId(session,'B');
  const slot=(id,label,value)=>`<div class="travel-map-slot"><div><b>${label}</b><small>${value?'READY':'NOT SET'}</small></div><button class="mini-btn active" data-travel-frame-create="${id}">CREATE</button><button class="mini-btn" data-travel-frame-selected="${id}">USE SELECTED</button></div>`;
  return `<div class="travel-inspector-section"><div class="travel-inspector-title"><b>MAP</b><span>${esc(map.name)}</span></div><label>MAP NAME<input data-travel-map-name value="${esc(map.name)}"></label><div class="travel-editor-actions"><button class="mini-btn active" data-travel-map-new>+ MAP TAB</button><button class="mini-btn danger-soft" data-travel-map-delete>DELETE MAP</button></div></div><div class="travel-inspector-section"><div class="travel-inspector-title"><b>TRAVEL BLANKS</b><span>${session.splitActive?'SPLIT A/B':'MAIN'}</span></div><p class="travel-inspector-note">Blank positions stay fixed. Node backgrounds — including active Node States — are swapped into these slots.</p>${slot('MAIN','MAIN',blankMain)}${slot('A','GROUP A',blankA)}${slot('B','GROUP B',blankB)}</div>`;
}
function travelToolsInspectorHTML(session,map){
  const multi=travelMultiSelection(map.id).length,approval=travelApprovalEnabled();
  return `<div class="travel-inspector-section"><div class="travel-inspector-title"><b>NODE TOOLS</b><span>${multi?`${multi} SELECTED`:'READY'}</span></div><button class="travel-tool-row ${runtime.travelConnectMode?'active':''}" data-travel-board-context-action="linkmode"><b>LINK MODE</b><span>${runtime.travelConnectMode?'ON':'OFF'}</span></button><button class="travel-tool-row ${runtime.travelGMPlayerMode?'active':''}" data-travel-gm-player-mode><b>GM WALK · PLAYER RULES</b><span>${runtime.travelGMPlayerMode?'ON':'OFF'}</span></button><button class="travel-tool-row ${approval?'active':''}" data-travel-approval-toggle><b>MOVE APPROVAL</b><span>${approval?'ON':'OFF'}</span></button><button class="travel-tool-row" data-travel-board-context-action="clearselection"><b>CLEAR MULTI SELECT</b><span>${multi}</span></button></div><div class="travel-inspector-section"><div class="travel-inspector-title"><b>TRAVEL GROUPS</b><span>${session.splitActive?'SPLIT ACTIVE':'PARTY TOGETHER'}</span></div>${session.splitActive?`<div class="travel-editor-actions"><button class="mini-btn ${runtime.travelControlGroup==='A'?'active':''}" data-travel-group-control="A">GROUP A</button><button class="mini-btn ${runtime.travelControlGroup==='B'?'active':''}" data-travel-group-control="B">GROUP B</button></div>`:'<p class="travel-inspector-note">Use GM TOOLS → TRAVEL GROUP at the current branching Node to ask players to choose Group A / B.</p>'}</div><div class="travel-inspector-section"><div class="travel-inspector-title"><b>BOARD HELP</b><span>SHORTCUTS</span></div><p class="travel-inspector-note">Drag empty area = pan · wheel = zoom · Shift+drag empty = box select · Ctrl/⌘+click = toggle selection · right-click empty area = board menu.</p></div>`;
}
function travelSettingsInspectorHTML(session,map){
  return `<div class="travel-inspector-section"><div class="travel-inspector-title"><b>TRAVEL SESSION</b><span>${esc(session.name)}</span></div><div class="travel-editor-actions"><button class="mini-btn" data-travel-session-rename="${esc(session.id)}">RENAME</button><button class="mini-btn" data-travel-session-duplicate="${esc(session.id)}">DUPLICATE</button><button class="mini-btn danger-soft" data-travel-session-delete="${esc(session.id)}">DELETE SESSION</button></div></div><div class="travel-inspector-section"><div class="travel-inspector-title"><b>INSPECTOR</b><span>CLEAN MODE</span></div><p class="travel-inspector-note">Node Editor and Node States now share one Background States section. The Node Editor background is always the DEFAULT state; alternate States only store differences.</p></div>`;
}
function travelGMEditorHTML(session,map){
  const mapItems=runtime.travelMapItems||[],selected=travelSelectedNode();
  const valid=['MAP','NODES','TOOLS','SETTINGS'];let tab=String(runtime.travelInspectorTab||'NODES').toUpperCase();if(!valid.includes(tab))tab='NODES';runtime.travelInspectorTab=tab;
  const tabs=`<nav class="travel-inspector-tabs">${valid.map(k=>`<button class="${tab===k?'active':''}" data-travel-inspector-tab="${k}">${k==='SETTINGS'?'⚙':k}</button>`).join('')}</nav>`;
  let body='';
  if(tab==='MAP')body=travelMapInspectorHTML(session,map);
  else if(tab==='TOOLS')body=travelToolsInspectorHTML(session,map);
  else if(tab==='SETTINGS')body=travelSettingsInspectorHTML(session,map);
  else body=`${travelNodeListHTML(session,map)}<div class="travel-node-inspector">${travelNodeInspectorHTML(session,map,selected,mapItems)}</div>`;
  return `<aside class="travel-editor travel-context-inspector">${tabs}<div class="travel-inspector-scroll">${body}</div></aside>`;
}
function companionPlayerTravelOverlayHTML() {
  if (!runtime.travel) runtime.travel = blankTravelState();
  const s=travelSession();
  if(!s){
    return `<main class="companion-travel-shell player-holo"><div class="player-travel-phonebar"><div><small>TRAVEL LINK</small><b>NO ACTIVE ROUTE</b></div><button type="button" data-companion-travel-close title="Close Travel Mode">×</button></div><div class="player-travel-empty">WAITING FOR THE GM TO PREPARE TRAVEL</div><div id="toast-host" class="toast-host"></div><div id="overlay-host" class="overlay-host"></div></main>`;
  }
  const viewerGroup=travelViewerGroupId(s), current=travelCurrentRef(s,viewerGroup);
  let mapId=String(runtime.travelEditorMapId||"");
  if(!mapId||!s.maps.some(m=>String(m.id)===mapId)||!travelKnownMap(s,mapId)) mapId=String(current?.mapId||s.maps.find(m=>travelKnownMap(s,m.id))?.id||s.maps[0]?.id||"");
  runtime.travelEditorMapId=mapId;
  const map=travelMap(s,mapId), info=travelCurrentInfo(s,viewerGroup), pending=travelPendingMove(s,viewerGroup);
  const knownMaps=(s.maps||[]).filter(m=>travelKnownMap(s,m.id));
  const tabs=knownMaps.length>1?`<nav class="player-travel-map-tabs">${knownMaps.map(m=>`<button class="${String(m.id)===mapId?'active':''} ${String(current?.mapId)===String(m.id)?'current':''}" data-travel-map-tab="${esc(m.id)}"><b>${esc(m.name||'MAP')}</b>${String(current?.mapId)===String(m.id)?'<small>HERE</small>':''}</button>`).join('')}</nav>`:'';
  const state=pending?(pending.awaitingApproval?'WAITING FOR GM':'SYNCING'):'READY';
  return `<main class="companion-travel-shell player-holo">
    <div class="player-travel-phonebar">
      <div class="player-travel-signal"><i></i><div><small>TRAVEL LINK · ${esc(s.splitActive?`GROUP ${viewerGroup}`:'MAIN')}</small><b>${esc(info.node?.name||'NO CURRENT NODE')}</b></div></div>
      <span class="player-travel-state ${pending?'pending':''}">${esc(state)}</span>
      <button type="button" data-companion-travel-close title="Close Travel Mode">×</button>
    </div>
    ${tabs}
    <section class="player-travel-holograph">${travelBoardHTML(s,map)}${travelMovementHTML(s)}</section>
    <div id="travel-node-preview" class="travel-node-preview"><img data-travel-preview-img alt=""><div><b data-travel-preview-title></b><small data-travel-preview-map></small></div></div>
    <div id="travel-node-context" class="travel-node-context"><b data-travel-context-title>NODE</b><button class="travel-context-here" data-travel-context-action="here">I'M HERE · MOVE MY MARKER</button></div>
    <div id="toast-host" class="toast-host"></div><div id="overlay-host" class="overlay-host"></div>
  </main>`;
}

function travelHTML() {
  if (!runtime.travel) runtime.travel = blankTravelState();
  if (!PREVIEW && runtime.online && Date.now()-(Number(runtime.travelMapItemsAt)||0)>9000) setTimeout(()=>refreshTravelMapItems(),0);
  const gm = runtime.currentPlayer.role === "GM", t=travelState(), s=travelSession();
  if (!s) return `<div class="view active travel-v2103"><section class="travel-hero"><div><small>ROOM SHARED EXPLORATION</small><h2>TRAVEL</h2><p>Node-based map travel with real Owlbear Background switching.</p></div><span>${gm?"GM EDITOR":"PLAYER"}</span></section>${gm?`<button class="primary travel-first-session" data-travel-session-new>+ CREATE TRAVEL SESSION</button>`:`<div class="travel-empty big">THE GM HAS NOT CREATED A TRAVEL SESSION YET</div>`}</div>`;
  const viewerGroup=travelViewerGroupId(s), viewerCurrent=travelCurrentRef(s,viewerGroup);
  let viewMapId = runtime.travelEditorMapId;
  if (!viewMapId || !s.maps.some(m=>m.id===viewMapId) || (!gm && !travelKnownMap(s,viewMapId))) viewMapId = viewerCurrent.mapId || s.maps[0]?.id;
  runtime.travelEditorMapId = viewMapId; const m = travelMap(s,viewMapId);
  const visibleMaps = s.maps.filter(x=>gm||travelKnownMap(s,x.id));
  const sessions = gm&&(!COMPANION_TRAVEL||!runtime.travelSessionsCollapsed) ? `<section class="travel-session-grid">${t.sessions.map(travelSessionCardHTML).join("")}<button class="travel-session-new-card" data-travel-session-new><span>＋</span><b>NEW SESSION</b><small>SAVE A SEPARATE TRAVEL SET</small></button></section>` : "";
  const gmWalkToggle=gm?`<button class="travel-gm-walk-toggle ${travelGMUsesPlayerRules()?'active':''}" data-travel-gm-player-mode title="Toggle whether GM movement obeys the same one-step and locked-node rules as a player">${travelGMUsesPlayerRules()?'GM WALK · PLAYER RULES ON':'GM WALK · ADMIN MODE'}</button>`:"";
  const approvalPendingCount=normalizeTravelApprovalState(runtime.travelApproval).requests.length;
  const approvalToggle=gm?`<button class="travel-approval-toggle ${travelApprovalEnabled()?'active':''}" data-travel-approval-toggle title="Require GM approval before every player Node movement">${travelApprovalEnabled()?`MOVE APPROVAL · ON${approvalPendingCount?` · ${approvalPendingCount} PENDING`:""}`:'MOVE APPROVAL · OFF'}</button>`:`<span class="travel-approval-player-state ${travelApprovalEnabled()?'active':''}">${travelApprovalEnabled()?'GM APPROVAL REQUIRED':'FREE MOVE'}</span>`;
  const groupDraft=runtime.gmTravelGroup?.active||null;
  const travelGroupPicker=()=>{
    if(!groupDraft)return "";
    const choices=groupDraft.choices||{}, members=groupDraft.players||[], a=members.filter(p=>choices[p.id]==="A").map(p=>p.name).join(", ")||"—", b=members.filter(p=>choices[p.id]==="B").map(p=>p.name).join(", ")||"—";
    const complete=members.length>0&&members.every(p=>["A","B"].includes(String(choices[p.id]||""))), canConfirm=complete&&a!=="—"&&b!=="—";
    return `<div class="travel-group-picker"><span>A · ${esc(a)}</span><span>B · ${esc(b)}</span><small>${members.filter(p=>choices[p.id]).length}/${members.length} CHOSEN</small><button data-action="confirm-travel-group" ${canConfirm?"":"disabled"}>CONFIRM</button><button data-action="cancel-travel-group">CANCEL</button></div>`;
  };
  const travelGroupStart=()=>{const e=gmTravelGroupEligibility();return `<button class="travel-group-start" data-action="start-travel-group" title="${esc(e.reason)}">TRAVEL GROUPS</button>`};
  const groupCtl=s.splitActive?`<div class="travel-group-control"><span>SPLIT ACTIVE</span>${gm?`<button class="${viewerGroup==='A'?'active':''}" data-travel-group-control="A">GROUP A</button><button class="${viewerGroup==='B'?'active':''}" data-travel-group-control="B">GROUP B</button>${gmWalkToggle}${approvalToggle}`:`<b>YOU ARE GROUP ${esc(viewerGroup)}</b>${approvalToggle}`}</div>`:`<div class="travel-group-control"><span>PARTY</span><b>MAIN GROUP</b>${gm?(groupDraft?travelGroupPicker():travelGroupStart())+gmWalkToggle+approvalToggle:approvalToggle}</div>`;
  const currentInfo=travelCurrentInfo(s,viewerGroup), currentNode=currentInfo.node;
  const tabs=visibleMaps.map(x=>{const a=s.splitActive&&travelCurrentRef(s,'A').mapId===x.id,b=s.splitActive&&travelCurrentRef(s,'B').mapId===x.id,own=viewerCurrent.mapId===x.id;const status=gm&&s.splitActive?[a?'A':'',b?'B':''].filter(Boolean).join(' / '):(own?'CURRENT':'DISCOVERED');return `<button class="${x.id===m?.id?'active':''} ${own?'current':''}" data-travel-map-tab="${esc(x.id)}"><b>${esc(x.name)}</b><small>${esc(status||'DISCOVERED')}</small></button>`}).join("");
  return `<div class="view active travel-v2103"><section class="travel-hero"><div><small>ROOM SHARED · SPOILER SAFE UI</small><h2>TRAVEL</h2><p>${gm?"Unbounded undirected Node Graph · click A then B to connect · unlimited branches · MAIN can split into Group A/B.":"Click one connected Node per step. Routes are undirected and can branch without limit. At a branch, the GM can start a Travel Group split from GM TOOLS."}</p></div><span>${gm?"GM EDITOR":"PLAYER"}</span></section>${sessions}${groupCtl}<div class="travel-map-tabs">${tabs}${gm?`<button class="add" data-travel-map-new>+ MAP</button>`:""}</div><div class="travel-layout ${gm?'gm-sidebar ':''}${gm&&runtime.travelSidebarCollapsed?'sidebar-collapsed':''}"><main><div class="travel-current"><span>${s.splitActive?`GROUP ${esc(viewerGroup)}`:"MAIN"}</span><b>${esc(currentNode?.name||"NOT SET")}</b><small>${esc(s.name)}</small></div>${travelBoardHTML(s,m)}${travelMovementHTML(s)}</main>${gm?`<button class="travel-sidebar-toggle" data-travel-sidebar-toggle title="${runtime.travelSidebarCollapsed?'Open GM sidebar':'Collapse GM sidebar'}">${runtime.travelSidebarCollapsed?'◀':'▶'}</button>${travelGMEditorHTML(s,m)}`:`<aside class="travel-player-info"><b>${esc(s.name)}</b><p>${s.discoveredMaps.length}/${s.maps.length} MAPS DISCOVERED</p><p>${s.splitActive?`You are travelling with <strong>GROUP ${esc(viewerGroup)}</strong>. Your movement only changes that group's Blank.`:"The party is together on MAIN BLANK. The GM starts Group A/B selection from GM TOOLS."}</p><p>Routes found from visited Nodes remain visible in <strong>AMBER</strong> until you enter them. Completely unknown routes stay hidden. A connected locked route remains visible as <strong>🔒 LOCKED</strong>; only the GM can unlock it.</p>${travelApprovalEnabled()?`<p class="travel-player-approval-note"><strong>GM APPROVAL MODE:</strong> every movement request must be approved by the GM before the party moves.</p>`:""}</aside>`}</div><div id="travel-node-preview" class="travel-node-preview"><img data-travel-preview-img alt=""><div><b data-travel-preview-title></b><small data-travel-preview-map></small>${gm?`<p data-travel-preview-detail></p>`:""}</div></div><div id="travel-node-context" class="travel-node-context"><b data-travel-context-title>NODE</b><div class="travel-context-states" data-travel-context-states></div><button class="travel-context-here" data-travel-context-action="here">I'M HERE · MOVE MY MARKER</button>${gm?`<button data-travel-context-action="merge">MERGE A + B HERE</button><button data-travel-context-action="embed-token">CAPTURE SELECTED TOKEN TEMPLATE</button><button data-travel-context-action="show-tokens">SHOW NODE TOKENS</button><button data-travel-context-action="hide-tokens">HIDE NODE TOKENS</button><button data-travel-context-action="lock">LOCK NODE</button><button data-travel-context-action="current">SET CURRENT</button><button data-travel-context-action="reveal">REVEAL / HIDE</button><button data-travel-context-action="duplicate">DUPLICATE</button><button class="danger" data-travel-context-action="delete">DELETE</button>`:""}</div>${gm?`<div id="travel-board-context" class="travel-board-context"><b>NODE PLAN</b><button class="${runtime.travelConnectMode?'active':''}" data-travel-board-context-action="linkmode">${runtime.travelConnectMode?'✓ LINK MODE · ON · TURN OFF':'LINK MODE · OFF · TURN ON'}</button><button data-travel-board-context-action="create">＋ CREATE NODE HERE</button><button data-travel-board-context-action="clearselection">CLEAR NODE SELECTION</button></div>`:""}</div>`;
}
function travelCreateSession() { if (runtime.currentPlayer.role!=="GM") return; const name=prompt("Travel Session name","TRAVEL SESSION"); if (!name) return; const s=blankTravelSession(name.trim()||"TRAVEL SESSION"); travelState().sessions.push(s); travelState().activeSessionId=s.id; runtime.travelEditorMapId=s.current.mapId; runtime.travelSelectedNodeId=""; saveTravelState(); render(); }
function travelOpenSession(id) { if (runtime.currentPlayer.role!=="GM") return; if (!travelState().sessions.some(x=>x.id===id)) return; travelState().activeSessionId=id; const s=travelSession(); runtime.travelEditorMapId=s.current.mapId; runtime.travelSelectedNodeId=travelMap(s)?.nodes?.[0]?.id||""; saveTravelState(); render(); }
function travelRenameSession(id) { if (runtime.currentPlayer.role!=="GM") return; const s=travelSession(id); if (!s) return; const name=prompt("Session name",s.name); if(name?.trim()){s.name=name.trim();saveTravelState({applyBackground:false});render();} }
function travelDuplicateSession(id) { if (runtime.currentPlayer.role!=="GM") return; const s=travelSession(id); if(!s)return; const cp=deepClone(s); cp.id=travelUid("session"); cp.name=`${s.name} COPY`; cp.memberLocations={}; cp.memberGroups={}; cp.allyGroups={}; cp.frameId=""; cp.groupFrameIds={A:"",B:""}; cp.splitActive=false; cp.groups={A:{id:"A",current:deepClone(cp.current)},B:{id:"B",current:deepClone(cp.current)}}; for(const mm of cp.maps||[])for(const nn of mm.nodes||[])nn.embeddedTokens=[]; travelState().sessions.push(cp); travelState().activeSessionId=cp.id; runtime.travelEditorMapId=cp.current.mapId; runtime.travelSelectedNodeId=cp.current.nodeId||cp.maps[0]?.nodes?.[0]?.id||""; saveTravelState(); render(); }
function travelDeleteSession(id) { if(runtime.currentPlayer.role!=="GM")return; const s=travelSession(id);if(!s||!confirm(`Delete ${s.name}?`))return; travelReleaseEmbeddedItems((s.maps||[]).flatMap(m=>m.nodes||[])); travelState().sessions=travelState().sessions.filter(x=>x.id!==id);if(travelState().activeSessionId===id)travelState().activeSessionId=travelState().sessions[0]?.id||"";runtime.travelEditorMapId=travelSession()?.current?.mapId||"";runtime.travelSelectedNodeId="";saveTravelState();render(); }
function travelNewMap() { if(runtime.currentPlayer.role!=="GM")return; const s=travelSession();if(!s)return; const name=prompt("Map Tab name",`MAP ${s.maps.length+1}`);if(!name)return;const m=normalizeTravelMap({id:travelUid("map"),name:name.trim()||`MAP ${s.maps.length+1}`},s.maps.length);s.maps.push(m);runtime.travelEditorMapId=m.id;runtime.travelSelectedNodeId="";saveTravelState({applyBackground:false});render(); }
function travelDeleteMap() { if(runtime.currentPlayer.role!=="GM")return;const s=travelSession(),m=travelMap(s);if(!s||!m||s.maps.length<=1)return notify("Travel Session needs at least one Map Tab");if(!confirm(`Delete Map Tab ${m.name}?`))return;travelReleaseEmbeddedItems(m.nodes||[]);s.maps=s.maps.filter(x=>x.id!==m.id);for(const mm of s.maps)for(const n of mm.nodes)for(const [k,l] of Object.entries(n.links||{}))if(String(l?.mapId)===String(m.id))delete n.links[k];delete s.discoveredNodes[m.id];s.discoveredMaps=s.discoveredMaps.filter(x=>x!==m.id);s.memberLocations=Object.fromEntries(Object.entries(s.memberLocations||{}).filter(([,rec])=>String(rec?.mapId||"")!==String(m.id)));const fallback={mapId:s.maps[0].id,nodeId:s.maps[0].nodes?.[0]?.id||""};if(s.current.mapId===m.id)s.current=deepClone(fallback);for(const g of ["A","B"]){const c=s.groups?.[g]?.current;if(c?.mapId===m.id)s.groups[g].current=deepClone(fallback);}runtime.travelEditorMapId=travelCurrentRef(s)?.mapId||fallback.mapId;runtime.travelSelectedNodeId="";saveTravelState();render(); }
function travelNewNode(x=50,y=50) { if(runtime.currentPlayer.role!=="GM")return;const s=travelSession(),m=travelMap(s);if(!m)return;const n=normalizeTravelNode({id:travelUid("node"),name:"NEW NODE",x,y});m.nodes.push(n);travelEnsurePositiveOrigin(m,m.id);runtime.travelSelectedNodeId=n.id;if(!s.current.nodeId){s.current={mapId:m.id,nodeId:n.id};s.groups={A:{id:"A",current:deepClone(s.current)},B:{id:"B",current:deepClone(s.current)}};travelReveal(s,m.id,n.id);}saveTravelState();render(); }
function travelSelectedNode() { const s=travelSession(),m=travelMap(s);return m?.nodes.find(n=>n.id===runtime.travelSelectedNodeId)||null; }
function focusTravelSelectedNodeName() { requestAnimationFrame(()=>{const el=document.querySelector('.travel-editor [data-travel-node-field="name"]');if(!el)return;try{el.focus({preventScroll:true});}catch{el.focus();}if(typeof el.select==='function')el.select();}); }
function travelDeleteNode() { if(runtime.currentPlayer.role!=="GM")return;const s=travelSession(),m=travelMap(s),n=travelSelectedNode();if(!n||!confirm(`Delete ${n.name}?`))return;travelReleaseEmbeddedItems([n]);m.nodes=m.nodes.filter(x=>x.id!==n.id);for(const mm of s.maps)for(const nn of mm.nodes)for(const [k,l] of Object.entries(nn.links||{}))if(String(l?.mapId)===String(m.id)&&String(l?.nodeId)===String(n.id))delete nn.links[k];s.discoveredNodes[m.id]=(s.discoveredNodes[m.id]||[]).filter(x=>x!==n.id);s.memberLocations=Object.fromEntries(Object.entries(s.memberLocations||{}).filter(([,rec])=>!(String(rec?.mapId||"")===String(m.id)&&String(rec?.nodeId||"")===String(n.id))));if(s.current.mapId===m.id&&s.current.nodeId===n.id)s.current.nodeId=m.nodes[0]?.id||"";for(const g of ["A","B"]){const c=s.groups?.[g]?.current;if(c?.mapId===m.id&&c?.nodeId===n.id)c.nodeId=m.nodes[0]?.id||"";}runtime.travelSelectedNodeId=m.nodes[0]?.id||"";saveTravelState();render(); }
function travelDuplicateNode() { if(runtime.currentPlayer.role!=="GM")return;const m=travelMap(),n=travelSelectedNode();if(!m||!n)return;const cp=deepClone(n);cp.id=travelUid("node");cp.name=`${n.name} COPY`;cp.x=(Number(n.x)||0)+5;cp.y=(Number(n.y)||0)+5;cp.links={};cp.unlockRule="";cp.locked=false;cp.embeddedTokens=[];m.nodes.push(cp);travelEnsurePositiveOrigin(m,m.id);runtime.travelSelectedNodeId=cp.id;saveTravelState({applyBackground:false});render(); }
function travelSetCurrentNode(groupId = travelViewerGroupId(travelSession())) { if(runtime.currentPlayer.role!=="GM")return;const s=travelSession(),m=travelMap(s),n=travelSelectedNode();if(!s||!m||!n)return;const g=s.splitActive&&["A","B"].includes(groupId)?groupId:"MAIN",from=deepClone(travelCurrentRef(s,g)),target={mapId:m.id,nodeId:n.id};for(const r of (n.embeddedTokens||[])){r.shown=false;r.lastSlot=g;}const fp=travelFindNodePair(s,from.mapId,from.nodeId);for(const r of (fp.node?.embeddedTokens||[]))r.shown=false;travelSetCurrentRef(s,g,target);travelReveal(s,m.id,n.id);runtime.travelEditorMapId=m.id;saveTravelState();travelScheduleNodeTokenTransition(s,g,from,target);render(); }
function travelToggleRevealNode() { if(runtime.currentPlayer.role!=="GM")return;const s=travelSession(),m=travelMap(s),n=travelSelectedNode();if(!n)return;const arr=s.discoveredNodes[m.id]||[],isCurrent=["MAIN","A","B"].some(g=>{const c=travelCurrentRef(s,g);return c.mapId===m.id&&c.nodeId===n.id;});if(arr.includes(n.id)&&!isCurrent)s.discoveredNodes[m.id]=arr.filter(x=>x!==n.id);else travelReveal(s,m.id,n.id);saveTravelState({applyBackground:false});render(); }
function travelToggleLockNode() { if(runtime.currentPlayer.role!=="GM")return;const n=travelSelectedNode();if(!n)return;n.locked=!n.locked;saveTravelState({applyBackground:false});render(); }
function travelSplitHere(mapId,nodeId){
  const s=travelSession();if(!s||s.splitActive)return;const cur=travelCurrentRef(s,"MAIN"),m=s.maps.find(x=>x.id===mapId),n=m?.nodes.find(x=>x.id===nodeId);if(!m||!n||cur.mapId!==m.id||cur.nodeId!==n.id||travelBranchCount(n)<2)return;
  const requester=String(runtime.currentPlayer.id||"");
  if(runtime.currentPlayer.role!=="GM"){notify("Travel split is controlled by the GM from GM TOOLS · TRAVEL GROUP");return;}
  for(const r of (n.embeddedTokens||[]))r.shown=false;s.splitActive=true;s.groups={A:{id:"A",current:deepClone(cur)},B:{id:"B",current:deepClone(cur)}};s.memberGroups={};for(const owner of Object.keys(s.memberLocations||{}))s.memberGroups[owner]="A";if(requester)s.memberGroups[requester]="B";s.allyGroups={};for(const ally of (runtime.sceneMonsters||[]).filter(x=>x?.faction==="ally"))s.allyGroups[String(ally.id)]="A";runtime.travelControlGroup="B";saveTravelState();travelScheduleNodeTokenTransition(s,"MAIN",cur,null);setTimeout(()=>{travelScheduleNodeTokenTransition(s,"A",null,cur);travelScheduleNodeTokenTransition(s,"B",null,cur);},25);render();
}
function travelMergeGroupsHere(){
  if(runtime.currentPlayer.role!=="GM")return;const s=travelSession();if(!s?.splitActive||!travelGroupsSameNode(s))return;const a=deepClone(travelCurrentRef(s,"A")),assignments=deepClone(s.memberGroups||{});const pair=travelFindNodePair(s,a.mapId,a.nodeId);for(const r of (pair.node?.embeddedTokens||[]))r.shown=false;travelScheduleNodeTokenTransition(s,"A",a,null);travelScheduleNodeTokenTransition(s,"B",a,null);travelScheduleLinkedPlayerTokens(s,assignments,"merge");s.current=deepClone(a);s.splitActive=false;s.groups={A:{id:"A",current:deepClone(a)},B:{id:"B",current:deepClone(a)}};s.memberGroups={};s.allyGroups={};runtime.travelControlGroup="A";saveTravelState();setTimeout(()=>travelScheduleNodeTokenTransition(s,"MAIN",null,a),25);render();
}
function travelShowLockedRule(map,node) {
  if(!node)return;
  const s=travelSession(),known=!!s&&travelWasVisited(s,map?.id,node.id);
  const body=String(node.unlockRule||'').trim() || 'This route is locked. Wait for the GM to unlock this Node.';
  showOverlay({kind:"gm-broadcast",broadcastType:"warning",title:known?`LOCKED · ${node.name}`:"ROUTE LOCKED",body,senderName:"TRAVEL · UNLOCK RULE"});
}

function travelMovePendingKey(sessionId, groupId) { return `${String(sessionId||"")}|${String(groupId||"MAIN")}`; }
function travelPendingMove(session = travelSession(), groupId = travelViewerGroupId(session)) {
  return runtime.travelMovePending?.[travelMovePendingKey(session?.id, groupId)] || null;
}
function travelFinishMoveRequest(requestId, accepted = false, reason = "") {
  if (!requestId) return;
  for (const [key, rec] of Object.entries(runtime.travelMovePending || {})) {
    if (String(rec?.requestId || "") !== String(requestId)) continue;
    if (rec.timer) clearTimeout(rec.timer);
    delete runtime.travelMovePending[key];
    if (!accepted && reason && !["move-reject","approval-denied"].includes(reason)) notify(`Travel movement failed · ${reason}`);
  }
}
function travelResolvePendingFromState(nextState) {
  for (const [key, rec] of Object.entries(runtime.travelMovePending || {})) {
    const ss=nextState?.sessions?.find(x=>String(x.id)===String(rec?.sessionId||"")); if(!ss)continue;
    const gid=ss.splitActive&&["A","B"].includes(String(rec.groupId))?String(rec.groupId):"MAIN";
    const cur=gid==="MAIN"?ss.current:ss.groups?.[gid]?.current;
    if(String(cur?.mapId||"")===String(rec?.target?.mapId||"")&&String(cur?.nodeId||"")===String(rec?.target?.nodeId||"")) travelFinishMoveRequest(String(rec.requestId||""),true,"metadata");
  }
}
async function refreshTravelStateFromScene() {
  if (PREVIEW || !runtime.online || !OBR) return false;
  try {
    if (!await OBR.scene.isReady()) return false;
    const md = await Promise.race([
      OBR.scene.getMetadata(),
      new Promise((_, reject)=>setTimeout(()=>reject(new Error("Travel metadata timeout")), 3500))
    ]);
    const incoming = normalizeTravelState(md?.[SCENE_TRAVEL_KEY]);
    if ((Number(incoming.revision)||0) >= (Number(runtime.travel?.revision)||0)) runtime.travel = incoming;
    if (runtime.view === "travel") render();
    return true;
  } catch (e) {
    console.warn("travel refresh recovery", e);
    return false;
  }
}
function travelQueuePlayerMove(session, groupId, from, target) {
  const key = travelMovePendingKey(session?.id, groupId);
  const existing = runtime.travelMovePending?.[key];
  if (existing) { notify("Travel is syncing the previous step · wait a moment"); return false; }
  const requestId = travelUid("move");
  const approvalRequired=travelApprovalEnabled() || (COMPANION_TRAVEL && runtime.currentPlayer.role!=="GM");
  const rec = { requestId, sessionId:String(session?.id||""), groupId:String(groupId||"MAIN"), from:deepClone(from), target:deepClone(target), startedAt:Date.now(), awaitingApproval:approvalRequired, timer:null };
  runtime.travelMovePending ||= {};
  runtime.travelMovePending[key] = rec;
  rec.timer = setTimeout(async ()=>{
    const live = runtime.travelMovePending?.[key];
    if (!live || live.requestId !== requestId) return;
    delete runtime.travelMovePending[key];
    const recovered = await refreshTravelStateFromScene();
    notify(recovered ? "Travel sync timed out · room state was refreshed automatically" : "Travel sync timed out · ask the GM to reopen the extension once");
    if (runtime.view === "travel") render();
  }, approvalRequired?120000:5000);
  if(approvalRequired) showToast("TRAVEL REQUEST", "Request sent · waiting for GM approval", "message", false);
  broadcast("travel-move-request",{requestId,senderId:runtime.currentPlayer.id,sessionId:session.id,groupId,fromMapId:from.mapId,fromNodeId:from.nodeId,targetMapId:target.mapId,targetNodeId:target.nodeId,requireApproval:!!(COMPANION_TRAVEL&&runtime.currentPlayer.role!=="GM"),time:Date.now()}).catch?.(()=>{});
  if (runtime.view === "travel") render();
  return true;
}

async function travelMoveToTarget(raw) {
  const s=travelSession(), groupId=travelViewerGroupId(s), info=travelCurrentInfo(s,groupId); if(!s||!info.map||!info.node||!raw)return;
  const [mapId,nodeId]=String(raw).split("|"); if(!mapId||!nodeId)return;
  const edge=travelNodeLinks(info.node).find(l=>String(l?.mapId)===String(mapId)&&String(l?.nodeId)===String(nodeId)); if(!edge)return;
  const tm=s.maps.find(m=>String(m.id)===String(mapId)),tn=tm?.nodes.find(n=>String(n.id)===String(nodeId)); if(!tm||!tn)return;
  if(tn.locked){travelShowLockedRule(tm,tn);return;}
  const from={mapId:String(info.map.id),nodeId:String(info.node.id)};
  // v2.116: Players no longer mutate Current optimistically. The GM/background host
  // validates one edge, saves authoritative Scene metadata, then ACKs. This removes
  // stale-current races when multiple people move while the GM edits the graph.
  if(runtime.currentPlayer.role!=="GM") {
    travelQueuePlayerMove(s,groupId,from,{mapId:String(tm.id),nodeId:String(tn.id)});
    return;
  }
  // GM admin and GM Player-Rules mode both use the same one-edge/lock validation above.
  // Fire the room-wide visual cue before committing Current so every client can animate A → B.
  await travelEmitMoveFx(s,groupId,from,{mapId:String(tm.id),nodeId:String(tn.id)});
  await new Promise(r=>setTimeout(r,25));
  for(const r of (info.node?.embeddedTokens||[]))r.shown=false;for(const r of (tn.embeddedTokens||[])){r.shown=false;r.lastSlot=groupId;}
  travelSetCurrentRef(s,groupId,{mapId:tm.id,nodeId:tn.id});travelReveal(s,tm.id,tn.id);runtime.travelEditorMapId=tm.id;
  for(const [owner,rec] of Object.entries(s.memberLocations||{})){const assigned=s.splitActive?String(s.memberGroups?.[owner]||"A"):"MAIN";if(s.splitActive&&assigned!==groupId)continue;if(rec){rec.mapId=tm.id;rec.nodeId=tn.id;rec.updatedAt=Date.now();}}
  saveTravelState();travelScheduleNodeTokenTransition(s,groupId,from,{mapId:String(tm.id),nodeId:String(tn.id)});render();
}
function travelMove(dir) { // legacy compatibility for old UI/state; new graph UI is directionless.
  const s=travelSession(),info=travelCurrentInfo(s),l=info.node?.links?.[dir];if(l)travelMoveToTarget(`${l.mapId}|${l.nodeId}`);
}
function travelFindNodePair(session,mapId,nodeId){const map=session?.maps?.find(x=>String(x.id)===String(mapId)),node=map?.nodes?.find(x=>String(x.id)===String(nodeId));return {map,node};}
function travelNodesConnected(aNode,bMapId,bNodeId){return travelNodeLinks(aNode).some(l=>String(l?.mapId)===String(bMapId)&&String(l?.nodeId)===String(bNodeId));}
function travelConnectNodes(aMapId,aNodeId,bMapId,bNodeId){
  if(runtime.currentPlayer.role!=="GM")return false;const s=travelSession();if(!s)return false;
  const A=travelFindNodePair(s,aMapId,aNodeId),B=travelFindNodePair(s,bMapId,bNodeId);if(!A.node||!B.node)return false;
  if(String(A.map.id)===String(B.map.id)&&String(A.node.id)===String(B.node.id)){notify("Choose a different Node for the other end");return false;}
  A.node.links||={};B.node.links||={};
  A.node.links[travelLinkKey(B.map.id,B.node.id)]={mapId:String(B.map.id),nodeId:String(B.node.id)};
  B.node.links[travelLinkKey(A.map.id,A.node.id)]={mapId:String(A.map.id),nodeId:String(A.node.id)};
  scheduleTravelSave(0,{applyBackground:false});return true;
}
function travelUnlinkNodes(aMapId,aNodeId,bMapId,bNodeId){
  if(runtime.currentPlayer.role!=="GM")return;const s=travelSession();if(!s)return;const A=travelFindNodePair(s,aMapId,aNodeId),B=travelFindNodePair(s,bMapId,bNodeId);
  if(A.node)for(const [k,l] of Object.entries(A.node.links||{}))if(String(l?.mapId)===String(bMapId)&&String(l?.nodeId)===String(bNodeId))delete A.node.links[k];
  if(B.node)for(const [k,l] of Object.entries(B.node.links||{}))if(String(l?.mapId)===String(aMapId)&&String(l?.nodeId)===String(aNodeId))delete B.node.links[k];
  runtime.travelConnectAnchor=null;scheduleTravelSave(0,{applyBackground:false});render();
}
function travelToggleConnectMode(force=null){
  if(runtime.currentPlayer.role!=="GM")return;
  const next=force==null?!runtime.travelConnectMode:!!force;
  if(next&&travelGMUsesPlayerRules()){
    runtime.travelGMPlayerMode=false;
    saveUIPrefs({travelGMPlayerMode:false});
  }
  runtime.travelConnectMode=next;
  runtime.travelConnectAnchor=null;
  render();
}
function travelConnectClick(mapId,nodeId){
  if(runtime.currentPlayer.role!=="GM"||!runtime.travelConnectMode)return;
  const s=travelSession(),pair=travelFindNodePair(s,mapId,nodeId);if(!pair.node)return;
  const a=runtime.travelConnectAnchor;
  if(!a){runtime.travelConnectAnchor={mapId:String(mapId),nodeId:String(nodeId)};runtime.travelEditorMapId=String(mapId);runtime.travelSelectedNodeId=String(nodeId);render();return;}
  if(String(a.mapId)===String(mapId)&&String(a.nodeId)===String(nodeId)){runtime.travelConnectAnchor=null;render();return;}
  const A=travelFindNodePair(s,a.mapId,a.nodeId);if(!A.node){runtime.travelConnectAnchor={mapId:String(mapId),nodeId:String(nodeId)};render();return;}
  runtime.travelEditorMapId=String(mapId);runtime.travelSelectedNodeId=String(nodeId);
  if(travelNodesConnected(A.node,mapId,nodeId)){
    travelUnlinkNodes(a.mapId,a.nodeId,mapId,nodeId);
    notify(`Route disconnected: ${A.node.name} ↔ ${pair.node.name}`);
    return;
  }
  if(travelConnectNodes(a.mapId,a.nodeId,mapId,nodeId)){
    runtime.travelConnectAnchor=null;
    notify(`Route connected: ${A.node.name} ↔ ${pair.node.name}`);
    render();
  }
}
function closeTravelNodeContext() { document.getElementById("travel-node-context")?.classList.remove("open"); }
function closeTravelBoardContext() { document.getElementById("travel-board-context")?.classList.remove("open"); }
function placeTravelContextMenu(menu,root,x,y,rightSpace=230){
  if(!menu)return;
  const rootWidth=Math.max(240,Number(root?.width)||800),rootHeight=Math.max(180,Number(root?.height)||window.innerHeight||600);
  const visibleTop=Math.max(0,-(Number(root?.top)||0)),visibleBottom=Math.min(rootHeight,(window.innerHeight||rootHeight)-(Number(root?.top)||0)),visibleHeight=Math.max(120,visibleBottom-visibleTop);
  menu.style.left=`${Math.max(8,Math.min(rootWidth-rightSpace,x))}px`;
  menu.style.maxHeight=`${Math.max(120,visibleHeight-16)}px`;
  menu.style.overflowY="auto";
  menu.classList.add("open");
  const menuHeight=Math.min(Math.max(1,menu.scrollHeight||menu.offsetHeight||1),Math.max(120,visibleHeight-16));
  menu.style.top=`${Math.max(visibleTop+8,Math.min(visibleBottom-menuHeight-8,y))}px`;
}
function openTravelBoardContext(e, board) {
  if(runtime.currentPlayer.role!=="GM"||!board)return;
  const session=travelSession();if(!session)return;
  const mapId=String(board.dataset.travelBoard||"");if(!mapId)return;
  const r=board.getBoundingClientRect(),v=travelBoardView(session,mapId);
  const wx=(e.clientX-r.left-v.panX)/v.zoom,wy=(e.clientY-r.top-v.panY)/v.zoom;
  runtime.travelBoardCreateMapId=mapId;
  runtime.travelBoardCreateX=wx/TRAVEL_BASE_W*100;
  runtime.travelBoardCreateY=wy/TRAVEL_BASE_H*100;
  closeTravelNodeContext();
  requestAnimationFrame(()=>{
    const menu=document.getElementById("travel-board-context");if(!menu)return;
    const clear=menu.querySelector('[data-travel-board-context-action="clearselection"]'), count=travelMultiSelection(mapId).length;if(clear){clear.disabled=!count;clear.textContent=count?`CLEAR NODE SELECTION · ${count}`:'CLEAR NODE SELECTION';}
    const root=document.querySelector(".travel-v2103")?.getBoundingClientRect(),x=e.clientX-(root?.left||0),y=e.clientY-(root?.top||0);
    placeTravelContextMenu(menu,root,x,y,210);
  });
}
function openTravelNodeContext(e, mapId, nodeId) {
  closeTravelBoardContext();
  const session=travelSession(), map=session?.maps.find(x=>x.id===mapId), node=map?.nodes.find(x=>x.id===nodeId); if(!session||!map||!node)return;
  const gm=runtime.currentPlayer.role==="GM", viewerGroup=travelViewerGroupId(session), current=travelCurrentRef(session,viewerGroup);
  runtime.travelContextMapId=mapId;runtime.travelContextNodeId=nodeId;
  if(gm){runtime.travelEditorMapId=mapId;runtime.travelSelectedNodeId=nodeId;render();}
  requestAnimationFrame(()=>{
    const menu=document.getElementById("travel-node-context");if(!menu)return;
    const revealed=travelWasVisited(session,mapId,node.id), marker=travelLocalCharacterMarker(), here=menu.querySelector('[data-travel-context-action="here"]');
    const title=gm?`${node.name} · ${node.locked?"LOCKED":"OPEN"} · ${revealed?"REVEALED":"HIDDEN"}`:(revealed?node.name:(node.locked?"🔒 LOCKED":"????"));
    menu.querySelector("[data-travel-context-title]").textContent=title;
    const stateHost=menu.querySelector('[data-travel-context-states]');if(stateHost){if(gm&&(node.states||[]).length){const aid=String(node.activeStateId||'');stateHost.innerHTML=`<small>NODE STATE</small><button class="${aid?'':'active'}" data-travel-context-state="">${aid?'USE DEFAULT':'✓ DEFAULT'}</button>${(node.states||[]).map(st=>{const sid=String(st.id||''),on=sid===aid;return `<button class="${on?'active':''}" data-travel-context-state="${esc(sid)}">${on?'✓ ':''}${esc(st.name||'STATE')}</button>`}).join('')}`;}else stateHost.innerHTML='';}
    if(here){const mine=marker?session.memberLocations?.[marker.ownerId]:null,isHere=!!mine&&String(mine.mapId)===String(mapId)&&String(mine.nodeId)===String(node.id);here.disabled=!revealed||!marker;here.textContent=!marker?"NO CHARACTER SHEET":(!revealed?"NOT VISITED YET · MARKER LOCKED":(isHere?"REMOVE I'M HERE":"I'M HERE · MOVE MY MARKER"));}
    const merge=menu.querySelector('[data-travel-context-action="merge"]');if(merge){merge.style.display=session.splitActive?"":"none";merge.disabled=!travelGroupsSameNode(session)||current.mapId!==mapId||current.nodeId!==nodeId;}
    const lock=menu.querySelector('[data-travel-context-action="lock"]');if(lock)lock.textContent=node.locked?"UNLOCK NODE":"LOCK NODE";
    const curr=menu.querySelector('[data-travel-context-action="current"]');if(curr)curr.textContent=session.splitActive?`SET GROUP ${travelViewerGroupId(session)} CURRENT`:"SET CURRENT";
    const tokenCount=(node.embeddedTokens||[]).length,tokenSlot=travelPreferredEmbeddedSlot(session,mapId,node.id,false),showTokens=menu.querySelector('[data-travel-context-action="show-tokens"]'),hideTokens=menu.querySelector('[data-travel-context-action="hide-tokens"]');
    if(showTokens){showTokens.disabled=!tokenCount||!tokenSlot;showTokens.textContent=tokenCount?`SHOW NODE TOKENS · ${tokenCount}`:"NO NODE TOKENS";}
    if(hideTokens){hideTokens.disabled=!tokenCount;hideTokens.textContent=tokenCount?`HIDE NODE TOKENS · ${tokenCount}`:"NO NODE TOKENS";}
    const root=document.querySelector(".travel-v2103")?.getBoundingClientRect(),x=e.clientX-(root?.left||0),y=e.clientY-(root?.top||0);placeTravelContextMenu(menu,root,x,y,230);
  });
}


function settingsHTML() {
  const uiMode = runtime.uiSizeMode || "auto";
  const theme = runtime.uiTheme === "phantom" ? "phantom" : "default";
  const sceneView = runtime.sceneWideMode ? "wide" : "sidebar";
  const companionHud = loadCompanionHudPrefs();
  const playerTokenQuickMenu = loadPlayerTokenQuickMenuEnabled();
  return `<div class="view active"><section class="settings-page">
    <div class="settings-hero"><div><small>INTERFACE</small><h2>SETTINGS</h2><p>Interface preferences are stored on this device only and do not change other players' UI.</p></div><span>LOCAL</span></div>
    <div class="settings-grid">
      <article class="settings-card"><div class="settings-card-title"><b>WINDOW SIZE</b><small>Base size for editors. Scene and Roll still resize automatically for their own layouts.</small></div><div class="settings-choice-row">${["auto","pc","notebook"].map(m => `<button class="settings-choice ${uiMode === m ? "active" : ""}" data-ui-size="${m}"><b>${m === "notebook" ? "NOTEBOOK" : m.toUpperCase()}</b><small>${m === "auto" ? "Choose from screen size" : m === "pc" ? "Large editor workspace" : "Smaller editor workspace"}</small></button>`).join("")}</div></article>
      <article class="settings-card"><div class="settings-card-title"><b>THEME</b><small>Changes only the visual theme on this device.</small></div><div class="settings-choice-row two">${["default","phantom"].map(m => `<button class="settings-choice ${theme === m ? "active" : ""}" data-ui-theme="${m}"><b>${m.toUpperCase()}</b><small>${m === "default" ? "Cyan tactical interface" : "Alternative Phantom interface"}</small></button>`).join("")}</div></article>
      <article class="settings-card"><div class="settings-card-title"><b>SCENE WIDTH</b><small>Choose the default Scene roster width. You can still switch with WIDE VIEW / SIDEBAR inside Scene.</small></div><div class="settings-choice-row two">${["sidebar","wide"].map(m => `<button class="settings-choice ${sceneView === m ? "active" : ""}" data-scene-view="${m}"><b>${m.toUpperCase()}</b><small>${m === "sidebar" ? "Keep more map visible" : "Show more Scene information at once"}</small></button>`).join("")}</div></article>
      <article class="settings-card"><div class="settings-card-title"><b>COMPANION POPOVERS</b><small>Floating shortcuts for Status, Class, Equipment, Spheres, Items, Bond, Arcana, Actions, Study / Hinder and Travel, plus dedicated Clock, Codex, Shop and Roll windows, the live Initiative Tracker, and a GM-only red DOMINION monster-control shortcut. Each shortcut is its own small Owlbear popover, so the empty space between buttons remains the real map canvas. Drag a button to move it; positions are remembered on this browser.</small></div><div class="settings-choice-row two"><button class="settings-choice ${companionHud.enabled ? "active" : ""}" data-companion-hud-toggle="1"><b>${companionHud.enabled ? "ON" : "OFF"}</b><small>${companionHud.enabled ? "Shortcut popovers are visible" : "Shortcut popovers are hidden"}</small></button><button class="settings-choice" data-companion-hud-reset="1"><b>↺ ตำแหน่ง</b><small>Restore every shortcut to its default screen position</small></button></div></article>
      <article class="settings-card"><div class="settings-card-title"><b>PLAYER TOKEN QUICK MENU</b><small>Controls the popover that opens when you click a linked Player token on the map. It is OFF by default to keep Player-token interaction uncluttered. Monster-token click behavior is always kept for Study / Hinder and GM monster control.</small></div><div class="settings-choice-row two"><button class="settings-choice ${playerTokenQuickMenu ? "active" : ""}" data-player-token-quick-menu-toggle="1"><b>${playerTokenQuickMenu ? "ON" : "OFF"}</b><small>${playerTokenQuickMenu ? "Clicking Player tokens opens the quick menu" : "Clicking Player tokens does nothing extra"}</small></button><div class="settings-choice"><b>MONSTER TOKEN</b><small>Always enabled · Study / Hinder / Monster HUD remains unchanged</small></div></div></article>
      <article class="settings-card compact"><div class="settings-card-title"><b>NAVIGATION</b><small>Tabs can be reordered by holding and dragging them. Reset restores the default order for both main navigation and Character Sheet tabs.</small></div><div class="settings-actions"><button class="mini-btn" data-action="reset-tab-order">RESET TAB ORDER</button><button class="mini-btn" data-action="sound">TEST SOUND</button></div></article>
    </div>
  </section></div>`;
}

function rollHTML() {
  const actor = resolveRollActor(), a = actor.sheet || state, last = runtime.lastRoll, gm = runtime.currentPlayer.role === "GM";
  const randomNumber = runtime.randomNumber || (runtime.randomNumber = { min: "1", max: "21", result: null });
  const actorControl = `<div class="roll-actor-control"><label>CHARACTER<select data-roll-actor ${gm ? "" : "disabled"}>${rollActorOptions(actor.ref)}</select></label><small>${gm ? "GM · ALL ROLLS ON THIS PAGE USE THE SELECTED SHEET" : "PLAYER · ROLLS ARE LOCKED TO YOUR OWN SHEET"}</small></div>`;
  return `<div class="view active"><div class="roll-full-layout"><aside class="roll-side roll-priority"><div class="side-card"><div class="card-title">MANUAL CHECK</div><div class="card-body">${actorControl}<div class="manual-roll-grid"><select data-manual-a>${attrOpts("DEX", a)}</select><select data-manual-b>${attrOpts("INS", a)}</select><input type="number" data-manual-mod value="0" placeholder="MOD"><input data-manual-label value="Custom Check" placeholder="Check name"><button class="primary" data-action="manual-roll">ROLL</button></div></div></div><div class="side-card"><div class="card-title">LATEST RESULT</div><div class="card-body">${last ? `<div class="latest-roll"><b>${esc(last.label)}</b><strong>${last.total}</strong>${Number.isFinite(last.hr) ? `<span>HR ${last.hr}</span>` : `<span>CHECK ONLY</span>`}${rollHasDamage(last) ? `<span>DMG ${last.damage}</span>` : ""}${rollOutcomeBadgeHTML(last, "latest-outcome")}</div>` : `<div class="empty compact">NO ROLL YET</div>`}</div></div></aside><section class="roll-card suggested-rolls"><div class="card-title">ตัวอย่างสถานการณ์ <span>กำหนด MOD แยกแต่ละสถานการณ์ได้ · ใช้ CHARACTER ที่เลือกด้านบน</span></div><div class="suggested-table"><div class="suggested-head"><b>สถานการณ์</b><b>ค่าที่แนะนำ</b><b>MOD</b><span></span></div>${SUGGESTED_CHECKS.map((x,i) => `<div class="suggested-row"><span>${esc(x.label)}</span><b>[${x.attr1} + ${x.attr2}]</b><input class="suggested-mod" type="number" inputmode="numeric" data-suggested-mod="${i}" value="${Number(runtime.suggestedMods?.[i]) || 0}" placeholder="0"><button class="primary" data-suggested-roll="${i}">ROLL</button></div>`).join("")}</div><div class="random-number-panel"><div class="random-number-copy"><b>สุ่มตัวเลข</b><span>กำหนดเลขเริ่มต้นและเลขสิ้นสุด แล้วสุ่มออกมา 1 เลข</span></div><div class="random-number-controls"><label>จาก<input type="number" step="1" inputmode="numeric" data-random-number-min value="${esc(randomNumber.min)}" aria-label="เลขเริ่มต้น"></label><i>—</i><label>ถึง<input type="number" step="1" inputmode="numeric" data-random-number-max value="${esc(randomNumber.max)}" aria-label="เลขสิ้นสุด"></label><button type="button" class="primary" data-action="random-number">สุ่ม 1 เลข</button></div><div class="random-number-result ${Number.isSafeInteger(randomNumber.result) ? "has-result" : ""}"><small>ผลสุ่ม</small><strong>${Number.isSafeInteger(randomNumber.result) ? randomNumber.result : "—"}</strong></div></div></section></div></div>`;
}
function performSuggestedRoll(index) {
  const i = Number(index), x = SUGGESTED_CHECKS[i]; if (!x) return;
  const input = document.querySelector(`[data-suggested-mod="${i}"]`);
  const mod = Number(input?.value ?? runtime.suggestedMods?.[i]) || 0;
  runtime.suggestedMods[i] = mod;
  const actor = resolveRollActor(); doRollWithSheet(actor.sheet, { name: x.label, label: x.label, attr1: x.attr1, attr2: x.attr2, mod, element: "none", note: `Suggested Check · MOD ${mod >= 0 ? "+" : ""}${mod}` }, actor.name, "", { damage: false, hr: false, actorKind: String(actor.ref || "").startsWith("monster:") ? "monster" : "player", actorId: String(actor.ref || "").split(":").slice(1).join(":") });
}
function performManualRoll() {
  const actor = resolveRollActor();
  const attr1 = document.querySelector("[data-manual-a]")?.value || "DEX", attr2 = document.querySelector("[data-manual-b]")?.value || "INS", mod = Number(document.querySelector("[data-manual-mod]")?.value) || 0, label = document.querySelector("[data-manual-label]")?.value || "Custom Check";
  doRollWithSheet(actor.sheet, { name: label, label, attr1, attr2, mod, element: "none", note: "Manual Check" }, actor.name, "", { damage: false, hr: false, actorKind: String(actor.ref || "").startsWith("monster:") ? "monster" : "player", actorId: String(actor.ref || "").split(":").slice(1).join(":") });
}
function performRandomNumber() {
  const draft = runtime.randomNumber || (runtime.randomNumber = { min: "1", max: "21", result: null });
  const minInput = document.querySelector("[data-random-number-min]"), maxInput = document.querySelector("[data-random-number-max]");
  const minRaw = String(minInput?.value ?? draft.min).trim(), maxRaw = String(maxInput?.value ?? draft.max).trim();
  const a = Number(minRaw), b = Number(maxRaw);
  if (!minRaw || !maxRaw || !Number.isSafeInteger(a) || !Number.isSafeInteger(b)) { showToast("สุ่มตัวเลข", "กรอกจำนวนเต็มให้ครบทั้ง 2 ช่อง", "message", false); return; }
  const min = Math.min(a, b), max = Math.max(a, b), span = max - min + 1;
  if (!Number.isSafeInteger(span) || span < 1) { showToast("สุ่มตัวเลข", "ช่วงตัวเลขกว้างเกินไป", "message", false); return; }
  draft.min = String(min); draft.max = String(max); draft.result = min + Math.floor(Math.random() * span);
  playSound("roll"); render();
}

function chatTargets() {
  const players = allParty().filter(p => p.id !== runtime.currentPlayer.id);
  return `<option value="ALL">ALL</option><option value="GM">WHISPER GM</option>${players.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("")}`;
}
function imageMessage(text = "") {
  const m = String(text).match(/^<(https:\/\/[^>]+)>$/i); if (m) return `<img src="${esc(m[1])}" class="chat-image">`;
  const gif = gifFromText(text); return `${formatText(text)}${gif ? `<div>${gifPreview(gif, "feed-gif")}</div>` : ""}`;
}
function feedItem(x) {
  if (x.kind === "roll") {
    const hasDamage = rollHasDamage(x);
    const high = Number.isFinite(Number(x.highResult)) ? Number(x.highResult) : Math.max(Number(x.d1)||0, Number(x.d2)||0);
    const damageHigh = Number.isFinite(Number(x.damageHighRoll)) ? Number(x.damageHighRoll) : (x.twoWeapon || String(x.actionCategory || "").toUpperCase() === "TWO WEAPON" ? 0 : high);
    const mod = Number(x.mod) || 0;
    const acc = `${x.attr1 || "STAT A"} ${x.d1} + ${x.attr2 || "STAT B"} ${x.d2} + MOD ${mod} = ACCURACY ${x.total}`;
    const dmg = hasDamage ? ` · ${x.twoWeapon ? "TWO WEAPON · HR 0" : `HIGH ${damageHigh}`} + DAMAGE BONUS ${Number(x.damageHR)||0} = DMG ${Number(x.damage)||0}` : "";
    const aff = hasDamage && String(x.affinity||"NORMAL").toUpperCase()==="VULNERABILITY" ? ` · VU ${Number(x.adjustedDamage)||0}` : hasDamage && String(x.affinity||"NORMAL").toUpperCase()==="RESISTANCE" ? ` · RS ${Number(x.adjustedDamage)||0}` : "";
    return `<div class="feed-item roll"><div class="feed-meta">${esc(x.senderName)} · ${formatTime(x.time)}</div><b>${esc(x.label)}</b> — ${esc(acc)}${dmg}${aff}${x.targetName ? ` · VS ${esc(x.targetName)}` : ""}${rollOutcomeText(x) ? ` · ${rollOutcomeText(x)}` : ""}${gifPreview(x.detail || "", "feed-gif")}</div>`;
  }
  if (x.kind === "share") return `<div class="feed-item share"><div class="feed-meta">${esc(x.senderName)} · ${formatTime(x.time)}</div><b>${esc(x.title)}</b><div>${imageMessage(x.body || "")}</div></div>`;
  const linkedSheet = sourceSheet(x.senderId);
  const portrait = x.portrait || linkedSheet?.portrait || "";
  const displayName = x.characterName || linkedSheet?.name || x.senderName || "Character";
  const mine = x.senderId === runtime.currentPlayer.id ? " mine" : "";
  const avatar = portrait ? `<img src="${esc(portrait)}" alt="${esc(displayName)}">` : `<span>${esc(String(displayName).slice(0, 1).toUpperCase() || "?")}</span>`;
  return `<div class="chat-message-row${mine}"><div class="chat-avatar">${avatar}</div><div class="chat-message-stack"><div class="chat-speaker">${esc(displayName)}${x.target !== "ALL" ? " · WHISPER" : ""}<time>${formatTime(x.time)}</time></div><div class="chat-bubble">${imageMessage(x.text || "")}</div></div></div>`;
}
function feedHTML(limit = 100) { const arr = runtime.feed.slice(-limit).reverse(); return arr.length ? arr.map(feedItem).join("") : `<div class="empty">NO ACTIVITY</div>`; }
function combatHistoryItem(x) {
  return `<div class="combat-history-item history-${esc(x.category || "system")} ${x.undone ? "history-undone" : ""}"><span class="history-dot"></span><div><b>${esc(x.text)}</b><small>${esc(x.actor || "SYSTEM")} · ${formatTime(x.time)}${x.undone ? " · UNDONE" : x.undo ? " · UNDOABLE" : ""}</small></div></div>`;
}
function combatHistoryHTML(limit = 200) {
  const arr = runtime.combatHistory.slice(-limit).reverse();
  return arr.length ? arr.map(combatHistoryItem).join("") : `<div class="empty">NO COMBAT HISTORY</div>`;
}
function chatHTML() {
  const panel = ["chat","history","ai"].includes(runtime.chatPanel) ? runtime.chatPanel : "chat";
  const history = panel === "history", ai = panel === "ai";
  const clearButton = history
    ? `${runtime.currentPlayer.role === "GM" ? `<button class="mini-btn" data-action="undo-last-combat" ${latestUndoableHistory() ? "" : "disabled"}>UNDO LAST</button><button class="danger-soft" data-action="clear-combat-history">CLEAR HISTORY</button>` : ""}`
    : ai
      ? `<button class="danger-soft" data-action="clear-fabula-ai">CLEAR AI CHAT</button>`
      : `<button class="danger-soft" data-action="clear-chat">CLEAR CHAT</button>`;
  const tabs = `<div class="chat-subtabs" data-dom-key="chat-subtabs" role="tablist" aria-label="Chat panels"><button type="button" class="chat-subtab ${panel === "chat" ? "active" : ""}" data-dom-key="chat-subtab-room" data-action="switch-chat-panel" data-chat-panel="chat" role="tab" aria-selected="${panel === "chat"}">ROOM CHAT</button><button type="button" class="chat-subtab ${history ? "active" : ""}" data-dom-key="chat-subtab-history" data-action="switch-chat-panel" data-chat-panel="history" role="tab" aria-selected="${history}">COMBAT HISTORY <span>${runtime.combatHistory.length}</span></button><button type="button" class="chat-subtab fabula-ai-tab ${ai ? "active" : ""}" data-dom-key="chat-subtab-ai" data-action="switch-chat-panel" data-chat-panel="ai" role="tab" aria-selected="${ai}">FABULA AI</button></div>`;
  let main = "", side = "";
  if (ai) {
    main = `<div class="chat-panel-stage" data-dom-key="chat-stage-ai"><div class="card-title">FABULA AI · THAI RULE ASSISTANT ${clearButton}</div>${fabulaAiPanelHTML()}</div>`;
    side = `<aside class="side-card fabula-ai-side" data-dom-key="chat-side-ai"><div class="card-title">ORIGINAL BOOKS</div><div class="card-body"><div class="fabula-ai-book-list">${fabulaAiBooksHTML()}</div><div class="fabula-ai-note">ค้นจากหนังสือ Original 4 เล่มที่ผู้ใช้ให้มา และตอบเป็นภาษาไทย พร้อมชื่อหนังสือ + เลขหน้า<br><br><b>หมายเหตุ:</b> ใช้ Local Rule Search ภายใน Extension ยังไม่ได้เชื่อม API ของโมเดล AI ภายนอก</div></div></aside>`;
  } else if (history) {
    main = `<div class="chat-panel-stage" data-dom-key="chat-stage-history"><div class="card-title">COMBAT HISTORY · SCENE LOG ${clearButton}</div><div class="combat-history-list">${combatHistoryHTML()}</div></div>`;
    side = `<aside class="side-card" data-dom-key="chat-side-history"><div class="card-title">HISTORY</div><div class="card-body"><p>บันทึก HP / MP / IP / UP, Status, Study, Roll, Initiative และ Clock/Project ของ Scene นี้</p><p>CRISIS คำนวณจาก HP อัตโนมัติและจะแสดงใน log เมื่อ HP เปลี่ยนเข้าสู่ช่วง Crisis</p><p>Combat History sync กับ Scene metadata แยกจาก Room Chat/Fabula AI และ serialize การเขียนเพื่อลด race condition</p></div></aside>`;
  } else {
    main = `<div class="chat-panel-stage" data-dom-key="chat-stage-room"><div class="card-title">ROOM CHAT · REALTIME ${clearButton}</div><div class="feed">${feedHTML()}</div><div class="chat-compose"><select data-chat-target>${chatTargets()}</select><textarea data-chat-input placeholder="Message... (=61-26 calculator, <https://...> image)"></textarea><button class="primary" data-action="send-chat">SEND</button></div></div>`;
    side = `<aside class="side-card" data-dom-key="chat-side-room"><div class="card-title">LIVE EVENTS</div><div class="card-body"><p>ROLL and SEND events appear immediately for everyone in the room with a large cinematic popup and sound.</p><p>GIF links inside Details are rendered as media and hidden from popup text.</p></div></aside>`;
  }
  return `<div class="view active" data-dom-key="chat-view"><div class="chat-layout"><section class="chat-card" data-dom-key="chat-card">${tabs}${main}</section>${side}</div></div>`;
}

async function sendChat() {
  const el = document.querySelector("[data-chat-input]"), text = el?.value?.trim(); if (!text) return;
  if (text === "/clearchat" && runtime.currentPlayer.role === "GM") { runtime.feed = []; saveFeed(); broadcast("clear", { id: uid() }); render(); return; }
  if (text.startsWith("=")) { try { el.value = String(safeCalc(text.slice(1))); return; } catch { return notify("Invalid calculation"); } }
  const msg = { id: uid(), senderId: runtime.currentPlayer.id, senderName: runtime.currentPlayer.name, characterName: state.deleted ? runtime.currentPlayer.name : (state.name || runtime.currentPlayer.name), portrait: state.deleted ? "" : (state.portrait || ""), target: runtime.chatTarget || "ALL", text, time: Date.now() };
  if (relevantMessage(msg)) pushFeed({ kind: "chat", ...msg }); broadcast("chat", msg); playSound("message"); el.value = ""; render();
}
const HUD_LAYOUT_KEYS=[COMPANION_HUD_PREF_KEY,`${NS}/initiative-tracker-collapsed-local-v1`,`${NS}/initiative-tracker-layout-local-v1`,`${NS}/initiative-tracker-positions-local-v1`];
function loadHudLayoutPresets(){try{const value=JSON.parse(localStorage.getItem(HUD_LAYOUT_VAULT_KEY)||"[]");return Array.isArray(value)?value:[]}catch{return []}}
function saveHudLayoutPresets(rows){localStorage.setItem(HUD_LAYOUT_VAULT_KEY,JSON.stringify(rows.slice(0,20)))}
function snapshotHudLayout(){return Object.fromEntries(HUD_LAYOUT_KEYS.map(key=>[key,localStorage.getItem(key)]))}
function restoreHudLayout(preset){for(const key of HUD_LAYOUT_KEYS){const value=preset?.layout?.[key];if(typeof value==="string")localStorage.setItem(key,value);else localStorage.removeItem(key)}sendCompanionHudControl({type:"restore-layout",time:Date.now()})}
function vaultHTML() {
  const vault = loadVault();
  return `<div class="view active"><div class="vault-layout"><section class="action-editor"><div class="card-title">CHARACTER VAULT <button class="primary" data-action="vault-save" ${state.deleted ? "disabled" : ""}>SAVE MY CURRENT CHARACTER</button></div><div class="card-body">${vault.length ? vault.map((v, i) => `<div class="vault-item"><b>${esc(v.name)}</b><small>LV ${v.level}</small><button class="mini-btn" data-vault-load="${i}">LOAD AS MY CHARACTER</button><button class="mini-btn" data-send-vault="${i}">SEND</button><button class="danger-btn" data-vault-delete="${i}">×</button></div>`).join("") : `<div class="empty">NO SAVED CHARACTERS</div>`}</div></section><section class="action-editor"><div class="card-title">HUD LAYOUT PRESETS</div><div class="card-body"><p>Save shortcut button positions and Initiative Tracker layout together.</p><div class="settings-actions"><input data-hud-layout-name maxlength="50" placeholder="Preset name"><button class="primary" data-action="hud-layout-save">SAVE CURRENT POSITIONS</button></div>${loadHudLayoutPresets().map((preset,i)=>`<div class="vault-item"><b>${esc(preset.name)}</b><button class="mini-btn" data-hud-layout-load="${i}">RESTORE</button><button class="danger-btn" data-hud-layout-delete="${i}">×</button></div>`).join("")||`<div class="empty">NO SAVED LAYOUTS</div>`}</div></section><aside class="side-card"><div class="card-title">TRANSFER</div><div class="card-body"><button class="primary" data-action="export" ${state.deleted ? "disabled" : ""}>EXPORT JSON</button><label class="mini-btn file-label">IMPORT JSON<input class="hidden" type="file" accept="application/json" data-import></label></div></aside></div></div>`;
}
function exportJSON() { if (state.deleted) return; const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }), a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${state.name.replace(/[^a-z0-9-_]+/gi, "-") || "fabula"}.json`; a.click(); }
async function importJSON(file) { try { state = normalizeState(JSON.parse(await file.text())); state.deleted = false; await publish(); render(); notify("Character imported"); } catch { notify("Invalid JSON"); } }

function spawnMonster(templateId, faction = "enemy", startPhase = 0) {
  if (runtime.currentPlayer.role !== "GM") return;
  const t = libraryMonsterById(templateId); if (!t) return;
  const normalizedFaction = faction === "ally" ? "ally" : "enemy";
  const base = t.name || "Monster";
  const nums = runtime.sceneMonsters.filter(x => x.baseName === base).map(x => Number(x.spawnIndex) || 1);
  const n = nums.length ? Math.max(...nums) + 1 : 1;
  const copy = normalizeMonster({ ...deepClone(t), id: uid(), instanceId: uid(), templateId: t.id, baseName: base, spawnIndex: n, name: n === 1 ? base : `${base} #${n}`, faction: normalizedFaction, folderId: "", studyTier: 0, activePhase: 0, linkedTokenId: "", showHud: true, sceneNoTurn: false });
  copy.studyTier = 0;
  copy.activePhase = clamp(Number(startPhase) || 0, 0, copy.phases.length);
  syncMonsterResourceCaps(copy);
  copy.hp.current = copy.hp.max; copy.mp.current = copy.mp.max;
  copy.phases = (copy.phases || []).map(phase => ({ ...phase, studyTier: 0 }));
  const privateRules = loadMonsterInstanceRules(); privateRules[copy.id] = deepClone(copy.specialRules || []); saveMonsterInstanceRules(privateRules);
  runtime.sceneMonsters.push(copy); scheduleSceneSave(); recordCombatHistory("system", `${copy.name} · ADDED TO SCENE · ${normalizedFaction.toUpperCase()}`); showToast(normalizedFaction === "ally" ? "Ally sent to Scene" : "Enemy sent to Scene", copy.name, "spawn"); render();
  return copy;
}
function monsterAutoTokenArt(m) {
  if (!m) return null;
  const v = monsterPhaseView(m, "active");
  // Prefer dedicated TOKEN ART. Portrait is a safe square-token fallback so
  // SEND TO SCENE can still create a linked token for older templates.
  return normalizeTokenArt(v?.tokenArt)
    || normalizeTokenArt(v?.portrait)
    || normalizeTokenArt(m.tokenArt)
    || normalizeTokenArt(m.portrait);
}
async function addMonsterToSceneWithToken(templateId, faction = "enemy", startPhase = 0) {
  if (runtime.currentPlayer.role !== "GM") return null;
  const instance = spawnMonster(templateId, faction, startPhase);
  if (!instance) return null;
  const v = monsterPhaseView(instance, "active"), finalName = v?.name || instance.name || "MONSTER";
  const art = monsterAutoTokenArt(instance);
  if (!art) {
    showToast("MONSTER ADDED · NO TOKEN ART", `${finalName} is in Scene, but no TOKEN ART or PORTRAIT is available.`, "message");
    notify(`${finalName} added to Scene · set TOKEN ART or PORTRAIT to spawn a linked token`);
    return instance;
  }
  if (PREVIEW || !OBR) {
    notify(`${finalName} added to Scene · token auto-spawn is available inside Owlbear`);
    return instance;
  }
  try {
    const token = await spawnTokenAtDefaultViewAndLink({ kind: "active-monster", monsterId: instance.id }, art, finalName);
    if (token) {
      recordCombatHistory("system", `${finalName} · TOKEN AUTO-SPAWNED · STATS LINKED`);
      showToast("MONSTER + TOKEN READY", `${finalName} · stats linked`, "spawn");
    }
  } catch (e) {
    console.warn("auto spawn monster token", e);
    notify(`${finalName} is in Scene, but token auto-spawn failed`);
  }
  return instance;
}
async function spawnMonsterTemplateTokenAndLink(templateId, faction = "enemy") {
  if (runtime.currentPlayer.role !== "GM") return;
  const template = libraryMonsterById(templateId); if (!template) return notify("Monster Template not found");
  const phaseIndex = monsterPhaseIndex(template, "lib"), view = monsterPhaseView(template, "lib");
  const art = normalizeTokenArt(view?.tokenArt);
  if (!art) return notify(`Set TOKEN ART for ${monsterPhaseLabel(template, phaseIndex)} before spawning`);
  try {
    await spawnTokenAtDefaultViewAndLink({ kind: "monster-template", templateId, faction: faction === "ally" ? "ally" : "enemy", phaseIndex }, art, view?.name || template.name || "MONSTER");
  } catch (e) { console.warn(e); notify(e?.message || "Monster token spawn failed"); }
}
function removeSceneMonster(id) {
  if (runtime.currentPlayer.role !== "GM") return;
  const m = monsterById(id); if (!m) return;
  const v = monsterPhaseView(m, "active"); if (!confirm(`Remove ${v.name} from this Scene?`)) return;
  runtime.sceneMonsters = runtime.sceneMonsters.filter(x => x.id !== id); scheduleSceneSave(); recordCombatHistory("system", `${v.name || "MONSTER"} · REMOVED FROM SCENE`); const privateRules = loadMonsterInstanceRules(); delete privateRules[id]; saveMonsterInstanceRules(privateRules); if (runtime.inspect?.kind === "monster" && runtime.inspect.id === id) runtime.inspect = null; render();
}
function duplicateMonsterTemplate(id) {
  if (runtime.currentPlayer.role !== "GM") return;
  const source = libraryMonsterById(id); if (!source) return;
  const names = new Set((runtime.monsterLibrary || []).map(x => String(x.name || "").trim().toLowerCase()));
  const base = String(source.name || "Monster").trim() || "Monster";
  let copyName = `${base} Copy`, suffix = 2;
  while (names.has(copyName.toLowerCase())) copyName = `${base} Copy ${suffix++}`;
  const raw = deepClone(source);
  raw.id = uid();
  raw.name = copyName;
  raw.folderId = String(source.folderId || "");
  raw.linkedTokenId = "";
  raw.instanceId = "";
  raw.templateId = "";
  raw.baseName = "";
  raw.spawnIndex = 0;
  raw.updatedAt = Date.now();
  raw.phases = (Array.isArray(raw.phases) ? raw.phases : []).map((phase, i) => ({ ...phase, id: `phase-${uid()}`, label: normalizeMonsterPhaseLabel(phase?.label, i + 1) }));
  const copy = normalizeMonster(raw);
  copy.id = raw.id;
  copy.name = copyName;
  copy.folderId = raw.folderId;
  copy.linkedTokenId = "";
  copy.updatedAt = Date.now();
  runtime.monsterLibrary.push(copy);
  saveMonsterLibrary(runtime.monsterLibrary);
  showToast("TEMPLATE DUPLICATED", `${base} → ${copyName}`, "message");
  render();
}
function deleteMonsterTemplate(id) {
  if (runtime.currentPlayer.role !== "GM") return;
  const m = libraryMonsterById(id); if (!m || !confirm(`Delete monster template ${m.name}? This also removes its Codex record for everyone.`)) return;
  runtime.monsterLibrary = runtime.monsterLibrary.filter(x => x.id !== id);
  saveMonsterLibrary(runtime.monsterLibrary);
  purgeCodexForTemplateRef({ templateId: id, templateName: m.name }, true);
  broadcast("codex-template-delete", { id: uid(), senderId: runtime.currentPlayer.id, templateId: id, templateName: m.name, time: Date.now() });
  if (runtime.monsterEditId === id) runtime.monsterEditId = null;
  showToast("MONSTER LIBRARY", `${m.name} deleted · Codex removed`, "message");
  render();
}
async function deleteCharacter(owner) {
  const p = sourceParty(owner), s = sourceSheet(owner); if (!s || s.deleted) return;
  if (!confirm(`Delete character sheet "${s.name || p?.name || "Character"}" and remove it from Scene Characters?`)) return;
  await sendRemoteEdit(owner, { kind: "delete-sheet" });
  runtime.inspect = null; runtime.partyEditTab = "sheet"; render();
}
async function createMyCharacter() {
  state = defaultState(runtime.currentPlayer.name || "NEW CHARACTER"); await publish(); runtime.inspect = { kind: "player", id: runtime.currentPlayer.id }; render();
}

function findMonsterTarget(mode, id) { return mode === "lib" ? libraryMonsterById(id) : monsterById(id); }
function handleMonsterInput(el, eventType = "") {
  if (el.dataset.monsterLibField) {
    const [id, ...rest] = el.dataset.monsterLibField.split(":"), path = rest.join(":"), m = libraryMonsterById(id); if (!m) return true;
    const manualResourceField = ["ip.current","ip.max","fp","up.current"].includes(path);
    const computedResourceField = path.endsWith("hpMod") || path.endsWith("mpMod") || path.endsWith("level");
    const levelAdjustmentField = path.endsWith("normalLevel");
    if ((manualResourceField || computedResourceField || levelAdjustmentField) && eventType !== "change") return true;
    let v = el.type === "number" ? Number(el.value) : el.value; setByPath(m, path, v); updateMonster("lib", id, () => {}); if (path === "villainType" || path.endsWith("rank") || path === "ip.max" || manualResourceField || computedResourceField || levelAdjustmentField) render(); return true;
  }
  if (el.dataset.activeMonsterField) {
    const [id, ...rest] = el.dataset.activeMonsterField.split(":"), path = rest.join(":"), m = monsterById(id); if (!m || runtime.currentPlayer.role !== "GM") return true;
    const combatResourceField = ["hp.current","mp.current","ip.current","ip.max","fp","up.current"].includes(path);
    const computedResourceField = path.endsWith("hpMod") || path.endsWith("mpMod") || path.endsWith("level");
    const levelAdjustmentField = path.endsWith("normalLevel");
    if ((combatResourceField || computedResourceField || levelAdjustmentField) && eventType !== "change") return true;
    const v = el.type === "number" ? Number(el.value) : el.value; updateMonster("active", id, x => setByPath(x, path, v)); if (path === "villainType" || path.endsWith("rank") || path === "ip.max" || combatResourceField || computedResourceField || levelAdjustmentField) render(); return true;
  }
  if (el.dataset.monsterStatusImmune) {
    if (eventType !== "change") return true;
    const [mode, id, status] = el.dataset.monsterStatusImmune.split(":");
    if (!STATUS_NAMES.includes(status)) return true;
    const m = findMonsterTarget(mode, id); if (!m) return true;
    const immune = !!el.checked;
    updateMonster(mode, id, raw => {
      raw.statusImmunities ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
      raw.statuses ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
      raw.statusImmunities[status] = immune;
      if (immune) raw.statuses[status] = false;
    });
    if (mode === "active") {
      const v = monsterPhaseView(m, "active");
      recordCombatHistory("status", `${v?.name || m.name || "MONSTER"} · ${status.toUpperCase()} IMMUNITY ${immune ? "ON" : "OFF"}`);
    }
    playSound("status"); render(); return true;
  }
  if (el.dataset.monsterAffinity) {
    const [mode, id, element] = el.dataset.monsterAffinity.split(":"); paintAffinitySelect(el); updateMonster(mode, id, m => { monsterPhaseTarget(m, mode).affinities[element] = el.value; }); return true;
  }
  if (el.dataset.monsterActionField) {
    const workspace = document.querySelector(".workspace"), context = uiContextKey();
    if (workspace) runtime.uiScroll[context] = { top: workspace.scrollTop, left: workspace.scrollLeft };
    const [mode, id, index, key] = el.dataset.monsterActionField.split(":"), m = findMonsterTarget(mode, id); if (!m) return true;
    const target = monsterPhaseTarget(m, mode); if (!target.actions?.[Number(index)]) return true; target.actions[Number(index)][key] = key === "category" ? normalizeActionType(el.value) : (el.type === "number" ? Number(el.value) : el.value);if(key==="category"&&isGuardFamilyAction(el.value))target.actions[Number(index)].mode="NO ROLL"; updateMonster(mode, id, () => {}); if (key === "mode" || key === "category") render(); return true;
  }
  if (el.dataset.monsterActionCheck) {
    const [mode, id, index, key] = el.dataset.monsterActionCheck.split(":"), m = findMonsterTarget(mode, id); if (m) { const target = monsterPhaseTarget(m, mode); if (target.actions?.[Number(index)]) target.actions[Number(index)][key] = el.checked; updateMonster(mode, id, () => {}); } return true;
  }
  if (el.dataset.monsterRuleField) {
    const [mode, id, index, key] = el.dataset.monsterRuleField.split(":"), m = findMonsterTarget(mode, id); if (m) { m.specialRules[Number(index)][key] = el.value; updateMonster(mode, id, () => {}); } return true;
  }
  return false;
}
function handleInput(e) {
  const el = e.target;
  if (isBufferedEditorControl(el) && e.type === "input") el.dataset.pendingSave = "1";
  if (handleMonsterInput(el, e.type)) { if (e.type === "change" && isBufferedEditorControl(el)) delete el.dataset.pendingSave; return; }
  if (el.hasAttribute("data-gm-broadcast-title")) { runtime.gmBroadcastDraft.title = el.value; return; }
  if (el.hasAttribute("data-gm-broadcast-body")) { runtime.gmBroadcastDraft.body = el.value; return; }
  if (el.hasAttribute("data-gm-group-label")) { runtime.gmGroupCheck.draft.label = String(el.value||"").slice(0,72); saveGMGroupCheckState(); return; }
  if (el.hasAttribute("data-gm-group-attr1") && e.type === "change") { runtime.gmGroupCheck.draft.attr1 = ATTRS.includes(el.value)?el.value:"DEX"; saveGMGroupCheckState(); render(); return; }
  if (el.hasAttribute("data-gm-group-attr2") && e.type === "change") { runtime.gmGroupCheck.draft.attr2 = ATTRS.includes(el.value)?el.value:"INS"; saveGMGroupCheckState(); render(); return; }
  if (el.hasAttribute("data-gm-group-mod")) { runtime.gmGroupCheck.draft.mod = clamp(Number(el.value)||0,-99,99); if(e.type==="change")saveGMGroupCheckState(); return; }
  if (el.hasAttribute("data-gm-group-dl")) { runtime.gmGroupCheck.draft.finalDL = clamp(Number(el.value)||10,1,99); if(e.type==="change")saveGMGroupCheckState(); return; }
  if (el.hasAttribute("data-gm-group-leader") && e.type === "change") { runtime.gmGroupCheck.draft.leaderId = String(el.value||""); runtime.gmGroupCheck.draft.supporters=(runtime.gmGroupCheck.draft.supporters||[]).filter(id=>!sameId(id,el.value)); saveGMGroupCheckState(); render(); return; }
  if (el.hasAttribute("data-gm-group-bond") && e.type === "change") { const a=runtime.gmGroupCheck.active;if(a&&a.status==="support"){a.bondBonus=gmGroupCheckSupportBonus(a)>0?clamp(Number(el.value)||0,0,3):0;saveGMGroupCheckState();render();} return; }
  if (el.hasAttribute("data-gm-shop-size")) { runtime.gmShop.size = clamp(Number(el.value) || 7, 3, 12); if (e.type === "change") saveGMShopState(); return; }
  if (el.hasAttribute("data-gm-shop-role") && e.type === "change") { runtime.gmShop.role = el.value; saveGMShopState(); render(); return; }
  if (el.hasAttribute("data-gm-shop-stock-role") && e.type === "change") { runtime.gmShop.stockRole = el.value; runtime.gmShop.stockPage = 1; saveGMShopState(); render(); return; }
  if (el.hasAttribute("data-gm-shop-search")) { runtime.gmShop.stockSearch = el.value; return; }

  if (el.dataset.chatTarget) { runtime.chatTarget = el.value; return; }
  if (el.dataset.aiBook && e.type === "change") { runtime.aiBooks[el.dataset.aiBook] = !!el.checked; return; }
  if (el.hasAttribute("data-roll-actor")) {
    if (runtime.currentPlayer.role !== "GM") { runtime.rollActor = `player:${runtime.currentPlayer.id}`; render(); return; }
    runtime.rollActor = String(el.value || ""); render(); return;
  }
  if (el.dataset.suggestedMod !== undefined) { const i = Number(el.dataset.suggestedMod); if (Number.isInteger(i) && i >= 0 && i < SUGGESTED_CHECKS.length) runtime.suggestedMods[i] = Number(el.value) || 0; return; }
  if (el.hasAttribute("data-random-number-min")) { runtime.randomNumber ||= { min: "1", max: "21", result: null }; runtime.randomNumber.min = el.value; return; }
  if (el.hasAttribute("data-random-number-max")) { runtime.randomNumber ||= { min: "1", max: "21", result: null }; runtime.randomNumber.max = el.value; return; }
  if (el.dataset.studyMod !== undefined) { runtime.studyMod = Number(el.value) || 0; return; }
  if (el.hasAttribute("data-damage-mod-input")) {
    const roll = runtime.overlay; if (!roll) return;
    const draft = ensureDamageApplyDraft(roll); draft._mod = clamp(Number(el.value) || 0, -999, 999);
    if (e.type === "change") renderOverlay();
    return;
  }
  if (el.dataset.damageHitsInput !== undefined) {
    const roll = runtime.overlay; if (!roll) return;
    const draft = ensureDamageApplyDraft(roll), rec = draft[el.dataset.damageHitsInput];
    if (rec) rec.hits = clamp(Number(el.value) || 0, 0, 99);
    if (e.type === "change") renderOverlay();
    return;
  }
  if (el.hasAttribute("data-monster-damage-mod")) { const draft=ensureMonsterDamageApplyDraft(runtime.overlay);draft.mod=clamp(Number(el.value)||0,-999,999);if(e.type==="change")renderOverlay();return; }
  if (el.dataset.monsterDamageHits !== undefined) { const rec=ensureMonsterDamageApplyDraft(runtime.overlay).targets[el.dataset.monsterDamageHits];if(rec)rec.hits=clamp(Number(el.value)||0,0,99);if(e.type==="change")renderOverlay();return; }
  if (el.dataset.monsterDamageBase !== undefined) { const rec=ensureMonsterDamageApplyDraft(runtime.overlay).targets[el.dataset.monsterDamageBase];if(rec)rec.base=clamp(Number(el.value)||0,0,9999);if(e.type==="change")renderOverlay();return; }
  if (el.dataset.sceneTrackerField && e.type === "change") {
    const [kind, index, ...rest] = el.dataset.sceneTrackerField.split(":"), path = rest.join(":"), item = runtime.sceneTrackers?.[kind]?.[Number(index)];
    if (item) {
      let value = el.type === "number" ? Number(el.value) : el.value;
      if (path === "segments") { value = clamp(value, 1, 12); item.progress = clamp(item.progress, 0, value); }
      setByPath(item, path, value); scheduleTrackerSave(); render();
    }
    delete el.dataset.pendingSave;
    return;
  }
  if (el.hasAttribute("data-hinder-target") && e.type === "change") {
    const requestedTargetId = String(el.value ?? "");
    if (requestedTargetId === "__study_only__") {
      runtime.hinderTargetId = "__study_only__";
    } else {
      const resolvedTarget = studyHinderMonsterTarget({ id: requestedTargetId });
      runtime.hinderTargetId = resolvedTarget ? String(resolvedTarget.id) : "__study_only__";
    }
    render();
    return;
  }
  if (el.dataset.monsterRandomCount) {
    const [mode, id] = el.dataset.monsterRandomCount.split(":"), m = findMonsterTarget(mode, id);
    if (m) { const st = monsterRandomTargetState(m, mode); st.count = Math.max(1, Number(el.value) || 1); }
    return;
  }
  if (el.dataset.import && el.files?.[0]) { importJSON(el.files[0]); return; }
  if (el.dataset.classLevelOwner && e.type === "input") { paintClassTotalLevel(el.dataset.classLevelOwner); }
  if (el.dataset.remoteField && e.type === "change") {
    const [owner, ...rest] = el.dataset.remoteField.split(":"), path = rest.join(":"), value = el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value) : el.value;
    delete el.dataset.pendingSave;
    sendRemoteEdit(owner, { kind: "set", path, value }); return;
  }
  if (el.dataset.remoteAffinity && e.type === "change") {
    const [owner, element] = el.dataset.remoteAffinity.split(":"); paintAffinitySelect(el); delete el.dataset.pendingSave; sendRemoteEdit(owner, { kind: "set", path: `affinities.${element}`, value: el.value }); return;
  }
  if (el.dataset.remoteAction && e.type === "change") {
    const [owner, i, key] = el.dataset.remoteAction.split(":"), value = el.type === "number" ? Number(el.value) : el.value;
    delete el.dataset.pendingSave;
    sendRemoteEdit(owner, { kind: "set", path: `actions.${i}.${key}`, value });
    if(key==="category"&&isGuardFamilyAction(value))sendRemoteEdit(owner,{kind:"set",path:`actions.${i}.mode`,value:"NO ROLL"});
    if (key === "mode" || key === "category") setTimeout(render, 80); return;
  }
  if (el.dataset.remoteActionCheck && e.type === "change") {
    const [owner, i, key] = el.dataset.remoteActionCheck.split(":"); delete el.dataset.pendingSave; sendRemoteEdit(owner, { kind: "set", path: `actions.${i}.${key}`, value: el.checked }); return;
  }
  if (el.dataset.sceneRosterSearch !== undefined && e.type === "input") { runtime.sceneRosterSearch = el.value; applySceneRosterFilterDOM(); return; }
  if (el.dataset.quickInput && e.type === "change") {
    const [kind, id, key] = el.dataset.quickInput.split(":"); delete el.dataset.pendingSave; if (kind === "player") setPlayerQuick(id, key, el.value); else setMonsterQuick(id, key, el.value); return;
  }
}

function switchChatPanel(nextPanel = "chat") {
  const panel = ["chat", "history", "ai"].includes(String(nextPanel || "")) ? String(nextPanel) : "chat";
  runtime.view = "chat";
  runtime.chatPanel = panel;
  runtime.inspect = null;
  runtime.sceneStatusPanel = null;
  // AI page preview is owned by the AI panel only and must never become a click shield elsewhere.
  if (panel !== "ai" && runtime.overlay?.kind === "fabula-ai-page") runtime.overlay = null;
  // Force a fresh shell comparison for sub-panel transitions; prevents a stale morph cache from reusing AI DOM in History.
  runtime.lastShellHTML = "";
  render();
}

async function handleClick(e) {
  const navArrow=e.target?.closest?.("[data-nav-scroll]");if(navArrow){document.querySelector(".topbar .tabs")?.scrollBy({left:Number(navArrow.dataset.navScroll)*230,behavior:"smooth"});return;}
  if (e.target?.matches?.("[data-popup-pass-through-backdrop],[data-overlay-backdrop-close]")) {
    if (runtime.overlay?.kind === "player-defeat-choice") return;
    dismissOverlay(); return;
  }
  const currentTurnToggle = e.target.closest("[data-scene-current-toggle]");
  const currentTurnInteractive = e.target.closest("button,input,textarea,select,label,a,[contenteditable='true']");
  if (currentTurnToggle && !currentTurnInteractive) { runtime.sceneSummaryCollapsed = !runtime.sceneSummaryCollapsed; saveUIPrefs({ sceneSummaryCollapsed: runtime.sceneSummaryCollapsed }); render(); return; }
  const sceneCardControl = e.target.closest("button,input,textarea,select,label,a,[contenteditable='true'],.scene-v262-resources,.scene-v262-init-row,.scene-v263-status-line,.scene-v262-actions,.monster-quick-panel");
  const sceneCard = sceneCardControl ? null : e.target.closest("[data-scene-open-player],[data-scene-open-monster]");
  if (sceneCard?.dataset.sceneOpenPlayer) { runtime.sceneStatusPanel = null; runtime.inspect = { kind: "player", id: sceneCard.dataset.sceneOpenPlayer }; runtime.partyEditTab = "sheet"; render(); return; }
  if (sceneCard?.dataset.sceneOpenMonster) { runtime.sceneStatusPanel = null; runtime.inspect = { kind: "monster", id: sceneCard.dataset.sceneOpenMonster }; runtime.monsterTab = "sheet"; render(); return; }
  const b = e.target.closest("button,[data-inspect-player],[data-inspect-monster],[data-action],[data-remote-clock-general],[data-remote-clock],[data-scene-clock-progress],[data-remote-zero-progress],[data-damage-target-add],[data-damage-target-sub],[data-damage-mode],[data-damage-mod-step],[data-apply-damage-target],[data-apply-damage-all],[data-codex-folder-rename],[data-codex-folder-delete],[data-codex-folder-toggle],[data-monster-folder-rename],[data-monster-folder-delete],[data-monster-folder-toggle]"); if (!b) return;
  if (b.closest("summary")) e.preventDefault();
  if (b.hasAttribute("data-companion-flow-retry")) { companionHudFlowStatus("FABULA · RETRYING FLOW"); await startCompanionHudFlow(COMPANION_FLOW_COMMAND_ID,true); return; }
  if (b.hasAttribute("data-companion-flow-close")) { clearTimeout(companionHudFlowRetryTimer); closeCompanionFlowPopover(); return; }
  if (b.hasAttribute("data-companion-travel-retry")) { await loadCompanionTravelSnapshot(); return; }
  if (b.hasAttribute("data-companion-travel-close")) { closeCompanionTravelPopover(); return; }
  if (b.dataset.costTargetPick) {
    const prompt=runtime.overlay,ctx=monsterCostTargetContext(prompt);if(!ctx)return;
    snapshotCostPromptInputs();const [kind,id]=String(b.dataset.costTargetPick).split("|"),target=ctx.pool.find(t=>t.kind===kind&&t.id===id);if(!target)return;
    const at=ctx.st.targets.findIndex(t=>t.kind===kind&&t.id===id);
    if(at>=0)ctx.st.targets.splice(at,1);else{const resolved=resolveRollTarget(`${kind}:${id}`);if(stopCoveredEnemyMelee(ctx.sheet,ctx.action,normalizeActionType(ctx.action.category),resolved?[resolved]:[]))return;ctx.st.targets.push({kind:target.kind,id:target.id,name:target.name})}
    renderOverlay();return;
  }
  if (b.hasAttribute("data-cost-target-clear")) { const ctx=monsterCostTargetContext(runtime.overlay);if(ctx){snapshotCostPromptInputs();ctx.st.targets=[];renderOverlay()}return; }
  if (b.hasAttribute("data-cost-target-random")) {
    const prompt=runtime.overlay,ctx=monsterCostTargetContext(prompt);if(!ctx)return;snapshotCostPromptInputs();
    const count=clamp(Number(prompt.targetRandomCount)||1,1,Math.max(1,ctx.pool.length)),melee=mainRollIsMelee(ctx.action,normalizeActionType(ctx.action.category))&&ctx.sheet?.faction!=="ally";
    const eligible=melee?ctx.pool.filter(t=>!coveredMeleeEntry(resolveRollTarget(`${t.kind}:${t.id}`))):ctx.pool;
    if(!eligible.length){ctx.st.targets=[];showToast("NO VALID TARGET","All available targets are protected from this Melee Attack.","crisis",false);renderOverlay();return}
    ctx.st.count=Math.min(count,eligible.length);ctx.st.targets=shuffledTargets(eligible).slice(0,ctx.st.count).map(t=>({kind:t.kind,id:t.id,name:t.name}));
    if(eligible.length<ctx.pool.length)showToast("COVERED TARGETS SKIPPED",ctx.st.targets.map(t=>t.name).join(" · "),"message",false);renderOverlay();return;
  }
  if (b.dataset.invokeTraitRoll) { await invokeTraitReroll(b.dataset.invokeTraitRoll); return; }
  if (b.hasAttribute("data-invoke-bond-apply")) { await invokeBondOnRoll(); return; }
  if (b.hasAttribute("data-token-hud-close")) { closeTokenActionHud(); return; }
  if (b.hasAttribute("data-token-hud-switch")) { await switchTokenActionHudToSelection(); return; }
  if (b.dataset.tokenHudTab) { runtime.tokenActionHud.tab = ["actions","items","roll"].includes(b.dataset.tokenHudTab) ? b.dataset.tokenHudTab : "actions"; render(); return; }
  if (b.dataset.tokenHudAction) { await tokenActionHudUseAction(b.dataset.tokenHudAction); return; }
  if (b.dataset.useGuardAction) { const [kind,id,ri,mode="active"]=String(b.dataset.useGuardAction).split(":"); startGuardAction(kind,id,Number(ri),mode); return; }
  if (b.dataset.guardCoverTarget) { const x=runtime.overlay;if(x?.kind!=="guard-cover-target")return;const [kind,id,tokenId]=String(b.dataset.guardCoverTarget).split("|");const target=(x.targets||[]).find(t=>t.kind===kind&&t.id===id&&t.tokenId===tokenId);const actor=guardActor(x.actorKind,x.actorId,x.mode);runtime.overlay=null;renderOverlay();if(actor&&target)queueGuardCost(actor,x.index,target);return; }
  if (b.dataset.tokenHudActionMove) { await tokenActionHudMoveAction(b.dataset.tokenHudActionMove); return; }
  if (b.dataset.tokenHudItem) { const [kind,id,ri] = String(b.dataset.tokenHudItem).split("|"); if (kind === "player" && tokenActionHudCanControl(kind,id)) { const item=sourceSheet(id)?.inventory?.[Number(ri)]; sendInventory(id,Number(ri)); showToast("ITEM USED", `${item?.name || "ITEM"} · sent to room`, "message", false); } return; }
  if (b.dataset.tokenHudQuickRoll) { const actor=tokenActionHudActor(); if (!actor) return; const [a1,a2]=String(b.dataset.tokenHudQuickRoll).split("|"); tokenActionHudRoll(actor,a1||"DEX",a2||"INS",0,`${a1||"DEX"} + ${a2||"INS"}`); return; }
  if (b.hasAttribute("data-token-hud-manual-roll")) { const actor=tokenActionHudActor(); if (!actor) return; const root=b.closest(".token-action-hud"); const a1=root?.querySelector("[data-token-hud-roll-a]")?.value||"DEX", a2=root?.querySelector("[data-token-hud-roll-b]")?.value||"INS", mod=Number(root?.querySelector("[data-token-hud-roll-mod]")?.value)||0, label=root?.querySelector("[data-token-hud-roll-label]")?.value||"Custom Check"; tokenActionHudRoll(actor,a1,a2,mod,label); return; }
  if (b.hasAttribute("data-scene-status-close")) { clearTimeout(runtime.sceneStatusRenderTimer); runtime.sceneStatusRenderTimer = null; runtime.sceneStatusInteractionUntil = 0; runtime.sceneStatusPanel = null; render(); return; }
  if (b.dataset.sceneStatusPlayer) { clearTimeout(runtime.sceneStatusRenderTimer); runtime.sceneStatusRenderTimer = null; runtime.sceneStatusInteractionUntil = 0; runtime.sceneStatusPanel = { kind: "player", id: String(b.dataset.sceneStatusPlayer) }; render(); return; }
  if (b.dataset.sceneStatusMonster) { clearTimeout(runtime.sceneStatusRenderTimer); runtime.sceneStatusRenderTimer = null; runtime.sceneStatusInteractionUntil = 0; runtime.sceneStatusPanel = { kind: "monster", id: String(b.dataset.sceneStatusMonster) }; render(); return; }
  if (b.hasAttribute("data-gm-group-supporter")) {
    if (runtime.currentPlayer.role !== "GM" || runtime.gmGroupCheck?.active) return;
    const id=String(b.dataset.gmGroupSupporter||""), d=sanitizeGMGroupCheckDraft(); if(!id||sameId(id,d.leaderId))return;
    const i=d.supporters.findIndex(x=>sameId(x,id)); if(i>=0)d.supporters.splice(i,1);else d.supporters.push(id); saveGMGroupCheckState();render();return;
  }
  if (b.dataset.gmToolTab) {
    if (runtime.currentPlayer.role === "GM") {
      runtime.gmToolTab = b.dataset.gmToolTab;
      if (runtime.gmToolTab === "frame") await syncDMTokenFrameToolState();
      if (runtime.gmToolTab !== "shop" && runtime.overlay?.kind === "gm-shop-detail") { runtime.overlay = null; renderOverlay(); }
      render();
    }
    return;
  }
  if (b.dataset.gmShopPanel) {
    if (runtime.currentPlayer.role === "GM") {
      runtime.gmShop.panel = b.dataset.gmShopPanel;
      if (runtime.overlay?.kind === "gm-shop-detail") { runtime.overlay = null; renderOverlay(); }
      saveGMShopState(); render();
    }
    return;
  }
  if (b.dataset.gmShopMode) { if (runtime.currentPlayer.role === "GM") { runtime.gmShop.mode = b.dataset.gmShopMode; saveGMShopState(); render(); } return; }
  if (b.dataset.gmShopSection) {
    if (runtime.currentPlayer.role === "GM") {
      const cat = String(b.dataset.gmShopSection || "ACCESSORY");
      if (["ACCESSORY","WEAPON","LIGHT ARMOR","HEAVY ARMOR","SHIELD"].includes(cat)) {
        runtime.gmShop.category = cat; runtime.gmShop.stockCategory = cat; runtime.gmShop.stockPage = 1; runtime.gmShop.generated = [];
        saveGMShopState(); render();
      }
    }
    return;
  }

  if (b.dataset.gmShopStockPage) { runtime.gmShop.stockPage = Math.max(1, Number(b.dataset.gmShopStockPage) || 1); saveGMShopState(); render(); return; }
  if (b.dataset.gmShopDetail) { if (runtime.currentPlayer.role === "GM") await openGMShopDetail(b.dataset.gmShopDetail); return; }
  if (b.dataset.gmShopAdd) { const closeDetail = b.hasAttribute("data-close-shop-detail"); await addGMShopActive(b.dataset.gmShopAdd); if (closeDetail) { runtime.overlay = null; renderOverlay(); } return; }
  if (b.dataset.gmShopRemove) { const closeDetail = b.hasAttribute("data-close-shop-detail"); await removeGMShopActive(b.dataset.gmShopRemove); if (closeDetail) { runtime.overlay = null; renderOverlay(); } return; }
  if (b.hasAttribute("data-gm-shop-history-clear")) { clearGMShopHistory(); return; }
  if (b.dataset.gmShopHistoryDelete) { deleteGMShopHistory(b.dataset.gmShopHistoryDelete); return; }
  if (b.dataset.gmShopHistory) { const row = runtime.gmShop.history.find(h => h.id === b.dataset.gmShopHistory); if (row) { runtime.gmShop.generated = [...row.items]; runtime.gmShop.mode = row.mode; runtime.gmShop.category = row.category || "all"; runtime.gmShop.panel = "generator"; saveGMShopState(); render(); } return; }

  if (b.dataset.sceneRosterFilter) { runtime.sceneRosterFilter = ["all","friendly","enemy","crisis"].includes(b.dataset.sceneRosterFilter) ? b.dataset.sceneRosterFilter : "all"; render(); return; }
  if (b.dataset.sceneFocusCard) { const target = document.querySelector(`[data-dom-key="${CSS.escape(b.dataset.sceneFocusCard)}"]`); if (target) { try { target.scrollIntoView({ behavior: "smooth", block: "center" }); } catch { target.scrollIntoView(); } } return; }

  if (b.dataset.gmBroadcastType) {
    if (runtime.currentPlayer.role !== "GM") return;
    const oldType = normalizeGMBroadcastType(runtime.gmBroadcastDraft.type), nextType = normalizeGMBroadcastType(b.dataset.gmBroadcastType);
    const oldDefault = gmBroadcastDefaultTitle(oldType);
    if (!String(runtime.gmBroadcastDraft.title || "").trim() || runtime.gmBroadcastDraft.title === oldDefault) runtime.gmBroadcastDraft.title = gmBroadcastDefaultTitle(nextType);
    runtime.gmBroadcastDraft.type = nextType; render(); return;
  }
  if (b.hasAttribute("data-gm-broadcast-all")) {
    if (runtime.currentPlayer.role !== "GM") return;
    runtime.gmBroadcastDraft.allPlayers = !runtime.gmBroadcastDraft.allPlayers;
    if (runtime.gmBroadcastDraft.allPlayers) runtime.gmBroadcastDraft.targets = [];
    render(); return;
  }
  if (b.dataset.gmBroadcastPlayer) {
    if (runtime.currentPlayer.role !== "GM" || runtime.gmBroadcastDraft.allPlayers) return;
    const id = String(b.dataset.gmBroadcastPlayer), targets = sanitizeGMBroadcastTargets(), i = targets.indexOf(id);
    if (i >= 0) targets.splice(i,1); else targets.push(id);
    runtime.gmBroadcastDraft.targets = targets; render(); return;
  }
  if (b.hasAttribute("data-cost-pay-confirm")) { await confirmResourceCostPayment(); return; }
  if (b.dataset.codexFolderToggle) { toggleCodexFolder(b.dataset.codexFolderToggle); return; }
  if (b.dataset.codexFolderRename) { renameCodexFolder(b.dataset.codexFolderRename); return; }
  if (b.dataset.codexFolderDelete) { deleteCodexFolder(b.dataset.codexFolderDelete); return; }
  if (b.dataset.monsterFolderToggle) { toggleMonsterFolder(b.dataset.monsterFolderToggle); return; }
  if (b.dataset.monsterFolderRename) { renameMonsterFolder(b.dataset.monsterFolderRename); return; }
  if (b.dataset.monsterFolderDelete) { deleteMonsterFolder(b.dataset.monsterFolderDelete); return; }
  if (b.dataset.damageTargetAdd) {
    const roll = runtime.overlay; if (!roll) return;
    const draft = ensureDamageApplyDraft(roll), rec = draft[b.dataset.damageTargetAdd]; if (rec) rec.hits = Math.min(99, (Number(rec.hits) || 0) + 1); renderOverlay(); return;
  }
  if (b.dataset.damageTargetSub) {
    const roll = runtime.overlay; if (!roll) return;
    const draft = ensureDamageApplyDraft(roll), rec = draft[b.dataset.damageTargetSub]; if (rec) rec.hits = Math.max(0, (Number(rec.hits) || 0) - 1); renderOverlay(); return;
  }
  if (b.dataset.damageMode) {
    const [id, mode] = b.dataset.damageMode.split(":"), roll = runtime.overlay; if (!roll) return;
    const draft = ensureDamageApplyDraft(roll), rec = draft[id]; if (rec && ["vuln","normal","resist"].includes(mode)) rec.mode = mode; renderOverlay(); return;
  }
  if (b.dataset.damageModStep !== undefined) {
    const roll = runtime.overlay; if (!roll) return;
    const draft = ensureDamageApplyDraft(roll), step = Number(b.dataset.damageModStep) || 0;
    draft._mod = clamp((Number(draft._mod) || 0) + step, -999, 999); renderOverlay(); return;
  }
  if (b.dataset.applyDamageTarget) { await applyPlayerRollDamage(b.dataset.applyDamageTarget, false); return; }
  if (b.hasAttribute("data-apply-damage-all")) { await applyPlayerRollDamage("", true); return; }
  if (b.dataset.monsterDamageTargetAdd) { const draft=ensureMonsterDamageApplyDraft(runtime.overlay),rec=draft.targets[b.dataset.monsterDamageTargetAdd];if(rec)rec.hits=clamp((Number(rec.hits)||0)+1,0,99);renderOverlay();return; }
  if (b.dataset.monsterDamageTargetSub) { const draft=ensureMonsterDamageApplyDraft(runtime.overlay),rec=draft.targets[b.dataset.monsterDamageTargetSub];if(rec)rec.hits=clamp((Number(rec.hits)||0)-1,0,99);renderOverlay();return; }
  if (b.dataset.monsterDamageMode) { const cut=String(b.dataset.monsterDamageMode).lastIndexOf("|"),ref=String(b.dataset.monsterDamageMode).slice(0,cut),mode=String(b.dataset.monsterDamageMode).slice(cut+1),rec=ensureMonsterDamageApplyDraft(runtime.overlay).targets[ref];if(rec&&["vuln","normal","resist"].includes(mode))rec.mode=mode;renderOverlay();return; }
  if (b.dataset.monsterDamageResource) { const cut=String(b.dataset.monsterDamageResource).lastIndexOf("|"),ref=String(b.dataset.monsterDamageResource).slice(0,cut),resource=String(b.dataset.monsterDamageResource).slice(cut+1),rec=ensureMonsterDamageApplyDraft(runtime.overlay).targets[ref];if(rec&&["hp","mp"].includes(resource))rec.resource=resource;renderOverlay();return; }
  if (b.dataset.monsterDamageModStep!==undefined) { const draft=ensureMonsterDamageApplyDraft(runtime.overlay);draft.mod=clamp((Number(draft.mod)||0)+(Number(b.dataset.monsterDamageModStep)||0),-999,999);renderOverlay();return; }
  if (b.dataset.monsterDamageApply) { await applyMonsterRollDamage(b.dataset.monsterDamageApply,false);return; }
  if (b.hasAttribute("data-monster-damage-apply-all")) { await applyMonsterRollDamage("",true);return; }
  if (b.dataset.playerDefeatChoice) {
    const outcome = String(b.dataset.playerDefeatChoice || "").toLowerCase();
    if (!["surrender","sacrifice"].includes(outcome) || !isPlayerDefeated(state)) return;
    await sendRemoteEdit(runtime.currentPlayer.id, { kind: "set-defeat-outcome", outcome });
    runtime.overlay = null; renderOverlay();
    announceCombatOutcome(outcome, state.name || "CHARACTER", "player");
    render(); return;
  }
  if (b.dataset.uiSize) { await applyUISize(b.dataset.uiSize, true); render(); return; }
  if (b.dataset.uiTheme) { runtime.uiTheme = b.dataset.uiTheme === "phantom" ? "phantom" : "default"; saveUITheme(runtime.uiTheme); render(); showToast("UI THEME", `${runtime.uiTheme.toUpperCase()} theme enabled`, "message"); return; }
  if (b.dataset.sceneView) { runtime.sceneWideMode = b.dataset.sceneView === "wide"; saveUIPrefs({ sceneWideMode: runtime.sceneWideMode }); render(); showToast("SCENE VIEW", runtime.sceneWideMode ? "Wide Scene is the default" : "Sidebar Scene is the default", "message"); return; }
  if (b.hasAttribute("data-companion-hud-toggle")) {
    const prefs = loadCompanionHudPrefs(); prefs.enabled = !prefs.enabled; saveCompanionHudPrefs(prefs);
    sendCompanionHudControl({ type: "toggle", enabled: prefs.enabled });
    render(); showToast("COMPANION POPOVERS", prefs.enabled ? "Shortcut popovers enabled" : "Shortcut popovers hidden", "message"); return;
  }
  if (b.hasAttribute("data-companion-hud-reset")) {
    const prefs = loadCompanionHudPrefs(); prefs.positions = {}; saveCompanionHudPrefs(prefs);
    sendCompanionHudControl({ type: "reset" });
    showToast("COMPANION POPOVERS", "Shortcut positions restored", "message"); render(); return;
  }
  if (b.hasAttribute("data-player-token-quick-menu-toggle")) {
    const enabled = !loadPlayerTokenQuickMenuEnabled();
    savePlayerTokenQuickMenuEnabled(enabled);
    sendCompanionHudControl({ type: "player-token-quick-menu", enabled, time: Date.now() });
    render();
    showToast("PLAYER TOKEN QUICK MENU", enabled ? "Player-token click menu enabled" : "Player-token click menu disabled · Monster clicks stay active", "message");
    return;
  }
  if (b.dataset.inspectPlayer) { runtime.sceneStatusPanel = null; runtime.inspect = { kind: "player", id: b.dataset.inspectPlayer }; runtime.partyEditTab = "sheet"; render(); return; }
  if (b.dataset.inspectMonster) { runtime.sceneStatusPanel = null; runtime.inspect = { kind: "monster", id: b.dataset.inspectMonster }; runtime.monsterTab = "sheet"; render(); return; }
  if (b.dataset.playerShopDetail) { openPlayerShopDetail(b.dataset.playerShopDetail); return; }
  if (b.dataset.shopBuy) { await requestShopPurchase(b.dataset.shopBuy); return; }
  if (b.tagName !== "BUTTON" && !b.dataset.action && !b.dataset.remoteClockGeneral && !b.dataset.remoteClock && !b.dataset.sceneClockProgress && !b.dataset.remoteZeroProgress) return;
  if (b.dataset.nav) {
    const nextView = String(b.dataset.nav || "scene");
    runtime.view = nextView; runtime.inspect = null; runtime.sceneStatusPanel = null; runtime.monsterEditId = null;
    // v2.68: the main CHAT navigation must always open ROOM CHAT, not the last AI subtab.
    if (nextView === "chat") { runtime.chatPanel = "chat"; runtime.lastShellHTML = ""; }
    // Never leave the Fabula AI page-reader overlay as a click shield after main navigation.
    if (["fabula-ai-page","player-shop-detail"].includes(runtime.overlay?.kind)) runtime.overlay = null;
    render(); return;
  }
  if (b.dataset.partyTab) { runtime.partyEditTab = b.dataset.partyTab; render(); return; }
  if (b.dataset.monsterTab) { runtime.monsterTab = b.dataset.monsterTab; render(); return; }
  if (b.dataset.chatPanel) { switchChatPanel(b.dataset.chatPanel); return; }
  if (b.dataset.deleteCharacter) { await deleteCharacter(b.dataset.deleteCharacter); return; }
  if (b.dataset.remoteDie) { const [owner, k] = b.dataset.remoteDie.split(":"), s = sourceSheet(owner), sceneStatusFast = !!b.closest(".scene-v263-status-panel"); if (s) { const cur = Number(s.attributes[k]) || 8, next = DIE_STEPS[(DIE_STEPS.indexOf(cur) + 1) % DIE_STEPS.length]; await sendRemoteEdit(owner, { kind: "set", path: `attributes.${k}`, value: next }, { sceneStatusFast }); } return; }
  if (b.dataset.remoteStatus) { const [owner, k] = b.dataset.remoteStatus.split(":"), sceneStatusFast = !!b.closest(".scene-v263-status-panel"); await sendRemoteEdit(owner, { kind: "toggle-status", key: k }, { sceneStatusFast }); playSound("status"); return; }
  if (b.dataset.hinderStatus) { const [monsterId, status] = b.dataset.hinderStatus.split(":"); await setMonsterStatusFromHinder(monsterId, status); return; }
  if (b.dataset.studyRoll) { const [owner, monsterId] = b.dataset.studyRoll.split(":"); performStudyRoll(owner, monsterId); return; }
  if (b.dataset.studyApply) { const [monsterId, tier, source] = b.dataset.studyApply.split(":"); applyMonsterStudyTier(monsterId, Number(tier), source || ""); return; }
  if (b.dataset.quickMonsterStatus) { const [monsterId, status] = b.dataset.quickMonsterStatus.split(":"); await setMonsterStatusFromHinder(monsterId, status, "quick"); return; }
  if (b.dataset.quickMonsterStudy) { const [monsterId, tier] = b.dataset.quickMonsterStudy.split(":"); applyMonsterStudyTier(monsterId, Number(tier), "quick"); return; }
  if (b.dataset.quickMonsterTarget) { runtime.hinderTargetId = String(b.dataset.quickMonsterTarget || ""); const raw = studyHinderMonsterTarget({ id: runtime.hinderTargetId }), v = raw ? monsterPhaseView(raw, "active") : null; showToast("TARGET", `${v?.name || "MONSTER"} selected for Study & Hinder`, "message", false); render(); return; }
  if (b.dataset.quickMonsterHud) { const id = b.dataset.quickMonsterHud; updateMonster("active", id, m => { m.showHud = m.showHud === false; }); render(); return; }
  if (b.dataset.quickMonsterKill) { const id = b.dataset.quickMonsterKill, m = monsterById(id); if (m) { updateMonster("active", id, x => { x.hp.current = 0; }); render(); } return; }
  if (b.dataset.nextMonsterPhase) { const id = b.dataset.nextMonsterPhase, m = monsterById(id); if (m) { const next = monsterPhaseIndex(m, "active") + 1; if (next <= m.phases.length) switchMonsterPhase("active", id, next); } return; }
  if (b.dataset.restoreMonster) { const id = b.dataset.restoreMonster, m = monsterById(id); if (m && isMonsterDefeated(m)) { const restore = clamp(Number(m.defeatedRestoreHp) || Number(m.hp?.max) || 1, 1, Number(m.hp?.max) || 1); updateMonster("active", id, x => { x.hp.current = restore; }); playSound("hpup"); render(); } return; }
  if (b.dataset.restorePlayer) {
    if (runtime.currentPlayer.role !== "GM") return;
    const id = b.dataset.restorePlayer, s = sourceSheet(id);
    if (s && isPlayerDefeated(s)) {
      const restore = clamp(Number(s.defeatedRestoreHp) || Number(s.hp?.max) || 1, 1, Number(s.hp?.max) || 1);
      await sendRemoteEdit(id, { kind: "set", path: "hp.current", value: restore });
      playSound("hpup"); showToast("RESTORED", `${s.name || sourceParty(id)?.name || "CHARACTER"} · HP ${restore}`, "message", false); render();
    }
    return;
  }
  if (b.dataset.remoteBuff) { const [owner, k, d] = b.dataset.remoteBuff.split(":"), sceneStatusFast = !!b.closest(".scene-v263-status-panel"); await sendRemoteEdit(owner, { kind: "buff", key: k, delta: Number(d) }, { sceneStatusFast }); playSound("status"); return; }
  if (b.dataset.remoteResource) { const [owner, key, d] = b.dataset.remoteResource.split(":"); await adjustPlayer(owner, key, Number(d)); return; }
  if (b.dataset.quickResource) { const [kind, id, key, d] = b.dataset.quickResource.split(":"); if (kind === "player") await adjustPlayer(id, key, Number(d)); else await adjustMonster(id, key, Number(d)); return; }
  if (b.dataset.tokenPlacementConfirm !== undefined) { await finalizeTokenPlacement(); return; }
  if (b.dataset.tokenPlacementCancel !== undefined) { await cancelTokenPlacement(); return; }
  if (b.dataset.partyPortrait) { await choosePortraitFor(b.dataset.partyPortrait); return; }
  if (b.dataset.partyPortraitFromToken) { await portraitArtFromSelectedTokenForPlayer(b.dataset.partyPortraitFromToken); return; }
  if (b.dataset.partyTokenArt) { await tokenArtForPlayer(b.dataset.partyTokenArt); return; }
  if (b.dataset.partyTokenFromSelected) { await tokenArtFromSelectedForPlayer(b.dataset.partyTokenFromSelected); return; }
  if (b.dataset.partySpawnToken) { await spawnPlayerTokenAndLink(b.dataset.partySpawnToken); return; }
  if (b.dataset.partyLinkToken) { await linkTokenForPlayer(b.dataset.partyLinkToken); return; }
  if (b.dataset.partyUnlinkToken) { await unlinkTokenForPlayer(b.dataset.partyUnlinkToken); return; }
  if (b.dataset.cardTokenLink) { const [owner, kind, index] = b.dataset.cardTokenLink.split("|"); await linkCardToSelectedToken(owner, kind, Number(index)); return; }
  if (b.dataset.cardTokenUnlink) { const [owner, kind, index] = b.dataset.cardTokenUnlink.split("|"); await unlinkCardToken(owner, kind, Number(index)); return; }
  if (b.dataset.linkCanvasText) { const [owner, key] = b.dataset.linkCanvasText.split(":"); await linkCanvasTextForPlayer(owner, key); render(); return; }
  if (b.dataset.unlinkCanvasText) { const [owner, key] = b.dataset.unlinkCanvasText.split(":"); await unlinkCanvasTextForPlayer(owner, key); render(); return; }
  if (b.dataset.toggleInlineEdit) {
    const key = b.dataset.toggleInlineEdit;
    runtime.inlineEdit ||= {};
    const isOpen = !!runtime.inlineEdit[key];
    if (isOpen) {
      const card = document.querySelector(`[data-inline-edit-id="${CSS.escape(key)}"]`);
      if (card) flushPendingDetailEdits(card);
      delete runtime.inlineEdit[key];
    } else {
      runtime.inlineEdit[key] = true;
    }
    render();
    return;
  }
  if (b.dataset.sendSectionOwner) { const [owner, which] = b.dataset.sendSectionOwner.split(":"), s = sourceSheet(owner); if (s) sectionShare(which, s); return; }
  if (b.dataset.sendClass) { const [o, i] = b.dataset.sendClass.split(":"); sendClass(o, Number(i)); return; }
  if (b.dataset.sendClassSkill) { const [o, ci, si] = b.dataset.sendClassSkill.split(":"), sheet = sourceSheet(o), c = sheet?.classes?.[Number(ci)], sk = c?.classSkills?.[Number(si)]; if (sheet && sk) openResourceCostPrompt({ actorKind: "player", actorId: o, title: `${c?.name || "CLASS"} · ${sk.name || "CLASS SKILL"}`, verb: "SEND", listedCost: sk.cost || "", intent: { kind: "send-class-skill", owner: o, classIndex: Number(ci), skillIndex: Number(si) } }); return; }
  if (b.dataset.sendQuirk) { const [o, i] = b.dataset.sendQuirk.split(":"); sendQuirk(o, Number(i)); return; }
  if (b.dataset.sendEquipment) { const [o, i] = b.dataset.sendEquipment.split(":"); sendEquipment(o, Number(i)); return; }
  if (b.dataset.sendSphere) { const [o, i] = b.dataset.sendSphere.split(":"); sendSphere(o, Number(i)); return; }
  if (b.dataset.sendInventory) { const [o, i] = b.dataset.sendInventory.split(":"); sendInventory(o, Number(i)); return; }
  if (b.dataset.sendList) { const [o, t, i] = b.dataset.sendList.split(":"), idx = Number(i); if (t === "arcana") { const sheet = sourceSheet(o), x = sheet?.lists?.arcana?.[idx]; if (sheet && x) openResourceCostPrompt({ actorKind: "player", actorId: o, title: `ARCANA · ${x.name || "ENTRY"}`, verb: "SEND", listedCost: x.cost || "", intent: { kind: "send-arcana", owner: o, index: idx } }); } else sendList(o, t, idx); return; }
  if (b.dataset.sendClock) { const [o, i] = b.dataset.sendClock.split(":"); sendClock(o, Number(i)); return; }
  if (b.dataset.sendProject) { const [o, i] = b.dataset.sendProject.split(":"); sendProject(o, Number(i)); return; }
  if (b.dataset.sendAction) { const [o, i] = b.dataset.sendAction.split(":"), idx = Number(i), sheet = sourceSheet(o), a = sheet?.actions?.[idx]; if (sheet && a) openResourceCostPrompt({ actorKind: "player", actorId: o, title: `ACTION · ${a.name || "ACTION"}`, verb: "SEND", listedCost: a.cost || "", intent: { kind: "send-action", owner: o, index: idx } }); return; }
  if (b.dataset.rollShared) { const [o, i] = b.dataset.rollShared.split(":"), idx = Number(i), sheet = sourceSheet(o), a = sheet?.actions?.[idx]; if (sheet && a) openResourceCostPrompt({ actorKind: "player", actorId: o, title: `ACTION · ${a.name || "ACTION"}`, verb: "ROLL", listedCost: a.cost || "", intent: { kind: "roll-player-action", owner: o, index: idx } }); return; }
  if (b.dataset.remoteAddClass) { await sendRemoteEdit(b.dataset.remoteAddClass, { kind: "add-class" }); return; }
  if (b.dataset.remoteRemoveClass) { const [o, i] = b.dataset.remoteRemoveClass.split(":"); await sendRemoteEdit(o, { kind: "remove-class", index: Number(i) }); return; }
  if (b.dataset.remoteAddClassSkill) { const [o, ci] = b.dataset.remoteAddClassSkill.split(":"); await sendRemoteEdit(o, { kind: "add-class-skill", classIndex: Number(ci) }); return; }
  if (b.dataset.remoteRemoveClassSkill) { const [o, ci, si] = b.dataset.remoteRemoveClassSkill.split(":"); await sendRemoteEdit(o, { kind: "remove-class-skill", classIndex: Number(ci), index: Number(si) }); return; }
  if (b.dataset.remoteAddQuirk) { await sendRemoteEdit(b.dataset.remoteAddQuirk, { kind: "add-quirk" }); return; }
  if (b.dataset.remoteRemoveQuirk) { const [o, i] = b.dataset.remoteRemoveQuirk.split(":"); await sendRemoteEdit(o, { kind: "remove-quirk", index: Number(i) }); return; }
  if (b.dataset.remoteAddEquipment) { await sendRemoteEdit(b.dataset.remoteAddEquipment, { kind: "add-equipment" }); return; }
  if (b.dataset.remoteRemoveEquipment) { const [o, i] = b.dataset.remoteRemoveEquipment.split(":"); await sendRemoteEdit(o, { kind: "remove-equipment", index: Number(i) }); return; }
  if (b.dataset.remoteAddSphere) { await sendRemoteEdit(b.dataset.remoteAddSphere, { kind: "add-sphere" }); return; }
  if (b.dataset.remoteAddInventory) { await sendRemoteEdit(b.dataset.remoteAddInventory, { kind: "add-inventory" }); return; }
  if (b.dataset.remoteRemoveSphere) { const [o, i] = b.dataset.remoteRemoveSphere.split(":"); await sendRemoteEdit(o, { kind: "remove-sphere", index: Number(i) }); return; }
  if (b.dataset.remoteRemoveInventory) { const [o, i] = b.dataset.remoteRemoveInventory.split(":"); await sendRemoteEdit(o, { kind: "remove-inventory", index: Number(i) }); return; }
  if (b.dataset.remoteAddList) { const [o, t] = b.dataset.remoteAddList.split(":"); await sendRemoteEdit(o, { kind: "add-list", type: t }); return; }
  if (b.dataset.remoteRemoveList) { const [o, t, i] = b.dataset.remoteRemoveList.split(":"); await sendRemoteEdit(o, { kind: "remove-list", type: t, index: Number(i) }); return; }
  if (b.dataset.remoteAddClock) { await sendRemoteEdit(b.dataset.remoteAddClock, { kind: "add-clock" }); return; }
  if (b.dataset.remoteRemoveClock) { const [o, i] = b.dataset.remoteRemoveClock.split(":"); await sendRemoteEdit(o, { kind: "remove-clock", index: Number(i) }); return; }
  if (b.dataset.remoteClockGeneral) { const [o, i, p] = b.dataset.remoteClockGeneral.split(":"), item = sourceSheet(o)?.clocks?.[Number(i)], before = Number(item?.progress) || 0, clicked = Number(p), seg = Number(item?.segments) || 0, next = clamp(clicked === before ? before - 1 : clicked, 0, seg); paintClockImmediately(b, next, seg); const save = sendRemoteEdit(o, { kind: "clock-general", index: Number(i), progress: next }); if (before !== next) announceTrackerTick("clock", item?.name, next, seg, { type: "player", ownerId: o, op: { kind: "clock-general", index: Number(i), progress: before } }); await save; return; }
  if (b.dataset.remoteAddProject) { await sendRemoteEdit(b.dataset.remoteAddProject, { kind: "add-project" }); return; }
  if (b.dataset.remoteRemoveProject) { const [o, i] = b.dataset.remoteRemoveProject.split(":"); await sendRemoteEdit(o, { kind: "remove-project", index: Number(i) }); return; }
  if (b.dataset.remoteClock) { const [o, i, p] = b.dataset.remoteClock.split(":"), item = sourceSheet(o)?.projects?.[Number(i)], before = Number(item?.progress) || 0, clicked = Number(p), seg = Number(item?.segments) || 0, next = clamp(clicked === before ? before - 1 : clicked, 0, seg); paintClockImmediately(b, next, seg); const save = sendRemoteEdit(o, { kind: "clock", index: Number(i), progress: next }); if (before !== next) announceTrackerTick("project", item?.name, next, seg, { type: "player", ownerId: o, op: { kind: "clock", index: Number(i), progress: before } }); await save; return; }
  if (b.dataset.remoteZeroProgress) { const [owner, raw] = String(b.dataset.remoteZeroProgress).split(":"), z = sourceSheet(owner)?.zeroPower || {}, before = clamp(z.current, 0, 6), clicked = clamp(Number(raw), 0, 6), next = clicked === before ? Math.max(0, before - 1) : clicked; if (before === next) return; paintClockImmediately(b, next, 6); await sendRemoteEdit(owner, { kind: "set", path: "zeroPower.current", value: next }); return; }
  if (b.dataset.remoteZeroStep) { const [owner, raw] = String(b.dataset.remoteZeroStep).split(":"), before = clamp(sourceSheet(owner)?.zeroPower?.current, 0, 6), next = clamp(before + Number(raw), 0, 6); if (before !== next) await sendRemoteEdit(owner, { kind: "set", path: "zeroPower.current", value: next }); return; }
  if (b.dataset.remoteZeroReset) { const owner = String(b.dataset.remoteZeroReset); if (clamp(sourceSheet(owner)?.zeroPower?.current, 0, 6) !== 0) await sendRemoteEdit(owner, { kind: "set", path: "zeroPower.current", value: 0 }); return; }
  if (b.dataset.zeroActivateOwner) { await activateZeroPower(String(b.dataset.zeroActivateOwner)); return; }
  if (b.dataset.remoteAddAction) { await sendRemoteEdit(b.dataset.remoteAddAction, { kind: "add-action" }); return; }
  if (b.dataset.remoteRemoveAction) { const [o, i] = b.dataset.remoteRemoveAction.split(":"); await sendRemoteEdit(o, { kind: "remove-action", index: Number(i) }); return; }
  if (b.dataset.sceneAddTracker) {
    const kind = b.dataset.sceneAddTracker;
    if (kind === "clocks") runtime.sceneTrackers.clocks.push({ ...blankClock(), pinned: false, objective: false });
    else if (kind === "projects") runtime.sceneTrackers.projects.push({ id: uid(), name: "New Project", detail: "", segments: 6, progress: 0, pinned: false, objective: false });
    scheduleTrackerSave(); render(); return;
  }
  if (b.dataset.sceneTrackerHologram) {
    const [kind, i] = b.dataset.sceneTrackerHologram.split(":"), item = runtime.sceneTrackers?.[kind]?.[Number(i)];
    if (item && runtime.currentPlayer.role === "GM") { item.pinned = !item.pinned; scheduleTrackerSave(); render(); }
    return;
  }
  if (b.dataset.sceneTrackerObjective) {
    const [kind, i] = b.dataset.sceneTrackerObjective.split(":"), item = runtime.sceneTrackers?.[kind]?.[Number(i)];
    if (item && kind === "clocks" && runtime.currentPlayer.role === "GM") { item.objective = !item.objective; scheduleTrackerSave(); render(); }
    return;
  }
  if (b.dataset.sceneRemoveTracker) {
    const [kind, i] = b.dataset.sceneRemoveTracker.split(":"); runtime.sceneTrackers?.[kind]?.splice(Number(i), 1); scheduleTrackerSave(); render(); return;
  }
  if (b.dataset.sceneClockProgress) {
    const [kind, i, prog] = b.dataset.sceneClockProgress.split(":"), item = runtime.sceneTrackers?.[kind]?.[Number(i)];
    if (item) {
      const before = Number(item.progress) || 0, seg = Number(item.segments) || 0, clicked = Number(prog), next = clamp(clicked === before ? before - 1 : clicked, 0, seg);
      if (before === next) return;
      item.progress = next;
      paintClockImmediately(b, next, seg);
      scheduleTrackerSave();
      announceTrackerTick(kind === "projects" ? "project" : "clock", item.name, next, seg, { type: "scene-tracker", kind, id: item.id, progress: before });
      runtime.sceneSig = sceneRenderSignature();
    }
    return;
  }
  if (b.dataset.sendSceneTracker) {
    const [kind, i] = b.dataset.sendSceneTracker.split(":"), item = runtime.sceneTrackers?.[kind]?.[Number(i)];
    if (item) makeShare(`${kind === "projects" ? "PROJECT" : "CLOCK"} · ${item.name}`, `${item.progress}/${item.segments}${item.detail ? `\n${item.detail}` : ""}`);
    return;
  }
  if (b.dataset.suggestedRoll !== undefined) { performSuggestedRoll(Number(b.dataset.suggestedRoll)); return; }
  if (b.dataset.playerNoTurn) { await togglePlayerTurnParticipation(b.dataset.playerNoTurn); return; }
  if (b.dataset.allyNoTurn) { toggleAllyTurnParticipation(b.dataset.allyNoTurn); return; }
  if (b.dataset.rollInitiative) { const [kind, id] = b.dataset.rollInitiative.split(":"); await rollInitiative(kind, id); return; }

  if (b.dataset.codexPhaseKey !== undefined) {
    runtime.codexPhase ||= {};
    runtime.codexPhase[b.dataset.codexPhaseKey] = Number(b.dataset.codexPhaseIndex) || 0;
    render(); return;
  }

  if (b.dataset.monsterPhaseTab) { const [mode, id, index] = b.dataset.monsterPhaseTab.split(":"); switchMonsterPhase(mode, id, Number(index)); return; }
  if (b.dataset.monsterAddPhase) { const [mode, id] = b.dataset.monsterAddPhase.split(":"); addMonsterPhase(mode, id); return; }
  if (b.dataset.monsterRemovePhase) { const [mode, id, index] = b.dataset.monsterRemovePhase.split(":"); removeMonsterPhase(mode, id, Number(index)); return; }
  if (b.dataset.quickMonsterPhase) { const [id, index] = b.dataset.quickMonsterPhase.split(":"); switchMonsterPhase("active", id, Number(index)); return; }

  if (b.dataset.monsterEdit) { runtime.monsterEditId = b.dataset.monsterEdit; runtime.monsterTab = "sheet"; runtime.monsterPhase = 0; render(); return; }
  if (b.dataset.monsterSpawnEnemy) { await addMonsterToSceneWithToken(b.dataset.monsterSpawnEnemy, "enemy"); return; }
  if (b.dataset.monsterSpawnAlly) { await addMonsterToSceneWithToken(b.dataset.monsterSpawnAlly, "ally"); return; }
  if (b.dataset.monsterSpawn) { await addMonsterToSceneWithToken(b.dataset.monsterSpawn, "enemy"); return; }
  if (b.dataset.monsterDuplicateTemplate) { duplicateMonsterTemplate(b.dataset.monsterDuplicateTemplate); return; }
  if (b.dataset.monsterDeleteTemplate) { deleteMonsterTemplate(b.dataset.monsterDeleteTemplate); return; }
  if (b.dataset.monsterStudyTier) { const [id, tier] = b.dataset.monsterStudyTier.split(":"); applyMonsterStudyTier(id, Number(tier), "sheet"); return; }
  if (b.dataset.monsterRemoveScene) { removeSceneMonster(b.dataset.monsterRemoveScene); return; }
  if (b.dataset.monsterLibPortrait) { await chooseMonsterPortrait("lib", b.dataset.monsterLibPortrait); return; }
  if (b.dataset.monsterLibPortraitFromToken) { await monsterPortraitFromSelectedToken("lib", b.dataset.monsterLibPortraitFromToken); return; }
  if (b.dataset.monsterLibTokenArt) { await monsterTokenArt("lib", b.dataset.monsterLibTokenArt); return; }
  if (b.dataset.monsterLibTokenFromSelected) { await monsterTokenArtFromSelected("lib", b.dataset.monsterLibTokenFromSelected); return; }
  if (b.dataset.monsterTemplateSpawnToken) { const [id, faction] = b.dataset.monsterTemplateSpawnToken.split(":"); await spawnMonsterTemplateTokenAndLink(id, faction || "enemy"); return; }
  if (b.dataset.activeMonsterPortrait) { await chooseMonsterPortrait("active", b.dataset.activeMonsterPortrait); return; }
  if (b.dataset.activeMonsterPortraitFromToken) { await monsterPortraitFromSelectedToken("active", b.dataset.activeMonsterPortraitFromToken); return; }
  if (b.dataset.activeMonsterTokenArt) { await monsterTokenArt("active", b.dataset.activeMonsterTokenArt); return; }
  if (b.dataset.activeMonsterTokenFromSelected) { await monsterTokenArtFromSelected("active", b.dataset.activeMonsterTokenFromSelected); return; }
  if (b.dataset.activeMonsterSpawnToken) { await spawnActiveMonsterTokenAndLink(b.dataset.activeMonsterSpawnToken); return; }
  if (b.dataset.activeMonsterLink) { await linkActiveMonsterToken(b.dataset.activeMonsterLink); return; }
  if (b.dataset.activeMonsterUnlink) { unlinkActiveMonsterToken(b.dataset.activeMonsterUnlink); return; }
  if (b.dataset.monsterDie) { const [mode, id, k] = b.dataset.monsterDie.split(":"), m = findMonsterTarget(mode, id); if (m) updateMonster(mode, id, x => { const target = monsterPhaseTarget(x, mode); const cur = Number(target.attributes[k]) || 8; target.attributes[k] = DIE_STEPS[(DIE_STEPS.indexOf(cur) + 1) % DIE_STEPS.length]; }); render(); return; }
  if (b.dataset.monsterStatus) {
    const [mode, id, k] = b.dataset.monsterStatus.split(":"), m = findMonsterTarget(mode, id);
    if (m) {
      m.statuses ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
      m.statusImmunities ||= Object.fromEntries(STATUS_NAMES.map(x => [x, false]));
      if (!m.statuses[k] && m.statusImmunities?.[k]) { playSound("status"); notify(`${k.toUpperCase()} IMMUNE`); return; }
      updateMonster(mode, id, x => x.statuses[k] = !x.statuses[k]);
    }
    playSound("status"); render(); return;
  }
  if (b.dataset.monsterBuff) { const [mode, id, k, d] = b.dataset.monsterBuff.split(":"); updateMonster(mode, id, m => m.attributeBuffs[k] = clamp((Number(m.attributeBuffs[k]) || 0) + Number(d), -3, 3)); render(); return; }
  if (b.dataset.monsterTargetOpen) {
    const [mode, id] = b.dataset.monsterTargetOpen.split(":"), m = findMonsterTarget(mode, id);
    if (m) { const st = monsterRandomTargetState(m, mode); st.manualOpen = !st.manualOpen; st.open = false; render(); }
    return;
  }
  if (b.dataset.monsterTargetPick) {
    const [mode, id, kind, targetId] = b.dataset.monsterTargetPick.split(":"), m = findMonsterTarget(mode, id);
    if (!m) return;
    const { st, pool } = sanitizeMonsterTargets(m, mode), target = pool.find(t => t.kind === kind && t.id === targetId);
    if (!target) { render(); return; }
    const key = `${kind}:${targetId}`, index = st.targets.findIndex(t => `${t.kind}:${t.id}` === key);
    if (index >= 0) st.targets.splice(index, 1); else st.targets.push({ kind: target.kind, id: target.id, name: target.name });
    render(); return;
  }
  if (b.dataset.monsterTargetRemove) {
    const [mode, id, kind, targetId] = b.dataset.monsterTargetRemove.split(":"), m = findMonsterTarget(mode, id);
    if (m) { const st = monsterRandomTargetState(m, mode); st.targets = st.targets.filter(t => !(t.kind === kind && t.id === targetId)); render(); }
    return;
  }
  if (b.dataset.monsterTargetAll) {
    const [mode, id] = b.dataset.monsterTargetAll.split(":"), m = findMonsterTarget(mode, id);
    if (m) {
      const { st, pool } = sanitizeMonsterTargets(m, mode);
      st.targets = pool.map(t => ({ kind: t.kind, id: t.id, name: t.name }));
      render();
    }
    return;
  }
  if (b.dataset.monsterTargetClear) {
    const [mode, id] = b.dataset.monsterTargetClear.split(":"), m = findMonsterTarget(mode, id);
    if (m) { const st = monsterRandomTargetState(m, mode); st.targets = []; render(); }
    return;
  }
  if (b.dataset.monsterRandomOpen) {
    const [mode, id] = b.dataset.monsterRandomOpen.split(":"), m = findMonsterTarget(mode, id);
    if (m) { const st = monsterRandomTargetState(m, mode); st.open = !st.open; st.manualOpen = false; render(); }
    return;
  }
  if (b.dataset.monsterRandomRoll) {
    const [mode, id] = b.dataset.monsterRandomRoll.split(":"), m = findMonsterTarget(mode, id);
    if (!m) return;
    const st = monsterRandomTargetState(m, mode), pool = onlinePlayerAndAllyTargetPool(m.id);
    if (!pool.length) { st.targets = []; showToast("RANDOM TARGET", "No online character sheets or player Allies available", "message"); render(); return; }
    const count = Math.min(pool.length, Math.max(1, Number(st.count) || 1));
    st.count = count; st.targets = shuffledTargets(pool).slice(0, count).map(t => ({ kind: t.kind, id: t.id, name: t.name })); st.open = false; st.manualOpen = false;
    showToast("RANDOM TARGET", st.targets.map(t => t.name).join(" · "), "message", false); render(); return;
  }
  if (b.dataset.monsterAddAction) { const [mode, id] = b.dataset.monsterAddAction.split(":"); updateMonster(mode, id, m => monsterPhaseTarget(m, mode).actions.push(blankMonsterAction())); render(); return; }
  if (b.dataset.monsterRemoveAction) { const [mode, id, i] = b.dataset.monsterRemoveAction.split(":"); updateMonster(mode, id, m => monsterPhaseTarget(m, mode).actions.splice(Number(i), 1)); render(); return; }
  if (b.dataset.monsterSendAction) { const [mode, id, i] = b.dataset.monsterSendAction.split(":"), idx = Number(i), raw = findMonsterTarget(mode, id), m = raw ? monsterPhaseView(raw, mode) : null, a = m?.actions?.[idx]; if (m && a) openResourceCostPrompt({ actorKind: "monster", actorId: id, mode, title: `ACTION · ${a.name || "ACTION"}`, verb: "SEND", listedCost: a.cost || "", intent: { kind: "monster-send-action", mode, id, index: idx } }); return; }
  if (b.dataset.monsterRollAction) { const [mode, id, i] = b.dataset.monsterRollAction.split(":"), idx = Number(i), raw = findMonsterTarget(mode, id), m = raw ? monsterPhaseView(raw, mode) : null, a = m?.actions?.[idx]; if (m && a) openResourceCostPrompt({ actorKind: "monster", actorId: id, mode, title: `ACTION · ${a.name || "ACTION"}`, verb: "ROLL", listedCost: a.cost || "", intent: { kind: "monster-roll-action", mode, id, index: idx } }); return; }
  if (b.dataset.monsterAddRule) { const [mode, id] = b.dataset.monsterAddRule.split(":"); updateMonster(mode, id, m => m.specialRules.push(blankRule())); render(); return; }
  if (b.dataset.monsterRemoveRule) { const [mode, id, i] = b.dataset.monsterRemoveRule.split(":"); updateMonster(mode, id, m => m.specialRules.splice(Number(i), 1)); render(); return; }
  if (b.dataset.monsterSendSection) { const [id, which] = b.dataset.monsterSendSection.split(":"), raw = monsterById(id), m = raw ? monsterPhaseView(raw, "active") : null; if (m) sectionShare(which, m, true); return; }

  if(b.dataset.hudLayoutLoad!==undefined){const preset=loadHudLayoutPresets()[Number(b.dataset.hudLayoutLoad)];if(preset){restoreHudLayout(preset);showToast("HUD LAYOUT",`Restored ${preset.name}`,"message",false)}return;}
  if(b.dataset.hudLayoutDelete!==undefined){const presets=loadHudLayoutPresets();presets.splice(Number(b.dataset.hudLayoutDelete),1);saveHudLayoutPresets(presets);render();return;}
  if (b.dataset.vaultLoad !== undefined) { const v = loadVault()[Number(b.dataset.vaultLoad)]; if (v) { state = normalizeState(v); state.deleted = false; await publish(); runtime.view = "scene"; runtime.inspect = { kind: "player", id: runtime.currentPlayer.id }; render(); } return; }
  if (b.dataset.vaultDelete !== undefined) { const v = loadVault(); v.splice(Number(b.dataset.vaultDelete), 1); saveVault(v); render(); return; }
  if (b.dataset.sendVault !== undefined) { const v = loadVault()[Number(b.dataset.sendVault)]; if (v) sectionShare("combat", v); return; }

  switch (b.dataset.action) {
    case "scene-back": runtime.inspect = null; runtime.partyEditTab = "sheet"; runtime.monsterTab = "sheet"; runtime.monsterPhase = 0; render(); break;
    case "toggle-scene-width": runtime.sceneWideMode = !runtime.sceneWideMode; saveUIPrefs({ sceneWideMode: runtime.sceneWideMode }); render(); showToast("SCENE VIEW", runtime.sceneWideMode ? "Wide Scene enabled" : "Sidebar Scene enabled", "message"); break;
    case "reset-tab-order": runtime.navOrder = [...MAIN_NAV]; runtime.sheetTabOrder = [...PLAYER_SHEET_TABS]; saveNavOrder(); saveSheetTabOrder(); render(); showToast("NAVIGATION", "Tab order restored", "message"); break;
    case "monster-back": runtime.monsterEditId = null; runtime.monsterTab = "sheet"; runtime.monsterPhase = 0; render(); break;
    case "create-my-character": await createMyCharacter(); break;
    case "refresh-scene": if (!PREVIEW) { runtime.party = await OBR.party.getPlayers(); await loadSceneMonsters(); } render(); break;
    case "refresh-codex": refreshCodexAgainstTemplateLibrary(); break;
    case "create-codex-folder": createCodexFolder(); break;
    case "create-monster-folder": createMonsterFolder(); break;
    case "start-initiative": startInitiativeCycle(); break;
    case "next-turn": nextInitiativeTurn(); break;
    case "reset-initiative": resetInitiativeCycle(); break;
    case "add-monster": { const m = defaultMonster("NEW MONSTER"); runtime.monsterLibrary.unshift(m); saveMonsterLibrary(runtime.monsterLibrary); runtime.monsterEditId = m.id; runtime.monsterTab = "sheet"; runtime.monsterPhase = 0; render(); break; }
    case "start-travel-group": await startGMTravelGroup(); break;
    case "confirm-travel-group": await confirmGMTravelGroup(); break;
    case "cancel-travel-group": await cancelGMTravelGroup(); break;
    case "travel-group-choose-a": await chooseTravelGroup("A"); break;
    case "travel-group-choose-b": await chooseTravelGroup("B"); break;
    case "travel-group-admin-choose-a": gmTravelGroupSetAdminChoice("A"); break;
    case "travel-group-admin-choose-b": gmTravelGroupSetAdminChoice("B"); break;
    case "group-check-select-all": { const d=sanitizeGMGroupCheckDraft(); d.supporters=gmGroupCheckPlayers().filter(p=>!p.offline&&!sameId(p.id,d.leaderId)).map(p=>String(p.id));saveGMGroupCheckState();render();break; }
    case "start-group-check": await startGMGroupCheck(); break;
    case "send-group-check-final": await sendGMGroupCheckFinal(); break;
    case "cancel-group-check": await cancelGMGroupCheck(); break;
    case "reset-group-check": resetGMGroupCheck(); break;
    case "group-check-roll-support": await rollGroupCheckSupport(); break;
    case "group-check-roll-final": await rollGroupCheckFinal(); break;
    case "preview-gm-broadcast": previewGMBroadcast(); break;
    case "send-gm-broadcast": await sendGMBroadcast(); break;
    case "approve-travel-move": await decideTravelApproval(b.dataset.travelApprovalRequest,true); break;
    case "deny-travel-move": await decideTravelApproval(b.dataset.travelApprovalRequest,false); break;
    case "start-dm-token-frame": await startDMTokenFrameTool(); break;
    case "stop-dm-token-frame": await stopDMTokenFrameTool(); break;
    case "remove-selected-token-frame": await removeDMTokenFrameFromSelected(); break;
    case "generate-gm-shop": generateGMShop(); break;
    case "apply-gm-shop-search": runtime.gmShop.stockPage = 1; saveGMShopState(); render(); break;
    case "clear-gm-shop-search": runtime.gmShop.stockSearch = ""; runtime.gmShop.stockPage = 1; saveGMShopState(); render(); break;
    case "clear-gm-shop-active": runtime.gmShop.active = []; saveGMShopState(); render(); if (runtime.sharedShop?.open) await syncGMShopActiveToPlayers({ forceOpen: false, quiet: true }); render(); break;
    case "publish-gm-shop": await publishGMShopToPlayers(); break;
    case "close-gm-shop": await closeGMShopToPlayers(); break;
    case "retry-shop-stock": gmShopStockPromise = null; gmShopStockLoadError = ""; await ensureGMShopStockLoaded(); render(); break;

    case "sound": playSound("roll"); showToast("Sound ready", "Realtime sounds enabled", "message", false); break;
    case "theme": runtime.uiTheme = runtime.uiTheme === "phantom" ? "default" : "phantom"; saveUITheme(runtime.uiTheme); render(); showToast("UI THEME", runtime.uiTheme === "phantom" ? "PHANTOM theme enabled" : "Default theme enabled", "message"); break;
    case "send-chat": sendChat(); break;
    case "ask-fabula-ai": await askFabulaAi(); break;
    case "open-fabula-ai-page": await openFabulaAiPage(b.dataset.aiSourceBook, b.dataset.aiSourcePage); break;
    case "clear-fabula-ai": runtime.aiChat = defaultFabulaAiChat(); saveFabulaAiChat(); render(); break;
    case "clear-chat": runtime.feed = []; saveFeed(); if (runtime.currentPlayer.role === "GM") broadcast("clear", { id: uid(), senderId: runtime.currentPlayer.id }); render(); break;
    case "clear-combat-history": await clearCombatHistory(); break;
    case "undo-last-combat": await undoLastCombatChange(); break;
    case "manual-roll": performManualRoll(); break;
    case "random-number": performRandomNumber(); break;
    case "hud-layout-save": {const name=document.querySelector("[data-hud-layout-name]")?.value.trim().slice(0,50)||`LAYOUT ${loadHudLayoutPresets().length+1}`;saveHudLayoutPresets([{id:uid(),name,layout:snapshotHudLayout()},...loadHudLayoutPresets()]);render();showToast("HUD LAYOUT",`Saved ${name}`,"message",false);break;}
    case "vault-save": { if (state.deleted) break; const v = loadVault(); v.unshift(deepClone(state)); saveVault(v.slice(0, 30)); render(); break; }
    case "export": exportJSON(); break;
    case "close-overlay":
      if (runtime.overlay?.kind !== "player-defeat-choice") dismissOverlay();
      break;
  }
}

function dragPointInsideViewport(e) {
  const x = Number(e?.clientX), y = Number(e?.clientY);
  return Number.isFinite(x) && Number.isFinite(y) && x > 0 && y > 0 && x < window.innerWidth && y < window.innerHeight;
}
function setDragDeleteVisual(outside = false) {
  document.documentElement.classList.toggle("drag-delete-active", !!runtime.drag?.deleteKind);
  document.documentElement.classList.toggle("drag-delete-outside", !!runtime.drag?.deleteKind && !!outside);
}
function monsterLibraryDragScrollContainer() {
  return document.querySelector(".workspace") || document.scrollingElement || document.documentElement;
}
function handleDragWheel(e) {
  if (!runtime.drag || !["monster-template-folder", "monster-template-card"].includes(runtime.drag.kind)) return;
  const scroller = monsterLibraryDragScrollContainer(); if (!scroller) return;
  const dy = Number(e.deltaY) || 0, dx = Number(e.deltaX) || 0; if (!dy && !dx) return;
  e.preventDefault();
  scroller.scrollBy({ top: dy, left: dx, behavior: "auto" });
}
function autoScrollMonsterLibraryDrag(e) {
  if (!runtime.drag || !["monster-template-folder", "monster-template-card"].includes(runtime.drag.kind)) return;
  const scroller = monsterLibraryDragScrollContainer(); if (!scroller?.getBoundingClientRect) return;
  const r = scroller.getBoundingClientRect(), edge = Math.min(84, Math.max(44, r.height * 0.12));
  let dy = 0;
  if (e.clientY < r.top + edge) dy = -Math.ceil((r.top + edge - e.clientY) / edge * 24);
  else if (e.clientY > r.bottom - edge) dy = Math.ceil((e.clientY - (r.bottom - edge)) / edge * 24);
  if (dy) scroller.scrollTop += dy;
}
function handleDragStart(e) {
  const h = e.target.closest("[data-drag-kind]"); if (!h) return;
  // Cards are draggable from their surface, but controls and form fields should behave normally.
  // Navigation and Character Sheet tabs are themselves the drag surface: hold anywhere on the tab and move.
  const explicitDragHandle = e.target.closest(".drag-handle");
  const wholeTabDrag = (h.dataset.dragKind === "nav" || h.dataset.dragKind === "sheet-tabs") && e.target.closest("button") === h;
  if (!explicitDragHandle && !wholeTabDrag && e.target.closest("input,textarea,select,button,a,[contenteditable='true']")) { e.preventDefault(); return; }
  runtime.drag = {
    kind: h.dataset.dragKind,
    owner: h.dataset.dragOwner || "self",
    index: h.dataset.index !== undefined ? Number(h.dataset.index) : null,
    key: h.dataset.key || null,
    path: h.dataset.dragPath || h.dataset.dragKind || "",
    deleteKind: h.dataset.deleteKind || "",
    parentIndex: h.dataset.parentIndex !== undefined ? Number(h.dataset.parentIndex) : null,
    listType: h.dataset.listType || "",
    outside: false
  };
  e.dataTransfer.effectAllowed = "move";
  try { e.dataTransfer.setData("text/plain", JSON.stringify(runtime.drag)); } catch {}
  h.classList.add("dragging");
  h.closest?.(".drag-delete-card")?.classList.add("dragging");
  setDragDeleteVisual(false);
}
function handleDragOver(e) {
  if (!runtime.drag) return;
  autoScrollMonsterLibraryDrag(e);
  runtime.drag.outside = false;
  setDragDeleteVisual(false);
  const z = e.target.closest(`[data-drop-kind="${runtime.drag.kind}"]`); if (!z) return;
  if (!["nav", "codex-card", "codex-folder", "sheet-tabs"].includes(runtime.drag.kind) && (z.dataset.dropOwner || "self") !== runtime.drag.owner) return;
  e.preventDefault(); e.dataTransfer.dropEffect = "move"; z.classList.add("drag-over");
}
function handleDragLeave(e) {
  if (!runtime.drag?.deleteKind) return;
  const x = Number(e.clientX), y = Number(e.clientY);
  const outside = e.relatedTarget == null && (x <= 0 || y <= 0 || x >= window.innerWidth || y >= window.innerHeight || !dragPointInsideViewport(e));
  if (!outside) return;
  runtime.drag.outside = true;
  setDragDeleteVisual(true);
}
function handleDragEnter(e) {
  if (!runtime.drag?.deleteKind || !dragPointInsideViewport(e)) return;
  runtime.drag.outside = false;
  setDragDeleteVisual(false);
}
function clearDragClasses() {
  document.querySelectorAll(".drag-over,.dragging").forEach(x => x.classList.remove("drag-over", "dragging"));
  document.documentElement.classList.remove("drag-delete-active", "drag-delete-outside");
}
async function handleDrop(e) {
  if (!runtime.drag) return; const z = e.target.closest(`[data-drop-kind="${runtime.drag.kind}"]`); if (!z) { runtime.drag = null; clearDragClasses(); return; }
  e.preventDefault(); const d = runtime.drag; runtime.drag = null; clearDragClasses();
  if (d.kind === "nav") { const toKey = z.dataset.key, from = runtime.navOrder.indexOf(d.key), to = runtime.navOrder.indexOf(toKey); moveItem(runtime.navOrder, from, to); saveNavOrder(); render(); return; }
  if (d.kind === "sheet-tabs") { const toKey = z.dataset.key, from = runtime.sheetTabOrder.indexOf(d.key), to = runtime.sheetTabOrder.indexOf(toKey); moveItem(runtime.sheetTabOrder, from, to); saveSheetTabOrder(); render(); return; }
  if (d.kind === "monster-template-folder") {
    const from = (runtime.monsterLibraryFolders || []).findIndex(x => x.id === d.key), to = Number(z.dataset.index);
    if (from >= 0 && Number.isInteger(to) && from !== to) {
      moveItem(runtime.monsterLibraryFolders, from, to); runtime.monsterLibraryFolders = runtime.monsterLibraryFolders.map((x,i)=>({ ...x, order:i })); saveMonsterLibraryFolders(runtime.monsterLibraryFolders); render();
    }
    return;
  }
  if (d.kind === "monster-template-card") {
    const m = (runtime.monsterLibrary || []).find(x => x.id === d.key); if (!m) return;
    const targetFolder = String(z.dataset.monsterTemplateFolder || "");
    if (String(m.folderId || "") !== targetFolder) { m.folderId = targetFolder; m.updatedAt = Date.now(); saveMonsterLibrary(runtime.monsterLibrary); showToast("TEMPLATE LIBRARY", `${m.name || "Monster"} moved`, "message"); render(); }
    return;
  }
  if (d.kind === "codex-folder") {
    const from = (runtime.codexFolders || []).findIndex(x => x.id === d.key), to = Number(z.dataset.index);
    if (from >= 0 && Number.isInteger(to) && from !== to) {
      moveItem(runtime.codexFolders, from, to); runtime.codexFolders = runtime.codexFolders.map((x,i)=>({ ...x, order:i })); scheduleCodexSave(); render();
    }
    return;
  }
  if (d.kind === "codex-card") {
    const entry = (runtime.codex || []).find(x => x.key === d.key); if (!entry) return;
    const targetFolder = String(z.dataset.codexFolder || ""), targetKey = String(z.dataset.codexTargetKey || "");
    const oldFolder = String(entry.folderId || "");
    const oldList = (runtime.codex || []).filter(x => String(x.folderId || "") === oldFolder && x.key !== entry.key).sort(codexSort);
    oldList.forEach((x,i)=>x.order=i);
    const targetList = (runtime.codex || []).filter(x => String(x.folderId || "") === targetFolder && x.key !== entry.key).sort(codexSort);
    let at = targetKey ? targetList.findIndex(x => x.key === targetKey) : targetList.length;
    if (at < 0) at = targetList.length;
    entry.folderId = targetFolder; targetList.splice(at,0,entry); targetList.forEach((x,i)=>x.order=i);
    scheduleCodexSave(); showToast("CODEX", `${entry.monster?.name || "Entry"} moved`, "message"); render(); return;
  }
  if (d.kind === "scene-clocks" || d.kind === "scene-projects") {
    const kind = d.kind === "scene-clocks" ? "clocks" : "projects", to = Number(z.dataset.index);
    if (Number.isInteger(to) && to !== d.index) { moveItem(runtime.sceneTrackers[kind], d.index, to); scheduleTrackerSave(); render(); }
    return;
  }
  const owner = z.dataset.dropOwner || "self"; if (owner !== d.owner) return;
  const to = Number(z.dataset.index); if (!Number.isInteger(to) || to === d.index) return;
  if (d.path && d.path !== d.kind) await sendRemoteEdit(owner, { kind: "reorder-path", path: d.path, from: d.index, to });
  else await sendRemoteEdit(owner, { kind: "reorder", collection: d.kind, from: d.index, to });
}
function draggedDeleteMeta(d) {
  if (!d?.deleteKind || !Number.isInteger(d.index)) return null;
  let op = null, label = "BOARD";
  if (d.deleteKind === "class") { op = { kind: "remove-class", index: d.index }; label = "CLASS"; }
  else if (d.deleteKind === "class-skill") { op = { kind: "remove-class-skill", classIndex: d.parentIndex, index: d.index }; label = "CLASS SKILL"; }
  else if (d.deleteKind === "quirk") { op = { kind: "remove-quirk", index: d.index }; label = "QUIRK"; }
  else if (d.deleteKind === "equipment") { op = { kind: "remove-equipment", index: d.index }; label = "EQUIPMENT"; }
  else if (d.deleteKind === "sphere" || d.deleteKind === "spheres") { op = { kind: "remove-sphere", index: d.index }; label = "SPHERE"; }
  else if (d.deleteKind === "inventory") { op = { kind: "remove-inventory", index: d.index }; label = "ITEM"; }
  else if (d.deleteKind === "list" && d.listType) { op = { kind: "remove-list", type: d.listType, index: d.index }; label = d.listType === "bonds" ? "BOND" : "ARCANA"; }
  else if (d.deleteKind === "clock" || d.deleteKind === "clocks") { op = { kind: "remove-clock", index: d.index }; label = "CLOCK"; }
  else if (d.deleteKind === "project" || d.deleteKind === "projects") { op = { kind: "remove-project", index: d.index }; label = "PROJECT"; }
  else if (d.deleteKind === "action" || d.deleteKind === "actions") { op = { kind: "remove-action", index: d.index }; label = "ACTION"; }
  if (!op) return null;
  return { owner: d.owner || "self", op, label };
}
async function deleteDraggedSheetBoard(d) {
  const meta = draggedDeleteMeta(d);
  if (!meta) return false;
  await sendRemoteEdit(meta.owner, meta.op);
  showToast("QUICK DELETE", `${meta.label} removed · dragged outside window`, "message");
  return true;
}
async function handleDragEnd(e) {
  const d = runtime.drag;
  const outside = !!d?.deleteKind && (d.outside || !dragPointInsideViewport(e));
  runtime.drag = null;
  clearDragClasses();
  if (!outside) return;
  const meta = draggedDeleteMeta(d);
  if (!meta) return;
  const ok = window.confirm(`Delete this ${meta.label}?`);
  if (!ok) { showToast("QUICK DELETE", `${meta.label} not deleted`, "message"); return; }
  await sendRemoteEdit(meta.owner, meta.op);
  showToast("QUICK DELETE", `${meta.label} removed · dragged outside window`, "message");
}


// v2.120 · Empty-board context menu owns LINK MODE toggle; mode conflicts auto-resolve
// v2.139 · Restored v2.131 Direct Node Editor on stable v2.138 base: click Node → edit NAME / DETAIL / UNLOCK RULE directly; Node dropdown removed
// v2.140 · Restored v2.132 Player Explored Node Counter: current-map discovered count only; total Node count remains hidden
// v2.141 · GM can hover-preview hidden Nodes without revealing them to Players
async function handleTravelClick(e) {
  const b=e.target?.closest?.('[data-travel-session-collapse],[data-travel-session-new],[data-travel-session-open],[data-travel-session-rename],[data-travel-session-duplicate],[data-travel-session-delete],[data-travel-map-tab],[data-travel-map-new],[data-travel-map-delete],[data-travel-map-link-selected],[data-travel-node-bg-link-selected],[data-travel-map-refresh],[data-travel-frame-create],[data-travel-frame-selected],[data-travel-node-new],[data-travel-node-set-current],[data-travel-node-reveal],[data-travel-node-duplicate],[data-travel-node-delete],[data-travel-move],[data-travel-node-go],[data-travel-zoom],[data-travel-context-state],[data-travel-context-action],[data-travel-board-context-action],[data-travel-group-control],[data-travel-sidebar-toggle],[data-travel-gm-player-mode],[data-travel-approval-toggle],[data-travel-connect-node],[data-travel-connect-from-selected],[data-travel-unlink],[data-travel-token-embed],[data-travel-token-show],[data-travel-token-hide],[data-travel-token-capture],[data-travel-token-remove],[data-travel-token-show-all],[data-travel-token-hide-all],[data-travel-state-add-selected],[data-travel-state-default-active],[data-travel-state-active],[data-travel-state-delete],[data-travel-inspector-tab],[data-travel-node-list-select],[data-travel-node-filter],[data-travel-node-lock-toggle]');
  if(!b)return false;e.preventDefault();e.stopPropagation();
  if(b.hasAttribute('data-travel-session-collapse')){runtime.travelSessionsCollapsed=!runtime.travelSessionsCollapsed;saveUIPrefs({travelSessionsCollapsed:runtime.travelSessionsCollapsed});closeTravelNodeContext();closeTravelBoardContext();render();}
  else if(b.hasAttribute('data-travel-session-new'))travelCreateSession();
  else if(b.dataset.travelSessionOpen)travelOpenSession(b.dataset.travelSessionOpen);
  else if(b.dataset.travelSessionRename)travelRenameSession(b.dataset.travelSessionRename);
  else if(b.dataset.travelSessionDuplicate)travelDuplicateSession(b.dataset.travelSessionDuplicate);
  else if(b.dataset.travelSessionDelete)travelDeleteSession(b.dataset.travelSessionDelete);
  else if(b.dataset.travelMapTab){runtime.travelEditorMapId=b.dataset.travelMapTab;runtime.travelSelectedNodeId=travelMap()?.nodes?.[0]?.id||'';render();}
  else if(b.dataset.travelInspectorTab){const tab=String(b.dataset.travelInspectorTab||'NODES').toUpperCase();if(['MAP','NODES','TOOLS','SETTINGS'].includes(tab)){runtime.travelInspectorTab=tab;saveUIPrefs({travelInspectorTab:tab});render();}}
  else if(b.dataset.travelNodeListSelect){runtime.travelSelectedNodeId=String(b.dataset.travelNodeListSelect||'');runtime.travelInspectorTab='NODES';saveUIPrefs({travelInspectorTab:'NODES'});render();}
  else if(b.dataset.travelNodeFilter){runtime.travelNodeFilter=String(b.dataset.travelNodeFilter||'ALL').toUpperCase();render();}
  else if(b.hasAttribute('data-travel-node-lock-toggle'))travelToggleLockNode();
  else if(b.dataset.travelGroupControl){const g=String(b.dataset.travelGroupControl||'A').toUpperCase();if(['A','B'].includes(g)){runtime.travelControlGroup=g;const s=travelSession(),c=travelCurrentRef(s,g);if(c?.mapId)runtime.travelEditorMapId=c.mapId;render();}}
  else if(b.hasAttribute('data-travel-sidebar-toggle')){runtime.travelSidebarCollapsed=!runtime.travelSidebarCollapsed;saveUIPrefs({travelSidebarCollapsed:runtime.travelSidebarCollapsed});render();}
  else if(b.hasAttribute('data-travel-gm-player-mode')){if(runtime.currentPlayer.role==='GM'){runtime.travelGMPlayerMode=!runtime.travelGMPlayerMode;if(runtime.travelGMPlayerMode){runtime.travelConnectMode=false;runtime.travelConnectAnchor=null;}saveUIPrefs({travelGMPlayerMode:runtime.travelGMPlayerMode});const ss=travelSession(),gg=travelViewerGroupId(ss),cc=travelCurrentRef(ss,gg);if(cc?.mapId)runtime.travelEditorMapId=cc.mapId;render();}}
  else if(b.hasAttribute('data-travel-approval-toggle')){if(runtime.currentPlayer.role==='GM')await setTravelApprovalMode(!travelApprovalEnabled());}
  else if(b.hasAttribute('data-travel-connect-node'))travelConnectClick(b.dataset.travelMapNode,b.dataset.travelNode);
  else if(b.hasAttribute('data-travel-connect-from-selected')){const mm=travelMap(),nn=travelSelectedNode();if(mm&&nn&&runtime.travelConnectMode){runtime.travelConnectAnchor={mapId:String(mm.id),nodeId:String(nn.id)};render();}}
  else if(b.dataset.travelUnlink){const mm=travelMap(),nn=travelSelectedNode(),[tm,tn]=String(b.dataset.travelUnlink).split('|');if(mm&&nn&&tm&&tn)travelUnlinkNodes(mm.id,nn.id,tm,tn);}
  else if(b.hasAttribute('data-travel-map-new'))travelNewMap();
  else if(b.hasAttribute('data-travel-map-delete'))travelDeleteMap();
  else if(b.hasAttribute('data-travel-map-link-selected'))await linkSelectedTravelMap();
  else if(b.hasAttribute('data-travel-node-bg-link-selected'))await linkSelectedTravelNodeBackground();
  else if(b.hasAttribute('data-travel-state-add-selected'))await travelAddNodeStateFromSelected();
  else if(b.hasAttribute('data-travel-state-default-active'))await travelSetNodeStateActive("");
  else if(b.dataset.travelStateActive)await travelSetNodeStateActive(b.dataset.travelStateActive);
  else if(b.dataset.travelStateDelete)await travelDeleteNodeState(b.dataset.travelStateDelete);
  else if(b.hasAttribute('data-travel-map-refresh'))await refreshTravelMapItems(true);
  else if(b.hasAttribute('data-travel-frame-create'))await createTravelFrame(String(b.dataset.travelFrameCreate||'MAIN'));
  else if(b.hasAttribute('data-travel-frame-selected'))await useSelectedTravelFrame(String(b.dataset.travelFrameSelected||'MAIN'));
  else if(b.hasAttribute('data-travel-token-embed'))await travelEmbedSelectedToken();
  else if(b.dataset.travelTokenShow)await travelShowEmbeddedToken(b.dataset.travelTokenShow);
  else if(b.dataset.travelTokenHide)await travelHideEmbeddedToken(b.dataset.travelTokenHide);
  else if(b.dataset.travelTokenCapture)await travelCaptureEmbeddedToken(b.dataset.travelTokenCapture);
  else if(b.dataset.travelTokenRemove)await travelRemoveEmbeddedToken(b.dataset.travelTokenRemove);
  else if(b.hasAttribute('data-travel-token-show-all'))await travelShowAllEmbeddedTokens();
  else if(b.hasAttribute('data-travel-token-hide-all'))await travelHideAllEmbeddedTokens();
  else if(b.hasAttribute('data-travel-node-new'))travelNewNode();
  else if(b.hasAttribute('data-travel-node-set-current'))travelSetCurrentNode();
  else if(b.hasAttribute('data-travel-node-reveal'))travelToggleRevealNode();
  else if(b.hasAttribute('data-travel-node-duplicate'))travelDuplicateNode();
  else if(b.hasAttribute('data-travel-node-delete'))travelDeleteNode();
  else if(b.dataset.travelNodeGo)travelMoveToTarget(b.dataset.travelNodeGo);
  else if(b.dataset.travelZoom)travelZoomAction(b.dataset.travelZoom,b.closest('.travel-board')?.dataset.travelBoard);
  else if(b.dataset.travelMove)travelMove(b.dataset.travelMove);
  else if(b.dataset.travelBoardContextAction){const a=b.dataset.travelBoardContextAction;closeTravelBoardContext();if(a==='linkmode'&&runtime.currentPlayer.role==='GM'){travelToggleConnectMode();}else if(a==='create'&&runtime.currentPlayer.role==='GM'){const mapId=String(runtime.travelBoardCreateMapId||'');const x=Number(runtime.travelBoardCreateX),y=Number(runtime.travelBoardCreateY);if(mapId){runtime.travelEditorMapId=mapId;travelNewNode(Number.isFinite(x)?x:50,Number.isFinite(y)?y:50);}}else if(a==='clearselection'&&runtime.currentPlayer.role==='GM'){travelClearMultiSelection(runtime.travelBoardCreateMapId||runtime.travelEditorMapId);render();}}
  else if(b.hasAttribute('data-travel-context-state')){closeTravelNodeContext();if(runtime.currentPlayer.role==='GM')await travelSetNodeStateActive(b.getAttribute('data-travel-context-state')||'');}
  else if(b.dataset.travelContextAction){const a=b.dataset.travelContextAction;closeTravelNodeContext();if(a==='here'){const s=travelSession(),mid=runtime.travelContextMapId||runtime.travelEditorMapId||travelCurrentRef(s)?.mapId,nid=runtime.travelContextNodeId;travelSetMyLocation(mid,nid);}else if(a==='merge')travelMergeGroupsHere();else if(a==='embed-token')await travelEmbedSelectedToken();else if(a==='show-tokens')await travelShowAllEmbeddedTokens();else if(a==='hide-tokens')await travelHideAllEmbeddedTokens();else if(a==='lock')travelToggleLockNode();else if(a==='current')travelSetCurrentNode();else if(a==='reveal')travelToggleRevealNode();else if(a==='duplicate')travelDuplicateNode();else if(a==='delete')travelDeleteNode();}
  return true;
}
function handleTravelInput(e){const el=e.target;if(!el?.closest?.('.travel-v2103'))return false;const s=travelSession(),m=travelMap(s),n=travelSelectedNode();if(!s||runtime.currentPlayer.role!=="GM")return false;
  if(el.hasAttribute('data-travel-node-search')){runtime.travelNodeSearch=String(el.value||'');const q=runtime.travelNodeSearch.trim().toLowerCase();for(const row of el.closest('.travel-node-browser')?.querySelectorAll('.travel-node-list-item')||[]){const text=String(row.textContent||'').toLowerCase();row.style.display=!q||text.includes(q)?'':'none';}return true;}
  if(el.hasAttribute('data-travel-node-active-state')&&e.type==='change'){travelSetNodeStateActive(el.value);return true;}
  if(el.hasAttribute('data-travel-map-name')){m.name=el.value||m.name;if(e.type==='change')scheduleTravelSave(10,{applyBackground:false});return true;}
  if(el.hasAttribute('data-travel-map-item')&&e.type==='change'){linkTravelMapById(el.value);return true;}
  if(el.hasAttribute('data-travel-node-bg-item')&&e.type==='change'){linkTravelNodeBackgroundById(el.value);return true;}
  if(el.hasAttribute('data-travel-state-bg-item')&&e.type==='change'){travelSetNodeStateBackground(el.getAttribute('data-travel-state-bg-item'),el.value);return true;}
  if(el.hasAttribute('data-travel-state-name')){const st=travelNodeStateById(n,el.getAttribute('data-travel-state-name'));if(st){st.name=String(el.value||'').trim()||st.name;if(e.type==='change'){scheduleTravelSave(10,{applyBackground:false});render();}}return true;}
  if(el.hasAttribute('data-travel-state-preview')){const st=travelNodeStateById(n,el.getAttribute('data-travel-state-preview'));if(st){st.previewUrl=String(el.value||'');if(e.type==='change'){scheduleTravelSave(10,{applyBackground:false});render();}}return true;}
  if(el.hasAttribute('data-travel-room-unlock-rule')){const [mid,nid]=String(el.getAttribute('data-travel-room-unlock-rule')||'').split('|');const mm=s.maps.find(x=>String(x.id)===String(mid)),nn=mm?.nodes?.find(x=>String(x.id)===String(nid));if(!mm||!nn)return true;nn.unlockRule=String(el.value||'');if(e.type==='input')broadcastTravelNodeLive(mm.id,nn.id,{unlockRule:nn.unlockRule});if(e.type==='change')scheduleTravelSave(10,{applyBackground:false});return true;}
  if(el.dataset.travelNodeField){if(!n)return true;const key=el.dataset.travelNodeField;let v=el.value;if(['x','y'].includes(key)){const num=Number(v);v=Number.isFinite(num)?num:(key==='x'?50:50);}n[key]=v;if(e.type==='input'&&['name','detail','unlockRule','previewUrl'].includes(key))broadcastTravelNodeLive(m.id,n.id,{[key]:v});if(e.type==='change'){if(['x','y'].includes(key))travelEnsurePositiveOrigin(m,m.id);scheduleTravelSave(10,{applyBackground:false});render();}return true;}
  if(el.dataset.travelNodeCheck&&e.type==='change'){if(n){n[el.dataset.travelNodeCheck]=!!el.checked;scheduleTravelSave(10,{applyBackground:false});render();}return true;}
  return false;}
function handleGMShopGenerateContextMenu(e){
  const btn=e.target?.closest?.('button[data-action="generate-gm-shop"]');
  if(!btn||runtime.currentPlayer.role!=="GM")return false;
  e.preventDefault();e.stopPropagation();
  const current=Math.max(0,Number(runtime.gmShop?.maxPrice)||0);
  const raw=window.prompt("MAX ITEM PRICE (ZENIT)\nEnter 0 or leave blank for no limit.",current>0?String(current):"");
  if(raw===null)return true;
  const cleaned=String(raw).replace(/[,\s]|z/gi,"").trim();
  if(cleaned==="") runtime.gmShop.maxPrice=0;
  else{
    const value=Number(cleaned);
    if(!Number.isFinite(value)||value<0){showToast("MAX ITEM PRICE","Please enter a valid price of 0 or higher","message");return true;}
    runtime.gmShop.maxPrice=Math.max(0,Math.min(999999999,Math.floor(value)));
  }
  saveGMShopState();render();
  showToast("MAX ITEM PRICE",runtime.gmShop.maxPrice>0?`Generate will use items priced ≤ ${runtime.gmShop.maxPrice.toLocaleString()}z`:"Price limit disabled","message",false);
  return true;
}
function handleTravelContextMenu(e){
  const node=e.target?.closest?.('.travel-node[data-travel-node]');
  if(node){e.preventDefault();openTravelNodeContext(e,node.dataset.travelMapNode,node.dataset.travelNode);return;}
  const board=e.target?.closest?.('.travel-board[data-travel-board]');
  if(board&&runtime.currentPlayer.role==='GM'){e.preventDefault();openTravelBoardContext(e,board);}
}
function travelUpdateDraggedNodesDOM(map, nodeIds, board) {
  const ids=new Set((nodeIds||[]).map(String)), world=board?.querySelector('.travel-world'), svg=world?.querySelector('svg'); if(!map||!board)return;
  const nodeById=new Map((map.nodes||[]).map(n=>[String(n.id),n]));
  const posById=new Map((map.nodes||[]).map(n=>[String(n.id),travelNodeWorldPos(n)]));
  for(const id of ids){const n=nodeById.get(id);if(!n)continue;const pos=posById.get(id),el=board.querySelector(`.travel-node[data-travel-map-node="${CSS.escape(map.id)}"][data-travel-node="${CSS.escape(n.id)}"]`);if(el){el.style.left=`${pos.x}px`;el.style.top=`${pos.y}px`;const sm=el.querySelector('small');if(sm)sm.textContent=`${n.locked?'LOCKED · ':'OPEN · '}${travelWasVisited(travelSession(),map.id,n.id)?'REVEALED':'HIDDEN'} · ${travelBranchCount(n)} LINK${travelBranchCount(n)===1?'':'S'} · ${Math.round(n.x)},${Math.round(n.y)}`;}}
  const metrics=travelMapWorldMetrics(map);if(world){world.style.width=`${metrics.width}px`;world.style.height=`${metrics.height}px`;}if(svg){svg.setAttribute('viewBox',`0 0 ${metrics.width} ${metrics.height}`);for(const line of svg.querySelectorAll('line')){const a=posById.get(String(line.dataset.a)),b=posById.get(String(line.dataset.b));if(a){line.setAttribute('x1',a.x);line.setAttribute('y1',a.y);}if(b){line.setAttribute('x2',b.x);line.setAttribute('y2',b.y);}}}
}
function scheduleTravelDraggedNodesDOM(map,nodeIds,board){
  runtime.travelDragDomPending={map,nodeIds:[...(nodeIds||[])],board};
  if(runtime.travelDragDomFrame)return;
  runtime.travelDragDomFrame=requestAnimationFrame(()=>{runtime.travelDragDomFrame=0;const rec=runtime.travelDragDomPending;runtime.travelDragDomPending=null;if(rec?.board?.isConnected)travelUpdateDraggedNodesDOM(rec.map,rec.nodeIds,rec.board);});
}
function travelMarqueeSelectionFromRect(marquee, currentX, currentY){
  const board=marquee?.board;if(!board)return [];const br=board.getBoundingClientRect(),x1=Math.min(marquee.startX,currentX),y1=Math.min(marquee.startY,currentY),x2=Math.max(marquee.startX,currentX),y2=Math.max(marquee.startY,currentY),left=br.left+x1,top=br.top+y1,right=br.left+x2,bottom=br.top+y2,out=[];
  for(const el of board.querySelectorAll(`.travel-node[data-travel-map-node="${CSS.escape(marquee.mapId)}"]:not(.travel-exit-node)`)){const r=el.getBoundingClientRect();if(r.right>=left&&r.left<=right&&r.bottom>=top&&r.top<=bottom)out.push(String(el.dataset.travelNode||''));}
  return out.filter(Boolean);
}
function handleTravelPointerDown(e){
  const board=e.target?.closest?.('.travel-board[data-travel-board]');
  const node=e.target?.closest?.('.travel-node[data-travel-node]');
  const gm=runtime.currentPlayer.role==='GM', adminEdit=gm&&!travelGMUsesPlayerRules()&&!runtime.travelConnectMode;
  const connectNode=e.target?.closest?.('.travel-node[data-travel-connect-node]');if(connectNode&&gm&&runtime.travelConnectMode&&e.button===0){e.preventDefault();return;}
  const boardControl=e.target?.closest?.('.travel-zoom-controls,.travel-board-tip,button,input,select,textarea,label,a');
  if(node&&adminEdit&&e.button===0&&(e.ctrlKey||e.metaKey)){travelToggleMultiNode(node.dataset.travelMapNode,node.dataset.travelNode);runtime.travelEditorMapId=node.dataset.travelMapNode;runtime.travelSelectedNodeId=node.dataset.travelNode;render();e.preventDefault();e.stopPropagation();return;}
  const blankBoxSelect=!!(board&&adminEdit&&e.button===0&&!node&&!boardControl&&e.shiftKey);
  if(blankBoxSelect){const r=board.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,base=(e.ctrlKey||e.metaKey)?travelMultiSelection(board.dataset.travelBoard):[];runtime.travelMarquee={pointerId:e.pointerId,mapId:String(board.dataset.travelBoard),board,startX:x,startY:y,currentX:x,currentY:y,baseSelection:[...base],moved:false};board.classList.add('selecting');const box=board.querySelector('[data-travel-marquee-box]');if(box){box.style.left=`${x}px`;box.style.top=`${y}px`;box.style.width='0px';box.style.height='0px';box.classList.add('open');}try{board.setPointerCapture(e.pointerId)}catch{}e.preventDefault();return;}
  const blankLeftPan=!!(board&&e.button===0&&!node&&!boardControl);
  if(board&&(e.button===1||(e.button===0&&runtime.travelSpaceDown)||blankLeftPan)){const v=travelBoardView(travelSession(),board.dataset.travelBoard);runtime.travelPan={pointerId:e.pointerId,mapId:board.dataset.travelBoard,startX:e.clientX,startY:e.clientY,startPanX:v.panX,startPanY:v.panY,board,moved:false};board.classList.add('panning');travelBoardPerfMode(board,160);try{board.setPointerCapture(e.pointerId)}catch{}e.preventDefault();return;}
  if(!node||!gm||e.button!==0)return;if(e.target.closest('input,select,textarea'))return;if(travelGMUsesPlayerRules()&&node.hasAttribute('data-travel-node-go')&&!e.shiftKey)return;const b=node.closest('.travel-board');if(!b)return;
  runtime.travelEditorMapId=node.dataset.travelMapNode;runtime.travelSelectedNodeId=node.dataset.travelNode;runtime.travelInspectorTab='NODES';
  const selected=travelMultiSelection(node.dataset.travelMapNode), groupIds=selected.includes(String(node.dataset.travelNode))&&selected.length>1?[...selected]:[String(node.dataset.travelNode)];if(groupIds.length===1&&!selected.includes(groupIds[0]))travelClearMultiSelection(node.dataset.travelMapNode);
  const s=travelSession(),m=s?.maps.find(x=>String(x.id)===String(node.dataset.travelMapNode)),r=b.getBoundingClientRect(),v=travelBoardView(s,node.dataset.travelMapNode),startWorldX=(e.clientX-r.left-v.panX)/v.zoom,startWorldY=(e.clientY-r.top-v.panY)/v.zoom,initialPositions=groupIds.map(id=>{const n=m?.nodes.find(x=>String(x.id)===id);return n?{id,x:Number(n.x)||0,y:Number(n.y)||0}:null;}).filter(Boolean);
  runtime.travelDrag={pointerId:e.pointerId,mapId:node.dataset.travelMapNode,nodeId:node.dataset.travelNode,nodeIds:groupIds,initialPositions,startWorldX,startWorldY,board:b,moved:false,startX:e.clientX,startY:e.clientY};if(groupIds.length>1)b.classList.add('group-moving');travelBoardPerfMode(b,160);try{node.setPointerCapture(e.pointerId)}catch{}e.preventDefault();
}
function handleTravelPointerMove(e){
  moveTravelPreview(e);
  const q=runtime.travelMarquee;if(q&&q.pointerId===e.pointerId){const r=q.board.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;q.currentX=x;q.currentY=y;q.moved=q.moved||Math.hypot(x-q.startX,y-q.startY)>3;const left=Math.min(q.startX,x),top=Math.min(q.startY,y),right=Math.max(q.startX,x),bottom=Math.max(q.startY,y),box=q.board.querySelector('[data-travel-marquee-box]');if(box){box.style.left=`${left}px`;box.style.top=`${top}px`;box.style.width=`${right-left}px`;box.style.height=`${bottom-top}px`;}const hits=travelMarqueeSelectionFromRect(q,x,y),ids=[...new Set([...(q.baseSelection||[]),...hits])];travelSetMultiSelection(q.mapId,ids);for(const el of q.board.querySelectorAll('.travel-node.multi-selected'))el.classList.remove('multi-selected');for(const id of ids)q.board.querySelector(`.travel-node[data-travel-map-node="${CSS.escape(q.mapId)}"][data-travel-node="${CSS.escape(id)}"]`)?.classList.add('multi-selected');return;}
  const p=runtime.travelPan;if(p&&p.pointerId===e.pointerId){p.moved=p.moved||Math.hypot(e.clientX-p.startX,e.clientY-p.startY)>3;const v=travelBoardView(travelSession(),p.mapId);v.panX=p.startPanX+(e.clientX-p.startX);v.panY=p.startPanY+(e.clientY-p.startY);travelBoardPerfMode(p.board,100);scheduleTravelBoardView(p.mapId);return;}
  const d=runtime.travelDrag;if(!d||d.pointerId!==e.pointerId)return;const s=travelSession(),m=s?.maps.find(x=>String(x.id)===String(d.mapId));if(!m)return;const r=d.board.getBoundingClientRect(),v=travelBoardView(s,d.mapId),wx=(e.clientX-r.left-v.panX)/v.zoom,wy=(e.clientY-r.top-v.panY)/v.zoom,dx=(wx-d.startWorldX)/TRAVEL_BASE_W*100,dy=(wy-d.startWorldY)/TRAVEL_BASE_H*100;d.moved=d.moved||Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>3;for(const rec of d.initialPositions||[]){const n=m.nodes.find(x=>String(x.id)===String(rec.id));if(!n)continue;n.x=Math.round((rec.x+dx)*10)/10;n.y=Math.round((rec.y+dy)*10)/10;}travelBoardPerfMode(d.board,100);scheduleTravelDraggedNodesDOM(m,d.nodeIds,d.board);if((d.nodeIds||[]).length===1){const n=m.nodes.find(x=>String(x.id)===String(d.nodeId));if(n)broadcastTravelNodeLive(d.mapId,n.id,{x:n.x,y:n.y});}
}
function handleTravelPointerUp(e){
  const q=runtime.travelMarquee;if(q&&q.pointerId===e.pointerId){q.board?.classList.remove('selecting');q.board?.querySelector('[data-travel-marquee-box]')?.classList.remove('open');runtime.travelMarquee=null;const ids=travelMultiSelection(q.mapId);if(ids.length){runtime.travelEditorMapId=q.mapId;if(!ids.includes(String(runtime.travelSelectedNodeId||'')))runtime.travelSelectedNodeId=ids[0];}render();return;}
  const p=runtime.travelPan;if(p&&p.pointerId===e.pointerId){p.board?.classList.remove('panning');runtime.travelPan=null;if(!p.moved&&runtime.currentPlayer.role==='GM'&&!travelGMUsesPlayerRules()&&!runtime.travelConnectMode){travelClearMultiSelection(p.mapId);render();}return;}
  const d=runtime.travelDrag;if(!d||d.pointerId!==e.pointerId)return;d.board?.classList.remove('group-moving');runtime.travelDrag=null;if(d.moved){const s=travelSession(),m=s?.maps.find(x=>String(x.id)===String(d.mapId));if(m)travelEnsurePositiveOrigin(m,d.mapId);scheduleTravelSave(0,{applyBackground:false});render();}else{runtime.travelSelectedNodeId=d.nodeId;runtime.travelInspectorTab='NODES';render();focusTravelSelectedNodeName();}
}
function handleTravelWheel(e){const board=e.target?.closest?.('.travel-board[data-travel-board]');if(!board)return;e.preventDefault();travelBoardPerfMode(board,150);const v=travelBoardView(travelSession(),board.dataset.travelBoard),factor=e.deltaY<0?1.12:1/1.12;travelZoomAt(board.dataset.travelBoard,v.zoom*factor,e.clientX,e.clientY);}
function travelPreviewRecord(mapId,nodeId){const s=travelSession(),m=s?.maps.find(x=>x.id===mapId),n=m?.nodes.find(x=>x.id===nodeId),gm=runtime.currentPlayer.role==='GM';if(!m||!n||(!gm&&!travelKnownNode(s,mapId,nodeId)))return null;return {m,n,url:travelNodePreviewURL(m,n)};}
function moveTravelPreview(e){
  const pop=document.getElementById('travel-node-preview');if(!pop?.classList.contains('open'))return;
  runtime.travelPreviewMovePoint={x:Number(e?.clientX)||0,y:Number(e?.clientY)||0};
  if(runtime.travelPreviewMoveFrame)return;
  runtime.travelPreviewMoveFrame=requestAnimationFrame(()=>{runtime.travelPreviewMoveFrame=0;const pt=runtime.travelPreviewMovePoint;runtime.travelPreviewMovePoint=null;const live=document.getElementById('travel-node-preview');if(!pt||!live?.classList.contains('open'))return;const root=document.querySelector('.travel-v2103')?.getBoundingClientRect();if(!root)return;const w=260,h=230,x=pt.x-root.left+16,y=pt.y-root.top+16;live.style.left=`${Math.max(8,Math.min(root.width-w-8,x))}px`;live.style.top=`${Math.max(8,Math.min(root.height-h-8,y))}px`;});
}
function openTravelPreview(e,el){if(runtime.travelDrag||runtime.travelPan)return;const rec=travelPreviewRecord(el.dataset.travelMapNode,el.dataset.travelNode);if(!rec?.url)return;const pop=document.getElementById('travel-node-preview');if(!pop)return;pop.querySelector('[data-travel-preview-img]').src=rec.url;pop.querySelector('[data-travel-preview-img]').alt=rec.n.name;pop.querySelector('[data-travel-preview-title]').textContent=rec.n.name;pop.querySelector('[data-travel-preview-map]').textContent=rec.m.name;const detailEl=pop.querySelector('[data-travel-preview-detail]');if(detailEl)detailEl.textContent=rec.n.detail||'No GM detail';pop.classList.add('open');runtime.travelPreviewNodeKey=`${rec.m.id}|${rec.n.id}`;moveTravelPreview(e);}
function closeTravelPreview(){runtime.travelPreviewNodeKey='';document.getElementById('travel-node-preview')?.classList.remove('open');}
function handleTravelPreviewOver(e){const el=e.target?.closest?.('.travel-node[data-travel-preview="1"]');if(!el)return;if(e.relatedTarget&&el.contains(e.relatedTarget))return;openTravelPreview(e,el);}
function handleTravelPreviewOut(e){const el=e.target?.closest?.('.travel-node[data-travel-preview="1"]');if(!el)return;if(e.relatedTarget&&el.contains(e.relatedTarget))return;closeTravelPreview();}
function travelEditableTarget(el){const t=(el?.tagName||'').toLowerCase();return ['input','textarea','select'].includes(t)||el?.isContentEditable;}
function handleTravelKeyDown(e){if(runtime.view!=="travel")return;if(e.code==='Escape'&&runtime.travelConnectMode){runtime.travelConnectMode=false;runtime.travelConnectAnchor=null;render();e.preventDefault();return;}if(e.code==='Escape'&&runtime.travelMarquee){runtime.travelMarquee.board?.classList.remove('selecting');runtime.travelMarquee=null;render();e.preventDefault();return;}if(e.code==='Escape'&&Object.values(runtime.travelMultiSelected||{}).some(x=>Array.isArray(x)&&x.length)){travelClearMultiSelection();render();e.preventDefault();return;}if(travelEditableTarget(e.target))return;if(e.code==='Space'){runtime.travelSpaceDown=true;e.preventDefault();}}
function handleTravelKeyUp(e){if(e.code==='Space')runtime.travelSpaceDown=false;}
document.addEventListener('click',e=>{handleTravelClick(e).catch(err=>{console.error('travel click',err);notify(err?.message||'Travel action failed')})},true);
document.addEventListener('input',handleTravelInput,true);document.addEventListener('change',handleTravelInput,true);
document.addEventListener('contextmenu',handleGMShopGenerateContextMenu,true);document.addEventListener('contextmenu',handleTravelContextMenu,true);document.addEventListener('auxclick',e=>{if(e.button===1&&e.target?.closest?.('.travel-board')){e.preventDefault();e.stopPropagation();}},true);document.addEventListener('pointerdown',handleTravelPointerDown,true);document.addEventListener('pointermove',handleTravelPointerMove,true);document.addEventListener('pointerup',handleTravelPointerUp,true);document.addEventListener('wheel',handleTravelWheel,{capture:true,passive:false});document.addEventListener('keydown',handleTravelKeyDown,true);document.addEventListener('keyup',handleTravelKeyUp,true);document.addEventListener('pointerover',handleTravelPreviewOver,true);document.addEventListener('pointerout',handleTravelPreviewOut,true);
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#travel-node-context')&&!e.target.closest('.travel-node'))closeTravelNodeContext();if(!e.target.closest('#travel-board-context'))closeTravelBoardContext();},true);

document.addEventListener("contextmenu", handleMonsterTemplateContextMenu);
document.addEventListener("contextmenu", handleCodexContextMenu);
document.addEventListener("pointerdown", e => {
  const monsterMenu = document.getElementById("monster-template-context-menu");
  const codexMenu = document.getElementById("codex-context-menu");
  if (monsterMenu && !monsterMenu.contains(e.target)) closeMonsterTemplateContextMenu();
  if (codexMenu && !codexMenu.contains(e.target)) closeCodexContextMenu();
}, true);
window.addEventListener("blur", () => { closeMonsterTemplateContextMenu(); closeCodexContextMenu(); });

document.addEventListener("input", handleInput);
document.addEventListener("change", handleInput);
// v2.72: CHAT subtabs use a dedicated capture route so history/AI navigation cannot be swallowed by the large action delegate.
document.addEventListener("click", e => {
  const tab = e.target?.closest?.("button[data-chat-panel]");
  if (!tab || !tab.isConnected || (typeof e.button === "number" && e.button !== 0)) return;
  e.preventDefault();
  e.stopPropagation();
  switchChatPanel(tab.dataset.chatPanel || "chat");
}, true);

document.addEventListener("click", e => { handleClick(e).catch(err => { console.error("Fabula click action failed", err); showToast("ACTION ERROR", err?.message || "The action could not be completed", "message"); }); });
document.addEventListener("dragstart", handleDragStart);
document.addEventListener("dragover", handleDragOver);
document.addEventListener("dragenter", handleDragEnter);
document.addEventListener("dragleave", handleDragLeave);
document.addEventListener("drop", e => { handleDrop(e).catch(err => { console.error("Fabula drop failed", err); showToast("DRAG ERROR", err?.message || "Drag action failed", "message"); }); });
document.addEventListener("dragend", e => { handleDragEnd(e).catch(err => { console.error("Fabula drag delete failed", err); showToast("DELETE ERROR", err?.message || "Quick delete failed", "message"); }); });
window.addEventListener("wheel", handleDragWheel, { capture: true, passive: false });
document.addEventListener("toggle", e => {
  const details = e.target;
  if (!(details instanceof HTMLDetailsElement) || !details.matches("details[data-persist-details]")) return;
  if (!details.open) flushPendingDetailEdits(details);
}, true);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && (document.getElementById("monster-template-context-menu") || document.getElementById("codex-context-menu"))) { closeMonsterTemplateContextMenu(); closeCodexContextMenu(); return; }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("button[data-chat-panel]")) { e.preventDefault(); switchChatPanel(e.target.dataset.chatPanel || "chat"); return; }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-scene-current-toggle]")) { e.preventDefault(); runtime.sceneSummaryCollapsed = !runtime.sceneSummaryCollapsed; saveUIPrefs({ sceneSummaryCollapsed: runtime.sceneSummaryCollapsed }); render(); return; }
  if (e.target.matches("[data-chat-input]") && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
  if (e.target.matches("[data-ai-input]") && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askFabulaAi(); }
  if (e.target.matches("[data-quick-input]") && e.key === "Enter") { e.preventDefault(); e.target.blur(); }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-remote-clock-general],[data-remote-clock],[data-scene-clock-progress],[data-remote-zero-progress]")) { e.preventDefault(); handleClick({ target: e.target }).catch(console.error); }
});

// v2.116: register Owlbear onReady before the first full render. A player-specific
// render/local-state exception must never prevent the connection callback from being installed.
initOBR();
Promise.resolve(applyUISize(runtime.uiSizeMode, false)).catch(e=>console.warn("initial ui size",e));
try { render(); } catch (e) { console.error("initial render failed", e); const host=document.getElementById("app"); if(host)host.innerHTML=`<main class="shell"><header class="topbar"><div class="brand">FABULA<small>LYNX EDITION · V3.0.50</small></div><div class="top-actions"><span class="offline">● CONNECTING · UI RECOVERY</span></div></header><section class="workspace"><div class="empty big">Recovering room connection…</div></section></main>`; }
scheduleGMShopStockWarmup();
