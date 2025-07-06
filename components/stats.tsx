import { historyStyles as styles } from "@/constants/historyStyles";
import React from "react";
import { Text, View } from "react-native";

const StatisticsSection = React.memo(
  ({
    totalScans,
    scansToday,
    healthyScans,
  }: {
    totalScans: number;
    scansToday: number;
    healthyScans: number;
  }) => (
    <View style={styles.statsContainer}>
      <View
        style={styles.statItem}
        accessible={true}
        accessibilityLabel={`Total scans: ${totalScans}`}
      >
        <Text style={styles.statNumber}>{totalScans}</Text>
        <Text style={styles.statLabel}>Total Scans</Text>
      </View>
      <View
        style={styles.statItem}
        accessible={true}
        accessibilityLabel={`Scans today: ${scansToday}`}
      >
        <Text style={styles.statNumber}>{scansToday}</Text>
        <Text style={styles.statLabel}>Today</Text>
      </View>
      <View
        style={styles.statItem}
        accessible={true}
        accessibilityLabel={`Healthy plants: ${healthyScans}`}
      >
        <Text style={styles.statNumber}>{healthyScans}</Text>
        <Text style={styles.statLabel}>Healthy</Text>
      </View>
    </View>
  )
);

StatisticsSection.displayName = "StatisticsSection";

export default StatisticsSection;
