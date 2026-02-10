import { Stack } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerLeft: () => null,
        headerRight: () => null,
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
           <Stack.Screen 
        name="login" 
        options={{ 
          title: "Login",
          headerShown: false,
          headerLeft: () => null,
          headerRight: () => null,
          headerBackVisible: false,
          gestureEnabled: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen name="register" options={{ title: "Register" }} />
 
    </Stack>
  );
}
