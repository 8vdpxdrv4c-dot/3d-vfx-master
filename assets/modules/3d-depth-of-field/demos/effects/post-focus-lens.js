// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="post-focus-lens";
export const title="镜头景深 · 3D Depth of Field";
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
    "key": "focus",
    "label": "对焦距离 Focus",
    "min": 5,
    "max": 19,
    "step": 0.1,
    "default": 10
  },
  {
    "key": "aperture",
    "label": "光圈系数 Aperture",
    "min": 0.00003,
    "max": 0.0018,
    "step": 0.00003,
    "default": 0.00045
  },
  {
    "key": "blur",
    "label": "模糊上限 Blur",
    "min": 0.003,
    "max": 0.07,
    "step": 0.001,
    "default": 0.035
  },
  {
    "key": "color",
    "label": "主体色 Color",
    "type": "color",
    "default": "#7aafb9"
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dDepthOfFieldScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dDepthOfFieldScene(ctx,p,root){
 plinth(root,4.5);const mat=new THREE.MeshStandardMaterial({color:p.color,metalness:.65,roughness:.23}),geo=new THREE.TorusGeometry(.43,.135,ctx.lowEnd?12:20,ctx.lowEnd?36:64);
 for(let i=0;i<7;i++){const m=mesh(root,geo,mat,[(i-3)*.72,1.05,(i-3)*1.05],[.24,.3,0]);m.rotation.z=(i-3)*.08;}
 const lens=makeLensPass(ctx,'focus');return{update(dt,q){mat.color.set(q.color);lens.configure(q);},render(c){return lens.render(c);},stats(){return lens.stats();},dispose(){lens.dispose();}};
}

