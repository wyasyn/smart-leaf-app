import EmptyState from "@/components/history-empty";
import PredictionItem from "@/components/prediction-item";
import StatisticsSection from "@/components/stats";
import WeeklyChart from "@/components/weekly-chart";
import { COLORS, IMAGE_HEIGHT } from "@/constants/constants";
import { historyStyles as styles } from "@/constants/historyStyles";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { isToday } from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CachedPrediction,
  usePlantDiseaseStore,
} from "../../store/plantDiseaseStore";

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

  const [displayedItems, setDisplayedItems] = useState(10);
  const ITEMS_PER_PAGE = 10;

  // Get only the items we want to display
  const visibleHistory = React.useMemo(() => {
    return predictionHistory.slice(0, displayedItems);
  }, [predictionHistory, displayedItems]);

  const loadMore = useCallback(() => {
    if (displayedItems < predictionHistory.length) {
      setTimeout(() => {
        setDisplayedItems((prev) =>
          Math.min(prev + ITEMS_PER_PAGE, predictionHistory.length)
        );
      }, 300); // small delay
    }
  }, [displayedItems, predictionHistory.length]);

  const renderItem = useCallback(
    ({ item, index }: { item: CachedPrediction; index: number }) => (
      <PredictionItem item={item} index={index} />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: CachedPrediction) => item.timestamp.toString(),
    []
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: IMAGE_HEIGHT + 120,
      offset: (IMAGE_HEIGHT + 120) * index,
      index,
    }),
    []
  );

  useEffect(() => {
    getCachedPredictions();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      getCachedPredictions();
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
    const scansToday = predictionHistory.filter((h) =>
      isToday(new Date(h.timestamp))
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
          >
            <Feather name="trash-2" size={22} color={COLORS.DANGER} />
          </TouchableOpacity>
        )}
      </View>

      {predictionHistory.length > 0 ? (
        <FlatList
          data={visibleHistory}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          initialNumToRender={3}
          windowSize={5}
          updateCellsBatchingPeriod={100}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
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
          ListFooterComponent={
            displayedItems < predictionHistory.length ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <EmptyState />
      )}
    </View>
  );
};

export default HistoryScreen;
