import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import Spacing from '../constants/Spacing';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import {useNavigation} from '@react-navigation/native';

const CategoryCard = ({category, isSelected = false}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate(`search?category=${category}`);
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={handlePress}>
      <Text style={[styles.text, isSelected && styles.selectedText]}>
        {category}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neutral[100],
    borderRadius: Spacing.radius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  selectedCard: {
    backgroundColor: Colors.primary[600],
  },
  text: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  selectedText: {
    color: Colors.text.inverse,
  },
});

export default CategoryCard;
