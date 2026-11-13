import {meta} from '../demos/meta.js';
import {guiSchema,validateParameters} from '../demos/parameters.js';
import {selectionPayload,selectionPrompt,readFragment,selectionFragment,validateCamera} from './handoff.js';
const $=id=>document.getElementById(id);
const notes={
 'open-ocean':{en:'OPEN OCEAN',short:'辽阔 · 深蓝 · 涌浪',description:'低视角望向开阔海面，起伏的深蓝涌浪承接细碎波光。适合海洋场景、航行背景与大尺度自然画面。',tags:['开阔海面','涌浪起伏','反射高光']},
 breakers:{en:'SHORE BREAKERS',short:'白沫 · 浅滩 · 冲刷',description:'贴近海岸观察浪峰破碎、泡沫铺开与海水退去。适合沙滩、岛屿和需要看清浪花细节的近景。',tags:['岸边碎浪','白色泡沫','湿润沙滩']},
 lagoon:{en:'CLEAR LAGOON',short:'青绿 · 海床 · 焦散',description:'清透的青绿色浅水让海床隐约可见，阳光在水底交织。适合热带海岛、清澈海湾与轻松明亮的画面。',tags:['清澈浅水','海床纹理','阳光焦散']},
 'golden-hour':{en:'GOLDEN HOUR',short:'夕照 · 暖光 · 波光',description:'太阳贴近地平线，温暖的光沿波峰延伸，形成随海浪闪烁的光带。适合日落、情绪镜头与电影感场景。',tags:['低角度夕照','暖色反射','闪烁波光']},
 underwater:{en:'BELOW THE SURFACE',short:'光束 · 折射 · 颗粒',description:'将视角放入海水之中，向上看水面折射，向远处看散射光束与悬浮颗粒。适合潜水、水下探索与科普展示。',tags:['水下光束','水面折射','悬浮颗粒']}
};
const storageKey='3d-vfx-water-settings-v1:'+location.pathname;
const states=Object.fromEntries(meta.looks.map(l=>[l.id,{params:{...l.params},camera:null}]));
if(meta.initialCamera)states[meta.looks[0].id].camera=validateCamera(meta.initialCamera);
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');for(const look of meta.looks){try{if(saved[look.id])states[look.id]={params:validateParameters({...look.params,...saved[look.id].params,view:look.params.view}),camera:validateCamera(saved[look.id].camera)};}catch{}}}catch{}
let initial;try{initial=readFragment(location.hash,meta.looks)}catch{initial={look:meta.looks[0]};$('link-status').textContent='分享参数无效，已载入默认效果。'}
if(initial.params)states[initial.look.id]={params:initial.params,camera:initial.camera};
let current=initial.look;
let ready=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
const frame=$('ocean');
const controller=()=>frame.contentWindow?.waterControl;
const state=()=>states[current.id];
const canSend=()=>typeof window.openai?.sendFollowUpMessage==='function';
function save(){try{localStorage.setItem(storageKey,JSON.stringify(states))}catch{}}
function snapshot(){if(ready)state().camera=controller().getCamera();save();}
function payload(){snapshot();return selectionPayload(current,state().params,state().camera);}
function syncHandoff(){const text=selectionPrompt(selectionPayload(current,state().params,state().camera));$('handoff-text').value=text;return text;}
function support(){
 $('choose').textContent=canSend()?'发送效果和参数 ↗':'复制效果和参数 ↗';
 $('send-support').textContent=canSend()?'支持发送到当前对话，指令中会调用 $3d-vfx-master。':'当前本地浏览器没有对话发送接口。点击后会复制完整指令，回到对话粘贴即可调用 3Dfans特效大师。';
}
const controls=new Map();
for(const group of [...new Set(guiSchema.filter(s=>s.key!=='view'&&s.key!=='speed').map(s=>s.group))]){
 const details=document.createElement('details');details.className='parameter-group';details.open=['海浪','水体'].includes(group);
 const summary=document.createElement('summary');summary.textContent=group+(group==='岸边浪花'?' · 海岸附近可见':group==='水下效果'?' · 水下视角可见':'');details.append(summary);
 const grid=document.createElement('div');grid.className='parameter-grid';details.append(grid);
 for(const s of guiSchema.filter(s=>s.group===group&&s.key!=='speed')){
  const row=document.createElement('div');row.className='parameter-control';const label=document.createElement('label');label.textContent=s.label;label.htmlFor='param-'+s.key;
  const value=document.createElement('input');value.id='param-'+s.key;value.dataset.param=s.key;value.setAttribute('aria-label',s.label);
  let number=null;
  if(s.type==='color'){value.type='color';row.append(label,value)}else{value.type='range';Object.assign(value,{min:s.min,max:s.max,step:s.step});number=document.createElement('input');number.type='number';Object.assign(number,{min:s.min,max:s.max,step:s.step});number.setAttribute('aria-label',s.label+'数值');row.append(label,number,value)}
  const change=(input)=>{try{const v=s.type==='color'?input.value:Number(input.value);state().params=validateParameters({...state().params,[s.key]:v});value.value=v;if(number)number.value=v;apply(false);save();syncHandoff();input.setCustomValidity('');}catch{input.setCustomValidity('请输入允许范围内的数值');input.reportValidity()}};
  value.oninput=()=>change(value);if(number){number.oninput=()=>{if(number.value!==''&&number.validity.valid)change(number)};number.onchange=()=>change(number);}
  controls.set(s.key,{value,number});grid.append(row);
 }
 $('parameter-groups').append(details);
}
function syncControls(){for(const [key,{value,number}] of controls){value.value=state().params[key];if(number)number.value=state().params[key]}$('speed').value=state().params.speed;$('speed-value').value=Number(state().params.speed).toFixed(2).replace(/0$/,'')+'×';}
for(const [i,look] of meta.looks.entries()){
 const card=document.createElement('button');card.className='look';card.dataset.id=look.id;card.setAttribute('aria-pressed','false');card.setAttribute('aria-label','预览'+look.title);
 card.innerHTML=`<img src="./assets/looks/${look.id}.jpg" alt="${look.title}实际渲染参考图"><div><span class="number">0${i+1}</span><h3>${look.title}</h3><p>${notes[look.id].short}</p></div><span class="active-mark">●</span>`;
 card.onclick=()=>select(look,true);$('looks').append(card);
}
function apply(reset=true){if(ready){controller().setParameters(state().params,{resetView:reset});if(reset&&state().camera)controller().setCamera(state().camera);controller().pause(paused);}}
function select(look,updateHash=false){
 if(ready)snapshot();
 current=look;const index=meta.looks.indexOf(look),note=notes[look.id];
 document.querySelectorAll('.look').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.id===look.id)));
 $('scene-number').textContent=`0${index+1} / ${note.en}`;$('scene-title').textContent=look.title;$('scene-description').textContent=note.description;
 $('tags').replaceChildren(...note.tags.map(t=>{const el=document.createElement('span');el.textContent=t;return el}));
 $('choice-status').textContent='选择时附带全部参数及当前视角。';syncControls();
 if(updateHash)history.replaceState(null,'','#'+look.id);apply();syncHandoff();
}
function syncPause(){$('pause').textContent=paused?'继续播放':'暂停';$('live-label').textContent=paused?'已暂停 · 可拖动视角':'实时预览';}
$('pause').onclick=()=>{paused=!paused;controller()?.pause(paused);syncPause()};
$('reset').onclick=()=>{state().camera=null;apply();snapshot();syncHandoff()};
$('reset-params').onclick=()=>{states[current.id]={params:{...current.params},camera:null};syncControls();apply();save();syncHandoff();$('choice-status').textContent='已恢复当前效果的默认参数。'};
$('speed').oninput=()=>{state().params.speed=Number($('speed').value);syncControls();apply(false);save();syncHandoff()};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('viewer').requestFullscreen()}catch{$('link-status').textContent='此浏览器暂不支持全屏，可放大窗口查看。'}};
async function copyPrompt(){const text=selectionPrompt(payload());$('handoff-text').value=text;try{await navigator.clipboard.writeText(text);$('choice-status').textContent='已复制效果、全部参数及视角；粘贴到对话即可。'}catch{document.querySelector('.handoff-panel').open=true;$('handoff-text').focus();$('handoff-text').select();$('choice-status').textContent='请复制下方已选中的完整指令。'}}
$('copy-prompt').onclick=copyPrompt;
$('choose').onclick=async()=>{const text=selectionPrompt(payload());$('handoff-text').value=text;if(canSend()){try{await window.openai.sendFollowUpMessage({prompt:text,title:'将效果与参数交给 3Dfans特效大师'});$('choice-status').textContent='已向对话请求发送效果与参数，请在宿主提示中确认。';}catch{$('choice-status').textContent='发送未完成，可点击下方“复制完整指令”。';document.querySelector('.handoff-panel').open=true;}}else await copyPrompt()};
$('download-params').onclick=()=>{const data=payload();const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='water-'+current.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('copy-link').onclick=async()=>{snapshot();const hash=selectionFragment(current,state().params,state().camera);history.replaceState(null,'',hash);try{await navigator.clipboard.writeText(location.href);$('link-status').textContent='已复制，包含参数和视角'}catch{$('link-status').textContent='链接已更新，复制地址栏即可。'}};
addEventListener('hashchange',()=>{try{const parsed=readFragment(location.hash,meta.looks);const wasReady=ready;if(ready)snapshot();if(parsed.params)states[parsed.look.id]={params:parsed.params,camera:parsed.camera};ready=false;select(parsed.look);ready=wasReady;apply();save();}catch{$('link-status').textContent='分享参数无效，保留当前设置。'}});
addEventListener('openai:set_globals',support);
document.querySelector('.handoff-panel').addEventListener('toggle',()=>{if(ready)snapshot();syncHandoff();support()});
select(current);syncPause();support();
const timeout=setTimeout(()=>{if(!ready){$('loading').querySelector('strong').textContent='海面加载比平时慢一些';$('loading').querySelector('span:last-child').textContent='请稍候；也可先查看五张实渲参考图。'}},25000);
// Polling also handles a cached iframe that loaded before this script attached.
const poll=setInterval(()=>{try{if(frame.contentWindow?.waterReady){clearInterval(poll);clearTimeout(timeout);ready=true;apply();snapshot();syncHandoff();syncPause();$('loading').hidden=true;for(const id of ['pause','reset','speed'])$(id).disabled=false;}else if(frame.contentDocument?.body.textContent.includes('此设备不支持')){clearInterval(poll);clearTimeout(timeout);$('loading').querySelector('strong').textContent='当前设备暂不支持实时预览';$('loading').querySelector('span:last-child').textContent='仍可查看五张实际渲染参考图，或更换支持 WebGL2 的设备。';}}catch{}},150);
addEventListener('pagehide',()=>{clearInterval(poll);clearTimeout(timeout)},{once:true});
