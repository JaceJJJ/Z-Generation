export default async function handler(req,res){
  try{
    const name=req.query.name||'闻叙白';
    const response=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},
      body:JSON.stringify({model:'gpt-4o-mini',temperature:0.75,messages:[{role:'system',content:'你是Z世界角色对话接口。回复必须克制、真实、符合人设，不剧透。'},{role:'user',content:`让${name}说一句自然台词。`}]})
    });
    const data=await response.json();
    if(!response.ok)return res.status(500).json({error:data.error?.message||'OpenAI调用失败',raw:data});
    res.status(200).json({reply:data.choices?.[0]?.message?.content||''});
  }catch(e){res.status(500).json({error:e.message})}
}
