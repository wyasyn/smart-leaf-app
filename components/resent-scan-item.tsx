import {
  getConfidenceBadgeColor,
  getRelativeTime,
  getSeverityColor,
} from "@/utils/lib";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

import { ScanHistoryItem } from "@/utils/scan-history";
import { router } from "expo-router";
import { stylesHome as styles } from "../utils/home-screen-styles";

const renderRecentScan = ({ item }: { item: ScanHistoryItem }) => {
  const confidenceColors = getConfidenceBadgeColor(
    item.prediction_data.confidence_level
  );
  const isHealthy = !item.prediction_data.disease_info.common_names?.length;

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
          source={{ uri: item.image_uri }}
          style={styles.scanImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.scanDetails}>
        <View style={styles.scanHeader}>
          <Text style={styles.scanPlantName}>
            {item.prediction_data.disease_info.crop}
          </Text>
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: confidenceColors.backgroundColor },
            ]}
          >
            <Text
              style={[styles.confidenceText, { color: confidenceColors.color }]}
            >
              {Math.round(item.prediction_data.confidence)}%
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
            : item.prediction_data.disease_info.disease_name ||
              "Unknown Disease"}
        </Text>
        <Text style={styles.scanDate}>
          {getRelativeTime(item.timestamp.toLocaleString())}
        </Text>
      </View>
      <View
        style={[
          styles.severityIndicator,
          {
            backgroundColor: getSeverityColor(
              item.prediction_data.disease_info.risk_level,
              item.prediction_data.confidence_level
            ),
          },
        ]}
      />
    </TouchableOpacity>
  );
};

export default renderRecentScan;
