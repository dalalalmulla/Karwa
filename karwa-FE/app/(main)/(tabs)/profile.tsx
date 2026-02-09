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
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
} from "@/src/api/notificationCalls";
import type { Task } from "@/src/types/taskTypes";
import type { Notification } from "@/src/types/notificationTypes";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import AppHeader from "@/components/ui/AppHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
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

  // Fetch all tasks to filter for assigned tasks
  const {
    data: allTasksData,
    isRefetching: isAllTasksRefetching,
    refetch: refetchAllTasks,
    isLoading: isAllTasksLoading,
  } = useQuery<TasksResponse>({
    queryKey: ["all-tasks-for-profile"],
    queryFn: () => getTasksApi({}) as unknown as Promise<TasksResponse>,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    enabled: !!token,
  });

  const {
    data: notificationsData,
    isRefetching: isNotificationsRefetching,
    refetch: refetchNotifications,
    isLoading: isNotificationsLoading,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotificationsApi({ limit: 50 }),
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    enabled: !!token,
  });

  const notifications: Notification[] = useMemo(() => {
    return notificationsData?.success
      ? (notificationsData.data?.notifications ?? [])
      : [];
  }, [notificationsData]);

  const unreadCount = notificationsData?.data?.unreadCount ?? 0;

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
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
    const userId = user?._id ? String(user._id) : null;
    if (!userId) return [];

    const postedTasks = postedTasksData?.success ? (postedTasksData.data?.tasks ?? []) : [];
    const allTasks = allTasksData?.success ? (allTasksData.data?.tasks ?? []) : [];

    // Filter tasks where user is assigned worker
    const assignedTasks = allTasks.filter((task) => {
      if (!task.assignedWorkerId) return false;
      const workerId = typeof task.assignedWorkerId === "string" 
        ? task.assignedWorkerId 
        : (task.assignedWorkerId as any)?._id || task.assignedWorkerId;
      return String(workerId) === userId;
    });

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
    });

    return uniqueTasks;
  }, [postedTasksData, allTasksData, user]);

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

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleRefresh = () => {
    refetchPostedTasks();
    refetchAllTasks();
    refetchNotifications();
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

  const renderNotification = ({ item }: { item: Notification }) => (
    <Card
      variant="outlined"
      padding="medium"
      style={!item.read ? { borderLeftWidth: 3, borderLeftColor: theme.primary } : undefined}
    >
      <View style={styles.notifTopRow}>
        <Text
          style={[
            styles.notifTitle,
            { color: theme.text, fontSize: typography.body.fontSize },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {!item.read && <Badge label="NEW" variant="primary" size="small" />}
      </View>
      <Text
        style={[
          styles.notifMsg,
          {
            color: theme.textSecondary,
            fontSize: typography.caption.fontSize,
          },
        ]}
        numberOfLines={2}
      >
        {item.message}
      </Text>
      <Text
        style={[
          styles.notifDate,
          { color: theme.textMuted, fontSize: typography.small.fontSize },
        ]}
      >
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </Card>
  );

  const isRefreshing = isPostedTasksRefetching || isAllTasksRefetching || isNotificationsRefetching;
  const isLoading = isPostedTasksLoading || isAllTasksLoading || isNotificationsLoading;

  const ListHeader = () => (
    <>
      {/* Header Row */}
      <AppHeader
        title="Profile"
        showBranding
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
          {unreadCount > 0 && (
            <Badge
              label={`${unreadCount} unread`}
              variant="primary"
              size="small"
              style={styles.unreadBadge}
            />
          )}
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

      {/* Notifications Header */}
      <View style={styles.notifHeader}>
        <Text
          style={[
            styles.notifHeaderTitle,
            {
              color: theme.textHeading,
              fontSize: typography.heading.fontSize,
            },
          ]}
        >
          Notifications
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.markReadText,
                { color: theme.primary, fontSize: typography.caption.fontSize },
              ]}
            >
              {markAllReadMutation.isPending ? "..." : "Mark all read"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </>
  );

  return (
    <WatermarkBackground>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
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
          <EmptyState
            title={isLoading ? "Loading..." : "No notifications"}
            message={
              isLoading ? "Please wait" : "You're all caught up!"
            }
          />
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
  unreadBadge: {
    marginTop: spacing.sm,
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

  /* Notifications */
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  notifHeaderTitle: {
    fontWeight: "600",
  },
  markReadText: {
    fontWeight: "600",
  },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  notifTitle: {
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
  },
  notifMsg: {
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  notifDate: {},
  errorText: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
});
