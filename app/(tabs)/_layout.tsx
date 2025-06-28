import { colors } from "@/utils/colors";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_MARGIN = SCREEN_WIDTH * 0.08;

const TabIcon = ({
  color,
  focused,
  iconSet,
  iconName,
}: {
  color: string;
  focused: boolean;
  iconSet: "Feather" | "MaterialCommunityIcons";
  iconName: string;
}) => {
  const IconComponent =
    iconSet === "Feather" ? Feather : MaterialCommunityIcons;

  return (
    <View
      style={{
        padding: 8,
        backgroundColor: focused ? colors.primary : "transparent",
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        width: 50,
        height: 50,
      }}
    >
      <IconComponent name={iconName as any} size={24} color={color} />
    </View>
  );
};

const RootLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.title,
        tabBarInactiveTintColor: colors.text,
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={50}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarStyle: {
          position: "absolute",
          bottom: 24,
          height: 70,
          marginHorizontal: HORIZONTAL_MARGIN,
          borderRadius: 50,
          backgroundColor: colors.bgTabbar,
          borderWidth: 1,
          borderColor: colors.bgTabbar,
          overflow: "hidden",
        },
        tabBarItemStyle: {
          height: 70,
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
            <TabIcon
              iconSet="Feather"
              iconName="home"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              iconSet="Feather"
              iconName="clock"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diseases"
        options={{
          title: "Diseases",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              iconSet="MaterialCommunityIcons"
              iconName="virus-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              iconSet="Feather"
              iconName="settings"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default RootLayout;
