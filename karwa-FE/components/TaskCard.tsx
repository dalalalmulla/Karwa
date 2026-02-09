import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing, borderRadius } from '@/constants/Karwa.theme';
import { getBaseURL } from '@/src/api/axios';
import Card from './ui/Card';
import StatusBadge from './ui/StatusBadge';
import Badge from './ui/Badge';
import MetaInfo from './ui/MetaInfo';
import type { Task } from '@/src/api/taskCalls';

function getImageUrl(path: string): string {
  if (path.startsWith('http') || path.startsWith('file://')) return path;
  const serverUrl = getBaseURL().replace('/api', '');
  return `${serverUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

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

      {/* Thumbnail */}
      {task.pictures && task.pictures.length > 0 && (
        <View style={styles.thumbnailRow}>
          {task.pictures.slice(0, 3).map((pic, idx) => (
            <Image
              key={idx}
              source={{ uri: getImageUrl(pic) }}
              style={[styles.thumbnail, { borderColor: theme.border }]}
              contentFit="cover"
              transition={200}
            />
          ))}
          {task.pictures.length > 3 && (
            <View style={[styles.moreOverlay, { backgroundColor: `${theme.text}80` }]}>
              <Text style={[styles.moreText, { color: theme.white }]}>
                +{task.pictures.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

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
  thumbnailRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  moreOverlay: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontWeight: '700',
    fontSize: 16,
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

