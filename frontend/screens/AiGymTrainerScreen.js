import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';

// ... (previous imports)

const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Gym Trainer</title>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <style>
    body { margin: 0; padding: 0; background-color: #000; overflow: hidden; }
    #video-container { position: relative; width: 100vw; height: 100vh; }
    video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
    canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
  </style>
</head>
<body>
<div id="video-container">
  <video id="input_video" playsinline webkit-playsinline></video>
  <canvas id="output_canvas"></canvas>
</div>
<script>
const EXERCISE_CONFIG = {
  squat: {
    landmarks: [23, 24, 25, 26, 27, 28], // hips, knees, ankles
    thresholds: { depth: 100, stand: 160 }
  },
  pushup: {
    landmarks: [11, 12, 13, 14, 15, 16], // shoulders, elbows, wrists
    thresholds: { down: 90, up: 160 }
  },
  plank: {
    landmarks: [11, 23, 27], // shoulder, hip, ankle
    thresholds: { straight: 170 } // Angle should be ~180
  }
};

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

class ExerciseCounter {
    constructor(exerciseType) {
        this.type = exerciseType || null;
        this.reset();
    }

    reset() {
        this.count = 0;
        this.state = 'up'; 
        this.feedback = 'Get Ready';
        this.holding = false;
        this.holdStartTime = 0;
    }

    setExercise(type) {
        this.type = type;
        this.reset();
    }

    analyze(landmarks) {
        if (!this.type) return { count: 0, feedback: '', repCompleted: false };
        if (this.type === 'squat') return this.analyzeSquat(landmarks);
        if (this.type === 'pushup') return this.analyzePushUp(landmarks);
        if (this.type === 'plank') return this.analyzePlank(landmarks);
        return { count: this.count, feedback: 'Unknown exercise' };
    }

    analyzeSquat(landmarks) {
        const leftHip = landmarks[23];
        const leftKnee = landmarks[25];
        const leftAnkle = landmarks[27];
        
        if (!leftHip || !leftKnee || !leftAnkle) return { count: this.count, feedback: "No pose" };
        if (leftHip.visibility < 0.5 || leftKnee.visibility < 0.5) return { count: this.count, feedback: "Visible?" };

        const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const { depth, stand } = EXERCISE_CONFIG.squat.thresholds;

        let currentFeedback = "";
        let repCompleted = false;

        if (angle < depth) {
            this.state = 'down';
            currentFeedback = "Good depth!";
        } else if (angle > stand) {
            if (this.state === 'down') {
                this.count++;
                this.state = 'up';
                repCompleted = true;
            }
            if (!repCompleted) currentFeedback = "Start next rep";
            else currentFeedback = "Good!";
        } else {
            if (this.state === 'up') currentFeedback = "Squat lower";
            else currentFeedback = "Push up";
        }
        return { count: this.count, feedback: currentFeedback, angle: Math.round(angle), repCompleted };
    }

    analyzePushUp(landmarks) {
        // Use left arm: 11(sho), 13(elb), 15(wri)
        const shoulder = landmarks[11];
        const elbow = landmarks[13];
        const wrist = landmarks[15];

        if (!shoulder || !elbow || !wrist) return { count: this.count, feedback: "No pose" };
        if (shoulder.visibility < 0.5 || elbow.visibility < 0.5) return { count: this.count, feedback: "Visible?" };

        const angle = calculateAngle(shoulder, elbow, wrist);
        const { down, up } = EXERCISE_CONFIG.pushup.thresholds;
        
        let currentFeedback = "";
        let repCompleted = false;

        if (angle < down) {
            this.state = 'down';
            currentFeedback = "Deep enough!";
        } else if (angle > up) {
            if (this.state === 'down') {
                this.count++;
                this.state = 'up';
                repCompleted = true;
            }
             if (!repCompleted) currentFeedback = "Go down";
             else currentFeedback = "Strong!";
        } else {
             if (this.state === 'up') currentFeedback = "Lower body";
             else currentFeedback = "Push back up";
        }
        return { count: this.count, feedback: currentFeedback, angle: Math.round(angle), repCompleted };
    }

    analyzePlank(landmarks) {
        // Shoulder(11), Hip(23), Ankle(27) alignment
        const shoulder = landmarks[11];
        const hip = landmarks[23];
        const ankle = landmarks[27];

        if (!shoulder || !hip || !ankle) return { count: this.count, feedback: "No pose" };
        
        const angle = calculateAngle(shoulder, hip, ankle);
        // Straight is 180. Allow 160-200? Or just > 165
        const isStraight = angle > 165 && angle < 195;

        let currentFeedback = "";

        if (isStraight) {
            if (!this.holding) {
                this.holding = true;
                this.holdStartTime = Date.now();
            }
            // Count seconds
            const duration = Math.floor((Date.now() - this.holdStartTime) / 1000);
            this.count = duration; // Reps = Seconds for plank
            currentFeedback = "Hold formatting!";
        } else {
            this.holding = false;
            if (angle < 165) currentFeedback = "Raise hips!";
            else currentFeedback = "Lower hips!";
        }
        return { count: this.count, feedback: currentFeedback, angle: Math.round(angle) };
    }
}

const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

let camera = null;
let counter = new ExerciseCounter(null);
let currentFacingMode = 'user'; 

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if(currentFacingMode === 'user') {
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvasElement.width, 0);
  }
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
    drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
    
    const analysis = counter.analyze(results.poseLandmarks);
    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'analysis', data: analysis }));
    }
  }
  canvasCtx.restore();
}

const pose = new Pose({locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/pose/\${file}\`});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);

async function startCamera(facingMode = 'user') {
    if (camera) await camera.stop();
    currentFacingMode = facingMode;
    if (facingMode === 'user') videoElement.style.transform = 'scaleX(-1)';
    else videoElement.style.transform = 'scaleX(1)';

    try {
        camera = new Camera(videoElement, {
          onFrame: async () => { await pose.send({image: videoElement}); },
          width: 640,
          height: 480,
          facingMode: facingMode
        });
        await camera.start();
    } catch (e) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', message: e.message}));
        }
    }
}

startCamera('user');

window.addEventListener('message', (event) => {
    try {
        const message = JSON.parse(event.data);
        if (message.type === 'toggleCamera') {
            const newMode = currentFacingMode === 'user' ? 'environment' : 'user';
            startCamera(newMode);
        } else if (message.type === 'setExercise') {
            counter.setExercise(message.data);
        }
    } catch(e) {}
});

function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
</script>
</body>
</html>
`;

// ... imports
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const AiGymTrainerScreen = ({ navigation }) => {
    const [currentExercise, setCurrentExercise] = useState(null); // 'squat', 'pushup', 'plank'
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState("Ready?");
    const [isSessionActive, setIsSessionActive] = useState(false);

    // Audio / Haptics State
    const lastRepCount = useRef(0);

    const webViewRef = useRef(null);
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const speak = (text) => {
        Speech.speak(text, { language: 'en', rate: 1.0 });
    };

    const handleWebViewMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'analysis') {
                // Ignore analysis if session is not active
                if (!isSessionActive) return;

                const { count, feedback, repCompleted } = message.data;

                setReps(count);
                setFeedback(feedback);

                // Handle Events
                if (repCompleted && count > lastRepCount.current) {
                    lastRepCount.current = count;
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    speak(count.toString());

                    if (count === 8) {
                        speak("Great job! Set complete.");
                        setIsSessionActive(false);
                        Alert.alert("Goal Met!", "You completed 8 reps!");
                        // Stop analysis in webview
                        if (webViewRef.current) {
                            webViewRef.current.postMessage(JSON.stringify({ type: 'setExercise', data: null }));
                        }
                    }
                }
            } else if (message.type === 'error') {
                console.error("WebView Error:", message.message);
            }
        } catch (e) {
            console.error("Failed to parse message", e);
        }
    };

    const toggleCamera = () => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'toggleCamera' }));
        }
    };

    const selectExercise = (exercise) => {
        setCurrentExercise(exercise);
        setIsSessionActive(true);
        setReps(0);
        setFeedback("Get into position");
        lastRepCount.current = 0;

        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'setExercise', data: exercise }));
        }
    };

    const resetSession = () => {
        setIsSessionActive(false);
        setCurrentExercise(null);
        setReps(0);
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'setExercise', data: null }));
        }
    };

    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ textAlign: 'center', color: 'white', marginBottom: 20 }}>Camera permission required</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* WebView */}
            <WebView
                ref={webViewRef}
                style={styles.webview}
                source={{ html: HTML_CONTENT, baseUrl: 'https://localhost' }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onMessage={handleWebViewMessage}
                originWhitelist={['*']}
                androidLayerType="hardware"
                mixedContentMode="always"
                onPermissionRequest={(event) => event.grant()}
            />

            {/* In-Session Overlay */}
            {isSessionActive && (
                <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                    <View style={styles.header}>
                        <TouchableOpacity onPress={resetSession} style={styles.backButton}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.exerciseTag}>
                            <Text style={styles.exerciseTitle}>{currentExercise?.toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity onPress={toggleCamera} style={styles.backButton}>
                            <Ionicons name="camera-reverse" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>REPS</Text>
                            <Text style={styles.statValue}>{reps}</Text>
                        </View>
                        <View style={[styles.statBox, styles.feedbackBox]}>
                            <Text style={styles.statLabel}>FEEDBACK</Text>
                            <Text style={styles.feedbackText}>{feedback}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            )}

            {/* Selection Modal (Active when not in session) */}
            {!isSessionActive && (
                <View style={styles.modalOverlay}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.8)', '#000000']}
                        style={styles.modalContent}
                    >
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeModalButton}>
                            <Ionicons name="close-circle" size={32} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Choose Exercise</Text>
                        <Text style={styles.modalSubtitle}>AI Trainer will analyze your form</Text>

                        <View style={styles.grid}>
                            <TouchableOpacity style={styles.card} onPress={() => selectExercise('squat')}>
                                <LinearGradient colors={['#FF6B6B', '#EE5253']} style={styles.cardGradient}>
                                    <Ionicons name="body" size={40} color="white" />
                                    <Text style={styles.cardText}>Squats</Text>
                                    <Text style={styles.cardSub}>Legs & Glutes</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.card} onPress={() => selectExercise('pushup')}>
                                <LinearGradient colors={['#4ECDC4', '#22A6B3']} style={styles.cardGradient}>
                                    <Ionicons name="fitness" size={40} color="white" />
                                    <Text style={styles.cardText}>Push-Ups</Text>
                                    <Text style={styles.cardSub}>Chest & Arms</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.card} onPress={() => selectExercise('plank')}>
                                <LinearGradient colors={['#A29BFE', '#6C5CE7']} style={styles.cardGradient}>
                                    <Ionicons name="timer" size={40} color="white" />
                                    <Text style={styles.cardText}>Plank</Text>
                                    <Text style={styles.cardSub}>Core Stability</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    webview: { flex: 1, backgroundColor: '#000' },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 40 : 0 },
    backButton: { padding: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20 },
    exerciseTag: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15 },
    exerciseTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    statsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 40, gap: 15 },
    statBox: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 20, padding: 20, alignItems: 'center', minWidth: 110, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
    feedbackBox: { flex: 1, maxWidth: 220 },
    statLabel: { fontSize: 12, fontWeight: '800', color: '#888', letterSpacing: 1, marginBottom: 5 },
    statValue: { fontSize: 42, fontWeight: 'bold', color: '#2D3436' },
    feedbackText: { fontSize: 18, fontWeight: '700', color: '#D63031', textAlign: 'center' },

    // Modal Styles
    modalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    modalContent: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', padding: 20 },
    closeModalButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    modalTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 10 },
    modalSubtitle: { fontSize: 16, color: '#AAA', marginBottom: 40 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
    card: { width: 140, height: 160, borderRadius: 25, overflow: 'hidden', elevation: 5 },
    cardGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
    cardText: { fontSize: 18, fontWeight: 'bold', color: 'white', marginTop: 15 },
    cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
    button: { padding: 15, backgroundColor: '#007AFF', borderRadius: 10, marginTop: 20 },
    buttonText: { color: 'white', fontWeight: 'bold' }
});

export default AiGymTrainerScreen;
