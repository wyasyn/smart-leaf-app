import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HEADER_MAX_HEIGHT = 250;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Updated type definitions to match the API response
interface ExternalResource {
  title: string;
  url: string;
}

interface DiseaseInfo {
  disease_name?: string;
  common_names: string[];
  crop: string;
  description: string;
  symptoms: string[];
  cause?: string;
  causes?: string[]; // Alternative field name
  treatment: string[];
  treatments?: string[]; // Alternative field name
  image_urls: string[];
  prevention: string[];
  management_tips: string;
  risk_level: string;
  sprayer_intervals: string;
  localized_tips: string;
  type: string;
  external_resources: ExternalResource[];
  scientific_name?: string;
  additional_images?: string[];
  references?: string[];
}

interface SearchResult {
  class_name: string;
  class_id: string;
  disease_info: DiseaseInfo;
}

const DiseaseDetailScreen = () => {
  const { disease: diseaseParam } = useLocalSearchParams();

  const initialDisease = diseaseParam
    ? JSON.parse(diseaseParam as string)
    : null;
  const [disease, setDisease] = useState<SearchResult | null>(initialDisease);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollY] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  const shareDisease = async () => {
    if (!disease) return;

    try {
      await Share.share({
        message: `Check out this plant disease information: ${formatDiseaseName(
          disease.class_name
        )}\n\n${
          disease.disease_info?.description ||
          "Learn more about plant diseases and how to manage them."
        }`,
        title: "Plant Disease Information",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const formatDiseaseName = (className: string) => {
    return className.replace(/___/g, " - ").replace(/_/g, " ");
  };

  const getImageUrl = (disease: SearchResult) => {
    // First, try to get image from disease_info
    if (disease.disease_info?.image_urls?.length > 0) {
      return disease.disease_info.image_urls[0];
    }

    // Fallback to crop-based images
    const cropImages = {
      Apple:
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=600&fit=crop",
      Tomato:
        "https://images.unsplash.com/photo-1546470427-e26264be0b5d?w=800&h=600&fit=crop",
      Grape:
        "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&h=600&fit=crop",
      Corn: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&h=600&fit=crop",
      Potato:
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&h=600&fit=crop",
      Peach:
        "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=800&h=600&fit=crop",
      Pepper:
        "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=600&fit=crop",
      Cherry:
        "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800&h=600&fit=crop",
      Strawberry:
        "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=600&fit=crop",
      Orange:
        "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&h=600&fit=crop",
      Blueberry:
        "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=600&fit=crop",
      Raspberry:
        "https://images.unsplash.com/photo-1577003833619-76bfe21e728d?w=800&h=600&fit=crop",
      Soybean:
        "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=800&h=600&fit=crop",
      Squash:
        "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&h=600&fit=crop",
    };

    const crop = disease.disease_info?.crop || "Unknown";
    return (
      cropImages[crop as keyof typeof cropImages] ||
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop"
    );
  };

  const isHealthy = (disease: SearchResult) => {
    return (
      !disease.disease_info?.disease_name ||
      disease.class_name.toLowerCase().includes("healthy") ||
      disease.disease_info.type?.toLowerCase() === "healthy"
    );
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0.8],
    extrapolate: "clamp",
  });

  const renderInfoSection = (
    title: string,
    content: string | string[] | undefined,
    icon: string
  ) => {
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return null;
    }

    return (
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name={icon as any} size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        </View>
        <View style={styles.sectionContent}>
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionText}>{content}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderStatusCards = () => {
    if (!disease) return null;

    const healthy = isHealthy(disease);

    return (
      <View style={styles.statusCardsContainer}>
        <View
          style={[
            styles.statusCard,
            healthy ? styles.healthyCard : styles.diseaseCard,
          ]}
        >
          <Ionicons
            name={healthy ? "checkmark-circle" : "warning"}
            size={24}
            color={healthy ? "#4CAF50" : "#FF5722"}
          />
          <Text
            style={[
              styles.statusCardTitle,
              healthy ? styles.healthyText : styles.diseaseText,
            ]}
          >
            {healthy ? "Healthy Plant" : "Disease Detected"}
          </Text>
          <Text style={styles.statusCardSubtitle}>
            {disease.disease_info?.crop || "Unknown Crop"}
          </Text>
        </View>

        {disease.disease_info?.risk_level &&
          disease.disease_info.risk_level !== "Unknown" && (
            <View
              style={[
                styles.statusCard,
                disease.disease_info.risk_level === "High"
                  ? styles.highRiskCard
                  : disease.disease_info.risk_level === "Medium"
                  ? styles.mediumRiskCard
                  : styles.lowRiskCard,
              ]}
            >
              <Ionicons
                name={
                  disease.disease_info.risk_level === "High"
                    ? "alert-circle"
                    : disease.disease_info.risk_level === "Medium"
                    ? "warning"
                    : "shield-checkmark"
                }
                size={24}
                color={
                  disease.disease_info.risk_level === "High"
                    ? "#D32F2F"
                    : disease.disease_info.risk_level === "Medium"
                    ? "#F57C00"
                    : "#388E3C"
                }
              />
              <Text style={styles.statusCardTitle}>Risk Level</Text>
              <Text style={styles.statusCardSubtitle}>
                {disease.disease_info.risk_level}
              </Text>
            </View>
          )}
      </View>
    );
  };

  const renderExternalResources = () => {
    if (
      !disease?.disease_info?.external_resources ||
      disease.disease_info.external_resources.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="link-outline" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>External Resources</Text>
          </View>
        </View>
        <View style={styles.sectionContent}>
          {disease.disease_info.external_resources.map((resource, index) => (
            <TouchableOpacity key={index} style={styles.referenceItem}>
              <Ionicons name="open-outline" size={16} color="#4CAF50" />
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceUrl}>{resource.url}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading disease details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !disease) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF5722" />
          <Text style={styles.errorTitle}>Unable to Load Disease Details</Text>
          <Text style={styles.errorText}>
            {error || "Unknown error occurred"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchDiseaseDetail}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.View
          style={[
            styles.backgroundImage,
            {
              opacity: imageOpacity,
              transform: [{ translateY: imageTranslate }],
            },
          ]}
        >
          <Image
            source={{ uri: getImageUrl(disease) }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageOverlay}
          />
        </Animated.View>

        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => navigation.goBack()}
              accessible={true}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={shareDisease}
              accessible={true}
              accessibilityLabel="Share disease information"
            >
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.headerTitleContainer,
              { transform: [{ scale: titleScale }] },
            ]}
          >
            <Text style={styles.headerTitle} numberOfLines={2}>
              {formatDiseaseName(disease.class_name)}
            </Text>
            {disease.disease_info?.disease_name && (
              <Text style={styles.headerSubtitle}>
                {disease.disease_info.disease_name}
              </Text>
            )}
            {disease.disease_info?.common_names &&
              disease.disease_info.common_names.length > 0 && (
                <Text style={styles.headerSubtitle}>
                  {disease.disease_info.common_names.join(", ")}
                </Text>
              )}
          </Animated.View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {renderStatusCards()}

          {renderInfoSection(
            "Description",
            disease.disease_info?.description,
            "information-circle-outline"
          )}

          {renderInfoSection(
            "Symptoms",
            disease.disease_info?.symptoms,
            "medical-outline"
          )}

          {renderInfoSection(
            "Causes",
            disease.disease_info?.cause
              ? [disease.disease_info.cause]
              : disease.disease_info?.causes,
            "bug-outline"
          )}

          {renderInfoSection(
            "Treatment",
            disease.disease_info?.treatment || disease.disease_info?.treatments,
            "leaf-outline"
          )}

          {renderInfoSection(
            "Prevention",
            disease.disease_info?.prevention,
            "shield-checkmark-outline"
          )}

          {renderInfoSection(
            "Management Tips",
            disease.disease_info?.management_tips,
            "bulb-outline"
          )}

          {renderInfoSection(
            "Sprayer Intervals",
            disease.disease_info?.sprayer_intervals,
            "time-outline"
          )}

          {renderInfoSection(
            "Localized Tips",
            disease.disease_info?.localized_tips,
            "location-outline"
          )}

          {disease.disease_info?.image_urls &&
            disease.disease_info.image_urls.length > 1 && (
              <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="images-outline" size={20} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Additional Images</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageGallery}
                >
                  {disease.disease_info.image_urls
                    .slice(1)
                    .map((imageUrl, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.galleryImageContainer}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.galleryImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}

          {renderExternalResources()}

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontFamily: "System",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#f5f5f5",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2E7D32",
    overflow: "hidden",
    zIndex: 1,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  headerBackButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 8,
  },
  shareButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: HEADER_MAX_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  statusCardsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  healthyCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  diseaseCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF5722",
  },
  highRiskCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
  },
  mediumRiskCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F57C00",
  },
  lowRiskCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#388E3C",
  },
  statusCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    color: "#333",
    textAlign: "center",
  },
  statusCardSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  healthyText: {
    color: "#4CAF50",
  },
  diseaseText: {
    color: "#FF5722",
  },
  infoSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  sectionContent: {
    padding: 20,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginTop: 8,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
  },
  imageGallery: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  galleryImageContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  referenceItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  resourceContent: {
    flex: 1,
    marginLeft: 8,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  resourceUrl: {
    fontSize: 12,
    color: "#666",
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DiseaseDetailScreen;
