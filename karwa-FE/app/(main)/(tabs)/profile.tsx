import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/src/context/AuthContext";
import { getTasksApi, Task } from "@/src/api/taskCalls";
import { colors, spacing, typography } from "@/constants/theme";

export default function ProfileScreen() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: async () => {
      const res = await getTasksApi();
      return res;
    },
  });

  const tasks: Task[] = data?.success ? data.data?.tasks ?? [] : [];

  const stats = tasks.reduce(
    (acc, task) => {
      if (task.status === "DONE") acc.completed += 1;
      else if (task.status === "IN_PROGRESS") acc.inProgress += 1;
      else if (task.status === "OPEN") acc.open += 1;

      return acc;
    },
    { completed: 0, inProgress: 0, open: 0 }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name ?? user?.email ?? "User"}</Text>

      <Text style={styles.rating}>⭐ 4.8</Text>

      <View style={styles.stats}>
        <Text style={styles.stat}>Open: {stats.open}</Text>
        <Text style={styles.stat}>In Progress: {stats.inProgress}</Text>
        <Text style={styles.stat}>Completed: {stats.completed}</Text>
      </View>
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
  },
  rating: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  stats: {
    gap: spacing.sm,
  },
  stat: {
    ...typography.body,
  },
});
