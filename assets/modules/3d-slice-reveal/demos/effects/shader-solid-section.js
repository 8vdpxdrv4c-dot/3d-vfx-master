// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="shader-solid-section";
export const title="切面显现 · 3D Slice Reveal";
export const category="shaders";
export const guiSchema=[
  {
    "key": "progress",
    "label": "剖切进度 Progress",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.6
  },
  {
    "key": "tilt",
    "label": "剖面倾角 Tilt",
    "min": -0.7,
    "max": 0.7,
    "step": 0.02,
    "default": 0.08
  },
  {
    "key": "animate",
    "label": "自动扫描 Animate",
    "type": "boolean",
    "default": true
  },
  {
    "key": "speed",
    "label": "扫描速度 Speed",
    "min": 0,
    "max": 0.7,
    "step": 0.01,
    "default": 0.18
  },
  {
    "key": "color",
    "label": "模型色 Color",
    "type": "color",
    "default": "#89c5cb"
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dSliceRevealScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dSliceRevealScene(ctx,p,root){
 plinth(root,2.8);const u={cutNormal:{value:new THREE.Vector3(0,1,0)},cutDistance:{value:2},color:{value:new THREE.Color(p.color)}};
 const mat=new THREE.MeshStandardMaterial({color:p.color,roughness:.24,metalness:.55,side:THREE.DoubleSide});
 mat.onBeforeCompile=shader=>{shader.uniforms.cutNormal=u.cutNormal;shader.uniforms.cutDistance=u.cutDistance;shader.vertexShader='varying vec3 sectionWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsectionWorld=(modelMatrix*vec4(transformed,1.)).xyz;');shader.fragmentShader='varying vec3 sectionWorld;uniform vec3 cutNormal;uniform float cutDistance;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(dot(sectionWorld,cutNormal)>cutDistance)discard;');};
 mat.customProgramCacheKey=()=>id;
 const variant=p.variant||0,geo=variant===1?new THREE.SphereGeometry(1.15,ctx.lowEnd?32:64,ctx.lowEnd?24:48):variant===2?new THREE.IcosahedronGeometry(1.3,0):new THREE.TorusKnotGeometry(.85,.29,ctx.lowEnd?100:180,ctx.lowEnd?12:24);mesh(root,geo,mat,[0,1.65,0],[.15,.2,.1]);
 const plane=mesh(root,new THREE.PlaneGeometry(4.8,4.8),new THREE.MeshBasicMaterial({color:'#a3b9c2',transparent:true,opacity:.09,side:THREE.DoubleSide,depthWrite:false}),[0,1.5,0],[-Math.PI/2,0,0]);
 return{update(dt,q,c,t){const progress=clamp(q.progress+(q.animate?Math.sin(t*q.speed*TAU)*.2:0)),n=u.cutNormal.value.set(Math.sin(q.tilt),Math.cos(q.tilt),0);u.cutDistance.value=-.2+progress*4;mat.color.set(q.color);plane.position.copy(n).multiplyScalar(u.cutDistance.value);plane.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);}};
}

