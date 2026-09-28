const NS="com.lynx.fabula-unified";
const CHANNEL=`${NS}/companion-hud-control-v1`;
const META_KEY=`${NS}/sheet`;
const params=new URLSearchParams(location.search);
const key=params.get("key")||"actions";
const label=params.get("label")||key.toUpperCase();
const tone=params.get("tone")||"";
const startPos={x:Number(params.get("x"))||0,y:Number(params.get("y"))||0};
const viewport={w:Number(params.get("vw"))||0,h:Number(params.get("vh"))||0};
document.body.dataset.key=key;
if(tone)document.body.dataset.tone=tone;
const ICONS={
  clock:`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="10"/><path d="M16 10v7l5 3"/></svg>`,
  codex:`<svg viewBox="0 0 32 32"><path d="M7 7h8a5 5 0 0 1 5 5v13h-8a5 5 0 0 0-5 2V7Z"/><path d="M25 7h-5a5 5 0 0 0-5 5v13h5a5 5 0 0 1 5 2V7Z"/></svg>`,
  shop:`<svg viewBox="0 0 32 32"><path d="M7 13h18l-2 13H9L7 13Z"/><path d="M11 13V9a5 5 0 0 1 10 0v4"/></svg>`,
  broadcast:`<svg viewBox="0 0 32 32"><path d="M7 17a9 9 0 0 1 0-2l4-2V8l11-4v24l-11-4v-5l-4-2Z"/><path d="M8 21v5M5 22v3"/></svg>`,
  loot:`<svg viewBox="0 0 32 32"><path d="M7 12h18v14H7z"/><path d="M10 12V8h12v4M16 12v14M7 17h18"/></svg>`,
  groupcheck:`<svg viewBox="0 0 32 32"><circle cx="11" cy="12" r="3"/><circle cx="21" cy="12" r="3"/><path d="M5 26c1-5 3-8 6-8s5 3 6 8M15 26c1-5 3-8 6-8s5 3 6 8"/></svg>`,
  roll:`<svg viewBox="0 0 32 32"><rect x="7" y="7" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="1.2"/><circle cx="20" cy="12" r="1.2"/><circle cx="16" cy="16" r="1.2"/><circle cx="12" cy="20" r="1.2"/><circle cx="20" cy="20" r="1.2"/></svg>`,
  settings:`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="4"/><path d="M16 5v4M16 23v4M5 16h4M23 16h4M8.2 8.2l2.8 2.8M21 21l2.8 2.8M23.8 8.2 21 11M11 21l-2.8 2.8"/></svg>`,
  vault:`<svg viewBox="0 0 32 32"><rect x="6" y="8" width="20" height="17" rx="2"/><circle cx="16" cy="16" r="5"/><path d="M16 13v3l2 2M9 25v2M23 25v2"/></svg>`,
  class:`<svg viewBox="0 0 32 32"><path d="M7 7h18v18H7z"/><path d="M11 11h10M11 16h10M11 21h6"/></svg>`,
  equipment:`<svg viewBox="0 0 32 32"><path d="M8 24 21 11M18 8l6 6M7 25l4-1-3-3-1 4Z"/><path d="M19 7l6 6"/></svg>`,
  spheres:`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="9"/><circle cx="16" cy="16" r="4"/><path d="M16 4v4M16 24v4M4 16h4M24 16h4"/></svg>`,
  items:`<svg viewBox="0 0 32 32"><path d="M9 11h14l-1 15H10L9 11Z"/><path d="M12 11V8h8v3M12 16h8"/></svg>`,
  bond:`<svg viewBox="0 0 32 32"><path d="M11.5 9.5a5 5 0 0 0 0 7l3 3a5 5 0 0 0 7-7l-1-1"/><path d="M20.5 22.5a5 5 0 0 0 0-7l-3-3a5 5 0 0 0-7 7l1 1"/></svg>`,
  arcana:`<svg viewBox="0 0 32 32"><path d="m16 5 2.7 6.3L25 14l-6.3 2.7L16 23l-2.7-6.3L7 14l6.3-2.7L16 5Z"/><circle cx="16" cy="14" r="10"/></svg>`,
  actions:`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="9"/><circle cx="16" cy="16" r="3"/><path d="M16 3v5M16 24v5M3 16h5M24 16h5"/></svg>`,
  studyhinder:`<svg viewBox="0 0 32 32"><circle cx="14" cy="14" r="7"/><path d="m19 19 7 7M11 14h6M14 11v6"/></svg>`,
  travel:`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11"/><path d="m20 10-3 7-7 3 3-7 7-3Z"/></svg>`,
  status:`<svg viewBox="0 0 32 32"><circle cx="16" cy="10" r="4"/><path d="M8 26c1-6 4-9 8-9s7 3 8 9"/><path d="M5 16h5M22 16h5M16 3v3"/></svg>`,
  dominion:`<svg viewBox="0 0 32 32"><path d="M6 12 10 6l6 5 6-5 4 6-3 13H9L6 12Z"/><path d="M11 17c2-3 8-3 10 0-2 3-8 3-10 0Z"/><circle cx="16" cy="17" r="1.6"/></svg>`,
  zero:`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11"/><path d="M16 5v5M25.5 10.5l-4.3 2.5M25.5 21.5l-4.3-2.5M16 27v-5M6.5 21.5l4.3-2.5M6.5 10.5l4.3 2.5"/><circle cx="16" cy="16" r="3"/></svg>`,
  sheet:`<svg viewBox="0 0 32 32"><path d="M9 5h11l4 4v18H9z"/><path d="M20 5v5h5M12 14h9M12 18h9M12 22h6"/></svg>`,
  notes:`<svg viewBox="0 0 32 32"><path d="M8 5h13l3 3v19H8z"/><path d="M21 5v5h5M12 14h10M12 18h10M12 22h6"/><path d="M7 8H5v21h15v-2"/></svg>`
};
const btn=document.getElementById("shortcut");
document.getElementById("icon").innerHTML=ICONS[key]||ICONS.actions;
document.getElementById("label").textContent=label;
btn.title=label;
btn.setAttribute("aria-label",`${label} shortcut · click to open · drag to move`);
const posEl=document.createElement("span");
posEl.id="position";
posEl.className="hud-position";
posEl.setAttribute("aria-hidden","true");
btn.appendChild(posEl);
function fmtPos(x=startPos.x,y=startPos.y){
  const parts=[`X ${Math.round(x)}`,`Y ${Math.round(y)}`];
  if(viewport.w&&viewport.h)parts.push(`${Math.round((x/viewport.w)*100)}% · ${Math.round((y/viewport.h)*100)}%`);
  return parts.join(" · ");
}
function updatePositionLabel(x=startPos.x,y=startPos.y,dx=0,dy=0){
  posEl.textContent=dx||dy?`${fmtPos(x,y)} · Δ ${dx>=0?"+":""}${Math.round(dx)},${dy>=0?"+":""}${Math.round(dy)}`:fmtPos(x,y);
}
updatePositionLabel();
let bus=null;try{bus=new BroadcastChannel(CHANNEL)}catch{}
function send(data){try{bus?.postMessage({...data,key,time:Date.now()})}catch{}}
let drag=null;
btn.addEventListener("pointerdown",e=>{if(e.button!==0)return;drag={id:e.pointerId,startX:Number(e.screenX)||0,startY:Number(e.screenY)||0,lastX:Number(e.screenX)||0,lastY:Number(e.screenY)||0,moved:false,previewAt:0};btn.classList.add("drag-armed");updatePositionLabel();try{btn.setPointerCapture(e.pointerId)}catch{}});
btn.addEventListener("pointermove",e=>{if(!drag||drag.id!==e.pointerId)return;drag.lastX=Number(e.screenX)||drag.lastX;drag.lastY=Number(e.screenY)||drag.lastY;const dx=drag.lastX-drag.startX,dy=drag.lastY-drag.startY;if(Math.hypot(dx,dy)>5){drag.moved=true;btn.classList.add("dragging");updatePositionLabel(startPos.x+dx,startPos.y+dy,dx,dy);const now=Date.now();if(now-drag.previewAt>55){drag.previewAt=now;send({type:"move-preview",dx,dy})}}});
function clearDragUi(){btn.classList.remove("dragging","drag-armed");updatePositionLabel();send({type:"move-preview-end"})}
function endDrag(e){if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;try{btn.releasePointerCapture(e.pointerId)}catch{}if(d.moved){const endX=Number(e.screenX)||d.lastX,endY=Number(e.screenY)||d.lastY,dx=endX-d.startX,dy=endY-d.startY;updatePositionLabel(startPos.x+dx,startPos.y+dy,dx,dy);send({type:"move",dx,dy})}else{clearDragUi();send({type:"menu"})}}
btn.addEventListener("pointerup",endDrag);btn.addEventListener("pointercancel",e=>{if(drag&&drag.id===e.pointerId){drag=null;clearDragUi()}});btn.addEventListener("contextmenu",e=>e.preventDefault());
if(key==="zero")import("https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm").then(({default:OBR})=>OBR.onReady(()=>{const badge=document.getElementById("charge"),update=raw=>{const current=Math.max(0,Math.min(6,Number(raw?.zeroPower?.current)||0)),full=current>=6;badge.hidden=false;badge.textContent=full?"FULL":`${current}/6`;document.body.dataset.zeroFull=full?"1":"0"};OBR.player.getMetadata().then(md=>update(md?.[META_KEY])).catch(()=>update(null));OBR.player.onChange(p=>update(p?.metadata?.[META_KEY]))})).catch(()=>{});
