import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing } from '@/constants/Karwa.theme';

export interface MetaInfoProps {
  icon?: string | React.ReactNode;
  label: string;
  value: string;
  style?: ViewStyle;
}

export default function MetaInfo({ icon, label, value, style }: MetaInfoProps) {
  const { theme, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {typeof icon === 'string' ? (
            <Text style={styles.iconEmoji}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
      )}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.label,
            {
              color: theme.textMuted,
              fontSize: typography.small.fontSize,
            },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.value,
            {
              color: theme.text,
              fontSize: typography.caption.fontSize,
            },
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  iconEmoji: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '400',
    marginBottom: 2,
  },
  value: {
    fontWeight: '600',
  },
});

