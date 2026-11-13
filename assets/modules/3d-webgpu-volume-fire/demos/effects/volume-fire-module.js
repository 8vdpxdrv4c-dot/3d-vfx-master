/**
 * GPU 体积火焰 —— 统一生命周期契约适配器。
 *
 * 与其它模块的差异：WebGPU 的设备初始化是异步的，所以这里用 create() 同步
 * 建对象、init() 异步就绪，update() 在就绪前是空操作。宿主可以：
 *   - 直接 await createVolumeFireEffect(ctx, params)，等它返回已就绪的实例；
 *   - 或同步 create() 后轮询 isReady()。
 *
 * 无 WebGPU 时 create() 抛出明确错误，而不是静默渲染黑屏。
 */
import { createVolumeFire, probeWebGPU, DEFAULT_PARAMS } from './volume-fire.js';
import * as metaModule from '../meta.js';

// meta.js 用的是 `export const meta=` 形态，同时也兼容默认导出。
const meta = metaModule.meta || metaModule.default;

export const id = 'webgpu-volume-fire';
export const title = 'GPU 体积火焰';
export const category = 'particles';
export const requires = 'webgpu';
export const guiSchema = meta.schema;

let effect = null;
let pending = null;
let lastParams = { ...DEFAULT_PARAMS };

const CORE_KEYS = [
	'simSpeed', 'turbulence', 'fireLifespan', 'smokeLifespan',
	'fireStartColor', 'fireMidColor', 'fireEndColor', 'fireHue',
	'glowSpread', 'saturation', 'exposure', 'raymarchSteps', 'resolution',
	'denoise', 'bloom', 'bloomStrength', 'emitTemperature', 'emitDensity',
	'buoyancy', 'velocityDamping', 'phaseAsymmetry', 'powderStrength',
	'multiScattering', 'shadowAbsorption', 'shadowAmbient', 'lightSmoke',
	'keyLightIntensity', 'animateEmitter'
];

function pick( params ) {

	const out = {};
	for ( const key of CORE_KEYS ) {

		if ( params[ key ] !== undefined ) out[ key ] = params[ key ];

	}

	return out;

}

/**
 * 异步创建。返回已就绪的实例；无 WebGPU 时抛错（带可用性原因）。
 */
export async function createVolumeFireEffect( ctx = {}, params = {} ) {

	dispose();

	const probe = await probeWebGPU();
	if ( ! probe.available ) {

		const err = new Error( 'GPU 体积火焰需要 WebGPU：' + probe.reason );
		err.code = 'WEBGPU_UNAVAILABLE';
		throw err;

	}

	effect = createVolumeFire( {
		gridX: params.gridX,
		gridY: params.gridY,
		gridZ: params.gridZ,
		params: { ...DEFAULT_PARAMS, ...pick( params ) }
	} );

	await effect.init();

	if ( ctx.container ) effect.attach( ctx.container );
	if ( ctx.size ) effect.setSize( ctx.size[ 0 ], ctx.size[ 1 ] );

	lastParams = effect.getParams();
	return effect;

}

/** 同步建壳：返回 Promise 形式的就绪句柄，供需要同步入口的宿主使用。 */
export function create( ctx = {}, params = {} ) {

	pending = createVolumeFireEffect( ctx, params );
	pending.catch( () => {} );
	return pending;

}

export function update( dt = 0, params = {}, ctx = {} ) {

	if ( ! effect ) return;

	if ( params && Object.keys( params ).length ) {

		const next = pick( params );
		let changed = false;
		for ( const key of Object.keys( next ) ) {

			if ( next[ key ] !== lastParams[ key ] ) { changed = true; break; }

		}

		if ( changed ) {

			effect.setParams( next );
			lastParams = { ...lastParams, ...next };

		}

	}

	if ( ctx.size ) effect.setSize( ctx.size[ 0 ], ctx.size[ 1 ] );
	effect.update( dt );

}

export function isReady() {

	return !! ( effect && effect.isReady );

}

export function getInstance() {

	return effect;

}

export function dispose() {

	if ( effect ) {

		effect.dispose();
		effect = null;

	}

	pending = null;

}
