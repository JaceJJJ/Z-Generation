Z_GENERATION_AI_V8_FINAL

包含：
- index.html：手机界面，地图/手机/品牌主页/设置
- style.css：手机端UI
- game.js：前端游戏逻辑，保留map.jpg点击地图，调用AI GM
- data.json：保留旧前端所需 state + places 结构
- ZWDB_MASTER_V8_FINAL.json：基于你上传的MASTER_V6，新增Z世界核心背景与商业规则，未删除原字段
- api/game.js：AI GM接口，处理公司经营/恋爱/商战/突发事件
- api/get_character.js：单角色对话接口
- world_state.json：初始存档参考

上传方式：
1. 不要删除你的原 map.jpg。压缩包不替换地图，项目里必须保留 map.jpg。
2. GitHub根目录上传本包所有文件，同名覆盖：index.html/style.css/game.js/data.json/ZWDB_MASTER_V8_FINAL.json/world_state.json。
3. api文件夹里覆盖 game.js 和 get_character.js。
4. Vercel环境变量 OPENAI_API_KEY 保持不动。
5. 部署后打开网页，点击地图进入场景，点击AI推演按钮即可互动。
