import HomeHistory from "@/components/home-history";
import SmartLeafBanner from "@/components/SmartLeafBanner";
import { CarouselItem, HomeScreenProps } from "@/utils/lib";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { stylesHome as styles } from "../../utils/home-screen-styles";

const HomeScreen: React.FC<HomeScreenProps> = ({ isOffline = false }) => {
  const carouselData: CarouselItem[] = [
    {
      id: "1",
      title: "Tomato Diseases",
      description: "Learn about common tomato plant diseases",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6g7fizzu3tlT8-10wm5r-PctBYLERg2iyGA&s",
      type: "plant",
    },
    {
      id: "2",
      title: "Rose Care Tips",
      description: "Keep your roses healthy and beautiful",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8y3nRaWO_iJhCN71hsP3NTRUfLc1BH7O8bw&s",
      type: "plant",
    },
    {
      id: "3",
      title: "Fungal Infections",
      description: "Identify and treat fungal diseases",
      image:
        "https://www.lovethegarden.com/sites/default/files/styles/header_image_fallback/public/content/articles/UK_learn-grow-garden-advice-pests-disease-control-common-types-plant-fungus_header.jpg?itok=rpZjn9px",
      type: "disease",
    },
  ];

  const renderCarouselItem = ({ item }: { item: CarouselItem }) => (
    <TouchableOpacity style={styles.carouselItem}>
      <View style={styles.carouselImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.carouselImage}
          defaultSource={require("../../assets/images/placeholder-image.png")}
        />
      </View>
      <View style={styles.carouselContent}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        <Text style={styles.carouselDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SmartLeafBanner />

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            📱 Offline Mode - Some features may be limited
          </Text>
        </View>
      )}

      {/* Main Scan Button */}
      <TouchableOpacity
        style={styles.mainScanButton}
        onPress={() => {
          Haptics.selectionAsync();
          router.push("/scan");
        }}
        activeOpacity={0.8}
      >
        <View style={styles.scanButtonContent}>
          <View style={styles.scanIconContainer}>
            <Ionicons name="camera" size={32} color="#fff" />
          </View>
          <View style={styles.scanButtonText}>
            <Text style={styles.scanButtonTitle}>Scan Plant</Text>
            <Text style={styles.scanButtonSubtitle}>
              Detect diseases instantly
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/diseases")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E8F5E8" }]}
            >
              <Ionicons name="library" size={24} color="#2C5530" />
            </View>
            <Text style={styles.quickActionText}>View Diseases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/history")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}
            >
              <Ionicons name="time" size={24} color="#E65100" />
            </View>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/settings")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FCE4EC" }]}
            >
              <Ionicons name="settings" size={24} color="#C2185B" />
            </View>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/search")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}
            >
              <Ionicons name="search" size={24} color="#1976D2" />
            </View>
            <Text style={styles.quickActionText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Plant & Disease Carousel */}
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
          data={carouselData}
          renderItem={renderCarouselItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        />
      </View>

      <HomeHistory />
    </ScrollView>
  );
};

export default HomeScreen;
