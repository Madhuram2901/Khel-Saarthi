
import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import AppCard from '../components/AppCard';
import { CARD_SHADOW, RADII, SIZES, SPACING, TYPOGRAPHY } from '../theme/designSystem';
import { getSportEmoji, getSkillLevelLabel } from '../utils/sportsHelper';

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
    const [sportsProfiles, setSportsProfiles] = useState([]);
    const [loadingProfiles, setLoadingProfiles] = useState(false);

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

    useFocusEffect(
        useCallback(() => {
            fetchSportsProfiles();
        }, [])
    );

    const fetchSportsProfiles = async () => {
        try {
            setLoadingProfiles(true);
            const res = await api.get('/sports-profiles');
            setSportsProfiles(res.data || []);
        } catch (error) {
            console.error('Error fetching sports profiles:', error);
            setSportsProfiles([]);
        } finally {
            setLoadingProfiles(false);
        }
    };


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
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const MenuItem = ({ icon, title, subtitle, onPress, rightElement, color = colors.text }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.85}>
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
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header Card */}
                <View style={styles.section}>
                    <View style={[styles.profileHeaderCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.profileTopRow}>
                            <TouchableOpacity
                                onPress={pickImage}
                                activeOpacity={0.85}
                                style={[styles.avatarWrap, { backgroundColor: colors.surface2 }]}
                            >
                                {user?.profilePicture ? (
                                    <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={[styles.avatarInitial, { color: colors.text }]}>
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <View style={styles.profileMeta}>
                                <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
                                    {user?.name || 'User'}
                                </Text>
                                <View style={styles.roleRow}>
                                    <View style={[styles.roleBadge, { backgroundColor: colors.surface2 }]}>
                                        <Text style={[styles.roleText, { color: colors.textSecondary }]} numberOfLines={1}>
                                            {user?.role === 'host' ? 'Host' : 'Participant'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => setEditMode(true)}
                                activeOpacity={0.85}
                                style={[styles.editButton, { borderColor: colors.border }]}
                            >
                                <Ionicons name="create-outline" size={18} color={colors.accent} />
                                <Text style={[styles.editButtonText, { color: colors.accent }]}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.profileSub, { color: colors.textSecondary }]} numberOfLines={1}>
                            {user?.email || ''}
                        </Text>
                    </View>
                </View>

                {/* Statistics Cards Row */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Statistics</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name="trophy-outline" size={18} color={colors.accent} />
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Events Joined</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{eventsJoined}</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name="star-outline" size={18} color={colors.accent} />
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating / Level</Text>
                            <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
                                {badmintonProfile.skillLevel || '—'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <View style={styles.settingRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Auto Dark Mode</Text>
                                <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>
                                    Switches at 7 PM · Reverts at 7 AM
                                </Text>
                            </View>
                            <Switch
                                value={themeMode === 'auto'}
                                onValueChange={(val) => setMode(val ? 'auto' : (isDark ? 'dark' : 'light'))}
                                trackColor={{ false: colors.border, true: colors.accent }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {themeMode !== 'auto' && (
                            <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: colors.border }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                                    <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>
                                        Manual override
                                    </Text>
                                </View>
                                <Switch
                                    value={isDark}
                                    onValueChange={(val) => setMode(val ? 'dark' : 'light')}
                                    trackColor={{ false: colors.border, true: colors.accent }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        )}
                    </View>
                </View>

                {/* Sports Profiles Section */}
                <MenuSection title="Sports Profiles">
                    <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
                        {loadingProfiles ? (
                            <View style={styles.menuItem}>
                                <Text style={[styles.menuItemTitle, { color: colors.textSecondary }]}>Loading profiles...</Text>
                            </View>
                        ) : sportsProfiles.length > 0 ? (
                            sportsProfiles.map((profile, index) => (
                                <View key={profile._id}>
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() =>
                                            navigation.navigate('SportsProfileDetails', { profileId: profile._id })
                                        }
                                        activeOpacity={0.85}
                                    >
                                        <View style={styles.menuItemLeft}>
                                            <View style={[styles.menuIcon, { backgroundColor: `${colors.accent}15` }]}>
                                                <Text style={styles.sportEmoji}>{getSportEmoji(profile.sportName)}</Text>
                                            </View>
                                            <View style={styles.menuItemContent}>
                                                <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                                                    {profile.sportName}
                                                </Text>
                                                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                                                    {getSkillLevelLabel(profile.skillLevel)} · {profile.playstyle}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                    {index < sportsProfiles.length - 1 && (
                                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                    )}
                                </View>
                            ))
                        ) : (
                            <View style={styles.menuItem}>
                                <Text style={[styles.menuItemTitle, { color: colors.textSecondary }]}>
                                    No sports profiles yet
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Add New Profile Button */}
                    <TouchableOpacity
                        style={[styles.addProfileButton, { backgroundColor: colors.accent }]}
                        onPress={() => navigation.navigate('CreateSportsProfile')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle" size={20} color="#FFF" />
                        <Text style={styles.addProfileButtonText}>Add New Sport Profile</Text>
                    </TouchableOpacity>
                </MenuSection>

                {/* Settings Section */}
                <MenuSection title="Settings">
                    <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
                        <MenuItem
                            icon="notifications-outline"
                            title="Notifications"
                            subtitle="Push notifications, email alerts"
                            onPress={() => {/* TODO: Navigate to notifications settings */ }}
                            color={colors.accent}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <MenuItem
                            icon="lock-closed-outline"
                            title="Privacy & Security"
                            subtitle="Password, two-factor authentication"
                            onPress={() => {/* TODO: Navigate to privacy settings */ }}
                            color={colors.accent}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <MenuItem
                            icon="help-circle-outline"
                            title="Help & Support"
                            subtitle="FAQ, contact support"
                            onPress={() => {/* TODO: Navigate to help */ }}
                            color={colors.accentGreen}
                        />
                    </View>
                </MenuSection>

                {/* Account Section */}
                <MenuSection title="Account">
                    <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
                        <MenuItem
                            icon="log-out-outline"
                            title="Sign Out"
                            onPress={logout}
                            color={colors.accentRed}
                            rightElement={null}
                        />
                    </View>
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
    section: {
        marginTop: SPACING.sectionTop,
    },
    sectionTitle: {
        ...TYPOGRAPHY.sectionTitle,
        color: colors.text,
        paddingHorizontal: SPACING.screenHorizontal,
        marginBottom: SPACING.sectionBottom,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
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
        ...TYPOGRAPHY.cardTitle,
        color: colors.text,
        marginBottom: 2,
    },
    menuItemSubtitle: {
        ...TYPOGRAPHY.body,
        color: colors.textSecondary,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingRowBorder: {
        borderTopWidth: StyleSheet.hairlineWidth,
        marginTop: 8,
        paddingTop: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubLabel: {
        fontSize: 13,
        marginTop: 2,
    },
    card: {
        borderRadius: RADII.card,
        padding: 16,
        marginHorizontal: SPACING.screenHorizontal,
        ...CARD_SHADOW,
    },
    listCard: {
        borderRadius: RADII.card,
        marginHorizontal: SPACING.screenHorizontal,
        overflow: 'hidden',
        ...CARD_SHADOW,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 16 + 40 + 16,
    },
    // Profile header
    profileHeaderCard: {
        borderRadius: RADII.card,
        padding: 16,
        marginHorizontal: SPACING.screenHorizontal,
        ...CARD_SHADOW,
    },
    profileTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 22,
        fontWeight: '700',
    },
    profileMeta: {
        flex: 1,
        marginLeft: 12,
    },
    profileName: {
        ...TYPOGRAPHY.screenTitle,
        fontSize: 20,
    },
    roleRow: {
        flexDirection: 'row',
        marginTop: 6,
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: RADII.pill,
    },
    roleText: {
        ...TYPOGRAPHY.small,
        fontWeight: '700',
    },
    editButton: {
        height: SIZES.inputHeight,
        paddingHorizontal: 12,
        borderRadius: RADII.button,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    editButtonText: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
    },
    profileSub: {
        ...TYPOGRAPHY.body,
        marginTop: 12,
        paddingHorizontal: 2,
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.cardGap,
        paddingHorizontal: SPACING.screenHorizontal,
    },
    statCard: {
        flex: 1,
        borderRadius: RADII.card,
        padding: 16,
        ...CARD_SHADOW,
    },
    statLabel: {
        ...TYPOGRAPHY.small,
        marginTop: 8,
        fontWeight: '600',
    },
    statValue: {
        ...TYPOGRAPHY.sectionTitle,
        marginTop: 6,
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
        height: SIZES.inputHeight,
        fontSize: 16,
        color: colors.text,
    },
    bottomPadding: {
        height: 40,
    },
    sportEmoji: {
        fontSize: 20,
    },
    addProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: SPACING.screenHorizontal,
        marginTop: SPACING.sectionBottom,
        paddingVertical: 12,
        borderRadius: RADII.button,
    },
    addProfileButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ProfileScreen;