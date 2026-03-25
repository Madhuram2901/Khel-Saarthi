import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const VenueHostDashboard = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHostBookings = async () => {
        try {
            const { data } = await api.get('/venues/bookings/host');
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHostBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHostBookings();
    };

    const renderBooking = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Image
                    source={{ uri: item.venue?.images?.[0] || 'https://via.placeholder.com/100' }}
                    style={styles.venueImage}
                />
                <View style={styles.headerText}>
                    <Text style={styles.venueName}>{item.venue?.name}</Text>
                    <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
                    <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: item.status === 'confirmed' ? colors.accentGreen : '#FF9500' }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.customerInfo}>
                <Image
                    source={{ uri: item.user?.profilePicture || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View>
                    <Text style={styles.customerName}>{item.user?.name}</Text>
                    <Text style={styles.customerEmail}>{item.user?.email}</Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Total</Text>
                    <Text style={styles.amount}>₹{item.totalAmount}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.dashboardHeader}>
                <Text style={styles.title}>Venue Dashboard</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddVenue')} style={styles.addButton}>
                    <Ionicons name="add-circle" size={24} color={colors.accent} />
                    <Text style={styles.addText}>Add Venue</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={styles.loader} color={colors.accent} />
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={<Text style={styles.sectionTitle}>Incoming Bookings</Text>}
                    ListEmptyComponent={<Text style={styles.empty}>No bookings yet</Text>}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
            )}
        </View>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    dashboardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    addButton: { flexDirection: 'row', alignItems: 'center' },
    addText: { color: colors.accent, fontWeight: '600', marginLeft: 5 },
    list: { padding: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: colors.textSecondary },
    card: { backgroundColor: colors.surface, borderRadius: 12, marginBottom: 15, padding: 15, elevation: 2, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    header: { flexDirection: 'row', marginBottom: 15 },
    venueImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
    headerText: { flex: 1, justifyContent: 'center' },
    venueName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: colors.text },
    date: { fontSize: 14, color: colors.textSecondary },
    time: { fontSize: 14, color: colors.textSecondary },
    statusBadge: { justifyContent: 'center' },
    statusText: { fontWeight: 'bold', fontSize: 12 },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 15 },
    customerInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    customerName: { fontWeight: '600', fontSize: 14, color: colors.text },
    customerEmail: { fontSize: 12, color: colors.textSecondary },
    amountContainer: { marginLeft: 'auto', alignItems: 'flex-end' },
    amountLabel: { fontSize: 12, color: colors.textSecondary },
    amount: { fontSize: 16, fontWeight: 'bold', color: colors.accent },
    loader: { marginTop: 50 },
    empty: { textAlign: 'center', marginTop: 50, color: colors.textSecondary }
});

export default VenueHostDashboard;
