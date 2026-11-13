import * as THREE from 'three'
import * as Photons from './libs/photons.module.js'
export function createFire(scene, camera, renderer) {
    const PhotonsManager = new Photons.Manager()
    const jsonTypeStore = new Photons.JSONTypeStore()
    jsonTypeStore.addNamespace('THREE', THREE)
    jsonTypeStore.addNamespace('Photons', Photons)
    
    // 跟踪所有创建的火焰实例
    const fireInstances = [];
    // 使用Map存储ID到火焰实例的映射
    const fireInstancesMap = new Map();
    // 用于生成唯一ID
    let nextAutoId = 1;
    
    const setupEmbers = (scale, position) => {
        const embersRoot = new THREE.Object3D()
        embersRoot.position.copy(position)
    
        const texturePath = '/editor/images/ember.png'
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
 
        const embersParticleSystem = new Photons.ParticleSystem(embersRoot, embersRenderer, renderer.value)

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
    
        const texturePath = '/editor/images/base_flame.png'
        const baseFlameTexture = new THREE.TextureLoader().load(texturePath)
        const baseFlameAtlas = new Photons.Atlas(baseFlameTexture, texturePath)
        baseFlameAtlas.addFrameSet(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0)
        const baseFlameRenderer = new Photons.AnimatedSpriteRenderer(true, baseFlameAtlas, true)
        console.log('baseFlameRenderer:', baseFlameRenderer);
        const baseFlameParticleSystem = new Photons.ParticleSystem(baseFlameRoot, baseFlameRenderer, renderer.value)
        
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
    
        const texturePath = '/editor/images/bright_flame.png'
        const brightFlameTexture = new THREE.TextureLoader().load(texturePath)
        console.log('brightFlameTexture',brightFlameTexture)
        const brightFlameAtlas = new Photons.Atlas(brightFlameTexture, texturePath)
        brightFlameAtlas.addFrameSet(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0)
        const brightFlameRenderer = new Photons.AnimatedSpriteRenderer(true, brightFlameAtlas, true)
        // brightFlameRenderer.material.depthTest = false;
        // brightFlameRenderer.renderOrder = 3;
        const brightFlameParticleSystem = new Photons.ParticleSystem(brightFlameRoot, brightFlameRenderer, renderer.value)
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
    const update = () => {
        PhotonsManager.update()
        // if(effectComposer){effectComposer.render()}
        // renderer.clearDepth()
 
    }

    const render = () => {
      
        PhotonsManager.render(renderer,camera)
    }

    const addFire = (p, scale, customId = null) => {
        const scale1 = scale.x;
        const flamePosition1 = p || new THREE.Vector3(0.911, 0, 0.412);

        // 生成或使用自定义ID
        const fireId = customId !== null ? customId : `fire_${nextAutoId++}`;

        // 检查ID是否已存在
        if (fireInstancesMap.has(fireId)) {
            console.error(`火焰ID '${fireId}' 已存在`);
            return null;
        }

        // 记录添加前的索引
        const startIndex = PhotonsManager.particleSystems.length;
        const componentIndex = PhotonsManager.componentContainer.components.length;

        const embersSystem = setupEmbers(scale1, flamePosition1);
        const material1 = embersSystem.owner.children[0].material;
        if (material1) {
            material1.depthTest = true;
            material1.depthWrite = false;
            material1.blending = THREE.NormalBlending;
            embersSystem.owner.children[0].renderOrder = 2;
        } else {
            console.error('出错1');
        }

        const baseFlameSystem = setupBaseFlame(scale1, flamePosition1);
        const material2 = baseFlameSystem.owner.children[0].material;
        if (material2) {
            material2.depthTest = true;
            material2.depthWrite = false;
            material2.transparent = true;
            material2.blending = THREE.NormalBlending;
            baseFlameSystem.owner.children[0].renderOrder = 2;
        } else {
            console.error('出错2');
        }

        const brightFlameSystem = setupBrightFLame(scale1, flamePosition1);
        const material3 = brightFlameSystem.owner.children[0].material;
        if (material3) {
            material3.depthTest = true;
            material3.depthWrite = false;
            material3.transparent = true;
            material3.blending = THREE.NormalBlending;
            brightFlameSystem.owner.children[0].renderOrder = 2;
        } else {
            console.error('出错3');
        }

        PhotonsManager.addParticleSystem(embersSystem);
        PhotonsManager.addParticleSystem(baseFlameSystem);
        PhotonsManager.addParticleSystem(brightFlameSystem);
        const lightComponent = setupLights(flamePosition1, 20);
        PhotonsManager.addComponent(lightComponent);

        // 创建火焰实例对象并存储
        const fireInstance = {
            id: fireId,
            systemStartIndex: startIndex,
            componentIndex: componentIndex,
            systems: [embersSystem, baseFlameSystem, brightFlameSystem],
            light: lightComponent,
            position: flamePosition1,
            scale: scale1
        };

        // 同时存储在数组和Map中
        fireInstances.push(fireInstance);
        fireInstancesMap.set(fireId, fireInstance);
        
        return fireId; // 返回火焰ID
    }

    const removeFire = (fireId) => {
        // 如果没有提供ID，默认移除最后添加的火焰
        const fireInstance = fireId ? fireInstancesMap.get(fireId) : fireInstances[fireInstances.length - 1];

        if (!fireInstance) {
            console.error('无效的火焰ID:', fireId);
            return;
        }

        // 从Map中移除
        fireInstancesMap.delete(fireInstance.id);

        // 释放粒子系统资源
        for (const system of fireInstance.systems) {
            system.particleSystemRenderer.dispose();
        }

        // 从数组中移除粒子系统
        PhotonsManager.particleSystems.splice(
            fireInstance.systemStartIndex,
            fireInstance.systems.length
        );

        // 释放光源组件资源
        fireInstance.light.dispose();
        PhotonsManager.componentContainer.components.splice(fireInstance.componentIndex, 1);

        // 从数组中移除实例
        const index = fireInstances.findIndex(instance => instance.id === fireInstance.id);
        if (index !== -1) {
            // 从跟踪数组中移除
            fireInstances.splice(index, 1);
            
            // 更新后续火焰的索引
            for (let i = index; i < fireInstances.length; i++) {
                const instance = fireInstances[i];
                instance.systemStartIndex -= fireInstance.systems.length;
                if (instance.componentIndex > fireInstance.componentIndex) {
                    instance.componentIndex--;
                }
            }
        }
    }

    const hideFire = (fireId) => {
        // 如果没有提供ID，默认隐藏最后添加的火焰
        const fireInstance = fireId ? fireInstancesMap.get(fireId) : fireInstances[fireInstances.length - 1];

        if (!fireInstance) {
            console.error('无效的火焰ID:', fireId);
            return;
        }

        const firstSystem = fireInstance.systems[0];

        gsap.to(firstSystem, {
            duration: 2,
            ease: 'power1.out',
            activeParticleCount: 0,
            roundProps: 'activeParticleCount',
            onUpdate: () => {
                // 同步更新该火焰的所有粒子系统
                for (let i = 1; i < fireInstance.systems.length; i++) {
                    fireInstance.systems[i].activeParticleCount = firstSystem.activeParticleCount;
                }
            },
            onComplete: () => {
                removeFire(fireInstance.id);
                console.log('完成隐藏火焰 ID:', fireInstance.id);
            },
        });
    }

    return {
        addFire,
        removeFire,
        hideFire,
        update,
        render,
        // 获取所有火焰实例的方法
        getAllFires: () => Array.from(fireInstancesMap.entries()).map(([id, instance]) => ({
            id,
            position: instance.position,
            scale: instance.scale,
            systemStartIndex: instance.systemStartIndex,
            componentIndex: instance.componentIndex
        }))
    }
}