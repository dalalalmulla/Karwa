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
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";
import { TaskType, GetTasksParams } from "@/src/api/taskCalls";

interface TaskFiltersProps {
  filters: GetTasksParams;
  onApply: (filters: GetTasksParams) => void;
}

const TASK_TYPES: { value: TaskType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
];

export default function TaskFilters({ filters, onApply }: TaskFiltersProps) {
  const { theme, typography } = useTheme();
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
          { backgroundColor: 'transparent' },
        ]}
        onPress={handleOpen}
        accessibilityLabel="Open filters"
      >
        <AntDesign 
          name="filter" 
          size={24} 
          color="#1C5FA3" 
        />
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text, fontSize: typography.heading.fontSize }]}>
                Filter Tasks
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type Filter */}
            <Text style={[styles.label, { color: theme.text, fontSize: typography.caption.fontSize }]}>
              Type
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              <View style={styles.chipRow}>
                {TASK_TYPES.map((t) => {
                  const isActive = localFilters.type === t.value || (!localFilters.type && t.value === "");
                  return (
                    <TouchableOpacity
                      key={t.value || "all"}
                      style={[
                        styles.chip,
                        { borderColor: theme.border, backgroundColor: theme.background },
                        isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
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
                          { color: theme.text, fontSize: typography.caption.fontSize },
                          isActive && { color: theme.white },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Location Filter */}
            <Text style={[styles.label, { color: theme.text, fontSize: typography.caption.fontSize }]}>
              Location
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                  fontSize: typography.body.fontSize,
                },
              ]}
              placeholder="Search location..."
              placeholderTextColor={theme.textMuted}
              value={localFilters.location || ""}
              onChangeText={(text) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  location: text || undefined,
                }))
              }
            />

            {/* Money Range Filter */}
            <Text style={[styles.label, { color: theme.text, fontSize: typography.caption.fontSize }]}>
              Budget (KWD)
            </Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.rangeInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                    fontSize: typography.body.fontSize,
                  },
                ]}
                placeholder="Min"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={localFilters.minMoney?.toString() || ""}
                onChangeText={(text) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    minMoney: text ? Number(text) : undefined,
                  }))
                }
              />
              <Text style={[styles.rangeSeparator, { color: theme.textMuted, fontSize: typography.body.fontSize }]}>
                —
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.rangeInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                    fontSize: typography.body.fontSize,
                  },
                ]}
                placeholder="Max"
                placeholderTextColor={theme.textMuted}
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
                style={[styles.clearButton, { borderColor: theme.border }]}
                onPress={handleClear}
              >
                <Text style={[styles.clearButtonText, { color: theme.textSecondary, fontSize: typography.body.fontSize }]}>
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: theme.primary }]}
                onPress={handleApply}
              >
                <Text style={[styles.applyButtonText, { color: theme.white, fontSize: typography.body.fontSize }]}>
                  Apply
                </Text>
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
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
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 18,
    padding: spacing.xs,
  },
  label: {
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
  },
  chipText: {},
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {},
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
    alignItems: "center",
  },
  clearButtonText: {
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  applyButtonText: {
    fontWeight: "600",
  },
});
