import React, { useEffect, useState } from 'react';
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
import EventDetailsScreen from './EventDetailsScreen';
import api from '../api/api';

const sports = ['All', 'Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball'];

const EventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
      setEvents(res.data);
      setFilteredEvents(res.data);
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
      style={{ width: '48%', marginBottom: 12 }}
    />
  );

  const renderHeader = () => (
    <View style={{  paddingBottom: 12 }}>
      <Text style={styles.header}>Events</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput
          placeholder="Search events..."
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
        contentContainerStyle={{ paddingBottom: 16 }} 
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
    <SafeAreaView style={styles.container}>
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
          paddingBottom: 120
        }}
      />
    </SafeAreaView>
  );
};

export default EventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    height: 32,
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 13,
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
});