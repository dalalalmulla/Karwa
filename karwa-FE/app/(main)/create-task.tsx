import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import {
  createTask,
  updateTask,
  getTaskById,
  CreateTaskData,
  TaskType,
} from "@/src/api/tasks";

const TASK_TYPES: { label: string; value: TaskType }[] = [
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
];

export default function CreateTaskScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme, typography } = useTheme();
  const { taskId, editMode } = useLocalSearchParams<{
    taskId?: string;
    editMode?: string;
  }>();
  const isEditMode = editMode === "true" && !!taskId;

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
  const [pictureInput, setPictureInput] = useState("");

  // Fetch task data if in edit mode
  const { data: taskData, isLoading: isLoadingTask } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId!),
    enabled: isEditMode && !!taskId,
  });

  // Populate form when task data is loaded
  useEffect(() => {
    if (isEditMode && taskData?.task) {
      const task = taskData.task;
      setFormData({
        title: task.title || "",
        description: task.description || "",
        pictures: task.pictures || [],
        money: task.money || 0,
        location: task.location || "",
        type: (task.type as TaskType) || "indoor",
      });
    }
  }, [isEditMode, taskData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTaskData, string>> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (!formData.money || formData.money <= 0) {
      newErrors.money = "Amount in KWD must be greater than 0";
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

  const handleAddPicture = () => {
    const trimmedUrl = pictureInput.trim();
    if (!trimmedUrl) {
      Alert.alert("Error", "Please enter an image URL");
      return;
    }
    try {
      new URL(trimmedUrl);
    } catch {
      Alert.alert("Error", "Please enter a valid URL");
      return;
    }
    if (formData.pictures?.includes(trimmedUrl)) {
      Alert.alert("Error", "This image URL has already been added");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      pictures: [...(prev.pictures || []), trimmedUrl],
    }));
    setPictureInput("");
  };

  const handleRemovePicture = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pictures: prev.pictures?.filter((_, i) => i !== index) || [],
    }));
  };

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      Alert.alert("Success", "Task created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to create task");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => updateTask(taskId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      Alert.alert("Success", "Task updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to update task");
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (isEditMode) {
      updateTaskMutation.mutate(formData);
    } else {
      createTaskMutation.mutate(formData);
    }
  };

  const handleChange = (
    field: keyof CreateTaskData,
    value: string | number | TaskType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isEditMode && isLoadingTask) {
    return (
      <WatermarkBackground style={styles.center}>
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

  return (
    <WatermarkBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.textTitle,
                  fontSize: typography.title.fontSize,
                },
              ]}
            >
              {isEditMode ? "Edit Task" : "Create New Task"}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.textSecondary,
                  fontSize: typography.caption.fontSize,
                },
              ]}
            >
              {isEditMode
                ? "Update the task details"
                : "Fill in the details to post your task"}
            </Text>

            <View style={styles.form}>
              <Input
                label="Title *"
                placeholder="Enter task title"
                value={formData.title}
                onChangeText={(value) => handleChange("title", value)}
                error={errors.title}
                maxLength={100}
              />

              <Input
                label="Description *"
                placeholder="Describe your task in detail"
                value={formData.description}
                onChangeText={(value) => handleChange("description", value)}
                error={errors.description}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.textArea}
              />

              <View style={styles.pictureSection}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: theme.text,
                      fontSize: typography.caption.fontSize,
                    },
                  ]}
                >
                  Pictures (Optional)
                </Text>
                <View style={styles.pictureInputRow}>
                  <Input
                    placeholder="Enter image URL"
                    value={pictureInput}
                    onChangeText={setPictureInput}
                    containerStyle={styles.pictureInput}
                    onSubmitEditing={handleAddPicture}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={handleAddPicture}
                    style={[
                      styles.addButtonTouchable,
                      { backgroundColor: theme.primary },
                      !pictureInput.trim() && {
                        backgroundColor: theme.surfaceAlt,
                        opacity: 0.5,
                      },
                    ]}
                    disabled={!pictureInput.trim()}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        { color: theme.white },
                        !pictureInput.trim() && {
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
                {formData.pictures && formData.pictures.length > 0 && (
                  <View style={styles.pictureList}>
                    {formData.pictures.map((pic, index) => (
                      <View
                        key={index}
                        style={[
                          styles.pictureItem,
                          {
                            backgroundColor: theme.surface,
                            borderRadius: borderRadius.md,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pictureText,
                            {
                              color: theme.text,
                              fontSize: typography.caption.fontSize,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {pic}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemovePicture(index)}
                          style={[
                            styles.removeButton,
                            { backgroundColor: theme.danger },
                          ]}
                        >
                          <Text
                            style={[
                              styles.removeButtonText,
                              { color: theme.white },
                            ]}
                          >
                            ×
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <Input
                label="Money (KWD) *"
                placeholder="Enter amount in Kuwaiti Dinar"
                value={formData.money.toString()}
                onChangeText={(value) => {
                  const numValue = parseFloat(value) || 0;
                  handleChange("money", numValue);
                }}
                error={errors.money}
                keyboardType="numeric"
              />

              <Input
                label="Location *"
                placeholder="Enter task location"
                value={formData.location}
                onChangeText={(value) => handleChange("location", value)}
                error={errors.location}
              />

              <View style={styles.pickerContainer}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: theme.text,
                      fontSize: typography.caption.fontSize,
                    },
                  ]}
                >
                  Task Type *
                </Text>
                <View style={styles.typeSelector}>
                  {TASK_TYPES.map((type) => {
                    const isSelected = formData.type === type.value;
                    return (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.typeButton,
                          {
                            borderColor: isSelected
                              ? theme.primary
                              : theme.border,
                            backgroundColor: isSelected
                              ? theme.primary
                              : theme.surface,
                          },
                        ]}
                        onPress={() => handleChange("type", type.value)}
                      >
                        <Text
                          style={[
                            styles.typeButtonText,
                            {
                              color: isSelected ? theme.white : theme.text,
                              fontSize: typography.body.fontSize,
                            },
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.type && (
                  <Text
                    style={[
                      styles.errorText,
                      {
                        color: theme.danger,
                        fontSize: typography.small.fontSize,
                      },
                    ]}
                  >
                    {errors.type}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: theme.textSecondary,
                      fontSize: typography.caption.fontSize,
                    },
                  ]}
                >
                  Points will be automatically calculated based on task type
                  and amount in KWD.
                </Text>
              </View>

              <Button
                title={
                  isEditMode
                    ? updateTaskMutation.isPending
                      ? "Updating..."
                      : "Update Task"
                    : createTaskMutation.isPending
                    ? "Creating..."
                    : "Create Task"
                }
                onPress={handleSubmit}
                loading={
                  isEditMode
                    ? updateTaskMutation.isPending
                    : createTaskMutation.isPending
                }
                disabled={
                  isEditMode
                    ? updateTaskMutation.isPending
                    : createTaskMutation.isPending
                }
                style={styles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WatermarkBackground>
  );
}

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
  scrollContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  form: {
    marginTop: spacing.md,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  pictureSection: {
    marginBottom: spacing.md,
  },
  pictureInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  pictureInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButtonTouchable: {
    marginTop: 24,
    minWidth: 80,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  addButtonText: {
    fontWeight: "600",
  },
  pictureList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  pictureItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  pictureText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pickerContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  typeButtonText: {
    fontWeight: "500",
  },
  errorText: {
    marginTop: spacing.xs,
  },
  infoBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  infoText: {
    lineHeight: 18,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  loadingText: {
    marginTop: spacing.md,
  },
});
