import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Card from './ui/Card';
import Button from './ui/Button';
import StarRating from './ui/StarRating';
import { createOrUpdateRating, getRating } from '@/src/api/ratings';
import type { CreateRatingData } from '@/src/types/ratingTypes';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  taskId: string;
  ratedUserId: string;
  ratedUserName: string;
  onRatingSubmitted?: () => void;
}

export default function RatingModal({
  visible,
  onClose,
  taskId,
  ratedUserId,
  ratedUserName,
  onRatingSubmitted,
}: RatingModalProps) {
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState(0);

  // Fetch existing rating
  const { data: ratingData, isLoading: isLoadingRating } = useQuery({
    queryKey: ['rating', taskId],
    queryFn: () => getRating(taskId),
    enabled: visible && !!taskId,
  });

  // Set initial rating if exists
  useEffect(() => {
    if (ratingData?.rating) {
      setSelectedRating(ratingData.rating.rating);
    } else {
      setSelectedRating(0);
    }
  }, [ratingData, visible]);

  // Submit rating mutation
  const submitRating = useMutation({
    mutationFn: (data: CreateRatingData) => createOrUpdateRating(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      onRatingSubmitted?.();
      onClose();
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to save rating');
    },
  });

  const handleSubmit = () => {
    if (selectedRating === 0) {
      return;
    }

    submitRating.mutate({
      taskId,
      ratedUserId,
      rating: selectedRating,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card style={styles.modalContent}>
          {isLoadingRating ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Text style={styles.title}>Rate {ratedUserName}</Text>
              <Text style={styles.subtitle}>
                How would you rate your experience?
              </Text>

              <View style={styles.ratingContainer}>
                <StarRating
                  rating={selectedRating}
                  onRatingChange={setSelectedRating}
                  size={40}
                  editable={true}
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Cancel"
                  onPress={onClose}
                  variant="secondary"
                  style={styles.button}
                />
                <Button
                  title={ratingData?.rating ? 'Update Rating' : 'Submit Rating'}
                  onPress={handleSubmit}
                  disabled={selectedRating === 0 || submitRating.isPending}
                  loading={submitRating.isPending}
                  style={styles.button}
                />
              </View>
            </>
          )}
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
});

