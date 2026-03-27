import React, { useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Image,
    Alert,
    Linking,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { RADII, SIZES, TYPOGRAPHY } from '../theme/designSystem';

const EditProfileScreen = ({ navigation }) => {
    const { user, setUser } = useContext(AuthContext);
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [height, setHeight] = useState(user.height?.toString() ?? '');
    const [weight, setWeight] = useState(user.weight?.toString() ?? '');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const requestMediaLibraryPermission = async () => {
        try {
            const { granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (granted) return true;

            if (!canAskAgain) {
                Alert.alert(
                    'Permission required',
                    'Please allow photo library access in Settings to change your profile picture.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings && Linking.openSettings() },
                    ]
                );
            }

            return false;
        } catch (error) {
            return false;
        }
    };

    const pickImage = async () => {
        const ok = await requestMediaLibraryPermission();
        if (!ok) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Could not pick image');
        }
    };

    const handleSave = useCallback(async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Error', 'Name and email are required');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('height', parseFloat(height) || null);
            formData.append('weight', parseFloat(weight) || null);

            if (image) {
                formData.append('profilePicture', {
                    uri: image,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
                });
            }

            const { data } = await api.put('/users/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
            }

            setUser(data);
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not update profile');
        } finally {
            setLoading(false);
        }
    }, [email, height, image, name, navigation, setUser, weight]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Edit Profile',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Text style={[styles.headerButtonText, { color: colors.accent }]}>Cancel</Text>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerButton}>
                    <Text style={[styles.headerButtonText, { color: loading ? colors.textSecondary : colors.accent }]}>
                        {loading ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            ),
        });
    }, [colors.accent, colors.textSecondary, handleSave, loading, navigation, styles.headerButton, styles.headerButtonText]);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.editAvatarSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.editAvatarContainer} activeOpacity={0.85}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.editAvatar} />
                            ) : user.profilePicture ? (
                                <Image source={{ uri: user.profilePicture }} style={styles.editAvatar} />
                            ) : (
                                <View style={styles.editAvatarPlaceholder}>
                                    <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                </View>
                            )}
                            <View style={styles.editAvatarOverlay}>
                                <Ionicons name="camera" size={20} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.editAvatarText}>Tap to change photo</Text>
                    </View>

                    <View style={styles.editInputSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Height (cm)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 175"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                value={height}
                                onChangeText={setHeight}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 70"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                value={weight}
                                onChangeText={setWeight}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 120,
    },
    headerButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    headerButtonText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
    },
    editAvatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    editAvatarContainer: {
        position: 'relative',
    },
    editAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editAvatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.surface2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
    },
    editAvatarText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.textSecondary,
    },
    editInputSection: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: SIZES.inputHeight,
        fontSize: 16,
        color: colors.text,
    },
});

export default EditProfileScreen;
