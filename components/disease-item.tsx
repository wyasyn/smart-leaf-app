import { SearchResult } from "@/store/plantDiseaseStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

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
      <Text numberOfLines={1} style={styles.carouselTitle}>
        {item.disease_info.disease_name}
      </Text>
      <Text style={styles.carouselDescription} numberOfLines={1}>
        {item.disease_info.description}
      </Text>
    </View>
  </TouchableOpacity>
);

export default renderCarouselItem;
