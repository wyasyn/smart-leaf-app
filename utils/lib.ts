export interface RecentScan {
  id: string;
  predicted_class: string;
  clean_class_name: string;
  confidence: number;
  confidence_level: "High" | "Medium" | "Low";
  disease_info: DiseaseInfo;
  scanned_image_uri: string; // Local URI of the scanned image
  timestamp: string; // ISO date string
  recommendations: string[];
  created_at?: Date; // For local processing
}

interface DiseaseInfo {
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
  external_resources: { [key: string]: string }[];
}

export interface PredictionResponse {
  success: boolean;
  predicted_class: string;
  clean_class_name: string;
  confidence: number;
  confidence_level: "High" | "Medium" | "Low";
  all_predictions: { [key: string]: number };
  disease_info: DiseaseInfo;
  recommendations: string[];
  message: string;
}

// Recent Scan interface matching API prediction response

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  type: "plant" | "disease";
}

export interface HomeScreenProps {
  navigation: any;
  isOffline?: boolean;
  recentScans?: RecentScan[];
}

// Helper function to get confidence badge color
export const getConfidenceBadgeColor = (confidenceLevel: string) => {
  switch (confidenceLevel) {
    case "High":
      return { backgroundColor: "#E8F5E8", color: "#2C5530" };
    case "Medium":
      return { backgroundColor: "#FFF3E0", color: "#E65100" };
    case "Low":
      return { backgroundColor: "#FCE4EC", color: "#C2185B" };
    default:
      return { backgroundColor: "#F5F5F5", color: "#666" };
  }
};

// Helper function to format timestamp to relative time
export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const scanTime = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - scanTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

  return scanTime.toLocaleDateString();
};

// Helper function to get severity color based on risk level and confidence
export const getSeverityColor = (
  riskLevel: string,
  confidenceLevel: string
) => {
  if (confidenceLevel === "Low") return "#999"; // Gray for low confidence

  switch (riskLevel.toLowerCase()) {
    case "high":
      return "#FF4444";
    case "medium":
      return "#FF8800";
    case "low":
      return "#44AA44";
    default:
      return "#666";
  }
};
