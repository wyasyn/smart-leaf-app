// hooks/usePlantDiseaseAPI.ts
import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import {
  useNetworkStatus,
  usePlantDiseaseStore,
} from "../store/plantDiseaseStore";

// ==============================================
// USAGE EXAMPLES
// ==============================================

// Example 1: Camera/Prediction Screen
// app/(tabs)/camera.tsx
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Example 2: Search/Browse Screen
// app/(tabs)/browse.tsx
import React from "react";

import { router, useLocalSearchParams } from "expo-router";

// Example 3: Disease Detail Screen
// app/disease/[id].tsx
import React from "react";

// Example 4: Settings/Configuration Screen
// app/(tabs)/settings.tsx
import React from "react";

import {
  useAutoHealthCheck,
  useCacheCleanup,
  useNetworkMonitor,
} from "../hooks/usePlantDiseaseAPI";

// Network monitoring hook
export const useNetworkMonitor = () => {
  const { setOnlineStatus } = useNetworkStatus();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnlineStatus(state.isConnected ?? false);
    });

    return unsubscribe;
  }, [setOnlineStatus]);
};

// Auto health check hook
export const useAutoHealthCheck = (intervalMinutes = 5) => {
  const checkHealth = usePlantDiseaseStore((state) => state.checkHealth);

  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up interval
    const interval = setInterval(() => {
      checkHealth();
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkHealth, intervalMinutes]);
};

// Cache cleanup hook
export const useCacheCleanup = () => {
  const { clearCache, cacheExpiryMinutes } = usePlantDiseaseStore((state) => ({
    clearCache: state.clearCache,
    cacheExpiryMinutes: state.cacheExpiryMinutes,
  }));

  useEffect(() => {
    // Clean up expired cache on app start
    const cleanup = () => {
      // This could be enhanced to only clear expired items
      clearCache();
    };

    // Run cleanup every hour
    const interval = setInterval(cleanup, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [clearCache, cacheExpiryMinutes]);
};

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const {
    predictDisease,
    lastPrediction,
    isPredicting,
    predictionError,
    clearAllErrors,
    getCachedPredictions,
  } = usePlantDiseaseStore();

  const takePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to take photos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      clearAllErrors();
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      clearAllErrors();
    }
  };

  const handlePredict = async () => {
    if (!imageUri) return;

    const result = await predictDisease(imageUri);
    if (result) {
      Alert.alert("Prediction Complete", result.message);
    }
  };

  const recentPredictions = getCachedPredictions().slice(0, 5);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Plant Disease Detector
      </Text>

      {/* Image Preview */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: 200,
            height: 200,
            alignSelf: "center",
            marginBottom: 16,
          }}
        />
      )}

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={takePicture}
          style={{ backgroundColor: "#007AFF", padding: 12, borderRadius: 8 }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          style={{ backgroundColor: "#34C759", padding: 12, borderRadius: 8 }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Pick Image</Text>
        </TouchableOpacity>
      </View>

      {/* Predict Button */}
      {imageUri && (
        <TouchableOpacity
          onPress={handlePredict}
          disabled={isPredicting}
          style={{
            backgroundColor: isPredicting ? "#ccc" : "#FF3B30",
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {isPredicting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Analyze Plant
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Error Display */}
      {predictionError && (
        <View
          style={{
            backgroundColor: "#ff4444",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "white" }}>{predictionError}</Text>
        </View>
      )}

      {/* Prediction Results */}
      {lastPrediction && (
        <View
          style={{
            backgroundColor: "#f0f0f0",
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {lastPrediction.clean_class_name}
          </Text>
          <Text style={{ marginTop: 8 }}>
            Confidence: {(lastPrediction.confidence * 100).toFixed(1)}% (
            {lastPrediction.confidence_level})
          </Text>
          <Text style={{ marginTop: 8 }}>
            {lastPrediction.disease_info.description}
          </Text>

          {lastPrediction.recommendations.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "bold" }}>Recommendations:</Text>
              {lastPrediction.recommendations.slice(0, 3).map((rec, index) => (
                <Text key={index} style={{ marginTop: 4 }}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Recent Predictions */}
      {recentPredictions.length > 0 && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
            Recent Predictions
          </Text>
          {recentPredictions.map((prediction, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: "row",
                padding: 12,
                backgroundColor: "#f9f9f9",
                marginBottom: 8,
                borderRadius: 8,
              }}
            >
              <Image
                source={{ uri: prediction.imageUri }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold" }}>
                  {prediction.clean_class_name}
                </Text>
                <Text style={{ color: "#666" }}>
                  {(prediction.confidence * 100).toFixed(1)}% confidence
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

export default function BrowseScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  const {
    searchDiseases,
    getAllDiseases,
    getApiStats,
    searchResults,
    allDiseases,
    apiStats,
    isSearching,
    isLoading,
    searchError,
    error,
  } = usePlantDiseaseStore();

  useEffect(() => {
    // Load initial data
    getAllDiseases();
    getApiStats();
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchDiseases(searchQuery, { limit: 20 });
    }
  };

  const handleFilterByCrop = async (crop: string) => {
    setSelectedCrop(crop);
    await getAllDiseases({ crop });
  };

  const navigateToDisease = (disease: any) => {
    router.push(`/disease/${disease.class_id}`);
  };

  const displayDiseases = searchResults?.results.length
    ? searchResults.results
    : searchResults?.suggestions.length
    ? searchResults.suggestions
    : allDiseases;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Browse Diseases
      </Text>

      {/* Search Bar */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 12,
            borderRadius: 8,
            marginRight: 8,
          }}
          placeholder="Search diseases..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          onPress={handleSearch}
          disabled={isSearching}
          style={{
            backgroundColor: "#007AFF",
            padding: 12,
            borderRadius: 8,
            justifyContent: "center",
          }}
        >
          {isSearching ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold" }}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Crop Filters */}
      {apiStats?.supported_crops && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
            Filter by Crop:
          </Text>
          <FlatList
            horizontal
            data={["All", ...apiStats.supported_crops]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  item === "All" ? getAllDiseases() : handleFilterByCrop(item)
                }
                style={{
                  backgroundColor:
                    selectedCrop === item ? "#007AFF" : "#f0f0f0",
                  padding: 8,
                  marginRight: 8,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    color: selectedCrop === item ? "white" : "#333",
                    fontSize: 12,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Stats Display */}
      {apiStats && (
        <View
          style={{
            backgroundColor: "#f9f9f9",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>
            Database Stats
          </Text>
          <Text>Total Diseases: {apiStats.diseases_in_guide}</Text>
          <Text>Supported Crops: {apiStats.supported_crops.length}</Text>
          <Text>
            Model Status:{" "}
            {apiStats.model_loaded ? "✅ Loaded" : "❌ Not Loaded"}
          </Text>
        </View>
      )}

      {/* Error Messages */}
      {(searchError || error) && (
        <View
          style={{
            backgroundColor: "#ff4444",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "white" }}>{searchError || error}</Text>
        </View>
      )}

      {/* Loading Indicator */}
      {(isLoading || isSearching) && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 8, color: "#666" }}>
            {isSearching ? "Searching..." : "Loading diseases..."}
          </Text>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={displayDiseases}
        keyExtractor={(item) => item.class_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigateToDisease(item)}
            style={{
              backgroundColor: "white",
              padding: 16,
              marginBottom: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e0e0e0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>
              {item.disease_info.disease_name || item.class_name}
            </Text>

            <Text style={{ color: "#666", marginBottom: 4 }}>
              Crop: {item.disease_info.crop}
            </Text>

            <Text style={{ color: "#666", marginBottom: 8 }} numberOfLines={2}>
              {item.disease_info.description}
            </Text>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  fontSize: 12,
                  backgroundColor: getRiskLevelColor(
                    item.disease_info.risk_level
                  ),
                  color: "white",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                {item.disease_info.risk_level}
              </Text>

              <Text style={{ fontSize: 12, color: "#999" }}>
                {item.disease_info.type}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#666", textAlign: "center" }}>
              {searchQuery
                ? "No diseases found for your search"
                : "No diseases available"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// Helper function for risk level colors
const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case "high":
      return "#ff4444";
    case "medium":
      return "#ffaa00";
    case "low":
      return "#44ff44";
    default:
      return "#666";
  }
};

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

export default function SettingsScreen() {
  useNetworkMonitor();
  useAutoHealthCheck(5); // Check health every 5 minutes
  useCacheCleanup();

  const {
    baseUrl,
    setBaseUrl,
    cacheExpiryMinutes,
    maxCacheSize,
    isOnline,
    healthStatus,
    clearCache,
    clearPredictionHistory,
    getCachedPredictions,
    checkHealth,
    isCheckingHealth,
  } = usePlantDiseaseStore((state) => ({
    baseUrl: state.baseUrl,
    setBaseUrl: state.setBaseUrl,
    cacheExpiryMinutes: state.cacheExpiryMinutes,
    maxCacheSize: state.maxCacheSize,
    isOnline: state.isOnline,
    healthStatus: state.healthStatus,
    clearCache: state.clearCache,
    clearPredictionHistory: state.clearPredictionHistory,
    getCachedPredictions: state.getCachedPredictions,
    checkHealth: state.checkHealth,
    isCheckingHealth: state.isCheckingHealth,
  }));

  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);
  const cachedPredictions = getCachedPredictions();

  const handleUpdateBaseUrl = () => {
    if (tempBaseUrl.trim()) {
      setBaseUrl(tempBaseUrl.trim());
      Alert.alert("Success", "API URL updated successfully");
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear all cached data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCache();
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear prediction history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearPredictionHistory();
            Alert.alert("Success", "Prediction history cleared");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Settings
      </Text>

      {/* API Configuration */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          API Configuration
        </Text>

        <Text style={{ marginBottom: 8, color: "#666" }}>API Base URL:</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
          value={tempBaseUrl}
          onChangeText={setTempBaseUrl}
          placeholder="http://your-api-url.com"
        />

        <TouchableOpacity
          onPress={handleUpdateBaseUrl}
          style={{
            backgroundColor: "#007AFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "bold", textAlign: "center" }}
          >
            Update API URL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={checkHealth}
          disabled={isCheckingHealth}
          style={{
            backgroundColor: isCheckingHealth ? "#ccc" : "#34C759",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "bold", textAlign: "center" }}
          >
            {isCheckingHealth ? "Checking..." : "Test Connection"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Information */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          Status
        </Text>

        <View
          style={{
            backgroundColor: "#f9f9f9",
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ marginBottom: 8 }}>
            Network: {isOnline ? "🟢 Online" : "🔴 Offline"}
          </Text>

          {healthStatus && (
            <>
              <Text style={{ marginBottom: 8 }}>
                API Status:{" "}
                {healthStatus.status === "healthy"
                  ? "🟢 Healthy"
                  : "🔴 Unhealthy"}
              </Text>
              <Text style={{ marginBottom: 8 }}>
                Model:{" "}
                {healthStatus.model_loaded ? "🟢 Loaded" : "🔴 Not Loaded"}
              </Text>
              <Text>Available Diseases: {healthStatus.available_diseases}</Text>
            </>
          )}
        </View>
      </View>

      {/* Cache Management */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          Cache Management
        </Text>

        <View
          style={{
            backgroundColor: "#f9f9f9",
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ marginBottom: 8 }}>
            Cache Expiry: {cacheExpiryMinutes} minutes
          </Text>
          <Text style={{ marginBottom: 8 }}>
            Max Cache Size: {maxCacheSize} items
          </Text>
          <Text>Cached Predictions: {cachedPredictions.length}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={handleClearCache}
            style={{
              flex: 1,
              backgroundColor: "#FF3B30",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Clear Cache
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearHistory}
            style={{
              flex: 1,
              backgroundColor: "#FF9500",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Clear History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Information */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          About
        </Text>

        <Text style={{ color: "#666", lineHeight: 20 }}>
          Plant Disease Detection App{"\n"}
          Version 1.0.0{"\n"}
          Built with React Native and Zustand
        </Text>
      </View>
    </ScrollView>
  );
}
