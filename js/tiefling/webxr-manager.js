import * as THREE from './node_modules/three/build/three.module.js';

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
        this.vrImageXOffset = 0; // X-axis offset of image in meters
        this.vrImageYOffset = 0; // Y-axis offset of image in meters
        
        // VR movement settings
        this.discreteMovementDistance = 0.5; // Distance to move per button press in meters
        this.thumbstickSensitivity = 0.1; // Sensitivity for thumbstick movement
        this.thumbstickDeadzone = 0.1; // Deadzone to prevent drift
        
        // Example navigation settings
        this.exampleNavigationDeadzone = 0.5; // Higher deadzone for example navigation
        this.exampleNavigationCooldown = 1000; // 1 second cooldown between example changes
        this.lastExampleChange = 0; // Timestamp of last example change
        
        // Exit VR settings
        this.exitVRDoubleTapTime = 500; // Time window for double tap in milliseconds
        this.lastRightGripTime = 0; // Timestamp of last right grip press
        
        // Controller cleanup tracking
        this.activePollingLoops = new Set();
        
        // Render update flag
        this.forceNextRender = false;
        
        // Callback for example navigation
        this.onExampleChange = null; // Will be set by the main app
        
        // Callback for VR exit completion
        this.onVRExitComplete = null; // Will be set by the main app
        
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
            console.log('Requesting VR session...');
            // Request VR session
            this.session = await navigator.xr.requestSession('immersive-vr', {
                optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
            });

            console.log('VR session created, setting up event listeners...');
            // Store bound event handlers so we can remove them later
            this.boundEventHandlers = {
                end: () => this.onSessionEnd(),
                selectstart: (event) => this.onSelectStart(event),
                selectend: (event) => this.onSelectEnd(event),
                squeezestart: (event) => this.onSqueezeStart(event),
                squeezeend: (event) => this.onSqueezeEnd(event)
            };
            
            this.session.addEventListener('end', this.boundEventHandlers.end);
            this.session.addEventListener('selectstart', this.boundEventHandlers.selectstart);
            this.session.addEventListener('selectend', this.boundEventHandlers.selectend);
            this.session.addEventListener('squeezestart', this.boundEventHandlers.squeezestart);
            this.session.addEventListener('squeezeend', this.boundEventHandlers.squeezeend);
            
            console.log('Requesting reference space...');
            // Set up reference space
            this.referenceSpace = await this.session.requestReferenceSpace('local');
            
            console.log('Setting up renderer for VR...');
            // Set up renderer for VR
            this.renderer.xr.setReferenceSpaceType('local');
            this.renderer.xr.setSession(this.session);
            
            console.log('Setting up animation loop...');
            // Set up render loop for VR
            this.renderer.setAnimationLoop((timestamp, frame) => {
                this.render(timestamp, frame);
            });
            
            console.log('Setting up controllers...');
            // Set up controllers
            this.setupControllers();
            
            console.log('Adjusting scene for VR...');
            // Adjust scene for VR
            this.adjustSceneForVR();
            
            this.isVRActive = true;
            
            console.log('VR session started successfully');
            
        } catch (error) {
            console.error('Failed to enter VR:', error);
            throw error;
        }
    }

    exitVR() {
        console.log('exitVR called, session exists:', !!this.session, 'isVRActive:', this.isVRActive);
        
        if (this.session) {
            // Set flag to prevent further VR operations
            this.isVRActive = false;
            console.log('Set isVRActive to false');
            
            // Clean up controllers and stop polling loops
            this.cleanupControllers();
            
            // Remove event listeners to prevent them from being called after session end
            console.log('Removing session event listeners...');
            try {
                if (this.boundEventHandlers) {
                    this.session.removeEventListener('end', this.boundEventHandlers.end);
                    this.session.removeEventListener('selectstart', this.boundEventHandlers.selectstart);
                    this.session.removeEventListener('selectend', this.boundEventHandlers.selectend);
                    this.session.removeEventListener('squeezestart', this.boundEventHandlers.squeezestart);
                    this.session.removeEventListener('squeezeend', this.boundEventHandlers.squeezeend);
                    this.boundEventHandlers = null;
                    console.log('Event listeners removed successfully');
                } else {
                    console.log('No bound event handlers to remove');
                }
            } catch (error) {
                console.log('Error removing event listeners:', error.message);
            }
            
            // Stop the animation loop first to prevent Three.js from trying to render
            console.log('Stopping animation loop...');
            try {
                this.renderer.setAnimationLoop(null);
                console.log('Animation loop stopped successfully');
            } catch (error) {
                console.log('Error stopping animation loop:', error.message);
            }
            
            // Remove renderer session to clean up Three.js internal WebXR manager
            console.log('Removing renderer session...');
            try {
                this.renderer.xr.setSession(null);
                console.log('Renderer session removed successfully');
            } catch (error) {
                console.log('Error removing renderer session:', error.message);
            }
            
            // End the session
            console.log('Ending VR session...');
            try {
                this.session.end();
                console.log('Session.end() called successfully');
            } catch (error) {
                console.log('Error ending session:', error.message);
            }
            
            // Clear session reference
            this.session = null;
            this.referenceSpace = null;
            console.log('Session references cleared');
            
            // Force a small delay to ensure all cleanup is complete
            setTimeout(() => {
                console.log('VR exit sequence completed with delay');
                // Notify main app that VR exit is complete
                if (this.onVRExitComplete) {
                    this.onVRExitComplete();
                }
            }, 100);
            
            console.log('VR exit sequence completed');
        } else {
            console.log('No active session to exit');
        }
    }

    onSessionEnd() {
        console.log('onSessionEnd called');
        
        this.isVRActive = false;
        this.session = null;
        this.referenceSpace = null;
        
        // Clean up any remaining controllers
        this.cleanupControllers();
        
        // Reset renderer (should already be done in exitVR, but just in case)
        try {
            this.renderer.xr.setSession(null);
        } catch (error) {
            console.log('Renderer session already cleared or error:', error.message);
        }
        
        // Restore normal render loop (should already be done in exitVR, but just in case)
        try {
            this.renderer.setAnimationLoop(null);
        } catch (error) {
            console.log('Animation loop already stopped or error:', error.message);
        }
        
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
            
            // Add event listeners for thumbstick input
            if (inputSource.gamepad) {
                this.setupThumbstickInput(inputSource);
            }
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
        
        // Controller visual representation removed to avoid white cylinder artifacts
        
        return controller;
    }

    setupThumbstickInput(inputSource) {
        // Monitor thumbstick state for Y-axis movement and example navigation
        const checkThumbstick = () => {
            // Check if this polling loop should continue
            if (!this.isVRActive || !this.activePollingLoops.has(checkThumbstick)) {
                return;
            }
            
            if (inputSource.gamepad) {
                const gamepad = inputSource.gamepad;
                const hand = this.getControllerHand(inputSource);
                
                if (hand === 'left') {
                    // Left controller thumbstick Y-axis (usually axes[3])
                    if (gamepad.axes && gamepad.axes.length >= 4) {
                        const thumbstickY = gamepad.axes[3]; // Y-axis of left thumbstick
                        
                        // Apply deadzone
                        if (Math.abs(thumbstickY) > this.thumbstickDeadzone) {
                            // Move image up or down based on thumbstick position
                            const deltaY = thumbstickY * this.thumbstickSensitivity;
                            this.updateVRYPosition(deltaY);
                        }
                    }
                } else if (hand === 'right') {
                    // Right controller thumbstick X-axis (usually axes[2])
                    if (gamepad.axes && gamepad.axes.length >= 4) {
                        const thumbstickX = gamepad.axes[2]; // X-axis of right thumbstick
                        
                        // Apply deadzone for example navigation
                        if (Math.abs(thumbstickX) > this.exampleNavigationDeadzone) {
                            this.handleExampleNavigation(thumbstickX);
                        }
                    }
                }
            }
            
            // Continue checking if VR is still active
            if (this.isVRActive && this.activePollingLoops.has(checkThumbstick)) {
                requestAnimationFrame(checkThumbstick);
            }
        };
        
        // Track this polling loop for cleanup
        this.activePollingLoops.add(checkThumbstick);
        checkThumbstick();
    }

    handleExampleNavigation(thumbstickX) {
        const now = Date.now();
        
        // Check cooldown to prevent rapid changes
        if (now - this.lastExampleChange < this.exampleNavigationCooldown) {
            return;
        }
        
        if (thumbstickX > 0) {
            // Right on thumbstick - next example
            console.log('Right controller thumbstick right - next example');
            if (this.onExampleChange) {
                this.onExampleChange('next');
            }
            this.lastExampleChange = now;
        } else if (thumbstickX < 0) {
            // Left on thumbstick - previous example
            console.log('Right controller thumbstick left - previous example');
            if (this.onExampleChange) {
                this.onExampleChange('previous');
            }
            this.lastExampleChange = now;
        }
    }

    adjustSceneForVR() {
        // Position the main image mesh in front of the user
        if (this.scene.children.length > 0) {
            const imageMesh = this.scene.children.find(child => 
                child.geometry && child.geometry.type === 'PlaneGeometry'
            );
            
            if (imageMesh) {
                imageMesh.position.set(this.vrImageXOffset, this.vrImageYOffset, -this.vrImageDistance);
                imageMesh.scale.set(this.vrImageScale, this.vrImageScale, 1);
            }
        }
    }

    render(timestamp, frame) {
        // Don't render if VR is not active or session is ending
        if (!this.isVRActive || !this.session) {
            console.log('Skipping render - VR not active or session ending');
            return;
        }
        
        if (frame) {
            try {
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
            } catch (error) {
                console.log('Error getting viewer pose:', error.message);
                return;
            }
        }
        
        // Force render if requested (for immediate image updates)
        if (this.forceNextRender) {
            console.log('WebXR: Force render flag detected, rendering immediately');
            try {
                this.renderer.render(this.scene, this.camera);
                this.forceNextRender = false;
                console.log('WebXR: Force render completed, flag reset');
            } catch (error) {
                console.log('Error during force render:', error.message);
                this.forceNextRender = false;
            }
        }
        
        try {
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.log('Error during normal render:', error.message);
        }
    }

    // Method to update VR distance dynamically (Z-axis)
    updateVRDistance(delta) {
        // Change distance by delta amount, with limits for comfort
        this.vrImageDistance = Math.max(0.5, Math.min(10, this.vrImageDistance + delta));
        this.adjustSceneForVR();
        console.log(`VR image distance adjusted to: ${this.vrImageDistance.toFixed(1)}m`);
    }

    // Method to update VR X position (X-axis)
    updateVRXPosition(delta) {
        // Change X position by delta amount, with limits
        this.vrImageXOffset = Math.max(-5, Math.min(5, this.vrImageXOffset + delta));
        this.adjustSceneForVR();
        console.log(`VR image X position adjusted to: ${this.vrImageXOffset.toFixed(1)}m`);
    }

    // Method to update VR Y position (Y-axis)
    updateVRYPosition(delta) {
        // Change Y position by delta amount, with limits
        this.vrImageYOffset = Math.max(-3, Math.min(3, this.vrImageYOffset + delta));
        this.adjustSceneForVR();
        console.log(`VR image Y position adjusted to: ${this.vrImageYOffset.toFixed(1)}m`);
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

    // Helper method to determine if input source is left or right controller
    getControllerHand(inputSource) {
        if (inputSource.handedness === 'left') {
            return 'left';
        } else if (inputSource.handedness === 'right') {
            return 'right';
        }
        return 'unknown';
    }

    onSelectStart(event) {
        // Don't process events if VR is not active
        if (!this.isVRActive) {
            console.log('Ignoring selectstart event - VR not active');
            return;
        }
        
        const hand = this.getControllerHand(event.inputSource);
        
        if (hand === 'left') {
            // Left controller trigger - move image closer (Z-axis)
            console.log('Left controller trigger pressed - moving closer');
            this.updateVRDistance(-this.discreteMovementDistance);
        } else if (hand === 'right') {
            // Right controller trigger - move image left (X-axis)
            console.log('Right controller trigger pressed - moving left');
            this.updateVRXPosition(-this.discreteMovementDistance);
        }
    }

    onSelectEnd(event) {
        const hand = this.getControllerHand(event.inputSource);
        console.log(`${hand} controller trigger released`);
    }

    onSqueezeStart(event) {
        // Don't process events if VR is not active
        if (!this.isVRActive) {
            console.log('Ignoring squeezestart event - VR not active');
            return;
        }
        
        const hand = this.getControllerHand(event.inputSource);
        
        if (hand === 'left') {
            // Left controller grip - move image further away (Z-axis)
            console.log('Left controller grip pressed - moving further');
            this.updateVRDistance(this.discreteMovementDistance);
        } else if (hand === 'right') {
            // Right controller grip - check for double tap to exit VR
            const now = Date.now();
            if (now - this.lastRightGripTime < this.exitVRDoubleTapTime) {
                // Double tap detected - exit VR
                console.log('Right controller grip double tap detected - exiting VR');
                this.exitVR();
                return;
            }
            this.lastRightGripTime = now;
            
            // Single tap - move image right (X-axis)
            console.log('Right controller grip pressed - moving right');
            this.updateVRXPosition(this.discreteMovementDistance);
        }
    }

    onSqueezeEnd(event) {
        const hand = this.getControllerHand(event.inputSource);
        console.log(`${hand} controller grip released`);
    }

    // Method to set example navigation callback
    setExampleChangeCallback(callback) {
        this.onExampleChange = callback;
    }

    // Method to set VR exit completion callback
    setVRExitCompleteCallback(callback) {
        this.onVRExitComplete = callback;
    }

    // Method to force a VR render update
    forceRenderUpdate() {
        console.log('WebXR: forceRenderUpdate called, isVRActive:', this.isVRActive);
        if (this.isVRActive) {
            // Set flag to force render in next WebXR render cycle
            this.forceNextRender = true;
            console.log('WebXR: forceNextRender flag set to true');
            
            // Also try to force an immediate render if possible
            if (this.renderer && this.scene && this.camera) {
                console.log('WebXR: Attempting immediate render call');
                this.renderer.render(this.scene, this.camera);
                console.log('WebXR: Immediate render call completed');
            } else {
                console.log('WebXR: Cannot do immediate render - missing:', {
                    renderer: !!this.renderer,
                    scene: !!this.scene,
                    camera: !!this.camera
                });
            }
        } else {
            console.log('WebXR: Not in VR mode, skipping force render update');
        }
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

    // Method to clean up controllers and stop polling loops
    cleanupControllers() {
        console.log('cleanupControllers called, active loops:', this.activePollingLoops.size, 'controllers:', this.controllers.length);
        
        // Stop all active polling loops
        this.activePollingLoops.clear();
        
        // Remove all controllers from the scene
        this.controllers.forEach((controller, index) => {
            if (controller && this.scene) {
                console.log(`Removing controller ${index} from scene`);
                this.scene.remove(controller);
            }
        });
        
        // Clear the controllers array
        this.controllers = [];
        
        console.log('Controllers cleaned up');
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
