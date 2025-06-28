import { stylesScan as styles } from "@/utils/scan-styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CameraType } from "expo-camera/build/Camera.types";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ScanHistoryManager } from "@/utils/scan-history";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { router } from "expo-router";

// Type definitions for the API response
interface DiseaseInfo {
  disease_name?: string;
  common_names: string[];
  crop: string;
  description: string;
  symptoms: string[];
  cause?: string;
  treatment: string[];
  image_urls: string[];
  prevention: string[];
  management_tips: string;
  risk_level: string;
  sprayer_intervals: string;
  localized_tips: string;
  type: string;
  external_resources: { name: string; url: string }[];
}

interface PredictionResponse {
  success: boolean;
  predicted_class: string;
  clean_class_name: string;
  confidence: number;
  confidence_level: string;
  all_predictions: Record<string, number>;
  disease_info: DiseaseInfo;
  recommendations: string[];
  message: string;
}

type PlantScannerScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
if (!API_URL) {
  throw new Error("API_URL is not defined. Please set EXPO_PUBLIC_API_URL.");
}

export default function PlantScannerScreen({
  navigation,
}: PlantScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PredictionResponse | null>(null);
  const [uri, setUri] = useState<string | null>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="camera-alt" size={80} color="#4CAF50" />
        <Text style={styles.permissionText}>
          Camera access is required to scan plant leaves
        </Text>
        <Text style={styles.permissionSubText}>
          We&#39;ll help you identify plant diseases
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Grant Camera Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Save scan to history
  const saveScanToHistory = async (
    predictionData: PredictionResponse,
    imageUri: string
  ) => {
    try {
      const success = await ScanHistoryManager.saveScan(
        predictionData,
        imageUri
      );
      if (success) {
        console.log("Scan saved successfully!");
      } else {
        console.log("Failed to save scan.");
        Alert.alert(
          "Error",
          "Failed to save scan to history. Please try again."
        );
      }
    } catch (error) {
      console.error("Failed to save scan to history:", error);
      Alert.alert(
        "Error",
        "An error occurred while saving the scan. Please try again."
      );
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    try {
      const photo = await ref.current?.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo?.uri) setUri(photo.uri);
    } catch {
      Alert.alert("Error", "Failed to take picture. Please try again.");
    }
  };

  const openGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const clearImage = () => {
    setUri(null);
    setResults(null);
  };

  const goBack = () => {
    setUri(null);
    setResults(null);
    router.push("/(tabs)");
  };

  const sendToAPI = async () => {
    if (!uri) {
      Alert.alert("No Image", "Please take a photo or select one first.");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const formData = new FormData();
      const uriParts = uri.split(".");
      const fileExtension = uriParts[uriParts.length - 1] || "jpg";
      formData.append("file", {
        uri: uri,
        type: `image/${fileExtension}`,
        name: `leaf.${fileExtension}`,
      } as any);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data: PredictionResponse = await response.json();

      if (response.ok && data.success) {
        setResults(data);

        // Save to history
        await saveScanToHistory(data, uri);

        // Show success alert with key information
        Alert.alert(
          "Analysis Complete",
          `Detected: ${data.clean_class_name}\nConfidence: ${(
            data.confidence * 100
          ).toFixed(1)}% (${data.confidence_level})\n\n${data.message}`
        );
      } else {
        throw new Error(data.message || "Prediction failed");
      }
    } catch (error) {
      console.error("API Error:", error);
      setResults(null);
      Alert.alert(
        "Analysis Failed",
        error instanceof Error ? error.message : "Could not analyze the image."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "#4CAF50";
    if (confidence > 0.6) return "#FF9800";
    return "#F44336";
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "high":
        return "#F44336";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const {
      disease_info,
      recommendations,
      confidence,
      confidence_level,
      all_predictions,
    } = results;

    return (
      <ScrollView
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Results</Text>

          {/* Scan Date */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Scanned:</Text>
            <Text style={styles.resultValue}>
              {formatDate(new Date().toISOString())}
            </Text>
          </View>

          {/* Main Detection */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Detected:</Text>
            <Text style={[styles.resultValue, { fontWeight: "bold" }]}>
              {results.clean_class_name}
            </Text>
          </View>

          {/* Confidence */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Confidence:</Text>
            <Text
              style={[
                styles.resultValue,
                {
                  color: getConfidenceColor(confidence),
                  fontWeight: "bold",
                },
              ]}
            >
              {(confidence * 100).toFixed(1)}% ({confidence_level})
            </Text>
          </View>

          {/* Disease Information */}
          {disease_info?.disease_name && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Disease Information</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Disease:</Text>
                <Text style={styles.resultValue}>
                  {disease_info.disease_name}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Crop:</Text>
                <Text style={styles.resultValue}>{disease_info.crop}</Text>
              </View>

              {disease_info.type && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Type:</Text>
                  <Text style={styles.resultValue}>{disease_info.type}</Text>
                </View>
              )}

              {disease_info.risk_level && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Risk Level:</Text>
                  <Text
                    style={[
                      styles.resultValue,
                      {
                        color: getRiskLevelColor(disease_info.risk_level),
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {disease_info.risk_level}
                  </Text>
                </View>
              )}

              {disease_info.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.resultLabel}>Description:</Text>
                  <Text style={styles.descriptionText}>
                    {disease_info.description}
                  </Text>
                </View>
              )}

              {/* Symptoms */}
              {disease_info.symptoms && disease_info.symptoms.length > 0 && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.resultLabel}>Symptoms:</Text>
                  {disease_info.symptoms.map((symptom, index) => (
                    <Text key={index} style={styles.symptomItem}>
                      • {symptom}
                    </Text>
                  ))}
                </View>
              )}

              {/* Treatment */}
              {disease_info.treatment && disease_info.treatment.length > 0 && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.resultLabel}>Treatment:</Text>
                  {disease_info.treatment.map((treatment, index) => (
                    <Text key={index} style={styles.treatmentItem}>
                      • {treatment}
                    </Text>
                  ))}
                </View>
              )}

              {/* Prevention */}
              {disease_info.prevention &&
                disease_info.prevention.length > 0 && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.resultLabel}>Prevention:</Text>
                    {disease_info.prevention.map((prevention, index) => (
                      <Text key={index} style={styles.preventionItem}>
                        • {prevention}
                      </Text>
                    ))}
                  </View>
                )}
            </>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.recommendationsContainer}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {recommendations.map((rec, index) => (
                  <Text key={index} style={styles.recommendationItem}>
                    • {rec}
                  </Text>
                ))}
              </View>
            </>
          )}

          {/* All Predictions */}
          {all_predictions && Object.keys(all_predictions).length > 1 && (
            <>
              <View style={styles.divider} />
              <View style={styles.allPredictionsContainer}>
                <Text style={styles.sectionTitle}>
                  Alternative Possibilities
                </Text>
                {Object.entries(all_predictions)
                  .slice(1, 4) // Show top 3 alternatives
                  .map(([className, conf], index) => (
                    <View key={index} style={styles.alternativeRow}>
                      <Text style={styles.alternativeClass}>{className}</Text>
                      <Text style={styles.alternativeConfidence}>
                        {(conf * 100).toFixed(1)}%
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          )}

          {/* Management Tips */}
          {disease_info?.management_tips && (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Management Tips</Text>
                <Text style={styles.descriptionText}>
                  {disease_info.management_tips}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderImageView = () => (
    <View style={styles.imageContainer}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Image
        source={{ uri: uri! }}
        contentFit="cover"
        style={styles.capturedImage}
      />

      <View style={styles.imageControlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={clearImage}>
          <MaterialIcons name="clear" size={24} color="white" />
          <Text style={styles.controlButtonText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={sendToAPI}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <MaterialIcons name="send" size={24} color="white" />
          )}
          <Text style={styles.sendButtonText}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setUri(null)}
        >
          <MaterialIcons name="camera-alt" size={24} color="white" />
          <Text style={styles.controlButtonText}>Retake</Text>
        </TouchableOpacity>
      </View>

      {renderResults()}
    </View>
  );

  const renderCamera = () => (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButtonCamera} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <CameraView
        style={styles.camera}
        ref={ref}
        facing={facing}
        mode="picture"
      >
        <View style={styles.cameraOverlay}>
          <Text style={styles.instructionText}>
            Position the plant leaf within the frame
          </Text>
        </View>

        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.cameraButton} onPress={openGallery}>
            <MaterialIcons name="photo-library" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
            <View style={styles.shutterButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cameraButton} onPress={toggleFacing}>
            <MaterialIcons name="flip-camera-ios" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );

  return uri ? renderImageView() : renderCamera();
}
