/**
 * GPU 体积火焰 —— 移植自 three.js 官方示例 webgpu_volume_fire。
 *
 * 来源：https://threejs.org/examples/webgpu_volume_fire.html
 *      （examples/webgpu_volume_fire.html，three.js r188dev）
 *
 * 保留内容（逐字）：100×100×200 三维网格的 GPU 流体求解
 * （半拉格朗日平流 + curlNoise 湍流 + buoyancy + Jacobi 压力投影）、
 * VolumeNodeMaterial 体积光线步进散射 / 自发光着色器、Beer-Lambert 自阴影、
 * Henyey-Greenstein 相位函数、粉状效应、多层散射近似、体积投射阴影、
 * 火焰黑体色带、点光源体积/表面双分支着色、拖拽茶壶注入湍流。
 *
 * 适配内容（仅封装层）：
 * - 把全局句柄收进实例，支持多次创建与彻底释放；
 * - 参数从 GUI 直写改为 applyParams() 映射到已有 uniform / material / pass；
 * - 体积分辨率、压力迭代次数作为构造选项（降级路径）；
 * - 无 WebGPU 时返回 null，由调用方决定降级，不做假 WebGL 替身。
 *
 * 不做的事：不改写任何 compute kernel 或体积着色算法，不新增渲染通道。
 */

import * as THREE from '../vendor/three.webgpu.js';
import {
	vec3, vec4, uvec3, float, Fn, uniform, renderGroup,
	texture3D, textureStore, instanceIndex,
	screenCoordinate, pass,
	smoothstep, mix, min, max, floor,
	mx_noise_float, storage, storageTexture, If, cameraPosition, hue,
	Loop, positionWorld, positionLocal,
	interleavedGradientNoise, frameId, fract,
	saturation, cos, sin, atan
} from '../vendor/three.tsl.js';

import { snoise, snoiseVec3 } from '../vendor/addons/tsl/math/curlNoise.js';
import { ImprovedNoise } from '../vendor/addons/math/ImprovedNoise.js';
import { gaussianBlur } from '../vendor/addons/tsl/display/GaussianBlurNode.js';
import { bloom } from '../vendor/addons/tsl/display/BloomNode.js';
import { OrbitControls } from '../vendor/addons/controls/OrbitControls.js';
import { DragControls } from '../vendor/addons/controls/DragControls.js';
import { TeapotGeometry } from '../vendor/addons/geometries/TeapotGeometry.js';

/** 官方示例默认值，逐字对应示例里的 GUI 初始 params。 */
export const DEFAULT_PARAMS = Object.freeze({
	resolution: 1.0,
	denoise: true,
	simulate: true,
	simSpeed: 1.2,
	smokeLifespan: 3.5,
	fireLifespan: 1.3,
	turbulence: 3.2,
	fireStartColor: '#ffe68c',
	fireMidColor: '#ff7305',
	fireEndColor: '#ff0000',
	fireHue: 0,
	exposure: 2.0,
	bloom: true,
	bloomStrength: 0.1,
	bloomRadius: 1.0,
	bloomThreshold: 0.5,
	raymarchSteps: 16,
	denoiseStrength: 0.5,
	saturation: 1.1,
	glowSpread: 5.0,
	fireIntensity: 40.0,
	emitTemperature: 5.5,
	emitDensity: 7.0,
	motionBoost: 0.25,
	windStrength: 6.5,
	teapotEmissive: 0.2,
	phaseAsymmetry: 0.0,
	powderStrength: 0.59,
	multiScattering: 1.0,
	shadowAbsorption: 2.0,
	shadowAmbient: 0.5,
	buoyancy: 3.0,
	velocityDamping: 0.25,
	turbulenceDecay: 0.1,
	turbulenceFrequency: 10.0,
	keyLightIntensity: 1000,
	lightSmoke: 2.0,
	lightNearScale: 10.0,
	lightFarScale: 15.0,
	lightReflection: 10.0,
	projLightRadius: 20.0,
	projLightFreq: 0.2,
	projNoiseFade: 17.0,
	projCenterFade: 3.25,
	animateEmitter: true,
	volumeWidth: 0.4
});

const LAYER_VOLUMETRIC_LIGHTING = 10;

/** 检测当前环境是否具备 WebGPU 适配器。 */
export async function probeWebGPU() {
	if (typeof navigator === 'undefined' || !navigator.gpu) {
		return { available: false, reason: 'navigator.gpu 不存在（浏览器不支持 WebGPU，或页面不是 https / localhost 安全上下文）' };
	}
	try {
		const adapter = await navigator.gpu.requestAdapter();
		if (!adapter) return { available: false, reason: '未获取到 GPU 适配器（显卡或驱动不在允许列表）' };
		return { available: true, reason: '', vendor: adapter.info ? adapter.info.vendor : '(unknown)' };
	} catch (e) {
		return { available: false, reason: '请求适配器失败：' + (e && e.message ? e.message : String(e)) };
	}
}

/**
 * 创建体积火焰实例。
 *
 * @param {object} options
 * @param {number} [options.gridX=100] 模拟网格 X（官方 100）
 * @param {number} [options.gridY=100] 模拟网格 Y（官方 100）
 * @param {number} [options.gridZ=200] 模拟网格 Z（官方 200）
 * @param {number} [options.pressureIterations=2] Jacobi 迭代次数，必须为偶数（官方示例降级值 2）
 * @param {object} [options.params] 覆盖 DEFAULT_PARAMS
 * @returns {object|null} 实例；无 WebGPU 时返回 null
 */
export function createVolumeFire(options = {}) {
	const GRID_SIZE_X = options.gridX ?? 100;
	const GRID_SIZE_Y = options.gridY ?? 100;
	const GRID_SIZE_Z = options.gridZ ?? 200;
	const CELL_COUNT = GRID_SIZE_X * GRID_SIZE_Y * GRID_SIZE_Z;
	const PRESSURE_ITERATIONS = options.pressureIterations ?? 2; // Jacobi iterations (keep even!) // default 6
	const VOLUME_WORLD_SIZE_X = 12;
	const VOLUME_WORLD_SIZE_Y = 12;
	const VOLUME_WORLD_SIZE_Z = 24;
	const VOLUME_WORLD_SIZE = new THREE.Vector3( VOLUME_WORLD_SIZE_X, VOLUME_WORLD_SIZE_Y, VOLUME_WORLD_SIZE_Z );
	const VOLUME_WORLD_SIZE_DIAGONAL = Math.sqrt( VOLUME_WORLD_SIZE_X ** 2 + VOLUME_WORLD_SIZE_Y ** 2 + VOLUME_WORLD_SIZE_Z ** 2 );
	const uVolumeWorldSize = uniform( VOLUME_WORLD_SIZE.clone() );
	const TEXEL_X = 1 / GRID_SIZE_X;
	const TEXEL_Y = 1 / GRID_SIZE_Y;
	const TEXEL_Z = 1 / GRID_SIZE_Z;

	const state = { ...DEFAULT_PARAMS, ...( options.params || {} ) };

	let renderer, scene, camera, controls, dragControls;
	let volumetricMesh, volumetricShadowMesh, floorPlane, teapot, keyLight, pointLight;
	let renderPipeline, denoiseStrength, uSaturation, uKeyLightPos;
	let bloomPass = null;
	let scenePass, volumetricPass, blurredVolumetricPass, volumetricMaterial, shadowMaterial;

	let teapotVerticesBuffer, vertexCount, teapotGeometry, teapotMinY;
	const prevTeapotPos = new THREE.Vector3();

	// sim textures
	let velTexA, velTexB, dyeTexA, dyeTexB, divTex, pressTexA, pressTexB;
	let dyeTexNode, dyeTexWriteNode, curlNoiseTex, curlNoiseTexNode;

	// compute passes
	let advectVelocityPass, divergencePass, jacobiPassAB, jacobiPassBA, projectPass, advectDyePass, emitTeapotPass, computeCurlNoisePass;

	// sim uniforms
	const uDt = uniform( 0.016 );
	const uTime = uniform( 0 ).setGroup( renderGroup );
	const uBuoyancy = uniform( 3.0 );
	const uWeight = uniform( 0.15 );
	const uTurbulence = uniform( 3.2 );
	const uTurbulenceDecay = uniform( 0.1 );
	const uTurbFrequency = uniform( 10.0 );
	const uVelDamping = uniform( 0.25 );
	const uCooling = uniform( 1.0 );
	const uDissipation = uniform( 0.4 );
	const uEmitDensity = uniform( 7.0 ).setGroup( renderGroup );
	const uEmitTemperature = uniform( 5.5 ).setGroup( renderGroup );
	const uTeapotMatrix = uniform( new THREE.Matrix4() );
	const uTeapotSpeed = uniform( 0.0 );
	const uMotionBoost = uniform( 0.25 );
	const uTeapotVelocity = uniform( new THREE.Vector3() );
	const uWindStrength = uniform( 6.5 );
	const uTeapotPosition = uniform( new THREE.Vector3() ).setGroup( renderGroup );

	// render uniforms
	const uFireIntensity = uniform( 40.0 ).setGroup( renderGroup );
	const uTeapotEmissiveIntensity = uniform( 0.2 );
	const uFireGlowSpread = uniform( 5.0 );
	const uShadowAbsorption = uniform( 2.0 );
	const uShadowAmbient = uniform( 0.5 );
	const uFireStartColor = uniform( new THREE.Color( 0xffe68c ) ).setGroup( renderGroup );
	const uFireMidColor = uniform( new THREE.Color( 0xff7305 ) ).setGroup( renderGroup );
	const uFireEndColor = uniform( new THREE.Color( 0xff0000 ) ).setGroup( renderGroup );
	const uFireHue = uniform( 0.0 ).setGroup( renderGroup );
	const uAsymmetry = uniform( 0.0 );
	const uPowderStrength = uniform( 0.59 );
	const uMultiScattering = uniform( 1.0 );
	const uPointLightVolumeIntensity = uniform( 2.0 ).setGroup( renderGroup );
	const uPointLightSurfaceIntensity = uniform( 10.0 ).setGroup( renderGroup );
	const uLightNearIntensity = uniform( 10.0 ).setGroup( renderGroup );
	const uLightFarIntensity = uniform( 15.0 ).setGroup( renderGroup );
	const uLightFarDistance = uniform( 10.0 ).setGroup( renderGroup );
	const uPointLightProjectionRadius = uniform( 20.0 ).setGroup( renderGroup );
	const uPointLightProjectionFrequency = uniform( 0.2 ).setGroup( renderGroup );
	const uPointLightProjectionNoiseFade = uniform( 17.0 ).setGroup( renderGroup );
	const uPointLightProjectionCenterFade = uniform( 3.25 ).setGroup( renderGroup );

	const uFlameHeight = uniform( 3.5 ).setGroup( renderGroup );
	const uSway = uniform( new THREE.Vector3() ).setGroup( renderGroup );
	const uFlicker = uniform( 1.0 ).setGroup( renderGroup );
	const uColorNoise = uniform( 0.0 ).setGroup( renderGroup );
	const cpuNoise = new ImprovedNoise();

	let simulationTime = 0;
	let lastTime = 0;
	let simAccumulator = 0;
	let disposed = false;
	let postSignature = '';

	// ---------------------------------------------------------------
	// TSL helpers shared by the compute kernels
	// ---------------------------------------------------------------

	const getVoxelCoord = ( id ) => {

		const x = id.mod( GRID_SIZE_X );
		const y = id.div( GRID_SIZE_X ).mod( GRID_SIZE_Y );
		const z = id.div( GRID_SIZE_X * GRID_SIZE_Y );

		return uvec3( x, y, z );

	};

	const coordToUVW = ( coord ) => vec3( coord ).add( 0.5 ).div( vec3( GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z ) );

	function createStorage3D( name ) {

		const texture = new THREE.Storage3DTexture( GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z );
		texture.name = name;
		texture.format = THREE.RGBAFormat;
		texture.type = THREE.HalfFloatType;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		texture.wrapR = THREE.ClampToEdgeWrapping;

		return texture;

	}

	// ---------------------------------------------------------------
	// Fluid simulation - compute kernels（逐字保留官方实现）
	// ---------------------------------------------------------------

	function createComputePasses() {

		computeCurlNoisePass = Fn( () => {

			const coord = getVoxelCoord( instanceIndex );
			const uvw = coordToUVW( coord );

			const freq = uTurbFrequency;
			const e = float( 0.1 ).div( freq );
			const dx = vec3( e, 0.0, 0.0 );
			const dy = vec3( 0.0, e, 0.0 );
			const dz = vec3( 0.0, 0.0, e );

			const p = uvw.mul( vec3( VOLUME_WORLD_SIZE_X / VOLUME_WORLD_SIZE_Y, 1.0, VOLUME_WORLD_SIZE_Z / VOLUME_WORLD_SIZE_Y ) );
			const p_x0 = snoiseVec3( p.sub( dx ).mul( freq ) );
			const p_x1 = snoiseVec3( p.add( dx ).mul( freq ) );
			const p_y0 = snoiseVec3( p.sub( dy ).mul( freq ) );
			const p_y1 = snoiseVec3( p.add( dy ).mul( freq ) );
			const p_z0 = snoiseVec3( p.sub( dz ).mul( freq ) );
			const p_z1 = snoiseVec3( p.add( dz ).mul( freq ) );

			const x = p_y1.z.sub( p_y0.z ).sub( p_z1.y ).add( p_z0.y );
			const y = p_z1.x.sub( p_z0.x ).sub( p_x1.z ).add( p_x0.z );
			const z = p_x1.y.sub( p_x0.y ).sub( p_y1.x ).add( p_y0.x );

			const noiseVal = vec3( x, y, z ).mul( 5.0 );

			textureStore( curlNoiseTex, coord, vec4( noiseVal, 0.0 ) ).toWriteOnly();

		} )().compute( CELL_COUNT ).setName( 'computeCurlNoise' );

		advectVelocityPass = Fn( () => {

			const coord = getVoxelCoord( instanceIndex );
			const uvw = coordToUVW( coord );

			const vel = texture3D( velTexA, uvw, 0 ).xyz;

			const velUVW = vel.div( uVolumeWorldSize );
			const prevPos = uvw.sub( velUVW.mul( uDt ) );
			const newVel = texture3D( velTexA, prevPos, 0 ).xyz.toVar();

			const dye = dyeTexNode.sample( uvw ).level( 0 );
			const density = dye.r;
			const temperature = dye.g;
			const age = dye.b;

			const buoyancyForce = temperature.mul( uBuoyancy ).sub( density.mul( uWeight ) ).mul( VOLUME_WORLD_SIZE_Y );
			newVel.addAssign( vec3( 0, buoyancyForce, 0 ).mul( uDt ) );

			const thermalNoisePos = uvw.add( vec3( 0, age.negate().mul( 0.6 ), age.mul( 0.13 ) ).div( uTurbFrequency ) );
			const decay = age.mul( uTurbulenceDecay.negate() ).exp();
			const thermalTurbulence = curlNoiseTexNode.sample( thermalNoisePos ).level( 0 ).xyz.mul( uTurbulence ).mul( temperature ).mul( decay );

			const ambientNoisePos = uvw.mul( 0.5 ).add( vec3( 0, uTime.mul( 0.25 ), uTime.mul( 0.06 ) ).div( uTurbFrequency ) );
			const ambientTurbulence = curlNoiseTexNode.sample( ambientNoisePos ).level( 0 ).xyz.mul( uTurbulence.mul( 0.2 ) ).mul( density );

			const turbulence = thermalTurbulence.add( ambientTurbulence ).mul( VOLUME_WORLD_SIZE_Y );
			newVel.addAssign( turbulence.mul( uDt ) );

			newVel.mulAssign( max( float( 1 ).sub( uVelDamping.mul( uDt ) ), 0 ) );

			const worldPos = uvw.sub( 0.5 ).mul( uVolumeWorldSize ).add( vec3( 0, VOLUME_WORLD_SIZE_Y / 2, 0 ) );
			const dist = worldPos.distance( uTeapotPosition );
			const teapotRadius = float( 1.0 );

			If( dist.lessThan( teapotRadius ), () => {

				const ratio = dist.div( teapotRadius );
				const falloff = smoothstep( 0.0, 1.0, float( 1.0 ).sub( ratio ) );

				const windNoisePos = uvw.add( vec3( 0.0, uTime.mul( 0.5 ), 0.0 ).div( uTurbFrequency ) );
				const windTurbulence = curlNoiseTexNode.sample( windNoisePos ).level( 0 ).xyz.mul( uTurbulence ).mul( uTeapotSpeed );

				const windVel = uTeapotVelocity.mul( uWindStrength ).add( windTurbulence ).mul( uDt ).mul( falloff );

				newVel.addAssign( windVel );

			} );

			const edge = min( uvw, vec3( 1 ).sub( uvw ) );
			const boundary = smoothstep( 0.0, 0.08, min( edge.x, min( edge.y, edge.z ) ) );
			newVel.mulAssign( boundary );

			textureStore( velTexB, coord, vec4( newVel, 0 ) ).toWriteOnly();

		} )().compute( CELL_COUNT ).setName( 'advectVelocity' );

		divergencePass = Fn( () => {

			const coord = getVoxelCoord( instanceIndex );
			const uvw = coordToUVW( coord );

			const vR = texture3D( velTexB, uvw.add( vec3( TEXEL_X, 0, 0 ) ), 0 ).x;
			const vL = texture3D( velTexB, uvw.sub( vec3( TEXEL_X, 0, 0 ) ), 0 ).x;
			const vU = texture3D( velTexB, uvw.add( vec3( 0, TEXEL_Y, 0 ) ), 0 ).y;
			const vD = texture3D( velTexB, uvw.sub( vec3( 0, TEXEL_Y, 0 ) ), 0 ).y;
			const vF = texture3D( velTexB, uvw.add( vec3( 0, 0, TEXEL_Z ) ), 0 ).z;
			const vB = texture3D( velTexB, uvw.sub( vec3( 0, 0, TEXEL_Z ) ), 0 ).z;

			const divergence = vR.sub( vL ).add( vU.sub( vD ) ).add( vF.sub( vB ) ).mul( 0.5 );

			textureStore( divTex, coord, vec4( divergence, 0, 0, 0 ) ).toWriteOnly();

		} )().compute( CELL_COUNT ).setName( 'divergence' );

		const jacobi = ( pressRead, pressWrite, name ) => Fn( () => {

			const coord = getVoxelCoord( instanceIndex );
			const uvw = coordToUVW( coord );

			const pR = texture3D( pressRead, uvw.add( vec3( TEXEL_X, 0, 0 ) ), 0 ).x;
			const pL = texture3D( pressRead, uvw.sub( vec3( TEXEL_X, 0, 0 ) ), 0 ).x;
			const pU = texture3D( pressRead, uvw.add( vec3( 0, TEXEL_Y, 0 ) ), 0 ).x;
			const pD = texture3D( pressRead, uvw.sub( vec3( 0, TEXEL_Y, 0 ) ), 0 ).x;
			const pF = texture3D( pressRead, uvw.add( vec3( 0, 0, TEXEL_Z ) ), 0 ).x;
			const pB = texture3D( pressRead, uvw.sub( vec3( 0, 0, TEXEL_Z ) ), 0 ).x;

			const divergence = texture3D( divTex, uvw, 0 ).x;

			const pressure = pR.add( pL ).add( pU ).add( pD ).add( pF ).add( pB ).sub( divergence ).div( 6 );

			textureStore( pressWrite, coord, vec4( pressure, 0, 0, 0 ) ).toWriteOnly();

		} )().compute( CELL_COUNT ).setName( name );

		jacobiPassAB = jacobi( pressTexA, pressTexB, 'jacobiAB' );
		jacobiPassBA = jacobi( pressTexB, pressTexA, 'jacobiBA' );

		projectPass = Fn( () => {

			const coord = getVoxelCoord( instanceIndex );
			const uvw = coordToUVW( coord );

			const pR = texture3D( pressTexA, uvw.add( vec3( TEXEL_X, 0, 0 ) ), 0 ).x;
			const pL = texture3D( pressTexA, uvw.sub( vec3( TEXEL_X, 0, 0 ) ), 0 ).x;
			const pU = texture3D( pressTexA, uvw.add( vec3( 0, TEXEL_Y, 0 ) ), 0 ).x;
			const pD = texture3D( pressTexA, uvw.sub( vec3( 0, TEXEL_Y, 0 ) ), 0 ).x;
			const pF = texture3D( pressTexA, uvw.add( vec3( 0, 0, TEXEL_Z ) ), 0 ).x;
			const pB = texture3D( pressTexA, uvw.sub( vec3( 0, 0, TEXEL_Z ) ), 0 ).x;

			const gradient = vec3( pR.sub( pL ), pU.sub( pD ), pF.sub( pB ) ).mul( 0.5 );

			const vel = texture3D( velTexB, uvw, 0 ).xyz.sub( gradient );

			textureStore( velTexA, coord, vec4( vel, 0 ) ).toWriteOnly();

		} )().compute( CELL_COUNT ).setName( 'project' );

		advectDyePass = Fn( () => {

			const coord = getVoxelCoord( instanceIndex );
			const uvw = coordToUVW( coord );

			const vel = texture3D( velTexA, uvw, 0 ).xyz;
			const velUVW = vel.div( uVolumeWorldSize );
			const prevPos = uvw.sub( velUVW.mul( uDt ) );

			const dye = dyeTexNode.sample( prevPos ).level( 0 );

			const density = dye.r.mul( max( float( 1 ).sub( uDissipation.mul( uDt ) ), 0 ) ).toVar();
			const temperature = dye.g.mul( max( float( 1 ).sub( uCooling.mul( uDt ) ), 0 ) ).toVar();

			const gridDims = vec3( GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z );
			const nearestUVW = floor( prevPos.mul( gridDims ) ).add( 0.5 ).div( gridDims );
			const age = dyeTexNode.sample( nearestUVW ).level( 0 ).b.add( uDt ).toVar();

			temperature.assign( temperature.clamp( 0, 12 ) );

			If( density.lessThanEqual( 0.01 ), () => {

				age.assign( 0.0 );

			} );

			textureStore( dyeTexWriteNode, coord, vec4( density, temperature, age, 1.0 ) ).toWriteOnly();

		} )().compute( CELL_COUNT ).setName( 'advectDye' );

		emitTeapotPass = Fn( () => {

			const vertexPos = teapotVerticesBuffer.element( instanceIndex );
			const worldPos = uTeapotMatrix.mul( vec4( vertexPos, 1.0 ) ).xyz;

			const uvw = worldPos.sub( vec3( 0, VOLUME_WORLD_SIZE_Y / 2, 0 ) ).div( uVolumeWorldSize ).add( 0.5 );

			If( uvw.x.greaterThanEqual( 0 ).and( uvw.x.lessThanEqual( 1 ) )
				.and( uvw.y.greaterThanEqual( 0 ) ).and( uvw.y.lessThanEqual( 1 ) )
				.and( uvw.z.greaterThanEqual( 0 ) ).and( uvw.z.lessThanEqual( 1 ) ), () => {

					const coord = uvec3( uvw.mul( vec3( GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z ) ) );

					const flicker = mx_noise_float( vertexPos.mul( 9.0 ).add( vec3( 0.0, uTime.negate().mul( 2.5 ), uTime.mul( 0.7 ) ) ) ).mul( 0.5 ).add( 0.5 );

					const baseEmission = uEmitTemperature.greaterThan( 0.0 ).select( float( 1.0 ), float( 0.0 ) );

					const movementEmission = uTeapotSpeed.mul( uMotionBoost );

					const emissionFactor = baseEmission.add( movementEmission );

					const densityVal = uEmitDensity.mul( float( 1 / 120 ) ).mul( flicker.mul( 0.85 ).add( 0.15 ) ).mul( emissionFactor );

					If( densityVal.greaterThan( 0.0 ), () => {

						const tempVal = uEmitTemperature.mul( float( 1 / 120 ) ).mul( flicker.mul( 0.85 ).add( 0.15 ) ).mul( emissionFactor );

						const currentDye = dyeTexNode.sample( uvw ).level( 0 );
						const newDensity = currentDye.r.add( densityVal );
						const newTemp = currentDye.g.add( tempVal ).clamp( 0.0, 12.0 );

						const currentAge = currentDye.b;
						const newAge = mix( currentAge, float( 0.0 ), densityVal.div( max( newDensity, 0.001 ) ) );

						textureStore( dyeTexWriteNode, coord, vec4( newDensity, newTemp, newAge, 1.0 ) ).toWriteOnly();

					} );

				} );

		} )().compute( vertexCount ).setName( 'emitTeapot' );

	}

	// ---------------------------------------------------------------
	// Scene / material 构建
	// ---------------------------------------------------------------

	function build() {

		renderer = new THREE.WebGPURenderer( { antialias: false, forceWebGL: false } );
		renderer.setSize( 640, 480 );
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 2;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.transmitted = true;

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x000000 );

		camera = new THREE.PerspectiveCamera( 60, 640 / 480, 0.1, 100 );
		camera.position.set( 14, 5.5, 4.4 );

		// Simulation resources

		velTexA = createStorage3D( 'velocity A' );
		velTexB = createStorage3D( 'velocity B' );
		dyeTexA = createStorage3D( 'dye A' );
		dyeTexB = createStorage3D( 'dye B' );
		divTex = createStorage3D( 'divergence' );
		pressTexA = createStorage3D( 'pressure A' );
		pressTexB = createStorage3D( 'pressure B' );
		curlNoiseTex = createStorage3D( 'curlNoise' );
		curlNoiseTex.wrapS = THREE.RepeatWrapping;
		curlNoiseTex.wrapT = THREE.RepeatWrapping;
		curlNoiseTex.wrapR = THREE.RepeatWrapping;

		dyeTexNode = texture3D( dyeTexA );
		dyeTexWriteNode = storageTexture( dyeTexB ).toWriteOnly();
		curlNoiseTexNode = texture3D( curlNoiseTex );

		// Teapot geometry & storage buffer for compute stage

		teapotGeometry = new TeapotGeometry( 0.8, 28 );
		teapotGeometry.computeBoundingBox();
		teapotMinY = teapotGeometry.boundingBox.min.y;
		vertexCount = teapotGeometry.attributes.position.count;
		teapotVerticesBuffer = storage( teapotGeometry.attributes.position, 'vec3' ).toReadOnly();

		createComputePasses();

		// Volumetric material - ray marches the simulated 3D texture

		volumetricMaterial = new THREE.VolumeNodeMaterial();
		volumetricMaterial.steps = 16;
		volumetricMaterial.transparent = true;
		volumetricMaterial.blending = THREE.AdditiveBlending;
		volumetricMaterial.depthWrite = false;

		volumetricMaterial.offsetNode = fract( interleavedGradientNoise( screenCoordinate ).add( float( frameId ).mul( 0.618033988749895 ) ) );

		const fireRamp = Fn( ( [ t ] ) => {

			const color = vec3( 0 ).toVar();
			color.assign( mix( vec3( 0.0, 0.0, 0.0 ), uFireEndColor, smoothstep( 0.05, 0.35, t ) ) );
			color.assign( mix( color, uFireMidColor, smoothstep( 0.35, 0.65, t ) ) );
			color.assign( mix( color, uFireStartColor, smoothstep( 0.65, 1.0, t ) ) );

			return color;

		} );

		const henyeyGreenstein = Fn( ( [ cosTheta, g ] ) => {

			const g2 = g.mul( g );
			const denom = float( 1.0 ).add( g2 ).sub( float( 2.0 ).mul( g ).mul( cosTheta ) );
			const oneMinusG2 = float( 1.0 ).sub( g2 );
			return oneMinusG2.div( denom.pow( 1.5 ) ).mul( 0.079577 );

		} );

		const getVolumeSample = ( { positionRay } ) => {

			const uvw = positionRay.sub( vec3( 0, VOLUME_WORLD_SIZE_Y / 2, 0 ) ).div( uVolumeWorldSize ).add( 0.5 ).toVar();

			const noiseDistortion = texture3D( velTexA, uvw, 0 ).xyz.div( uVolumeWorldSize ).mul( 0.15 );
			const distortedUVW = uvw.add( noiseDistortion ).clamp( 0.0, 1.0 ).toVar();

			const sample = dyeTexNode.sample( distortedUVW ).level( 0 );

			const density = sample.r;
			const age = sample.b;
			const temperature = sample.g;

			const detailNoise = snoise( positionRay.mul( 5.5 ).add( vec3( 0, age.mul( 0.8 ).negate(), 0 ) ) );
			density.mulAssign( detailNoise.mul( 0.35 ).add( 0.85 ) );

			const edge = min( distortedUVW, vec3( 1 ).sub( distortedUVW ) );
			density.mulAssign( smoothstep( 0.0, 0.06, min( edge.x, min( edge.y, edge.z ) ) ) );

			return { density, temperature, age, distortedUVW };

		};

		volumetricMaterial.scatteringNode = Fn( ( { positionRay } ) => {

			const { density } = getVolumeSample( { positionRay } );

			const lightDir = uKeyLightPos.sub( positionRay ).normalize();
			const shadowDensitySum = float( 0.0 ).toVar();
			const shadowStepSize = 0.35;

			for ( let i = 0; i < 2; i ++ ) {

				const stepDist = ( i + 0.5 ) * shadowStepSize;
				const shadowPos = positionRay.add( lightDir.mul( stepDist ) );
				const shadowUVW = shadowPos.sub( vec3( 0, VOLUME_WORLD_SIZE_Y / 2, 0 ) ).div( uVolumeWorldSize ).add( 0.5 );

				const shadowEdge = min( shadowUVW, vec3( 1 ).sub( shadowUVW ) );
				const shadowFade = smoothstep( 0.0, 0.06, min( shadowEdge.x, min( shadowEdge.y, shadowEdge.z ) ) );

				const shadowSample = texture3D( dyeTexA, shadowUVW, 0 ).r.mul( shadowFade );
				shadowDensitySum.addAssign( shadowSample );

			}

			const tau = shadowDensitySum.mul( shadowStepSize ).mul( uShadowAbsorption );
			const beer = tau.negate().exp();

			const multiScatter = tau.mul( 0.25 ).negate().exp().mul( 0.5 );

			const baseTransmittance = mix( beer, beer.add( multiScatter ), uMultiScattering );

			const powder = float( 1.0 ).sub( tau.mul( 2.0 ).negate().exp() );
			const finalTransmittance = mix( baseTransmittance, baseTransmittance.mul( powder ), uPowderStrength );

			const lightTransmittance = finalTransmittance.add( uShadowAmbient ).clamp( 0.0, 1.0 );

			const viewDir = cameraPosition.sub( positionRay ).normalize();
			const cosTheta = viewDir.dot( lightDir ).clamp( - 1.0, 1.0 );
			const phase = henyeyGreenstein( cosTheta, uAsymmetry );

			const smokeScattering = vec3( density ).mul( lightTransmittance ).mul( phase.mul( 12.56637 ) );

			return smokeScattering;

		} );

		volumetricMaterial.scatteringEmissiveNode = Fn( ( { positionRay } ) => {

			const { density, temperature } = getVolumeSample( { positionRay } );

			const firePower = float( 6.0 ).sub( uFireGlowSpread );
			const fire = fireRamp( temperature.clamp( 0, 1 ) ).mul( temperature.pow( firePower ) ).mul( uFireIntensity );

			const fireColor = hue( fire, uFireHue );

			const distance = positionRay.sub( uKeyLightPos ).length();
			const attenuation = float( 400.0 ).div( distance.pow( 2.0 ) );

			return fireColor.mul( density.add( 0.15 ) ).mul( attenuation );

		} );

		const volumeCastShadow = Fn( () => {

			const startPos = positionWorld;
			const lightDir = positionWorld.sub( cameraPosition ).normalize();

			const steps = uniform( 'int' ).onRenderUpdate( ( { material, object } ) => material.steps || ( object && object.material && object.material.steps ) || volumetricMaterial.steps );
			const maxDistance = float( VOLUME_WORLD_SIZE_DIAGONAL );
			const stepSize = maxDistance.div( steps ).toVar();
			const rayDir = lightDir.toVar();

			const distTravelled = float( 0.0 ).toVar();
			const transmittance = float( 1.0 ).toVar();

			Loop( steps, () => {

				const positionRay = startPos.add( rayDir.mul( distTravelled ) );

				const { density } = getVolumeSample( { positionRay } );

				const absorption = density.mul( uShadowAbsorption ).mul( 0.01 );
				const falloff = absorption.negate().mul( stepSize ).exp();

				transmittance.mulAssign( falloff );

				distTravelled.addAssign( stepSize );

			} );

			transmittance.greaterThanEqual( 0.99 ).discard();

			const shadowOpacity = transmittance.oneMinus();

			return vec4( vec3( 0 ), shadowOpacity.mul( 5 ) );

		} );

		volumetricMesh = new THREE.Mesh( new THREE.BoxGeometry( VOLUME_WORLD_SIZE_X, VOLUME_WORLD_SIZE_Y, VOLUME_WORLD_SIZE_Z ), volumetricMaterial );
		volumetricMesh.position.y = VOLUME_WORLD_SIZE_Y / 2 + 0.4;
		volumetricMesh.receiveShadow = true;
		scene.add( volumetricMesh );

		shadowMaterial = new THREE.VolumeNodeMaterial();
		shadowMaterial.steps = volumetricMaterial.steps;
		shadowMaterial.offsetNode = volumetricMaterial.offsetNode;
		shadowMaterial.castShadowNode = volumeCastShadow();
		shadowMaterial.shadowSide = THREE.FrontSide;
		shadowMaterial.colorWrite = false;
		shadowMaterial.depthWrite = false;
		shadowMaterial.blending = THREE.CustomBlending;
		shadowMaterial.blendEquation = THREE.AddEquation;
		shadowMaterial.blendSrc = THREE.ZeroFactor;
		shadowMaterial.blendDst = THREE.OneMinusSrcAlphaFactor;
		shadowMaterial.blendEquationAlpha = THREE.AddEquation;
		shadowMaterial.blendSrcAlpha = THREE.OneFactor;
		shadowMaterial.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;

		volumetricShadowMesh = new THREE.Mesh( new THREE.BoxGeometry( VOLUME_WORLD_SIZE_X, VOLUME_WORLD_SIZE_Y, VOLUME_WORLD_SIZE_Z ), shadowMaterial );
		volumetricShadowMesh.position.y = VOLUME_WORLD_SIZE_Y / 2 + 0.4;
		volumetricShadowMesh.castShadow = true;
		scene.add( volumetricShadowMesh );

		// Floor

		floorPlane = new THREE.Mesh( new THREE.PlaneGeometry( 80, 80 ), new THREE.MeshStandardMaterial( { color: 0x111115, roughness: 0.8 } ) );
		floorPlane.rotation.x = - Math.PI / 2;
		floorPlane.position.y = - VOLUME_WORLD_SIZE_Y / 2 + 0.4 + VOLUME_WORLD_SIZE_Y / 2 + 0.4;
		floorPlane.receiveShadow = true;
		scene.add( floorPlane );

		// Teapot - opaque object inside the smoke, to visualize volumetric transparency / occlusion

		teapot = new THREE.Mesh(
			teapotGeometry,
			new THREE.MeshStandardMaterial( { color: 0x000000, roughness: 1.0, metalness: 1.0 } )
		);
		teapot.receiveShadow = true;
		teapot.position.set( 0, floorPlane.position.y - teapotMinY, 0 );
		teapot.visible = true;
		scene.add( teapot );

		prevTeapotPos.copy( teapot.position );
		teapot.updateMatrixWorld();
		uTeapotMatrix.value.copy( teapot.matrixWorld );
		uTeapotPosition.value.copy( teapot.position );

		const isVolume = Fn( ( { material } ) => {

			const isVolumeMaterial = material && material.isVolumeNodeMaterial;

			return float( isVolumeMaterial ? 1.0 : 0.0 );

		} )();

		const pointLightColor = Fn( () => {

			const P = positionWorld;

			const A = uTeapotPosition;

			const H = vec3( 0.0, uFlameHeight, 0.0 );
			const V = P.sub( A );
			const t = V.dot( H ).div( H.dot( H ) ).clamp( 0.0, 1.0 );
			const C = A.add( uSway ).add( H.mul( t ) );
			const distToSegment = P.sub( C ).length();

			const r = float( 1.2 );
			const softAttenuation = float( 1.0 ).div( distToSegment.pow( 2.0 ).add( r.pow( 2.0 ) ) );

			const distToLight = P.sub( A ).length();
			const decayExponent = float( 2.0 );
			const defaultAttenuation = distToLight.pow( decayExponent ).max( 0.01 ).reciprocal();

			const attenuationCorrection = isVolume.equal( 1.0 ).select(
				softAttenuation.div( defaultAttenuation ),
				float( 1.0 )
			);

			const currentIntensity = isVolume.equal( 1.0 ).select( uPointLightVolumeIntensity, uPointLightSurfaceIntensity );

			const colorT = uEmitTemperature.div( 8.34 ).mul( 0.5 ).add( 0.20 ).add( uColorNoise ).clamp( 0.0, 1.0 );
			const fireColor = fireRamp( colorT );
			const coloredFire = hue( saturation( fireColor, uSaturation ), uFireHue );

			const relP = P.xz.sub( A.xz );
			const angle = atan( relP.y, relP.x );
			const distXZ = relP.length();

			const freqScale = uPointLightProjectionFrequency;
			const angleNoise = mx_noise_float( vec3( cos( angle ).mul( float( 1.5 ).mul( freqScale ) ), sin( angle ).mul( float( 1.5 ).mul( freqScale ) ), uTime.mul( 0.6 ) ) ).mul( 0.5 ).add( 0.5 );

			const centerFadeFactor = smoothstep( 0.0, uPointLightProjectionCenterFade, distXZ );
			const cleanAngleNoise = mix( float( 1.0 ), angleNoise, centerFadeFactor );

			const noiseCoord1 = vec3( P.x.mul( float( 0.6 ).mul( freqScale ) ), uTime.mul( 1.2 ), P.z.mul( float( 0.6 ).mul( freqScale ) ) );
			const projN1 = mx_noise_float( noiseCoord1 ).mul( 0.5 ).add( 0.5 );

			const noiseCoord2 = vec3( P.x.mul( float( 1.5 ).mul( freqScale ) ), uTime.mul( 2.5 ), P.z.mul( float( 1.5 ).mul( freqScale ) ) );
			const projN2 = mx_noise_float( noiseCoord2 ).mul( 0.5 ).add( 0.5 );

			const projNoise = projN1.mul( 0.65 ).add( projN2.mul( 0.35 ) );

			const projectionIntensity = projNoise.mul( cleanAngleNoise.mul( 0.5 ).add( 0.5 ) );

			const noiseFadeFactor = distToSegment.div( uPointLightProjectionNoiseFade ).clamp( 0.0, 1.0 );
			const finalIntensity = mix( projectionIntensity, float( 1.0 ), noiseFadeFactor );

			const radialTemp = float( 1.0 ).sub( distToSegment.div( uPointLightProjectionRadius ) ).clamp( 0.0, 1.0 );

			const colorTProj = radialTemp.mul( finalIntensity ).clamp( 0.0, 1.0 );
			const fireColorProj = fireRamp( colorTProj );
			const coloredFireProj = hue( saturation( fireColorProj, uSaturation ), uFireHue );

			const finalFireColor = isVolume.equal( 1.0 ).select( coloredFire, coloredFireProj );

			const tempScale = uEmitTemperature.div( 8.34 ).max( 0.0 );
			const tempFactor = tempScale.pow( 4.0 );

			const densityScale = uEmitDensity.div( 11.02 ).max( 0.0 );

			const fadeIn = smoothstep( 0.0, 3.0, uTime );

			const baseColor = finalFireColor.mul( tempFactor ).mul( densityScale ).mul( uFireIntensity ).mul( currentIntensity ).mul( uFlicker ).mul( fadeIn );

			const distRatio = distToSegment.div( uLightFarDistance ).clamp( 0.0, 1.0 );
			const distanceScale = mix( uLightNearIntensity, uLightFarIntensity, smoothstep( 0.0, 1.0, distRatio ) );

			const finalScale = isVolume.equal( 1.0 ).select( distanceScale, float( 1.0 ) );

			return baseColor.mul( attenuationCorrection ).mul( finalScale );

		} )();

		pointLight = new THREE.PointLight( 0xffffff, 1, 100, 2 );
		pointLight.colorNode = pointLightColor;
		pointLight.position.set( 0, 0, 0 );
		pointLight.castShadow = false;
		teapot.add( pointLight );

		// Key light - white spot with shadow, so the smoke receives/shows shadows clearly

		keyLight = new THREE.SpotLight( 0xffffff, 1000 );
		keyLight.position.set( - 3 * ( VOLUME_WORLD_SIZE_X / 8 ), 6 * ( VOLUME_WORLD_SIZE_Y / 8 ) + VOLUME_WORLD_SIZE_Y / 2 + 0.4, 3 * ( VOLUME_WORLD_SIZE_Z / 8 ) );
		keyLight.angle = Math.PI / 5;
		keyLight.penumbra = 1;
		keyLight.decay = 2;
		keyLight.distance = 0;
		keyLight.castShadow = true;
		keyLight.shadow.intensity = .98;
		keyLight.shadow.mapSize.width = 1024;
		keyLight.shadow.mapSize.height = 1024;
		keyLight.shadow.camera.near = 1;
		const maxVolumeSize = Math.max( VOLUME_WORLD_SIZE_X, VOLUME_WORLD_SIZE_Y, VOLUME_WORLD_SIZE_Z );
		keyLight.shadow.camera.far = 20 * ( maxVolumeSize / 8 );
		keyLight.shadow.bias = - 0.001;
		keyLight.shadow.focus = 1;
		keyLight.target.position.set( 1, 0, 0 );
		scene.add( keyLight );
		scene.add( keyLight.target );

		uKeyLightPos = uniform( keyLight.position );

		// Render Pipeline

		renderPipeline = new THREE.RenderPipeline( renderer );

		const volumetricLayer = new THREE.Layers();
		volumetricLayer.disableAll();
		volumetricLayer.enable( LAYER_VOLUMETRIC_LIGHTING );

		volumetricMesh.layers.disableAll();
		volumetricMesh.layers.enable( LAYER_VOLUMETRIC_LIGHTING );

		keyLight.layers.enable( LAYER_VOLUMETRIC_LIGHTING );
		pointLight.layers.enable( LAYER_VOLUMETRIC_LIGHTING );

		scenePass = pass( scene, camera );
		scenePass.name = 'Scene Pass';

		volumetricPass = pass( scene, camera );
		volumetricPass.name = 'Volumetric Lighting';
		volumetricPass.setLayers( volumetricLayer );
		volumetricPass.setResolutionScale( state.resolution );

		denoiseStrength = uniform( 0.5 );
		uSaturation = uniform( 1.1 ).setGroup( renderGroup );

		teapot.material.emissiveNode = Fn( () => {

			const p = positionLocal.mul( 0.5 );
			const flow = vec3( 0.0, uTime.negate(), 0.0 );

			const n1 = mx_noise_float( p.add( flow ) ).mul( 0.5 ).add( 0.5 );
			const p2 = p.mul( 2.0 ).sub( flow.mul( 1.5 ) );
			const n2 = mx_noise_float( p2.add( vec3( n1.mul( 0.4 ) ) ) ).mul( 0.5 ).add( 0.5 );
			const p3 = p.mul( 4.0 ).add( flow.mul( 2.5 ) );
			const n3 = mx_noise_float( p3 ).mul( 0.5 ).add( 0.5 );

			const noiseVal = n1.mul( 0.50 ).add( n2.mul( 0.35 ) ).add( n3.mul( 0.15 ) );

			const lavaT = noiseVal.pow( 2.5 ).clamp( 0.0, 1.0 );

			const fireColor = fireRamp( lavaT.add( .1 ) );
			const coloredFire = hue( saturation( fireColor, uSaturation ), uFireHue );

			const tempScale = uEmitTemperature.div( 8.34 ).max( 0.0 );
			const tempFactor = tempScale.pow( 4.0 );
			const densityScale = uEmitDensity.div( 11.02 ).max( 0.0 );
			const fadeIn = smoothstep( 0.0, 3.0, uTime );

			return coloredFire.mul( tempFactor ).mul( densityScale ).mul( uFireIntensity ).mul( uFlicker ).mul( fadeIn ).mul( uTeapotEmissiveIntensity );

		} )();

		blurredVolumetricPass = gaussianBlur( volumetricPass, denoiseStrength, 1 );

		updatePostProcessing();

		applyParams( state, true );

	}

	// ---------------------------------------------------------------
	// 后期合成（对应示例 updatePostProcessing）
	// ---------------------------------------------------------------

	function updatePostProcessing() {

		let volumetric = volumetricPass;

		if ( state.denoise ) {

			volumetric = blurredVolumetricPass;

		}

		const volumetricRGB = volumetric.rgb;
		const adjustedVolumetricRGB = saturation( volumetricRGB, uSaturation );
		const adjustedVolumetric = vec4( adjustedVolumetricRGB, volumetric.a ).mul( .5 );

		const scenePassColor = scenePass.max( adjustedVolumetric ).add( adjustedVolumetric );

		let output = scenePassColor;

		if ( state.bloom ) {

			if ( bloomPass !== null ) {

				bloomPass.dispose();

			}

			bloomPass = bloom( scenePassColor );
			bloomPass.threshold.value = state.bloomThreshold;
			bloomPass.strength.value = state.bloomStrength;
			bloomPass.radius.value = state.bloomRadius;

			output = scenePassColor.add( bloomPass );

		} else if ( bloomPass !== null ) {

			bloomPass.dispose();
			bloomPass = null;

		}

		renderPipeline.outputNode = output;
		renderPipeline.needsUpdate = true;

	}

	// ---------------------------------------------------------------
	// 参数映射（封装层，只写已有 uniform / 属性）
	// ---------------------------------------------------------------

	function applyParams( p, force = false ) {

		if ( ! renderPipeline ) return;

		uBuoyancy.value = p.buoyancy;
		uVelDamping.value = p.velocityDamping;
		uTurbulenceDecay.value = p.turbulenceDecay;
		uTurbFrequency.value = p.turbulenceFrequency;
		uEmitDensity.value = p.emitDensity;
		uEmitTemperature.value = p.emitTemperature;
		uMotionBoost.value = p.motionBoost;
		uWindStrength.value = p.windStrength;
		uTeapotEmissiveIntensity.value = p.teapotEmissive;
		uFireIntensity.value = p.fireIntensity;
		uFireGlowSpread.value = p.glowSpread;
		uAsymmetry.value = p.phaseAsymmetry;
		uPowderStrength.value = p.powderStrength;
		uMultiScattering.value = p.multiScattering;
		uShadowAbsorption.value = p.shadowAbsorption;
		uShadowAmbient.value = p.shadowAmbient;
		uPointLightVolumeIntensity.value = p.lightSmoke;
		uPointLightSurfaceIntensity.value = p.lightReflection;
		uLightNearIntensity.value = p.lightNearScale;
		uLightFarIntensity.value = p.lightFarScale;
		uPointLightProjectionRadius.value = p.projLightRadius;
		uPointLightProjectionFrequency.value = p.projLightFreq;
		uPointLightProjectionNoiseFade.value = p.projNoiseFade;
		uPointLightProjectionCenterFade.value = p.projCenterFade;

		uSaturation.value = p.saturation;
		denoiseStrength.value = p.denoiseStrength;

		volumetricMaterial.steps = Math.round( p.raymarchSteps );
		shadowMaterial.steps = volumetricMaterial.steps;

		uFireStartColor.value.set( p.fireStartColor );
		uFireMidColor.value.set( p.fireMidColor );
		uFireEndColor.value.set( p.fireEndColor );
		uFireHue.value = THREE.MathUtils.degToRad( p.fireHue );

		renderer.toneMappingExposure = p.exposure;
		keyLight.intensity = p.keyLightIntensity;

		volumetricPass.setResolutionScale( p.resolution );

		if ( bloomPass ) {

			bloomPass.threshold.value = p.bloomThreshold;
			bloomPass.strength.value = p.bloomStrength;
			bloomPass.radius.value = p.bloomRadius;

		}

		if ( p.volumeWidth !== undefined ) {

			// 只缩放体积盒的水平截面，模拟"更细的火柱"；模拟网格本身不变。
			volumetricMesh.scale.x = volumetricMesh.scale.z = Math.max( 0.2, p.volumeWidth / 0.4 );

		}

		// 后期节点图只在拓扑真正变化时重建：denoise / bloom 开关切换。
		// 只改数值（bloom 参数、饱和度、步数）不重建，避免每帧生成新节点图。
		const signature = ( p.denoise ? 'd1' : 'd0' ) + ( p.bloom ? 'b1' : 'b0' );
		if ( force || signature !== postSignature ) {

			postSignature = signature;
			updatePostProcessing();

		}

	}

	// ---------------------------------------------------------------
	// 单帧推进
	// ---------------------------------------------------------------

	function updateTemporalUniforms( time ) {

		uTime.value = time % 1000;

		const heightNoise = cpuNoise.noise( 0, time * 2.5, 0 );
		uFlameHeight.value = 3.5 + heightNoise * 0.8;

		const swayX = cpuNoise.noise( time * 3.5, 0, 0 ) * 0.4;
		const swayZ = cpuNoise.noise( 0, 0, time * 3.5 ) * 0.4;
		uSway.value.set( swayX, 0, swayZ );

		const slowNoise = cpuNoise.noise( 0, time * 0.8, 0 );
		const fastNoise = cpuNoise.noise( 0, time * 15.0, 0 );
		uFlicker.value = slowNoise * 0.12 + fastNoise * 0.06 + 0.82;

		const colorNoise = cpuNoise.noise( time * 5.0, time * 5.0, 0 ) * 0.08;
		uColorNoise.value = colorNoise;

		if ( state.animateEmitter ) teapot.rotation.y = time * 0.25;

		teapot.updateMatrixWorld();
		uTeapotMatrix.value.copy( teapot.matrixWorld );

	}

	function step( delta ) {

		// 拖拽速度 / 速度向量，用于"移动时带火"的风效应
		const currentPos = teapot.position;
		const dist = currentPos.distanceTo( prevTeapotPos );
		const speed = delta > 0 ? dist / delta : 0;

		if ( delta > 0 ) {

			uTeapotVelocity.value.subVectors( currentPos, prevTeapotPos ).multiplyScalar( 1 / delta );

		}

		prevTeapotPos.copy( currentPos );

		uTeapotSpeed.value = speed;
		uTeapotPosition.value.copy( currentPos );

		if ( state.simulate && state.simSpeed > 0 ) {

			const dt = delta * state.simSpeed;
			simAccumulator += dt;

			const stepTime = 1 / 120;
			const simStep = stepTime * state.simSpeed;

			const maxAccumulator = simStep * 8;
			if ( simAccumulator > maxAccumulator ) {

				simAccumulator = maxAccumulator;

			}

			uDt.value = simStep;
			uTurbulence.value = state.simSpeed > 0 ? state.turbulence / Math.sqrt( state.simSpeed ) : 0;

			if ( state.smokeLifespan >= 100.0 ) {

				uDissipation.value = 0.0;

			} else {

				uDissipation.value = 1.0 / state.smokeLifespan;

			}

			uCooling.value = 1.0 / state.fireLifespan;

			let guard = 0;
			while ( simAccumulator >= simStep && guard < 8 ) {

				guard ++;
				simulationTime += simStep;
				updateTemporalUniforms( simulationTime );

				renderer.compute( advectVelocityPass );
				renderer.compute( divergencePass );

				for ( let i = 0; i < PRESSURE_ITERATIONS; i ++ ) {

					renderer.compute( ( i % 2 === 0 ) ? jacobiPassAB : jacobiPassBA );

				}

				renderer.compute( projectPass );
				renderer.compute( advectDyePass );
				renderer.compute( emitTeapotPass );

				const temp = dyeTexNode.value;
				dyeTexNode.value = dyeTexWriteNode.value;
				dyeTexWriteNode.value = temp;

				simAccumulator -= simStep;

			}

		} else {

			updateTemporalUniforms( simulationTime );

		}

		// 点光源照射范围随温度 / 密度 / 亮度自适应
		const tempRatio = uEmitTemperature.value / 8.34;
		const densityRatio = uEmitDensity.value / 11.02;
		const intensityRatio = uFireIntensity.value / 5.63;
		const sizeFactor = Math.sqrt( tempRatio * densityRatio * intensityRatio );

		const t = Math.min( Math.max( simulationTime / 3.0, 0.0 ), 1.0 );
		const fadeIn = t * t * ( 3.0 - 2.0 * t );

		pointLight.distance = Math.max( 0.01, 40.0 * Math.max( 0.2, sizeFactor ) * fadeIn );

		renderPipeline.render();

	}

	// ---------------------------------------------------------------
	// 公开接口
	// ---------------------------------------------------------------

	const api = {
		renderer,
		get scene() { return scene; },
		get camera() { return camera; },
		get teapot() { return teapot; },
		get isReady() { return !! renderPipeline; },

		async init() {
			build();
			await renderer.init();
			renderer.compute( computeCurlNoisePass );
			lastTime = performance.now();
			return api;
		},

		attach( canvas ) {
			const el = renderer.domElement;
			el.style.display = 'block';
			el.style.width = '100%';
			el.style.height = '100%';
			canvas.appendChild( el );
			const rect = canvas.getBoundingClientRect();
			const w = Math.max( 1, Math.round( rect.width ) );
			const h = Math.max( 1, Math.round( rect.height ) );
			renderer.setSize( w, h, false );
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		},

		setSize( width, height ) {
			const w = Math.max( 1, Math.round( width ) );
			const h = Math.max( 1, Math.round( height ) );
			renderer.setSize( w, h, false );
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		},

		getCamera() { return camera; },
		getRenderer() { return renderer; },
		getScene() { return scene; },

		/** 创建轨道控制；宿主应自己持有时不要调用。 */
		createControls( domElement ) {
			controls = new OrbitControls( camera, domElement || renderer.domElement );
			controls.target.set( 0, 3.6, 0 );
			controls.maxDistance = 40;
			controls.minDistance = 2;
			controls.update();
			return controls;
		},

		/** 创建茶壶拖拽：拖动时向流体注入湍流。 */
		createDragControls( domElement, onDragState ) {
			if ( ! teapot ) return null;
			dragControls = new DragControls( [ teapot ], camera, domElement || renderer.domElement );
			dragControls.rotateSpeed = 0;
			const limitX = VOLUME_WORLD_SIZE_X / 2 - 1.5;
			const limitZ = VOLUME_WORLD_SIZE_Z / 2 - 1.5;
			dragControls.addEventListener( 'dragstart', () => {
				if ( controls ) controls.enabled = false;
				if ( onDragState ) onDragState( true );
			} );
			dragControls.addEventListener( 'drag', () => {
				teapot.position.x = Math.max( - limitX, Math.min( limitX, teapot.position.x ) );
				teapot.position.y = Math.max( floorPlane.position.y - teapotMinY, Math.min( VOLUME_WORLD_SIZE_Y - 1.5, teapot.position.y ) );
				teapot.position.z = Math.max( - limitZ, Math.min( limitZ, teapot.position.z ) );
			} );
			dragControls.addEventListener( 'dragend', () => {
				if ( controls ) controls.enabled = true;
				if ( onDragState ) onDragState( false );
			} );
			return dragControls;
		},

		setParams( next ) {
			Object.assign( state, next );
			applyParams( state );
		},

		getParams() { return { ...state }; },

		/** 推进一帧并渲染。dt 单位秒。 */
		update( dt ) {
			if ( ! renderPipeline || disposed ) return;
			const delta = Math.min( Math.max( dt, 0 ), 1 / 30 );
			step( delta );
			lastTime = performance.now();
		},

		/** 直接渲染一帧（不推进模拟），用于暂停态。 */
		render() {
			if ( ! renderPipeline || disposed ) return;
			renderPipeline.render();
		},

		/** 供验收脚本读取内部 uniform 与 pass 状态。 */
		debugState() {
			return {
				grid: [ GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z ],
				cellCount: CELL_COUNT,
				pressureIterations: PRESSURE_ITERATIONS,
				steps: volumetricMaterial ? volumetricMaterial.steps : null,
				resolution: state.resolution,
				simTime: simulationTime,
				uTurbulence: uTurbulence.value,
				uCooling: uCooling.value,
				uDissipation: uDissipation.value,
				fireIntensity: uFireIntensity.value,
				teapot: teapot ? teapot.position.toArray() : null,
				bloom: !! bloomPass
			};
		},

		dispose() {
			if ( disposed ) return;
			disposed = true;

			if ( dragControls ) { dragControls.dispose(); dragControls = null; }
			if ( controls ) { controls.dispose(); controls = null; }
			if ( bloomPass ) { bloomPass.dispose(); bloomPass = null; }

			for ( const t of [ velTexA, velTexB, dyeTexA, dyeTexB, divTex, pressTexA, pressTexB, curlNoiseTex ] ) {
				if ( t ) t.dispose();
			}

			for ( const passItem of [ advectVelocityPass, divergencePass, jacobiPassAB, jacobiPassBA, projectPass, advectDyePass, emitTeapotPass, computeCurlNoisePass ] ) {
				if ( passItem && passItem.dispose ) passItem.dispose();
			}

			if ( volumetricMaterial ) volumetricMaterial.dispose();
			if ( shadowMaterial ) shadowMaterial.dispose();
			if ( volumetricMesh ) volumetricMesh.geometry.dispose();
			if ( volumetricShadowMesh ) volumetricShadowMesh.geometry.dispose();
			if ( floorPlane ) { floorPlane.geometry.dispose(); floorPlane.material.dispose(); }
			if ( teapot ) {
				if ( teapot.material ) teapot.material.dispose();
				if ( teapotGeometry ) teapotGeometry.dispose();
			}

			if ( renderer ) {
				renderer.setAnimationLoop( null );
				renderer.dispose();
				if ( renderer.domElement && renderer.domElement.parentNode ) {
					renderer.domElement.parentNode.removeChild( renderer.domElement );
				}
			}

			renderer = null; scene = null; camera = null;
		}
	};

	return api;
}
