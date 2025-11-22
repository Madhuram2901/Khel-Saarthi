# ProfileScreen Pull-to-Refresh Implementation Guide

## Overview
This guide shows how to add pull-to-refresh functionality to the ProfileScreen to reload data from MongoDB without restarting the app.

## Step 1: Update Imports

### Line 2 - Add useEffect to React imports:
```javascript
import React, { useContext, useState, useEffect } from 'react';
```

### Lines 3-14 - Add RefreshControl to React Native imports:
```javascript
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Image, 
  Alert, 
  Linking,
  StatusBar,
  TouchableOpacity,
  RefreshControl  // ADD THIS LINE
} from 'react-native';
```

## Step 2: Add State Variables

### After line 31 (after `const [editMode, setEditMode] = useState(false);`):
```javascript
const [eventsJoined, setEventsJoined] = useState(0);
const [refreshing, setRefreshing] = useState(false);
```

## Step 3: Add Data Fetching Functions

### After the state declarations (around line 33):
```javascript
// Fetch events joined count
const fetchEventsJoined = async () => {
    try {
        const { data } = await api.get('/users/myevents');
        setEventsJoined(data.length);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
};

// Fetch fresh user profile data
const fetchUserProfile = async () => {
    try {
        const { data } = await api.get('/users/profile');
        setUser(data);
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
};

// Handle pull-to-refresh
const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEventsJoined(), fetchUserProfile()]);
    setRefreshing(false);
};

// Load data on component mount
useEffect(() => {
    fetchEventsJoined();
}, []);
```

## Step 4: Update ScrollView (around line 197)

### Find this line:
```javascript
<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
```

### Replace with:
```javascript
<ScrollView 
    style={styles.scrollView} 
    showsVerticalScrollIndicator={false}
    refreshControl={
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
        />
    }
>
```

## Step 5: Update Events Joined Value (around line 211)

### Find this line:
```javascript
value="12"
```

### Replace with:
```javascript
value={eventsJoined.toString()}
```

## Complete Code Snippet for Reference

Here's what the beginning of ProfileScreen should look like after all changes:

```javascript
import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Image, 
  Alert, 
  Linking,
  StatusBar,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import StyledButton from '../components/StyledButton';
import ProfileCard from '../components/ProfileCard';
import { StatCard, StatRow } from '../components/StatCard';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, setUser } = useContext(AuthContext);
    const badmintonProfile = user.profiles?.badminton || {};
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [eventsJoined, setEventsJoined] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch events joined count
    const fetchEventsJoined = async () => {
        try {
            const { data } = await api.get('/users/myevents');
            setEventsJoined(data.length);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Fetch fresh user profile data
    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setUser(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchEventsJoined(), fetchUserProfile()]);
        setRefreshing(false);
    };

    // Load data on component mount
    useEffect(() => {
        fetchEventsJoined();
    }, []);

    // ... rest of the component code
}
```

## Testing

After making these changes:
1. Save the file
2. The app should reload automatically
3. Navigate to the Profile screen
4. Pull down from the top of the screen
5. You should see a loading spinner
6. The data will refresh from MongoDB

## Benefits

- ✅ Users can refresh their profile data without restarting the app
- ✅ Events Joined count updates from MongoDB
- ✅ User profile information refreshes
- ✅ Smooth, native pull-to-refresh experience
- ✅ Loading indicator shows refresh status
