// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="particles-plume-field";
export const title="工业烟雾 · 3D Smoke";
export const category="particles";
export const guiSchema=[
  {
    "key": "density",
    "label": "浓密度 Density",
    "min": 0.2,
    "max": 1.7,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "spread",
    "label": "扩散幅度 Spread",
    "min": 0.25,
    "max": 2.5,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "height",
    "label": "烟柱高度 Height",
    "min": 2,
    "max": 6,
    "step": 0.05,
    "default": 4.5
  },
  {
    "key": "opacity",
    "label": "不透明度 Opacity",
    "min": 0.08,
    "max": 0.9,
    "step": 0.01,
    "default": 0.5
  },
  {
    "key": "color",
    "label": "烟色 Color",
    "type": "color",
    "default": "#b3bac2"
  },
  {
    "key": "speed",
    "label": "升腾速度 Speed",
    "min": 0,
    "max": 1.8,
    "step": 0.02,
    "default": 0.65
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["density"];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dSmokeScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dSmokeScene(ctx,p,root){
 plinth(root,2.15);const nozzle=material('#35434c',.4,.65);mesh(root,new THREE.CylinderGeometry(.24,.37,.38,32),nozzle,[0,.12,0]);
 const count=Math.floor((ctx.lowEnd?190:540)*p.density),geo=instancedCards(count,347),map=softPuff();
 const uniforms={puff:{value:map},time:{value:0},spread:{value:p.spread},height:{value:p.height},opacity:{value:p.opacity},color:{value:new THREE.Color(p.color)},speed:{value:p.speed}};
 const mat=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:'attribute vec4 aSeed;uniform float time,spread,height,speed;varying vec2 cloudUv;varying float life;void main(){life=fract(aSeed.x+time*speed*.12);float bell=sin(life*3.14159);vec3 center=vec3((aSeed.y-.5)*spread*(.2+life*1.8),.3+life*height,(aSeed.z-.5)*spread*(.2+life*1.8));center.x+=sin(life*10.0+aSeed.w*7.0)*spread*life*.22;vec4 view=modelViewMatrix*vec4(center,1.0);float size=(.28+life*.8)*(.65+aSeed.w*.6);view.xy+=position.xy*size;cloudUv=uv;gl_Position=projectionMatrix*view;}',fragmentShader:'uniform sampler2D puff;uniform vec3 color;uniform float opacity;varying vec2 cloudUv;varying float life;void main(){float a=texture2D(puff,cloudUv).a;float fade=smoothstep(0.0,.08,life)*(1.0-life);gl_FragColor=vec4(color*(.65+life*.35),a*fade*opacity*.2);}'});
 const cloud=mesh(root,geo,mat);cloud.frustumCulled=false;
 return{update(dt,q,c,t){uniforms.time.value=t;uniforms.spread.value=q.spread;uniforms.height.value=q.height;uniforms.opacity.value=q.opacity;uniforms.color.value.set(q.color);uniforms.speed.value=q.speed;},stats(){return{instances:count};}};
}

