// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="particles-snow-orbit";
export const title="飘雪空间 · 3D Snow";
export const category="particles";
export const guiSchema=[
  {
    "key": "density",
    "label": "雪片数量 Density",
    "min": 0.2,
    "max": 1.6,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "size",
    "label": "雪片尺寸 Size",
    "min": 0.025,
    "max": 0.17,
    "step": 0.005,
    "default": 0.065
  },
  {
    "key": "wind",
    "label": "横向风 Wind",
    "min": 0,
    "max": 2.5,
    "step": 0.05,
    "default": 0.45
  },
  {
    "key": "fall",
    "label": "下落速率 Fall",
    "min": 0.1,
    "max": 1,
    "step": 0.02,
    "default": 0.4
  },
  {
    "key": "opacity",
    "label": "雪片强度 Opacity",
    "min": 0.15,
    "max": 1,
    "step": 0.01,
    "default": 0.75
  },
  {
    "key": "speed",
    "label": "时间速度 Speed",
    "min": 0,
    "max": 1.2,
    "step": 0.02,
    "default": 0.5
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["density"];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dSnowScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dSnowScene(ctx,p,root){
 plinth(root,2.6);mesh(root,new THREE.IcosahedronGeometry(.9,0),material('#6d8e9e',.35,.35),[0,1.55,0],[.2,.4,.1]);
 const count=Math.floor((ctx.lowEnd?550:1550)*p.density),g=pointField(count,723),pos=g.attributes.position,seed=g.attributes.aSeed;
 const u={pointSize:{value:p.size},opacity:{value:p.opacity}};
 const mat=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,vertexShader:pointVertex,fragmentShader:'uniform float opacity;varying vec4 seed;void main(){vec2 p=gl_PointCoord*2.-1.;float d=length(p);if(d>1.)discard;float a=atan(p.y,p.x);float flakes=.7+.3*pow(.5+.5*cos(a*6.),4.);float soft=exp(-d*d*4.5)*flakes;gl_FragColor=vec4(vec3(.79,.87,.93),soft*opacity);}'});
 const snow=new THREE.Points(g,mat);snow.frustumCulled=false;root.add(snow);
 return{update(dt,q,c,t){u.pointSize.value=q.size;u.opacity.value=q.opacity;const clock=t*q.speed;for(let i=0;i<count;i++){const age=(seed.getX(i)+clock*q.fall*.16)%1;pos.setXYZ(i,(seed.getY(i)-.5)*8+Math.sin(clock*.7+seed.getX(i)*10)*q.wind*.7,(1-age)*5.6+.05,(seed.getZ(i)-.5)*7+Math.cos(clock*.4+i)*q.wind*.2);}pos.needsUpdate=true;},stats(){return{particles:count};}};
}

