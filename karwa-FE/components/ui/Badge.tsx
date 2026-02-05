import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing, borderRadius } from '@/constants/Karwa.theme';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  const { theme, typography } = useTheme();

  const variantStyles = {
    primary: {
      backgroundColor: theme.primarySoft,
      color: theme.primary,
    },
    secondary: {
      backgroundColor: theme.surfaceAlt,
      color: theme.textSecondary,
    },
    success: {
      backgroundColor: `${theme.success}20`,
      color: theme.success,
    },
    warning: {
      backgroundColor: `${theme.warning}20`,
      color: theme.warning,
    },
    danger: {
      backgroundColor: `${theme.danger}20`,
      color: theme.danger,
    },
    info: {
      backgroundColor: `${theme.info}20`,
      color: theme.info,
    },
  };

  const sizeStyles = {
    small: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: typography.small.fontSize,
    },
    medium: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      fontSize: typography.caption.fontSize,
    },
    large: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.body.fontSize,
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentVariant.backgroundColor,
          borderRadius: borderRadius.md,
          ...currentSize,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: currentVariant.color,
            fontSize: currentSize.fontSize,
            fontWeight: '600',
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});

