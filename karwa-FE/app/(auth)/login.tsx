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
import type { LoginPayload } from "../../src/api/authCalls";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing } from "@/constants/Karwa.theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import WatermarkBackground from "@/components/ui/WatermarkBackground";
import { loginUser } from "@/src/api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginPayload, string>>
  >({});

  const { setToken, setUser } = useAuth();
  const router = useRouter();
  const { theme, typography } = useTheme();

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => loginUser(data),
    onSuccess: (res) => {
      if (res && res.token) {
        setToken(res.token);
        setUser(res.user);
        router.replace("/(main)/(tabs)");
      } else {
        Alert.alert("Login Failed", "Invalid response from server");
      }
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "An error occurred";
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
    <WatermarkBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Logo size={120} />
          </View>

          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.textTitle,
                fontSize: typography.title.fontSize,
              },
            ]}
          >
            Welcome Back
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: theme.textSecondary,
                fontSize: typography.body.fontSize,
              },
            ]}
          >
            Sign in to continue to Karwa
          </Text>

          <View style={styles.formSection}>
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
              <Text
                style={[
                  styles.eyeButtonText,
                  {
                    color: theme.primary,
                    fontSize: typography.small.fontSize,
                  },
                ]}
              >
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

            <View style={styles.footer}>
              <Text
                style={[
                  styles.footerText,
                  {
                    color: theme.textSecondary,
                    fontSize: typography.body.fontSize,
                  },
                ]}
              >
                Don&apos;t have an account?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
              >
                <Text
                  style={[
                    styles.linkText,
                    {
                      color: theme.primary,
                      fontSize: typography.body.fontSize,
                    },
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontWeight: "700",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  headerSubtitle: {
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  formSection: {
    width: "100%",
  },
  eyeButton: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  eyeButtonText: {
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
    gap: spacing.xs,
  },
  footerText: {},
  linkText: {
    fontWeight: "600",
  },
});
