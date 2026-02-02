import { Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthContext } from "../src/context/AuthContext";
import type { User } from "../src/types/userTypes";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await SecureStore.getItemAsync("token");
      if (savedToken) setToken(savedToken);
    };
    loadToken();
  }, []);

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
    setUser(null);
  };

  const authValue = useMemo(
    () => ({ token, user, setToken, setUser, logout }),
    [token, user]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
