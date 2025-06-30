import { usePlantDiseaseStore } from "@/store/plantDiseaseStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { stylesHome as styles } from "../utils/home-screen-styles";
import renderRecentScan from "./resent-scan-item";

function HomeHistory() {
  const { predictionHistory } = usePlantDiseaseStore();

  return (
    <>
      {predictionHistory.length > 0 ? (
        <View style={styles.recentScansContainer}>
          <View style={styles.recentScansHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            style={{ paddingBottom: 24 }}
            data={predictionHistory.slice(0, 3)}
            renderItem={renderRecentScan}
            keyExtractor={(item) => item.timestamp.toString()}
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
