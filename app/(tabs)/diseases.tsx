import renderBrowselItem from "@/components/broswe-item";
import { colors } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlantDiseaseStore } from "../../store/plantDiseaseStore";

export default function BrowseScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string | null>("All"); // Set "All" as default

  const searchDiseases = usePlantDiseaseStore((state) => state.searchDiseases);
  const getAllDiseases = usePlantDiseaseStore((state) => state.getAllDiseases);
  const getApiStats = usePlantDiseaseStore((state) => state.getApiStats);
  const searchResults = usePlantDiseaseStore((state) => state.searchResults);
  const allDiseases = usePlantDiseaseStore((state) => state.allDiseases);
  const apiStats = usePlantDiseaseStore((state) => state.apiStats);
  const isSearching = usePlantDiseaseStore((state) => state.isSearching);
  const isLoading = usePlantDiseaseStore((state) => state.isLoading);
  const searchError = usePlantDiseaseStore((state) => state.searchError);
  const error = usePlantDiseaseStore((state) => state.error);

  useEffect(() => {
    getAllDiseases();
    getApiStats();
  }, [getAllDiseases, getApiStats]);

  // Auto-search effect with debouncing
  useEffect(() => {
    // Only set up the timer if searchQuery has more than 3 characters
    if (searchQuery.trim().length > 3) {
      const searchTimer = setTimeout(() => {
        searchDiseases(searchQuery, { limit: 20 });
      }, 5000); // 5 seconds delay

      // Cleanup function to clear the timer if searchQuery changes
      return () => clearTimeout(searchTimer);
    }
  }, [searchQuery, searchDiseases]);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      await searchDiseases(searchQuery, { limit: 20 });
    }
  }, [searchQuery, searchDiseases]);

  const handleFilterByCrop = useCallback(
    async (crop: string) => {
      setSelectedCrop(crop);
      setSearchQuery(""); // Clear search query when filtering
      await getAllDiseases({ crop });
    },
    [getAllDiseases]
  );

  const handleAllFilter = useCallback(async () => {
    setSelectedCrop("All");
    setSearchQuery(""); // Clear search query when showing all
    await getAllDiseases(); // Call without any parameters to get all diseases
  }, [getAllDiseases]);

  const displayDiseases =
    searchQuery.trim().length > 0
      ? searchResults?.results.length
        ? searchResults.results
        : searchResults?.suggestions.length
        ? searchResults.suggestions
        : []
      : allDiseases;

  const ListHeader = useMemo(
    () => (
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",

              textAlign: "center",
              paddingBottom: 24,
              paddingTop: 32,
            }}
          >
            Browse Crops
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 12,
            alignItems: "center",
            overflow: "hidden",
            flex: 1,
          }}
        >
          <TouchableOpacity
            onPress={handleSearch}
            disabled={isSearching}
            style={{
              paddingLeft: 16,
              paddingRight: 8,
              paddingBlock: 14,

              justifyContent: "center",
            }}
          >
            {isSearching ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="search" size={20} color={colors.text} />
            )}
          </TouchableOpacity>
          <TextInput
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              marginRight: 8,
            }}
            placeholder="Search diseases..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Crop Filters */}
        {apiStats?.supported_crops && (
          <View style={{ marginBottom: 16 }}>
            <FlatList
              horizontal
              data={["All", ...apiStats.supported_crops]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    item === "All"
                      ? handleAllFilter()
                      : handleFilterByCrop(item)
                  }
                  style={{
                    backgroundColor:
                      selectedCrop === item ? colors.primary : "#f0f0f0",
                    paddingBlock: 8,
                    paddingInline: 16,
                    marginRight: 8,
                    borderRadius: 8,
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
    ),
    [
      searchQuery,
      isSearching,
      isLoading,
      searchError,
      error,
      apiStats?.supported_crops,
      selectedCrop,
      handleSearch,
      handleAllFilter,
      handleFilterByCrop,
    ]
  );

  return (
    <FlatList
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
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
