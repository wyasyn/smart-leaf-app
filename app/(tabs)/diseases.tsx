import { getRiskLevelColor } from "@/utils/lib";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlantDiseaseStore } from "../../store/plantDiseaseStore";

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
