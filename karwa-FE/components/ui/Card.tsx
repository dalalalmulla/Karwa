import React from "react";
import { View, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius, shadows } from "@/constants/Karwa.theme";

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined" | "flat";
  padding?: "none" | "small" | "medium" | "large";
}

export default function Card({
  children,
  style,
  onPress,
  variant = "default",
  padding = "medium",
}: CardProps) {
  const { theme } = useTheme();

  const variantStyles: Record<string, { backgroundColor: string; borderWidth: number; borderColor?: string }> = {
    default: {
      backgroundColor: theme.surface,
      borderWidth: 0,
    },
    elevated: {
      backgroundColor: theme.surface,
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    flat: {
      backgroundColor: theme.surface,
      borderWidth: 0,
    },
  };

  const paddingStyles = {
    none: { padding: 0 },
    small: { padding: spacing.sm },
    medium: { padding: spacing.md },
    large: { padding: spacing.lg },
  };

  const currentVariant = variantStyles[variant];
  const cardStyle = [
    styles.card,
    {
      backgroundColor: currentVariant.backgroundColor,
      borderWidth: currentVariant.borderWidth,
      borderRadius: borderRadius.lg,
    },
    currentVariant.borderWidth > 0 && currentVariant.borderColor && { borderColor: currentVariant.borderColor },
    paddingStyles[padding],
    variant === "elevated" && shadows.medium,
    variant === "default" && shadows.subtle,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
});
