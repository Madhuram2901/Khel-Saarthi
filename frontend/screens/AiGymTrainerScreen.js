import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

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
  squat: { landmarks: [23, 24, 25, 26, 27, 28], thresholds: { depth: 100, stand: 160 } },
  pushup: { landmarks: [11, 12, 13, 14, 15, 16], thresholds: { down: 90, up: 160 } },
  plank: { landmarks: [11, 23, 27], thresholds: { straight: 170 } }
};

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

class ExerciseCounter {
    constructor(exerciseType) { this.type = exerciseType || null; this.reset(); }
    reset() { this.count = 0; this.state = 'up'; this.feedback = 'Get Ready'; this.holding = false; this.holdStartTime = 0; }
    setExercise(type) { this.type = type; this.reset(); }
    analyze(landmarks) {
        if (!this.type) return { count: 0, feedback: '', repCompleted: false };
        if (this.type === 'squat') return this.analyzeSquat(landmarks);
        if (this.type === 'pushup') return this.analyzePushUp(landmarks);
        if (this.type === 'plank') return this.analyzePlank(landmarks);
        return { count: this.count, feedback: 'Unknown exercise' };
    }
    analyzeSquat(landmarks) {
        const leftHip = landmarks[23]; const leftKnee = landmarks[25]; const leftAnkle = landmarks[27];
        if (!leftHip || !leftKnee || !leftAnkle) return { count: this.count, feedback: "No pose" };
        if (leftHip.visibility < 0.5 || leftKnee.visibility < 0.5) return { count: this.count, feedback: "Visible?" };
        const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const { depth, stand } = EXERCISE_CONFIG.squat.thresholds;
        let currentFeedback = ""; let repCompleted = false;
        if (angle < depth) { this.state = 'down'; currentFeedback = "Good depth!"; }
        else if (angle > stand) {
            if (this.state === 'down') { this.count++; this.state = 'up'; repCompleted = true; }
            if (!repCompleted) currentFeedback = "Start next rep"; else currentFeedback = "Good!";
        } else { if (this.state === 'up') currentFeedback = "Squat lower"; else currentFeedback = "Push up"; }
        return { count: this.count, feedback: currentFeedback, angle: Math.round(angle), repCompleted };
    }
    analyzePushUp(landmarks) {
        const shoulder = landmarks[11]; const elbow = landmarks[13]; const wrist = landmarks[15];
        if (!shoulder || !elbow || !wrist) return { count: this.count, feedback: "No pose" };
        if (shoulder.visibility < 0.5 || elbow.visibility < 0.5) return { count: this.count, feedback: "Visible?" };
        const angle = calculateAngle(shoulder, elbow, wrist);
        const { down, up } = EXERCISE_CONFIG.pushup.thresholds;
        let currentFeedback = ""; let repCompleted = false;
        if (angle < down) { this.state = 'down'; currentFeedback = "Deep enough!"; }
        else if (angle > up) {
            if (this.state === 'down') { this.count++; this.state = 'up'; repCompleted = true; }
            if (!repCompleted) currentFeedback = "Go down"; else currentFeedback = "Strong!";
        } else { if (this.state === 'up') currentFeedback = "Lower body"; else currentFeedback = "Push back up"; }
        return { count: this.count, feedback: currentFeedback, angle: Math.round(angle), repCompleted };
    }
    analyzePlank(landmarks) {
        const shoulder = landmarks[11]; const hip = landmarks[23]; const ankle = landmarks[27];
        if (!shoulder || !hip || !ankle) return { count: this.count, feedback: "No pose" };
        const angle = calculateAngle(shoulder, hip, ankle);
        const isStraight = angle > 165 && angle < 195;
        let currentFeedback = "";
        if (isStraight) {
            if (!this.holding) { this.holding = true; this.holdStartTime = Date.now(); }
            const duration = Math.floor((Date.now() - this.holdStartTime) / 1000);
            this.count = duration; currentFeedback = "Hold it!";
        } else { this.holding = false; if (angle < 165) currentFeedback = "Raise hips!"; else currentFeedback = "Lower hips!"; }
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
  if(currentFacingMode === 'user') { canvasCtx.scale(-1, 1); canvasCtx.translate(-canvasElement.width, 0); }
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
pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
pose.onResults(onResults);

async function startCamera(facingMode = 'user') {
    if (camera) await camera.stop();
    currentFacingMode = facingMode;
    if (facingMode === 'user') videoElement.style.transform = 'scaleX(-1)';
    else videoElement.style.transform = 'scaleX(1)';
    try {
        camera = new Camera(videoElement, { onFrame: async () => { await pose.send({image: videoElement}); }, width: 640, height: 480, facingMode: facingMode });
        await camera.start();
    } catch (e) {
        if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', message: e.message})); }
    }
}
startCamera('user');

window.addEventListener('message', (event) => {
    try {
        const message = JSON.parse(event.data);
        if (message.type === 'toggleCamera') { const newMode = currentFacingMode === 'user' ? 'environment' : 'user'; startCamera(newMode); }
        else if (message.type === 'setExercise') { counter.setExercise(message.data); }
    } catch(e) {}
});

function resizeCanvas() { canvasElement.width = window.innerWidth; canvasElement.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
</script>
</body>
</html>
`;

const EXERCISES = [
    { key: 'squat',  label: 'Squats',    sub: 'Legs & Glutes',   icon: 'body',    color: '#FF6B6B' },
    { key: 'pushup', label: 'Push-Ups',  sub: 'Chest & Arms',    icon: 'fitness', color: '#4ECDC4' },
    { key: 'plank',  label: 'Plank',     sub: 'Core Stability',  icon: 'timer',   color: '#A29BFE' },
];

const AiGymTrainerScreen = ({ navigation }) => {
    const [currentExercise, setCurrentExercise] = useState(null);
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Ready?');
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [showSheet, setShowSheet] = useState(false);

    const lastRepCount = useRef(0);
    const webViewRef = useRef(null);
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (permission && !permission.granted) requestPermission();
    }, [permission]);

    const speak = (text) => Speech.speak(text, { language: 'en', rate: 1.0 });

    const handleWebViewMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'analysis') {
                if (!isSessionActive) return;
                const { count, feedback, repCompleted } = message.data;
                setReps(count);
                setFeedback(feedback);
                if (repCompleted && count > lastRepCount.current) {
                    lastRepCount.current = count;
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    speak(count.toString());
                    if (count === 8) {
                        speak('Great job! Set complete.');
                        setIsSessionActive(false);
                        setShowSheet(false);
                        Alert.alert('Goal Met!', 'You completed 8 reps!');
                        if (webViewRef.current) {
                            webViewRef.current.postMessage(JSON.stringify({ type: 'setExercise', data: null }));
                        }
                    }
                }
            } else if (message.type === 'error') {
                console.error('WebView Error:', message.message);
            }
        } catch (e) {
            console.error('Failed to parse message', e);
        }
    };

    const toggleCamera = () => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'toggleCamera' }));
        }
    };

    const selectExercise = (exercise) => {
        setShowSheet(false);
        setCurrentExercise(exercise);
        setIsSessionActive(true);
        setReps(0);
        setFeedback('Get into position');
        lastRepCount.current = 0;
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'setExercise', data: exercise }));
        }
    };

    const resetSession = () => {
        setIsSessionActive(false);
        setShowSheet(false);
        setCurrentExercise(null);
        setReps(0);
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'setExercise', data: null }));
        }
    };

    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
        return (
            <SafeAreaView style={[styles.container, styles.permissionContainer]}>
                <View style={styles.permissionIcon}>
                    <Ionicons name="camera-outline" size={40} color="#8E8E93" />
                </View>
                <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                <Text style={styles.permissionSub}>
                    The AI Trainer needs your camera to analyze your form in real time.
                </Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Allow Camera</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera WebView — always mounted */}
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

            {/* ── IN-SESSION OVERLAY ── */}
            {isSessionActive && (
                <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                    <View style={styles.sessionHeader}>
                        <TouchableOpacity onPress={resetSession} style={styles.glassButton}>
                            <Ionicons name="chevron-back" size={20} color="#FFF" />
                        </TouchableOpacity>

                        {/* Tap pill to switch exercise */}
                        <TouchableOpacity
                            style={styles.exercisePill}
                            onPress={() => setShowSheet(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.exercisePillText}>
                                {EXERCISES.find(e => e.key === currentExercise)?.label ?? currentExercise?.toUpperCase()}
                            </Text>
                            <Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={toggleCamera} style={styles.glassButton}>
                            <Ionicons name="camera-reverse-outline" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>REPS</Text>
                            <Text style={styles.statValue}>{reps}</Text>
                        </View>
                        <View style={[styles.statCard, styles.feedbackCard]}>
                            <Text style={styles.statLabel}>FEEDBACK</Text>
                            <Text style={styles.feedbackValue}>{feedback}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            )}

            {/* ── EXERCISE SELECTION SHEET ──
                Visible when: no active session yet, OR user tapped the pill mid-session */}
            {(!isSessionActive || showSheet) && (
                <View style={styles.sheetOverlay}>
                    <View style={styles.sheet}>
                        <View style={styles.sheetHandle} />

                        <View style={styles.sheetHeader}>
                            <View>
                                <Text style={styles.sheetTitle}>Choose Exercise</Text>
                                <Text style={styles.sheetSubtitle}>AI Trainer will analyze your form</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => isSessionActive ? setShowSheet(false) : navigation.goBack()}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={18} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.exerciseList}>
                            {EXERCISES.map((ex, index) => (
                                <TouchableOpacity
                                    key={ex.key}
                                    style={[
                                        styles.exerciseRow,
                                        index < EXERCISES.length - 1 && styles.exerciseRowBorder,
                                        currentExercise === ex.key && styles.exerciseRowActive,
                                    ]}
                                    onPress={() => selectExercise(ex.key)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.exerciseIcon, { backgroundColor: ex.color }]}>
                                        <Ionicons name={ex.icon} size={22} color="#FFF" />
                                    </View>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseLabel}>{ex.label}</Text>
                                        <Text style={styles.exerciseSub}>{ex.sub}</Text>
                                    </View>
                                    {currentExercise === ex.key
                                        ? <Ionicons name="checkmark" size={18} color="#007AFF" />
                                        : <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                                    }
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    // ── PERMISSION ──
    permissionContainer: { backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', padding: 32 },
    permissionIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    permissionTitle: { fontSize: 22, fontWeight: '700', color: '#1D1D1F', marginBottom: 10, textAlign: 'center' },
    permissionSub: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    permissionButton: { backgroundColor: '#007AFF', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
    permissionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

    // ── WEBVIEW ──
    webview: { flex: 1, backgroundColor: '#000' },

    // ── IN-SESSION OVERLAY ──
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
    sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 48 : 16 },
    glassButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    exercisePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    exercisePillText: { color: '#FFF', fontWeight: '600', fontSize: 14, letterSpacing: 0.5 },
    statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
    statCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 16, alignItems: 'center', minWidth: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
    feedbackCard: { flex: 1 },
    statLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 1.2, marginBottom: 6 },
    statValue: { fontSize: 44, fontWeight: '700', color: '#1D1D1F', lineHeight: 48 },
    feedbackValue: { fontSize: 17, fontWeight: '600', color: '#1D1D1F', textAlign: 'center' },

    // ── SELECTION SHEET ──
    sheetOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
    sheet: { backgroundColor: '#F2F2F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Platform.OS === 'ios' ? 40 : 28 },
    sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#C7C7CC', alignSelf: 'center', marginTop: 10, marginBottom: 4 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
    sheetTitle: { fontSize: 22, fontWeight: '700', color: '#1D1D1F', marginBottom: 4 },
    sheetSubtitle: { fontSize: 13, color: '#8E8E93' },
    closeButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center', marginTop: 4 },

    // ── EXERCISE LIST ──
    exerciseList: { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 14 },
    exerciseRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA' },
    exerciseRowActive: { backgroundColor: '#F0F6FF' },
    exerciseIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    exerciseInfo: { flex: 1 },
    exerciseLabel: { fontSize: 16, fontWeight: '600', color: '#1D1D1F', marginBottom: 2 },
    exerciseSub: { fontSize: 13, color: '#8E8E93' },
});

export default AiGymTrainerScreen;
