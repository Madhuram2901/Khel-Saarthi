import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSportImage, formatEventDate } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

const EventCard = ({ event, onPress, style = {} }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const { day, month } = formatEventDate(event.date);

  const priceText =
    event.price === 0 || event.price === '0' || !event.price
      ? 'Free'
      : `₹${event.price}`;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <ImageBackground
        source={{ uri: event.bannerImage || getSportImage(event.category, 'w=400') }}
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>

          {/* Top badges */}
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.month}>{month.toUpperCase()}</Text>
            </View>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          </View>

          {/* Bottom content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>

            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#FFFFFF" />
              <Text style={styles.location} numberOfLines={1}>
                {event.location?.address || 'Location TBD'}
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.participantsContainer}>
                <Ionicons name="people-outline" size={14} color="#FFFFFF" />
                <Text style={styles.participants}>
                  {event.registeredParticipants?.length || 0} registered
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Ionicons name="cash-outline" size={14} color="#FFFFFF" />
                <Text style={styles.priceText}>{priceText}</Text>
              </View>
            </View>
          </View>

        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const withAlpha = (hex, alpha) => {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
};

const makeStyles = (colors, isDark) => StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  imageBackground: {
    width: '100%',
    height: 190,
  },
  backgroundImage: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateContainer: {
    backgroundColor: withAlpha(colors.surface, 0.92),
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    minWidth: 48,
  },
  day: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18,
  },
  month: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 12,
  },
  categoryBadge: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participants: {
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default EventCard;