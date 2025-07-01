import { usePlantDiseaseStore } from "@/store/plantDiseaseStore";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { stylesHome as styles } from "../utils/home-screen-styles";
import renderCarouselItem from "./disease-item";

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
