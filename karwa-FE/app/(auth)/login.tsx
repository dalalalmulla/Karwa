import React from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";
import Button from "@/components/ui/Button";
import GradientBackground from "@/components/ui/GradientBackground";

export default function Login() {
  const router = useRouter();
  const { theme, typography } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <GradientBackground style={styles.rootContainer}>
      <StatusBar hidden={false} translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={styles.flex} edges={[]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <View style={styles.contentContainer}>
          {/* Logo image centered in the middle - text only, no frame */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/karwaTitle.png")}
              style={[styles.logoImage, { width: width + 100 }]}
              contentFit="cover"
            />
          </View>

          {/* Buttons at the bottom */}
          <View style={[styles.buttonsContainer, { paddingHorizontal: spacing.lg }]}>
            <Button
              title="Login"
              onPress={() => router.push("/(auth)/login-form")}
              style={{ ...styles.button, backgroundColor: '#FFFFFF' }}
              textStyle={{ color: '#1E3A5F', fontSize: typography.body.fontSize, fontWeight: '600' }}
            />
            <Button
              title="Sign Up"
              onPress={() => router.push("/(auth)/register")}
              style={{ ...styles.button, backgroundColor: '#FFFFFF', marginTop: spacing.md }}
              textStyle={{ color: '#1E3A5F', fontSize: typography.body.fontSize, fontWeight: '600' }}
            />
          </View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0, // Remove horizontal padding to allow full width image
    justifyContent: "space-between",
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl * 2,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: spacing.xl * 1.5, // Moved up from center
    width: '100%',
    paddingHorizontal: 0, // No padding for full width
    backgroundColor: 'transparent',
  },
  logoImage: {
    height: 120,
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    width: "100%",
    paddingBottom: spacing.lg,
  },
  button: {
    width: "100%",
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 4,
  },
});
