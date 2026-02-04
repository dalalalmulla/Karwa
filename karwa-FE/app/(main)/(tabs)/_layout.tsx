import React from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

import { HapticTab } from "@/components/haptic-tab";
import { colors, spacing } from "@/constants/theme";
import { useQuery } from "@tanstack/react-query";
import { getNotificationsApi } from "@/src/api/notificationCalls";

export default function TabLayout() {
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotificationsApi({ limit: 50 }),
    refetchInterval: 15000,
  });

  const unreadCount = notificationsData?.data?.unreadCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <AntDesign name="profile" size={22} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
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
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});
