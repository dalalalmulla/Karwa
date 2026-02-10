import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@/src/context/ThemeContext";

export default function MainLayout() {
  const { theme } = useTheme();

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
