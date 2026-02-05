import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing, borderRadius } from "@/constants/Karwa.theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;
  const { theme, typography } = useTheme();

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.text, fontSize: typography.caption.fontSize },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: hasError
              ? theme.danger
              : isFocused
              ? theme.primary
              : theme.border,
            borderWidth: isFocused || hasError ? 2 : 1.5,
            color: theme.text,
            fontSize: typography.body.fontSize,
            borderRadius: borderRadius.lg,
          },
          style,
        ]}
        placeholderTextColor={theme.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {hasError && (
        <Text
          style={[
            styles.errorText,
            { color: theme.danger, fontSize: typography.small.fontSize },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
