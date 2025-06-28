import AsyncStorage from "@react-native-async-storage/async-storage";

// Type definitions
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
  external_resources: { name: string; url: string }[];
}

export interface PredictionResponse {
  success: boolean;
  predicted_class: string;
  clean_class_name: string;
  confidence: number;
  confidence_level: string;
  all_predictions: Record<string, number>;
  disease_info: DiseaseInfo;
  recommendations: string[];
  message: string;
}

export interface ScanHistoryItem {
  id: string;
  date: string;
  timestamp: number;
  image_uri: string;
  prediction_data: PredictionResponse;
}

const HISTORY_STORAGE_KEY = "@scan_history";
const MAX_HISTORY_ITEMS = 100;

export class ScanHistoryManager {
  /**
   * Save a scan result to history
   */
  static async saveScan(
    predictionData: PredictionResponse,
    imageUri: string
  ): Promise<boolean> {
    try {
      const existingHistory = await this.getHistory();

      const newScan: ScanHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        timestamp: Date.now(),
        image_uri: imageUri,
        prediction_data: predictionData,
      };

      // Add new scan to the beginning of the array
      existingHistory.unshift(newScan);

      // Keep only the latest items to prevent storage bloat
      const trimmedHistory = existingHistory.slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(trimmedHistory)
      );
      return true;
    } catch (error) {
      console.error("Failed to save scan to history:", error);
      return false;
    }
  }

  /**
   * Get all scan history
   */
  static async getHistory(): Promise<ScanHistoryItem[]> {
    try {
      const history = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      return history
        ? JSON.parse(history).sort(
            (a: ScanHistoryItem, b: ScanHistoryItem) =>
              b.timestamp - a.timestamp
          )
        : [];
    } catch (error) {
      console.error("Failed to retrieve scan history:", error);
      return [];
    }
  }

  /**
   * Get a specific scan by ID
   */
  static async getScanById(id: string): Promise<ScanHistoryItem | null> {
    try {
      const history = await this.getHistory();
      return history.find((scan) => scan.id === id) || null;
    } catch (error) {
      console.error("Failed to retrieve scan by ID:", error);
      return null;
    }
  }

  /**
   * Delete a scan from history
   */
  static async deleteScan(id: string): Promise<boolean> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter((scan) => scan.id !== id);
      await AsyncStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(updatedHistory)
      );
      return true;
    } catch (error) {
      console.error("Failed to delete scan:", error);
      return false;
    }
  }

  /**
   * Clear all scan history
   */
  static async clearHistory(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear history:", error);
      return false;
    }
  }

  /**
   * Get history statistics
   */
  static async getHistoryStats(): Promise<{
    totalScans: number;
    latestScanDate: string | null;
    mostCommonDisease: string | null;
  }> {
    try {
      const history = await this.getHistory();

      const totalScans = history.length;

      const latestScanDate = totalScans > 0 ? history[0].date : null;

      const diseaseCount: Record<string, number> = {};
      for (const item of history) {
        const disease = item.prediction_data.clean_class_name;
        diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
      }

      let mostCommonDisease: string | null = null;
      let maxCount = 0;
      for (const [disease, count] of Object.entries(diseaseCount)) {
        if (count > maxCount) {
          mostCommonDisease = disease;
          maxCount = count;
        }
      }

      return {
        totalScans,
        latestScanDate,
        mostCommonDisease,
      };
    } catch (error) {
      console.error("Failed to get history stats:", error);
      return {
        totalScans: 0,
        latestScanDate: null,
        mostCommonDisease: null,
      };
    }
  }
}
