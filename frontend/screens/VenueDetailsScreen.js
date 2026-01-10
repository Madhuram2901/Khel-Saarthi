import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import StyledButton from '../components/StyledButton';
import AuthContext from '../context/AuthContext';

const VenueDetailsScreen = ({ route, navigation }) => {
    const { venueId } = route.params;
    const { user } = useContext(AuthContext);
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking State
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const { data } = await api.get(`/venues/${venueId}`);
                setVenue(data);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Could not fetch venue details');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetchVenue();
    }, [venueId]);

    const handleBook = async () => {
        if (!date || !startTime || !duration) {
            Alert.alert('Error', 'Please fill all booking details');
            return;
        }

        setBookingLoading(true);
        try {
            await api.post(`/venues/${venueId}/book`, {
                date,
                startTime,
                duration: parseInt(duration)
            });
            Alert.alert('Success', 'Booking Confirmed!', [
                { text: 'View My Bookings', onPress: () => navigation.navigate('MyBookings') }
            ]);
        } catch (error) {
            Alert.alert('Booking Failed', error.response?.data?.message || 'Slot not available');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" style={styles.loader} />;
    if (!venue) return null;

    // Check if current user is the manager
    // venue.manager might be an object (populated) or a string (ID)
    const managerId = venue.manager?._id || venue.manager;
    const isManager = user && managerId && (user._id == managerId || user._id === managerId.toString());

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
            <Image
                source={{ uri: venue.images[0] || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a' }}
                style={styles.image}
            />

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{venue.name}</Text>
                    {isManager && (
                        <TouchableOpacity onPress={() => navigation.navigate('EditVenue', { venueId: venue._id })}>
                            <Ionicons name="create-outline" size={24} color="#007AFF" />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.location}>
                    <Ionicons name="location-outline" size={16} /> {venue.address}, {venue.city}
                </Text>

                <Text style={styles.price}>₹{venue.pricePerHour}/hr</Text>

                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{venue.description}</Text>

                <Text style={styles.sectionTitle}>Amenities</Text>
                <View style={styles.amenities}>
                    {Object.entries(venue.amenities).map(([key, value]) => (
                        value && (
                            <View key={key} style={styles.amenityBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                <Text style={styles.amenityText}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                            </View>
                        )
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Book a Slot</Text>
                <View style={styles.bookingForm}>
                    <TextInput
                        style={styles.input}
                        placeholder="Date (YYYY-MM-DD)"
                        value={date}
                        onChangeText={setDate}
                    />
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                            placeholder="Start Time (HH:MM)"
                            value={startTime}
                            onChangeText={setStartTime}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Duration (Hrs)"
                            value={duration}
                            onChangeText={setDuration}
                            keyboardType="numeric"
                        />
                    </View>
                    <StyledButton
                        title={bookingLoading ? "Processing..." : "Pay & Book"}
                        onPress={handleBook}
                        disabled={bookingLoading}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loader: { flex: 1, justifyContent: 'center' },
    image: { width: '100%', height: 250 },
    content: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, backgroundColor: '#fff' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    name: { fontSize: 24, fontWeight: 'bold', flex: 1 },
    location: { fontSize: 16, color: '#666', marginBottom: 10 },
    price: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
    description: { fontSize: 16, color: '#444', lineHeight: 24 },
    amenities: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    amenityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 8, borderRadius: 20, marginRight: 10, marginBottom: 10 },
    amenityText: { marginLeft: 5, color: '#333' },
    bookingForm: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
    row: { flexDirection: 'row' }
});

export default VenueDetailsScreen;
