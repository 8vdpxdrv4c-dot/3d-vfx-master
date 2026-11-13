// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="shader-paper-material";
export const title="纤维纸张材质 · Fiber Sheet";
export const category="shaders";
export const guiSchema=[
  {
    "key": "fiber",
    "label": "纤维强度 Fiber",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.55
  },
  {
    "key": "curl",
    "label": "卷角幅度 Curl",
    "min": 0,
    "max": 1.5,
    "step": 0.01,
    "default": 0.55
  },
  {
    "key": "thickness",
    "label": "纸层厚度 Thickness",
    "min": 0.002,
    "max": 0.06,
    "step": 0.002,
    "default": 0.018
  },
  {
    "key": "roughness",
    "label": "粗糙度 Roughness",
    "min": 0.25,
    "max": 1,
    "step": 0.01,
    "default": 0.85
  },
  {
    "key": "color",
    "label": "纸张色 Color",
    "type": "color",
    "default": "#dfd2b3"
  },
  {
    "key": "speed",
    "label": "呼吸速度 Speed",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.18
  }
];
let owner=null,root=null,state=null,elapsed=0,signature='';
const topology=[];
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
 plinth(root,2.9);const rand=rng(208),fiber=canvasTexture((c,n)=>{c.fillStyle='#eee9dc';c.fillRect(0,0,n,n);for(let j=0;j<8500;j++){const x=rand()*n,y=rand()*n;c.strokeStyle=j%3?'rgba(98,80,43,.08)':'rgba(255,255,255,.3)';c.lineWidth=.4+rand()*.6;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+rand()*5,y+rand()*14,x+(rand()-.5)*11,y+rand()*32);c.stroke();}},512);
 const relief=textureFromField((x,y)=>[.5+.045*Math.sin(x*TAU*110+y*40),.5+.045*Math.cos(y*TAU*170+x*14),1],256);
 const mat=new THREE.MeshPhysicalMaterial({color:p.color,map:fiber,normalMap:relief,normalScale:new THREE.Vector2(.5,.5),roughness:p.roughness,side:THREE.DoubleSide,clearcoat:0,sheen:.15,sheenColor:new THREE.Color('#e6d9b1')});
 const under=new THREE.MeshStandardMaterial({color:'#c5b48e',roughness:1,side:THREE.DoubleSide});
 const group=new THREE.Group();group.position.y=1.85;group.rotation.set(-.12,-.2,-.12);root.add(group);
 const layers=[];for(let i=0;i<5;i++){const g=new THREE.PlaneGeometry(3.9,2.9,ctx.lowEnd?28:56,ctx.lowEnd?24:46);const m=mesh(group,g,i===0?mat:under);layers.push({m,g,base:g.attributes.position.array.slice()});}
 // The sheet is deliberately suspended; no support rods cross its inspectable surface.
 return{update(dt,q,c,t){mat.color.set(q.color);mat.roughness=q.roughness;mat.normalScale.setScalar(q.fiber*.8);under.color.set(q.color).lerp(new THREE.Color('#e4d4ad'),.25);const curl=q.curl+Math.sin(t*q.speed)*.055;for(let layer=0;layer<layers.length;layer++){const{g,base}=layers[layer],pos=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<pos.count;i++){const u=uv.getX(i),v=uv.getY(i),edgeU=Math.abs(u-.5)*2,edgeV=Math.abs(v-.5)*2;const torn=(Math.sin(v*143)+.45*Math.sin(v*367))*.008*edgeU**9;const tornY=(Math.sin(u*169)+.4*Math.cos(u*413))*.008*edgeV**9;const corner=Math.max(0,u+v-1.15),roll=corner*corner*curl*2;let z=roll+Math.sin(u*5.6)*.065+Math.abs(u-.49)*.11-layer*q.thickness/4;if(p.variant===1)z+=Math.sin((u-.5)*3.3)*curl*.26;if(p.variant===2)z+=Math.max(0,.35-u)*curl*.45;pos.setXYZ(i,base[i*3]+torn-roll*.12,base[i*3+1]+tornY-roll*.08,z);}pos.needsUpdate=true;g.computeVertexNormals();}}};
}

