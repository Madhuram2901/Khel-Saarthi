
import React, { useContext, useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    StatusBar,
    TouchableOpacity,
    Switch,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { CARD_SHADOW, RADII, SIZES, SPACING, TYPOGRAPHY } from '../theme/designSystem';
import { getSportEmoji, getSkillLevelLabel } from '../utils/sportsHelper';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const { themeMode, setMode, colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    const { width } = useWindowDimensions();

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

    useEffect(() => {
        fetchSportsProfiles();
    }, []);

    if (!user) {
        return null;
    }

    const height = user?.profile?.height ?? user?.physicalStats?.height ?? user?.height ?? null;
    const weight = user?.profile?.weight ?? user?.physicalStats?.weight ?? user?.weight ?? null;

    const calculateBMI = (heightValue, weightValue) => {
        const numericHeight = Number(heightValue);
        const numericWeight = Number(weightValue);
        if (!numericHeight || !numericWeight) return null;
        const heightInMeters = numericHeight / 100;
        const bmi = numericWeight / (heightInMeters * heightInMeters);
        return bmi.toFixed(1);
    };
    const getBMIColor = (bmi) => {
        if (!bmi) return colors.textSecondary;
        if (bmi < 18.5) return '#FF9500';
        if (bmi < 25) return colors.accentGreen;
        if (bmi < 30) return '#FF9500';
        return colors.accentRed;
    };

    const bmiValue = calculateBMI(height, weight);
    const bmiNumber = bmiValue ? parseFloat(bmiValue) : null;
    const statsCardWidth = Math.max((width - 40) / 4, 88);

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

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header Card */}
                <View style={styles.headerSection}>
                    <View style={[styles.profileHeaderCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.profileTopRow}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditProfile')}
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
                                onPress={() => navigation.navigate('EditProfile')}
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
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.statsContainer}
                    >
                        <View style={[styles.statsRow, { minWidth: width - 32 }]}>
                            <View style={[styles.statCard, styles.centeredStatCard, { backgroundColor: colors.surface, minWidth: statsCardWidth }]}>
                                <Ionicons name="trophy-outline" size={24} color={colors.accent} />
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Events Joined</Text>
                                <Text style={[styles.statValue, { color: colors.text }]}>{eventsJoined}</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: colors.surface, minWidth: statsCardWidth }]}>
                                <Ionicons name="resize-outline" size={24} color={colors.accent} />
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Height (cm)</Text>
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {height != null ? height : '--'}
                                </Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: colors.surface, minWidth: statsCardWidth }]}>
                                <Ionicons name="barbell-outline" size={24} color={colors.accent} />
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Weight (kg)</Text>
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {weight != null ? weight : '--'}
                                </Text>
                            </View>
                            {bmiValue && (
                                <View style={[styles.statCard, { backgroundColor: colors.surface, minWidth: statsCardWidth }]}>
                                    <Ionicons name="fitness-outline" size={24} color={colors.accent} />
                                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>BMI</Text>
                                    <Text style={[styles.statValue, { color: getBMIColor(bmiNumber) }]}>{bmiValue}</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
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
    headerSection: {
        marginTop: 16,
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
    statsContainer: {
        paddingHorizontal: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statCard: {
        flex: 1,
        borderRadius: RADII.card,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...CARD_SHADOW,
    },
    centeredStatCard: {
        alignItems: 'center',
    },
    statLabel: {
        ...TYPOGRAPHY.small,
        marginTop: 8,
        fontWeight: '600',
        textAlign: 'center',
    },
    statValue: {
        ...TYPOGRAPHY.sectionTitle,
        marginTop: 6,
        textAlign: 'center',
    },
    statSub: {
        ...TYPOGRAPHY.small,
        marginTop: 4,
        textAlign: 'center',
    },
    skillBadge: {
        marginTop: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADII.pill,
        alignSelf: 'flex-start',
    },
    skillBadgeText: {
        ...TYPOGRAPHY.small,
        fontWeight: '700',
        letterSpacing: 0.5,
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

