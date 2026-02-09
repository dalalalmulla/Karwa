import { Stack, Redirect } from "expo-router";
import React from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { useAuth } from "@/src/context/AuthContext";

export default function MainLayout() {
  const { theme } = useTheme();
  const { token } = useAuth();

  // Auth guard: redirect to login if not authenticated
  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="task/[id]" />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: "Profile",
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.textTitle,
          headerTitleStyle: {
            fontWeight: "700",
          },
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="create-task"
        options={{
          headerShown: true,
          title: "Create Task",
          presentation: "card",
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.textTitle,
          headerTitleStyle: {
            fontWeight: "700",
          },
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
    </Stack>
  );
}
