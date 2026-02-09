import { Stack } from "expo-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "../src/context/AuthContext";
import { ThemeContext } from "../src/context/ThemeContext";
import type { User } from "../src/types/userTypes";
import { getToken, clearToken } from "../src/utils/token";
import { onForceLogout } from "../src/utils/authEvents";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getProcessedTheme,
  getScaledTypography,
  lightTheme,
  type ThemeMode,
  type ColorBlindMode,
  type FontSizeScale,
} from "../constants/Karwa.theme";

const queryClient = new QueryClient();

// Storage keys
const THEME_MODE_KEY = "@karwa_theme_mode";
const COLOR_BLIND_MODE_KEY = "@karwa_color_blind_mode";
const FONT_SIZE_SCALE_KEY = "@karwa_font_size_scale";

export default function RootLayout() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Theme state
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [colorBlindMode, setColorBlindModeState] = useState<ColorBlindMode>("none");
  const [fontSizeScale, setFontSizeScaleState] = useState<FontSizeScale>("medium");
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load auth token
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getToken();
      if (storedToken) {
        setToken(storedToken);
      }
    };

    void loadToken();
  }, []);

  // Listen for forced-logout events from the axios 401 interceptor
  useEffect(() => {
    const unsubscribe = onForceLogout(() => {
      setToken(null);
      setUser(null);
      queryClient.clear(); // Clear all cached queries to stop refetch loops
    });
    return unsubscribe;
  }, []);

  // Load theme settings from storage
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const [storedThemeMode, storedColorBlindMode, storedFontSizeScale] =
          await Promise.all([
            AsyncStorage.getItem(THEME_MODE_KEY),
            AsyncStorage.getItem(COLOR_BLIND_MODE_KEY),
            AsyncStorage.getItem(FONT_SIZE_SCALE_KEY),
          ]);

        if (storedThemeMode) {
          setThemeModeState(storedThemeMode as ThemeMode);
        }
        if (storedColorBlindMode) {
          setColorBlindModeState(storedColorBlindMode as ColorBlindMode);
        }
        if (storedFontSizeScale) {
          setFontSizeScaleState(storedFontSizeScale as FontSizeScale);
        }
      } catch (error) {
        console.error("Error loading theme settings:", error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    void loadThemeSettings();
  }, []);

  // Theme setters with persistence
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error("Error saving theme mode:", error);
    }
  }, []);

  const setColorBlindMode = useCallback(async (mode: ColorBlindMode) => {
    setColorBlindModeState(mode);
    try {
      await AsyncStorage.setItem(COLOR_BLIND_MODE_KEY, mode);
    } catch (error) {
      console.error("Error saving color blind mode:", error);
    }
  }, []);

  const setFontSizeScale = useCallback(async (scale: FontSizeScale) => {
    setFontSizeScaleState(scale);
    try {
      await AsyncStorage.setItem(FONT_SIZE_SCALE_KEY, scale);
    } catch (error) {
      console.error("Error saving font size scale:", error);
    }
  }, []);

  const logout = async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  };

  const authValue = useMemo(
    () => ({
      token,
      user,
      setToken,
      setUser,
      logout,
    }),
    [token, user],
  );

  // Compute theme value
  const themeValue = useMemo(() => {
    const theme = getProcessedTheme(themeMode, colorBlindMode);
    const typography = getScaledTypography(fontSizeScale);

    return {
      theme,
      themeMode,
      setThemeMode,
      colorBlindMode,
      setColorBlindMode,
      fontSizeScale,
      setFontSizeScale,
      typography,
    };
  }, [themeMode, colorBlindMode, fontSizeScale, setThemeMode, setColorBlindMode, setFontSizeScale]);

  // Use a default theme while loading to prevent flash
  const currentTheme = isThemeLoaded ? themeValue.theme : lightTheme;

  return (
    <SafeAreaProvider>
      <SafeAreaView 
        style={{ flex: 1, backgroundColor: "white" }}
        edges={['top', 'left', 'right', "bottom"]}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={themeValue}>
            <AuthContext.Provider value={authValue}>
              <Stack screenOptions={{ headerShown: false }} />
            </AuthContext.Provider>
          </ThemeContext.Provider>
        </QueryClientProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
