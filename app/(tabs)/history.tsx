import { getRelativeTime } from "@/utils/lib";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import {
  CachedPrediction,
  usePlantDiseaseStore,
} from "../../store/plantDiseaseStore";

// Constants
const COLORS = {
  PRIMARY: "#E50046",
  SUCCESS: "#22C55E",
  WARNING: "#F59E0B",
  DANGER: "#EF4444",
  GRAY_50: "#F9FAFB",
  GRAY_100: "#D1D5DB",
  GRAY_400: "#6B7280",
  GRAY_700: "#374151",
  GRAY_900: "#111827",
  WHITE: "#FFFFFF",
} as const;

const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 40,
} as const;

const FONT_SIZES = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
} as const;

const CHART_CONFIG = {
  backgroundGradientFrom: COLORS.WHITE,
  backgroundGradientTo: COLORS.WHITE,
  color: (opacity = 1) => `rgba(229, 0, 70, ${opacity})`,
  labelColor: () => COLORS.GRAY_400,
  barPercentage: 0.7,
  decimalPlaces: 0,
} as const;

const IMAGE_HEIGHT = 200;
const CHART_HEIGHT = 180;
const MIN_TOUCH_TARGET = 44;

// Separate component for prediction item
const PredictionItem = React.memo(({ item }: { item: CachedPrediction }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const isHealthy = item.disease_info.is_healthy;
  const confidenceColor =
    item.confidence >= 0.8
      ? COLORS.SUCCESS
      : item.confidence >= 0.6
      ? COLORS.WARNING
      : COLORS.DANGER;

  const riskColor =
    item.disease_info.risk_level === "High"
      ? COLORS.DANGER
      : item.disease_info.risk_level === "Medium"
      ? COLORS.WARNING
      : COLORS.SUCCESS;

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/scan-details/[predictionId]",
      params: {
        predictionId: item.timestamp.toString(),
        imageUri: item.imageUri,
      },
    });
  }, [item.timestamp, item.imageUri]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.predictionItem}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Prediction for ${
        item.disease_info.crop || "unknown crop"
      }, ${
        isHealthy
          ? "healthy plant"
          : item.disease_info.disease_name || item.clean_class_name
      }, confidence ${Math.round(item.confidence * 100)}%`}
      accessibilityHint="Tap to view detailed prediction results"
    >
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.imageLoadingContainer}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          </View>
        )}
        <Image
          source={
            imageError || !item.imageUri
              ? require("../../assets/images/placeholder-image.png")
              : { uri: item.imageUri }
          }
          style={[styles.predictionImage, imageLoading && styles.hiddenImage]}
          contentFit="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          accessible={true}
          accessibilityLabel={`Plant scan image for ${
            item.disease_info.crop || "unknown crop"
          }`}
        />
        <View
          style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}
          accessible={true}
          accessibilityLabel={`Confidence ${Math.round(
            item.confidence * 100
          )} percent`}
        >
          <Text style={styles.confidenceText}>
            {Math.round(item.confidence * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.predictionDetails}>
        <View style={styles.headerRow}>
          <Text style={styles.cropName} numberOfLines={1}>
            {item.disease_info.crop || "Unknown Crop"}
          </Text>
          <Text style={styles.timestamp}>
            {getRelativeTime(item.timestamp)}
          </Text>
        </View>

        <Text
          style={[
            styles.diseaseName,
            { color: isHealthy ? COLORS.SUCCESS : COLORS.GRAY_700 },
          ]}
          numberOfLines={2}
        >
          {isHealthy
            ? "Healthy Plant ✅"
            : item.disease_info.disease_name || item.clean_class_name}
        </Text>

        {!isHealthy && (
          <View style={styles.riskContainer}>
            <MaterialIcons
              name="warning"
              size={16}
              color={riskColor}
              accessible={false}
            />
            <Text style={[styles.riskLevel, { color: riskColor }]}>
              {item.disease_info.risk_level} Risk
            </Text>
          </View>
        )}

        <Text style={styles.confidenceLevel}>
          Confidence: {item.confidence_level}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

PredictionItem.displayName = "PredictionItem";

// Separate component for statistics
const StatisticsSection = React.memo(
  ({
    totalScans,
    scansToday,
    healthyScans,
  }: {
    totalScans: number;
    scansToday: number;
    healthyScans: number;
  }) => (
    <View style={styles.statsContainer}>
      <View
        style={styles.statItem}
        accessible={true}
        accessibilityLabel={`Total scans: ${totalScans}`}
      >
        <Text style={styles.statNumber}>{totalScans}</Text>
        <Text style={styles.statLabel}>Total Scans</Text>
      </View>
      <View
        style={styles.statItem}
        accessible={true}
        accessibilityLabel={`Scans today: ${scansToday}`}
      >
        <Text style={styles.statNumber}>{scansToday}</Text>
        <Text style={styles.statLabel}>Today</Text>
      </View>
      <View
        style={styles.statItem}
        accessible={true}
        accessibilityLabel={`Healthy plants: ${healthyScans}`}
      >
        <Text style={styles.statNumber}>{healthyScans}</Text>
        <Text style={styles.statLabel}>Healthy</Text>
      </View>
    </View>
  )
);

StatisticsSection.displayName = "StatisticsSection";

// Separate component for chart
const WeeklyChart = React.memo(({ chartData }: { chartData: any }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>Weekly Activity</Text>
    <BarChart
      data={chartData}
      width={Dimensions.get("window").width - SPACING.XXXL}
      height={CHART_HEIGHT}
      chartConfig={CHART_CONFIG}
      style={styles.chart}
      yAxisLabel=""
      yAxisSuffix=""
      showValuesOnTopOfBars
    />
  </View>
));

WeeklyChart.displayName = "WeeklyChart";

// Empty state component
const EmptyState = React.memo(() => (
  <View style={styles.emptyContainer}>
    <MaterialIcons
      name="history"
      size={64}
      color={COLORS.GRAY_100}
      accessible={false}
    />
    <Text style={styles.emptyTitle}>No Predictions Yet</Text>
    <Text style={styles.emptySubtitle}>
      Start scanning plants to build your prediction history
    </Text>
  </View>
));

EmptyState.displayName = "EmptyState";

// Main component
const HistoryScreen = () => {
  const predictionHistory = usePlantDiseaseStore(
    (state) => state.predictionHistory
  );
  const getCachedPredictions = usePlantDiseaseStore(
    (state) => state.getCachedPredictions
  );
  const clearPredictionHistory = usePlantDiseaseStore(
    (state) => state.clearPredictionHistory
  );
  const isLoading = usePlantDiseaseStore((state) => state.isLoading);
  const error = usePlantDiseaseStore((state) => state.error);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getCachedPredictions();
  }, [getCachedPredictions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getCachedPredictions();
    } catch (err) {
      console.error("Failed to refresh predictions:", err);
    } finally {
      setRefreshing(false);
    }
  }, [getCachedPredictions]);

  const getWeekdayLabels = useCallback(() => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      labels.push(weekdays[d.getDay()]);
    }

    return labels;
  }, []);

  const handleDeleteAll = useCallback(() => {
    Alert.alert(
      "Clear All History",
      "This will delete all prediction history. This cannot be undone. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            clearPredictionHistory();
          },
        },
      ]
    );
  }, [clearPredictionHistory]);

  const getWeeklyStats = useCallback(() => {
    const weeklyData = Array(7).fill(0);
    const now = new Date();

    for (const prediction of predictionHistory) {
      const predictionDate = new Date(prediction.timestamp);
      const diff = Math.floor(
        (now.getTime() - predictionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff < 7) weeklyData[6 - diff]++;
    }
    return weeklyData;
  }, [predictionHistory]);

  const stats = React.useMemo(() => {
    const today = new Date().toDateString();
    const scansToday = predictionHistory.filter(
      (h) => new Date(h.timestamp).toDateString() === today
    ).length;
    const healthyScans = predictionHistory.filter(
      (p: CachedPrediction) => p.disease_info.is_healthy
    ).length;

    return {
      totalScans: predictionHistory.length,
      scansToday,
      healthyScans,
    };
  }, [predictionHistory]);

  const chartData = React.useMemo(
    () => ({
      labels: getWeekdayLabels(),
      datasets: [
        {
          data: getWeeklyStats(),
        },
      ],
    }),
    [getWeekdayLabels, getWeeklyStats]
  );

  const renderItem = useCallback(
    ({ item }: { item: CachedPrediction }) => <PredictionItem item={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: CachedPrediction) => item.timestamp.toString(),
    []
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: IMAGE_HEIGHT + 120, // Approximate item height
      offset: (IMAGE_HEIGHT + 120) * index,
      index,
    }),
    []
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading predictions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={64} color={COLORS.DANGER} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.retryButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry loading predictions"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Prediction History</Text>
        {predictionHistory.length > 0 && (
          <TouchableOpacity
            onPress={handleDeleteAll}
            style={styles.clearButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear all prediction history"
            accessibilityHint="This will delete all your scan history permanently"
          >
            <Feather name="trash-2" size={22} color={COLORS.DANGER} />
          </TouchableOpacity>
        )}
      </View>

      {predictionHistory.length > 0 ? (
        <FlatList
          data={predictionHistory}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={5}
          windowSize={10}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
          ListHeaderComponent={
            <>
              <StatisticsSection
                totalScans={stats.totalScans}
                scansToday={stats.scansToday}
                healthyScans={stats.healthyScans}
              />
              <WeeklyChart chartData={chartData} />
            </>
          }
        />
      ) : (
        <EmptyState />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.GRAY_50,
  },
  loadingText: {
    marginTop: SPACING.MD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.GRAY_400,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.GRAY_50,
    paddingHorizontal: SPACING.XXXL,
  },
  errorTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: "600",
    color: COLORS.GRAY_700,
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  errorSubtitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY_400,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.XXL,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.XXL,
    paddingVertical: SPACING.MD,
    borderRadius: SPACING.SM,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: "center",
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.XL,
    paddingTop: 26,
    paddingBottom: SPACING.LG,
    gap: SPACING.XS,
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: "bold",
    color: COLORS.GRAY_900,
  },
  clearButton: {
    padding: SPACING.SM,
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    justifyContent: "center",
    alignItems: "center",
  },
  flatListContent: {
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: SPACING.XL,
    marginBottom: SPACING.XL,
  },
  statItem: {
    alignItems: "center",
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: "center",
  },
  statNumber: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY_400,
    marginTop: SPACING.XS,
  },
  chartContainer: {
    paddingHorizontal: SPACING.XL,
    marginBottom: SPACING.XL,
  },
  chartTitle: {
    fontSize: FONT_SIZES.MD,
    fontWeight: "600",
    color: COLORS.GRAY_700,
    marginBottom: SPACING.MD,
  },
  chart: {
    borderRadius: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  predictionItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: SPACING.MD,
    marginBottom: SPACING.LG,
    marginHorizontal: SPACING.XL,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: IMAGE_HEIGHT,
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.GRAY_100,
    zIndex: 1,
  },
  predictionImage: {
    width: "100%",
    height: IMAGE_HEIGHT,
  },
  hiddenImage: {
    opacity: 0,
  },
  confidenceBadge: {
    position: "absolute",
    top: SPACING.MD,
    right: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 6,
    minHeight: 24,
    justifyContent: "center",
  },
  confidenceText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.XS,
    fontWeight: "bold",
  },
  predictionDetails: {
    padding: SPACING.LG,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.SM,
  },
  cropName: {
    fontSize: FONT_SIZES.LG,
    fontWeight: "600",
    color: COLORS.GRAY_900,
    flex: 1,
    marginRight: SPACING.SM,
  },
  timestamp: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY_400,
  },
  diseaseName: {
    fontSize: FONT_SIZES.MD,
    fontWeight: "500",
    marginBottom: SPACING.SM,
  },
  riskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.XS,
  },
  riskLevel: {
    fontSize: FONT_SIZES.SM,
    fontWeight: "500",
    marginLeft: SPACING.XS,
  },
  confidenceLevel: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY_400,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.XXXL,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: "600",
    color: COLORS.GRAY_700,
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY_400,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HistoryScreen;
