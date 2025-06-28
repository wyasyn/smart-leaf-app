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

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { router } from "expo-router";

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
  const [results, setResults] = useState<any>(null);
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

      const data = await response.json();

      if (response.ok && data.success) {
        setResults(data);
        Alert.alert(
          "Analysis Complete",
          `Detected: ${data.clean_class_name}\nConfidence: ${(
            data.confidence * 100
          ).toFixed(1)}%`
        );
      } else {
        throw new Error(data.detail || "Prediction failed");
      }
    } catch (error) {
      console.error("API Error:", error);
      setResults(null);
      Alert.alert("Analysis Failed", "Could not analyze the image.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <ScrollView style={styles.resultsContainer}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Results</Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Detected:</Text>
            <Text style={styles.resultValue}>{results.clean_class_name}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Confidence:</Text>
            <Text
              style={[
                styles.resultValue,
                {
                  color:
                    results.confidence > 0.8
                      ? "#4CAF50"
                      : results.confidence > 0.6
                      ? "#FF9800"
                      : "#F44336",
                },
              ]}
            >
              {(results.confidence * 100).toFixed(1)}% (
              {results.confidence_level})
            </Text>
          </View>

          {results.disease_info?.disease_name && (
            <>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Disease:</Text>
                <Text style={styles.resultValue}>
                  {results.disease_info.disease_name}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Crop:</Text>
                <Text style={styles.resultValue}>
                  {results.disease_info.crop}
                </Text>
              </View>
              {results.disease_info.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.resultLabel}>Description:</Text>
                  <Text style={styles.descriptionText}>
                    {results.disease_info.description}
                  </Text>
                </View>
              )}
            </>
          )}

          {results.recommendations && results.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.resultLabel}>Recommendations:</Text>
              {results.recommendations.map((rec: string, index: number) => (
                <Text key={index} style={styles.recommendationItem}>
                  • {rec}
                </Text>
              ))}
            </View>
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
