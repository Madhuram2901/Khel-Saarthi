import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { showImagePickerOptions, uploadImageToCloudinary } from '../utils/imageUpload';

const ManageTeamsScreen = ({ route, navigation }) => {
    const { tournamentId } = route.params;
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [bulkText, setBulkText] = useState('');
    const [showBulkInput, setShowBulkInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingTeamId, setUploadingTeamId] = useState(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const { data } = await api.get(`/tournaments/${tournamentId}/teams`);
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const handleAddTeam = async () => {
        if (!teamName.trim()) {
            Alert.alert('Error', 'Please enter a team name');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post(`/tournaments/${tournamentId}/teams`, {
                name: teamName.trim(),
            });
            setTeams([...teams, data]);
            setTeamName('');
            Alert.alert('Success', 'Team added successfully');
        } catch (error) {
            console.error('Error adding team:', error);
            Alert.alert('Error', 'Failed to add team');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAdd = async () => {
        if (!bulkText.trim()) {
            Alert.alert('Error', 'Please enter team names');
            return;
        }

        try {
            setLoading(true);
            const teamNames = bulkText
                .split(/[,\n]/)
                .map(name => name.trim())
                .filter(name => name);

            if (teamNames.length === 0) {
                Alert.alert('Error', 'No valid team names found');
                return;
            }

            const { data } = await api.post(`/tournaments/${tournamentId}/teams/bulk`, {
                teams: teamNames,
            });

            setTeams([...teams, ...data]);
            setBulkText('');
            setShowBulkInput(false);
            Alert.alert('Success', `${data.length} teams added successfully`);
        } catch (error) {
            console.error('Error bulk adding teams:', error);
            Alert.alert('Error', 'Failed to add teams');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadLogo = async (teamId) => {
        try {
            const imageAsset = await showImagePickerOptions();

            if (!imageAsset) return;

            setUploadingTeamId(teamId);

            // Upload to Cloudinary
            const logoUrl = await uploadImageToCloudinary(imageAsset, 'team_logos');

            // Update team with logo URL
            const { data } = await api.put(`/tournaments/${tournamentId}/teams/${teamId}`, {
                logoUrl,
            });

            // Update local state
            setTeams(teams.map(t => t._id === teamId ? data : t));

            Alert.alert('Success', 'Team logo uploaded successfully');
        } catch (error) {
            console.error('Error uploading logo:', error);
            Alert.alert('Error', 'Failed to upload logo. Please try again.');
        } finally {
            setUploadingTeamId(null);
        }
    };

    const handleDeleteTeam = async (teamId, teamName) => {
        Alert.alert(
            'Delete Team',
            `Are you sure you want to remove ${teamName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/tournaments/${tournamentId}/teams/${teamId}`);
                            setTeams(teams.filter(t => t._id !== teamId));
                            Alert.alert('Success', 'Team removed');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove team');
                        }
                    },
                },
            ]
        );
    };

    const renderTeam = ({ item }) => (
        <View style={styles.teamCard}>
            <TouchableOpacity
                style={styles.teamLogoContainer}
                onPress={() => handleUploadLogo(item._id)}
                disabled={uploadingTeamId === item._id}
            >
                {uploadingTeamId === item._id ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                ) : item.logoUrl ? (
                    <Image source={{ uri: item.logoUrl }} style={styles.teamLogo} />
                ) : (
                    <View style={styles.teamIcon}>
                        <Ionicons name="shield" size={24} color="#007AFF" />
                    </View>
                )}
                <View style={styles.uploadBadge}>
                    <Ionicons name="camera" size={12} color="#FFF" />
                </View>
            </TouchableOpacity>
            <Text style={styles.teamName}>{item.name}</Text>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTeam(item._id, item.name)}
            >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage Teams</Text>
                <TouchableOpacity
                    style={styles.bulkButton}
                    onPress={() => setShowBulkInput(!showBulkInput)}
                >
                    <Ionicons
                        name={showBulkInput ? 'person' : 'people'}
                        size={20}
                        color="#007AFF"
                    />
                    <Text style={styles.bulkButtonText}>
                        {showBulkInput ? 'Single' : 'Bulk'}
                    </Text>
                </TouchableOpacity>
            </View>

            {!showBulkInput ? (
                <View style={styles.addSection}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter team name"
                        value={teamName}
                        onChangeText={setTeamName}
                        onSubmitEditing={handleAddTeam}
                    />
                    <TouchableOpacity
                        style={[styles.addButton, loading && styles.addButtonDisabled]}
                        onPress={handleAddTeam}
                        disabled={loading}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.bulkSection}>
                    <Text style={styles.bulkLabel}>
                        Enter team names (comma or newline separated)
                    </Text>
                    <TextInput
                        style={styles.bulkInput}
                        placeholder="Team A, Team B, Team C&#10;or one per line"
                        value={bulkText}
                        onChangeText={setBulkText}
                        multiline
                        numberOfLines={6}
                    />
                    <TouchableOpacity
                        style={[styles.bulkAddButton, loading && styles.addButtonDisabled]}
                        onPress={handleBulkAdd}
                        disabled={loading}
                    >
                        <Text style={styles.bulkAddButtonText}>
                            {loading ? 'Adding...' : 'Add All Teams'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Teams ({teams.length})</Text>
            </View>

            <FlatList
                data={teams}
                renderItem={renderTeam}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No teams added yet</Text>
                        <Text style={styles.emptySubtext}>
                            Add teams individually or use bulk import
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    bulkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
    },
    bulkButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    addSection: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    input: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginRight: 12,
    },
    addButton: {
        backgroundColor: '#007AFF',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    bulkSection: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    bulkLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    bulkInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        height: 120,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    bulkAddButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    bulkAddButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    listHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    listContainer: {
        padding: 16,
        paddingTop: 0,
    },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    teamLogoContainer: {
        position: 'relative',
        marginRight: 12,
    },
    teamIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
    },
    uploadBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    teamName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#CCC',
        marginTop: 8,
    },
});

export default ManageTeamsScreen;
