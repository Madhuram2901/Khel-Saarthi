import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/api';

const MatchDetailsScreen = ({ route, navigation }) => {
    const { matchId } = route.params;
    const [match, setMatch] = useState(null);
    const [scheduledAt, setScheduledAt] = useState(new Date());
    const [venue, setVenue] = useState('');
    const [scoreA, setScoreA] = useState('');
    const [scoreB, setScoreB] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMatch();
    }, []);

    const fetchMatch = async () => {
        try {
            const { data } = await api.get(`/matches/${matchId}`);
            setMatch(data);
            if (data.scheduledAt) {
                setScheduledAt(new Date(data.scheduledAt));
            }
            setVenue(data.venue || '');
            if (data.scoreA !== null) setScoreA(String(data.scoreA));
            if (data.scoreB !== null) setScoreB(String(data.scoreB));
        } catch (error) {
            console.error('Error fetching match:', error);
            Alert.alert('Error', 'Failed to load match details');
        }
    };

    const handleUpdateDetails = async () => {
        try {
            setLoading(true);
            await api.put(`/matches/${matchId}`, {
                scheduledAt: scheduledAt.toISOString(),
                venue,
            });
            Alert.alert('Success', 'Match details updated');
            fetchMatch();
        } catch (error) {
            console.error('Error updating match:', error);
            Alert.alert('Error', 'Failed to update match details');
        } finally {
            setLoading(false);
        }
    };

    const handleEnterResult = async () => {
        if (scoreA === '' || scoreB === '') {
            Alert.alert('Error', 'Please enter both scores');
            return;
        }

        try {
            setLoading(true);
            await api.post(`/matches/${matchId}/result`, {
                scoreA: parseInt(scoreA),
                scoreB: parseInt(scoreB),
            });
            Alert.alert('Success', 'Result entered successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Error entering result:', error);
            Alert.alert('Error', 'Failed to enter result');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!match) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.matchHeader}>
                <Text style={styles.roundText}>{match.round}</Text>
                <Text style={styles.matchNumber}>Match #{match.matchNo}</Text>
            </View>

            <View style={styles.teamsSection}>
                <View style={styles.teamCard}>
                    <View style={styles.teamIcon}>
                        <Ionicons name="shield" size={32} color="#007AFF" />
                    </View>
                    <Text style={styles.teamName}>{match.teamA?.name || 'TBD'}</Text>
                </View>

                <View style={styles.vsContainer}>
                    <Text style={styles.vsText}>VS</Text>
                </View>

                <View style={styles.teamCard}>
                    <View style={styles.teamIcon}>
                        <Ionicons name="shield" size={32} color="#FF6B6B" />
                    </View>
                    <Text style={styles.teamName}>{match.teamB?.name || 'TBD'}</Text>
                </View>
            </View>

            {match.status === 'FINISHED' && (
                <View style={styles.scoreDisplay}>
                    <Text style={styles.scoreDisplayText}>
                        {match.scoreA} - {match.scoreB}
                    </Text>
                    <Text style={styles.resultLabel}>Final Score</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Match Details</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Scheduled Date & Time</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                        <Text style={styles.dateText}>{formatDateTime(scheduledAt)}</Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={scheduledAt}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                setScheduledAt(selectedDate);
                                setShowTimePicker(true);
                            }
                        }}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={scheduledAt}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (selectedTime) {
                                setScheduledAt(selectedTime);
                            }
                        }}
                    />
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venue</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter venue"
                        value={venue}
                        onChangeText={setVenue}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                    onPress={handleUpdateDetails}
                    disabled={loading}
                >
                    <Text style={styles.updateButtonText}>
                        {loading ? 'Updating...' : 'Update Details'}
                    </Text>
                </TouchableOpacity>
            </View>

            {match.teamA && match.teamB && match.status !== 'FINISHED' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Enter Result</Text>

                    <View style={styles.scoreInputContainer}>
                        <View style={styles.scoreInputGroup}>
                            <Text style={styles.scoreLabel}>{match.teamA.name}</Text>
                            <TextInput
                                style={styles.scoreInput}
                                placeholder="0"
                                value={scoreA}
                                onChangeText={setScoreA}
                                keyboardType="number-pad"
                            />
                        </View>

                        <Text style={styles.scoreSeparator}>-</Text>

                        <View style={styles.scoreInputGroup}>
                            <Text style={styles.scoreLabel}>{match.teamB.name}</Text>
                            <TextInput
                                style={styles.scoreInput}
                                placeholder="0"
                                value={scoreB}
                                onChangeText={setScoreB}
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.resultButton, loading && styles.resultButtonDisabled]}
                        onPress={handleEnterResult}
                        disabled={loading}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                        <Text style={styles.resultButtonText}>
                            {loading ? 'Submitting...' : 'Submit Result'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.statusSection}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            match.status === 'FINISHED' && styles.finishedBadge,
                            match.status === 'IN_PROGRESS' && styles.inProgressBadge,
                        ]}
                    >
                        <Text style={styles.statusText}>{match.status}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    matchHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    roundText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 4,
    },
    matchNumber: {
        fontSize: 14,
        color: '#666',
    },
    teamsSection: {
        marginBottom: 24,
    },
    teamCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 12,
    },
    teamIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    teamName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    vsContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    vsText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#999',
    },
    scoreDisplay: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    scoreDisplayText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#FFF',
    },
    resultLabel: {
        fontSize: 14,
        color: '#FFF',
        marginTop: 8,
        opacity: 0.8,
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1D1D1F',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
    },
    dateText: {
        fontSize: 16,
        color: '#1D1D1F',
        marginLeft: 12,
    },
    updateButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    updateButtonDisabled: {
        opacity: 0.6,
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    scoreInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    scoreInputGroup: {
        flex: 1,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    scoreInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        width: '100%',
    },
    scoreSeparator: {
        fontSize: 32,
        fontWeight: '700',
        color: '#999',
        marginHorizontal: 16,
    },
    resultButton: {
        flexDirection: 'row',
        backgroundColor: '#34C759',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultButtonDisabled: {
        opacity: 0.6,
    },
    resultButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    statusSection: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    finishedBadge: {
        backgroundColor: '#E8F5E9',
    },
    inProgressBadge: {
        backgroundColor: '#FFF3E0',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
});

export default MatchDetailsScreen;
