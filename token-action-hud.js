import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

const NS = "com.lynx.fabula-unified";
const META_KEY = `${NS}/sheet`;
const SCENE_MONSTERS_KEY = `${NS}/scene-monsters-v1`;
const SCENE_PLAYER_SHEETS_KEY = `${NS}/scene-player-sheets-v1`;
const SCENE_COMBAT_KEY = `${NS}/scene-combat-v1`;
const SCENE_GUARD_COVER_KEY = `${NS}/guard-cover-v1`;
const CHANNEL = `${NS}/events`;
const HUD_POPOVER_ID = `${NS}/token-action-hud-main-v1`;
const HUD_ORIGIN = "TOKEN_ACTION_HUD";
const HUD_LOCAL_RESULT_KEY = `${NS}/token-action-hud-local-result-v1`;
const MONSTER_INSTANCE_RULES_KEY = `${NS}/monster-instance-rules-v1`;
const ATTRS = ["DEX","INS","MIG","WLP"];
const DIE_STEPS = [6,8,10,12];
const STATUS_NAMES = ["slow","enraged","dazed","weak","poisoned","shaken"];
const STATUS_PENALTIES = {
  slow:{DEX:1}, enraged:{DEX:1,INS:1}, dazed:{INS:1}, weak:{MIG:1}, poisoned:{MIG:1,WLP:1}, shaken:{WLP:1}
};
const MONSTER_RANKS = ["Soldier","Elite","Champion 1","Champion 2","Champion 3","Champion 4","Champion 5","Champion 6"];
const VILLAIN_TYPES = ["none","minor","major","supreme"];
const VILLAIN_TYPE_LABELS = {none:"None Villain",minor:"Minor Villain",major:"Major Villain",supreme:"Supreme Villain"};
const VILLAIN_UP_MAX = {none:0,minor:5,major:10,supreme:15};
const ELEMENTS = ["physical","air","bolt","dark","earth","fire","ice","light","poison"];
const AFFINITY_VALUES = ["VULNERABILITY","NORMAL","RESISTANCE","IMMUNITY","ABSORPTION"];
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
const sameId = (a, b) => String(a ?? "") === String(b ?? "");
const esc = (v="") => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const clamp = (n,a,b) => Math.max(a,Math.min(b,Number(n)||0));
const deepClone = x => x == null ? x : JSON.parse(JSON.stringify(x));
function setByPathLocal(obj,path,value){const parts=String(path||"").split(".").filter(Boolean);let cur=obj;for(let i=0;i<parts.length-1;i++){const k=parts[i];if(cur[k]==null||typeof cur[k]!=="object")cur[k]={};cur=cur[k]}if(parts.length)cur[parts.at(-1)]=value}

let me = {id:"",name:"",role:"PLAYER"};
let party = [];
let selfMetadata = {};
let sceneMetadata = {};
const HUD_PARAMS = new URLSearchParams(location.search);
let actorTokenId = HUD_PARAMS.get("token") || "";
const HUD_MODE = HUD_PARAMS.get("mode") || "";
const LIMITED_MONSTER_MODE = HUD_MODE === "hinder-study";
const PINNED_MONSTER_ID = HUD_PARAMS.get("monster") || "";
let activeTab = "actions";
let pendingAction = null;
let guardTargetPrompt = null;
let latestRoll = null;
let toastTimer = null;
let renderTimer = null;
let currentActorCache = null;
let statsOpen = false;
let localResultBus = null;

function blankSheet(name="CHARACTER") {
  return {name,deleted:false,portrait:"",linkedTokenId:"",hp:{current:0,max:0},mp:{current:0,max:0},ip:{current:0,max:0},fp:0,attributes:{DEX:8,INS:8,MIG:8,WLP:8},attributeBuffs:{DEX:0,INS:0,MIG:0,WLP:0},statuses:{},defenseMod:"",magicDefenseMod:"",inventory:[],actions:[],lists:{bonds:[],arcana:[]},updatedAt:0};
}
function normalizeSheet(raw,name="CHARACTER") {
  const d=blankSheet(name), s=raw||{};
  return {
    ...d,...s,
    hp:{...d.hp,...(s.hp||{})},mp:{...d.mp,...(s.mp||{})},ip:{...d.ip,...(s.ip||{})},
    attributes:{...d.attributes,...(s.attributes||{})},attributeBuffs:{...d.attributeBuffs,...(s.attributeBuffs||{})},
    statuses:{...d.statuses,...(s.statuses||{})},inventory:Array.isArray(s.inventory)?s.inventory:[],actions:Array.isArray(s.actions)?s.actions:[],
    lists:{...d.lists,...(s.lists||{})}
  };
}
function bestRaw(...candidates) {
  return candidates.filter(Boolean).sort((a,b)=>(Number(b?.updatedAt)||0)-(Number(a?.updatedAt)||0))[0] || null;
}
function registryRecord(id) { return sceneMetadata?.[SCENE_PLAYER_SHEETS_KEY]?.[id] || null; }
function loadMonsterInstanceRules() { try { const v=JSON.parse(localStorage.getItem(MONSTER_INSTANCE_RULES_KEY)||"{}"); return v&&typeof v==="object"&&!Array.isArray(v)?v:{}; } catch { return {}; } }
function partyPlayer(id) { return party.find(p=>String(p.id)===String(id)); }
function playerSheet(id) {
  const p=partyPlayer(id), reg=registryRecord(id);
  const own=String(id)===String(me.id) ? selfMetadata?.[META_KEY] : null;
  const raw=bestRaw(own,p?.metadata?.[META_KEY],reg?.sheet);
  return raw && !raw.deleted ? normalizeSheet(raw,p?.name||reg?.ownerName||"CHARACTER") : null;
}
// V3.0.3: the restricted Monster HUD must never silently disable Study just because
// the current Player sheet is stored under a legacy/offline registry key. Resolve the
// current user's sheet by ownerId as well as the normal direct key. If no persisted
// sheet is available, return a safe transient d8 sheet so ROLL STUDY still responds
// instead of rendering an apparently enabled but actually disabled button.
function limitedStudyPlayerSheet() {
  const direct=playerSheet(me.id);
  if(direct) return direct;
  const registry=sceneMetadata?.[SCENE_PLAYER_SHEETS_KEY]||{};
  const fallback=Object.values(registry).find(rec=>sameId(rec?.ownerId,me.id) && rec?.sheet && !rec.sheet.deleted);
  const partyRaw=partyPlayer(me.id)?.metadata?.[META_KEY];
  const raw=bestRaw(selfMetadata?.[META_KEY],partyRaw,fallback?.sheet);
  if(raw && !raw.deleted) return normalizeSheet(raw,partyPlayer(me.id)?.name||fallback?.ownerName||me.name||"CHARACTER");
  const transient=blankSheet(me.name||"CHARACTER");
  transient._studyFallback=true;
  return transient;
}
function allPlayerIds() {
  const set=new Set(party.map(p=>String(p.id)));
  for(const id of Object.keys(sceneMetadata?.[SCENE_PLAYER_SHEETS_KEY]||{})) set.add(String(id));
  set.add(String(me.id));
  return [...set];
}
function normalizeMonsterRank(value) {
  const v=String(value||"Soldier").trim();
  if(v==="Elite") return "Elite";
  const m=v.match(/^Champion\s*([1-6])$/i);
  return m?`Champion ${m[1]}`:"Soldier";
}
function monsterRankInfo(value) {
  const rank=normalizeMonsterRank(value);
  if(rank==="Elite") return {rank,hpMultiplier:2,mpMultiplier:1,mpBonus:0,turns:2,initiativeBonus:2};
  const m=rank.match(/^Champion ([1-6])$/);
  if(m){const x=Number(m[1]);return {rank,hpMultiplier:x,mpMultiplier:2,mpBonus:0,turns:x,initiativeBonus:x}}
  return {rank:"Soldier",hpMultiplier:1,mpMultiplier:1,mpBonus:0,turns:1,initiativeBonus:0};
}
function normalizeVillainType(value){const v=String(value||"none").toLowerCase();return VILLAIN_TYPES.includes(v)?v:"none"}
function monsterPhaseIndex(raw){const phases=Array.isArray(raw?.phases)?raw.phases:[];return Math.max(0,Math.min(Number(raw?.activePhase)||0,phases.length))}
function monsterPhaseTarget(raw){const idx=monsterPhaseIndex(raw),phases=Array.isArray(raw?.phases)?raw.phases:[];return idx?(phases[idx-1]||raw):raw}
function monsterPhaseLabel(raw){const idx=monsterPhaseIndex(raw);return idx?String(raw?.phases?.[idx-1]?.label||`PHASE ${idx+1}`):"BASE"}
function monsterBaseMax(raw,key){const v=monsterPhaseTarget(raw);if(!v)return 0;const level=Math.max(1,Number(v.level)||1),mod=Number(v?.[`${key}Mod`])||0;if(key==="hp")return Math.max(0,Math.round(level*2+(Number(v.attributes?.MIG)||8)*5+mod));if(key==="mp")return Math.max(0,Math.round(level+(Number(v.attributes?.WLP)||8)*5+mod));return 0}
function monsterEffectiveMax(raw,key){const base=monsterBaseMax(raw,key),info=monsterRankInfo(monsterPhaseTarget(raw)?.rank);if(key==="hp")return Math.max(0,Math.round(base*info.hpMultiplier));if(key==="mp")return Math.max(0,Math.round(base*info.mpMultiplier+info.mpBonus));return base}
function syncMonsterRules(raw){
  if(!raw)return raw;raw.rank=normalizeMonsterRank(raw.rank);for(const p of Array.isArray(raw.phases)?raw.phases:[])p.rank=normalizeMonsterRank(p.rank);
  raw.villainType=normalizeVillainType(raw.villainType);raw.up||={current:0,max:0};raw.up.max=VILLAIN_UP_MAX[raw.villainType]||0;raw.up.current=raw.up.max?clamp(raw.up.current,0,raw.up.max):0;
  raw.ip||={current:0,max:0};raw.ip.max=Math.max(0,Number(raw.ip.max)||0);raw.ip.current=clamp(raw.ip.current,0,raw.ip.max);raw.fp=Math.max(0,Number(raw.fp)||0);
  for(const key of ["hp","mp"]){raw[key]||={current:0,max:0,baseMax:0};const oldMax=Math.max(0,Number(raw[key].max)||0),oldCur=Math.max(0,Number(raw[key].current)||0),full=oldMax>0&&oldCur>=oldMax;raw[key].baseMax=monsterBaseMax(raw,key);const next=monsterEffectiveMax(raw,key);raw[key].max=next;raw[key].current=full?next:clamp(oldCur,0,next)}
  raw.statuses||=Object.fromEntries(STATUS_NAMES.map(k=>[k,false]));raw.statusImmunities||=Object.fromEntries(STATUS_NAMES.map(k=>[k,false]));raw.attributeBuffs||=Object.fromEntries(ATTRS.map(k=>[k,0]));
  return raw;
}
function monsterPhaseView(raw) {
  if(!raw) return null;
  const phases=Array.isArray(raw.phases)?raw.phases:[];
  const idx=monsterPhaseIndex(raw);
  const phase=idx?phases[idx-1]:null;
  if(!phase) return raw;
  return {...raw,...phase,id:raw.id,faction:raw.faction,hp:raw.hp,mp:raw.mp,ip:raw.ip,up:raw.up,fp:raw.fp,statuses:raw.statuses,statusImmunities:raw.statusImmunities,attributeBuffs:raw.attributeBuffs,villainType:raw.villainType,linkedTokenId:raw.linkedTokenId,phases:raw.phases,activePhase:raw.activePhase};
}
function canControl(kind,id) {
  if(me.role==="GM") return kind==="player"||kind==="monster";
  return kind==="player" && String(id)===String(me.id);
}
function actorByTokenId(tokenId) {
  const wanted=String(tokenId||""); if(!wanted) return null;
  for(const id of allPlayerIds()) {
    const sh=playerSheet(id); if(!sh || String(sh.linkedTokenId||"")!==wanted || !canControl("player",id)) continue;
    const p=partyPlayer(id), reg=registryRecord(id);
    return {kind:"player",id:String(id),tokenId:wanted,name:sh.name||p?.name||reg?.ownerName||"CHARACTER",sheet:sh,raw:sh,portrait:sh.portrait||""};
  }
  if(me.role==="GM" || LIMITED_MONSTER_MODE) {
    const privateRules=me.role==="GM" ? loadMonsterInstanceRules() : {};
    for(const sceneRaw of Array.isArray(sceneMetadata?.[SCENE_MONSTERS_KEY])?sceneMetadata[SCENE_MONSTERS_KEY]:[]) {
      if(String(sceneRaw.linkedTokenId||"")!==wanted) continue;
      if(PINNED_MONSTER_ID && !sameId(sceneRaw.id, PINNED_MONSTER_ID)) continue;
      const raw=me.role==="GM"
        ? {...sceneRaw,specialRules:deepClone(privateRules?.[sceneRaw.id]||sceneRaw.specialRules||[])}
        : {...sceneRaw,specialRules:[]};
      const sh=monsterPhaseView(raw);
      return {kind:"monster",id:String(raw.id),tokenId:wanted,name:sh?.name||raw.name||"MONSTER",sheet:sh,raw,portrait:sh?.portrait||raw.portrait||"",limited:me.role!=="GM"};
    }
  }
  return null;
}
function currentActor() { currentActorCache=actorByTokenId(actorTokenId); return currentActorCache; }
function currentDie(sheet,attr) {
  const base=Number(sheet?.attributes?.[attr])||8;
  let idx=DIE_STEPS.indexOf(base); if(idx<0) idx=1;
  let penalty=0;
  for(const [status,on] of Object.entries(sheet?.statuses||{})) if(on) penalty+=STATUS_PENALTIES[status]?.[attr]||0;
  idx=clamp(idx+(Number(sheet?.attributeBuffs?.[attr])||0)-penalty,0,DIE_STEPS.length-1);
  return DIE_STEPS[idx];
}
function defenseModifierResult(raw,base) {
  const t=String(raw??"").trim(); if(!t) return Math.max(0,Number(base)||0);
  if(/^[+-]\d+$/.test(t)) return Math.max(0,(Number(base)||0)+Number(t));
  if(/^\d+$/.test(t)) return Math.max(0,Number(t));
  return Math.max(0,Number(base)||0);
}
function defenseValue(sheet,kind="defense") {
  const attr=kind==="magicDefense"?"INS":"DEX", modKey=kind==="magicDefense"?"magicDefenseMod":"defenseMod";
  return defenseModifierResult(sheet?.[modKey],currentDie(sheet,attr));
}
function activeStatuses(sheet) {
  const out=STATUS_NAMES.filter(k=>sheet?.statuses?.[k]);
  const max=Number(sheet?.hp?.max)||0,cur=Number(sheet?.hp?.current)||0;
  if(max>0&&cur>0&&cur<=max/2) out.push("crisis");
  return out;
}
function normalizeActionType(v="") {
  const t=String(v||"").trim().toUpperCase();
  if(t.includes("TWO")&&t.includes("WEAPON")) return "TWO WEAPON";
  if(t.includes("SPELL")) return "SPELL";
  if(t.includes("RANGE")) return "RANGE ATTACK";
  if(t.includes("MELEE")) return "MELEE ATTACK";
  if(t==="GUARD") return "GUARD";
  if(t==="COVER ALLY"||t==="COVER") return "COVER ALLY";
  return t||"OTHER";
}
function attackDefenseKind(category){return category==="SPELL"?"magicDefense":["MELEE ATTACK","RANGE ATTACK","TWO WEAPON"].includes(category)?"defense":""}
function attackHitsDefense(total,defense,critical,fumble){return !fumble&&(critical||total>=defense)}
function actionBadgeClass(v="") { const t=normalizeActionType(v); return t==="TWO WEAPON"?"two":t==="SPELL"?"spell":t==="GUARD"?"guard":t==="COVER ALLY"?"cover":""; }
function isTwoWeapon(a) { return normalizeActionType(a?.category)==="TWO WEAPON"; }
function isGuardAction(a){return normalizeActionType(a?.category)==="GUARD"}
function isCoverAction(a){return normalizeActionType(a?.category)==="COVER ALLY"}
function isGuardFamily(a){return isGuardAction(a)||isCoverAction(a)}
function mediaFromText(text="") {
  const m=String(text||"").match(/https?:\/\/[^\s<>"']+?(?:\.gif|\.png|\.jpe?g|\.webp)(?:\?[^\s<>"']*)?/i);
  if(m) return m[0];
  const any=String(text||"").match(/https?:\/\/[^\s<>"']+/i); return any?any[0]:"";
}
function stripMediaUrls(text="") { return String(text||"").replace(/https?:\/\/[^\s<>"']+/gi,"").replace(/\n{3,}/g,"\n\n").trim(); }
function cardArt(item) {
  return item?.linkedTokenArt?.image?.url || item?.linkedTokenArt?.url || item?.tokenLink || mediaFromText(item?.detail||"") || "";
}
function parseCost(text="") {
  const src=String(text||""), out={hp:0,mp:0,ip:0,fp:0,up:0};
  for(const key of Object.keys(out)) {
    const u=key.toUpperCase();
    const m=new RegExp(`\\b${u}\\s*(?:[:=x×-]\\s*)?(\\d+)\\b`,"i").exec(src)||new RegExp(`\\b(\\d+)\\s*${u}\\b`,"i").exec(src);
    if(m) out[key]=Math.max(0,Math.floor(Number(m[1])||0));
  }
  return out;
}
function hasCost(c){return Object.values(c||{}).some(v=>Number(v)>0)}
function signed(n){n=Number(n)||0;return n>0?`+${n}`:`${n}`}
function monsterAdjustmentLevel(value){return clamp(Math.round(Number(value)||5),5,60)}
function monsterCheckTier(level){const lv=monsterAdjustmentLevel(level);return lv>=60?6:Math.max(0,Math.floor(lv/10))}
function monsterDamageTier(level){const lv=monsterAdjustmentLevel(level);return lv>=60?15:lv>=40?10:lv>=20?5:0}
function monsterLevelAccuracyBonus(normalLevel,desiredLevel){return monsterCheckTier(desiredLevel)-monsterCheckTier(normalLevel)}
function monsterLevelDamageBonus(normalLevel,desiredLevel){return monsterDamageTier(desiredLevel)-monsterDamageTier(normalLevel)}

function initLocalResultBus(){
  if(localResultBus || !me.id) return;
  try { if (typeof BroadcastChannel !== "undefined") localResultBus = new BroadcastChannel(`${HUD_LOCAL_RESULT_KEY}:${me.id}`); } catch(e){ console.warn("hud local bus init",e); }
}
function sendLocalResult(envelope){
  initLocalResultBus();
  const localEnvelope={...envelope,_localEventId:`${envelope?.[envelope?.type]?.id||uid()}:${Date.now()}`};
  try {
    if(localResultBus) localResultBus.postMessage(localEnvelope);
    else localStorage.setItem(`${HUD_LOCAL_RESULT_KEY}:${me.id}`,JSON.stringify(localEnvelope));
  } catch(e){ console.warn("hud local result",e); }
}
async function broadcast(type,payload){
  const tagged = { ...(payload || {}), origin: HUD_ORIGIN };
  const envelope={type,origin:HUD_ORIGIN,[type]:tagged};
  // Roll/share results need deterministic same-player delivery between the main-canvas
  // HUD iframe, the action iframe and the background iframe. Native same-origin IPC
  // handles that path; Owlbear broadcast is reserved for remote room members.
  if(type==="roll" || type==="share" || type==="skill-cutin") sendLocalResult(envelope);
  try {
    await OBR.broadcast.sendMessage(CHANNEL,envelope,{destination:(type==="roll"||type==="share"||type==="skill-cutin")?"REMOTE":"ALL"});
    return true;
  } catch(e){ console.warn("hud broadcast",e); return false; }
}
async function refreshData() {
  try {
    me={id:OBR.player.id,name:await OBR.player.getName(),role:await OBR.player.getRole()};
    [party,selfMetadata,sceneMetadata]=await Promise.all([OBR.party.getPlayers(),OBR.player.getMetadata(),OBR.scene.isReady().then(r=>r?OBR.scene.getMetadata():{})]);
  } catch(e){console.warn("HUD refresh",e)}
}
function scheduleRender(delay=20){clearTimeout(renderTimer);renderTimer=setTimeout(async()=>{await refreshData();render();},delay)}
function showToast(text){const host=document.querySelector(".toast");if(!host)return;host.innerHTML=`<span>${esc(text)}</span>`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{if(host)host.innerHTML=""},1600)}

function resourceBox(key,label,current,max=null){
  const cur=Math.max(0,Number(current)||0), mx=max==null?null:Math.max(0,Number(max)||0);
  return `<div class="resource ${key}"><span>${label}</span><div class="resource-value"><b>${cur}${mx==null?"":`/${mx}`}</b></div><div class="resource-command"><input data-resource-command="${key}" inputmode="text" autocomplete="off" placeholder="+10 / -5 / ${cur}"><button data-resource-apply="${key}" title="Apply">↵</button></div></div>`;
}
function resourcesHTML(actor){
  const raw=actor.raw||{}, sh=actor.sheet||{};
  const hp=raw.hp||sh.hp,mp=raw.mp||sh.mp,ip=raw.ip||sh.ip,fp=raw.fp??sh.fp??0,up=raw.up||sh.up||{current:0,max:0};
  const pools=actor.kind==="monster"
    ? `${resourceBox("hp","HP",hp?.current,hp?.max)}${resourceBox("mp","MP",mp?.current,mp?.max)}${resourceBox("up","UP",up?.current,up?.max)}`
    : `${resourceBox("hp","HP",hp?.current,hp?.max)}${resourceBox("mp","MP",mp?.current,mp?.max)}${resourceBox("ip","IP",ip?.current,ip?.max)}${resourceBox("fp","FP",fp,null)}`;
  return `${pools}<div class="defenses"><span>DEF<b>${defenseValue(sh,"defense")}</b></span><span>M.DEF<b>${defenseValue(sh,"magicDefense")}</b></span></div><button class="stats-btn" data-stats-open><span>${actor.kind==="monster"?"MONSTER SETUP":"STATS"}</span><b>${actor.kind==="monster"?"PROFILE + COMBAT":"ATTR + STATUS"}</b></button>`;
}
function actionFormula(a,sh){
  if(isGuardAction(a))return "RESIST ALL DAMAGE · OPPOSED +2";
  if(isCoverAction(a))return "GUARD + COVER 1 ALLY · BLOCK ENEMY MELEE";
  if(String(a?.mode||"ROLL").toUpperCase()!=="ROLL") return "NO ROLL";
  const mod=Number(a.mod)||0, bonus=Number(a.damageHR)||0, tw=isTwoWeapon(a);
  return `${a.attr1||"DEX"} d${currentDie(sh,a.attr1||"DEX")} + ${a.attr2||"INS"} d${currentDie(sh,a.attr2||"INS")}${mod?` ${signed(mod)}`:""} → ${tw?`HR 0${bonus?` · BONUS ${signed(bonus)}`:""}`:`HR${bonus?` ${signed(bonus)}`:""}`}`;
}
function actionRow(a,i,count,actor){
  const type=normalizeActionType(a.category),mode=String(a.mode||"ROLL").toUpperCase();
  return `<div class="action-row" data-action-index="${i}" data-preview-kind="action" data-preview-index="${i}"><div class="action-main"><span class="badge ${actionBadgeClass(type)}">${esc(type)}</span><b>${esc(a.name||"ACTION")}</b><small>${esc(actionFormula(a,actor.sheet))}</small></div><div class="row-actions"><button data-move="${i}|-1" ${i<=0?"disabled":""}>▲</button><button data-move="${i}|1" ${i>=count-1?"disabled":""}>▼</button><button class="primary" data-use-action="${i}">${isGuardFamily(a)?"USE":mode==="ROLL"?"ROLL":"USE"}</button></div></div>`;
}
function previewSelection(){
  const hovered=document.querySelector("[data-preview-kind]:hover");
  const kind=hovered?.dataset.previewKind || document.body.dataset.previewKind || "";
  let idx=hovered?Number(hovered.dataset.previewIndex):-1;
  if(!Number.isInteger(idx)||idx<0) idx=Number(document.body.dataset.previewIndex||-1);
  return {kind,idx};
}
function previewHTML(actor){
  const {kind,idx}=previewSelection();
  if(!actor||!kind||!Number.isInteger(idx)||idx<0) return `<div class="action-preview"></div>`;
  if(kind==="action") {
    const a=actor?.sheet?.actions?.[idx]; if(!a) return `<div class="action-preview"></div>`;
    const media=mediaFromText(a.note||"");
    return `<div class="action-preview"><div class="preview-kicker">ACTION PREVIEW</div>${media?`<div class="preview-media"><img src="${esc(media)}" alt=""></div>`:`<div class="preview-media"><span>◆</span></div>`}<h3>${esc(a.name||"ACTION")}</h3><div class="preview-tags"><span class="badge ${actionBadgeClass(a.category)}">${esc(normalizeActionType(a.category))}</span><span class="badge">${esc((a.element||"none").toUpperCase())}</span></div><div class="preview-formula">${esc(actionFormula(a,actor.sheet))}</div><div class="preview-meta">${a.cost?`<span><b>COST</b> · ${esc(a.cost)}</span>`:""}${a.target?`<span><b>TARGET</b> · ${esc(a.target)}</span>`:""}${a.actionTypeText?`<span><b>TYPE</b> · ${esc(a.actionTypeText)}</span>`:""}</div><div class="preview-desc">${esc(stripMediaUrls(a.note||"")||"NO DESCRIPTION")}</div></div>`;
  }
  if(kind==="item") {
    const x=actor?.sheet?.inventory?.[idx]; if(!x) return `<div class="action-preview"></div>`;
    const media=cardArt(x);
    return `<div class="action-preview"><div class="preview-kicker">ITEM PREVIEW</div>${media?`<div class="preview-media"><img src="${esc(media)}" alt=""></div>`:`<div class="preview-media"><span>▣</span></div>`}<h3>${esc(x.name||"ITEM")}</h3><div class="preview-tags"><span class="badge">${esc(x.itemType||"ITEM")}</span></div><div class="preview-meta">${Number(x.purchasePrice)>0?`<span><b>PRICE</b> · ${Number(x.purchasePrice).toLocaleString()}z</span>`:""}</div><div class="preview-desc">${esc(stripMediaUrls(x.detail||"")||"NO DESCRIPTION")}</div></div>`;
  }
  if(kind==="arcana") {
    const x=actor?.sheet?.lists?.arcana?.[idx]; if(!x) return `<div class="action-preview"></div>`;
    const media=cardArt(x);
    return `<div class="action-preview"><div class="preview-kicker">ARCANA PREVIEW</div>${media?`<div class="preview-media"><img src="${esc(media)}" alt=""></div>`:`<div class="preview-media"><span>✦</span></div>`}<h3>${esc(x.name||"ARCANA")}</h3><div class="preview-tags"><span class="badge spell">ARCANA</span></div>${x.cost?`<div class="preview-formula">COST · ${esc(x.cost)}</div>`:""}<div class="preview-desc">${esc(stripMediaUrls(x.detail||"")||"NO DESCRIPTION")}</div></div>`;
  }
  if(kind==="special-rule") {
    const x=actor?.raw?.specialRules?.[idx]; if(!x) return `<div class="action-preview"></div>`;
    const media=mediaFromText(x.detail||"");
    return `<div class="action-preview special-rule-preview"><div class="preview-kicker">SPECIAL RULE · GM ONLY</div>${media?`<div class="preview-media"><img src="${esc(media)}" alt=""></div>`:`<div class="preview-media"><span>◆</span></div>`}<h3>${esc(x.name||`SPECIAL RULE ${idx+1}`)}</h3><div class="preview-tags"><span class="badge">SPECIAL RULE</span><span class="badge">GM ONLY</span></div><div class="preview-desc">${esc(stripMediaUrls(x.detail||"")||"NO DESCRIPTION")}</div></div>`;
  }
  return `<div class="action-preview"></div>`;
}
function guardCoverState(md=sceneMetadata){const raw=md?.[SCENE_GUARD_COVER_KEY]||{};return{revision:Math.max(0,Number(raw.revision)||0),entries:(Array.isArray(raw.entries)?raw.entries:[]).filter(x=>x&&x.guardTokenId),uses:raw.uses&&typeof raw.uses==="object"?{...raw.uses}:{}}}
function combatSide(kind,sheet){return kind==="player"||sheet?.faction==="ally"?"ally":"enemy"}
function actionsHTML(actor){const arr=actor.sheet?.actions||[];return arr.length?`<div class="action-list">${arr.map((a,i)=>actionRow(a,i,arr.length,actor)).join("")}</div>`:`<div class="empty">NO PREPARED ACTIONS</div>`}
function itemsHTML(actor){
  if(actor.kind!=="player") return `<div class="empty">MONSTER SHEETS DO NOT HAVE PLAYER ITEMS</div>`;
  const arr=actor.sheet?.inventory||[]; if(!arr.length)return `<div class="empty">NO ITEMS</div>`;
  return `<div class="item-list">${arr.map((x,i)=>{const art=cardArt(x);return `<div class="item-row" data-preview-kind="item" data-preview-index="${i}"><div class="item-art">${art?`<img src="${esc(art)}" alt="">`:"ITEM"}</div><div class="item-copy"><b>${esc(x.name||"ITEM")}</b><small>${esc(x.itemType||"ITEM")}</small><p>${esc(stripMediaUrls(x.detail||"")||"NO DESCRIPTION")}</p></div><button class="use-btn" data-use-item="${i}">USE</button></div>`}).join("")}</div>`;
}
function arcanaHTML(actor){
  if(actor.kind!=="player") return `<div class="empty">MONSTER SHEETS DO NOT HAVE PLAYER ARCANA</div>`;
  const arr=actor.sheet?.lists?.arcana||[]; if(!arr.length)return `<div class="empty">NO ARCANA</div>`;
  return `<div class="arcana-list">${arr.map((x,i)=>{const art=cardArt(x);return `<div class="arcana-row" data-preview-kind="arcana" data-preview-index="${i}"><div class="arcana-art">${art?`<img src="${esc(art)}" alt="">`:`<span>ARC</span>`}</div><div class="arcana-copy"><b>${esc(x.name||"ARCANA")}</b>${x.cost?`<small>COST · ${esc(x.cost)}</small>`:""}<p>${esc(stripMediaUrls(x.detail||"")||"NO DESCRIPTION")}</p></div><button class="use-btn arcana-send" data-use-arcana="${i}">SEND</button></div>`}).join("")}</div>`;
}
function specialRulesHTML(actor){
  if(actor.kind!=="monster") return `<div class="empty">SPECIAL RULE IS MONSTER ONLY</div>`;
  const arr=Array.isArray(actor.raw?.specialRules)?actor.raw.specialRules:[];
  if(!arr.length)return `<div class="empty">NO SPECIAL RULES<br><small>GM ONLY · ADD OR EDIT RULES FROM THE MONSTER SHEET</small></div>`;
  return `<div class="special-rule-list">${arr.map((x,i)=>{const media=mediaFromText(x.detail||"");return `<div class="special-rule-row" data-preview-kind="special-rule" data-preview-index="${i}"><div class="special-rule-art">${media?`<img src="${esc(media)}" alt="">`:`<span>SR</span>`}</div><div class="special-rule-copy"><b>${esc(x.name||`SPECIAL RULE ${i+1}`)}</b><small>GM ONLY</small><p>${esc(stripMediaUrls(x.detail||"")||"NO DESCRIPTION")}</p></div></div>`}).join("")}</div>`;
}
function dieOptions(value){const v=Number(value)||8;return DIE_STEPS.map(d=>`<option value="${d}" ${d===v?"selected":""}>d${d}</option>`).join("")}
function monsterProfileOptions(actor){
  const raw=actor.raw||{},sh=actor.sheet||{},rank=normalizeMonsterRank(sh.rank),villain=normalizeVillainType(raw.villainType);
  const rankOpts=MONSTER_RANKS.map(x=>`<option value="${esc(x)}" ${x===rank?"selected":""}>${esc(x)}</option>`).join("");
  const villainOpts=VILLAIN_TYPES.map(x=>`<option value="${x}" ${x===villain?"selected":""}>${esc(VILLAIN_TYPE_LABELS[x])}</option>`).join("");
  return `<div class="monster-profile-grid"><label>VILLAIN TYPE<select data-monster-profile="villainType">${villainOpts}</select></label><label>NORMAL LEVEL<input type="number" min="5" max="60" data-monster-profile="normalLevel" value="${Number(sh.normalLevel??sh.level)||5}"></label><label>DESIRED LEVEL<input type="number" min="5" max="60" data-monster-profile="level" value="${Number(sh.level)||5}"></label><label>RANK<select data-monster-profile="rank">${rankOpts}</select></label><label>SPECIES<input data-monster-profile="species" value="${esc(sh.species||"")}" placeholder="Species"></label><label>INITIATIVE<input type="number" data-monster-profile="initiative" value="${Number(sh.initiative)||0}"></label></div>`;
}
function monsterAffinityControls(actor){const sh=actor.sheet||{};return `<div class="monster-affinity-grid">${ELEMENTS.map(e=>{const v=String(sh.affinities?.[e]||"NORMAL").toUpperCase();return `<label><span>${e.toUpperCase()}</span><select data-monster-affinity="${e}">${AFFINITY_VALUES.map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("")}</select></label>`}).join("")}</div>`}
function monsterStatsOverlayHTML(actor){
  const raw=actor.raw||{},sh=actor.sheet||{},rankInfo=monsterRankInfo(sh.rank),phase=monsterPhaseLabel(raw),acc=monsterLevelAccuracyBonus(sh.normalLevel??sh.level,sh.level),dmg=monsterLevelDamageBonus(sh.normalLevel??sh.level,sh.level);
  const statuses=STATUS_NAMES.map(k=>{const immune=!!raw.statusImmunities?.[k],on=!!raw.statuses?.[k];return `<button class="stats-status ${on?"on":""} ${immune?"immune":""}" data-stat-status="${k}" title="${immune?"IMMUNE · disable immunity before applying":"Toggle status"}">${k.toUpperCase()}${immune?" · IMU":""}</button>`}).join("");
  const immunities=STATUS_NAMES.map(k=>`<label class="monster-immunity ${raw.statusImmunities?.[k]?"on":""}"><input type="checkbox" data-monster-immunity="${k}" ${raw.statusImmunities?.[k]?"checked":""}><span>${k.toUpperCase()}</span></label>`).join("");
  const attrs=ATTRS.map(k=>`<label class="stats-attr"><span>${k}</span><select data-stat-attr="${k}">${dieOptions(sh.attributes?.[k])}</select><small>LIVE d${currentDie(sh,k)}</small></label>`).join("");
  const buffs=ATTRS.map(k=>`<div class="stats-buff"><b>${k} TEMP</b><div><button data-stat-buff="${k}|-1">−</button><span>${Number(raw.attributeBuffs?.[k])||0}</span><button data-stat-buff="${k}|1">+</button></div></div>`).join("");
  const upMax=Number(raw.up?.max)||0;
  return `<div class="stats-overlay monster-stats-overlay"><div class="stats-panel"><header><div><small>MONSTER TOKEN CONTROL · ${esc(phase)}</small><b>${esc(actor.name)} · MONSTER SETUP</b></div><button data-stats-close>×</button></header><section><h4>MONSTER PROFILE · CURRENT PHASE</h4>${monsterProfileOptions(actor)}<div class="monster-rule-strip"><span>TURNS <b>${rankInfo.turns}</b></span><span>CHECK ADJ <b>${signed(acc)}</b></span><span>DAMAGE ADJ <b>${signed(dmg)}</b></span><span>UP MAX <b>${upMax}</b></span></div></section><section><h4>MONSTER RESOURCE SETTINGS</h4><div class="monster-resource-settings"><label>HP MOD<input type="number" data-monster-profile="hpMod" value="${Number(sh.hpMod)||0}"></label><label>MP MOD<input type="number" data-monster-profile="mpMod" value="${Number(sh.mpMod)||0}"></label><label>IP MAX<input type="number" min="0" data-monster-shared="ip.max" value="${Number(raw.ip?.max)||0}"></label></div><div class="monster-auto-caps"><span>HP AUTO <b>${Number(raw.hp?.max)||0}</b><small>2×LV + 5×MIG + MOD · RANK</small></span><span>MP AUTO <b>${Number(raw.mp?.max)||0}</b><small>LV + 5×WLP + MOD · RANK</small></span></div></section><section><h4>BASE ATTRIBUTES · CURRENT PHASE</h4><div class="stats-attrs">${attrs}</div></section><section><h4>STATUS · SHARED ACROSS PHASES</h4><div class="stats-statuses">${statuses}</div><div class="monster-immunity-title">STATUS IMMUNITY</div><div class="monster-immunity-grid">${immunities}</div></section><section><h4>STATUS & TEMP MODIFIERS · SHARED</h4><div class="stats-buffs">${buffs}</div></section><section><h4>DEFENSE MODIFIERS · CURRENT PHASE</h4><div class="stats-defense-grid"><label>DEF MOD<input data-stat-defense="defenseMod" inputmode="text" value="${esc(sh.defenseMod||"")}" placeholder="+2 / -1 / 12"></label><label>M.DEF MOD<input data-stat-defense="magicDefenseMod" inputmode="text" value="${esc(sh.magicDefenseMod||"")}" placeholder="+2 / -1 / 12"></label></div><div class="stats-defense-now"><span>DEF <b>${defenseValue(sh,"defense")}</b></span><span>M.DEF <b>${defenseValue(sh,"magicDefense")}</b></span></div></section><section><h4>ELEMENT AFFINITY · CURRENT PHASE</h4>${monsterAffinityControls(actor)}</section><footer>Phase fields edit the active Monster Phase. Status, Temp Modifiers, Villain Type, IP, FP and UP remain shared exactly like the Monster Sheet.</footer></div></div>`;
}
function statsOverlayHTML(actor){
  if(!statsOpen||!actor)return"";if(actor.kind==="monster")return monsterStatsOverlayHTML(actor);const sh=actor.sheet||{};
  const statuses=STATUS_NAMES.map(k=>`<button class="stats-status ${sh.statuses?.[k]?"on":""}" data-stat-status="${k}">${k.toUpperCase()}</button>`).join("");
  const attrs=ATTRS.map(k=>`<label class="stats-attr"><span>${k}</span><select data-stat-attr="${k}">${dieOptions(sh.attributes?.[k])}</select><small>LIVE d${currentDie(sh,k)}</small></label>`).join("");
  const buffs=ATTRS.map(k=>`<div class="stats-buff"><b>${k} TEMP</b><div><button data-stat-buff="${k}|-1">−</button><span>${Number(sh.attributeBuffs?.[k])||0}</span><button data-stat-buff="${k}|1">+</button></div></div>`).join("");
  return `<div class="stats-overlay"><div class="stats-panel"><header><div><small>TOKEN SHEET CONTROL</small><b>${esc(actor.name)} · STATS</b></div><button data-stats-close>×</button></header><section><h4>BASE ATTRIBUTES</h4><div class="stats-attrs">${attrs}</div></section><section><h4>STATUS</h4><div class="stats-statuses">${statuses}</div></section><section><h4>STATUS & TEMP MODIFIERS</h4><div class="stats-buffs">${buffs}</div></section><section><h4>DEFENSE MODIFIERS</h4><div class="stats-defense-grid"><label>DEF MOD<input data-stat-defense="defenseMod" inputmode="text" value="${esc(sh.defenseMod||"")}" placeholder="+2 / -1 / 12"></label><label>M.DEF MOD<input data-stat-defense="magicDefenseMod" inputmode="text" value="${esc(sh.magicDefenseMod||"")}" placeholder="+2 / -1 / 12"></label></div><div class="stats-defense-now"><span>DEF <b>${defenseValue(sh,"defense")}</b></span><span>M.DEF <b>${defenseValue(sh,"magicDefense")}</b></span></div></section><footer>Changes sync to the linked Sheet immediately.</footer></div></div>`;
}
function attrOptions(sh,sel){return ATTRS.map(a=>`<option value="${a}" ${a===sel?"selected":""}>${a} · d${currentDie(sh,a)}</option>`).join("")}
function latestHTML(){if(!latestRoll)return "";const out=latestRoll.fumble?"FUMBLE":latestRoll.critical?"CRITICAL":latestRoll.double?"DOUBLE":"";const cls=out.toLowerCase();return `<div class="latest"><div class="latest-head"><small>LATEST RESULT</small><span class="outcome ${cls}">${out}</span></div><strong>${latestRoll.total}</strong><p>${esc(latestRoll.summary||"")}</p></div>`}
function rollsHTML(actor){return `<div class="roll-grid">${latestHTML()}<div class="quick-rolls"><button data-quick-roll="DEX|INS">DEX + INS</button><button data-quick-roll="INS|INS">INS + INS</button><button data-quick-roll="MIG|MIG">MIG + MIG</button><button data-quick-roll="WLP|WLP">WLP + WLP</button></div><div class="manual"><label>STAT A<select id="roll-a">${attrOptions(actor.sheet,"DEX")}</select></label><label>STAT B<select id="roll-b">${attrOptions(actor.sheet,"INS")}</select></label><label>MOD<input id="roll-mod" type="number" value="0"></label><label>NAME<input id="roll-label" value="Custom Check"></label><button class="roll-btn" data-manual-roll>ROLL CHECK</button></div></div>`}
function costOverlayHTML(actor){if(!pendingAction)return"";const a=actor.sheet?.actions?.[pendingAction.index];if(!a)return"";const c=pendingAction.costs,keys=actor.kind==="monster"?["hp","mp","up"]:["hp","mp","ip","fp"];return `<div class="cost-overlay"><div class="cost-head"><b>COST · ${esc(a.name||"ACTION")}</b><small>${esc(a.cost||"MANUAL")}</small></div><div class="cost-grid">${keys.map(k=>`<label>${k.toUpperCase()}<input type="number" min="0" data-cost="${k}" value="${Number(c[k])||0}"></label>`).join("")}</div><div class="cost-actions"><button data-cost-cancel>CANCEL</button><button class="confirm" data-cost-confirm>PAY & ${String(a.mode||"ROLL").toUpperCase()==="ROLL"?"ROLL":"USE"}</button></div></div>`}

function studyTierFromTotal(total){const n=Number(total)||0;return n>=13?13:n>=10?10:n>=7?7:0}
function limitedMonsterStudyTier(raw){const idx=monsterPhaseIndex(raw);return idx?Number(raw?.phases?.[idx-1]?.studyTier)||0:Number(raw?.studyTier)||0}
function limitedStudyResultHTML(actor){
  const r=latestRoll;
  if(!r?.isStudy || String(r.studyTargetId||"")!==String(actor?.id||""))return `<div class="limited-study-empty">NO STUDY RESULT YET</div>`;
  const outcome=r.fumble?"FUMBLE":r.critical?"CRITICAL":r.double?"DOUBLE":"";
  const tier=studyTierFromTotal(r.total);
  return `<div class="limited-study-result"><small>LATEST STUDY ${outcome?`· ${outcome}`:""}</small><b>${Number(r.total)||0}</b><span>d${r.size1} ${r.d1} + d${r.size2} ${r.d2}${r.mod?` ${signed(r.mod)}`:""}</span><em>${tier?`RESULT · STUDY ${tier}+`:`RESULT · BELOW 7`}</em></div>`;
}
function limitedMonsterHUDHTML(actor){
  const own=limitedStudyPlayerSheet(), ins=currentDie(own,"INS"), raw=actor.raw||{}, sh=actor.sheet||{}, tier=limitedMonsterStudyTier(raw);
  const active=STATUS_NAMES.filter(k=>raw.statuses?.[k]).map(x=>x.toUpperCase()).join(" · ")||"NORMAL";
  const statuses=STATUS_NAMES.map(k=>`<button class="limited-hinder-status ${raw.statuses?.[k]?"on":""}" data-limited-hinder="${k}"><b>${k.toUpperCase()}</b><small>${raw.statuses?.[k]?"ACTIVE · CLICK TO REMOVE":"APPLY HINDER"}</small></button>`).join("");
  return `<div class="hud-shell limited-monster-shell"><section class="hud-panel limited-monster-panel"><header class="hud-head"><div class="portrait">${actor.portrait?`<img class="monster-full-art" src="${esc(actor.portrait)}" alt="">`:esc((actor.name||"M").slice(0,1).toUpperCase())}</div><div class="title"><small>PLAYER MONSTER INTERACTION</small><b>${esc(actor.name)}</b><span>${esc(monsterPhaseLabel(raw))} · STUDY ${tier>=13?"13+":tier>=10?"10+":tier>=7?"7+":"LOCKED"} · ${esc(active)}</span></div><button class="icon-btn close-btn" data-close>×</button></header><section class="limited-monster-body"><div class="limited-card"><div class="limited-card-head"><b>HINDER</b><span>STATUS IS ALWAYS VISIBLE</span></div><div class="limited-hinder-grid">${statuses}</div></div><div class="limited-card"><div class="limited-card-head"><b>STUDY</b><span>INS + INS + MOD</span></div><div class="limited-study-formula"><span>INS <b>d${ins}</b></span><i>+</i><span>INS <b>d${ins}</b></span><i>+</i><label>MOD <input type="number" data-limited-study-mod value="0" step="1"></label><button type="button" class="primary" data-limited-study-roll>ROLL STUDY</button></div>${limitedStudyResultHTML(actor)}<div class="limited-study-guide"><span><b>7+</b> Rank · Species · HP · MP</span><span><b>10+</b> Traits · Attributes · DEF · M.DEF · Affinities</span><span><b>13+</b> Actions</span></div></div></section><footer class="footer">PLAYER ACCESS · HINDER / STUDY ONLY · MONSTER ACTIONS AND SPECIAL RULES HIDDEN</footer></section><div class="toast"></div></div>`;
}
async function setLimitedMonsterStatus(actor,status){
  if(!actor?.limited || actor.kind!=="monster" || !STATUS_NAMES.includes(status))return;
  const list=(Array.isArray(sceneMetadata?.[SCENE_MONSTERS_KEY])?sceneMetadata[SCENE_MONSTERS_KEY]:[]).map(deepClone);
  let i=list.findIndex(m=>sameId(m.id,actor.id));
  if(i<0&&actor.tokenId)i=list.findIndex(m=>sameId(m.linkedTokenId,actor.tokenId));
  if(i<0){showToast("MONSTER TARGET NOT FOUND");return}
  actor.id=String(list[i].id);
  const m=list[i];m.statuses||=Object.fromEntries(STATUS_NAMES.map(k=>[k,false]));m.statusImmunities||=Object.fromEntries(STATUS_NAMES.map(k=>[k,false]));
  const before=!!m.statuses[status],next=!before;
  if(next&&m.statusImmunities?.[status]){showToast(`${status.toUpperCase()} · NO EFFECT · IMMUNE`);return}
  m.statuses[status]=next;m.updatedAt=Date.now();
  const safe=list.map(x=>({...deepClone(x),specialRules:[]}));
  await OBR.scene.setMetadata({[SCENE_MONSTERS_KEY]:safe});sceneMetadata={...sceneMetadata,[SCENE_MONSTERS_KEY]:safe};
  showToast(`${status.toUpperCase()} · ${next?"APPLIED":"REMOVED"}`);render();
}
async function performLimitedStudy(actor){
  if(!actor?.limited || actor.kind!=="monster")return;
  const own=limitedStudyPlayerSheet();
  const size1=currentDie(own,"INS"),size2=size1,d1=1+Math.floor(Math.random()*size1),d2=1+Math.floor(Math.random()*size2),mod=Number(document.querySelector("[data-limited-study-mod]")?.value)||0,total=d1+d2+mod;
  const fumble=d1===1&&d2===1,match=d1===d2,critical=match&&d1>=6,double=match&&!critical&&!fumble,previous=limitedMonsterStudyTier(actor.raw),suggested=studyTierFromTotal(total),phaseIndex=monsterPhaseIndex(actor.raw);
  const r={id:uid(),senderId:me.id,senderName:me.name,label:`${own.name||me.name||"CHARACTER"} · STUDY · ${actor.name}`,rollStyle:"check",actionCategory:"OTHER",twoWeapon:false,actionTarget:"MONSTER",actionTypeText:"STUDY",attr1:"INS",attr2:"INS",size1,size2,d1,d2,mod,manualMod:mod,autoAccuracyBonus:0,total,hr:null,highResult:Math.max(d1,d2),damageHighRoll:0,damageHR:0,manualDamageHR:0,autoDamageBonus:0,damage:null,adjustedDamage:null,critical,fumble,double,element:"none",detail:"Study Check · INS + INS + MOD",gif:String(own.studyGif||""),targetName:actor.name,targetRef:`monster:${actor.id}`,targetRefs:[`monster:${actor.id}`],targetResults:[],affinity:"NORMAL",isStudy:true,studyTargetId:String(actor.id),studyTargetTokenId:String(actor.tokenId||""),studyTargetRef:`monster:${String(actor.id)}`,studyTargetName:actor.name,studyPhaseIndex:phaseIndex,studyPhaseLabel:monsterPhaseLabel(actor.raw),studyPreviousTier:previous,suggestedStudyTier:suggested,studyUnlockedTier:Math.max(previous,suggested),actorKind:"player",actorId:String(me.id),frenzy:false,invokeBaseMod:mod,invoke:{traitRerolls:0,traitName:"",bondUsed:false,bondName:"",bondStrength:0,bondBonus:0,log:[]},time:Date.now()};
  latestRoll={...r,summary:`INS ${d1} + INS ${d2}${mod?` ${signed(mod)}`:""} = ${total} · STUDY ${actor.name}`};
  showToast("ROLLING STUDY…");
  // Render immediately before any cross-frame/network delivery so the button always
  // gives local feedback even if the action window/background bus is unavailable.
  render();
  await broadcast("roll",r);
  showToast(fumble?"FUMBLE":critical?"CRITICAL":double?"DOUBLE":`STUDY · ${total}${own._studyFallback?" · d8 FALLBACK":""}`);
  render();
}
function render(){
  const actor=currentActor(); const root=document.getElementById("hud-root"); if(!root)return;
  if(!actor){root.innerHTML=`<div class="hud-shell"><section class="hud-panel"><div class="empty" style="margin:12px">LINKED TOKEN IS NO LONGER AVAILABLE<br><br><button class="icon-btn" data-switch>USE SELECTED TOKEN</button></div></section></div>`;return;}
  if(actor.limited&&actor.kind==="monster"){root.innerHTML=limitedMonsterHUDHTML(actor);return;}
  if(actor.kind==="monster"&&["items","arcana"].includes(activeTab))activeTab="actions";
  if(actor.kind!=="monster"&&activeTab==="special-rules")activeTab="actions";
  const status=activeStatuses(actor.sheet).map(x=>x.toUpperCase()).join(" · ")||"NORMAL";
  const body=activeTab==="items"?itemsHTML(actor):activeTab==="arcana"?arcanaHTML(actor):activeTab==="special-rules"?specialRulesHTML(actor):activeTab==="roll"?rollsHTML(actor):actionsHTML(actor);
  const monsterMeta=actor.kind==="monster"?`${monsterPhaseLabel(actor.raw)} · ${normalizeMonsterRank(actor.sheet?.rank)} · LV ${Number(actor.sheet?.normalLevel??actor.sheet?.level)||5}→${Number(actor.sheet?.level)||5}`:"LINKED CHARACTER TOKEN";
  const tabs=actor.kind==="monster"?`<button data-tab="actions" class="${activeTab==="actions"?"active":""}">ACTION <b>${actor.sheet?.actions?.length||0}</b></button><button data-tab="special-rules" class="${activeTab==="special-rules"?"active":""}">SPECIAL RULE <b>${actor.raw?.specialRules?.length||0}</b></button><button data-tab="roll" class="${activeTab==="roll"?"active":""}">ROLL</button>`:`<button data-tab="actions" class="${activeTab==="actions"?"active":""}">ACTION <b>${actor.sheet?.actions?.length||0}</b></button><button data-tab="items" class="${activeTab==="items"?"active":""}">ITEM <b>${actor.sheet?.inventory?.length||0}</b></button><button data-tab="arcana" class="${activeTab==="arcana"?"active":""}">ARCANA <b>${actor.sheet?.lists?.arcana?.length||0}</b></button><button data-tab="roll" class="${activeTab==="roll"?"active":""}">ROLL</button>`;
  root.innerHTML=`<div class="hud-shell"><section class="hud-panel"><header class="hud-head"><div class="portrait">${actor.portrait?`<img class="${actor.kind==="monster"?"monster-full-art":""}" src="${esc(actor.portrait)}" alt="">`:esc((actor.name||"?").slice(0,1).toUpperCase())}</div><div class="title"><small>${esc(monsterMeta)}</small><b>${esc(actor.name)}</b><span>${esc(status)}</span></div><button class="icon-btn switch-btn" data-switch>↻ SELECTED</button><button class="icon-btn close-btn" data-close>×</button></header><div class="resources ${actor.kind==="monster"?"monster-resources":""}">${resourcesHTML(actor)}</div><nav class="tabs ${actor.kind==="monster"?"monster-tabs":""}">${tabs}</nav><section class="body">${body}</section><footer class="footer">MAIN CANVAS HUD · ACTOR PINNED · MAP SELECTION CAN BE USED AS TARGET</footer></section>${previewHTML(actor)}${costOverlayHTML(actor)}${statsOverlayHTML(actor)}${guardTargetOverlayHTML(actor)}<div class="toast"></div></div>`;
  bindHoverPreview();
}
function bindHoverPreview(){
  for(const row of document.querySelectorAll("[data-preview-kind]")){
    row.addEventListener("mouseenter",()=>{
      document.body.dataset.previewKind=row.dataset.previewKind||"";
      document.body.dataset.previewIndex=row.dataset.previewIndex||"";
      const actor=currentActor(), old=document.querySelector(".action-preview");
      if(old&&actor){const tmp=document.createElement("div");tmp.innerHTML=previewHTML(actor);old.replaceWith(tmp.firstElementChild);}
    });
    row.addEventListener("mouseleave",()=>{delete document.body.dataset.previewKind;delete document.body.dataset.previewIndex;});
  }
}

function applyPlayerOp(sheet,op){
  if(op.kind==="set") setByPathLocal(sheet,op.path,op.value);
  else if(op.kind==="toggle-status") sheet.statuses[op.key]=!sheet.statuses[op.key];
  else if(op.kind==="buff") sheet.attributeBuffs[op.key]=clamp((Number(sheet.attributeBuffs[op.key])||0)+Number(op.delta||0),-3,3);
  else if(op.kind==="adjust"){
    if(op.path==="fp") sheet.fp=Math.max(0,(Number(sheet.fp)||0)+Number(op.delta||0));
    else {const key=String(op.path||"").split(".")[0];if(sheet[key]?.current!==undefined)sheet[key].current=clamp((Number(sheet[key].current)||0)+Number(op.delta||0),0,Number(sheet[key].max)||0)}
  } else if(op.kind==="pay-cost"){
    const c=op.costs||{};sheet.hp.current=clamp((Number(sheet.hp.current)||0)-(Number(c.hp)||0),0,sheet.hp.max);sheet.mp.current=clamp((Number(sheet.mp.current)||0)-(Number(c.mp)||0),0,sheet.mp.max);sheet.ip.current=clamp((Number(sheet.ip.current)||0)-(Number(c.ip)||0),0,sheet.ip.max);sheet.fp=Math.max(0,(Number(sheet.fp)||0)-(Number(c.fp)||0));
  } else if(op.kind==="reorder-path"&&op.path==="actions"){
    const arr=sheet.actions||[],from=Number(op.from),to=Number(op.to);if(from>=0&&to>=0&&from<arr.length&&to<arr.length&&from!==to){const[x]=arr.splice(from,1);arr.splice(to,0,x)}
  }
  sheet.updatedAt=Date.now();
}
async function persistPlayerOp(ownerId,op){
  const sh=playerSheet(ownerId);if(!sh)return false;const copy=deepClone(sh);applyPlayerOp(copy,op);
  const registry={...(sceneMetadata?.[SCENE_PLAYER_SHEETS_KEY]||{})};
  const p=partyPlayer(ownerId),old=registry[ownerId]||{};registry[ownerId]={...old,ownerId:String(ownerId),ownerName:p?.name||old.ownerName||copy.name||"PLAYER",sheet:deepClone(copy),updatedAt:copy.updatedAt};
  if(await OBR.scene.isReady())await OBR.scene.setMetadata({[SCENE_PLAYER_SHEETS_KEY]:registry});
  sceneMetadata={...sceneMetadata,[SCENE_PLAYER_SHEETS_KEY]:registry};
  if(String(ownerId)===String(me.id)){await OBR.player.setMetadata({[META_KEY]:copy});selfMetadata={...selfMetadata,[META_KEY]:copy};}
  else await broadcast("edit",{id:uid(),ownerId:String(ownerId),editorId:me.id,editorName:me.name,op,time:Date.now()});
  return true;
}
async function persistMonsterMutation(monsterId,mutator){
  if(me.role!=="GM")return false;const list=(Array.isArray(sceneMetadata?.[SCENE_MONSTERS_KEY])?sceneMetadata[SCENE_MONSTERS_KEY]:[]).map(deepClone);const i=list.findIndex(m=>String(m.id)===String(monsterId));if(i<0)return false;mutator(list[i]);syncMonsterRules(list[i]);list[i].updatedAt=Date.now();await OBR.scene.setMetadata({[SCENE_MONSTERS_KEY]:list});sceneMetadata={...sceneMetadata,[SCENE_MONSTERS_KEY]:list};return true;
}
function monsterActionArray(raw){const phases=Array.isArray(raw?.phases)?raw.phases:[],idx=Math.max(0,Math.min(Number(raw?.activePhase)||0,phases.length));return idx?phases[idx-1].actions:raw.actions}
async function adjustResource(actor,key,delta){
  if(!actor||!canControl(actor.kind,actor.id))return;
  if(actor.kind==="player"){await persistPlayerOp(actor.id,{kind:"adjust",path:key==="fp"?"fp":`${key}.current`,delta:Number(delta)||0});}
  else await persistMonsterMutation(actor.id,raw=>{if(key==="fp")raw.fp=Math.max(0,(Number(raw.fp)||0)+Number(delta||0));else if(raw[key]?.current!==undefined)raw[key].current=clamp((Number(raw[key].current)||0)+Number(delta||0),0,Number(raw[key].max)||0)});
  await refreshData();render();
}
function resourceSnapshot(actor,key){
  const raw=actor.raw||actor.sheet||{};if(key==="fp")return{current:Number(raw.fp??actor.sheet?.fp)||0,max:null};const r=raw[key]||actor.sheet?.[key]||{};return{current:Number(r.current)||0,max:r.max==null?null:Number(r.max)||0};
}
function parseResourceCommand(text,current,max){const t=String(text||"").trim();if(!t)return null;let next;if(/^[+-]\d+$/.test(t))next=(Number(current)||0)+Number(t);else if(/^=?\d+$/.test(t))next=Number(t.replace(/^=/,""));else return null;next=Math.max(0,Math.round(next));if(max!=null)next=Math.min(next,Math.max(0,Number(max)||0));return next}
async function setResourceCommand(actor,key,text){
  if(!actor||!canControl(actor.kind,actor.id))return;const snap=resourceSnapshot(actor,key),next=parseResourceCommand(text,snap.current,snap.max);if(next==null){showToast("USE +10 / -5 / 20");return}const delta=next-snap.current;
  if(actor.kind==="player"){if(delta===0)return;await persistPlayerOp(actor.id,{kind:"adjust",path:key==="fp"?"fp":`${key}.current`,delta});}
  else await persistMonsterMutation(actor.id,raw=>{if(key==="fp")raw.fp=Math.max(0,next);else if(raw[key]?.current!==undefined)raw[key].current=snap.max==null?Math.max(0,next):clamp(next,0,snap.max)});
  await refreshData();render();showToast(`${key.toUpperCase()} · ${next}`);
}
async function setActorStat(actor,path,value){
  if(!actor||!canControl(actor.kind,actor.id))return false;
  if(actor.kind==="player")await persistPlayerOp(actor.id,{kind:"set",path,value});
  else await persistMonsterMutation(actor.id,raw=>{const phaseField=/^(attributes\.|defenseMod$|magicDefenseMod$|normalLevel$|level$|rank$|species$|initiative$|hpMod$|mpMod$|affinities\.)/.test(path);const target=phaseField?monsterPhaseTarget(raw):raw;if(/^attributes\./.test(path)&&(!target.attributes||typeof target.attributes!=="object"))target.attributes={...(raw.attributes||actor.sheet?.attributes||{})};if(/^affinities\./.test(path)&&(!target.affinities||typeof target.affinities!=="object"))target.affinities={...(raw.affinities||actor.sheet?.affinities||{})};setByPathLocal(target,path,value)});
  await refreshData();render();return true;
}
async function toggleActorStatus(actor,key){if(!actor||!STATUS_NAMES.includes(key)||!canControl(actor.kind,actor.id))return;if(actor.kind==="player")await persistPlayerOp(actor.id,{kind:"toggle-status",key});else await persistMonsterMutation(actor.id,raw=>{raw.statuses||={};raw.statusImmunities||={};if(!raw.statuses[key]&&raw.statusImmunities[key]){showToast(`${key.toUpperCase()} · IMMUNE`);return}raw.statuses[key]=!raw.statuses[key]});await refreshData();render()}
async function setMonsterImmunity(actor,key,immune){if(!actor||actor.kind!=="monster"||!STATUS_NAMES.includes(key)||me.role!=="GM")return;await persistMonsterMutation(actor.id,raw=>{raw.statusImmunities||={};raw.statuses||={};raw.statusImmunities[key]=!!immune;if(immune)raw.statuses[key]=false});await refreshData();render()}
async function buffActorStat(actor,key,delta){if(!actor||!ATTRS.includes(key)||!canControl(actor.kind,actor.id))return;if(actor.kind==="player")await persistPlayerOp(actor.id,{kind:"buff",key,delta:Number(delta)||0});else await persistMonsterMutation(actor.id,raw=>{raw.attributeBuffs||={};raw.attributeBuffs[key]=clamp((Number(raw.attributeBuffs[key])||0)+Number(delta||0),-3,3)});await refreshData();render()}
async function reorderAction(actor,index,delta){
  const from=Number(index),to=from+Number(delta);if(!actor||to<0||to>=(actor.sheet?.actions?.length||0))return;
  if(actor.kind==="player")await persistPlayerOp(actor.id,{kind:"reorder-path",path:"actions",from,to});
  else await persistMonsterMutation(actor.id,raw=>{const arr=monsterActionArray(raw);if(Array.isArray(arr)){const[x]=arr.splice(from,1);arr.splice(to,0,x)}});
  await refreshData();render();
}
async function payCost(actor,costs){
  const c={hp:Math.max(0,Number(costs.hp)||0),mp:Math.max(0,Number(costs.mp)||0),ip:Math.max(0,Number(costs.ip)||0),fp:Math.max(0,Number(costs.fp)||0),up:Math.max(0,Number(costs.up)||0)};
  if(actor.kind==="monster"){c.ip=0;c.fp=0;}else c.up=0;
  const raw=actor.raw||actor.sheet;const available={hp:Number(raw.hp?.current)||0,mp:Number(raw.mp?.current)||0,ip:Number(raw.ip?.current)||0,fp:Number(raw.fp??actor.sheet?.fp)||0,up:Number(raw.up?.current)||0};
  const missing=Object.keys(c).filter(k=>c[k]>available[k]);if(missing.length){showToast(`NOT ENOUGH · ${missing.map(k=>k.toUpperCase()).join(" / ")}`);return false}
  if(actor.kind==="player")await persistPlayerOp(actor.id,{kind:"pay-cost",costs:c});
  else await persistMonsterMutation(actor.id,m=>{m.hp.current=clamp((Number(m.hp.current)||0)-c.hp,0,m.hp.max);m.mp.current=clamp((Number(m.mp.current)||0)-c.mp,0,m.mp.max);m.up||={current:0,max:0};m.up.current=clamp((Number(m.up.current)||0)-c.up,0,m.up.max)});
  return true;
}
async function resolveSelectedTargets(actor){
  const ids=await OBR.player.getSelection()||[],out=[];
  for(const tokenId of ids){if(String(tokenId)===String(actor.tokenId))continue;for(const pid of allPlayerIds()){const sh=playerSheet(pid);if(sh&&String(sh.linkedTokenId||"")===String(tokenId)){out.push({kind:"player",id:String(pid),tokenId:String(tokenId),name:sh.name||partyPlayer(pid)?.name||"CHARACTER",sheet:sh});break}}const raw=(sceneMetadata?.[SCENE_MONSTERS_KEY]||[]).find(m=>String(m.linkedTokenId||"")===String(tokenId));if(raw){const sh=monsterPhaseView(raw);out.push({kind:"monster",id:String(raw.id),tokenId:String(tokenId),name:sh?.name||raw.name||"MONSTER",sheet:sh})}}
  return out;
}
function coveredEntryForTarget(target){return guardCoverState().entries.find(x=>String(x.coverTokenId||"")===String(target?.tokenId||"")||(`${x.coverKind}:${x.coverId}`===`${target?.kind}:${target?.id}`))||null}
function guardingEntryForTarget(target){return guardCoverState().entries.find(x=>String(x.guardTokenId||"")===String(target?.tokenId||"")||(`${x.guardKind}:${x.guardId}`===`${target?.kind}:${target?.id}`))||null}
function isMeleeAction(action){const type=normalizeActionType(action?.category);return type==="MELEE ATTACK"||(type==="TWO WEAPON"&&/\bMELEE\b/i.test(`${action?.actionTypeText||""} ${action?.target||""}`))}
async function warnCoveredMeleeTarget(actor,action,targets){
  if(actor?.kind!=="monster"||combatSide(actor.kind,actor.sheet)!=="enemy"||!isMeleeAction(action))return false;
  const hit=(targets||[]).map(t=>({target:t,entry:coveredEntryForTarget(t)})).find(x=>x.entry);
  if(!hit)return false;
  const text=`COVERED BY ${String(hit.entry.guardName||"ALLY").toUpperCase()}`;
  showToast(text);
  try{await OBR.notification.show(text,"WARNING")}catch{}
  return true;
}
function guardTurnSig(md=sceneMetadata){const c=md?.[SCENE_COMBAT_KEY]||{};return c.started?`${Math.max(0,Number(c.round)||0)}|${String(c.activeKey||"")}`:""}
function availableCoverTargets(actor){
  const side=combatSide(actor.kind,actor.sheet),out=[];
  for(const pid of allPlayerIds()){const sh=playerSheet(pid);if(!sh||!sh.linkedTokenId||(Number(sh.hp?.current)||0)<=0||actor.kind==="player"&&String(pid)===String(actor.id))continue;if(side==="ally")out.push({kind:"player",id:String(pid),tokenId:String(sh.linkedTokenId),name:sh.name||partyPlayer(pid)?.name||"CHARACTER",sheet:sh})}
  for(const raw of sceneMetadata?.[SCENE_MONSTERS_KEY]||[]){const sh=monsterPhaseView(raw);if(!sh||!raw.linkedTokenId||(Number(raw.hp?.current)||0)<=0||actor.kind==="monster"&&String(raw.id)===String(actor.id))continue;if(combatSide("monster",sh)===side)out.push({kind:"monster",id:String(raw.id),tokenId:String(raw.linkedTokenId),name:sh.name||raw.name||"MONSTER",sheet:sh})}
  return out;
}
function guardTargetOverlayHTML(actor){if(!guardTargetPrompt)return"";const targets=availableCoverTargets(actor);return `<div class="guard-target-overlay"><section><button class="guard-target-close" data-guard-target-close>×</button><small>COVER ALLY · CHOOSE TOKEN</small><h3>${esc(actor.name)} COVERS…</h3><p>Enemy Melee Attacks cannot select the chosen creature.</p><div class="guard-target-list">${targets.length?targets.map(t=>`<button data-guard-target="${esc(t.kind)}|${esc(t.id)}|${esc(t.tokenId)}"><span>🛡</span><b>${esc(t.name)}</b><small>${t.kind==="player"?"PLAYER":"ALLY MONSTER"}</small></button>`).join(""):`<div class="empty">NO OTHER ALLIED LINKED TOKENS</div>`}</div><em>No damage-transfer choice: this follows the Core Rule.</em></section></div>`}
async function setGuardCover(actor,cover=null,action=null){
  if(!actor?.tokenId||!canControl(actor.kind,actor.id)){showToast("GUARD · LINKED TOKEN REQUIRED");return}
  const latest=await OBR.scene.getMetadata(),state=guardCoverState(latest),guardKey=`${actor.kind}:${actor.id}`,coverKey=cover?`${cover.kind}:${cover.id}`:"";
  const sig=guardTurnSig(latest);if(sig&&state.uses[guardKey]===sig){showToast("GUARD ALREADY USED THIS TURN");return}
  state.entries=state.entries.filter(x=>String(x.guardTokenId)!==String(actor.tokenId)&&`${x.guardKind}:${x.guardId}`!==guardKey&&(!cover||((String(x.coverTokenId)!==String(cover.tokenId))&&`${x.coverKind}:${x.coverId}`!==coverKey)));
  state.entries.push({id:uid(),guardKind:actor.kind,guardId:String(actor.id),guardTokenId:String(actor.tokenId),guardName:String(actor.name||"GUARD"),guardSide:combatSide(actor.kind,actor.sheet),coverKind:cover?.kind||"",coverId:String(cover?.id||""),coverTokenId:String(cover?.tokenId||""),coverName:String(cover?.name||""),createdAt:Date.now(),turnSig:sig});if(sig)state.uses[guardKey]=sig;
  state.revision+=1;
  await OBR.scene.setMetadata({[SCENE_GUARD_COVER_KEY]:state});sceneMetadata={...latest,[SCENE_GUARD_COVER_KEY]:state};await share(`${actor.name} · ${cover?"COVER ALLY":"GUARD"}`,cover?`Covering ${cover.name}. Enemy Melee Attacks cannot select them.`:"Resistance to all damage types · +2 to Opposed Checks.",playerCutInExtra(actor,action));render();showToast(cover?`GUARD · COVERING ${cover.name}`:"GUARD · SHIELD ACTIVE");
}
function affinityDamage(base,aff){aff=String(aff||"NORMAL").toUpperCase();return aff==="VULNERABILITY"?base*2:aff==="RESISTANCE"?Math.ceil(base/2):base}
async function doRoll(actor,action,{damage=true,label="",manual=false}={}){
  const sh=actor.sheet,a=action||{},targets=await resolveSelectedTargets(actor);if(await warnCoveredMeleeTarget(actor,a,targets))return null;const attr1=a.attr1||"DEX",attr2=a.attr2||"INS",size1=currentDie(sh,attr1),size2=currentDie(sh,attr2),d1=1+Math.floor(Math.random()*size1),d2=1+Math.floor(Math.random()*size2);
  const manualMod=Number(a.mod)||0,accAdj=actor.kind==="monster"?monsterLevelAccuracyBonus(sh.normalLevel??sh.level,sh.level):0,mod=manualMod+accAdj,total=d1+d2+mod,high=Math.max(d1,d2);
  const category=normalizeActionType(a.category),two=category==="TWO WEAPON"&&damage,damageHigh=two?0:high,manualBonus=Number(a.damageHR)||0,dmgAdj=actor.kind==="monster"?monsterLevelDamageBonus(sh.normalLevel??sh.level,sh.level):0,dmg=damage?damageHigh+manualBonus+dmgAdj:NaN;
  const fumble=d1===1&&d2===1,match=d1===d2,critical=(match&&d1>=6)||(!fumble&&!!a.frenzy&&match),double=match&&!critical&&!fumble;
  const defenseKind=actor.kind==="monster"?attackDefenseKind(category):"";
  const element=a.element||"none",targetResults=targets.map(t=>{const base=element!=="none"?String(t.sheet?.affinities?.[element]||"NORMAL").toUpperCase():"NORMAL",aff=element!=="none"&&guardingEntryForTarget(t)&&!["IMMUNITY","ABSORPTION"].includes(base)?"RESISTANCE":base,defense=defenseKind?defenseValue(t.sheet,defenseKind):null;return{kind:t.kind,id:t.id,name:t.name,affinity:aff,damage:Number.isFinite(dmg)?affinityDamage(dmg,aff):NaN,...(defenseKind?{defenseKind,defense,hit:attackHitsDefense(total,defense,critical,fumble)}:{})}});
  const first=targetResults[0]||null,adjusted=first&&Number.isFinite(first.damage)?first.damage:dmg;
  const r={id:uid(),senderId:me.id,senderName:me.name,actorName:actor.name,actorPortrait:String(sh.portrait||""),actionName:label||a.label||a.name||"CHECK",label:`${actor.name} · ${label||a.label||a.name||"CHECK"}`,rollStyle:damage?"action":"check",actionCategory:category,twoWeapon:two,actionTarget:String(a.target||""),actionTypeText:String(a.actionTypeText||""),attr1,attr2,size1,size2,d1,d2,mod,manualMod,autoAccuracyBonus:accAdj,total,hr:damage?(two?0:manualBonus):null,highResult:high,damageHighRoll:damageHigh,damageHR:manualBonus,manualDamageHR:manualBonus,autoDamageBonus:dmgAdj,damage:damage?dmg:null,adjustedDamage:damage?adjusted:null,critical,fumble,double,element,detail:a.note||"",gif:mediaFromText(a.note||""),targetName:targets.map(t=>t.name).join(" · "),targetRef:first?`${first.kind}:${first.id}`:"",targetRefs:targets.map(t=>`${t.kind}:${t.id}`),targetResults,affinity:first?.affinity||"NORMAL",actorKind:actor.kind,actorId:String(actor.id),frenzy:!!a.frenzy,cutIn:actor.kind==="player"&&!!a.cutIn&&!manual,cutInColor:String(a.cutInColor||"violet"),invokeBaseMod:mod,invoke:{traitRerolls:0,traitName:"",bondUsed:false,bondName:"",bondStrength:0,bondBonus:0,log:[]},time:Date.now()};
  latestRoll={...r,summary:`${attr1} ${d1} + ${attr2} ${d2} ${mod?`${signed(mod)}`:""} = ${total}${damage?` · ${two?"HR 0":`HIGH ${high}`} + BONUS ${manualBonus}${dmgAdj?` ${signed(dmgAdj)} LV`:""} = DMG ${dmg}`:""}${r.targetName?` · VS ${r.targetName}`:""}`};
  showToast("ROLLING…");
  if(r.cutIn){
    await broadcast("skill-cutin",{id:`cutin-${r.id}`,rollId:r.id,senderId:r.senderId,senderName:r.senderName,actorId:r.actorId,actorName:r.actorName,actionName:r.actionName,portrait:r.actorPortrait,element:r.element,cutInColor:r.cutInColor,time:Date.now()});
  }
  await broadcast("roll",r);
  showToast(r.fumble?"FUMBLE":r.critical?"CRITICAL":r.double?"DOUBLE":`ROLL · ${r.total}`);
  render();return r;
}
function playerCutInExtra(actor,entry){return actor?.kind==="player"&&entry?.cutIn?{cutIn:true,cutInColor:String(entry.cutInColor||"violet"),actorId:String(actor.id),actorName:String(actor.name||me.name),actorPortrait:String(actor.sheet?.portrait||""),actionName:String(entry.name||"ACTION"),element:String(entry.element||"none")}: {}}
async function share(title,body,extra={}){const msg={id:uid(),senderId:me.id,senderName:me.name,title,body,gif:mediaFromText(body),media:mediaFromText(body),time:Date.now(),...extra};showToast("USING…");if(msg.cutIn)await broadcast("skill-cutin",{id:`cutin-${msg.id}`,rollId:msg.id,senderId:msg.senderId,senderName:msg.senderName,actorId:msg.actorId,actorName:msg.actorName,actionName:msg.actionName||msg.title,portrait:msg.actorPortrait,element:msg.element||"none",cutInColor:msg.cutInColor||"violet",time:Date.now()});await broadcast("share",msg);showToast("USED · RESULT SENT")}
async function executeAction(actor,index,guardTarget=null){const a=actor.sheet?.actions?.[index];if(!a)return;if(isGuardFamily(a))return setGuardCover(actor,isCoverAction(a)?guardTarget:null,a);const mode=String(a.mode||"ROLL").toUpperCase();if(mode==="ROLL")await doRoll(actor,a,{damage:true});else await share(`${actor.name} · ACTION · ${a.name||"ACTION"}`,`${a.category||"OTHER"}${a.cost?`\nCOST · ${a.cost}`:""}${a.target?`\nTARGET · ${a.target}`:""}${a.actionTypeText?`\nTYPE · ${a.actionTypeText}`:""}\n${a.note||""}`,playerCutInExtra(actor,a))}
async function continueGuardAction(actor,index,target=null){const a=actor.sheet?.actions?.[index],state=guardCoverState(),sig=guardTurnSig(),key=`${actor.kind}:${actor.id}`;if(!a)return;if(!actor.tokenId)return showToast("GUARD · LINKED TOKEN REQUIRED");if(sig&&state.uses[key]===sig)return showToast("GUARD ALREADY USED THIS TURN");const c=parseCost(a.cost||"");if(hasCost(c)){pendingAction={index,costs:c,guardTarget:target};render();return}await executeAction(actor,index,target)}
async function startAction(actor,index){const a=actor.sheet?.actions?.[index];if(!a)return;if(isCoverAction(a)){guardTargetPrompt={index};render();return}if(isGuardAction(a))return continueGuardAction(actor,index,null);if(String(a.mode||"ROLL").toUpperCase()==="ROLL"){const targets=await resolveSelectedTargets(actor);if(await warnCoveredMeleeTarget(actor,a,targets))return}const c=parseCost(a.cost||"");if(hasCost(c)){pendingAction={index,costs:c};render();return}await executeAction(actor,index)}
async function useItem(actor,index){if(actor.kind!=="player")return;const x=actor.sheet?.inventory?.[index];if(!x)return;await share(`${actor.name} · ITEM · ${x.name||"ITEM"}`,`${x.itemType||"ITEM"}${x.detail?`\n${x.detail}`:""}`,cardArt(x)?{media:cardArt(x)}:{})}
async function useArcana(actor,index){if(actor.kind!=="player")return;const x=actor.sheet?.lists?.arcana?.[index];if(!x)return;const body=`${x.cost?`COST: ${x.cost}\n\n`:""}${x.detail||"—"}`;await share(`${actor.name} · ARCANA · ${x.name||"ARCANA"}`,body,{...(cardArt(x)?{media:cardArt(x)}:{}),...playerCutInExtra(actor,x)});}
async function switchToSelected(){const ids=await OBR.player.getSelection()||[];for(const id of ids){const a=actorByTokenId(id);if(a){actorTokenId=a.tokenId;pendingAction=null;statsOpen=false;activeTab="actions";render();showToast(`ACTOR · ${a.name}`);return}}showToast(me.role==="GM"?"SELECT A LINKED PLAYER / MONSTER TOKEN":"SELECT YOUR LINKED TOKEN")}
async function closeHud(){await broadcast("token-hud-ui-closed",{ownerId:me.id,tokenId:actorTokenId,time:Date.now()});try{await OBR.popover.close(HUD_POPOVER_ID)}catch{}}
// Kept as a no-op guard for stale HUD DOM from an older cached version.
async function removeMonsterFromScene(){return}
async function handleClick(e){const b=e.target.closest("button");if(!b)return;const actor=currentActor();if(actor?.limited&&actor.kind==="monster"){if(b.hasAttribute("data-close")){await closeHud();return}if(b.dataset.limitedHinder){await setLimitedMonsterStatus(actor,b.dataset.limitedHinder);return}if(b.hasAttribute("data-limited-study-roll")){await performLimitedStudy(actor);return}return}if(b.dataset.tab){const allowed=actor?.kind==="monster"?["actions","special-rules","roll"]:["actions","items","arcana","roll"];activeTab=allowed.includes(b.dataset.tab)?b.dataset.tab:"actions";pendingAction=null;guardTargetPrompt=null;statsOpen=false;render();return}if(b.hasAttribute("data-close")){await closeHud();return}if(b.hasAttribute("data-remove-monster")){await removeMonsterFromScene(actor);return}if(b.hasAttribute("data-switch")){await switchToSelected();return}if(b.hasAttribute("data-guard-target-close")){guardTargetPrompt=null;render();return}if(b.dataset.guardTarget&&actor&&guardTargetPrompt){const[k,id,tokenId]=b.dataset.guardTarget.split("|"),target=availableCoverTargets(actor).find(t=>t.kind===k&&t.id===id&&t.tokenId===tokenId),idx=guardTargetPrompt.index;guardTargetPrompt=null;if(target)await continueGuardAction(actor,idx,target);else{showToast("ALLY TOKEN NO LONGER AVAILABLE");render()}return}if(b.dataset.resource&&actor){const[k,d]=b.dataset.resource.split("|");await adjustResource(actor,k,Number(d));return}if(b.dataset.resourceApply&&actor){const input=document.querySelector(`[data-resource-command="${CSS.escape(b.dataset.resourceApply)}"]`);await setResourceCommand(actor,b.dataset.resourceApply,input?.value||"");return}if(b.dataset.move&&actor){const[i,d]=b.dataset.move.split("|");await reorderAction(actor,Number(i),Number(d));return}if(b.dataset.useAction!==undefined&&actor){await startAction(actor,Number(b.dataset.useAction));return}if(b.dataset.useItem!==undefined&&actor){await useItem(actor,Number(b.dataset.useItem));return}if(b.dataset.useArcana!==undefined&&actor){await useArcana(actor,Number(b.dataset.useArcana));return}if(b.hasAttribute("data-stats-open")){statsOpen=true;pendingAction=null;render();return}if(b.hasAttribute("data-stats-close")){statsOpen=false;render();return}if(b.dataset.statStatus&&actor){await toggleActorStatus(actor,b.dataset.statStatus);return}if(b.dataset.statBuff&&actor){const[k,d]=b.dataset.statBuff.split("|");await buffActorStat(actor,k,Number(d));return}if(b.dataset.quickRoll&&actor){const[a1,a2]=b.dataset.quickRoll.split("|");await doRoll(actor,{name:`${a1} + ${a2}`,attr1:a1,attr2:a2,mod:0,element:"none",note:"Token Action HUD · Quick Check"},{damage:false,label:`${a1} + ${a2}`});return}if(b.hasAttribute("data-manual-roll")&&actor){const a1=document.getElementById("roll-a")?.value||"DEX",a2=document.getElementById("roll-b")?.value||"INS",mod=Number(document.getElementById("roll-mod")?.value)||0,label=document.getElementById("roll-label")?.value||"Custom Check";await doRoll(actor,{name:label,attr1:a1,attr2:a2,mod,element:"none",note:"Token Action HUD · Manual Check"},{damage:false,label});return}if(b.hasAttribute("data-cost-cancel")){pendingAction=null;render();return}if(b.hasAttribute("data-cost-confirm")&&actor&&pendingAction){const idx=pendingAction.index,guardTarget=pendingAction.guardTarget||null,action=actor.sheet?.actions?.[idx],targets=await resolveSelectedTargets(actor);if(action&&await warnCoveredMeleeTarget(actor,action,targets))return;const costs={};for(const k of ["hp","mp","ip","fp","up"])costs[k]=Math.max(0,Number(document.querySelector(`[data-cost="${k}"]`)?.value)||0);if(await payCost(actor,costs)){pendingAction=null;await refreshData();const refreshed=currentActor();if(refreshed)await executeAction(refreshed,idx,guardTarget);render()}return}}

document.addEventListener("click",e=>handleClick(e).catch(err=>{console.error(err);showToast(`HUD ERROR · ${String(err?.message||err||"UNKNOWN").slice(0,52)}`)}),true);
async function handleChange(e){const actor=currentActor();const el=e.target;if(!actor||!el)return;if(el.dataset.statAttr){const k=el.dataset.statAttr;if(ATTRS.includes(k))await setActorStat(actor,`attributes.${k}`,Number(el.value)||8);return}if(el.dataset.statDefense){await setActorStat(actor,el.dataset.statDefense,String(el.value||"").trim());return}if(el.dataset.monsterProfile&&actor.kind==="monster"){const path=el.dataset.monsterProfile;let value=el.type==="number"?Number(el.value):String(el.value||"");if(path==="rank")value=normalizeMonsterRank(value);if(path==="villainType")value=normalizeVillainType(value);await setActorStat(actor,path,value);return}if(el.dataset.monsterShared&&actor.kind==="monster"){const path=el.dataset.monsterShared,value=el.type==="number"?Math.max(0,Number(el.value)||0):String(el.value||"");await setActorStat(actor,path,value);return}if(el.dataset.monsterAffinity&&actor.kind==="monster"){const element=el.dataset.monsterAffinity;if(ELEMENTS.includes(element))await setActorStat(actor,`affinities.${element}`,String(el.value||"NORMAL").toUpperCase());return}if(el.dataset.monsterImmunity&&actor.kind==="monster"){await setMonsterImmunity(actor,el.dataset.monsterImmunity,!!el.checked);return}}
async function handleKeydown(e){const el=e.target;if(e.key!=="Enter"||!el)return;if(el.dataset.resourceCommand){e.preventDefault();const actor=currentActor();if(actor)await setResourceCommand(actor,el.dataset.resourceCommand,el.value||"");return}if(el.dataset.statDefense){e.preventDefault();const actor=currentActor();if(actor)await setActorStat(actor,el.dataset.statDefense,String(el.value||"").trim());return}}
document.addEventListener("change",e=>handleChange(e).catch(err=>{console.error(err);showToast("HUD ERROR")}),true);
document.addEventListener("keydown",e=>handleKeydown(e).catch(err=>{console.error(err);showToast("HUD ERROR")}),true);
window.addEventListener("beforeunload",()=>{broadcast("token-hud-ui-closed",{ownerId:me.id,tokenId:actorTokenId,time:Date.now()})});

OBR.onReady(async()=>{
  await refreshData();
  OBR.party.onChange(()=>scheduleRender(30));
  OBR.player.onChange(()=>scheduleRender(30));
  if(OBR.scene?.onMetadataChange)OBR.scene.onMetadataChange(md=>{sceneMetadata=md||{};scheduleRender(20)});
  if(OBR.scene?.items?.onChange)OBR.scene.items.onChange(()=>scheduleRender(80));
  initLocalResultBus();
  await broadcast("token-hud-ui-opened",{ownerId:me.id,tokenId:actorTokenId,time:Date.now()});
  render();
});
