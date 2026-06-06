let DB=null, SAVE=null, CURRENT={placeId:null,subName:null};

async function init(){
  DB = await (await fetch('data.json')).json();
  const local = localStorage.getItem('z_generation_save_v8');
  SAVE = local ? JSON.parse(local) : {
    state: structuredClone(DB.state),
    relationships: {},
    business: { Deadline:{ productLine:4200, endorsement:1800, industryNetwork:2200, governmentSupport:1200, publicOpinion:1900, marketShare:1600, cash:3000000000, monthlyRevenue:40000000, fixedCosts:18000000, variableCosts:12000000, netProfit:10000000 }},
    history:[]
  };
  renderStatus(); renderCompany();
}
function saveLocal(){localStorage.setItem('z_generation_save_v8',JSON.stringify(SAVE))}
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');renderStatus(); if(id==='companyPage')renderCompany();}
function renderStatus(){const s=SAVE.state,b=SAVE.business.Deadline;document.getElementById('status').innerHTML=`<span>${s.date}</span><span>行动 ${s.actionsLeft}</span><span>${s.brandTier} ${s.brandScore}</span>`}
function renderCompany(){const b=SAVE.business.Deadline;const el=document.getElementById('companyStats');if(!el)return;el.innerHTML=Object.entries({现金:b.cash,月营收:b.monthlyRevenue,固定成本:b.fixedCosts,可变成本:b.variableCosts,净利润:b.netProfit,产品线:b.productLine,代言人:b.endorsement,人脉:b.industryNetwork,政界:b.governmentSupport,舆论:b.publicOpinion,市场:b.marketShare}).map(([k,v])=>`<div class="statCard"><span>${k}</span><b>${format(v)}</b></div>`).join('')}
function format(v){return typeof v==='number'?v.toLocaleString('zh-CN'):v}

function openPlace(id){const p=DB.places[id];if(!p){alert('地点不存在:'+id);return}CURRENT.placeId=id;let html=`<h2>${p.name}</h2><div class="desc">选择进入区域。AI会结合MASTER数据库、当前存档、地点气质和人物逻辑推演。</div>`;Object.entries(p.sub).forEach(([name,obj])=>{html+=`<div class="item" onclick="openSub('${id}','${esc(name)}')"><b>${name}</b><small>${obj.desc}</small></div>`});html+=`<div class="item aiBtn" onclick="generateAI('${id}',null,'location')">AI推演此地当前局势</div><div class="item close" onclick="closeSheet()">返回地图</div>`;const sheet=document.getElementById('sheet');sheet.innerHTML=html;sheet.style.display='block'}
function esc(s){return String(s).replaceAll("'","\\'")}function closeSheet(){document.getElementById('sheet').style.display='none'}

function openSub(pid,sub){CURRENT={placeId:pid,subName:sub};const place=DB.places[pid],obj=place.sub[sub];closeSheet();document.getElementById('event').classList.add('active');document.getElementById('eventTitle').textContent=`${place.name} · ${sub}`;document.getElementById('eventText').textContent=`${obj.desc}\n\n请选择AI推演方向，或在底部自由输入行动。`;document.getElementById('choices').innerHTML=`<div class="choice aiBtn" onclick="generateAI('${pid}','${esc(sub)}','event')">AI生成此处剧情</div><div class="choice" onclick="generateAI('${pid}','${esc(sub)}','business')">公司经营/商战</div><div class="choice" onclick="generateAI('${pid}','${esc(sub)}','romance')">人物互动/恋爱线</div><div class="choice" onclick="generateAI('${pid}','${esc(sub)}','crisis')">突发事件</div>`;document.getElementById('result').innerHTML=''}

async function generateAI(placeId,subName,mode,freeInput=null,targetBox=null){const place=DB.places[placeId]||{},sub=subName&&place.sub?place.sub[subName]:null;document.getElementById('event').classList.add('active');closeSheet();document.getElementById('eventTitle').textContent=subName?`${place.name} · ${subName}`:(place.name||'Z世界事件');if(!targetBox)document.getElementById('result').innerHTML='<div class="loading">AI正在推演Z世界...</div>';const payload={mode,placeId,placeName:place.name,subName,subDescription:sub?sub.desc:'',state:SAVE.state,business:SAVE.business,relationships:SAVE.relationships,recentHistory:SAVE.history.slice(-10),freeInput};try{const res=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json();if(targetBox){document.getElementById(targetBox).textContent=(data.output&&data.output.story)||data.error||JSON.stringify(data);return}renderAI(data)}catch(e){document.getElementById('result').innerHTML=`<div class="result">AI接口失败：${e.message}</div>`}}
function renderAI(data){if(!data||data.error){document.getElementById('result').innerHTML=`<div class="result">AI错误：${data?.error||'未知'}</div>`;return}const out=data.output||data;document.getElementById('eventTitle').textContent=out.title||'Z世界事件';document.getElementById('eventText').textContent=out.story||out.text||JSON.stringify(out,null,2);window.__choices=Array.isArray(out.choices)?out.choices:[];document.getElementById('choices').innerHTML=window.__choices.map((c,i)=>`<div class="choice" onclick="chooseAI(${i})">${typeof c==='string'?c:c.text}</div>`).join('');applyEffects(out.effects||{});SAVE.history.push({time:new Date().toISOString(),title:out.title,story:out.story,effects:out.effects});if(SAVE.history.length>100)SAVE.history=SAVE.history.slice(-100);saveLocal();renderStatus();renderCompany();document.getElementById('result').innerHTML='<div class="result">本地存档已更新。</div>'}
function chooseAI(i){const c=window.__choices[i];document.getElementById('freeInput').value=typeof c==='string'?c:c.text;sendFreeAction()}
function sendFreeAction(){const text=document.getElementById('freeInput').value.trim();if(!text)return;document.getElementById('freeInput').value='';generateAI(CURRENT.placeId||'deadline',CURRENT.subName,'free_action',text)}
function applyEffects(e={}){if(e.state)Object.assign(SAVE.state,e.state);const b=SAVE.business.Deadline;if(e.business)for(const[k,v]of Object.entries(e.business)){if(typeof v==='number'&&typeof b[k]==='number')b[k]+=v;else b[k]=v}if(e.relationships)for(const[id,vals]of Object.entries(e.relationships)){SAVE.relationships[id]=SAVE.relationships[id]||{};for(const[k,v]of Object.entries(vals)){SAVE.relationships[id][k]=(SAVE.relationships[id][k]||0)+v}}SAVE.state.actionsLeft=Math.max(0,SAVE.state.actionsLeft+(typeof e.actionsLeft==='number'?e.actionsLeft:-1))}
function closeEvent(){document.getElementById('event').classList.remove('active')}
function phoneAI(type){generateAI('private',null,'phone_'+type,`打开手机功能：${type}`,'phoneOutput')}
function companyAction(type){generateAI('deadline','创始人办公室','company_'+type,`执行公司操作：${type}`,'companyOutput')}
function askGM(){const t=document.getElementById('askInput').value.trim();if(!t)return;generateAI('deadline','创始人办公室','gm_question',t,'askOutput')}
function resetSave(){localStorage.removeItem('z_generation_save_v8');location.reload()}
init();
