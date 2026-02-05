import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "text";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme, typography } = useTheme();
  const isDisabled = disabled || loading;

  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: theme.primary,
        };
      case "danger":
        return {
          backgroundColor: theme.danger,
        };
      case "text":
        return {
          backgroundColor: "transparent",
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          minHeight: 36,
        };
      case "primary":
      default:
        return {
          backgroundColor: theme.primary,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "secondary":
      case "text":
        return theme.primary;
      case "danger":
      case "primary":
      default:
        return theme.white;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { borderRadius: borderRadius.lg },
        getButtonStyles(),
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" || variant === "text" ? theme.primary : theme.white}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: typography.body.fontSize,
            },
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
