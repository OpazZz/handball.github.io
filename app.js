(() => {
const $ = id => document.getElementById(id);
const STORE = "handballCoachPwa.v1";
const defaults = {players:[], elapsed:0, running:false, startedAt:null, period:1, events:[]};
let state = load();
let deferredPrompt = null;
let toastTimer = null;

function load(){
  try {
    const loaded={...defaults,...JSON.parse(localStorage.getItem(STORE)||"{}"), running:false, startedAt:null};
    loaded.players=loaded.players.map(p=>({...p,inCourt:typeof p.inCourt==="boolean"?p.inCourt:!!p.activeSince,activeSince:null,totalMs:p.totalMs||0}));
    return loaded;
  } catch { return {...defaults}; }
}
function save(){ localStorage.setItem(STORE, JSON.stringify(state)); }
function nowElapsed(){ return state.elapsed + (state.running && state.startedAt ? Math.max(0,Date.now()-state.startedAt) : 0); }
function fmt(ms){ let s=Math.floor(Math.max(0,ms)/1000), m=Math.floor(s/60); s%=60; return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"); }
function playerTime(p){ return (p.totalMs||0) + (state.running && p.inCourt && p.activeSince ? Math.max(0,Date.now()-p.activeSince) : 0); }
function showToast(msg){ const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2300); }
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function activePlayers(){return state.players.filter(p=>p.inCourt);}
function startMatch(){
  if(state.running){
    const t=Date.now(); state.elapsed=nowElapsed();
    state.players.forEach(p=>{if(p.inCourt&&p.activeSince){p.totalMs=(p.totalMs||0)+Math.max(0,t-p.activeSince);p.activeSince=null;}});
    state.running=false;state.startedAt=null;save();render();return;
  }
  state.running=true;state.startedAt=Date.now();
  state.players.forEach(p=>{if(p.inCourt)p.activeSince=state.startedAt;});save();render();
}
function togglePlayer(id){
  const p=state.players.find(x=>x.id===id);if(!p)return;const t=Date.now();
  if(p.inCourt){if(state.running&&p.activeSince)p.totalMs=(p.totalMs||0)+Math.max(0,t-p.activeSince);p.inCourt=false;p.activeSince=null;state.events.push({time:nowElapsed(),player:p.name,number:p.number,action:"Sortie"});showToast(p.name+" sort du terrain");}
  else{if(activePlayers().length>=7){showToast("7 joueurs maximum sur le terrain");return;}p.inCourt=true;p.activeSince=state.running?t:null;state.events.push({time:nowElapsed(),player:p.name,number:p.number,action:"Entrée"});showToast(p.name+" entre en jeu");}
  save();render();
}
function renderClock(){ $("matchClock").textContent=fmt(nowElapsed());$("startPauseBtn").textContent=state.running?"Ⅱ Pause":"▶ Démarrer";$("matchStatus").textContent=state.running?"En cours":"À l’arrêt";$("liveDot").classList.toggle("live",state.running);$("periodLabel").textContent="Période "+state.period;$("elapsedStat").textContent=fmt(nowElapsed());}
function playerCard(p){const active=!!p.inCourt;return `<button class="player-card ${active?'active':''}" data-player="${p.id}" aria-label="${active?'Faire sortir':'Faire entrer'} ${esc(p.name)}"><i class="state"></i><span class="jersey">${esc(p.number===""?"—":p.number)}</span><span class="pname">${esc(p.name)}</span><span class="ptime">${fmt(playerTime(p))} · ${active?'EN JEU':'SUR LE BANC'}</span><span class="player-action">${active?'− SORTIR':'+ FAIRE ENTRER'}</span></button>`;}
function renderTeam(){const active=activePlayers();$("onCourt").innerHTML=active.map(playerCard).join("");$("onBench").innerHTML=state.players.filter(p=>!p.inCourt).map(playerCard).join("");$("activeCount").textContent=active.length+"/7";$("activeStat").textContent=active.length;$("emptyRoster").classList.toggle("hidden",state.players.length>0);if(!active.length)$("onCourt").innerHTML='<div class="empty">Aucun joueur sur le terrain.<br>Choisis un joueur dans la liste du banc pour le faire entrer.</div>';if(state.players.length===0)$("onBench").innerHTML="";}
function renderStats(){const max=Math.max(1,...state.players.map(playerTime));$("statsList").innerHTML=state.players.length?state.players.slice().sort((a,b)=>playerTime(b)-playerTime(a)).map(p=>{const ms=playerTime(p),pct=Math.min(100,ms/max*100);return `<div class="stat-row"><div class="stat-number">${esc(p.number===""?"—":p.number)}</div><div><div class="stat-name">${esc(p.name)}</div><div class="stat-state">${p.inCourt?"● En jeu":"Sur le banc"}</div><div class="progress"><span style="width:${pct}%"></span></div></div><div class="stat-time">${fmt(ms)}</div></div>`;}).join(""):'<div class="empty">Ajoute des joueurs dans l’onglet Effectif.</div>';}
function renderRoster(){ $("rosterList").innerHTML=state.players.length?state.players.map(p=>`<div class="roster-item"><div class="stat-number">${esc(p.number===""?"—":p.number)}</div><div style="flex:1"><div class="rname">${esc(p.name)}</div><div class="rstate">${p.inCourt?"En jeu":"Sur le banc"} · ${fmt(playerTime(p))}</div></div><button class="delete-player" data-delete="${p.id}" title="Supprimer ${esc(p.name)}" aria-label="Supprimer ${esc(p.name)}">×</button></div>`).join(""):'<div class="roster-empty">Ton effectif apparaîtra ici.</div>'; }
function render(){renderClock();renderTeam();renderStats();renderRoster();}
function switchTab(name){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));document.querySelectorAll(".tab-panel").forEach(p=>p.classList.add("hidden"));$(name+"Tab").classList.remove("hidden");}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
$("startPauseBtn").addEventListener("click",startMatch);
$("periodBtn").addEventListener("click",()=>{if(!confirm("Passer à la période suivante ? Le chrono et les temps de jeu continuent."))return;state.period++;save();renderClock();showToast("Période "+state.period);});
$("resetBtn").addEventListener("click",()=>{if(!confirm("Réinitialiser le match et tous les temps de jeu ? Cette action est irréversible."))return;state.elapsed=0;state.running=false;state.startedAt=null;state.period=1;state.events=[];state.players.forEach(p=>{p.totalMs=0;p.activeSince=null;p.inCourt=false;});save();render();showToast("Match réinitialisé");});
$("onCourt").addEventListener("click",e=>{const b=e.target.closest("[data-player]");if(b)togglePlayer(b.dataset.player);});
$("onBench").addEventListener("click",e=>{const b=e.target.closest("[data-player]");if(b)togglePlayer(b.dataset.player);});
$("addPlayerForm").addEventListener("submit",e=>{e.preventDefault();const name=$("playerName").value.trim(),number=$("playerNumber").value.trim();if(!name)return;if(state.players.some(p=>p.number!==""&&p.number===number&&number!=="")){showToast("Ce numéro est déjà utilisé");return;}state.players.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),name,number,totalMs:0,activeSince:null,inCourt:false});save();$("playerName").value="";$("playerNumber").value="";render();showToast(name+" ajouté à l’effectif");});
$("rosterList").addEventListener("click",e=>{const b=e.target.closest("[data-delete]");if(!b)return;const p=state.players.find(x=>x.id===b.dataset.delete);if(!p)return;if(!confirm("Supprimer "+p.name+" et son temps de jeu ?"))return;if(state.running&&p.inCourt&&p.activeSince)p.totalMs=playerTime(p);state.players=state.players.filter(x=>x.id!==p.id);save();render();});
$("clearRosterBtn").addEventListener("click",()=>{if(!confirm("Vider tout l’effectif et effacer les temps de jeu associés ?"))return;state.players=[];save();render();});
$("demoBtn").addEventListener("click",()=>{if(state.players.length&&!confirm("Ajouter les joueurs d’exemple à l’effectif existant ?"))return;const sample=[["1","Léa"],["3","Emma"],["5","Chloé"],["7","Inès"],["9","Jade"],["11","Zoé"],["13","Lou"],["15","Mila"],["17","Alice"],["21","Manon"],["22","Nina"],["30","Sarah"]];sample.forEach(([number,name])=>{if(!state.players.some(p=>p.number===number))state.players.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),number,name,totalMs:0,activeSince:null,inCourt:false});});save();render();showToast("Exemple d’effectif chargé");});
$("clearStatsBtn").addEventListener("click",()=>{if(!confirm("Remettre à zéro tous les temps de jeu ? Les joueurs restent dans l’effectif."))return;state.elapsed=0;state.running=false;state.startedAt=null;state.period=1;state.events=[];state.players.forEach(p=>{p.totalMs=0;p.activeSince=null;p.inCourt=false;});save();render();showToast("Temps de jeu réinitialisés");});
$("exportBtn").addEventListener("click",()=>{const rows=[["Numero","Joueur","Temps de jeu","Statut"],...state.players.map(p=>[p.number,p.name,fmt(playerTime(p)),p.inCourt?"En jeu":"Banc"])];const csv="\ufeff"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="temps-de-jeu-handball.csv";a.click();URL.revokeObjectURL(url);});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden");});
$("installBtn").addEventListener("click",async()=>{if(!deferredPrompt){showToast("Dans le navigateur, ouvre le menu puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».");return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").classList.add("hidden");});
document.addEventListener("visibilitychange",()=>{if(!document.hidden){render();}});
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();setInterval(()=>{renderClock();renderTeam();renderStats();},500);
})();