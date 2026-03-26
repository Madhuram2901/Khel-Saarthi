
import React, { useContext, useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Image,
    Alert,
    Linking,
    StatusBar,
    TouchableOpacity,
    Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StyledButton from '../components/StyledButton';
import ProfileCard from '../components/ProfileCard';
import { StatCard, StatRow } from '../components/StatCard';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import AppCard from '../components/AppCard';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, setUser } = useContext(AuthContext);
    const { themeMode, setMode, colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const badmintonProfile = user.profiles?.badminton || {};
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [eventsJoined, setEventsJoined] = useState(0);

    useEffect(() => {
        const fetchEventsJoined = async () => {
            try {
                const { data } = await api.get('/users/myevents');
                setEventsJoined(data.length);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEventsJoined();
    }, []);


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
            return false;
        } catch (e) {
            return false;
        }
    };

    const pickImage = async () => {
        const ok = await requestMediaLibraryPermission();
        if (!ok) return;
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
                setImage(result.assets[0].uri);
            }
        } catch (e) {
            Alert.alert('Error', 'Could not pick image');
        }
    };

    const updateProfile = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Error', 'Name and email are required');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);

            if (image) {
                formData.append('profilePicture', {
                    uri: image,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
                });
            }

            const { data } = await api.put('/users/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Update token and fetch fresh user data
            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }

            setUser(data);
            setImage(null);
            setEditMode(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not update profile');
        } finally {
            setLoading(false);
        }
    };

    const MenuSection = ({ title, children }) => (
        <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const MenuItem = ({ icon, title, subtitle, onPress, rightElement, color = colors.text }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{title}</Text>
                    {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
        </TouchableOpacity>
    );

    if (editMode) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
                <View style={styles.editHeader}>
                    <TouchableOpacity onPress={() => setEditMode(false)}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.editTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={updateProfile} disabled={loading}>
                        <Text style={[styles.saveButton, loading && styles.disabledButton]}>
                            {loading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.editForm}>
                    <View style={styles.editAvatarSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.editAvatarContainer}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.editAvatar} />
                            ) : user.profilePicture ? (
                                <Image source={{ uri: user.profilePicture }} style={styles.editAvatar} />
                            ) : (
                                <View style={styles.editAvatarPlaceholder}>
                                    <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                </View>
                            )}
                            <View style={styles.editAvatarOverlay}>
                                <Ionicons name="camera" size={20} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.editAvatarText}>Tap to change photo</Text>
                    </View>

                    <View style={styles.editInputSection}>
                        <View style={styles.editInputGroup}>
                            <Text style={styles.editInputLabel}>Name</Text>
                            <TextInput
                                style={styles.editInput}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.editInputGroup}>
                            <Text style={styles.editInputLabel}>Email</Text>
                            <TextInput
                                style={styles.editInput}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <ProfileCard
                    user={user}
                    onEditPress={() => setEditMode(true)}
                    onImagePress={pickImage}
                />

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Statistics</Text>
                    <StatRow>
                        <StatCard
                            icon="trophy"
                            title="Events Joined"
                            value={eventsJoined.toString()}
                            color="#FF6B35"
                        />
                        <StatCard
                            title="Rating"
                            image={
                                badmintonProfile.skillLevel === 'Beginner'
                                    ? require('../assets/beginner.png')
                                    : badmintonProfile.skillLevel === 'Intermediate'
                                        ? require('../assets/intermediate.png')
                                        : badmintonProfile.skillLevel === 'Advanced'
                                            ? require('../assets/advance.png')
                                            : null
                            }
                            imageColor={
                                badmintonProfile.skillLevel === 'Beginner'
                                    ? (isDark ? '#1B3A1E' : '#E8F5E9')
                                    : badmintonProfile.skillLevel === 'Intermediate'
                                        ? (isDark ? '#1A2A3A' : '#E3F2FD')
                                        : badmintonProfile.skillLevel === 'Advanced'
                                            ? (isDark ? '#3A2A1A' : '#FFF3E0')
                                            : colors.surface
                            }
                        />
                    </StatRow>
                </View>

                {/* Appearance Section */}
                <View style={styles.appearanceSection}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <AppCard style={styles.appearanceCard}>
                        {/* Auto toggle row */}
                        <View style={styles.settingRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingLabel}>Auto Dark Mode</Text>
                                <Text style={styles.settingSubLabel}>Switches at 7 PM · Reverts at 7 AM</Text>
                            </View>
                            <Switch
                                value={themeMode === 'auto'}
                                onValueChange={(val) => setMode(val ? 'auto' : (isDark ? 'dark' : 'light'))}
                                trackColor={{ false: colors.border, true: colors.accent }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {/* Manual override row — only shown when auto is OFF */}
                        {themeMode !== 'auto' && (
                            <View style={[styles.settingRow, styles.settingRowBorder]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.settingLabel}>Dark Mode</Text>
                                    <Text style={styles.settingSubLabel}>Manual override</Text>
                                </View>
                                <Switch
                                    value={isDark}
                                    onValueChange={(val) => setMode(val ? 'dark' : 'light')}
                                    trackColor={{ false: colors.border, true: colors.accent }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        )}
                    </AppCard>
                </View>

                {/* Sports Profiles Section */}
                <MenuSection title="Sports Profiles">
                    <MenuItem
                        icon="tennisball"
                        title="Badminton Profile"
                        subtitle={badmintonProfile.skillLevel ? `${badmintonProfile.skillLevel} Level` : "Not set up"}
                        onPress={() => navigation.navigate('BadmintonProfile')}
                        color="#AF52DE"
                    />
                </MenuSection>

                {/* Settings Section */}
                <MenuSection title="Settings">
                    <MenuItem
                        icon="notifications"
                        title="Notifications"
                        subtitle="Push notifications, email alerts"
                        onPress={() => {/* TODO: Navigate to notifications settings */ }}
                        color="#FF9500"
                    />
                    <MenuItem
                        icon="lock-closed"
                        title="Privacy & Security"
                        subtitle="Password, two-factor authentication"
                        onPress={() => {/* TODO: Navigate to privacy settings */ }}
                        color={colors.accent}
                    />
                    <MenuItem
                        icon="help-circle"
                        title="Help & Support"
                        subtitle="FAQ, contact support"
                        onPress={() => {/* TODO: Navigate to help */ }}
                        color={colors.accentGreen}
                    />
                </MenuSection>

                {/* Account Section */}
                <MenuSection title="Account">
                    <MenuItem
                        icon="log-out"
                        title="Sign Out"
                        onPress={logout}
                        color={colors.accentRed}
                        rightElement={null}
                    />
                </MenuSection>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    statsSection: {
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    menuSection: {
        marginBottom: 32,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginBottom: 2,
        borderRadius: 12,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    // Appearance section
    appearanceSection: {
        marginBottom: 32,
    },
    appearanceCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingRowBorder: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        marginTop: 8,
        paddingTop: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    settingSubLabel: {
        fontSize: 13,
        marginTop: 2,
        color: colors.textSecondary,
    },
    // Edit mode styles
    editHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    cancelButton: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    editTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.accent,
    },
    disabledButton: {
        color: colors.textSecondary,
    },
    editForm: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    editAvatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    editAvatarContainer: {
        position: 'relative',
    },
    editAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editAvatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.surface2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
    },
    editAvatarText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.textSecondary,
    },
    editInputSection: {
        paddingHorizontal: 20,
    },
    editInputGroup: {
        marginBottom: 24,
    },
    editInputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    editInput: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: colors.text,
    },
    bottomPadding: {
        height: 40,
    },
});

export default ProfileScreen;