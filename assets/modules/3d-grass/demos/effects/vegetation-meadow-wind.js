// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="vegetation-meadow-wind";
export const title="风动草地 · 3D Grass";
export const category="vegetation";
export const guiSchema=[
  {
    "key": "density",
    "label": "草叶数量 Density",
    "min": 0.25,
    "max": 1.5,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "height",
    "label": "草叶高度 Height",
    "min": 0.3,
    "max": 1.4,
    "step": 0.02,
    "default": 0.75
  },
  {
    "key": "wind",
    "label": "风动幅度 Wind",
    "min": 0,
    "max": 1.3,
    "step": 0.02,
    "default": 0.4
  },
  {
    "key": "spread",
    "label": "草场宽度 Spread",
    "min": 3,
    "max": 6,
    "step": 0.1,
    "default": 5.3
  },
  {
    "key": "color",
    "label": "草尖色 Color",
    "type": "color",
    "default": "#a4c363"
  },
  {
    "key": "speed",
    "label": "风速 Speed",
    "min": 0,
    "max": 1.2,
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
 try{instance=assemble3dGrassScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dGrassScene(ctx,p,root){
 plinth(root,4.05);mesh(root,new THREE.CylinderGeometry(3.75,3.75,.06,ctx.lowEnd?40:72),material('#344d39',.96,0),[0,.01,0]);
 const count=Math.floor((ctx.lowEnd?2200:6800)*p.density),g=new THREE.InstancedBufferGeometry(),positions=[],uv=[],indices=[];
 for(let j=0;j<=5;j++){const v=j/5;for(const side of [-1,1]){positions.push(side*(1-v)*.032,v,0);uv.push((side+1)/2,v);}if(j<5){const a=j*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
 g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);const random=rng(141),seed=new Float32Array(count*4);for(let i=0;i<seed.length;i++)seed[i]=random();g.setAttribute('aSeed',new THREE.InstancedBufferAttribute(seed,4));g.instanceCount=count;
 const u={time:{value:0},height:{value:p.height},wind:{value:p.wind},spread:{value:p.spread},color:{value:new THREE.Color(p.color)}};
 const mat=new THREE.ShaderMaterial({uniforms:u,side:THREE.DoubleSide,vertexShader:'attribute vec4 aSeed;uniform float time,height,wind,spread;varying float tip,shade;void main(){tip=uv.y;float a=aSeed.w*6.283185;vec2 root=(aSeed.xy-.5)*spread;float h=height*(.55+aSeed.z*.7);vec3 p=vec3(root.x+position.x*cos(a),.04+tip*h,root.y+position.x*sin(a));float bend=tip*tip*wind*(.35+.3*sin(root.x*1.8+root.y*.6-time*2.2));p.x+=bend;p.z+=tip*tip*sin(a)*.1;shade=.65+aSeed.z*.35;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'uniform vec3 color;varying float tip,shade;void main(){vec3 c=mix(vec3(.045,.11,.065),color,smoothstep(0.,1.,tip));gl_FragColor=vec4(c*shade,1.);}'});
 const field=mesh(root,g,mat);field.frustumCulled=false;return{update(dt,q,c,t){u.time.value=t*q.speed;u.height.value=q.height;u.wind.value=q.wind;u.spread.value=q.spread;u.color.value.set(q.color);},stats(){return{instances:count};}};
}

