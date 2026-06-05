
let DB=null;
let state=null;

async function init(){
  const res=await fetch('data.json');
  DB=await res.json();
  state=JSON.parse(localStorage.getItem('zworld_state')||'null') || DB.state;
  renderAll();
}
function save(){ localStorage.setItem('zworld_state', JSON.stringify(state)); }
function show(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.navBtn').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const btn=document.querySelector(`[data-nav="${id}"]`);
  if(btn) btn.classList.add('active');
  closeSheet();
  renderAll();
}
function fmtCash(n){ return Math.round(n/100000000)+'亿Z元'; }
function renderAll(){
  document.getElementById('homeDate').textContent=state.date+'｜剩余行动 '+state.actionsLeft;
  document.getElementById('companyBrief').textContent=`品牌档位：${state.brandTier}｜现金：${fmtCash(state.cash)}｜总数据：${state.brandScore}`;
  document.getElementById('newsList').innerHTML=state.news.map(x=>`<div class="msg">${x}</div>`).join('');
  renderStats();
  renderMen();
  renderPhone();
  renderSchedule();
}
function renderStats(){
  const s=DB.stats;
  document.getElementById('dataGrid').innerHTML=[
    ['产品线',s.product],['代言人',s.ambassador],['业内人脉',s.network],
    ['政界支持',s.politics],['舆论',s.publicOpinion],['市场占据',s.market]
  ].map(x=>`<div class="tile"><b>${x[0]}</b><small>${x[1]}</small></div>`).join('');
}
function renderMen(){
  document.getElementById('menList').innerHTML=DB.maleLeads.map(m=>`
    <div class="man">
      <span class="badge">${m.type}</span><br>
      <b>${m.name}</b><small>｜${m.age}岁</small>
      <p>${m.tag}</p>
      <small>心动 ${m.visible.heart}</small><div class="stat"><span style="width:${m.visible.heart}%"></span></div>
      <small>信任 ${m.visible.trust}</small><div class="stat"><span style="width:${m.visible.trust}%"></span></div>
      <small>思念 ${m.visible.miss}</small><div class="stat"><span style="width:${m.visible.miss}%"></span></div>
    </div>`).join('');
}
function renderPhone(){
  document.getElementById('phoneMsgs').innerHTML=DB.maleLeads.map(m=>`
    <div class="msg"><b>${m.name}</b><br>${m.messages[0]}</div>`).join('');
}
function renderSchedule(){
  document.getElementById('scheduleList').innerHTML=`
    <div class="msg">第1周：首次高层会议｜确认【界线】系列资源方向</div>
    <div class="msg">第2周：媒体初次试探｜可能触发舆论事件</div>
    <div class="msg">第3周：品牌联盟大厦会面窗口开放</div>
    <div class="msg">第4周：月末结算｜公司数据、新闻、男主动态</div>`;
}
function openPlace(id){
  const p=DB.places[id];
  state.currentLocation=p.name;
  save();
  let html=`<h2>${p.name}</h2><div class="desc">选择进入的内部地点。本周进入地图核心地点会消耗行动，部分私人剧情不会立刻消耗。</div>`;
  p.sub.forEach(sub=>{
    html+=`<div class="item" onclick="openSub('${id}','${sub}')">${sub}</div>`;
  });
  html+=`<div class="item close" onclick="closeSheet()">返回地图</div>`;
  const sheet=document.getElementById('sheet');
  sheet.innerHTML=html;
  sheet.style.display='block';
}
function closeSheet(){ document.getElementById('sheet').style.display='none'; }
function openSub(placeId, sub){
  const place=DB.places[placeId];
  const ev=place.events[sub];
  if(ev){ openEvent(ev, placeId, sub); return; }
  const sheet=document.getElementById('sheet');
  sheet.innerHTML=`<h2>${sub}</h2><div class="desc">这里目前没有主线事件，但可以作为后续剧情入口。</div>
  <div class="item" onclick="closeSheet()">停留观察</div>
  <div class="item close" onclick="openPlace('${placeId}')">返回${place.name}</div>`;
}
function openEvent(ev, placeId, sub){
  closeSheet();
  document.getElementById('event').classList.add('active');
  document.getElementById('eventTitle').textContent=ev.title;
  document.getElementById('eventText').textContent=ev.text;
  document.getElementById('eventChoices').innerHTML=ev.choices.map((c,i)=>`
    <div class="choice" onclick="choose('${placeId}','${sub}',${i})">${c.text}</div>`).join('');
  document.getElementById('eventResult').innerHTML='';
}
function closeEvent(){
  document.getElementById('event').classList.remove('active');
  renderAll();
}
function choose(placeId, sub, idx){
  const ev=DB.places[placeId].events[sub];
  const c=ev.choices[idx];
  applyEffect(c.effect||{});
  document.getElementById('eventResult').innerHTML=`<div class="result">${c.result}<br><br>当前：剩余行动 ${state.actionsLeft}｜现金 ${fmtCash(state.cash)}</div>
  <div class="choice" onclick="closeEvent()">返回</div>`;
  document.getElementById('eventChoices').innerHTML='';
  save();
  renderAll();
}
function applyEffect(e){
  for(const [k,v] of Object.entries(e)){
    if(k==='cash') state.cash += v;
    else if(k==='actionsLeft') state.actionsLeft=Math.max(0,state.actionsLeft+v);
    else if(k in DB.stats) DB.stats[k]+=v;
    else if(k.startsWith('wen')){
      const wen=DB.maleLeads.find(m=>m.id==='wen');
      if(k==='wenHeart') wen.visible.heart+=v;
      if(k==='wenTrust') wen.visible.trust+=v;
      if(k==='wenMiss') wen.visible.miss+=v;
    }else if(k.startsWith('xie')){
      const xie=DB.maleLeads.find(m=>m.id==='xie');
      if(k==='xieHeart') xie.visible.heart+=v;
      if(k==='xieTrust') xie.visible.trust+=v;
    }
  }
}
function resetGame(){
  localStorage.removeItem('zworld_state');
  location.reload();
}
init();
