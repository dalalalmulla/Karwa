// Karwa.theme.ts
// Design tokens (Light/Dark) based on the approved Karwa palette
// Includes color blindness accessibility palettes

export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type ThemeMode = 'light' | 'dark';
export type FontSizeScale = 'small' | 'medium' | 'large' | 'xlarge';

export type KarwaTheme = {
  mode: ThemeMode;

  // Core
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textTitle: string;      // Page titles
  textHeading: string;    // Main headings

  // Brand
  primary: string;
  primaryPressed: string;
  primarySoft: string;

  // Semantic
  success: string;
  danger: string;
  warning: string;

  // Supporting
  info: string;

  // Additional colors for consistency
  white: string;
  secondary: string;
};

export const palette = {
  // Brand (from logo)
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

  // Neutrals (approved)
  white: '#FDFCFD',
  gray100: '#F4F4F4',
  gray200: '#E8E9EA',
  gray300: '#D5D7D7',
  gray400: '#B4B5B6',
  gray500: '#8E9093',
  gray700: '#5F6368',
  gray900: '#2E2E2E',

  // Accent (approved)
  yellow: '#F2C94C',

  // Error
  red: '#DC3545',
} as const;

export const lightTheme: KarwaTheme = {
  mode: 'light',

  background: palette.gray100,
  surface: palette.white,
  surfaceAlt: palette.gray200,
  border: palette.gray300,

  text: palette.gray900,
  textSecondary: palette.gray700,
  textMuted: palette.gray500,
  textTitle: palette.blueMid,     // #1C5FA3 - Page titles
  textHeading: palette.blueMid,   // #1C5FA3 - Main headings

  primary: palette.blue,
  primaryPressed: palette.blueMid,
  primarySoft: palette.blueLight,

  success: palette.green,
  danger: palette.red,
  warning: palette.yellow,

  info: palette.blueSoft,

  white: palette.white,
  secondary: palette.gray700,
};

export const darkTheme: KarwaTheme = {
  mode: 'dark',

  // Dark mode stays within Karwa blues/greys
  background: palette.blueDark,
  surface: palette.gray900,
  surfaceAlt: palette.blueMid,
  border: palette.gray700,

  text: palette.white,
  textSecondary: palette.gray300,
  textMuted: palette.gray400,
  textTitle: palette.blueSoft,    // Lighter blue for dark mode titles
  textHeading: palette.blueLight, // Light blue for dark mode headings

  primary: palette.blueLight,
  primaryPressed: palette.blue,
  primarySoft: palette.blueSoft,

  success: palette.greenLight,
  danger: palette.yellow,
  warning: palette.yellow,

  info: palette.blueSoft,

  white: palette.white,
  secondary: palette.gray300,
};

// Color blindness friendly palettes
// These provide distinguishable colors for each type of color blindness

// Deuteranopia (green blindness) - uses blue/yellow/orange instead of green
export const deuteranopiaPalette = {
  primary: '#0072B2', // Blue
  primaryPressed: '#005180',
  primarySoft: '#56B4E9', // Light blue
  success: '#E69F00', // Orange (instead of green)
  danger: '#D55E00', // Vermillion/red-orange
  warning: '#F0E442', // Yellow
  info: '#56B4E9', // Sky blue
};

// Protanopia (red blindness) - uses blue/yellow/cyan instead of red
export const protanopiaPalette = {
  primary: '#0072B2', // Blue
  primaryPressed: '#005180',
  primarySoft: '#56B4E9', // Light blue
  success: '#009E73', // Bluish green
  danger: '#E69F00', // Orange (instead of red)
  warning: '#F0E442', // Yellow
  info: '#56B4E9', // Sky blue
};

// Tritanopia (blue blindness) - uses red/green/pink instead of blue
export const tritanopiaPalette = {
  primary: '#CC79A7', // Pink/magenta
  primaryPressed: '#A6628A',
  primarySoft: '#E6A4C4', // Light pink
  success: '#009E73', // Teal/green
  danger: '#D55E00', // Vermillion
  warning: '#E69F00', // Orange
  info: '#CC79A7', // Pink
};

// Font size scales
export const fontSizeScales: Record<FontSizeScale, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.15,
  xlarge: 1.3,
};

// Base typography that gets scaled
export const baseTypography = {
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

// Function to get scaled typography
export const getScaledTypography = (scale: FontSizeScale) => {
  const multiplier = fontSizeScales[scale];
  return {
    title: {
      ...baseTypography.title,
      fontSize: Math.round(baseTypography.title.fontSize * multiplier),
    },
    heading: {
      ...baseTypography.heading,
      fontSize: Math.round(baseTypography.heading.fontSize * multiplier),
    },
    body: {
      ...baseTypography.body,
      fontSize: Math.round(baseTypography.body.fontSize * multiplier),
    },
    caption: {
      ...baseTypography.caption,
      fontSize: Math.round(baseTypography.caption.fontSize * multiplier),
    },
    small: {
      ...baseTypography.small,
      fontSize: Math.round(baseTypography.small.fontSize * multiplier),
    },
  };
};

// Apply color blindness filter to theme
export const applyColorBlindFilter = (
  theme: KarwaTheme,
  colorBlindMode: ColorBlindMode
): KarwaTheme => {
  if (colorBlindMode === 'none') {
    return theme;
  }

  let colorPalette;
  switch (colorBlindMode) {
    case 'deuteranopia':
      colorPalette = deuteranopiaPalette;
      break;
    case 'protanopia':
      colorPalette = protanopiaPalette;
      break;
    case 'tritanopia':
      colorPalette = tritanopiaPalette;
      break;
    default:
      return theme;
  }

  return {
    ...theme,
    primary: colorPalette.primary,
    primaryPressed: colorPalette.primaryPressed,
    primarySoft: colorPalette.primarySoft,
    success: colorPalette.success,
    danger: colorPalette.danger,
    warning: colorPalette.warning,
    info: colorPalette.info,
  };
};

// Helper: pick theme based on mode
export const getKarwaTheme = (mode: ThemeMode): KarwaTheme =>
  mode === 'dark' ? darkTheme : lightTheme;

// Helper: get fully processed theme with all settings applied
export const getProcessedTheme = (
  mode: ThemeMode,
  colorBlindMode: ColorBlindMode
): KarwaTheme => {
  const baseTheme = getKarwaTheme(mode);
  return applyColorBlindFilter(baseTheme, colorBlindMode);
};

// Spacing (unchanged)
export const spacing = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
};

// Border radius (unchanged)
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

// Shadows (unchanged)
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
