// Locally authored water optics and bounded splash/ripple events. No external assets.
import * as THREE from 'three';
const RIPPLE_COUNT=14,TAU=Math.PI*2,GRAVITY=9.81,SURFACE=.335;
const fieldGLSL=`
 uniform float uWaterTime,uWaterWaves,uWaterFlow;
 uniform vec2 uWaterHit;
 uniform vec4 uWaterEvents[14];
 vec3 waterField(vec2 p){
  float a=dot(p,vec2(3.8,2.6))+uWaterTime*.86;
  float b=dot(p,vec2(-5.7,4.2))-uWaterTime*1.13;
  float h=sin(a)*.0016+sin(b)*.0011;
  vec2 slope=cos(a)*.0016*vec2(3.8,2.6)+cos(b)*.0011*vec2(-5.7,4.2);
  vec2 delta=p-uWaterHit;float r=length(delta);
  float dent=-.012*exp(-r*r/ .012)*min(uWaterFlow,1.35);
  h+=dent;slope+=dent*(-2.0/.012)*delta;
  for(int i=0;i<14;i++){
   vec4 e=uWaterEvents[i];float age=uWaterTime-e.z;
   if(e.w>0.0&&age>0.0&&age<2.7){
    vec2 v=p-e.xy;float radius=max(length(v),.0001);
    float speed=.65+.08*sin(e.z*17.0);float d=radius-speed*age;
    float width=.09+age*.024;
    float envelope=exp(-d*d/(width*width))*exp(-age*1.32)*smoothstep(0.0,.07,age);
    float phase=d*47.0;float s=sin(phase),c=cos(phase);
    h+=e.w*envelope*s;
    slope+=v/radius*e.w*envelope*(47.0*c-2.0*d/(width*width)*s);
   }
  }
  return vec3(h,slope)*uWaterWaves;
 }
`;
export function createWaterSurface(root,ctx,w,d,color,impact,params){
 const geo=new THREE.PlaneGeometry(w,d,ctx.lowEnd?40:72,ctx.lowEnd?28:50);geo.rotateX(-Math.PI/2);
 const material=new THREE.MeshPhysicalMaterial({color:'#f7fcff',metalness:0,roughness:.065,transmission:.96,ior:1.333,thickness:.18,attenuationColor:color,attenuationDistance:3.2,envMapIntensity:.8,side:THREE.FrontSide});
 const uniforms={time:{value:2},waves:{value:params.waves},flow:{value:0},hit:{value:impact.clone()},events:{value:Array.from({length:RIPPLE_COUNT},()=>new THREE.Vector4(0,0,-100,0))}};
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{uWaterTime:uniforms.time,uWaterWaves:uniforms.waves,uWaterFlow:uniforms.flow,uWaterHit:uniforms.hit,uWaterEvents:uniforms.events});
  shader.vertexShader=fieldGLSL+'\nvarying vec2 vWaterXZ;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vWaterXZ=position.xz;transformed.y+=waterField(position.xz).x;`);
  shader.fragmentShader=fieldGLSL+'\nuniform mat3 normalMatrix;varying vec2 vWaterXZ;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
   vec3 waterGradient=waterField(vWaterXZ);normal=normalize(normalMatrix*vec3(-waterGradient.y,1.0,-waterGradient.z));`);
 };
 material.customProgramCacheKey=()=> 'authored-clear-water-field-v2';
 const mesh=new THREE.Mesh(geo,material);mesh.name='refracting-water-surface';root.add(mesh);return{mesh,material,uniforms};
}
const random=s=>{s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;};
function ripple(s,x,z,amplitude){const e=s.rippleUniforms[s.eventCursor++%RIPPLE_COUNT];e.set(x-1.64,z,s.time,amplitude);s.ripplesEmitted++;}
function emit(s,q,hit){
 let p;for(let i=0;i<s.capacity;i++){const candidate=s.particles[s.particleCursor++%s.capacity];if(!candidate.active){p=candidate;break;}}if(!p)return;
 const a=random(s)*TAU,k=.15+random(s)*.65;
 Object.assign(p,{active:true,age:0,x:hit.x+(random(s)-.5)*.04,z:hit.z+(random(s)-.5)*.04,vx:Math.cos(a)*k+.12*q.pressure,vz:Math.sin(a)*k*.8,vy:(.62+random(s)*.72)*Math.sqrt(Math.max(.25,q.flow))*(.8+q.waves*.2),size:(.005+Math.pow(random(s),1.8)*.008)*(.8+q.flow*.2)});
 s.dropsEmitted++;
}
function integrate(s,q,hit,dt){
 s.time+=dt;s.emitWait-=dt;s.primaryWait-=dt;s.secondaryWait-=dt;
 if(s.emitWait<=0){emit(s,q,hit);s.emitWait+=(.65+random(s)*.9)/(18+q.flow*32);}
 if(s.primaryWait<=0){ripple(s,hit.x+(random(s)-.5)*.045,hit.z+(random(s)-.5)*.045,(.0045+random(s)*.0025)*Math.sqrt(q.flow));s.primaryWait=.19+random(s)*.21;}
 for(const p of s.particles){if(!p.active)continue;p.age+=dt;const y=SURFACE+.008+p.vy*p.age-.5*GRAVITY*p.age*p.age;
  if(y<=SURFACE&&p.age>.015){if(s.secondaryWait<=0){ripple(s,p.x+p.vx*p.age,p.z+p.vz*p.age,.0018+random(s)*.0016);s.secondaryWait=.075+random(s)*.065;}p.active=false;}
 }
}
function matrices(s){let count=0;for(const p of s.particles){if(!p.active)continue;const vy=p.vy-GRAVITY*p.age,y=SURFACE+.008+p.vy*p.age-.5*GRAVITY*p.age*p.age;
 s.dummy.position.set(p.x+p.vx*p.age,y,p.z+p.vz*p.age);s.direction.set(p.vx,vy,p.vz).normalize();s.dummy.quaternion.setFromUnitVectors(s.up,s.direction);
 const birth=Math.min(1,p.age/.02),size=p.size*birth;s.dummy.scale.set(size,size*(1+Math.min(1.3,Math.abs(vy))*.45),size);s.dummy.updateMatrix();s.mesh.setMatrixAt(count++,s.dummy.matrix);
 }s.mesh.count=count;s.mesh.instanceMatrix.needsUpdate=true;s.visible=count;
}
export function createSplashSystem(root,low){
 const capacity=low?100:200,material=new THREE.MeshPhysicalMaterial({color:'#f9fdff',metalness:0,roughness:.05,transmission:.86,ior:1.333,thickness:.018,attenuationColor:'#d6f1f5',attenuationDistance:1.8,envMapIntensity:1.6});
 const mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(1,low?6:8,6),material,capacity);mesh.name='returning-water-droplets';mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;root.add(mesh);
 return{mesh,capacity,particles:Array.from({length:capacity},()=>({active:false})),rippleUniforms:Array.from({length:RIPPLE_COUNT},()=>new THREE.Vector4(0,0,-100,0)),dummy:new THREE.Object3D(),direction:new THREE.Vector3(),up:new THREE.Vector3(0,1,0),seed:18461,time:2,eventCursor:0,particleCursor:0,emitWait:0,primaryWait:0,secondaryWait:0,signature:'',visible:0,dropsEmitted:0,ripplesEmitted:0};
}
export function stepSplash(s,q,hit,dt,now){
 const signature=q.flow.toFixed(3)+':'+q.pressure.toFixed(3),on=q.flow>.005;
 if(!s.signature){
  s.seed=18461;s.emitWait=s.primaryWait=s.secondaryWait=0;
  s.time=now-.85;
  if(on)for(let i=0;i<51;i++)integrate(s,q,hit,1/60);else s.time=now;
 }else if(!on){for(const p of s.particles)p.active=false;s.time=now;
 }else{
  if(!s.on){s.time=now;for(let i=0;i<4;i++)emit(s,q,hit);s.emitWait=0;s.primaryWait=0;}
  if(dt>0){const steps=Math.ceil(dt/(1/60));for(let i=0;i<steps;i++)integrate(s,q,hit,dt/steps);}else s.time=now;
 }
 s.signature=signature;s.on=on;
 matrices(s);
}
