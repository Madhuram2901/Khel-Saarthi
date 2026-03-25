import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const ParticipantsScreen = ({ route }) => {
    const { eventId } = route.params;
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const { data } = await api.get(`/events/${eventId}/participants`);
                setParticipants(data);
            } catch (error) {
                console.error(error.response.data);
                Alert.alert('Error', 'Could not load participants.');
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, [eventId]);

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} color={colors.accent} />;
    }

    const renderParticipant = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={participants}
                renderItem={renderParticipant}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={<Text style={styles.title}>Registered Participants</Text>}
                ListEmptyComponent={<Text style={styles.centeredText}>No one has registered yet.</Text>}
            />
        </View>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    centeredText: { textAlign: 'center', marginTop: 20, color: colors.textSecondary },
    container: { flex: 1, padding: 10, backgroundColor: colors.background },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: colors.text },
    card: { backgroundColor: colors.surface, padding: 15, borderRadius: 8, marginBottom: 10 },
    name: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    email: { fontSize: 14, color: colors.textSecondary },
});

export default ParticipantsScreen;