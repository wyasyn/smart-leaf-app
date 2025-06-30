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

  const {
    predictDisease,
    isPredicting,
    predictionError,
    clearAllErrors,
    getCachedPredictions,
  } = usePlantDiseaseStore();

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
        clearAllErrors(); // Clear any previous errors
      }
    } catch {
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const clearImage = () => {
    setUri(null);

    clearAllErrors(); // Clear any previous errors
    getCachedPredictions(); // Refresh cached predictions
  };

  const goBack = () => {
    setUri(null);
    clearAllErrors(); // Clear any previous errors
    getCachedPredictions(); // Refresh cached predictions
    router.push("/(tabs)");
  };

  const handlePredict = async () => {
    if (!uri) return;

    const result = await predictDisease(uri);
    if (result) {
      setResult(result);
    }
  };

  const renderImageView = () => (
    <ScrollView style={styles.imageContainer}>
      <>
        {!result ? (
          <>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Image
              source={{ uri: uri! }}
              contentFit="cover"
              style={styles.capturedImage}
            />

            <View style={styles.imageControlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={clearImage}
              >
                <MaterialIcons name="clear" size={24} color="white" />
                <Text style={styles.controlButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isPredicting && styles.sendButtonDisabled,
                ]}
                onPress={handlePredict}
                disabled={isPredicting}
              >
                {isPredicting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialIcons name="send" size={24} color="white" />
                )}
                <Text style={styles.sendButtonText}>
                  {isPredicting ? "Analyzing..." : "Analyze"}
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
          </>
        ) : (
          <>
            <Image
              source={{ uri: uri! }}
              contentFit="cover"
              style={{
                width: "100%",
                height: 300,
              }}
            />
            <View
              style={{
                backgroundColor: "#f0f0f0",
                padding: 16,
                paddingBottom: 24,
                borderRadius: 12,
                marginBottom: 16,
                marginTop: -16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {result.clean_class_name}
              </Text>
              <Text style={{ marginTop: 8 }}>
                Confidence: {(result.confidence * 100).toFixed(1)}% (
                {result.confidence_level})
              </Text>
              <Text style={{ marginTop: 8 }}>
                {result.disease_info.description}
              </Text>

              {result.recommendations.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "bold" }}>Recommendations:</Text>
                  {result.recommendations.map((rec, index) => (
                    <Text key={index} style={{ marginTop: 4, paddingBlock: 8 }}>
                      {rec}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </>

      {/* Error Display */}
      {predictionError && (
        <View
          style={{
            backgroundColor: "#ff4444",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "white" }}>{predictionError}</Text>
        </View>
      )}
    </ScrollView>
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
