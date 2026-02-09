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
  ActivityIndicator,
  Linking
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  createTask,
  updateTask,
  getTaskById,
  uploadImages,
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

  const pickImageFromGallery = async () => {
    try {
      console.log("Platform:", Platform.OS);
      console.log("Checking media library permissions...");
      
      // Check current permission status first
      const permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log("Current permission status:", permissionResult.status);
      
      let finalStatus = permissionResult.status;
      
      // Only request if not already granted
      if (finalStatus !== "granted") {
        console.log("Requesting media library permissions...");
        const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = requestResult.status;
        console.log("Permission request result:", finalStatus);
      }
      
      if (finalStatus !== "granted") {
        const message = Platform.OS === "android"
          ? "Photo access is required to select images. Please enable it in Settings."
          : "Please allow access to your photo library to add images.";
        
        Alert.alert(
          "Permission Required",
          message,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "android") {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }

      // Android-specific configuration
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        allowsEditing: false,
      };

      if (Platform.OS === "android") {
        options.selectionLimit = 5;
      }

      console.log("Launching image library with options:", options);
      const result = await ImagePicker.launchImageLibraryAsync(options);
      
      console.log("Image picker result:", {
        canceled: result.canceled,
        assetsCount: result.assets?.length || 0,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        console.log("Selected images:", newUris.length);
        setFormData((prev) => ({
          ...prev,
          pictures: [...(prev.pictures || []), ...newUris],
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error", 
        `Failed to open image picker: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };
  
  const takePhoto = async () => {
    try {
      console.log("Platform:", Platform.OS);
      console.log("Checking camera permissions...");
      
      // Check current permission status first
      const permissionResult = await ImagePicker.getCameraPermissionsAsync();
      console.log("Current camera permission status:", permissionResult.status);
      
      let finalStatus = permissionResult.status;
      
      // Only request if not already granted
      if (finalStatus !== "granted") {
        console.log("Requesting camera permissions...");
        const requestResult = await ImagePicker.requestCameraPermissionsAsync();
        finalStatus = requestResult.status;
        console.log("Camera permission request result:", finalStatus);
      }
      
      if (finalStatus !== "granted") {
        const message = Platform.OS === "android"
          ? "Camera access is required to take photos. Please enable it in Settings."
          : "Please allow access to your camera to take photos.";
        
        Alert.alert(
          "Permission Required",
          message,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "android") {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }
  
      console.log("Launching camera...");
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
      });
      
      console.log("Camera result:", {
        canceled: result.canceled,
        hasAsset: !!result.assets?.[0],
      });
  
      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log("Photo taken:", imageUri);
        setFormData((prev) => ({
          ...prev,
          pictures: [...(prev.pictures || []), imageUri],
        }));
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert(
        "Error", 
        `Failed to open camera: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };
  

  const handleAddPicture = () => {
    Alert.alert("Add Picture", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickImageFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
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

  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      let pictureUrls = formData.pictures || [];

      // Separate local file URIs from already-uploaded server URLs
      const localImages = pictureUrls.filter((p) => p.startsWith("file://"));
      const remoteImages = pictureUrls.filter((p) => !p.startsWith("file://"));

      // Upload local images to server via multer
      if (localImages.length > 0) {
        const uploaded = await uploadImages(localImages);
        pictureUrls = [...remoteImages, ...uploaded];
      }

      const payload = { ...formData, pictures: pictureUrls };

      if (isEditMode) {
        updateTaskMutation.mutate(payload);
      } else {
        createTaskMutation.mutate(payload);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload images. Please try again.";
      console.error("Upload error:", error);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsUploading(false);
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

                {/* Image thumbnails grid */}
                <View style={styles.imageGrid}>
                  {formData.pictures &&
                    formData.pictures.map((pic, index) => (
                      <View key={index} style={styles.imageThumbContainer}>
                        <Image
                          source={{ uri: pic }}
                          style={[
                            styles.imageThumb,
                            { borderColor: theme.border },
                          ]}
                          contentFit="cover"
                        />
                        <TouchableOpacity
                          onPress={() => handleRemovePicture(index)}
                          style={[
                            styles.removeImageButton,
                            { backgroundColor: theme.danger },
                          ]}
                        >
                          <MaterialIcons
                            name="close"
                            size={14}
                            color={theme.white}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}

                  {/* Add image button */}
                  <TouchableOpacity
                    onPress={handleAddPicture}
                    style={[
                      styles.addImageButton,
                      {
                        borderColor: theme.primary,
                        backgroundColor: theme.surface,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="add-a-photo"
                      size={28}
                      color={theme.primary}
                    />
                    <Text
                      style={[
                        styles.addImageText,
                        {
                          color: theme.primary,
                          fontSize: typography.small.fontSize,
                        },
                      ]}
                    >
                      Add Photo
                    </Text>
                  </TouchableOpacity>
                </View>
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
                  isUploading
                    ? "Uploading images..."
                    : isEditMode
                    ? updateTaskMutation.isPending
                      ? "Updating..."
                      : "Update Task"
                    : createTaskMutation.isPending
                    ? "Creating..."
                    : "Create Task"
                }
                onPress={handleSubmit}
                loading={
                  isUploading ||
                  (isEditMode
                    ? updateTaskMutation.isPending
                    : createTaskMutation.isPending)
                }
                disabled={
                  isUploading ||
                  (isEditMode
                    ? updateTaskMutation.isPending
                    : createTaskMutation.isPending)
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
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  imageThumbContainer: {
    position: "relative",
  },
  imageThumb: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  addImageText: {
    fontWeight: "500",
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
