import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Button from '@/components/ui/Button';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from "@/constants/theme";
import Card from "@/components/ui/Card";
import TaskFilters from "@/components/TaskFilters";
import {
  getTasksApi,
  type Task,
  type GetTasksParams,
  type GetTasksResponse,
} from "@/src/api/taskCalls";

function TaskCard({ task, onPress }: { task: Task; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={styles.pointsPill}>
            <Text style={styles.pointsText}>{task.points} pts</Text>
          </View>
        </View>

        <Text style={styles.desc} numberOfLines={2}>
          {task.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>💰 {task.money} KWD</Text>
          <Text style={styles.metaText} numberOfLines={1}>
            📍 {task.location}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetTasksParams>({});

  const { data, isLoading, isRefetching, refetch, error } =
    useQuery<GetTasksResponse>({
      queryKey: ["tasks", "open", filters],
      queryFn: async () => {
        const params: GetTasksParams = {
          ...filters,
          status: "OPEN", // Always show OPEN tasks in browse screen
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

  const handleFiltersChange = (newFilters: GetTasksParams) => {
    setFilters(newFilters);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Browse Tasks</Text>
            <Text style={styles.headerSubtitle}>
              Open tasks available ({tasks.length})
            </Text>
          </View>
          <TaskFilters filters={filters} onApply={handleFiltersChange} />
        </View>
      </View>

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Failed to load tasks</Text>
          <Text style={styles.errorText}>
            {(error as Error).message || "Unknown error"}
          </Text>
          <Text style={styles.errorHint} onPress={() => refetch()}>
            Tap to retry
          </Text>
          <View style={styles.buttonRow}>
          <Button
            title="Create Task"
            onPress={() => {
              // @ts-ignore - Expo Router path
              router.push('/(main)/create-task');
            }}
            style={{ ...styles.button, ...styles.buttonHalf }}
          />
          <Button
            title="Explore Tasks"
            onPress={() => router.push('/(main)/(tabs)/explore')}
            variant="secondary"
            style={{ ...styles.button, ...styles.buttonHalf }}
          />
        </View>
        </Card>
      ) : null}

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
        initialNumToRender={8}
        windowSize={10}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {isLoading ? "Loading..." : "No open tasks right now"}
            </Text>
            <Text style={styles.emptySub}>
              {isLoading ? "Please wait" : "Pull to refresh"}
            </Text>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.secondary,
    marginTop: spacing.xs,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  card: {
    marginBottom: spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
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
    fontWeight: "700",
  },
  desc: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",},
  button: {
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
  stepContainer: {
    gap: spacing.md,
  },
  metaText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },

  empty: {
    paddingTop: spacing.xl,
    alignItems: "center",
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

  errorCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  errorHint: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "700",
  },
});
