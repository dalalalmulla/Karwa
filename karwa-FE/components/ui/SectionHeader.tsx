import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing } from '@/constants/Karwa.theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
  titleStyle,
}: SectionHeaderProps) {
  const { theme, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
              fontSize: typography.heading.fontSize,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textSecondary,
                fontSize: typography.caption.fontSize,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text
            style={[
              styles.action,
              {
                color: theme.primary,
                fontSize: typography.body.fontSize,
              },
            ]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontWeight: '400',
  },
  action: {
    fontWeight: '600',
  },
});

