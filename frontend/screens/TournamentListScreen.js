import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import AuthContext from '../context/AuthContext';

const TournamentListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/tournaments');
            setTournaments(data);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            Alert.alert('Error', 'Failed to load tournaments');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getFormatBadgeColor = (format) => {
        switch (format) {
            case 'KNOCKOUT':
                return '#FF6B6B';
            case 'ROUND_ROBIN':
                return '#4ECDC4';
            case 'GROUPS_PLUS_KNOCKOUT':
                return '#FFD93D';
            default:
                return '#95A5A6';
        }
    };

    const renderTournamentCard = ({ item }) => {
        const isHost = item.host._id === user._id;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('TournamentDashboard', { tournamentId: item._id })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.tournamentName}>{item.name}</Text>
                        <Text style={styles.sport}>{item.sport}</Text>
                    </View>
                    <View
                        style={[
                            styles.formatBadge,
                            { backgroundColor: getFormatBadgeColor(item.format) },
                        ]}
                    >
                        <Text style={styles.formatText}>
                            {item.format.replace(/_/g, ' ')}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            {isHost ? 'You' : item.host.name}
                        </Text>
                    </View>

                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusBadge,
                                item.status === 'PUBLISHED'
                                    ? styles.publishedBadge
                                    : styles.draftBadge,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    item.status === 'PUBLISHED'
                                        ? styles.publishedText
                                        : styles.draftText,
                                ]}
                            >
                                {item.status}
                            </Text>
                        </View>

                        {item.isPublic && (
                            <View style={styles.publicBadge}>
                                <Ionicons name="globe-outline" size={14} color="#007AFF" />
                                <Text style={styles.publicText}>Public</Text>
                            </View>
                        )}
                    </View>
                </View>

                {isHost && (
                    <View style={styles.cardFooter}>
                        <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tournaments</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreateTournament')}
                >
                    <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={tournaments}
                renderItem={renderTournamentCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchTournaments} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="trophy-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No tournaments yet</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('CreateTournament')}
                        >
                            <Text style={styles.emptyButtonText}>Create Tournament</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    createButton: {
        backgroundColor: '#007AFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
    },
    tournamentName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    sport: {
        fontSize: 14,
        color: '#666',
    },
    formatBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 12,
    },
    formatText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFF',
        textTransform: 'uppercase',
    },
    cardBody: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
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
    publicBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
    },
    publicText: {
        fontSize: 12,
        color: '#007AFF',
        marginLeft: 4,
        fontWeight: '600',
    },
    cardFooter: {
        alignItems: 'flex-end',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TournamentListScreen;
