import * as THREE from 'three';
import { createBurnDissolveEffect } from './burn-dissolve.js';
import { meta } from '../meta.js';
export { createBurnDissolveEffect };
export const id='burn-dissolve',title='烧焦溶解与灰烬',category='vfx';
export const guiSchema=meta.schema;
let effect, elapsed=0;
// ctx.target: Mesh/Group with dedicated standard/physical materials.
export function create(ctx,params={}){
  dispose();
  if(!ctx.target)throw new Error('burn-dissolve requires ctx.target');
  effect=createBurnDissolveEffect({origin:ctx.origin,scale:ctx.scale??1});
  ctx.target.traverse(object=>{
    if(!object.isMesh)return;
    for(const material of (Array.isArray(object.material)?object.material:[object.material]))effect.patchMaterial(material);
  });
  if(ctx.samplePosition){
    const ash=effect.createAsh(ctx.particleCount??4000,{samplePosition:ctx.samplePosition});
    ctx.scene.add(ash);
  }
  update(0,params,ctx);
}
export function update(dt,params={},ctx={}){
  if(!effect)return;
  elapsed+=dt;
  const u=effect.uniforms;
  u.hyBurnEdgeWidth.value=params.edgeWidth??0.022;
  u.hyBurnCharWidth.value=params.charWidth??0.22;
  u.hyBurnCharStrength.value=params.charStrength??0.85;
  u.uEdgeCol.value.set(params.color??'#ff6b22').multiplyScalar(4);
  effect.update(elapsed,{progress:params.progress??0.5,ashIntensity:params.ashIntensity??1,pixelRatio:ctx.pixelRatio??1});
}
export function dispose(){effect?.dispose();effect=null;elapsed=0;}
