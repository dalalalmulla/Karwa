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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";

import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { getTasksApi } from "@/src/api/taskCalls";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
} from "@/src/api/notificationCalls";
import type { Task } from "@/src/types/taskTypes";
import type { Notification } from "@/src/types/notificationTypes";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import { getCurrentUser } from "@/src/api/auth";
import { spacing } from "@/constants/theme";

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

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/(auth)/login");
    }
  }, [token, router]);

  const {
    data,
    isLoading: currentUserLoading,
    error,
    refetch,
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
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const tasks: Task[] = useMemo(() => {
    return tasksData?.success ? (tasksData.data?.tasks ?? []) : [];
  }, [tasksData]);

  const stats = tasks.reduce(
    (acc, task) => {
      if (task.status === "COMPLETED") acc.completed += 1;
      else if (task.status === "IN_PROGRESS") acc.inProgress += 1;
      else if (task.status === "OPEN") acc.open += 1;
      else if (task.status === "CANCELLED") acc.cancelled += 1;
      return acc;
    },
    { completed: 0, inProgress: 0, open: 0, cancelled: 0 },
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
      <View
        style={[
          styles.notifItem,
          { backgroundColor: theme.surface, borderColor: theme.border },
          !item.read && [styles.notifUnread, { borderColor: theme.primary }],
        ]}
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
          {!item.read && (
            <Text
              style={[
                styles.badge,
                { color: theme.white, backgroundColor: theme.primary },
              ]}
            >
              NEW
            </Text>
          )}
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
      </View>
    );
  };

  const isRefreshing = isTasksRefetching || isNotificationsRefetching;
  const isLoading = isTasksLoading || isNotificationsLoading;

  const ListHeader = () => (
    <>
      {/* App Branding Header */}
      <View
        style={[
          styles.brandingHeader,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <Text
          style={[
            styles.pageTitle,
            { color: theme.textTitle, fontSize: typography.title.fontSize },
          ]}
        >
          Profile
        </Text>
        <View style={styles.brandingRight}>
          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.danger }]}
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
              <ActivityIndicator size="small" color={theme.white} />
            ) : (
              <>
                <AntDesign name="logout" size={14} color={theme.white} />
                <Text
                  style={[
                    styles.logoutText,
                    { color: theme.white, fontSize: typography.small.fontSize },
                  ]}
                >
                  Logout
                </Text>
              </>
            )}
          </TouchableOpacity>
          {/* App Logo and Name */}
          <View style={styles.branding}>
            <Image
              source={require("../../../assets/images/Karwa.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <Text
              style={[
                styles.appName,
                { color: theme.primary, fontSize: typography.body.fontSize },
              ]}
            >
              Karwa
            </Text>
          </View>
        </View>
      </View>

      {/* Profile Info */}
      <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
        <View style={styles.profileInfo}>
          <Text
            style={[
              styles.name,
              {
                color: "green",
                fontSize: typography.title.fontSize,
                fontWeight: "700",
              },
            ]}
          >
            {displayName}
          </Text>
          <Text
            style={[
              styles.rating,
              {
                color: theme.textSecondary,
                fontSize: typography.caption.fontSize,
              },
            ]}
          >
            {userRating !== null
              ? `⭐ ${userRating.toFixed(1)}`
              : "⭐ No rating yet"}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={[styles.unreadPill, { backgroundColor: theme.primary }]}>
            <Text style={[styles.unreadText, { color: theme.white }]}>
              {unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View
        style={[
          styles.stats,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statNumber,
              { color: theme.primary, fontSize: typography.heading.fontSize },
            ]}
          >
            {stats.open}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: theme.textMuted, fontSize: typography.small.fontSize },
            ]}
          >
            Open
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statNumber,
              { color: theme.primary, fontSize: typography.heading.fontSize },
            ]}
          >
            {stats.inProgress}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: theme.textMuted, fontSize: typography.small.fontSize },
            ]}
          >
            Active
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statNumber,
              { color: theme.primary, fontSize: typography.heading.fontSize },
            ]}
          >
            {stats.completed}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: theme.textMuted, fontSize: typography.small.fontSize },
            ]}
          >
            Done
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statNumber,
              { color: theme.primary, fontSize: typography.heading.fontSize },
            ]}
          >
            {stats.cancelled}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: theme.textMuted, fontSize: typography.small.fontSize },
            ]}
          >
            Cancelled
          </Text>
        </View>
      </View>

      {/* Notifications Header */}
      <View style={[styles.notifHeader, { backgroundColor: theme.background }]}>
        <Text
          style={[
            styles.notifHeaderTitle,
            { color: theme.textHeading, fontSize: typography.heading.fontSize },
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

      {tasksError && (
        <Text
          style={[
            styles.errorText,
            { color: theme.danger, fontSize: typography.caption.fontSize },
          ]}
        >
          {(tasksError as Error).message || "Failed to load"}
        </Text>
      )}
    </>
  );

  return (
    <WatermarkBackground
      style={[styles.container, { backgroundColor: theme.background }]}
    >
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
          <View style={styles.empty}>
            <Text
              style={[
                styles.emptyTitle,
                { color: theme.text, fontSize: typography.heading.fontSize },
              ]}
            >
              {isLoading ? "Loading..." : "No notifications"}
            </Text>
            <Text
              style={[
                styles.emptySub,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
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

  // Branding Header
  brandingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  pageTitle: {
    fontWeight: "700",
  },
  brandingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  branding: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  logo: {
    width: 28,
    height: 28,
  },
  appName: {
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    gap: spacing.xs,
  },
  logoutText: {
    fontWeight: "600",
  },

  // Profile Header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
  },
  rating: {
    marginTop: 2,
  },
  unreadPill: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  unreadText: {
    fontWeight: "700",
    fontSize: 11,
  },

  // Stats
  stats: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
  },
  statNumber: {
    fontWeight: "600",
  },
  statLabel: {
    marginTop: 2,
  },

  // Notifications Header
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  notifHeaderTitle: {
    fontWeight: "600",
  },
  markReadText: {
    fontWeight: "600",
  },

  // Notification Items
  notifItem: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
  },
  notifUnread: {
    borderLeftWidth: 3,
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
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "700",
    fontSize: 10,
    overflow: "hidden",
  },
  notifMsg: {
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  notifDate: {},

  // Empty State
  empty: {
    paddingTop: spacing.xl * 2,
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
  },
  emptySub: {
    textAlign: "center",
  },

  errorText: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
});
