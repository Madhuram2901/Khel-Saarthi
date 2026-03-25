import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const MyBookingsScreen = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/bookings/my');
                setBookings(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const renderBooking = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.venueName}>{item.venue?.name || 'Unknown Venue'}</Text>
                <Text style={[styles.status, { color: item.status === 'confirmed' ? colors.accentGreen : '#FF9500' }]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
            <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
            <Text style={styles.amount}>Total: ₹{item.totalAmount}</Text>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" style={styles.centered} color={colors.accent} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={bookings}
                renderItem={renderBooking}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No bookings found</Text>}
            />
        </View>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    list: { padding: 15 },
    card: { backgroundColor: colors.surface, padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    venueName: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    status: { fontWeight: 'bold', fontSize: 12 },
    date: { color: colors.text, marginBottom: 2 },
    time: { color: colors.textSecondary, marginBottom: 5 },
    amount: { fontWeight: 'bold', color: colors.accent },
    empty: { textAlign: 'center', marginTop: 50, color: colors.textSecondary }
});

export default MyBookingsScreen;
