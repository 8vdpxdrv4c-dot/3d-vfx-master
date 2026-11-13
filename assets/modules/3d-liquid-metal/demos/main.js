import {createFrameDriver} from './lib/frame-driver.js';
import {createBase} from './lib/setup.js';
import {bindGui,defaultsFromSchema} from './lib/gui.js';
import {meta} from './meta.js';
import * as fx from './effects/fluid-liquid-metal.js';
const $=s=>document.querySelector(s),stage=$('#stage'),canvas=$('canvas');
const lowEnd=new URLSearchParams(location.search).has('low')||(navigator.hardwareConcurrency||4)<=4||/Mobi|Android/i.test(navigator.userAgent);
const still=new URLSearchParams(location.search).has('still'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let base,params,gui,paused=still||reduced.matches,visible=true,dead=false,driver;
$('#name').textContent=meta.name;$('#zh').textContent=meta.zh;$('#tagline').textContent=meta.tagline;document.title=meta.name+' · 3Dfans特效大师';
$('#budget').textContent=lowEnd?'LOW POWER / 节能':'DESKTOP / 标准';
const report=error=>{$('#status').textContent=error.message||String(error);$('#status').dataset.state='error';$('#error').hidden=false;$('#error').textContent=String(error.stack||error);};
try{
  base=createBase(canvas,lowEnd);
  function resize(){base.resize(stage.clientWidth,stage.clientHeight);draw();}
  function draw(){if(dead)return;try{if(!fx.render?.(base))base.renderer.render(base.scene,base.camera);}catch(e){report(e);}}
  function choose(index){
    fx.dispose();gui?.destroy();
    const look=meta.looks[index];
    params={...defaultsFromSchema(fx.guiSchema),...look.params};
    if(lowEnd){if('density'in params)params.density=Math.min(params.density,.55);if('quality'in params)params.quality='low';}
    base.controls.enabled=true;base.camera.position.fromArray(meta.camera);base.controls.target.fromArray(meta.target);base.controls.update();
    fx.create(base,params);fx.update(0,params,base);
    gui=bindGui($('#gui'),fx.guiSchema,params,()=>{fx.update(0,params,base);draw();});
    for(const btn of document.querySelectorAll('[data-look]'))btn.setAttribute('aria-pressed',String(btn.dataset.look===look.id));
    $('#lookName').textContent=look.title;$('#lookHint').textContent=look.hint;
    $('#status').textContent='Ready / 就绪';$('#status').dataset.state='ready';draw();
  }
  meta.looks.forEach((look,i)=>{const b=document.createElement('button');b.type='button';b.dataset.look=look.id;b.textContent=look.title;b.onclick=()=>choose(i);$('#looks').append(b);});
  function syncPause(){$('#pause').textContent=paused?'Play / 播放':'Pause / 暂停';$('#pause').setAttribute('aria-pressed',String(paused));}
  $('#pause').onclick=()=>{paused=!paused;syncPause();driver?.refresh();};syncPause();
  reduced.addEventListener('change',e=>{if(e.matches){paused=true;syncPause();driver?.refresh();}});
  $('#reset').onclick=()=>choose(0);
  $('#camera').onclick=()=>{base.camera.position.fromArray(meta.camera);base.controls.target.fromArray(meta.target);base.controls.update();draw();};
  const obs=new ResizeObserver(resize);obs.observe(stage);
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;driver?.setVisible(visible);}).observe(stage);
  choose(0);resize();
  driver=createFrameDriver({canvas,clock:base.clock,controls:base.controls,isPaused:()=>paused,update:dt=>{fx.update(dt,params,base);},draw,onError:e=>{paused=true;syncPause();report(e);}});driver.refresh();
  window.addEventListener('pagehide',()=>{if(dead)return;dead=true;driver.dispose();obs.disconnect();gui?.destroy();fx.dispose();base.dispose();},{once:true});
}catch(e){report(e);}
