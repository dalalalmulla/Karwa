import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@/constants/theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import { register, RegisterData } from "@/src/api/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    civilId: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterData, string>>
  >({});
  const [showToast, setShowToast] = useState(false);

  console.log(formData);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation - must be in correct format
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "It must be in the correct format, such as name@example.com.";
    }

    // Civil ID validation - must be exactly 12 digits
    if (!formData.civilId?.trim()) {
      newErrors.civilId = "Civil ID is required";
    } else if (!/^\d{12}$/.test(formData.civilId)) {
      newErrors.civilId = "It must be 12 digits.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password must match password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "There is a discrepancy in the password.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: () => {
      setShowToast(true);
      setTimeout(() => {
        router.replace("/(main)/(tabs)");
      }, 2000);
    },
    onError: (error: Error) => {
      Alert.alert("Registration Failed", error.message || "Please try again");
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    mutation.mutate({
      name: formData.name,
      email: formData.email,
      civilId: formData.civilId,
      password: formData.password,
    });
  };

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <WatermarkBackground style={styles.container}>
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Registration successful!</Text>
        </View>
      )}
      <KeyboardAvoidingView
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={styles.scrollContent}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Logo size={120} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to start earning with Karwa
            </Text>

            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleChange("name", value)}
                error={errors.name}
                autoCapitalize="words"
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Civil ID"
                placeholder="Enter your Civil ID"
                value={formData.civilId}
                onChangeText={(value) => handleChange("civilId", value)}
                error={errors.civilId}
                keyboardType="numeric"
                maxLength={12}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleChange("password", value)}
                error={errors.password}
                secureTextEntry
                autoCapitalize="none"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange("confirmPassword", value)}
                error={errors.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                title="Register"
                onPress={handleSubmit}
                loading={mutation.isPending}
                style={styles.submitButton}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push("/(auth)/login")}
                >
                  Login
                </Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toast: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: "center",
  },
  toastText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
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
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.secondary,
  },
  footerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});
