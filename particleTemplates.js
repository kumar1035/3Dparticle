// Particle shape templates
// Each template returns an array of {x, y, z} positions for particles

export const ParticleTemplates = {
    // Sphere template - dynamic sphere with noise
    sphere: (count, scale = 1) => {
        const positions = [];
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
        
        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;
            
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            
            positions.push({
                x: x * scale,
                y: y * scale,
                z: z * scale
            });
        }
        
        return positions;
    },
    
    // Heart template - 3D heart shape
    heart: (count, scale = 1) => {
        const positions = [];
        
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            const s = Math.random() * 2 - 1;
            
            // Parametric heart equation
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            const z = s * 5;
            
            positions.push({
                x: x * scale * 0.05,
                y: (y - 8) * scale * 0.05,
                z: z * scale * 0.05
            });
        }
        
        return positions;
    },
    
    // Flow template - flowing wave patterns
    flow: (count, scale = 1) => {
        const positions = [];
        const gridSize = Math.ceil(Math.sqrt(count));
        
        for (let i = 0; i < count; i++) {
            const x = (i % gridSize) / gridSize * 4 - 2;
            const z = Math.floor(i / gridSize) / gridSize * 4 - 2;
            
            // Create flowing wave pattern
            const wave1 = Math.sin(x * 2) * Math.cos(z * 2);
            const wave2 = Math.cos(x * 1.5) * Math.sin(z * 1.5);
            const y = (wave1 + wave2) * 0.5;
            
            positions.push({
                x: x * scale,
                y: y * scale,
                z: z * scale
            });
        }
        
        return positions;
    },
    
    // Saturn template - planet with rings
    saturn: (count, scale = 1) => {
        const positions = [];
        const planetCount = Math.floor(count * 0.4);
        const ringCount = count - planetCount;
        
        // Create planet sphere
        const phi = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < planetCount; i++) {
            const y = 1 - (i / (planetCount - 1)) * 2;
            const radius = Math.sqrt(1 - y * y) * 0.6;
            const theta = phi * i;
            
            positions.push({
                x: Math.cos(theta) * radius * scale,
                y: y * 0.6 * scale,
                z: Math.sin(theta) * radius * scale
            });
        }
        
        // Create rings
        for (let i = 0; i < ringCount; i++) {
            const angle = (i / ringCount) * Math.PI * 2;
            const ringRadius = 0.8 + Math.random() * 0.6;
            const thickness = (Math.random() - 0.5) * 0.1;
            
            positions.push({
                x: Math.cos(angle) * ringRadius * scale,
                y: thickness * scale,
                z: Math.sin(angle) * ringRadius * scale
            });
        }
        
        return positions;
    },
    
    // Fireworks template - explosive radial patterns
    fireworks: (count, scale = 1) => {
        const positions = [];
        const burstCount = 5;
        const particlesPerBurst = Math.floor(count / burstCount);
        
        for (let burst = 0; burst < burstCount; burst++) {
            const burstCenter = {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                z: (Math.random() - 0.5) * 2
            };
            
            for (let i = 0; i < particlesPerBurst; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const radius = Math.random() * 0.5;
                
                positions.push({
                    x: (burstCenter.x + Math.sin(phi) * Math.cos(theta) * radius) * scale,
                    y: (burstCenter.y + Math.sin(phi) * Math.sin(theta) * radius) * scale,
                    z: (burstCenter.z + Math.cos(phi) * radius) * scale
                });
            }
        }
        
        return positions;
    },
    
    // Helix template - DNA-like double helix
    helix: (count, scale = 1) => {
        const positions = [];
        const strands = 2;
        
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 8;
            const strand = i % strands;
            const offset = (strand / strands) * Math.PI * 2;
            
            const radius = 0.5;
            const x = Math.cos(t + offset) * radius;
            const z = Math.sin(t + offset) * radius;
            const y = (i / count) * 4 - 2;
            
            positions.push({
                x: x * scale,
                y: y * scale,
                z: z * scale
            });
        }
        
        return positions;
    },
    
    // Cube template - particles forming a cube
    cube: (count, scale = 1) => {
        const positions = [];
        const side = Math.ceil(Math.pow(count, 1/3));
        
        for (let i = 0; i < count; i++) {
            const x = (i % side) / side * 2 - 1;
            const y = (Math.floor(i / side) % side) / side * 2 - 1;
            const z = (Math.floor(i / (side * side)) % side) / side * 2 - 1;
            
            positions.push({
                x: x * scale,
                y: y * scale,
                z: z * scale
            });
        }
        
        return positions;
    },
    
    // Galaxy template - spiral galaxy
    galaxy: (count, scale = 1) => {
        const positions = [];
        const arms = 3;
        
        for (let i = 0; i < count; i++) {
            const arm = i % arms;
            const t = (i / count) * Math.PI * 4;
            const armOffset = (arm / arms) * Math.PI * 2;
            
            const radius = t * 0.3;
            const angle = t + armOffset;
            
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.2;
            const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.2;
            const y = (Math.random() - 0.5) * 0.3;
            
            positions.push({
                x: x * scale,
                y: y * scale,
                z: z * scale
            });
        }
        
        return positions;
    }
};

export default ParticleTemplates;
