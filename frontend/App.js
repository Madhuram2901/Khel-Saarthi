import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Toast from 'react-native-toast-message';

function AppContent() {
    const { isDark } = useTheme();
    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <AuthProvider>
                <AppNavigator />
                <Toast />
            </AuthProvider>
        </>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}