import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Mock API stats data (replace with actual API call)
const mockStats = {
  total_classes: 38,
  diseases_in_guide: 31,
  healthy_classes: 7,
  supported_crops: [
    "Apple",
    "Blueberry",
    "Cherry",
    "Corn",
    "Grape",
    "Orange",
    "Peach",
    "Pepper",
    "Potato",
    "Raspberry",
    "Soybean",
    "Squash",
    "Strawberry",
    "Tomato",
  ],
  disease_types: ["Bacterial", "Fungal", "Viral"],
  risk_levels: ["High", "Low", "Medium"],
  model_loaded: true,
  endpoints: {
    prediction: "/predict",
    all_diseases: "/diseases",
    search: "/search",
    disease_by_id: "/diseases/{class_id}",
    disease_by_name: "/diseases/by-name/{class_name}",
    health: "/health",
    stats: "/stats",
  },
};

const SettingsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [highQuality, setHighQuality] = useState(true);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);

      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    // Pulse animation for model status
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={color}
        style={styles.statCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardHeader}>
          <Ionicons name={icon} size={24} color="white" />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Animated.View>
  );

  const SettingItem = ({
    title,
    subtitle,
    value,
    onToggle,
    icon,
    type = "switch",
  }) => (
    <Animated.View
      style={[
        styles.settingItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color="#4A90E2" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {type === "switch" ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#E0E0E0", true: "#4A90E2" }}
          thumbColor={value ? "#FFFFFF" : "#FFFFFF"}
          ios_backgroundColor="#E0E0E0"
        />
      ) : (
        <TouchableOpacity onPress={onToggle}>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const CropChip = ({ crop, index }) => (
    <Animated.View
      style={[
        styles.cropChip,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: Animated.add(
                slideAnim,
                new Animated.Value(index * 5)
              ),
            },
          ],
        },
      ]}
    >
      <Text style={styles.cropChipText}>{crop}</Text>
    </Animated.View>
  );

  const handleRefreshStats = () => {
    Alert.alert("Refresh Stats", "This will fetch the latest API statistics.", [
      { text: "Cancel", style: "cancel" },
      { text: "Refresh", onPress: () => console.log("Refreshing stats...") },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "This will clear all cached images and data.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => console.log("Clearing cache..."),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.loadingGradient}
        >
          <Animated.View
            style={[
              styles.loadingIndicator,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons name="leaf" size={50} color="white" />
          </Animated.View>
          <Text style={styles.loadingText}>Loading Settings...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Plant Disease Detection API</Text>
          <View style={styles.modelStatus}>
            <Animated.View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: stats?.model_loaded ? "#4CAF50" : "#FF5252",
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <Text style={styles.statusText}>
              Model {stats?.model_loaded ? "Online" : "Offline"}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* API Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Classes"
              value={stats?.total_classes}
              icon="library"
              color={["#FF6B6B", "#FF8787"]}
            />
            <StatCard
              title="Diseases"
              value={stats?.diseases_in_guide}
              icon="medical"
              color={["#4ECDC4", "#44A08D"]}
            />
            <StatCard
              title="Healthy Classes"
              value={stats?.healthy_classes}
              icon="checkmark-circle"
              color={["#45B7D1", "#96C93D"]}
            />
            <StatCard
              title="Risk Levels"
              value={stats?.risk_levels?.length}
              icon="warning"
              color={["#FFA726", "#FF7043"]}
              subtitle={stats?.risk_levels?.join(", ")}
            />
          </View>
        </View>

        {/* Supported Crops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Supported Crops ({stats?.supported_crops?.length})
          </Text>
          <View style={styles.cropsContainer}>
            {stats?.supported_crops?.map((crop, index) => (
              <CropChip key={crop} crop={crop} index={index} />
            ))}
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsContainer}>
            <SettingItem
              title="Push Notifications"
              subtitle="Get notified about new disease alerts"
              value={notifications}
              onToggle={setNotifications}
              icon="notifications"
            />
            <SettingItem
              title="Dark Mode"
              subtitle="Switch to dark theme"
              value={darkMode}
              onToggle={setDarkMode}
              icon="moon"
            />
            <SettingItem
              title="Auto Sync"
              subtitle="Automatically sync data in background"
              value={autoSync}
              onToggle={setAutoSync}
              icon="sync"
            />
            <SettingItem
              title="High Quality Images"
              subtitle="Use high resolution for better accuracy"
              value={highQuality}
              onToggle={setHighQuality}
              icon="camera"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.settingsContainer}>
            <SettingItem
              title="Refresh Statistics"
              subtitle="Get latest API data"
              onToggle={handleRefreshStats}
              icon="refresh"
              type="action"
            />
            <SettingItem
              title="Clear Cache"
              subtitle="Free up storage space"
              onToggle={handleClearCache}
              icon="trash"
              type="action"
            />
            <SettingItem
              title="About"
              subtitle="Version 2.1.0"
              onToggle={() =>
                Alert.alert("About", "Plant Disease Detection App v2.1.0")
              }
              icon="information-circle"
              type="action"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by TensorFlow & Hugging Face
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 15,
  },
  modelStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 50) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardGradient: {
    padding: 20,
    minHeight: 100,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  statTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  statSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
  },
  cropsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  cropChip: {
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 5,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  cropChipText: {
    color: "#1976D2",
    fontSize: 12,
    fontWeight: "600",
  },
  settingsContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: "#95A5A6",
    fontStyle: "italic",
  },
});

export default SettingsScreen;
