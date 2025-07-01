import { colors } from "@/utils/colors";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_MARGIN = SCREEN_WIDTH * 0.08;

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const router = useRouter();

  const renderTab = (route: any, index: number) => {
    const isFocused = state.index === index;
    const iconColor = isFocused ? "#4300FF" : colors.text;

    let iconSet = "Feather";
    let iconName = "";

    if (route.name === "index") iconName = "home";
    if (route.name === "history") iconName = "clock";
    if (route.name === "diseases") {
      iconSet = "MaterialCommunityIcons";
      iconName = "virus-outline";
    }
    if (route.name === "settings") iconName = "settings";

    const IconComponent =
      iconSet === "Feather" ? Feather : MaterialCommunityIcons;

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        onPress={() => navigation.navigate(route.name)}
        style={styles.tabItem}
      >
        <View style={styles.iconWrapper}>
          <IconComponent name={iconName as any} size={24} color={iconColor} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <BlurView tint="light" intensity={50} style={styles.tabBar}>
        {/* Left half of tabs */}
        {state.routes
          .slice(0, 2)
          .map((route, index) => renderTab(route, index))}

        {/* Placeholder for Scan Button */}
        <View key="placeholder" style={{ width: 70 }} />

        {/* Right half of tabs */}
        {state.routes
          .slice(2)
          .map((route, index) => renderTab(route, index + 2))}
      </BlurView>

      {/* Floating Scan Button */}
      <TouchableOpacity
        onPress={() => router.push("/scan")}
        style={styles.scanButtonContainer}
        activeOpacity={0.9}
      >
        <View style={styles.scanButton}>
          <AntDesign name="camerao" size={28} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 24,
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    height: 60,
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.bgTabbar,
    backgroundColor: colors.bgTabbar,
    paddingInline: 5,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  tabItem: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  scanButtonContainer: {
    position: "absolute",
    bottom: 12,
    left: SCREEN_WIDTH / 2 - 35 - HORIZONTAL_MARGIN,
    zIndex: 999,
    elevation: 8,
  },
  scanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
});
