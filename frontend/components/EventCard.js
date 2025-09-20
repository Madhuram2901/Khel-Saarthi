import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSportImage, formatEventDate } from '../utils/constants';

const EventCard = ({ event, onPress, style = {} }) => {
  const { day, month } = formatEventDate(event.date);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <ImageBackground
        source={{ uri: getSportImage(event.category, 'w=400') }}
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.month}>{month.toUpperCase()}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
            
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#FFFFFF" />
              <Text style={styles.location}>
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
              
              <View style={styles.hostContainer}>
                <Text style={styles.hostLabel}>By</Text>
                <Text style={styles.hostName}>{event.host?.name}</Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imageBackground: {
    width: 280,
    height: 200,
  },
  backgroundImage: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  day: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 20,
  },
  month: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    lineHeight: 14,
  },
  categoryBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 13,
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
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginRight: 4,
  },
  hostName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default EventCard;