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
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Smart Leaf</Text>
        <Text style={styles.subtitle}>
          Scan leaves, diagnose diseases, and get instant treatment advice.
        </Text>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    height: 300,
    width: "100%",
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 32,
    paddingHorizontal: 16,
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
  subtitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
    marginTop: 6,
  },
});

export default SmartLeafBanner;
