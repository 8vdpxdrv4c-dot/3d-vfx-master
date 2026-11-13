// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="shader-holo-vessel";
export const title="全息投影 · 3D Hologram";
export const category="shaders";
export const guiSchema=[
  {
    "key": "opacity",
    "label": "投影透明度 Opacity",
    "min": 0.1,
    "max": 0.9,
    "step": 0.01,
    "default": 0.45
  },
  {
    "key": "lines",
    "label": "扫描线密度 Lines",
    "min": 8,
    "max": 100,
    "step": 1,
    "default": 42
  },
  {
    "key": "glow",
    "label": "边缘亮度 Glow",
    "min": 0.3,
    "max": 3,
    "step": 0.05,
    "default": 1.3
  },
  {
    "key": "scale",
    "label": "模型尺度 Scale",
    "min": 0.6,
    "max": 1.4,
    "step": 0.02,
    "default": 1
  },
  {
    "key": "color",
    "label": "投影色 Color",
    "type": "color",
    "default": "#6fcbd4"
  },
  {
    "key": "speed",
    "label": "演化速度 Speed",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.3
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dHologramScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dHologramScene(ctx,p,root){
 plinth(root,2.6);const variant=p.variant||0,geo=variant===1?new THREE.IcosahedronGeometry(1.25,0):variant===2?new THREE.SphereGeometry(1.15,ctx.lowEnd?32:64,ctx.lowEnd?24:48):new THREE.TorusKnotGeometry(.84,.28,ctx.lowEnd?100:180,ctx.lowEnd?12:22);
 const u={time:{value:0},lines:{value:p.lines},glow:{value:p.glow},opacity:{value:p.opacity},color:{value:new THREE.Color(p.color)}};
 const mat=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:'varying vec3 localP,N,V;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);localP=position;N=normalize(normalMatrix*normal);V=-mv.xyz;gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec3 localP,N,V;uniform float time,lines,glow,opacity;uniform vec3 color;void main(){float rim=pow(1.0-abs(dot(normalize(N),normalize(V))),2.2);float line=smoothstep(.15,.85,sin(localP.y*lines-time*3.0));float stripe=.16+.18*line;float a=opacity*(stripe+rim*.72);gl_FragColor=vec4(color*(.35+rim*glow+line*.15),a);}'});
 const model=mesh(root,geo,mat,[0,1.7,0]);return{update(dt,q,c,t){u.time.value=t*q.speed;u.lines.value=q.lines;u.glow.value=q.glow;u.opacity.value=q.opacity;u.color.value.set(q.color);model.scale.setScalar(q.scale);model.rotation.set(.2,t*q.speed*.35,.12);}};
}

