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
import { useTheme } from '../context/ThemeContext';
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
import EditProfileScreen from '../screens/EditProfileScreen';
import BadmintonProfileScreen from '../screens/BadmintonProfileScreen';
import CreateSportsProfileScreen from '../screens/CreateSportsProfileScreen';
import SportsProfileDetailsScreen from '../screens/SportsProfileDetailsScreen';
import EditSportsProfileScreen from '../screens/EditSportsProfileScreen';
import AiChatScreen from '../screens/AiChatScreen';
import NewsScreen from '../screens/NewsScreen';
import VenueListScreen from '../screens/VenueListScreen';
import VenueDetailsScreen from '../screens/VenueDetailsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import AddVenueScreen from '../screens/AddVenueScreen';
import EditVenueScreen from '../screens/EditVenueScreen';
import EventsScreen from '../screens/EventsScreen';
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
const EventStack = createStackNavigator();

function HomeStack() {
    const { colors } = useTheme();
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: colors.text },
                headerTintColor: colors.accent,
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event', headerBackTitle: 'Back' }} />
            <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event', headerBackTitle: 'Back' }} />
            <Stack.Screen
                name="CreateTournament"
                component={CreateTournamentScreen}
                options={{
                    title: 'Create Tournament',
                    headerShown: true,
                    headerBackTitleVisible: false,
                }}
            />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details',headerTransparent: true, headerTitle: '', headerTintColor: '#fff' }} />
            <Stack.Screen name="Participants" component={ParticipantsScreen} options={{ title: 'Participants', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.eventTitle || 'Chat', headerBackTitle: 'Back' })} />
            <Stack.Screen name="BadmintonProfile" component={BadmintonProfileScreen} options={{ title: 'Badminton Profile' }} />
            <Stack.Screen name="AiChat" component={AiChatScreen} options={{ headerShown: false }} />
            <Stack.Screen
                name="AiGymTrainer"
                component={AiGymTrainerScreen}
                options={{
                    headerShown: false,
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                }}
            />
            <Stack.Screen name="News" component={NewsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function ProfileStack() {
    const { colors } = useTheme();
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: colors.text },
                headerTintColor: colors.accent,
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="BadmintonProfile" component={BadmintonProfileScreen} options={{ title: 'Badminton Profile', headerBackTitle: 'Profile' }} />
        </Stack.Navigator>
    );
}

function EventsStackScreen() {
    const { colors } = useTheme();
    return (
        <EventStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: colors.text },
                headerTintColor: colors.accent,
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: colors.background },
            }}
        >
            <EventStack.Screen name="Events" component={EventsScreen} options={{ headerShown: false }} />
            <EventStack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
            <EventStack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
            <EventStack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
            <EventStack.Screen name="Participants" component={ParticipantsScreen} options={{ title: 'Participants' }} />
            <EventStack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.eventTitle || 'Chat' })} />
        </EventStack.Navigator>
    );
}

function VenueStackScreen() {
    const { colors } = useTheme();
    return (
        <VenueStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: colors.text },
                headerTintColor: colors.accent,
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: colors.background },
            }}
        >
            <VenueStack.Screen name="VenueList" component={VenueListScreen} options={{ title: '', headerShown: false }} />
            <VenueStack.Screen name="VenueDetails" component={VenueDetailsScreen} options={{ title: 'Venue Details', headerBackTitleVisible: false }} />
            <VenueStack.Screen name="AddVenue" component={AddVenueScreen} options={{ title: 'List New Venue' }} />
            <VenueStack.Screen name="EditVenue" component={EditVenueScreen} options={{ title: 'Edit Venue' }} />
            <VenueStack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
        </VenueStack.Navigator>
    );
}

function TournamentStackScreen() {
    const { colors } = useTheme();
    return (
        <TournamentStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: colors.text },
                headerTintColor: colors.accent,
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: colors.background },
            }}
        >
            <TournamentStack.Screen name="TournamentList" component={TournamentListScreen} options={{ headerShown: false }} />
            <TournamentStack.Screen
                name="CreateTournament"
                component={CreateTournamentScreen}
                options={{
                    title: 'Create Tournament',
                    headerShown: true,
                }}
            />
            <TournamentStack.Screen name="TournamentDashboard" component={TournamentDashboardScreen} options={{
                title: 'Tournament',
                headerBackTitle: ' ',
            }} />
            <TournamentStack.Screen name="ManageTeams" component={ManageTeamsScreen} options={{ title: 'Manage Teams' }} />
            <TournamentStack.Screen name="GenerateFixtures" component={GenerateFixturesScreen} options={{ title: 'Generate Fixtures' }} />
            <TournamentStack.Screen name="MatchDetails" component={MatchDetailsScreen} options={{ title: 'Match Details' }} />
        </TournamentStack.Navigator>
    );
}

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);
    const { colors } = useTheme();

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const getTabBarVisibility = (route) => {
        const routeName = getFocusedRouteNameFromRoute(route);

        const hiddenScreens = [
            'CreateEvent',
            'EditEvent',
            'EventDetails',
            'Participants',
            'Chat',
            'BadmintonProfile',
            'AiChat',
            'AiGymTrainer',
            'VenueDetails',
            'AddVenue',
            'EditVenue',
            'MyBookings',
            'CreateTournament',
            'TournamentDashboard',
            'ManageTeams',
            'GenerateFixtures',
            'MatchDetails',
        ];

        return hiddenScreens.includes(routeName) ? 'none' : 'flex';
    };

    const MainTabNavigator = () => (
        <Tab.Navigator
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'HomeStack') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'TournamentStack') iconName = focused ? 'trophy' : 'trophy-outline';
                    else if (route.name === 'EventsStack') iconName = focused ? 'calendar' : 'calendar-outline';
                    else if (route.name === 'VenueStack') iconName = focused ? 'location' : 'location-outline';
                    else if (route.name === 'ProfileStack') iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={({ route }) => ({
                    title: 'Home',
                    tabBarStyle: { display: getTabBarVisibility(route) },
                })}
            />

            <Tab.Screen
                name="TournamentStack"
                component={TournamentStackScreen}
                options={({ route }) => ({
                    title: 'Tourneys',
                    tabBarStyle: { display: getTabBarVisibility(route) },
                })}
            />

            <Tab.Screen
                name="EventsStack"
                component={EventsStackScreen}
                options={({ route }) => ({
                    title: 'Events',
                    tabBarStyle: { display: getTabBarVisibility(route) },
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                })}
            />

            <Tab.Screen
                name="VenueStack"
                component={VenueStackScreen}
                options={({ route }) => ({
                    title: 'Venues',
                    tabBarStyle: { display: getTabBarVisibility(route) },
                })}
            />

            <Tab.Screen
                name="ProfileStack"
                component={ProfileStack}
                options={({ route }) => ({
                    title: 'Profile',
                    tabBarStyle: { display: getTabBarVisibility(route) },
                })}
            />
        </Tab.Navigator>
    );



    return (
        <NavigationContainer>
            {user ? (
                <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                    <Stack.Screen name="CreateSportsProfile" component={CreateSportsProfileScreen} />
                    <Stack.Screen name="SportsProfileDetails" component={SportsProfileDetailsScreen} />
                    <Stack.Screen name="EditSportsProfile" component={EditSportsProfileScreen} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
