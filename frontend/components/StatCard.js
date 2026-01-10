import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatCard = ({ icon, title, value, color = '#007AFF', image, imageColor }) => {
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
  <View style={styles.row}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
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
    color: '#1D1D1F',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export { StatCard, StatRow };