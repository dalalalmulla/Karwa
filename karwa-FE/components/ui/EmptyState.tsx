import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing } from '@/constants/Karwa.theme';
import Button from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { theme, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.title,
          {
            color: theme.text,
            fontSize: typography.heading.fontSize,
          },
        ]}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={[
            styles.message,
            {
              color: theme.textSecondary,
              fontSize: typography.body.fontSize,
            },
          ]}
        >
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl * 2,
    minHeight: 200,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});

