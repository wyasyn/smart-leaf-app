import {
  getConfidenceBadgeColor,
  getRelativeTime,
  getSeverityColor,
} from "@/utils/lib";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

import { CachedPrediction } from "@/store/plantDiseaseStore";
import { router } from "expo-router";
import { stylesHome as styles } from "../utils/home-screen-styles";

const renderRecentScan = ({ item }: { item: CachedPrediction }) => {
  const confidenceColors = getConfidenceBadgeColor(item.confidence_level);
  const isHealthy = item.disease_info.is_healthy;

  return (
    <TouchableOpacity
      style={styles.recentScanItem}
      onPress={() => {
        // Navigate to scan details with the full prediction data
        router.push({
          pathname: "/scan-details",
          params: { scanId: item.class_id },
        });
      }}
    >
      <View style={styles.scanImageContainer}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.scanImage}
          contentFit="cover"
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
              style={[styles.confidenceText, { color: confidenceColors.color }]}
            >
              {Math.round(item.confidence)}%
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.scanDisease,
            { color: isHealthy ? "#44AA44" : "#666" },
          ]}
        >
          {isHealthy
            ? "Healthy Plant"
            : item.clean_class_name || "Unknown Disease"}
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

export default renderRecentScan;
