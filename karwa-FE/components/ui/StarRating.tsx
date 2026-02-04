import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { colors, spacing } from '@/constants/theme';

interface StarRatingProps {
  rating: number; // Current rating (1-5)
  onRatingChange: (rating: number) => void;
  size?: number;
  editable?: boolean;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 24,
  editable = true,
  showValue = false,
}: StarRatingProps) {
  const handlePress = (value: number) => {
    if (editable) {
      onRatingChange(value);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => handlePress(value)}
            disabled={!editable}
            activeOpacity={editable ? 0.7 : 1}>
            <IconSymbol
              name={value <= rating ? 'star.fill' : 'star'}
              size={size}
              color={value <= rating ? colors.warning : colors.gray300}
            />
          </TouchableOpacity>
        ))}
      </View>
      {showValue && rating > 0 && (
        <View style={styles.valueContainer}>
          {/* Value can be displayed here if needed */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  valueContainer: {
    marginLeft: spacing.sm,
  },
});

