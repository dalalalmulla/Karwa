import { Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "../src/context/AuthContext";
import type { User } from "../src/types/userTypes";
import { getToken, clearToken } from "../src/utils/token";
import { SafeAreaView } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getToken();
      if (storedToken) {
        setToken(storedToken);
      }
    };

    void loadToken();
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthContext.Provider>
    </QueryClientProvider>
    </SafeAreaView>
  );
}
