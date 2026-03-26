import React, { useEffect, useMemo, useState } from 'react';
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
import EventCard from '../components/EventCard';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const sports = ['All', 'Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball'];

const EventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedSport, searchQuery, events]);

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

  const filterEvents = () => {
    let filtered = [...events];

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

  const renderHeader = () => (
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
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
          paddingTop: 10
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },

  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
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