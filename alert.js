import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
const NS="com.lynx.fabula-unified", KEY=`${NS}/cinematic-alert`, MODAL=`${NS}/cinematic-alert-modal`, THEME_KEY=`${NS}/theme-v1`, CUTIN_CONTROL=`${NS}/skill-cutin-control-v1`, ALERT_CONTROL=`${NS}/cinematic-alert-control-v1`;
let currentAlert=null;
try{document.documentElement.dataset.uiTheme=localStorage.getItem(THEME_KEY)==="phantom"?"phantom":"default"}catch{document.documentElement.dataset.uiTheme="default"}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rollOutcome=x=>{const d1=Number(x?.d1),d2=Number(x?.d2),same=Number.isFinite(d1)&&Number.isFinite(d2)&&d1===d2,fumble=!!x?.fumble||(same&&d1===1),critical=!fumble&&!!x?.critical,double=same&&!critical&&!fumble;return fumble?["fumble","FUMBLE"]:critical?["critical","CRITICAL"]:double?["double","DOUBLE"]:["",""]};
const rollOutcomeBadge=x=>{const [k,label]=rollOutcome(x);return k?`<span class="roll-outcome-badge ${k}">${label}</span>`:""};
const gifFrom=t=>{const m=String(t||"").match(/https?:\/\/[^\s<>"']+\.(?:gif|webp|png|jpe?g)(?:\?[^\s<>"']*)?/i);return m?.[0]||""};
const strip=t=>String(t||"").replace(/https?:\/\/[^\s<>"']+\.(?:gif|webp|png|jpe?g)(?:\?[^\s<>"']*)?/ig,"").trim();
const ELEMENT_SVG={none:'<circle cx="8" cy="8" r="5"/><path d="M4.5 11.5 11.5 4.5"/>',physical:'<path d="M4 12 12 4M9 4h3v3M3 13l3-1-2-2-1 3Z"/>',air:'<path d="M2 5h8c2 0 2-3 0-3M2 8h11c2 0 2 3 0 3M2 11h6"/>',bolt:'<path d="M9 1 4 8h4l-1 7 5-8H8l1-6Z"/>',dark:'<path d="M11.5 2.5A6 6 0 1 0 13.5 12 5.2 5.2 0 0 1 11.5 2.5Z"/>',earth:'<path d="M8 1.5 14 6v5L8 14.5 2 11V6l6-4.5Z"/><path d="m2 6 6 3 6-3M8 9v5.5"/>',fire:'<path d="M8.2 1.5c.7 3-2.7 3.5-2.2 6 .3 1.2 1.1 1.8 2 2.2-.3-1.5.8-2.5 2-3.4.3 2.3 2.7 3 2 5.6-.5 1.7-2 2.6-4 2.6-3 0-5-1.8-5-4.5 0-3.3 3.1-4.7 5.2-8.5Z"/>',ice:'<path d="M8 1v14M2 4.5l12 7M14 4.5l-12 7"/>',light:'<circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5 13 13M13 3l-1.5 1.5M4.5 11.5 3 13"/>',poison:'<path d="M6 2h4M7 2v3l-3.5 5.5A2 2 0 0 0 5.2 14h5.6a2 2 0 0 0 1.7-3.5L9 5V2"/><path d="M5 10h6"/>'};
const elIcon=e=>{const k=ELEMENT_SVG[e]?e:'none';return `<span class="element-icon el-${k}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ELEMENT_SVG[k]}</svg></span>`};
function fitAlertCard(){
  const card=document.querySelector(".card");
  if(!card)return;
  card.classList.remove("fit-tight","fit-tighter","fit-min");
  card.style.transform="";
  const limitW=Math.max(160,window.innerWidth-20),limitH=Math.max(120,window.innerHeight-20);
  const tooLarge=()=>card.scrollHeight>limitH||card.scrollWidth>limitW;
  if(tooLarge())card.classList.add("fit-tight");
  if(tooLarge())card.classList.add("fit-tighter");
  if(tooLarge())card.classList.add("fit-min");
  // Final screen-space fit: keep every supplied detail visible without an inner scrollbar.
  const w=Math.max(card.scrollWidth,card.offsetWidth,1),h=Math.max(card.scrollHeight,card.offsetHeight,1);
  const scale=Math.min(1,limitW/w,limitH/h);
  if(scale<.999)card.style.transform=`scale(${scale})`;
}
function scheduleFit(){
  requestAnimationFrame(()=>requestAnimationFrame(fitAlertCard));
  document.querySelectorAll(".card img").forEach(img=>{
    if(!img.complete)img.addEventListener("load",fitAlertCard,{once:true});
  });
}
function signalCutInClose(){
  if(!currentAlert?.cutIn)return;
  const message={type:"close",rollId:String(currentAlert.id||""),time:Date.now()};
  try{const bus=new BroadcastChannel(CUTIN_CONTROL);bus.postMessage(message);setTimeout(()=>bus.close(),0)}catch{try{localStorage.setItem(`${CUTIN_CONTROL}:event`,JSON.stringify({...message,id:`${Date.now()}-${Math.random()}`}))}catch{}}
}
function signalAlertClose(){
  const message={type:"close",time:Date.now()};
  try{const bus=new BroadcastChannel(ALERT_CONTROL);bus.postMessage(message);setTimeout(()=>bus.close(),0)}catch{try{localStorage.setItem(`${ALERT_CONTROL}:event`,JSON.stringify({...message,id:`${Date.now()}-${Math.random()}`}))}catch{}}
}
function closeAlert(){ signalCutInClose();signalAlertClose();OBR.modal.close(MODAL).catch(()=>{}); }
function autoCloseAlert(ms){ setTimeout(()=>closeAlert(),Math.max(250,Number(ms)||1200)); }
function bindDismiss(){
  const card=document.querySelector(".card");
  if(card) card.addEventListener("click", ()=>closeAlert());
  document.querySelector(".close")?.addEventListener("click", (e)=>{ e.stopPropagation(); closeAlert(); });
}
function equipmentShare(x){
  const e=x.equipment||{}, spheres=Array.from({length:4},(_,i)=>e.spheres?.[i]||null);
  const slots=spheres.map((sp,i)=>`<div class="eq-slot slot-${i}"><span class="eq-orb"></span><small>SPHERE ${i+1}</small><b>${sp?esc(sp.name||"SPHERE"):"EMPTY"}</b>${sp?.sphereType?`<em>${esc(sp.sphereType)}</em>`:""}</div>`).join("");
  const center=e.imageUrl?`<img src="${esc(e.imageUrl)}">`:`<div class="eq-empty">NO IMAGE</div>`;
  const effects=Array.isArray(e.effects)?e.effects:[];
  const fx=effects.length?effects.map(v=>`<div class="eq-effect"><b>${esc(v.name||"SPHERE EFFECT")}</b>${v.sphereType?`<small>${esc(v.sphereType)}</small>`:""}<div>${esc(strip(v.detail||"")).replace(/\n/g,"<br>")}</div>${gifFrom(v.detail||"")?`<img src="${esc(gifFrom(v.detail||""))}">`:""}</div>`).join(""):`<div class="eq-none">SELECTED SPHERES HAVE NO SET EFFECT DETAILS</div>`;
  const detail=strip(e.detail||"");
  return `<section class="card share equipment-share"><button class="close">×</button><div class="content"><div class="kicker">${esc(x.senderName)} · SENT EQUIPMENT</div><h1>${esc(e.name||x.title||"EQUIPMENT")}</h1>${e.weaponType?`<div class="eq-type">${esc(e.weaponType)}</div>`:""}<div class="eq-layout"><div class="eq-orbit"><div class="eq-ring"></div>${slots}<div class="eq-center">${center}<strong>${esc(e.name||"EQUIPMENT")}</strong></div></div><aside class="eq-side"><div class="eq-title">SPHERE SET EFFECTS</div><div class="eq-effects">${fx}</div><div class="eq-title detail-title">EQUIPMENT DETAIL</div>${detail?`<div class="eq-detail">${esc(detail).replace(/\n/g,"<br>")}</div>`:`<div class="eq-none">NO EQUIPMENT DETAIL</div>`}</aside></div></div></section>`;
}
function rollTargetsHTML(x){
  if(x?.actorKind!=="monster"||!Array.isArray(x.targetResults)||!x.targetResults.length)return "";
  return `<div class="roll-targets"><b>TARGET${x.targetResults.length>1?"S":""}</b>${x.targetResults.map(t=>{
    if(typeof t.hit!=="boolean")return `<span>${esc(t.name)}</span>`;
    const damage=t.hit&&t.damage!=null&&Number.isFinite(Number(t.damage))?` · ${esc(t.affinity||"NORMAL")} · ${Number(t.damage)}`:"";
    return `<span class="target-${t.hit?"hit":"miss"}">${esc(t.name)} · <b>${t.hit?"HIT":"MISS"}</b>${damage}</span>`;
  }).join("")}</div>`;
}
function render(x){
  currentAlert=x||null;
  const host=document.getElementById("alert");if(!x){host.innerHTML="";return}
  if(x.kind==="phase-change"){
    const portrait=x.portrait?`<div class="phase-portrait"><img src="${esc(x.portrait)}"></div>`:`<div class="phase-portrait empty"><span>Ⅱ</span></div>`;
    host.innerHTML=`<section class="card phase-change-card"><div class="phase-scan"></div><div class="phase-warning">BOSS PHASE</div>${portrait}<div class="phase-copy"><div class="kicker">PHASE TRANSITION</div><div class="phase-label">${esc(x.phaseLabel||"NEXT PHASE")}</div><h1>${esc(x.name||"MONSTER")}</h1>${x.fromName&&x.fromName!==x.name?`<div class="phase-route">${esc(x.fromName)} <b>→</b> ${esc(x.name)}</div>`:""}</div></section>`;
    scheduleFit();autoCloseAlert(3000);return;
  }
  if(x.kind==="gm-broadcast"){
    const type=["warning","objective","anomaly","phase"].includes(String(x.broadcastType||"").toLowerCase())?String(x.broadcastType).toLowerCase():"warning";
    const meta={warning:["EMERGENCY BROADCAST","!"],objective:["MISSION CONTROL","◆"],anomaly:["ANOMALY ALERT","◉"],phase:["CONTAINMENT UPDATE","Ⅱ"]}[type];
    host.innerHTML=`<section class="card gm-broadcast gm-broadcast-${type}"><button class="close">×</button><div class="gm-broadcast-scan"></div><div class="content"><div class="gm-broadcast-symbol">${meta[1]}</div><div class="kicker">${esc(meta[0])}</div><h1>${esc(x.title||type.toUpperCase())}</h1>${strip(x.body)?`<div class="gm-broadcast-body">${esc(strip(x.body)).replace(/\n/g,"<br>")}</div>`:""}<div class="gm-broadcast-footer">GM BROADCAST · ${esc(x.senderName||"GAME MASTER")}</div></div></section>`;
    bindDismiss();scheduleFit();return;
  }
  if(x.kind==="share"&&x.shareType==="equipment"&&x.equipment){host.innerHTML=equipmentShare(x);bindDismiss();scheduleFit();return}
  const media=x.gif||x.media||gifFrom(x.detail||x.body||"");
  if(x.kind==="roll"){
    if(x.isStudy){
      const total=Number(x.total)||0,tier=Number(x.suggestedStudyTier)||(total>=13?13:total>=10?10:total>=7?7:0),prev=Number(x.studyPreviousTier)||0,unlocked=Number(x.studyUnlockedTier)||tier;
      const target=x.studyTargetId?`TARGET · ${esc(x.studyTargetName||"MONSTER")}${x.studyPhaseLabel?` · ${esc(x.studyPhaseLabel)}`:""}`:"NO TARGET · STUDY CHECK ONLY";
      const discoveries=Array.isArray(x.studyDiscoveries)?x.studyDiscoveries:[];
      const result=x.studyTargetId?(unlocked>prev?`NEW STUDY ${unlocked}+`:tier?`STUDY ${unlocked||prev}+ · NO NEW DISCOVERY`:"STUDY FAILED · NO UNLOCK"):(tier?`CHECK RESULT · ${tier}+`:"CHECK RESULT · BELOW 7");
      const discovery=x.studyTargetId?`<div class="study-discovery ${discoveries.length?"unlocked":"none"}"><div class="study-discovery-title">${discoveries.length?"NEW DISCOVERY":"NO NEW DISCOVERY"}</div>${discoveries.length?`<div class="study-discovery-grid">${discoveries.map(d=>`<span><b>NEW</b>${esc(d)}</span>`).join("")}</div>`:`<small>ข้อมูลที่เปิดไว้ก่อนหน้ายังคงอยู่ · STUDY ${Math.max(prev,unlocked)||0}</small>`}</div>`:"";
      host.innerHTML=`<section class="card ${x.critical?"critical":""}"><button class="close">×</button>${media?`<div class="media"><img src="${esc(media)}"></div>`:""}<div class="content"><div class="kicker">${esc(x.senderName)} · STUDY CHECK</div><h1>${esc(x.label)}</h1><div class="detail">${target}</div><div class="dice"><div class="die"><div><small>d${x.size1}</small><b>${x.d1}</b></div></div><span class="plus">+</span><div class="die"><div><small>d${x.size2}</small><b>${x.d2}</b></div></div>${Number(x.mod)?`<span class="plus">${Number(x.mod)>0?"+":"−"}</span><div class="die"><div><small>MOD</small><b>${Math.abs(Number(x.mod))}</b></div></div>`:""}</div><div class="result"><strong>${total}</strong><span>${result}</span>${rollOutcomeBadge(x)}</div>${discovery}<div class="detail">INS + INS + MOD</div></div></section>`;
    }else{
    const high=Number.isFinite(Number(x.highResult))?Number(x.highResult):Math.max(Number(x.d1)||0,Number(x.d2)||0);
    const damageHigh=Number.isFinite(Number(x.damageHighRoll))?Number(x.damageHighRoll):((x.twoWeapon||String(x.actionCategory||"").toUpperCase()==="TWO WEAPON")?0:high);
    const hasDamage=Number.isFinite(Number(x.damage));
    if(hasDamage){
      const base=Number(x.damage)||0,affinity=String(x.affinity||"NORMAL").toUpperCase();
      const vuln=base*2,res=Math.ceil(base/2),active=affinity==="VULNERABILITY"?"vuln":affinity==="RESISTANCE"?"res":"normal";
      const element=x.element&&x.element!=="none"?String(x.element).toUpperCase():"UNTYPED";
      const detail=strip(x.detail||"");
      host.innerHTML=`<section class="card action ${x.critical?"critical":""}"><button class="close">×</button>${media?`<div class="media compact"><img src="${esc(media)}"></div>`:""}<div class="content"><div class="kicker">${esc(x.senderName)} · ROLL</div><h1>${esc(x.label)}</h1>${rollTargetsHTML(x)}${detail?`<div class="detail popup-detail-scroll detail-before-roll">${esc(detail).replace(/\n/g,"<br>")}</div>`:""}<div class="accuracy-formula"><span>${esc(x.attr1)} <b>${x.d1}</b></span><i>+</i><span>${esc(x.attr2)} <b>${x.d2}</b></span><i>+</i><span>MOD <b>${Number(x.mod)||0}</b></span><i>=</i><span class="accuracy-total">ACCURACY <b>${Number(x.total)||0}</b></span><span class="hr-total">${x.twoWeapon?"HR · TWO WEAPON":"HR"} <b>${damageHigh}</b></span></div>${rollOutcomeBadge(x)}<div class="damage-formula-banner"><b>${x.twoWeapon?"TWO WEAPON · HR 0":`HR ${damageHigh}`}</b><i>+</i><span>DAMAGE BONUS ${Number(x.damageHR)||0}</span>${Number(x.autoDamageBonus)?`<i>+</i><span>LEVEL ${Number(x.autoDamageBonus)>0?"+":""}${Number(x.autoDamageBonus)}</span>`:""}<i>=</i><strong>${base}</strong></div><div class="damage-compare"><div class="damage-cell vuln ${active==="vuln"?"active":""}"><small>VU · ×2</small><strong>${vuln}</strong><span>VULNERABILITY</span></div><div class="damage-cell normal ${active==="normal"?"active":""}"><small>NORMAL</small><strong>${base}</strong><span>${x.twoWeapon?"HR 0":`HR ${damageHigh}`} + BONUS ${Number(x.damageHR)||0}</span></div><div class="damage-cell res ${active==="res"?"active":""}"><small>RES · ÷2 ↑</small><strong>${res}</strong><span>ROUND UP</span></div></div><div class="element">${elIcon(String(x.element||"none").toLowerCase())}<span>${esc(element)}</span></div></div></section>`;
    }else{
      host.innerHTML=`<section class="card ${x.critical?"critical":""}"><button class="close">×</button>${media?`<div class="media"><img src="${esc(media)}"></div>`:""}<div class="content"><div class="kicker">${esc(x.senderName)} · ROLL</div><h1>${esc(x.label)}</h1>${rollTargetsHTML(x)}<div class="dice"><div class="die"><div><small>d${x.size1}</small><b>${x.d1}</b></div></div><span class="plus">+</span><div class="die"><div><small>d${x.size2}</small><b>${x.d2}</b></div></div></div><div class="result"><strong>${x.total}</strong><span>CHECK TOTAL · HR ${high}</span>${rollOutcomeBadge(x)}</div></div></section>`;
    }
    }
  }else{
    host.innerHTML=`<section class="card share"><button class="close">×</button>${media?`<div class="media"><img src="${esc(media)}"></div>`:""}<div class="content"><div class="kicker">${esc(x.senderName)} · SENT</div><h1>${esc(x.title)}</h1>${strip(x.body)?`<div class="detail">${esc(strip(x.body)).replace(/\n/g,"<br>")}</div>`:""}</div></section>`;
  }
  bindDismiss();
  scheduleFit();
}
window.addEventListener("resize",fitAlertCard);
// Alerts stay on screen until clicked again. Only the popup box captures clicks; the modal is not fullscreen.
OBR.onReady(()=>{let data=null;try{data=JSON.parse(localStorage.getItem(KEY)||"null")}catch{}render(data)});
