import React from "react";
import { Animated, Easing, Text, View } from "react-native";

const ValidateImage = () => {
  const useSpinAnimation = () => {
    const spinValue = new Animated.Value(0);

    React.useEffect(() => {
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => spin());
      };
      spin();
    }, []);

    const spinInterpolate = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return { transform: [{ rotate: spinInterpolate }] };
  };
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
        zIndex: 1000, // Ensure it's above everything
      }}
    >
      <View
        style={{
          padding: 20,
          borderRadius: 12,
          backgroundColor: "#06923E",
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5, // Android shadow
        }}
      >
        <Animated.View
          style={[
            {
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: "white",
              borderTopColor: "transparent",
              borderRadius: 10,
              marginRight: 12,
            },
            useSpinAnimation(),
          ]}
        />
        <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
          Validating image...
        </Text>
      </View>
    </View>
  );
};

export default ValidateImage;
