import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useLinkBuilder } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// ─── icon + label map ────────────────────────────────────────────────────────
const ROUTE_META = {
  HomeStack: { active: 'home', inactive: 'home-outline', label: 'Home' },
  TournamentStack: { active: 'trophy', inactive: 'trophy-outline', label: 'Tournaments' },
  EventsStack: { active: 'calendar', inactive: 'calendar-outline', label: 'Events' },
  VenueStack: { active: 'location', inactive: 'location-outline', label: 'Venues' },
  ProfileStack: { active: 'person', inactive: 'person-outline', label: 'Profile' },
};

// ─── main component ──────────────────────────────────────────────────────────
function FloatingTabBar({ state, descriptors, navigation }) {
  const { buildHref } = useLinkBuilder();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  // One animated opacity value per tab (for the pill underline)
  const pillOpacities = useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0))
  ).current;

  // FAB press scale
  const fabScale = useRef(new Animated.Value(1)).current;

  // Animate pill opacities whenever active index changes
  useEffect(() => {
    state.routes.forEach((_, i) => {
      Animated.spring(pillOpacities[i], {
        toValue: i === state.index ? 1 : 0,
        useNativeDriver: true,
        damping: 14,
        mass: 0.6,
        stiffness: 160,
      }).start();
    });
  }, [state.index]);

  // Hide the bar on deep screens
  const { tabBarStyle } = descriptors[state.routes[state.index].key].options;
  if (tabBarStyle?.display === 'none') return null;

  // FAB press handlers
  const handleFabPressIn = () =>
    Animated.spring(fabScale, { toValue: 0.92, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const handleFabPressOut = () =>
    Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();

  // ── shared tab row ────────────────────────────────────────────────────────
  const tabRow = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const meta = ROUTE_META[route.name] ?? {};
    const iconName = isFocused ? (meta.active ?? 'ellipse') : (meta.inactive ?? 'ellipse-outline');
    const displayLabel = meta.label ?? (options.title ?? route.name);

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
    };
    const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

    return (
      <PlatformPressable
        key={route.key}
        href={buildHref(route.name, route.params)}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabButton}
      >
        <View style={styles.tabInner}>
          <Ionicons
            name={iconName}
            size={24}
            color={isFocused ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: isFocused ? colors.accent : colors.textMuted },
            ]}
            numberOfLines={1}
          >
            {displayLabel}
          </Text>
          {/* Animated pill underline */}
          <Animated.View style={[styles.pill, { opacity: pillOpacities[index] }]} />
        </View>
      </PlatformPressable>
    );
  });

  // ── glass bar shell (platform-split for blur support) ────────────────────
  const barContent = (
    <View style={styles.tabBar}>
      {tabRow}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Glass bar */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.glassBar}>
          <View style={styles.glassOverlay} />
          {barContent}
        </BlurView>
      ) : (
        <View style={[styles.glassBar, styles.androidBar]}>
          {barContent}
        </View>
      )}
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const makeStyles = (colors, isDark) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },

  glassBar: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.tabBarBorder,
    backgroundColor: isDark
      ? 'rgba(18, 18, 18, 0.85)'
      : 'rgba(255, 255, 255, 0.72)',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: isDark ? 'transparent' : 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    zIndex: 1,
  },
  androidBar: {
    backgroundColor: isDark
      ? 'rgba(18, 18, 18, 0.85)'
      : 'rgba(255, 255, 255, 0.72)',
    borderColor: colors.tabBarBorder,
  },

  tabBar: {
    flexDirection: 'row',
    height: 64,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 4,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  pill: {
    marginTop: 3,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});

export default FloatingTabBar;
