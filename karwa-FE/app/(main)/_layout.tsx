import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '@/constants/theme';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="task/[id]" />
      <Stack.Screen 
        name="create-task" 
        options={{ 
          headerShown: true,
          title: 'Create Task',
          presentation: 'card',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }} 
      />
    </Stack>
  );
}

