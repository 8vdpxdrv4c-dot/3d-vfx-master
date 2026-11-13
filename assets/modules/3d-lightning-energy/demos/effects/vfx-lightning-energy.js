// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="vfx-lightning-energy";
export const title="闪电能量组合特效 · Arc Chamber";
export const category="vfx";
export const guiSchema=[
  {
    "key": "energy",
    "label": "发光强度 Energy",
    "min": 0.2,
    "max": 3,
    "step": 0.05,
    "default": 1.35
  },
  {
    "key": "branches",
    "label": "支路数量 Branches",
    "min": 2,
    "max": 16,
    "step": 1,
    "default": 8
  },
  {
    "key": "reach",
    "label": "弧线张幅 Reach",
    "min": 0.3,
    "max": 2,
    "step": 0.02,
    "default": 1
  },
  {
    "key": "width",
    "label": "弧线宽度 Width",
    "min": 0.015,
    "max": 0.12,
    "step": 0.002,
    "default": 0.045
  },
  {
    "key": "color",
    "label": "电弧色 Color",
    "type": "color",
    "default": "#84c5ff"
  },
  {
    "key": "speed",
    "label": "演化速度 Speed",
    "min": 0,
    "max": 1.5,
    "step": 0.02,
    "default": 0.65
  }
];
let owner=null,root=null,state=null,elapsed=0,signature='';
const topology=["branches"];
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
 plinth(root,3.6);const rand=rng(312),metal=material('#465664',.22,.85),ceramic=material('#b2b7b1',.5,.1);
 const variant=p.variant||0,count=Math.max(2,Math.floor(p.branches*(ctx.lowEnd?.6:1))),paths=[];
 const endpoints=[];
 if(variant===0){for(const x of [-2.1,2.1]){mesh(root,new THREE.CylinderGeometry(.36,.48,.3,40),metal,[x,.16,0]);for(let j=0;j<5;j++)mesh(root,new THREE.CylinderGeometry(.23,.23,.11,32),j%2?metal:ceramic,[x,.4+j*.17,0]);mesh(root,new THREE.SphereGeometry(.26,24,16),metal,[x,1.25,0]);}for(let i=0;i<count;i++)endpoints.push([[-2.1,1.25,0],[2.1,1.25,0]]);}
 else if(variant===1){mesh(root,new THREE.TorusGeometry(1.75,.11,16,88),metal,[0,1.95,0]);mesh(root,new THREE.SphereGeometry(.24,32,16),new THREE.MeshBasicMaterial({color:'#bfe8ed'}),[0,1.95,0]);box(root,[.2,1.95,.3],[0,.9,0],metal);for(let i=0;i<count;i++){const a=i/count*TAU;endpoints.push([[0,1.95,0],[Math.cos(a)*1.75,1.95+Math.sin(a)*1.75,0]]);}}
 else{box(root,[4.8,.15,2],[0,.08,0],metal);for(let i=0;i<count;i++){const a=-1.1+i/(count-1)*2.2,z=Math.sin(i)*.65,end=[1.5,1.65+a,z];mesh(root,new THREE.SphereGeometry(.12,16,12),metal,end);endpoints.push([[-1.8,1.3,0],end]);}rod(root,[-1.8,0,0],[-1.8,1.3,0],.12,ceramic,16);}
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{color:{value:new THREE.Color(p.color)},energy:{value:p.energy}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;uniform vec3 color;uniform float energy;void main(){float d=abs(vUv.x*2.0-1.0);float core=pow(max(0.0,1.0-d),12.0);float halo=pow(max(0.0,1.0-d),2.0);float edge=smoothstep(0.0,.06,vUv.y)*smoothstep(0.0,.06,1.0-vUv.y);gl_FragColor=vec4((color*halo+vec3(core))*energy,edge*halo*.75);}'});
 for(let i=0;i<count;i++){const steps=ctx.lowEnd?20:32,geo=new THREE.BufferGeometry(),pos=new Float32Array((steps+1)*6),uv=[],idx=[];for(let j=0;j<=steps;j++){uv.push(0,j/steps,1,j/steps);if(j<steps){const a=j*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);const m=mesh(root,geo,mat);m.frustumCulled=false;paths.push({geo,steps,phase:rand()*TAU,start:new THREE.Vector3(...endpoints[i][0]),end:new THREE.Vector3(...endpoints[i][1])});}
 const lamp=new THREE.PointLight(p.color,12,8,2);lamp.position.set(0,1.5,.5);root.add(lamp);
 const point=(path,u,t,reach)=>{const s=Math.sin(u*Math.PI),f=path.phase;const v=path.start.clone().lerp(path.end,u);v.y+=s*reach*(.2*Math.sin(u*17+f+t*.6)+.12*Math.sin(u*39-f+t));v.z+=s*reach*(.22*Math.cos(u*23+f-t*.4)+.1*Math.sin(u*49+f));return v;};
 return{update(dt,q,c,t){mat.uniforms.color.value.set(q.color);mat.uniforms.energy.value=q.energy*(.87+.13*Math.sin(t*q.speed*2));lamp.color.set(q.color);lamp.intensity=q.energy*9;for(const path of paths){const pos=path.geo.attributes.position;for(let j=0;j<=path.steps;j++){const u=j/path.steps,at=point(path,u,t*q.speed,q.reach),next=point(path,Math.min(1,u+.008),t*q.speed,q.reach);const tangent=next.sub(at);if(tangent.lengthSq()<1e-8)tangent.copy(path.end).sub(path.start);const toward=c.camera.position.clone().sub(at),side=new THREE.Vector3().crossVectors(tangent,toward).normalize().multiplyScalar(q.width*(.8+.2*Math.sin(u*TAU)));pos.setXYZ(j*2,at.x-side.x,at.y-side.y,at.z-side.z);pos.setXYZ(j*2+1,at.x+side.x,at.y+side.y,at.z+side.z);}pos.needsUpdate=true;}}};
}

