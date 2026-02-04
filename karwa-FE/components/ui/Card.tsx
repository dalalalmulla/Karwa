import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, borderRadius, shadows } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "subtle" | "medium";
}

export default function Card({
  children,
  style,
  variant = "subtle",
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === "medium" ? shadows.medium : shadows.subtle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
});
