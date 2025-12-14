export class HandTracking {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.isInitialized = false;
        this.callbacks = {
            onResults: null,
            onReady: null,
            onError: null
        };
        this.lastResults = null;
    }

    async init() {
        try {
            // Get video element
            this.videoElement = document.getElementById('webcam');

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.hands.onResults((results) => {
                this.lastResults = results;
                if (this.callbacks.onResults) {
                    this.callbacks.onResults(results);
                }
            });

            
            await this.setupCamera();

            this.isInitialized = true;
            if (this.callbacks.onReady) {
                this.callbacks.onReady();
            }

            return true;
        } catch (error) {
            console.error('Hand tracking initialization failed:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
            return false;
        }
    }

    async setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;

            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });

            
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.hands) {
                        await this.hands.send({ image: this.videoElement });
                    }
                },
                width: 1280,
                height: 720
            });

            await this.camera.start();

        } catch (error) {
            console.error('Camera setup failed:', error);
            throw error;
        }
    }

    onResults(callback) {
        this.callbacks.onResults = callback;
    }

    onReady(callback) {
        this.callbacks.onReady = callback;
    }

    onError(callback) {
        this.callbacks.onError = callback;
    }

    getLastResults() {
        return this.lastResults;
    }

    dispose() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}

// Hand landmark indices (MediaPipe Hands)
export const HandLandmarks = {
    WRIST: 0,
    THUMB_CMC: 1,
    THUMB_MCP: 2,
    THUMB_IP: 3,
    THUMB_TIP: 4,
    INDEX_FINGER_MCP: 5,
    INDEX_FINGER_PIP: 6,
    INDEX_FINGER_DIP: 7,
    INDEX_FINGER_TIP: 8,
    MIDDLE_FINGER_MCP: 9,
    MIDDLE_FINGER_PIP: 10,
    MIDDLE_FINGER_DIP: 11,
    MIDDLE_FINGER_TIP: 12,
    RING_FINGER_MCP: 13,
    RING_FINGER_PIP: 14,
    RING_FINGER_DIP: 15,
    RING_FINGER_TIP: 16,
    PINKY_MCP: 17,
    PINKY_PIP: 18,
    PINKY_DIP: 19,
    PINKY_TIP: 20
};

export default HandTracking;
