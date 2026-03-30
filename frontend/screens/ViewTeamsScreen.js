import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const getFullImageUrl = (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
};

const ViewTeamsScreen = ({ route }) => {
    const { tournamentId } = route.params;
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTeam, setExpandedTeam] = useState(null);

    useEffect(() => { fetchTeams(); }, []);

    const fetchTeams = async () => {
        try {
            const { data } = await api.get(`/tournaments/${tournamentId}`);
            setTeams(data.teams || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1, backgroundColor: colors.background }} color={colors.accent} />;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Teams ({teams.length})</Text>

                {teams.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No teams yet</Text>
                    </View>
                ) : (
                    teams.map((team) => (
                        <View key={team._id} style={styles.teamCard}>
                            <TouchableOpacity
                                style={styles.teamHeader}
                                onPress={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}
                            >
                                <View style={styles.teamInfo}>
                                    {team.logoUrl && (
                                        <Image
                                            source={{ uri: getFullImageUrl(team.logoUrl) }}
                                            style={styles.teamLogo}
                                        />
                                    )}
                                    <View style={styles.teamDetails}>
                                        <Text style={styles.teamName}>{team.name}</Text>
                                        <Text style={styles.playerCount}>{team.players?.length || 0} players</Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name={expandedTeam === team._id ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>

                            {expandedTeam === team._id && (
                                <View style={styles.expandedContent}>
                                    <Text style={styles.sectionTitle}>Players</Text>
                                    {team.players && team.players.length > 0 ? (
                                        team.players.map((player, idx) => (
                                            <View key={idx} style={styles.playerItem}>
                                                <Text style={styles.playerName}>{player.name}</Text>
                                                <View style={[styles.roleBadge, { backgroundColor: colors.accent }]}>
                                                    <Text style={styles.roleBadgeText}>{player.role}</Text>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noPlayersText}>No players added yet</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 12,
    },
    teamCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    teamHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    teamInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    teamLogo: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginRight: 12,
    },
    teamDetails: {
        flex: 1,
    },
    teamName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    playerCount: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    expandedContent: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F9F9FB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    playerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    playerName: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
    },
    noPlayersText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});

export default ViewTeamsScreen;
