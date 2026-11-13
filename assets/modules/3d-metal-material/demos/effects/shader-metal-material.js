// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="shader-metal-material";
export const title="PBR 金属材质 · Machined Light";
export const category="shaders";
export const guiSchema=[
  {
    "key": "roughness",
    "label": "表面粗糙度 Roughness",
    "min": 0.07,
    "max": 0.9,
    "step": 0.01,
    "default": 0.24
  },
  {
    "key": "brush",
    "label": "拉丝强度 Brush",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.55
  },
  {
    "key": "patina",
    "label": "氧化覆盖 Patina",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.12
  },
  {
    "key": "color",
    "label": "金属色 Tint",
    "type": "color",
    "default": "#c8ab75"
  },
  {
    "key": "spin",
    "label": "转台速度 Spin",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.12
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
 plinth(root,2.9);const form=new THREE.Group();root.add(form);
 const surfaceCanvas=document.createElement('canvas');surfaceCanvas.width=surfaceCanvas.height=384;const painter=surfaceCanvas.getContext('2d');
 const map=new THREE.CanvasTexture(surfaceCanvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;
 const rough=textureFromField((x,y)=>.62+.3*Math.sin(y*TAU*180+x*3)**2,256);
 const normal=textureFromField((x,y)=>[.5,.5+.1*Math.sin(y*TAU*180+x*3),1],256);
 const mat=new THREE.MeshPhysicalMaterial({color:p.color,map,roughnessMap:rough,normalMap:normal,normalScale:new THREE.Vector2(.1,.1),metalness:1,roughness:p.roughness,clearcoat:.25});
 const dark=material('#1a2329',.28,.8);
 const variant=p.variant||0;
 if(variant===0){
  const profile=[[.75,0],[1.24,0],[1.42,.13],[1.43,.28],[1.15,.35],[1.15,.52],[1.4,.58],[1.4,.73],[.8,.83],[.75,.7],[.75,0]].map(x=>new THREE.Vector2(...x));
  const ring=mesh(form,new THREE.LatheGeometry(profile,ctx.lowEnd?64:128),mat,[0,1.18,0],[.42,0,.13]);mesh(form,new THREE.CylinderGeometry(.65,.65,1.5,56),dark,[0,.72,0]);mesh(form,new THREE.TorusGeometry(1.38,.04,12,100),mat,[0,1.38,0],[Math.PI/2+.42,0,.13]);
 }else if(variant===1){for(let j=0;j<5;j++){mesh(form,new THREE.CylinderGeometry(1.15-j*.09,1.19-j*.09,.25,80),mat,[0,.28+j*.4,0]);mesh(form,new THREE.CylinderGeometry(.55,.55,.17,48),dark,[0,.49+j*.4,0]);}}
 else{const outer=mesh(form,new THREE.TorusGeometry(1.28,.36,32,112),mat,[0,1.6,0],[.15,.25,.18]);for(let i=0;i<4;i++){const a=i*TAU/4;rod(form,[Math.cos(a)*1.28,1.6+Math.sin(a)*1.28,0],[Math.cos(a)*1.28,1.6+Math.sin(a)*1.28,.48],.065,dark,12);}box(form,[.5,1.5,.6],[0,.72,0],dark);}
 let last='';
 function repaint(q){const sig=q.brush+':'+q.patina;if(sig===last)return;last=sig;const n=surfaceCanvas.width,data=painter.createImageData(n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n,v=y/n,line=Math.sin(v*TAU*176+Math.sin(u*19))*.035*q.brush;const oxide=smooth((Math.sin(u*19+Math.sin(v*11))*Math.cos(v*13)+.25)*q.patina);const k=(y*n+x)*4;data.data[k]=(1-oxide*.6+line)*255;data.data[k+1]=(1-oxide*.2+line)*255;data.data[k+2]=(1-oxide*.35+line)*255;data.data[k+3]=255;}painter.putImageData(data,0,0);map.needsUpdate=true;}
 return{update(dt,q,c,t){repaint(q);mat.color.set(q.color);mat.roughness=q.roughness;mat.normalScale.setScalar(q.brush*.38);form.rotation.y=t*q.spin;form.rotation.z=Math.sin(t*.2)*.025;}};
}

