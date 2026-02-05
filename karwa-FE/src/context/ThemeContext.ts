import { createContext, useContext } from 'react';
import type {
  KarwaTheme,
  ThemeMode,
  ColorBlindMode,
  FontSizeScale,
} from '@/constants/Karwa.theme';

export interface ThemeContextValue {
  // Current processed theme (with color blind filter applied)
  theme: KarwaTheme;
  
  // Theme mode (light/dark)
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  
  // Color blindness mode
  colorBlindMode: ColorBlindMode;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  
  // Font size scale
  fontSizeScale: FontSizeScale;
  setFontSizeScale: (scale: FontSizeScale) => void;
  
  // Scaled typography based on font size scale
  typography: {
    title: { fontSize: number; fontWeight: '700' };
    heading: { fontSize: number; fontWeight: '600' };
    body: { fontSize: number; fontWeight: '400' };
    caption: { fontSize: number; fontWeight: '400' };
    small: { fontSize: number; fontWeight: '400' };
  };
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeContext.Provider');
  }
  return ctx;
}
