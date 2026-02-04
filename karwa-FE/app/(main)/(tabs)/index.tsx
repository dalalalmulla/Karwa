import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
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
} from "@/src/api/taskCalls";

type TasksResponse = {
  success: boolean;
  data?: { tasks: Task[] };
  error?: string;
};

function TaskCard({ task }: { task: Task }) {
  return (
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
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetTasksParams>({});

  const { data, isLoading, isRefetching, refetch, error } =
    useQuery<TasksResponse>({
      queryKey: ["tasks", "open", filters],
      queryFn: () => getTasksApi(filters) as unknown as Promise<TasksResponse>,
    });

  // الباك يرجّع OPEN افتراضيًا، بس نخلي فلتر إضافي للأمان
  const tasks: Task[] = useMemo(() => {
    const list = data?.success ? data.data?.tasks ?? [] : [];
    return list.filter((t) => t.status === "OPEN");
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
            onPress={() => console.log('Explore tasks')}
            variant="secondary"
            style={{ ...styles.button, ...styles.buttonHalf }}
          />
        </View>
        </Card>
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item._id)}
        renderItem={({ item }) => <TaskCard task={item} />}
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
