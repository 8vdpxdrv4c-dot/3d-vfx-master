// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="motion-scroll-scenes";
export const title="滚动驱动三维场景 · Scroll Chapters";
export const category="motion";
export const guiSchema=[
  {
    "key": "progress",
    "label": "叙事进度 Progress",
    "min": 0,
    "max": 1,
    "step": 0.001,
    "default": 0.32
  },
  {
    "key": "follow",
    "label": "镜头跟随 Follow",
    "type": "boolean",
    "default": true
  },
  {
    "key": "spacing",
    "label": "章节间距 Spacing",
    "min": 0.8,
    "max": 2,
    "step": 0.02,
    "default": 1.25
  },
  {
    "key": "reveal",
    "label": "入场幅度 Reveal",
    "min": 0,
    "max": 2,
    "step": 0.02,
    "default": 0.7
  },
  {
    "key": "color",
    "label": "章节色 Color",
    "type": "color",
    "default": "#a9ba93"
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
 const restore=rememberCamera(ctx),chapters=[],metal=material('#526773',.28,.7),accent=material(p.color,.34,.45),dark=material('#1a242b',.6,.25);
 for(let i=0;i<3;i++){const group=new THREE.Group();root.add(group);mesh(group,new THREE.CylinderGeometry(1.3,1.4,.15,ctx.lowEnd?32:56),dark,[0,-.08,0]);if(i===0){mesh(group,new THREE.TorusGeometry(.78,.16,ctx.lowEnd?10:16,ctx.lowEnd?40:64),accent,[0,1,0],[.1,.4,.2]);box(group,[.2,.9,.3],[0,.45,0],metal);}else if(i===1){for(let j=0;j<4;j++){const m=box(group,[1.35,.22,1.35],[0,.3+j*.42,0],accent);m.rotation.y=j*.28;}}else{mesh(group,new THREE.IcosahedronGeometry(.83,ctx.lowEnd?0:1),accent,[0,1.1,0]);for(const x of [-.65,.65])rod(group,[x,0,0],[x,1.1,0],.035,metal);mesh(group,new THREE.TorusGeometry(1.03,.035,8,ctx.lowEnd?40:80),metal,[0,1.1,0],[0,Math.PI/2,0]);}chapters.push(group);}
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-3,0,-1.5),new THREE.Vector3(0,0,0),new THREE.Vector3(3,0,1.5)]);
 let wasFollowing=true;
 return{update(dt,q,c,t){accent.color.set(q.color);const spacing=q.spacing*2.8,variant=p.variant||0;chapters.forEach((g,i)=>{const angle=(i-1)*.7,x=(i-1)*spacing;g.position.set(x,variant===1?i*.65:0,variant===2?(i-1)*1.2:Math.cos(angle)*1.5-1.5);const gate=smooth((q.progress-i*.24+.2)/.45);g.position.y+=(1-gate)*q.reveal*1.6;g.rotation.y=(1-gate)*.4;g.scale.setScalar(.8+.2*gate);});if(q.follow){const x=(q.progress*2-1)*spacing*.75;const at=new THREE.Vector3(x+3.2,3.4+(variant===1?q.progress*2:0),7.7-q.progress*1.6),target=new THREE.Vector3(x*.7,1.1+(variant===1?q.progress*.8:0),0);aimCamera(c,at,target);}else if(wasFollowing&&c.controls){c.controls.enabled=true;c.controls.target.set(0,1,0);c.controls.update();}wasFollowing=q.follow;},dispose(){restore();}};
}

