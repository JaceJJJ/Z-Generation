import fs from 'fs';
import path from 'path';

function readMaster(){
  const p = path.join(process.cwd(), 'ZWDB_MASTER_V8_FINAL.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(200).json({ok:true,message:'Z世界AI GM接口运行中'});
  try{
    const body=req.body||{};
    const master=readMaster();
    const compact={
      z_world_core: master.z_world_core,
      characters: (master.characters||[]).slice(0,20),
      relationships: (master.relationships||[]).slice(0,60),
      companies: master.companies,
      rules: master.rules,
      world_engine: master.world_engine,
      media: master.media,
      celebrities: master.celebrities,
      locations: master.locations
    };
    const system=`你是《Z世界：Deadline》的AI游戏主持人、公司经营引擎、商战引擎、恋爱引擎。
必须严格遵守：
1. 背景是时尚名利场，黑暗、博弈、争夺、权衡利弊。
2. 玩家是万雾，Deadline创始人。不得给玩家个人属性数值。
3. 恋爱高难度，不允许速爱，不透露隐藏属性和真实动机。
4. 公司经营必须计算现金流、成本、净利润、舆论、市场、代言风险。
5. 地点逻辑必须合理：闻叙白这类青涩内敛角色不会无故出现在Blood；高权力/高危险角色更可能出现在Blood/品牌联盟。
6. 输出严格JSON，不要Markdown，不要解释。
格式：
{
 "title":"标题",
 "story":"不少于450字，包含具体场景、人物行为、事业/恋爱/商战推进，不剧透隐藏动机",
 "choices":[{"text":"选项A"},{"text":"选项B"},{"text":"选项C"}],
 "effects":{
   "actionsLeft":-1,
   "business":{"productLine":0,"endorsement":0,"industryNetwork":0,"governmentSupport":0,"publicOpinion":0,"marketShare":0,"cash":0,"monthlyRevenue":0,"fixedCosts":0,"variableCosts":0,"netProfit":0},
   "relationships":{"wen_xubai":{"heart":0,"trust":0,"miss":0}}
 },
 "news":["可选新闻"]
}`;
    const user=`请求模式：${body.mode}
地点：${body.placeName||body.placeId}
子地点：${body.subName||'无'}
说明：${body.subDescription||'无'}
玩家自由输入：${body.freeInput||'无'}

当前存档：
${JSON.stringify({state:body.state,business:body.business,relationships:body.relationships,recentHistory:body.recentHistory},null,2)}

Z世界数据库摘要：
${JSON.stringify(compact,null,2).slice(0,24000)}

请按格式返回下一步。`;
    const response=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},
      body:JSON.stringify({model:'gpt-4o-mini',temperature:0.85,response_format:{type:'json_object'},messages:[{role:'system',content:system},{role:'user',content:user}]})
    });
    const raw=await response.json();
    if(!response.ok)return res.status(500).json({error:raw.error?.message||'OpenAI调用失败',raw});
    const content=raw.choices?.[0]?.message?.content;
    let output;
    try{output=JSON.parse(content)}catch(e){output={title:'解析失败',story:content,choices:[{text:'返回'}],effects:{actionsLeft:-1}}}
    res.status(200).json({ok:true,output});
  }catch(e){res.status(500).json({error:e.message})}
}
