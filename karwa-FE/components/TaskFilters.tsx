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
  { value: "", label: "All Types" },
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "home_service", label: "Home Service" },
  { value: "car_service", label: "Car Service" },
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
        style={styles.filterButton}
        onPress={handleOpen}
        accessibilityLabel="Open filters"
      >
        <Text style={styles.filterButtonText}>
          Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
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
                <Text style={styles.closeButton}>Close</Text>
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
                      localFilters.type === t.value ||
                      (!localFilters.type && t.value === "")
                        ? styles.chipActive
                        : null,
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
                        localFilters.type === t.value ||
                        (!localFilters.type && t.value === "")
                          ? styles.chipTextActive
                          : null,
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
              placeholder="Search by location..."
              placeholderTextColor={colors.gray500}
              value={localFilters.location || ""}
              onChangeText={(text) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  location: text || undefined,
                }))
              }
            />

            {/* Money Range Filter */}
            <Text style={styles.label}>Money Range (KWD)</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                placeholder="Min"
                placeholderTextColor={colors.gray500}
                keyboardType="numeric"
                value={localFilters.minMoney?.toString() || ""}
                onChangeText={(text) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    minMoney: text ? Number(text) : undefined,
                  }))
                }
              />
              <Text style={styles.rangeSeparator}>-</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                placeholder="Max"
                placeholderTextColor={colors.gray500}
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
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  filterButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl + spacing.lg,
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
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  label: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.sm,
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
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
    color: colors.secondary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  clearButtonText: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    paddingVertical: spacing.md,
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
