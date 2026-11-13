// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="particles-rain-volume";
export const title="夜景雨幕 · 3D Rain";
export const category="particles";
export const guiSchema=[
  {
    "key": "density",
    "label": "雨滴数量 Density",
    "min": 0.2,
    "max": 1.6,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "wind",
    "label": "横向风 Wind",
    "min": -1.2,
    "max": 1.2,
    "step": 0.05,
    "default": 0.1
  },
  {
    "key": "length",
    "label": "雨线长度 Length",
    "min": 0.12,
    "max": 0.75,
    "step": 0.01,
    "default": 0.38
  },
  {
    "key": "width",
    "label": "雨线宽度 Width",
    "min": 0.006,
    "max": 0.045,
    "step": 0.001,
    "default": 0.014
  },
  {
    "key": "opacity",
    "label": "可见强度 Opacity",
    "min": 0.15,
    "max": 0.9,
    "step": 0.01,
    "default": 0.55
  },
  {
    "key": "speed",
    "label": "下落速度 Speed",
    "min": 0,
    "max": 1.4,
    "step": 0.02,
    "default": 0.55
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["density"];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dRainScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dRainScene(ctx,p,root){
 plinth(root,2.6);mesh(root,new THREE.IcosahedronGeometry(.9,0),material('#698692',.3,.4),[0,1.55,0],[.2,.4,.1]);
 const count=Math.floor((ctx.lowEnd?500:1450)*p.density),g=instancedCards(count,913),u={time:{value:0},wind:{value:p.wind},length:{value:p.length},width:{value:p.width},opacity:{value:p.opacity},speed:{value:p.speed}};
 const mat=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:'attribute vec4 aSeed;uniform float time,wind,length,width,speed;varying vec2 streakUv;varying float brightness;void main(){float age=fract(aSeed.x+time*speed*.48);vec3 p=vec3((aSeed.y-.5)*8.0+wind*age*2.3,(1.0-age)*6.0,(aSeed.z-.5)*7.0);vec4 view=modelViewMatrix*vec4(p,1.0);view.xy+=vec2(position.x*width+position.y*length*wind*.5,position.y*length);streakUv=uv;brightness=.45+aSeed.w*.55;gl_Position=projectionMatrix*view;}',fragmentShader:'uniform float opacity;varying vec2 streakUv;varying float brightness;void main(){float edge=pow(max(0.,1.-abs(streakUv.x*2.-1.)),1.2);float tail=sin(streakUv.y*3.14159);gl_FragColor=vec4(vec3(.67,.79,.87),edge*tail*opacity*brightness);}'});
 const field=mesh(root,g,mat);field.frustumCulled=false;return{update(dt,q,c,t){u.time.value=t;for(const k of ['wind','length','width','opacity','speed'])u[k].value=q[k];},stats(){return{instances:count};}};
}

