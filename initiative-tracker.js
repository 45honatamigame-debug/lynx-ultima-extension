import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
const NS="com.lynx.fabula-unified",META_KEY=`${NS}/sheet`,SCENE_MONSTERS_KEY=`${NS}/scene-monsters-v1`,SCENE_COMBAT_KEY=`${NS}/scene-combat-v1`,SCENE_INIT_TRACKER_UI_KEY=`${NS}/initiative-tracker-ui-v1`,SCENE_PLAYER_SHEETS_KEY=`${NS}/scene-player-sheets-v1`,CONTROL_CHANNEL=`${NS}/companion-hud-control-v1`,EVENT_CHANNEL=`${NS}/events`,TRACKER_COLLAPSED_KEY=`${NS}/initiative-tracker-collapsed-local-v1`,TRACKER_LAYOUT_KEY=`${NS}/initiative-tracker-layout-local-v1`;
const DIE_STEPS=[6,8,10,12],STATUS_PENALTIES={slow:{DEX:1},enraged:{DEX:1,INS:1},dazed:{INS:1},weak:{MIG:1},poisoned:{MIG:1,WLP:1},shaken:{WLP:1}};
const host=document.getElementById("tracker");
let me={id:"",role:"PLAYER",name:""},party=[],controlBus=null,rolling=false,combatBusy=false,endTurnPending=false,currentMine=null,initiativePrompt=false,initiativeResult=null,lastUpcomingSig="",trackerDrag=null,trackerRenderPending=false;
const handledEndTurnRequests=new Set();
const num=x=>Number(x)||0,pct=(a,b)=>Math.max(0,Math.min(100,b>0?(num(a)/num(b))*100:0));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function currentDie(sheet,attr){const base=num(sheet?.attributes?.[attr])||8;let idx=Math.max(0,DIE_STEPS.indexOf(base)),penalty=0;for(const [status,on] of Object.entries(sheet?.statuses||{}))if(on)penalty+=STATUS_PENALTIES[status]?.[attr]||0;idx=clamp(idx+(num(sheet?.attributeBuffs?.[attr])||0)-penalty,0,DIE_STEPS.length-1);return DIE_STEPS[idx]}
function postControl(data){try{if(!controlBus)controlBus=new BroadcastChannel(CONTROL_CHANNEL);controlBus.postMessage(data);return true}catch(e){console.warn("initiative control",e);return false}}
function trackerSfx(cue, opts={}){postControl({type:"sfx",cue,broadcast:!!opts.broadcast,ownerCue:opts.ownerCue||"turnmine",activeKey:opts.activeKey||"",label:opts.label||"initiative",time:Date.now()})}
function trackerCollapsedLocal(){try{return localStorage.getItem(TRACKER_COLLAPSED_KEY)==="1"}catch{return false}}
function setTrackerCollapsedLocal(collapsed){try{localStorage.setItem(TRACKER_COLLAPSED_KEY,collapsed?"1":"0")}catch{}}
function trackerOrientationLocal(){try{return localStorage.getItem(TRACKER_LAYOUT_KEY)==="horizontal"?"horizontal":"vertical"}catch{return "vertical"}}
function setTrackerOrientationLocal(orientation){try{localStorage.setItem(TRACKER_LAYOUT_KEY,orientation==="horizontal"?"horizontal":"vertical")}catch{}}
function rotatedOrder(order,activeKey){const i=order.findIndex(x=>x.key===String(activeKey||""));return i>=0?[...order.slice(i),...order.slice(0,i)]:order}
function maybeWarnUpcoming(order,combat){
  if(!combat?.started||order.length<2){lastUpcomingSig="";return}
  const i=order.findIndex(x=>x.key===String(combat.activeKey||""));if(i<0){lastUpcomingSig="";return}
  const next=order[(i+1)%order.length],mine=next?.kind==="player"&&String(next.id)===String(me.id);
  if(!mine){lastUpcomingSig="";return}
  const sig=`${Math.max(1,num(combat.round))}:${combat.activeKey}:${next.key}`;if(sig===lastUpcomingSig)return;lastUpcomingSig=sig;
  OBR.notification.show(`${next.name||me.name||"Character"} · YOU'RE NEXT`,"INFO").catch(()=>{});
}
async function rollOwnInitiative(mod=0){
  if(rolling)return;
  rolling=true;
  try{
    const md=await OBR.player.getMetadata(),sheet=md?.[META_KEY]||currentMine;
    if(!sheet||sheet.deleted||num(sheet.hp?.current)<=0)throw new Error("No active character available");
    const size1=currentDie(sheet,"DEX"),size2=currentDie(sheet,"INS"),manualMod=Number.isFinite(Number(mod))?Math.trunc(Number(mod)):0;
    const d1=1+Math.floor(Math.random()*size1),d2=1+Math.floor(Math.random()*size2),total=d1+d2+manualMod;
    const id=`init-${uid()}`,name=String(sheet.name||me.name||"Character"),critical=d1===d2&&d1>=6,fumble=d1===1&&d2===1;
    initiativeResult={id,name,size1,size2,d1,d2,mod:manualMod,total,critical,fumble};
    // Save to the exact same player sheet through the background's serialized editor.
    if(!postControl({type:"status-edit",op:{kind:"set",path:"initiative",value:total},time:Date.now()}))throw new Error("Could not save Initiative");
    currentMine={...sheet,initiative:total};
    // Publish the normal room roll payload so existing Roll alerts/history surfaces can react.
    const initiativeGif=String(sheet.initiativeGif||"").trim();
    const payload={id,senderId:String(me.id),senderName:String(me.name||name),origin:"COMPANION_HUD",label:`${name} · INITIATIVE`,rollStyle:"check",attr1:"DEX",attr2:"INS",size1,size2,d1,d2,mod:manualMod,total,hr:null,damage:null,critical,fumble,double:d1===d2&&!critical&&!fumble,element:"none",gif:initiativeGif,media:initiativeGif,detail:`Initiative Check · DEX + INS${manualMod?` ${manualMod>0?"+":""}${manualMod} MOD`:""}`,actorKind:"player",actorId:String(me.id),time:Date.now()};
    try{await OBR.broadcast.sendMessage(EVENT_CHANNEL,{type:"roll",roll:payload},{destination:"ALL"})}catch(e){console.warn("initiative roll broadcast",e)}
    initiativePrompt=false;
    setTimeout(()=>render(),120);
  }catch(e){initiativeResult={error:String(e?.message||e||"Initiative roll failed")};}
  finally{rolling=false;render()}
}
function initiativePromptHTML(){
  if(!initiativePrompt&&!initiativeResult)return "";
  if(initiativeResult?.error)return `<div class="init-modal"><div class="init-card error"><small>INITIATIVE</small><b>ROLL FAILED</b><p>${esc(initiativeResult.error)}</p><button type="button" data-init-close>CLOSE</button></div></div>`;
  if(initiativeResult&&!initiativePrompt)return `<div class="init-modal"><div class="init-card result"><small>${esc(initiativeResult.name||"INITIATIVE")}</small><b class="init-total">${esc(initiativeResult.total)}</b><p>DEX d${esc(initiativeResult.size1)} → ${esc(initiativeResult.d1)} · INS d${esc(initiativeResult.size2)} → ${esc(initiativeResult.d2)}${initiativeResult.mod?` · MOD ${initiativeResult.mod>0?"+":""}${esc(initiativeResult.mod)}`:""}</p>${initiativeResult.critical?'<strong>CRITICAL</strong>':initiativeResult.fumble?'<strong>FUMBLE</strong>':""}<button type="button" data-init-close>DONE</button></div></div>`;
  const dex=currentDie(currentMine||{},"DEX"),ins=currentDie(currentMine||{},"INS");
  return `<div class="init-modal"><form class="init-card" data-init-form><small>ROLL INITIATIVE</small><b>DEX d${dex} + INS d${ins}</b><label>MOD <input type="number" inputmode="numeric" name="mod" value="0" step="1" autofocus></label><p>ใส่โบนัส/โทษ Initiative เพิ่มเติมได้ เช่น +2 หรือ -1</p><div class="init-actions"><button type="button" data-init-cancel>CANCEL</button><button type="submit" class="gold" ${rolling?"disabled":""}>${rolling?"ROLLING…":"ROLL"}</button></div></form></div>`;
}
function rankTurns(v){const s=String(v||"Soldier").trim();if(/^elite$/i.test(s))return 2;const m=s.match(/^champion[\s_-]*([1-6])$/i);return m?Number(m[1]):1}
function phaseView(m){const i=Math.max(0,Math.min(num(m?.activePhase),Array.isArray(m?.phases)?m.phases.length:0));return i>0?{...m,...(m.phases?.[i-1]||{}),id:m.id,hp:m.hp,mp:m.mp,statuses:m.statuses,faction:m.faction}:m}
function studyTier(m){const i=Math.max(0,Math.min(num(m?.activePhase),Array.isArray(m?.phases)?m.phases.length:0));const t=i>0?num(m.phases?.[i-1]?.studyTier):num(m?.studyTier);return t>=13?13:t>=10?10:t>=7?7:0}
function bestSheet(a,b){if(!a)return b;if(!b)return a;return num(b.updatedAt)>num(a.updatedAt)?b:a}
async function playerRecords(md){
  const map=new Map(),registry=md?.[SCENE_PLAYER_SHEETS_KEY]&&typeof md[SCENE_PLAYER_SHEETS_KEY]==="object"?md[SCENE_PLAYER_SHEETS_KEY]:{};
  try{const selfMd=await OBR.player.getMetadata();map.set(String(me.id),{id:String(me.id),name:me.name,sheet:selfMd?.[META_KEY]||null})}catch{}
  for(const p of party||[]){const id=String(p.id),cur=map.get(id);map.set(id,{id,name:p.name||cur?.name||"PLAYER",sheet:bestSheet(cur?.sheet,p.metadata?.[META_KEY])})}
  for(const [id,rec] of Object.entries(registry)){const cur=map.get(String(id));map.set(String(id),{id:String(id),name:cur?.name||rec?.ownerName||rec?.sheet?.name||"PLAYER",sheet:bestSheet(cur?.sheet,rec?.sheet)})}
  return [...map.values()];
}
function buildOrder(players,monsters){
  const friendly=[],enemy=[];
  for(const p of players){const s=p.sheet;if(!s||s.deleted||num(s.hp?.current)<=0||s.sceneNoTurn)continue;friendly.push({key:`player:${p.id}`,kind:"player",side:"player",id:p.id,name:s.name||p.name||"Character",portrait:s.portrait||"",initiative:num(s.initiative),hp:s.hp||{},mp:s.mp||{},ip:s.ip||{},masked:false,slot:1,turns:1})}
  for(const raw of monsters||[]){if(!raw||num(raw.hp?.current)<=0||(raw.faction==="ally"&&raw.sceneNoTurn))continue;const v=phaseView(raw),side=raw.faction==="ally"?"player":"enemy",turns=rankTurns(v.rank),tier=studyTier(raw),masked=me.role!=="GM"&&side==="enemy"&&tier<7;for(let slot=1;slot<=turns;slot++){const x={key:`monster:${raw.id}:turn:${slot}`,kind:"monster",side:side==="player"?"ally":"enemy",id:String(raw.id),name:v.name||raw.name||"Monster",portrait:v.portrait||raw.portrait||"",initiative:num(v.initiative),hp:raw.hp||{},mp:raw.mp||{},masked,studyTier:tier,slot,turns};(side==="player"?friendly:enemy).push(x)}}
  const sort=(a,b)=>b.initiative-a.initiative||a.name.localeCompare(b.name)||(a.slot||0)-(b.slot||0);friendly.sort(sort);enemy.sort(sort);if(!friendly.length)return enemy;if(!enemy.length)return friendly;
  let side=enemy[0].initiative>friendly[0].initiative?"enemy":"player";if(enemy[0].initiative===friendly[0].initiative)side=[friendly[0],enemy[0]].sort(sort)[0].side==="enemy"?"enemy":"player";
  const out=[];while(friendly.length||enemy.length){if(side==="player"){if(friendly.length)out.push(friendly.shift());else if(enemy.length)out.push(enemy.shift());side="enemy"}else{if(enemy.length)out.push(enemy.shift());else if(friendly.length)out.push(friendly.shift());side="player"}}return out;
}
function res(label,r,cls,masked){const cur=masked?"?":Math.max(0,num(r?.current)),max=masked?"?":Math.max(0,num(r?.max));return `<div class="res ${cls}"><span>${label}</span><div class="track"><i style="width:${masked?0:pct(cur,max)}%"></i></div><b>${masked?"???":`${cur}/${max}`}</b></div>`}
function entryHTML(x,current,upNext){const initials=String(x.name||"?").slice(0,2).toUpperCase(),slot=x.turns>1?` · ${x.slot}/${x.turns}`:"",canSheet=x.kind==="monster"&&(me.role==="GM"||num(x.studyTier)>=7),sheetAttrs=canSheet?` data-open-monster-sheet="${esc(x.id)}" role="button" tabindex="0" title="Open studied monster sheet"`:"",ip=x.kind==="player"?res("IP",x.ip,"ip",false):"";return `<article class="entry ${esc(x.side)} ${current?"current":""} ${upNext?"up-next":""} ${canSheet?"sheet-clickable":""}"${sheetAttrs}>${current?`<span class="turn">CURRENT</span>`:upNext?`<span class="up-next-label">YOU'RE NEXT</span>`:""}<div class="avatar ${x.kind==="monster"?"monster-avatar":""}">${x.portrait?`<img class="${x.kind==="monster"?"monster-full-art":""}" src="${esc(x.portrait)}" alt="">`:esc(initials)}</div><div class="who"><b title="${esc(x.name)}">${esc(x.name)}</b><small>INIT ${esc(x.initiative)}${esc(slot)}</small>${canSheet?`<em>OPEN SHEET</em>`:""}</div><div class="resources">${res("HP",x.hp,"hp",x.masked)}${res("MP",x.mp,"mp",x.masked)}${ip}</div></article>`}

async function setCombatState(next,undo,uiBase={}){
  if(me.role!=="GM")return false;
  const payload={[SCENE_COMBAT_KEY]:next};
  if(undo!==undefined)payload[SCENE_INIT_TRACKER_UI_KEY]={...(uiBase||{}),undo:undo||null,undoUpdatedAt:Date.now(),undoUpdatedBy:String(me.id)};
  await OBR.scene.setMetadata(payload);
  return true;
}
async function setTrackerCollapsed(collapsed){
  const next=!!collapsed;
  setTrackerCollapsedLocal(next);
  postControl({type:"tracker-collapse",collapsed:next,time:Date.now()});
  await render();
  return true;
}
async function setTrackerOrientation(orientation){
  const next=orientation==="horizontal"?"horizontal":"vertical";
  setTrackerOrientationLocal(next);
  postControl({type:"tracker-layout",orientation:next,time:Date.now()});
  await render();
  return true;
}
async function requestEndOwnTurn(){
  if(me.role==="GM"||endTurnPending)return;
  const md=await OBR.scene.getMetadata(),combat=md?.[SCENE_COMBAT_KEY]||{},activeKey=String(combat.activeKey||""),ownKey=`player:${me.id}`;
  if(!combat.started||activeKey!==ownKey)return;
  endTurnPending=true;render();
  const request={id:`end-${uid()}`,senderId:String(me.id),senderName:String(currentMine?.name||me.name||"Character"),activeKey,round:Math.max(1,num(combat.round)),time:Date.now()};
  try{await OBR.broadcast.sendMessage(EVENT_CHANNEL,{type:"turn-end-request","turn-end-request":request},{destination:"ALL"})}
  catch(e){console.warn("end turn request",e);endTurnPending=false;render()}
  setTimeout(()=>{if(endTurnPending){endTurnPending=false;render()}},5000);
}
async function handleEndTurnRequest(request={}){
  if(me.role!=="GM"||combatBusy)return;
  const id=String(request.id||"");if(!id||handledEndTurnRequests.has(id))return;handledEndTurnRequests.add(id);
  if(handledEndTurnRequests.size>80)handledEndTurnRequests.delete(handledEndTurnRequests.values().next().value);
  const md=await OBR.scene.getMetadata(),combat=md?.[SCENE_COMBAT_KEY]||{},expected=`player:${String(request.senderId||"")}`;
  if(!combat.started||String(combat.activeKey||"")!==expected||String(request.activeKey||"")!==expected||Math.max(1,num(combat.round))!==Math.max(1,num(request.round)))return;
  await gmCombat("next");
}
async function gmCombat(mode){
  if(me.role!=="GM"||combatBusy)return;
  combatBusy=true;
  try{
    const md=await OBR.scene.getMetadata(),players=await playerRecords(md),order=buildOrder(players,Array.isArray(md?.[SCENE_MONSTERS_KEY])?md[SCENE_MONSTERS_KEY]:[]),combat=md?.[SCENE_COMBAT_KEY]||{},ui=md?.[SCENE_INIT_TRACKER_UI_KEY]||{};
    if(mode==="reset"){await setCombatState({started:false,round:0,activeKey:""},null,ui);return;}
    if(!order.length)return;
    if(mode==="start"||!combat.started){const nextState={started:true,round:1,activeKey:order[0].key};await setCombatState(nextState,null,ui);trackerSfx("initiative",{broadcast:true,activeKey:nextState.activeKey,ownerCue:"turnmine"});return;}
    let i=order.findIndex(x=>x.key===String(combat.activeKey||""));if(i<0)i=-1;
    if(mode==="undo"){
      const undo=ui?.undo||{};
      if(!undo.activeKey||String(combat.activeKey||"")!==String(undo.expectedActiveKey||"")||Math.max(1,num(combat.round))!==Math.max(1,num(undo.expectedRound)))return;
      await setCombatState({started:true,round:Math.max(1,num(undo.round)),activeKey:String(undo.activeKey)},null,ui);return;
    }
    const next=(i+1)%order.length,round=next===0?Math.max(1,num(combat.round))+1:Math.max(1,num(combat.round));
    const nextState={started:true,round,activeKey:order[next].key},undo={round:Math.max(1,num(combat.round)),activeKey:String(combat.activeKey||""),expectedRound:round,expectedActiveKey:nextState.activeKey};
    await setCombatState(nextState,undo,ui);
    trackerSfx("initiative",{broadcast:true,activeKey:nextState.activeKey,ownerCue:"turnmine"});
  }catch(e){console.warn("tracker GM combat",e)}finally{combatBusy=false;render();}
}
async function render(){if(trackerDrag){trackerRenderPending=true;return}try{
  if(!await OBR.scene.isReady()){host.innerHTML='<div class="empty">SCENE NOT READY</div>';return}
  const md=await OBR.scene.getMetadata(),ui=md?.[SCENE_INIT_TRACKER_UI_KEY]||{},collapsed=trackerCollapsedLocal(),orientation=trackerOrientationLocal(),combat=md?.[SCENE_COMBAT_KEY]||{};
  const players=await playerRecords(md),order=buildOrder(players,Array.isArray(md?.[SCENE_MONSTERS_KEY])?md[SCENE_MONSTERS_KEY]:[]),mine=players.find(p=>String(p.id)===String(me.id))?.sheet||null;
  currentMine=mine;maybeWarnUpcoming(order,combat);
  const ownKey=`player:${me.id}`,active=!!combat.started&&String(combat.activeKey||""),ownTurn=active&&String(combat.activeKey||"")===ownKey;
  const undo=ui?.undo||{},canUndo=active&&!!undo.activeKey&&String(combat.activeKey||"")===String(undo.expectedActiveKey||"")&&Math.max(1,num(combat.round))===Math.max(1,num(undo.expectedRound));
  if(!ownTurn)endTurnPending=false;
  if(collapsed){
    host.classList.add("is-collapsed");
    host.classList.remove("layout-horizontal");
    host.innerHTML=`<div class="collapsed-bar"><div class="collapsed-drag-handle" data-tracker-drag title="Drag to move Initiative Tracker"><b>INIT</b><small>${combat.started?`R ${Math.max(1,num(combat.round))}`:"READY"}</small></div><button type="button" data-tracker-collapse="0">OPEN</button></div>`;
    return;
  }
  host.classList.remove("is-collapsed");
  host.classList.toggle("layout-horizontal",orientation==="horizontal");
  host.classList.toggle("gm-view",me.role==="GM");
  const rot=rotatedOrder(order,combat.activeKey),gm=me.role==="GM"?`<div class="gm-controls"><button type="button" data-gm-combat="start" ${combatBusy||active?"disabled":""}>START</button><button type="button" class="next-turn" data-gm-combat="next" ${combatBusy||!order.length?"disabled":""}>NEXT</button><button type="button" data-gm-combat="reset" ${combatBusy?"disabled":""}>RESET</button></div>`:"";
  const undoButton=me.role==="GM"?`<button type="button" class="tracker-undo-floating" data-gm-combat="undo" ${combatBusy||!canUndo?"disabled":""}>UNDO</button>`:"";
  const layoutButton=`<button type="button" class="tracker-layout-floating" data-tracker-layout="${orientation==="horizontal"?"vertical":"horizontal"}">${orientation==="horizontal"?"VERTICAL":"HORIZONTAL"}</button>`;
  const endTurn=me.role!=="GM"&&ownTurn?`<button type="button" class="end-turn" data-end-turn ${endTurnPending?"disabled":""}>${endTurnPending?"WAITING…":"END TURN"}</button>`:"";
  const localHide=`<button type="button" class="hide-tracker" data-tracker-collapse="1">HIDE</button>`;
  host.innerHTML=`<aside class="tracker-tools"><div class="tracker-drag-handle" data-tracker-drag title="Drag to move Initiative Tracker" aria-label="Drag Initiative Tracker">⋮⋮ MOVE TRACKER</div><div class="round ${active?"active":"ready"}"><small>${active?"ROUND":"INIT"}</small><b>${active?Math.max(1,num(combat.round)):"—"}</b></div><button type="button" class="roll-init" data-roll-init ${mine&&!mine.deleted&&num(mine.hp?.current)>0?"":"disabled"}>ROLL INITIATIVE</button>${endTurn}${localHide}${gm}</aside><section class="queue">${rot.map((x,n)=>entryHTML(x,active&&n===0&&x.key===String(combat.activeKey||""),active&&n===1&&x.kind==="player"&&String(x.id)===String(me.id))).join("")||'<div class="empty">NO ACTIVE COMBATANTS</div>'}</section><div class="tracker-floating-actions">${layoutButton}${undoButton}</div>${initiativePromptHTML()}`;
}catch(e){console.warn("initiative tracker",e);host.innerHTML='<div class="empty">TRACKER SYNC ERROR</div>'}}
document.addEventListener("pointerdown",e=>{
  const handle=e.target.closest?.("[data-tracker-drag]");if(!handle||e.button!==0||trackerDrag)return;
  e.preventDefault();
  trackerDrag={id:e.pointerId,startX:e.screenX,startY:e.screenY,lastX:e.screenX,lastY:e.screenY,moved:false,previewAt:0};
  handle.classList.add("dragging");
  try{handle.setPointerCapture(e.pointerId)}catch{}
});
document.addEventListener("pointermove",e=>{
  const drag=trackerDrag;if(!drag||drag.id!==e.pointerId)return;
  drag.lastX=e.screenX;drag.lastY=e.screenY;
  const dx=e.screenX-drag.startX,dy=e.screenY-drag.startY;
  if(Math.hypot(dx,dy)<5&&!drag.moved)return;
  drag.moved=true;
  if(Date.now()-drag.previewAt<100)return;
  drag.previewAt=Date.now();
  postControl({type:"tracker-move-preview",dx,dy,time:Date.now()});
});
function finishTrackerDrag(e,cancelled=false){
  const drag=trackerDrag;if(!drag||drag.id!==e.pointerId)return;
  trackerDrag=null;
  document.querySelector("[data-tracker-drag].dragging")?.classList.remove("dragging");
  if(!cancelled&&drag.moved){postControl({type:"tracker-move",dx:e.screenX-drag.startX,dy:e.screenY-drag.startY,time:Date.now()})}
  else postControl({type:"tracker-move-preview-end",time:Date.now()});
  if(trackerRenderPending){trackerRenderPending=false;render()}
}
document.addEventListener("pointerup",e=>finishTrackerDrag(e));
document.addEventListener("pointercancel",e=>finishTrackerDrag(e,true));
document.addEventListener("click",e=>{
  const collapse=e.target.closest?.("[data-tracker-collapse]");if(collapse){setTrackerCollapsed(String(collapse.dataset.trackerCollapse)==="1").catch(console.error);return;}
  const layout=e.target.closest?.("[data-tracker-layout]");if(layout){setTrackerOrientation(String(layout.dataset.trackerLayout||"vertical")).catch(console.error);return;}
  const gm=e.target.closest?.("[data-gm-combat]");if(gm){gmCombat(String(gm.dataset.gmCombat||"")).catch(console.error);return;}
  const end=e.target.closest?.("[data-end-turn]");if(end&&!end.disabled){requestEndOwnTurn().catch(console.error);return;}
  const close=e.target.closest?.("[data-init-close]");if(close){initiativePrompt=false;initiativeResult=null;render();return;}
  const cancel=e.target.closest?.("[data-init-cancel]");if(cancel){initiativePrompt=false;initiativeResult=null;render();return;}
  const monster=e.target.closest?.("[data-open-monster-sheet]");if(monster){postControl({type:"monster-study-sheet",monsterId:String(monster.dataset.openMonsterSheet||""),time:Date.now()});return;}
  const b=e.target.closest?.("[data-roll-init]");if(!b||b.disabled||rolling)return;initiativeResult=null;initiativePrompt=true;render();
});
document.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const monster=e.target.closest?.("[data-open-monster-sheet]");if(!monster)return;e.preventDefault();postControl({type:"monster-study-sheet",monsterId:String(monster.dataset.openMonsterSheet||""),time:Date.now()});});
document.addEventListener("submit",e=>{const form=e.target.closest?.("[data-init-form]");if(!form)return;e.preventDefault();const fd=new FormData(form),mod=Number(fd.get("mod")||0);rollOwnInitiative(Number.isFinite(mod)?mod:0).catch(console.error);});
OBR.onReady(async()=>{me={id:String(OBR.player.id),name:await OBR.player.getName(),role:await OBR.player.getRole()};party=await OBR.party.getPlayers();OBR.broadcast.onMessage(EVENT_CHANNEL,e=>{const d=e.data||{};if(d.type==="turn-end-request")handleEndTurnRequest(d["turn-end-request"]||{}).catch(console.error)});await render();OBR.party.onChange(p=>{party=p;render()});OBR.player.onChange(()=>render());OBR.scene.onMetadataChange(()=>render());OBR.scene.onReadyChange(r=>{if(r)render()})});
