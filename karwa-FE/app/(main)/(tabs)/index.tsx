import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, typography } from "@/constants/theme";
import Card from "@/components/ui/Card";
import TaskFilters from "@/components/TaskFilters";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
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
      refetchOnMount: 'always', // Refetch when screen comes into focus
    });

  const tasks: Task[] = useMemo(() => {
    if (!data?.success || !data.data?.tasks) {
      return [];
    }
    return data.data.tasks.filter((t) => t.status === "OPEN");
  }, [data]);

  // Refetch tasks when screen comes into focus (e.g., returning from create-task)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleFiltersChange = (newFilters: GetTasksParams) => {
    setFilters(newFilters);
  };

  return (
    <WatermarkBackground style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Browse Tasks</Text>
            <Text style={styles.headerSubtitle}>
              {tasks.length} open tasks available
            </Text>
          </View>
          <TaskFilters filters={filters} onApply={handleFiltersChange} />
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
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
                  router.push("/(main)/create-task");
                }}
                style={styles.buttonHalf}
              />
              <Button
                title="Refresh"
                onPress={() => refetch()}
                variant="secondary"
                style={styles.buttonHalf}
              />
            </View>
          </Card>
        </View>
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
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
          />
        }
        initialNumToRender={10}
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {isLoading ? "Loading..." : "No open tasks"}
            </Text>
            <Text style={styles.emptySub}>
              {isLoading ? "Please wait" : "Pull down to refresh"}
            </Text>
          </View>
        }
      />
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.title,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  card: {
    marginBottom: spacing.sm,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
    backgroundColor: colors.primarySoft,
  },
  pointsText: {
    ...typography.small,
    color: colors.blueDark,
    fontWeight: "700",
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },

  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },

  empty: {
    paddingTop: spacing.xl * 2,
    alignItems: "center",
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySub: {
    ...typography.body,
    color: colors.textSecondary,
  },

  errorContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  errorCard: {
    marginBottom: spacing.sm,
  },
  errorTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  errorHint: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});
