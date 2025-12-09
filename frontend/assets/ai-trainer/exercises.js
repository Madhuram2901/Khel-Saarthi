export const EXERCISE_CONFIG = {
    squat: {
        // MediaPipe Pose landmarks
        // 23: left_hip, 24: right_hip
        // 25: left_knee, 26: right_knee
        // 27: left_ankle, 28: right_ankle
        landmarks: [23, 24, 25, 26, 27, 28],
        thresholds: {
            depth: 100, // Angle at knee for valid squat (degrees). Lower is deeper.
            stand: 160, // Angle at knee to be considered standing.
        },
        tips: {
            deeper: "Squat deeper!",
            good: "Good form!",
            stand: "Stand up fully."
        }
    }
};

/**
 * Calculates angle between three points (A, B, C) where B is the vertex.
 */
function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
}

export class SquatCounter {
    constructor() {
        this.stage = "UP"; // UP, DOWN
        this.reps = 0;
        this.feedback = "Stand ready";
    }

    process(landmarks) {
        if (!landmarks) return null;

        // Use Left side for now (or average)
        // 23: hip, 25: knee, 27: ankle
        const leftHip = landmarks[23];
        const leftKnee = landmarks[25];
        const leftAnkle = landmarks[27];

        // Visibility check
        if (leftHip.visibility < 0.5 || leftKnee.visibility < 0.5 || leftAnkle.visibility < 0.5) {
            return {
                reps: this.reps,
                feedback: "Adjust Camera to see full body",
                stage: this.stage
            };
        }

        const angle = calculateAngle(leftHip, leftKnee, leftAnkle);

        // State machine
        if (angle > EXERCISE_CONFIG.squat.thresholds.stand) {
            this.stage = "UP";
        }

        if (angle < EXERCISE_CONFIG.squat.thresholds.depth && this.stage === "UP") {
            this.stage = "DOWN";
            this.reps += 1;
            this.feedback = EXERCISE_CONFIG.squat.tips.good;
            // Provide immediate feedback about depth if it's barely there? 
            // For now, simpler: Count when going DOWN (or count on way UP for stricter reps?)
            // Standard is: Start UP -> Go DOWN -> Return UP = 1 rep.
            // Let's change logic: Count when returning to UP after being DOWN.
        }

        // Revised Logic for Full Rep
        // If currently UP and angle < depth, switch to DOWN.
        // If currently DOWN and angle > stand, switch to UP and increment.

        // However, the above 'this.stage' update was naive. Let's fix it.
    }
}

// Improved Class for usage in trainer.html
export class ExerciseCounter {
    constructor(exerciseType) {
        this.type = exerciseType;
        this.count = 0;
        this.state = 'up'; // 'up' or 'down'
        this.feedback = '';
    }

    reset() {
        this.count = 0;
        this.state = 'up';
        this.feedback = '';
    }

    analyze(landmarks) {
        if (this.type === 'squat') {
            return this.analyzeSquat(landmarks);
        }
        return { count: this.count, feedback: 'Unknown exercise' };
    }

    analyzeSquat(landmarks) {
        const leftHip = landmarks[23];
        const leftKnee = landmarks[25];
        const leftAnkle = landmarks[27];

        if (!leftHip || !leftKnee || !leftAnkle) return { count: this.count, feedback: "No pose" };

        if (leftHip.visibility < 0.5 || leftKnee.visibility < 0.5 || leftAnkle.visibility < 0.5) {
            return { count: this.count, feedback: "Body not fully visible" };
        }

        const angle = calculateAngle(leftHip, leftKnee, leftAnkle);

        // Squat logic
        // 1. Stand straight (angle > 160) -> State 'up'
        // 2. Go down (angle < 100) -> State 'down'
        // 3. Go back up (> 160) -> if State was 'down', Count++

        const STAND_THRESH = 160;
        const DEPTH_THRESH = 100;

        let currentFeedback = "";

        if (angle < DEPTH_THRESH) {
            this.state = 'down';
            currentFeedback = "Good depth!";
        } else if (angle > STAND_THRESH) {
            if (this.state === 'down') {
                this.count++;
                this.state = 'up';
                currentFeedback = "Rep complete!";
            } else {
                currentFeedback = "Start next rep";
            }
        } else {
            // In between
            if (this.state === 'up') currentFeedback = "Go lower...";
            else currentFeedback = "Push up!";
        }

        return {
            count: this.count,
            feedback: currentFeedback,
            angle: Math.round(angle)
        };
    }
}
