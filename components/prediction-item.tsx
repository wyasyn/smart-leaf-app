import { COLORS } from "@/constants/constants";
import { historyStyles as styles } from "@/constants/historyStyles";
import { CachedPrediction } from "@/store/plantDiseaseStore";
import { getRelativeTime } from "@/utils/lib";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const PredictionItem = React.memo(
  ({ item, index }: { item: CachedPrediction; index: number }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const isHealthy = item.disease_info.is_healthy;
    const confidenceColor =
      item.confidence >= 0.8
        ? COLORS.SUCCESS
        : item.confidence >= 0.6
        ? COLORS.WARNING
        : COLORS.DANGER;

    const riskColor =
      item.disease_info.risk_level === "High"
        ? COLORS.DANGER
        : item.disease_info.risk_level === "Medium"
        ? COLORS.WARNING
        : COLORS.SUCCESS;

    const handlePress = useCallback(() => {
      router.push({
        pathname: "/scan-details/[predictionId]",
        params: {
          predictionId: item.timestamp.toString(),
          imageUri: item.imageUri,
        },
      });
    }, [item.timestamp, item.imageUri]);

    const handleImageLoad = useCallback(() => {
      setImageLoading(false);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoading(false);
    }, []);

    // Use compressed image for list view, full image for details
    const displayImageUri = item.imageUri;

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={styles.predictionItem}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Prediction ${index + 1} for ${
          item.disease_info.crop || "unknown crop"
        }, ${
          isHealthy
            ? "healthy plant"
            : item.disease_info.disease_name || item.clean_class_name
        }, confidence ${Math.round(item.confidence * 100)}%`}
      >
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            </View>
          )}
          <Image
            source={
              imageError || !displayImageUri
                ? require("../assets/images/placeholder-image.png")
                : { uri: displayImageUri }
            }
            style={[styles.predictionImage, imageLoading && styles.hiddenImage]}
            contentFit="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            cachePolicy="disk" // Add caching policy
            priority="normal"
            recyclingKey={`prediction-${item.timestamp}`} // Add recycling key
          />
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: confidenceColor },
            ]}
          >
            <Text style={styles.confidenceText}>
              {Math.round(item.confidence * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.predictionDetails}>
          <View style={styles.headerRow}>
            <Text style={styles.cropName} numberOfLines={1}>
              {item.disease_info.crop || "Unknown Crop"}
            </Text>
            <Text style={styles.timestamp}>
              {getRelativeTime(item.timestamp)}
            </Text>
          </View>

          <Text
            style={[
              styles.diseaseName,
              { color: isHealthy ? COLORS.SUCCESS : COLORS.GRAY_700 },
            ]}
            numberOfLines={2}
          >
            {isHealthy
              ? "Healthy Plant ✅"
              : item.disease_info.disease_name || item.clean_class_name}
          </Text>

          {!isHealthy && (
            <View style={styles.riskContainer}>
              <MaterialIcons
                name="warning"
                size={16}
                color={riskColor}
                accessible={false}
              />
              <Text style={[styles.riskLevel, { color: riskColor }]}>
                {item.disease_info.risk_level} Risk
              </Text>
            </View>
          )}

          <Text style={styles.confidenceLevel}>
            Confidence: {item.confidence_level}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

PredictionItem.displayName = "PredictionItem";

export default PredictionItem;
