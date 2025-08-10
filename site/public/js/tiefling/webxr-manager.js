import * as THREE from '/js/tiefling/node_modules/three/build/three.module.js';

export class WebXRManager {
    constructor(renderer, scene, camera, container) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.container = container;
        
        this.session = null;
        this.referenceSpace = null;
        this.controllers = [];
        this.isVRActive = false;
        
        // VR-specific settings
        this.vrSensitivity = 0.3; // Reduced sensitivity for VR comfort
        this.vrImageDistance = 3; // Distance of image from user in meters
        this.vrImageScale = 2.0; // Scale of image in VR
        
        // VR controller state
        this.isTriggerHeld = false;
        this.continuousMovementSpeed = 0.5; // meters per second
        this.lastFrameTime = 0;
        
        this.init();
    }

    init() {
        // Enable WebXR
        this.renderer.xr.enabled = true;
        
        // Check WebXR support
        if (!navigator.xr) {
            console.warn('WebXR not supported in this browser');
            return;
        }
    }

    async enterVR() {
        if (!navigator.xr) {
            throw new Error('WebXR not supported');
        }

        try {
            // Request VR session
            this.session = await navigator.xr.requestSession('immersive-vr', {
                optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
            });

            this.session.addEventListener('end', () => this.onSessionEnd());
            this.session.addEventListener('selectstart', (event) => this.onSelectStart(event));
            this.session.addEventListener('selectend', (event) => this.onSelectEnd(event));
            
            // Set up reference space
            this.referenceSpace = await this.session.requestReferenceSpace('local');
            
            // Set up renderer for VR
            this.renderer.xr.setReferenceSpaceType('local');
            this.renderer.xr.setSession(this.session);
            
            // Set up render loop for VR
            this.renderer.setAnimationLoop((timestamp, frame) => {
                this.render(timestamp, frame);
            });
            
            // Set up controllers
            this.setupControllers();
            
            // Adjust scene for VR
            this.adjustSceneForVR();
            
            this.isVRActive = true;
            
            console.log('VR session started');
            
        } catch (error) {
            console.error('Failed to enter VR:', error);
            throw error;
        }
    }

    exitVR() {
        if (this.session) {
            this.session.end();
        }
    }

    onSessionEnd() {
        this.isVRActive = false;
        this.session = null;
        this.referenceSpace = null;
        
        // Reset VR controller state
        this.isTriggerHeld = false;
        this.lastFrameTime = 0;
        
        // Reset renderer
        this.renderer.xr.setSession(null);
        
        // Restore normal render loop
        this.renderer.setAnimationLoop(null);
        
        console.log('VR session ended');
    }

    setupControllers() {
        this.session.addEventListener('inputsourceschange', (event) => {
            this.onInputSourcesChange(event);
        });
    }

    onInputSourcesChange(event) {
        event.added.forEach((inputSource) => {
            const controller = this.createController(inputSource);
            this.controllers.push(controller);
            this.scene.add(controller);
        });

        event.removed.forEach((inputSource) => {
            const controller = this.controllers.find(c => c.inputSource === inputSource);
            if (controller) {
                this.scene.remove(controller);
                this.controllers = this.controllers.filter(c => c !== controller);
            }
        });
    }

    createController(inputSource) {
        const controller = new THREE.Group();
        controller.inputSource = inputSource;
        
        // Add visual representation of controller
        const geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        controller.add(mesh);
        
        return controller;
    }

    adjustSceneForVR() {
        // Position the main image mesh in front of the user
        if (this.scene.children.length > 0) {
            const imageMesh = this.scene.children.find(child => 
                child.geometry && child.geometry.type === 'PlaneGeometry'
            );
            
            if (imageMesh) {
                imageMesh.position.set(0, 0, -this.vrImageDistance);
                imageMesh.scale.set(this.vrImageScale, this.vrImageScale, 1);
            }
        }
    }

    render(timestamp, frame) {
        if (frame) {
            const pose = frame.getViewerPose(this.referenceSpace);
            if (pose) {
                // Update camera with VR pose
                const view = pose.views[0];
                this.camera.matrix.fromArray(view.transform.matrix);
                this.camera.matrix.decompose(
                    this.camera.position, 
                    this.camera.quaternion, 
                    this.camera.scale
                );
            }
        }
        
        // Handle continuous movement if trigger is held
        if (this.isTriggerHeld) {
            const deltaTime = (timestamp - this.lastFrameTime) / 1000; // Convert to seconds
            if (this.lastFrameTime > 0) {
                const distanceDelta = -this.continuousMovementSpeed * deltaTime; // Negative to move closer
                this.updateVRDistance(distanceDelta);
            }
            this.lastFrameTime = timestamp;
        } else {
            this.lastFrameTime = timestamp;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    // Method to update VR distance dynamically
    updateVRDistance(delta) {
        // Change distance by delta amount, with limits for comfort
        this.vrImageDistance = Math.max(0.5, Math.min(10, this.vrImageDistance + delta));
        this.adjustSceneForVR();
        console.log(`VR image distance adjusted to: ${this.vrImageDistance.toFixed(1)}m`);
    }

    // Method to get current VR distance
    getVRDistance() {
        return this.vrImageDistance;
    }

    // Method to set VR distance directly
    setVRDistance(distance) {
        this.vrImageDistance = Math.max(0.5, Math.min(10, distance));
        this.adjustSceneForVR();
        console.log(`VR image distance set to: ${this.vrImageDistance.toFixed(1)}m`);
    }

    onSelectStart(event) {
        // Handle controller button press
        console.log('VR controller select start');
        
        // Start continuous movement towards the user
        this.isTriggerHeld = true;
        this.lastFrameTime = 0; // Reset frame time to start fresh
    }

    onSelectEnd(event) {
        // Handle controller button release
        console.log('VR controller select end');
        
        // Stop continuous movement
        this.isTriggerHeld = false;
    }

    // Method to update VR-specific uniforms for the shader
    updateVRUniforms(uniforms) {
        if (uniforms && this.isVRActive) {
            // Reduce sensitivity for VR comfort
            if (uniforms.sensitivity) {
                uniforms.sensitivity.value = uniforms.sensitivity.value * this.vrSensitivity;
            }
        }
    }

    // Check if WebXR is supported
    static isSupported() {
        return navigator.xr !== undefined;
    }

    // Check if VR is available
    static async isVRAvailable() {
        if (!navigator.xr) return false;
        
        try {
            return await navigator.xr.isSessionSupported('immersive-vr');
        } catch (error) {
            return false;
        }
    }
}
