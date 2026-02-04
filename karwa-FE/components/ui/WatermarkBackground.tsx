import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/constants/theme";

interface WatermarkBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function WatermarkBackground({
  children,
  style,
}: WatermarkBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Watermark Logo */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Image
          source={require("../../assets/images/Karwa.png")}
          style={styles.watermark}
          contentFit="contain"
        />
      </View>
      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
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
