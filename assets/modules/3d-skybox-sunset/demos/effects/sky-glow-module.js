/**
 * 统一生命周期契约适配器（单实例）。
 * 需要多个夕阳天空盒实例时，直接使用 createSkyGlowEffect 工厂。
 */
import { createSkyGlowEffect, DEFAULT_PARAMS, POST_TUNE } from './sky-glow.js';
import { meta } from '../meta.js';

export { createSkyGlowEffect, DEFAULT_PARAMS, POST_TUNE };
export const id = 'skybox-sunset';
export const title = '夕阳天空盒与太阳光晕';
export const category = 'environment';
export const guiSchema = meta.schema;

let effect = null;

/** ctx: {renderer, scene, camera?, size?:[w,h], captureEnvironment?:boolean} */
export function create(ctx = {}, params = {}) {
  dispose();
  if (!ctx.renderer) throw new Error('skybox-sunset requires ctx.renderer');
  if (!ctx.scene) throw new Error('skybox-sunset requires ctx.scene');
  const defaults = Object.fromEntries(meta.schema.map((schema) => [schema.key, schema.default]));
  effect = createSkyGlowEffect({
    renderer: ctx.renderer,
    scene: ctx.scene,
    captureEnvironment: ctx.captureEnvironment !== false,
    params: { ...defaults, ...params }
  });
  if (ctx.size) effect.setSize(ctx.size[0], ctx.size[1]);
  return effect;
}

/** dt 为增量秒数；params 可只传变化项；ctx.size 变化时同步重建后期 RT。 */
export function update(dt = 0, params = {}, ctx = {}) {
  if (!effect) return;
  effect.update(dt, params);
  if (ctx.size) effect.setSize(ctx.size[0], ctx.size[1]);
}

/** 渲染所有权：调用它输出最终画面，不要再叠加其它 postprocess 链。 */
export function render(scene, camera) {
  return effect ? effect.render(scene, camera) : undefined;
}

export function setSize(width, height) {
  effect?.setSize(width, height);
}

/** 恢复宿主 scene.environment / fog / 灯光组，并释放全部 RT、材质与噪声纹理。 */
export function dispose() {
  effect?.dispose();
  effect = null;
}

export function getEffect() {
  return effect;
}
