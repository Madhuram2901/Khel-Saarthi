import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { io } from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StyledButton from '../components/StyledButton';
import Constants from 'expo-constants';
import api from '../api/api';

const ChatScreen = ({ route }) => {
    const { eventId, eventTitle } = route.params;
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const { data } = await api.get(`/events/${eventId}/chat`);
                setMessages(data.reverse());
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatHistory();

        const hostUri = Constants.expoConfig.hostUri;
        const ipAddress = hostUri.split(':')[0];
        const SERVER_URL = `http://${ipAddress}:5001`;
        socketRef.current = io(SERVER_URL);
        socketRef.current.emit('joinRoom', eventId);

        socketRef.current.on('receiveMessage', (receivedMessage) => {
            setMessages(previousMessages => [receivedMessage, ...previousMessages]);
        });

        return () => socketRef.current.disconnect();
    }, [eventId]);

    const sendMessage = () => {
        if (message.trim() && socketRef.current) {
            socketRef.current.emit('sendMessage', { eventId, message, user });
            setMessage('');
        }
    };

    const renderMessage = ({ item }) => (
        <View style={[styles.messageBubble, item.user._id === user._id ? styles.myMessage : styles.theirMessage]}>
            <Text style={[styles.userName, item.user._id === user._id && { color: '#fff' }]}>{item.user._id === user._id ? 'You' : item.user.name}</Text>
            <Text style={[styles.messageText, item.user._id === user._id && { color: '#fff' }]}>{item.text}</Text>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, backgroundColor: colors.background }} color={colors.accent} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{eventTitle} - Chat</Text>
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item._id.toString()}
                inverted
                style={styles.messageList}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.textSecondary}
                />
                <StyledButton title="Send" onPress={sendMessage} />
            </View>
        </View>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 10, borderBottomWidth: 1, borderColor: colors.border, color: colors.text },
    messageList: { flex: 1, padding: 10 },
    inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    input: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, marginRight: 10, color: colors.text, backgroundColor: colors.surface2 },
    messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 15, marginBottom: 10 },
    myMessage: { backgroundColor: colors.accent, alignSelf: 'flex-end' },
    theirMessage: { backgroundColor: colors.surface2, alignSelf: 'flex-start' },
    userName: { fontWeight: 'bold', marginBottom: 3, color: colors.text },
    messageText: { color: colors.text }
});

export default ChatScreen;