import SmartLeafBanner from "@/components/SmartLeafBanner";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { stylesHome as styles } from "../../utils/home-screen-styles";

// API Response Types (matching your FastAPI backend)
interface DiseaseInfo {
  disease_name?: string;
  common_names: string[];
  crop: string;
  description: string;
  symptoms: string[];
  cause?: string;
  treatment: string[];
  image_urls: string[];
  prevention: string[];
  management_tips: string;
  risk_level: string;
  sprayer_intervals: string;
  localized_tips: string;
  type: string;
  external_resources: { [key: string]: string }[];
}

interface PredictionResponse {
  success: boolean;
  predicted_class: string;
  clean_class_name: string;
  confidence: number;
  confidence_level: "High" | "Medium" | "Low";
  all_predictions: { [key: string]: number };
  disease_info: DiseaseInfo;
  recommendations: string[];
  message: string;
}

// Recent Scan interface matching API prediction response
interface RecentScan {
  id: string;
  predicted_class: string;
  clean_class_name: string;
  confidence: number;
  confidence_level: "High" | "Medium" | "Low";
  disease_info: DiseaseInfo;
  scanned_image_uri: string; // Local URI of the scanned image
  timestamp: string; // ISO date string
  recommendations: string[];
  created_at?: Date; // For local processing
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
  // Mock data for demonstration (matching API structure)
  const mockRecentScans: RecentScan[] = [
    {
      id: "1",
      predicted_class: "Tomato___Late_blight",
      clean_class_name: "Tomato - Late Blight",
      confidence: 0.89,
      confidence_level: "High",
      disease_info: {
        disease_name: "Late Blight",
        common_names: ["Late Blight", "Tomato Late Blight"],
        crop: "Tomato",
        description: "A serious fungal disease affecting tomato plants",
        symptoms: [
          "Dark spots on leaves",
          "White fuzzy growth",
          "Rapid spread",
        ],
        cause: "Phytophthora infestans",
        treatment: [
          "Apply fungicide",
          "Remove affected parts",
          "Improve air circulation",
        ],
        image_urls: [],
        prevention: ["Avoid overhead watering", "Ensure good drainage"],
        management_tips:
          "Monitor weather conditions and apply preventive sprays",
        risk_level: "High",
        sprayer_intervals: "Every 7-10 days",
        localized_tips: "Common during rainy seasons",
        type: "Fungal",
        external_resources: [],
      },
      scanned_image_uri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpPs6INuAXCgcXzA7QpWKI3iX3bRsJjOOJ1g&s",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      recommendations: [
        "Apply fungicide immediately",
        "Remove affected leaves",
        "Monitor other plants",
      ],
    },
    {
      id: "2",
      predicted_class: "Apple___Apple_scab",
      clean_class_name: "Apple - Apple Scab",
      confidence: 0.76,
      confidence_level: "Medium",
      disease_info: {
        disease_name: "Apple Scab",
        common_names: ["Apple Scab", "Black Spot"],
        crop: "Apple",
        description:
          "A fungal disease causing dark spots on apple leaves and fruit",
        symptoms: [
          "Dark olive-green spots",
          "Yellowing leaves",
          "Fruit lesions",
        ],
        cause: "Venturia inaequalis",
        treatment: ["Fungicide application", "Pruning for air circulation"],
        image_urls: [],
        prevention: ["Regular pruning", "Avoid wet conditions"],
        management_tips: "Apply preventive fungicides in spring",
        risk_level: "Medium",
        sprayer_intervals: "Every 14 days",
        localized_tips: "Most common in humid conditions",
        type: "Fungal",
        external_resources: [],
      },
      scanned_image_uri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAu2mZ830SD2185RCt26uImF95C7pXFhwXMQ&s",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      recommendations: [
        "Monitor closely",
        "Consider fungicide treatment",
        "Improve air circulation",
      ],
    },
    {
      id: "3",
      predicted_class: "Tomato___healthy",
      clean_class_name: "Tomato - Healthy",
      confidence: 0.95,
      confidence_level: "High",
      disease_info: {
        disease_name: undefined,
        common_names: [],
        crop: "Tomato",
        description: "Plant appears healthy with no signs of disease",
        symptoms: [],
        cause: undefined,
        treatment: [],
        image_urls: [],
        prevention: ["Continue current care routine", "Regular monitoring"],
        management_tips: "Maintain preventive measures",
        risk_level: "Low",
        sprayer_intervals: "",
        localized_tips: "Keep monitoring for any changes",
        type: "Healthy",
        external_resources: [],
      },
      scanned_image_uri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlH_pk3OejRS8KaHqhY6syHFykX6IT_tCZsQ&s",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      recommendations: [
        "Plant appears healthy",
        "Continue current care routine",
        "Monitor regularly",
      ],
    },
  ];

  const carouselData: CarouselItem[] = [
    {
      id: "1",
      title: "Tomato Diseases",
      description: "Learn about common tomato plant diseases",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6g7fizzu3tlT8-10wm5r-PctBYLERg2iyGA&s",
      type: "plant",
    },
    {
      id: "2",
      title: "Rose Care Tips",
      description: "Keep your roses healthy and beautiful",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8y3nRaWO_iJhCN71hsP3NTRUfLc1BH7O8bw&s",
      type: "plant",
    },
    {
      id: "3",
      title: "Fungal Infections",
      description: "Identify and treat fungal diseases",
      image:
        "https://www.lovethegarden.com/sites/default/files/styles/header_image_fallback/public/content/articles/UK_learn-grow-garden-advice-pests-disease-control-common-types-plant-fungus_header.jpg?itok=rpZjn9px",
      type: "disease",
    },
  ];

  // Helper function to get severity color based on risk level and confidence
  const getSeverityColor = (riskLevel: string, confidenceLevel: string) => {
    if (confidenceLevel === "Low") return "#999"; // Gray for low confidence

    switch (riskLevel.toLowerCase()) {
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

  // Helper function to format timestamp to relative time
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const scanTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - scanTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return scanTime.toLocaleDateString();
  };

  // Helper function to get confidence badge color
  const getConfidenceBadgeColor = (confidenceLevel: string) => {
    switch (confidenceLevel) {
      case "High":
        return { backgroundColor: "#E8F5E8", color: "#2C5530" };
      case "Medium":
        return { backgroundColor: "#FFF3E0", color: "#E65100" };
      case "Low":
        return { backgroundColor: "#FCE4EC", color: "#C2185B" };
      default:
        return { backgroundColor: "#F5F5F5", color: "#666" };
    }
  };

  const renderCarouselItem = ({ item }: { item: CarouselItem }) => (
    <TouchableOpacity style={styles.carouselItem}>
      <View style={styles.carouselImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.carouselImage}
          defaultSource={require("../../assets/images/placeholder-image.png")}
        />
      </View>
      <View style={styles.carouselContent}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        <Text style={styles.carouselDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentScan = ({ item }: { item: RecentScan }) => {
    const confidenceColors = getConfidenceBadgeColor(item.confidence_level);
    const isHealthy = !item.disease_info.disease_name;

    return (
      <TouchableOpacity
        style={styles.recentScanItem}
        onPress={() => {
          // Navigate to scan details with the full prediction data
          router.push({
            pathname: "/scan-details",
            params: { scanId: item.id },
          });
        }}
      >
        <View style={styles.scanImageContainer}>
          <Image
            source={{ uri: item.scanned_image_uri }}
            style={styles.scanImage}
            defaultSource={require("../../assets/images/placeholder-image.png")}
          />
        </View>
        <View style={styles.scanDetails}>
          <View style={styles.scanHeader}>
            <Text style={styles.scanPlantName}>{item.disease_info.crop}</Text>
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: confidenceColors.backgroundColor },
              ]}
            >
              <Text
                style={[
                  styles.confidenceText,
                  { color: confidenceColors.color },
                ]}
              >
                {Math.round(item.confidence * 100)}%
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.scanDisease,
              { color: isHealthy ? "#44AA44" : "#666" },
            ]}
          >
            {isHealthy ? "Healthy Plant" : item.disease_info.disease_name}
          </Text>
          <Text style={styles.scanDate}>{getRelativeTime(item.timestamp)}</Text>
        </View>
        <View
          style={[
            styles.severityIndicator,
            {
              backgroundColor: getSeverityColor(
                item.disease_info.risk_level,
                item.confidence_level
              ),
            },
          ]}
        />
      </TouchableOpacity>
    );
  };

  const currentScans = recentScans.length > 0 ? recentScans : mockRecentScans;

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
      <View style={styles.carouselContainer}>
        <View style={styles.carouselHeader}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <TouchableOpacity onPress={() => router.push("/diseases")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={{
            marginLeft: 20,
            marginRight: 20,
            paddingBottom: 24,
          }}
          data={carouselData}
          renderItem={renderCarouselItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        />
      </View>

      {/* Recent Scans */}
      {currentScans.length > 0 && (
        <View style={styles.recentScansContainer}>
          <View style={styles.recentScansHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            style={{
              paddingBottom: 24,
            }}
            data={currentScans.slice(0, 3)}
            renderItem={renderRecentScan}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
