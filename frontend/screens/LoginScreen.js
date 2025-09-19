import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import AuthContext from '../context/AuthContext'; // Import the context

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext); // Get the login function from context

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in both fields.');
            return;
        }
        try {
            const data = await login(email, password); // Use the login function from context
            Alert.alert('Success', `Welcome back, ${data.name}!`);
        } catch (error) {
            console.error(error.response.data);
            Alert.alert('Login Failed', 'Invalid email or password.');
        }
    };

    // Quick dev login helpers (only visible in development builds)
    const quickLogin = async (qEmail, qPassword) => {
        try {
            const data = await login(qEmail, qPassword);
            Alert.alert('Success', `Welcome back, ${data.name}!`);
        } catch (error) {
            Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Log In" onPress={handleLogin} />
            {__DEV__ && (
                <View style={{ marginTop: 12 }}>
                    <Button title="Quick login (Host)" onPress={() => quickLogin('host', 'host')} />
                    <View style={{ height: 8 }} />
                    <Button title="Quick login (User)" onPress={() => quickLogin('test', 'test')} />
                </View>
            )}
            <Button
                title="Don't have an account? Register"
                onPress={() => navigation.navigate('Register')}
            />
        </View>
    );
};

// Styles remain the same
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});

export default LoginScreen;