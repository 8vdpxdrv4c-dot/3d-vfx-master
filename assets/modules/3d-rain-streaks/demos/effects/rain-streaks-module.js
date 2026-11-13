/**
 * 统一生命周期契约适配器（单实例、场景层）。
 * 需要同一页面多套独立雨场时，直接使用 createRainStreaksEffect 实例工厂。
 * 本模块不接管最终输出：宿主照常调用自己的 renderer.render 或后期链。
 */
import { createRainStreaksEffect, createRainStage,
  DEFAULT_PARAMS, RAIN_COUNT, SPLASH_COUNT, RAIN_BOX } from './rain-streaks.js';
import { meta } from '../meta.js';

export { createRainStreaksEffect, createRainStage, DEFAULT_PARAMS, RAIN_COUNT, SPLASH_COUNT, RAIN_BOX };
export const id = 'rain-streaks-splashes';
export const title = '雨丝与水花';
export const category = 'particles';
export const guiSchema = meta.schema;

let effect = null;
let stage = null;

/** ctx: {renderer, scene, camera?, size?:[w,h], includeStage?:boolean} */
export function create(ctx = {}, params = {}) {
  dispose();
  if (!ctx.scene) throw new Error('rain-streaks requires ctx.scene');
  const defaults = Object.fromEntries(meta.schema.map((schema) => [schema.key, schema.default]));

  if (ctx.includeStage) {
    stage = createRainStage();
    ctx.scene.add(stage.group);
  }

  effect = createRainStreaksEffect({
    renderer: ctx.renderer || null,
    camera: ctx.camera || null,
    scene: ctx.scene,
    params: { ...defaults, ...params }
  });
  if (stage) effect.setStage(stage);
  if (ctx.size) effect.setSize(ctx.size[0], ctx.size[1]);
  return effect;
}

/** dt 为增量秒数；params 可只传变化项；ctx.camera / ctx.renderer 变化时会重新同步 uPix。 */
export function update(dt = 0, params = {}, ctx = {}) {
  if (!effect) return;
  if (ctx.camera) effect.setCamera(ctx.camera);
  if (ctx.renderer) effect.setRenderer(ctx.renderer);
  effect.update(dt, params);
  if (ctx.size) effect.setSize(ctx.size[0], ctx.size[1]);
}

export function setSize(width, height) { effect?.setSize(width, height); }
export function setCamera(camera) { effect?.setCamera(camera); }
export function setRenderer(renderer) { effect?.setRenderer(renderer); }
export function attach(scene) { effect?.attach(scene); }
export function detach() { effect?.detach(); }
export function setTime(t) { effect?.setTime(t); }
export function settle() { effect?.settle(); }
export function setParams(values) { return effect ? effect.setParams(values) : undefined; }

/** 恢复宿主场景并释放两组 InstancedBufferGeometry、ShaderMaterial 与可选布景资源。 */
export function dispose() {
  effect?.dispose();
  stage?.dispose();
  effect = null;
  stage = null;
}

export function getEffect() { return effect; }
export function getStage() { return stage; }
