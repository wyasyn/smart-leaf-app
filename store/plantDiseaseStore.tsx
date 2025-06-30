import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
if (!API_URL) {
  throw new Error("API_URL is not defined. Please set EXPO_PUBLIC_API_URL.");
}

// Types based on your API
export interface DiseaseInfo {
  disease_name?: string;
  common_names: string[];
  crop: string;
  description: string;
  symptoms: string[];
  cause?: string;
  treatment: string[];
  image_urls: string[];
  prevention: string[];
  management_tips: string;
  risk_level: string;
  sprayer_intervals: string;
  localized_tips: string;
  type: string;
  external_resources: { title: string; url: string }[];
  is_healthy: boolean;
}

export interface PredictionResponse {
  success: boolean;
  predicted_class: string;
  predicted_class_index: number;
  clean_class_name: string;
  confidence: number;
  confidence_level: string;
  all_predictions: Record<string, number>;
  disease_info: DiseaseInfo;
  recommendations: string[];
  message: string;
  class_id: string;
}

export interface SearchResult {
  class_name: string;
  class_id: string;
  disease_info: DiseaseInfo;
  relevance_score?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  suggestions: SearchResult[];
  total_results: number;
  message: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  total_classes: number;
  available_diseases: number;
  healthy_classes: number;
  message: string;
}

export interface APIStats {
  total_classes: number;
  diseases_in_guide: number;
  healthy_classes: number;
  supported_crops: string[];
  disease_types: string[];
  risk_levels: string[];
  model_loaded: boolean;
  endpoints: Record<string, string>;
}

// Cache interfaces
interface CachedPrediction extends PredictionResponse {
  timestamp: number;
  imageUri: string;
}

interface CachedSearch {
  query: string;
  response: SearchResponse;
  timestamp: number;
}

interface CachedDisease extends SearchResult {
  timestamp: number;
}

// Store state interface
interface PlantDiseaseStore {
  // API Configuration
  baseUrl: string;
  setBaseUrl: (url: string) => void;

  // Loading states
  isLoading: boolean;
  isPredicting: boolean;
  isSearching: boolean;
  isFetchingDisease: boolean;
  isCheckingHealth: boolean;

  // Error states
  error: string | null;
  predictionError: string | null;
  searchError: string | null;
  diseaseError: string | null;
  healthError: string | null;

  // Data
  lastPrediction: PredictionResponse | null;
  searchResults: SearchResponse | null;
  allDiseases: SearchResult[];
  currentDisease: SearchResult | null;
  healthStatus: HealthResponse | null;
  apiStats: APIStats | null;

  // Cache
  predictionHistory: CachedPrediction[];
  searchCache: CachedSearch[];
  diseaseCache: Record<string, CachedDisease>;

  // Cache settings
  cacheExpiryMinutes: number;
  maxCacheSize: number;

  // API Methods
  predictDisease: (imageUri: string) => Promise<PredictionResponse | null>;
  searchDiseases: (
    query: string,
    options?: { limit?: number; includeHealthy?: boolean }
  ) => Promise<SearchResponse | null>;
  getAllDiseases: (filters?: {
    crop?: string;
    diseaseType?: string;
    riskLevel?: string;
    includeHealthy?: boolean;
  }) => Promise<SearchResult[] | null>;
  getDiseaseById: (classId: string) => Promise<SearchResult | null>;
  getDiseaseByName: (className: string) => Promise<SearchResult | null>;
  checkHealth: () => Promise<HealthResponse | null>;
  getApiStats: () => Promise<APIStats | null>;

  // Cache management
  clearCache: () => void;
  clearPredictionHistory: () => void;
  clearSearchCache: () => void;
  clearDiseaseCache: () => void;
  getCachedPredictions: () => CachedPrediction[];
  getCachedSearch: (query: string) => SearchResponse | null;
  getCachedDisease: (classId: string) => SearchResult | null;

  // Utility methods
  clearError: () => void;
  clearAllErrors: () => void;
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
}

// Utility functions
const isExpired = (timestamp: number, expiryMinutes: number): boolean => {
  return Date.now() - timestamp > expiryMinutes * 60 * 1000;
};

const createFormData = (imageUri: string): FormData => {
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "image.jpg",
  } as any);
  return formData;
};

// Create the store
export const usePlantDiseaseStore = create<PlantDiseaseStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Configuration
        baseUrl: API_URL,
        setBaseUrl: (url: string) => set({ baseUrl: url }),

        // Loading states
        isLoading: false,
        isPredicting: false,
        isSearching: false,
        isFetchingDisease: false,
        isCheckingHealth: false,

        // Error states
        error: null,
        predictionError: null,
        searchError: null,
        diseaseError: null,
        healthError: null,

        // Data
        lastPrediction: null,
        searchResults: null,
        allDiseases: [],
        currentDisease: null,
        healthStatus: null,
        apiStats: null,

        // Cache
        predictionHistory: [],
        searchCache: [],
        diseaseCache: {},

        // Cache settings
        cacheExpiryMinutes: 30,
        maxCacheSize: 100,

        // Network status
        isOnline: true,
        setOnlineStatus: (status: boolean) => set({ isOnline: status }),

        // API Methods
        predictDisease: async (imageUri: string) => {
          const { baseUrl, isOnline, cacheExpiryMinutes, predictionHistory } =
            get();

          if (!isOnline) {
            set({ predictionError: "No internet connection" });
            return null;
          }

          set({ isPredicting: true, predictionError: null });

          try {
            const formData = createFormData(imageUri);

            const response = await fetch(`${baseUrl}/predict`, {
              method: "POST",
              body: formData,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data: PredictionResponse = await response.json();

            // Cache the prediction
            const cachedPrediction: CachedPrediction = {
              ...data,
              timestamp: Date.now(),
              imageUri,
            };

            set((state) => ({
              lastPrediction: data,
              predictionHistory: [
                cachedPrediction,
                ...state.predictionHistory.slice(0, state.maxCacheSize - 1),
              ],
              isPredicting: false,
            }));

            return data;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Prediction failed";
            set({ predictionError: errorMessage, isPredicting: false });
            return null;
          }
        },

        searchDiseases: async (query: string, options = {}) => {
          const { baseUrl, isOnline, searchCache, cacheExpiryMinutes } = get();

          if (!isOnline) {
            set({ searchError: "No internet connection" });
            return null;
          }

          // Check cache first
          const cached = searchCache.find(
            (item) =>
              item.query === query &&
              !isExpired(item.timestamp, cacheExpiryMinutes)
          );

          if (cached) {
            set({ searchResults: cached.response });
            return cached.response;
          }

          set({ isSearching: true, searchError: null });

          try {
            const params = new URLSearchParams({
              query,
              limit: (options.limit || 10).toString(),
              include_healthy: (options.includeHealthy || false).toString(),
            });

            const response = await fetch(`${baseUrl}/search?${params}`);

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data: SearchResponse = await response.json();

            // Cache the search
            const cachedSearch: CachedSearch = {
              query,
              response: data,
              timestamp: Date.now(),
            };

            set((state) => ({
              searchResults: data,
              searchCache: [
                cachedSearch,
                ...state.searchCache.slice(0, state.maxCacheSize - 1),
              ],
              isSearching: false,
            }));

            return data;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Search failed";
            set({ searchError: errorMessage, isSearching: false });
            return null;
          }
        },

        getAllDiseases: async (filters = {}) => {
          const { baseUrl, isOnline } = get();

          if (!isOnline) {
            set({ error: "No internet connection" });
            return null;
          }

          set({ isLoading: true, error: null });

          try {
            const params = new URLSearchParams();
            if (filters.crop) params.append("crop", filters.crop);
            if (filters.diseaseType)
              params.append("disease_type", filters.diseaseType);
            if (filters.riskLevel)
              params.append("risk_level", filters.riskLevel);
            if (filters.includeHealthy)
              params.append("include_healthy", "true");

            const response = await fetch(`${baseUrl}/diseases?${params}`);

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data: SearchResult[] = await response.json();

            set({ allDiseases: data, isLoading: false });
            return data;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch diseases";
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        },

        getDiseaseById: async (classId: string) => {
          const { baseUrl, isOnline, diseaseCache, cacheExpiryMinutes } = get();

          if (!isOnline) {
            set({ diseaseError: "No internet connection" });
            return null;
          }

          // Check cache first
          const cached = diseaseCache[classId];
          if (cached && !isExpired(cached.timestamp, cacheExpiryMinutes)) {
            set({ currentDisease: cached });
            return cached;
          }

          set({ isFetchingDisease: true, diseaseError: null });

          try {
            const response = await fetch(
              `${baseUrl}/diseases/${encodeURIComponent(classId)}`
            );

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data: SearchResult = await response.json();

            // Cache the disease
            const cachedDisease: CachedDisease = {
              ...data,
              timestamp: Date.now(),
            };

            set((state) => ({
              currentDisease: data,
              diseaseCache: {
                ...state.diseaseCache,
                [classId]: cachedDisease,
              },
              isFetchingDisease: false,
            }));

            return data;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch disease";
            set({ diseaseError: errorMessage, isFetchingDisease: false });
            return null;
          }
        },

        getDiseaseByName: async (className: string) => {
          const { baseUrl, isOnline } = get();

          if (!isOnline) {
            set({ diseaseError: "No internet connection" });
            return null;
          }

          set({ isFetchingDisease: true, diseaseError: null });

          try {
            const response = await fetch(
              `${baseUrl}/diseases/by-name/${encodeURIComponent(className)}`
            );

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data: SearchResult = await response.json();

            set({ currentDisease: data, isFetchingDisease: false });
            return data;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch disease";
            set({ diseaseError: errorMessage, isFetchingDisease: false });
            return null;
          }
        },

        checkHealth: async () => {
          const { baseUrl, isOnline } = get();

          if (!isOnline) {
            set({ healthError: "No internet connection" });
            return null;
          }

          set({ isCheckingHealth: true, healthError: null });

          try {
            const response = await fetch(`${baseUrl}/health`);

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data: HealthResponse = await response.json();

            set({ healthStatus: data, isCheckingHealth: false });
            return data;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Health check failed";
            set({ healthError: errorMessage, isCheckingHealth: false });
            return null;
          }
        },

        getApiStats: async () => {
          const { baseUrl, isOnline } = get();

          if (!isOnline) {
            set({ error: "No internet connection" });
            return null;
          }

          set({ isLoading: true, error: null });

          try {
            const response = await fetch(`${baseUrl}/stats`);

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data: APIStats = await response.json();

            set({ apiStats: data, isLoading: false });
            return data;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch stats";
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        },

        // Cache management
        clearCache: () => {
          set({
            predictionHistory: [],
            searchCache: [],
            diseaseCache: {},
          });
        },

        clearPredictionHistory: () => {
          set({ predictionHistory: [] });
        },

        clearSearchCache: () => {
          set({ searchCache: [] });
        },

        clearDiseaseCache: () => {
          set({ diseaseCache: {} });
        },

        getCachedPredictions: () => {
          const { predictionHistory, cacheExpiryMinutes } = get();
          return predictionHistory.filter(
            (item) => !isExpired(item.timestamp, cacheExpiryMinutes)
          );
        },

        getCachedSearch: (query: string) => {
          const { searchCache, cacheExpiryMinutes } = get();
          const cached = searchCache.find(
            (item) =>
              item.query === query &&
              !isExpired(item.timestamp, cacheExpiryMinutes)
          );
          return cached?.response || null;
        },

        getCachedDisease: (classId: string) => {
          const { diseaseCache, cacheExpiryMinutes } = get();
          const cached = diseaseCache[classId];
          if (cached && !isExpired(cached.timestamp, cacheExpiryMinutes)) {
            return cached;
          }
          return null;
        },

        // Utility methods
        clearError: () => {
          set({ error: null });
        },

        clearAllErrors: () => {
          set({
            error: null,
            predictionError: null,
            searchError: null,
            diseaseError: null,
            healthError: null,
          });
        },
      }),
      {
        name: "plant-disease-store",
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          baseUrl: state.baseUrl,
          predictionHistory: state.predictionHistory,
          searchCache: state.searchCache,
          diseaseCache: state.diseaseCache,
          cacheExpiryMinutes: state.cacheExpiryMinutes,
          maxCacheSize: state.maxCacheSize,
        }),
      }
    )
  )
);

// Selectors for optimized subscriptions
export const useIsLoading = () =>
  usePlantDiseaseStore(
    (state) =>
      state.isLoading ||
      state.isPredicting ||
      state.isSearching ||
      state.isFetchingDisease ||
      state.isCheckingHealth
  );

export const useHasErrors = () =>
  usePlantDiseaseStore(
    (state) =>
      !!(
        state.error ||
        state.predictionError ||
        state.searchError ||
        state.diseaseError ||
        state.healthError
      )
  );

export const useAllErrors = () =>
  usePlantDiseaseStore((state) => ({
    general: state.error,
    prediction: state.predictionError,
    search: state.searchError,
    disease: state.diseaseError,
    health: state.healthError,
  }));

// Network status hook
export const useNetworkStatus = () => {
  const isOnline = usePlantDiseaseStore((state) => state.isOnline);
  const setOnlineStatus = usePlantDiseaseStore(
    (state) => state.setOnlineStatus
  );

  return { isOnline, setOnlineStatus };
};
