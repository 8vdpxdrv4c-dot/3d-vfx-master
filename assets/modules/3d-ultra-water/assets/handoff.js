import {validateParameters} from '../demos/parameters.js';
export function validateCamera(camera){
 if(camera==null)return null;
 if(!['position','target'].every(k=>Array.isArray(camera[k])&&camera[k].length===3&&camera[k].every(v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=80000)))throw new Error('相机参数无效');
 return {position:[...camera.position],target:[...camera.target]};
}
export function selectionPayload(look,params,camera){
 return {format:'3d-vfx-water-selection',version:1,skill:'3d-vfx-master',module:'3d-ultra-water',look:look.id,title:look.title,params:validateParameters({...params,view:look.params.view}),camera:validateCamera(camera)};
}
export function selectionPrompt(payload){
 return `使用 $3d-vfx-master 制作我已经选定的“${payload.title}”海水效果。以下参数来自预览页当前设置，请直接沿用，不要再询问水效类型，也不要改回默认预设。保留附带的相机位置与观察目标（如果有）。\n\n模块：3d-ultra-water\n预设：${payload.look}\n完整参数与视角：\n\`\`\`json\n${JSON.stringify(payload,null,2)}\n\`\`\`\n\n请先读取技能及 Ultra Water 模块说明，将上述 JSON 保存为选择文件，然后运行技能内 scripts/import_water_selection.py --selection-file <选择文件> --out <新的输出目录>，完整保留 params 与 camera。交付可运行页面。`;
}
export function readFragment(hash,looks){
 const [id,query='']=hash.replace(/^#/,'').split('?');const look=looks.find(l=>l.id===id)||looks[0];
 const raw=new URLSearchParams(query).get('config');
 if(!raw)return {look};
 if(raw.length>12000)throw new Error('分享参数过长');
 const parsed=JSON.parse(raw);
 return {look,params:validateParameters({...parsed.params,view:look.params.view}),camera:validateCamera(parsed.camera)};
}
export function selectionFragment(look,params,camera){return '#'+look.id+'?config='+encodeURIComponent(JSON.stringify({params:validateParameters(params),camera:validateCamera(camera)}));}
