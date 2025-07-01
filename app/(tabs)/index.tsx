import HomeDiseases from "@/components/home-diseases";
import HomeHistory from "@/components/home-history";
import SmartLeafBanner from "@/components/SmartLeafBanner";
import { usePlantDiseaseStore } from "@/store/plantDiseaseStore";
import { HomeScreenProps } from "@/utils/lib";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { stylesHome as styles } from "../../utils/home-screen-styles";

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { isOnline } = usePlantDiseaseStore();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SmartLeafBanner />

      {/* Offline Indicator */}
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            📱 Offline Mode - Some features may be limited
          </Text>
        </View>
      )}

      {/* Plant & Disease Carousel */}
      <HomeDiseases />

      <HomeHistory />
    </ScrollView>
  );
};

export default HomeScreen;
