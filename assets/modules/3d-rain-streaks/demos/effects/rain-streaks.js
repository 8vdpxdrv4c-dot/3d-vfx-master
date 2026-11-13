/**
 * 3d-rain-streaks · 雨丝与水花（实例工厂）
 *
 * 来源：用户在 2026-11-12 对话中提供的「几猫 · 雨效独立演示（可调雨点大小）」单文件代码。
 * 本文件逐字保留其中 makeRainGeometry / makeSplashGeometry、RAIN_VERT / RAIN_FRAG /
 * SPLASH_VERT / SPLASH_FRAG 四段着色器，以及 RAIN_COUNT / SPLASH_COUNT / RAIN_BOX、
 * 两组 uniforms 初值、材质配置与雨量/尺寸的指数平滑逻辑。
 *
 * 封装层只做三件事：把全局状态收进实例、把可调数值映射到已有 uniform、
 * 把演示布景拆成可选的 createRainStage()。未改写着色器算法、未新增计算通道。
 * 逐字复制与适配清单见模块根 ORIGINALITY.md，输入未附独立许可证声明。
 */
import * as THREE from 'three';

/* ============================================================
 * 1. 雨丝几何体（用户提供代码，逐字保留）
 * ============================================================ */
function makeRainGeometry(count) {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -0.5, 0, 0,   0.5, 0, 0,
    -0.5, 1, 0,   0.5, 1, 0
  ]), 3));
  geo.setIndex([0, 1, 2, 2, 1, 3]);

  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seeds[i*4+0] = Math.random();
    seeds[i*4+1] = Math.random();
    seeds[i*4+2] = Math.random();
    seeds[i*4+3] = Math.random();
  }
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return geo;
}

/* ============================================================
 * 2. 雨丝着色器（用户提供代码，逐字保留）
 *
 * ★ 新增：uSize 控制雨点尺寸
 *   - 影响「雨丝长度」len
 *   - 影响「雨丝宽度」w0
 *   - 由于 w0 和 w 同步缩放，alpha 归一化因子 (w0/w) 不变
 *     → 亮度不变，只是视觉上更粗壮
 * ============================================================ */
const RAIN_VERT = /* glsl */`
  attribute vec4 aSeed;

  uniform float uTime;
  uniform float uRain;
  uniform float uPix;
  uniform float uSize;           // ★ 新增：雨点大小倍率
  uniform vec3  uVel;
  uniform vec3  uBox;
  uniform vec3  uSunDir;
  uniform vec3  uSunCol;
  uniform vec3  uAmb;

  varying vec3  vCol;
  varying float vA;
  varying vec2  vUv;

  float wPhase(float c) {
    float g = 0.72;
    return (1.0 - g * g) / (12.566 * pow(1.0 + g * g - 2.0 * g * c, 1.5));
  }

  void main() {
    vUv = position.xy;

    float sp = 0.82 + 0.36 * aSeed.w;
    vec3 vel = uVel * sp;

    vec3 p = aSeed.xyz * uBox + vel * uTime;
    p = mod(p - cameraPosition + 0.5 * uBox, uBox) - 0.5 * uBox + cameraPosition;

    // ★ 长度受 uSize 影响：雨点大 → 雨丝更长
    float len = 0.03 * length(vel) * uSize;

    float kill = 0.0;
    if (fract(aSeed.w * 7.13 + aSeed.x) > uRain) kill = 1.0;
    if (p.y < 0.0) kill = 1.0;

    vec3 dir = normalize(vel);
    vec3 toP = p - cameraPosition;
    float dist = length(toP);
    vec3 side = normalize(cross(dir, toP));

    // ★ 宽度受 uSize 影响：雨点大 → 雨丝更粗
    float w0 = (0.005 + 0.004 * fract(aSeed.w * 3.7)) * uSize;
    float w = max(w0, dist * uPix * 0.75);

    vec3 wp = p + dir * (len * (position.y - 0.5)) + side * (w * position.x);

    // 注意：alpha 里的 (w0/w) 在 uSize 同步缩放时保持不变
    //       所以雨点变大时亮度基本不变，只是更粗、更长
    float a = (w0 / w) * smoothstep(0.7, 2.6, dist) * (1.0 - smoothstep(0.38, 0.5, dist / uBox.x));

    float c = dot(toP / max(dist, 1e-3), uSunDir);
    vCol = uAmb + uSunCol * wPhase(c);
    vA = a * (0.55 + 0.45 * fract(aSeed.w * 13.3));

    gl_Position = kill > 0.5
      ? vec4(2.0, 2.0, 2.0, 1.0)
      : projectionMatrix * viewMatrix * vec4(wp, 1.0);
  }
`;

const RAIN_FRAG = /* glsl */`
  varying vec3  vCol;
  varying float vA;
  varying vec2  vUv;
  void main() {
    float x = 1.0 - abs(vUv.x) * 2.0;
    float e = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
    float a = vA * x * e;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vCol, a);
  }
`;

/* ============================================================
 * 3. 水花几何体（用户提供代码，逐字保留）
 * ============================================================ */
function makeSplashGeometry(count) {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -0.5, 0, 0,   0.5, 0, 0,
    -0.5, 1, 0,   0.5, 1, 0
  ]), 3));
  geo.setIndex([0, 1, 2, 2, 1, 3]);

  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seeds[i*4+0] = Math.random();
    seeds[i*4+1] = Math.random();
    seeds[i*4+2] = Math.random();
    seeds[i*4+3] = Math.random();
  }
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return geo;
}

/* ============================================================
 * 4. 水花着色器（用户提供代码，逐字保留）
 *
 * ★ 新增：uSize 控制水花尺寸
 * ============================================================ */
const SPLASH_VERT = /* glsl */`
  attribute vec4 aSeed;

  uniform float uTime;
  uniform float uRain;
  uniform float uSize;           // ★ 新增
  uniform vec3  uSunDir;
  uniform vec3  uSunCol;
  uniform vec3  uAmb;

  varying vec3  vCol;
  varying float vA;
  varying vec2  vUv;
  varying float vLife;

  vec2 sHash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    q += dot(q, q.yzx + 33.33);
    return fract((q.xx + q.yz) * q.zy);
  }

  void main() {
    vUv = position.xy;

    float period = 0.26 + 0.14 * aSeed.z;
    float tt = uTime / period + aSeed.w * 10.0;
    float cyc = floor(tt);
    float life = fract(tt);

    vec2 r = sHash(aSeed.xy * 91.7 + cyc * 0.371);
    vec2 rr = r - 0.5;
    rr *= 0.35 + 1.3 * abs(rr);

    vec2 snap = floor(cameraPosition.xz / 4.0) * 4.0;
    vec3 p = vec3(snap.x + rr.x * 30.0, 0.0, snap.y + rr.y * 30.0);

    vec2 cell = floor(p.xz / 3.0);
    float wet = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
    float pud = step(0.5, wet);

    float k = fract(aSeed.w * 5.3 + cyc * 0.17);
    float kill = 0.0;
    if (pud < 0.5 && k > 0.3) kill = 1.0;
    if (k > 0.2 + 0.8 * uRain) kill = 1.0;

    // ★ 水花基础尺寸受 uSize 影响
    float sz = mix(0.04, 0.08, aSeed.z) * mix(0.65, 1.0, pud) * uSize;
    float wd = sz * (0.7 + 1.5 * life);
    float ht = sz * (0.4 + 1.3 * sin(life * 3.14159));

    vec3 toP = p - cameraPosition;
    float dist = length(toP);
    vec3 side = normalize(vec3(toP.z, 0.0, -toP.x));

    vec3 wp = p + side * (wd * position.x * 2.0) + vec3(0.0, ht * position.y + 0.004, 0.0);

    float c = dot(toP / max(dist, 1e-3), uSunDir);
    float phase = (1.0 - 0.72 * 0.72) / (12.566 * pow(1.0 + 0.72 * 0.72 - 2.0 * 0.72 * c, 1.5));
    vCol = uAmb * 1.4 + uSunCol * phase * 0.8;

    vA = (1.0 - life) * (1.0 - smoothstep(11.0, 15.0, dist)) * mix(0.5, 1.0, pud);
    vLife = life;

    gl_Position = kill > 0.5
      ? vec4(2.0, 2.0, 2.0, 1.0)
      : projectionMatrix * viewMatrix * vec4(wp, 1.0);
  }
`;

const SPLASH_FRAG = /* glsl */`
  varying vec3  vCol;
  varying float vA;
  varying vec2  vUv;
  varying float vLife;
  void main() {
    float x = vUv.x * 2.0;
    float y = vUv.y;
    float dome = smoothstep(1.0, 0.25, length(vec2(x * 1.15, y * 1.5)));
    float crown = dome * (0.35 + 0.65 * smoothstep(0.25, 0.75, length(vec2(x, y * 1.4))));
    float core = smoothstep(0.5, 0.0, length(vec2(x * 1.6, (y - 0.25) * 1.6))) * (1.0 - vLife);
    float a = clamp(crown * 0.5 + core * 0.8, 0.0, 1.0) * vA * 0.6;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vCol, a);
  }
`;

/* ============================================================
 * 5. 原始常量（用户提供代码，逐字保留）
 * ============================================================ */
export const RAIN_COUNT = 9000;
export const SPLASH_COUNT = 1200;
export const RAIN_BOX = Object.freeze({ x: 26, y: 15, z: 26 });

/* 原页 sun.position(-12, 8, -20).normalize() 对应的角度，用于把方向变成可调参数 */
const SUN_BASE = Object.freeze({ azimuth: 211, elevation: 18.9, distance: Math.sqrt(608) });
const SUN_TINT = new THREE.Color(1.0, 0.72, 0.42);
const AMB_TINT = new THREE.Color(0.10, 0.13, 0.18);

/**
 * 默认参数与原页第 6/7 节初始状态一致。
 * sunIntensity = 2.4 还原 uSunCol = vec3(1.0,0.72,0.42) * 2.4；
 * ambIntensity = 1 还原 uAmb = vec3(0.10,0.13,0.18)。
 */
export const DEFAULT_PARAMS = Object.freeze({
  rain: 0.6,
  dropSize: 1.0,
  windSpeed: 3.0,
  fallSpeed: 9.4,
  sunAzimuth: SUN_BASE.azimuth,
  sunElevation: SUN_BASE.elevation,
  sunIntensity: 2.4,
  ambIntensity: 1.0,
  rainDrops: RAIN_COUNT,
  splashDrops: SPLASH_COUNT,
  speed: 1.0
});

function sunDirection(azimuthDeg, elevationDeg, out = new THREE.Vector3()) {
  const az = THREE.MathUtils.degToRad(azimuthDeg);
  const el = THREE.MathUtils.degToRad(elevationDeg);
  return out.set(
    Math.cos(el) * Math.sin(az),
    Math.sin(el),
    Math.cos(el) * Math.cos(az)
  ).normalize();
}

/**
 * 创建一套独立的雨丝 + 水花系统。
 *
 * options: { renderer?, camera?, scene?, params?, autoAttach?: boolean }
 *   - renderer / camera 用于逐帧计算 uPix（原页 updatePix）。
 *   - scene + autoAttach=true 时把两组网格挂到宿主场景；否则用 attach(scene)。
 *   - 本效果是场景层，不接管 renderer.render；宿主照常渲染自己的画面。
 */
export function createRainStreaksEffect(options = {}) {
  const state = { ...DEFAULT_PARAMS };
  let rendererRef = options.renderer || null;
  let cameraRef = options.camera || null;
  let sceneRef = null;
  let stageRef = null;
  let disposed = false;

  const clock = {
    time: 0,
    rainTarget: state.rain,
    rainCurrent: 0.0,
    sizeTarget: state.dropSize,
    sizeCurrent: 1.0
  };

  // 原页第 6 节：两组 uniforms 初值逐字保留
  const rainUniforms = {
    uTime:   { value: 0 },
    uRain:   { value: 0.6 },
    uPix:    { value: 0.002 },
    uSize:   { value: 1.0 },       // ★ 新增：雨点大小倍率
    uVel:    { value: new THREE.Vector3(-2.6, -9.4, 1.1) },
    uBox:    { value: new THREE.Vector3(RAIN_BOX.x, RAIN_BOX.y, RAIN_BOX.z) },
    uSunDir: { value: sunDirection(state.sunAzimuth, state.sunElevation) },
    uSunCol: { value: SUN_TINT.clone().multiplyScalar(state.sunIntensity) },
    uAmb:    { value: AMB_TINT.clone().multiplyScalar(state.ambIntensity) }
  };
  const splashUniforms = {
    uTime:   { value: 0 },
    uRain:   { value: 0.6 },
    uSize:   { value: 1.0 },       // ★ 新增
    uSunDir: { value: rainUniforms.uSunDir.value.clone() },
    uSunCol: { value: rainUniforms.uSunCol.value.clone() },
    uAmb:    { value: rainUniforms.uAmb.value.clone() }
  };

  const rainMat = new THREE.ShaderMaterial({
    uniforms: rainUniforms,
    vertexShader: RAIN_VERT,
    fragmentShader: RAIN_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
  const splashMat = new THREE.ShaderMaterial({
    uniforms: splashUniforms,
    vertexShader: SPLASH_VERT,
    fragmentShader: SPLASH_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });

  const rainMesh = new THREE.Mesh(makeRainGeometry(RAIN_COUNT), rainMat);
  rainMesh.frustumCulled = false;
  rainMesh.renderOrder = 900;
  rainMesh.matrixAutoUpdate = false;

  const splashMesh = new THREE.Mesh(makeSplashGeometry(SPLASH_COUNT), splashMat);
  splashMesh.frustumCulled = false;
  splashMesh.renderOrder = 890;
  splashMesh.matrixAutoUpdate = false;

  const group = new THREE.Group();
  group.name = 'rain-streaks';
  group.add(splashMesh, rainMesh);

  function updatePix() {
    if (!rendererRef) return;
    const buf = rendererRef.getDrawingBufferSize(new THREE.Vector2());
    const fov = cameraRef && cameraRef.fov ? cameraRef.fov : 60;
    rainUniforms.uPix.value = 2 * Math.tan(fov * Math.PI / 360) / Math.max(1, buf.y);
  }

  function syncSun() {
    const dir = sunDirection(state.sunAzimuth, state.sunElevation);
    rainUniforms.uSunDir.value.copy(dir);
    splashUniforms.uSunDir.value.copy(dir);
    if (stageRef) stageRef.setSunDirection(dir);
  }

  function syncLightColors() {
    const sun = SUN_TINT.clone().multiplyScalar(state.sunIntensity);
    const amb = AMB_TINT.clone().multiplyScalar(state.ambIntensity);
    rainUniforms.uSunCol.value.copy(sun);
    rainUniforms.uAmb.value.copy(amb);
    splashUniforms.uSunCol.value.copy(sun);
    splashUniforms.uAmb.value.copy(amb);
  }

  function syncWind() {
    // 原页 updateWind()：横向分量按风速缩放，竖直分量由 fallSpeed 控制
    const s = state.windSpeed;
    rainUniforms.uVel.value.set(-2.6 * s / 3, -state.fallSpeed, 1.1 * s / 3);
  }

  function applyParams(values = {}) {
    for (const key of Object.keys(DEFAULT_PARAMS)) {
      if (Object.prototype.hasOwnProperty.call(values, key) && Number.isFinite(+values[key])) {
        state[key] = +values[key];
      }
    }
    clock.rainTarget = THREE.MathUtils.clamp(state.rain, 0, 1);
    clock.sizeTarget = THREE.MathUtils.clamp(state.dropSize, 0.3, 2.5);
    rainMesh.geometry.instanceCount = Math.max(0, Math.min(RAIN_COUNT, Math.round(state.rainDrops)));
    splashMesh.geometry.instanceCount = Math.max(0, Math.min(SPLASH_COUNT, Math.round(state.splashDrops)));
    syncWind();
    syncSun();
    syncLightColors();
    return state;
  }

  /**
   * dt 为增量秒数。params 可传完整参数对象或只传变化项。
   * 原页的雨量/尺寸指数平滑与 uTime 同步逻辑保持不变。
   */
  function update(dt = 0, params = {}) {
    if (disposed) return state;
    const step = Math.min(Math.max(dt, 0), 0.05);
    if (Object.keys(params).length) applyParams(params);

    clock.time += step * state.speed;
    clock.rainCurrent += (clock.rainTarget - clock.rainCurrent) * Math.min(1, step * 1.5);
    clock.sizeCurrent += (clock.sizeTarget - clock.sizeCurrent) * Math.min(1, step * 6);

    rainUniforms.uTime.value = clock.time;
    rainUniforms.uRain.value = clock.rainCurrent;
    rainUniforms.uSize.value = clock.sizeCurrent;   // ★ 同步到着色器
    splashUniforms.uTime.value = clock.time;
    splashUniforms.uRain.value = clock.rainCurrent;
    splashUniforms.uSize.value = clock.sizeCurrent; // ★ 同步到着色器

    updatePix();
    return state;
  }

  function attach(scene) {
    if (disposed || !scene) return;
    if (group.parent !== scene) {
      if (group.parent) group.parent.remove(group);
      scene.add(group);
    }
    sceneRef = scene;
  }

  function detach() {
    group.parent?.remove(group);
    sceneRef = null;
  }

  function setSize() { updatePix(); }
  function setCamera(camera) { cameraRef = camera; updatePix(); }
  function setRenderer(renderer) { rendererRef = renderer; updatePix(); }
  function setStage(stage) { stageRef = stage; syncSun(); }
  function setTime(t) {
    if (!Number.isFinite(t)) return;
    clock.time = t;
    rainUniforms.uTime.value = t;
    splashUniforms.uTime.value = t;
  }
  /**
   * 立即完成雨量/尺寸的平滑过渡，便于截图与验收。
   * 可传入最新参数对象：外部直接改 params 后、宿主尚未执行 update() 时，
   * 也能在一次调用内同时收敛目标值与当前值，避免验收读数滞后一帧以上。
   * 只作用于封装层的状态同步，不改动用户原始着色器与平滑公式。
   */
  function settle(values) {
    if (values && Object.keys(values).length) applyParams(values);
    clock.rainTarget = THREE.MathUtils.clamp(state.rain, 0, 1);
    clock.sizeTarget = THREE.MathUtils.clamp(state.dropSize, 0.3, 2.5);
    clock.rainCurrent = clock.rainTarget;
    clock.sizeCurrent = clock.sizeTarget;
    rainUniforms.uRain.value = clock.rainCurrent;
    splashUniforms.uRain.value = clock.rainCurrent;
    rainUniforms.uSize.value = clock.sizeCurrent;
    splashUniforms.uSize.value = clock.sizeCurrent;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    detach();
    rainMesh.geometry.dispose();
    splashMesh.geometry.dispose();
    rainMat.dispose();
    splashMat.dispose();
    stageRef = null;
  }

  applyParams(options.params || {});
  if (options.scene && options.autoAttach !== false) attach(options.scene);
  updatePix();

  return {
    id: 'rain-streaks',
    group,
    rainMesh,
    splashMesh,
    rainUniforms,
    splashUniforms,
    params: state,
    get time() { return clock.time; },
    get scene() { return sceneRef; },
    get counts() {
      return { rain: rainMesh.geometry.instanceCount, splash: splashMesh.geometry.instanceCount,
        rainCapacity: RAIN_COUNT, splashCapacity: SPLASH_COUNT };
    },
    attach,
    detach,
    update,
    setParams: (values) => update(0, values),
    setSize,
    setCamera,
    setRenderer,
    setStage,
    setTime,
    settle,
    dispose
  };
}

/**
 * 原页第 5 节的演示布景（地面噪声贴图、网格、箱体、圆柱、灯光）。
 * 逐字保留其尺寸、材质、阴影与光照参数；仅把散落的 scene.add 收进一个 Group，
 * 便于宿主在正式项目中整体移除。正式接入只需雨系统时可完全不调用本函数。
 */
export function createRainStage() {
  const group = new THREE.Group();
  group.name = 'rain-streaks-stage';
  const resources = [];

  const hemi = new THREE.HemisphereLight(0x4a5a70, 0x0a0d12, 0.6);
  group.add(hemi);

  const sun = new THREE.DirectionalLight(0xffb070, 2.2);
  sun.position.set(-12, 8, -20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0005;
  group.add(sun);

  const fill = new THREE.DirectionalLight(0x5080c0, 0.4);
  fill.position.set(8, 6, 10);
  group.add(fill);

  const sunDir = new THREE.Vector3().copy(sun.position).normalize();
  const sunCol = new THREE.Color(1.0, 0.72, 0.42).multiplyScalar(2.4);
  const ambCol = new THREE.Color(0.10, 0.13, 0.18);

  {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1c20';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 18000; i++) {
      const v = 24 + Math.random() * 36;
      ctx.fillStyle = `rgb(${v},${v + 2},${v + 4})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    tex.anisotropy = 8;
    resources.push(tex);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.15 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    group.add(ground);
    resources.push(ground.geometry, ground.material);

    const grid = new THREE.GridHelper(80, 80, 0x2a2e34, 0x1e2128);
    grid.position.y = 0.003;
    grid.material.transparent = true;
    grid.material.opacity = 0.4;
    group.add(grid);
    resources.push(grid.geometry, grid.material);
  }

  const boxMat1 = new THREE.MeshStandardMaterial({ color: 0x2a3a4a, roughness: 0.7, metalness: 0.3 });
  const boxMat2 = new THREE.MeshStandardMaterial({ color: 0x6a3a2a, roughness: 0.65, metalness: 0.25 });
  const boxMat3 = new THREE.MeshStandardMaterial({ color: 0x3a4a3a, roughness: 0.6, metalness: 0.35 });
  resources.push(boxMat1, boxMat2, boxMat3);

  function addBox(x, z, w, h, d, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, h / 2, z);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(m.geometry),
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })
    );
    edges.position.copy(m.position);
    group.add(edges);
    resources.push(m.geometry, edges.geometry, edges.material);
  }

  addBox(-3, -2, 2, 2, 2, boxMat1);
  addBox(-3, 0.05, 2, 2, 2, boxMat1);
  addBox(3, -3, 1.5, 3, 1.5, boxMat2);
  addBox(-4, 3, 2.5, 1.5, 2.5, boxMat3);
  addBox(4, 2, 1.2, 1.2, 1.2, boxMat1);
  addBox(0, -5, 4, 2.4, 2.2, boxMat2);
  addBox(0, -2.55, 4, 2.4, 2.2, boxMat1);

  for (let i = 0; i < 6; i++) {
    const ang = i / 6 * Math.PI * 2;
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3e, roughness: 0.5, metalness: 0.7 })
    );
    m.position.set(Math.cos(ang) * 9, 2.5, Math.sin(ang) * 9);
    m.castShadow = true;
    group.add(m);
    resources.push(m.geometry, m.material);
  }

  return {
    group,
    sun,
    hemi,
    fill,
    sunDir,
    sunCol,
    ambCol,
    setSunDirection(dir) {
      sunDir.copy(dir);
      sun.position.copy(dir).multiplyScalar(SUN_BASE.distance);
    },
    dispose() {
      group.parent?.remove(group);
      for (const resource of resources) resource.dispose?.();
    }
  };
}
