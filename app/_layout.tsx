import { Stack } from "expo-router";
import React from "react";

const MainLayout = () => {
  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="scan" />
    </Stack>
  );
};

export default MainLayout;
