// Original shared particle geometry and stroke generators, not sourced effect modules.
import * as THREE from 'three';
import {rng} from './core.js';
export function instancedCards(count,seed=43){
 const base=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry();
 g.index=base.index.clone();for(const[k,v]of Object.entries(base.attributes))g.setAttribute(k,v.clone());base.dispose();
 const data=new Float32Array(count*4),random=rng(seed);for(let i=0;i<data.length;i++)data[i]=random();
 g.setAttribute('aSeed',new THREE.InstancedBufferAttribute(data,4));g.instanceCount=count;return g;
}
export function softPuff(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d'),random=rng(891);
 c.clearRect(0,0,128,128);for(let i=0;i<24;i++){const a=random()*Math.PI*2,r=random()*21,x=64+Math.cos(a)*r,y=64+Math.sin(a)*r,s=24+random()*24;const grad=c.createRadialGradient(x,y,0,x,y,s);grad.addColorStop(0,'rgba(255,255,255,.13)');grad.addColorStop(.45,'rgba(255,255,255,.08)');grad.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=grad;c.fillRect(x-s,y-s,2*s,2*s);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.NoColorSpace;return texture;
}
export function pointField(count,seed=76){
 const random=rng(seed),g=new THREE.BufferGeometry(),a=new Float32Array(count*4),p=new Float32Array(count*3);
 for(let i=0;i<a.length;i++)a[i]=random();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('aSeed',new THREE.BufferAttribute(a,4));return g;
}
export const pointVertex='attribute vec4 aSeed;uniform float pointSize;varying vec4 seed;void main(){seed=aSeed;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(pointSize*(.6+aSeed.w)*1700.0/max(1.0,-mv.z),1.7,32.0);gl_Position=projectionMatrix*mv;}';
export const pointFragment='uniform vec3 color;uniform float opacity;varying vec4 seed;void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=dot(p,p);if(r>1.0)discard;float light=exp(-r*3.5);gl_FragColor=vec4(color*(1.2+light),opacity*light);}';
