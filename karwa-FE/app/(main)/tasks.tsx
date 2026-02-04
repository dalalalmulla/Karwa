import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors, spacing, typography } from "@/constants/theme";
import Card from "@/components/ui/Card";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import { getTasks, type Task } from "@/src/api/tasks";

export default function TasksListScreen() {
  const router = useRouter();
  const {
    data: tasks,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tasks", "OPEN"],
    queryFn: () => getTasks({ status: "OPEN" }),
  });

  const { data: pendingTasks } = useQuery({
    queryKey: ["tasks", "posterId=me", "PENDING_CONFIRMATION"],
    queryFn: () => getTasks({ posterId: "me", status: "PENDING_CONFIRMATION" }),
  });

  const hasPending = pendingTasks && pendingTasks.length > 0;

  if (isLoading) {
    return (
      <WatermarkBackground style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </WatermarkBackground>
    );
  }

  if (isError) {
    return (
      <WatermarkBackground style={styles.center}>
        <Text style={styles.errorText}>
          {(error as Error)?.message || "Failed to load tasks"}
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.linkButton}>
          <Text style={styles.linkText}>Try again</Text>
        </TouchableOpacity>
      </WatermarkBackground>
    );
  }

  return (
    <WatermarkBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      {hasPending && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending your confirmation</Text>
          <Text style={styles.subtitle}>
            Worker marked these complete. Confirm to close and rate.
          </Text>
          {pendingTasks!.map((task: Task) => (
            <TouchableOpacity
              key={task._id}
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  `/(main)/task/${task._id}` as Parameters<
                    typeof router.push
                  >[0]
                )
              }
            >
              <Card style={styles.pendingCard}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.location} · {task.money} KWD · {task.status}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.title}>Open tasks</Text>
      <Text style={styles.subtitle}>
        Tap a task to view details and assign a worker
      </Text>
      {!tasks?.length ? (
        <Card style={styles.card}>
          <Text style={styles.emptyText}>No open tasks at the moment</Text>
        </Card>
      ) : (
        tasks.map((task) => (
          <TouchableOpacity
            key={task._id}
            activeOpacity={0.7}
            onPress={() =>
              router.push(
                `/(main)/task/${task._id}` as Parameters<typeof router.push>[0]
              )
            }
          >
            <Card style={styles.card}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskMeta}>
                {task.location} · {task.money} KWD · {task.status}
              </Text>
            </Card>
          </TouchableOpacity>
        ))
      )}
      </ScrollView>
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.secondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  linkButton: {
    marginTop: spacing.md,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  backRow: {
    marginBottom: spacing.lg,
  },
  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pendingCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  card: {
    marginBottom: spacing.md,
  },
  taskTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskMeta: {
    ...typography.caption,
    color: colors.secondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.secondary,
    textAlign: "center",
  },
});
