import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const AiChatScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi! I'm Khel-Saarthi AI 🤖. Looking for a match or need some motivation? Ask me!",
      sender: 'ai',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', { message: userMsg.text });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: response.data.reply,
        sender: 'ai',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't connect to the server. Please try again.",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessageText = (text) => {
    const regex = /\[\[(EVENT|VENUE):([a-zA-Z0-9]+):(.*?)\]\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({
        type: 'link',
        linkType: match[1],
        id: match[2],
        name: match[3],
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts.map((part, index) => {
      if (part.type === 'text') {
        return <Text key={index}>{part.content}</Text>;
      } else {
        return (
          <Text
            key={index}
            style={styles.linkText}
            onPress={() => handleLinkPress(part.linkType, part.id)}
          >
            {part.name}
          </Text>
        );
      }
    });
  };

  const handleLinkPress = (type, id) => {
    if (type === 'EVENT') {
      navigation.navigate('EventDetails', { eventId: id });
    } else if (type === 'VENUE') {
      navigation.navigate('VenueStack', {
        screen: 'VenueDetails',
        params: { venueId: id }
      });
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {isUser ? item.text : renderMessageText(item.text)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Khel-Saarthi AI</Text>
          <Text style={styles.headerSubtitle}>Your Sports Companion</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about events..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: isDark ? '#1E1E1E' : colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: isDark ? '#2C2C2C' : colors.surface2,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: isDark ? '#E0E0E0' : colors.text,
  },
  linkText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: isDark ? '#1E1E1E' : colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: isDark ? '#2C2C2C' : colors.surface2,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: isDark ? '#333' : colors.surface2,
  },
});

export default AiChatScreen;
