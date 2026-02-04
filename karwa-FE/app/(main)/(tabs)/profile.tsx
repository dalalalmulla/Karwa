import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from 'expo-router';

import { useAuth } from "@/src/context/AuthContext";
import { getTasksApi } from "@/src/api/taskCalls";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
} from "@/src/api/notificationCalls";
import type { Task } from "@/src/types/taskTypes";
import type { Notification } from "@/src/types/notificationTypes";
import { colors, spacing, typography } from "@/constants/theme";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import { getCurrentUser } from '@/src/api/auth';


type TasksResponse = {
  success: boolean;
  data?: { tasks: Task[] };
  error?: string;
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout, token } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    data: tasksData,
    isRefetching: isTasksRefetching,
    refetch: refetchTasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery<TasksResponse>({
    queryKey: ["my-tasks"],
    queryFn: () => getTasksApi({}) as unknown as Promise<TasksResponse>,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
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
  });

  const notifications: Notification[] = useMemo(() => {
    return notificationsData?.success
      ? notificationsData.data?.notifications ?? []
      : [];
  }, [notificationsData]);

  const unreadCount = notificationsData?.data?.unreadCount ?? 0;

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });


  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      console.log('No token found, redirecting to login');
      router.replace('/(auth)/login');
    }
  }, [token, router]);

  const { data, isLoading: currentUserLoading, error, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: 1,
    enabled: !!token, // Only run query if token exists
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const tasks: Task[] = useMemo(() => {
    return tasksData?.success ? tasksData.data?.tasks ?? [] : [];
  }, [tasksData]);

  const stats = tasks.reduce(
    (acc, task) => {
      if (task.status === "COMPLETED") acc.completed += 1;
      else if (task.status === "IN_PROGRESS") acc.inProgress += 1;
      else if (task.status === "OPEN") acc.open += 1;
      else if (task.status === "CANCELLED") acc.cancelled += 1;
      return acc;
    },
    { completed: 0, inProgress: 0, open: 0, cancelled: 0 }
  );

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleRefresh = () => {
    refetchTasks();
    refetchNotifications();
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
    const anyUser = user as { rating?: number };
    return anyUser?.rating ?? null;
  }, [user]);

  const renderNotification = ({ item }: { item: Notification }) => {
    return (
      <View style={[styles.notifItem, !item.read && styles.notifUnread]}>
        <View style={styles.notifTopRow}>
          <Text style={styles.notifTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && <Text style={styles.badge}>NEW</Text>}
        </View>
        <Text style={styles.notifMsg} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notifDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    );
  };

  const isRefreshing = isTasksRefetching || isNotificationsRefetching;
  const isLoading = isTasksLoading || isNotificationsLoading;

  const ListHeader = () => (
    <>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.rating}>
            {userRating !== null ? `⭐ ${userRating.toFixed(1)}` : "⭐ No rating yet"}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadPill}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.open}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.cancelled}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>

      {/* Notifications Header */}
      <View style={styles.notifHeader}>
        <Text style={styles.notifHeaderTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.markReadText}>
              {markAllReadMutation.isPending ? "..." : "Mark all read"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {tasksError && (
        <Text style={styles.errorText}>
          {(tasksError as Error).message || "Failed to load"}
        </Text>
      )}
    </>
  );

  return (
    <WatermarkBackground style={styles.container}>
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
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {isLoading ? "Loading..." : "No notifications"}
            </Text>
            <Text style={styles.emptySub}>
              {isLoading ? "Please wait" : "You're all caught up!"}
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
  listContent: {
    paddingBottom: spacing.xl,
  },

  // Profile Header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  rating: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unreadPill: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  unreadText: {
    ...typography.small,
    color: colors.white,
    fontWeight: "700",
  },

  // Stats
  stats: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statNumber: {
    ...typography.heading,
    color: colors.primary,
  },
  statLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Notifications Header
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  notifHeaderTitle: {
    ...typography.heading,
    color: colors.text,
  },
  markReadText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },

  // Notification Items
  notifItem: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifUnread: {
    borderColor: colors.primary,
    borderLeftWidth: 3,
  },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  notifTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    ...typography.small,
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "700",
    overflow: "hidden",
  },
  notifMsg: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  notifDate: {
    ...typography.small,
    color: colors.textMuted,
  },

  // Empty State
  empty: {
    paddingTop: spacing.xl * 2,
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },

  errorText: {
    ...typography.caption,
    color: colors.danger,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
});
