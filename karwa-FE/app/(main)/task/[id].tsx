import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius, shadows } from "@/constants/Karwa.theme";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import MetaInfo from "@/components/ui/MetaInfo";
import Badge from "@/components/ui/Badge";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import { useAuth } from "@/src/context/AuthContext";
import {
  getTaskById,
  assignWorker,
  markCompleteByWorker,
  confirmCompletion,
  applyToTask,
  deleteTask,
  type Task,
  type Applicant,
  type TaskUser,
} from "@/src/api/tasks";
import RatingModal from "@/components/RatingModal";
import StarRating from "@/components/ui/StarRating";
import { ROLE_LABELS } from "@/src/constants/roles";

/* ─── Helpers ─── */

function getPosterId(task: Task): string {
  if (!task.posterId) return "";
  if (
    typeof task.posterId === "object" &&
    task.posterId !== null &&
    "_id" in task.posterId
  ) {
    return String((task.posterId as TaskUser)._id);
  }
  return String(task.posterId);
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

function getPosterName(task: Task): string {
  if (typeof task.posterId === "object" && task.posterId !== null) {
    const poster = task.posterId as TaskUser;
    const first = poster.firstName || "";
    const last = poster.lastName || "";
    if (first || last) return [first, last].filter(Boolean).join(" ");
    return poster.email || "Poster";
  }
  return "Poster";
}

function getPosterRating(task: Task): number | undefined {
  if (typeof task.posterId === "object" && task.posterId !== null) {
    return (task.posterId as TaskUser).rating;
  }
  return undefined;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Component ─── */

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, typography } = useTheme();
  const queryClient = useQueryClient();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskById(id!),
    enabled: !!id,
  });

  /* ─── Mutations ─── */

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

  const markCompleteMutation = useMutation({
    mutationFn: (taskId: string) => markCompleteByWorker(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      Alert.alert(
        "Mark complete failed",
        err.response?.data?.error || err.message
      );
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (taskId: string) => confirmCompletion(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      Alert.alert(
        "Confirm failed",
        err.response?.data?.error || err.message
      );
    },
  });

  const applyMutation = useMutation({
    mutationFn: () => applyToTask(id!),
    onSuccess: () => {
      Alert.alert("Success", "Your application has been submitted!");
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      Alert.alert(
        "Apply failed",
        err.response?.data?.error || err.message || "Could not apply"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(id!),
    onSuccess: () => {
      Alert.alert("Success", "Task deleted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      Alert.alert(
        "Delete failed",
        err.response?.data?.error || err.message
      );
    },
  });

  /* ─── Handlers ─── */

  const handleAssign = (applicantId: string) => {
    if (!id) return;
    Alert.alert(
      `Assign ${ROLE_LABELS.WORKER.singular.toLowerCase()}`,
      `Assign this ${ROLE_LABELS.WORKER.singular.toLowerCase()} to the task?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: () => assignMutation.mutate({ taskId: id, applicantId }),
        },
      ]
    );
  };

  const handleMarkComplete = () => {
    if (!id) return;
    Alert.alert(
      "Mark complete",
      "Mark this task as complete? The poster will be notified.",
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
        { text: "Confirm", onPress: () => confirmMutation.mutate(id) },
      ]
    );
  };

  const handleApply = () => {
    if (!id) return;
    Alert.alert("Apply to Task", "Are you sure you want to apply?", [
      { text: "Cancel", style: "cancel" },
      { text: "Apply", onPress: () => applyMutation.mutate() },
    ]);
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      "Delete Task",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const handleModify = () => {
    if (!id) return;
    router.push({
      pathname: "/(main)/create-task",
      params: { taskId: id, editMode: "true" },
    });
  };

  const handleRateUser = (userId: string, userName: string) => {
    setRatingTarget({ userId, userName });
    setShowRatingModal(true);
  };

  const handleContactWhatsApp = () => {
    if (!id) return;
    const message = `Task reference - Karwa\nTask ID: ${id}`;
    Linking.openURL(
      `https://wa.me/?text=${encodeURIComponent(message)}`
    ).catch(() =>
      Alert.alert("Cannot open WhatsApp", "Please install WhatsApp.")
    );
  };

  /* ─── Loading / Error States ─── */

  if (!id) {
    return (
      <WatermarkBackground style={styles.center}>
        <Text
          style={[
            styles.errorText,
            { color: theme.danger, fontSize: typography.body.fontSize },
          ]}
        >
          Missing task ID
        </Text>
        <Button title="Go back" onPress={() => router.back()} variant="secondary" />
      </WatermarkBackground>
    );
  }

  if (isLoading) {
    return (
      <WatermarkBackground style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: theme.textSecondary, fontSize: typography.body.fontSize },
          ]}
        >
          Loading task...
        </Text>
      </WatermarkBackground>
    );
  }

  if (isError || !data) {
    return (
      <WatermarkBackground style={styles.center}>
        <Text
          style={[
            styles.errorText,
            { color: theme.danger, fontSize: typography.body.fontSize },
          ]}
        >
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
          variant="text"
          style={styles.mt}
        />
      </WatermarkBackground>
    );
  }

  /* ─── Derived State ─── */

  const { task, applicants, hasApplied } = data;
  const userIdStr = user?._id ? String(user._id).trim() : "";
  const posterIdStr = getPosterId(task).trim();
  const workerIdStr = (getAssignedWorkerId(task) || "").trim();

  const isPoster =
    !!userIdStr &&
    !!posterIdStr &&
    userIdStr.replace(/\s+/g, "") === posterIdStr.replace(/\s+/g, "");
  const isWorker =
    !!userIdStr &&
    !!workerIdStr &&
    userIdStr.replace(/\s+/g, "") === workerIdStr.replace(/\s+/g, "");

  const taskStatusUpper = task.status?.toUpperCase() || "";
  const isCompleted = taskStatusUpper === "COMPLETED";
  const isOpen = taskStatusUpper === "OPEN";
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

  const canRate = isCompleted;
  const showWorkerRatePoster = isWorker && canRate && !!task.posterId;
  const showPosterRateWorker =
    isPoster && canRate && !!task.assignedWorkerId;

  const canApply = !isPoster && !isWorker && isOpen && !hasApplied;
  const canModify = isPoster && isOpen;
  const canDelete = isPoster && isOpen;
  const posterRating = getPosterRating(task);

  /* ─── Render ─── */

  return (
    <WatermarkBackground style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.backText,
              { color: theme.primary, fontSize: typography.body.fontSize },
            ]}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        {/* ── Task Details Card ── */}
        <Card variant="elevated" padding="large">
          <View style={styles.headerRow}>
            <StatusBadge status={task.status as any} />
            <Badge
              label={`${task.points} pts`}
              variant="primary"
              size="small"
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontSize: typography.title.fontSize,
              },
            ]}
          >
            {task.title}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: theme.textSecondary,
                fontSize: typography.body.fontSize,
              },
            ]}
          >
            {task.description}
          </Text>

          {/* Meta Grid */}
          <View
            style={[
              styles.metaGrid,
              { borderTopColor: theme.border },
            ]}
          >
            <MetaInfo icon="💰" label="Amount" value={`${task.money} KWD`} />
            <MetaInfo
              icon="🕐"
              label="Posted"
              value={task.createdAt ? formatDate(task.createdAt) : "N/A"}
            />
            <MetaInfo icon="📍" label="Location" value={task.location} />
          </View>

          {/* Poster Rating */}
          <View
            style={[
              styles.posterRating,
              { borderTopColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.metaLabel,
                {
                  color: theme.textSecondary,
                  fontSize: typography.caption.fontSize,
                },
              ]}
            >
              {ROLE_LABELS.POSTER.singular} Rating
            </Text>
            <View style={styles.ratingDisplay}>
              {posterRating != null && posterRating > 0 ? (
                <>
                  <StarRating
                    rating={Math.round(posterRating)}
                    onRatingChange={() => {}}
                    size={18}
                    editable={false}
                  />
                  <Text
                    style={[
                      styles.ratingValue,
                      {
                        color: theme.text,
                        fontSize: typography.body.fontSize,
                      },
                    ]}
                  >
                    {Number(posterRating).toFixed(1)}
                  </Text>
                </>
              ) : (
                <Text
                  style={[
                    styles.noRating,
                    {
                      color: theme.textMuted,
                      fontSize: typography.caption.fontSize,
                    },
                  ]}
                >
                  No rating yet
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* ── Action Buttons ── */}
        {(canApply || hasApplied || canModify || canDelete) && (
          <Card variant="default" padding="medium">
            {canApply && (
              <Button
                title="Apply for this Task"
                onPress={handleApply}
                loading={applyMutation.isPending}
                disabled={applyMutation.isPending}
                style={styles.actionBtn}
              />
            )}

            {hasApplied && !isPoster && !isWorker && (
              <View
                style={[
                  styles.appliedIndicator,
                  {
                    backgroundColor: `${theme.success}15`,
                    borderColor: theme.success,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.appliedText,
                    {
                      color: theme.success,
                      fontSize: typography.body.fontSize,
                    },
                  ]}
                >
                  ✓ You have applied to this task
                </Text>
              </View>
            )}

            {(canModify || canDelete) && (
              <View style={styles.posterActions}>
                {canModify && (
                  <Button
                    title="Modify"
                    onPress={handleModify}
                    variant="secondary"
                    style={styles.halfBtn}
                  />
                )}
                {canDelete && (
                  <Button
                    title="Delete"
                    onPress={handleDelete}
                    variant="danger"
                    loading={deleteMutation.isPending}
                    disabled={deleteMutation.isPending}
                    style={styles.halfBtn}
                  />
                )}
              </View>
            )}
          </Card>
        )}

        {/* ── Applicants (poster only) ── */}
        {isPoster && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.textHeading,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Applicants
            </Text>
            {applicants.length === 0 ? (
              <Card variant="outlined" padding="medium">
                <Text
                  style={[
                    styles.emptyText,
                    {
                      color: theme.textMuted,
                      fontSize: typography.body.fontSize,
                    },
                  ]}
                >
                  No applicants yet
                </Text>
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
                  <Card key={app._id} variant="outlined" padding="medium">
                    <View style={styles.applicantRow}>
                      <View style={styles.applicantInfo}>
                        <Text
                          style={[
                            styles.applicantName,
                            {
                              color: theme.text,
                              fontSize: typography.body.fontSize,
                            },
                          ]}
                        >
                          {name}
                        </Text>
                        <Text
                          style={[
                            styles.applicantRating,
                            {
                              color: theme.textSecondary,
                              fontSize: typography.caption.fontSize,
                            },
                          ]}
                        >
                          {rating != null
                            ? `⭐ ${Number(rating).toFixed(1)}`
                            : "No rating"}
                        </Text>
                      </View>
                      {canAssign && (
                        <Button
                          title="Assign"
                          onPress={() => handleAssign(applicantUserId)}
                          style={styles.assignBtn}
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

        {/* ── Assigned Worker ── */}
        {isAssigned && task.assignedWorkerId && (
          <Card variant="default" padding="medium">
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.textHeading,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Assigned {ROLE_LABELS.WORKER.singular}
            </Text>
            {typeof task.assignedWorkerId === "object" &&
            task.assignedWorkerId !== null ? (
              <View>
                <Text
                  style={[
                    styles.applicantName,
                    {
                      color: theme.text,
                      fontSize: typography.body.fontSize,
                    },
                  ]}
                >
                  {getApplicantName(task.assignedWorkerId as TaskUser)}
                </Text>
                <Text
                  style={[
                    styles.applicantRating,
                    {
                      color: theme.textSecondary,
                      fontSize: typography.caption.fontSize,
                    },
                  ]}
                >
                  {(task.assignedWorkerId as TaskUser).rating != null
                    ? `⭐ ${Number(
                        (task.assignedWorkerId as TaskUser).rating
                      ).toFixed(1)}`
                    : "No rating"}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  { color: theme.text, fontSize: typography.body.fontSize },
                ]}
              >
                {ROLE_LABELS.WORKER.singular} assigned
              </Text>
            )}
          </Card>
        )}

        {/* ── Contact (worker only) ── */}
        {isWorker && (
          <Card variant="default" padding="medium">
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.textHeading,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Contact
            </Text>
            <Text
              style={[
                styles.bodyText,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
              Contact the {ROLE_LABELS.POSTER.singular.toLowerCase()} via
              WhatsApp. Your message will include the task ID.
            </Text>
            <Button
              title="Contact via WhatsApp"
              onPress={handleContactWhatsApp}
              style={styles.mt}
            />
          </Card>
        )}

        {/* ── Mark Complete (worker) ── */}
        {canMarkComplete && (
          <Card variant="default" padding="medium">
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.textHeading,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Mark Complete
            </Text>
            <Text
              style={[
                styles.bodyText,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
              Finished the work? Mark the task complete so the{" "}
              {ROLE_LABELS.POSTER.singular.toLowerCase()} can confirm.
            </Text>
            <Button
              title="Mark complete"
              onPress={handleMarkComplete}
              style={styles.mt}
              loading={markCompleteMutation.isPending}
              disabled={markCompleteMutation.isPending}
            />
          </Card>
        )}

        {/* ── Confirm Completion (poster) ── */}
        {canConfirm && (
          <Card variant="default" padding="medium">
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.textHeading,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Confirm Completion
            </Text>
            <Text
              style={[
                styles.bodyText,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
              When the work is done, confirm to close the task officially.
            </Text>
            <Button
              title="Confirm completion"
              onPress={handleConfirmCompletion}
              style={styles.mt}
              loading={confirmMutation.isPending}
              disabled={confirmMutation.isPending}
            />
          </Card>
        )}

        {/* ── Rating: Worker → Poster ── */}
        {showWorkerRatePoster && (
          <Card variant="default" padding="medium">
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.textHeading,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Rate the {ROLE_LABELS.POSTER.singular}
            </Text>
            <Text
              style={[
                styles.bodyText,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
              Share your experience working with {getPosterName(task)}
            </Text>
            <Button
              title={`Rate ${ROLE_LABELS.POSTER.singular}`}
              onPress={() => {
                handleRateUser(getPosterId(task), getPosterName(task));
              }}
              style={styles.mt}
            />
          </Card>
        )}

        {/* ── Rating: Poster → Worker ── */}
        {showPosterRateWorker && (
          <Card variant="default" padding="medium">
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.textHeading,
                  fontSize: typography.heading.fontSize,
                },
              ]}
            >
              Rate the {ROLE_LABELS.WORKER.singular}
            </Text>
            <Text
              style={[
                styles.bodyText,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
              How was the work? Rate the{" "}
              {ROLE_LABELS.WORKER.singular.toLowerCase()} who completed this
              task.
            </Text>
            {typeof task.assignedWorkerId === "object" &&
            task.assignedWorkerId !== null ? (
              <Button
                title={`Rate ${ROLE_LABELS.WORKER.singular}`}
                onPress={() => {
                  const wId = getAssignedWorkerId(task);
                  if (wId) {
                    handleRateUser(
                      wId,
                      getApplicantName(task.assignedWorkerId as TaskUser)
                    );
                  }
                }}
                style={styles.mt}
              />
            ) : null}
          </Card>
        )}
      </ScrollView>

      {/* Rating Modal */}
      {ratingTarget && id && (
        <RatingModal
          visible={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingTarget(null);
          }}
          taskId={id}
          ratedUserId={ratingTarget.userId}
          ratedUserName={ratingTarget.userName}
          onRatingSubmitted={() => {
            queryClient.invalidateQueries({ queryKey: ["task", id] });
          }}
        />
      )}
    </WatermarkBackground>
  );
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorText: {
    textAlign: "center",
    marginBottom: spacing.md,
  },
  mt: {
    marginTop: spacing.md,
  },

  /* Back */
  backRow: {
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  backText: {
    fontWeight: "600",
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  description: {
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  /* Meta Grid */
  metaGrid: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  /* Poster Rating */
  posterRating: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  metaLabel: {
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  ratingDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ratingValue: {
    fontWeight: "600",
  },
  noRating: {
    fontStyle: "italic",
  },

  /* Action Buttons */
  actionBtn: {
    marginBottom: spacing.sm,
  },
  posterActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
  appliedIndicator: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  appliedText: {
    fontWeight: "600",
  },

  /* Section */
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: spacing.sm,
  },

  /* Applicants */
  applicantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontWeight: "600",
  },
  applicantRating: {
    marginTop: spacing.xs,
  },
  assignBtn: {
    minWidth: 100,
  },

  /* Misc */
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
  },
  bodyText: {
    lineHeight: 20,
  },
});
