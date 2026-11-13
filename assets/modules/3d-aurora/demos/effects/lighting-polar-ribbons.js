// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="lighting-polar-ribbons";
export const title="极光幕帘 · 3D Aurora";
export const category="lighting";
export const guiSchema=[
  {
    "key": "height",
    "label": "幕帘高度 Height",
    "min": 1,
    "max": 4.5,
    "step": 0.05,
    "default": 2.7
  },
  {
    "key": "wave",
    "label": "折叠幅度 Wave",
    "min": 0.1,
    "max": 2,
    "step": 0.02,
    "default": 0.8
  },
  {
    "key": "opacity",
    "label": "光幕强度 Opacity",
    "min": 0.1,
    "max": 1,
    "step": 0.01,
    "default": 0.65
  },
  {
    "key": "color",
    "label": "主光色 Color",
    "type": "color",
    "default": "#58c693"
  },
  {
    "key": "highlight",
    "label": "边缘色 Highlight",
    "type": "color",
    "default": "#a68bc9"
  },
  {
    "key": "speed",
    "label": "演化速度 Speed",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.22
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=[];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dAuroraScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dAuroraScene(ctx,p,root){
 const u={time:{value:0},height:{value:p.height},wave:{value:p.wave},opacity:{value:p.opacity},color:{value:new THREE.Color(p.color)},highlight:{value:new THREE.Color(p.highlight)}};
 const mat=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'uniform float time,height,wave;varying vec2 ribbonUv;void main(){ribbonUv=uv;vec3 p=position;p.y=.35+uv.y*height+sin(p.x*.7+time)*.12;p.z+=sin(p.x*.9+time*.6)*wave+sin(p.x*2.1-time*.3)*wave*.18;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}',fragmentShader:'varying vec2 ribbonUv;uniform float time,opacity;uniform vec3 color,highlight;void main(){float v=ribbonUv.y;float folds=.55+.45*sin(ribbonUv.x*73.0+sin(ribbonUv.x*21.0+time));float fade=sin(v*3.14159)*exp(-v*1.8);float edge=smoothstep(0.,.08,ribbonUv.x)*smoothstep(0.,.08,1.-ribbonUv.x);vec3 c=mix(color,highlight,smoothstep(.35,1.,v));gl_FragColor=vec4(c*(.5+folds),fade*edge*opacity*(.35+folds*.55));}'});
 for(let i=0;i<3;i++){const geo=new THREE.PlaneGeometry(8,1,ctx.lowEnd?64:140,1),m=mesh(root,geo,mat,[0,0,(i-1)*.75]);m.rotation.y=(i-1)*.11+(p.variant||0)*.08;}
 return{update(dt,q,c,t){u.time.value=t*q.speed;u.height.value=q.height;u.wave.value=q.wave;u.opacity.value=q.opacity;u.color.value.set(q.color);u.highlight.value.set(q.highlight);}};
}

