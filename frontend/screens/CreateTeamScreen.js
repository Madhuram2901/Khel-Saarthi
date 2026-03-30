import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const defaultPlayers = [{ id: 'captain', name: '', role: 'Captain' }];

const CreateTeamScreen = ({ route, navigation }) => {
    const { tournamentId, tournamentName } = route.params;
    const { user } = useContext(AuthContext);
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const [teamName, setTeamName] = useState('');
    const [teamLogo, setTeamLogo] = useState(null);
    const [players, setPlayers] = useState(defaultPlayers);
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
        setPlayers((current) => current.filter((player) => player.id !== id));
    };

    const handleSubmit = async () => {
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

            let response;

            response = await api.post(
                `/tournaments/${tournamentId}/register-team`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const responseTeam =
                response?.data?.team || response?.data || {};

            const createdTeam = {
                _id: responseTeam._id || `temp-${Date.now()}`,
                name: responseTeam.name || teamName.trim(),
                logoUrl: responseTeam.logoUrl || teamLogo?.uri,
                players: responseTeam.players || cleanedPlayers,
                owner: responseTeam.owner || user?._id,
                createdBy: responseTeam.createdBy || user?._id,
            };

            Alert.alert('Success', 'Team registered successfully', [
                {
                    text: 'OK',
                    onPress: () =>
                        navigation.replace('TournamentDashboard', {
                            tournamentId,
                            createdTeam,
                            refreshToken: Date.now(),
                        }),
                },
            ]);
        } catch (error) {
            console.error('Error registering team:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to register team'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Register Team</Text>
            <Text style={styles.subtitle}>
                Create a team for {tournamentName || 'this tournament'}.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Team Details</Text>
                <TouchableOpacity style={styles.logoPicker} onPress={handlePickLogo}>
                    {teamLogo ? (
                        <Image source={{ uri: teamLogo.uri }} style={styles.logoPreview} />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                            <Text style={styles.logoText}>Add Team Logo</Text>
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
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                <Text style={styles.submitButtonText}>
                    {submitting ? 'Registering...' : 'Register Team'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 16, paddingBottom: 32 },
    title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 6 },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 18 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
    logoPicker: { height: 120, borderRadius: 16, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.surface2, justifyContent: 'center', alignItems: 'center', marginBottom: 14, overflow: 'hidden' },
    logoPreview: { width: '100%', height: '100%' },
    logoText: { marginTop: 8, fontSize: 14, color: colors.textSecondary },
    input: { backgroundColor: colors.surface2, borderRadius: 12, padding: 14, fontSize: 15, color: colors.text, marginBottom: 12 },
    addMemberButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
    addMemberButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700', marginLeft: 4 },
    playerCard: { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.surface2, borderRadius: 14, padding: 12, marginBottom: 12 },
    playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    playerLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
    roleRow: { flexDirection: 'row', flexWrap: 'wrap' },
    roleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface, marginRight: 8, marginBottom: 8 },
    roleChipActive: { backgroundColor: colors.accent },
    roleChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    roleChipTextActive: { color: '#FFF' },
    submitButton: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default CreateTeamScreen;
