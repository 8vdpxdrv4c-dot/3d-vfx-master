import {guiSchema} from '../parameters.js';
// Ultra Water adapter. The isolated viewport owns its camera, renderer and final output.
export const id = 'ultra-water';
export const title = '逼真海水';
export const category = 'fluid-gas';
export {guiSchema} from '../parameters.js';
let frame = null, params = null, ready = false;
export function create(ctx, values) {
  dispose();
  if (!ctx.container) throw new Error('Ultra Water requires ctx.container: an empty viewport element.');
  params = {...Object.fromEntries(guiSchema.map(s => [s.key,s.default])), ...values};
  frame = document.createElement('iframe');
  frame.title = title; frame.style.cssText = 'display:block;width:100%;height:100%;border:0';
  frame.src = new URL('../index.html', import.meta.url).href;
  frame.onload = () => { ready = true; frame?.contentWindow.waterControl?.setParameters(params); };
  ctx.container.append(frame);
  return frame;
}
export function update(dt, values) {
  if (!frame) return;
  const next = {...params, ...values};
  if (JSON.stringify(next) !== JSON.stringify(params)) {
    params = next;
    if (ready) frame.contentWindow.waterControl?.setParameters(params);
  }
}
export function render() { return Boolean(frame); }
export function setPaused(paused) { if (ready) frame?.contentWindow.waterControl?.pause(paused); }
export function dispose() {
  if (!frame) return;
  frame.onload = null;
  frame.src = 'about:blank'; frame.remove(); frame = null; params = null; ready = false;
}
