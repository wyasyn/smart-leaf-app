import { stylesScan as styles } from "@/utils/scan-styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CameraType } from "expo-camera/build/Camera.types";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  PredictionResponse,
  usePlantDiseaseStore,
} from "@/store/plantDiseaseStore";
import { router } from "expo-router";

export default function PlantScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const {
    predictDisease,
    isPredicting,
    predictionError,
    clearAllErrors,
    getCachedPredictions,
  } = usePlantDiseaseStore();

  // Animate results when they appear
  const animateResults = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={enhancedStyles.permissionContainer}>
        <LinearGradient
          colors={["#4CAF50", "#45a049"]}
          style={enhancedStyles.permissionGradient}
        >
          <MaterialIcons name="camera-alt" size={80} color="white" />
          <Text style={enhancedStyles.permissionText}>
            Camera access is required to scan plant leaves
          </Text>
          <Text style={enhancedStyles.permissionSubText}>
            We&#39;ll help you identify plant diseases
          </Text>
          <TouchableOpacity
            style={enhancedStyles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={enhancedStyles.permissionButtonText}>
              Grant Camera Permission
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

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
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setUri(result.assets[0].uri);
        clearAllErrors();
      }
    } catch {
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const clearImage = () => {
    setUri(null);
    setResult(null);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    clearAllErrors();
    getCachedPredictions();
  };

  const goBack = () => {
    setUri(null);
    setResult(null);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    clearAllErrors();
    getCachedPredictions();
    router.push("/(tabs)");
  };

  const handlePredict = async () => {
    if (!uri) return;

    const result = await predictDisease(uri);
    if (result) {
      setResult(result);
      animateResults();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#4CAF50";
    if (confidence >= 0.6) return "#FF9800";
    return "#F44336";
  };

  const renderImageView = () => (
    <View style={enhancedStyles.imageViewContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header with back button */}
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "transparent"]}
        style={enhancedStyles.headerGradient}
      >
        <TouchableOpacity style={enhancedStyles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={enhancedStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Display */}
        <View style={enhancedStyles.imageContainer}>
          <Image
            source={{ uri: uri! }}
            contentFit="cover"
            style={enhancedStyles.capturedImage}
          />

          {/* Image overlay gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            style={enhancedStyles.imageOverlay}
          />
        </View>

        {!result ? (
          /* Control Buttons */
          <View style={enhancedStyles.controlsContainer}>
            {/* Enhanced Analyze Button */}
            <TouchableOpacity
              style={[
                enhancedStyles.analyzeButton,
                isPredicting && enhancedStyles.analyzeButtonDisabled,
              ]}
              onPress={handlePredict}
              disabled={isPredicting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isPredicting ? ["#cccccc", "#999999"] : ["#4CAF50", "#45a049"]
                }
                style={enhancedStyles.analyzeButtonGradient}
              >
                {isPredicting ? (
                  <View style={enhancedStyles.loadingContainer}>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={enhancedStyles.analyzeButtonText}>
                      Analyzing...
                    </Text>
                  </View>
                ) : (
                  <View style={enhancedStyles.buttonContent}>
                    <MaterialIcons name="psychology" size={20} color="white" />
                    <Text style={enhancedStyles.analyzeButtonText}>
                      Analyze Plant
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={enhancedStyles.secondaryButton}
              onPress={clearImage}
            >
              <MaterialIcons name="clear" size={20} color="#666" />
              <Text style={enhancedStyles.secondaryButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={enhancedStyles.secondaryButton}
              onPress={() => setUri(null)}
            >
              <MaterialIcons name="camera-alt" size={20} color="#666" />
              <Text style={enhancedStyles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Results Section */
          <Animated.View
            style={[
              enhancedStyles.resultsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Disease Card */}
            <BlurView
              intensity={95}
              tint="light"
              style={enhancedStyles.resultCard}
            >
              <View style={enhancedStyles.cardHeader}>
                <MaterialIcons
                  name="local-hospital"
                  size={24}
                  color="#4CAF50"
                />
                <Text style={enhancedStyles.cardTitle}>Diagnosis</Text>
              </View>

              <Text style={enhancedStyles.diseaseName}>
                {result.clean_class_name}
              </Text>

              {/* Confidence Indicator */}
              <View style={enhancedStyles.confidenceContainer}>
                <Text style={enhancedStyles.confidenceLabel}>Confidence</Text>
                <View style={enhancedStyles.confidenceBar}>
                  <View
                    style={[
                      enhancedStyles.confidenceFill,
                      {
                        width: `${result.confidence * 100}%`,
                        backgroundColor: getConfidenceColor(result.confidence),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    enhancedStyles.confidenceText,
                    { color: getConfidenceColor(result.confidence) },
                  ]}
                >
                  {(result.confidence * 100).toFixed(1)}% (
                  {result.confidence_level})
                </Text>
              </View>
            </BlurView>

            {/* Description Card */}
            <BlurView
              intensity={95}
              tint="light"
              style={enhancedStyles.resultCard}
            >
              <View style={enhancedStyles.cardHeader}>
                <MaterialIcons name="info-outline" size={24} color="#2196F3" />
                <Text style={enhancedStyles.cardTitle}>Description</Text>
              </View>
              <Text style={enhancedStyles.descriptionText}>
                {result.disease_info.description}
              </Text>
            </BlurView>

            {/* Recommendations Card */}
            {result.recommendations.length > 0 && (
              <BlurView
                intensity={95}
                tint="light"
                style={enhancedStyles.resultCard}
              >
                <View style={enhancedStyles.cardHeader}>
                  <MaterialIcons
                    name="lightbulb-outline"
                    size={24}
                    color="#FF9800"
                  />
                  <Text style={enhancedStyles.cardTitle}>Recommendations</Text>
                </View>
                {result.recommendations.map((rec, index) => (
                  <View key={index} style={enhancedStyles.recommendationItem}>
                    <View style={enhancedStyles.bulletPoint} />
                    <Text style={enhancedStyles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </BlurView>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={enhancedStyles.actionButton}
              onPress={clearImage}
            >
              <LinearGradient
                colors={["#2196F3", "#1976D2"]}
                style={enhancedStyles.actionButtonGradient}
              >
                <MaterialIcons name="refresh" size={20} color="white" />
                <Text style={enhancedStyles.actionButtonText}>
                  Scan Another Plant
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Error Display */}
        {predictionError && (
          <View style={enhancedStyles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="white" />
            <Text style={enhancedStyles.errorText}>{predictionError}</Text>
          </View>
        )}
      </ScrollView>
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
      />
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
    </View>
  );

  return uri ? renderImageView() : renderCamera();
}

const enhancedStyles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
  },
  permissionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  permissionSubText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  imageViewContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
    paddingTop: 44,
  },
  backButton: {
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 400,
    marginBottom: 16,
  },
  capturedImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  controlsContainer: {
    gap: 24,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  secondaryButton: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  analyzeButton: {
    width: "100%",
    justifyContent: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analyzeButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  analyzeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 140,
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  analyzeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  resultsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  confidenceContainer: {
    marginTop: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF9800",
    marginTop: 8,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },
  actionButton: {
    marginTop: 8,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 25,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f44336",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  errorText: {
    color: "white",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});
