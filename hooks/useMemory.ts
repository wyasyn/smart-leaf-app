// Add to your hooks file
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { usePlantDiseaseStore } from "../store/plantDiseaseStore";

// Memory pressure management hook
export const useMemoryManagement = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground
        console.log("App has come to the foreground!");
      } else if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to the background - clean up memory
        console.log("App has gone to the background - cleaning up memory");

        // Keep only recent predictions when app goes to background
        const state = usePlantDiseaseStore.getState();
        const recentPredictions = state.predictionHistory.slice(0, 5);

        usePlantDiseaseStore.setState({
          predictionHistory: recentPredictions,
          searchCache: [], // Clear search cache
        });
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // Clean up old predictions periodically
  useEffect(() => {
    const cleanup = () => {
      const state = usePlantDiseaseStore.getState();
      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Keep only predictions from the last week
      const recentPredictions = state.predictionHistory.filter(
        (prediction) => prediction.timestamp > oneWeekAgo
      );

      if (recentPredictions.length !== state.predictionHistory.length) {
        usePlantDiseaseStore.setState({
          predictionHistory: recentPredictions,
        });
      }
    };

    // Run cleanup every 30 minutes
    const interval = setInterval(cleanup, 30 * 60 * 1000);

    // Run initial cleanup
    cleanup();

    return () => clearInterval(interval);
  }, []);
};

// Enhanced cache cleanup hook
export const useEnhancedCacheCleanup = () => {
  const { cacheExpiryMinutes } = usePlantDiseaseStore.getState();

  useEffect(() => {
    const cleanup = () => {
      const state = usePlantDiseaseStore.getState();
      const now = Date.now();
      const expiryTime = cacheExpiryMinutes * 60 * 1000;

      // Clean expired search cache
      const validSearchCache = state.searchCache.filter(
        (item) => now - item.timestamp < expiryTime
      );

      // Clean expired disease cache
      const validDiseaseCache: Record<string, any> = {};
      Object.entries(state.diseaseCache).forEach(([key, value]) => {
        if (now - value.timestamp < expiryTime) {
          validDiseaseCache[key] = value;
        }
      });

      // Update state only if there are changes
      if (
        validSearchCache.length !== state.searchCache.length ||
        Object.keys(validDiseaseCache).length !==
          Object.keys(state.diseaseCache).length
      ) {
        usePlantDiseaseStore.setState({
          searchCache: validSearchCache,
          diseaseCache: validDiseaseCache,
        });
      }
    };

    // Run cleanup every hour
    const interval = setInterval(cleanup, 60 * 60 * 1000);

    // Run initial cleanup
    cleanup();

    return () => clearInterval(interval);
  }, [cacheExpiryMinutes]);
};
