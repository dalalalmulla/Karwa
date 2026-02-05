import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, shadows } from "@/constants/Karwa.theme";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TaskCard from "@/components/TaskCard";
import TaskFilters from "@/components/TaskFilters";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import AppHeader from "@/components/ui/AppHeader";
import EmptyState from "@/components/ui/EmptyState";
import {
  getTasksApi,
  type Task,
  type GetTasksParams,
  type GetTasksResponse,
} from "@/src/api/taskCalls";

export default function HomeScreen() {
  const router = useRouter();
  const { theme, typography } = useTheme();
  const [filters, setFilters] = useState<GetTasksParams>({});

  const { data, isLoading, isRefetching, refetch, error } =
    useQuery<GetTasksResponse>({
      queryKey: ["tasks", "open", filters],
      queryFn: async () => {
        const params: GetTasksParams = { ...filters, status: "OPEN" };
        return await getTasksApi(params);
      },
      refetchOnMount: "always",
    });

  const tasks: Task[] = useMemo(() => {
    if (!data?.success || !data.data?.tasks) return [];
    return data.data.tasks.filter((t) => t.status === "OPEN");
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleFiltersChange = (newFilters: GetTasksParams) => {
    setFilters(newFilters);
  };

  return (
    <WatermarkBackground>
      <AppHeader
        title="Browse Tasks"
        subtitle={`${tasks.length} open tasks available`}
        rightElement={
          <TaskFilters filters={filters} onApply={handleFiltersChange} />
        }
        showBranding
      />

      {error ? (
        <View style={styles.errorContainer}>
          <Card
            style={[styles.errorCard, { backgroundColor: theme.surface }]}
            variant="elevated"
          >
            <Text
              style={[
                styles.errorTitle,
                {
                  color: theme.text,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Failed to load tasks
            </Text>
            <Text
              style={[
                styles.errorText,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
              {(error as Error).message || "Unknown error"}
            </Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text
                style={[
                  styles.errorHint,
                  {
                    color: theme.primary,
                    fontSize: typography.body.fontSize,
                  },
                ]}
              >
                Tap to retry
              </Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <Button
                title="Create Task"
                onPress={() => router.push("/(main)/create-task")}
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
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.surface}
          />
        }
        initialNumToRender={10}
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState
            title={isLoading ? "Loading tasks..." : "No open tasks"}
            message={
              isLoading
                ? "Please wait while we fetch tasks."
                : "There are no tasks right now. Pull down to refresh or create one!"
            }
            actionLabel={isLoading ? undefined : "Create New Task"}
            onAction={
              isLoading
                ? undefined
                : () => router.push("/(main)/create-task")
            }
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: theme.primary, ...shadows.medium },
        ]}
        onPress={() => router.push("/(main)/create-task")}
        activeOpacity={0.8}
        accessibilityLabel="Create new task"
      >
        <Text style={[styles.fabText, { color: theme.white }]}>+</Text>
      </TouchableOpacity>
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.xl + 56,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: {
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
  errorContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  errorCard: {
    marginBottom: spacing.sm,
  },
  errorTitle: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  errorText: {
    marginBottom: spacing.sm,
  },
  errorHint: {
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
});
