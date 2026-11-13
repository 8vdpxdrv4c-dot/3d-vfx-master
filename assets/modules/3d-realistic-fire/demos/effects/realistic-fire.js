import * as THREE from 'three';
import {createFireEffect} from '../lib/fire-runtime.js';
export const id='realistic-fire', title='真实火焰', category='particles';
export const guiSchema=[{"key": "variant", "label": "火焰形态", "options": ["small", "large"], "default": "small"}, {"key": "scale", "label": "大小", "min": 0.1, "max": 10, "step": 0.1, "default": 2}, {"key": "speed", "label": "播放速度", "min": 0, "max": 2, "step": 0.05, "default": 1}];
let effect, signature;
export function create(ctx,params){
    dispose();
    effect=createFireEffect(ctx,{variant:params.variant||'small'});
    effect.addFire(new THREE.Vector3(),params.scale??2,'main');
    signature=JSON.stringify([params.variant,params.scale]);
}
export function update(dt,params,ctx){
    if(!effect)return;
    if(signature!==JSON.stringify([params.variant,params.scale]))create(ctx,params);
    effect.update(dt*(params.speed??1));
}
export function dispose(){effect?.dispose();effect=null;signature=null;}
