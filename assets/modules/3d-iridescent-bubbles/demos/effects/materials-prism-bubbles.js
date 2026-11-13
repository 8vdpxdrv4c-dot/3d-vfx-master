// New implementation for the rewritten collection. Standard dependencies are listed in ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
import {instancedCards,softPuff,pointField,pointVertex,pointFragment} from '../lib/cloud-tools.js';
import {makeLensPass} from '../lib/lens-pass.js';
export const id="materials-prism-bubbles";
export const title="虹彩气泡 · 3D Iridescent Bubbles";
export const category="materials";
export const guiSchema=[
  {
    "key": "density",
    "label": "气泡数量 Density",
    "min": 0.3,
    "max": 1.5,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "film",
    "label": "膜厚 Film",
    "min": 180,
    "max": 850,
    "step": 5,
    "default": 420
  },
  {
    "key": "roughness",
    "label": "粗糙度 Roughness",
    "min": 0.02,
    "max": 0.35,
    "step": 0.01,
    "default": 0.06
  },
  {
    "key": "drift",
    "label": "漂浮幅度 Drift",
    "min": 0,
    "max": 0.7,
    "step": 0.01,
    "default": 0.2
  },
  {
    "key": "color",
    "label": "气泡底色 Color",
    "type": "color",
    "default": "#d9edf0"
  },
  {
    "key": "speed",
    "label": "时间速度 Speed",
    "min": 0,
    "max": 1,
    "step": 0.02,
    "default": 0.35
  }
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["density"];
const signature=params=>JSON.stringify(topology.map(k=>params[k]));
export function create(ctx,params={}){
 dispose();for(const item of guiSchema)if(params[item.key]===undefined)params[item.key]=item.default;
 host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;ctx.scene.add(group);time=0;topologyKey=signature(params);
 try{instance=assemble3dIridescentBubblesScene(ctx,params,group);instance.update?.(0,params,ctx,0);}catch(error){dispose();throw error;}
}
export function update(dt,params,ctx=host){if(!group)return;if(signature(params)!==topologyKey)create(ctx,params);const step=Math.min(.05,Math.max(0,dt));time+=step;instance.update?.(step,params,ctx,time);}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){if(!group)return;try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}}
function assemble3dIridescentBubblesScene(ctx,p,root){
 plinth(root,2.8);const random=rng(958),count=Math.max(3,Math.floor((ctx.lowEnd?7:12)*p.density)),film={value:p.film},mat=new THREE.MeshPhysicalMaterial({color:p.color,roughness:p.roughness,metalness:0,transparent:true,opacity:.45,depthWrite:false,transmission:.92,thickness:.008,ior:1.12,iridescence:1,iridescenceIOR:1.32,iridescenceThicknessRange:[p.film*.65,p.film],clearcoat:1});
 // Authored view-angle tint strengthens the thin-shell silhouette; Three.js still supplies the PBR model.
 mat.onBeforeCompile=shader=>{shader.uniforms.shellFilm=film;shader.fragmentShader='uniform float shellFilm;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat shellFacing=abs(dot(normalize(vViewPosition),normalize(normal)));\nvec3 shellTint=.5+.5*cos(vec3(0.,2.094,4.189)+shellFilm*.022*(.65+shellFacing*.8));\ntotalEmissiveRadiance+=shellTint*pow(1.-shellFacing,2.)*.48;');};mat.customProgramCacheKey=()=> 'authored-prism-shell-v1';
 const geo=new THREE.SphereGeometry(1,ctx.lowEnd?24:48,ctx.lowEnd?16:32),bubbles=[];
 for(let i=0;i<count;i++){const a=i/count*TAU,r=.45+random()*.9,at=new THREE.Vector3(Math.cos(a)*r,.6+random()*2.3,Math.sin(a)*r);const m=mesh(root,geo,mat,at.toArray());const size=.3+random()*.3;m.scale.setScalar(size);bubbles.push({m,at,phase:random()*TAU});}
 return{update(dt,q,c,t){film.value=q.film;mat.color.set(q.color);mat.roughness=q.roughness;mat.iridescenceThicknessRange[0]=q.film*.65;mat.iridescenceThicknessRange[1]=q.film;for(const{m,at,phase}of bubbles){m.position.copy(at);m.position.y+=Math.sin(t*q.speed+phase)*q.drift;m.position.x+=Math.cos(t*q.speed*.7+phase)*q.drift*.3;}}};
}

