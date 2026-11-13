// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="motion-orbit-links";
export const title="数据飞线 · 3D Data Trails";
export const category="motion";
export const guiSchema=[
  {
    "key": "density",
    "label": "连接数量 Density",
    "min": 0.3,
    "max": 1.5,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "height",
    "label": "弧线高度 Height",
    "min": 0.3,
    "max": 3,
    "step": 0.05,
    "default": 1.4
  },
  {
    "key": "opacity",
    "label": "飞线强度 Opacity",
    "min": 0.1,
    "max": 0.9,
    "step": 0.01,
    "default": 0.45
  },
  {
    "key": "size",
    "label": "流点尺寸 Size",
    "min": 0.02,
    "max": 0.13,
    "step": 0.005,
    "default": 0.055
  },
  {
    "key": "color",
    "label": "数据色 Color",
    "type": "color",
    "default": "#9ccbd6"
  },
  {
    "key": "speed",
    "label": "传输速度 Speed",
    "min": 0,
    "max": 1.5,
    "step": 0.02,
    "default": 0.45
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["density"];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dDataTrailsScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dDataTrailsScene(ctx,p,root){
 plinth(root,3.4);const count=Math.max(3,Math.floor((ctx.lowEnd?6:10)*p.density)),routes=[],nodes=material('#93aab1',.3,.65),lineMat=new THREE.LineBasicMaterial({color:p.color,transparent:true,opacity:p.opacity}),packetMat=new THREE.MeshBasicMaterial({color:p.color});
 for(let i=0;i<count;i++){const a=i/count*TAU,opposite=a+Math.PI*(.7+(i%3)*.15),start=new THREE.Vector3(Math.cos(a)*2.75,.16,Math.sin(a)*2.75),end=new THREE.Vector3(Math.cos(opposite)*2.75,.16,Math.sin(opposite)*2.75);mesh(root,new THREE.SphereGeometry(.065,12,8),nodes,start.toArray());const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(65*3),3));const line=new THREE.Line(g,lineMat);line.frustumCulled=false;root.add(line);const packet=mesh(root,new THREE.SphereGeometry(1,10,8),packetMat);routes.push({g,start,end,packet,offset:i/count});}
 function at(r,u,h){const v=r.start.clone().lerp(r.end,u);v.y+=Math.sin(u*Math.PI)*h;return v;}
 return{update(dt,q,c,t){lineMat.color.set(q.color);lineMat.opacity=q.opacity;packetMat.color.set(q.color);for(const r of routes){const pos=r.g.attributes.position;for(let j=0;j<pos.count;j++){const v=at(r,j/(pos.count-1),q.height);pos.setXYZ(j,v.x,v.y,v.z);}pos.needsUpdate=true;r.packet.position.copy(at(r,(r.offset+t*q.speed*.15)%1,q.height));r.packet.scale.setScalar(q.size);}}};
}

