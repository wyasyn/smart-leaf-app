import { colors } from "@/utils/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ImageBackground, StyleSheet, Text } from "react-native";

const SmartLeafBanner = () => {
  return (
    <ImageBackground
      source={require("../assets/images/leaf-bg.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["#F8FDF8", "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.gradient}
      >
        <Image
          source={require("../assets/images/icon.png")} // Your logo path
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Smart Leaf</Text>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    height: 250,
    width: "100%",
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.title,
  },
});

export default SmartLeafBanner;
