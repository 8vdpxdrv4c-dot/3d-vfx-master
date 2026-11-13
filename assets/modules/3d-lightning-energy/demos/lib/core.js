// Independently authored collection infrastructure. Third-party code is confined to vendor/.
import * as THREE from 'three';
export const TAU=Math.PI*2;
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const mix=(a,b,t)=>a+(b-a)*t;
export function rng(seed=7283){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export function material(color='#819298',roughness=.45,metalness=.1){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
export function mesh(root,geo,mat,pos=[0,0,0],rot=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.fromArray(pos);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
export function box(root,size,pos,mat){return mesh(root,new THREE.BoxGeometry(...size),mat,pos);}
export function rod(root,a,b,r,mat,segments=8){a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const delta=b.clone().sub(a);const m=mesh(root,new THREE.CylinderGeometry(r,r,delta.length(),segments),mat,a.clone().add(b).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
export function plinth(root,r=3){const low=root.userData.lowEnd,m=material('#101720',.85,.08);mesh(root,new THREE.CylinderGeometry(r,r*1.03,.18,low?32:64),m,[0,-.12,0]);const edge=mesh(root,new THREE.TorusGeometry(r,.012,6,low?48:96),new THREE.MeshBasicMaterial({color:'#425662'}),[0,-.03,0],[Math.PI/2,0,0]);return edge;}
export function canvasTexture(draw,size=512,color=true){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d');draw(c,size,canvas);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;return texture;}
export function textureFromField(field,size=256,color=false){return canvasTexture((c,n)=>{const data=c.createImageData(n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const rgb=field(x/n,y/n);const j=(y*n+x)*4;for(let k=0;k<3;k++)data.data[j+k]=Math.round(clamp(Array.isArray(rgb)?rgb[k]:rgb)*255);data.data[j+3]=255;}c.putImageData(data,0,0);},size,color);}
export function disposeTree(root){if(!root)return;const geos=new Set(),mats=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){mats.add(m);for(const[k,v]of Object.entries(m))if(v?.isTexture&&k!=='envMap')textures.add(v);for(const u of Object.values(m.uniforms||{}))if(u.value?.isTexture)textures.add(u.value);}});root.removeFromParent();for(const g of geos)g.dispose();for(const m of mats)m.dispose();for(const t of textures)t.dispose();}
export function rememberCamera(ctx){const c=ctx.camera,controls=ctx.controls;const initial={position:c.position.clone(),quaternion:c.quaternion.clone(),target:controls?.target.clone(),enabled:controls?.enabled};return()=>{c.position.copy(initial.position);c.quaternion.copy(initial.quaternion);if(controls){controls.target.copy(initial.target);controls.enabled=initial.enabled;controls.update();}c.updateMatrixWorld(true);};}
export function aimCamera(ctx,position,target){ctx.camera.position.copy(position);if(ctx.controls){ctx.controls.enabled=false;ctx.controls.target.copy(target);}ctx.camera.lookAt(target);ctx.camera.updateMatrixWorld(true);}
export function studioSculpture(root,color='#84babe'){
 const group=new THREE.Group();root.add(group);const body=new THREE.MeshPhysicalMaterial({color,metalness:.65,roughness:.22,clearcoat:.7});
 mesh(group,new THREE.TorusGeometry(1.2,.23,20,80),body,[0,1.65,0],[.3,.2,.3]);
 mesh(group,new THREE.TorusGeometry(.82,.11,16,72),material('#d7b27c',.25,.8),[0,1.65,0],[Math.PI/2,.2,.3]);
 box(group,[.2,1.5,.24],[0,.6,0],body);plinth(root,2.4);return group;
}
