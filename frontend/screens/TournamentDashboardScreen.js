import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Image,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import AuthContext from '../context/AuthContext';

const TournamentDashboardScreen = ({ route, navigation }) => {
    const { tournamentId } = route.params;
    const { user } = useContext(AuthContext);
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchTournamentData();
    }, [tournamentId]);

    const fetchTournamentData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/tournaments/${tournamentId}`);
            setTournament(data.tournament);
            setTeams(data.teams);
            setMatches(data.matches);
            setStandings(data.standings);
        } catch (error) {
            console.error('Error fetching tournament:', error);
            Alert.alert('Error', 'Failed to load tournament data');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            const { data } = await api.post(`/tournaments/${tournamentId}/share-link`);

            await Share.share({
                message: `Check out this tournament on Khel Saarthi: ${data.shareUrl}`,
                url: data.shareUrl,
                title: tournament.name
            });
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Error', 'Failed to share tournament');
        }
    };

    const handlePublishToggle = async () => {
        try {
            const action = tournament.status === 'DRAFT' ? 'publish' : 'unpublish';
            Alert.alert(
                `${action.charAt(0).toUpperCase() + action.slice(1)} Tournament`,
                `Are you sure you want to ${action} this tournament?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: action.charAt(0).toUpperCase() + action.slice(1),
                        onPress: async () => {
                            const { data } = await api.post(`/tournaments/${tournamentId}/publish`);
                            setTournament(data);
                            Alert.alert('Success', `Tournament ${action}ed successfully`);
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error toggling publish:', error);
            Alert.alert('Error', 'Failed to update tournament status');
        }
    };

    const handleDeleteTournament = async () => {
        Alert.alert(
            'Delete Tournament',
            'Are you sure? This will delete all teams, matches, and standings.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/tournaments/${tournamentId}`);
                            Alert.alert('Success', 'Tournament deleted', [
                                { text: 'OK', onPress: () => navigation.goBack() },
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete tournament');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!tournament) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const isHost = tournament.host._id === user._id;

    const tabs = [
        { key: 'overview', label: 'Overview', icon: 'information-circle-outline' },
        { key: 'teams', label: 'Teams', icon: 'people-outline' },
        { key: 'fixtures', label: 'Fixtures', icon: 'list-outline' },
        { key: 'standings', label: 'Standings', icon: 'trophy-outline' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.tournamentName}>{tournament.name}</Text>
                        <Text style={styles.sport}>{tournament.sport}</Text>
                    </View>
                    {isHost && (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                style={styles.moreButton}
                                onPress={handleShare}
                            >
                                <Ionicons name="share-social-outline" size={24} color="#007AFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.moreButton}
                                onPress={() => {
                                    Alert.alert('Tournament Options', '', [
                                        {
                                            text: tournament.status === 'DRAFT' ? 'Publish' : 'Unpublish',
                                            onPress: handlePublishToggle,
                                        },
                                        {
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: handleDeleteTournament,
                                        },
                                        { text: 'Cancel', style: 'cancel' },
                                    ]);
                                }}
                            >
                                <Ionicons name="ellipsis-horizontal" size={24} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.statusRow}>
                    <View
                        style={[
                            styles.statusBadge,
                            tournament.status === 'PUBLISHED'
                                ? styles.publishedBadge
                                : styles.draftBadge,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                tournament.status === 'PUBLISHED'
                                    ? styles.publishedText
                                    : styles.draftText,
                            ]}
                        >
                            {tournament.status}
                        </Text>
                    </View>
                    <Text style={styles.dateRange}>
                        {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                    </Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={20}
                            color={activeTab === tab.key ? '#007AFF' : '#666'}
                        />
                        <Text
                            style={[
                                styles.tabLabel,
                                activeTab === tab.key && styles.tabLabelActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchTournamentData} />
                }
            >
                {activeTab === 'overview' && (
                    <View style={styles.overviewContainer}>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Ionicons name="people" size={32} color="#007AFF" />
                                <Text style={styles.statValue}>{teams.length}</Text>
                                <Text style={styles.statLabel}>Teams</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="calendar" size={32} color="#FF6B6B" />
                                <Text style={styles.statValue}>{matches.length}</Text>
                                <Text style={styles.statLabel}>Matches</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="trophy" size={32} color="#FFD93D" />
                                <Text style={styles.statValue}>{tournament.format.replace(/_/g, ' ')}</Text>
                                <Text style={styles.statLabel}>Format</Text>
                            </View>
                        </View>

                        {isHost && teams.length > 0 && matches.length === 0 && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() =>
                                    navigation.navigate('GenerateFixtures', { tournamentId })
                                }
                            >
                                <Ionicons name="git-network" size={24} color="#FFF" />
                                <Text style={styles.actionButtonText}>Generate Fixtures</Text>
                            </TouchableOpacity>
                        )}

                        {tournament.venues && tournament.venues.length > 0 && (
                            <View style={styles.infoSection}>
                                <Text style={styles.infoTitle}>Venues</Text>
                                {tournament.venues.map((venue, index) => (
                                    <View key={index} style={styles.venueItem}>
                                        <Ionicons name="location" size={16} color="#666" />
                                        <Text style={styles.venueText}>{venue}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'teams' && (
                    <View style={styles.teamsContainer}>
                        {isHost && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() =>
                                    navigation.navigate('ManageTeams', { tournamentId })
                                }
                            >
                                <Ionicons name="add-circle" size={24} color="#007AFF" />
                                <Text style={styles.addButtonText}>Manage Teams</Text>
                            </TouchableOpacity>
                        )}

                        {teams.map((team) => (
                            <View key={team._id} style={styles.teamCard}>
                                {team.logoUrl ? (
                                    <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} />
                                ) : (
                                    <View style={styles.teamIcon}>
                                        <Ionicons name="shield" size={24} color="#007AFF" />
                                    </View>
                                )}
                                <Text style={styles.teamName}>{team.name}</Text>
                            </View>
                        ))}

                        {teams.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={64} color="#CCC" />
                                <Text style={styles.emptyText}>No teams added yet</Text>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'fixtures' && (
                    <View style={styles.fixturesContainer}>
                        {matches.length > 0 ? (
                            matches.map((match) => (
                                <TouchableOpacity
                                    key={match._id}
                                    style={styles.matchCard}
                                    onPress={() =>
                                        isHost &&
                                        navigation.navigate('MatchDetails', { matchId: match._id })
                                    }
                                >
                                    <Text style={styles.matchRound}>{match.round}</Text>
                                    <View style={styles.matchTeams}>
                                        <Text style={styles.teamNameInMatch}>
                                            {match.teamA?.name || 'TBD'}
                                        </Text>
                                        <Text style={styles.vs}>vs</Text>
                                        <Text style={styles.teamNameInMatch}>
                                            {match.teamB?.name || 'TBD'}
                                        </Text>
                                    </View>
                                    {match.status === 'FINISHED' && (
                                        <View style={styles.scoreRow}>
                                            <Text style={styles.score}>
                                                {match.scoreA} - {match.scoreB}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.matchFooter}>
                                        <Text style={styles.matchStatus}>{match.status}</Text>
                                        {match.venue && (
                                            <Text style={styles.matchVenue}>{match.venue}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={64} color="#CCC" />
                                <Text style={styles.emptyText}>No fixtures generated yet</Text>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'standings' && (
                    <View style={styles.standingsContainer}>
                        {standings.length > 0 ? (
                            <View style={styles.standingsTable}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Team</Text>
                                    <Text style={styles.tableHeaderText}>P</Text>
                                    <Text style={styles.tableHeaderText}>W</Text>
                                    <Text style={styles.tableHeaderText}>D</Text>
                                    <Text style={styles.tableHeaderText}>L</Text>
                                    <Text style={styles.tableHeaderText}>Pts</Text>
                                </View>
                                {standings.map((standing, index) => (
                                    <View key={standing._id} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>
                                            {index + 1}. {standing.team.name}
                                        </Text>
                                        <Text style={styles.tableCell}>{standing.played}</Text>
                                        <Text style={styles.tableCell}>{standing.won}</Text>
                                        <Text style={styles.tableCell}>{standing.draw}</Text>
                                        <Text style={styles.tableCell}>{standing.lost}</Text>
                                        <Text style={[styles.tableCell, styles.pointsCell]}>
                                            {standing.points}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="trophy-outline" size={64} color="#CCC" />
                                <Text style={styles.emptyText}>
                                    {tournament.format === 'KNOCKOUT'
                                        ? 'No standings for knockout format'
                                        : 'No standings available yet'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#FFF',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
    },
    tournamentName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    sport: {
        fontSize: 16,
        color: '#666',
    },
    moreButton: {
        padding: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    publishedBadge: {
        backgroundColor: '#E8F5E9',
    },
    draftBadge: {
        backgroundColor: '#FFF3E0',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    publishedText: {
        color: '#4CAF50',
    },
    draftText: {
        color: '#FF9800',
    },
    dateRange: {
        fontSize: 14,
        color: '#666',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#007AFF',
    },
    tabLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    tabLabelActive: {
        color: '#007AFF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    overviewContainer: {
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoSection: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    venueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    venueText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    teamsContainer: {
        padding: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
    },
    addButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    teamIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    teamLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        marginRight: 12,
    },
    fixturesContainer: {
        padding: 16,
    },
    matchCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    matchRound: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
    },
    matchTeams: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    teamNameInMatch: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        flex: 1,
    },
    vs: {
        fontSize: 12,
        color: '#999',
        marginHorizontal: 8,
    },
    scoreRow: {
        alignItems: 'center',
        marginBottom: 8,
    },
    score: {
        fontSize: 18,
        fontWeight: '700',
        color: '#007AFF',
    },
    matchFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    matchStatus: {
        fontSize: 12,
        color: '#666',
    },
    matchVenue: {
        fontSize: 12,
        color: '#666',
    },
    standingsContainer: {
        padding: 16,
    },
    standingsTable: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    tableHeaderText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: '#1D1D1F',
        textAlign: 'center',
    },
    pointsCell: {
        fontWeight: '700',
        color: '#007AFF',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
});

export default TournamentDashboardScreen;
