import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { colors, spacing, typography } from "@/constants/theme";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/src/context/AuthContext";
import {
  getTaskById,
  assignWorker,
  type Task,
  type Applicant,
  type TaskUser,
} from "@/src/api/tasks";

function getPosterId(task: Task): string {
  return typeof task.posterId === "object" &&
    task.posterId !== null &&
    "_id" in task.posterId
    ? (task.posterId as TaskUser)._id
    : String(task.posterId);
}

function getApplicantName(applicantId: TaskUser): string {
  const first = applicantId.firstName || "";
  const last = applicantId.lastName || "";
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return applicantId.email || "Applicant";
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskById(id!),
    enabled: !!id,
  });

  const assignMutation = useMutation({
    mutationFn: ({
      taskId,
      applicantId,
    }: {
      taskId: string;
      applicantId: string;
    }) => assignWorker(taskId, applicantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      Alert.alert(
        "Assign failed",
        err.response?.data?.error || err.message || "Could not assign worker"
      );
    },
  });

  const handleAssign = (applicantId: string) => {
    if (!id) return;
    Alert.alert(
      "Assign worker",
      "Assign this worker to the task? Only one worker can be assigned.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: () => assignMutation.mutate({ taskId: id, applicantId }),
        },
      ]
    );
  };

  if (!id) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Missing task ID</Text>
        <Button
          title="Go back"
          onPress={() => router.back()}
          variant="secondary"
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading task...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {(error as Error)?.message || "Failed to load task"}
        </Text>
        <Button
          title="Try again"
          onPress={() => refetch()}
          variant="secondary"
          style={styles.mt}
        />
        <Button
          title="Go back"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.mt}
        />
      </View>
    );
  }

  const { task, applicants } = data;
  const isPoster = user?._id && getPosterId(task) === user._id;
  const isAssigned = task.status === "ASSIGNED";
  const canAssign = isPoster && !isAssigned && applicants.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="chevron.right"
          size={24}
          color={colors.primary}
          style={styles.backChevron}
        />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Card style={styles.card}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Location</Text>
          <Text style={styles.metaValue}>{task.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Type</Text>
          <Text style={styles.metaValue}>{task.type}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Amount</Text>
          <Text style={styles.metaValue}>{task.money} KWD</Text>
        </View>
      </Card>

      {isPoster && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicants</Text>
          {applicants.length === 0 ? (
            <Card style={styles.card}>
              <Text style={styles.emptyText}>No applicants yet</Text>
            </Card>
          ) : (
            applicants.map((app: Applicant) => {
              const applicant = app.applicantId;
              const name =
                typeof applicant === "object"
                  ? getApplicantName(applicant)
                  : "Applicant";
              const rating =
                typeof applicant === "object" &&
                applicant !== null &&
                "rating" in applicant
                  ? (applicant as TaskUser).rating
                  : undefined;
              const applicantUserId =
                typeof applicant === "object" &&
                applicant !== null &&
                "_id" in applicant
                  ? (applicant as TaskUser)._id
                  : "";

              return (
                <Card key={app._id} style={styles.applicantCard}>
                  <View style={styles.applicantRow}>
                    <View style={styles.applicantInfo}>
                      <Text style={styles.applicantName}>{name}</Text>
                      <Text style={styles.ratingText}>
                        {rating != null
                          ? `Rating: ${Number(rating).toFixed(1)}`
                          : "No rating"}
                      </Text>
                    </View>
                    {canAssign && (
                      <Button
                        title="Assign"
                        onPress={() => handleAssign(applicantUserId)}
                        style={styles.assignButton}
                        loading={assignMutation.isPending}
                        disabled={assignMutation.isPending}
                      />
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </View>
      )}

      {isAssigned && task.assignedWorkerId && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Assigned worker</Text>
          {typeof task.assignedWorkerId === "object" &&
          task.assignedWorkerId !== null ? (
            <View>
              <Text style={styles.applicantName}>
                {getApplicantName(task.assignedWorkerId as TaskUser)}
              </Text>
              <Text style={styles.ratingText}>
                {(task.assignedWorkerId as TaskUser).rating != null
                  ? `Rating: ${Number(
                      (task.assignedWorkerId as TaskUser).rating
                    ).toFixed(1)}`
                  : "No rating"}
              </Text>
            </View>
          ) : (
            <Text style={styles.bodyText}>Worker assigned</Text>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
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
    marginBottom: spacing.md,
  },
  mt: { marginTop: spacing.md },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backChevron: {
    transform: [{ rotate: "180deg" }],
    marginRight: spacing.xs,
  },
  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  card: {
    marginBottom: spacing.md,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.small,
    color: colors.secondary,
    fontWeight: "600",
  },
  title: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.secondary,
  },
  metaValue: {
    ...typography.body,
    color: colors.text,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  applicantCard: {
    marginBottom: spacing.md,
  },
  applicantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
  },
  ratingText: {
    ...typography.caption,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  assignButton: {
    minWidth: 100,
  },
  emptyText: {
    ...typography.body,
    color: colors.secondary,
    textAlign: "center",
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
  },
});
