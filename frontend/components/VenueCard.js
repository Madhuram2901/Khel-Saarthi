import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { CARD_SHADOW, RADII, SPACING, TYPOGRAPHY } from '../theme/designSystem';

const formatPrice = (value) => {
  if (value === 0 || value === '0' || value === null || value === undefined || value === '') return 'Free';
  const num = Number(value);
  if (Number.isFinite(num)) return `₹${num}`;
  return `₹${value}`;
};

const VenueCard = ({ venue, onPress, style }) => {
  const { colors } = useTheme();

  const imageUri =
    venue?.images?.[0] || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a';

  const locationText = useMemo(() => {
    if (venue?.city) return `${venue.city}${venue?.state ? `, ${venue.state}` : ''}`;
    return venue?.location?.address || venue?.location || 'Location TBD';
  }, [venue?.city, venue?.state, venue?.location]);

  const sportTypes = useMemo(() => {
    const sports = venue?.sportTypes;
    if (!Array.isArray(sports)) return [];
    return sports.map((s) => String(s)).filter(Boolean);
  }, [venue?.sportTypes]);

  const ratingValue = Number(venue?.rating);
  const ratingText = Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : '—';

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.container, style]}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.70)']}
          style={styles.overlay}
        >
          <View style={styles.topRow}>
            <View />
            {sportTypes[0] ? (
              <View style={[styles.sportBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.sportBadgeText} numberOfLines={1}>
                  {sportTypes[0]}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.bottomContent}>
            <Text style={styles.title} numberOfLines={2}>
              {venue?.name || 'Venue'}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#FFFFFF" />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationText}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.priceBadge}>
                <Ionicons name="cash-outline" size={14} color="#FFFFFF" />
                <Text style={styles.priceText}>
                  {formatPrice(venue?.pricePerHour)}/hr
                </Text>
              </View>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{ratingText}</Text>
              </View>
            </View>

            {sportTypes.length > 0 ? (
              <View style={styles.tagsRow}>
                {sportTypes.slice(0, 4).map((sport) => (
                  <View key={sport} style={styles.tagPill}>
                    <Text style={styles.tagText} numberOfLines={1}>
                      {sport}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: RADII.card,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  imageBackground: {
    width: '100%',
    height: 190,
  },
  backgroundImage: {
    borderRadius: RADII.card,
  },
  overlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sportBadge: {
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 160,
  },
  sportBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomContent: {
    justifyContent: 'flex-end',
  },
  title: {
    ...TYPOGRAPHY.cardTitle,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    ...TYPOGRAPHY.small,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    ...TYPOGRAPHY.small,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TYPOGRAPHY.small,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '700',
    opacity: 0.95,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.cardGap,
  },
  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: 160,
  },
  tagText: {
    ...TYPOGRAPHY.small,
    color: '#FFFFFF',
    fontWeight: '700',
    opacity: 0.95,
  },
});

export default VenueCard;

