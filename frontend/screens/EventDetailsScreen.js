import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    ImageBackground,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import StyledButton from '../components/StyledButton';
import { getSportImage, formatEventDate } from '../utils/constants';

const EventDetailsScreen = ({ route, navigation }) => {
    const { eventId } = route.params;
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
            // Refresh event data to update registration status
            const { data } = await api.get(`/events/${eventId}`);
            setEvent(data);
        } catch (error) {
            const message = error.response?.data?.message || 'Could not register for the event. You may already be registered.';
            Alert.alert('Registration Failed', message);
        }
    };

    const calculateHoursLeft = (eventDate) => {
        return Math.max(0, Math.floor((new Date(eventDate) - new Date()) / (1000 * 60 * 60)));
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Event not found.</Text>
            </View>
        );
    }

    const isHost = event.host?._id?.toString() === user?._id?.toString();
    const isRegistered = event.registeredParticipants.includes(user?._id);
    const hoursLeft = calculateHoursLeft(event.date);
    const eventDateInfo = formatEventDate(event.date);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header Image */}
            <ImageBackground
                source={{ uri: event.bannerImage || getSportImage(event.category) }}
                style={styles.headerImage}
                imageStyle={styles.headerImageStyle}
            >
                <View style={styles.headerOverlay}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.favoriteButton}>
                            <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>

            <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Event Header */}
                <View style={styles.eventHeader}>
                    <View style={styles.eventTitleRow}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.sportsIndicator}>
                            <Ionicons name="logo-github" size={16} color="#007AFF" />
                        </View>
                    </View>

                    <View style={styles.eventMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={16} color="#8E8E93" />
                            <Text style={styles.metaText}>
                                {event.location?.address || 'IIT Bhopal University Ground'}
                            </Text>
                        </View>

                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                            <Text style={styles.metaText}>
                                {eventDateInfo.formatted} - {eventDateInfo.time}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Price and Register Button */}
                <View style={styles.priceSection}>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Free</Text>
                        <View style={styles.shareButton}>
                            <Ionicons name="share-outline" size={20} color="#007AFF" />
                        </View>
                    </View>

                    {!isHost && !isRegistered && (
                        <StyledButton
                            title="Register"
                            onPress={handleRegister}
                            variant="primary"
                            size="large"
                            style={styles.registerButton}
                        />
                    )}

                    {isRegistered && (
                        <View style={styles.registeredContainer}>
                            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                            <Text style={styles.registeredText}>You're registered!</Text>
                        </View>
                    )}
                </View>

                {/* Participants Info */}
                <View style={styles.participantsSection}>
                    <View style={styles.participantsMeta}>
                        <View style={styles.participantsCount}>
                            <Ionicons name="people" size={18} color="#007AFF" />
                            <Text style={styles.participantsText}>
                                {event.registeredParticipants.length} Registered
                            </Text>
                        </View>

                        <View style={styles.playersPerTeam}>
                            <Ionicons name="person" size={18} color="#007AFF" />
                            <Text style={styles.participantsText}>
                                7 Players Per Team
                            </Text>
                        </View>
                    </View>

                    <View style={styles.timeInfo}>
                        <Ionicons name="time" size={18} color="#FF9500" />
                        <Text style={styles.timeText}>
                            {hoursLeft > 0 ? `${hoursLeft} Hours Left` : 'Event Started'}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {event.description ||
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor tellus sed rutrum venenatis. Maecenas blandit sem. Sed a lorem eget tellus pulvinar dapibus sagittis vel tellus. Mauris convallis mauris tellus.'}
                    </Text>
                    <TouchableOpacity>
                        <Text style={styles.readMoreText}>Read More</Text>
                    </TouchableOpacity>
                </View>

                {/* Features */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Features</Text>
                    <View style={styles.featuresList}>
                        <View style={[styles.featureTag, { backgroundColor: '#E8F5E8' }]}>
                            <Text style={[styles.featureText, { color: '#34C759' }]}>Beginner Friendly</Text>
                        </View>
                        <View style={[styles.featureTag, { backgroundColor: '#FFE8E8' }]}>
                            <Text style={[styles.featureText, { color: '#FF3B30' }]}>Official Tournament</Text>
                        </View>
                        <View style={[styles.featureTag, { backgroundColor: '#E8F4FD' }]}>
                            <Text style={[styles.featureText, { color: '#007AFF' }]}>Inter-College</Text>
                        </View>
                    </View>
                </View>

                {/* Host Actions */}
                {isHost && (
                    <View style={styles.hostActions}>
                        <StyledButton
                            title={`View Participants (${event.registeredParticipants.length})`}
                            onPress={() => navigation.navigate('Participants', { eventId: event._id })}
                            variant="secondary"
                            icon="people"
                            style={styles.actionButton}
                        />

                        <StyledButton
                            title="Edit Event"
                            onPress={() => navigation.navigate('EditEvent', { eventId: event._id })}
                            variant="outline"
                            icon="create"
                            style={styles.actionButton}
                        />
                    </View>
                )}

                {/* Chat Button */}
                {(isHost || isRegistered) && (
                    <View style={styles.chatSection}>
                        <StyledButton
                            title="Go to Event Chat"
                            onPress={() => navigation.navigate('Chat', { eventId: event._id, eventTitle: event.title })}
                            variant="success"
                            icon="chatbubbles"
                            size="large"
                        />
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        fontSize: 18,
        color: '#8E8E93',
    },
    headerImage: {
        height: 250,
        justifyContent: 'space-between',
    },
    headerImageStyle: {
        backgroundColor: '#F2F2F7',
    },
    headerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 20,
        paddingTop: 50,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: '#FFFFFF',
    },
    eventHeader: {
        padding: 20,
        paddingBottom: 16,
    },
    eventTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    eventTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1D1D1F',
        flex: 1,
        marginRight: 12,
    },
    sportsIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventMeta: {
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        color: '#8E8E93',
        marginLeft: 8,
    },
    priceSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    priceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1D1D1F',
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerButton: {
        backgroundColor: '#1D1D1F',
    },
    registeredContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        backgroundColor: '#F2F8F2',
        borderRadius: 12,
    },
    registeredText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34C759',
        marginLeft: 8,
    },
    participantsSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8F9FA',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5EA',
    },
    participantsMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    participantsCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playersPerTeam: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    participantsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        marginLeft: 6,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF9500',
        marginLeft: 6,
    },
    descriptionSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 16,
        color: '#3A3A3C',
        lineHeight: 24,
        marginBottom: 8,
    },
    readMoreText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    featuresSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    featuresList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    featureTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '600',
    },
    hostActions: {
        paddingHorizontal: 20,
        gap: 12,
    },
    actionButton: {
        marginVertical: 0,
    },
    chatSection: {
        padding: 20,
    },
    bottomPadding: {
        height: 20,
    },
});

export default EventDetailsScreen;