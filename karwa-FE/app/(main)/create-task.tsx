import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createTaskApi } from "@/src/api/taskCalls";
import type { CreateTaskData, TaskType } from "@/src/types/taskTypes";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "home_service", label: "Home Service" },
  { value: "car_service", label: "Car Service" },
];

export default function CreateTaskScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateTaskData>({
    title: "",
    description: "",
    pictures: [],
    money: 0,
    location: "",
    type: "indoor",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateTaskData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTaskData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.money || formData.money <= 0) {
      newErrors.money = "Money amount must be greater than 0";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.type) {
      newErrors.type = "Task type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: CreateTaskData) => createTaskApi(data),
    onSuccess: () => {
      Alert.alert("Success", "Task created successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert(
        "Failed",
        error.message || "Failed to create task. Please try again."
      );
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    mutation.mutate({
      ...formData,
      money: Number(formData.money),
    });
  };

  const handleChange = (
    field: keyof CreateTaskData,
    value: string | number | TaskType
  ) => {
    setFormData((prev: CreateTaskData) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: Partial<Record<keyof CreateTaskData, string>>) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Task</Text>
          <Text style={styles.subtitle}>Post a task to find a worker</Text>

          <View style={styles.form}>
            <Input
              label="Title"
              placeholder="Enter task title"
              value={formData.title}
              onChangeText={(value) => handleChange("title", value)}
              error={errors.title}
              maxLength={200}
            />

            <Input
              label="Description"
              placeholder="Describe the task in detail"
              value={formData.description}
              onChangeText={(value) => handleChange("description", value)}
              error={errors.description}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={2000}
            />

            <View style={styles.section}>
              <Text style={styles.label}>Money (KWD)</Text>
              <Input
                placeholder="0.000"
                value={formData.money.toString()}
                onChangeText={(value) => {
                  const numValue = parseFloat(value) || 0;
                  handleChange("money", numValue);
                }}
                error={errors.money}
                keyboardType="decimal-pad"
                containerStyle={styles.inputContainer}
              />
            </View>

            <Input
              label="Location"
              placeholder="Enter task location"
              value={formData.location}
              onChangeText={(value) => handleChange("location", value)}
              error={errors.location}
              maxLength={200}
            />

            <View style={styles.section}>
              <Text style={styles.label}>Task Type</Text>
              <View style={styles.typeContainer}>
                {TASK_TYPES.map((taskType) => (
                  <TouchableOpacity
                    key={taskType.value}
                    style={[
                      styles.typeButton,
                      formData.type === taskType.value &&
                        styles.typeButtonActive,
                    ]}
                    onPress={() => handleChange("type", taskType.value)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === taskType.value &&
                          styles.typeButtonTextActive,
                      ]}
                    >
                      {taskType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.type && (
                <Text style={styles.errorText}>{errors.type}</Text>
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Points will be automatically calculated based on the money
                amount.
              </Text>
            </View>

            <Button
              title="Create Task"
              onPress={handleSubmit}
              loading={mutation.isPending}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    marginBottom: 0,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  typeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  infoBox: {
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.secondary,
  },
  errorText: {
    fontSize: typography.small.fontSize,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
