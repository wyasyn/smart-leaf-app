// app/scan-details.tsx
import { getConfidenceBadgeColor, getSeverityColor } from "@/utils/lib";
import { ScanHistoryItem, ScanHistoryManager } from "@/utils/scan-history";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ScanDetails = () => {
  const { scanId } = useLocalSearchParams();
  const [scan, setScan] = useState<ScanHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof scanId === "string") {
      ScanHistoryManager.getScanById(scanId).then((res) => {
        setScan(res);
        setLoading(false);
      });
    }
  }, [scanId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#44AA44" />
        <Text style={styles.loadingText}>Loading scan details...</Text>
      </View>
    );
  }

  if (!scan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Scan not found</Text>
      </View>
    );
  }

  const {
    image_uri,
    prediction_data: {
      disease_info,
      confidence,
      confidence_level,
      clean_class_name,
    },
  } = scan;

  const confidenceColors = getConfidenceBadgeColor(confidence_level);
  const severityColor = getSeverityColor(
    disease_info.risk_level,
    confidence_level
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: image_uri }}
        style={styles.image}
        contentFit="cover"
      />

      <View style={styles.header}>
        <Text style={styles.cropText}>{disease_info.crop}</Text>
        <View
          style={[
            styles.confidenceBadge,
            { backgroundColor: confidenceColors.backgroundColor },
          ]}
        >
          <Text
            style={[styles.confidenceText, { color: confidenceColors.color }]}
          >
            {Math.round(confidence)}%
          </Text>
        </View>
      </View>

      <Text style={[styles.diseaseName, { color: severityColor }]}>
        {clean_class_name || "Unknown Disease"}
      </Text>

      <Text style={styles.sectionTitle}>Symptoms</Text>
      {disease_info.symptoms.map((symptom, index) => (
        <Text key={index} style={styles.listItem}>
          • {symptom}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Treatment</Text>
      {disease_info.treatment.map((treatment, index) => (
        <Text key={index} style={styles.listItem}>
          • {treatment}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Prevention</Text>
      {disease_info.prevention.map((p, index) => (
        <Text key={index} style={styles.listItem}>
          • {p}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>External Resources</Text>
      {disease_info.external_resources.map((res, index) => (
        <Text
          key={index}
          style={styles.link}
          onPress={() => Linking.openURL(res.url)}
        >
          🔗 {res.name}
        </Text>
      ))}

      <Text style={styles.footerNote}>
        Scanned on: {new Date(scan.timestamp).toLocaleString()}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9F9F9",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cropText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
  confidenceBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  confidenceText: {
    fontWeight: "700",
    fontSize: 14,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#333",
  },
  listItem: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
    marginLeft: 8,
  },
  link: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
    marginBottom: 4,
    marginLeft: 8,
  },
  footerNote: {
    marginTop: 20,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});

export default ScanDetails;
