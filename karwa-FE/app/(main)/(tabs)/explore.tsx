import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography } from '@/constants/theme';
import Card from '@/components/ui/Card';
import { getTasksApi, type Task, type GetTasksParams, type GetTasksResponse } from '@/src/api/taskCalls';

function TaskCard({ task, onPress }: { task: Task; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.taskCard}>
        <View style={styles.taskCardTopRow}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={styles.pointsPill}>
            <Text style={styles.pointsText}>{task.points} pts</Text>
          </View>
        </View>

        <Text style={styles.taskDesc} numberOfLines={2}>
          {task.description}
        </Text>

        <View style={styles.taskMetaRow}>
          <Text style={styles.taskMetaText}>💰 {task.money} KWD</Text>
          <Text style={styles.taskMetaText} numberOfLines={1}>
            📍 {task.location}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [filters] = useState<GetTasksParams>({});

  const { data, isLoading, isRefetching, refetch, error } =
    useQuery<GetTasksResponse>({
      queryKey: ["tasks", "explore", filters],
      queryFn: async () => {
        const params: GetTasksParams = {
          ...filters,
          status: "OPEN", // Show all OPEN tasks
        };
        return await getTasksApi(params);
      },
    });

  // Extract tasks from response
  const tasks: Task[] = useMemo(() => {
    if (!data?.success || !data.data?.tasks) {
      return [];
    }
    return data.data.tasks.filter((t) => t.status === "OPEN");
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Failed to load tasks</Text>
        <Text style={styles.errorText}>
          {(error as Error).message || "Unknown error"}
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Tasks</Text>
        <Text style={styles.subtitle}>
          {tasks.length} open task{tasks.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item._id)}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push(`/(main)/task/${item._id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No open tasks right now</Text>
            <Text style={styles.emptySub}>Pull to refresh</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.secondary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  taskCard: {
    marginBottom: spacing.md,
  },
  taskCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  taskTitle: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
  },
  pointsPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  pointsText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  taskDesc: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskMetaText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  errorTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  empty: {
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySub: {
    ...typography.body,
    color: colors.secondary,
  },
});
