import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({ icon, title, value, color = '#007AFF', image, imageColor }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, imageColor && { backgroundColor: imageColor }]}>
      {image ? (
        <Image source={image} style={styles.imageContainer} resizeMode="cover" />
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      )}
      <View style={styles.content}>
        {!image && <Text style={styles.value}>{value}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const StatRow = ({ children }) => (
  <View style={staticStyles.row}>
    {children}
  </View>
);

const staticStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 8,
  },
});

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  content: {
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export { StatCard, StatRow };