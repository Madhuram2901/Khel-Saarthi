import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert, 
  Switch,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
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
    const [isHost, setIsHost] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        
        setLoading(true);
        try {
            const role = isHost ? 'host' : 'participant';
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

                    <View style={styles.switchSection}>
                        <View style={styles.switchContainer}>
                            <View style={styles.switchInfo}>
                                <Text style={styles.switchLabel}>Register as Event Host</Text>
                                <Text style={styles.switchDescription}>
                                    Hosts can create and manage sports events
                                </Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                                thumbColor={isHost ? "#FFFFFF" : "#FFFFFF"}
                                onValueChange={() => setIsHost(previousState => !previousState)}
                                value={isHost}
                                style={styles.switch}
                            />
                        </View>
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
    header: {
        paddingTop: 20,
        paddingHorizontal: 32,
        paddingBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
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
    switchSection: {
        marginBottom: 32,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
    },
    switchInfo: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    switchDescription: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 18,
    },
    switch: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
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