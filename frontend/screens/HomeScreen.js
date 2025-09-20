import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Text, 
  ScrollView, 
  FlatList, 
  TouchableOpacity,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import StyledButton from '../components/StyledButton';
import EventCard from '../components/EventCard';
import HeroCard from '../components/HeroCard';
import CategoryFilter from '../components/CategoryFilter';

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ category: 'All' });
  const { user, logout } = useContext(AuthContext);

  const categories = ['All', 'Cricket', 'Football', 'Badminton', 'Running', 'Basketball', 'Tennis', 'Kabaddi', 'Other'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'All') {
          params.append('category', filters.category);
        }

        const { data } = await api.get(`/events?${params.toString()}`);
        setEvents(data);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not fetch events.');
      }
    };

    fetchEvents();
  }, [filters]);

  const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  const renderEventCard = ({ item }) => (
    <EventCard 
      event={item}
      onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
    />
  );

  const HeaderSection = () => (
    <View style={styles.headerSection}>
      <View style={styles.headerTop}>
        <View style={styles.userInfo}>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => navigation.navigate('ProfileStack')}
          >
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Hello {user?.name || 'User'}</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {/* TODO: Add search functionality */}}
        >
          <Ionicons name="search" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <HeroCard 
        title="Discover Sports Events Near You"
        subtitle="Join local sports communities"
        onPress={() => {/* TODO: Navigate to search/discover */}}
        icon="trophy"
      />
    </View>
  );

  const AIRecommendationSection = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity style={styles.aiRecommendation}>
        <View style={styles.aiRecommendationContent}>
          <Ionicons name="sparkles" size={20} color="#FF6B35" />
          <Text style={styles.aiRecommendationText}>AI Recommendation</Text>
          <Text style={styles.aiRecommendationSubtext}>View All {'>'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HeaderSection />
        
        <AIRecommendationSection />

        {/* Category Filter Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Filter by Sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CategoryFilter 
              categories={categories}
              selectedCategory={filters.category}
              onSelectCategory={(category) => setFilters({ ...filters, category })}
            />
          </ScrollView>
        </View>

        {/* Events Near You Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Events Near You</Text>
          <MapView
            style={styles.map}
            initialRegion={{ 
              latitude: 23.2599, 
              longitude: 77.4126, 
              latitudeDelta: 0.1, 
              longitudeDelta: 0.1 
            }}
          >
            {events.map((event) => {
              const isUserRegistered = event.registeredParticipants.includes(user?._id);
              return (
                <Marker
                  key={event._id}
                  coordinate={{ 
                    latitude: event.location.coordinates[1], 
                    longitude: event.location.coordinates[0] 
                  }}
                  title={event.title}
                  pinColor={isUserRegistered ? 'green' : 'red'}
                >
                  <Callout onPress={() => navigation.navigate('EventDetails', { eventId: event._id })}>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{event.title}</Text>
                      <Text style={styles.calloutCategory}>{event.category}</Text>
                      <Text style={styles.calloutTap}>Tap for details</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => {/* TODO: Navigate to all events */}}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {events.length > 0 ? (
            <FlatList
              data={events}
              renderItem={renderEventCard}
              keyExtractor={(item) => item._id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.eventsList}
              contentContainerStyle={styles.eventsListContent}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#8E8E93" />
              <Text style={styles.noEventsText}>No events found</Text>
              <Text style={styles.noEventsSubtext}>Try adjusting your filters</Text>
            </View>
          )}
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionSection}>
          {user?.role === 'host' && (
            <StyledButton 
              title="Create New Event" 
              onPress={() => navigation.navigate('CreateEvent')}
              variant="primary"
              icon="add-circle"
              size="large"
            />
          )}
          <StyledButton 
            title="Sign Out" 
            onPress={logout} 
            variant="outline"
            icon="log-out"
            size="medium"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#1D1D1F',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  aiRecommendation: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiRecommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiRecommendationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
    flex: 1,
  },
  aiRecommendationSubtext: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  map: { 
    height: 200,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calloutContainer: {
    padding: 8,
    minWidth: 120,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  calloutCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutTap: {
    fontSize: 11,
    color: '#007AFF',
  },
  eventsList: {
    paddingLeft: 12,
  },
  eventsListContent: {
    paddingRight: 20,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionSection: { 
    padding: 20,
    paddingBottom: 40,
  },
});

export default HomeScreen;