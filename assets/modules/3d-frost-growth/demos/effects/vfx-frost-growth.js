// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="vfx-frost-growth";
export const title="冰霜生长与破碎 · Crystal Field";
export const category="vfx";
export const guiSchema=[
  {
    "key": "growth",
    "label": "结霜进度 Growth",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.82
  },
  {
    "key": "density",
    "label": "晶体密度 Density",
    "min": 0.25,
    "max": 1.4,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "height",
    "label": "冰晶高度 Height",
    "min": 0.2,
    "max": 2,
    "step": 0.02,
    "default": 1
  },
  {
    "key": "fracture",
    "label": "破碎程度 Fracture",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0
  },
  {
    "key": "color",
    "label": "晶体色 Color",
    "type": "color",
    "default": "#a9d9e2"
  },
  {
    "key": "speed",
    "label": "呼吸速度 Speed",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.2
  }
];
let owner=null,root=null,state=null,elapsed=0,signature='';
const topology=["density"];
const key=p=>JSON.stringify(topology.map(k=>p[k]));
export function create(ctx,p={}){
 dispose();for(const s of guiSchema)if(p[s.key]===undefined)p[s.key]=s.default;
 owner=ctx;signature=key(p);elapsed=0;root=new THREE.Group();root.name=id;root.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(root);
 try{state=build(ctx,p,root);state.update?.(0,p,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,p,ctx=owner){if(!root)return;if(key(p)!==signature)create(ctx,p);elapsed+=Math.min(.05,Math.max(0,dt));state.update?.(Math.min(.05,Math.max(0,dt)),p,ctx,elapsed);}
export function render(ctx=owner){return root?(state.render?.(ctx)??false):false;}
export function stats(){return state?.stats?.()??{};}
export function dispose(){if(!root)return;try{state?.dispose?.();}finally{disposeTree(root);root=null;state=null;owner=null;elapsed=0;}}
function build(ctx,p,root){
 plinth(root,3.4);const rand=rng(831),segments=[],trunk=material('#b1dae0',.32,.18),crystal=new THREE.MeshPhysicalMaterial({color:p.color,metalness:.15,roughness:.15,transmission:ctx.lowEnd?.05:.22,thickness:.45,ior:1.31,clearcoat:.65,transparent:true,opacity:.9}),darker=material('#4b646f',.2,.55);
 mesh(root,new THREE.CylinderGeometry(3.1,3.1,.08,64),darker,[0,.01,0]);
 function grow(a,b,birth,depth){segments.push({a,b,birth});if(depth===0)return;const delta=b.clone().sub(a);for(const side of [-1,1]){const base=a.clone().lerp(b,.35+rand()*.25),turn=delta.clone().multiplyScalar(.47).applyAxisAngle(new THREE.Vector3(0,1,0),side*.6);grow(base,base.clone().add(turn),birth+.14,depth-1);}}
 const spokes=ctx.lowEnd?6:9;
 for(let i=0;i<spokes;i++){const a=i/spokes*TAU;grow(new THREE.Vector3(0,.085,0),new THREE.Vector3(Math.cos(a)*2.7,.085,Math.sin(a)*2.7),.04,3);}
 const geo=new THREE.CylinderGeometry(.012,.008,1,5),branches=new THREE.InstancedMesh(geo,trunk,segments.length);branches.frustumCulled=false;root.add(branches);const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),parts=[];
 const count=Math.floor((ctx.lowEnd?9:22)*p.density);
 for(let i=0;i<count;i++){const a=i/count*TAU,r=(p.variant===1?1.25:.35)+rand()*1.3,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.3+rand()*.85,group=new THREE.Group();group.position.set(x,.08,z);group.rotation.y=a;root.add(group);const pieces=[];for(let j=0;j<3;j++){const g=j===0?new THREE.ConeGeometry(.15,h,6):new THREE.TetrahedronGeometry(.18+rand()*.14,0);const m=mesh(group,g,crystal,[j===0?0:(j-1.5)*.17,h*(j===0?.5:.35),0]);pieces.push({m,home:m.position.clone(),phase:rand()*TAU});}parts.push({group,h,birth:.15+rand()*.65,pieces,phase:a});}
 return{update(dt,q,c,t){trunk.color.set(q.color).lerp(new THREE.Color('#dbe9ea'),.4);crystal.color.set(q.color);const g=clamp(q.growth+Math.sin(t*q.speed)*.035);for(let i=0;i<segments.length;i++){const s=segments[i],growth=smooth((g-s.birth)/.2),end=s.a.clone().lerp(s.b,growth),delta=end.clone().sub(s.a);dummy.position.copy(s.a).add(end).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,delta.lengthSq()>1e-9?delta.clone().normalize():up);dummy.scale.set(1,Math.max(.0001,delta.length()),1);dummy.updateMatrix();branches.setMatrixAt(i,dummy.matrix);}branches.instanceMatrix.needsUpdate=true;for(const part of parts){const visible=smooth((g-part.birth)/.22);part.group.scale.set(visible,visible*q.height,visible);part.pieces.forEach(({m,home,phase},j)=>{m.position.copy(home);const f=q.fracture;const distance=f*(.3+j*.14);m.position.x+=Math.cos(phase)*distance;m.position.z+=Math.sin(phase)*distance;m.position.y=Math.max(.08,home.y*(1-f)+Math.sin(f*Math.PI)*.28);m.rotation.set(f*(phase-.7),f*phase,f*.65);});}}};
}

