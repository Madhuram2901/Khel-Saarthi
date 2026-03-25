import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const ManageTeamsScreen = ({ route, navigation }) => {
    const { tournamentId } = route.params;
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [teamLogo, setTeamLogo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [editName, setEditName] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [playerRole, setPlayerRole] = useState('Player');
    const [expandedTeam, setExpandedTeam] = useState(null);

    useEffect(() => { fetchTeams(); }, []);

    const fetchTeams = async () => {
        try {
            const { data } = await api.get(`/tournaments/${tournamentId}`);
            setTeams(data.teams);
        } catch (error) { Alert.alert('Error', 'Failed to load teams'); } finally { setLoading(false); }
    };

    const handlePickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
        if (!result.canceled) setTeamLogo(result.assets[0]);
    };

    const handleAddTeam = async () => {
        if (!teamName.trim()) { Alert.alert('Error', 'Please enter a team name'); return; }
        try {
            setAdding(true);
            const formData = new FormData();
            formData.append('name', teamName.trim());
            if (teamLogo) { const filename = teamLogo.uri.split('/').pop(); const ext = /\.(\w+)$/.exec(filename); formData.append('logo', { uri: teamLogo.uri, name: filename, type: ext ? `image/${ext[1]}` : 'image/jpeg' }); }
            await api.post(`/tournaments/${tournamentId}/teams`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setTeamName(''); setTeamLogo(null);
            fetchTeams();
        } catch (error) { Alert.alert('Error', error.response?.data?.message || 'Failed to add team'); } finally { setAdding(false); }
    };

    const handleDeleteTeam = (teamId, name) => {
        Alert.alert('Delete Team', `Are you sure you want to delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { try { await api.delete(`/tournaments/${tournamentId}/teams/${teamId}`); fetchTeams(); } catch (error) { Alert.alert('Error', 'Failed to delete team'); } } },
        ]);
    };

    const handleEditTeam = async (teamId) => {
        if (!editName.trim()) return;
        try { await api.put(`/tournaments/${tournamentId}/teams/${teamId}`, { name: editName.trim() }); setEditingTeam(null); setEditName(''); fetchTeams(); } catch (error) { Alert.alert('Error', 'Failed to update team'); }
    };

    const handleAddPlayer = async (teamId) => {
        if (!playerName.trim()) { Alert.alert('Error', 'Please enter a player name'); return; }
        try { await api.post(`/tournaments/${tournamentId}/teams/${teamId}/players`, { name: playerName.trim(), role: playerRole }); setPlayerName(''); setPlayerRole('Player'); fetchTeams(); } catch (error) { Alert.alert('Error', error.response?.data?.message || 'Failed to add player'); }
    };

    const handleRemovePlayer = async (teamId, playerId) => {
        try { await api.delete(`/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`); fetchTeams(); } catch (error) { Alert.alert('Error', 'Failed to remove player'); }
    };

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1, backgroundColor: colors.background }} color={colors.accent} />;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.addSection}>
                <Text style={styles.sectionTitle}>Add New Team</Text>
                <View style={styles.addRow}>
                    <TouchableOpacity style={styles.logoPicker} onPress={handlePickLogo}>
                        {teamLogo ? <Image source={{ uri: teamLogo.uri }} style={styles.logoPreview} /> : <Ionicons name="camera" size={24} color={colors.textSecondary} />}
                    </TouchableOpacity>
                    <TextInput style={styles.input} placeholder="Team Name" placeholderTextColor={colors.textSecondary} value={teamName} onChangeText={setTeamName} />
                    <TouchableOpacity style={[styles.addButton, adding && styles.addButtonDisabled]} onPress={handleAddTeam} disabled={adding}>
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Teams ({teams.length})</Text>
            {teams.map((team) => (
                <View key={team._id} style={styles.teamCard}>
                    <View style={styles.teamHeader}>
                        {team.logoUrl ? <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} /> : <View style={styles.teamIcon}><Ionicons name="shield" size={24} color={colors.accent} /></View>}
                        {editingTeam === team._id ? (
                            <View style={styles.editRow}>
                                <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} autoFocus placeholderTextColor={colors.textSecondary} />
                                <TouchableOpacity onPress={() => handleEditTeam(team._id)}><Ionicons name="checkmark" size={24} color={colors.accentGreen} /></TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingTeam(null)}><Ionicons name="close" size={24} color={colors.accentRed} /></TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.teamInfo}>
                                <Text style={styles.teamName}>{team.name}</Text>
                                <Text style={styles.playerCount}>{team.players?.length || 0} players</Text>
                            </View>
                        )}
                        <View style={styles.teamActions}>
                            <TouchableOpacity onPress={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}><Ionicons name={expandedTeam === team._id ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => { setEditingTeam(team._id); setEditName(team.name); }}><Ionicons name="create-outline" size={20} color={colors.accent} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteTeam(team._id, team.name)}><Ionicons name="trash-outline" size={20} color={colors.accentRed} /></TouchableOpacity>
                        </View>
                    </View>

                    {expandedTeam === team._id && (
                        <View style={styles.playersSection}>
                            <View style={styles.divider} />
                            <Text style={styles.playersTitle}>Players</Text>
                            {team.players?.map((player) => (
                                <View key={player._id} style={styles.playerRow}>
                                    <View style={styles.playerInfo}><Text style={styles.playerName}>{player.name}</Text><Text style={styles.playerRole}>{player.role}</Text></View>
                                    <TouchableOpacity onPress={() => handleRemovePlayer(team._id, player._id)}><Ionicons name="remove-circle-outline" size={20} color={colors.accentRed} /></TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.addPlayerRow}>
                                <TextInput style={styles.playerInput} placeholder="Player name" placeholderTextColor={colors.textSecondary} value={playerName} onChangeText={setPlayerName} />
                                <TouchableOpacity style={styles.roleButton} onPress={() => setPlayerRole(playerRole === 'Player' ? 'Captain' : playerRole === 'Captain' ? 'Vice Captain' : 'Player')}>
                                    <Text style={styles.roleText}>{playerRole}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.addPlayerButton} onPress={() => handleAddPlayer(team._id)}><Ionicons name="add" size={20} color="#FFF" /></TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            ))}
            {teams.length === 0 && <View style={styles.emptyState}><Ionicons name="people-outline" size={64} color={colors.textMuted} /><Text style={styles.emptyText}>No teams yet. Add your first team above!</Text></View>}
        </ScrollView>
    );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 16, paddingBottom: 40 },
    addSection: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
    addRow: { flexDirection: 'row', alignItems: 'center' },
    logoPicker: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface2, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
    logoPreview: { width: 48, height: 48, borderRadius: 24 },
    input: { flex: 1, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, fontSize: 16, color: colors.text, marginRight: 12 },
    addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
    addButtonDisabled: { opacity: 0.6 },
    teamCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
    teamHeader: { flexDirection: 'row', alignItems: 'center' },
    teamLogo: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    teamIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#F0F8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    editRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    editInput: { flex: 1, backgroundColor: colors.surface2, borderRadius: 8, padding: 8, fontSize: 14, color: colors.text },
    teamInfo: { flex: 1 },
    teamName: { fontSize: 16, fontWeight: '600', color: colors.text },
    playerCount: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    teamActions: { flexDirection: 'row', gap: 12 },
    playersSection: { marginTop: 12 },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
    playersTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
    playerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surface2 },
    playerInfo: { flex: 1 },
    playerName: { fontSize: 14, fontWeight: '500', color: colors.text },
    playerRole: { fontSize: 12, color: colors.textSecondary },
    addPlayerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    playerInput: { flex: 1, backgroundColor: colors.surface2, borderRadius: 8, padding: 10, fontSize: 14, color: colors.text, marginRight: 8 },
    roleButton: { backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : '#E8F0FE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
    roleText: { fontSize: 12, fontWeight: '600', color: colors.accent },
    addPlayerButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentGreen, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 16, textAlign: 'center' },
});

export default ManageTeamsScreen;
