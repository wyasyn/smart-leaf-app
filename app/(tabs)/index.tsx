import HomeDiseases from "@/components/home-diseases";
import HomeHistory from "@/components/home-history";
import SmartLeafBanner from "@/components/SmartLeafBanner";
import { HomeScreenProps } from "@/utils/lib";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { stylesHome as styles } from "../../utils/home-screen-styles";

const HomeScreen: React.FC<HomeScreenProps> = ({ isOffline = false }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SmartLeafBanner />

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            📱 Offline Mode - Some features may be limited
          </Text>
        </View>
      )}

      {/* Main Scan Button */}
      <TouchableOpacity
        style={styles.mainScanButton}
        onPress={() => {
          Haptics.selectionAsync();
          router.push("/scan");
        }}
        activeOpacity={0.8}
      >
        <View style={styles.scanButtonContent}>
          <View style={styles.scanIconContainer}>
            <Ionicons name="camera" size={32} color="#fff" />
          </View>
          <View style={styles.scanButtonText}>
            <Text style={styles.scanButtonTitle}>Scan Plant</Text>
            <Text style={styles.scanButtonSubtitle}>
              Detect diseases instantly
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/diseases")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E8F5E8" }]}
            >
              <Ionicons name="library" size={24} color="#2C5530" />
            </View>
            <Text style={styles.quickActionText}>View Diseases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/history")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}
            >
              <Ionicons name="time" size={24} color="#E65100" />
            </View>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/settings")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FCE4EC" }]}
            >
              <Ionicons name="settings" size={24} color="#C2185B" />
            </View>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/search")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}
            >
              <Ionicons name="search" size={24} color="#1976D2" />
            </View>
            <Text style={styles.quickActionText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Plant & Disease Carousel */}
      <HomeDiseases />

      <HomeHistory />
    </ScrollView>
  );
};

export default HomeScreen;
