import React, { useState, useEffect, useContext, useMemo } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import StyledButton from '../components/StyledButton';
import { getSportImage, formatEventDate } from '../utils/constants';

const EventDetailsScreen = ({ route, navigation }) => {
    const { eventId } = route.params;
    const { user } = useContext(AuthContext);
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const { data } = await api.get(`/events/${eventId}`);
                setEvent(data);
            } catch (error) {
                Alert.alert('Error', 'Could not fetch event details.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleRegister = async () => {
        try {
            await api.post(`/events/${eventId}/register`);
            Alert.alert('Success', 'You are registered!');
            const { data } = await api.get(`/events/${eventId}`);
            setEvent(data);
        } catch (error) {
            Alert.alert('Error', 'Registration failed');
        }
    };

    const calculateHoursLeft = (eventDate) => {
        return Math.max(0, Math.floor((new Date(eventDate) - new Date()) / (1000 * 60 * 60)));
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.accent} />
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
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header Image */}
            <ImageBackground
                source={{ uri: event.bannerImage || getSportImage(event.category) }}
                style={styles.headerImage}
                imageStyle={styles.headerImageStyle}
            >
                <View style={styles.headerOverlay}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.favoriteButton}>
                            <Ionicons name="heart-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>

            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>

                    <View style={styles.eventMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.metaText}>
                                {event.location?.address || 'Location TBD'}
                            </Text>
                        </View>

                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.metaText}>
                                {eventDateInfo.formatted} - {eventDateInfo.time}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Price + Register */}
                <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>Free</Text>

                    {!isHost && (
                        <>
                            {hoursLeft <= 0 ? (
                                <View style={styles.eventStartedContainer}>
                                    <Ionicons name="time" size={20} color="#FF9500" />
                                    <Text style={styles.eventStartedText}>Event Started</Text>
                                </View>
                            ) : isRegistered ? (
                                <View style={styles.registeredContainer}>
                                    <Ionicons name="checkmark-circle" size={24} color={colors.accentGreen} />
                                    <Text style={styles.registeredText}>You're registered!</Text>
                                </View>
                            ) : (
                                <StyledButton
                                    title="Register"
                                    onPress={handleRegister}
                                    variant="primary"
                                    size="large"
                                />
                            )}
                        </>
                    )}
                </View>

                {/* Participants */}
                <View style={styles.participantsSection}>
                    <Text style={styles.participantsText}>
                        {event.registeredParticipants.length} Registered • 7 Players Per Team
                    </Text>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {event.description || 'No description available.'}
                    </Text>
                </View>

                {/* Chat */}
                {(isHost || isRegistered) && (
                    <View style={styles.chatSection}>
                        <StyledButton
                            title="Go to Event Chat"
                            onPress={() => navigation.navigate('Chat', { eventId: event._id })}
                            variant="success"
                            icon="chatbubbles"
                            size="large"
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: 18,
        color: colors.textSecondary,
    },
    headerImage: {
        height: 260,
    },
    headerImageStyle: {
        backgroundColor: colors.surface2,
    },
    headerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 16,
        paddingTop: 60,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        marginTop: -30,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: colors.background,
    },
    eventHeader: {
        padding: 20,
    },
    eventTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },
    eventMeta: {
        gap: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: 8,
        color: colors.textSecondary,
    },
    priceSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    priceLabel: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },
    registeredContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: isDark ? 'rgba(52,199,89,0.15)' : '#F2F8F2',
        borderRadius: 12,
    },
    registeredText: {
        marginLeft: 8,
        fontWeight: '600',
        color: colors.accentGreen,
    },
    eventStartedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: 'rgba(255,149,0,0.15)',
        borderRadius: 12,
    },
    eventStartedText: {
        marginLeft: 8,
        fontWeight: '600',
        color: '#FF9500',
    },
    participantsSection: {
        padding: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    participantsText: {
        color: colors.text,
        fontWeight: '600',
    },
    descriptionSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },
    descriptionText: {
        color: colors.textSecondary,
        lineHeight: 22,
    },
    chatSection: {
        padding: 20,
    },
});

export default EventDetailsScreen;