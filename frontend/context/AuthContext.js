import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Authentication Context
// Contract:
// - user: object | null (from GET /users/profile), persisted in AsyncStorage as `userData`
// - loading: boolean (initial app load while restoring session)
// - login(email, password, existingToken?): authenticates OR refreshes from token, fetches profile, persists
// - logout(): clears auth header, user state, and persisted storage
// - setUser: function to update the user state and persist (safe to use after profile edits)
const AuthContext = createContext();

// Safely parse JSON values from storage, falling back gracefully on errors
const safeParseJSON = (value, fallback = null) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on app start from persisted token + user
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const rawUserData = await AsyncStorage.getItem('userData');

                if (token) {
                    // Re-hydrate axios auth header so protected requests work immediately
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Re-hydrate user state from storage (if present and valid)
                    const parsed = safeParseJSON(rawUserData, null);
                    if (parsed) setUser(parsed);
                } else {
                    // Ensure header is clean if there's no token
                    delete api.defaults.headers.common['Authorization'];
                }
            } finally {
                // Always end loading regardless of success/failure
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // Login OR refresh with existing token, then fetch profile to ensure fresh user state
    const login = async (email, password, existingToken = null) => {
        try {
            let token;

            if (existingToken) {
                // Refresh path: use provided token (e.g., after profile update)
                token = existingToken;
            } else {
                // Auth path: perform login to obtain token
                const response = await api.post('/users/login', { email, password });
                token = response.data.token;
            }

            // With a valid token, set header and fetch the latest user profile
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const { data: userData } = await api.get('/users/profile');

            setUser(userData);
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            return { ...userData, token };
        } catch (error) {
            // Do not mutate state here; just propagate to caller for UI handling
            throw error;
        }
    };

    // Clear all authentication state and persisted data
    const logout = async () => {
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    };

    // Helper to update user and persist to AsyncStorage (non-breaking additive API)
    const updateUser = async (newUser) => {
        setUser(newUser);
        await AsyncStorage.setItem('userData', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser: updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;