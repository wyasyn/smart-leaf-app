import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

const MainLayout = () => {
  return (
    <>
      <StatusBar hidden />
      <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="scan-details/[predictionId]" />
        <Stack.Screen name="disease/[id]" />
      </Stack>
    </>
  );
};

export default MainLayout;
