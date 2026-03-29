import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';

const getFullImageUrl = (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
};

const MyTeamScreen = ({ route, navigation }) => {
    const { team, tournamentName } = route.params;
    const readOnly = route.params?.readOnly === true;
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>My Team</Text>
                {!readOnly && (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditTeam', { team, tournamentId: route.params?.tournamentId })}
                    >
                        <Ionicons name="pencil" size={18} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.heroCard}>
                {team?.logoUrl && getFullImageUrl(team.logoUrl) ? (
                    <Image source={{ uri: getFullImageUrl(team.logoUrl) }} style={styles.logo} />
                ) : (
                    <View style={styles.logoFallback}>
                        <Ionicons name="shield-outline" size={30} color={colors.accent} />
                    </View>
                )}

                <Text style={styles.teamName}>{team?.name || 'My Team'}</Text>
                <Text style={styles.tournamentName}>{tournamentName || 'Tournament Team'}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Team Members</Text>
                    <Text style={styles.memberCount}>
                        {team?.players?.length || 0} total
                    </Text>
                </View>

                {(team?.players || []).map((player, index) => (
                    <View key={player?._id || `${player?.name}-${index}`} style={styles.memberRow}>
                        <View style={styles.memberIcon}>
                            <Ionicons name="person-outline" size={18} color={colors.accent} />
                        </View>
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>
                                {player?.name || `Member ${index + 1}`}
                            </Text>
                            <Text style={styles.memberRole}>
                                {player?.role || 'Player'}
                            </Text>
                        </View>
                    </View>
                ))}

                {(!team?.players || team.players.length === 0) && (
                    <Text style={styles.emptyText}>No team members added yet.</Text>
                )}
            </View>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>Back to Tournament</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 16, paddingBottom: 32 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '800', color: colors.text },
    editButton: { backgroundColor: colors.accent, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    heroCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 },
    logo: { width: 84, height: 84, borderRadius: 42, marginBottom: 14 },
    logoFallback: { width: 84, height: 84, borderRadius: 42, backgroundColor: isDark ? 'rgba(0,122,255,0.14)' : '#EAF3FF', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    teamName: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
    tournamentName: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
    section: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    memberCount: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    memberIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.surface2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 15, fontWeight: '600', color: colors.text },
    memberRole: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    emptyText: { fontSize: 14, color: colors.textSecondary },
    backButton: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    backButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default MyTeamScreen;
