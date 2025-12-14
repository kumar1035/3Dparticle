import { HandLandmarks } from './handTracking.js';

export class GestureController {
    constructor() {
        this.smoothingFactor = 0.3;
        this.previousGestures = {
            pinchDistance: 0,
            handHeight: 0.5,
            fingerCount: 0,
            handRotation: 0
        };

        this.currentGestures = {
            pinchDistance: 0,
            handHeight: 0.5,
            fingerCount: 0,
            handRotation: 0,
            expansion: 1.0,
            colorHue: 0.6,
            templateIndex: 0
        };

        this.templates = ['sphere', 'heart', 'flow', 'saturn', 'fireworks', 'helix', 'cube', 'galaxy'];
        this.lastTemplateChange = 0;
        this.templateChangeDelay = 2000;


        this.fingerCountHistory = [];
        this.fingerCountHistorySize = 10;
        this.stableFingerCount = 0;
    }

    processHandResults(results) {
        if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            return this.currentGestures;
        }

        const handLandmarks = results.multiHandLandmarks[0];


        const pinchDistance = this.calculatePinchDistance(handLandmarks);
        const handHeight = this.calculateHandHeight(handLandmarks);
        const fingerCount = this.countExtendedFingers(handLandmarks);
        const handRotation = this.calculateHandRotation(handLandmarks);


        this.previousGestures.pinchDistance = this.smooth(
            this.previousGestures.pinchDistance,
            pinchDistance
        );
        this.previousGestures.handHeight = this.smooth(
            this.previousGestures.handHeight,
            handHeight
        );
        this.previousGestures.handRotation = this.smooth(
            this.previousGestures.handRotation,
            handRotation
        );


        this.currentGestures.expansion = this.mapRange(
            this.previousGestures.pinchDistance,
            0, 0.3,
            0.3, 2.5
        );


        this.currentGestures.colorHue = this.previousGestures.handHeight;


        this.updateFingerCountHistory(fingerCount);
        const stableCount = this.getStableFingerCount();

        if (stableCount !== this.stableFingerCount) {
            const now = Date.now();
            if (now - this.lastTemplateChange > this.templateChangeDelay) {
                this.stableFingerCount = stableCount;
                this.previousGestures.fingerCount = stableCount;
                this.currentGestures.templateIndex = Math.max(0, Math.min(stableCount - 1, this.templates.length - 1));
                this.lastTemplateChange = now;
                console.log(`Template changed to: ${this.templates[this.currentGestures.templateIndex]} (${stableCount} fingers)`);
            }
        }


        this.currentGestures.handRotation = this.previousGestures.handRotation;

        return this.currentGestures;
    }

    updateFingerCountHistory(count) {
        this.fingerCountHistory.push(count);
        if (this.fingerCountHistory.length > this.fingerCountHistorySize) {
            this.fingerCountHistory.shift();
        }
    }

    getStableFingerCount() {
        if (this.fingerCountHistory.length < this.fingerCountHistorySize) {
            return this.stableFingerCount;
        }


        const counts = {};
        this.fingerCountHistory.forEach(count => {
            counts[count] = (counts[count] || 0) + 1;
        });


        let maxCount = 0;
        let mostCommon = this.stableFingerCount;
        for (const [count, frequency] of Object.entries(counts)) {
            if (frequency > maxCount) {
                maxCount = frequency;
                mostCommon = parseInt(count);
            }
        }


        if (maxCount >= this.fingerCountHistorySize * 0.7) {
            return mostCommon;
        }

        return this.stableFingerCount;
    }

    calculatePinchDistance(landmarks) {
        const thumb = landmarks[HandLandmarks.THUMB_TIP];
        const index = landmarks[HandLandmarks.INDEX_FINGER_TIP];

        const dx = thumb.x - index.x;
        const dy = thumb.y - index.y;
        const dz = thumb.z - index.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    calculateHandHeight(landmarks) {
        const wrist = landmarks[HandLandmarks.WRIST];
        // Invert Y because screen coordinates are inverted
        return 1 - wrist.y;
    }

    countExtendedFingers(landmarks) {
        let count = 0;

        const thumbTip = landmarks[HandLandmarks.THUMB_TIP];
        const thumbIP = landmarks[HandLandmarks.THUMB_IP];
        const wrist = landmarks[HandLandmarks.WRIST];

        const thumbTipDist = this.distance3D(thumbTip, wrist);
        const thumbIPDist = this.distance3D(thumbIP, wrist);

        if (thumbTipDist > thumbIPDist * 1.15) count++;

        const fingerTips = [
            HandLandmarks.INDEX_FINGER_TIP,
            HandLandmarks.MIDDLE_FINGER_TIP,
            HandLandmarks.RING_FINGER_TIP,
            HandLandmarks.PINKY_TIP
        ];

        const fingerMCPs = [
            HandLandmarks.INDEX_FINGER_MCP,
            HandLandmarks.MIDDLE_FINGER_MCP,
            HandLandmarks.RING_FINGER_MCP,
            HandLandmarks.PINKY_MCP
        ];

        for (let i = 0; i < fingerTips.length; i++) {
            const tip = landmarks[fingerTips[i]];
            const mcp = landmarks[fingerMCPs[i]];

            if (tip.y < mcp.y - 0.08) {
                count++;
            }
        }

        return count;
    }

    calculateHandRotation(landmarks) {
        const wrist = landmarks[HandLandmarks.WRIST];
        const middleMCP = landmarks[HandLandmarks.MIDDLE_FINGER_MCP];

        const dx = middleMCP.x - wrist.x;
        const dy = middleMCP.y - wrist.y;

        return Math.atan2(dy, dx);
    }

    distance3D(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    smooth(previous, current) {
        return previous + (current - previous) * this.smoothingFactor;
    }

    mapRange(value, inMin, inMax, outMin, outMax) {
        const clamped = Math.max(inMin, Math.min(inMax, value));
        return outMin + (clamped - inMin) * (outMax - outMin) / (inMax - inMin);
    }

    getCurrentTemplate() {
        return this.templates[this.currentGestures.templateIndex];
    }

    getGestures() {
        return this.currentGestures;
    }
}

export default GestureController;
