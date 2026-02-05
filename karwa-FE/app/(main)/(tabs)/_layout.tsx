import React from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing } from "@/constants/Karwa.theme";
import { useQuery } from "@tanstack/react-query";
import { getNotificationsApi } from "@/src/api/notificationCalls";

export default function TabLayout() {
  const { theme } = useTheme();
  
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotificationsApi({ limit: 50 }),
    refetchInterval: 15000,
  });

  const unreadCount = notificationsData?.data?.unreadCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.surface, borderTopColor: theme.border }],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* Profile on the left */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <AntDesign name="profile" size={22} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: [styles.badge, { backgroundColor: theme.primary }],
        }}
      />

      {/* Home in the middle */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={22} color={color} />
          ),
        }}
      />

      {/* Settings on the right */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <AntDesign name="setting" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    height: 56,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: -2,
  },
  badge: {
    color: "#FDFCFD",
    fontSize: 10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});
