/**
 * Karwa Design System
 * Colors, typography, spacing, and component styles
 */

export const colors = {
  // Primary Colors
  background: '#FDFCFD',
  primary: '#227CC5',
  text: '#2E2E2E',
  secondary: '#5F6368',
  
  // Semantic Colors
  success: '#43A661',
  danger: '#153871',
  warning: '#F2C94C',
  
  // Base
  white: '#FDFCFD',
  border: '#D5D7D7',
  
  // Supporting blues
  blueDark: '#153871',
  blueMid: '#1C5FA3',
  blue: '#227CC5',
  blueLight: '#4A9AD6',
  blueSoft: '#7BBCE8',
  
  // Supporting greens
  greenDark: '#2F7F56',
  green: '#43A661',
  greenSoft: '#5FBF7A',
  greenLight: '#72BB55',
  greenPale: '#9AD98B',
  
  // Neutrals
  gray900: '#2E2E2E',
  gray700: '#5F6368',
  gray500: '#8E9093',
  gray400: '#B4B5B6',
  gray300: '#D5D7D7',
  gray100: '#F4F4F4',
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

export const shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

// Legacy Colors export for backward compatibility
export const Colors = {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    icon: colors.secondary,
    tabIconDefault: colors.gray500,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: colors.white,
    background: colors.gray900,
    tint: colors.blueLight,
    icon: colors.gray400,
    tabIconDefault: colors.gray500,
    tabIconSelected: colors.blueLight,
  },
};
