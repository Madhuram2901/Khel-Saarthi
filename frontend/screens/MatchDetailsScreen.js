import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const MatchDetailsScreen = ({ route, navigation }) => {
    const { matchId } = route.params;
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const [match, setMatch] = useState(null);
    const [scheduledAt, setScheduledAt] = useState(new Date());
    const [venue, setVenue] = useState('');
    const [scoreA, setScoreA] = useState('');
    const [scoreB, setScoreB] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchMatch(); }, []);

    const fetchMatch = async () => {
        try {
            const { data } = await api.get(`/matches/${matchId}`);
            setMatch(data);
            if (data.scheduledAt) setScheduledAt(new Date(data.scheduledAt));
            setVenue(data.venue || '');
            if (data.scoreA !== null) setScoreA(String(data.scoreA));
            if (data.scoreB !== null) setScoreB(String(data.scoreB));
        } catch (error) { Alert.alert('Error', 'Failed to load match details'); }
    };

    const handleUpdateDetails = async () => {
        try { setLoading(true); await api.put(`/matches/${matchId}`, { scheduledAt: scheduledAt.toISOString(), venue }); Alert.alert('Success', 'Match details updated'); fetchMatch(); } catch (error) { Alert.alert('Error', 'Failed to update match details'); } finally { setLoading(false); }
    };

    const handleEnterResult = async () => {
        if (scoreA === '' || scoreB === '') { Alert.alert('Error', 'Please enter both scores'); return; }
        try { setLoading(true); await api.post(`/matches/${matchId}/result`, { scoreA: parseInt(scoreA), scoreB: parseInt(scoreB) }); Alert.alert('Success', 'Result entered successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]); } catch (error) { Alert.alert('Error', 'Failed to enter result'); } finally { setLoading(false); }
    };

    const formatDateTime = (date) => date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (!match) return <View style={styles.loadingContainer}><Text style={{ color: colors.text }}>Loading...</Text></View>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.matchHeader}>
                <Text style={styles.roundText}>{match.round}</Text>
                <Text style={styles.matchNumber}>Match #{match.matchNo}</Text>
            </View>

            <View style={styles.teamsSection}>
                <View style={styles.teamCard}><View style={styles.teamIcon}><Ionicons name="shield" size={32} color={colors.accent} /></View><Text style={styles.teamName}>{match.teamA?.name || 'TBD'}</Text></View>
                <View style={styles.vsContainer}><Text style={styles.vsText}>VS</Text></View>
                <View style={styles.teamCard}><View style={styles.teamIcon}><Ionicons name="shield" size={32} color="#FF6B6B" /></View><Text style={styles.teamName}>{match.teamB?.name || 'TBD'}</Text></View>
            </View>

            {match.status === 'FINISHED' && (
                <View style={styles.scoreDisplay}><Text style={styles.scoreDisplayText}>{match.scoreA} - {match.scoreB}</Text><Text style={styles.resultLabel}>Final Score</Text></View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Match Details</Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Scheduled Date & Time</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                        <Text style={styles.dateText}>{formatDateTime(scheduledAt)}</Text>
                    </TouchableOpacity>
                </View>
                {showDatePicker && <DateTimePicker value={scheduledAt} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => { setShowDatePicker(false); if (d) { setScheduledAt(d); setShowTimePicker(true); } }} />}
                {showTimePicker && <DateTimePicker value={scheduledAt} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, t) => { setShowTimePicker(false); if (t) setScheduledAt(t); }} />}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venue</Text>
                    <TextInput style={styles.input} placeholder="Enter venue" placeholderTextColor={colors.textSecondary} value={venue} onChangeText={setVenue} />
                </View>
                <TouchableOpacity style={[styles.updateButton, loading && styles.updateButtonDisabled]} onPress={handleUpdateDetails} disabled={loading}>
                    <Text style={styles.updateButtonText}>{loading ? 'Updating...' : 'Update Details'}</Text>
                </TouchableOpacity>
            </View>

            {match.teamA && match.teamB && match.status !== 'FINISHED' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Enter Result</Text>
                    <View style={styles.scoreInputContainer}>
                        <View style={styles.scoreInputGroup}><Text style={styles.scoreLabel}>{match.teamA.name}</Text><TextInput style={styles.scoreInput} placeholder="0" placeholderTextColor={colors.textSecondary} value={scoreA} onChangeText={setScoreA} keyboardType="number-pad" /></View>
                        <Text style={styles.scoreSeparator}>-</Text>
                        <View style={styles.scoreInputGroup}><Text style={styles.scoreLabel}>{match.teamB.name}</Text><TextInput style={styles.scoreInput} placeholder="0" placeholderTextColor={colors.textSecondary} value={scoreB} onChangeText={setScoreB} keyboardType="number-pad" /></View>
                    </View>
                    <TouchableOpacity style={[styles.resultButton, loading && styles.resultButtonDisabled]} onPress={handleEnterResult} disabled={loading}>
                        <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                        <Text style={styles.resultButtonText}>{loading ? 'Submitting...' : 'Submit Result'}</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.statusSection}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <View style={[styles.statusBadge, match.status === 'FINISHED' && styles.finishedBadge, match.status === 'IN_PROGRESS' && styles.inProgressBadge]}>
                        <Text style={styles.statusText}>{match.status}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 20, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    matchHeader: { alignItems: 'center', marginBottom: 24 },
    roundText: { fontSize: 16, fontWeight: '600', color: colors.accent, marginBottom: 4 },
    matchNumber: { fontSize: 14, color: colors.textSecondary },
    teamsSection: { marginBottom: 24 },
    teamCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 },
    teamIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#F0F8FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    teamName: { fontSize: 18, fontWeight: '700', color: colors.text },
    vsContainer: { alignItems: 'center', marginVertical: 8 },
    vsText: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
    scoreDisplay: { backgroundColor: colors.accent, borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 24 },
    scoreDisplayText: { fontSize: 48, fontWeight: '700', color: '#FFF' },
    resultLabel: { fontSize: 14, color: '#FFF', marginTop: 8, opacity: 0.8 },
    section: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
    input: { backgroundColor: colors.surface2, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text },
    dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 12, padding: 16 },
    dateText: { fontSize: 16, color: colors.text, marginLeft: 12 },
    updateButton: { backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    updateButtonDisabled: { opacity: 0.6 },
    updateButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    scoreInputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    scoreInputGroup: { flex: 1, alignItems: 'center' },
    scoreLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, textAlign: 'center' },
    scoreInput: { backgroundColor: colors.surface2, borderRadius: 12, padding: 16, fontSize: 32, fontWeight: '700', textAlign: 'center', width: '100%', color: colors.text },
    scoreSeparator: { fontSize: 32, fontWeight: '700', color: colors.textMuted, marginHorizontal: 16 },
    resultButton: { flexDirection: 'row', backgroundColor: colors.accentGreen, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
    resultButtonDisabled: { opacity: 0.6 },
    resultButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
    statusSection: { backgroundColor: colors.surface, borderRadius: 12, padding: 20 },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statusLabel: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
    statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surface2 },
    finishedBadge: { backgroundColor: isDark ? 'rgba(76,175,80,0.15)' : '#E8F5E9' },
    inProgressBadge: { backgroundColor: isDark ? 'rgba(255,152,0,0.15)' : '#FFF3E0' },
    statusText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});

export default MatchDetailsScreen;
