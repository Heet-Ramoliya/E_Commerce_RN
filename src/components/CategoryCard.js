import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Animated, View} from 'react-native';
import Spacing from '../constants/Spacing';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';

const CategoryCard = ({category, isSelected = false, onPress}) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          {
            transform: [{scale: scaleValue}],
          },
        ]}>
        <Text style={[styles.text, isSelected && styles.selectedText]}>
          {category}
        </Text>
        {isSelected && <View style={styles.selectedIndicator} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.neutral[50],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: Colors.primary[50],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  selectedText: {
    color: Colors.primary[700],
    fontFamily: Typography.fonts.bold,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    width: 24,
    height: 3,
    backgroundColor: Colors.primary[600],
    borderRadius: 2,
    transform: [{translateX: -12}],
  },
});

export default CategoryCard;
