// Independently authored for the original collection. See ORIGINALITY.md.
import * as THREE from 'three';
import {TAU,clamp,smooth,mix,rng,material,mesh,box,rod,plinth,canvasTexture,textureFromField,disposeTree,rememberCamera,aimCamera,studioSculpture} from '../lib/core.js';
export const id="particles-falling-leaves";
export const title="空间落叶 · Turning Leaves";
export const category="particles";
export const guiSchema=[
  {
    "key": "density",
    "label": "叶片数量 Density",
    "min": 0.2,
    "max": 1.5,
    "step": 0.05,
    "default": 1
  },
  {
    "key": "wind",
    "label": "横向风 Wind",
    "min": 0,
    "max": 2.5,
    "step": 0.05,
    "default": 0.7
  },
  {
    "key": "fall",
    "label": "下落速率 Fall",
    "min": 0.1,
    "max": 2,
    "step": 0.05,
    "default": 0.65
  },
  {
    "key": "tumble",
    "label": "翻转幅度 Tumble",
    "min": 0,
    "max": 2,
    "step": 0.05,
    "default": 0.8
  },
  {
    "key": "color",
    "label": "叶片底色 Color",
    "type": "color",
    "default": "#d68f36"
  },
  {
    "key": "speed",
    "label": "时间速度 Speed",
    "min": 0,
    "max": 1.5,
    "step": 0.05,
    "default": 0.55
  }
];
let owner=null,root=null,state=null,elapsed=0,signature='';
const topology=["density"];
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
 plinth(root,3.5);const count=Math.floor((ctx.lowEnd?150:390)*p.density),rand=rng(31),geo=new THREE.BufferGeometry(),positions=[],uv=[],indices=[];
 const segments=14;
 for(let i=0;i<=segments;i++){const v=i/segments,y=(v-.5)*.66,w=Math.pow(Math.sin(Math.PI*v),.85)*(.16+(p.variant===2?.045:0));for(let side=-1;side<=1;side+=2){positions.push(side*w,y,.045*Math.sin(v*Math.PI)+Math.abs(side)*w*.11);uv.push((side+1)/2,v);}if(i<segments){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
 geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 const map=canvasTexture((c,n)=>{c.fillStyle='#dad0af';c.fillRect(0,0,n,n);const r=rng(114);for(let j=0;j<1400;j++){const x=r()*n,y=r()*n;c.fillStyle='rgba(70,60,22,.05)';c.fillRect(x,y,2,6);}c.strokeStyle='rgba(69,61,25,.65)';c.lineWidth=3;c.beginPath();c.moveTo(n*.5,0);c.lineTo(n*.5,n);c.stroke();c.lineWidth=1;for(let j=1;j<14;j++){for(const side of [-1,1]){c.beginPath();c.moveTo(n/2,n*j/14);c.quadraticCurveTo(n/2+side*n*.18,n*j/14-n*.06,n/2+side*n*.46,n*j/14-n*.15);c.stroke();}}},256);
 const mat=new THREE.MeshStandardMaterial({map,color:p.color,roughness:.8,side:THREE.DoubleSide});const leaves=new THREE.InstancedMesh(geo,mat,count);leaves.frustumCulled=false;root.add(leaves);
 const dummy=new THREE.Object3D(),data=Array.from({length:count},()=>({x:(rand()-.5)*6.4,z:(rand()-.5)*5.5,y:rand()*5.8,phase:rand()*TAU,size:.55+rand()*.7}));const color=new THREE.Color();for(let i=0;i<count;i++){color.setHSL(.06+rand()*.07,.15,.65+rand()*.25);leaves.setColorAt(i,color);}leaves.instanceColor.needsUpdate=true;
 return{update(dt,q,c,t){mat.color.set(q.color);for(let i=0;i<count;i++){const d=data[i],clock=t*q.speed;dummy.position.set(d.x+Math.sin(clock*.7+d.phase)*q.wind*.6,((d.y-clock*q.fall)%5.8+5.8)%5.8+.15,d.z+Math.cos(clock*.45+d.phase)*q.wind*.5);dummy.rotation.set(d.phase+clock*(.8+q.tumble),Math.sin(clock+d.phase)*q.tumble*2,d.phase+clock*.45*q.tumble);dummy.scale.setScalar(d.size);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);}leaves.instanceMatrix.needsUpdate=true;}};
}

