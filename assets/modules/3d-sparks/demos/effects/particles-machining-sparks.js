// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="particles-machining-sparks";
export const title="工业火花 · 3D Sparks";
export const category="particles";
export const guiSchema=[
  {
    "key": "density",
    "label": "粒子数量 Density",
    "min": 0.2,
    "max": 1.8,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "height",
    "label": "抛射高度 Height",
    "min": 0.6,
    "max": 4.2,
    "step": 0.05,
    "default": 2.5
  },
  {
    "key": "spread",
    "label": "横向扩散 Spread",
    "min": 0.25,
    "max": 2.2,
    "step": 0.05,
    "default": 0.8
  },
  {
    "key": "size",
    "label": "火花尺寸 Size",
    "min": 0.012,
    "max": 0.1,
    "step": 0.002,
    "default": 0.035
  },
  {
    "key": "color",
    "label": "火花色 Color",
    "type": "color",
    "default": "#ffc477"
  },
  {
    "key": "speed",
    "label": "时间速度 Speed",
    "min": 0,
    "max": 1.8,
    "step": 0.02,
    "default": 0.7
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["density"];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dSparksScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dSparksScene(ctx,p,root){
 plinth(root,2.75);const count=Math.floor((ctx.lowEnd?520:1550)*p.density),geo=pointField(count,812),pos=geo.attributes.position,seed=geo.attributes.aSeed;
 mesh(root,new THREE.CylinderGeometry(.16,.24,.35,24),material('#69747a',.25,.8),[0,.1,0]);
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{pointSize:{value:p.size},color:{value:new THREE.Color(p.color)},opacity:{value:.95}},vertexShader:pointVertex,fragmentShader:pointFragment});
 const points=new THREE.Points(geo,mat);points.frustumCulled=false;root.add(points);
 return{update(dt,q,c,t){mat.uniforms.pointSize.value=q.size;mat.uniforms.color.value.set(q.color);for(let i=0;i<count;i++){const age=(seed.getX(i)+t*q.speed*.28)%1,a=seed.getY(i)*TAU,r=(.18+seed.getZ(i)*.82)*q.spread*age;pos.setXYZ(i,Math.cos(a)*r,.24+4*age*(1-age)*q.height,Math.sin(a)*r);}pos.needsUpdate=true;},stats(){return{particles:count};}};
}

