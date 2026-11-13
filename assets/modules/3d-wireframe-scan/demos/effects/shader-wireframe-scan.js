// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="shader-wireframe-scan";
export const title="线框扫描显现 · Survey Reveal";
export const category="shaders";
export const guiSchema=[
  {
    "key": "progress",
    "label": "扫描进度 Progress",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.58
  },
  {
    "key": "band",
    "label": "扫描带宽 Band",
    "min": 0.03,
    "max": 0.7,
    "step": 0.01,
    "default": 0.28
  },
  {
    "key": "glow",
    "label": "线框强度 Glow",
    "min": 0.2,
    "max": 3,
    "step": 0.05,
    "default": 1.35
  },
  {
    "key": "color",
    "label": "扫描色 Color",
    "type": "color",
    "default": "#75d8b0"
  },
  {
    "key": "speed",
    "label": "扫描速度 Speed",
    "min": 0,
    "max": 0.4,
    "step": 0.005,
    "default": 0.045
  },
  {
    "key": "spin",
    "label": "模型旋转 Spin",
    "min": 0,
    "max": 0.5,
    "step": 0.01,
    "default": 0.08
  }
];
let owner=null,root=null,state=null,elapsed=0,signature='';
const topology=[];
const key=p=>JSON.stringify(topology.map(k=>p[k]));
export function create(ctx,p={}){
 dispose();for(const s of guiSchema)if(p[s.key]===undefined)p[s.key]=s.default;
 owner=ctx;signature=key(p);elapsed=0;root=new THREE.Group();root.name=id;root.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(root);
 try{state=build(ctx,p,root);state.update?.(0,p,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,p,ctx=owner){if(!root)return;if(key(p)!==signature)create(ctx,p);elapsed+=Math.min(.05,Math.max(0,dt));state.update?.(Math.min(.05,Math.max(0,dt)),p,ctx,elapsed);}
export function render(ctx=owner){return root?(state.render?.(ctx)??false):false;}
export function stats(){return state?.stats?.()??{};}
export function dispose(){if(!root)return;try{state?.dispose?.();}finally{disposeTree(root);root=null;state=null;owner=null;elapsed=0;}}
function build(ctx,p,root){
 plinth(root,2.8);const body=new THREE.Group();root.add(body);
 const uniforms={scanProgress:{value:p.progress},scanBand:{value:p.band},scanGlow:{value:p.glow},scanColor:{value:new THREE.Color(p.color)},scanMode:{value:p.variant||0}};
 const declarations='varying vec3 scanWorld;uniform float scanProgress;uniform float scanBand;uniform float scanGlow;uniform vec3 scanColor;uniform float scanMode;float scanMetric(vec3 a){if(scanMode<.5)return length(a-vec3(0.,1.5,0.))/2.7;if(scanMode<1.5)return a.y/3.5;return (a.x+a.y*.75+a.z*.3+2.8)/6.0;}';
 const solid=material('#83949a',.3,.6);
 solid.onBeforeCompile=shader=>{Object.assign(shader.uniforms,uniforms);shader.vertexShader='varying vec3 scanWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nscanWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');shader.fragmentShader=declarations+'\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat metric=scanMetric(scanWorld);if(metric>scanProgress)discard;');shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=scanColor*exp(-abs(scanMetric(scanWorld)-scanProgress)/max(.004,scanBand*.2))*scanGlow*.6;');};
 solid.customProgramCacheKey=()=>id;
 const wire=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 scanWorld;void main(){scanWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(scanWorld,1.);}',fragmentShader:declarations+'void main(){float m=scanMetric(scanWorld);float front=exp(-abs(m-scanProgress)/max(.01,scanBand));float ahead=smoothstep(scanProgress-.1,scanProgress+.1,m);float alpha=(front*.85+ahead*.11)*scanGlow;gl_FragColor=vec4(scanColor,alpha);}'});
 function add(geo,pos,rot=[0,0,0]){const m=mesh(body,geo,solid,pos,rot);const cage=new THREE.LineSegments(new THREE.WireframeGeometry(geo),wire);cage.position.copy(m.position);cage.rotation.copy(m.rotation);body.add(cage);}
 add(new THREE.TorusGeometry(1.12,.17,ctx.lowEnd?10:14,ctx.lowEnd?40:64),[0,1.6,0],[.2,0,.25]);add(new THREE.TorusGeometry(.75,.12,ctx.lowEnd?8:12,ctx.lowEnd?36:56),[0,1.6,0],[Math.PI/2,0,.1]);add(new THREE.IcosahedronGeometry(.45,ctx.lowEnd?0:1),[0,1.6,0],[.2,.3,.4]);add(new THREE.BoxGeometry(.35,1.3,.42),[0,.66,0]);add(new THREE.CylinderGeometry(.9,1.1,.22,ctx.lowEnd?24:32),[0,.12,0]);
 return{update(dt,q,c,t){uniforms.scanProgress.value=clamp(q.progress+Math.sin(t*q.speed*TAU)*.16);uniforms.scanBand.value=q.band;uniforms.scanGlow.value=q.glow;uniforms.scanColor.value.set(q.color);body.rotation.y=t*q.spin;}};
}

