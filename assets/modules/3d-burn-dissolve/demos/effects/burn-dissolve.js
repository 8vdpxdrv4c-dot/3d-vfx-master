import * as THREE from 'three';
import { NOISE } from './noise.js';

// Namespace the GLSL helpers so the effect can compose with existing material patches.
const noise = NOISE.replace(/\b(mod289|permute|taylorInvSqrt|snoise|fbm3|snoiseVec3|curlNoise|dissolveField)\b/g, 'hyBurn_$1');
const owners = new WeakMap();

/** Independent burn/char/ember effect for MeshStandardMaterial / MeshPhysicalMaterial.
 * Coordinates are world-space; origin/scale normalize them to the original hall field.
 * Does not own the supplied materials, meshes, lights or render loop.
 */
export function createBurnDissolveEffect({
  progress = 0, edgeColor = new THREE.Color(4, 1.2, 0.25),
  edgeWidth = 0.022, charWidth = 0.22, charStrength = 0.85,
  origin = new THREE.Vector3(), scale = 1
} = {}) {
  if (!(scale > 0) || !Number.isFinite(scale)) throw new RangeError('scale must be positive');
  if (!(edgeWidth > 0) || !(charWidth > 0)) throw new RangeError('burn widths must be positive');
  const uniforms = {
    uTime: { value: 0 }, uDissolve: { value: progress },
    uEdgeCol: { value: new THREE.Color().copy(edgeColor.isColor ? edgeColor : new THREE.Color(edgeColor)) },
    hyBurnOrigin: { value: origin.clone() }, hyBurnScale: { value: scale },
    hyBurnEdgeWidth: { value: edgeWidth }, hyBurnCharWidth: { value: charWidth },
    hyBurnCharStrength: { value: charStrength }
  };
  const materials = new Map(), particles = new Set();
  let disposed = false;
  const assertAlive = () => { if (disposed) throw new Error('Burn effect has been disposed'); };
  const field = `${noise}
uniform vec3 hyBurnOrigin; uniform float hyBurnScale;
float hyBurnField(vec3 p){ return hyBurn_dissolveField((p-hyBurnOrigin)/hyBurnScale); }`;

  function patchMaterial(material) {
    assertAlive();
    if (!material.isMeshStandardMaterial) throw new TypeError('Burn requires a standard or physical material');
    if (materials.has(material)) return material;
    if (owners.has(material)) throw new Error('Clone the material before using it with another burn instance');
    const previous = { compile: material.onBeforeCompile, key: material.customProgramCacheKey };
    // Evaluate before replacing onBeforeCompile: Three's default key uses its source.
    const baseKey = previous.key.call(material);
    const compile = function(shader, renderer) {
      previous.compile.call(this, shader, renderer);
      Object.assign(shader.uniforms, {
        hyBurnProgress: uniforms.uDissolve, hyBurnEdgeColor: uniforms.uEdgeCol,
        hyBurnOrigin: uniforms.hyBurnOrigin, hyBurnScale: uniforms.hyBurnScale,
        hyBurnEdgeWidth: uniforms.hyBurnEdgeWidth, hyBurnCharWidth: uniforms.hyBurnCharWidth,
        hyBurnCharStrength: uniforms.hyBurnCharStrength
      });
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 hyBurnWorld;')
        .replace('#include <project_vertex>', `#include <project_vertex>
{ vec4 burnW=vec4(transformed,1.0);
#ifdef USE_INSTANCING
burnW=instanceMatrix*burnW;
#endif
hyBurnWorld=(modelMatrix*burnW).xyz; }`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
varying vec3 hyBurnWorld;
uniform float hyBurnProgress,hyBurnEdgeWidth,hyBurnCharWidth,hyBurnCharStrength;
uniform vec3 hyBurnEdgeColor;
${field}`)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
float hyBurnN=hyBurnField(hyBurnWorld); float hyBurnEdge=0.0;
if(hyBurnProgress>0.001){
  if(hyBurnN<hyBurnProgress) discard;
  hyBurnEdge=1.0-smoothstep(hyBurnProgress,hyBurnProgress+hyBurnEdgeWidth,hyBurnN);
}`)
        .replace('#include <color_fragment>', `#include <color_fragment>
diffuseColor.rgb *= 1.0-hyBurnCharStrength*(1.0-smoothstep(hyBurnProgress,hyBurnProgress+hyBurnCharWidth,hyBurnN))*step(0.001,hyBurnProgress);`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += hyBurnEdgeColor*hyBurnEdge*0.9;`);
    };
    const key = () => baseKey + '|hy-burn-v1';
    materials.set(material, { ...previous, installedCompile: compile, installedKey: key });
    owners.set(material, api);
    material.onBeforeCompile = compile;
    material.customProgramCacheKey = key;
    material.needsUpdate = true;
    return material;
  }

  /** samplePosition(index) must return a world-space Vector3 (e.g. surface sample).
   * Without a sampler, uses a 22-unit cube at the field origin.
   */
  function createAsh(count = 4000, { samplePosition, intensity = 0, pixelRatio = 1 } = {}) {
    assertAlive();
    if (!Number.isInteger(count) || count < 0) throw new RangeError('Particle count must be a nonnegative integer');
    const base = new Float32Array(count * 3), random = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const p = samplePosition ? samplePosition(i) : new THREE.Vector3(
        (Math.random()-0.5)*22, Math.random()*22, (Math.random()-0.5)*22
      ).multiplyScalar(scale).add(origin);
      p.toArray(base, i * 3);
    }
    for (let i = 0; i < random.length; i++) random[i] = Math.random();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
    geometry.setAttribute('aBase', new THREE.BufferAttribute(base, 3));
    geometry.setAttribute('aRand', new THREE.BufferAttribute(random, 3));
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { ...uniforms, uPR: { value: pixelRatio }, uI: { value: intensity }, uCol: { value: new THREE.Color(1,1,1) } },
      vertexShader: `uniform float uTime,uPR,uDissolve;
attribute vec3 aBase,aRand; varying float vA; varying vec3 vC; ${field}
void main(){ float n=hyBurnField(aBase); float burning=step(n,uDissolve+0.07);
  float life=3.0+aRand.x*4.0; float age=fract(uTime/life+aRand.y); float t=age*life;
  vec3 localBase=(aBase-hyBurnOrigin)/hyBurnScale;
  vec3 p=aBase+(vec3(t*0.7,t*(1.0+aRand.z*2.6),0.0)+hyBurn_curlNoise(localBase*0.07+vec3(0.0,t*0.12,uTime*0.05))*t*0.8)*hyBurnScale;
  vec4 mv=viewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv;
  vA=burning*smoothstep(0.0,0.04,age)*(1.0-age)*0.55;
  float hot=1.0-smoothstep(0.05,0.55,age);
  vC=mix(vec3(0.22,0.2,0.19),vec3(2.4,0.75,0.16),hot);
  gl_PointSize=uPR*(0.7+aRand.z*1.8+hot*2.0)*(30.0/-mv.z);
  if(vA<0.002) gl_Position=vec4(2.0,2.0,2.0,1.0); }`,
      fragmentShader: `uniform vec3 uCol; uniform float uI; varying float vA; varying vec3 vC;
void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5) discard;
float a=1.0-smoothstep(0.0,0.5,d); gl_FragColor=vec4(vC*uCol,a*a*vA*uI); }`
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    particles.add(points);
    return points;
  }

  // Absolute seconds make scrubbing and replay deterministic for fixed particle seeds.
  function update(time, { progress, ashIntensity, pixelRatio } = {}) {
    assertAlive();
    uniforms.uTime.value = time;
    if (progress !== undefined) uniforms.uDissolve.value = THREE.MathUtils.clamp(progress, 0, 1.1);
    for (const points of particles) {
      if (ashIntensity !== undefined) points.material.uniforms.uI.value = ashIntensity;
      if (pixelRatio !== undefined) points.material.uniforms.uPR.value = pixelRatio;
    }
  }
  function reset() {
    update(0, { progress: 0, ashIntensity: 0 });
  }
  function dispose() {
    if (disposed) return;
    for (const [material, previous] of materials) {
      if (material.onBeforeCompile === previous.installedCompile) material.onBeforeCompile = previous.compile;
      if (material.customProgramCacheKey === previous.installedKey) material.customProgramCacheKey = previous.key;
      material.needsUpdate = true;
      owners.delete(material);
    }
    for (const points of particles) {
      points.removeFromParent(); points.geometry.dispose(); points.material.dispose();
    }
    materials.clear(); particles.clear(); disposed = true;
  }
  const api = { uniforms, patchMaterial, createAsh, update, reset, dispose };
  return api;
}
