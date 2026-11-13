import * as THREE from 'three';
import {createBase} from './lib/setup.js';
import {createFrameDriver} from './lib/frame-driver.js';
import * as flow from './effects/cube-water-stream.js';
import {meta} from './meta.js';
const $=s=>document.querySelector(s),stage=$('#stage'),canvas=$('canvas'),query=new URLSearchParams(location.search),media=matchMedia('(prefers-reduced-motion: reduce)');
const low=query.has('low')||/Mobi|Android/i.test(navigator.userAgent)||(navigator.hardwareConcurrency||8)<=4;
const defaults=Object.fromEntries(meta.schema.map(s=>[s.key,s.default])),initialLook=meta.looks[0],initialParams={...defaults,...initialLook.params};
const params={...initialParams};let base,driver,observer,intersection,paused=query.has('still')||media.matches,dead=false,close=false,lastDraw=0,frames=0;
if(/^#[0-9a-f]{6}$/i.test('#'+query.get('color')))params.color='#'+query.get('color');
const fail=e=>{$('#loading').hidden=true;$('#error').hidden=false;$('#error').textContent='三维场景加载失败：'+(e.message||e);$('#status').dataset.state='error';$('#status').textContent='场景出错';paused=true;driver?.refresh();};
try{
 base=createBase(canvas,low);base.renderer.setPixelRatio(Math.min(devicePixelRatio||1,low?1:1.5));base.renderer.setClearColor('#090f14');base.scene.background=new THREE.Color('#090f14');base.scene.fog=new THREE.FogExp2('#090f14',.035);base.renderer.toneMappingExposure=1.08;
 base.renderer.shadowMap.enabled=true;base.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const lights=base.scene.children.filter(o=>o.isDirectionalLight);lights[0].position.set(1,7,5);lights[0].intensity=3.6;lights[0].castShadow=true;lights[0].shadow.mapSize.set(low?1024:2048,low?1024:2048);Object.assign(lights[0].shadow.camera,{left:-6,right:6,top:5,bottom:-5,near:.2,far:25});lights[0].shadow.camera.updateProjectionMatrix();lights[0].shadow.bias=-.0003;lights[0].shadow.normalBias=.025;lights[1].intensity=3.1;
 base.controls.maxPolarAngle=Math.PI*.485;base.controls.minDistance=4;base.controls.maxDistance=17;base.controls.enablePan=false;
 const views={wide:[[6.5,4.5,7.5],[.1,1.05,0]],close:[[3.6,2.7,4.25],[.7,1.05,.05]]};
 const pins=flow.anchors();
 function projectPins(){for(const [key,at] of Object.entries(pins)){const p=at.clone().project(base.camera),el=$('[data-pin="'+key+'"]');el.style.left=(p.x*.5+.5)*stage.clientWidth+'px';el.style.top=(-p.y*.5+.5)*stage.clientHeight-24+'px';el.style.opacity=Math.abs(p.x)<.95&&Math.abs(p.y)<.9&&p.z<1?'1':'0';}}
 function draw(force=false){if(dead)return;const now=performance.now();if(!force&&!paused&&now-lastDraw<1000/(low?30:50))return;lastDraw=now;base.renderer.render(base.scene,base.camera);projectPins();canvas.dataset.draws=String(++frames);const state=flow.stats();canvas.dataset.simTime=String(state.time);canvas.dataset.drops=String(state.visibleDrops);canvas.dataset.stream=String(state.streamVisible);$('#time').textContent=state.time.toFixed(1);}
 function view(){const [position,target]=views[close?'close':'wide'];base.camera.position.fromArray(position);base.controls.target.fromArray(target);base.controls.update();$('#view').firstChild.textContent=close?'整体 ':'近景 ';draw(true);}
 function refresh(){flow.update(0,params,base);$('#flow-state').textContent=params.flow<.005?'已停止出水':params.flow<.55?'涓细水流':'连续出水';syncControls();draw(true);}
 const looks=$('.looks');looks.replaceChildren();for(const look of meta.looks){const b=document.createElement('button');b.dataset.look=look.id;b.textContent=look.shortTitle||look.title;b.setAttribute('aria-pressed',String(look.id===initialLook.id));looks.append(b);}
 const controls=meta.schema.filter(s=>s.type!=='color');
 for(const s of controls){const wrap=document.createElement('div');wrap.className='control';const label=document.createElement('label');label.className='label';label.htmlFor='param-'+s.key;label.append(document.createTextNode(s.label));const output=document.createElement('output');output.id='value-'+s.key;output.htmlFor='param-'+s.key;label.append(output);const input=document.createElement('input');input.type='range';input.id='param-'+s.key;input.min=s.min;input.max=s.max;input.step=s.step;input.value=params[s.key];input.setAttribute('aria-describedby','hint-'+s.key);const hint=document.createElement('small');hint.id='hint-'+s.key;hint.textContent=s.hint;input.oninput=()=>{params[s.key]=Number(input.value);clearLook();refresh();};wrap.append(label,input,hint);$('#controls').append(wrap);}
 function clearLook(){for(const b of document.querySelectorAll('[data-look]'))b.setAttribute('aria-pressed','false');}
 function syncControls(){for(const s of controls){const input=$('#param-'+s.key);input.value=params[s.key];input.style.setProperty('--progress',((params[s.key]-s.min)/(s.max-s.min)*100)+'%');$('#value-'+s.key).textContent=s.unit==='%'?Math.round(params[s.key]*100)+'%':params[s.key].toFixed(2)+' ×';input.setAttribute('aria-valuetext',s.unit==='%'?Math.round(params[s.key]*100)+'%':params[s.key].toFixed(2)+'倍');}$('#water-color').value=params.color;for(const b of document.querySelectorAll('[data-color]'))b.setAttribute('aria-pressed',String(b.dataset.color.toLowerCase()===params.color.toLowerCase()));}
 for(const button of document.querySelectorAll('[data-look]'))button.onclick=()=>{Object.assign(params,defaults,meta.looks.find(l=>l.id===button.dataset.look).params);clearLook();button.setAttribute('aria-pressed','true');refresh();};
 for(const button of document.querySelectorAll('[data-color]'))button.onclick=()=>{params.color=button.dataset.color;clearLook();refresh();};$('#water-color').oninput=e=>{params.color=e.target.value;clearLook();refresh();};
 function pauseUi(){$('#pause').setAttribute('aria-pressed',String(paused));$('#play-label').textContent=paused?'继续播放':'暂停动画';$('#play-icon').textContent=paused?'▷':'Ⅱ';}
 const toggle=()=>{paused=!paused;pauseUi();base.clock.getDelta();driver?.refresh();};$('#pause').onclick=toggle;
 $('#reset').onclick=()=>{flow.dispose();Object.assign(params,initialParams);flow.create(base,params);clearLook();$('[data-look="'+initialLook.id+'"]').setAttribute('aria-pressed','true');refresh();};
 $('#view').onclick=()=>{close=!close;view();};$('#reset-view').onclick=()=>{close=false;view();};$('#labels').onclick=()=>{const hide=!$('.pins').hidden;$('.pins').hidden=hide;$('#labels').setAttribute('aria-pressed',String(!hide));$('#labels').textContent=hide?'显示标注':'隐藏标注';};
 const keyboard=e=>{if(e.code==='Space'&&!/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(e.target.tagName)){e.preventDefault();toggle();}};window.addEventListener('keydown',keyboard);
 const reduceMotion=e=>{if(e.matches){paused=true;pauseUi();driver?.refresh();}};media.addEventListener('change',reduceMotion);
 flow.create(base,params);syncControls();pauseUi();if(params.color!==initialParams.color)clearLook();view();
 const resize=()=>{base.resize(stage.clientWidth,stage.clientHeight);base.camera.zoom=Math.min(1,base.camera.aspect/1.25);base.camera.updateProjectionMatrix();draw(true);};observer=new ResizeObserver(resize);observer.observe(stage);resize();
 driver=createFrameDriver({canvas,clock:base.clock,controls:base.controls,isPaused:()=>paused,update:dt=>flow.update(dt,params,base),draw,onError:fail});
 intersection=new IntersectionObserver(entries=>driver.setVisible(entries[0].isIntersecting));intersection.observe(stage);driver.refresh();
 $('#quality').textContent=low?'低功耗模式 · 本地资源':'Three.js r160 · 本地资源';$('#loading').hidden=true;$('#status').textContent='场景已就绪';$('#status').dataset.state='ready';
 const dispose=()=>{if(dead)return;dead=true;driver.dispose();observer.disconnect();intersection.disconnect();media.removeEventListener('change',reduceMotion);window.removeEventListener('keydown',keyboard);flow.dispose();base.dispose();};window.addEventListener('pagehide',dispose,{once:true});
}catch(e){fail(e);}
