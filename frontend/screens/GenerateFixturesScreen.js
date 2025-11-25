import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';

const GenerateFixturesScreen = ({ route, navigation }) => {
    const { tournamentId } = route.params;
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        Alert.alert(
            'Generate Fixtures',
            'This will create all tournament matches. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Generate',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.post(`/tournaments/${tournamentId}/generate`, {
                                format: route.params.format || 'KNOCKOUT',
                            });

                            Alert.alert('Success', 'Fixtures generated successfully', [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.goBack(),
                                },
                            ]);
                        } catch (error) {
                            console.error('Error generating fixtures:', error);
                            Alert.alert(
                                'Error',
                                error.response?.data?.message || 'Failed to generate fixtures'
                            );
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Ionicons name="git-network" size={64} color="#007AFF" />
                <Text style={styles.title}>Generate Fixtures</Text>
                <Text style={styles.subtitle}>
                    This will automatically create all tournament matches based on the teams you've
                    added and the tournament format.
                </Text>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color="#007AFF" />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>What happens next?</Text>
                        <Text style={styles.infoText}>
                            • All matches will be created automatically{'\n'}
                            • Teams will be randomly seeded{'\n'}
                            • You can edit match details later{'\n'}
                            • Publish the tournament when ready
                        </Text>
                    </View>
                </View>

                <View style={[styles.infoCard, styles.warningCard]}>
                    <Ionicons name="warning" size={24} color="#FF9800" />
                    <View style={styles.infoContent}>
                        <Text style={styles.warningTitle}>Important</Text>
                        <Text style={styles.warningText}>
                            Make sure all teams are added before generating fixtures. You can still
                            edit match details and enter results after generation.
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.generateButton, loading && styles.generateButtonDisabled]}
                onPress={handleGenerate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <>
                        <Ionicons name="flash" size={24} color="#FFF" />
                        <Text style={styles.generateButtonText}>Generate Fixtures</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1D1D1F',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    infoSection: {
        marginBottom: 32,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    warningCard: {
        borderLeftColor: '#FF9800',
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF9800',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    generateButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    generateButtonDisabled: {
        opacity: 0.6,
    },
    generateButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
    cancelButton: {
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default GenerateFixturesScreen;
