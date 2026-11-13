// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="pipe-luminous-current";
export const title="管道流动 · 3D Pipe Flow";
export const category="motion";
export const guiSchema=[
  {
    "key": "density",
    "label": "流点数量 Density",
    "min": 0.2,
    "max": 1.5,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "radius",
    "label": "管道半径 Radius",
    "min": 0.08,
    "max": 0.33,
    "step": 0.01,
    "default": 0.17
  },
  {
    "key": "spacing",
    "label": "流点间距 Spacing",
    "min": 0.5,
    "max": 2,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "opacity",
    "label": "管壁透明度 Opacity",
    "min": 0.1,
    "max": 0.65,
    "step": 0.01,
    "default": 0.26
  },
  {
    "key": "color",
    "label": "流体色 Color",
    "type": "color",
    "default": "#86d5d3"
  },
  {
    "key": "speed",
    "label": "流速 Speed",
    "min": 0,
    "max": 1.2,
    "step": 0.02,
    "default": 0.35
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["density","radius"];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dPipeFlowScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dPipeFlowScene(ctx,p,root){
 const route=new THREE.CatmullRomCurve3([new THREE.Vector3(-2.7,.6,0),new THREE.Vector3(-1.6,2.65,.1),new THREE.Vector3(-.1,1,.3),new THREE.Vector3(1.3,2.8,-.1),new THREE.Vector3(2.6,.75,0)]),tubeMat=new THREE.MeshPhysicalMaterial({color:'#739399',roughness:.3,metalness:.15,transparent:true,opacity:p.opacity,side:THREE.DoubleSide});
 mesh(root,new THREE.TubeGeometry(route,ctx.lowEnd?70:140,p.radius,ctx.lowEnd?8:16,false),tubeMat);
 plinth(root,3.4);const count=Math.max(8,Math.floor((ctx.lowEnd?26:50)*p.density)),packMat=new THREE.MeshBasicMaterial({color:p.color}),packets=new THREE.InstancedMesh(new THREE.SphereGeometry(p.radius*.38,10,8),packMat,count);packets.frustumCulled=false;root.add(packets);
 const dummy=new THREE.Object3D(),headMat=material('#748f98',.23,.7);for(const t of [0,1]){const at=route.getPointAt(t);mesh(root,new THREE.SphereGeometry(p.radius*1.6,16,12),headMat,at.toArray());}
 return{update(dt,q,c,t){tubeMat.opacity=q.opacity;packMat.color.set(q.color);for(let i=0;i<count;i++){const at=((i/count)*q.spacing+t*q.speed*.16)%1;dummy.position.copy(route.getPointAt(at));dummy.scale.setScalar(.8+.2*Math.sin(at*TAU));dummy.updateMatrix();packets.setMatrixAt(i,dummy.matrix);}packets.instanceMatrix.needsUpdate=true;}};
}

