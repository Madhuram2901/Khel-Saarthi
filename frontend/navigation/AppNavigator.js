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



const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();



function HomeStack() {

    return (

        <Stack.Navigator>

            <Stack.Screen name="Home" component={HomeScreen} />

            <Stack.Screen name="CreateEvent" component={CreateEventScreen} />

            <Stack.Screen name="EditEvent" component={EditEventScreen} />

            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />

            <Stack.Screen name="Participants" component={ParticipantsScreen} />

            <Stack.Screen name="Chat" component={ChatScreen} />

        </Stack.Navigator>

    );

}



function ProfileStack() {

    return (

        <Stack.Navigator>

            <Stack.Screen name="Profile" component={ProfileScreen} />

            <Stack.Screen name="BadmintonProfile" component={BadmintonProfileScreen} />

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

                // Use a Tab Navigator when logged in

                <Tab.Navigator

                    screenOptions={({ route }) => ({

                        tabBarIcon: ({ focused, color, size }) => {

                            let iconName;

                            if (route.name === 'HomeStack') {

                                iconName = focused ? 'home' : 'home-outline';

                            } else if (route.name === 'ProfileStack') {

                                iconName = focused ? 'person' : 'person-outline';

                            }

                            return <Ionicons name={iconName} size={size} color={color} />;

                        },

                        headerShown: false,

                    })}

                >

                    <Tab.Screen name="HomeStack" component={HomeStack} options={{ title: 'Home' }} />

                    <Tab.Screen name="ProfileStack" component={ProfileStack} options={{ title: 'Profile' }} />

                </Tab.Navigator>

            ) : (

                <Stack.Navigator>

                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />

                </Stack.Navigator>

            )}

        </NavigationContainer>

    );

};



export default AppNavigator;

