import React, { useState, useMemo } from 'react';
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
import { useTheme } from '../context/ThemeContext';

const CreateTournamentScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [formData, setFormData] = useState({
        name: '',
        sport: '',
        format: 'KNOCKOUT',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
                        placeholderTextColor={colors.textSecondary}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sport *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Football, Cricket, Basketball"
                        placeholderTextColor={colors.textSecondary}
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
                                color={formData.format === format.value ? colors.accent : colors.textSecondary}
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
                        <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                        <Text style={styles.dateText}>{formatDate(formData.startDate)}</Text>
                    </TouchableOpacity>
                </View>

                {showStartPicker && (
                    <View style={{ backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
                        <DateTimePicker
                            value={formData.startDate}
                            mode="date"
                            display="spinner"
                            themeVariant={isDark ? 'dark' : 'light'}
                            onChange={(event, selectedDate) => {
                                setShowStartPicker(false);
                                if (selectedDate) {
                                    setFormData({ ...formData, startDate: selectedDate });
                                }
                            }}
                        />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>End Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                        <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
                    </TouchableOpacity>
                </View>

                {showEndPicker && (
                    <View style={{ backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
                        <DateTimePicker
                            value={formData.endDate}
                            mode="date"
                            display="spinner"
                            themeVariant={isDark ? 'dark' : 'light'}
                            minimumDate={formData.startDate}
                            onChange={(event, selectedDate) => {
                                setShowEndPicker(false);
                                if (selectedDate) {
                                    setFormData({ ...formData, endDate: selectedDate });
                                }
                            }}
                        />
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Details</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venues (comma separated)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="e.g., Main Ground, Field A, Court 1"
                        placeholderTextColor={colors.textSecondary}
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
                        <Ionicons name="globe-outline" size={24} color={colors.textSecondary} />
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

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        color: colors.text,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
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
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    formatCardSelected: {
        borderColor: colors.accent,
        backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#F0F8FF',
    },
    formatLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    formatLabelSelected: {
        color: colors.accent,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 12,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.text,
    },
    switchDescription: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    switch: {
        width: 51,
        height: 31,
        borderRadius: 16,
        backgroundColor: colors.border,
        padding: 2,
        justifyContent: 'center',
    },
    switchActive: {
        backgroundColor: colors.accentGreen,
    },
    switchThumb: {
        width: 27,
        height: 27,
        borderRadius: 14,
        backgroundColor: '#FFF',
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    switchThumbActive: {
        transform: [{ translateX: 20 }],
    },
    createButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: colors.accent,
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
