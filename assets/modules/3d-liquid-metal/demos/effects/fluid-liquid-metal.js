// Independently authored for the 3Dfans collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="fluid-liquid-metal";
export const title="液态金属 · 3D Liquid Metal";
export const category="materials";
export const guiSchema=[
  {"key":"viscosity","label":"粘性流速 Viscosity","min":0.05,"max":1.0,"step":0.01,"default":0.38},
  {"key":"tension","label":"表面张力 Tension","min":0.1,"max":2.0,"step":0.05,"default":0.85},
  {"key":"roughness","label":"表面粗糙度 Roughness","min":0.0,"max":0.35,"step":0.01,"default":0.04},
  {"key":"droplets","label":"液滴数量 Droplets","min":0,"max":60,"step":1,"default":18},
  {"key":"color","label":"金属色 Color","type":"color","default":"#c8ccd0"},
  {"key":"speed","label":"流动速度 Speed","min":0,"max":1,"step":0.01,"default":0.32}
];
let group=null,instance=null,host=null,time=0,topologyKey='';
const topology=["droplets"];
const signature=p=>JSON.stringify(topology.map(k=>p[k]));
export function create(ctx,params={}){
  dispose();
  for(const s of guiSchema)if(params[s.key]===undefined)params[s.key]=s.default;
  host=ctx;group=new THREE.Group();group.name=id;group.userData.lowEnd=!!ctx.lowEnd;
  ctx.scene.add(group);time=0;topologyKey=signature(params);
  try{instance=assembleLiquidMetal(ctx,params,group);instance.update?.(0,params,ctx,0);}
  catch(e){dispose();throw e;}
}
export function update(dt,params,ctx=host){
  if(!group)return;
  if(signature(params)!==topologyKey)create(ctx,params);
  const step=Math.min(0.05,Math.max(0,dt));time+=step;
  instance.update?.(step,params,ctx,time);
}
export function render(ctx=host){return group?(instance.render?.(ctx)??false):false;}
export function stats(){return instance?.stats?.()??{};}
export function dispose(){
  if(!group)return;
  try{instance?.dispose?.();}finally{disposeTree(group);group=null;instance=null;host=null;time=0;}
}

function assembleLiquidMetal(ctx,p,root){
  const rand=rng(2941);
  const low=ctx.lowEnd;

  // ── base plinth ──
  plinth(root,3.6);

  // ── pool surface: displaced plane ──
  const seg=low?40:90;
  const poolGeo=new THREE.PlaneGeometry(6.4,6.4,seg,seg);
  poolGeo.rotateX(-Math.PI/2);
  const basePos=poolGeo.attributes.position.array.slice();

  const poolMat=new THREE.MeshPhysicalMaterial({
    color:p.color,metalness:1.0,roughness:p.roughness,
    envMapIntensity:2.2,clearcoat:0.6,clearcoatRoughness:0.04,
    side:THREE.DoubleSide
  });
  const poolMesh=mesh(root,poolGeo,poolMat,[0,0.02,0]);
  poolMesh.receiveShadow=true;

  // ── central morphing blob ──
  const blobDetail=low?2:4;
  const blobGeo=new THREE.IcosahedronGeometry(0.85,blobDetail);
  const blobBasePos=blobGeo.attributes.position.array.slice();
  const blobMat=new THREE.MeshPhysicalMaterial({
    color:p.color,metalness:1.0,roughness:p.roughness,
    envMapIntensity:2.6,clearcoat:1.0,clearcoatRoughness:0.02
  });
  const blobMesh=new THREE.Mesh(blobGeo,blobMat);
  blobMesh.position.set(0,1.1,0);
  blobMesh.castShadow=true;
  root.add(blobMesh);

  // ── satellite droplets ──
  const dropCount=Math.floor(p.droplets*(low?0.55:1));
  const dropGeo=new THREE.SphereGeometry(1,low?10:18,low?8:14);
  const dropMat=new THREE.MeshPhysicalMaterial({
    color:p.color,metalness:1.0,roughness:p.roughness+0.02,
    envMapIntensity:2.0,clearcoat:0.8,clearcoatRoughness:0.05
  });
  const droplets=new THREE.InstancedMesh(dropGeo,dropMat,Math.max(dropCount,1));
  droplets.frustumCulled=false;
  root.add(droplets);

  // store droplet seed data
  const dropSeeds=[];
  for(let i=0;i<dropCount;i++){
    const angle=rand()*TAU;
    const radius=1.4+rand()*1.8;
    const size=0.04+rand()*0.18;
    const phaseX=rand()*TAU;
    const phaseZ=rand()*TAU;
    const phaseY=rand()*TAU;
    const speed=0.5+rand()*1.1;
    dropSeeds.push({angle,radius,size,phaseX,phaseZ,phaseY,speed});
  }

  const dummy=new THREE.Object3D();

  // rim glow ring (thin torus at pool level)
  const rimMat=new THREE.MeshBasicMaterial({color:'#9ab5c2',transparent:true,opacity:0.18});
  const rimMesh=mesh(root,new THREE.TorusGeometry(3.0,0.018,6,80),rimMat,[0,0.03,0],[Math.PI/2,0,0]);

  return{
    update(dt,q,ctx,t){
      const clk=t*q.speed;

      // update material colors & params
      poolMat.color.set(q.color);
      poolMat.roughness=q.roughness;
      blobMat.color.set(q.color);
      blobMat.roughness=q.roughness;
      dropMat.color.set(q.color);
      dropMat.roughness=q.roughness+0.02;

      // ── animate pool surface ──
      const pos=poolGeo.attributes.position;
      const freq=q.tension*1.2;
      const visc=q.viscosity;
      for(let i=0;i<pos.count;i++){
        const x=basePos[i*3], z=basePos[i*3+2];
        const r=Math.sqrt(x*x+z*z);
        const wave=
          0.055*Math.sin(x*freq*2.3+clk*1.7)*Math.cos(z*freq*1.9-clk*1.3)+
          0.03*Math.sin((x+z)*freq*3.1+clk*2.1)*visc+
          0.018*Math.cos(r*freq*2.8-clk*2.4)*visc;
        // pool: almost flat except near center
        const edge=clamp(1.0-r/3.3);
        pos.setY(i,wave*edge*0.7);
      }
      pos.needsUpdate=true;
      poolGeo.computeVertexNormals();

      // ── animate blob ──
      const bpos=blobGeo.attributes.position;
      const t2=q.tension*0.9;
      for(let i=0;i<bpos.count;i++){
        const bx=blobBasePos[i*3], by=blobBasePos[i*3+1], bz=blobBasePos[i*3+2];
        const len=Math.sqrt(bx*bx+by*by+bz*bz)||1;
        const nx=bx/len, ny=by/len, nz=bz/len;
        const disp=
          0.13*Math.sin(nx*t2*4.1+clk*1.1)*Math.cos(nz*t2*3.7-clk*0.9)+
          0.08*Math.sin(ny*t2*5.3+clk*1.8)+
          0.05*Math.cos((nx+nz)*t2*2.9+clk*2.3)*visc;
        const r2=0.85+disp*visc;
        bpos.setXYZ(i,nx*r2,ny*r2,nz*r2);
      }
      bpos.needsUpdate=true;
      blobGeo.computeVertexNormals();
      blobMesh.rotation.y=clk*0.22;
      blobMesh.rotation.x=Math.sin(clk*0.17)*0.12;

      // ── animate droplets ──
      for(let i=0;i<dropCount;i++){
        const s=dropSeeds[i];
        const angle=s.angle+clk*s.speed*0.4;
        const rx=s.radius+0.18*Math.sin(s.phaseX+clk*s.speed*0.7);
        const rz=s.radius+0.18*Math.cos(s.phaseZ+clk*s.speed*0.6);
        const hy=s.size*0.9+s.size*Math.abs(Math.sin(s.phaseY+clk*s.speed));
        dummy.position.set(Math.cos(angle)*rx,hy,Math.sin(angle)*rz);
        const sc=s.size*(0.9+0.1*Math.sin(s.phaseY+clk*s.speed*1.3));
        // oblate squish when near ground
        const squish=clamp(1.0-hy*0.7);
        dummy.scale.set(sc*(1+squish*0.4),sc*(1-squish*0.35),sc*(1+squish*0.4));
        dummy.rotation.set(0,angle,0);
        dummy.updateMatrix();
        droplets.setMatrixAt(i,dummy.matrix);
      }
      // hide unused slots
      dummy.scale.setScalar(0);dummy.updateMatrix();
      for(let i=dropCount;i<Math.max(dropCount,1);i++)droplets.setMatrixAt(i,dummy.matrix);
      droplets.instanceMatrix.needsUpdate=true;

      // rim pulse
      rimMat.opacity=0.13+0.06*Math.sin(clk*1.4);
    }
  };
}
