// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="motion-virtual-tour";
export const title="三维空间导览 · Quiet Museum";
export const category="motion";
export const guiSchema=[
  {
    "key": "progress",
    "label": "路线位置 Progress",
    "min": 0,
    "max": 1,
    "step": 0.001,
    "default": 0
  },
  {
    "key": "mode",
    "label": "相机模式 Mode",
    "options": [
      "tour",
      "orbit"
    ],
    "default": "tour"
  },
  {
    "key": "speed",
    "label": "巡游速度 Speed",
    "min": 0,
    "max": 0.2,
    "step": 0.001,
    "default": 0.018
  },
  {
    "key": "height",
    "label": "视点高度 Height",
    "min": 0.7,
    "max": 2.7,
    "step": 0.01,
    "default": 1.55
  },
  {
    "key": "accent",
    "label": "展品颜色 Accent",
    "type": "color",
    "default": "#bca16d"
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
 const restore=rememberCamera(ctx),floor=material('#394750',.65,.18),wall=material('#708187',.8,.05),metal=material('#323c44',.35,.7),art=material(p.accent,.28,.65);
 box(root,[9,.22,10],[0,-.15,0],floor);
 for(const x of [-4,4])for(const z of [-4,-1.4,1.4,4])box(root,[.14,3.7,.14],[x,1.8,z],wall);
 for(const x of [-4,4])box(root,[.2,.15,9],[x,3.7,0],metal);
 const ribs=ctx.lowEnd?7:11;for(let i=0;i<ribs;i++)box(root,[8,.11,.18],[0,3.8,-4.4+i*8.8/(ribs-1)],wall);
 for(const x of [-3.8,3.8])for(const z of [-3,3])box(root,[.1,1.2,1.2],[x,.62,z],wall);
 const exhibit=new THREE.Group();root.add(exhibit);
 mesh(exhibit,new THREE.TorusGeometry(.98,.18,ctx.lowEnd?12:20,ctx.lowEnd?40:72),art,[0,1.6,0],[0,.3,.3]);box(exhibit,[1.5,.45,1.5],[0,.15,0],metal);
 for(const [x,z]of [[-1.8,-2.3],[1.8,2.3]]){box(root,[.9,.6,.9],[x,.2,z],metal);mesh(root,new THREE.IcosahedronGeometry(.55,1),art,[x,1.1,z],[.3,.5,0]);}
 const strip=new THREE.MeshBasicMaterial({color:'#a7bfc8'});for(const x of [-3.6,3.6])box(root,[.025,.015,7.6],[x,.01,0],strip);
 const routes=[
 [[0,8.6],[3.15,4.1],[3.15,.3],[3.15,-3.8],[0,-4.4],[-3.15,-3],[-3.15,1.2],[-3.15,4.1]],
 [[-3.15,4.2],[-3.15,1],[-3.15,-3.8],[0,-4.25],[3.15,-3],[3.15,.8],[3.15,4.2],[0,6.5]],
 [[7.5,7.5],[7.5,-5],[0,-7.5],[-7.5,-4],[-7.5,5],[0,8]]
 ];
 const elevated=p.route===2,curve=new THREE.CatmullRomCurve3(routes[p.route||0].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'catmullrom',.15);
 let previousMode=null;
 return{update(dt,q,c,t){art.color.set(q.accent);if(q.mode==='tour'){if(dt>0)q.progress=(q.progress+dt*q.speed)%1;const at=curve.getPointAt(q.progress),ahead=curve.getPointAt((q.progress+.04)%1);at.y=q.height+(elevated?3.5:0);ahead.x*=.12;ahead.z*=.12;ahead.y=elevated?1.1:q.height*.78;aimCamera(c,at,ahead);}else if(previousMode==='tour'&&c.controls){c.controls.enabled=true;c.controls.target.set(0,1.3,0);c.controls.update();}previousMode=q.mode;},dispose(){restore();}};
}

