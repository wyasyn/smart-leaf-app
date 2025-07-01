import CustomTabBar from "@/components/CustomTabBar";
import { Tabs } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

const RootLayout = () => {
  return (
    <>
      <StatusBar hidden />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      />
    </>
  );
};

export default RootLayout;
