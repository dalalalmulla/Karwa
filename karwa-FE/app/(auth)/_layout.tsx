import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
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
      }}>
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
    </Stack>
  );
}
