// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="post-cinema-stack";
export const title="电影后期效果组合 · Cinema Stack";
export const category="postprocessing";
export const guiSchema=[
  {
    "key": "quality",
    "label": "质量 Quality",
    "options": [
      "low",
      "mid",
      "high",
      "cinematic"
    ],
    "default": "high"
  },
  {
    "key": "glow",
    "label": "辉光 Glow",
    "min": 0,
    "max": 2,
    "step": 0.02,
    "default": 0.65
  },
  {
    "key": "exposure",
    "label": "曝光 Exposure",
    "min": 0.4,
    "max": 1.8,
    "step": 0.02,
    "default": 1
  },
  {
    "key": "chromatic",
    "label": "色差 Chromatic",
    "min": 0,
    "max": 0.014,
    "step": 0.0005,
    "default": 0.0025
  },
  {
    "key": "vignette",
    "label": "暗角 Vignette",
    "min": 0,
    "max": 1,
    "step": 0.01,
    "default": 0.35
  },
  {
    "key": "grain",
    "label": "颗粒 Grain",
    "min": 0,
    "max": 0.09,
    "step": 0.002,
    "default": 0.018
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
 const sculpture=studioSculpture(root,p.color||'#d3a677');
 const glow=new THREE.MeshBasicMaterial({color:new THREE.Color(p.color||'#d3a677').multiplyScalar(2.2)});for(let i=0;i<5;i++)box(root,[.035,2.4,.035],[(i-2)*.65,1.35,-1.1],glow);
 const pipelineScene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),geo=new THREE.PlaneGeometry(2,2);
 const vertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const weights=new Float32Array(5);let sum=0;for(let i=0;i<5;i++){weights[i]=Math.exp(-.5*(i/1.75)**2);sum+=weights[i]*(i?2:1);}for(let i=0;i<5;i++)weights[i]/=sum;
 const blur=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{image:{value:null},stepSize:{value:new THREE.Vector2()},weights:{value:weights},extract:{value:1}},vertexShader:vertex,fragmentShader:'varying vec2 vUv;uniform sampler2D image;uniform vec2 stepSize;uniform float weights[5];uniform float extract;void main(){vec3 sum=vec3(0.);for(int j=-4;j<=4;j++){vec3 c=texture2D(image,vUv+float(j)*stepSize).rgb;if(extract>.5)c=max(c-vec3(.85),vec3(0.));sum+=c*weights[abs(j)];}gl_FragColor=vec4(sum,1.);}'});
 const finish=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:true,uniforms:{image:{value:null},halo:{value:null},strength:{value:p.glow},exposure:{value:p.exposure},chromatic:{value:p.chromatic},vignette:{value:p.vignette},grain:{value:p.grain},phase:{value:0}},vertexShader:vertex,fragmentShader:'varying vec2 vUv;uniform sampler2D image;uniform sampler2D halo;uniform float strength;uniform float exposure;uniform float chromatic;uniform float vignette;uniform float grain;uniform float phase;void main(){vec2 d=vUv-.5;vec2 shift=d*chromatic;vec3 c=texture2D(image,vUv).rgb;c.r=texture2D(image,vUv+shift).r;c.b=texture2D(image,vUv-shift).b;c+=texture2D(halo,vUv).rgb*strength;c*=exposure*(1.-vignette*smoothstep(.08,.65,dot(d,d)));float noise=fract(sin(dot(vUv*vec2(1733.,997.),vec2(3.13,7.71))+phase*.37)*19437.31)-.5;c=max(vec3(0.),c+noise*grain);gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
 const quad=new THREE.Mesh(geo,blur);quad.frustumCulled=false;pipelineScene.add(quad);
 const targetOptions={type:ctx.renderer.capabilities.isWebGL2?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:false,generateMipmaps:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter};
 const beauty=new THREE.WebGLRenderTarget(4,4,{...targetOptions,depthBuffer:true}),ping=new THREE.WebGLRenderTarget(4,4,targetOptions),pong=new THREE.WebGLRenderTarget(4,4,targetOptions);beauty.samples=ctx.lowEnd?0:4;for(const r of [beauty,ping,pong])r.texture.colorSpace=THREE.LinearSRGBColorSpace;
 let width=0,height=0,mode='',iterations=1,ratio=.3;const size=new THREE.Vector2();
 function resize(q){const renderer=ctx.renderer;renderer.getDrawingBufferSize(size);const w=Math.min(1800,size.x),h=Math.round(size.y*w/size.x);const requested=ctx.lowEnd?'low':q.quality;if(width===w&&height===h&&mode===requested)return;mode=requested;width=w;height=h;const ix=['low','mid','high','cinematic'].indexOf(mode);ratio=[.22,.35,.5,.7][ix];iterations=[1,1,2,3][ix];beauty.setSize(w,h);ping.setSize(Math.max(2,Math.round(w*ratio)),Math.max(2,Math.round(h*ratio)));pong.setSize(ping.width,ping.height);}
 return{update(dt,q,c,t){resize(q);sculpture.rotation.y=t*.12;finish.uniforms.phase.value=t;finish.uniforms.strength.value=q.glow;finish.uniforms.exposure.value=q.exposure;finish.uniforms.chromatic.value=q.chromatic;finish.uniforms.vignette.value=q.vignette;finish.uniforms.grain.value=q.grain;},render(c){
  const r=c.renderer,previousTarget=r.getRenderTarget(),tone=r.toneMapping,auto=r.autoClear,xr=r.xr.enabled;
  try{r.xr.enabled=false;r.autoClear=true;r.toneMapping=THREE.NoToneMapping;r.setRenderTarget(beauty);r.render(c.scene,c.camera);
   quad.material=blur;for(let i=0;i<iterations;i++){blur.uniforms.image.value=i===0?beauty.texture:pong.texture;blur.uniforms.extract.value=i===0?1:0;blur.uniforms.stepSize.value.set((1+i*.5)/ping.width,0);r.setRenderTarget(ping);r.render(pipelineScene,camera);blur.uniforms.image.value=ping.texture;blur.uniforms.extract.value=0;blur.uniforms.stepSize.value.set(0,(1+i*.5)/ping.height);r.setRenderTarget(pong);r.render(pipelineScene,camera);}
   quad.material=finish;finish.uniforms.image.value=beauty.texture;finish.uniforms.halo.value=pong.texture;r.toneMapping=tone;r.setRenderTarget(previousTarget);r.render(pipelineScene,camera);return true;
  }finally{r.setRenderTarget(previousTarget);r.toneMapping=tone;r.autoClear=auto;r.xr.enabled=xr;}
 },stats(){return{quality:mode,blurRatio:ratio,blurIterations:iterations,targetWidth:ping.width,targetHeight:ping.height};},dispose(){for(const t of [beauty,ping,pong])t.dispose();blur.dispose();finish.dispose();geo.dispose();}};
}

