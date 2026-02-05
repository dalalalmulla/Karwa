import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing } from "@/constants/Karwa.theme";
import Card from "@/components/ui/Card";
import TaskFilters from "@/components/TaskFilters";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import AppHeader from "@/components/ui/AppHeader";
import {
  getTasksApi,
  type Task,
  type GetTasksParams,
  type GetTasksResponse,
} from "@/src/api/taskCalls";

function TaskCard({ 
  task, 
  onPress, 
  theme, 
  typography 
}: { 
  task: Task; 
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
  typography: ReturnType<typeof useTheme>['typography'];
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.title, { color: theme.textHeading, fontSize: typography.heading.fontSize }]} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={[styles.pointsPill, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.pointsText, { color: theme.primaryPressed, fontSize: typography.small.fontSize }]}>
              {task.points} pts
            </Text>
          </View>
        </View>

        <Text style={[styles.desc, { color: theme.textSecondary, fontSize: typography.body.fontSize }]} numberOfLines={2}>
          {task.description}
        </Text>

        {/* Status Badge */}
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: task.status === 'OPEN' ? theme.success :
                task.status === 'IN_PROGRESS' ? theme.warning :
                task.status === 'COMPLETED' ? theme.primary :
                theme.danger,
            }
          ]}>
            <Text style={[styles.statusText, { color: theme.white, fontSize: typography.small.fontSize }]}>
              {task.status === 'IN_PROGRESS' ? 'On Progress' : 
               task.status === 'COMPLETED' ? 'Completed' :
               task.status === 'CANCELLED' ? 'Cancelled' : 'Open'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.textMuted, fontSize: typography.caption.fontSize }]}>
            💰 {task.money} KWD
          </Text>
          <Text style={[styles.metaText, { color: theme.textMuted, fontSize: typography.caption.fontSize }]} numberOfLines={1}>
            📍 {task.location}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme, typography } = useTheme();
  const [filters, setFilters] = useState<GetTasksParams>({});

  const { data, isLoading, isRefetching, refetch, error } =
    useQuery<GetTasksResponse>({
      queryKey: ["tasks", "open", filters],
      queryFn: async () => {
        const params: GetTasksParams = {
          ...filters,
          status: "OPEN", // Always show OPEN tasks in browse screen
        };
        return await getTasksApi(params);
      },
    });

  const tasks: Task[] = useMemo(() => {
    if (!data?.success || !data.data?.tasks) {
      return [];
    }
    return data.data.tasks.filter((t) => t.status === "OPEN");
  }, [data]);

  const handleFiltersChange = (newFilters: GetTasksParams) => {
    setFilters(newFilters);
  };

  return (
    <WatermarkBackground style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader
        title="Browse Tasks"
        subtitle={`${tasks.length} open tasks available`}
        rightElement={<TaskFilters filters={filters} onApply={handleFiltersChange} />}
        showBranding={true}
      />

      {error ? (
        <View style={styles.errorContainer}>
          <Card style={[styles.errorCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.errorTitle, { color: theme.text, fontSize: typography.heading.fontSize }]}>
              Failed to load tasks
            </Text>
            <Text style={[styles.errorText, { color: theme.textSecondary, fontSize: typography.body.fontSize }]}>
              {(error as Error).message || "Unknown error"}
            </Text>
            <Text style={[styles.errorHint, { color: theme.primary, fontSize: typography.body.fontSize }]} onPress={() => refetch()}>
              Tap to retry
            </Text>
            <View style={styles.buttonRow}>
              <Button
                title="Create Task"
                onPress={() => {
                  router.push("/(main)/create-task");
                }}
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
            theme={theme}
            typography={typography}
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
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: theme.text, fontSize: typography.heading.fontSize }]}>
              {isLoading ? "Loading..." : "No open tasks"}
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary, fontSize: typography.body.fontSize }]}>
              {isLoading ? "Please wait" : "Pull down to refresh"}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  card: {
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontWeight: "600",
    flex: 1,
  },
  pointsPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  pointsText: {
    fontWeight: "700",
  },
  desc: {
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  statusRow: {
    marginBottom: spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  metaText: {
    flex: 1,
  },

  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },

  empty: {
    paddingTop: spacing.xl * 2,
    alignItems: "center",
  },
  emptyTitle: {
    marginBottom: spacing.xs,
  },
  emptySub: {},

  errorContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  errorCard: {
    marginBottom: spacing.sm,
  },
  errorTitle: {
    marginBottom: spacing.xs,
  },
  errorText: {
    marginBottom: spacing.sm,
  },
  errorHint: {
    fontWeight: "600",
  },
});
