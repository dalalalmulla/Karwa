import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../src/api/authCalls";
import type { LoginPayload } from "../../src/api/authCalls";
import { colors, spacing, typography } from "@/constants/theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePassword, setVisiblePassword] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginPayload, string>>
  >({});

  const { setToken, setUser } = useAuth();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => loginApi(data),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        Alert.alert("Login Failed", res.error || "An error occurred");
        return;
      }

      setToken(res.data.token);
      setUser(res.data.user);

      router.replace("/(main)/(tabs)");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      console.log("Login Error Details:", error);
      Alert.alert("Login Failed", message);
    },
  });

  const handleLogin = () => {
    const newErrors: Partial<Record<keyof LoginPayload, string>> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      loginMutation.mutate({ email: email.toLowerCase(), password });
    }
  };

  const handleChange = (field: keyof LoginPayload, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Logo size={120} />
        </View>

        <View>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to continue to Karwa
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => handleChange("email", value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(value) => handleChange("password", value)}
              error={errors.password}
              secureTextEntry={!visiblePassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setVisiblePassword((v) => !v)}
            >
              <Text style={styles.eyeButtonText}>
                {visiblePassword ? "Hide" : "Show"} Password
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  formSection: {
    width: "100%",
  },
  form: {
    width: "100%",
  },
  eyeButton: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  eyeButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "500",
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
    alignItems: "center",
  },
  footerText: {
    ...typography.body,
    color: colors.secondary,
    marginRight: spacing.xs,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});
