import React, { useState, useContext, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TournamentCard from '../components/TournamentCard';
import { SPACING, TYPOGRAPHY } from '../theme/designSystem';

const TournamentListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const canCreateTournament =
        user?.role === 'host' || user?.role === 'admin';

    const [viewMode, setViewMode] = useState('all');
    const [tournaments, setTournaments] = useState([]);
    const [myTournaments, setMyTournaments] = useState([]);
    const [loading, setLoading] = useState(false);

    const displayedTournaments = useMemo(() => {
        const source = viewMode === 'registered' ? myTournaments : tournaments;
        return [...source].sort(
            (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0)
        );
    }, [myTournaments, tournaments, viewMode]);

    useFocusEffect(
        React.useCallback(() => {
            fetchTournamentLists();
        }, [user?._id, user?.role])
    );

    const fetchTournamentLists = async () => {
        try {
            setLoading(true);
            const [allRes, myRes] = await Promise.allSettled([
                api.get('/tournaments'),
                api.get('/users/mytournaments'),
            ]);

            if (allRes.status === 'fulfilled') {
                setTournaments(allRes.value.data || []);
            } else {
                console.error('Error fetching tournaments:', allRes.reason);
                Alert.alert('Error', 'Failed to load tournaments');
            }

            if (myRes.status === 'fulfilled') {
                setMyTournaments(myRes.value.data || []);
            } else {
                console.warn(
                    'Error fetching registered tournaments:',
                    myRes.reason
                );
                setMyTournaments([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderTournamentCard = ({ item }) => (
        <TournamentCard
            tournament={item}
            onPress={() =>
                navigation.navigate('TournamentDashboard', {
                    tournamentId: item._id,
                })
            }
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Tournaments</Text>

                    {canCreateTournament && (
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('CreateTournament')}
                        >
                            <Ionicons name="add" size={24} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[
                            styles.tabItem,
                            viewMode === 'all' && styles.tabItemActive,
                        ]}
                        onPress={() => setViewMode('all')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                viewMode === 'all' && styles.tabTextActive,
                            ]}
                        >
                            All Tournaments
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tabItem,
                            viewMode === 'registered' && styles.tabItemActive,
                        ]}
                        onPress={() => setViewMode('registered')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                viewMode === 'registered' &&
                                    styles.tabTextActive,
                            ]}
                        >
                            Registered
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={displayedTournaments}
                renderItem={renderTournamentCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchTournamentLists}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="trophy-outline"
                            size={64}
                            color={colors.textMuted}
                        />
                        <Text style={styles.emptyText}>
                            {viewMode === 'registered'
                                ? 'No registered tournaments yet'
                                : 'No tournaments yet'}
                        </Text>

                        {viewMode === 'all' && canCreateTournament && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() =>
                                    navigation.navigate('CreateTournament')
                                }
                            >
                                <Text style={styles.emptyButtonText}>
                                    Create Tournament
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const makeStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: SPACING.screenHorizontal,
            paddingTop: 16,
            paddingBottom: 16,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
        },
        title: {
            ...TYPOGRAPHY.screenTitle,
            color: colors.text,
        },
        createButton: {
            backgroundColor: colors.accent,
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        tabRow: {
            flexDirection: 'row',
            gap: 8,
        },
        tabItem: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: colors.surface2,
        },
        tabItemActive: {
            backgroundColor: colors.accent,
        },
        tabText: {
            fontSize: 13,
            fontWeight: '500',
            color: colors.textSecondary,
        },
        tabTextActive: {
            color: '#FFF',
            fontWeight: '600',
        },
        listContainer: {
            paddingHorizontal: SPACING.screenHorizontal,
            paddingTop: 16,
            paddingBottom: 24,
            flexGrow: 1,
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
        },
        emptyText: {
            fontSize: 18,
            color: colors.textSecondary,
            marginTop: 16,
            marginBottom: 24,
            textAlign: 'center',
        },
        emptyButton: {
            backgroundColor: colors.accent,
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
