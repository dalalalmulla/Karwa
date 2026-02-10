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
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GradientBackground from "@/components/ui/GradientBackground";
import { register, RegisterData } from "@/src/api/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { theme, typography } = useTheme();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    civilId: "",
    password: "",
    confirmPassword: "",
    role: "both",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterData, string>>
  >({});
  const [showToast, setShowToast] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Must be a valid email format";
    }
    if (!formData.civilId?.trim()) {
      newErrors.civilId = "Civil ID is required";
    } else if (!/^\d{12}$/.test(formData.civilId)) {
      newErrors.civilId = "Must be exactly 12 digits";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: () => {
      setShowToast(true);
      setTimeout(() => router.replace("/(main)/(tabs)"), 2000);
    },
    onError: (error: Error) => {
      Alert.alert("Registration Failed", error.message || "Please try again");
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) return;
    mutation.mutate({
      name: formData.name,
      email: formData.email,
      civilId: formData.civilId,
      password: formData.password,
      role: formData.role || "both",
    });
  };

  const handleChange = (
    field: keyof RegisterData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <GradientBackground>
      {showToast && (
        <View style={[styles.toast, { backgroundColor: theme.success }]}>
          <Text style={[styles.toastText, { color: theme.white }]}>
            Registration successful!
          </Text>
        </View>
      )}
      <KeyboardAvoidingView
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                {
                  color: '#FFFFFF',
                  fontSize: typography.title.fontSize,
                },
              ]}
            >
              Create Account
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: '#FFFFFF',
                  fontSize: typography.body.fontSize,
                },
              ]}
            >
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
                labelColor="#FFFFFF"
                textColor="#FFFFFF"
                placeholderColor="#FFFFFF"
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
                labelColor="#FFFFFF"
                textColor="#FFFFFF"
                placeholderColor="#FFFFFF"
              />

              <Input
                label="Civil ID"
                placeholder="Enter your 12-digit Civil ID"
                value={formData.civilId}
                onChangeText={(value) => handleChange("civilId", value)}
                error={errors.civilId}
                keyboardType="numeric"
                maxLength={12}
                labelColor="#FFFFFF"
                textColor="#FFFFFF"
                placeholderColor="#FFFFFF"
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(value) => handleChange("password", value)}
                error={errors.password}
                secureTextEntry
                autoCapitalize="none"
                labelColor="#FFFFFF"
                textColor="#FFFFFF"
                placeholderColor="#FFFFFF"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleChange("confirmPassword", value)
                }
                error={errors.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
                labelColor="#FFFFFF"
                textColor="#FFFFFF"
                placeholderColor="#FFFFFF"
              />

              <Button
                title="Register"
                onPress={handleSubmit}
                loading={mutation.isPending}
                style={styles.submitButton}
              />

              <View style={styles.footer}>
                <Text
                  style={[
                    styles.footerText,
                    {
                      color: '#FFFFFF',
                      fontSize: typography.body.fontSize,
                    },
                  ]}
                >
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                >
                  <Text
                    style={[
                      styles.footerLink,
                      {
                        color: '#FFFFFF',
                        fontSize: typography.body.fontSize,
                      },
                    ]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    zIndex: 1000,
    alignItems: "center",
  },
  toastText: {
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
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: {},
  footerLink: {
    fontWeight: "600",
  },
});
