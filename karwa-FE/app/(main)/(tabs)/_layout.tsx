import React from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/src/context/ThemeContext";
import { spacing } from "@/constants/Karwa.theme";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* Home on the left */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={22} color={color} />
          ),
        }}
      />

      {/* Create Task in the middle */}
      <Tabs.Screen
        name="create-task"
        options={{
          title: "Create Task",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign 
              name="plus" 
              size={focused ? 22 : 22} 
              color={color} 
            />
          ),
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
        }}
      />

      {/* Profile next */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={22} color={color} />
          ),
        }}
      />

      {/* Settings last */}
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
    // backgroundColor:"red"
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
    // marginTop: -2,
  },
  badge: {
    color: "#FDFCFD",
    fontSize: 10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});
