import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import WatermarkBackground from '@/components/ui/WatermarkBackground';
import { getTasks } from '@/src/api/tasks';
import type { TaskType, TaskStatus } from '@/src/types/taskTypes';

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
];
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function TasksListScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<TaskType | undefined>();
  const [status] = useState<TaskStatus>('OPEN');

  // Fetch tasks
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['tasks', status, selectedType],
    queryFn: () => getTasks({status, type: selectedType}),
  });

  const tasks = tasksData || [];

  const handleTaskPress = (taskId: string) => {
    router.push(`/(main)/task/${taskId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: TaskType) => {
    switch (type) {
      case 'indoor':
        return colors.primary;
      case 'outdoor':
        return colors.success;
      
      default:
        return colors.secondary;
    }
  };

  if (isLoading) {
    return (
      <WatermarkBackground style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </WatermarkBackground>
    );
  }

  if (error) {
    return (
      <WatermarkBackground style={styles.centerContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={colors.danger} />
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Failed to load tasks'}
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </WatermarkBackground>
    );
  }

  return (
    <WatermarkBackground style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Tasks</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter by Type */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          onPress={() => setSelectedType(undefined)}
          style={[
            styles.filterChip,
            !selectedType && styles.filterChipActive,
          ]}>
          <Text
            style={[
              styles.filterText,
              !selectedType && styles.filterTextActive,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        {TASK_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            onPress={() => setSelectedType(type.value)}
            style={[
              styles.filterChip,
              selectedType === type.value && styles.filterChipActive,
            ]}>
            <Text
              style={[
                styles.filterText,
                selectedType === type.value && styles.filterTextActive,
              ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tasks List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }>
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="tray" size={64} color={colors.gray400} />
            <Text style={styles.emptyText}>No tasks available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new opportunities
            </Text>
          </View>
        ) : (
          tasks.map((task) => {
            const posterName =
              typeof task.posterId === 'object' && 
              task.posterId !== null && 
              'firstName' in task.posterId &&
              task.posterId.firstName
                ? `${task.posterId.firstName} ${task.posterId.lastName || ''}`.trim()
                : 'Anonymous';

            return (
              <TouchableOpacity
                key={task._id}
                onPress={() => handleTaskPress(task._id)}
                activeOpacity={0.7}>
                <Card style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskTitleContainer}>
                      <Text style={styles.taskTitle} numberOfLines={2}>
                        {task.title}
                      </Text>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: hexToRgba(getTypeColor(task.type as TaskType), 0.2) },
                        ]}>
                        <Text
                          style={[
                            styles.typeText,
                            { color: getTypeColor(task.type as TaskType) as string },
                          ]}>
                          {task.type.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>

                  <View style={styles.taskDetails}>
                    <View style={styles.detailRow}>
                      <IconSymbol
                        name="dollarsign.circle.fill"
                        size={20}
                        color={colors.success}
                      />
                      <Text style={styles.detailText}>{task.money} KWD</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconSymbol
                        name="star.fill"
                        size={20}
                        color={colors.warning}
                      />
                      <Text style={styles.detailText}>{task.points} pts</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconSymbol
                        name="location.fill"
                        size={20}
                        color={colors.danger}
                      />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {task.location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.taskFooter}>
                    <View style={styles.posterInfo}>
                      <IconSymbol name="person.fill" size={16} color={colors.secondary} />
                      <Text style={styles.posterText}>{posterName}</Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(task.createdAt)}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.secondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  filterContainer: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.secondary,
  },
  taskCard: {
    marginBottom: spacing.md,
  },
  taskHeader: {
    marginBottom: spacing.sm,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  taskTitle: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    ...typography.small,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskDescription: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  taskDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    minWidth: '30%',
  },
  detailText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  posterText: {
    ...typography.caption,
    color: colors.secondary,
  },
  dateText: {
    ...typography.small,
    color: colors.secondary,
  },
});

