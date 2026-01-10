import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';
import MyBookingsScreen from './MyBookingsScreen';
import VenueHostDashboard from './VenueHostDashboard';
import Constants from 'expo-constants';

const VenueListScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const [viewMode, setViewMode] = useState('explore'); // 'explore', 'bookings', 'dashboard'
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
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VenueDetails', { venueId: item._id })}
        >
            <Image
                source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a' }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.address}>{item.city}, {item.state}</Text>
                <View style={styles.row}>
                    <Text style={styles.price}>₹{item.pricePerHour}/hr</Text>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating} ({item.numReviews})</Text>
                    </View>
                </View>
                <View style={styles.tags}>
                    {item.sportTypes.map((sport, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{sport}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (viewMode === 'bookings') return <MyBookingsScreen />;
        if (viewMode === 'dashboard') return <VenueHostDashboard navigation={navigation} />;

        return (
            <>
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            placeholder="Search by city..."
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
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

                {/* Show My Bookings only if NOT a Host/Manager */}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: Constants.statusBarHeight // Add padding for status bar
    },
    navBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    navItem: {
        marginRight: 20,
        paddingBottom: 5,
    },
    navItemActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    navText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    navTextActive: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    list: { padding: 15, paddingBottom: 140 },
    searchContainer: { padding: 15, backgroundColor: '#fff' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10
    },
    input: { marginLeft: 10, flex: 1 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 3
    },
    image: { width: '100%', height: 150 },
    info: { padding: 12 },
    name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    address: { color: '#666', marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    price: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
    rating: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { marginLeft: 4, color: '#666' },
    tags: { flexDirection: 'row', flexWrap: 'wrap' },
    tag: {
        backgroundColor: '#e1f5fe',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 4
    },
    tagText: { color: '#0277bd', fontSize: 12 },
    loader: { marginTop: 50 },
    empty: { textAlign: 'center', marginTop: 50, color: '#666' },
    fab: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        backgroundColor: '#007AFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});

export default VenueListScreen;
