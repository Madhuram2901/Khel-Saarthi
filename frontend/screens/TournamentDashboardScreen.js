import React, { useState, useContext, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Image, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const getFullImageUrl = (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    // API URL is http://ip:5001/api, so strip /api and append the relative path
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
};

const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value._id || value.id || value.userId || null;
    return null;
};

const collectionIncludesUser = (items, userId) => {
    if (!Array.isArray(items) || !userId) return false;
    return items.some((item) => {
        if (!item) return false;
        if (typeof item === 'string') return item === userId;
        return normalizeId(item) === userId || normalizeId(item.user) === userId || normalizeId(item.userId) === userId || normalizeId(item.player) === userId || normalizeId(item.participant) === userId;
    });
};

const teamBelongsToUser = (team, userId) => {
    if (!team || !userId) return false;
    return normalizeId(team.owner) === userId || normalizeId(team.createdBy) === userId || normalizeId(team.user) === userId || normalizeId(team.userId) === userId || normalizeId(team.captain) === userId || normalizeId(team.manager) === userId || collectionIncludesUser(team.players, userId) || collectionIncludesUser(team.members, userId) || collectionIncludesUser(team.participants, userId);
};

const resolveMyTeam = (tournament, teams, userId) => {
    const directTeam = tournament?.myTeam || tournament?.registeredTeam || tournament?.userTeam || null;
    if (directTeam) return directTeam;
    return (teams || []).find((team) => teamBelongsToUser(team, userId)) || null;
};

const resolveIsRegistered = (tournament, myTeam, userId) => {
    if (tournament?.isRegistered || myTeam) return true;
    return collectionIncludesUser(tournament?.registeredParticipants, userId) || collectionIncludesUser(tournament?.participants, userId) || collectionIncludesUser(tournament?.registeredUsers, userId);
};

const TournamentDashboardScreen = ({ route, navigation }) => {
    const { tournamentId } = route.params;
    const { user } = useContext(AuthContext);
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedTeamId, setExpandedTeamId] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            fetchTournamentData();
        }, [tournamentId, user?._id])
    );

    useEffect(() => {
        if (!route.params?.createdTeam) return;
        const createdTeam = route.params.createdTeam;
        setMyTeam(createdTeam);
        setIsRegistered(true);
        setTeams((currentTeams) => {
            const exists = currentTeams.some((team) => normalizeId(team) === normalizeId(createdTeam));
            if (exists) {
                return currentTeams.map((team) => normalizeId(team) === normalizeId(createdTeam) ? { ...team, ...createdTeam } : team);
            }
            return [createdTeam, ...currentTeams];
        });
    }, [route.params?.createdTeam]);

    const fetchTournamentData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/tournaments/${tournamentId}`);
            const tournamentData = data.tournament || data;
            const paramCreatedTeam = route.params?.createdTeam;
            const fetchedTeams = data.teams || tournamentData.teams || [];
            const teamsData =
                paramCreatedTeam &&
                !fetchedTeams.some(
                    (team) =>
                        normalizeId(team) === normalizeId(paramCreatedTeam)
                )
                    ? [paramCreatedTeam, ...fetchedTeams]
                    : fetchedTeams;
            const matchesData = data.matches || tournamentData.matches || [];
            const standingsData = data.standings || tournamentData.standings || [];
            const nextMyTeam =
                resolveMyTeam(tournamentData, teamsData, user?._id) ||
                paramCreatedTeam ||
                null;
            setTournament(tournamentData);
            setTeams(teamsData);
            setMatches(matchesData);
            setStandings(standingsData);
            setMyTeam(nextMyTeam);
            setIsRegistered(resolveIsRegistered(tournamentData, nextMyTeam, user?._id));
        } catch (error) {
            console.error('Error loading tournament data:', error);
            Alert.alert('Error', 'Failed to load tournament data');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterTeam = () => {
        navigation.navigate('CreateTeam', {
            tournamentId,
            tournamentName: tournament?.name,
        });
    };

    const handleViewMyTeam = () => {
        if (!myTeam) {
            Alert.alert('Team not found', 'Your registered team could not be loaded yet.');
            return;
        }

        navigation.navigate('MyTeam', {
            team: myTeam,
            tournamentId,
            tournamentName: tournament?.name,
            readOnly: true,
        });
    };

    const handleShare = async () => {
        try {
            const { data } = await api.post(`/tournaments/${tournamentId}/share-link`);
            await Share.share({ message: `Check out this tournament on Khel Saarthi: ${data.shareUrl}`, url: data.shareUrl, title: tournament.name });
        } catch (error) {
            Alert.alert('Error', 'Failed to share tournament');
        }
    };

    const handlePublishToggle = async () => {
        const action = tournament.status === 'DRAFT' ? 'publish' : 'unpublish';
        Alert.alert(`${action.charAt(0).toUpperCase() + action.slice(1)} Tournament`, `Are you sure you want to ${action} this tournament?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: action.charAt(0).toUpperCase() + action.slice(1),
                onPress: async () => {
                    try {
                        const { data } = await api.post(`/tournaments/${tournamentId}/publish`);
                        setTournament(data);
                        Alert.alert('Success', `Tournament ${action}ed successfully`);
                    } catch (error) {
                        Alert.alert('Error', `Failed to ${action} tournament`);
                    }
                },
            },
        ]);
    };

    const handleDeleteTournament = () => {
        Alert.alert('Delete Tournament', 'Are you sure? This will delete all teams, matches, and standings.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/tournaments/${tournamentId}`);
                        Alert.alert('Success', 'Tournament deleted', [{ text: 'OK', onPress: () => navigation.goBack() }]);
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete tournament');
                    }
                },
            },
        ]);
    };

    const handleDeleteTeam = (teamId, teamName) => {
        Alert.alert('Delete Team', `Are you sure you want to delete "${teamName}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/tournaments/${tournamentId}/teams/${teamId}`);
                        fetchTournamentData();
                        Alert.alert('Success', 'Team deleted');
                    } catch (error) {
                        Alert.alert('Error', error.response?.data?.message || 'Failed to delete team');
                    }
                },
            },
        ]);
    };

    const toggleTeamExpanded = (teamId) => {
        setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
    };

    const fmtDate = (dateValue) => new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (!tournament) return <View style={styles.loadingContainer}><Text style={{ color: colors.text }}>Loading...</Text></View>;

    // Fix: Proper host check handling both object and string IDs
    const isHost =
        tournament?.isHost === true ||
        String(tournament?.host?._id || tournament?.host) === String(user?._id);
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
                        <View style={styles.headerActions}>
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
                            <View style={styles.statCard}><Ionicons name="trophy" size={32} color="#FFD93D" /><Text style={styles.statValue} adjustsFontSizeToFit={true} numberOfLines={2} minimumFontScale={0.6}>{tournament.format.replace(/_/g, ' ')}</Text><Text style={styles.statLabel}>Format</Text></View>
                        </View>
                        {!isHost && !isRegistered && (
                            <TouchableOpacity style={styles.primaryCta} onPress={handleRegisterTeam}>
                                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                                <Text style={styles.primaryCtaText}>Register Team</Text>
                            </TouchableOpacity>
                        )}
                        {!isHost && isRegistered && (
                            <TouchableOpacity style={styles.primaryCta} onPress={handleViewMyTeam}>
                                <Ionicons name="eye-outline" size={20} color="#FFF" />
                                <Text style={styles.primaryCtaText}>View My Team</Text>
                            </TouchableOpacity>
                        )}
                        {!isHost && isRegistered && myTeam && (
                            <View style={styles.registrationSummary}>
                                <Text style={styles.registrationSummaryTitle}>Registered Team</Text>
                                <Text style={styles.registrationSummaryText}>
                                    {myTeam.name}
                                </Text>
                            </View>
                        )}
                        {tournament.venues?.length > 0 && (
                            <View style={styles.infoSection}>
                                <Text style={styles.infoTitle}>Venues</Text>
                                {tournament.venues.map((venue, index) => (
                                    <View key={`${venue}-${index}`} style={styles.venueItem}>
                                        <Ionicons name="location" size={16} color={colors.textSecondary} />
                                        <Text style={styles.venueText}>{venue}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {isHost && (
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTournament}>
                                <Ionicons name="trash-outline" size={20} color="#FFF" />
                                <Text style={styles.deleteButtonText}>Delete Tournament</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {activeTab === 'teams' && (
                    <View style={styles.teamsContainer}>
                        {teams.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={64} color={colors.textMuted} />
                                <Text style={styles.emptyText}>No teams added yet</Text>
                            </View>
                        ) : (
                            teams.map((team) => (
                                <View key={team._id || normalizeId(team) || team.name} style={styles.teamCardExpanded}>
                                    <View style={styles.teamCardHeader}>
                                        <View style={styles.teamCardLeft}>
                                            {team.logoUrl && getFullImageUrl(team.logoUrl) ? (
                                                <Image source={{ uri: getFullImageUrl(team.logoUrl) }} style={styles.teamLogoSmall} />
                                            ) : (
                                                <View style={styles.teamIconSmall}>
                                                    <Ionicons name="shield" size={20} color={colors.accent} />
                                                </View>
                                            )}
                                            <View style={styles.teamHeaderInfo}>
                                                <Text style={styles.teamNameExpanded}>{team.name}</Text>
                                                <Text style={styles.teamMemberCount}>{team.players?.length || 0} members</Text>
                                            </View>
                                        </View>
                                        <View style={styles.teamCardActions}>
                                            {isHost && (
                                                <TouchableOpacity
                                                    style={styles.deleteIconButton}
                                                    onPress={() => handleDeleteTeam(team._id, team.name)}
                                                >
                                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                style={styles.expandButton}
                                                onPress={() => toggleTeamExpanded(team._id)}
                                            >
                                                <Ionicons
                                                    name={expandedTeamId === team._id ? 'chevron-up' : 'chevron-down'}
                                                    size={24}
                                                    color={colors.accent}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {expandedTeamId === team._id && (
                                        <View style={styles.teamPlayersSection}>
                                            {team.players && team.players.length > 0 ? (
                                                team.players.map((player, index) => (
                                                    <View key={index} style={styles.playerRow}>
                                                        <View style={styles.playerInfo}>
                                                            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                                                            <Text style={styles.playerName}>
                                                                {player.name || `Player ${index + 1}`}
                                                            </Text>
                                                        </View>
                                                        {player.role && (
                                                            <View style={styles.playerRoleBadge}>
                                                                <Text style={styles.playerRoleText}>{player.role}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={styles.noPlayersText}>No players added</Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
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
                                {standings.map((standing, index) => <View key={standing._id} style={styles.tableRow}><Text style={[styles.tableCell, { flex: 2 }]}>{index + 1}. {standing.team.name}</Text><Text style={styles.tableCell}>{standing.played}</Text><Text style={styles.tableCell}>{standing.won}</Text><Text style={styles.tableCell}>{standing.draw}</Text><Text style={styles.tableCell}>{standing.lost}</Text><Text style={[styles.tableCell, styles.pointsCell]}>{standing.points}</Text></View>)}
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
    headerActions: { flexDirection: 'row' },
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
    statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', marginHorizontal: 4, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
    statValue: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 8, textAlign: 'center' },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    actionButton: { flexDirection: 'row', backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    infoSection: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
    infoTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
    venueItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    venueText: { fontSize: 14, color: colors.textSecondary, marginLeft: 8 },
    primaryCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 16 },
    primaryCtaText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
    registrationSummary: { marginTop: 14, padding: 16, borderRadius: 12, backgroundColor: colors.surface },
    registrationSummaryTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
    registrationSummaryText: { fontSize: 18, fontWeight: '700', color: colors.text },
    teamsContainer: { padding: 16 },
    hostActionsRow: { flexDirection: 'row', marginBottom: 18 },
    hostPrimaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, marginRight: 8 },
    hostPrimaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700', marginLeft: 8 },
    hostSecondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.accent, paddingVertical: 14, marginLeft: 8 },
    hostSecondaryButtonText: { color: colors.accent, fontSize: 15, fontWeight: '700', marginLeft: 8 },
    userTeamSection: { marginBottom: 18 },
    userActionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, marginBottom: 14 },
    userActionButtonMuted: { backgroundColor: colors.accentGreen || colors.accent },
    userActionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
    myTeamCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16 },
    myTeamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    myTeamTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    myTeamLinkText: { fontSize: 14, fontWeight: '700', color: colors.accent },
    myTeamName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
    myTeamMeta: { fontSize: 13, color: colors.textSecondary, marginBottom: 10 },
    myTeamMember: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    myTeamMemberText: { fontSize: 14, color: colors.textSecondary, marginLeft: 8 },
    sectionHeading: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
    teamCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
    teamIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#F0F8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    teamLogo: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    teamDetails: { flex: 1 },
    teamName: { fontSize: 16, fontWeight: '600', color: colors.text },
    teamMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    registeredBadge: { backgroundColor: isDark ? 'rgba(52,199,89,0.18)' : '#E8F5E9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
    registeredBadgeText: { color: colors.accentGreen || '#34C759', fontSize: 12, fontWeight: '700' },
    addTeamButton: { flexDirection: 'row', backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    addTeamButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700', marginLeft: 8 },
    teamCardExpanded: { backgroundColor: colors.surface, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    teamCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
    teamCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    teamLogoSmall: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
    teamIconSmall: { width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#F0F8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    teamHeaderInfo: { flex: 1 },
    teamNameExpanded: { fontSize: 16, fontWeight: '700', color: colors.text },
    teamMemberCount: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    teamCardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    deleteIconButton: { padding: 8 },
    expandButton: { padding: 8 },
    teamPlayersSection: { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F9F9FB', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
    playerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
    playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    playerName: { fontSize: 14, color: colors.text, marginLeft: 8 },
    playerRoleBadge: { backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    playerRoleText: { fontSize: 11, color: '#FFF', fontWeight: '600' },
    noPlayersText: { fontSize: 14, color: colors.textSecondary, fontStyle: 'italic', paddingVertical: 8 },
    deleteButton: { flexDirection: 'row', backgroundColor: '#FF3B30', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    deleteButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700', marginLeft: 8 },
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
    emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 16, textAlign: 'center' },
});

export default TournamentDashboardScreen;
