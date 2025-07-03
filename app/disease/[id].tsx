import { colors } from "@/utils/colors";
import { getRiskLevelColor } from "@/utils/lib";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlantDiseaseStore } from "../../store/plantDiseaseStore";

export default function DiseaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const getDiseaseById = usePlantDiseaseStore((state) => state.getDiseaseById);
  const currentDisease = usePlantDiseaseStore((state) => state.currentDisease);
  const isFetchingDisease = usePlantDiseaseStore(
    (state) => state.isFetchingDisease
  );
  const diseaseError = usePlantDiseaseStore((state) => state.diseaseError);

  useEffect(() => {
    if (id) {
      getDiseaseById(id);
    }
  }, [id, getDiseaseById]);

  const openExternalResource = (url: string) => {
    Linking.openURL(url);
  };

  if (isFetchingDisease) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: "#666", fontSize: 16 }}>
          Loading disease information...
        </Text>
      </View>
    );
  }

  if (diseaseError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text
          style={{
            color: "#ff4444",
            textAlign: "center",
            marginBottom: 16,
            fontSize: 16,
          }}
        >
          {diseaseError}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentDisease) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#666", fontSize: 16 }}>Disease not found</Text>
      </View>
    );
  }

  const disease = currentDisease.disease_info;

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#222",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );

  const BulletList = ({ items }: { items: string[] }) =>
    items.map((item, index) => (
      <Text
        key={index}
        style={{ fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 6 }}
      >
        • {item}
      </Text>
    ));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          left: 12,
          top: 40,
          backgroundColor: "#333446BF",
          padding: 12,
          borderRadius: 50,
          zIndex: 50,
        }}
      >
        <AntDesign name="left" size={20} color="white" />
      </TouchableOpacity>

      <Image
        source={{ uri: disease.image_urls[0] }}
        resizeMode="cover"
        style={{ width: "100%", height: 360 }}
      />

      <View
        style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          marginTop: -24,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#111",
            marginBottom: 6,
          }}
        >
          {disease.disease_name || currentDisease.class_name}
        </Text>

        {disease.common_names?.length > 0 && (
          <Text style={{ fontSize: 16, color: "#666", marginBottom: 10 }}>
            Also known as:{" "}
            <Text style={{ fontStyle: "italic", color: "#444" }}>
              {disease.common_names.join(", ")}
            </Text>
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <Tag text={disease.crop} color="#007AFF" />
          <Tag
            text={`${disease.risk_level} Risk`}
            color={getRiskLevelColor(disease.risk_level)}
          />
          <Tag text={disease.type} color="#888" />
        </View>

        <Section title="Description">
          <Text style={{ fontSize: 16, color: "#333", lineHeight: 26 }}>
            {disease.description}
          </Text>
        </Section>

        {disease.symptoms?.length > 0 && (
          <Section title="Symptoms">
            <BulletList items={disease.symptoms} />
          </Section>
        )}

        {disease.cause && (
          <Section title="Cause">
            <Text style={{ fontSize: 16, color: "#333", lineHeight: 26 }}>
              {disease.cause}
            </Text>
          </Section>
        )}

        {disease.treatment?.length > 0 && (
          <Section title="Treatment">
            <BulletList items={disease.treatment} />
          </Section>
        )}

        {disease.prevention?.length > 0 && (
          <Section title="Prevention">
            <BulletList items={disease.prevention} />
          </Section>
        )}

        {disease.management_tips && (
          <Section title="Management Tips">
            <Text style={{ fontSize: 16, color: "#333", lineHeight: 26 }}>
              {disease.management_tips}
            </Text>
          </Section>
        )}

        {disease.sprayer_intervals && (
          <Section title="Sprayer Intervals">
            <Text style={{ fontSize: 16, color: "#333", lineHeight: 26 }}>
              {disease.sprayer_intervals}
            </Text>
          </Section>
        )}

        {disease.localized_tips && (
          <Section title="Local Tips">
            <Text style={{ fontSize: 16, color: "#333", lineHeight: 26 }}>
              {disease.localized_tips}
            </Text>
          </Section>
        )}

        {disease.external_resources?.length > 0 && (
          <Section title="Additional Resources">
            {disease.external_resources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openExternalResource(resource.url)}
                style={{
                  backgroundColor: "#F7F9FC",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: "#007AFF",
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#007AFF" }}
                >
                  {resource.title}
                </Text>
                <Text style={{ fontSize: 14, color: "#555", marginTop: 4 }}>
                  Tap to open external link
                </Text>
              </TouchableOpacity>
            ))}
          </Section>
        )}
      </View>
    </ScrollView>
  );
}

const Tag = ({ text, color }: { text: string; color: string }) => (
  <Text
    style={{
      backgroundColor: color,
      color: "white",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      fontSize: 12,
      fontWeight: "600",
    }}
  >
    {text}
  </Text>
);
