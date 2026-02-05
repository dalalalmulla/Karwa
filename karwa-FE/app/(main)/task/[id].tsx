import React, { useState, useEffect } from "react";
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
import { colors, spacing, typography } from "@/constants/theme";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import { useAuth } from "@/src/context/AuthContext";
import {
  getTaskById,
  assignWorker,
  markCompleteByWorker,
  confirmCompletion,
  type Task,
  type Applicant,
  type TaskUser,
} from "@/src/api/tasks";
import RatingModal from "@/components/RatingModal";


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

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
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

  const handleRateUser = (userId: string, userName: string) => {
    setRatingTarget({ userId, userName });
    setShowRatingModal(true);
  };

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

  const handleContactWhatsApp = () => {
    if (!id) return;
    const message = `Task reference - Karwa\nTask ID: ${id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Cannot open WhatsApp",
        "Please install WhatsApp or try again."
      );
    });
  };

  if (!id) {
    return (
      <WatermarkBackground style={styles.center}>
        <Text style={styles.errorText}>Missing task ID</Text>
        <Button
          title="Go back"
          onPress={() => router.back()}
          variant="secondary"
        />
      </WatermarkBackground>
    );
  }

  if (isLoading) {
    return (
      <WatermarkBackground style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading task...</Text>
      </WatermarkBackground>
    );
  }

  if (isError || !data) {
    return (
      <WatermarkBackground style={styles.center}>
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
      </WatermarkBackground>
    );
  }

  const { task, applicants } = data;
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
  // Check if task is completed (case-insensitive)
  const taskStatusUpper = task.status?.toUpperCase() || "";
  const isCompleted = taskStatusUpper === "COMPLETED";
  const canRate = isCompleted;
  
  // Calculate if rating buttons should show
  const showWorkerRatePoster = isWorker && canRate && !!task.posterId;
  const showPosterRateWorker = isPoster && canRate && !!task.assignedWorkerId;
  
  // Debug logging (remove in production)
  // React.useEffect(() => {
  //   console.log('=== Task Debug Info ===');
  //   console.log('Task Status:', task.status);
  //   console.log('Status Uppercase:', task.status?.toUpperCase());
  //   console.log('Is Completed:', isCompleted);
  //   console.log('Can Rate:', canRate);
  //   console.log('Is Poster:', isPoster);
  //   console.log('Is Worker:', isWorker);
  //   console.log('Has Poster ID:', !!task.posterId);
  //   console.log('Has Assigned Worker:', !!task.assignedWorkerId);
  //   console.log('User ID:', user?._id);
  //   console.log('Poster ID:', getPosterId(task));
  //   console.log('Worker ID:', getAssignedWorkerId(task));
  //   console.log('Show Worker Rate Poster:', showWorkerRatePoster);
  //   console.log('Show Poster Rate Worker:', showPosterRateWorker);
  //   console.log('======================');
  // }, [task, isPoster, isWorker, isCompleted, canRate, showWorkerRatePoster, showPosterRateWorker, user?._id]);

  console.log("TASK>>>>>>>",task)
  return (
    <WatermarkBackground style={{flex:1}}>
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

      {isWorker && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.bodyText}>
            Contact the task poster via WhatsApp. Your message will include the
            task ID so the agreement stays linked.
          </Text>
          <Button
            title="Contact via WhatsApp"
            onPress={handleContactWhatsApp}
            style={styles.confirmButton}
          />
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

      {/* Debug Info - Remove in production */}
      {/*__DEV__ && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <Text style={styles.ratingPrompt}>
            Status: {task.status}{'\n'}
            Status (Upper): {task.status?.toUpperCase()}{'\n'}
            Is Poster: {isPoster ? 'Yes' : 'No'}{'\n'}
            Is Worker: {isWorker ? 'Yes' : 'No'}{'\n'}
            Is Completed: {isCompleted ? 'Yes' : 'No'}{'\n'}
            Can Rate: {canRate ? 'Yes' : 'No'}{'\n'}
            Has Poster ID: {task.posterId ? 'Yes' : 'No'}{'\n'}
            Has Assigned Worker: {task.assignedWorkerId ? 'Yes' : 'No'}{'\n'}
            Show Worker Rate Poster: {showWorkerRatePoster ? 'Yes' : 'No'}{'\n'}
            Show Poster Rate Worker: {showPosterRateWorker ? 'Yes' : 'No'}{'\n'}
            User ID: {user?._id || 'None'}{'\n'}
            Poster ID: {getPosterId(task)}{'\n'}
            Worker ID: {getAssignedWorkerId(task) || 'None'}
          </Text>
        </Card>
      )*/}

      {/* Rating Section - Worker rates poster (only if task is COMPLETED) */}
      {showWorkerRatePoster && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rate the Poster</Text>
          <Text style={styles.ratingPrompt}>
            Share your experience working with {getPosterName(task)}
          </Text>
          <Button
            title="Rate Poster"
            onPress={() => {
              const posterId = getPosterId(task);
              handleRateUser(posterId, getPosterName(task));
            }}
            style={styles.confirmButton}
          />
        </Card>
      )}

      {/* Rating Section - Poster rates worker (only if task is COMPLETED) */}
      {showPosterRateWorker && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rate the Worker</Text>
          <Text style={styles.ratingPrompt}>
            How was the work? Rate the worker who completed this task.
          </Text>
          {typeof task.assignedWorkerId === "object" &&
          task.assignedWorkerId !== null ? (
            <Button
              title="Rate Worker"
              onPress={() => {
                const workerId = getAssignedWorkerId(task);
                if (workerId) {
                  handleRateUser(
                    workerId,
                    getApplicantName(task.assignedWorkerId as TaskUser)
                  );
                }
              }}
              style={styles.confirmButton}
            />
          ) : null}
        </Card>
      )}
      </ScrollView>

      {/* Rating Modal - Outside ScrollView */}
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
