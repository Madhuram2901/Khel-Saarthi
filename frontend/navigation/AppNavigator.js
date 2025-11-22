import React, { useContext, useEffect } from 'react';

import { ActivityIndicator, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createStackNavigator } from '@react-navigation/stack';

import { io } from 'socket.io-client';

import Constants from 'expo-constants';

import { Ionicons } from '@expo/vector-icons';

import Toast from 'react-native-toast-message';

import api from '../api/api';



import AuthContext from '../context/AuthContext';



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

import AiChatScreen from '../screens/AiChatScreen'; // Import AI Chat Screen
import NewsScreen from '../screens/NewsScreen';




const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();



function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1D1D1F',
                },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CreateEvent"
                component={CreateEventScreen}
                options={{
                    title: 'Create Event',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="EditEvent"
                component={EditEventScreen}
                options={{
                    title: 'Edit Event',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="EventDetails"
                component={EventDetailsScreen}
                options={{ title: 'Event Details' }}
            />
            <Stack.Screen
                name="Participants"
                component={ParticipantsScreen}
                options={{
                    title: 'Participants',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route }) => ({
                    title: route.params?.eventTitle || 'Chat',
                    headerBackTitle: 'Back'
                })}
            />
            <Stack.Screen 
                name="BadmintonProfile" 
                component={BadmintonProfileScreen}
                options={{ title: 'Badminton Profile' }}
            />
            <Stack.Screen 
                name="AiChat" 
                component={AiChatScreen}
                options={{ headerShown: false }}
            /> 
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1D1D1F',
                },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
            <Stack.Screen
                name="BadmintonProfile"
                component={BadmintonProfileScreen}
                options={{
                    title: 'Badminton Profile',
                    headerBackTitle: 'Profile'
                }}
            />
        </Stack.Navigator>
    );
}

function NewsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1D1D1F',
                },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen
                name="News"
                component={NewsScreen}
                options={{ title: 'Sports News' }}
            />
        </Stack.Navigator>
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



    return (
        <NavigationContainer>
            {user ? (
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;
                            if (route.name === 'HomeStack') {
                                iconName = focused ? 'home' : 'home-outline';
                            } else if (route.name === 'NewsStack') {
                                iconName = focused ? 'newspaper' : 'newspaper-outline';
                            } else if (route.name === 'ProfileStack') {
                                iconName = focused ? 'person' : 'person-outline';
                            }
                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                        headerShown: false,
                        tabBarActiveTintColor: '#007AFF',
                        tabBarInactiveTintColor: '#8E8E93',
                        tabBarStyle: {
                            backgroundColor: '#FFFFFF',
                            borderTopWidth: 1,
                            borderTopColor: '#E5E5EA',
                            height: 90,
                            paddingBottom: 20,
                            paddingTop: 8,
                        },
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: '600',
                            marginTop: 4,
                        },
                        tabBarIconStyle: {
                            marginTop: 4,
                        },
                    })}
                >
                    <Tab.Screen
                        name="HomeStack"
                        component={HomeStack}
                        options={{ title: 'Home' }}
                    />
                    <Tab.Screen
                        name="NewsStack"
                        component={NewsStack}
                        options={{ title: 'News' }}
                    />
                    <Tab.Screen
                        name="ProfileStack"
                        component={ProfileStack}
                        options={{ title: 'Profile' }}
                    />
                </Tab.Navigator>
            ) : (
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#FFFFFF' },
                        gestureEnabled: true,
                        gestureDirection: 'horizontal',
                    }}
                >
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                    />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );

};



export default AppNavigator;

