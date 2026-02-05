import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import Logo from "@/components/ui/Logo";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import { getCurrentUser, updateUserRole, UserRole } from "@/src/api/auth";
import { useAuth } from "@/src/context/AuthContext";
import { ROLE_LABELS } from "@/src/constants/roles";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, typography } = useTheme();
  const { logout, token, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/(auth)/login");
    }
  }, [token, router]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: 1,
    enabled: !!token,
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getFullName = () => {
    const firstName = data?.user.firstName || "";
    const lastName = data?.user.lastName || "";
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    return "Not provided";
  };

  const updateRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: (res) => {
      if (setUser) setUser({ ...res.user });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setShowRoleModal(false);
      Alert.alert("Success", "Your role has been updated!");
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to update role.");
    },
  });

  const getRoleLabel = (role?: UserRole): string => {
    if (!role) return "Not set";
    switch (role) {
      case "poster":
        return ROLE_LABELS.POSTER.singular;
      case "worker":
        return ROLE_LABELS.WORKER.singular;
      case "both":
        return "Both";
      default:
        return "Not set";
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (data?.user.role === newRole) {
      setShowRoleModal(false);
      return;
    }
    updateRoleMutation.mutate(newRole);
  };

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <WatermarkBackground style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: theme.textSecondary, fontSize: typography.body.fontSize },
          ]}
        >
          Loading profile...
        </Text>
      </WatermarkBackground>
    );
  }

  /* ─── Error ─── */
  if (error) {
    const msg = error instanceof Error ? error.message : "An error occurred";
    const isAuthError =
      msg.includes("Authentication") ||
      msg.includes("token") ||
      msg.includes("401");

    return (
      <WatermarkBackground style={styles.center}>
        <Text
          style={[
            styles.errorTitle,
            { color: theme.text, fontSize: typography.heading.fontSize },
          ]}
        >
          Failed to load profile
        </Text>
        <Text
          style={[
            styles.errorMsg,
            { color: theme.textSecondary, fontSize: typography.body.fontSize },
          ]}
        >
          {msg}
        </Text>
        {isAuthError ? (
          <Button
            title="Go to Login"
            onPress={() => router.replace("/(auth)/login")}
            style={styles.mt}
          />
        ) : (
          <>
            <Button
              title="Retry"
              onPress={() => refetch()}
              style={styles.mt}
            />
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="secondary"
              style={styles.mtSm}
            />
          </>
        )}
      </WatermarkBackground>
    );
  }

  /* ─── Render ─── */
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Logo size={80} />
        <Text
          style={[
            styles.name,
            { color: theme.textTitle, fontSize: typography.title.fontSize },
          ]}
        >
          {getFullName()}
        </Text>
        <Text
          style={[
            styles.email,
            {
              color: theme.textSecondary,
              fontSize: typography.body.fontSize,
            },
          ]}
        >
          {data?.user.email || "N/A"}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Rating"
          value={`⭐ ${
            data?.user.ratingAverage !== undefined
              ? data.user.ratingAverage.toFixed(1)
              : "0.0"
          }`}
          style={styles.statCard}
        />
        <StatCard
          label="Completed"
          value={data?.user.completedTasksCount ?? 0}
          style={styles.statCard}
        />
        <StatCard
          label="Points"
          value={data?.user.earnedPoints ?? 0}
          style={styles.statCard}
        />
      </View>

      {/* Role Card */}
      <Card variant="default" padding="medium">
        <View style={styles.roleHeader}>
          <Text
            style={[
              styles.roleTitle,
              {
                color: theme.text,
                fontSize: typography.heading.fontSize,
              },
            ]}
          >
            My Role
          </Text>
          <TouchableOpacity
            onPress={() => setShowRoleModal(true)}
            style={[styles.changeRoleBtn, { backgroundColor: theme.primary }]}
          >
            <Text
              style={[
                styles.changeRoleTxt,
                { color: theme.white, fontSize: typography.caption.fontSize },
              ]}
            >
              Change
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.currentRole,
            { color: theme.primary, fontSize: typography.body.fontSize },
          ]}
        >
          {getRoleLabel(data?.user.role)}
        </Text>
        <Text
          style={[
            styles.roleDesc,
            {
              color: theme.textSecondary,
              fontSize: typography.caption.fontSize,
            },
          ]}
        >
          {data?.user.role === "poster" &&
            "You can create tasks for others to complete"}
          {data?.user.role === "worker" &&
            "You can apply to and complete tasks"}
          {data?.user.role === "both" &&
            "You can create tasks and also complete tasks"}
          {!data?.user.role && "Select your role to get started"}
        </Text>
      </Card>

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                  fontSize: typography.title.fontSize,
                },
              ]}
            >
              Select Your Role
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                {
                  color: theme.textSecondary,
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
              Choose how you want to use Karwa
            </Text>

            {(
              [
                {
                  value: "poster" as UserRole,
                  label: ROLE_LABELS.POSTER.singular,
                  desc: "Create tasks for others",
                },
                {
                  value: "worker" as UserRole,
                  label: ROLE_LABELS.WORKER.singular,
                  desc: "Complete tasks",
                },
                {
                  value: "both" as UserRole,
                  label: "Both",
                  desc: "Create and complete tasks",
                },
              ] as const
            ).map((opt) => {
              const isSelected = data?.user.role === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.roleOption,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.surface,
                    },
                  ]}
                  onPress={() => handleRoleChange(opt.value)}
                  disabled={updateRoleMutation.isPending}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      {
                        color: isSelected ? theme.white : theme.text,
                        fontSize: typography.body.fontSize,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      styles.roleOptionSubtext,
                      {
                        color: isSelected
                          ? theme.white
                          : theme.textSecondary,
                        fontSize: typography.caption.fontSize,
                      },
                    ]}
                  >
                    {opt.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <Button
              title="Cancel"
              onPress={() => setShowRoleModal(false)}
              variant="secondary"
              style={styles.mt}
              disabled={updateRoleMutation.isPending}
            />
          </View>
        </View>
      </Modal>

      {/* Logout */}
      <Button
        title={isLoggingOut ? "Logging out..." : "Logout"}
        onPress={handleLogout}
        variant="secondary"
        style={styles.logoutBtn}
        disabled={isLoggingOut}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorTitle: {
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  errorMsg: {
    textAlign: "center",
    marginBottom: spacing.md,
  },
  mt: {
    marginTop: spacing.md,
  },
  mtSm: {
    marginTop: spacing.sm,
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  name: {
    fontWeight: "700",
    marginTop: spacing.sm,
    textAlign: "center",
  },
  email: {
    marginTop: spacing.xs,
    textAlign: "center",
  },

  /* Stats */
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
  },

  /* Role */
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  roleTitle: {
    fontWeight: "600",
  },
  changeRoleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  changeRoleTxt: {
    fontWeight: "600",
  },
  currentRole: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  roleDesc: {
    lineHeight: 18,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  modalSubtitle: {
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  roleOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  roleOptionText: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  roleOptionSubtext: {
    opacity: 0.8,
  },

  /* Logout */
  logoutBtn: {
    marginTop: spacing.lg,
  },
});
