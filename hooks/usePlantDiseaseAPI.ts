import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
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
  const checkHealthRef = useRef(usePlantDiseaseStore.getState().checkHealth);

  useEffect(() => {
    checkHealthRef.current(); // initial call

    const interval = setInterval(() => {
      checkHealthRef.current();
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [intervalMinutes]);
};

// Cache cleanup hook
export const useCacheCleanup = () => {
  const { clearCache, cacheExpiryMinutes } = usePlantDiseaseStore.getState();

  useEffect(() => {
    const cleanup = () => {
      clearCache(); // consider enhancing to remove only expired cache
    };

    // run immediately
    cleanup();

    // Run cleanup every hour
    const interval = setInterval(cleanup, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [cacheExpiryMinutes]); // it's safe to watch static values like numbers
};
