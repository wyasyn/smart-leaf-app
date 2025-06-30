import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import {
  useNetworkStatus,
  usePlantDiseaseStore,
} from "../store/plantDiseaseStore";

// Network monitoring hook
export const useNetworkMonitor = () => {
  const { setOnlineStatus } = useNetworkStatus();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnlineStatus(state.isConnected ?? false);
    });

    return unsubscribe;
  }, [setOnlineStatus]);
};

// Auto health check hook
export const useAutoHealthCheck = (intervalMinutes = 5) => {
  const checkHealth = usePlantDiseaseStore((state) => state.checkHealth);

  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up interval
    const interval = setInterval(() => {
      checkHealth();
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkHealth, intervalMinutes]);
};

// Cache cleanup hook
export const useCacheCleanup = () => {
  const { clearCache, cacheExpiryMinutes } = usePlantDiseaseStore((state) => ({
    clearCache: state.clearCache,
    cacheExpiryMinutes: state.cacheExpiryMinutes,
  }));

  useEffect(() => {
    // Clean up expired cache on app start
    const cleanup = () => {
      // This could be enhanced to only clear expired items
      clearCache();
    };

    // Run cleanup every hour
    const interval = setInterval(cleanup, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [clearCache, cacheExpiryMinutes]);
};
