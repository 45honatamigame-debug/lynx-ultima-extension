import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

const NS="com.lynx.fabula-unified",KEY=`${NS}/scene-trackers-v1`,CONTROL_CHANNEL=`${NS}/companion-hud-control-v1`;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const gifFromText=s=>String(s||"").match(/https?:\/\/[^\s<>"']+?\.gif(?:\?[^\s<>"']*)?/i)?.[0]||"";
const stripGif=s=>String(s||"").replace(/https?:\/\/[^\s<>"']+?\.gif(?:\?[^\s<>"']*)?/ig,"").replace(/\n{3,}/g,"\n\n").trim();
let role="PLAYER",md={},progressSnapshot=null,pendingWrites=0,writeChain=Promise.resolve(),controlBus=null;

function norm(raw={}){
  const one=(x,i,p)=>{const seg=clamp(Number(x?.segments)||6,1,12);return{id:String(x?.id||`${p?"p":"c"}-${i}`),name:String(x?.name||`${p?"Project":"Clock"} ${i+1}`),detail:String(x?.detail||""),segments:seg,progress:clamp(Number(x?.progress)||0,0,seg),pinned:!!x?.pinned,objective:p?false:!!x?.objective}};
  return{clocks:(Array.isArray(raw.clocks)?raw.clocks:[]).map((x,i)=>one(x,i,false)),projects:(Array.isArray(raw.projects)?raw.projects:[]).map((x,i)=>one(x,i,true))};
}
function polar(cx,cy,r,a){const q=(a-90)*Math.PI/180;return{x:cx+r*Math.cos(q),y:cy+r*Math.sin(q)}}
function arc(cx,cy,r,a0,a1){const s=polar(cx,cy,r,a1),e=polar(cx,cy,r,a0),large=a1-a0<=180?0:1;return`M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`}
function trackerKey(kind,id){return`${kind}|${String(id)}`}
function postControl(data){try{if(!controlBus)controlBus=new BroadcastChannel(CONTROL_CHANNEL);controlBus.postMessage(data)}catch(e){console.warn("hologram control",e)}}
function trackerSfx(cue){postControl({type:"sfx",cue,broadcast:true,label:"clock-hologram",time:Date.now()})}
function dial(x,kind){
  const n=clamp(x.segments,1,12),step=360/n,gap=Math.min(8,step*.22);let paths="";
  for(let i=0;i<n;i++){const cls=i<x.progress?"filled":"empty";paths+=`<path class="${cls}" d="${arc(36,36,27,i*step+gap/2,(i+1)*step-gap/2)}" ${role==="GM"?`data-set="${kind}|${esc(x.id)}|${i+1}" style="cursor:pointer"`:""}/>`}
  return`<svg class="dial" viewBox="0 0 72 72" aria-label="${x.progress} of ${n}">${paths}<text x="36" y="36">${x.progress}/${n}</text></svg>`;
}
function rows(){
  const t=norm(md?.[KEY]||{}),out=[];
  for(const x of t.clocks)if(x.pinned)out.push({kind:"clocks",x});
  for(const x of t.projects)if(x.pinned)out.push({kind:"projects",x});
  return out;
}
function card({kind,x},pulse=""){
  const pct=Math.round((x.progress/Math.max(1,x.segments))*100),objective=kind==="clocks"&&x.objective,label=kind==="projects"?"PROJECT":objective?"OBJECTIVE":"CLOCK",complete=x.progress>=x.segments;
  const gif=gifFromText(x.detail),detail=stripGif(x.detail),media=gif?`<div class="holo-media"><img src="${esc(gif)}" alt="${esc(x.name)} animation" loading="eager" decoding="async"></div>`:"";
  return`<article class="holo-card ${objective?"objective":""} ${complete?"complete":""} ${gif?"has-media":""} ${pulse}" data-tracker-key="${esc(trackerKey(kind,x.id))}"><span class="milestone-wave" aria-hidden="true"></span>${dial(x,kind)}${media}<div class="copy"><div class="kicker"><span class="live"></span><span>${label} · SCENE LINK</span></div><b class="title">${esc(x.name)}</b>${detail?`<span class="detail">${esc(detail)}</span>`:""}<div class="progress"><span class="bar"><i style="width:${pct}%"></i></span><span class="count">${complete?"COMPLETE · ":""}${x.progress}/${x.segments}</span></div></div>${role==="GM"?`<div class="gm"><button data-step="${kind}|${esc(x.id)}|-1" title="Decrease">−</button><button data-step="${kind}|${esc(x.id)}|1" title="Increase">+</button><button class="unpin" data-unpin="${kind}|${esc(x.id)}" title="Remove from Canvas">× HUD</button></div>`:""}</article>`;
}
function render(){
  const host=document.getElementById("app"),r=rows(),next=new Map(r.map(({kind,x})=>[trackerKey(kind,x.id),Number(x.progress)||0])),pulses=new Map();
  if(progressSnapshot)for(const {kind,x} of r){const key=trackerKey(kind,x.id),before=progressSnapshot.get(key);if(Number.isFinite(before)&&x.progress>before)pulses.set(key,x.progress>=x.segments?"milestone-fill milestone-finished":"milestone-fill")}
  progressSnapshot=next;
  host.innerHTML=r.length?`<section class="holo-stack">${r.map(row=>card(row,pulses.get(trackerKey(row.kind,row.x.id))||"")).join("")}</section>`:`<div class="empty"></div>`;
}
function find(t,kind,id){return(t?.[kind]||[]).find(x=>String(x.id)===String(id))}
function mutate(fn){
  const optimistic=norm(md?.[KEY]||{});fn(optimistic);md={...md,[KEY]:optimistic};render();pendingWrites++;
  const task=writeChain.catch(()=>{}).then(async()=>{const fresh=await OBR.scene.getMetadata(),t=norm(fresh?.[KEY]||{});fn(t);await OBR.scene.setMetadata({[KEY]:t});return{...fresh,[KEY]:t}});
  writeChain=task.then(saved=>{pendingWrites=Math.max(0,pendingWrites-1);if(!pendingWrites){md=saved;render()}},async e=>{pendingWrites=Math.max(0,pendingWrites-1);console.warn("hologram tracker edit",e);if(!pendingWrites){try{md=await OBR.scene.getMetadata();render()}catch{}}});
  return task;
}
document.addEventListener("click",e=>{
  const b=e.target.closest("button,[data-set]");if(!b||role!=="GM")return;
  if(b.dataset.step){const[k,id,d]=b.dataset.step.split("|");trackerSfx(Number(d)>=0?"clockup":"clockdown");mutate(t=>{const x=find(t,k,id);if(x)x.progress=clamp(x.progress+Number(d),0,x.segments)})}
  else if(b.dataset.unpin){const[k,id]=b.dataset.unpin.split("|");trackerSfx("clockdown");mutate(t=>{const x=find(t,k,id);if(x)x.pinned=false})}
  else if(b.dataset.set){const[k,id,p]=b.dataset.set.split("|");const cur=find(norm(md?.[KEY]||{}),k,id),before=Number(cur?.progress)||0,clicked=Number(p);trackerSfx(clicked>=before?"clockup":"clockdown");mutate(t=>{const x=find(t,k,id);if(x){const before=x.progress,clicked=Number(p);x.progress=clamp(clicked===before?before-1:clicked,0,x.segments)}})}
});
OBR.onReady(async()=>{try{role=await OBR.player.getRole();if(await OBR.scene.isReady())md=await OBR.scene.getMetadata();render();OBR.scene.onMetadataChange(x=>{const incoming=x||{};md=pendingWrites?{...incoming,[KEY]:md?.[KEY]||incoming?.[KEY]}:incoming;render()})}catch(e){console.warn("clock hologram init",e)}});
