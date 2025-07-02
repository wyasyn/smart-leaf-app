import {
  CachedPrediction,
  usePlantDiseaseStore,
} from "@/store/plantDiseaseStore";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ScanDetailsScreen = () => {
  const { predictionId } = useLocalSearchParams<{
    predictionId: string;
    imageUri: string;
  }>();

  const predictionHistory = usePlantDiseaseStore(
    (state) => state.predictionHistory
  );
  const [prediction, setPrediction] = useState<CachedPrediction | null>(null);

  useEffect(() => {
    if (predictionId) {
      const found = predictionHistory.find(
        (p) => p.timestamp.toString() === predictionId
      );
      setPrediction(found || null);
    }
  }, [predictionId, predictionHistory]);

  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  const openExternalResource = (url: string) => {
    Linking.openURL(url);
  };

  if (!prediction) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Prediction Not Found</Text>
        <Text style={styles.errorSubtitle}>
          This prediction may have been deleted or expired
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isHealthy = prediction.disease_info.is_healthy;
  const confidenceColor =
    prediction.confidence >= 0.8
      ? "#22C55E"
      : prediction.confidence >= 0.6
      ? "#F59E0B"
      : "#EF4444";

  const riskColor =
    prediction.disease_info.risk_level === "High"
      ? "#EF4444"
      : prediction.disease_info.risk_level === "Medium"
      ? "#F59E0B"
      : "#22C55E";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: prediction.imageUri }}
          style={styles.image}
          contentFit="cover"
        />
        <View
          style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}
        >
          <Text style={styles.confidenceText}>
            {Math.round(prediction.confidence * 100)}%
          </Text>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <View style={styles.basicInfo}>
          <Text style={styles.cropName}>{prediction.disease_info.crop}</Text>
          <Text style={styles.scanTime}>
            Scanned {getRelativeTime(prediction.timestamp)}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.diseaseStatus,
              { color: isHealthy ? "#22C55E" : "#374151" },
            ]}
          >
            {isHealthy
              ? "✅ Healthy Plant"
              : prediction.disease_info.disease_name ||
                prediction.clean_class_name}
          </Text>

          {!isHealthy && (
            <View style={styles.riskBadge}>
              <MaterialIcons name="warning" size={16} color={riskColor} />
              <Text style={[styles.riskText, { color: riskColor }]}>
                {prediction.disease_info.risk_level} Risk
              </Text>
            </View>
          )}
        </View>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence Level:</Text>
          <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
            {prediction.confidence_level} (
            {Math.round(prediction.confidence * 100)}%)
          </Text>
        </View>
      </View>

      {/* Disease Information */}
      {!isHealthy && (
        <>
          {/* Description */}
          {prediction.disease_info.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionContent}>
                {prediction.disease_info.description}
              </Text>
            </View>
          )}

          {/* Common Names */}
          {prediction.disease_info.common_names?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Also Known As</Text>
              <View style={styles.tagsContainer}>
                {prediction.disease_info.common_names.map((name, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Symptoms */}
          {prediction.disease_info.symptoms?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              {prediction.disease_info.symptoms.map((symptom, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{symptom}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Cause */}
          {prediction.disease_info.cause && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cause</Text>
              <Text style={styles.sectionContent}>
                {prediction.disease_info.cause}
              </Text>
            </View>
          )}

          {/* Treatment */}
          {prediction.disease_info.treatment?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Treatment</Text>
              {prediction.disease_info.treatment.map((treatment, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{treatment}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Prevention */}
          {prediction.disease_info.prevention?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prevention</Text>
              {prediction.disease_info.prevention.map((prevention, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{prevention}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Management Tips */}
          {prediction.disease_info.management_tips && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Management Tips</Text>
              <Text style={styles.sectionContent}>
                {prediction.disease_info.management_tips}
              </Text>
            </View>
          )}

          {/* Sprayer Intervals */}
          {prediction.disease_info.sprayer_intervals && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Spraying Schedule</Text>
              <Text style={styles.sectionContent}>
                {prediction.disease_info.sprayer_intervals}
              </Text>
            </View>
          )}

          {/* Localized Tips */}
          {prediction.disease_info.localized_tips && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Local Recommendations</Text>
              <Text style={styles.sectionContent}>
                {prediction.disease_info.localized_tips}
              </Text>
            </View>
          )}
        </>
      )}

      {/* All Predictions */}
      {prediction.all_predictions?.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Possible Conditions</Text>
          {prediction.all_predictions
            .filter((_, index) => index !== prediction.predicted_class_index)
            .slice(0, 3)
            .map((pred, index) => (
              <View key={index} style={styles.alternativePrediction}>
                <Text style={styles.alternativeLabel}>{pred.label}</Text>
                <Text style={styles.alternativeConfidence}>
                  {Math.round(pred.confidence * 100)}%
                </Text>
              </View>
            ))}
        </View>
      )}

      {/* Recommendations */}
      {prediction.recommendations?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {prediction.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      {/* External Resources */}
      {prediction.disease_info.external_resources?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learn More</Text>
          {prediction.disease_info.external_resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceItem}
              onPress={() => openExternalResource(resource.url)}
            >
              <Feather name="external-link" size={16} color="#E50046" />
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <AntDesign name="right" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#E50046",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    position: "relative",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 300,
  },
  confidenceBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  basicInfo: {
    marginBottom: 16,
  },
  cropName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  scanTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusContainer: {
    marginBottom: 16,
  },
  diseaseStatus: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  riskText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  alternativePrediction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  alternativeLabel: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  alternativeConfidence: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resourceTitle: {
    flex: 1,
    fontSize: 14,
    color: "#E50046",
    marginLeft: 8,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ScanDetailsScreen;
