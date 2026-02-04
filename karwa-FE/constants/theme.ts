/**
 * Karwa Design System
 * Light-friendly theme based on Karwa's approved color palette
 */

// Brand Palette
export const palette = {
  // Brand Colors (from logo)
  blue: '#227CC5',
  blueMid: '#1C5FA3',
  blueDark: '#153871',
  blueLight: '#4A9AD6',
  blueSoft: '#7BBCE8',

  green: '#43A661',
  greenDark: '#2F7F56',
  greenLight: '#72BB55',
  greenSoft: '#5FBF7A',
  greenPale: '#9AD98B',

  // Neutral Colors
  white: '#FDFCFD',
  gray100: '#F4F4F4',
  gray200: '#E8E9EA',
  gray300: '#D5D7D7',
  gray400: '#B4B5B6',
  gray500: '#8E9093',
  gray700: '#5F6368',
  gray900: '#2E2E2E',

  // Distinction Color
  yellow: '#F2C94C',

  // Error Color
  red: '#DC3545',
} as const;

// Eye-friendly light theme colors
export const colors = {
  // Core - Lighter, easier on eyes
  background: palette.gray100,
  surface: palette.white,
  surfaceAlt: palette.gray200,
  border: palette.gray300,

  // Text
  text: palette.gray900,
  textSecondary: palette.gray700,
  textMuted: palette.gray500,

  // Brand
  primary: palette.blue,
  primaryPressed: palette.blueMid,
  primarySoft: palette.blueSoft,

  // Semantic
  success: palette.green,
  danger: palette.red,
  warning: palette.yellow,
  info: palette.blueSoft,

  // Legacy/Compat
  white: palette.white,
  secondary: palette.gray700,

  // Supporting blues
  blueDark: palette.blueDark,
  blueMid: palette.blueMid,
  blue: palette.blue,
  blueLight: palette.blueLight,
  blueSoft: palette.blueSoft,

  // Supporting greens
  greenDark: palette.greenDark,
  green: palette.green,
  greenSoft: palette.greenSoft,
  greenLight: palette.greenLight,
  greenPale: palette.greenPale,

  // Neutrals
  gray900: palette.gray900,
  gray700: palette.gray700,
  gray500: palette.gray500,
  gray400: palette.gray400,
  gray300: palette.gray300,
  gray200: palette.gray200,
  gray100: palette.gray100,
};

export const typography = {
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
};

// Compact spacing for better phone compatibility
export const spacing = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

export const shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Legacy Colors export for backward compatibility
export const Colors = {
  light: {
    text: palette.gray900,
    background: palette.gray100,
    tint: palette.blue,
    icon: palette.gray700,
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.blue,
  },
  dark: {
    text: palette.white,
    background: palette.blueDark,
    tint: palette.blueLight,
    icon: palette.gray400,
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.blueLight,
  },
};
