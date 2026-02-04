import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { TaskType, GetTasksParams } from "@/src/api/taskCalls";

interface TaskFiltersProps {
  filters: GetTasksParams;
  onApply: (filters: GetTasksParams) => void;
}

const TASK_TYPES: { value: TaskType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "home_service", label: "Home" },
  { value: "car_service", label: "Car" },
];

export default function TaskFilters({ filters, onApply }: TaskFiltersProps) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState<GetTasksParams>(filters);

  const handleOpen = () => {
    setLocalFilters(filters);
    setModalVisible(true);
  };

  const handleApply = () => {
    onApply(localFilters);
    setModalVisible(false);
  };

  const handleClear = () => {
    const cleared: GetTasksParams = {};
    setLocalFilters(cleared);
    onApply(cleared);
    setModalVisible(false);
  };

  const activeFilterCount = [
    filters.type,
    filters.location,
    filters.minMoney,
    filters.maxMoney,
  ].filter(Boolean).length;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilterCount > 0 && styles.filterButtonActive,
        ]}
        onPress={handleOpen}
        accessibilityLabel="Open filters"
      >
        <Text
          style={[
            styles.filterButtonText,
            activeFilterCount > 0 && styles.filterButtonTextActive,
          ]}
        >
          {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Tasks</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type Filter */}
            <Text style={styles.label}>Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              <View style={styles.chipRow}>
                {TASK_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value || "all"}
                    style={[
                      styles.chip,
                      (localFilters.type === t.value ||
                        (!localFilters.type && t.value === "")) &&
                        styles.chipActive,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        type: t.value || undefined,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        (localFilters.type === t.value ||
                          (!localFilters.type && t.value === "")) &&
                          styles.chipTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Location Filter */}
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Search location..."
              placeholderTextColor={colors.textMuted}
              value={localFilters.location || ""}
              onChangeText={(text) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  location: text || undefined,
                }))
              }
            />

            {/* Money Range Filter */}
            <Text style={styles.label}>Budget (KWD)</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                placeholder="Min"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={localFilters.minMoney?.toString() || ""}
                onChangeText={(text) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    minMoney: text ? Number(text) : undefined,
                  }))
                }
              />
              <Text style={styles.rangeSeparator}>—</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                placeholder="Max"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={localFilters.maxMoney?.toString() || ""}
                onChangeText={(text) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    maxMoney: text ? Number(text) : undefined,
                  }))
                }
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl + spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.heading,
    color: colors.text,
  },
  closeButton: {
    fontSize: 18,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    ...typography.body,
    color: colors.textMuted,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  clearButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  applyButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
