import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const NewsScreen = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await api.get('/news');
            setNews(response.data.articles);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    // Light color palette for cards
    const colorPaletteLight = ['#FFFFFF', '#F8FAFC', '#EFF6FF', '#FFF7ED', '#F8FAFC', '#F5F3FF'];

    // Accent colors for badges and highlights
    const accentColors = [
        ['#3B82F6', '#60A5FA'],  // Blue
        ['#8B5CF6', '#A78BFA'],  // Purple
        ['#EC4899', '#F472B6'],  // Pink
        ['#F59E0B', '#FBBF24'],  // Amber
        ['#10B981', '#34D399'],  // Green
        ['#06B6D4', '#22D3EE'],  // Cyan
    ];

    const NewsCard = ({ item, index }) => {
        const scaleAnim = new Animated.Value(1);

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.97,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }).start();
        };

        const backgroundColor = colorPaletteLight[index % colorPaletteLight.length];
        const accentGradient = accentColors[index % accentColors.length];

        return (
            <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => Linking.openURL(item.url)}
                >
                    <View style={[styles.card, { backgroundColor }]}>
                        {item.urlToImage ? (
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.urlToImage }} style={styles.image} />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.5)']}
                                    style={styles.imageGradient}
                                />
                            </View>
                        ) : (
                            <LinearGradient
                                colors={accentGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.placeholderGradient}
                            >
                                <Text style={styles.placeholderIcon}>📰</Text>
                            </LinearGradient>
                        )}

                        <View style={styles.content}>
                            <View style={styles.categoryBadge}>
                                <LinearGradient
                                    colors={accentGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.badgeGradient}
                                >
                                    <Text style={styles.badgeText}>SPORTS</Text>
                                </LinearGradient>
                            </View>

                            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                            {item.description && (
                                <Text style={styles.description} numberOfLines={3}>
                                    {item.description}
                                </Text>
                            )}

                            <View style={styles.footer}>
                                <View style={styles.sourceContainer}>
                                    <View style={[styles.sourceDot, { backgroundColor: accentGradient[0] }]} />
                                    <Text style={styles.source}>{item.source.name}</Text>
                                </View>
                                <Text style={[styles.readMore, { color: accentGradient[0] }]}>Read More →</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                style={styles.loadingContainer}
            >
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading Sports News...</Text>
            </LinearGradient>
        );
    }

    return (
        <View style={styles.container}>
            
            <FlatList
                data={news}
                keyExtractor={(item, index) => `${item.url}-${index}`}
                renderItem={({ item, index }) => <NewsCard item={item} index={index} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    list: {
        padding: 16,
        paddingTop: 20,
    },
    cardWrapper: {
        marginBottom: 20,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 220,
        resizeMode: 'cover',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    placeholderGradient: {
        width: '100%',
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 64,
    },
    content: {
        padding: 20,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        borderRadius: 20,
        overflow: 'hidden',
    },
    badgeGradient: {
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000ff',
        letterSpacing: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 10,
        lineHeight: 28,
    },
    description: {
        fontSize: 15,
        color: '#4A5568',
        marginBottom: 16,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.06)',
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sourceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    source: {
        fontSize: 13,
        color: '#718096',
        fontWeight: '600',
    },
    readMore: {
        fontSize: 14,
        fontWeight: '700',
    },
});

export default NewsScreen;
