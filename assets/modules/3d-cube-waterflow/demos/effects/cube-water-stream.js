// Authored for this scene. Geometry, normal fields, motion and ripples are procedural.
import * as THREE from 'three';
import {createWaterSurface,createSplashSystem,stepSplash} from './water-dynamics.js';
import {removeAndDispose} from '../lib/dispose.js';
export const id='cube-water-stream';
export const title='立方体与出水管道';
export const category='fluid-gas';
export const guiSchema=[
 {key:'flow',label:'出水量',min:0,max:1.5,step:.05,default:1,hint:'改变水束粗细与飞溅数量',unit:'×'},
 {key:'pressure',label:'喷射力度',min:.55,max:1.65,step:.05,default:1,hint:'改变水束向外延伸的距离',unit:'×'},
 {key:'level',label:'立方体水位',min:.55,max:.9,step:.01,default:.74,hint:'独立调整储水体中的展示水位',unit:'%'},
 {key:'waves',label:'水面扰动',min:.1,max:1.5,step:.05,default:.65,hint:'改变水面波纹和落水涟漪',unit:'×'},
 {key:'color',label:'水体颜色',type:'color',default:'#68ccdc'}
];
export const looks={steady:{flow:1,pressure:1,level:.74,waves:.65,color:'#68ccdc'},full:{flow:1.45,pressure:1.3,level:.88,waves:1.15,color:'#68ccdc'},gentle:{flow:.35,pressure:.65,level:.62,waves:.25,color:'#9dbfed'}};
let root=null,world=null,model=null,elapsed=0;
const tau=Math.PI*2,outlet=new THREE.Vector3(.78,1.52,.12),poolY=.335,gravity=7.8,flight=Math.sqrt(2*(outlet.y-poolY)/gravity);
const velocity=q=>2.65*q.pressure;
const point=(s,q)=>new THREE.Vector3(outlet.x+velocity(q)*flight*s,outlet.y-.5*gravity*(flight*s)**2,outlet.z);
const rounded=(w,h,r)=>{const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;};
function block(w,h,d,r=.04){const g=new THREE.ExtrudeGeometry(rounded(w,h,r),{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.015,bevelThickness:.015,curveSegments:5});g.translate(0,0,-d/2);return g;}
function add(g,m,position,rotation){const mesh=new THREE.Mesh(g,m);if(position)mesh.position.set(...position);if(rotation)mesh.rotation.set(...rotation);root.add(mesh);return mesh;}
function normalField(){const n=128,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=(y*n+x)*4,a=x/n*tau,b=y/n*tau;data[k]=128+Math.sin(a*5+Math.sin(b*3)) *12;data[k+1]=128+Math.cos(b*9+Math.sin(a*4))*9;data[k+2]=254;data[k+3]=255;}const texture=new THREE.DataTexture(data,n,n);texture.needsUpdate=true;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,2);return texture;}
function shadowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,10,64,64,64);g.addColorStop(0,'rgba(0,0,0,.68)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
function waterSurface(w,d,color,impact,params){return createWaterSurface(root,world,w,d,color,impact,params);}
function assemble(q){
 const steel=new THREE.MeshStandardMaterial({color:'#b8c9cb',metalness:.93,roughness:.23});
 const dark=new THREE.MeshStandardMaterial({color:'#172a33',metalness:.7,roughness:.28});
 const trim=new THREE.MeshStandardMaterial({color:'#78969c',metalness:.85,roughness:.25});
 const pale=new THREE.MeshStandardMaterial({color:'#d7e0db',metalness:.5,roughness:.3});
 const floor=add(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#0b161d',roughness:.73,metalness:.18}),[0,-.075,0],[-Math.PI/2,0,0]);floor.receiveShadow=true;
 const grid=new THREE.GridHelper(18,36,'#304653','#263a45');grid.position.y=-.069;grid.material.transparent=true;grid.material.opacity=.13;root.add(grid);
 const shadow=add(new THREE.PlaneGeometry(4.2,3.8),new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false}),[-1.88,-.061,.05],[-Math.PI/2,0,0]);
 const plinth=add(block(2.65,.2,2.65,.09),dark,[-1.9,.07,0]);plinth.receiveShadow=true;plinth.castShadow=true;
 const base=add(block(2.38,.16,2.38,.045),trim,[-1.9,.25,0]);base.castShadow=true;
 const cubeBottom=.35,cubeSize=2.25,cubeCenter=new THREE.Vector3(-1.9,cubeBottom+cubeSize/2,0);
 const glass=new THREE.MeshPhysicalMaterial({color:'#b8d9df',roughness:.14,metalness:.08,transparent:true,opacity:.09,depthWrite:false,side:THREE.DoubleSide,clearcoat:1});
 const shell=add(new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize),glass,cubeCenter.toArray());shell.renderOrder=4;
 const boxEdges=new THREE.LineSegments(new THREE.EdgesGeometry(shell.geometry),new THREE.LineBasicMaterial({color:'#a5c3c8',transparent:true,opacity:.72}));boxEdges.position.copy(cubeCenter);root.add(boxEdges);
 for(const x of [-1,1])for(const z of [-1,1]){const post=add(new THREE.BoxGeometry(.035,cubeSize,.035),trim,[cubeCenter.x+x*cubeSize/2,cubeCenter.y,z*cubeSize/2]);post.castShadow=true;}
 for(const y of [cubeBottom,cubeBottom+cubeSize]){for(const z of [-1,1])add(new THREE.BoxGeometry(cubeSize,.035,.035),trim,[cubeCenter.x,y,z*cubeSize/2]);for(const x of [-1,1])add(new THREE.BoxGeometry(.035,.035,cubeSize),trim,[cubeCenter.x+x*cubeSize/2,y,0]);}
 const tankMat=new THREE.MeshPhysicalMaterial({color:'#cdebf0',roughness:.12,metalness:0,transparent:true,opacity:.065,depthWrite:false,side:THREE.DoubleSide});
 const waterVolume=add(new THREE.BoxGeometry(2.17,1,2.17),tankMat);waterVolume.renderOrder=1;
 const tank=waterSurface(2.17,2.17,q.color,new THREE.Vector2(10,10),q);tank.mesh.position.x=-1.9;tank.mesh.renderOrder=2;
 const gaugeMat=new THREE.MeshBasicMaterial({color:'#bdd4d4',transparent:true,opacity:.5});
 for(let i=0;i<9;i++){const y=.54+i*.22;add(new THREE.BoxGeometry(i%2===0?.15:.08,.012,.006),gaugeMat,[-2.8,y,1.132]);}
 const flange=add(new THREE.CylinderGeometry(.31,.31,.075,48),steel,[-.735,1.52,.12],[0,0,-Math.PI/2]);flange.castShadow=true;
 const flangeInner=add(new THREE.TorusGeometry(.245,.027,8,48),dark,[-.69,1.52,.12],[0,Math.PI/2,0]);
 for(let i=0;i<6;i++){const a=i/6*tau;add(new THREE.CylinderGeometry(.028,.028,.055,6),pale,[-.675,1.52+Math.cos(a)*.255,.12+Math.sin(a)*.255],[0,0,-Math.PI/2]);}
 const pipe=add(new THREE.CylinderGeometry(.21,.21,1.48,48,1,true),steel,[.04,1.52,.12],[0,0,-Math.PI/2]);pipe.castShadow=true;
 const bore=add(new THREE.CylinderGeometry(.173,.173,1.43,48,1,true),new THREE.MeshStandardMaterial({color:'#122a34',metalness:.7,roughness:.34,side:THREE.BackSide}),[.06,1.52,.12],[0,0,-Math.PI/2]);
 for(const x of [-.44,.63])add(new THREE.TorusGeometry(.212,.024,10,48),trim,[x,1.52,.12],[0,Math.PI/2,0]);
 add(new THREE.TorusGeometry(.191,.0185,12,56),pale,[.785,1.52,.12],[0,Math.PI/2,0]);
 const valveStem=add(new THREE.CylinderGeometry(.05,.05,.28,16),steel,[-.27,1.82,.12]);valveStem.castShadow=true;
 const handwheel=new THREE.Group();handwheel.position.set(-.27,1.97,.12);root.add(handwheel);handwheel.add(new THREE.Mesh(new THREE.TorusGeometry(.19,.022,8,32),dark));handwheel.rotation.x=Math.PI/2;
 for(let i=0;i<3;i++){const spoke=new THREE.Mesh(new THREE.BoxGeometry(.32,.025,.025),trim);spoke.rotation.z=i*tau/3;handwheel.add(spoke);}
 const rimShape=rounded(4.8,3.5,.32);rimShape.holes.push(new THREE.Path(rounded(4.55,3.25,.21).getPoints(32).reverse()));
 const basinGeo=new THREE.ExtrudeGeometry(rimShape,{depth:.24,bevelEnabled:true,bevelThickness:.025,bevelSize:.022,bevelSegments:2,curveSegments:10});basinGeo.rotateX(-Math.PI/2);
 const basin=add(basinGeo,dark,[1.64,.07,0]);basin.castShadow=true;basin.receiveShadow=true;
 const basinBottom=add(block(4.57,.08,3.27,.2),new THREE.MeshStandardMaterial({color:'#4d656b',metalness:0,roughness:.7}),[1.64,.12,0]);basinBottom.receiveShadow=true;
 const floorLines=[];for(let x=-.48;x<3.8;x+=.3)floorLines.push(x,.174,-1.48,x,.174,1.48);for(let z=-1.48;z<1.5;z+=.3)floorLines.push(-.48,.174,z,3.76,.174,z);
 const bedGrid=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(floorLines,3)),new THREE.LineBasicMaterial({color:'#627b80'}));bedGrid.name='underwater-reference-grid';root.add(bedGrid);
 const pool=waterSurface(4.53,3.22,q.color,new THREE.Vector2(point(1,q).x-1.64,outlet.z),q);pool.mesh.position.set(1.64,poolY,0);
 const drain=add(new THREE.CylinderGeometry(.2,.2,.016,32),trim,[3.35,.17,-.95]);
 for(let i=0;i<5;i++)add(new THREE.BoxGeometry(.24,.008,.012),dark,[3.35,.18,-1.03+i*.04]);
 // Streaming tube: a ballistic centerline with a changing cross-section in world space.
 const segments=world.lowEnd?56:88,sides=world.lowEnd?10:16,count=(segments+1)*(sides+1);
 const geometry=new THREE.BufferGeometry(),positions=new Float32Array(count*3),normals=new Float32Array(count*3),uv=new Float32Array(count*2),indices=[];
 for(let i=0;i<=segments;i++)for(let j=0;j<=sides;j++){const k=i*(sides+1)+j;uv[k*2]=i/segments;uv[k*2+1]=j/sides;if(i<segments&&j<sides){const b=k+sides+1;indices.push(k,k+1,b,b,k+1,b+1);}}
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setIndex(indices);
 const streamNormal=normalField();const jetMat=new THREE.MeshPhysicalMaterial({color:'#f8fdff',roughness:.035,metalness:0,transmission:.985,ior:1.333,thickness:.105,attenuationColor:q.color,attenuationDistance:2.8,opacity:1,side:THREE.FrontSide,normalMap:streamNormal,normalScale:new THREE.Vector2(.08,.045),envMapIntensity:1});
 const jet=add(geometry,jetMat);jet.name='clear-refracting-jet';jet.frustumCulled=false;jet.renderOrder=3;
 const splash=createSplashSystem(root,world.lowEnd);pool.uniforms.events.value=splash.rippleUniforms;
 return{waterVolume,tank,tankMat,pool,geometry,positions,normals,segments,sides,jet,jetMat,streamNormal,splash,drops:splash.mesh,dropCount:splash.capacity,handwheel,cubeBottom};
}
export function create(ctx,params={}){dispose();world=ctx;root=new THREE.Group();root.name=id;ctx.scene.add(root);elapsed=0;try{model=assemble({...Object.fromEntries(guiSchema.map(x=>[x.key,x.default])),...params});update(0,params,ctx);}catch(e){dispose();throw e;}}
export function update(dt,params,ctx=world){
 if(!model)return;const q={...Object.fromEntries(guiSchema.map(x=>[x.key,x.default])),...params};elapsed+=Math.max(0,Math.min(dt,.08));const t=elapsed,m=model,hit=point(1,q),on=q.flow>.005;stepSplash(m.splash,q,hit,Math.max(0,Math.min(dt,.08)),elapsed+2);
 const height=2.17*q.level;m.waterVolume.scale.y=height;m.waterVolume.position.set(-1.9,m.cubeBottom+height/2+.035,0);m.tank.mesh.position.y=m.cubeBottom+height+.035;
 for(const surface of [m.tank,m.pool]){surface.uniforms.time.value=m.splash.time;surface.uniforms.waves.value=q.waves*(surface===m.tank?.45:1);surface.uniforms.flow.value=surface===m.pool?q.flow:0;surface.material.attenuationColor.set(q.color).lerp(new THREE.Color('#f2fbff'),.38);}
 m.tankMat.color.set(q.color).lerp(new THREE.Color('#f0fcff'),.65);m.pool.uniforms.hit.value.set(hit.x-1.64,hit.z);m.jet.visible=on;m.jetMat.attenuationColor.set(q.color).lerp(new THREE.Color('#ecfaff'),.32);
 m.streamNormal.offset.x=-t*(1.1+q.pressure*.5);m.streamNormal.offset.y=t*.055;
 const speed=velocity(q),baseRadius=.106*Math.sqrt(Math.max(.001,q.flow)),N=m.sides+1;
 for(let i=0;i<=m.segments;i++){
  const s=i/m.segments,age=flight*s,dy=-gravity*age,inv=1/Math.hypot(speed,dy),nx=-dy*inv,ny=speed*inv;
  const advected=t-age;const radius=baseRadius*Math.sqrt(speed/Math.hypot(speed,dy))*(1+(q.waves*.022+.012)*Math.sin(advected*28+s*9)+.008*Math.sin(advected*53));
  const center=point(s,q);center.z+=(Math.sin(advected*19)*.003+Math.sin(advected*37)*.0015)*s*s*(.3+q.waves);
  for(let j=0;j<N;j++){const a=j/m.sides*tau,ca=Math.cos(a),sa=Math.sin(a),k=(i*N+j)*3;m.positions[k]=center.x+nx*ca*radius;m.positions[k+1]=center.y+ny*ca*radius;m.positions[k+2]=center.z+sa*radius;m.normals[k]=nx*ca;m.normals[k+1]=ny*ca;m.normals[k+2]=sa;}
 }
 m.geometry.attributes.position.needsUpdate=m.geometry.attributes.normal.needsUpdate=true;
 m.handwheel.rotation.z=(1-q.flow)*.4;
}
export function stats(){return{time:elapsed,active:!!root,particleBudget:model?.dropCount||0,visibleDrops:model?.drops.count||0,streamVisible:!!model?.jet.visible,landing:world&&model?model.pool.uniforms.hit.value.toArray():null,resourceOwner:id,transmission:model?.jetMat.transmission,ior:model?.jetMat.ior,splashEvents:model?.splash.dropsEmitted||0,rippleEvents:model?.splash.ripplesEmitted||0,liveRipplePackets:model?model.splash.rippleUniforms.filter(e=>e.w>0&&model.splash.time-e.z>=0&&model.splash.time-e.z<2.7).length:0,ripplePacketSlots:model?.splash.rippleUniforms.length||0};}
export function anchors(){return{cube:new THREE.Vector3(-2.1,2.79,.1),pipe:new THREE.Vector3(.1,1.92,.12),stream:new THREE.Vector3(1.45,1.3,.12)};}
export function dispose(){if(!root)return;removeAndDispose(root);root=null;model=null;world=null;elapsed=0;}

