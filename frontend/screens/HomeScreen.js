import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StyledButton from '../components/StyledButton';
import EventCard from '../components/EventCard';
import HeroCard from '../components/HeroCard';
import CategoryFilter from '../components/CategoryFilter';
import AppCard from '../components/AppCard';

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
        setNewsArticles(response.data.articles.slice(0, 3));
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
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation.navigate('AiChat')}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {/* TODO: Add search functionality */ }}
          >
            <Ionicons name="search" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <HeroCard
        title="Discover Sports Events Near You"
        subtitle="Join local sports communities"
        onPress={() => {/* TODO: Navigate to search/discover */ }}
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'Athlete'}! 👋</Text>
        <Text style={styles.subGreeting}>Ready to play today?</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}>
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('CreateEvent')}>
              <View style={styles.quickActionCircle}>
                <Ionicons name="add" size={26} color={colors.accent} />
              </View>
              <Text style={styles.quickActionLabel}>Create Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('TournamentStack', { screen: 'CreateTournament' })}>
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

        {/* Hero Section */}
        <HeroCard
          title="Discover Sports Events Near You"
          subtitle="Join local sports communities"
          onPress={() => {/* TODO: Navigate to search/discover */ }}
          icon="trophy"
        />

        {/* AI Recommendation Section */}
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
            <TouchableOpacity onPress={() => {/* TODO: Navigate to all events */ }}>
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
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.noEventsText}>No events found</Text>
              <Text style={styles.noEventsSubtext}>Try adjusting your filters</Text>
            </View>
          )}
        </View>

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

        {/* Sports News Section */}
        {newsArticles.length > 0 && (
          <View style={styles.newsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sports News</Text>
              <TouchableOpacity onPress={() => navigation.navigate('News')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {newsArticles.map((article, index) => (
              <TouchableOpacity
                key={`${article.url}-${index}`}
                onPress={() => Linking.openURL(article.url)}
                activeOpacity={0.7}
              >
                <AppCard style={styles.newsCard}>
                  <Image
                    source={{ uri: article.urlToImage || 'https://via.placeholder.com/60' }}
                    style={styles.newsImage}
                  />
                  <View style={styles.newsCardText}>
                    <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                    <Text style={styles.newsSource}>{article.source?.name || 'Sports'}</Text>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.viewAllNewsButton}
              onPress={() => navigation.navigate('News')}
            >
              <Text style={styles.viewAllNewsText}>View All News</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </TouchableOpacity>
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
    paddingHorizontal: 20,
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
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  aiRecommendation: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.cardShadow,
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
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  aiRecommendationSubtext: {
    fontSize: 14,
    color: colors.accent,
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
    marginHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 24,
  },
  newsSection: {
    marginBottom: 32,
  },
  newsCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  newsImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  newsCardText: {
    flex: 1,
    marginLeft: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  newsSource: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewAllNewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  viewAllNewsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginRight: 4,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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