import ParticleTemplates from './particleTemplates.js';

export class ParticleSystem {
    constructor(scene, particleCount = 10000) {
        this.scene = scene;
        this.particleCount = particleCount;
        this.currentTemplate = 'sphere';
        this.targetPositions = [];
        this.currentPositions = [];
        this.velocities = [];

        this.expansion = 1.0;
        this.targetExpansion = 1.0;
        this.baseHue = 0.6;
        this.targetHue = 0.6;
        this.rotation = { x: 0, y: 0, z: 0 };
        this.targetRotation = { x: 0, y: 0, z: 0 };

        this.morphSpeed = 0.05;
        this.colorSpeed = 0.02;
        this.expansionSpeed = 0.05;
        this.rotationSpeed = 0.03;

        this.init();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        const initialPositions = ParticleTemplates.sphere(this.particleCount, 2);

        for (let i = 0; i < this.particleCount; i++) {
            const pos = initialPositions[i];
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;

            this.currentPositions.push({ ...pos });
            this.targetPositions.push({ ...pos });
            this.velocities.push({ x: 0, y: 0, z: 0 });

            const color = new THREE.Color();
            color.setHSL(this.baseHue, 0.8, 0.6);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleTexture = this.createParticleTexture();

        // Create point material for particles
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
            map: particleTexture
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        this.geometry = geometry;
        this.material = material;
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Create radial gradient for soft circular particles
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    setTemplate(templateName) {
        if (!ParticleTemplates[templateName]) {
            console.warn(`Template ${templateName} not found`);
            return;
        }

        this.currentTemplate = templateName;
        this.targetPositions = ParticleTemplates[templateName](this.particleCount, 2);

        // Update UI
        document.getElementById('templateName').textContent =
            templateName.charAt(0).toUpperCase() + templateName.slice(1);

        // Update template cards
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.template === templateName) {
                card.classList.add('active');
            }
        });
    }

    setExpansion(value) {
        this.targetExpansion = Math.max(0.1, Math.min(3, value));
        document.getElementById('expansionValue').textContent =
            Math.round(this.targetExpansion * 100) + '%';
    }

    setColor(hue) {
        this.targetHue = hue % 1.0;
    }

    setRotation(x, y, z) {
        this.targetRotation.x = x;
        this.targetRotation.y = y;
        this.targetRotation.z = z;
    }

    update(deltaTime) {
        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;

        // Smooth expansion
        this.expansion += (this.targetExpansion - this.expansion) * this.expansionSpeed;

        // Smooth color transition
        this.baseHue += (this.targetHue - this.baseHue) * this.colorSpeed;

        // Smooth rotation
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * this.rotationSpeed;
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * this.rotationSpeed;
        this.rotation.z += (this.targetRotation.z - this.rotation.z) * this.rotationSpeed;

        // Update particles
        for (let i = 0; i < this.particleCount; i++) {
            const current = this.currentPositions[i];
            const target = this.targetPositions[i];
            const velocity = this.velocities[i];

            // Spring physics for smooth morphing
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const dz = target.z - current.z;

            velocity.x += dx * this.morphSpeed;
            velocity.y += dy * this.morphSpeed;
            velocity.z += dz * this.morphSpeed;

            // Damping
            velocity.x *= 0.9;
            velocity.y *= 0.9;
            velocity.z *= 0.9;

            current.x += velocity.x;
            current.y += velocity.y;
            current.z += velocity.z;

            // Apply expansion and rotation
            const expanded = {
                x: current.x * this.expansion,
                y: current.y * this.expansion,
                z: current.z * this.expansion
            };

            // Simple rotation around Y axis
            const cosY = Math.cos(this.rotation.y);
            const sinY = Math.sin(this.rotation.y);
            const rotatedX = expanded.x * cosY - expanded.z * sinY;
            const rotatedZ = expanded.x * sinY + expanded.z * cosY;

            positions[i * 3] = rotatedX;
            positions[i * 3 + 1] = expanded.y;
            positions[i * 3 + 2] = rotatedZ;

            // Update colors with variation
            const hueVariation = Math.sin(i * 0.1 + Date.now() * 0.001) * 0.1;
            const color = new THREE.Color();
            color.setHSL((this.baseHue + hueVariation + 1) % 1, 0.8, 0.6);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.particles);
    }
}

export default ParticleSystem;
