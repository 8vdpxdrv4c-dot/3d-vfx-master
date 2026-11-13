import * as THREE from 'three';
import * as fire from './effects/realistic-fire.js';
import {meta} from './meta.js';
const scene=new THREE.Scene();scene.background=new THREE.Color('#0c1016');
const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,0.1,100);camera.position.set(5,3,7);camera.lookAt(0,1.4,0);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);document.body.append(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff,0.4));
const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:'#42444a',roughness:0.85}));floor.rotation.x=-Math.PI/2;floor.position.y=-0.02;scene.add(floor);
const obstacle=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.2,0.5),new THREE.MeshStandardMaterial({color:'#75808a'}));obstacle.position.set(1.1,0.6,0);scene.add(obstacle);
const ctx={scene,camera,renderer};const params=Object.fromEntries(fire.guiSchema.map(s=>[s.key,s.default]));
const $=id=>document.getElementById(id);for(const look of meta.looks)$('look').add(new Option(look.title,look.id));
function preset(){Object.assign(params,Object.fromEntries(fire.guiSchema.map(s=>[s.key,s.default])),meta.looks.find(l=>l.id===$('look').value).params);$('scale').value=params.scale;$('speed').value=params.speed;if(params.variant==='large'){camera.position.set(7,5,11);camera.lookAt(0,2.8,0);}else{camera.position.set(5,3,7);camera.lookAt(0,1.4,0);}fire.create(ctx,params);}
$('look').onchange=preset;$('reset').onclick=preset;$('scale').oninput=e=>params.scale=+e.target.value;$('speed').oninput=e=>params.speed=+e.target.value;
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;$('pause').textContent=paused?'继续':'暂停';$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'继续':'暂停';};
preset();let last=performance.now();
renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,0.05);last=now;if(!paused&&!document.hidden)fire.update(dt,params,ctx);renderer.render(scene,camera);});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
$('status').textContent='WebGL · 三层动画粒子＋闪烁灯光';window.fireDemo={fire,ctx,params};
