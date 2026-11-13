// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="lighting-shaft-cones";
export const title="空间光束 · 3D Light Shafts";
export const category="lighting";
export const guiSchema=[
  {
    "key": "angle",
    "label": "光锥角度 Angle",
    "min": 0.12,
    "max": 0.52,
    "step": 0.01,
    "default": 0.25
  },
  {
    "key": "spread",
    "label": "灯位间距 Spread",
    "min": 0.8,
    "max": 3,
    "step": 0.05,
    "default": 1.9
  },
  {
    "key": "opacity",
    "label": "光束强度 Opacity",
    "min": 0.08,
    "max": 0.75,
    "step": 0.01,
    "default": 0.28
  },
  {
    "key": "intensity",
    "label": "灯光强度 Intensity",
    "min": 8,
    "max": 65,
    "step": 1,
    "default": 30
  },
  {
    "key": "color",
    "label": "光束色 Color",
    "type": "color",
    "default": "#b0d4de"
  },
  {
    "key": "speed",
    "label": "摆动速度 Speed",
    "min": 0,
    "max": 0.7,
    "step": 0.01,
    "default": 0.08
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dLightShaftsScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dLightShaftsScene(ctx,p,root){
 plinth(root,3.5);mesh(root,new THREE.IcosahedronGeometry(.9,0),material('#718e9c',.28,.4),[0,1.35,0],[.2,.4,.1]);
 const beamGeo=new THREE.ConeGeometry(1,1,ctx.lowEnd?24:44,1,true),u={color:{value:new THREE.Color(p.color)},opacity:{value:p.opacity}},beamMat=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 N,V;varying float axial;void main(){vec4 p=modelViewMatrix*vec4(position,1.);N=normalMatrix*normal;V=-p.xyz;axial=uv.y;gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 N,V;varying float axial;uniform vec3 color;uniform float opacity;void main(){float side=pow(abs(dot(normalize(N),normalize(V))),.65);float end=smoothstep(0.,.08,axial)*smoothstep(0.,.1,1.-axial);gl_FragColor=vec4(color,side*end*opacity*.42);}'});
 const lamps=[],metal=material('#3b4b55',.28,.75);
 for(let i=0;i<3;i++){const beam=mesh(root,beamGeo,beamMat),light=new THREE.SpotLight(p.color,p.intensity,9,p.angle,.55,2),target=new THREE.Object3D();root.add(light,target);light.target=target;const fixture=mesh(root,new THREE.CylinderGeometry(.15,.2,.13,20),metal),pool=mesh(root,new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:.14,depthWrite:false}),[0,.015,0],[-Math.PI/2,0,0]);lamps.push({beam,light,target,fixture,pool,index:i});}
 return{update(dt,q,c,t){u.color.value.set(q.color);u.opacity.value=q.opacity;for(const lamp of lamps){const i=lamp.index,x=(i-1)*q.spread,origin=new THREE.Vector3(x,4.2,(i-1)*.2),aim=new THREE.Vector3(x*.75+Math.sin(t*q.speed+i)*.15,.02,(i-1)*.5);const delta=aim.clone().sub(origin),length=delta.length(),radius=Math.tan(q.angle)*length;lamp.beam.position.copy(origin).add(aim).multiplyScalar(.5);lamp.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),delta.normalize());lamp.beam.scale.set(radius,length,radius);lamp.light.position.copy(origin);lamp.light.color.set(q.color);lamp.light.intensity=q.intensity;lamp.light.angle=q.angle;lamp.target.position.copy(aim);lamp.fixture.position.copy(origin);lamp.pool.position.set(aim.x,.015,aim.z);lamp.pool.scale.setScalar(radius);lamp.pool.material.color.set(q.color);lamp.pool.material.opacity=Math.min(.3,q.intensity/200);}}};
}

