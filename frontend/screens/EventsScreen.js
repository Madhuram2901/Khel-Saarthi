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

  const canCreateEvent =
    user?.role === 'host' || user?.role === 'admin';

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
      fetchMyEvents();
    }, [user?._id, user?.role])
  );

  useEffect(() => {
    filterEvents();
  }, [selectedSport, searchQuery, events, myEvents, viewMode]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      const sortedEvents = res.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.log('Error fetching events', error);
    }
  };

  const fetchMyEvents = async () => {
  try {
    if (user?.role === 'host') {
      const res = await api.get('/events');
      const mine = res.data.filter(
        e =>
          e.host?._id === user._id ||
          e.host === user._id
      );

      setMyEvents(
        mine.sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    } else {
      // For participants → get registered events from backend
      const res = await api.get('/users/myevents');

      setMyEvents(
        res.data.sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    }
  } catch (error) {
    console.log('Error fetching my events', error);
  }
};

  const filterEvents = () => {
    let sourceEvents;

    if (viewMode === 'my') {
      sourceEvents = myEvents;
    } else {
      sourceEvents = events;
    }

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
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Events</Text>

          {canCreateEvent && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Ionicons name="add" size={26} color="#FFF" />
            </TouchableOpacity>
          )}
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
              {user?.role === 'host' ? 'My Events' : 'Registered'}
            </Text>
          </TouchableOpacity>
        </View>

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
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
              {viewMode === 'my'
                ? user?.role === 'host'
                  ? 'No events created yet'
                  : 'No events registered yet'
                : 'No events found'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default EventsScreen;

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1 },

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
});