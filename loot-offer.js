import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
const NS="com.lynx.fabula-unified",KEY=`${NS}/loot-offer-pending-v1`,CONTROL=`${NS}/companion-hud-control-v1`,MODAL=`${NS}/loot-offer-modal-v1`;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let me="",busy=false,activeId="",bus=null,timer=0;
function offers(){try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");return Array.isArray(saved)?saved:(saved?.payload?[saved]:[])}catch{return []}}
function current(){return offers().find(row=>row?.payload?.id&&Date.now()-Number(row.receivedAt||0)<7200000&&(row.payload.targets||[]).map(String).some(id=>id==="ALL_PLAYERS"||id===me))?.payload}
function render(error=""){
  const x=current(),host=document.querySelector("#app");if(!host)return;
  if(!x){host.innerHTML='<small>FABULA · LOOT</small><h1>No offers waiting</h1>';return}
  activeId=String(x.id);const n=offers().length,fp=x.kind==="fp",kind=fp?"FABULA POINT · +1":x.kind==="sphere"?"SPHERE":"ITEM";
  host.innerHTML=`<div class="head"><small>FABULA · LOOT OFFER</small><small>${n>1?`${n} WAITING`:"READY TO RECEIVE"}</small></div><h1>${esc(x.name||kind)}</h1><div class="type">${kind}${x.itemType?` · ${esc(x.itemType)}`:""}</div>${x.description?`<p>${esc(x.description)}</p>`:""}<div class="sender">FROM ${esc(x.senderName||"GAME MASTER")}</div><div class="error" role="status">${esc(error)}</div><div class="actions"><button data-decline ${busy?"disabled":""}>DECLINE</button><button class="primary" data-accept ${busy?"disabled":""}>${busy?"SAVING…":"RECEIVE"}</button></div>`;
}
function submit(type){if(busy||!activeId||!bus)return;busy=true;const id=activeId;render();bus.postMessage({type,offerId:id});clearTimeout(timer);timer=setTimeout(()=>{if(busy&&activeId===id){busy=false;render("No response yet. Please try again.")}},8000)}
document.addEventListener("click",e=>{if(e.target.closest("[data-accept]"))submit("loot-offer-accept");if(e.target.closest("[data-decline]"))submit("loot-offer-decline")});
window.addEventListener("storage",e=>{if(e.key===KEY&&!busy)render()});
OBR.onReady(async()=>{try{me=String(await OBR.player.getId());bus=new BroadcastChannel(CONTROL);bus.onmessage=e=>{const d=e.data||{};if(d.type!=="loot-offer-result"||String(d.offerId)!==activeId)return;clearTimeout(timer);busy=false;if(d.ok){if(current())render();else OBR.modal.close(MODAL).catch(console.warn)}else render(d.error||"Could not save Loot. Try again.")};render()}catch(e){document.querySelector("#app").textContent=`Could not load Loot: ${e?.message||e}`}});
