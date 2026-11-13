import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function createBase(canvas,lowEnd=false){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:!lowEnd,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,lowEnd?1:1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#070c13');scene.fog=new THREE.FogExp2('#070c13',.024);
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(7,4.2,8.5);const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.target.set(0,1,0);controls.minDistance=2;controls.maxDistance=25;
 const key=new THREE.DirectionalLight('#e6f1ff',3.8);key.position.set(4,7,5);scene.add(key);const rim=new THREE.DirectionalLight('#67c5e6',2.7);rim.position.set(-4,3,-5);scene.add(rim);scene.add(new THREE.HemisphereLight('#a4b9cb','#17202b',1.5));
 // Original reflection cards, generated in memory. No downloaded environment map.
 const room=new THREE.Scene();room.background=new THREE.Color('#0b1016');const cards=[];const add=(size,pos,color)=>{const g=new THREE.BoxGeometry(...size),m=new THREE.MeshBasicMaterial({color});const a=new THREE.Mesh(g,m);a.position.set(...pos);room.add(a);cards.push(a);};
 add([.1,5,6],[-5,3,0],'#d2e6ff');add([.1,4,3],[5,2,-1],'#5d7688');add([6,.1,4],[0,6,0],'#e9edf5');add([2,3,.1],[1,2,5],'#c9b69a');
 const generator=new THREE.PMREMGenerator(renderer);const environment=generator.fromScene(room,.04);scene.environment=environment.texture;generator.dispose();cards.forEach(x=>{x.geometry.dispose();x.material.dispose();});
 const clock=new THREE.Clock();let disposed=false;
 return{scene,camera,renderer,controls,clock,lowEnd,resize(w,h){if(disposed)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();},dispose(){if(disposed)return;disposed=true;controls.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
