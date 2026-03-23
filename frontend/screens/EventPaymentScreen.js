import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { createPaymentSession, verifyPayment, checkPaymentStatus } from '../services/paymentService';

// ============================================================
// EventPaymentScreen
// ============================================================
const EventPaymentScreen = ({ route, navigation }) => {
    // ----- Extract params from navigation -----
    const { eventId, eventTitle, entryFee } = route.params;
    const { user } = useContext(AuthContext);

    // ----- State -----
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [hasPaid, setHasPaid] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);

    // ----- Check if user already paid -----
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const result = await checkPaymentStatus(eventId);
                setHasPaid(result.hasPaid);
            } catch (error) {
                console.error('Error checking payment status:', error);
            } finally {
                setChecking(false);
            }
        };
        checkStatus();
    }, [eventId]);

    // ----- Register for event after success -----
    const registerForEvent = async () => {
        try {
            await api.post(`/events/${eventId}/register`);
            Alert.alert(
                '🎉 Payment & Registration Successful!',
                'You have successfully joined the event.',
                [{ text: 'Go to Event', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            const message = error.response?.data?.message || 'Payment handled, but registration error occurred. Please contact support.';
            Alert.alert('Registration Issue', message, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    }

    // ----- Deep Link Listener -----
    useEffect(() => {
        const handleDeepLink = async (event) => {
            const { url } = event;
            console.log('Deep link received:', url);

            if (url.includes('payment-success')) {
                const parsedUrl = Linking.parse(url);
                const { session_id } = parsedUrl.queryParams || {};

                if (session_id) {
                    try {
                        setLoading(true);
                        const result = await verifyPayment({
                            session_id,
                            eventId,
                        });

                        if (result.success) {
                            setPaymentResult('success');
                            setHasPaid(true);
                            // After valid payment from signature, register in Backend:
                            await registerForEvent();
                        }
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        setPaymentResult('failed');
                        Alert.alert('Payment Failed', 'Could not verify your payment. Please contact support.');
                    } finally {
                        setLoading(false);
                    }
                }
            } else if (url.includes('payment-failed')) {
                setPaymentResult('failed');
                Alert.alert('Payment Failed', 'Your payment was not completed. Please try again.');
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, [eventId]);

    // ----- Handle Pay Button Press -----
    const handlePayment = async () => {
        try {
            setLoading(true);
            setPaymentResult(null);

            // Create success/failed deep link URLs using expo-linking
            const successUrl = Linking.createURL('payment-success');
            const failedUrl = Linking.createURL('payment-failed');

            // Create order on our backend
            const sessionData = await createPaymentSession(entryFee, null, eventId, successUrl, failedUrl);

            if (!sessionData.success || !sessionData.paymentUrl) {
                throw new Error('Failed to create payment session');
            }

            // Open the payment page in the system browser
            await WebBrowser.openBrowserAsync(sessionData.paymentUrl, {
                dismissButtonStyle: 'close',
                showTitle: true,
            });

        } catch (error) {
            console.error('Payment error:', error);
            const message = error?.response?.data?.message || error.message || 'Something went wrong';
            Alert.alert('Payment Error', message);
        } finally {
            setLoading(false);
        }
    };

    // ----- Loading State -----
    if (checking) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Checking payment status...</Text>
            </View>
        );
    }

    // ----- Already Paid State -----
    if (hasPaid) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark-circle" size={80} color="#34C759" />
                    </View>
                    <Text style={styles.successTitle}>Already Joined!</Text>
                    <Text style={styles.successSubtitle}>
                        You have already paid ₹{entryFee} and joined this event.
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={20} color="#007AFF" />
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ----- Payment Form -----
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.tournamentHeader}>
                    <Ionicons name="calendar" size={40} color="#FFD93D" />
                    <Text style={styles.tournamentName}>{eventTitle}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Entry Fee</Text>
                    <Text style={styles.feeAmount}>₹{entryFee}</Text>
                </View>
                <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Convenience Fee</Text>
                    <Text style={styles.feeAmount}>₹0</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.feeRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>₹{entryFee}</Text>
                </View>
            </View>

            {paymentResult === 'success' && (
                <View style={styles.resultCard}>
                    <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    <Text style={styles.resultSuccess}>Payment verified successfully!</Text>
                </View>
            )}

            {paymentResult === 'failed' && (
                <View style={[styles.resultCard, styles.resultFailed]}>
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    <Text style={styles.resultFailText}>Payment failed. Please try again.</Text>
                </View>
            )}

            <View style={styles.testBanner}>
                <Ionicons name="information-circle" size={20} color="#6772E5" />
                <Text style={styles.testText}>
                    TEST MODE — Use Stripe Card: 4242 4242 4242 4242
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.payButton, loading && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <>
                        <Ionicons name="card" size={22} color="#FFF" />
                        <Text style={styles.payButtonText}>
                            Pay ₹{entryFee} & Join Event
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={styles.securityRow}>
                <Ionicons name="lock-closed" size={14} color="#999" />
                <Text style={styles.securityText}>
                    Payments are secured by Stripe. We never store your card details.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
    tournamentHeader: { alignItems: 'center', marginBottom: 20 },
    tournamentName: { fontSize: 22, fontWeight: '700', color: '#1D1D1F', marginTop: 12, textAlign: 'center' },
    divider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 16 },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    feeLabel: { fontSize: 16, color: '#666' },
    feeAmount: { fontSize: 16, color: '#1D1D1F', fontWeight: '500' },
    totalLabel: { fontSize: 18, fontWeight: '700', color: '#1D1D1F' },
    totalAmount: { fontSize: 22, fontWeight: '700', color: '#007AFF' },
    resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 16, borderRadius: 12, marginBottom: 16 },
    resultFailed: { backgroundColor: '#FFEBEE' },
    resultSuccess: { color: '#34C759', fontSize: 15, fontWeight: '600', marginLeft: 10 },
    resultFailText: { color: '#FF3B30', fontSize: 15, fontWeight: '600', marginLeft: 10 },
    testBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E6FD', padding: 12, borderRadius: 10, marginBottom: 20 },
    testText: { color: '#6772E5', fontSize: 13, fontWeight: '600', marginLeft: 8 },
    payButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6772E5', padding: 18, borderRadius: 14, marginBottom: 16, shadowColor: '#6772E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    payButtonDisabled: { backgroundColor: '#A0A0A0', shadowOpacity: 0 },
    payButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginLeft: 10 },
    securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    securityText: { color: '#999', fontSize: 12, marginLeft: 6, textAlign: 'center' },
    successIcon: { alignItems: 'center', marginBottom: 16 },
    successTitle: { fontSize: 24, fontWeight: '700', color: '#1D1D1F', textAlign: 'center', marginBottom: 8 },
    successSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
    backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#007AFF' },
    backButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }
});

export default EventPaymentScreen;
