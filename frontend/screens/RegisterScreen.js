import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Alert,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import StyledButton from '../components/StyledButton';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('participant'); // 'participant', 'host', 'venue_manager'
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/register', {
                name,
                email,
                password,
                role,
            });
            Alert.alert(
                'Success',
                'Registration successful! Please log in.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            console.error(error.response?.data);
            Alert.alert('Registration Failed', 'User with this email may already exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={24} color="#007AFF" />
                        </TouchableOpacity>

                        <View style={styles.headerContent}>
                            <View style={styles.logo}>
                                <Ionicons name="person-add" size={48} color="#007AFF" />
                            </View>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join the sports community</Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor="#8E8E93"
                                    value={name}
                                    onChangeText={setName}
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#8E8E93"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Password"
                                    placeholderTextColor="#8E8E93"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.passwordToggle}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#8E8E93"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.roleSection}>
                            <Text style={styles.sectionTitle}>I want to register as:</Text>

                            <TouchableOpacity
                                style={[styles.roleOption, role === 'participant' && styles.roleOptionSelected]}
                                onPress={() => setRole('participant')}
                            >
                                <View style={styles.roleIcon}>
                                    <Ionicons name="person" size={24} color={role === 'participant' ? "#fff" : "#007AFF"} />
                                </View>
                                <View style={styles.roleInfo}>
                                    <Text style={[styles.roleTitle, role === 'participant' && styles.roleTextSelected]}>User</Text>
                                    <Text style={[styles.roleDescription, role === 'participant' && styles.roleTextSelected]}>Join events and book venues</Text>
                                </View>
                                {role === 'participant' && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roleOption, role === 'host' && styles.roleOptionSelected]}
                                onPress={() => setRole('host')}
                            >
                                <View style={styles.roleIcon}>
                                    <Ionicons name="trophy" size={24} color={role === 'host' ? "#fff" : "#007AFF"} />
                                </View>
                                <View style={styles.roleInfo}>
                                    <Text style={[styles.roleTitle, role === 'host' && styles.roleTextSelected]}>Event Host</Text>
                                    <Text style={[styles.roleDescription, role === 'host' && styles.roleTextSelected]}>Organize tournaments and matches</Text>
                                </View>
                                {role === 'host' && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roleOption, role === 'venue_manager' && styles.roleOptionSelected]}
                                onPress={() => setRole('venue_manager')}
                            >
                                <View style={styles.roleIcon}>
                                    <Ionicons name="business" size={24} color={role === 'venue_manager' ? "#fff" : "#007AFF"} />
                                </View>
                                <View style={styles.roleInfo}>
                                    <Text style={[styles.roleTitle, role === 'venue_manager' && styles.roleTextSelected]}>Venue Host</Text>
                                    <Text style={[styles.roleDescription, role === 'venue_manager' && styles.roleTextSelected]}>List and manage sports venues</Text>
                                </View>
                                {role === 'venue_manager' && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
                            </TouchableOpacity>
                        </View>

                        <StyledButton
                            title="Create Account"
                            onPress={handleRegister}
                            disabled={loading}
                            size="large"
                            style={styles.registerButton}
                        />
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginText}>
                                Already have an account? <Text style={styles.loginLink}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: 20,
        paddingHorizontal: 32,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerContent: {
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F2F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 32,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1D1D1F',
    },
    passwordInput: {
        paddingRight: 40,
    },
    passwordToggle: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    roleSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    roleOptionSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    roleIcon: {
        marginRight: 16,
    },
    roleInfo: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    roleDescription: {
        fontSize: 13,
        color: '#8E8E93',
    },
    roleTextSelected: {
        color: '#FFFFFF',
    },
    registerButton: {
        marginBottom: 24,
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 32,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
    loginLink: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default RegisterScreen;