import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/src/context/ThemeContext";

interface WatermarkBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function WatermarkBackground({
  children,
  style,
}: WatermarkBackgroundProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }, style]}
    >
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Image
          source={require("../../assets/images/Karwa.png")}
          style={styles.watermark}
          contentFit="contain"
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  watermark: {
    width: 280,
    height: 280,
    opacity: 0.04,
  },
});
