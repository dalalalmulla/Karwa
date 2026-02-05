import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing, borderRadius } from '@/constants/Karwa.theme';
import Card from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function StatCard({ label, value, icon, style }: StatCardProps) {
  const { theme, typography } = useTheme();

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.value,
              {
                color: theme.text,
                fontSize: typography.heading.fontSize,
              },
            ]}
          >
            {value}
          </Text>
          <Text
            style={[
              styles.label,
              {
                color: theme.textSecondary,
                fontSize: typography.caption.fontSize,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 80,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  label: {
    fontWeight: '500',
  },
});

