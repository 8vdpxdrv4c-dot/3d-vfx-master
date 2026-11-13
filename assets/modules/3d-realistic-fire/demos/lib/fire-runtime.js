import * as THREE from 'three';
import * as Photons from './photons.module.js';
function createSmall(scene, renderer) {
    const setupEmbers = (scale, position) => {
        const embersRoot = new THREE.Object3D()
        embersRoot.position.copy(position)
    
        const texturePath = new URL('../textures/ember.png', import.meta.url).href
        const embersTexture = new THREE.TextureLoader().load(texturePath)
        const embersAtlas = new Photons.Atlas(embersTexture, texturePath)
        embersAtlas.addFrameSet(1, 0.0, 0.0, 1.0, 1.0)
        const embersRenderer = new Photons.AnimatedSpriteRenderer(true, embersAtlas, true, THREE.CustomBlending )
    // 设置材质属性
   
      
    
  //       embersRenderer.mesh.material.depthTest = true;            // 启用深度测试
  //       embersRenderer.mesh.material.depthWrite = false;          // 禁用深度写入（适用于透明对象）
  //       embersRenderer.mesh.material.transparent = true;          // 启用透明度
  //       embersRenderer.mesh.material.blending = THREE.NormalBlending; // 设置为正常混合模式
  // //  / 根据需要调整渲染顺序
  //       console.log('测试中',embersRenderer);
 
        const embersParticleSystem = new Photons.ParticleSystem(embersRoot, embersRenderer, renderer)

        embersParticleSystem.init(150)
    
        embersParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(6))
    
        const sizeInitializerGenerator = new Photons.RandomGenerator(
            THREE.Vector2,
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(scale * 0.15, scale * 0.15),
            0.0,
            0.0,
            false,
        )
        embersParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(3.0, 1.0, 0.0, 0.0, false))
        embersParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(sizeInitializerGenerator))
        embersParticleSystem.addParticleStateInitializer(
            new Photons.BoxPositionInitializer(new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale), new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale)),
        )
        embersParticleSystem.addParticleStateInitializer(
            new Photons.RandomVelocityInitializer(
                new THREE.Vector3(0.4 * scale, 0.5 * scale, 0.4 * scale),
                new THREE.Vector3(-0.2 * scale, 0.8 * scale, -0.2 * scale),
                0.6 * scale,
                0.8 * scale,
                false,
            ),
        )
    
        const embersOpacityOperator = embersParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator())
        embersOpacityOperator.addElements([
            [0.0, 0.0],
            [0.7, 0.25],
            [0.9, 0.75],
            [0.0, 1.0],
        ])
    
        const embersColorOperator = embersParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true))
        embersColorOperator.addElementsFromParameters([
            [[1.0, 0.7, 0.0], 0.0],
            [[1.0, 0.6, 0.0], 0.5],
            [[1.0, 0.4, 0.0], 1.0],
        ])
    
        const acceleratorOperatorGenerator = new Photons.SphereRandomGenerator(
            Math.PI * 2.0,
            0.0,
            Math.PI,
            -Math.PI / 2,
            20.0,
            -8,
            scale,
            scale,
            scale,
            0.0,
            0.0,
            0.0,
        )
    
        embersParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(acceleratorOperatorGenerator))
    
        embersParticleSystem.setSimulateInWorldSpace(true)
        embersParticleSystem.start()
    
        return embersParticleSystem
    }
    const setupBaseFlame = (scale, position) => {
        const baseFlameRoot = new THREE.Object3D()
        baseFlameRoot.position.copy(position)
    
        const texturePath = new URL('../textures/base_flame.png', import.meta.url).href
        const baseFlameTexture = new THREE.TextureLoader().load(texturePath)
        const baseFlameAtlas = new Photons.Atlas(baseFlameTexture, texturePath)
        baseFlameAtlas.addFrameSet(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0)
        const baseFlameRenderer = new Photons.AnimatedSpriteRenderer(true, baseFlameAtlas, true)

        const baseFlameParticleSystem = new Photons.ParticleSystem(baseFlameRoot, baseFlameRenderer, renderer)
        
        baseFlameParticleSystem.init(50)
        // const material = baseFlameRenderer.material;
        // if (material) {
            // material.depthTest = true;  // 根据需要设置
        //     material.depthWrite = false;
        //     material.transparent = true;
        //     material.blending = THREE.NormalBlending;  // 根据需要设置
        // } else {
        //     console.error('baseFlameRenderer.material is null after init.');
        // }
        baseFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(10))
    
        baseFlameParticleSystem.addParticleSequence(0, 18)
        const baseFlameParticleSequences = baseFlameParticleSystem.getParticleSequences()
    
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.0, 0.0, 0.0, 0.0, false))
        baseFlameParticleSystem.addParticleStateInitializer(
            new Photons.RotationInitializer(new Photons.RandomGenerator(0, Math.PI / 2.0, -Math.PI / 2.0, 0.0, 0.0, false)),
        )
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(1.0, -1.0, 0.0, 0.0, false))
        baseFlameParticleSystem.addParticleStateInitializer(
            new Photons.SizeInitializer(
                new Photons.RandomGenerator(
                    THREE.Vector2,
                    new THREE.Vector2(0.25 * scale, 0.25 * scale),
                    new THREE.Vector2(0.5 * scale, 0.5 * scale),
                    0.0,
                    0.0,
                    false,
                ),
            ),
        )
    
        baseFlameParticleSystem.addParticleStateInitializer(
            new Photons.BoxPositionInitializer(new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale), new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale)),
        )
        baseFlameParticleSystem.addParticleStateInitializer(
            new Photons.RandomVelocityInitializer(
                new THREE.Vector3(0.05 * scale, 0.4 * scale, 0.05 * scale),
                new THREE.Vector3(-0.025 * scale, 0.8 * scale, -0.025 * scale),
                0.35 * scale,
                0.5 * scale,
                false,
            ),
        )
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(baseFlameParticleSequences))
    
        baseFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(baseFlameParticleSequences, 0.07, false))
    
        const baseFlameOpacityOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator())
        baseFlameOpacityOperator.addElements([
            [0.0, 0.0],
            [0.3, 0.25],
            [0.3, 0.5],
            [0.0, 1.0],
        ])
    
        const baseFlameSizeOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true))
        baseFlameSizeOperator.addElementsFromParameters([
            [[0.6, 0.6], 0.0],
            [[1.0, 1.0], 0.4],
            [[1.0, 1.0], 1.0],
        ])
    
        const baseFlameColorOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true))
        baseFlameColorOperator.addElementsFromParameters([
            [[1.0, 1.0, 1.0], 0.0],
            [[1.5, 1.5, 1.5], 0.5],
            [[1.0, 1.0, 1.0], 1.0],
        ])
    
        baseFlameParticleSystem.addParticleStateOperator(
            new Photons.AccelerationOperator(
                new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 1.5 * scale, 0.0), 0.0, 0.0, false),
            ),
        )
    
        baseFlameParticleSystem.setSimulateInWorldSpace(true)
        baseFlameParticleSystem.start()
    
        return baseFlameParticleSystem
    }
    const setupBrightFLame = (scale, position) => {
        const brightFlameRoot = new THREE.Object3D()
        brightFlameRoot.position.copy(position)
    
        const texturePath = new URL('../textures/bright_flame.png', import.meta.url).href
        const brightFlameTexture = new THREE.TextureLoader().load(texturePath)

        const brightFlameAtlas = new Photons.Atlas(brightFlameTexture, texturePath)
        brightFlameAtlas.addFrameSet(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0)
        const brightFlameRenderer = new Photons.AnimatedSpriteRenderer(true, brightFlameAtlas, true)
        // brightFlameRenderer.material.depthTest = false;
        // brightFlameRenderer.renderOrder = 3;
        const brightFlameParticleSystem = new Photons.ParticleSystem(brightFlameRoot, brightFlameRenderer, renderer)
        brightFlameParticleSystem.init(20)
        // const material = brightFlameParticleSystem.material;
        // if (material) {
        //     material.depthTest = true;
        //     material.depthWrite = false;
        //     material.transparent = true;
        //     material.blending = THREE.NormalBlending;
        // } else {
        //     console.error('baseFlameRenderer.material is null after init.');
        // }
        brightFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(5))
    
        brightFlameParticleSystem.addParticleSequence(0, 16)
        const brightFlameParticleSequences = brightFlameParticleSystem.getParticleSequences()
    
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.0, 0.0, 0.0, 0.0, false))
        brightFlameParticleSystem.addParticleStateInitializer(
            new Photons.RotationInitializer(new Photons.RandomGenerator(0, Math.PI, -Math.PI / 2.0, 0.0, 0.0, false)),
        )
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(Math.PI / 2.0, -Math.PI / 4.0, 0.0, 0.0, false))
        brightFlameParticleSystem.addParticleStateInitializer(
            new Photons.SizeInitializer(
                new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.0, 0.0), 0.2 * scale, 0.65 * scale, false),
            ),
        )
        brightFlameParticleSystem.addParticleStateInitializer(
            new Photons.BoxPositionInitializer(new THREE.Vector3(0.1 * scale, 0.0, 0.1 * scale), new THREE.Vector3(-0.05 * scale, 0.0, -0.05 * scale)),
        )
        brightFlameParticleSystem.addParticleStateInitializer(
            new Photons.RandomVelocityInitializer(
                new THREE.Vector3(0.02 * scale, 0.4 * scale, 0.02 * scale),
                new THREE.Vector3(-0.01 * scale, 0.4 * scale, -0.01 * scale),
                0.1 * scale,
                0.2 * scale,
                false,
            ),
        )
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(brightFlameParticleSequences))
    
        brightFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(brightFlameParticleSequences, 0.1, false))
    
        const brightFlameOpacityOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator())
        brightFlameOpacityOperator.addElements([
            [0.0, 0.0],
            [0.6, 0.2],
            [0.5, 0.75],
            [0.0, 1.0],
        ])
    
        const brightFlameSizeOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true))
        brightFlameSizeOperator.addElementsFromParameters([
            [[0.3, 0.3], 0.0],
            [[1.0, 1.0], 0.4],
            [[1.0, 1.0], 0.55],
            [[0.65, 0.65], 0.75],
            [[0.1, 0.1], 1.0],
        ])
    
        const brightFlameColorOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true))
        brightFlameColorOperator.addElementsFromParameters([
            [[1.0, 1.0, 1.0], 0.0],
            [[2.0, 2.0, 2.0], 0.3],
            [[2.0, 2.0, 2.0], 0.4],
            [[0.9, 0.6, 0.3], 0.65],
            [[0.75, 0.0, 0.0], 1.0],
        ])
    
        brightFlameParticleSystem.addParticleStateOperator(
            new Photons.AccelerationOperator(
                new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 1.5 * scale, 0.0), 0.0, 0.0, false),
            ),
        )
    
        brightFlameParticleSystem.setSimulateInWorldSpace(true)
    
        brightFlameParticleSystem.start()
        return brightFlameParticleSystem
    }
    
    const setupLights = (position, intensity = 10) => {
        const lightParent = new THREE.Object3D()
        scene.add(lightParent)
        lightParent.position.copy(position)
    
        const flickerLightShadows = {
            mapSize: 1024,
            cameraNear: 0.5,
            cameraFar: 500,
            bias: 0.000009,
            edgeRadius: 3,
        } 
        return new Photons.FlickerLight(lightParent, intensity, 2, new THREE.Color().setRGB(1, 0.8, 0.4), 0, 1.0, flickerLightShadows)
    }

    return { setupEmbers, setupBaseFlame, setupBrightFLame, setupLights };
}
function createLarge(scene, renderer) {
    const setupEmbers = (scale, position) => {
        const embersRoot = new THREE.Object3D()
        embersRoot.position.copy(position)
    
        const texturePath = new URL('../textures/ember.png', import.meta.url).href
        const embersTexture = new THREE.TextureLoader().load(texturePath)
        const embersAtlas = new Photons.Atlas(embersTexture, texturePath)
        embersAtlas.addFrameSet(1, 0.0, 0.0, 1.0, 1.0)
        const embersRenderer = new Photons.AnimatedSpriteRenderer(true, embersAtlas, true, THREE.CustomBlending )
    // 设置材质属性
   
      
    
  //       embersRenderer.mesh.material.depthTest = true;            // 启用深度测试
  //       embersRenderer.mesh.material.depthWrite = false;          // 禁用深度写入（适用于透明对象）
  //       embersRenderer.mesh.material.transparent = true;          // 启用透明度
  //       embersRenderer.mesh.material.blending = THREE.NormalBlending; // 设置为正常混合模式
  // //  / 根据需要调整渲染顺序
  //       console.log('测试中',embersRenderer);
 
        const embersParticleSystem = new Photons.ParticleSystem(embersRoot, embersRenderer, renderer)

        embersParticleSystem.init(50)
    
        embersParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(6))
    
        const sizeInitializerGenerator = new Photons.RandomGenerator(
            THREE.Vector2,
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(scale * 0.2, scale * 0.2),
            0.0,
            0.0,
            false,
        )
        embersParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.8, 0.2, 0.0, 0.0, false))
        embersParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(sizeInitializerGenerator))
        embersParticleSystem.addParticleStateInitializer(
            new Photons.BoxPositionInitializer(new THREE.Vector3(1.05 * scale, 1.0, 1.05 * scale), new THREE.Vector3(-0.5 * scale, 0.0, -0.5 * scale)),
        )
        embersParticleSystem.addParticleStateInitializer(
            new Photons.RandomVelocityInitializer(
                new THREE.Vector3(0.2 * scale, 1.5 * scale, 0.2 * scale),
                new THREE.Vector3(-0.1 * scale, 1.8 * scale, -0.1 * scale),
                1.3 * scale,
                1.4 * scale,
                false,
            ),
        )
    
        const embersOpacityOperator = embersParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator())
        embersOpacityOperator.addElements([
            [0.0, 0.0],
            [0.7, 0.25],
            [0.9, 0.75],
            [0.0, 1.0],
        ])
    
        const embersColorOperator = embersParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true))
        embersColorOperator.addElementsFromParameters([
            [[1.0, 0.7, 0.0], 0.0],
            [[1.0, 0.6, 0.0], 0.5],
            [[1.0, 0.4, 0.0], 1.0],
        ])
    
        const acceleratorOperatorGenerator = new Photons.SphereRandomGenerator(
            Math.PI * 2.0,
            0.0,
            Math.PI,
            -Math.PI / 2,
            20.0,
            -8,
            scale,
            scale,
            scale,
            0.0,
            0.0,
            0.0,
        )
    
        embersParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(acceleratorOperatorGenerator))
    
        embersParticleSystem.setSimulateInWorldSpace(true)
        embersParticleSystem.start()
    
        return embersParticleSystem
    }
    const setupBaseFlame = (scale, position) => {
        const baseFlameRoot = new THREE.Object3D()
        baseFlameRoot.position.copy(position)
    
        const texturePath = new URL('../textures/base_flame.png', import.meta.url).href
        const baseFlameTexture = new THREE.TextureLoader().load(texturePath)
        const baseFlameAtlas = new Photons.Atlas(baseFlameTexture, texturePath)
        baseFlameAtlas.addFrameSet(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0)
        const baseFlameRenderer = new Photons.AnimatedSpriteRenderer(true, baseFlameAtlas, true)

        const baseFlameParticleSystem = new Photons.ParticleSystem(baseFlameRoot, baseFlameRenderer, renderer)
        
        baseFlameParticleSystem.init(30)
        // const material = baseFlameRenderer.material;
        // if (material) {
            // material.depthTest = true;  // 根据需要设置
        //     material.depthWrite = false;
        //     material.transparent = true;
        //     material.blending = THREE.NormalBlending;  // 根据需要设置
        // } else {
        //     console.error('baseFlameRenderer.material is null after init.');
        // }
        baseFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(10))
    
        baseFlameParticleSystem.addParticleSequence(0, 18)
        const baseFlameParticleSequences = baseFlameParticleSystem.getParticleSequences()
    
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.0, 0.0, 0.0, 0.0, false))
        baseFlameParticleSystem.addParticleStateInitializer(
            new Photons.RotationInitializer(new Photons.RandomGenerator(0, Math.PI / 2.0, -Math.PI / 2.0, 0.0, 0.0, false)),
        )
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(1.0, -1.0, 0.0, 0.0, false))
        baseFlameParticleSystem.addParticleStateInitializer(
            new Photons.SizeInitializer(
                new Photons.RandomGenerator(
                    THREE.Vector2,
                    new THREE.Vector2(0.8 * scale, 0.8 * scale),
                    new THREE.Vector2(0.8 * scale, 0.8 * scale),
                    0.0,
                    0.0,
                    false,
                ),
            ),
        )
    
        baseFlameParticleSystem.addParticleStateInitializer(
            new Photons.BoxPositionInitializer(new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale), new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale)),
        )
        baseFlameParticleSystem.addParticleStateInitializer(
            new Photons.RandomVelocityInitializer(
                new THREE.Vector3(0.05 * scale, 0.4 * scale, 0.05 * scale),
                new THREE.Vector3(-0.025 * scale, 0.8 * scale, -0.025 * scale),
                0.35 * scale,
                0.5 * scale,
                false,
            ),
        )
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(baseFlameParticleSequences))
    
        baseFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(baseFlameParticleSequences, 0.07, false))
    
        const baseFlameOpacityOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator())
        baseFlameOpacityOperator.addElements([
            [0.0, 0.0],
            [0.3, 0.25],
            [0.3, 0.5],
            [0.0, 1.0],
        ])
    
        const baseFlameSizeOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true))
        baseFlameSizeOperator.addElementsFromParameters([
            [[0.6, 0.6], 0.0],
            [[1.0, 1.0], 0.4],
            [[1.0, 1.0], 1.0],
        ])
    
        const baseFlameColorOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true))
        baseFlameColorOperator.addElementsFromParameters([
            [[1.0, 1.0, 1.0], 0.0],
            [[1.5, 1.5, 1.5], 0.5],
            [[1.0, 1.0, 1.0], 1.0],
        ])
    
        baseFlameParticleSystem.addParticleStateOperator(
            new Photons.AccelerationOperator(
                new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 2.5 * scale, 0.0), 0.0, 0.0, false),
            ),
        )
    
        baseFlameParticleSystem.setSimulateInWorldSpace(true)
        baseFlameParticleSystem.start()
    
        return baseFlameParticleSystem
    }
    const setupBrightFLame = (scale, position) => {
        const brightFlameRoot = new THREE.Object3D()
        brightFlameRoot.position.copy(position)
    
        const texturePath = new URL('../textures/bright_flame.png', import.meta.url).href
        const brightFlameTexture = new THREE.TextureLoader().load(texturePath)

        const brightFlameAtlas = new Photons.Atlas(brightFlameTexture, texturePath)
        brightFlameAtlas.addFrameSet(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0)
        const brightFlameRenderer = new Photons.AnimatedSpriteRenderer(true, brightFlameAtlas, true)
        // brightFlameRenderer.material.depthTest = false;
        // brightFlameRenderer.renderOrder = 3;
        const brightFlameParticleSystem = new Photons.ParticleSystem(brightFlameRoot, brightFlameRenderer, renderer)
        brightFlameParticleSystem.init(20)
        // const material = brightFlameParticleSystem.material;
        // if (material) {
        //     material.depthTest = true;
        //     material.depthWrite = false;
        //     material.transparent = true;
        //     material.blending = THREE.NormalBlending;
        // } else {
        //     console.error('baseFlameRenderer.material is null after init.');
        // }
        brightFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(5))
    
        brightFlameParticleSystem.addParticleSequence(0, 16)
        const brightFlameParticleSequences = brightFlameParticleSystem.getParticleSequences()
    
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.0, 0.0, 0.0, 0.0, false))
        brightFlameParticleSystem.addParticleStateInitializer(
            new Photons.RotationInitializer(new Photons.RandomGenerator(0, Math.PI, -Math.PI / 2.0, 0.0, 0.0, false)),
        )
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(Math.PI / 2.0, -Math.PI / 4.0, 0.0, 0.0, false))
        brightFlameParticleSystem.addParticleStateInitializer(
            new Photons.SizeInitializer(
                new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.6, 0.6), new THREE.Vector2(1.2, 1.2), 0.01 * scale,0.5 * scale, false),
            ),
        )
        //范围box范围
        brightFlameParticleSystem.addParticleStateInitializer(
            new Photons.BoxPositionInitializer(new THREE.Vector3(0.5 * scale, 0.0, 0.5 * scale), new THREE.Vector3(-0.1 * scale, 0.0, -0.1 * scale)),
        )
        brightFlameParticleSystem.addParticleStateInitializer(
            new Photons.RandomVelocityInitializer(
                new THREE.Vector3(0.02 * scale, 0.4 * scale, 0.02 * scale),
                new THREE.Vector3(-0.01 * scale, 0.4 * scale, -0.01 * scale),
                0.05 * scale,
                0.01 * scale,
                false,
            ),
        )
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(brightFlameParticleSequences))
    
        brightFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(brightFlameParticleSequences, 0.08, false))
    
        const brightFlameOpacityOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator())
        brightFlameOpacityOperator.addElements([
            [0.0, 0.0],
            [0.6, 0.2],
            [0.5, 0.75],
            [0.9, 1.0],
        ])
    
        const brightFlameSizeOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true))
        brightFlameSizeOperator.addElementsFromParameters([
            [[0.3, 0.3], 0.0],
            [[1.0, 1.0], 0.4],
            [[1.0, 1.0], 0.55],
            [[0.65, 0.65], 0.75],
            [[0.1, 0.1], 1.0],
        ])
    
        const brightFlameColorOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true))
        brightFlameColorOperator.addElementsFromParameters([
            [[1.0, 1.0, 1.0], 0.0],
            [[2.0, 2.0, 2.0], 0.3],
            [[2.0, 2.0, 2.0], 0.4],
            [[0.9, 0.6, 0.3], 0.65],
            [[0.75, 0.0, 0.0], 1.0],
        ])
    
        brightFlameParticleSystem.addParticleStateOperator(
            new Photons.AccelerationOperator(
                new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.2, 0.2, 0.2), new THREE.Vector3(0.0, 1.5 * scale, 0.0), 0.0, 0.0, false),
            ),
        )
    
        brightFlameParticleSystem.setSimulateInWorldSpace(true)
    
        brightFlameParticleSystem.start()
        return brightFlameParticleSystem
    }
    
    const setupLights = (position, intensity = 10) => {
        const lightParent = new THREE.Object3D()
        scene.add(lightParent)
        lightParent.position.copy(position)
    
        const flickerLightShadows = {
            mapSize: 1024,
            cameraNear: 0.5,
            cameraFar: 500,
            bias: 0.000009,
            edgeRadius: 3,
        } 
        return new Photons.FlickerLight(lightParent, intensity, 2, new THREE.Color().setRGB(0.9, 0.5, 0.1), 0, 1.0, flickerLightShadows)
    }

    return { setupEmbers, setupBaseFlame, setupBrightFLame, setupLights };
}

/** Instance factory: host advances time and renders the shared scene once. */
export function createFireEffect({scene, renderer}, {variant='small'}={}) {
    if (!scene || !renderer?.isWebGLRenderer) throw new Error('Realistic fire requires a scene and WebGLRenderer (not WebGPU).');
    const builders = variant === 'large' ? createLarge(scene, renderer) : createSmall(scene, renderer);
    const instances = new Map();
    let nextId=1, time=performance.now()/1000, disposed=false;
    function addFire(position=new THREE.Vector3(), scale=1, customId) {
        if (disposed) throw new Error('Fire effect is disposed.');
        const size=typeof scale==='number'?scale:scale.x;
        if (!Number.isFinite(size)||size<=0) throw new Error('Fire scale must be positive.');
        const id=customId ?? `fire_${nextId++}`;
        if(instances.has(id)) throw new Error(`Duplicate fire ID: ${id}`);
        const p=position.clone();
        const systems=[builders.setupEmbers(size,p),builders.setupBaseFlame(size,p),builders.setupBrightFLame(size,p)];
        for(const system of systems){
            const mesh=system.particleSystemRenderer.mesh;
            Object.assign(mesh.material,{depthTest:true,depthWrite:false,transparent:true,blending:THREE.NormalBlending});
            mesh.renderOrder=2;
            mesh.material.uniforms.fireOpacity={value:1};
            mesh.material.fragmentShader='uniform float fireOpacity;\n'+mesh.material.fragmentShader.replaceAll('gl_FragColor.a *= vFragAlpha;', 'gl_FragColor.a *= vFragAlpha * fireOpacity;');
            // Photons normally renders these owners separately; attach to the host instead.
            system.owner.visible=true;
            scene.add(system.owner);
        }
        const light=builders.setupLights(p,20);
        light.light.castShadow=false;
        instances.set(id,{systems,light,fade:null,position:p,scale:size});
        return id;
    }
    function removeFire(id){
        const item=instances.get(id); if(!item)return;
        for(const system of item.systems){
            const r=system.particleSystemRenderer;
            system.owner.removeFromParent();
            r.dispose(); r.material.dispose(); r.atlas.texture.dispose();
        }
        item.light.light.shadow?.map?.dispose();
        item.light.light.shadow?.mapPass?.dispose();
        item.light.dispose(); item.light.parent.removeFromParent();
        instances.delete(id);
    }
    function hideFire(id,duration=2){
        const item=instances.get(id);if(!item)return;
        if(duration<=0){removeFire(id);return;}
        // Stop emitting; let existing particles finish, then fade the remainder.
        item.fade={elapsed:0,duration};
        for(const system of item.systems)system.setEmitter(new Photons.ConstantParticleEmitter(0));
    }
    function update(dt){
        if(disposed||!Number.isFinite(dt)||dt<=0)return;
        time+=dt;
        for(const [id,item] of instances){
            for(const system of item.systems)system.update(time,dt);
            item.light.update(time,dt);
            if(item.fade){
                item.fade.elapsed+=dt;
                const alpha=Math.max(0,1-item.fade.elapsed/item.fade.duration);
                item.systems.forEach(s=>s.particleSystemRenderer.material.uniforms.fireOpacity.value=alpha);
                if(alpha===0)removeFire(id);
            }
        }
    }
    return {addFire,removeFire,hideFire,update,getAllFires:()=>Array.from(instances,([id,v])=>({id,position:v.position.clone(),scale:v.scale})),
        dispose(){for(const id of [...instances.keys()])removeFire(id);disposed=true;}};
}
