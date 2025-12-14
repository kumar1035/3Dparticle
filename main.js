import ParticleSystem from './particleSystem.js';
import HandTracking from './handTracking.js';
import GestureController from './gestureController.js';

class App {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particleSystem = null;
        this.handTracking = null;
        this.gestureController = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.manuallyHidden = false;

        this.init();
    }

    async init() {
        this.updateLoadingText('Initializing Three.js scene...');

        this.setupThreeJS();

        this.updateLoadingText('Creating particle system...');
        this.particleSystem = new ParticleSystem(this.scene, 10000);

        this.updateLoadingText('Initializing hand tracking...');
        this.handTracking = new HandTracking();
        this.gestureController = new GestureController();
        this.handTracking.onReady(() => {
            this.updateLoadingText('Hand tracking ready!');
            this.updateStatus('active', 'Hand tracking active');
            setTimeout(() => this.hideLoading(), 500);
        });

        this.handTracking.onError((error) => {
            console.error('Hand tracking error:', error);
            this.updateStatus('error', 'Camera access denied or unavailable');
            this.updateLoadingText('Camera access denied. Using mouse controls...');
            setTimeout(() => this.hideLoading(), 2000);
            this.setupMouseControls();
        });

        this.handTracking.onResults((results) => {
            this.handleHandResults(results);
        });

        const success = await this.handTracking.init();

        if (!success) {
            this.setupMouseControls();
        }

        this.setupUI();

        this.isRunning = true;
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e27);
        this.scene.fog = new THREE.FogExp2(0x0a0e27, 0.05);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        const canvas = document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const light1 = new THREE.PointLight(0x667eea, 1, 100);
        light1.position.set(5, 5, 5);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xf5576c, 1, 100);
        light2.position.set(-5, -5, 5);
        this.scene.add(light2);
    }

    setupUI() {
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = card.dataset.template;
                this.particleSystem.setTemplate(template);
            });
        });
        const toggleBtn = document.getElementById('toggleUI');
        const uiOverlay = document.getElementById('uiOverlay');

        const toggleUI = () => {
            this.manuallyHidden = !this.manuallyHidden;
            if (this.manuallyHidden) {
                uiOverlay.classList.add('hidden');
                toggleBtn.textContent = '👁️‍🗨️';
            } else {
                uiOverlay.classList.remove('hidden');
                uiOverlay.classList.remove('auto-hide');
                toggleBtn.textContent = '👁️';
            }
        };

        toggleBtn.addEventListener('click', toggleUI);

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'h') {
                toggleUI();
            }
        });
    }

    setupMouseControls() {
        // Fallback mouse controls when hand tracking is unavailable
        let mouseX = 0;
        let mouseY = 0;
        let isMouseDown = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

            // Control color with mouse position
            const hue = (mouseX + 1) / 2;
            this.particleSystem.setColor(hue);

            // Control rotation
            this.particleSystem.setRotation(0, mouseX * Math.PI, 0);
        });

        document.addEventListener('mousedown', () => {
            isMouseDown = true;
        });

        document.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * -0.001;
            const currentExpansion = this.particleSystem.targetExpansion;
            this.particleSystem.setExpansion(currentExpansion + delta);
        }, { passive: false });

        document.addEventListener('keydown', (e) => {
            const templates = ['sphere', 'heart', 'flow', 'saturn', 'fireworks', 'helix', 'cube', 'galaxy'];
            const key = parseInt(e.key);
            if (key >= 1 && key <= templates.length) {
                this.particleSystem.setTemplate(templates[key - 1]);
            }
        });
    }

    handleHandResults(results) {
        const uiOverlay = document.getElementById('uiOverlay');

        // Auto-hide UI when hands are detected (unless manually hidden)
        if (!this.manuallyHidden && uiOverlay) {
            if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                uiOverlay.classList.add('auto-hide');
            } else {
                uiOverlay.classList.remove('auto-hide');
            }
        }

        if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            return;
        }

        const gestures = this.gestureController.processHandResults(results);

        this.particleSystem.setExpansion(gestures.expansion);
        this.particleSystem.setColor(gestures.colorHue);
        this.particleSystem.setRotation(0, gestures.handRotation, 0);

        const currentTemplate = this.gestureController.getCurrentTemplate();
        if (currentTemplate !== this.particleSystem.currentTemplate) {
            this.particleSystem.setTemplate(currentTemplate);
        }
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }

        const time = this.clock.getElapsedTime();
        this.camera.position.x = Math.sin(time * 0.1) * 0.5;
        this.camera.position.y = Math.cos(time * 0.15) * 0.3;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateLoadingText(text) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    updateStatus(status, text) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        if (statusDot) {
            statusDot.classList.remove('active');
            if (status === 'active') {
                statusDot.classList.add('active');
            }
        }

        if (statusText) {
            statusText.textContent = text;
        }
    }

    dispose() {
        this.isRunning = false;

        if (this.particleSystem) {
            this.particleSystem.dispose();
        }

        if (this.handTracking) {
            this.handTracking.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}

export default App;
