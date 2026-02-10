import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing } from "@/constants/Karwa.theme";
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
        try {
          const params: GetTasksParams = { ...filters, status: "OPEN" };
          const result = await getTasksApi(params);
          if (Platform.OS === "android") {
            console.log("Tasks fetched successfully on Android:", result?.data?.tasks?.length || 0);
          }
          return result;
        } catch (err: any) {
          // Better error handling for Android
          console.error(`Error fetching tasks on ${Platform.OS}:`, err);
          
          // If it's a 401 error, return empty result instead of throwing (tasks endpoint should work without auth now)
          if (err?.response?.status === 401) {
            console.warn("Got 401 but tasks should be public - returning empty result");
            return { success: true, data: { tasks: [] } } as GetTasksResponse;
          }
          
          if (Platform.OS === "android") {
            console.error("Android error details:", {
              message: err?.message,
              status: err?.response?.status,
              statusText: err?.response?.statusText,
              data: err?.response?.data,
            });
          }
          throw err;
        }
      },
      refetchOnMount: "always",
      retry: (failureCount, error) => {
        // Retry up to 2 times, but not for 401 errors (shouldn't happen now, but just in case)
        if (failureCount < 2 && (error as any)?.response?.status !== 401) {
          return true;
        }
        return false;
      },
      retryDelay: 1000, // Wait 1 second between retries
      // Allow fetching tasks even without authentication
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
        showBranding={false}
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
                title="Refresh"
                onPress={() => refetch()}
                variant="secondary"
                style={styles.buttonFull}
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
            actionLabel={undefined}
            onAction={undefined}
          />
        }
      />
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
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
  buttonFull: {
    flex: 1,
  },
});
