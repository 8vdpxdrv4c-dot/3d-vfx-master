const moduleBase='../../modules/';
const $=s=>document.querySelector(s),recipe=document.body.dataset.recipe,canvas=$('canvas'),stage=$('#stage');
const specs={'aurora-rain':{first:'3d-rain',effect:'particles-rain-volume'},'glass-bloom':{first:'3d-glass',effect:'materials-clear-volume'}};
const spec=specs[recipe],low=new URLSearchParams(location.search).has('low'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let base,first,second,lens,gui,params,view,paused=new URLSearchParams(location.search).has('still')||reduced.matches,driver,visible=true,dead=false;
const error=e=>{$('#status').dataset.state='error';$('#status').textContent=e.message||String(e);};
try{
 const [{createBase},{bindGui,defaultsFromSchema},a,{createFrameDriver}]=await Promise.all([import(moduleBase+spec.first+'/demos/lib/setup.js'),import(moduleBase+spec.first+'/demos/lib/gui.js'),import(moduleBase+spec.first+'/demos/effects/'+spec.effect+'.js'),import(moduleBase+spec.first+'/demos/lib/frame-driver.js')]);
 base=createBase(canvas,low);first=a;params=defaultsFromSchema(first.guiSchema);
 base.camera.position.set(7,4.2,10);base.controls.target.set(0,1.7,0);base.controls.update();
 const settings=recipe==='aurora-rain'?{density:low?.35:.65,wind:.2,curtain:.8,speed:.6}:{roughness:.06,thickness:.9,glow:.3,speed:.18};
 const schema=recipe==='aurora-rain'?[{key:'density',label:'雨量 Rain',min:.2,max:1.3,step:.05},{key:'wind',label:'横向风 Wind',min:-1,max:1,step:.05},{key:'curtain',label:'极光强度 Aurora',min:.1,max:1,step:.05},{key:'speed',label:'时间速度 Speed',min:0,max:1,step:.05}]:[{key:'roughness',label:'玻璃粗糙度 Roughness',min:.02,max:.5,step:.01},{key:'thickness',label:'玻璃厚度 Thickness',min:.1,max:2,step:.05},{key:'glow',label:'辉光强度 Glow',min:0,max:1,step:.05},{key:'speed',label:'自转速度 Speed',min:0,max:.6,step:.02}];
 if(recipe==='aurora-rain'){
  second=await import(moduleBase+'3d-aurora/demos/effects/lighting-polar-ribbons.js');view=defaultsFromSchema(second.guiSchema);view.opacity=settings.curtain;view.height=3.1;view.wave=1;second.create(base,view);const group=base.scene.getObjectByName(second.id);group.position.set(0,.65,-2.5);
 }else{const {makeLensPass}=await import(moduleBase+'3d-bloom/demos/lib/lens-pass.js');lens=makeLensPass(base,'glow');}
 first.create(base,params);
 function update(dt){
  if(recipe==='aurora-rain'){params.density=settings.density;params.wind=settings.wind;params.speed=settings.speed;view.opacity=settings.curtain;view.speed=settings.speed*.4;second.update(dt,view,base);}
  else{params.roughness=settings.roughness;params.thickness=settings.thickness;params.spin=settings.speed;}
  first.update(dt,params,base);if(lens)lens.configure({quality:low?'low':'high',strength:settings.glow,radius:1,threshold:1.2,exposure:1});
 }
 function draw(){if(dead)return;update(0);if(lens)lens.render(base);else base.renderer.render(base.scene,base.camera);canvas.dataset.draws=String(1+Number(canvas.dataset.draws||0));}
 function pauseUi(){$('#pause').textContent=paused?'播放 / Play':'暂停 / Pause';$('#pause').setAttribute('aria-pressed',String(paused));}
 $('#pause').onclick=()=>{paused=!paused;pauseUi();driver.refresh();};
 $('#reset').onclick=()=>{base.camera.position.set(7,4.2,10);base.controls.target.set(0,1.7,0);base.controls.update();draw();};
 gui=bindGui($('#gui'),schema,settings,draw);
 const resize=()=>{base.resize(stage.clientWidth,stage.clientHeight);draw();};const observer=new ResizeObserver(resize);observer.observe(stage);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;driver?.setVisible(visible);});intersection.observe(stage);
 const reduceMotion=e=>{if(e.matches){paused=true;pauseUi();driver?.refresh();}};reduced.addEventListener('change',reduceMotion);
 update(0);resize();pauseUi();$('#status').textContent='Ready / 已就绪';$('#status').dataset.state='ready';driver=createFrameDriver({canvas,clock:base.clock,controls:base.controls,isPaused:()=>paused,update,draw,onError:e=>{paused=true;pauseUi();error(e);}});driver.refresh();
 window.addEventListener('pagehide',()=>{if(dead)return;dead=true;driver.dispose();reduced.removeEventListener('change',reduceMotion);observer.disconnect();intersection.disconnect();gui.destroy();lens?.dispose();second?.dispose();first.dispose();base.dispose();},{once:true});
}catch(e){error(e);}
