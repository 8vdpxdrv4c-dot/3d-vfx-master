// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="particles-spiral-cluster";
export const title="螺旋星系 · 3D Galaxy";
export const category="particles";
export const guiSchema=[
  {
    "key": "density",
    "label": "星点数量 Density",
    "min": 0.25,
    "max": 1.6,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "arms",
    "label": "旋臂数量 Arms",
    "min": 2,
    "max": 8,
    "step": 1,
    "default": 4
  },
  {
    "key": "twist",
    "label": "旋臂卷曲 Twist",
    "min": 0.2,
    "max": 1.8,
    "step": 0.02,
    "default": 0.9
  },
  {
    "key": "thickness",
    "label": "盘面厚度 Thickness",
    "min": 0.03,
    "max": 0.6,
    "step": 0.01,
    "default": 0.18
  },
  {
    "key": "color",
    "label": "外缘色 Color",
    "type": "color",
    "default": "#8daaca"
  },
  {
    "key": "spin",
    "label": "自转速度 Spin",
    "min": 0,
    "max": 0.4,
    "step": 0.01,
    "default": 0.04
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["density","arms"];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dGalaxyScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dGalaxyScene(ctx,p,root){
 const count=Math.floor((ctx.lowEnd?3800:11500)*p.density),g=pointField(count,517),pos=g.attributes.position,seed=g.attributes.aSeed;
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{outer:{value:new THREE.Color(p.color)}},vertexShader:'attribute vec4 aSeed;varying float radius,shine;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);radius=length(position.xz)/3.8;shine=aSeed.w;gl_PointSize=clamp((.7+aSeed.z*1.5)*32./max(1.,-mv.z),1.7,9.);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float radius,shine;uniform vec3 outer;void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;float soft=exp(-r*3.5);vec3 color=mix(vec3(.96,.86,.65),outer,smoothstep(.05,.75,radius));gl_FragColor=vec4(color*(1.2+shine*.8),soft*.9);}'});
 const galaxy=new THREE.Points(g,mat);galaxy.position.y=1.15;galaxy.frustumCulled=false;root.add(galaxy);
 return{update(dt,q,c,t){mat.uniforms.outer.value.set(q.color);const arms=Math.max(2,Math.round(q.arms));for(let i=0;i<count;i++){const a=seed.getX(i),b=seed.getY(i),d=seed.getZ(i),core=seed.getW(i)<.16;const r=core?Math.pow(a,1.8)*.65:Math.pow(a,.62)*3.8;const jitter=(b-.5)*(core?TAU:.42),angle=(i%arms)/arms*TAU+r*q.twist*1.45+jitter;pos.setXYZ(i,Math.cos(angle)*r,(d-.5)*q.thickness*(core?3:Math.exp(-r*.2)),Math.sin(angle)*r);}pos.needsUpdate=true;galaxy.rotation.y=t*q.spin;},stats(){return{particles:count};}};
}

