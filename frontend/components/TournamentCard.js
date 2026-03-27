import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CARD_SHADOW, RADII, SPACING, TYPOGRAPHY } from '../theme/designSystem';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatFormat = (format) => {
  if (!format) return '—';
  return String(format).replace(/_/g, ' ');
};

const getStatusColors = (status, colors) => {
  switch (status) {
    case 'DRAFT':
      return { bg: colors.surface2, text: colors.textSecondary };
    case 'PUBLISHED':
      return { bg: 'rgba(10,132,255,0.14)', text: colors.accent }; // blue
    case 'ONGOING':
      return { bg: 'rgba(52,199,89,0.16)', text: colors.accentGreen }; // green
    case 'FINISHED':
      return { bg: 'rgba(99,99,102,0.22)', text: colors.textSecondary }; // dark gray-ish
    default:
      return { bg: colors.surface2, text: colors.textSecondary };
  }
};

const TournamentCard = ({ tournament, onPress, style }) => {
  const { colors } = useTheme();

  const status = String(tournament?.status || 'DRAFT').toUpperCase();
  const statusColors = useMemo(() => getStatusColors(status, colors), [status, colors]);

  const teamsCount =
    tournament?.teamsCount ??
    tournament?.teams?.length ??
    tournament?.participants?.length ??
    0;

  const matchesCount = tournament?.matchesCount ?? tournament?.matches?.length ?? 0;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.card, { backgroundColor: colors.surface }, style]}>
      <View style={styles.topRow}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {tournament?.name || 'Tournament'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]} numberOfLines={1}>
            {status}
          </Text>
        </View>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
        {tournament?.sport || 'Sport'} • {formatFormat(tournament?.format)}
      </Text>

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.dateText, { color: colors.textSecondary }]} numberOfLines={1}>
          {formatDate(tournament?.startDate)} – {formatDate(tournament?.endDate)}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.metricText, { color: colors.textSecondary }]}>{teamsCount} Teams</Text>
        </View>
        <View style={styles.metric}>
          <Ionicons name="git-branch-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.metricText, { color: colors.textSecondary }]}>{matchesCount} Matches</Text>
        </View>
        <View style={styles.metric}>
          <Ionicons name="pulse-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.metricText, { color: colors.textSecondary }]}>{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.card,
    padding: 16,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.cardGap,
  },
  name: {
    ...TYPOGRAPHY.sectionTitle,
    fontSize: 18,
    flex: 1,
  },
  statusBadge: {
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 130,
  },
  statusText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    marginTop: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: {
    ...TYPOGRAPHY.body,
    marginLeft: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    ...TYPOGRAPHY.small,
    marginLeft: 6,
    fontWeight: '600',
  },
});

export default TournamentCard;

