import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing, borderRadius, shadows } from '@/constants/Karwa.theme';
import { getBaseURL } from '@/src/api/axios';
import type { Task } from '@/src/api/taskCalls';

function getImageUrl(path: string): string {
  if (path.startsWith('http') || path.startsWith('file://')) return path;
  const serverUrl = getBaseURL().replace('/api', '');
  return `${serverUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getPosterName(task: Task): string {
  if (typeof task.posterId === 'object' && task.posterId !== null && 'firstName' in task.posterId) {
    const poster = task.posterId;
    const first = poster.firstName || '';
    const last = poster.lastName || '';
    if (first || last) return [first, last].filter(Boolean).join(' ');
    return poster.email || 'Anonymous';
  }
  return 'Anonymous';
}

function getTypeLabel(type: string): string {
  return type.replace('_', ' ').toUpperCase();
}

function formatLocation(location: string, showFullAddress: boolean = false): string {
  if (!location) return '';
  
  // If task is accepted, show full address
  if (showFullAddress) {
    return location;
  }
  
  // Handle custom location (if it doesn't contain ">")
  if (!location.includes('>')) {
    return location;
  }
  
  // Parse format: "Governorate > Area, Block X, Street Y, Avenue Z, House/Flat W"
  const parts = location.split(',');
  const areaPart = parts[0] || '';
  
  // Extract area (after ">")
  const areaMatch = areaPart.match(/>\s*(.+)/);
  const area = areaMatch ? areaMatch[1].trim() : '';
  
  // Extract block number
  const blockMatch = location.match(/Block\s+(\d+)/i);
  const block = blockMatch ? blockMatch[1] : '';
  
  // Return "Area, Block X" or just "Area" if no block
  if (area && block) {
    return `${area}, Block ${block}`;
  } else if (area) {
    return area;
  }
  
  // Fallback to original location if parsing fails
  return location;
}

export interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const { theme, typography } = useTheme();
  const posterName = getPosterName(task);
  const hasImage = task.pictures && task.pictures.length > 0;
  const firstImage = hasImage ? getImageUrl(task.pictures[0]) : null;
  
  // Check if task is accepted (has assigned worker or is in progress)
  const isAccepted = !!task.assignedWorkerId || task.status === 'IN_PROGRESS';

  return (
    <View
      style={[
        styles.shadowWrapper,
        Platform.OS === 'ios' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          overflow: 'visible', // Critical for iOS shadows to show
        },
        Platform.OS === 'android' && {
          elevation: 12,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
      <View style={styles.cardContent}>
        {/* Thumbnail on the left */}
        <View style={styles.thumbnailContainer}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={styles.thumbnail}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderImage, { backgroundColor: theme.border }]}>
              <Text style={[styles.placeholderText, { color: theme.textMuted }]}>No Image</Text>
            </View>
          )}
        </View>

        {/* Content on the right */}
        <View style={styles.contentContainer}>
          {/* Category/Type */}
          <Text
            style={[
              styles.category,
              {
                color: theme.textMuted,
                fontSize: typography.small.fontSize,
              },
            ]}
          >
            {getTypeLabel(task.type)}
          </Text>

          {/* Title/Headline */}
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

          {/* Author and Date */}
          <Text
            style={[
              styles.meta,
              {
                color: theme.textMuted,
                fontSize: typography.small.fontSize,
              },
            ]}
          >
            By {posterName} · {formatDate(task.createdAt as string)}
          </Text>

          {/* Money, Points, and Location info */}
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoText,
                {
                  color: theme.textSecondary,
                  fontSize: typography.caption.fontSize,
                },
              ]}
            >
              {task.money} KWD
            </Text>
            <Text
              style={[
                styles.infoSeparator,
                {
                  color: theme.textMuted,
                  fontSize: typography.caption.fontSize,
                },
              ]}
            >
              ·
            </Text>
            <View
              style={[
                styles.pointsBadge,
                {
                  backgroundColor: theme.info || theme.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.pointsText,
                  {
                    color: '#FFFFFF',
                    fontSize: typography.caption.fontSize,
                  },
                ]}
              >
                {task.points} pts
              </Text>
            </View>
            <Text
              style={[
                styles.infoSeparator,
                {
                  color: theme.textMuted,
                  fontSize: typography.caption.fontSize,
                },
              ]}
            >
              ·
            </Text>
            <Text
              style={[
                styles.infoText,
                {
                  color: theme.textSecondary,
                  fontSize: typography.caption.fontSize,
                },
              ]}
              numberOfLines={1}
            >
              {formatLocation(task.location, isAccepted)}
            </Text>
          </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
    );
  }

const styles = StyleSheet.create({
  shadowWrapper: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  thumbnailContainer: {
    width: 100,
    height: 100,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  category: {
    fontWeight: '500',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  meta: {
    marginBottom: spacing.xs,
    fontWeight: '400',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  infoText: {
    fontWeight: '500',
  },
  infoSeparator: {
    fontWeight: '400',
  },
  pointsBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  pointsText: {
    fontWeight: '600',
  },
});


