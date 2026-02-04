import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Tabs, useRouter } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/constants/theme";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Browse Tasks",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/(main)/create-task")}
              style={styles.headerRight}
              hitSlop={10}
            >
              {/* إذا IconSymbol ما يدعم "plus" غيريه إلى "plus.circle.fill" */}
              <IconSymbol size={22} name="plus" color={colors.text} />
              {/* fallback إذا احتجتي:
              <Text style={styles.plusText}>+</Text>
              */}
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore Tasks",
          tabBarLabel: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chevron.right.forwardslash.chevron.right" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
  },
  headerRight: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  plusText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
});
