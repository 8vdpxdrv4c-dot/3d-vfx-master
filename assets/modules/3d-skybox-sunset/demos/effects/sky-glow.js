/**
 * 3d-skybox-sunset · 夕阳天空盒与太阳光晕
 *
 * 提取自用户提供的「几猫3A大作」天空/后期单文件页
 * (extracted-sky-glow-standalone.html, Three.js r180)。
 *
 * 保留的内容（着色器文本逐字复制，见下方 SHADER SOURCES）：
 *   SALTLINE_SKY 天空盒片元/顶点 (Ug / Ng / H6 / V6)：晴空渐变、云层、云隙、
 *   太阳圆盘、Mie 日晕 (aureole)、地平线暖光、云底受光；
 *   后期链 (Js / Og / J6 / K6 / Q6 / eA / tA / nA / iA)：6 级 bloom 降采样、
 *   Karis 平均、横向星芒、镜头污渍、曝光自适应与太阳可见度、镜头光晕 flare、
 *   AgX/ACES 混合调色、分离色调、暗角、FXAA / 锐化 / 颗粒 / 抖动。
 *
 * 有意不纳入的依赖场景深度的通道：AO (Y6)、体积光轴 ($6)、深度降采样 (X6/q6)、
 *   合成 (Z6)、运动模糊 (j6)。它们依赖港区几何、阴影贴图与 reversed-Z 比较，
 *   在通用天空盒特效里无法保证可用。太阳遮挡仍保留：eA 的 12 抽样改为读取
 *   本模块自建 HDR 目标的 DepthTexture（天空深度为 1，物体挡住太阳即衰减 flare）。
 *
 * 相对原页的适配（其余常量、TUNE、着色器文本均不改）：
 *   1. H6 增加 uAureole / uCloudCover / uCloudSpeed / uSunDisk 四个倍率 uniform；
 *   2. 太阳方位、调色板、光强、雾、曝光等收敛到可实时修改的 params；
 *   3. 由宿主提供 renderer / scene / camera，模块提供 create / update / render /
 *      setSize / dispose 生命周期，不创建 canvas、不启动渲染循环、不接管相机；
 *   4. 运行期 Three.js 使用技能包内置的 r160（API 与 r180 一致处直接沿用）。
 *
 * 视觉实现归属原「几猫3A大作」HTML；本文件是提取与接入封装，非原创重写。
 */
import * as THREE from 'three';

/* -------------------------------------------------------------------------- */
/*  SHADER SOURCES — 从 extracted-sky-glow-standalone.html 逐字提取          */
/* -------------------------------------------------------------------------- */

const G6 = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

// 噪声辅助 fbm（原页 Ug）
const Ug = `
uniform sampler2D tNoise;
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return texture2D(tNoise, (i + f + 0.5) / 256.0).r; }
float fbm5(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.3; a *= 0.5; } return s / 0.96875; }
float fbm3(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++){ s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.3; a *= 0.5; } return s / 0.875; }
`;

// 地平线调色（原页 Ng）
const Ng = `
uniform vec3 uSunDir, uZen, uHor, uHorAway, uSunCol;
float skyToSun(vec3 d){ return clamp(dot(normalize(d.xz + vec2(1e-5)), normalize(uSunDir.xz)) * 0.5 + 0.5, 0.0, 1.0); }
vec3 horizonColor(vec3 d){
  float ts = skyToSun(d);
  vec3 c = mix(uHorAway, uHorAway * 1.25 + vec3(0.05, 0.03, 0.02), smoothstep(0.2, 0.75, ts));
  c = mix(c, uHor * vec3(1.9, 1.55, 1.2), pow(ts, 6.0));
  c = mix(c, vec3(1.0, 0.60, 0.24) * 3.4, pow(ts, 34.0));
  return c;
}
`;

// SALTLINE_SKY 片元（原页 H6，仅加入 4 个倍率 uniform）
const H6 = `
// SALTLINE_SKY
precision highp float;
varying vec3 vDir;
uniform float uTime, uEnv, uFlash, uAureole, uCloudCover, uCloudSpeed, uSunDisk;
uniform vec3 uFlashDir;
${Ug}
${Ng}

void main(){
  vec3 d = normalize(vDir);
  float h = max(d.y, 0.0);
  float mu = dot(d, uSunDir);
  float s = max(mu, 0.0);
  float ts = skyToSun(d);

  // ---- clear sky behind / below the deck ----
  vec3 hc = horizonColor(d);
  vec3 midC = mix(vec3(0.15, 0.24, 0.36), vec3(0.72, 0.50, 0.34), pow(ts, 3.0));   // pale band above the fire
  vec3 clearC = mix(hc, midC, smoothstep(0.0, 0.17, h));
  clearC = mix(clearC, vec3(0.085, 0.145, 0.24), smoothstep(0.10, 0.5, h));
  // aureole (mie glow round the sun)
  clearC += uSunCol * vec3(1.0, 0.86, 0.68) * (pow(s, 8.0) * 0.14 + pow(s, 64.0) * 0.55 + pow(s, 600.0) * 2.2 + pow(s, 6000.0) * 14.0) * uAureole;

  // ---- cloud deck ----
  vec2 cuv = d.xz / (h + 0.10) * vec2(0.62, 0.95);          // rolls of cloud run roughly east-west
  vec2 wind = vec2(-0.012, 0.004) * uTime * uCloudSpeed;
  vec2 q = cuv + wind;
  float warp = fbm3(q * 0.45 + 7.1);
  vec2 qq = q + (warp - 0.5) * 1.3;
  float dens = fbm5(qq);
  // rippled underside (ridged detail), fading with distance so the horizon does not alias
  float ridg = 1.0 - abs(2.0 * fbm3(qq * 3.1 + 5.0) - 1.0);
  dens = dens * 0.86 + (ridg - 0.6) * 0.16 * smoothstep(0.03, 0.25, h);
  float big = n2(q * 0.19 + 3.7);
  float body = dens * 0.74 + big * 0.36;
  float cov = smoothstep(0.31, 0.50, body);
  // the deck ends above the eastern horizon: clear, burning gap toward the sun; almost down to the sea elsewhere
  float edge = mix(0.030, 0.285, pow(ts, 1.7));
  float rag = (n2(q * 0.9 + 11.0) - 0.5) * 0.16 + (dens - 0.5) * 0.10;
  float deck = smoothstep(edge - 0.035, edge + 0.11, h + rag * (0.35 + ts));
  cov *= deck;
  // the sun always burns through a ragged hole in the gap, never sits behind solid cloud
  float hole = smoothstep(0.972, 0.9985, mu + (dens - 0.5) * 0.012);
  cov *= 1.0 - 0.93 * hole;
  cov = clamp(cov * uCloudCover, 0.0, 1.0);
  // thin scud drifting in the gap (veils the sun a little, catches fire)
  float scud = smoothstep(0.55, 0.85, fbm3(q * vec2(0.55, 1.9) + 31.0)) * (1.0 - deck) * smoothstep(0.02, 0.10, h) * 0.55 * (1.0 - 0.8 * hole);

  // lighting: density gradient toward the sun = self shadowing of the underside relief
  vec2 sd = normalize(uSunDir.xz);
  float densS = fbm5(qq + sd * 0.22);
  float relief = clamp((dens - densS) * 4.5 + 0.5, 0.0, 1.0);
  float thick = smoothstep(0.40, 0.72, body);
  vec3 cool = mix(vec3(0.155, 0.195, 0.255), vec3(0.030, 0.042, 0.064), thick);       // slate, darker where the deck is thick
  cool *= 0.55 + 0.9 * relief * relief;
  cool += vec3(0.07, 0.10, 0.15) * pow(1.0 - thick, 3.0);                             // thin spots let cold light through
  // warm light raking the underside from the gap: strongest near the sun and near the deck edge
  float nearSun = pow(ts, 5.0) * exp(-max(h - edge, 0.0) * 4.5) * 0.9 + pow(s, 7.0) * 0.9;
  vec3 warm = (uHor * vec3(1.30, 0.66, 0.40)) * nearSun * (0.05 + 2.2 * relief * relief * relief) * 1.15;
  // burning rim where cloud thins at the edge of the gap
  float rim = cov * (1.0 - cov) * 4.0;
  warm += uSunCol * rim * pow(ts, 4.0) * (0.5 + 1.6 * pow(s, 6.0)) * (1.0 - 0.85 * hole);
  vec3 cloudC = cool + warm;
  // sheet lightning inside the deck
  float fl = uFlash * pow(max(dot(d, uFlashDir), 0.0), 5.0);
  cloudC += vec3(0.55, 0.68, 1.0) * fl * (0.4 + 2.2 * dens * dens);
  // aerial perspective: far cloud melts into the horizon colour
  cloudC = mix(cloudC, hc * 0.55 + cloudC * 0.45, exp(-h * 11.0));

  vec3 col = mix(clearC, cloudC, cov * 0.985);
  vec3 scudC = mix(vec3(0.10, 0.11, 0.14), uHor * 1.5, pow(ts, 3.0)) + uSunCol * pow(s, 24.0) * 2.0;
  col = mix(col, scudC, scud);

  // sun disk (not in the environment capture: the directional light is the sun there)
  float veil = (1.0 - cov * 0.92) * (1.0 - scud * 0.7);
  float disk = smoothstep(0.999905, 0.999955, mu);
  col += vec3(1.0, 0.80, 0.52) * disk * 110.0 * veil * (1.0 - uEnv) * uSunDisk;

  // below the horizon: sea haze / ground bounce (mostly hidden by geometry)
  if (d.y < 0.0) {
    float t = clamp(-d.y * 5.0, 0.0, 1.0);
    vec3 low = mix(uHorAway * 0.42, vec3(0.060, 0.064, 0.070), uEnv);
    low += uHor * 0.55 * pow(ts, 6.0) * exp(d.y * 7.0);
    col = mix(hc + uSunCol * pow(s, 48.0) * 1.5, low, smoothstep(0.0, 1.0, t));
  }
  // keep the PMREM free of fireflies
  col = mix(col, min(col, vec3(6.0)), uEnv);
  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}`;

// 天空盒顶点（原页 V6）
const V6 = `
varying vec3 vDir;
void main(){ vDir = position; vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); gl_Position = p.xyww; }`;

// 后期公共函数（原页 Js）
const Js = `
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`;

// 曝光自适应（原页 Og）
const Og = `
uniform sampler2D tAdapt; uniform float uExposure, uKey, uMinE, uMaxE, uAuto;
float slExposure(){ float a = texture2D(tAdapt, vec2(0.5)).r; return uExposure * mix(1.0, clamp(pow(uKey / max(a, 1e-4), 0.85), uMinE, uMaxE), uAuto); }
`;

// bloom 降采样 / Karis（原页 J6）
const J6 = `${Js}
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uFirst;
vec3 s(vec2 o){ return min(max(texture2D(tSrc, vUv + o * uTexel).rgb, vec3(0.0)), vec3(400.0)); }
float kw(vec3 c){ return 1.0 / (1.0 + luma(c) * 0.08); }
void main(){
  vec3 a = s(vec2(-2.0, 2.0)), b = s(vec2(0.0, 2.0)), c = s(vec2(2.0, 2.0));
  vec3 d = s(vec2(-2.0, 0.0)), e = s(vec2(0.0, 0.0)), f = s(vec2(2.0, 0.0));
  vec3 g = s(vec2(-2.0, -2.0)), h = s(vec2(0.0, -2.0)), i = s(vec2(2.0, -2.0));
  vec3 j = s(vec2(-1.0, 1.0)), k = s(vec2(1.0, 1.0)), l = s(vec2(-1.0, -1.0)), m = s(vec2(1.0, -1.0));
  vec3 col;
  if (uFirst > 0.5) {
    // partial Karis average on the first downsample: tames fireflies without killing the sun
    vec3 g0 = (a + b + d + e) * 0.25, g1 = (b + c + e + f) * 0.25, g2 = (d + e + g + h) * 0.25, g3 = (e + f + h + i) * 0.25, g4 = (j + k + l + m) * 0.25;
    float w0 = kw(g0) * 0.125, w1 = kw(g1) * 0.125, w2 = kw(g2) * 0.125, w3 = kw(g3) * 0.125, w4 = kw(g4) * 0.5;
    col = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / (w0 + w1 + w2 + w3 + w4);
  } else {
    col = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  }
  gl_FragColor = vec4(col, 1.0);
}`;

// bloom 升采样（原页 K6）
const K6 = `${Js}
uniform sampler2D tLow, tHigh; uniform vec2 uTexel; uniform float uMix;
void main(){
  vec2 o = uTexel;
  vec3 t = texture2D(tLow, vUv).rgb * 4.0;
  t += (texture2D(tLow, vUv + vec2(o.x, 0.0)).rgb + texture2D(tLow, vUv - vec2(o.x, 0.0)).rgb + texture2D(tLow, vUv + vec2(0.0, o.y)).rgb + texture2D(tLow, vUv - vec2(0.0, o.y)).rgb) * 2.0;
  t += texture2D(tLow, vUv + o).rgb + texture2D(tLow, vUv - o).rgb + texture2D(tLow, vUv + vec2(o.x, -o.y)).rgb + texture2D(tLow, vUv + vec2(-o.x, o.y)).rgb;
  t *= 1.0 / 16.0;
  gl_FragColor = vec4(mix(texture2D(tHigh, vUv).rgb, t, uMix), 1.0);
}`;

// 横向星芒（原页 Q6）
const Q6 = `${Js}
uniform sampler2D tSrc; uniform vec2 uDir; uniform float uThreshold;
${Og}
void main(){
  float thr = uThreshold / max(slExposure(), 0.2);
  vec3 acc = vec3(0.0); float ws = 0.0;
  for (int i = -7; i <= 7; i++) {
    float x = float(i); float w = exp(-x * x / 18.0);
    vec3 c = texture2D(tSrc, vUv + uDir * x).rgb;
    c = max(c - vec3(thr), vec3(0.0));
    acc += c * w; ws += w;
  }
  gl_FragColor = vec4(acc / ws, 1.0);
}`;

// 曝光与太阳可见度（原页 eA）
const eA = `${Js}
uniform sampler2D tPrev, tLum, tDepth; uniform vec2 uSunUv; uniform float uSunOn, uRate, uVisRate, uAspect;
void main(){
  float ls = 0.0, ws = 0.0;
  for (int y = 0; y < 5; y++) for (int x = 0; x < 7; x++) {
    vec2 uv = (vec2(float(x), float(y)) + 0.5) / vec2(7.0, 5.0);
    vec2 c = uv - 0.5;
    float w = 1.0 - 0.75 * smoothstep(0.1, 0.55, length(c));       // centre-weighted metering
    float l = luma(texture2D(tLum, uv).rgb);
    ls += log(max(l, 1e-4)) * w; ws += w;
  }
  float avg = clamp(exp(ls / ws), 0.002, 40.0);
  float vis = 0.0;
  for (int i = 0; i < 12; i++) {
    float r = sqrt((float(i) + 0.5) / 12.0) * 0.011; float th = float(i) * 2.39996323;
    vec2 uv = uSunUv + vec2(cos(th) / uAspect, sin(th)) * r;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) vis += 1.0;
    else vis += step(0.99999, texture2D(tDepth, uv).r);
  }
  vis = vis / 12.0 * uSunOn;
  vec4 prev = texture2D(tPrev, vec2(0.5));
  float a = mix(prev.r, avg, uRate);
  if (!(a > 0.0) || a > 1e4) a = avg;                                 // NaN / first-frame guard
  float v = mix(prev.g, vis, uVisRate);
  if (!(v >= 0.0)) v = vis;
  gl_FragColor = vec4(a, v, 0.0, 1.0);
}`;

// 镜头污渍（原页 tA）
const tA = `${Js}
${Ug}
uniform float uAspect;
void main(){
  vec2 p = vUv * vec2(uAspect, 1.0);
  float acc = 0.0;
  for (int i = 0; i < 70; i++) {
    float fi = float(i);
    vec2 c = vec2(hash12(vec2(fi, 1.7)), hash12(vec2(fi, 9.2))) * vec2(uAspect, 1.0);
    float sz = mix(0.012, 0.085, pow(hash12(vec2(fi, 4.4)), 3.0));
    float r = length(p - c) / sz;
    float disc = smoothstep(1.0, 0.86, r) * (0.35 + 0.65 * smoothstep(0.35, 0.98, r));
    acc += disc * mix(0.15, 0.7, hash12(vec2(fi, 6.1)));
  }
  float smudge = fbm5(vUv * vec2(5.0, 9.0) + 3.0) * fbm3(vUv * 2.3 + 9.0);
  float streaks = pow(n2(vec2(vUv.x * 90.0, vUv.y * 2.0)), 4.0) * 0.25;
  float v = acc * 0.55 + smudge * 0.9 + streaks;
  v *= 0.45 + 0.9 * smoothstep(0.15, 0.75, length(vUv - 0.5));
  gl_FragColor = vec4(vec3(v) * vec3(1.0, 0.96, 0.9), 1.0);
}`;

// flare + AgX/ACES 调色（原页 nA）
const nA = `${Js}
uniform sampler2D tScene, tBloom, tBlur, tStreak, tDirt;
${Og}
uniform vec3 uSunCol;
uniform vec2 uSunUv;
uniform float uTime, uAspect, uBloom, uDirt, uStreak, uFlare, uCA, uVignette;
uniform float uDamage, uLowHealth, uAds, uFlash, uFade, uSaturation, uSunOn, uThunder, uAgxMix;

// ---- AgX (Filament/Blender fit, as in three.js) ----
const mat3 SL_REC2020_TO_SRGB = mat3(vec3(1.6605, -0.1246, -0.0182), vec3(-0.5876, 1.1329, -0.1006), vec3(-0.0728, -0.0083, 1.1187));
const mat3 SL_SRGB_TO_REC2020 = mat3(vec3(0.6274, 0.0691, 0.0164), vec3(0.3293, 0.9195, 0.0880), vec3(0.0433, 0.0113, 0.8956));
vec3 slAgxContrast(vec3 x){ vec3 x2 = x * x; vec3 x4 = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
vec3 slAgx(vec3 color){
  const mat3 inset = mat3(vec3(0.856627153315983, 0.137318972929847, 0.11189821299995), vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903), vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
  const mat3 outset = mat3(vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826), vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294), vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
  const float minEv = -12.47393, maxEv = 4.026069;
  color = inset * (SL_SRGB_TO_REC2020 * color);
  color = clamp((log2(max(color, 1e-10)) - minEv) / (maxEv - minEv), 0.0, 1.0);
  color = slAgxContrast(color);
  // "punchy"-style look: a little more contrast and chroma than the base AgX rendering
  float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = pow(max(color, vec3(0.0)), vec3(LOOK_POWER));
  color = l + (color - l) * LOOK_SAT;
  color = outset * color;
  color = pow(max(color, vec3(0.0)), vec3(2.2));
  return clamp(SL_REC2020_TO_SRGB * color, 0.0, 1.0);
}
vec3 slRRTODT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
vec3 slAces(vec3 c){
  const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  return clamp(outM * slRRTODT(inM * (c * 1.3)), 0.0, 1.0);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }

vec3 flare(vec2 uv, vec2 sun, float vis){
  vec2 asp = vec2(uAspect, 1.0);
  vec2 p = (uv - 0.5) * asp, s = (sun - 0.5) * asp;
  vec2 dv = p - s; float r = length(dv);
  vec3 c = vec3(0.0);
  // veiling glare + a few soft diffraction spikes
  float ang = atan(dv.y, dv.x);
  float spikes = pow(abs(cos(ang * 3.0 + 0.4)), 24.0) + 0.6 * pow(abs(cos(ang * 4.0 - 1.1)), 40.0);
  c += uSunCol * (0.020 / (r * r * 9.0 + 0.010) + 0.10 * exp(-r * 3.2));
  c += uSunCol * spikes * 0.30 * exp(-r * 5.5);
  // ghosts along the sun -> centre axis
  vec3 g = vec3(0.0);
  float k0 = length(p + s * 0.38);  g += vec3(0.30, 0.75, 0.55) * smoothstep(0.085, 0.06, k0) * 0.050;
  float k1 = length(p + s * 0.82);  g += vec3(0.85, 0.45, 0.25) * smoothstep(0.045, 0.030, k1) * 0.075;
  float k2 = length(p + s * 1.35);  g += vec3(0.35, 0.50, 0.95) * smoothstep(0.17, 0.12, k2) * (0.4 + 0.6 * smoothstep(0.05, 0.16, k2)) * 0.040;
  float k3 = length(p - s * 0.45);  g += vec3(0.80, 0.70, 0.35) * smoothstep(0.030, 0.018, k3) * 0.060;
  // halo ring opposite the sun
  float hr = length(p + s * 0.15);
  g += vec3(0.45, 0.55, 0.85) * exp(-pow((hr - 0.52) * 16.0, 2.0)) * 0.035 * smoothstep(0.1, 0.5, length(s));
  c += g * uSunCol * 2.4;
  return c * vis;
}

void main(){
  vec2 c = vUv - 0.5;
  float r2 = dot(c * vec2(uAspect, 1.0), c * vec2(uAspect, 1.0)) / (0.25 * (uAspect * uAspect + 1.0));   // 0 centre .. 1 corner
  vec4 ad = texture2D(tAdapt, vec2(0.5));
  // radial chromatic aberration (tiny; grows a little when hurt)
  vec2 off = c * r2 * (uCA + uDamage * 0.006);
  vec3 col = vec3(texture2D(tScene, vUv + off).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv - off).b);
  // ADS: soften the periphery
  vec3 soft = texture2D(tBlur, vUv).rgb;
  col = mix(col, soft, uAds * 0.75 * smoothstep(0.22, 0.85, r2));
  // bloom (energy conserving mix), lens dirt, anamorphic streak
  vec3 bloom = texture2D(tBloom, vUv).rgb;
  vec3 dirt = texture2D(tDirt, vUv).rgb;
  col = mix(col, bloom, uBloom);
  col += bloom * dirt * uDirt;
  col += texture2D(tStreak, vUv).rgb * vec3(0.45, 0.62, 1.0) * uStreak;
  // sun glare + flare (occlusion-tested)
  float vis = ad.g * uSunOn;
  if (vis > 0.002) { vec3 fl = flare(vUv, uSunUv, vis) * uFlare; col += fl * (1.0 + dirt * 1.5); }
  // exposure: manual * eye adaptation
  col *= slExposure();
  col += vec3(1.0, 0.97, 0.9) * uFlash * 2.5;
  // filmic curve: ACES (Hill fit) for punch and burning oranges, pulled toward AgX so highlights roll off to white
  col = mix(slAces(col), slAgx(col), uAgxMix);

  // ---- grade (display-linear) ----
  float l = luma(col);
  // split tone: teal shadows, warm highlights
  vec3 sh = vec3(0.80, 1.01, 1.13), hi = vec3(1.07, 1.0, 0.90);
  col *= mix(sh, hi, smoothstep(0.03, 0.55, l));
  // gentle S-curve
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.22);
  // lifted, slightly teal blacks
  col = col * 0.988 + vec3(0.006, 0.0085, 0.011);
  // saturation (gameplay driven)
  float sat = uSaturation * (1.0 - 0.65 * uLowHealth) * (1.0 - 0.5 * uDamage);
  l = luma(col);
  col = mix(vec3(l), col, sat);
  // vignette: base + low health + ADS tightening
  float vig = uVignette + uLowHealth * 0.55 + uAds * 0.22;
  float vr = smoothstep(0.15 - uAds * 0.08, 1.05, r2);
  col *= 1.0 - vig * vr * vr * (3.0 - 2.0 * vr) ;
  // damage: red-edged pulse
  float edge = smoothstep(0.18, 1.0, r2);
  col = mix(col, vec3(0.55, 0.02, 0.01) * (0.35 + l), clamp(uDamage * edge * 0.85 + uLowHealth * edge * edge * 0.25 * (0.75 + 0.25 * sin(uTime * 5.0)), 0.0, 1.0));
  col *= 1.0 - uFade;
  col = toSRGB(clamp(col, 0.0, 1.0));
  gl_FragColor = vec4(col, dot(col, vec3(0.299, 0.587, 0.114)));
}`;

// FXAA / 锐化 / 颗粒（原页 iA）
const iA = `${Js}
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uTime, uGrain, uSharpen, uFxaa;
void main(){
  vec4 M = texture2D(tSrc, vUv);
  vec3 col = M.rgb;
  vec4 NW = texture2D(tSrc, vUv + vec2(-1.0, -1.0) * uTexel), NE = texture2D(tSrc, vUv + vec2(1.0, -1.0) * uTexel);
  vec4 SW = texture2D(tSrc, vUv + vec2(-1.0, 1.0) * uTexel), SE = texture2D(tSrc, vUv + vec2(1.0, 1.0) * uTexel);
  float lMin = min(M.a, min(min(NW.a, NE.a), min(SW.a, SE.a)));
  float lMax = max(M.a, max(max(NW.a, NE.a), max(SW.a, SE.a)));
  float contrast = lMax - lMin;
  if (uFxaa > 0.5 && contrast > max(0.0312, lMax * 0.10)) {
    vec2 dir = vec2(-((NW.a + NE.a) - (SW.a + SE.a)), (NW.a + SW.a) - (NE.a + SE.a));
    float dirReduce = max((NW.a + NE.a + SW.a + SE.a) * 0.03125, 0.0078125);
    float rcp = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = clamp(dir * rcp, vec2(-8.0), vec2(8.0)) * uTexel;
    vec4 A = 0.5 * (texture2D(tSrc, vUv + dir * (1.0 / 3.0 - 0.5)) + texture2D(tSrc, vUv + dir * (2.0 / 3.0 - 0.5)));
    vec4 B = A * 0.5 + 0.25 * (texture2D(tSrc, vUv - dir * 0.5) + texture2D(tSrc, vUv + dir * 0.5));
    col = (B.a < lMin || B.a > lMax) ? A.rgb : B.rgb;
  }
  // light unsharp mask, backed off on strong edges (those belong to FXAA)
  vec3 blur = (NW.rgb + NE.rgb + SW.rgb + SE.rgb) * 0.25;
  col += (M.rgb - blur) * uSharpen * (1.0 - smoothstep(0.04, 0.22, contrast));
  // animated, luminance-weighted film grain
  vec2 seed = gl_FragCoord.xy + fract(uTime * vec2(7.31, 3.17)) * vec2(311.7, 173.3);
  float g = hash12(seed) + hash12(seed + 57.3) - 1.0;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col += g * uGrain * mix(1.0, 0.30, smoothstep(0.25, 0.9, l)) * (0.35 + 0.65 * smoothstep(0.0, 0.08, l));
  // dither against banding in the sky gradients
  col += (hash12(gl_FragCoord.xy * 1.37 + 11.0) + hash12(gl_FragCoord.xy * 0.71 + 3.0) - 1.0) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

// 原页 Bg = "// SALTLINE_POST" 标记由 makePass 直接写在片元着色器首行。

/** 原页 g（POST_TUNE）：不在 guiSchema 中暴露的固定后期常量。 */
export const POST_TUNE = Object.freeze({
  bloomMix: 0.62,
  dirt: 0.1,
  streak: 0.03,
  streakThreshold: 2.2,
  key: 0.12,
  minExposure: 0.6,
  maxExposure: 2,
  adaptTau: 1.5,
  ca: 0.0013,
  vignette: 0.3,
  grain: 0.02,
  sharpen: 0.3,
  lookPower: 1.18,
  lookSat: 1.22
});

/**
 * 默认等于原页 Mn / en / g / Jy：
 *   SUN.dir = (0.916, 0.225, 0.331) → 仰角 13°、方位 70°
 *   SUN.color = (1, .72, .42)、intensity = 9
 *   SKY_PALETTE = (.055,.085,.13) / (.95,.55,.28) / (.16,.22,.3)
 * 颜色以 sRGB 十六进制给出，经 THREE.Color 转换回等价的线性值。
 */
export const DEFAULT_PARAMS = Object.freeze({
  sunElevation: 13,
  sunAzimuth: 70,
  sunColor: '#ffddad',
  sunIntensity: 9,
  horizonColor: '#fac391',
  zenithColor: '#425165',
  awayColor: '#708295',
  cloudCover: 1,
  cloudSpeed: 1,
  aureole: 1,
  sunDisk: 1,
  flare: 0.16,
  bloom: 0.065,
  exposure: 1,
  agxMix: 0.25,
  fogDensity: 0.0035
});

/** 原页 Oy()：256² RGBA 噪声纹理，Repeat + Linear + NoColorSpace。 */
function createNoiseTexture() {
  const data = new Uint8Array(262144);
  let seed = 2654435769;
  const rand = () => {
    seed ^= seed << 13; seed >>>= 0;
    seed ^= seed >>> 17;
    seed ^= seed << 5; seed >>>= 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 256 * 256; i++) {
    data[i * 4] = rand() * 256;
    data[i * 4 + 1] = rand() * 256;
    data[i * 4 + 2] = rand() * 256;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, 256, 256, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** 原页 W6(noiseTex)，额外带上四个倍率 uniform。 */
function createSkyUniforms(noiseTexture) {
  return {
    tNoise: { value: noiseTexture },
    uTime: { value: 0 },
    uEnv: { value: 0 },
    uFlash: { value: 0 },
    uFlashDir: { value: new THREE.Vector3(-0.5, 0.5, -0.7).normalize() },
    uSunDir: { value: new THREE.Vector3(0.916, 0.225, 0.331).normalize() },
    uZen: { value: new THREE.Color(0.055, 0.085, 0.13) },
    uHor: { value: new THREE.Color(0.95, 0.55, 0.28) },
    uHorAway: { value: new THREE.Color(0.16, 0.22, 0.3) },
    uSunCol: { value: new THREE.Color(1, 0.72, 0.42) },
    uAureole: { value: 1 },
    uCloudCover: { value: 1 },
    uCloudSpeed: { value: 1 },
    uSunDisk: { value: 1 }
  };
}

/** 原页 Hy(noiseTex)：BackSide 2 m 盒，xyww 顶点，toneMapped:false。 */
function createSky(noiseTexture) {
  const material = new THREE.ShaderMaterial({
    name: 'saltline-sky',
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: false,
    uniforms: createSkyUniforms(noiseTexture),
    vertexShader: V6,
    fragmentShader: H6
  });
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'sky';
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.matrixAutoUpdate = false;
  return { mesh, material, geometry };
}

/** 原页 Hg 的 HDR 目标：HalfFloat RGBA + UnsignedInt 深度纹理。 */
function createHdrTarget(width, height) {
  const depth = new THREE.DepthTexture(width, height);
  depth.type = THREE.UnsignedIntType;
  depth.minFilter = depth.magFilter = THREE.NearestFilter;
  return new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
    stencilBuffer: false,
    depthTexture: depth,
    samples: 0,
    generateMipmaps: false
  });
}

function makeTarget(type, filter, width, height) {
  const rt = new THREE.WebGLRenderTarget(width, height, {
    type,
    format: THREE.RGBAFormat,
    minFilter: filter,
    magFilter: filter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false
  });
  rt.texture.generateMipmaps = false;
  return rt;
}

const DEG = Math.PI / 180;

/**
 * 多实例工厂。宿主拥有 renderer / scene / camera / canvas / 渲染循环。
 * 调用 render(scene, camera) 时本模块是最终输出所有者（渲染到自己创建的 HDR
 * 目标再经后期链输出到屏幕）；不要与其它 postprocess 模块直接串联。
 *
 * @param {object} options
 * @param {THREE.WebGLRenderer} options.renderer 必填，PMREM 需要它
 * @param {THREE.Scene} [options.scene] 传入即自动 attach
 * @param {object} [options.params] 覆盖 DEFAULT_PARAMS
 * @param {boolean} [options.captureEnvironment=true] 是否生成 PMREM 环境贴图
 */
export function createSkyGlowEffect(options = {}) {
  const { renderer, scene: initialScene, params: initialParams = {}, captureEnvironment = true } = options;
  if (!renderer || !renderer.isWebGLRenderer) {
    throw new Error('sky-glow requires ctx.renderer (THREE.WebGLRenderer)');
  }

  const state = { ...DEFAULT_PARAMS, ...initialParams };
  const noiseTexture = createNoiseTexture();
  const sky = createSky(noiseTexture);
  const skyUniforms = sky.material.uniforms;

  const group = new THREE.Group();
  group.name = 'sky-glow-sunset';
  group.add(sky.mesh);

  const sun = new THREE.DirectionalLight(new THREE.Color(1, 0.72, 0.42), 9);
  sun.name = 'sky-glow-sun';
  sun.position.set(0.916, 0.225, 0.331).normalize().multiplyScalar(200);
  sun.target.position.set(0, 0, 0);
  group.add(sun, sun.target);

  let hostScene = null;
  let savedEnvironment = null;
  let savedEnvironmentIntensity = null;
  let savedFog = null;
  let envRT = null;
  let envDirty = true;
  let lastEnvCapture = -1e9;
  let elapsed = 0;
  let cloudTime = 0;
  let frameDt = 0.016;
  let frames = 0;
  let adaptIndex = 0;
  let dirtReady = false;
  let disposed = false;

  /* ---------------- post chain ---------------- */
  const quadGeometry = new THREE.BufferGeometry();
  quadGeometry.setAttribute('position', new THREE.BufferAttribute(
    new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  quadGeometry.setAttribute('uv', new THREE.BufferAttribute(
    new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  const quad = new THREE.Mesh(quadGeometry, null);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  const fsCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const materials = [];

  const makePass = (name, fragment, uniforms, extra = {}) => {
    const material = new THREE.ShaderMaterial({
      name: 'post-' + name,
      vertexShader: G6,
      fragmentShader: `// SALTLINE_POST ${name}\n${fragment}`,
      uniforms,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
      toneMapped: false,
      ...extra
    });
    materials.push(material);
    return material;
  };
  const draw = (material, target) => {
    quad.material = material;
    renderer.setRenderTarget(target);
    renderer.render(quadScene, fsCamera);
  };

  const HALF = THREE.HalfFloatType, BYTE = THREE.UnsignedByteType;
  const LIN = THREE.LinearFilter, NEAR = THREE.NearestFilter;
  const LEVELS = 6;
  const hdr = createHdrTarget(4, 4);
  const ldr = makeTarget(BYTE, LIN, 4, 4);
  const down = Array.from({ length: LEVELS }, () => makeTarget(HALF, LIN, 2, 2));
  const up = Array.from({ length: LEVELS - 1 }, () => makeTarget(HALF, LIN, 2, 2));
  const streakA = makeTarget(HALF, LIN, 2, 2);
  const streakB = makeTarget(HALF, LIN, 2, 2);
  const dirtRT = makeTarget(BYTE, LIN, 512, 288);
  const adaptRT = [makeTarget(HALF, NEAR, 1, 1), makeTarget(HALF, NEAR, 1, 1)];

  // 原页 E：曝光 uniform 在 streak 与 grade 之间共享同一个对象。
  const exposure = {
    tAdapt: { value: adaptRT[0].texture },
    uExposure: { value: 1 },
    uKey: { value: POST_TUNE.key },
    uMinE: { value: POST_TUNE.minExposure },
    uMaxE: { value: POST_TUNE.maxExposure },
    uAuto: { value: 1 }
  };

  const downMat = makePass('down', J6, {
    tSrc: { value: null },
    uTexel: { value: new THREE.Vector2() },
    uFirst: { value: 0 }
  });
  const upMat = makePass('up', K6, {
    tLow: { value: null },
    tHigh: { value: null },
    uTexel: { value: new THREE.Vector2() },
    uMix: { value: POST_TUNE.bloomMix }
  });
  const streakMat = makePass('streak', Q6, {
    tSrc: { value: null },
    uDir: { value: new THREE.Vector2() },
    uThreshold: { value: POST_TUNE.streakThreshold },
    ...exposure
  });
  const adaptMat = makePass('adapt', eA, {
    tPrev: { value: null },
    tLum: { value: null },
    tDepth: { value: hdr.depthTexture },
    uSunUv: { value: new THREE.Vector2(0.5, 0.5) },
    uSunOn: { value: 0 },
    uRate: { value: 1 },
    uVisRate: { value: 1 },
    uAspect: { value: 1 }
  });
  const dirtMat = makePass('dirt', tA, {
    tNoise: { value: noiseTexture },
    uAspect: { value: 16 / 9 }
  });
  const gradeMat = makePass('grade', nA, {
    tScene: { value: hdr.texture },
    tBloom: { value: up[0].texture },
    tBlur: { value: down[1].texture },
    tStreak: { value: streakB.texture },
    tDirt: { value: dirtRT.texture },
    ...exposure,
    uSunCol: { value: new THREE.Color(1, 0.72, 0.42) },
    uSunUv: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uBloom: { value: state.bloom },
    uDirt: { value: POST_TUNE.dirt },
    uStreak: { value: POST_TUNE.streak },
    uFlare: { value: state.flare },
    uCA: { value: POST_TUNE.ca },
    uVignette: { value: POST_TUNE.vignette },
    uDamage: { value: 0 },
    uLowHealth: { value: 0 },
    uAds: { value: 0 },
    uFlash: { value: 0 },
    uFade: { value: 0 },
    uSaturation: { value: 1 },
    uSunOn: { value: 0 },
    uThunder: { value: 0 },
    uAgxMix: { value: state.agxMix }
  }, {
    defines: {
      LOOK_POWER: POST_TUNE.lookPower.toFixed(3),
      LOOK_SAT: POST_TUNE.lookSat.toFixed(3)
    }
  });
  const finalMat = makePass('final', iA, {
    tSrc: { value: ldr.texture },
    uTexel: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uGrain: { value: POST_TUNE.grain },
    uSharpen: { value: POST_TUNE.sharpen },
    uFxaa: { value: 1 }
  });

  let size = { w: 4, h: 4 };

  /** 按宿主 drawing buffer 尺寸重建全部 RT；原页 jy().resize 的半分辨率金字塔。 */
  function setSize(width, height) {
    const w = Math.max(16, Math.round(width));
    const h = Math.max(16, Math.round(height));
    if (size.w === w && size.h === h) return;
    size = { w, h };
    hdr.setSize(w, h);
    const depthImage = hdr.depthTexture.image;
    if (depthImage.width !== w || depthImage.height !== h) {
      depthImage.width = w; depthImage.height = h;
      hdr.depthTexture.needsUpdate = true;
    }
    ldr.setSize(w, h);
    let hw = Math.max(2, Math.ceil(w / 2));
    let hh = Math.max(2, Math.ceil(h / 2));
    for (let i = 0; i < LEVELS; i++) {
      down[i].setSize(hw, hh);
      if (i < LEVELS - 1) up[i].setSize(hw, hh);
      hw = Math.max(2, hw >> 1);
      hh = Math.max(2, hh >> 1);
    }
    streakA.setSize(down[2].width, down[2].height);
    streakB.setSize(down[2].width, down[2].height);
    finalMat.uniforms.uTexel.value.set(1 / w, 1 / h);
    dirtMat.uniforms.uAspect.value = w / h;
    dirtReady = false;
  }

  /** 原页 Vy()：以 uEnv=1 克隆天空（去掉太阳圆盘、抑制萤火虫）捕获 PMREM。 */
  function refreshEnvironment(force = false) {
    if (!captureEnvironment || disposed) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!force && (!envDirty || now - lastEnvCapture < 300)) return;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMaterial = sky.material.clone();
    envMaterial.uniforms.tNoise.value = noiseTexture;
    envMaterial.uniforms.uEnv.value = 1;
    envMaterial.uniforms.uSunDir.value.copy(skyUniforms.uSunDir.value);
    envMaterial.uniforms.uSunCol.value.copy(skyUniforms.uSunCol.value);
    envMaterial.uniforms.uZen.value.copy(skyUniforms.uZen.value);
    envMaterial.uniforms.uHor.value.copy(skyUniforms.uHor.value);
    envMaterial.uniforms.uHorAway.value.copy(skyUniforms.uHorAway.value);
    envMaterial.uniforms.uTime.value = skyUniforms.uTime.value;
    const envScene = new THREE.Scene();
    const envMesh = new THREE.Mesh(sky.geometry, envMaterial);
    envMesh.frustumCulled = false;
    envScene.add(envMesh);
    let captured = null;
    try {
      captured = pmrem.fromScene(envScene, 0, 0.1, 100);
    } finally {
      envMaterial.dispose();
      pmrem.dispose();
    }
    if (!captured) return;
    if (envRT) envRT.dispose();
    envRT = captured;
    if (hostScene) hostScene.environment = envRT.texture;
    envDirty = false;
    lastEnvCapture = now;
  }

  /** 把 params 写入天空、灯光、雾与后期 uniform；不推进时间。 */
  function applyState() {
    const el = Math.max(-5, Math.min(80, state.sunElevation)) * DEG;
    const az = state.sunAzimuth * DEG;
    const dir = new THREE.Vector3(
      Math.sin(az) * Math.cos(el),
      Math.sin(el),
      Math.cos(az) * Math.cos(el)
    ).normalize();
    if (dir.distanceToSquared(skyUniforms.uSunDir.value) > 1e-8) envDirty = true;
    skyUniforms.uSunDir.value.copy(dir);
    skyUniforms.uSunCol.value.set(state.sunColor);
    skyUniforms.uZen.value.set(state.zenithColor);
    skyUniforms.uHor.value.set(state.horizonColor);
    skyUniforms.uHorAway.value.set(state.awayColor);
    skyUniforms.uAureole.value = state.aureole;
    skyUniforms.uCloudCover.value = state.cloudCover;
    skyUniforms.uCloudSpeed.value = 1;
    skyUniforms.uSunDisk.value = state.sunDisk;
    skyUniforms.uTime.value = cloudTime;

    sun.color.copy(skyUniforms.uSunCol.value);
    sun.intensity = state.sunIntensity;
    sun.position.copy(dir).multiplyScalar(200);

    gradeMat.uniforms.uSunCol.value.copy(skyUniforms.uSunCol.value);
    gradeMat.uniforms.uFlare.value = state.flare;
    gradeMat.uniforms.uBloom.value = state.bloom;
    gradeMat.uniforms.uAgxMix.value = state.agxMix;
    gradeMat.uniforms.uVignette.value = POST_TUNE.vignette;
    exposure.uExposure.value = state.exposure;

    if (hostScene && hostScene.fog && hostScene.fog.isFogExp2) {
      hostScene.fog.density = Math.max(0, state.fogDensity);
      hostScene.fog.color.copy(skyUniforms.uHorAway.value)
        .lerp(skyUniforms.uHor.value, 0.25);
    }
  }

  /** 追加时间并更新参数。dt 为增量秒数；参数可只传变化项。 */
  function update(dt = 0, params = {}) {
    Object.assign(state, params);
    const step = Math.max(0, Math.min(0.1, dt || 0));
    frameDt = step || 0.016;
    elapsed += step;
    cloudTime += step * state.cloudSpeed;
    applyState();
  }

  function attach(targetScene) {
    if (!targetScene || !targetScene.isScene) throw new Error('sky-glow.attach requires a THREE.Scene');
    if (hostScene === targetScene) return;
    detach();
    hostScene = targetScene;
    savedEnvironment = targetScene.environment;
    savedFog = targetScene.fog;
    savedEnvironmentIntensity = Object.prototype.hasOwnProperty.call(targetScene, 'environmentIntensity')
      ? targetScene.environmentIntensity : undefined;
    targetScene.add(group);
    targetScene.fog = new THREE.FogExp2(0x708295, Math.max(0, state.fogDensity));
    if (envRT) targetScene.environment = envRT.texture;
    applyState();
    refreshEnvironment(true);
  }

  function detach() {
    if (!hostScene) return;
    hostScene.remove(group);
    hostScene.environment = savedEnvironment;
    hostScene.fog = savedFog;
    if (savedEnvironmentIntensity !== undefined) hostScene.environmentIntensity = savedEnvironmentIntensity;
    hostScene = null;
    savedEnvironment = savedFog = savedEnvironmentIntensity = null;
  }

  /**
   * 最终输出所有者：场景 → HDR → bloom/星芒/污渍 → 曝光 → flare → AgX/ACES 调色 → 屏幕。
   * 每次调用保存并恢复宿主的 renderer 状态，不留下全局副作用。
   */
  function render(targetScene = hostScene, camera) {
    if (!camera || !camera.isCamera) throw new Error('sky-glow.render requires a camera');
    if (!targetScene || !targetScene.isScene) throw new Error('sky-glow.render requires a scene');
    if (disposed) return;
    applyState();
    refreshEnvironment();

    const prevTarget = renderer.getRenderTarget();
    const prevAutoClear = renderer.autoClear;
    const prevToneMapping = renderer.toneMapping;
    const prevToneExposure = renderer.toneMappingExposure;
    const prevOutput = renderer.outputColorSpace;
    const prevClear = renderer.getClearColor(new THREE.Color()).clone();
    const prevAlpha = renderer.getClearAlpha();
    try {
      renderer.autoClear = false;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0, 1);

      renderer.setRenderTarget(hdr);
      renderer.clear(true, true, false);
      renderer.render(targetScene, camera);

      const { w, h } = size;
      const aspect = w / h;
      if (!dirtReady) {
        dirtMat.uniforms.uAspect.value = aspect;
        draw(dirtMat, dirtRT);
        dirtReady = true;
      }

      // 原页 jy().run 的 bloom 金字塔：6 次降采样 + 5 次升采样。
      let src = hdr.texture, sw = w, sh = h;
      if (state.bloom > 0) {
        for (let i = 0; i < LEVELS; i++) {
          downMat.uniforms.tSrc.value = src;
          downMat.uniforms.uTexel.value.set(1 / sw, 1 / sh);
          downMat.uniforms.uFirst.value = i === 0 ? 1 : 0;
          draw(downMat, down[i]);
          src = down[i].texture; sw = down[i].width; sh = down[i].height;
        }
        let low = down[LEVELS - 1];
        for (let i = LEVELS - 2; i >= 0; i--) {
          upMat.uniforms.tLow.value = low.texture;
          upMat.uniforms.tHigh.value = down[i].texture;
          upMat.uniforms.uTexel.value.set(1 / low.width, 1 / low.height);
          draw(upMat, up[i]);
          low = up[i];
        }
        const sx = 1 / streakA.width;
        streakMat.uniforms.tSrc.value = down[2].texture;
        streakMat.uniforms.uDir.value.set(sx * 1.5, 0);
        streakMat.uniforms.uThreshold.value = POST_TUNE.streakThreshold;
        draw(streakMat, streakA);
        streakMat.uniforms.tSrc.value = streakA.texture;
        streakMat.uniforms.uDir.value.set(sx * 5, 0);
        streakMat.uniforms.uThreshold.value = 0;
        draw(streakMat, streakB);
      }

      // 原页 run() 中 ne.copy(Mn.dir).multiplyScalar(500)...project(fe) 一段。
      const sunPoint = new THREE.Vector3().copy(skyUniforms.uSunDir.value)
        .multiplyScalar(500)
        .add(new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld))
        .project(camera);
      const forward = camera.getWorldDirection(new THREE.Vector3());
      const facing = forward.dot(skyUniforms.uSunDir.value) > 0.05;
      const edge = Math.max(Math.abs(sunPoint.x), Math.abs(sunPoint.y));
      const sunOn = facing ? 1 - Math.min(1, Math.max(0, (edge - 1) / 0.3)) : 0;
      const sunUv = new THREE.Vector2(sunPoint.x * 0.5 + 0.5, sunPoint.y * 0.5 + 0.5);

      // 曝光自适应 / 太阳 12 抽样可见度（深度纹理由本模块的 HDR 目标提供）。
      exposure.tAdapt.value = adaptRT[adaptIndex].texture;
      const adaptUniforms = adaptMat.uniforms;
      adaptUniforms.tPrev.value = adaptRT[adaptIndex].texture;
      adaptUniforms.tLum.value = state.bloom > 0 ? down[LEVELS - 1].texture : hdr.texture;
      adaptUniforms.tDepth.value = hdr.depthTexture;
      adaptUniforms.uSunUv.value.copy(sunUv);
      adaptUniforms.uSunOn.value = sunOn;
      adaptUniforms.uAspect.value = aspect;
      const warmup = frames < 3;
      adaptUniforms.uRate.value = warmup ? 1 : 1 - Math.exp(-frameDt / POST_TUNE.adaptTau);
      adaptUniforms.uVisRate.value = warmup ? 1 : 1 - Math.exp(-frameDt / 0.12);
      draw(adaptMat, adaptRT[1 - adaptIndex]);
      adaptIndex = 1 - adaptIndex;
      frames++;
      exposure.tAdapt.value = adaptRT[adaptIndex].texture;

      const g = gradeMat.uniforms;
      g.tScene.value = hdr.texture;
      g.uSunUv.value.copy(sunUv);
      g.uSunOn.value = sunOn;
      g.uAspect.value = aspect;
      g.uTime.value = elapsed;
      g.uBloom.value = state.bloom;
      g.uDirt.value = state.bloom > 0 ? POST_TUNE.dirt : 0;
      g.uStreak.value = state.bloom > 0 ? POST_TUNE.streak : 0;
      g.uFlare.value = state.flare;
      draw(gradeMat, ldr);

      finalMat.uniforms.uTexel.value.set(1 / w, 1 / h);
      finalMat.uniforms.uTime.value = elapsed;
      draw(finalMat, null);
    } finally {
      renderer.setRenderTarget(prevTarget);
      renderer.autoClear = prevAutoClear;
      renderer.toneMapping = prevToneMapping;
      renderer.toneMappingExposure = prevToneExposure;
      renderer.outputColorSpace = prevOutput;
      renderer.setClearColor(prevClear, prevAlpha);
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    detach();
    for (const material of materials) material.dispose();
    for (const rt of [hdr, ldr, streakA, streakB, dirtRT, ...down, ...up, ...adaptRT]) rt.dispose();
    if (envRT) envRT.dispose();
    quadGeometry.dispose();
    sky.geometry.dispose();
    sky.material.dispose();
    noiseTexture.dispose();
    envRT = null;
  }

  if (initialScene) attach(initialScene);

  return {
    id: 'skybox-sunset',
    group,
    skyMesh: sky.mesh,
    sun,
    noiseTexture,
    uniforms: skyUniforms,
    params: state,
    postTune: POST_TUNE,
    get environment() { return envRT ? envRT.texture : null; },
    get size() { return { ...size }; },
    attach,
    detach,
    update,
    setParams: (values) => update(0, values),
    setSize,
    refreshEnvironment,
    render,
    dispose
  };
}
