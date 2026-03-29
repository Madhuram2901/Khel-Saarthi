import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const getFullImageUrl = (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
};

const EditTeamScreen = ({ route, navigation }) => {
    const { team, tournamentId } = route.params;
    const { user } = useContext(AuthContext);
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [teamName, setTeamName] = useState(team?.name || '');
    const [teamLogo, setTeamLogo] = useState(null);
    const [currentLogoUrl] = useState(team?.logoUrl || null);
    const [players, setPlayers] = useState(
        team?.players?.length > 0
            ? team.players.map((p, i) => ({
                  id: p._id || `player-${i}`,
                  name: p.name || '',
                  role: p.role || 'Player',
              }))
            : [{ id: 'captain', name: '', role: 'Captain' }]
    );
    const [submitting, setSubmitting] = useState(false);

    const handlePickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setTeamLogo(result.assets[0]);
        }
    };

    const updatePlayer = (id, key, value) => {
        setPlayers((current) =>
            current.map((player) =>
                player.id === id ? { ...player, [key]: value } : player
            )
        );
    };

    const addPlayer = () => {
        setPlayers((current) => [
            ...current,
            { id: `${Date.now()}-${current.length}`, name: '', role: 'Player' },
        ]);
    };

    const removePlayer = (id) => {
        if (players.length === 1) {
            Alert.alert('Error', 'Team must have at least one player');
            return;
        }
        setPlayers((current) => current.filter((player) => player.id !== id));
    };

    const handleSave = async () => {
        if (!teamName.trim()) {
            Alert.alert('Error', 'Please enter a team name');
            return;
        }

        const cleanedPlayers = players
            .map((player) => ({
                name: player.name.trim(),
                role: player.role,
                user: player.role === 'Captain' ? user?._id : undefined,
            }))
            .filter((player) => player.name);

        if (cleanedPlayers.length === 0) {
            Alert.alert('Error', 'Add at least one team member');
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('name', teamName.trim());
            formData.append('players', JSON.stringify(cleanedPlayers));

            if (teamLogo) {
                const filename = teamLogo.uri.split('/').pop();
                const ext = /\.(\w+)$/.exec(filename || '');
                formData.append('logo', {
                    uri: teamLogo.uri,
                    name: filename || 'team-logo.jpg',
                    type: ext ? `image/${ext[1]}` : 'image/jpeg',
                });
            }

            const response = await api.put(
                `/tournaments/${tournamentId}/teams/${team._id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const updatedTeam = response?.data || {};

            Alert.alert('Success', 'Team updated successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            console.error('Error updating team:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to update team'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTeam = async () => {
        Alert.alert(
            'Delete Team',
            'Are you sure you want to delete this team? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            await api.delete(
                                `/tournaments/${tournamentId}/teams/${team._id}`
                            );

                            Alert.alert('Success', 'Team deleted successfully', [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        navigation.navigate('TournamentDashboard', {
                                            tournamentId,
                                        });
                                    },
                                },
                            ]);
                        } catch (error) {
                            console.error('Error deleting team:', error);
                            Alert.alert(
                                'Error',
                                error.response?.data?.message || 'Failed to delete team'
                            );
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Edit Team</Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Team Details</Text>
                <TouchableOpacity style={styles.logoPicker} onPress={handlePickLogo}>
                    {teamLogo ? (
                        <Image source={{ uri: teamLogo.uri }} style={styles.logoPreview} />
                    ) : currentLogoUrl && getFullImageUrl(currentLogoUrl) ? (
                        <Image source={{ uri: getFullImageUrl(currentLogoUrl) }} style={styles.logoPreview} />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                            <Text style={styles.logoText}>Change Team Logo</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="Team name"
                    placeholderTextColor={colors.textSecondary}
                    value={teamName}
                    onChangeText={setTeamName}
                />
            </View>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Team Members</Text>
                    <TouchableOpacity style={styles.addMemberButton} onPress={addPlayer}>
                        <Ionicons name="add" size={18} color="#FFF" />
                        <Text style={styles.addMemberButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {players.map((player, index) => (
                    <View key={player.id} style={styles.playerCard}>
                        <View style={styles.playerHeader}>
                            <Text style={styles.playerLabel}>Member {index + 1}</Text>
                            {players.length > 1 && (
                                <TouchableOpacity onPress={() => removePlayer(player.id)}>
                                    <Ionicons name="trash-outline" size={18} color={colors.accentRed || '#FF3B30'} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Player name"
                            placeholderTextColor={colors.textSecondary}
                            value={player.name}
                            onChangeText={(text) => updatePlayer(player.id, 'name', text)}
                        />

                        <View style={styles.roleRow}>
                            {['Captain', 'Vice Captain', 'Player'].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleChip,
                                        player.role === role && styles.roleChipActive,
                                    ]}
                                    onPress={() => updatePlayer(player.id, 'role', role)}
                                >
                                    <Text
                                        style={[
                                            styles.roleChipText,
                                            player.role === role && styles.roleChipTextActive,
                                        ]}
                                    >
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={submitting}
            >
                <Text style={styles.saveButtonText}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.deleteButton, submitting && styles.deleteButtonDisabled]}
                onPress={handleDeleteTeam}
                disabled={submitting}
            >
                <Ionicons name="trash-outline" size={18} color="#FFF" />
                <Text style={styles.deleteButtonText}>Delete Team</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={submitting}
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 20,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoPicker: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        backgroundColor: isDark ? 'rgba(0,122,255,0.08)' : '#EAF3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: isDark ? 'rgba(0,122,255,0.2)' : '#D0E8FF',
    },
    logoPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    logoText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 8,
    },
    input: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
        marginBottom: 12,
    },
    playerCard: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F9F9FB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#EAEAEA',
    },
    playerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    playerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    roleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    roleChip: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'transparent',
        alignItems: 'center',
    },
    roleChipActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    roleChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
    roleChipTextActive: {
        color: '#FFF',
    },
    addMemberButton: {
        flexDirection: 'row',
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        gap: 4,
    },
    addMemberButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: colors.accent,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButton: {
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    cancelButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default EditTeamScreen;
