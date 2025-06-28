import { ScanHistoryItem, ScanHistoryManager } from "@/utils/scan-history";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { stylesHome as styles } from "../utils/home-screen-styles";
import renderRecentScan from "./resent-scan-item";

function HomeHistory() {
  const [currentScans, setCurrentScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await ScanHistoryManager.getHistory();
      setCurrentScans(history);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" color="#E50046" />
      ) : currentScans.length > 0 ? (
        <View style={styles.recentScansContainer}>
          <View style={styles.recentScansHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            style={{ paddingBottom: 24 }}
            data={currentScans.slice(0, 3)}
            renderItem={renderRecentScan}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>
      ) : (
        <View style={styles.noHistoryContainer}>
          <Image
            source={require("../assets/images/no-history.jpg")}
            style={styles.noHistoryImage}
            contentFit="contain"
          />
          <Text style={styles.noHistoryTitle}>No Scan History</Text>
          <Text style={styles.noHistorySubtitle}>
            Your recent scans will show up here after you scan a plant.
          </Text>
        </View>
      )}
    </>
  );
}

export default HomeHistory;
