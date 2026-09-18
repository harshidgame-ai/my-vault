const KEY="my-vault-v2";
const seed={goals:[{id:"g1",name:"Barcelona 2029",emoji:"🇪🇸",target:150000,date:"2029-06-02",desc:"Trip fund"},{id:"g2",name:"Emergency Fund",emoji:"🚨",target:50000,date:"",desc:"Safety cushion"}],transactions:[{id:"t1",goalId:"g1",amount:25000,type:"deposit",date:"2026-09-18",note:"Starting savings"},{id:"t2",goalId:"g2",amount:12500,type:"deposit",date:"2026-09-10",note:"Initial fund"}],pin:""};
let data=JSON.parse(localStorage.getItem(KEY)||JSON.stringify(seed)), txFilter="all", mode="deposit";
const $=id=>document.getElementById(id), save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const bal=id=>data.transactions.filter(t=>t.goalId===id).reduce((s,t)=>s+(t.type==="deposit"?t.amount:-t.amount),0);
const total=()=>data.goals.reduce((s,g)=>s+bal(g.id),0), target=()=>data.goals.reduce((s,g)=>s+Number(g.target),0);
const dateFmt=s=>s?new Date(s+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"";
function showPage(p){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$("page-"+p).classList.add("active");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===p));render();}
function goalCard(g){let b=Math.max(0,bal(g.id)),p=Math.min(100,Math.round(b/g.target*100));return `<article class="goal card" onclick="openDetail('${g.id}')"><div class="goal-top"><div class="emoji">${esc(g.emoji||"🐷")}</div><div class="goal-info"><div class="goal-name">${esc(g.name)}</div><div class="muted">${g.date?"Target "+dateFmt(g.date):"No target date"}</div></div><div class="goal-amount">${money(b)}</div></div><div class="progress"><div style="width:${p}%"></div></div><div class="goal-foot"><span>${p}% complete</span><span>${money(Math.max(0,g.target-b))} left</span></div></article>`}
function txRow(t){let g=data.goals.find(x=>x.id===t.goalId);return `<div class="tx"><div class="tx-icon">${esc(g?.emoji||"🐷")}</div><div class="tx-main"><strong>${t.type==="deposit"?"Added":"Withdrew"} ${money(t.amount)}</strong><span>${esc(g?.name||"Deleted goal")} · ${dateFmt(t.date)}${t.note?" · "+esc(t.note):""}</span></div><div class="tx-amt ${t.type==="deposit"?"positive":"negative"}">${t.type==="deposit"?"+":"−"}${money(t.amount)}</div></div>`}
function render(){
 let saved=total(),tar=target(),pct=tar?Math.min(100,Math.round(saved/tar*100)):0;
 $("totalSaved").textContent=money(saved);$("goalSummary").textContent=`${data.goals.length} goal${data.goals.length!==1?"s":""} · ${pct}% overall`;$("overallPct").textContent=pct+"%";$("overallRing").style.background=`conic-gradient(var(--text) ${pct*3.6}deg,var(--line) 0deg)`;
 let ym=new Date().toISOString().slice(0,7),month=data.transactions.filter(t=>t.type==="deposit"&&t.date.startsWith(ym)).reduce((s,t)=>s+t.amount,0);
 $("monthSaved").textContent=money(month);$("remaining").textContent=money(Math.max(0,tar-saved));
 $("homeGoals").innerHTML=data.goals.slice(0,3).map(goalCard).join("")||empty("No goals yet.");
 $("allGoals").innerHTML=data.goals.map(goalCard).join("")||empty("Create your first piggy bank.");
 let tx=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date));$("homeTx").innerHTML=tx.slice(0,5).map(txRow).join("")||empty("No activity yet.");
 let filtered=txFilter==="all"?tx:tx.filter(t=>t.type===txFilter);$("allTx").innerHTML=filtered.map(txRow).join("")||empty("No matching activity.");
 let dep=tx.filter(t=>t.type==="deposit"),wd=tx.filter(t=>t.type==="withdrawal"),sumd=dep.reduce((s,t)=>s+t.amount,0);
 $("statSaved").textContent=money(sumd);$("statWithdrawn").textContent=money(wd.reduce((s,t)=>s+t.amount,0));$("statDeposits").textContent=dep.length;$("statAvg").textContent=money(dep.length?sumd/dep.length:0);
 renderChart(tx); $("pinStatus").textContent=data.pin?"On ›":"Off ›";
 $("goalSelect").innerHTML=data.goals.map(g=>`<option value="${g.id}">${esc(g.emoji||"🐷")} ${esc(g.name)}</option>`).join("");
}
function empty(s){return `<div class="empty" style="padding:24px;text-align:center;color:var(--muted);font-size:13px">${s}</div>`}
function renderChart(tx){let months=[];let d=new Date();for(let i=5;i>=0;i--){let x=new Date(d.getFullYear(),d.getMonth()-i,1);months.push({key:x.toISOString().slice(0,7),label:x.toLocaleDateString("en",{month:"short"}),v:0})}tx.filter(t=>t.type==="deposit").forEach(t=>{let m=months.find(x=>x.key===t.date.slice(0,7));if(m)m.v+=t.amount});let max=Math.max(1,...months.map(x=>x.v));$("chart").innerHTML=months.map(m=>`<div class="bar-wrap"><b>${m.v?money(m.v):""}</b><div class="bar" style="height:${Math.max(2,m.v/max*120)}px"></div><small>${m.label}</small></div>`).join("")}
function openMoney(){if(!data.goals.length){openGoal();return} $("moneyModal").classList.remove("hidden");$("date").value=new Date().toISOString().slice(0,10);setMode("deposit");render()}
function setMode(m){mode=m;$("depositMode").classList.toggle("selected",m==="deposit");$("withdrawMode").classList.toggle("selected",m==="withdrawal");$("moneyTitle").textContent=m==="deposit"?"Add money":"Withdraw money"}
function close(id){$(id).classList.add("hidden")}
function openGoal(){$("goalModal").classList.remove("hidden")}
function openDetail(id){let g=data.goals.find(x=>x.id===id),b=Math.max(0,bal(id)),p=Math.min(100,Math.round(b/g.target*100)),mil=[10,25,50,75,100];$("detailContent").innerHTML=`<div class="detail-hero"><div class="detail-emoji">${esc(g.emoji||"🐷")}</div><div class="detail-name">${esc(g.name)}</div><div class="muted">${esc(g.desc||"Savings goal")}</div><div class="detail-balance">${money(b)}</div><div class="muted">of ${money(g.target)}</div></div><div class="progress"><div style="width:${p}%"></div></div><div class="goal-foot"><span>${p}% complete</span><span>${money(Math.max(0,g.target-b))} remaining</span></div><div class="milestones">${mil.map(x=>`<span class="milestone ${p>=x?"done":""}">${p>=x?"✓ ":""}${x}%</span>`).join("")}</div><div class="detail-actions"><button class="secondary" onclick="close('detailModal');openMoneyFor('${id}','deposit')">＋ Deposit</button><button class="secondary" onclick="close('detailModal');openMoneyFor('${id}','withdrawal')">− Withdraw</button></div><h3>Goal activity</h3><div class="transactions card">${data.transactions.filter(t=>t.goalId===id).sort((a,b)=>b.date.localeCompare(a.date)).map(txRow).join("")||empty("No transactions.")}</div>`;$("detailModal").classList.remove("hidden")}
function openMoneyFor(id,m){openMoney();$("goalSelect").value=id;setMode(m)}
$("newGoalBtn").onclick=openGoal;$("fab").onclick=openMoney;$("depositMode").onclick=()=>setMode("deposit");$("withdrawMode").onclick=()=>setMode("withdrawal");
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>close(b.dataset.close));document.querySelectorAll(".backdrop").forEach(b=>b.onclick=()=>close(b.parentElement.id));
document.querySelectorAll(".nav[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");txFilter=b.dataset.filter;render()});
$("moneyForm").onsubmit=e=>{e.preventDefault();let amount=Number($("amount").value),gid=$("goalSelect").value;if(!amount||amount<=0)return;if(mode==="withdrawal"&&amount>bal(gid)){alert("You cannot withdraw more than this piggy bank balance.");return}data.transactions.push({id:crypto.randomUUID(),goalId:gid,amount,type:mode,date:$("date").value,note:$("note").value.trim()});save();e.target.reset();close("moneyModal");render();};
$("goalForm").onsubmit=e=>{e.preventDefault();data.goals.push({id:crypto.randomUUID(),name:$("goalName").value.trim(),emoji:$("goalEmoji").value.trim()||"🐷",target:Number($("goalTarget").value),date:$("goalDate").value,desc:$("goalDesc").value.trim()});save();e.target.reset();close("goalModal");render();};
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("mv-theme",document.body.classList.contains("dark")?"dark":"light")};
$("exportBtn").onclick=()=>{let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="my-vault-backup.json";a.click();URL.revokeObjectURL(a.href)};
$("importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.goals||!x.transactions)throw 0;data=x;save();render();alert("Backup restored.")}catch{alert("Invalid backup file.")}};r.readAsText(f)};
$("clearBtn").onclick=()=>{if(confirm("Delete ALL goals and transactions? This cannot be undone unless you have a backup.")){data={goals:[],transactions:[],pin:data.pin};save();render()}};
$("pinBtn").onclick=()=>{if(data.pin){if(confirm("Turn off your PIN?")){data.pin="";save();render()}}else{let p=prompt("Create a 4–6 digit PIN:");if(p&&/^\d{4,6}$/.test(p)){data.pin=p;save();render();alert("PIN enabled.")}else if(p)alert("PIN must be 4–6 digits.")}};
$("unlockBtn").onclick=()=>{if($("pinInput").value===data.pin){$("lockScreen").classList.add("hidden");$("pinInput").value=""}else alert("Incorrect PIN.")};
$("resetPinBtn").onclick=()=>{if(confirm("Reset PIN and remove the app lock?")){data.pin="";save();$("lockScreen").classList.add("hidden");render()}};
if(localStorage.getItem("mv-theme")==="dark")document.body.classList.add("dark");
render();if(data.pin)$("lockScreen").classList.remove("hidden");
