import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { stylesHome as styles } from "../../utils/home-screen-styles";

interface RecentScan {
  id: string;
  plantName: string;
  disease: string;
  date: string;
  severity: "low" | "medium" | "high";
  image: string;
}

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  type: "plant" | "disease";
}

interface HomeScreenProps {
  navigation: any;
  isOffline?: boolean;
  recentScans?: RecentScan[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  navigation,
  isOffline = false,
  recentScans = [],
}) => {
  // Mock data for demonstration
  const mockRecentScans: RecentScan[] = [
    {
      id: "1",
      plantName: "Tomato",
      disease: "Late Blight",
      date: "2 hours ago",
      severity: "high",
      image: "https://example.com/tomato-blight.jpg",
    },
    {
      id: "2",
      plantName: "Rose",
      disease: "Black Spot",
      date: "1 day ago",
      severity: "medium",
      image: "https://example.com/rose-blackspot.jpg",
    },
    {
      id: "3",
      plantName: "Apple",
      disease: "Apple Scab",
      date: "3 days ago",
      severity: "low",
      image: "https://example.com/apple-scab.jpg",
    },
  ];

  const carouselData: CarouselItem[] = [
    {
      id: "1",
      title: "Tomato Diseases",
      description: "Learn about common tomato plant diseases",
      image: "https://example.com/tomato-diseases.jpg",
      type: "plant",
    },
    {
      id: "2",
      title: "Rose Care Tips",
      description: "Keep your roses healthy and beautiful",
      image: "https://example.com/rose-care.jpg",
      type: "plant",
    },
    {
      id: "3",
      title: "Fungal Infections",
      description: "Identify and treat fungal diseases",
      image: "https://example.com/fungal-diseases.jpg",
      type: "disease",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#FF4444";
      case "medium":
        return "#FF8800";
      case "low":
        return "#44AA44";
      default:
        return "#666";
    }
  };

  const renderCarouselItem = (item: CarouselItem, index: number) => (
    <TouchableOpacity key={item.id} style={styles.carouselItem}>
      <View style={styles.carouselImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.carouselImage}
          defaultSource={require("../../assets/images/placeholder-image.png")}
        />
        <View style={styles.carouselOverlay}>
          <Ionicons
            name={item.type === "plant" ? "leaf" : "bug"}
            size={24}
            color="#fff"
          />
        </View>
      </View>
      <View style={styles.carouselContent}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        <Text style={styles.carouselDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentScan = (scan: RecentScan) => (
    <TouchableOpacity key={scan.id} style={styles.recentScanItem}>
      <View style={styles.scanImageContainer}>
        <Image
          source={{ uri: scan.image }}
          style={styles.scanImage}
          defaultSource={require("../../assets/images/placeholder-image.png")}
        />
      </View>
      <View style={styles.scanDetails}>
        <Text style={styles.scanPlantName}>{scan.plantName}</Text>
        <Text style={styles.scanDisease}>{scan.disease}</Text>
        <Text style={styles.scanDate}>{scan.date}</Text>
      </View>
      <View
        style={[
          styles.severityIndicator,
          { backgroundColor: getSeverityColor(scan.severity) },
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.appTitle}>Smart Leaf</Text>
          </View>
          <View style={styles.headerIcons}>
            {isOffline && (
              <View style={styles.offlineIndicator}>
                <Ionicons name="cloud-offline" size={20} color="#FF6B6B" />
              </View>
            )}
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push("/settings")}
            >
              <Ionicons name="settings-outline" size={24} color="#2C5530" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
      <View style={styles.carouselContainer}>
        <View style={styles.carouselHeader}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <TouchableOpacity onPress={() => router.push("/diseases")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {carouselData.map((item, index) => renderCarouselItem(item, index))}
        </ScrollView>
      </View>

      {/* Recent Scans */}
      {(recentScans.length > 0 || mockRecentScans.length > 0) && (
        <View style={styles.recentScansContainer}>
          <View style={styles.recentScansHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentScansList}>
            {(recentScans.length > 0 ? recentScans : mockRecentScans)
              .slice(0, 3)
              .map(renderRecentScan)}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
