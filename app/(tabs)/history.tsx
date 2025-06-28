import { getRelativeTime } from "@/utils/lib";
import { ScanHistoryItem, ScanHistoryManager } from "@/utils/scan-history";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { stylesHome as styles } from "../../utils/home-screen-styles";

const HistoryScreen = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    const scans = await ScanHistoryManager.getHistory();
    setHistory(scans);
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Scan", "Are you sure you want to delete this scan?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await ScanHistoryManager.deleteScan(id);
          loadHistory();
        },
      },
    ]);
  };

  const handleClear = () => {
    Alert.alert("Clear All History", "This cannot be undone. Continue?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await ScanHistoryManager.clearHistory();
          loadHistory();
        },
      },
    ]);
  };

  const getWeeklyStats = () => {
    const weeklyData = Array(7).fill(0);
    const now = new Date();
    for (const scan of history) {
      const scanDate = new Date(scan.timestamp);
      const diff = Math.floor(
        (now.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff < 7) weeklyData[6 - diff]++;
    }
    return weeklyData;
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const today = new Date().toDateString();
  const scansToday = history.filter(
    (h) => new Date(h.timestamp).toDateString() === today
  ).length;

  const renderItem = ({ item }: { item: ScanHistoryItem }) => {
    const isHealthy = !item.prediction_data.disease_info.common_names?.length;

    return (
      <TouchableOpacity
        onLongPress={() => handleDelete(item.id)}
        onPress={() =>
          router.push({
            pathname: "/scan-details",
            params: { scanId: item.id },
          })
        }
        style={styles.recentScanItem}
      >
        <View style={styles.scanImageContainer}>
          <Image
            source={{ uri: item.image_uri }}
            style={styles.scanImage}
            contentFit="cover"
          />
        </View>
        <View style={styles.scanDetails}>
          <Text style={styles.scanPlantName}>
            {item.prediction_data.disease_info.crop}
          </Text>
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
            {getRelativeTime(item.timestamp.toString())}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const chartData = {
    labels: ["S", "M", "T", "W", "T", "F", "S"],
    datasets: [
      {
        data: getWeeklyStats(),
      },
    ],
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Scan History</Text>
        <TouchableOpacity onPress={handleClear}>
          <Feather name="trash-2" size={22} color="crimson" />
        </TouchableOpacity>
      </View>

      <Text style={{ marginBottom: 4 }}>
        Total Scans: {history.length} | Today: {scansToday}
      </Text>

      <BarChart
        data={chartData}
        width={Dimensions.get("window").width - 20}
        height={180}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: (opacity = 1) => `rgba(229, 0, 70, ${opacity})`,
          labelColor: () => "#333",
          barPercentage: 0.6,
        }}
        style={{ marginBottom: 15, borderRadius: 12 }}
        yAxisLabel=""
        yAxisSuffix=""
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#E50046"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push("/scan")}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#E50046",
          padding: 16,
          borderRadius: 999,
          elevation: 5,
        }}
      >
        <AntDesign name="camerao" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default HistoryScreen;
