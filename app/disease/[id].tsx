import { getRiskLevelColor } from "@/utils/lib";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlantDiseaseStore } from "../../store/plantDiseaseStore";

export default function DiseaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getDiseaseById, currentDisease, isFetchingDisease, diseaseError } =
    usePlantDiseaseStore();

  useEffect(() => {
    if (id) {
      getDiseaseById(id);
    }
  }, [id]);

  const openExternalResource = (url: string) => {
    Linking.openURL(url);
  };

  if (isFetchingDisease) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: "#666" }}>
          Loading disease information...
        </Text>
      </View>
    );
  }

  if (diseaseError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text
          style={{ color: "#ff4444", textAlign: "center", marginBottom: 16 }}
        >
          {diseaseError}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: "#007AFF", padding: 12, borderRadius: 8 }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentDisease) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#666" }}>Disease not found</Text>
      </View>
    );
  }

  const disease = currentDisease.disease_info;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
          {disease.disease_name || currentDisease.class_name}
        </Text>

        {disease.common_names?.length > 0 && (
          <Text style={{ fontSize: 16, color: "#666", marginBottom: 8 }}>
            Also known as: {disease.common_names.join(", ")}
          </Text>
        )}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Text
            style={{
              backgroundColor: "#007AFF",
              color: "white",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              fontSize: 12,
            }}
          >
            {disease.crop}
          </Text>

          <Text
            style={{
              backgroundColor: getRiskLevelColor(disease.risk_level),
              color: "white",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              fontSize: 12,
            }}
          >
            {disease.risk_level} Risk
          </Text>

          <Text
            style={{
              backgroundColor: "#666",
              color: "white",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              fontSize: 12,
            }}
          >
            {disease.type}
          </Text>
        </View>
      </View>

      {/* Images */}
      {disease.image_urls?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
            Images
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {disease.image_urls.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 8,
                  marginRight: 12,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Description */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
          Description
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: "#333" }}>
          {disease.description}
        </Text>
      </View>

      {/* Symptoms */}
      {disease.symptoms?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Symptoms
          </Text>
          {disease.symptoms.map((symptom, index) => (
            <Text
              key={index}
              style={{ fontSize: 16, marginBottom: 4, color: "#333" }}
            >
              • {symptom}
            </Text>
          ))}
        </View>
      )}

      {/* Cause */}
      {disease.cause && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Cause
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: "#333" }}>
            {disease.cause}
          </Text>
        </View>
      )}

      {/* Treatment */}
      {disease.treatment?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Treatment
          </Text>
          {disease.treatment.map((treatment, index) => (
            <Text
              key={index}
              style={{ fontSize: 16, marginBottom: 4, color: "#333" }}
            >
              • {treatment}
            </Text>
          ))}
        </View>
      )}

      {/* Prevention */}
      {disease.prevention?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Prevention
          </Text>
          {disease.prevention.map((prevention, index) => (
            <Text
              key={index}
              style={{ fontSize: 16, marginBottom: 4, color: "#333" }}
            >
              • {prevention}
            </Text>
          ))}
        </View>
      )}

      {/* Management Tips */}
      {disease.management_tips && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Management Tips
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: "#333" }}>
            {disease.management_tips}
          </Text>
        </View>
      )}

      {/* Sprayer Intervals */}
      {disease.sprayer_intervals && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Sprayer Intervals
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: "#333" }}>
            {disease.sprayer_intervals}
          </Text>
        </View>
      )}

      {/* Localized Tips */}
      {disease.localized_tips && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Local Tips
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: "#333" }}>
            {disease.localized_tips}
          </Text>
        </View>
      )}

      {/* External Resources */}
      {disease.external_resources?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
            Additional Resources
          </Text>
          {disease.external_resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openExternalResource(resource.url)}
              style={{
                backgroundColor: "#f0f0f0",
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#007AFF",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#007AFF" }}
              >
                {resource.title}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                Tap to open external link
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
