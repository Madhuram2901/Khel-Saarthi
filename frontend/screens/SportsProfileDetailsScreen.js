import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { SPACING, RADII, TYPOGRAPHY, CARD_SHADOW } from '../theme/designSystem';
import { getSportEmoji, getSkillLevelLabel } from '../utils/sportsHelper';

const SportsProfileDetailsScreen = ({ navigation, route }) => {
  const { profileId } = route.params;
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sports-profiles/${profileId}`);
      setProfile(res.data);
    } catch (err) {
      console.log('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/sports-profiles/${profileId}`);
      Alert.alert("Deleted", "Sports profile removed");
      navigation.goBack();
    } catch (err) {
      console.log('Error deleting profile:', err);
      setError(err.response?.data?.message || 'Failed to delete profile');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.accentRed} />
          <Text style={[styles.errorText, { color: colors.accentRed }]}>{error || 'Profile not found'}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {profile.sportName}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditSportsProfile', { profileId })}>
          <Ionicons name="create-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sport Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sportEmoji}>{getSportEmoji(profile.sportName)}</Text>
            </View>
            <View style={styles.sportInfo}>
              <Text style={[styles.sportName, { color: colors.text }]}>{profile.sportName}</Text>
              <Text style={[styles.skillLevel, { color: colors.accent }]}>{getSkillLevelLabel(profile.skillLevel)}</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Playstyle */}
          <View style={styles.detailItem}>
            <View style={styles.detailLabel}>
              <Ionicons name="flame-outline" size={16} color={colors.accent} />
              <Text style={[styles.detailLabelText, { color: colors.textSecondary }]}>Playstyle</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>{profile.playstyle}</Text>
          </View>

          {/* Experience */}
          <View style={[styles.detailItem, styles.detailItemBorder]}>
            <View style={styles.detailLabel}>
              <Ionicons name="calendar-outline" size={16} color={colors.accent} />
              <Text style={[styles.detailLabelText, { color: colors.textSecondary }]}>Experience</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {profile.experienceMonths} months
            </Text>
          </View>

          {/* Position */}
          {profile.position && (
            <View style={[styles.detailItem, styles.detailItemBorder]}>
              <View style={styles.detailLabel}>
                <Ionicons name="person-outline" size={16} color={colors.accent} />
                <Text style={[styles.detailLabelText, { color: colors.textSecondary }]}>Position</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>{profile.position}</Text>
            </View>
          )}

          {/* Dominant Hand/Foot */}
          {profile.dominantSide && (
            <View style={[styles.detailItem, styles.detailItemBorder]}>
              <View style={styles.detailLabel}>
                <Ionicons name="hand-right-outline" size={16} color={colors.accent} />
                <Text style={[styles.detailLabelText, { color: colors.textSecondary }]}>Dominant Side</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>{profile.dominantSide}</Text>
            </View>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.accentRed + '15' }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={colors.accentRed} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={colors.accentRed} />
              <Text style={[styles.deleteButtonText, { color: colors.accentRed }]}>Delete Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.screenHorizontal,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginHorizontal: 12,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: SPACING.screenHorizontal,
      paddingVertical: SPACING.sectionBottom,
      paddingBottom: 40,
    },
    card: {
      borderRadius: RADII.card,
      padding: 16,
      marginBottom: 16,
      ...CARD_SHADOW,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    sportEmoji: {
      fontSize: 44,
    },
    sportInfo: {
      flex: 1,
    },
    sportName: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
    skillLevel: {
      fontSize: 14,
      fontWeight: '600',
    },
    detailItem: {
      paddingVertical: 12,
    },
    detailItemBorder: {
      borderTopWidth: 1,
      paddingTop: 14,
      paddingBottom: 12,
    },
    detailLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    detailLabelText: {
      fontSize: 13,
      fontWeight: '500',
    },
    detailValue: {
      fontSize: 15,
      fontWeight: '600',
      marginLeft: 24,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: RADII.button,
      marginTop: 8,
    },
    deleteButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    errorText: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: RADII.button,
      marginTop: 8,
    },
    retryButtonText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default SportsProfileDetailsScreen;
