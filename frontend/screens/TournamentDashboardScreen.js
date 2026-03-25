import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Image, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TournamentDashboardScreen = ({ route, navigation }) => {
    const { tournamentId } = route.params;
    const { user } = useContext(AuthContext);
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => { fetchTournamentData(); }, [tournamentId]);

    const fetchTournamentData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/tournaments/${tournamentId}`);
            setTournament(data.tournament); setTeams(data.teams); setMatches(data.matches); setStandings(data.standings);
        } catch (error) { Alert.alert('Error', 'Failed to load tournament data'); } finally { setLoading(false); }
    };

    const handleShare = async () => {
        try {
            const { data } = await api.post(`/tournaments/${tournamentId}/share-link`);
            await Share.share({ message: `Check out this tournament on Khel Saarthi: ${data.shareUrl}`, url: data.shareUrl, title: tournament.name });
        } catch (error) { Alert.alert('Error', 'Failed to share tournament'); }
    };

    const handlePublishToggle = async () => {
        const action = tournament.status === 'DRAFT' ? 'publish' : 'unpublish';
        Alert.alert(`${action.charAt(0).toUpperCase() + action.slice(1)} Tournament`, `Are you sure you want to ${action} this tournament?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: action.charAt(0).toUpperCase() + action.slice(1), onPress: async () => { const { data } = await api.post(`/tournaments/${tournamentId}/publish`); setTournament(data); Alert.alert('Success', `Tournament ${action}ed successfully`); } },
        ]);
    };

    const handleDeleteTournament = () => {
        Alert.alert('Delete Tournament', 'Are you sure? This will delete all teams, matches, and standings.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { try { await api.delete(`/tournaments/${tournamentId}`); Alert.alert('Success', 'Tournament deleted', [{ text: 'OK', onPress: () => navigation.goBack() }]); } catch (error) { Alert.alert('Error', 'Failed to delete tournament'); } } },
        ]);
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (!tournament) return <View style={styles.loadingContainer}><Text style={{ color: colors.text }}>Loading...</Text></View>;

    const isHost = tournament.host._id === user._id;
    const tabs = [
        { key: 'overview', label: 'Overview', icon: 'information-circle-outline' },
        { key: 'teams', label: 'Teams', icon: 'people-outline' },
        { key: 'fixtures', label: 'Fixtures', icon: 'list-outline' },
        { key: 'standings', label: 'Standings', icon: 'trophy-outline' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.tournamentName}>{tournament.name}</Text>
                        <Text style={styles.sport}>{tournament.sport}</Text>
                    </View>
                    {isHost && (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={styles.moreButton} onPress={handleShare}><Ionicons name="share-social-outline" size={24} color={colors.accent} /></TouchableOpacity>
                            <TouchableOpacity style={styles.moreButton} onPress={() => Alert.alert('Tournament Options', '', [{ text: tournament.status === 'DRAFT' ? 'Publish' : 'Unpublish', onPress: handlePublishToggle }, { text: 'Delete', style: 'destructive', onPress: handleDeleteTournament }, { text: 'Cancel', style: 'cancel' }])}><Ionicons name="ellipsis-horizontal" size={24} color={colors.accent} /></TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, tournament.status === 'PUBLISHED' ? styles.publishedBadge : styles.draftBadge]}>
                        <Text style={[styles.statusText, tournament.status === 'PUBLISHED' ? styles.publishedText : styles.draftText]}>{tournament.status}</Text>
                    </View>
                    <Text style={styles.dateRange}>{fmtDate(tournament.startDate)} - {fmtDate(tournament.endDate)}</Text>
                </View>
            </View>

            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}>
                        <Ionicons name={tab.icon} size={20} color={activeTab === tab.key ? colors.accent : colors.textSecondary} />
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTournamentData} />}>
                {activeTab === 'overview' && (
                    <View style={styles.overviewContainer}>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}><Ionicons name="people" size={32} color={colors.accent} /><Text style={styles.statValue}>{teams.length}</Text><Text style={styles.statLabel}>Teams</Text></View>
                            <View style={styles.statCard}><Ionicons name="calendar" size={32} color="#FF6B6B" /><Text style={styles.statValue}>{matches.length}</Text><Text style={styles.statLabel}>Matches</Text></View>
                            <View style={styles.statCard}><Ionicons name="trophy" size={32} color="#FFD93D" /><Text style={styles.statValue}>{tournament.format.replace(/_/g, ' ')}</Text><Text style={styles.statLabel}>Format</Text></View>
                        </View>
                        {isHost && teams.length > 0 && matches.length === 0 && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('GenerateFixtures', { tournamentId })}>
                                <Ionicons name="git-network" size={24} color="#FFF" /><Text style={styles.actionButtonText}>Generate Fixtures</Text>
                            </TouchableOpacity>
                        )}
                        {tournament.venues?.length > 0 && (
                            <View style={styles.infoSection}><Text style={styles.infoTitle}>Venues</Text>
                                {tournament.venues.map((v, i) => <View key={i} style={styles.venueItem}><Ionicons name="location" size={16} color={colors.textSecondary} /><Text style={styles.venueText}>{v}</Text></View>)}
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'teams' && (
                    <View style={styles.teamsContainer}>
                        {isHost && <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ManageTeams', { tournamentId })}><Ionicons name="add-circle" size={24} color={colors.accent} /><Text style={styles.addButtonText}>Manage Teams</Text></TouchableOpacity>}
                        {teams.map((team) => (
                            <View key={team._id} style={styles.teamCard}>
                                {team.logoUrl ? <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} /> : <View style={styles.teamIcon}><Ionicons name="shield" size={24} color={colors.accent} /></View>}
                                <Text style={styles.teamName}>{team.name}</Text>
                            </View>
                        ))}
                        {teams.length === 0 && <View style={styles.emptyState}><Ionicons name="people-outline" size={64} color={colors.textMuted} /><Text style={styles.emptyText}>No teams added yet</Text></View>}
                    </View>
                )}

                {activeTab === 'fixtures' && (
                    <View style={styles.fixturesContainer}>
                        {matches.length > 0 ? matches.map((match) => (
                            <TouchableOpacity key={match._id} style={styles.matchCard} onPress={() => isHost && navigation.navigate('MatchDetails', { matchId: match._id })}>
                                <Text style={styles.matchRound}>{match.round}</Text>
                                <View style={styles.matchTeams}><Text style={styles.teamNameInMatch}>{match.teamA?.name || 'TBD'}</Text><Text style={styles.vs}>vs</Text><Text style={styles.teamNameInMatch}>{match.teamB?.name || 'TBD'}</Text></View>
                                {match.status === 'FINISHED' && <View style={styles.scoreRow}><Text style={styles.score}>{match.scoreA} - {match.scoreB}</Text></View>}
                                <View style={styles.matchFooter}><Text style={styles.matchStatus}>{match.status}</Text>{match.venue && <Text style={styles.matchVenue}>{match.venue}</Text>}</View>
                            </TouchableOpacity>
                        )) : <View style={styles.emptyState}><Ionicons name="calendar-outline" size={64} color={colors.textMuted} /><Text style={styles.emptyText}>No fixtures generated yet</Text></View>}
                    </View>
                )}

                {activeTab === 'standings' && (
                    <View style={styles.standingsContainer}>
                        {standings.length > 0 ? (
                            <View style={styles.standingsTable}>
                                <View style={styles.tableHeader}><Text style={[styles.tableHeaderText, { flex: 2 }]}>Team</Text><Text style={styles.tableHeaderText}>P</Text><Text style={styles.tableHeaderText}>W</Text><Text style={styles.tableHeaderText}>D</Text><Text style={styles.tableHeaderText}>L</Text><Text style={styles.tableHeaderText}>Pts</Text></View>
                                {standings.map((s, i) => <View key={s._id} style={styles.tableRow}><Text style={[styles.tableCell, { flex: 2 }]}>{i + 1}. {s.team.name}</Text><Text style={styles.tableCell}>{s.played}</Text><Text style={styles.tableCell}>{s.won}</Text><Text style={styles.tableCell}>{s.draw}</Text><Text style={styles.tableCell}>{s.lost}</Text><Text style={[styles.tableCell, styles.pointsCell]}>{s.points}</Text></View>)}
                            </View>
                        ) : <View style={styles.emptyState}><Ionicons name="trophy-outline" size={64} color={colors.textMuted} /><Text style={styles.emptyText}>{tournament.format === 'KNOCKOUT' ? 'No standings for knockout format' : 'No standings available yet'}</Text></View>}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { backgroundColor: colors.surface, padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    headerLeft: { flex: 1 },
    tournamentName: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 4 },
    sport: { fontSize: 16, color: colors.textSecondary },
    moreButton: { padding: 4 },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    publishedBadge: { backgroundColor: isDark ? 'rgba(76,175,80,0.15)' : '#E8F5E9' },
    draftBadge: { backgroundColor: isDark ? 'rgba(255,152,0,0.15)' : '#FFF3E0' },
    statusText: { fontSize: 12, fontWeight: '600' },
    publishedText: { color: '#4CAF50' },
    draftText: { color: '#FF9800' },
    dateRange: { fontSize: 14, color: colors.textSecondary },
    tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: colors.accent },
    tabLabel: { fontSize: 14, color: colors.textSecondary, marginLeft: 6, fontWeight: '500' },
    tabLabelActive: { color: colors.accent, fontWeight: '600' },
    content: { flex: 1 },
    overviewContainer: { padding: 16 },
    statsGrid: { flexDirection: 'row', marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    statValue: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 8 },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    actionButton: { flexDirection: 'row', backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    infoSection: { backgroundColor: colors.surface, borderRadius: 12, padding: 16 },
    infoTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
    venueItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    venueText: { fontSize: 14, color: colors.textSecondary, marginLeft: 8 },
    teamsContainer: { padding: 16 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: colors.accent, borderStyle: 'dashed' },
    addButtonText: { color: colors.accent, fontSize: 16, fontWeight: '600', marginLeft: 8 },
    teamCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
    teamIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#F0F8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    teamName: { fontSize: 16, fontWeight: '600', color: colors.text },
    teamLogo: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    fixturesContainer: { padding: 16 },
    matchCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
    matchRound: { fontSize: 12, fontWeight: '600', color: colors.accent, marginBottom: 8 },
    matchTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    teamNameInMatch: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
    vs: { fontSize: 12, color: colors.textMuted, marginHorizontal: 8 },
    scoreRow: { alignItems: 'center', marginBottom: 8 },
    score: { fontSize: 18, fontWeight: '700', color: colors.accent },
    matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    matchStatus: { fontSize: 12, color: colors.textSecondary },
    matchVenue: { fontSize: 12, color: colors.textSecondary },
    standingsContainer: { padding: 16 },
    standingsTable: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', backgroundColor: colors.surface2, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    tableHeaderText: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },
    tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.surface2 },
    tableCell: { flex: 1, fontSize: 14, color: colors.text, textAlign: 'center' },
    pointsCell: { fontWeight: '700', color: colors.accent },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 16 },
});

export default TournamentDashboardScreen;
