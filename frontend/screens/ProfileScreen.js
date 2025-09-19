
// Profile screen: shows account info, badminton stats, and lets user update name/email and profile picture
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import AuthContext from '../context/AuthContext';
import StyledButton from '../components/StyledButton';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';

const ProfileScreen = ({ navigation }) => {

    const { user, logout, setUser } = useContext(AuthContext);
    const badmintonProfile = user.profiles?.badminton || {};
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
    const [image, setImage] = useState(null); // local image uri
    const [loading, setLoading] = useState(false);

    // Ask for photo library permission
    const requestMediaLibraryPermission = async () => {
        try {
            const { status, granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (granted) return true;
            if (!canAskAgain) {
                Alert.alert(
                    'Permission required',
                    'Please allow photo library access in Settings to change your profile picture.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings && Linking.openSettings() },
                    ]
                );
                return false;
            }
            // If status is denied but can ask again, return false (user declined)
            return false;
        } catch (e) {
            return false;
        }
    };

    // Open gallery and select an image (square crop)
    const pickImage = async () => {
        const ok = await requestMediaLibraryPermission();
        if (!ok) return;
        try {
            const options = {
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            };

            // Support both new and old Expo ImagePicker APIs
            if (ImagePicker?.MediaTypeOptions?.Images) {
                // Older API
                options.mediaTypes = ImagePicker.MediaTypeOptions.Images;
            } else if (ImagePicker?.MediaType) {
                // Newer API expects an array of MediaType
                const imgType = ImagePicker.MediaType.Images || ImagePicker.MediaType.Image || ImagePicker.MediaType.image;
                options.mediaTypes = imgType ? [imgType] : undefined;
            }

            const result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            } else if (result.canceled) {
                // Optional feedback so it doesn't feel like "nothing happened"
                // Alert.alert('No image selected');
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'Unable to open photo library');
        }
    };

    // Save updated name/email and optionally a new profile picture
    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            // Only send fields that changed to avoid unnecessary validation
            if (name !== user.name) {
                formData.append('name', name);
            }
            if (email !== user.email) {
                formData.append('email', email);
            }
            if (image) {
                const filename = image.split('/').pop();
                const match = /\.([\w]+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('profilePicture', {
                    uri: image,
                    name: filename,
                    type,
                });
            }
            const res = await api.put('/users/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Update user context and persist
            if (res.data) {
                setProfilePicture(res.data.profilePicture);
                if (setUser) await setUser(res.data);
                Alert.alert('Success', 'Profile updated!');
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Remove current profile photo
    const handleRemovePhoto = async () => {
        setLoading(true);
        try {
            const res = await api.delete('/users/profile-picture');
            if (res.data) {
                setImage(null);
                setProfilePicture('');
                if (setUser) await setUser({ ...user, profilePicture: '' });
                Alert.alert('Success', 'Profile picture removed');
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>My Profile</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Profile Picture:</Text>
                {image ? (
                    <Image source={{ uri: image }} style={styles.avatar} />
                ) : profilePicture ? (
                    <Image source={{ uri: profilePicture }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ color: '#aaa' }}>No Image</Text>
                    </View>
                )}
                <StyledButton title="Change Picture" onPress={pickImage} style={{ marginBottom: 10 }} />
                {!!(image || profilePicture) && (
                    <StyledButton title="Remove Picture" onPress={handleRemovePhoto} style={{ marginBottom: 10, backgroundColor: '#999' }} />
                )}
                <Text style={styles.label}>Name:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                />
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <Text style={styles.label}>Role:</Text>
                <Text style={styles.content}>{user.role}</Text>
                <StyledButton title={loading ? 'Saving...' : 'Save Changes'} onPress={handleSave} disabled={loading} />
            </View>

            <Text style={styles.header}>Badminton Stats</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Skill Level:</Text>
                <Text style={styles.content}>{badmintonProfile.skillLevel || 'Not Set'}</Text>
                <Text style={styles.label}>Playstyle:</Text>
                <Text style={styles.content}>{badmintonProfile.playstyle || 'Not Set'}</Text>
                <StyledButton
                    title="Edit Badminton Profile"
                    onPress={() => navigation.navigate('BadmintonProfile')}
                    style={{ marginTop: 15 }}
                />
            </View>

            <StyledButton title="Sign Out" onPress={logout} style={styles.logoutButton} />
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
    header: { fontSize: 22, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
    card: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginBottom: 20 },
    label: { fontSize: 14, color: 'gray' },
    content: { fontSize: 18, marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
        backgroundColor: '#fafafa',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        alignSelf: 'center',
    },
    logoutButton: { backgroundColor: '#FF3B30', marginTop: 20 },
});

export default ProfileScreen;