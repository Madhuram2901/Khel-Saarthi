import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { SPACING, RADII, TYPOGRAPHY, CARD_SHADOW } from '../theme/designSystem';

const NewsScreen = ({ navigation }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

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

  const NewsCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => Linking.openURL(item.url)}
        activeOpacity={0.9}
      >
        {/* Image section */}
        <View style={styles.imageContainer}>
          {item.urlToImage ? (
            <Image
              source={{ uri: item.urlToImage }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]}>
              <Ionicons name="newspaper-outline" size={40} color={colors.textMuted} />
            </View>
          )}
        </View>

        {/* Content section */}
        <View style={styles.cardContent}>
          {/* Category pill — overlaps image via negative marginTop */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>SPORTS</Text>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Description — 2 lines max */}
          <Text style={styles.cardDescription} numberOfLines={3}>
            {item.description}
          </Text>

          {/* Footer: source dot + Read More */}
          <View style={styles.cardFooter}>
            <View style={styles.sourceDot} />
            <Text style={styles.sourceText} numberOfLines={1}>
              {item.source?.name ?? item.url}
            </Text>
            <Text style={styles.readMore}>Read More →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sports News</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* News List */}
      <FlatList
        data={news}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <NewsCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  listContainer: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.5 : 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: colors.surface2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface2,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#34C759',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: -16,        // pulls pill up to overlap image bottom
    marginBottom: 12,
    zIndex: 10,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    flexShrink: 0,
  },
  sourceText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    flexShrink: 0,
  },
});

export default NewsScreen;