import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import Toast from 'react-native-toast-message';

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <AppNavigator />
                <Toast />
            </AuthProvider>
        </SafeAreaProvider>
    );
}