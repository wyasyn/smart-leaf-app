import { getRelativeTime } from "@/utils/lib";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import {
  CachedPrediction,
  usePlantDiseaseStore,
} from "../../store/plantDiseaseStore";

const HistoryScreen = () => {
  const {
    predictionHistory,
    getCachedPredictions,
    clearPredictionHistory,
    isLoading,
  } = usePlantDiseaseStore();

  useEffect(() => {
    getCachedPredictions();
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getCachedPredictions(); // wait for the refresh
    setRefreshing(false);
  };

  const getWeekdayLabels = () => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      labels.push(weekdays[d.getDay()]);
    }

    return labels;
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Clear All History",
      "This will delete all prediction history. This cannot be undone. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            clearPredictionHistory();
          },
        },
      ]
    );
  };

  const getWeeklyStats = () => {
    const weeklyData = Array(7).fill(0);
    const now = new Date();

    for (const prediction of predictionHistory) {
      const predictionDate = new Date(prediction.timestamp);
      const diff = Math.floor(
        (now.getTime() - predictionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff < 7) weeklyData[6 - diff]++;
    }
    return weeklyData;
  };

  const today = new Date().toDateString();

  const scansToday: number = predictionHistory.filter(
    (h) => new Date(h.timestamp).toDateString() === today
  ).length;

  const renderItem = ({ item }: { item: CachedPrediction }) => {
    const isHealthy = item.disease_info.is_healthy;
    const confidenceColor =
      item.confidence >= 0.8
        ? "#22C55E"
        : item.confidence >= 0.6
        ? "#F59E0B"
        : "#EF4444";

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/scan-details",
            params: {
              predictionId: item.timestamp.toString(),
              imageUri: item.imageUri,
            },
          })
        }
        style={styles.predictionItem}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              item.imageUri
                ? { uri: item.imageUri }
                : require("../../assets/images/placeholder-image.png")
            }
            style={styles.predictionImage}
            contentFit="cover"
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
            <Text style={styles.cropName}>
              {item.disease_info.crop || "Unknown Crop"}
            </Text>
            <Text style={styles.timestamp}>
              {getRelativeTime(item.timestamp)}
            </Text>
          </View>

          <Text
            style={[
              styles.diseaseName,
              { color: isHealthy ? "#22C55E" : "#374151" },
            ]}
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
                color={
                  item.disease_info.risk_level === "High"
                    ? "#EF4444"
                    : item.disease_info.risk_level === "Medium"
                    ? "#F59E0B"
                    : "#22C55E"
                }
              />
              <Text
                style={[
                  styles.riskLevel,
                  {
                    color:
                      item.disease_info.risk_level === "High"
                        ? "#EF4444"
                        : item.disease_info.risk_level === "Medium"
                        ? "#F59E0B"
                        : "#22C55E",
                  },
                ]}
              >
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
  };

  const chartData = {
    labels: getWeekdayLabels(),
    datasets: [
      {
        data: getWeeklyStats(),
      },
    ],
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50046" />
        <Text style={styles.loadingText}>Loading predictions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prediction History</Text>
        {predictionHistory.length > 0 && (
          <TouchableOpacity
            onPress={handleDeleteAll}
            style={styles.clearButton}
          >
            <Feather name="trash-2" size={22} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {predictionHistory.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {predictionHistory.length}
                </Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{scansToday}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {
                    predictionHistory.filter(
                      (p: CachedPrediction) => p.disease_info.is_healthy
                    ).length
                  }
                </Text>
                <Text style={styles.statLabel}>Healthy</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Weekly Activity</Text>
              <BarChart
                data={chartData}
                width={Dimensions.get("window").width - 40}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  color: (opacity = 1) => `rgba(229, 0, 70, ${opacity})`,
                  labelColor: () => "#6B7280",
                  barPercentage: 0.7,
                  decimalPlaces: 0,
                }}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                showValuesOnTopOfBars
              />
            </View>

            <View style={styles.listContainer}>
              <FlatList
                data={predictionHistory}
                keyExtractor={(item) => item.timestamp.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Predictions Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start scanning plants to build your prediction history
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  clearButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E50046",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 16,
  },
  predictionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  predictionImage: {
    width: "100%",
    height: 200,
  },
  confidenceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  predictionDetails: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  riskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  riskLevel: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  confidenceLevel: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HistoryScreen;
