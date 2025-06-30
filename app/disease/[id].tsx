import { DiseaseInfo } from "@/store/plantDiseaseStore";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

const DiseaseDetailScreen = () => {
  const { disease } = useLocalSearchParams();
  const diseaseInfo: DiseaseInfo = JSON.parse(disease.toString());

  return (
    <ScrollView style={{ flex: 1 }}>
      <Image
        source={{ uri: diseaseInfo.image_urls[0] }}
        style={{ width: "100%", height: 300 }}
        contentFit="cover"
        transition={1000}
      />
      <View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {diseaseInfo.disease_name}
        </Text>
      </View>
    </ScrollView>
  );
};

export default DiseaseDetailScreen;
