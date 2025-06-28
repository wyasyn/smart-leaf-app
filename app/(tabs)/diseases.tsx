import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with margins

// API Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL!;
if (!API_URL) {
  throw new Error("API_URL is not defined. Please set EXPO_PUBLIC_API_URL.");
}

type RootStackParamList = {
  DiseaseDetail: { disease: any; classId: any };
  // Add other routes here if needed
};

type PlantDiseaseScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "DiseaseDetail">;
};

const PlantDiseaseScreen = ({ navigation }: PlantDiseaseScreenProps) => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${API_URL}/diseases`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDiseases(data);

      // Animate content in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Error fetching diseases:", error);
      Alert.alert(
        "Error",
        "Failed to load diseases. Please check your internet connection and try again.",
        [
          { text: "Retry", onPress: () => fetchDiseases() },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchDiseases(true);
  };

  interface DiseaseInfo {
    crop?: string;
    description?: string;
    disease_name?: string;
    image_urls?: string[];
    risk_level?: "High" | "Medium" | "Low" | string;
  }

  interface Disease {
    class_id: string;
    class_name: string;
    disease_info?: DiseaseInfo;
  }

  const navigateToDetail = (disease: Disease) => {
    router.push({
      pathname: `/disease/[id]`,
      params: {
        disease: JSON.stringify(disease),
        id: disease.class_id,
      },
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={["#4CAF50", "#2E7D32", "#1B5E20"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Plant Disease Guide</Text>
            <Text style={styles.headerSubtitle}>
              Comprehensive database of plant diseases
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="leaf-outline" size={16} color="#E8F5E8" />
                <Text style={styles.statText}>{diseases.length} Diseases</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerImageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop&crop=center",
              }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Prepare animation values for each card
  const cardAnims = React.useRef<Animated.Value[]>([]);
  if (cardAnims.current.length !== diseases.length) {
    cardAnims.current = diseases.map((_, i) => new Animated.Value(0));
  }

  useEffect(() => {
    Animated.stagger(
      50,
      cardAnims.current.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [diseases]);

  const renderDiseaseCard = ({
    item,
    index,
  }: {
    item: Disease;
    index: number;
  }) => {
    const cardAnim = cardAnims.current[index];

    const getImageUrl = (disease: Disease) => {
      // Try to get image from disease_info.image_urls or use a default plant disease image
      if ((disease.disease_info?.image_urls?.length ?? 0) > 0) {
        return disease.disease_info!.image_urls![0];
      }

      // Default images based on crop type
      const cropImages: Record<
        | "Apple"
        | "Tomato"
        | "Grape"
        | "Corn"
        | "Potato"
        | "Peach"
        | "Pepper"
        | "Cherry"
        | "Strawberry"
        | "Orange"
        | "Blueberry"
        | "Raspberry"
        | "Soybean"
        | "Squash",
        string
      > = {
        Apple:
          "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop",
        Tomato:
          "https://images.unsplash.com/photo-1546470427-e26264be0b5d?w=400&h=300&fit=crop",
        Grape:
          "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=300&fit=crop",
        Corn: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop",
        Potato:
          "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
        Peach:
          "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=400&h=300&fit=crop",
        Pepper:
          "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop",
        Cherry:
          "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=400&h=300&fit=crop",
        Strawberry:
          "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop",
        Orange:
          "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&h=300&fit=crop",
        Blueberry:
          "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop",
        Raspberry:
          "https://images.unsplash.com/photo-1577003833619-76bfe21e728d?w=400&h=300&fit=crop",
        Soybean:
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=300&fit=crop",
        Squash:
          "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop",
      };

      const crop = item.disease_info?.crop || "Unknown";
      if (crop in cropImages) {
        return cropImages[crop as keyof typeof cropImages];
      }
      return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop";
    };

    interface FormatDescription {
      (description: string | undefined): string;
    }

    const formatDescription: FormatDescription = (description) => {
      if (!description || description === "No description available") {
        return "Comprehensive information about plant health and disease management.";
      }
      return description.length > 80
        ? description.substring(0, 80) + "..."
        : description;
    };

    interface FormatDiseaseName {
      (className: string): string;
    }

    const formatDiseaseName: FormatDiseaseName = (className) => {
      return className.replace(/___/g, " - ").replace(/_/g, " ");
    };

    const isHealthy =
      !item.disease_info?.disease_name || item.class_name.includes("healthy");

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigateToDetail(item)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={`${formatDiseaseName(
            item.class_name
          )} disease information`}
          accessibilityHint="Tap to view detailed information about this disease"
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(item) }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <View
                style={[
                  styles.statusBadge,
                  isHealthy ? styles.healthyBadge : styles.diseaseBadge,
                ]}
              >
                <Ionicons
                  name={isHealthy ? "checkmark-circle" : "warning"}
                  size={12}
                  color="white"
                />
                <Text style={styles.statusText}>
                  {isHealthy ? "Healthy" : "Disease"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {formatDiseaseName(item.class_name)}
              </Text>
              <Text style={styles.cropName}>
                {item.disease_info?.crop || "Unknown Crop"}
              </Text>
            </View>

            <Text style={styles.cardDescription} numberOfLines={2}>
              {formatDescription(item.disease_info?.description)}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.riskContainer}>
                {item.disease_info?.risk_level && (
                  <View
                    style={[
                      styles.riskBadge,
                      item.disease_info.risk_level === "High"
                        ? styles.highRisk
                        : item.disease_info.risk_level === "Medium"
                        ? styles.mediumRisk
                        : styles.lowRisk,
                    ]}
                  >
                    <Text style={styles.riskText}>
                      {item.disease_info.risk_level}
                    </Text>
                  </View>
                )}
              </View>

              <Ionicons name="chevron-forward" size={16} color="#666" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Diseases Found</Text>
      <Text style={styles.emptyText}>
        Pull down to refresh or check your internet connection
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading plant diseases...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <FlatList
          data={diseases}
          renderItem={renderDiseaseCard}
          keyExtractor={(item, index) => `${item.class_id}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
              tintColor="#4CAF50"
              title="Pull to refresh"
              titleColor="#666"
            />
          }
          getItemLayout={(data, index) => ({
            length: 280,
            offset: 280 * Math.floor(index / 2),
            index,
          })}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 100,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E8F5E8",
    marginBottom: 12,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statText: {
    color: "#E8F5E8",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  headerImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cardContainer: {
    width: ITEM_WIDTH,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 120,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthyBadge: {
    backgroundColor: "#4CAF50",
  },
  diseaseBadge: {
    backgroundColor: "#FF5722",
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 18,
    marginBottom: 2,
  },
  cropName: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riskContainer: {
    flex: 1,
  },
  riskBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  highRisk: {
    backgroundColor: "#ffebee",
  },
  mediumRisk: {
    backgroundColor: "#fff3e0",
  },
  lowRisk: {
    backgroundColor: "#e8f5e8",
  },
  riskText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default PlantDiseaseScreen;
