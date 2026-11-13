// Spout — @P_Malin. Shader supplied by the user; see references/source-notes.md.
// Lifecycle, live controls and view adapter are authored for this local skill.
import * as THREE from 'three';
import {vertexShader,makeSpoutFragment} from '../lib/spout-shaders.js';
import {disposeSpoutResources} from '../lib/dispose.js';
import {meta} from '../meta.js';
export const id=meta.effect,title='排水管喷水 · Drain Spout',category=meta.category,guiSchema=meta.schema;
let state=null;
const bounded=(value,min,max,fallback)=>Math.min(max,Math.max(min,Number.isFinite(Number(value))?Number(value):fallback));
function surfaceTexture(){
 const size=256,data=new Uint8Array(size*size*4);
 // New deterministic masonry field, generated locally. No downloaded iChannel0 asset.
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const row=Math.floor(y/32),u=(x+(row%2)*32)%64,v=y%32;
  const grout=u<2||u>61||v<2||v>29;
  const grain=(Math.sin(x*12.3+y*7.7)*Math.sin(x*.9-y*2.1)+1)*.025;
  const brick=.5+.09*Math.sin(Math.floor((x+(row%2)*32)/64)*31.7+row*12.1);
  const rgb=grout?[.18,.21,.22]:[brick+.11+grain,brick+.035+grain,brick-.035+grain];
  const at=(y*size+x)*4;for(let k=0;k<3;k++)data[at+k]=Math.round(Math.min(1,Math.max(0,rgb[k]))*255);data[at+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
export function create(ctx,params={}){
 dispose();
 if(!ctx?.renderer)throw new Error('Drain Spout requires ctx.renderer.');
 const texture=surfaceTexture(),uniforms={
  iResolution:{value:new THREE.Vector3(1,1,1)},iTime:{value:0},iMouse:{value:new THREE.Vector4(.2,.8,1,1)},iChannel0:{value:texture},
  uFlow:{value:1},uRadius:{value:.4},uHeight:{value:2},uRipple:{value:.025},uExposure:{value:1.5},
  uViewportOrigin:{value:new THREE.Vector2()},uZoom:{value:1}
 };
 const geometry=new THREE.PlaneGeometry(2,2),material=new THREE.RawShaderMaterial({uniforms,vertexShader,fragmentShader:makeSpoutFragment(!!ctx.lowEnd),glslVersion:THREE.GLSL3,depthTest:false,depthWrite:false,toneMapped:false});
 const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.name=id;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);scene.add(mesh);
 state={ctx,scene,camera,geometry,material,texture,uniforms,time:0,view:[.2,.8,1],lowEnd:!!ctx.lowEnd,viewport:new THREE.Vector4()};
 update(0,params,ctx);return mesh;
}
export function update(dt,params={},ctx=state?.ctx){
 if(!state)return;
 for(const s of guiSchema)if(params[s.key]===undefined)params[s.key]=s.default;
 const step=bounded(dt,0,.05,0),speed=bounded(params.speed,0,1.8,1);
 state.time+=step*speed;state.uniforms.iTime.value=state.time;
 for(const [key,uniform] of [['flow','uFlow'],['radius','uRadius'],['height','uHeight'],['ripple','uRipple'],['exposure','uExposure']]){
  const schema=guiSchema.find(s=>s.key===key);state.uniforms[uniform].value=bounded(params[key],schema.min,schema.max,schema.default);
 }
 state.ctx=ctx||state.ctx;
}
export function setView(x=.2,y=.8,zoom=1){
 if(!state)return;
 state.view=[bounded(x,.025,.975,.2),bounded(y,.14,.92,.8),bounded(zoom,.7,1.65,1)];
 state.uniforms.uZoom.value=state.view[2];
}
export function seek(seconds=0){if(state){state.time=Math.max(0,Number(seconds)||0);state.uniforms.iTime.value=state.time;}}
export function render(ctx=state?.ctx){
 if(!state||!ctx?.renderer)return false;
 const r=ctx.renderer,oldAuto=r.autoClear,oldXR=r.xr.enabled;
 r.getCurrentViewport(state.viewport);const v=state.viewport,w=Math.max(1,v.z),h=Math.max(1,v.w),u=state.uniforms;
 u.iResolution.value.set(w,h,w/h);u.uViewportOrigin.value.set(v.x,v.y);u.iMouse.value.set(state.view[0]*w,state.view[1]*h,1,1);
 try{r.xr.enabled=false;r.autoClear=true;r.render(state.scene,state.camera);return true;}finally{r.autoClear=oldAuto;r.xr.enabled=oldXR;}
}
export function stats(){
 if(!state)return {disposed:true};
 const {uFlow,uHeight}=state.uniforms;
 return {time:state.time,quality:state.lowEnd?'low':'standard',raySteps:state.lowEnd?16:32,view:[...state.view],impactX:Math.sqrt(2*uHeight.value)*uFlow.value,renderSize:[state.uniforms.iResolution.value.x,state.uniforms.iResolution.value.y],representation:'fullscreen analytic distance field'};
}
export function dispose(){if(!state)return;const old=state;state=null;disposeSpoutResources(old);}
