import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 'auto' | 'light' | 'dark'
    const [themeMode, setThemeMode] = useState('auto');
    const [isDark, setIsDark] = useState(false);
    const [themeLoaded, setThemeLoaded] = useState(false);

    // Check if current time is between 7 PM (19:00) and 7 AM (07:00)
    const isNightTime = () => {
        const hour = new Date().getHours();
        return hour >= 19 || hour < 7;
    };

    // Resolve final isDark value based on mode
    const resolveTheme = (mode) => {
        if (mode === 'dark') return true;
        if (mode === 'light') return false;
        return isNightTime(); // 'auto'
    };

    // Load saved preference on mount
    useEffect(() => {
        const loadTheme = async () => {
            const saved = await AsyncStorage.getItem('themeMode');
            const mode = saved ?? 'auto';
            setThemeMode(mode);
            setIsDark(resolveTheme(mode));
            setThemeLoaded(true);
        };
        loadTheme();
    }, []);

    // Re-check every 60 seconds when in auto mode
    useEffect(() => {
        if (themeMode !== 'auto') return;
        const interval = setInterval(() => {
            setIsDark(isNightTime());
        }, 60000);
        return () => clearInterval(interval);
    }, [themeMode]);

    const setMode = async (mode) => {
        setThemeMode(mode);
        setIsDark(resolveTheme(mode));
        await AsyncStorage.setItem('themeMode', mode);
    };

    const colors = isDark ? darkColors : lightColors;

    // Don't render until theme preference is loaded (prevents white flash)
    if (!themeLoaded) return null;

    return (
        <ThemeContext.Provider value={{ isDark, themeMode, setMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Convenience hook — use in any screen
export const useTheme = () => useContext(ThemeContext);
