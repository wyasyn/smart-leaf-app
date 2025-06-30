import { usePlantDiseaseStore } from "@/store/plantDiseaseStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { stylesHome as styles } from "../utils/home-screen-styles";
import renderRecentScan from "./resent-scan-item";

const { width } = Dimensions.get("window");

function HomeHistory() {
  const { predictionHistory } = usePlantDiseaseStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [predictionHistory.length]);

  const handleSeeAllPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/history");
  };

  const handleScanPress = () => {
    Haptics.selectionAsync();
    router.push("/scan");
  };

  if (predictionHistory.length === 0) {
    return (
      <Animated.View
        style={[
          styles.noHistoryContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Enhanced Empty State */}
        <View style={enhancedStyles.emptyStateContainer}>
          <LinearGradient
            colors={["#E8F5E8", "#F0F8F0"]}
            style={enhancedStyles.emptyStateGradient}
          >
            <View style={enhancedStyles.emptyIconContainer}>
              <Ionicons name="leaf" size={60} color="#4CAF50" />
              <View style={enhancedStyles.sparkleContainer}>
                <Ionicons name="sparkles" size={20} color="#66BB6A" />
              </View>
            </View>
          </LinearGradient>

          <View style={enhancedStyles.emptyTextContainer}>
            <Text style={enhancedStyles.emptyTitle}>
              Start Your Plant Journey
            </Text>
            <Text style={enhancedStyles.emptySubtitle}>
              Scan your first plant to build your personal garden history and
              track the health of your green friends! 🌿
            </Text>
          </View>

          <TouchableOpacity
            style={enhancedStyles.startScanButton}
            onPress={handleScanPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4CAF50", "#66BB6A"]}
              style={enhancedStyles.startScanGradient}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={enhancedStyles.startScanText}>Start Scanning</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.recentScansContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Enhanced Header */}
      <View style={enhancedStyles.headerContainer}>
        <View style={enhancedStyles.headerLeft}>
          <Text style={enhancedStyles.sectionTitle}>Recent Scans</Text>
          <View style={enhancedStyles.scanCountBadge}>
            <Text style={enhancedStyles.scanCountText}>
              {predictionHistory.length}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={enhancedStyles.seeAllButton}
          onPress={handleSeeAllPress}
          activeOpacity={0.7}
        >
          <Text style={enhancedStyles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Scan List */}
      <View style={enhancedStyles.scanListContainer}>
        <FlatList
          data={predictionHistory.slice(0, 3)}
          renderItem={({ item }) => (
            <Animated.View
              style={{
                opacity: fadeAnim,
              }}
            >
              {renderRecentScan({ item })}
            </Animated.View>
          )}
          keyExtractor={(item) => item.timestamp.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          style={{
            paddingBlock: 16,
          }}
        />

        {/* Quick Stats */}
        <View style={enhancedStyles.quickStatsContainer}>
          <View style={enhancedStyles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={enhancedStyles.statText}>
              {predictionHistory.filter((scan) => scan.confidence > 80).length}{" "}
              High Confidence
            </Text>
          </View>

          <View style={enhancedStyles.statItem}>
            <Ionicons name="warning" size={20} color="#FF9800" />
            <Text style={enhancedStyles.statText}>
              {
                predictionHistory.filter(
                  (scan) => scan.disease_info.disease_name !== "Healthy"
                ).length
              }{" "}
              Issues Found
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const enhancedStyles = StyleSheet.create({
  // Empty State Styles
  emptyStateContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyStateGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  emptyIconContainer: {
    position: "relative",
  },
  sparkleContainer: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 4,
    elevation: 3,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyTextContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C5530",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: width - 80,
  },
  startScanButton: {
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startScanGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  startScanText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  // Enhanced Header Styles
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C5530",
  },
  scanCountBadge: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  scanCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },

  // Enhanced List Styles
  scanListContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  // Quick Stats Styles
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8F5E8",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});

export default HomeHistory;
