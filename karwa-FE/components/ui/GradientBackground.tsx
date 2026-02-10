import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

// Try to import LinearGradient, fallback to View if not available
let LinearGradient: any = null;
try {
  const LinearGradientModule = require('expo-linear-gradient');
  LinearGradient = LinearGradientModule.LinearGradient;
} catch (e) {
  // expo-linear-gradient not installed, will use fallback
}

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function GradientBackground({
  children,
  style,
}: GradientBackgroundProps) {
  // If LinearGradient is available, use it
  if (LinearGradient) {
    return (
      <LinearGradient
        colors={['#1E88E5', '#00ACC1', '#00897B']} // Blue to teal to green gradient
        start={{ x: 1, y: 0 }} // Top right (blue)
        end={{ x: 0, y: 1 }} // Bottom left (green)
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // Fallback: solid color (approximate middle of gradient)
  return (
    <View style={[styles.container, styles.fallbackBackground, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallbackBackground: {
    backgroundColor: '#00ACC1', // Teal color as fallback
  },
});

