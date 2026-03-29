import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ACTIONS_BY_ROLE = {
    user: [
        { key: 'join-event', label: 'Join Event', icon: 'calendar-outline', onPress: (navigation) => navigation.navigate('EventsStack') },
        { key: 'tournaments', label: 'Tournaments', icon: 'trophy-outline', onPress: (navigation) => navigation.navigate('TournamentStack') },
        { key: 'book-venue', label: 'Book Venue', icon: 'business-outline', onPress: (navigation) => navigation.navigate('VenueStack', { screen: 'VenueList' }) },
        { key: 'ai-coach', label: 'AI Coach', icon: 'fitness-outline', onPress: (navigation) => navigation.navigate('AiGymTrainer') },
    ],
    host: [
        { key: 'create-event', label: 'Create Events', icon: 'add-circle-outline', onPress: (navigation) => navigation.navigate('CreateEvent') },
        { key: 'manage-venues', label: 'Manage Venues', icon: 'storefront-outline', onPress: (navigation) => navigation.navigate('VenueStack', { screen: 'VenueList' }) },
        { key: 'create-tournament', label: 'Create Tournaments', icon: 'trophy-outline', onPress: (navigation) => navigation.navigate('TournamentStack', { screen: 'CreateTournament' }) },
    ],
    organizer: [
        { key: 'create-event', label: 'Create Event', icon: 'add-circle-outline', onPress: (navigation) => navigation.navigate('CreateEvent') },
        { key: 'create-tournament', label: 'Create Tournament', icon: 'trophy-outline', onPress: (navigation) => navigation.navigate('TournamentStack', { screen: 'CreateTournament' }) },
        { key: 'manage-events', label: 'Manage Events', icon: 'clipboard-outline', onPress: (navigation) => navigation.navigate('EventsStack') },
    ],
    admin: [
        { key: 'create-event', label: 'Create Event', icon: 'add-circle-outline', onPress: (navigation) => navigation.navigate('CreateEvent') },
        { key: 'create-tournament', label: 'Create Tournament', icon: 'trophy-outline', onPress: (navigation) => navigation.navigate('TournamentStack', { screen: 'CreateTournament' }) },
        { key: 'book-venue', label: 'Book Venue', icon: 'business-outline', onPress: (navigation) => navigation.navigate('VenueStack', { screen: 'VenueList' }) },
        { key: 'ai-coach', label: 'AI Coach', icon: 'fitness-outline', onPress: (navigation) => navigation.navigate('AiGymTrainer') },
        { key: 'manage-venues', label: 'Manage Venues', icon: 'storefront-outline', onPress: (navigation) => navigation.navigate('VenueStack', { screen: 'VenueHostDashboard' }) },
        { key: 'view-bookings', label: 'View Bookings', icon: 'receipt-outline', onPress: (navigation) => navigation.navigate('VenueStack', { screen: 'MyBookings' }) },
    ],
};

const QuickActions = ({ role = 'user', navigation }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    const actions = ACTIONS_BY_ROLE[role] || ACTIONS_BY_ROLE.user;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.row}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.key}
                        style={styles.actionItem}
                        onPress={() => action.onPress(navigation)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.actionCircle}>
                            <Ionicons name={action.icon} size={24} color={colors.accent} />
                        </View>
                        <Text style={styles.actionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionItem: {
        width: 80,
        marginRight: 16,
        alignItems: 'center',
    },
    actionCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surface2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        marginTop: 6,
        fontSize: 12,
        textAlign: 'center',
        color: colors.text,
    },
});

export default QuickActions;
