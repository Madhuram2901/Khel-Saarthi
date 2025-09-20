import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import StyledButton from '../components/StyledButton';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in both fields.');
            return;
        }
        
        setLoading(true);
        try {
            const data = await login(email, password);
            Alert.alert('Success', `Welcome back, ${data.name}!`);
        } catch (error) {
            console.error(error?.response?.data || error.message);
            Alert.alert('Login Failed', 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = async (qEmail, qPassword) => {
        setLoading(true);
        try {
            const data = await login(qEmail, qPassword);
            Alert.alert('Success', `Welcome back, ${data.name}!`);
        } catch (error) {
            Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials');
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
                    <View style={styles.logoContainer}>
                        <View style={styles.logo}>
                            <Ionicons name="fitness" size={48} color="#007AFF" />
                        </View>
                        <Text style={styles.title}>Welcome to Khel Saarthi</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
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

                    <StyledButton 
                        title="Sign In" 
                        onPress={handleLogin}
                        disabled={loading}
                        size="large"
                        style={styles.loginButton}
                    />

                    {__DEV__ && (
                        <View style={styles.devButtons}>
                            <Text style={styles.devTitle}>Quick Login (Dev Only)</Text>
                            <StyledButton 
                                title="Host Login" 
                                onPress={() => quickLogin('host', 'host')}
                                variant="secondary"
                                size="small"
                                disabled={loading}
                            />
                            <StyledButton 
                                title="User Login" 
                                onPress={() => quickLogin('test', 'test')}
                                variant="secondary"
                                size="small"
                                disabled={loading}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerText}>
                            Don't have an account? <Text style={styles.registerLink}>Sign Up</Text>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 60,
    },
    logoContainer: {
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
        paddingHorizontal: 32,
        paddingBottom: 32,
    },
    inputContainer: {
        marginBottom: 32,
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
    loginButton: {
        marginBottom: 24,
    },
    devButtons: {
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginTop: 16,
    },
    devTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 12,
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 32,
        alignItems: 'center',
    },
    registerText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
    registerLink: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default LoginScreen;