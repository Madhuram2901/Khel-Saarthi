import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryIcon, getCategoryColor } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        const categoryColor = getCategoryColor(category);

        return (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              isSelected && { backgroundColor: categoryColor }
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <View style={styles.buttonContent}>
              <Ionicons
                name={getCategoryIcon(category)}
                size={20}
                color={isSelected ? '#FFFFFF' : categoryColor}
              />
              <Text style={[
                styles.filterText,
                isSelected && { color: '#FFFFFF' },
                !isSelected && { color: categoryColor }
              ]}>
                {category}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    backgroundColor: colors.surface2,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default CategoryFilter;