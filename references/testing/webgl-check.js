import * as THREE from 'three';
import {createBase} from '../../assets/modules/3d-architecture-growth/demos/lib/setup.js';
const $=s=>document.querySelector(s),canvas=$('canvas'),yieldFrame=()=>new Promise(r=>requestAnimationFrame(r));
const pixels=renderer=>{const gl=renderer.getContext(),data=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,data);let h=2166136261,bright=0;for(let i=0;i<data.length;i+=4){h=Math.imul(h^data[i],16777619);h=Math.imul(h^data[i+1],16777619);h=Math.imul(h^data[i+2],16777619);if(data[i]+data[i+1]+data[i+2]>105)bright++;}return{hash:h>>>0,brightPixels:bright};};
$('#run').onclick=async()=>{
 $('#run').disabled=true;$('#status').dataset.state='running';$('#frames').replaceChildren();
 const log=[],rows=[],oldError=console.error;let fx,base;
 console.error=(...args)=>{log.push(args.map(String).join(' '));oldError(...args);};
 try{
  base=createBase(canvas);base.renderer.setPixelRatio(1);base.resize(600,450);base.controls.enabled=false;
  const sentinel=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshBasicMaterial({color:'#101824'}));sentinel.name='HOST_SENTINEL';sentinel.position.set(0,-8,0);base.scene.add(sentinel);
  const only=new URLSearchParams(location.search).get('only');
  const catalog=(await(await fetch('../effect-catalog.json')).json()).filter(x=>!only||only.split(',').includes(x.slug));
  const home=item=>{base.camera.position.fromArray(item.camera);base.controls.target.fromArray(item.target);base.controls.enabled=true;base.controls.update();base.controls.enabled=false;};
  const freeze=p=>{if('speed'in p)p.speed=0;if('spin'in p)p.spin=0;return p;};
  for(const item of catalog){
   $('#status').textContent='Checking '+item.slug;await yieldFrame();
   const row={slug:item.slug,looks:[],controls:[],extremes:[],cycles:[],errors:[]},start=log.length;let params;
   try{
    fx=await import('../../assets/modules/'+item.slug+'/demos/effects/'+item.effect+'.js');
    for(const key of ['id','title','category','guiSchema','create','update','dispose'])if(!fx[key])throw Error('Missing '+key);
    const defaults=()=>Object.fromEntries(fx.guiSchema.map(s=>[s.key,s.default]));
    const draw=()=>{const target=base.renderer.getRenderTarget(),tone=base.renderer.toneMapping,auto=base.renderer.autoClear;if(!fx.render?.(base))base.renderer.render(base.scene,base.camera);if(base.renderer.getRenderTarget()!==target||base.renderer.toneMapping!==tone||base.renderer.autoClear!==auto)throw Error('Host renderer state changed');return pixels(base.renderer);};
    for(const look of item.looks){fx.dispose();home(item);params=freeze({...defaults(),...look.params});fx.create(base,params);fx.update(0,params,base);const frame=draw();row.looks.push({id:look.id,...frame});const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=canvas.toDataURL('image/png');img.alt=item.slug+' / '+look.id;caption.textContent=img.alt;figure.append(img,caption);$('#frames').append(figure);await yieldFrame();}
    fx.dispose();home(item);params=freeze({...defaults(),...item.looks[0].params});fx.create(base,params);
    const controls=fx.guiSchema.filter(s=>s.min!==undefined&&!['speed','spin'].includes(s.key)).slice(0,2);
    for(const knob of controls){const original=params[knob.key];params[knob.key]=knob.min+(knob.max-knob.min)*.23;fx.update(0,params,base);const a=draw();params[knob.key]=knob.min+(knob.max-knob.min)*.77;fx.update(0,params,base);const b=draw();row.controls.push({key:knob.key,visibleChange:a.hash!==b.hash,a:a.hash,b:b.hash});params[knob.key]=original;fx.update(0,params,base);}
    for(const knob of fx.guiSchema.filter(s=>s.min!==undefined)){const original=params[knob.key];for(const value of [knob.min,knob.max]){params[knob.key]=value;fx.update(0,params,base);draw();let finite=true;base.scene.traverse(o=>{if(!o.matrixWorld.elements.every(Number.isFinite))finite=false;});if(!finite)throw Error('Non-finite transform '+knob.key);row.extremes.push({key:knob.key,value,finite});}params[knob.key]=original;fx.update(0,params,base);}
    fx.dispose();
    for(let cycle=0;cycle<3;cycle++){home(item);const pose=base.camera.position.clone(),quaternion=base.camera.quaternion.clone();params=freeze({...defaults(),...item.looks[0].params});fx.create(base,params);fx.update(.02,params,base);draw();fx.dispose();fx.dispose();base.renderer.render(base.scene,base.camera);row.cycles.push({...base.renderer.info.memory,children:base.scene.children.length,hostPreserved:base.scene.children.includes(sentinel),cameraRestored:!item.cameraOwner||(base.camera.position.distanceTo(pose)<1e-6&&base.camera.quaternion.angleTo(quaternion)<1e-6)});}
    row.noGrowth=row.cycles.slice(1).every((x,i)=>x.geometries<=row.cycles[i].geometries&&x.textures<=row.cycles[i].textures&&x.children===4&&x.hostPreserved&&x.cameraRestored);
    base.lowEnd=true;home(item);params=freeze({...defaults(),...item.looks[0].params});if('density'in params)params.density=Math.min(params.density,.55);if('quality'in params)params.quality='low';fx.create(base,params);fx.update(0,params,base);row.lowPower=draw().brightPixels>60;row.lowPowerStats=fx.stats?.();fx.dispose();base.lowEnd=false;
    const quality=fx.guiSchema.find(s=>s.key==='quality');if(quality){row.qualityModes=[];for(const value of quality.options){home(item);params=freeze({...defaults(),quality:value});fx.create(base,params);fx.update(0,params,base);row.qualityModes.push({quality:value,visible:draw().brightPixels>60,stats:fx.stats?.()});fx.dispose();}}
   }catch(error){row.errors.push(error.stack||String(error));try{fx?.dispose();}catch{}}
   row.errors.push(...log.slice(start));row.pass=!row.errors.length&&row.looks.length===item.looks.length&&row.looks.every(x=>x.brightPixels>60)&&row.controls.length===2&&row.controls.every(x=>x.visibleChange)&&row.noGrowth&&row.lowPower&&(!row.qualityModes||row.qualityModes.every(x=>x.visible));
   rows.push(row);$('#report').textContent=JSON.stringify({date:'2026-10-24',viewport:[600,450],total:rows.length,passed:rows.filter(x=>x.pass).length,rows},null,2);await yieldFrame();
  }
  sentinel.geometry.dispose();sentinel.material.dispose();base.scene.remove(sentinel);$('#status').textContent=rows.filter(x=>x.pass).length+'/'+rows.length+' passed';$('#status').dataset.state='done';
 }catch(error){$('#status').textContent=String(error);$('#status').dataset.state='error';}finally{console.error=oldError;try{fx?.dispose();base?.dispose();}catch{}$('#run').disabled=false;}
};
