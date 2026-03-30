import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MyBookingsScreen from './MyBookingsScreen';
import VenueHostDashboard from './VenueHostDashboard';
import Constants from 'expo-constants';
import AppCard from '../components/AppCard';
import VenueCard from '../components/VenueCard';
import { SPACING } from '../theme/designSystem';

const VenueListScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    const [viewMode, setViewMode] = useState(
        user?.role === 'host' ? 'myVenues' : 'explore'
    );
    const [venues, setVenues] = useState([]);
    const [myVenues, setMyVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myVenuesLoading, setMyVenuesLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [city, setCity] = useState('');

    const fetchVenues = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/venues', {
                params: { city }
            });
            setVenues(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyVenues = async () => {
        setMyVenuesLoading(true);
        try {
            const { data } = await api.get('/venues/my-venues');
            setMyVenues(data);
        } catch (_error) {
            try {
                const { data: allVenues } = await api.get('/venues');
                const mine = allVenues.filter(
                    v => v.manager === user._id ||
                        v.manager?._id === user._id
                );
                setMyVenues(mine);
            } catch (_fallbackError) {
                setMyVenues([]);
            }
        } finally {
            setMyVenuesLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMyVenues();
        setRefreshing(false);
    };

    useEffect(() => {
        if (viewMode === 'explore') {
            fetchVenues();
        }
    }, [city, viewMode]);

    useEffect(() => {
        if (viewMode === 'myVenues') fetchMyVenues();
    }, [viewMode]);

    useFocusEffect(
        useCallback(() => {
            if (viewMode === 'myVenues') {
                fetchMyVenues();
            }
        }, [viewMode])
    );

    const renderVenue = ({ item }) => (
        <VenueCard
            venue={item}
            onPress={() => navigation.navigate('VenueDetails', { venueId: item._id })}
            style={styles.venueCard}
        />
    );

    const renderContent = () => {
        if (viewMode === 'bookings') return <MyBookingsScreen />;
        if (viewMode === 'dashboard') return <VenueHostDashboard navigation={navigation} />;
        if (viewMode === 'myVenues') {
            return (
                <>
                    {myVenuesLoading ? (
                        <ActivityIndicator
                            size="large"
                            color={colors.accent}
                            style={styles.loader}
                        />
                    ) : (
                        <FlatList
                            data={myVenues}
                            renderItem={renderVenue}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.list}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={colors.accent}
                                />
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons
                                        name="location-outline"
                                        size={48}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={styles.emptyTitle}>
                                        No venues yet
                                    </Text>
                                    <Text style={styles.emptySubtitle}>
                                        Tap + to list your first venue
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </>
            );
        }

        return (
            <>
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            placeholder="Search by city..."
                            placeholderTextColor={colors.textMuted}
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
                ) : (
                    <FlatList
                        data={venues}
                        renderItem={renderVenue}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.empty}>No venues found</Text>}
                    />
                )}

            </>
        );
    };

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <View style={styles.navTabs}>
                    {user?.role === 'host' && (
                        <TouchableOpacity
                            style={[
                                styles.navItem,
                                viewMode === 'myVenues' && styles.navItemActive,
                            ]}
                            onPress={() => setViewMode('myVenues')}
                        >
                            <Text style={[
                                styles.navText,
                                viewMode === 'myVenues' && styles.navTextActive,
                            ]}>
                                My Venues
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.navItem,
                            viewMode === 'explore' && styles.navItemActive,
                        ]}
                        onPress={() => setViewMode('explore')}
                    >
                        <Text style={[
                            styles.navText,
                            viewMode === 'explore' && styles.navTextActive,
                        ]}>
                            Explore
                        </Text>
                    </TouchableOpacity>

                    {!['venue_manager', 'host'].includes(user?.role) && (
                        <TouchableOpacity
                            style={[
                                styles.navItem,
                                viewMode === 'bookings' && styles.navItemActive,
                            ]}
                            onPress={() => setViewMode('bookings')}
                        >
                            <Text style={[
                                styles.navText,
                                viewMode === 'bookings' && styles.navTextActive,
                            ]}>
                                My Bookings
                            </Text>
                        </TouchableOpacity>
                    )}

                    {user?.role === 'venue_manager' && (
                        <TouchableOpacity
                            style={[styles.navItem, viewMode === 'dashboard' && styles.navItemActive]}
                            onPress={() => setViewMode('dashboard')}
                        >
                            <Text style={[styles.navText, viewMode === 'dashboard' && styles.navTextActive]}>Dashboard</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {(user?.role === 'host' || user?.role === 'venue_manager') && (
                    <TouchableOpacity
                        style={styles.headerAddButton}
                        onPress={() => navigation.navigate('AddVenue')}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {renderContent()}
        </View>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Constants.statusBarHeight
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    navTabs: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    navItem: {
        marginRight: 20,
        paddingBottom: 5,
    },
    navItemActive: {
        borderBottomWidth: 2,
        borderBottomColor: colors.accent,
    },
    navText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    navTextActive: {
        color: colors.accent,
        fontWeight: 'bold',
    },
    list: { paddingHorizontal: SPACING.screenHorizontal, paddingBottom: 140 },
    searchContainer: { padding: 15, backgroundColor: colors.surface },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface2,
        borderRadius: 10,
        padding: 10
    },
    input: { marginLeft: 10, flex: 1, color: colors.text },
    venueCard: {
        width: '100%',
        marginBottom: 16,
    },
    loader: { marginTop: 50 },
    empty: { textAlign: 'center', marginTop: 50, color: colors.textSecondary },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 4,
    },
    headerAddButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    }
});

export default VenueListScreen;
