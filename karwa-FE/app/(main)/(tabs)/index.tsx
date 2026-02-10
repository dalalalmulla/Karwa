import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/src/context/ThemeContext";
import { useAuth } from "@/src/context/AuthContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TaskCard from "@/components/TaskCard";
import TaskFilters from "@/components/TaskFilters";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import AppHeader from "@/components/ui/AppHeader";
import EmptyState from "@/components/ui/EmptyState";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  getTasksApi,
  type Task,
  type GetTasksParams,
  type GetTasksResponse,
} from "@/src/api/taskCalls";
import { deleteTask } from "@/src/api/tasks";

export default function HomeScreen() {
  const router = useRouter();
  const { theme, typography } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<GetTasksParams>({});
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // Fetch marketplace tasks (OPEN) - always fetch
  const { data: marketplaceData, isLoading: isLoadingMarketplace } = useQuery<GetTasksResponse>({
    queryKey: ["tasks", "marketplace", filters],
    queryFn: async () => {
      try {
        // Fetch OPEN tasks for marketplace
        const params: GetTasksParams = { ...filters, status: "OPEN" };
        return await getTasksApi(params);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          return { success: true, data: { tasks: [] } } as GetTasksResponse;
        }
        throw err;
      }
    },
    retry: (failureCount, error) => {
      if (failureCount < 2 && (error as any)?.response?.status !== 401) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });

  // Fetch user's own tasks (all statuses) if logged in
  const { data: myTasksData, isLoading: isLoadingMyTasks } = useQuery<GetTasksResponse>({
    queryKey: ["tasks", "my-tasks", user?._id, filters],
    queryFn: async () => {
      try {
        // Fetch all tasks where user is the poster (no status filter)
        const params: GetTasksParams = { ...filters, posterId: "me" };
        return await getTasksApi(params);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          return { success: true, data: { tasks: [] } } as GetTasksResponse;
        }
        throw err;
      }
    },
    enabled: !!user?._id, // Only fetch if user is logged in
    retry: (failureCount, error) => {
      if (failureCount < 2 && (error as any)?.response?.status !== 401) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });

  // Combine both data sources
  const tasks: Task[] = useMemo(() => {
    const marketplaceTasks = marketplaceData?.data?.tasks || [];
    const myTasks = myTasksData?.data?.tasks || [];
    
    // Combine and deduplicate by task ID
    const allTasks = [...marketplaceTasks, ...myTasks];
    const uniqueTasks = Array.from(
      new Map(allTasks.map((task) => [task._id, task])).values()
    );
    
    // Filter: Show OPEN tasks for everyone, show other statuses only if user is creator
    return uniqueTasks.filter((t) => {
      const status = String(t.status || "").toUpperCase();
      // Always show OPEN tasks (marketplace)
      if (status === "OPEN") return true;
      // Show other statuses only if user is the creator (from my tasks query)
      if (user?._id) {
        const userId = String(user._id).trim();
        const posterId = typeof t.posterId === "object" && t.posterId !== null && "_id" in t.posterId
          ? String(t.posterId._id).trim()
          : String(t.posterId).trim();
        return userId === posterId;
      }
      return false;
    });
  }, [marketplaceData, myTasksData, user]);

  const isLoading = isLoadingMarketplace || (!!user?._id && isLoadingMyTasks);
  const isRefetching = isLoadingMarketplace || (!!user?._id && isLoadingMyTasks);

  // Refetch function
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }, [queryClient]);

  const error = marketplaceData?.success === false ? marketplaceData : undefined;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleFiltersChange = (newFilters: GetTasksParams) => {
    setFilters(newFilters);
  };

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      refetch();
    },
    onError: (err: Error) => {
      Alert.alert("Delete failed", err.message || "Could not delete task");
    },
  });

  // Check if user is the task creator
  const isTaskCreator = (task: Task): boolean => {
    if (!user?._id) return false;
    const userId = String(user._id).trim();
    const posterId = typeof task.posterId === "object" && task.posterId !== null && "_id" in task.posterId
      ? String(task.posterId._id).trim()
      : String(task.posterId).trim();
    return userId === posterId;
  };

  const handleDelete = (task: Task) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(task._id),
        },
      ]
    );
  };

  // Render swipeable delete action
  const renderRightActions = (task: Task) => {
    if (!isTaskCreator(task)) return null;

    return (
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.danger }]}
          onPress={() => {
            swipeableRefs.current.get(task._id)?.close();
            handleDelete(task);
          }}
          activeOpacity={0.7}
        >
          <AntDesign name="delete" size={24} color="#FFFFFF" />
          <Text style={[styles.deleteText, { color: "#FFFFFF" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
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
        renderItem={({ item }) => {
          const isCreator = isTaskCreator(item);
          
          if (!isCreator) {
            // Non-creators can't swipe to delete
            return (
              <TaskCard
                task={item}
                onPress={() => router.push(`/(main)/task/${item._id}`)}
              />
            );
          }

          // Creators can swipe to delete
          return (
            <Swipeable
              ref={(ref) => {
                if (ref) {
                  swipeableRefs.current.set(item._id, ref);
                } else {
                  swipeableRefs.current.delete(item._id);
                }
              }}
              renderRightActions={() => renderRightActions(item)}
              overshootRight={false}
            >
              <TaskCard
                task={item}
                onPress={() => router.push(`/(main)/task/${item._id}`)}
              />
            </Swipeable>
          );
        }}
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
  deleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  deleteText: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: "600",
  },
});
