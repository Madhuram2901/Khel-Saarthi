import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StyledButton from '../components/StyledButton';
import EventCard from '../components/EventCard';
import CategoryFilter from '../components/CategoryFilter';
import AppCard from '../components/AppCard';
import SectionHeader from '../components/SectionHeader';
import NewsCard from '../components/NewsCard';

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [filters, setFilters] = useState({ category: 'All' });
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news');
        setNewsArticles(response.data.articles);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, []);

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
      style={styles.eventCard}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'Athlete'}! 👋</Text>
        <Text style={styles.subGreeting}>Ready to play today?</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}>
        {/* Quick Actions */}
        <View style={[styles.sectionContainer, styles.quickActionsSection]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('CreateEvent')}>
              <View style={styles.quickActionCircle}>
                <Ionicons name="add" size={26} color={colors.accent} />
              </View>
              <Text style={styles.quickActionLabel}>Create Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('TournamentStack', { screen: 'CreateTournament', initial: false })}>
              <View style={styles.quickActionCircle}>
                <Ionicons name="trophy" size={26} color={colors.accent} />
              </View>
              <Text style={styles.quickActionLabel}>Tournament</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('VenueStack', { screen: 'VenueList' })}>
              <View style={styles.quickActionCircle}>
                <Ionicons name="business" size={26} color={colors.accent} />
              </View>
              <Text style={styles.quickActionLabel}>Book Venue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('AiGymTrainer')}>
              <View style={styles.quickActionCircle}>
                <Ionicons name="fitness" size={26} color={colors.accent} />
              </View>
              <Text style={styles.quickActionLabel}>AI Coach</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        {/* Events Near You Map */}
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
        <View style={[styles.sectionContainer, styles.upcomingEventsSection]}>
          <SectionHeader
            title="Upcoming Events"
            onPressViewAll={() => navigation.navigate('EventsStack')}
          />

          {events.length > 0 ? (
            <FlatList
              data={events}
              renderItem={renderEventCard}
              keyExtractor={(item) => item._id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 16,
                paddingRight: 8,
              }}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.noEventsText}>No events found</Text>
              <Text style={styles.noEventsSubtext}>Try adjusting your filters</Text>
            </View>
          )}
        </View>

        {/* Sports News Section */}
        {newsArticles.length > 0 && (
          <View style={[styles.sectionContainer, styles.newsSection]}>
            <Text style={styles.sectionTitle}>Sports News</Text>
            <FlatList
              data={newsArticles}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <NewsCard item={item} />}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        )}

        {/* Action Buttons Section */}
        {user?.role === 'host' && (
          <View style={styles.actionSection}>
            <StyledButton
              title="Create New Event"
              onPress={() => navigation.navigate('CreateEvent')}
              variant="primary"
              icon="add-circle"
              size="large"
            />
          </View>
        )}
      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AiChat')}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 1000,
  },
  header: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  map: {
    height: 200,
    marginHorizontal: 16,
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
    color: colors.textSecondary,
    marginBottom: 4,
  },
  calloutTap: {
    fontSize: 11,
    color: colors.accent,
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
    marginHorizontal: 16,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 24,
  },
  newsSection: {
    marginBottom: 32,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  upcomingEventsSection: {
    marginBottom: 8,
  },
  eventCard: {
    marginRight: 12,
    width: 270,
    borderRadius: 16,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    color: colors.text,
  },
});

export default HomeScreen;
