import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import FloatingTabBar from '../components/FloatingTabBar';

// Import all Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EditEventScreen from '../screens/EditEventScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BadmintonProfileScreen from '../screens/BadmintonProfileScreen';
import AiChatScreen from '../screens/AiChatScreen';
import NewsScreen from '../screens/NewsScreen';
import VenueListScreen from '../screens/VenueListScreen';
import VenueDetailsScreen from '../screens/VenueDetailsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import AddVenueScreen from '../screens/AddVenueScreen';
import EditVenueScreen from '../screens/EditVenueScreen';
// Tournament Screens
import TournamentListScreen from '../screens/TournamentListScreen';
import CreateTournamentScreen from '../screens/CreateTournamentScreen';
import TournamentDashboardScreen from '../screens/TournamentDashboardScreen';
import ManageTeamsScreen from '../screens/ManageTeamsScreen';
import GenerateFixturesScreen from '../screens/GenerateFixturesScreen';
import MatchDetailsScreen from '../screens/MatchDetailsScreen';

import AiGymTrainerScreen from '../screens/AiGymTrainerScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const VenueStack = createStackNavigator();
const TournamentStack = createStackNavigator();

function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event', headerBackTitle: 'Back' }} />
            <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event', headerBackTitle: 'Back' }} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
            <Stack.Screen name="Participants" component={ParticipantsScreen} options={{ title: 'Participants', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.eventTitle || 'Chat', headerBackTitle: 'Back' })} />
            <Stack.Screen name="BadmintonProfile" component={BadmintonProfileScreen} options={{ title: 'Badminton Profile' }} />
            <Stack.Screen name="AiChat" component={AiChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AiGymTrainer" component={AiGymTrainerScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
            <Stack.Screen name="BadmintonProfile" component={BadmintonProfileScreen} options={{ title: 'Badminton Profile', headerBackTitle: 'Profile' }} />
        </Stack.Navigator>
    );
}

function NewsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen name="News" component={NewsScreen} options={{ title: 'Sports News' }} />
        </Stack.Navigator>
    );
}

function VenueStackScreen() {
    return (
        <VenueStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <VenueStack.Screen name="VenueList" component={VenueListScreen} options={{ title: 'Book Venues', headerShown: false }} />
            <VenueStack.Screen name="VenueDetails" component={VenueDetailsScreen} options={{ title: 'Venue Details' }} />
            <VenueStack.Screen name="AddVenue" component={AddVenueScreen} options={{ title: 'List New Venue' }} />
            <VenueStack.Screen name="EditVenue" component={EditVenueScreen} options={{ title: 'Edit Venue' }} />
            <VenueStack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
        </VenueStack.Navigator>
    );
}

function TournamentStackScreen() {
    return (
        <TournamentStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <TournamentStack.Screen name="TournamentList" component={TournamentListScreen} options={{ headerShown: false }} />
            <TournamentStack.Screen name="CreateTournament" component={CreateTournamentScreen} options={{ title: 'Create Tournament' }} />
            <TournamentStack.Screen name="TournamentDashboard" component={TournamentDashboardScreen} options={{ title: 'Tournament' }} />
            <TournamentStack.Screen name="ManageTeams" component={ManageTeamsScreen} options={{ title: 'Manage Teams' }} />
            <TournamentStack.Screen name="GenerateFixtures" component={GenerateFixturesScreen} options={{ title: 'Generate Fixtures' }} />
            <TournamentStack.Screen name="MatchDetails" component={MatchDetailsScreen} options={{ title: 'Match Details' }} />
        </TournamentStack.Navigator>
    );
}

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
        let socket;
        if (user) {
            const hostUri = Constants.expoConfig.hostUri;
            const ipAddress = hostUri.split(':')[0];
            const SERVER_URL = `http://${ipAddress}:5001`;
            socket = io(SERVER_URL);

            const subscribeToNotifications = async () => {
                try {
                    const { data: eventIds } = await api.get('/users/myevents');
                    socket.emit('subscribeToNotifications', eventIds);
                } catch (error) {
                    console.error("Could not subscribe to notifications", error);
                }
            };
            subscribeToNotifications();

            socket.on('notification', ({ title, message }) => {
                Toast.show({
                    type: 'info',
                    text1: title,
                    text2: message,
                    onPress: () => { /* Optional: navigate to chat on tap */ }
                });
            });

            return () => socket.disconnect();
        }
    }, [user]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const getTabBarVisibility = (route) => {
      const routeName = getFocusedRouteNameFromRoute(route);

      // Screens where bottom tab bar should be hidden
      // (deep flows like forms, chats, AI, tournaments, etc.)
      const hiddenScreens = [
        // Event flow
        'CreateEvent',
        'EditEvent',
        'EventDetails',
        'Participants',
        'Chat',

        // Profiles & AI
        'BadmintonProfile',
        'AiChat',
        'AiGymTrainer',

        // Venue flow
        'VenueDetails',
        'AddVenue',
        'EditVenue',
        'MyBookings',

        // Tournament flow
        'CreateTournament',
        'TournamentDashboard',
        'ManageTeams',
        'GenerateFixtures',
        'MatchDetails',
      ];

      return hiddenScreens.includes(routeName) ? 'none' : 'flex';
  };



    return (
        <NavigationContainer>
            {user ? (
                <Tab.Navigator
  // Custom floating tab bar (design system)
  tabBar={(props) => <FloatingTabBar {...props} />}

  // Shared screen options for all tabs
  screenOptions={({ route }) => ({
    headerShown: false,

    // Tab icons for bottom navigation
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      if (route.name === 'HomeStack') iconName = focused ? 'home' : 'home-outline';
      else if (route.name === 'TournamentStack') iconName = focused ? 'trophy' : 'trophy-outline';
      else if (route.name === 'VenueStack') iconName = focused ? 'calendar' : 'calendar-outline';
      else if (route.name === 'NewsStack') iconName = focused ? 'newspaper' : 'newspaper-outline';
      else if (route.name === 'ProfileStack') iconName = focused ? 'person' : 'person-outline';

      return <Ionicons name={iconName} size={size} color={color} />;
    },
  })}
>
  {/* Home / Events */}
  <Tab.Screen
    name="HomeStack"
    component={HomeStack}
    options={({ route }) => ({
      title: 'Home',
      tabBarStyle: { display: getTabBarVisibility(route) },
    })}
  />

  {/* Tournaments */}
  <Tab.Screen
    name="TournamentStack"
    component={TournamentStackScreen}
    options={{ title: 'Tournaments' }}
  />

  {/* Venues */}
  <Tab.Screen
    name="VenueStack"
    component={VenueStackScreen}
    options={({ route }) => ({
      title: 'Venues',
      tabBarStyle: { display: getTabBarVisibility(route) },
    })}
  />

  {/* News */}
  <Tab.Screen
    name="NewsStack"
    component={NewsStack}
    options={{ title: 'News' }}
  />

  {/* Profile */}
  <Tab.Screen
    name="ProfileStack"
    component={ProfileStack}
    options={({ route }) => ({
      title: 'Profile',
      tabBarStyle: { display: getTabBarVisibility(route) },
    })}
  />
</Tab.Navigator>

            ) : (
                <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#FFFFFF' } }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
