
let DB;
async function init(){
  DB=await (await fetch('data.json')).json();
  renderStatus();
}
function renderStatus(){
  document.getElementById('status').innerHTML =
    `<span>${DB.state.date}</span><span>行动 ${DB.state.actionsLeft}</span><span>${DB.state.brandTier}</span>`;
}
function openPlace(id){
  const p=DB.places[id];
  let html=`<h2>${p.name}</h2><div class="desc">选择进入的内部地点。每个地点都可能触发商战、恋爱、经营或隐藏剧情。</div>`;
  Object.keys(p.sub).forEach(name=>{
    const obj=p.sub[name];
    html+=`<div class="item" onclick="openSub('${id}','${name}')"><b>${name}</b><br><span class="desc">${obj.desc}</span></div>`;
  });
  html+=`<div class="item close" onclick="closeSheet()">返回地图</div>`;
  const sheet=document.getElementById('sheet');
  sheet.innerHTML=html;
  sheet.style.display='block';
}
function closeSheet(){document.getElementById('sheet').style.display='none'}
function openSub(pid, sub){
  const ev=DB.places[pid].sub[sub].event;
  closeSheet();
  document.getElementById('event').classList.add('active');
  document.getElementById('eventTitle').textContent=ev.title;
  document.getElementById('eventText').textContent=ev.text;
  document.getElementById('choices').innerHTML=ev.choices.map((c,i)=>`<div class="choice" onclick="choose('${pid}','${sub}',${i})">${c.text}</div>`).join('');
  document.getElementById('result').innerHTML='';
}
function choose(pid, sub, i){
  const ev=DB.places[pid].sub[sub].event;
  DB.state.actionsLeft=Math.max(0, DB.state.actionsLeft-1);
  document.getElementById('choices').innerHTML='';
  document.getElementById('result').innerHTML=`<div class="result">${ev.choices[i].result}<br><br>本周剩余行动：${DB.state.actionsLeft}</div><div class="choice" onclick="closeEvent()">返回大地图</div>`;
  renderStatus();
}
function closeEvent(){document.getElementById('event').classList.remove('active')}
init();
