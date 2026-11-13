// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="shader-wood-material";
export const title="程序化木纹材质 · Grain Atelier";
export const category="shaders";
export const guiSchema=[
  {
    "key": "grain",
    "label": "纹理频率 Grain",
    "min": 3,
    "max": 18,
    "step": 0.2,
    "default": 9
  },
  {
    "key": "knot",
    "label": "节疤扰动 Knot",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.5
  },
  {
    "key": "roughness",
    "label": "粗糙度 Roughness",
    "min": 0.15,
    "max": 1,
    "step": 0.01,
    "default": 0.46
  },
  {
    "key": "finish",
    "label": "涂层 Finish",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.45
  },
  {
    "key": "color",
    "label": "木材底色 Color",
    "type": "color",
    "default": "#bd8d57"
  },
  {
    "key": "spin",
    "label": "旋转速度 Spin",
    "min": 0,
    "max": 0.6,
    "step": 0.01,
    "default": 0.09
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
 plinth(root,2.65);const group=new THREE.Group();root.add(group);
 const map=canvasTexture((c,n)=>{c.fillStyle='#d3b08a';c.fillRect(0,0,n,n);},384);
 const bump=canvasTexture((c,n)=>{c.fillStyle='#888';c.fillRect(0,0,n,n);},384,false);
 const ends=canvasTexture((c,n)=>{c.fillStyle='#bca07c';c.fillRect(0,0,n,n);},384);
 const mat=new THREE.MeshPhysicalMaterial({color:p.color,map,bumpMap:bump,bumpScale:.045,roughness:p.roughness,metalness:0,clearcoat:p.finish,clearcoatRoughness:.25}),endMat=mat.clone();endMat.map=ends;
 const variant=p.variant||0;
 if(variant===0){
  const profile=[[.7,0],[.94,.12],[1.05,.55],[.97,1.04],[.66,1.55],[.6,1.8],[.72,1.96],[.74,2.04],[.62,2.07],[.56,1.88],[.52,1.5],[.83,.95],[.87,.5],[.7,.18]].map(a=>new THREE.Vector2(...a));
  mesh(group,new THREE.LatheGeometry(profile,ctx.lowEnd?60:112),mat,[0,.15,0]);mesh(group,new THREE.CylinderGeometry(.7,.7,.08,64),endMat,[0,.12,0]);
 }else if(variant===1){
  for(let i=0;i<3;i++){const m=mesh(group,new THREE.BoxGeometry(1.1,1.35,1.05),[mat,mat,endMat,endMat,mat,mat],[(i-1)*1.15,.8,Math.sin(i*2)*.35]);m.rotation.y=(i-1)*.18;}
  mesh(group,new THREE.CylinderGeometry(.66,.66,.32,72),endMat,[.2,1.72,0],[0,0,.12]);
 }else{
  const shape=new THREE.Shape();const a0=-.12,a1=Math.PI*1.22,r1=1.8,r2=1.25;shape.moveTo(Math.cos(a0)*r1,Math.sin(a0)*r1);shape.absarc(0,0,r1,a0,a1,false);shape.lineTo(Math.cos(a1)*r2,Math.sin(a1)*r2);shape.absarc(0,0,r2,a1,a0,true);shape.closePath();
  mesh(group,new THREE.ExtrudeGeometry(shape,{depth:.55,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,steps:1,curveSegments:56}),mat,[0,1.5,-.27],[0,.3,-.15]);box(group,[2.7,.18,.95],[0,.14,0],endMat);
 }
 let last='';
 const paint=q=>{const sig=q.grain+':'+q.knot;if(sig===last)return;last=sig;const canv=map.image,n=canv.width,c=canv.getContext('2d'),data=c.createImageData(n,n),bd=bump.image.getContext('2d').createImageData(n,n),ed=ends.image.getContext('2d').createImageData(n,n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n,v=y/n,dx=u-.42,dy=(v-.55)*1.8;const warp=.04*Math.sin(v*13)+q.knot*.09*Math.atan2(dy,dx)*Math.exp(-Math.abs(dx)*5);const grain=Math.sin((u+warp)*q.grain*TAU+.12*Math.sin(v*51)),fine=Math.sin((u+warp)*q.grain*TAU*6)*.035;const dark=.66+.22*grain+fine;const radial=Math.sin((Math.hypot(dx,dy)+.02*Math.sin(u*14))*q.grain*TAU);const k=(y*n+x)*4;for(let z=0;z<3;z++){data.data[k+z]=clamp(dark+(2-z)*.065)*255;bd.data[k+z]=clamp(.55+grain*.22+fine)*255;ed.data[k+z]=clamp(.7+radial*.18+(2-z)*.04)*255;}data.data[k+3]=bd.data[k+3]=ed.data[k+3]=255;}
  c.putImageData(data,0,0);bump.image.getContext('2d').putImageData(bd,0,0);ends.image.getContext('2d').putImageData(ed,0,0);map.needsUpdate=bump.needsUpdate=ends.needsUpdate=true;};
 return{update(dt,q,c,t){paint(q);for(const m of [mat,endMat]){m.color.set(q.color);m.roughness=q.roughness;m.clearcoat=q.finish;}group.rotation.y=t*q.spin;}};
}

