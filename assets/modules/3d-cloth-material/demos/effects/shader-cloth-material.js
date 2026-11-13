// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="shader-cloth-material";
export const title="真实织物材质 · Woven Form";
export const category="shaders";
export const guiSchema=[
  {
    "key": "fold",
    "label": "褶皱深度 Fold",
    "min": 0,
    "max": 1.2,
    "step": 0.01,
    "default": 0.48
  },
  {
    "key": "weave",
    "label": "织纹尺度 Weave",
    "min": 0.4,
    "max": 2.4,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "sheen",
    "label": "柔光 Sheen",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.7
  },
  {
    "key": "roughness",
    "label": "粗糙度 Roughness",
    "min": 0.15,
    "max": 1,
    "step": 0.01,
    "default": 0.75
  },
  {
    "key": "color",
    "label": "染色 Color",
    "type": "color",
    "default": "#b6a797"
  },
  {
    "key": "speed",
    "label": "摆动速度 Speed",
    "min": 0,
    "max": 1.5,
    "step": 0.01,
    "default": 0.4
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
 plinth(root,3.2);const variant=p.variant||0,segments=ctx.lowEnd?36:70;
 const geo=new THREE.PlaneGeometry(variant===1?2.35:4.25,3.65,segments,segments);
 const weave=textureFromField((x,y)=>{const a=Math.cos(x*TAU*20),b=Math.cos(y*TAU*20),cross=Math.sin(x*TAU*10)*Math.sin(y*TAU*10);return .9+.035*Math.max(a,b)+.018*cross;},256,true);
 const normal=textureFromField((x,y)=>[.5+.08*Math.sin(x*TAU*20),.5+.08*Math.sin(y*TAU*20),1],256);
 const mat=new THREE.MeshPhysicalMaterial({color:p.color,map:weave,normalMap:normal,normalScale:new THREE.Vector2(.16,.16),roughness:p.roughness,side:THREE.DoubleSide,sheen:p.sheen,sheenColor:new THREE.Color('#c9d8d6'),sheenRoughness:.55});
 const fabric=mesh(root,geo,mat,[0,1.9,0]);
 const frameMat=material('#66747c',.23,.85);
 if(variant===2){box(root,[3.5,.18,1.6],[0,.9,0],frameMat);for(const x of [-1.5,1.5])box(root,[.08,.9,1.4],[x,.4,0],frameMat);}
 else{rod(root,[-2.4,3.9,0],[2.4,3.9,0],.035,frameMat,12);for(const x of [-2.25,2.25])rod(root,[x,0,0],[x,3.9,0],.027,frameMat);}
 const base=geo.attributes.position.array.slice(),pos=geo.attributes.position,uv=geo.attributes.uv;
 return{update(dt,q,c,t){mat.color.set(q.color);mat.roughness=q.roughness;mat.sheen=q.sheen;weave.repeat.set(q.weave*1.8,q.weave*1.6);normal.repeat.copy(weave.repeat);for(let i=0;i<pos.count;i++){const u=uv.getX(i),v=uv.getY(i),x=base[i*3],y=base[i*3+1],loose=Math.pow(1-v,1.4);let z=Math.sin(u*TAU*3.1+.17*Math.sin(v*7))*q.fold*.38;z+=Math.sin(t*q.speed*1.8+u*5)*q.fold*.1*loose;if(variant===1){const twist=(v-.5)*1.1;pos.setXYZ(i,x*Math.cos(twist),y,x*Math.sin(twist)+z);}else if(variant===2){const across=(u-.5)*4.25;pos.setXYZ(i,across,y*.52-1.05,Math.cos(v*Math.PI)*.9+z*(.2+loose));}else pos.setXYZ(i,x,y,z);}pos.needsUpdate=true;geo.computeVertexNormals();}};
}

