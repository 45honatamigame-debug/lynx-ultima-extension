const NS = "com.lynx.fabula-unified";
const KEY = `${NS}/skill-cutin-v1`;
const CONTROL = `${NS}/skill-cutin-control-v1`;
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const COLORS={violet:"#a984ff",cyan:"#55e8ff",blue:"#6699ff",green:"#5ce6a0",lime:"#b9ef58",gold:"#ffd35a",orange:"#ff9557",red:"#ff626f",pink:"#ff75c8",white:"#e9f2ff"};
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const mix=(hex,to,amount)=>{const a=rgb(hex),b=rgb(to),v=a.map((x,i)=>Math.round(x+(b[i]-x)*amount));return`#${v.map(x=>x.toString(16).padStart(2,"0")).join("")}`};
const alpha=(hex,a)=>{const [r,g,b]=rgb(hex);return`rgba(${r},${g},${b},${a})`};
function themeStyle(value){const key=COLORS[String(value||"").toLowerCase()]?String(value).toLowerCase():"violet",main=COLORS[key];return`--cutin-main:${main};--cutin-soft:${mix(main,"#ffffff",.35)};--cutin-dark:${mix(main,"#000000",.7)};--cutin-shadow:${mix(main,"#000000",.5)};--cutin-glow:${alpha(main,.48)};--cutin-line:${alpha(main,.14)};--cutin-faint:${alpha(main,.2)}`}

function render(payload = {}) {
  const host = document.getElementById("cutin");
  const actorName = String(payload.actorName || payload.senderName || "PLAYER");
  const actionName = String(payload.actionName || "ACTION");
  const zeroPower = String(payload.kind || "") === "zero-power";
  const portrait = String((zeroPower && payload.media) || payload.portrait || "").trim();
  const description = String(payload.description || "").trim();
  const trigger = String(payload.trigger || "").trim();
  const effect = String(payload.effect || "").trim();
  const detail = String(payload.detail || "").trim();
  const element = String(payload.element || "none").toUpperCase();
  const art = portrait
    ? `<div class="portrait"><img src="${esc(portrait)}" alt="${esc(actorName)}"></div>`
    : `<div class="portrait empty"><span>${esc(actorName.slice(0, 1).toUpperCase() || "?")}</span></div>`;
  const zeroSections = [
    trigger && `<section><b>CHARGE / TRIGGER</b><p>${esc(trigger)}</p></section>`,
    effect && `<section><b>ABILITY / EFFECT</b><p>${esc(effect)}</p></section>`,
    detail && `<section><b>DESCRIPTION</b><p>${esc(detail)}</p></section>`
  ].filter(Boolean).join("") || `<section><b>ABILITY / EFFECT</b><p>${esc(description || "ZERO POWER ACTIVATED")}</p></section>`;
  host.innerHTML = `<section class="cutin-card ${zeroPower ? "zero-power-cutin" : ""}" style="${themeStyle(payload.cutInColor)}"><div class="speed-lines"></div><div class="slash"></div>${art}<div class="copy"><small>${zeroPower ? "ZERO POWER · RELEASE" : "SKILL CUT-IN"}</small><h1>${esc(actionName)}</h1><strong>${esc(actorName)}</strong>${zeroPower ? `<div class="zero-power-details">${zeroSections}</div>` : ""}${zeroPower ? `<em>ZERO CLOCK · 6/6 → 0/6</em>` : element !== "NONE" ? `<em>${esc(element)}</em>` : ""}</div><button id="cutin-close" class="cutin-close" title="Close" aria-label="Close Cut-in">×</button></section>`;
  document.getElementById("cutin-close")?.addEventListener("click",()=>{const message={type:"close",rollId:String(payload.rollId||"")};try{const bus=new BroadcastChannel(CONTROL);bus.postMessage(message);setTimeout(()=>bus.close(),0)}catch{try{localStorage.setItem(`${CONTROL}:event`,JSON.stringify({...message,time:Date.now()}))}catch{}}});
}

let payload = {};
try { payload = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
render(payload);
