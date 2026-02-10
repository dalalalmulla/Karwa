import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface KarwaLogoProps {
  size?: number;
}

export default function KarwaLogo({ size = 80 }: KarwaLogoProps) {
  const fontSize = size * 0.7;
  const iconSize = size * 0.5;

  return (
    <View style={[styles.container, { height: size }]}>
      {/* k */}
      <Text style={[styles.letter, { fontSize, color: '#FFFFFF' }]}>k</Text>
      
      {/* a */}
      <Text style={[styles.letter, { fontSize, color: '#FFFFFF' }]}>a</Text>
      
      {/* r */}
      <Text style={[styles.letter, { fontSize, color: '#FFFFFF' }]}>r</Text>
      
      {/* v - Blue geometric shape - made taller to extend downward */}
      <View style={[styles.iconContainer, { width: fontSize * 0.8, height: fontSize * 1.2 }]}>
        <AntDesign name="caret-down" size={fontSize * 1.1} color="#227CC5" />
      </View>
      
      {/* W - Green checkmark - using larger icon to match image */}
      <View style={[styles.iconContainer, { width: fontSize * .9, height: fontSize * 1.2 }]}>
        <AntDesign name="check" size={fontSize * 1.3} color="#66BB6A" />
      </View>
      
      {/* a */}
      <Text style={[styles.letter, { fontSize, color: '#FFFFFF' }]}>a</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '700',
    fontFamily: 'System',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
});

