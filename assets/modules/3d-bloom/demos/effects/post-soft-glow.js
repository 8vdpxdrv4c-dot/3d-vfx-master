// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="post-soft-glow";
export const title="电影辉光 · 3D Bloom";
export const category="postprocessing";
export const guiSchema=[
  {
    "key": "quality",
    "label": "质量 Quality",
    "options": [
      "low",
      "mid",
      "high",
      "cinematic"
    ],
    "default": "high"
  },
  {
    "key": "strength",
    "label": "辉光强度 Strength",
    "min": 0,
    "max": 2,
    "step": 0.02,
    "default": 0.8
  },
  {
    "key": "radius",
    "label": "扩散半径 Radius",
    "min": 0.2,
    "max": 2.5,
    "step": 0.02,
    "default": 1
  },
  {
    "key": "threshold",
    "label": "亮部阈值 Threshold",
    "min": 0.2,
    "max": 2,
    "step": 0.02,
    "default": 0.9
  },
  {
    "key": "exposure",
    "label": "曝光 Exposure",
    "min": 0.5,
    "max": 1.6,
    "step": 0.02,
    "default": 1
  },
  {
    "key": "color",
    "label": "发光色 Color",
    "type": "color",
    "default": "#7ac9d1"
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dBloomScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dBloomScene(ctx,p,root){
 plinth(root,2.6);const mat=new THREE.MeshStandardMaterial({color:p.color,emissive:p.color,emissiveIntensity:2.2,metalness:.25,roughness:.28});
 const form=mesh(root,new THREE.TorusKnotGeometry(.85,.29,ctx.lowEnd?110:190,ctx.lowEnd?14:24),mat,[0,1.65,0],[.2,0,.1]),lens=makeLensPass(ctx,'glow');
 return{update(dt,q,c,t){mat.color.set(q.color);mat.emissive.set(q.color);form.rotation.y=t*.13;lens.configure(q);},render(c){return lens.render(c);},stats(){return lens.stats();},dispose(){lens.dispose();}};
}

