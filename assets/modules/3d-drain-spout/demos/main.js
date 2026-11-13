import * as THREE from 'three';
import {bindGui,defaultsFromSchema} from './lib/gui.js';
import * as effect from './effects/fluid-drain-spout.js';
import {meta} from './meta.js';
const $=selector=>document.querySelector(selector),canvas=$('canvas'),stage=$('#stage'),query=new URLSearchParams(location.search);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let lowEnd=query.has('low')||(navigator.hardwareConcurrency||4)<=4||/Mobi|Android/i.test(navigator.userAgent);
let renderer,gui,params,ctx,paused=query.has('still')||reduced.matches,visible=true,dead=false,frame=0,draws=0,last=0,elapsed=0,activeLook=0,view=[.2,.8,1],dragging=null,raf;
const error=e=>{$('#status').dataset.state='error';$('#status').textContent=e.message||String(e);$('#error').hidden=false;$('#error').textContent=String(e.stack||e);};
function status(){const s=effect.stats();$('#readout').textContent=s.renderSize.join(' × ')+' px · '+s.raySteps+' steps';$('#time').textContent=s.time.toFixed(2)+' s';}
function draw(){if(dead)return;try{effect.render(ctx);const s=effect.stats();canvas.dataset.draws=String(++draws);canvas.dataset.time=String(s.time);canvas.dataset.view=JSON.stringify(s.view);canvas.dataset.quality=s.quality;status();}catch(e){error(e);}}
function resize(){const scale=lowEnd ? .55 : .85,cap=lowEnd ? 560 : 850,w=Math.max(1,Math.min(cap,Math.round(stage.clientWidth*scale))),h=Math.max(1,Math.round(w*stage.clientHeight/stage.clientWidth));renderer.setSize(w,h,false);draw();}
function syncPause(){$('#pause').textContent=paused?'Play / 播放':'Pause / 暂停';$('#pause').setAttribute('aria-pressed',String(paused));}
function choose(index){
 activeLook=index;effect.dispose();gui?.destroy();params={...defaultsFromSchema(effect.guiSchema),...meta.looks[index].params};effect.create(ctx,params);effect.setView(...view);
 gui=bindGui($('#gui'),effect.guiSchema,params,()=>{effect.update(0,params,ctx);draw();});
 for(const b of document.querySelectorAll('[data-look]'))b.setAttribute('aria-pressed',String(b.dataset.look===meta.looks[index].id));
 $('#lookName').textContent=meta.looks[index].title;$('#lookHint').textContent=meta.looks[index].hint;$('#status').textContent='Ready / 就绪';$('#status').dataset.state='ready';draw();
}
try{
 if(!window.WebGL2RenderingContext)throw new Error('此效果需要 WebGL 2 / WebGL 2 is required.');
 renderer=new THREE.WebGLRenderer({canvas,antialias:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setPixelRatio(1);
 if(!renderer.capabilities.isWebGL2)throw new Error('此效果需要 WebGL 2 / WebGL 2 is required.');
 renderer.debug.onShaderError=(gl,program,vertex,fragment)=>error(new Error('Shader compile failed: '+gl.getProgramInfoLog(program)+'\n'+gl.getShaderInfoLog(vertex)+'\n'+gl.getShaderInfoLog(fragment)));
 ctx={renderer,lowEnd};$('#budget').textContent=lowEnd?'LOW POWER / 节能':'STANDARD / 标准';
 $('#quality').textContent=lowEnd?'Standard / 标准':'Low power / 节能';
 meta.looks.forEach((look,i)=>{const b=document.createElement('button');b.type='button';b.dataset.look=look.id;b.textContent=look.title;b.onclick=()=>choose(i);$('#looks').append(b);});
 choose(0);resize();syncPause();
 $('#pause').onclick=()=>{paused=!paused;last=0;syncPause();if(!paused)schedule();};
 $('#reset').onclick=()=>{view=[.2,.8,1];choose(0);};
 $('#camera').onclick=()=>{view=[.2,.8,1];effect.setView(...view);draw();};
 $('#quality').onclick=()=>{const t=effect.stats().time;lowEnd=!lowEnd;ctx.lowEnd=lowEnd;effect.create(ctx,params);effect.seek(t);effect.setView(...view);$('#budget').textContent=lowEnd?'LOW POWER / 节能':'STANDARD / 标准';$('#quality').textContent=lowEnd?'Standard / 标准':'Low power / 节能';resize();};
 function cancelDrag(e){if(dragging&&(!e||e.pointerId===dragging.id)){dragging=null;canvas.classList.remove('dragging');}}
 canvas.addEventListener('pointerdown',e=>{dragging={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
 canvas.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==dragging.id)return;view[0]=Math.min(.975,Math.max(.025,view[0]-(e.clientX-dragging.x)/stage.clientWidth*.55));view[1]=Math.min(.92,Math.max(.14,view[1]+(e.clientY-dragging.y)/stage.clientHeight*.5));dragging.x=e.clientX;dragging.y=e.clientY;effect.setView(...view);draw();});
 canvas.addEventListener('pointerup',cancelDrag);canvas.addEventListener('pointercancel',cancelDrag);canvas.addEventListener('lostpointercapture',cancelDrag);
 canvas.addEventListener('wheel',e=>{e.preventDefault();view[2]=Math.min(1.65,Math.max(.7,view[2]*Math.exp(e.deltaY*.0007)));effect.setView(...view);draw();},{passive:false});
 reduced.addEventListener('change',e=>{if(e.matches){paused=true;syncPause();}});
 const observer=new ResizeObserver(resize);observer.observe(stage);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;schedule();}});intersection.observe(stage);
 document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)schedule();});
 function schedule(){if(!raf&&!dead&&!paused&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
 function tick(now){raf=0;if(dead||paused||!visible||document.hidden){last=0;return;}const dt=last?Math.min((now-last)/1000,.05):0;last=now;elapsed+=dt;if(elapsed>=1/(lowEnd?20:30)){effect.update(Math.min(elapsed,.05),params,ctx);elapsed=0;draw();frame++;}schedule();}
 schedule();
 const teardown=()=>{if(dead)return;dead=true;cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();gui?.destroy();effect.dispose();renderer.dispose();renderer.forceContextLoss();};
 window.addEventListener('pagehide',teardown,{once:true});
}catch(e){error(e);}
