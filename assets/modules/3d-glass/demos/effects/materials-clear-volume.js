// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="materials-clear-volume";
export const title="透射玻璃 · 3D Glass";
export const category="materials";
export const guiSchema=[
  {
    "key": "roughness",
    "label": "粗糙度 Roughness",
    "min": 0.02,
    "max": 0.65,
    "step": 0.01,
    "default": 0.08
  },
  {
    "key": "thickness",
    "label": "光学厚度 Thickness",
    "min": 0.1,
    "max": 3,
    "step": 0.05,
    "default": 1.3
  },
  {
    "key": "ior",
    "label": "折射率 IOR",
    "min": 1.05,
    "max": 2,
    "step": 0.01,
    "default": 1.5
  },
  {
    "key": "transmission",
    "label": "透射比例 Transmission",
    "min": 0.2,
    "max": 1,
    "step": 0.01,
    "default": 0.98
  },
  {
    "key": "color",
    "label": "玻璃色 Color",
    "type": "color",
    "default": "#d4edf0"
  },
  {
    "key": "spin",
    "label": "旋转速度 Spin",
    "min": 0,
    "max": 0.5,
    "step": 0.01,
    "default": 0.1
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dGlassScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dGlassScene(ctx,p,root){
 plinth(root,2.6);const mat=new THREE.MeshPhysicalMaterial({color:p.color,roughness:p.roughness,metalness:0,transmission:p.transmission,thickness:p.thickness,ior:p.ior,attenuationColor:new THREE.Color(p.color),attenuationDistance:2,clearcoat:1});
 const object=mesh(root,new THREE.TorusKnotGeometry(.85,.29,ctx.lowEnd?112:200,ctx.lowEnd?16:30),mat,[0,1.65,0],[.2,0,0]);
 const card=material('#425c6d',.5,.4);for(let i=0;i<5;i++)box(root,[.09,2.2,.1],[(i-2)*.45,1.4,-1.2],card);
 return{update(dt,q,c,t){mat.color.set(q.color);mat.attenuationColor.set(q.color);mat.roughness=q.roughness;mat.thickness=q.thickness;mat.ior=q.ior;mat.transmission=q.transmission;object.rotation.y=t*q.spin;}};
}

