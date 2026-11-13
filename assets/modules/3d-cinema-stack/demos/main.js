import {createFrameDriver} from './lib/frame-driver.js';
import {createBase} from './lib/setup.js';
import {bindGui,defaultsFromSchema} from './lib/gui.js';
import {meta} from './meta.js';
import * as fx from './effects/post-cinema-stack.js';
import {createScrollDriver} from './lib/scroll-driver.js';
const $=s=>document.querySelector(s),stage=$('#stage'),canvas=$('canvas');
const lowEnd=new URLSearchParams(location.search).has('low')||(navigator.hardwareConcurrency||4)<=4||/Mobi|Android/i.test(navigator.userAgent);
const still=new URLSearchParams(location.search).has('still'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let base,params,gui,paused=still||reduced.matches,visible=true,dead=false,driver,cleanupScroll;
$('#name').textContent=meta.name;$('#zh').textContent=meta.zh;$('#tagline').textContent=meta.tagline;document.title=meta.name+' · 3Dfans特效大师';
$('#budget').textContent=lowEnd?'LOW POWER / 节能':'DESKTOP / 标准';
const report=error=>{$('#status').textContent=error.message||String(error);$('#status').dataset.state='error';$('#error').hidden=false;$('#error').textContent=String(error.stack||error);};
try{
 base=createBase(canvas,lowEnd);
 function resize(){base.resize(stage.clientWidth,stage.clientHeight);draw();}
 function draw(){if(dead)return;try{if(!fx.render?.(base))base.renderer.render(base.scene,base.camera);canvas.dataset.draws=String(1+Number(canvas.dataset.draws||0));}catch(error){report(error);}}
 function choose(index){fx.dispose();gui?.destroy();const look=meta.looks[index];params={...defaultsFromSchema(fx.guiSchema),...look.params};if(lowEnd){if('density'in params)params.density=Math.min(params.density,.55);if('quality'in params)params.quality='low';}
  base.controls.enabled=true;base.camera.position.fromArray(meta.camera);base.controls.target.fromArray(meta.target);base.controls.update();
  fx.create(base,params);fx.update(0,params,base);gui=bindGui($('#gui'),fx.guiSchema,params,()=>{fx.update(0,params,base);draw();});
  for(const button of document.querySelectorAll('[data-look]')){const active=button.dataset.look===look.id;button.setAttribute('aria-pressed',String(active));}
  $('#lookName').textContent=look.title;$('#lookHint').textContent=look.hint;$('#status').textContent='Ready / 就绪';$('#status').dataset.state='ready';draw();
 }
 meta.looks.forEach((look,i)=>{const button=document.createElement('button');button.type='button';button.dataset.look=look.id;button.textContent=look.title;button.onclick=()=>choose(i);$('#looks').append(button);});
 function syncPause(){$('#pause').textContent=paused?'Play / 播放':'Pause / 暂停';$('#pause').setAttribute('aria-pressed',String(paused));}
 $('#pause').onclick=()=>{paused=!paused;syncPause();driver?.refresh();};syncPause();const reduceMotion=e=>{if(e.matches){paused=true;syncPause();driver?.refresh();}};reduced.addEventListener('change',reduceMotion);
 $('#reset').onclick=()=>{choose(0);};
 $('#camera').onclick=()=>{if('mode'in params){params.mode=params.mode==='tour'?'orbit':'tour';params.speed=0;}else if('follow'in params)params.follow=!params.follow;else{base.camera.position.fromArray(meta.camera);base.controls.target.fromArray(meta.target);base.controls.update();}gui.controllers.forEach(c=>c.updateDisplay());fx.update(0,params,base);draw();};
 const observer=new ResizeObserver(resize);observer.observe(stage);const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;driver?.setVisible(visible);});intersection.observe(stage);
 if(meta.slug==='3d-scroll-scenes'){document.body.classList.add('scroll-demo');$('#scrollNote').hidden=false;cleanupScroll=createScrollDriver(window,value=>{params.progress=value;fx.update(0,params,base);gui.controllers.forEach(c=>c.updateDisplay());draw();});}
 choose(0);resize();
 let frameIndex=0;
 driver=createFrameDriver({canvas,clock:base.clock,controls:base.controls,isPaused:()=>paused,update:dt=>{fx.update(dt,params,base);if(meta.cameraOwner&&++frameIndex%20===0)gui.controllers.forEach(c=>c.updateDisplay());},draw,onError:error=>{paused=true;syncPause();report(error);}});driver.refresh();
 const teardown=()=>{if(dead)return;dead=true;driver.dispose();reduced.removeEventListener('change',reduceMotion);cleanupScroll?.();observer.disconnect();intersection.disconnect();gui?.destroy();fx.dispose();base.dispose();};
 window.addEventListener('pagehide',teardown,{once:true});
}catch(error){report(error);}
