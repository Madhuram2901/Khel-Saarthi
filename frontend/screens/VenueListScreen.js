import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useNavigation } from '@react-navigation/native';
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
    const [viewMode, setViewMode] = useState('explore');
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        if (viewMode === 'explore') {
            fetchVenues();
        }
    }, [city, viewMode]);

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

                {user?.role === 'venue_manager' && (
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => navigation.navigate('AddVenue')}
                    >
                        <Ionicons name="add" size={30} color="#fff" />
                    </TouchableOpacity>
                )}
            </>
        );
    };

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={[styles.navItem, viewMode === 'explore' && styles.navItemActive]}
                    onPress={() => setViewMode('explore')}
                >
                    <Text style={[styles.navText, viewMode === 'explore' && styles.navTextActive]}>Explore</Text>
                </TouchableOpacity>

                {!['venue_manager', 'host'].includes(user?.role) && (
                    <TouchableOpacity
                        style={[styles.navItem, viewMode === 'bookings' && styles.navItemActive]}
                        onPress={() => setViewMode('bookings')}
                    >
                        <Text style={[styles.navText, viewMode === 'bookings' && styles.navTextActive]}>My Bookings</Text>
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
        backgroundColor: colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
    fab: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        backgroundColor: colors.accent,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});

export default VenueListScreen;
