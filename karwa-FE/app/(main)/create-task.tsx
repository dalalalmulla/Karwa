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
  Linking,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/src/context/ThemeContext";
import { useAuth } from "@/src/context/AuthContext";
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
import kuwaitRegionsData from "@/src/data/kuwait_regions";


const TASK_TYPES: { label: string; value: TaskType }[] = [
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
];

interface Governorate {
  label: string;
  value: string;
  areas: { label: string; value: string }[];
}

// Transform the JSON data into the expected format
const KUWAIT_GOVERNORATES: Governorate[] = [
  ...Object.values(kuwaitRegionsData).map((gov: any) => ({
    label: gov.label,
    value: gov.value,
    areas: gov.areas,
  })),
  {
    label: "Other",
    value: "Other",
    areas: [],
  },
];

export default function CreateTaskScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme, typography } = useTheme();
  const { token } = useAuth();
  const { taskId, editMode } = useLocalSearchParams<{
    taskId?: string;
    editMode?: string;
  }>();
  const isEditMode = editMode === "true" && !!taskId;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.replace("/(auth)/login");
    }
  }, [token, router]);

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

  // Helper function to parse location string
  const parseLocation = (locationString: string) => {
    // Try to parse format: "Governorate > Area, Block X, Street Y, Avenue Z, House/Flat W"
    const governorateMatch = locationString.match(/([^>]+)\s*>\s*([^,]+)/);
    
    if (governorateMatch) {
      const govName = governorateMatch[1].trim();
      const areaName = governorateMatch[2].trim();
      
      const gov = KUWAIT_GOVERNORATES.find(
        (g) => g.label === govName || g.value === govName
      );
      
      if (gov) {
        const area = gov.areas.find(
          (a) => a.label === areaName || a.value === areaName
        );
        
        if (area) {
          setSelectedGovernorate(gov.value);
          setSelectedArea(area.value);
          // Try to extract address details from location string
          const blockMatch = locationString.match(/Block\s*(\d+)/i);
          const streetMatch = locationString.match(/Street\s*(\d+)/i);
          const avenueMatch = locationString.match(/Avenue\s*([^,]+)/i);
          const houseMatch = locationString.match(/House[\/\s]*Flat\s*([^,]+)/i);
          setAddressDetails({
            blockNumber: blockMatch ? blockMatch[1] : "",
            streetNumber: streetMatch ? streetMatch[1] : "",
            avenue: avenueMatch ? avenueMatch[1].trim() : "",
            houseFlatNumber: houseMatch ? houseMatch[1].trim() : "",
          });
          return;
        }
      }
    }
    
    // Try simpler format - just check if it matches any area directly
    for (const gov of KUWAIT_GOVERNORATES) {
      for (const area of gov.areas) {
        if (locationString === area.value || locationString === area.label) {
          setSelectedGovernorate(gov.value);
          setSelectedArea(area.value);
          setAddressDetails({
            blockNumber: "",
            streetNumber: "",
            avenue: "",
            houseFlatNumber: "",
          });
          return;
        }
      }
    }
    
    // If not found, it's custom
    setSelectedGovernorate("Other");
    setSelectedArea(null);
    setCustomLocation(locationString);
    setAddressDetails({
      blockNumber: "",
      streetNumber: "",
      avenue: "",
      houseFlatNumber: "",
    });
  };

  // Helper function to build location string
  const buildLocationString = (
    governorate: string,
    area: string | null,
    details: typeof addressDetails
  ): string => {
    if (governorate === "Other") {
      return customLocation;
    }
    if (!area) return "";
    
    const parts: string[] = [`${governorate} > ${area}`];
    if (details.blockNumber) parts.push(`Block ${details.blockNumber}`);
    if (details.streetNumber) parts.push(`Street ${details.streetNumber}`);
    if (details.avenue) parts.push(`Avenue ${details.avenue}`);
    if (details.houseFlatNumber) parts.push(`House/Flat ${details.houseFlatNumber}`);
    
    return parts.join(", ");
  };

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
      // Parse location to set governorate, area, and address details
      if (task.location) {
        parseLocation(task.location);
      }
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
    } else {
      // Check if location has required address details
      const hasBlock = formData.location.includes("Block");
      const hasStreet = formData.location.includes("Street");
      const hasHouseFlat = formData.location.includes("House/Flat") || formData.location.includes("House/ Flat");
      
      // If location contains ">" it means governorate and area are selected
      // In that case, validate address details are present
      if (formData.location.includes(">") && !formData.location.includes("Other")) {
        if (!hasBlock) {
          newErrors.location = "Block number is required";
        } else if (!hasStreet) {
          newErrors.location = "Street number is required";
        } else if (!hasHouseFlat) {
          newErrors.location = "House/Flat number is required";
        }
      }
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
      queryClient.invalidateQueries({ queryKey: ["tasks", "open"] });
      Alert.alert("Success", "Task created successfully!", [
        { 
          text: "OK", 
          onPress: () => {
            // Navigate to home tab after successful creation
            router.replace("/(main)/(tabs)");
          }
        },
      ]);
    },
    onError: (error: Error) => {
      console.error("Create task error:", error);
      Alert.alert(
        "Error", 
        error.message || "Failed to create task. Please check your connection and try again."
      );
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
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState("");
  const [addressDetails, setAddressDetails] = useState({
    blockNumber: "",
    streetNumber: "",
    avenue: "",
    houseFlatNumber: "",
  });

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
                  Location *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.locationSelector,
                    {
                      backgroundColor: theme.surface,
                      borderColor: errors.location
                        ? theme.danger
                        : theme.border,
                      borderWidth: errors.location ? 2 : 1.5,
                    },
                  ]}
                  onPress={() => {
                    // Parse existing location when opening modal
                    if (formData.location) {
                      parseLocation(formData.location);
                    } else {
                      setSelectedGovernorate(null);
                      setSelectedArea(null);
                      setCustomLocation("");
                      setAddressDetails({
                        blockNumber: "",
                        streetNumber: "",
                        avenue: "",
                        houseFlatNumber: "",
                      });
                    }
                    setIsLocationModalVisible(true);
                  }}
                >
                  <Text
                    style={[
                      styles.locationSelectorText,
                      {
                        color: formData.location
                          ? theme.text
                          : theme.textMuted,
                        fontSize: typography.body.fontSize,
                      },
                    ]}
                  >
                    {formData.location || "Select location"}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
                {errors.location && (
                  <Text
                    style={[
                      styles.errorText,
                      {
                        color: theme.danger,
                        fontSize: typography.small.fontSize,
                      },
                    ]}
                  >
                    {errors.location}
                  </Text>
                )}

                {/* Location Modal */}
                <Modal
                  visible={isLocationModalVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => {
                    setIsLocationModalVisible(false);
                    setSelectedGovernorate(null);
                    setSelectedArea(null);
                    setCustomLocation("");
                    setAddressDetails({
                      blockNumber: "",
                      streetNumber: "",
                      avenue: "",
                      houseFlatNumber: "",
                    });
                  }}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                      setIsLocationModalVisible(false);
                      setSelectedGovernorate(null);
                      setSelectedArea(null);
                      setCustomLocation("");
                      setAddressDetails({
                        blockNumber: "",
                        streetNumber: "",
                        avenue: "",
                        houseFlatNumber: "",
                      });
                    }}
                  >
                    <View
                      style={[
                        styles.modalContent,
                        { backgroundColor: theme.surface },
                      ]}
                      onStartShouldSetResponder={() => true}
                    >
                      <View style={styles.modalHeader}>
                        <TouchableOpacity
                          onPress={() => {
                            if (selectedArea) {
                              setSelectedArea(null);
                              setAddressDetails({
                                blockNumber: "",
                                streetNumber: "",
                                avenue: "",
                                houseFlatNumber: "",
                              });
                            } else if (selectedGovernorate) {
                              setSelectedGovernorate(null);
                              setSelectedArea(null);
                              setCustomLocation("");
                              setAddressDetails({
                                blockNumber: "",
                                streetNumber: "",
                                avenue: "",
                                houseFlatNumber: "",
                              });
                            } else {
                              setIsLocationModalVisible(false);
                              setSelectedGovernorate(null);
                              setSelectedArea(null);
                              setCustomLocation("");
                              setAddressDetails({
                                blockNumber: "",
                                streetNumber: "",
                                avenue: "",
                                houseFlatNumber: "",
                              });
                            }
                          }}
                        >
                          <MaterialIcons
                            name={
                              selectedArea
                                ? "arrow-back"
                                : selectedGovernorate
                                ? "arrow-back"
                                : "close"
                            }
                            size={24}
                            color={theme.text}
                          />
                        </TouchableOpacity>
                        <Text
                          style={[
                            styles.modalTitle,
                            {
                              color: theme.text,
                              fontSize: typography.heading.fontSize,
                            },
                          ]}
                        >
                          {selectedArea
                            ? "Enter Address Details"
                            : selectedGovernorate
                            ? selectedGovernorate === "Other"
                              ? "Enter Location"
                              : "Select Area"
                            : "Select Governorate"}
                        </Text>
                        <View style={{ width: 24 }} />
                      </View>
                      <ScrollView
                        style={styles.modalScrollView}
                        showsVerticalScrollIndicator={false}
                      >
                        {!selectedGovernorate ? (
                          // Show governorates
                          KUWAIT_GOVERNORATES.map((governorate) => (
                            <TouchableOpacity
                              key={governorate.value}
                              style={[
                                styles.locationOption,
                                {
                                  backgroundColor: theme.background,
                                  borderBottomColor: theme.border,
                                },
                              ]}
                              onPress={() => {
                                setSelectedGovernorate(governorate.value);
                                if (governorate.value === "Other") {
                                  setCustomLocation(formData.location || "");
                                }
                              }}
                            >
                              <Text
                                style={[
                                  styles.locationOptionText,
                                  {
                                    color: theme.text,
                                    fontSize: typography.body.fontSize,
                                    fontWeight: "500",
                                  },
                                ]}
                              >
                                {governorate.label}
                              </Text>
                              <MaterialIcons
                                name="chevron-right"
                                size={20}
                                color={theme.textMuted}
                              />
                            </TouchableOpacity>
                          ))
                        ) : selectedGovernorate === "Other" ? (
                          // Show text input for "Other"
                          <View style={styles.otherLocationContainer}>
                            <Input
                              label="Enter Location"
                              placeholder="Type your location"
                              value={customLocation}
                              onChangeText={(value) => {
                                setCustomLocation(value);
                                handleChange("location", value);
                              }}
                              error={errors.location}
                              autoFocus
                            />
                            <Button
                              title="Confirm"
                              onPress={() => {
                                if (customLocation.trim()) {
                                  setIsLocationModalVisible(false);
                                  setSelectedGovernorate(null);
                                  setCustomLocation("");
                                }
                              }}
                              disabled={!customLocation.trim()}
                              style={styles.confirmButton}
                            />
                          </View>
                        ) : selectedArea ? (
                          // Show address detail fields after area selection
                          <View style={styles.addressDetailsContainer}>
                            <Text
                              style={[
                                styles.addressSectionTitle,
                                {
                                  color: theme.text,
                                  fontSize: typography.body.fontSize,
                                  fontWeight: "600",
                                },
                              ]}
                            >
                              {(() => {
                                const gov = KUWAIT_GOVERNORATES.find(
                                  (g) => g.value === selectedGovernorate
                                );
                                const area = gov?.areas.find(
                                  (a) => a.value === selectedArea
                                );
                                return `${gov?.label} > ${area?.label}`;
                              })()}
                            </Text>

                            <Input
                              label="Block Number *"
                              placeholder="Enter block number"
                              value={addressDetails.blockNumber}
                              onChangeText={(value) => {
                                setAddressDetails((prev) => ({
                                  ...prev,
                                  blockNumber: value,
                                }));
                                const newLocation = buildLocationString(
                                  selectedGovernorate!,
                                  selectedArea,
                                  { ...addressDetails, blockNumber: value }
                                );
                                handleChange("location", newLocation);
                              }}
                              keyboardType="numeric"
                            />

                            <Input
                              label="Street Number *"
                              placeholder="Enter street number"
                              value={addressDetails.streetNumber}
                              onChangeText={(value) => {
                                setAddressDetails((prev) => ({
                                  ...prev,
                                  streetNumber: value,
                                }));
                                const newLocation = buildLocationString(
                                  selectedGovernorate!,
                                  selectedArea,
                                  { ...addressDetails, streetNumber: value }
                                );
                                handleChange("location", newLocation);
                              }}
                              keyboardType="numeric"
                            />

                            <Input
                              label="Avenue (Optional)"
                              placeholder="Enter avenue name"
                              value={addressDetails.avenue}
                              onChangeText={(value) => {
                                setAddressDetails((prev) => ({
                                  ...prev,
                                  avenue: value,
                                }));
                                const newLocation = buildLocationString(
                                  selectedGovernorate!,
                                  selectedArea,
                                  { ...addressDetails, avenue: value }
                                );
                                handleChange("location", newLocation);
                              }}
                            />

                            <Input
                              label="House/Flat Number *"
                              placeholder="Enter house or flat number"
                              value={addressDetails.houseFlatNumber}
                              onChangeText={(value) => {
                                setAddressDetails((prev) => ({
                                  ...prev,
                                  houseFlatNumber: value,
                                }));
                                const newLocation = buildLocationString(
                                  selectedGovernorate!,
                                  selectedArea,
                                  { ...addressDetails, houseFlatNumber: value }
                                );
                                handleChange("location", newLocation);
                              }}
                            />

                            <Button
                              title="Confirm Address"
                              onPress={() => {
                                if (
                                  addressDetails.blockNumber.trim() &&
                                  addressDetails.streetNumber.trim() &&
                                  addressDetails.houseFlatNumber.trim()
                                ) {
                                  const finalLocation = buildLocationString(
                                    selectedGovernorate!,
                                    selectedArea,
                                    addressDetails
                                  );
                                  handleChange("location", finalLocation);
                                  setIsLocationModalVisible(false);
                                  setSelectedGovernorate(null);
                                  setSelectedArea(null);
                                  setAddressDetails({
                                    blockNumber: "",
                                    streetNumber: "",
                                    avenue: "",
                                    houseFlatNumber: "",
                                  });
                                }
                              }}
                              disabled={
                                !addressDetails.blockNumber.trim() ||
                                !addressDetails.streetNumber.trim() ||
                                !addressDetails.houseFlatNumber.trim()
                              }
                              style={styles.confirmButton}
                            />
                          </View>
                        ) : (
                          // Show areas for selected governorate
                          (() => {
                            const governorate = KUWAIT_GOVERNORATES.find(
                              (g) => g.value === selectedGovernorate
                            );
                            return governorate?.areas.map((area) => {
                              const isSelected = selectedArea === area.value;
                              return (
                                <TouchableOpacity
                                  key={area.value}
                                  style={[
                                    styles.locationOption,
                                    {
                                      backgroundColor: isSelected
                                        ? theme.primarySoft
                                        : theme.background,
                                      borderBottomColor: theme.border,
                                    },
                                  ]}
                                  onPress={() => {
                                    setSelectedArea(area.value);
                                    // Reset address details when selecting new area
                                    setAddressDetails({
                                      blockNumber: "",
                                      streetNumber: "",
                                      avenue: "",
                                      houseFlatNumber: "",
                                    });
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.locationOptionText,
                                      {
                                        color: isSelected
                                          ? theme.primary
                                          : theme.text,
                                        fontSize: typography.body.fontSize,
                                        fontWeight: isSelected ? "600" : "400",
                                      },
                                    ]}
                                  >
                                    {area.label}
                                  </Text>
                                  {isSelected && (
                                    <MaterialIcons
                                      name="check"
                                      size={20}
                                      color={theme.primary}
                                    />
                                  )}
                                  {!isSelected && (
                                    <MaterialIcons
                                      name="chevron-right"
                                      size={20}
                                      color={theme.textMuted}
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            });
                          })()
                        )}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

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
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 48,
  },
  locationSelectorText: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "70%",
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalTitle: {
    fontWeight: "700",
  },
  modalScrollView: {
    maxHeight: 400,
  },
  locationOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  locationOptionText: {
    flex: 1,
  },
  otherLocationContainer: {
    padding: spacing.lg,
  },
  addressDetailsContainer: {
    padding: spacing.lg,
  },
  addressSectionTitle: {
    marginBottom: spacing.md,
    textAlign: "center",
  },
  confirmButton: {
    marginTop: spacing.md,
  },
});
