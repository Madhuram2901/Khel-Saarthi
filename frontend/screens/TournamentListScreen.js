import React, { useState, useContext, useMemo } from 'react';
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

    // Only host/admin can create tournaments
    const canCreateTournament =
        user?.role === 'host' || user?.role === 'admin';

    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchTournaments();
        }, [])
    );

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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Tournaments</Text>

                {/* PLUS BUTTON ONLY FOR HOST/ADMIN */}
                {canCreateTournament && (
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreateTournament')}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Tournament List */}
            <FlatList
                data={tournaments}
                renderItem={renderTournamentCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchTournaments}
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
                            No tournaments yet
                        </Text>

                        {/* Empty state create button only for host/admin */}
                        {canCreateTournament && (
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
        </View>
    );
};

const makeStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: SPACING.screenHorizontal,
            paddingTop: 50,
            paddingBottom: 16,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
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
        listContainer: {
            paddingHorizontal: SPACING.screenHorizontal,
            paddingTop: 16,
            paddingBottom: 16,
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