import React, { useState } from "react";
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
  markCompleteByWorker,
  confirmCompletion,
  submitRating,
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

function getAssignedWorkerId(task: Task): string | undefined {
  if (!task.assignedWorkerId) return undefined;
  return typeof task.assignedWorkerId === "object" &&
    task.assignedWorkerId !== null &&
    "_id" in task.assignedWorkerId
    ? (task.assignedWorkerId as TaskUser)._id
    : String(task.assignedWorkerId);
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

  const confirmMutation = useMutation({
    mutationFn: (taskId: string) => confirmCompletion(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      Alert.alert(
        "Confirm failed",
        err.response?.data?.error ||
          err.message ||
          "Could not confirm completion"
      );
    },
  });

  const rateMutation = useMutation({
    mutationFn: ({ taskId, rating }: { taskId: string; rating: number }) =>
      submitRating(taskId, rating),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      Alert.alert(
        "Rating failed",
        err.response?.data?.error || err.message || "Could not submit rating"
      );
    },
  });

  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const markCompleteMutation = useMutation({
    mutationFn: (taskId: string) => markCompleteByWorker(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      Alert.alert(
        "Mark complete failed",
        err.response?.data?.error ||
          err.message ||
          "Could not mark task complete"
      );
    },
  });

  const handleMarkComplete = () => {
    if (!id) return;
    Alert.alert(
      "Mark complete",
      "Mark this task as complete? The poster will be notified to confirm.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark complete",
          onPress: () => markCompleteMutation.mutate(id),
        },
      ]
    );
  };

  const handleConfirmCompletion = () => {
    if (!id) return;
    Alert.alert(
      "Confirm completion",
      "Mark this task as officially completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => confirmMutation.mutate(id),
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

  const { task, applicants, hasRatedByPoster } = data;
  const isPoster = user?._id && getPosterId(task) === user._id;
  const isWorker = !!user?._id && getAssignedWorkerId(task) === user._id;
  const isAssigned = task.status === "ASSIGNED";
  const canAssign = isPoster && !isAssigned && applicants.length > 0;
  const canMarkComplete =
    isWorker && (task.status === "ASSIGNED" || task.status === "IN_PROGRESS");
  const canConfirm =
    isPoster &&
    (task.status === "ASSIGNED" ||
      task.status === "IN_PROGRESS" ||
      task.status === "PENDING_CONFIRMATION") &&
    !!task.assignedWorkerId;
  const isCompleted = task.status === "COMPLETED";
  const showRatingFlow =
    isPoster && isCompleted && task.assignedWorkerId && !hasRatedByPoster;
  const isPendingConfirmation = task.status === "PENDING_CONFIRMATION";

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

      {canMarkComplete && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Mark complete</Text>
          <Text style={styles.bodyText}>
            Finished the work? Mark the task complete so the poster can confirm.
          </Text>
          <Button
            title="Mark complete"
            onPress={handleMarkComplete}
            style={styles.confirmButton}
            loading={markCompleteMutation.isPending}
            disabled={markCompleteMutation.isPending}
          />
        </Card>
      )}

      {isPendingConfirmation && isWorker && (
        <Card style={styles.card}>
          <Text style={styles.pendingText}>
            Task is pending the poster&apos;s confirmation. You will receive
            points once they confirm.
          </Text>
        </Card>
      )}

      {canConfirm && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Confirm completion</Text>
          <Text style={styles.bodyText}>
            When the work is done, confirm to close the task officially.
          </Text>
          <Button
            title="Confirm completion"
            onPress={handleConfirmCompletion}
            style={styles.confirmButton}
            loading={confirmMutation.isPending}
            disabled={confirmMutation.isPending}
          />
        </Card>
      )}

      {showRatingFlow && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rate the worker</Text>
          <Text style={styles.ratingPrompt}>
            How was the work? Select a rating from 1 to 5.
          </Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.ratingOption,
                  selectedRating === n && styles.ratingOptionSelected,
                ]}
                onPress={() => setSelectedRating(n)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.ratingOptionText,
                    selectedRating === n && styles.ratingOptionTextSelected,
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title="Submit rating"
            onPress={() =>
              selectedRating != null &&
              id &&
              rateMutation.mutate({ taskId: id, rating: selectedRating })
            }
            style={styles.confirmButton}
            loading={rateMutation.isPending}
            disabled={rateMutation.isPending || selectedRating == null}
          />
        </Card>
      )}

      {isCompleted && hasRatedByPoster && (
        <Card style={styles.card}>
          <Text style={styles.ratingThanks}>Thanks for rating the worker.</Text>
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
  confirmButton: {
    marginTop: spacing.md,
  },
  ratingPrompt: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  ratingRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ratingOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingOptionText: {
    ...typography.heading,
    color: colors.text,
  },
  ratingOptionTextSelected: {
    color: colors.white,
  },
  ratingThanks: {
    ...typography.body,
    color: colors.success,
    textAlign: "center",
  },
  pendingText: {
    ...typography.body,
    color: colors.secondary,
    textAlign: "center",
  },
});
