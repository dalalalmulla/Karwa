import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import type { LoginPayload } from "../../src/api/authCalls";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GradientBackground from "@/components/ui/GradientBackground";
import { loginUser } from "@/src/api/auth";
import { AntDesign } from "@expo/vector-icons";

export default function LoginForm() {
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
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <AntDesign name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.formSection}>
              <Text
                style={[
                  styles.title,
                  {
                    color: '#FFFFFF',
                    fontSize: typography.title.fontSize,
                  },
                ]}
              >
                Login
              </Text>

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(value) => handleChange("email", value)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                labelColor="#000000"
                textColor="#000000"
                placeholderColor="#000000"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(value) => handleChange("password", value)}
                error={errors.password}
                secureTextEntry={!visiblePassword}
                autoCapitalize="none"
                labelColor="#000000"
                textColor="#000000"
                placeholderColor="#000000"
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setVisiblePassword((v) => !v)}
              >
                <Text
                  style={[
                    styles.eyeButtonText,
                    {
                      color: '#FFFFFF',
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
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  formSection: {
    width: "100%",
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.xl,
    textAlign: "center",
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
});

