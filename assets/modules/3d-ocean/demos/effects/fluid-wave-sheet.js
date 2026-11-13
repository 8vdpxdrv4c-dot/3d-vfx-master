// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="fluid-wave-sheet";
export const title="流动水面 · 3D Ocean";
export const category="fluid-gas";
export const guiSchema=[
  {
    "key": "distortion",
    "label": "波纹幅度 Distortion",
    "min": 0.15,
    "max": 3,
    "step": 0.05,
    "default": 1.2
  },
  {
    "key": "roughness",
    "label": "水面粗糙度 Roughness",
    "min": 0.08,
    "max": 0.8,
    "step": 0.01,
    "default": 0.3
  },
  {
    "key": "frequency",
    "label": "波纹频率 Frequency",
    "min": 0.5,
    "max": 2.8,
    "step": 0.05,
    "default": 1.2
  },
  {
    "key": "sun",
    "label": "光照方位 Sun",
    "min": -3.1,
    "max": 3.1,
    "step": 0.05,
    "default": 0.8
  },
  {
    "key": "color",
    "label": "水体色 Color",
    "type": "color",
    "default": "#315e6c"
  },
  {
    "key": "speed",
    "label": "时间速度 Speed",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.35
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dOceanScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dOceanScene(ctx,p,root){
 const subdivisions=ctx.lowEnd?38:82,geo=new THREE.PlaneGeometry(8,8,subdivisions,subdivisions);geo.rotateX(-Math.PI/2);const rest=geo.attributes.position.array.slice(),position=geo.attributes.position;
 const reflection=new THREE.WebGLRenderTarget(ctx.lowEnd?256:512,ctx.lowEnd?256:512,{type:ctx.renderer.capabilities.isWebGL2?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:true});reflection.texture.colorSpace=THREE.LinearSRGBColorSpace;
 const mirror=new THREE.PerspectiveCamera(),projector=new THREE.Matrix4(),bias=new THREE.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
 const u={reflection:{value:reflection.texture},projector:{value:projector},waterColor:{value:new THREE.Color(p.color)},distortion:{value:p.distortion},roughness:{value:p.roughness},sun:{value:p.sun}};
 const mat=new THREE.ShaderMaterial({uniforms:u,side:THREE.DoubleSide,vertexShader:'uniform mat4 projector;varying vec3 waterWorld,waterNormal;varying vec4 projected;void main(){waterWorld=(modelMatrix*vec4(position,1.)).xyz;waterNormal=normalize(mat3(modelMatrix)*normal);projected=projector*vec4(position,1.);gl_Position=projectionMatrix*viewMatrix*vec4(waterWorld,1.);}',fragmentShader:'uniform sampler2D reflection;uniform vec3 waterColor;uniform float distortion,roughness,sun;varying vec3 waterWorld,waterNormal;varying vec4 projected;void main(){vec3 n=normalize(waterNormal),view=normalize(cameraPosition-waterWorld);vec2 uv=projected.xy/projected.w+n.xz*distortion*.018;vec3 image=texture2D(reflection,clamp(uv,vec2(.001),vec2(.999))).rgb;float fresnel=.18+.65*pow(1.-max(0.,dot(n,view)),3.);vec3 light=normalize(vec3(cos(sun),1.1,sin(sun)));float shine=pow(max(0.,dot(reflect(-light,n),view)),mix(100.,10.,roughness))*(1.-roughness);vec3 color=mix(waterColor*.45,image,fresnel*(1.-roughness*.55))+vec3(.8,.88,.9)*shine*.55;gl_FragColor=vec4(color,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
 const water=mesh(root,geo,mat);water.frustumCulled=false;
 const hero=mesh(root,new THREE.TorusKnotGeometry(.82,.27,ctx.lowEnd?100:180,ctx.lowEnd?14:24),material('#a4bdc3',.2,.65),[0,1.4,0],[.15,.1,0]);
 return{update(dt,q,c,t){u.waterColor.value.set(q.color);u.distortion.value=q.distortion;u.roughness.value=q.roughness;u.sun.value=q.sun;const clock=t*q.speed;for(let i=0;i<position.count;i++){const x=rest[i*3],z=rest[i*3+2],k=q.frequency;position.setY(i,q.distortion*.035*(Math.sin(x*k*2.3+clock*.8)*.7+Math.cos(z*k*3.1-clock*.6)*.5+Math.sin((x+z)*k*4+clock)*.2));}position.needsUpdate=true;geo.computeVertexNormals();hero.rotation.y=clock*.15;},render(c){
  const r=c.renderer,previousTarget=r.getRenderTarget(),tone=r.toneMapping,auto=r.autoClear,xr=r.xr.enabled,wasVisible=water.visible;
  try{mirror.copy(c.camera);const eye=c.camera.position,forward=c.camera.getWorldDirection(new THREE.Vector3()),target=eye.clone().add(forward);target.y=-target.y;mirror.position.set(eye.x,-eye.y,eye.z);mirror.up.copy(c.camera.up);mirror.up.y*=-1;mirror.lookAt(target);mirror.updateMatrixWorld(true);water.updateMatrixWorld(true);projector.copy(bias).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse).multiply(water.matrixWorld);
   water.visible=false;r.xr.enabled=false;r.autoClear=true;r.toneMapping=THREE.NoToneMapping;r.setRenderTarget(reflection);r.render(c.scene,mirror);water.visible=wasVisible;r.toneMapping=tone;r.setRenderTarget(previousTarget);r.render(c.scene,c.camera);return true;
  }finally{water.visible=wasVisible;r.setRenderTarget(previousTarget);r.toneMapping=tone;r.autoClear=auto;r.xr.enabled=xr;}
 },stats(){return{reflectionWidth:reflection.width,reflectionHeight:reflection.height,waterVertices:position.count};},dispose(){u.reflection.value=null;reflection.dispose();}};
}

