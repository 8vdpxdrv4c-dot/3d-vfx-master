// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="vfx-plasma-stream";
export const title="等离子尾流 · 3D Plasma";
export const category="vfx";
export const guiSchema=[
  {
    "key": "width",
    "label": "尾流半径 Width",
    "min": 0.35,
    "max": 1.6,
    "step": 0.02,
    "default": 0.85
  },
  {
    "key": "glow",
    "label": "发光强度 Glow",
    "min": 0.25,
    "max": 2.8,
    "step": 0.05,
    "default": 1.4
  },
  {
    "key": "opacity",
    "label": "壳层透明度 Opacity",
    "min": 0.1,
    "max": 0.9,
    "step": 0.01,
    "default": 0.55
  },
  {
    "key": "flow",
    "label": "流速 Flow",
    "min": 0.2,
    "max": 2,
    "step": 0.02,
    "default": 1
  },
  {
    "key": "color",
    "label": "尾流色 Color",
    "type": "color",
    "default": "#6da9e2"
  },
  {
    "key": "speed",
    "label": "时间速度 Speed",
    "min": 0,
    "max": 1.4,
    "step": 0.02,
    "default": 0.65
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dPlasmaScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dPlasmaScene(ctx,p,root){
 const u={time:{value:0},width:{value:p.width},flow:{value:p.flow},glow:{value:p.glow},opacity:{value:p.opacity},color:{value:new THREE.Color(p.color)}};
 const mat=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'uniform float time,width;varying vec2 shellUv;void main(){shellUv=uv;float angle=uv.y*6.283185;float radius=(.75*(1.-uv.x)+.07)*width;radius*=1.+.045*sin(uv.x*29.-time*3.+angle*5.);vec3 p=vec3(-2.2+uv.x*4.6,1.5+cos(angle)*radius,sin(angle)*radius);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'varying vec2 shellUv;uniform float time,flow,glow,opacity;uniform vec3 color;void main(){float u=shellUv.x,a=shellUv.y*6.283185;float strand=pow(.5+.5*sin(a*9.-u*24.+time*flow*7.),10.);float wave=.4+.6*pow(.5+.5*cos(a*3.+u*13.-time*flow*2.),3.);float rim=pow(1.-u,1.5);vec3 c=color*(strand*glow+wave*.18)+vec3(.5,.7,.85)*strand*rim;gl_FragColor=vec4(c,opacity*(.07+strand*.65+wave*.12)*pow(1.-u,.6));}'});
 for(let i=0;i<2;i++){const geo=new THREE.PlaneGeometry(1,1,ctx.lowEnd?34:74,ctx.lowEnd?24:44),m=mesh(root,geo,mat);m.scale.set(1,1+i*.09,1+i*.09);}
 const emitter=mesh(root,new THREE.SphereGeometry(.36,32,24),material('#5c6d78',.2,.8),[-2.2,1.5,0]);rod(root,[-2.2,0,0],[-2.2,1.15,0],.08,material('#26333d',.35,.6));plinth(root,3.1);
 return{update(dt,q,c,t){u.time.value=t*q.speed;u.width.value=q.width;u.flow.value=q.flow;u.glow.value=q.glow;u.opacity.value=q.opacity;u.color.value.set(q.color);}};
}

