import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing } from "@/constants/Karwa.theme";
import Card from "./ui/Card";
import Button from "./ui/Button";
import StarRating from "./ui/StarRating";
import { createOrUpdateRating, getRating } from "@/src/api/ratings";
import type { CreateRatingData } from "@/src/types/ratingTypes";

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
  const { theme, typography } = useTheme();
  const [selectedRating, setSelectedRating] = useState(0);

  const { data: ratingData, isLoading: isLoadingRating } = useQuery({
    queryKey: ["rating", taskId],
    queryFn: () => getRating(taskId),
    enabled: visible && !!taskId,
  });

  useEffect(() => {
    if (ratingData?.rating) {
      setSelectedRating(ratingData.rating.rating);
    } else {
      setSelectedRating(0);
    }
  }, [ratingData, visible]);

  const submitRating = useMutation({
    mutationFn: (data: CreateRatingData) => createOrUpdateRating(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rating", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      onRatingSubmitted?.();
      onClose();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to save rating");
    },
  });

  const handleSubmit = () => {
    if (selectedRating === 0) return;
    submitRating.mutate({ taskId, ratedUserId, rating: selectedRating });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card
          style={[styles.modalContent, { backgroundColor: theme.surface }]}
          variant="elevated"
        >
          {isLoadingRating ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text,
                    fontSize: typography.heading.fontSize,
                  },
                ]}
              >
                Rate {ratedUserName}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.textSecondary,
                    fontSize: typography.body.fontSize,
                  },
                ]}
              >
                How would you rate your experience?
              </Text>

              <View style={styles.ratingContainer}>
                <StarRating
                  rating={selectedRating}
                  onRatingChange={setSelectedRating}
                  size={40}
                  editable
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
                  title={ratingData?.rating ? "Update" : "Submit"}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    padding: spacing.lg,
  },
  title: {
    fontWeight: "600",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  ratingContainer: {
    alignItems: "center",
    marginVertical: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
});
