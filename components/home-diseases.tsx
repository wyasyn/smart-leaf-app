import { SearchResult, usePlantDiseaseStore } from "@/store/plantDiseaseStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { stylesHome as styles } from "../utils/home-screen-styles";

const renderCarouselItem = ({ item }: { item: SearchResult }) => (
  <TouchableOpacity
    style={styles.carouselItem}
    onPress={() => {
      router.push({
        pathname: "/disease/[id]",
        params: {
          id: item.class_id,
          disease: JSON.stringify(item.disease_info),
        },
      });
    }}
  >
    <View style={styles.carouselImageContainer}>
      <Image
        source={{ uri: item.disease_info.image_urls[0] }}
        style={styles.carouselImage}
        contentFit="cover"
      />
    </View>
    <View style={styles.carouselContent}>
      <Text style={styles.carouselTitle}>{item.disease_info.disease_name}</Text>
      <Text style={styles.carouselDescription} numberOfLines={2}>
        {item.disease_info.description}
      </Text>
    </View>
  </TouchableOpacity>
);

const HomeDiseases = () => {
  const { allDiseases, getAllDiseases } = usePlantDiseaseStore();

  useEffect(() => {
    getAllDiseases();
  }, []);
  return (
    <View style={styles.carouselContainer}>
      <View style={styles.carouselHeader}>
        <Text style={styles.sectionTitle}>Explore</Text>
        <TouchableOpacity onPress={() => router.push("/diseases")}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={{
          marginLeft: 20,
          marginRight: 20,
          paddingBottom: 24,
        }}
        data={allDiseases}
        renderItem={renderCarouselItem}
        keyExtractor={(item) => item.class_id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      />
    </View>
  );
};

export default HomeDiseases;
