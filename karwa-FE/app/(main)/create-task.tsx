import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import WatermarkBackground from '@/components/ui/WatermarkBackground';
import { createTask, CreateTaskData, TaskType } from '@/src/api/tasks';

const TASK_TYPES: { label: string; value: TaskType }[] = [
  { label: 'Indoor', value: 'indoor' },
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Home Service', value: 'home_service' },
  { label: 'Car Service', value: 'car_service' },
];

export default function CreateTaskScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    pictures: [],
    money: 0,
    location: '',
    type: 'indoor',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTaskData, string>>>({});
  const [pictureInput, setPictureInput] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTaskData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.money || formData.money <= 0) {
      newErrors.money = 'Amount in KWD must be greater than 0';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.type) {
      newErrors.type = 'Task type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPicture = () => {
    if (pictureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        pictures: [...(prev.pictures || []), pictureInput.trim()],
      }));
      setPictureInput('');
    }
  };

  const handleRemovePicture = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pictures: prev.pictures?.filter((_, i) => i !== index) || [],
    }));
  };

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => createTask(data),
    onSuccess: (data) => {
      Alert.alert('Success', 'Task created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to create task');
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    createTaskMutation.mutate(formData);
  };

  const handleChange = (field: keyof CreateTaskData, value: string | number | TaskType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <WatermarkBackground style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
          <Text style={styles.title}>Create New Task</Text>
          <Text style={styles.subtitle}>Fill in the details to post your task</Text>

          <View style={styles.form}>
            <Input
              label="Title *"
              placeholder="Enter task title"
              value={formData.title}
              onChangeText={(value) => handleChange('title', value)}
              error={errors.title}
              maxLength={100}
            />

            <Input
              label="Description *"
              placeholder="Describe your task in detail"
              value={formData.description}
              onChangeText={(value) => handleChange('description', value)}
              error={errors.description}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.textArea}
            />

            <View style={styles.pictureSection}>
              <Text style={styles.label}>Pictures (Optional)</Text>
              <View style={styles.pictureInputRow}>
                <Input
                  placeholder="Enter image URL"
                  value={pictureInput}
                  onChangeText={setPictureInput}
                  containerStyle={styles.pictureInput}
                  style={styles.pictureInputField}
                />
                <Button
                  title="Add"
                  onPress={handleAddPicture}
                  variant="secondary"
                  style={styles.addButton}
                />
              </View>
              {formData.pictures && formData.pictures.length > 0 && (
                <View style={styles.pictureList}>
                  {formData.pictures.map((pic, index) => (
                    <View key={index} style={styles.pictureItem}>
                      <Text style={styles.pictureText} numberOfLines={1}>
                        {pic}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemovePicture(index)}
                        style={styles.removeButton}>
                        <Text style={styles.removeButtonText}>×</Text>
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
                handleChange('money', numValue);
              }}
              error={errors.money}
              keyboardType="numeric"
            />

            <Input
              label="Location *"
              placeholder="Enter task location"
              value={formData.location}
              onChangeText={(value) => handleChange('location', value)}
              error={errors.location}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Task Type *</Text>
              <View style={styles.typeSelector}>
                {TASK_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      formData.type === type.value && styles.typeButtonSelected,
                    ]}
                    onPress={() => handleChange('type', type.value)}>
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === type.value && styles.typeButtonTextSelected,
                      ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Points will be automatically calculated based on task type and amount in KWD.
              </Text>
            </View>

            <Button
              title={createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              onPress={handleSubmit}
              loading={createTaskMutation.isPending}
              disabled={createTaskMutation.isPending}
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
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
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
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  pictureInput: {
    flex: 1,
    marginBottom: 0,
  },
  pictureInputField: {
    marginBottom: 0,
  },
  addButton: {
    marginTop: 24,
    minWidth: 80,
  },
  pictureList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  pictureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  pictureText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  typeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: colors.white,
  },
  errorText: {
    fontSize: typography.small.fontSize,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    ...typography.caption,
    color: colors.secondary,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});

