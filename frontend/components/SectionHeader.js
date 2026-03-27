import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SectionHeader = ({ title, onPressViewAll }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <TouchableOpacity
        onPress={onPressViewAll}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Text style={[styles.viewAllText, { color: colors.accent }]}>View All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SectionHeader;

