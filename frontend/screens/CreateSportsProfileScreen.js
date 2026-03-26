import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { SPACING, RADII, SIZES, TYPOGRAPHY, CARD_SHADOW } from '../theme/designSystem';
import { getSportEmoji, getSkillLevelLabel } from '../utils/sportsHelper';

const CreateSportsProfileScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [sportName, setSportName] = useState('');
  const [skillLevel, setSkillLevel] = useState(50);
  const [playstyle, setPlaystyle] = useState('');
  const [experienceMonths, setExperienceMonths] = useState('');
  const [position, setPosition] = useState('');
  const [dominantSide, setDominantSide] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!sportName.trim()) {
      setError('Sport name is required');
      return;
    }
    if (!playstyle.trim()) {
      setError('Playstyle is required');
      return;
    }
    if (!experienceMonths.trim()) {
      setError('Experience is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/sports-profiles', {
        sportName: sportName.trim(),
        skillLevel,
        playstyle: playstyle.trim(),
        experienceMonths: parseInt(experienceMonths),
        position: position.trim() || undefined,
        dominantSide: dominantSide.trim() || undefined,
      });

      Alert.alert("Success", "Sports profile created successfully");
      navigation.goBack();
    } catch (err) {
      console.log('Error creating sports profile:', err);
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Sports Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Message */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.accentRed + '15' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.accentRed} />
              <Text style={[styles.errorText, { color: colors.accentRed }]}>{error}</Text>
            </View>
          )}

          {/* Sport Name */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Sport Name *</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Cricket, Football, Badminton"
                placeholderTextColor={colors.textSecondary}
                value={sportName}
                onChangeText={setSportName}
              />
              {sportName && (
                <Text style={styles.emoji}>{getSportEmoji(sportName)}</Text>
              )}
            </View>
          </View>

          {/* Skill Level */}
          <View style={styles.section}>
            <View style={styles.skillLevelHeader}>
              <Text style={[styles.label, { color: colors.text }]}>Skill Level *</Text>
              <View style={styles.skillLevelBadge}>
                <Text style={[styles.skillLevelValue, { color: colors.accent }]}>
                  {Math.round(skillLevel)}
                </Text>
                <Text style={[styles.skillLevelLabel, { color: colors.accent }]}>
                  {getSkillLevelLabel(skillLevel)}
                </Text>
              </View>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={skillLevel}
                onValueChange={setSkillLevel}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.accent}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>0 Beginner</Text>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>50 Intermediate</Text>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>100 Advanced</Text>
            </View>
          </View>

          {/* Playstyle */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Playstyle *</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Aggressive, Defensive, All-rounder"
                placeholderTextColor={colors.textSecondary}
                value={playstyle}
                onChangeText={setPlaystyle}
              />
            </View>
          </View>

          {/* Experience */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Months of Experience *</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., 24"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={experienceMonths}
                onChangeText={setExperienceMonths}
              />
            </View>
          </View>

          {/* Position (Optional) */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Preferred Position (Optional)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Batsman, Forward, Singles"
                placeholderTextColor={colors.textSecondary}
                value={position}
                onChangeText={setPosition}
              />
            </View>
          </View>

          {/* Dominant Hand/Foot (Optional) */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Dominant Hand / Foot (Optional)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Right-handed, Left-footed"
                placeholderTextColor={colors.textSecondary}
                value={dominantSide}
                onChangeText={setDominantSide}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.accent }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Create Profile</Text>
          )}
        </TouchableOpacity>
      </View>
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
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: SPACING.screenHorizontal,
      paddingVertical: SPACING.sectionBottom,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADII.button,
      borderWidth: 1,
      paddingHorizontal: 14,
      height: SIZES.inputHeight,
    },
    input: {
      flex: 1,
      fontSize: 14,
    },
    emoji: {
      fontSize: 20,
      marginLeft: 8,
    },
    skillLevelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    skillLevelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    skillLevelValue: {
      fontSize: 20,
      fontWeight: '700',
    },
    skillLevelLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    sliderContainer: {
      paddingHorizontal: 8,
      marginBottom: 8,
    },
    slider: {
      height: 40,
    },
    sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
    },
    sliderLabel: {
      fontSize: 12,
      fontWeight: '500',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: RADII.button,
      marginBottom: 16,
      gap: 8,
    },
    errorText: {
      fontSize: 13,
      fontWeight: '500',
      flex: 1,
    },
    footer: {
      paddingHorizontal: SPACING.screenHorizontal,
      paddingVertical: 16,
      borderTopWidth: 1,
      paddingBottom: 24,
    },
    saveButton: {
      height: SIZES.inputHeight,
      borderRadius: RADII.button,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default CreateSportsProfileScreen;
