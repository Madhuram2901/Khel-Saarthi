import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import EventCard from '../components/EventCard';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const sports = ['All', 'Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball'];

const EventsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
      fetchMyEvents();
    }, [user?._id, user?.role])
  );

  useEffect(() => {
    filterEvents();
  }, [selectedSport, searchQuery, events, myEvents, viewMode, user?.role]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      const sortedEvents = res.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
    } catch (error) {
      console.log('Error fetching events', error);
    }
  };

  const fetchMyEvents = async () => {
    try {
      if (user?.role === 'host') {
        const res = await api.get('/events');
        const mine = res.data.filter(
          e => e.createdBy?._id === user._id ||
               e.createdBy === user._id ||
               e.host?._id === user._id ||
               e.host === user._id
        );
        setMyEvents(mine.sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        ));
      } else {
        const res = await api.get('/users/profile');
        const joinedIds = res.data.joinedEvents ?? [];
        const eventsRes = await api.get('/events');
        const mine = eventsRes.data.filter(
          e => joinedIds.includes(e._id)
        );
        setMyEvents(mine.sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        ));
      }
    } catch (error) {
      console.log('Error fetching my events', error);
    }
  };

  const filterEvents = () => {
    const sourceEvents =
      user?.role === 'host' && viewMode === 'my'
        ? myEvents
        : events;

    let filtered = [...sourceEvents];

    if (selectedSport !== 'All') {
      filtered = filtered.filter(e => e.category === selectedSport);
    }

    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredEvents(filtered);
  };

  const renderEvent = ({ item }) => (
    <EventCard
      event={item}
      onPress={() =>
        navigation.navigate('EventsStack', {
          screen: 'EventDetails',
          params: { eventId: item._id }
        })
      }
      style={{ width: '48%', marginBottom: 14 }}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Container */}
      <View style={styles.headerContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Events</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Ionicons name="add" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              viewMode === 'all' && styles.tabItemActive,
            ]}
            onPress={() => setViewMode('all')}
          >
            <Text style={[
              styles.tabText,
              viewMode === 'all' && styles.tabTextActive,
            ]}>
              All Events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              viewMode === 'my' && styles.tabItemActive,
            ]}
            onPress={() => setViewMode('my')}
          >
            <Text style={[
              styles.tabText,
              viewMode === 'my' && styles.tabTextActive,
            ]}>
              {user?.role === 'host' ? 'My Events' : 'Joined'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            placeholder="Search events..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <FlatList
          data={sports}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSport === item && styles.filterChipActive
              ]}
              onPress={() => setSelectedSport(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedSport === item && styles.filterTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={user?.role === 'host'
          ? filteredEvents
          : viewMode === 'all'
            ? filteredEvents
            : myEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={user?.role === 'host'
                ? 'calendar-outline'
                : 'footsteps-outline'}
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              {viewMode === 'my'
                ? user?.role === 'host'
                  ? 'No events created yet'
                  : 'No events joined yet'
                : 'No events found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {viewMode === 'my' && user?.role === 'host'
                ? 'Tap + to create your first event'
                : ''}
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120
        }}
      />
    </SafeAreaView>
  );
};

export default EventsScreen;

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center'
  },

  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface2,
  },
  tabItemActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

  filterChip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },

  filterChipActive: {
    backgroundColor: colors.accent,
  },

  filterText: {
    fontSize: 13,
    color: colors.text,
  },

  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
