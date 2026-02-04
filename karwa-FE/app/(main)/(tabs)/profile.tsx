import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/src/context/AuthContext";
import { getTasksApi } from "@/src/api/taskCalls";
import type { Task } from "@/src/types/taskTypes";
import { colors, spacing, typography } from "@/constants/theme";

import {
  detectAndStoreTaskStatusChanges,
  loadNotifications,
  markAllNotificationsRead,
  type InAppNotification,
} from "@/src/utils/notification";

type TasksResponse = {
  success: boolean;
  data?: { tasks: Task[] };
  error?: string;
};

export default function ProfileScreen() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const { data, isRefetching, refetch, isLoading, error } =
  useQuery<TasksResponse>({
    queryKey: ["my-tasks"],
    queryFn: () => getTasksApi({}) as unknown as Promise<TasksResponse>,
    refetchInterval: 15000, // كل 15 ثانية
    refetchIntervalInBackground: true,
  });


  const tasks: Task[] = useMemo(() => {
    return data?.success ? data.data?.tasks ?? [] : [];
  }, [data]);

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
  

  useEffect(() => {
    (async () => {
      const list = await loadNotifications();
      setNotifications(list);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!tasks.length) return;

      await detectAndStoreTaskStatusChanges({
        tasks: tasks.map((t) => ({
          _id: String(t._id),
          title: t.title,
          status: t.status as any,
        })),
      });

      const list = await loadNotifications();
      setNotifications(list);
    })();
  }, [tasks]);

  const handleMarkAllRead = async () => {
    const updated = await markAllNotificationsRead();
    setNotifications(updated);
  };

  const displayName = useMemo(() => {
    const anyUser = user as any;
    return anyUser?.name ?? anyUser?.email ?? "User";
  }, [user]);

  const renderNotif = ({ item }: { item: InAppNotification }) => {
    return (
      <View style={[styles.notifItem, !item.read && styles.notifUnread]}>
        <View style={styles.notifTopRow}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          {!item.read ? <Text style={styles.badge}>NEW</Text> : null}
        </View>
        <Text style={styles.notifMsg}>{item.message}</Text>
        <Text style={styles.notifDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{displayName}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.rating}>⭐ 4.8</Text>
        <View style={styles.unreadPill}>
          <Text style={styles.unreadText}>Notifications: {unreadCount}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>Open: {stats.open}</Text>
        <Text style={styles.stat}>In Progress: {stats.inProgress}</Text>
        <Text style={styles.stat}>Completed: {stats.completed}</Text>
      </View>

      <View style={styles.notifHeader}>
        <Text style={styles.notifHeaderTitle}>Notifications</Text>

        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={styles.errorText}>
          {(error as Error).message || "Failed to load"}
        </Text>
      ) : null}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotif}
        contentContainerStyle={styles.notifList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {isLoading ? "Loading..." : "No notifications yet"}
            </Text>
            <Text style={styles.emptySub}>
              {isLoading ? "Please wait" : "Notifications will appear when task status changes"}
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
    padding: spacing.lg,
  },
  name: {
    ...typography.title,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  rating: {
    ...typography.body,
    color: colors.text,
  },
  unreadPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  unreadText: {
    ...typography.small,
    color: colors.text,
    fontWeight: "700",
  },
  stats: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stat: {
    ...typography.body,
    color: colors.text,
  },

  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  notifHeaderTitle: {
    ...typography.heading,
    color: colors.text,
  },
  markReadBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  markReadText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "700",
  },

  notifList: {
    paddingBottom: spacing.xl,
  },
  notifItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  notifUnread: {
    borderColor: colors.primary,
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
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "800",
  },
  notifMsg: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  notifDate: {
    ...typography.small,
    color: colors.gray500,
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
    textAlign: "center",
  },

  errorText: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
});
