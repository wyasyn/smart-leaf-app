import renderBrowselItem from "@/components/broswe-item";
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

  const displayDiseases = searchResults?.results.length
    ? searchResults.results
    : searchResults?.suggestions.length
    ? searchResults.suggestions
    : allDiseases;

  const ListHeader = () => (
    <View style={{ padding: 16 }}>
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

      {/* Error */}
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

      {/* Loading */}
      {(isLoading || isSearching) && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 8, color: "#666" }}>
            {isSearching ? "Searching..." : "Loading diseases..."}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={displayDiseases}
      keyExtractor={(item) => item.class_id}
      renderItem={renderBrowselItem}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
      columnWrapperStyle={{
        justifyContent: "space-between",
      }}
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
  );
}
