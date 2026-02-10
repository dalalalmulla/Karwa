import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius, shadows } from "@/constants/Karwa.theme";
import { getTasksApi } from "@/src/api/taskCalls";
import type { Task } from "@/src/types/taskTypes";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import AppHeader from "@/components/ui/AppHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import TaskCard from "@/components/TaskCard";
import { getCurrentUser } from "@/src/api/auth";

type TasksResponse = {
  success: boolean;
  data?: { tasks: Task[] };
  error?: string;
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme, typography } = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout, token } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch tasks where user is the poster
  const {
    data: postedTasksData,
    isRefetching: isPostedTasksRefetching,
    refetch: refetchPostedTasks,
    isLoading: isPostedTasksLoading,
  } = useQuery<TasksResponse>({
    queryKey: ["my-posted-tasks"],
    queryFn: () => getTasksApi({ posterId: "me" }) as unknown as Promise<TasksResponse>,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    enabled: !!token,
  });

  // Fetch tasks where user is the assigned worker
  const {
    data: assignedTasksData,
    isRefetching: isAssignedTasksRefetching,
    refetch: refetchAssignedTasks,
    isLoading: isAssignedTasksLoading,
  } = useQuery<TasksResponse>({
    queryKey: ["my-assigned-tasks"],
    queryFn: () => getTasksApi({ assignedWorkerId: "me" }) as unknown as Promise<TasksResponse>,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    enabled: !!token,
  });


  useEffect(() => {
    if (!token) {
      router.replace("/(auth)/login");
    }
  }, [token, router]);

  const {
    data: userData,
    isLoading: currentUserLoading,
    error,
    refetch : refetchUser,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: 1,
    enabled: !!token,
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Combine tasks where user is poster or assigned worker
  const tasks: Task[] = useMemo(() => {
    const postedTasks = postedTasksData?.success ? (postedTasksData.data?.tasks ?? []) : [];
    const assignedTasks = assignedTasksData?.success ? (assignedTasksData.data?.tasks ?? []) : [];

    // Combine and deduplicate by task ID
    const allUserTasks = [...postedTasks, ...assignedTasks];
    const uniqueTasks = Array.from(
      new Map(allUserTasks.map((task) => [task._id, task])).values()
    );

    // Debug logging
    console.log("Profile tasks:", {
      postedCount: postedTasks.length,
      assignedCount: assignedTasks.length,
      totalUnique: uniqueTasks.length,
      statusBreakdown: uniqueTasks.reduce((acc, t) => {
        const status = String(t.status || "").toUpperCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      allTasks: uniqueTasks.map(t => ({
        id: t._id,
        title: t.title,
        status: t.status,
        assignedWorkerId: t.assignedWorkerId,
      })),
    });

    return uniqueTasks;
  }, [postedTasksData, assignedTasksData]);

  const stats = tasks.reduce(
    (acc, task) => {
      // Normalize status to uppercase for case-insensitive comparison
      const status = String(task.status || "").toUpperCase().trim();
      if (status === "COMPLETED") acc.completed += 1;
      else if (status === "IN_PROGRESS") acc.inProgress += 1;
      else if (status === "OPEN") acc.open += 1;
      else if (status === "CANCELLED") acc.cancelled += 1;
      return acc;
    },
    { completed: 0, inProgress: 0, open: 0, cancelled: 0 }
  );

  const handleRefresh = () => {
    refetchPostedTasks();
    refetchAssignedTasks();
    refetchUser();
  };

  const displayName = useMemo(() => {
    const anyUser = user as {
      name?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    if (anyUser?.firstName && anyUser?.lastName) {
      return `${anyUser.firstName} ${anyUser.lastName}`;
    }
    return anyUser?.name ?? anyUser?.email ?? "User";
  }, [user]);

  const userRating = useMemo(() => {
    return userData?.user?.ratingAverage ?? null;
  }, [userData]);

  const isRefreshing = isPostedTasksRefetching || isAssignedTasksRefetching;
  const isLoading = isPostedTasksLoading || isAssignedTasksLoading;

  // Filter completed tasks
  const completedTasks = useMemo(() => {
    return tasks.filter((task) => {
      const status = String(task.status || "").toUpperCase().trim();
      return status === "COMPLETED";
    });
  }, [tasks]);

  const ListHeader = () => (
    <>
      {/* Header Row */}
      <AppHeader
        title="Profile"
        showBranding={false}
        rightElement={
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: handleLogout,
                },
              ]);
            }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <AntDesign name="logout" size={20} color={theme.primary} />
            )}
          </TouchableOpacity>
        }
      />

      {/* Profile Info Card */}
      <View style={styles.profileSection}>
        <Card variant="elevated" padding="large">
          <Text
            style={[
              styles.name,
              {
                color: theme.textTitle,
                fontSize: typography.title.fontSize,
              },
            ]}
          >
            {displayName}
          </Text>
          <Text
            style={[
              styles.ratingText,
              {
                color: theme.textSecondary,
                fontSize: typography.body.fontSize,
              },
            ]}
          >
            {userRating !== null
              ? `⭐ ${userRating.toFixed(1)}`
              : "⭐ No rating yet"}
          </Text>
        </Card>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: "My Open", value: stats.open, variant: "info" as const },
          { label: "Active", value: stats.inProgress, variant: "warning" as const },
          { label: "Done", value: stats.completed, variant: "success" as const },
          { label: "Cancelled", value: stats.cancelled, variant: "danger" as const },
        ].map((stat) => (
          <Card key={stat.label} variant="default" padding="small" style={styles.statCard}>
            <Text
              style={[
                styles.statNumber,
                {
                  color: theme.primary,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              {stat.value}
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: theme.textMuted,
                  fontSize: typography.small.fontSize,
                },
              ]}
            >
              {stat.label}
            </Text>
          </Card>
        ))}
      </View>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <View style={styles.completedSection}>
          <Card variant="default" padding="medium">
            <Text
              style={[
                styles.completedTitle,
                {
                  color: theme.textTitle,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Completed Tasks ({completedTasks.length})
            </Text>
            <Text
              style={[
                styles.completedSubtitle,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
              Tap on a task to view details and rate
            </Text>
          </Card>
        </View>
      )}
    </>
  );

  return (
    <WatermarkBackground>
      <FlatList
        data={completedTasks}
        keyExtractor={(item) => String(item._id)}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push(`/(main)/task/${item._id}`)}
          />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              title="No completed tasks"
              message="Tasks you complete will appear here"
            />
          </View>
        }
      />
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xl,
  },
  logoutButton: {
    padding: spacing.xs,
  },

  /* Profile */
  profileSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  name: {
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  ratingText: {
    marginBottom: spacing.xs,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontWeight: "700",
  },
  statLabel: {
    marginTop: spacing.xs,
  },
  errorText: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  completedSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  completedTitle: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  completedSubtitle: {
    marginTop: spacing.xs,
  },
  emptyContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
});
