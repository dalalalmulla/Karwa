import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import RatingModal from '@/components/RatingModal';
import { getTaskById } from '@/src/api/tasks';
import { applyToTask } from '@/src/api/applications';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [showApplications, setShowApplications] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  // Fetch task details
  const {
    data: taskData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId!),
    enabled: !!taskId,
  });

  // Apply to task mutation
  const applyMutation = useMutation({
    mutationFn: () => applyToTask({ taskId: taskId! }),
    onSuccess: () => {
      Alert.alert('Success', 'Your application has been submitted!');
      // Refetch task details to update hasApplied status
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to apply to task');
    },
  });

  const handleApply = () => {
    if (taskData?.task.hasApplied) {
      Alert.alert('Already Applied', 'You have already applied to this task');
      return;
    }

    Alert.alert(
      'Apply to Task',
      'Are you sure you want to apply to this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => applyMutation.mutate(),
        },
      ]
    );
  };

  const handleRateUser = (userId: string, userName: string) => {
    setRatingTarget({ userId, userName });
    setShowRatingModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (error || !taskData?.task) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Failed to load task details'}
        </Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }

  const task = taskData.task;
  const isPoster = task.applications !== undefined;
  const posterName = task.poster.firstName || task.poster.lastName
    ? `${task.poster.firstName || ''} ${task.poster.lastName || ''}`.trim()
    : task.poster.email;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <IconSymbol key={i} name="star.fill" size={16} color={colors.warning} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <IconSymbol key={i} name="star.lefthalf.fill" size={16} color={colors.warning} />
        );
      } else {
        stars.push(
          <IconSymbol key={i} name="star" size={16} color={colors.gray300} />
        );
      }
    }
    return stars;
  };

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Task Title */}
      <Card style={styles.card}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
      </Card>

      {/* Description */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{task.description}</Text>
      </Card>

      {/* Details Grid */}
      <Card style={styles.card}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <IconSymbol name="dollarsign.circle.fill" size={24} color={colors.success} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>{task.money} KWD</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <IconSymbol name="star.fill" size={24} color={colors.warning} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Points</Text>
              <Text style={styles.detailValue}>{task.points}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <IconSymbol name="location.fill" size={24} color={colors.danger} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{task.location}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <IconSymbol name="clock.fill" size={24} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Posted</Text>
              <Text style={styles.detailValue}>{formatDate(task.createdAt)}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Poster Information */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Posted By</Text>
        <View style={styles.posterInfo}>
          <View style={styles.posterDetails}>
            <Text style={styles.posterName}>{posterName}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(task.poster.rating)}
              <Text style={styles.ratingText}>
                {task.poster.rating > 0 ? task.poster.rating.toFixed(1) : 'No rating'}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Applications List (Only for Poster) */}
      {isPoster && task.applications && task.applications.length > 0 && (
        <Card style={styles.card}>
          <TouchableOpacity
            onPress={() => setShowApplications(!showApplications)}
            style={styles.applicationsHeader}>
            <Text style={styles.sectionTitle}>
              Applications ({task.applications.length})
            </Text>
            <IconSymbol
              name={showApplications ? 'chevron.up' : 'chevron.down'}
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>

          {showApplications && (
            <View style={styles.applicationsList}>
              {task.applications.map((application) => {
                const workerName =
                  application.workerId.firstName || application.workerId.lastName
                    ? `${application.workerId.firstName || ''} ${application.workerId.lastName || ''}`.trim()
                    : application.workerId.email;

                return (
                  <View key={application._id} style={styles.applicationItem}>
                    <View style={styles.applicationInfo}>
                      <Text style={styles.applicationName}>{workerName}</Text>
                      <Text style={styles.applicationEmail}>{application.workerId.email}</Text>
                      <Text style={styles.applicationDate}>
                        Applied: {formatDate(application.createdAt)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        application.status === 'ACCEPTED' && styles.statusAccepted,
                        application.status === 'REJECTED' && styles.statusRejected,
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          application.status === 'ACCEPTED' && styles.statusTextAccepted,
                          application.status === 'REJECTED' && styles.statusTextRejected,
                        ]}>
                        {application.status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      )}

      {/* Apply Button (Only if not poster and not already applied) */}
      {!isPoster && task.status === 'OPEN' && (
        <View style={styles.applyContainer}>
          <Button
            title={task.hasApplied ? 'Already Applied' : 'Apply to Task'}
            onPress={handleApply}
            disabled={task.hasApplied || applyMutation.isPending}
            style={
              task.hasApplied
                ? { ...styles.applyButton, ...styles.applyButtonDisabled }
                : styles.applyButton
            }
          />
          {applyMutation.isPending && (
            <ActivityIndicator
              size="small"
              color={colors.white}
              style={styles.loadingIndicator}
            />
          )}
        </View>
      )}

      {/* Status message if task is not open */}
      {!isPoster && task.status !== 'OPEN' && (
        <Card style={styles.card}>
          <Text style={styles.closedMessage}>
            This task is {task.status.toLowerCase().replace('_', ' ')} and no longer accepting applications.
          </Text>
        </Card>
      )}

      {/* Rating Section - Worker rates poster (only if task is COMPLETED) */}
      {!isPoster && task.status === 'COMPLETED' && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rate the Poster</Text>
          <Text style={styles.ratingDescription}>
            Share your experience working with {posterName}
          </Text>
          <Button
            title="Rate Poster"
            onPress={() => handleRateUser(task.poster._id, posterName)}
            style={styles.ratingButton}
          />
        </Card>
      )}

      {/* Rating Section - Poster rates workers (only if task is COMPLETED) */}
      {isPoster && task.status === 'COMPLETED' && task.applications && task.applications.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rate Workers</Text>
          <Text style={styles.ratingDescription}>
            Rate the workers who completed this task
          </Text>
          {task.applications
            .filter((app) => app.status === 'ACCEPTED')
            .map((app) => {
              const workerName =
                app.workerId.firstName || app.workerId.lastName
                  ? `${app.workerId.firstName || ''} ${app.workerId.lastName || ''}`.trim()
                  : app.workerId.email;
              return (
                <View key={app._id} style={styles.ratingItem}>
                  <View style={styles.ratingItemInfo}>
                    <Text style={styles.ratingItemName}>{workerName}</Text>
                    <Text style={styles.ratingItemEmail}>{app.workerId.email}</Text>
                  </View>
                  <Button
                    title="Rate"
                    onPress={() => handleRateUser(app.workerId._id, workerName)}
                    variant="secondary"
                    style={styles.ratingItemButton}
                  />
                </View>
              );
            })}
        </Card>
      )}
    </ScrollView>

    {/* Rating Modal - Outside ScrollView */}
    {ratingTarget && (
      <RatingModal
        visible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRatingTarget(null);
        }}
        taskId={taskId!}
        ratedUserId={ratingTarget.userId}
        ratedUserName={ratingTarget.userName}
        onRatingSubmitted={() => {
          // Refetch task to update ratings
          queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        }}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.secondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  card: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.secondary,
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.md,
  },
  detailContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  posterInfo: {
    marginTop: spacing.sm,
  },
  posterDetails: {
    marginTop: spacing.xs,
  },
  posterName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.caption,
    color: colors.secondary,
    marginLeft: spacing.xs,
  },
  applicationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationsList: {
    marginTop: spacing.md,
  },
  applicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  applicationEmail: {
    ...typography.caption,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  applicationDate: {
    ...typography.small,
    color: colors.secondary,
  },
  statusBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusAccepted: {
    backgroundColor: colors.greenPale,
  },
  statusRejected: {
    backgroundColor: colors.gray300,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  statusTextAccepted: {
    color: colors.greenDark,
  },
  statusTextRejected: {
    color: colors.gray700,
  },
  applyContainer: {
    marginTop: spacing.md,
    position: 'relative',
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  applyButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  loadingIndicator: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    marginTop: -10,
  },
  closedMessage: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ratingDescription: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  ratingButton: {
    marginTop: spacing.sm,
  },
  ratingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ratingItemInfo: {
    flex: 1,
  },
  ratingItemName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingItemEmail: {
    ...typography.caption,
    color: colors.secondary,
  },
  ratingItemButton: {
    minWidth: 80,
  },
});

