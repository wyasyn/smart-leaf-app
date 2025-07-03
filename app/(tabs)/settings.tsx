import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useAutoHealthCheck,
  useNetworkMonitor,
} from "../../hooks/usePlantDiseaseAPI";
import { usePlantDiseaseStore } from "../../store/plantDiseaseStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
if (!API_URL) {
  throw new Error("API_URL is not defined. Please set EXPO_PUBLIC_API_URL.");
}

export default function SettingsScreen() {
  useNetworkMonitor();
  useAutoHealthCheck(5); // Check health every 5 minutes

  const baseUrl = usePlantDiseaseStore((state) => state.baseUrl);
  const setBaseUrl = usePlantDiseaseStore((state) => state.setBaseUrl);
  const cacheExpiryMinutes = usePlantDiseaseStore(
    (state) => state.cacheExpiryMinutes
  );
  const maxCacheSize = usePlantDiseaseStore((state) => state.maxCacheSize);
  const isOnline = usePlantDiseaseStore((state) => state.isOnline);
  const healthStatus = usePlantDiseaseStore((state) => state.healthStatus);
  const clearCache = usePlantDiseaseStore((state) => state.clearCache);
  const apiStats = usePlantDiseaseStore((state) => state.apiStats);
  const clearPredictionHistory = usePlantDiseaseStore(
    (state) => state.clearPredictionHistory
  );
  const checkHealth = usePlantDiseaseStore((state) => state.checkHealth);
  const isCheckingHealth = usePlantDiseaseStore(
    (state) => state.isCheckingHealth
  );
  const predictionHistory = usePlantDiseaseStore(
    (state) => state.predictionHistory
  );

  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);

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
    <ScrollView
      style={{
        flex: 1,
        padding: 16,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
          marginTop: 20,
        }}
      >
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
          placeholder={API_URL}
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

      {/* Stats */}
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
          <Text>Cached Predictions: {predictionHistory.length}</Text>
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
      <View style={{ marginBottom: 150 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          About
        </Text>

        <Text style={{ color: "#666", lineHeight: 20 }}>
          Plant Disease Detection App{"\n"}
          Version 2.4.3{"\n"}
          Built with React Native and Zustand {"\n"}
          Developer ={">"} Yasin Walum
        </Text>
      </View>
    </ScrollView>
  );
}
