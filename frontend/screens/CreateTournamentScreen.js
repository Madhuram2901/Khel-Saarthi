import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/api';

const CreateTournamentScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        sport: '',
        format: 'KNOCKOUT',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        venues: '',
        isPublic: false,
    });

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const formats = [
        { value: 'KNOCKOUT', label: 'Knockout', icon: 'git-branch-outline' },
        { value: 'ROUND_ROBIN', label: 'Round Robin', icon: 'repeat-outline' },
        { value: 'GROUPS_PLUS_KNOCKOUT', label: 'Groups + Knockout', icon: 'grid-outline' },
    ];

    const handleCreate = async () => {
        if (!formData.name || !formData.sport) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const venuesArray = formData.venues
                .split(',')
                .map(v => v.trim())
                .filter(v => v);

            const { data } = await api.post('/tournaments', {
                ...formData,
                venues: venuesArray,
            });

            Alert.alert('Success', 'Tournament created successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('TournamentDashboard', {
                        tournamentId: data._id,
                    }),
                },
            ]);
        } catch (error) {
            console.error('Error creating tournament:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create tournament');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tournament Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Summer Championship 2024"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sport *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Football, Cricket, Basketball"
                        value={formData.sport}
                        onChangeText={(text) => setFormData({ ...formData, sport: text })}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tournament Format</Text>
                <View style={styles.formatContainer}>
                    {formats.map((format) => (
                        <TouchableOpacity
                            key={format.value}
                            style={[
                                styles.formatCard,
                                formData.format === format.value && styles.formatCardSelected,
                            ]}
                            onPress={() => setFormData({ ...formData, format: format.value })}
                        >
                            <Ionicons
                                name={format.icon}
                                size={32}
                                color={formData.format === format.value ? '#007AFF' : '#666'}
                            />
                            <Text
                                style={[
                                    styles.formatLabel,
                                    formData.format === format.value && styles.formatLabelSelected,
                                ]}
                            >
                                {format.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Schedule</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                        <Text style={styles.dateText}>{formatDate(formData.startDate)}</Text>
                    </TouchableOpacity>
                </View>

                {showStartPicker && (
                    <DateTimePicker
                        value={formData.startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowStartPicker(false);
                            if (selectedDate) {
                                setFormData({ ...formData, startDate: selectedDate });
                            }
                        }}
                    />
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>End Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                        <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
                    </TouchableOpacity>
                </View>

                {showEndPicker && (
                    <DateTimePicker
                        value={formData.endDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={formData.startDate}
                        onChange={(event, selectedDate) => {
                            setShowEndPicker(false);
                            if (selectedDate) {
                                setFormData({ ...formData, endDate: selectedDate });
                            }
                        }}
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Details</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venues (comma separated)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="e.g., Main Ground, Field A, Court 1"
                        value={formData.venues}
                        onChangeText={(text) => setFormData({ ...formData, venues: text })}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <TouchableOpacity
                    style={styles.switchRow}
                    onPress={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                >
                    <View style={styles.switchLeft}>
                        <Ionicons name="globe-outline" size={24} color="#666" />
                        <View style={styles.switchTextContainer}>
                            <Text style={styles.switchLabel}>Make Public</Text>
                            <Text style={styles.switchDescription}>
                                Anyone can view this tournament
                            </Text>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.switch,
                            formData.isPublic && styles.switchActive,
                        ]}
                    >
                        <View
                            style={[
                                styles.switchThumb,
                                formData.isPublic && styles.switchThumbActive,
                            ]}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.createButton, loading && styles.createButtonDisabled]}
                onPress={handleCreate}
                disabled={loading}
            >
                <Text style={styles.createButtonText}>
                    {loading ? 'Creating...' : 'Create Tournament'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1D1D1F',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    formatContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    formatCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
    },
    formatCardSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#F0F8FF',
    },
    formatLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    formatLabelSelected: {
        color: '#007AFF',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    dateText: {
        fontSize: 16,
        color: '#1D1D1F',
        marginLeft: 12,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    switchLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    switchTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    switchDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    switch: {
        width: 51,
        height: 31,
        borderRadius: 16,
        backgroundColor: '#E5E5EA',
        padding: 2,
        justifyContent: 'center',
    },
    switchActive: {
        backgroundColor: '#34C759',
    },
    switchThumb: {
        width: 27,
        height: 27,
        borderRadius: 14,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    switchThumbActive: {
        transform: [{ translateX: 20 }],
    },
    createButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default CreateTournamentScreen;
