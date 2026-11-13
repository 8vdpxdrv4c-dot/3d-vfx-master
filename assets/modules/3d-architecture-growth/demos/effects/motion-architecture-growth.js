// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="motion-architecture-growth";
export const title="建筑逐件生长 · Assembly House";
export const category="motion";
export const guiSchema=[
  {
    "key": "progress",
    "label": "建造进度 Progress",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.76
  },
  {
    "key": "lift",
    "label": "入场高度 Lift",
    "min": 0,
    "max": 5,
    "step": 0.05,
    "default": 1.8
  },
  {
    "key": "stagger",
    "label": "层次错峰 Stagger",
    "min": 0.05,
    "max": 0.8,
    "step": 0.01,
    "default": 0.28
  },
  {
    "key": "speed",
    "label": "循环速度 Speed",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.13
  },
  {
    "key": "accent",
    "label": "构件颜色 Accent",
    "type": "color",
    "default": "#c8a475"
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
 const parts=[],accent=material(p.accent,.38,.35),stone=material('#59676c',.75,.1),dark=material('#18282d',.38,.5),glass=new THREE.MeshPhysicalMaterial({color:'#6d929c',roughness:.24,metalness:.25,transparent:true,opacity:.48,side:THREE.DoubleSide});
 const part=(size,pos,mat,stage)=>{const m=box(root,size,pos,mat);parts.push({m,home:m.position.clone(),scale:m.scale.clone(),stage});return m;};
 plinth(root,3.8);
 const variant=p.variant||0;
 if(variant===0){
  part([5.7,.22,4.6],[0,.05,0],stone,0);
  for(const x of [-2.4,-.8,.8,2.4])for(const z of [-1.8,1.8]){part([.16,2.3,.16],[x,1.28,z],accent,.15);part([.38,.14,.38],[x,.23,z],dark,.07);}
  const ribs=ctx.lowEnd?8:12,fins=ctx.lowEnd?7:11;
  for(let i=0;i<ribs;i++)part([.14,.22,4.5],[-2.6+i*5.2/(ribs-1),2.55,0],accent,.48+i*.012);
  for(let i=0;i<fins;i++)part([.045,1.55,.45],[-2.3+i*4.6/(fins-1),1.4,-1.85],dark,.35+i*.012);
  part([5.8,.15,.18],[0,2.42,-1.9],dark,.4);part([5.8,.15,.18],[0,2.42,1.9],dark,.4);
  part([1.4,.12,2.7],[1.4,.25,0],accent,.68);
 }else if(variant===1){
  for(let j=0;j<3;j++){const w=5.5-j*1.2,z=-j*.32,y=.3+j*.88;part([w,.2,4-j*.75],[0,y,z],stone,.03+j*.2);for(const x of [-w*.43,w*.43])for(const dz of [-1,1])part([.14,.77,.14],[x,y+.45,z+dz*(1.5-j*.25)],accent,.12+j*.2);for(let k=0;k<8;k++)part([.05,.5,.05],[-w*.46+k*w*.13,y+.34,z+1.8-j*.35],dark,.2+j*.2);}
  part([3.1,.12,2.4],[0,2.9,-.64],accent,.8);
 }else{
  part([5.6,.22,5.1],[0,.05,0],stone,0);
  for(const x of [-2.3,2.3])for(const z of [-2,2]){part([.23,3,.23],[x,1.65,z],accent,.15);part([.5,.15,.5],[x,.25,z],dark,.05);}
  for(let i=0;i<9;i++){part([5.5,.18,.14],[0,3.23,-2.2+i*.55],accent,.5+i*.025);if(i%2===0)part([.12,.15,5],[-2.2+i*.55,3.38,0],dark,.65+i*.012);}
  part([3,.08,2],[0,3.05,0],glass,.85);
  for(const x of [-1.1,1.1])part([.7,.6,.7],[x,.42,0],dark,.75);
 }
 return{update(dt,q,context,t){accent.color.set(q.accent);const progress=q.speed>0?clamp(q.progress+Math.sin(t*q.speed*1.4)*.16):q.progress;for(const s of parts){const start=s.stage*(1-q.stagger*.4),a=smooth((progress-start)/(q.stagger*.6+.12));s.m.visible=a>.001;s.m.position.copy(s.home);s.m.position.y+=q.lift*(1-a);s.m.scale.set(1,Math.max(.001,a),1);s.m.rotation.y=(1-a)*.08*(s.stage>.4?1:-1);}}};
}

