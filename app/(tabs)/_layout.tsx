import { colors } from "@/utils/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

const TabIcon = ({
  color,
  focused,
  icon,
}: {
  color: string;
  focused: boolean;
  icon: string;
}) => {
  return (
    <View
      style={{
        padding: 8, // tweak if needed
        backgroundColor: focused ? colors.primary : "transparent",
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        width: 50,
        height: 50,
      }}
    >
      <AntDesign name={icon as any} size={24} color={color} />
    </View>
  );
};

const RootLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.background,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          borderRadius: 50,
          position: "absolute",
          bottom: 32,
          left: 32,
          right: 32,
          marginHorizontal: 40,
          backgroundColor: colors.bgTabbar,
          borderWidth: 1,
          height: 70,

          overflow: "hidden",
        },
        tabBarItemStyle: {
          height: 70, // Match tabBarStyle height
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="home" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="book" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="diseases"
        options={{
          title: "Diseases",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="infocirlceo" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="setting" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default RootLayout;
