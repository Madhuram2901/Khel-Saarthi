import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import StyledButton from '../components/StyledButton';

const EventDetailsScreen = ({ route, navigation }) => {
    const { eventId } = route.params; // Get the event ID passed from the Home screen
    const { user } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/events/${eventId}`);
                setEvent(data);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Could not fetch event details.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleRegister = async () => {
        // Check if user has a badminton profile before registering
        if (!user.profiles?.badminton?.skillLevel) {
            Alert.alert(
                'Profile Incomplete',
                'Please complete your Badminton profile before registering for an event.',
                [{ text: 'OK', onPress: () => navigation.navigate('ProfileStack', { screen: 'BadmintonProfile' }) }]
            );
            return;
        }
        try {
            await api.post(`/events/${eventId}/register`);
            Alert.alert('Success', 'You have successfully registered for this event!');
        } catch (error) {
            // Use error.response.data.message if available, otherwise a generic message
            const message = error.response?.data?.message || 'Could not register for the event. You may already be registered.';
            Alert.alert('Registration Failed', message);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.centered}>
                <Text>Event not found.</Text>
            </View>
        );
    }
    // Checking if current user is host
    const isHost = event.host._id.toString() === user?._id.toString();
    // Check if the current user is already registered
    const isRegistered = event.registeredParticipants.includes(user?._id);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.content}>{event.description}</Text>

                <Text style={styles.label}>Date:</Text>
                <Text style={styles.content}>{new Date(event.date).toDateString()}</Text>

                <Text style={styles.label}>Hosted By:</Text>
                <Text style={styles.content}>{event.host.name} ({event.host.email})</Text>

                <Text style={styles.label}>Registered Participants:</Text>
                <Text style={styles.content}>{event.registeredParticipants.length}</Text>
            </View>

            {user && isHost && (
                <StyledButton
                    title={`View Participants (${event.registeredParticipants.length})`}
                    onPress={() => navigation.navigate('Participants', { eventId: event._id })}
                />
            )}

            {user && !isHost && !isRegistered && (
                <StyledButton title="Register for this Event" onPress={handleRegister} />
            )}

            {isRegistered && (
                <Text style={styles.registeredText}>You are already registered for this event.</Text>
            )}

            {user && isHost && (
                <>
                    <StyledButton
                        title="Edit Event"
                        onPress={() => navigation.navigate('EditEvent', { eventId: event._id })}
                        style={{ backgroundColor: '#FF9500' }} // Orange color for edit
                    />
                </>
            )}

            {(isHost || isRegistered) && (
                <StyledButton
                    title="Go to Event Chat"
                    onPress={() => navigation.navigate('Chat', { eventId: event._id, eventTitle: event.title })}
                    style={{ backgroundColor: '#34C759', marginBottom: 10 }} // Green color
                />
            )}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 10,
    },
    content: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    registeredText: {
        textAlign: 'center',
        fontSize: 16,
        color: 'green',
        fontWeight: 'bold',
        marginTop: 15,
    }
});

export default EventDetailsScreen;