import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { IconSymbol } from "./icon-symbol";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing } from "@/constants/Karwa.theme";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  editable?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 24,
  editable = true,
}: StarRatingProps) {
  const { theme } = useTheme();

  console.log(rating)
  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => editable && onRatingChange(value)}
            disabled={!editable}
            activeOpacity={editable ? 0.7 : 1}
          >
            <IconSymbol
              name={value <= rating ? "star.fill" : "star"}
              size={size}
              color={value <= rating ? theme.warning : theme.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: spacing.xs,
  },
});
