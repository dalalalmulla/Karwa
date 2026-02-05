import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing, borderRadius } from '@/constants/Karwa.theme';
import Card from './ui/Card';
import StatusBadge from './ui/StatusBadge';
import Badge from './ui/Badge';
import MetaInfo from './ui/MetaInfo';
import type { Task } from '@/src/api/taskCalls';

export interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const { theme, typography } = useTheme();

  return (
    <Card
      variant="default"
      onPress={onPress}
      style={styles.card}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontSize: typography.heading.fontSize,
              },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>
        <Badge
          label={`${task.points} pts`}
          variant="primary"
          size="small"
        />
      </View>

      {/* Description */}
      <Text
        style={[
          styles.description,
          {
            color: theme.textSecondary,
            fontSize: typography.body.fontSize,
          },
        ]}
        numberOfLines={2}
      >
        {task.description}
      </Text>

      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <StatusBadge status={task.status as any} size="small" />
      </View>

      {/* Meta Information */}
      <View style={styles.metaContainer}>
        <MetaInfo icon="💰" label="Amount" value={`${task.money} KWD`} />
        <MetaInfo icon="📍" label="Location" value={task.location} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontWeight: '700',
    lineHeight: 22,
  },
  description: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  statusContainer: {
    marginBottom: spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
});

