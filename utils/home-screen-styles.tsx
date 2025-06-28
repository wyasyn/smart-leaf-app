import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const stylesHome = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FDF8",
  },

  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#F8FDF8",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C5530",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Offline Indicator Styles
  offlineIndicator: {
    backgroundColor: "#FFE8E8",
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF4444",
  },
  offlineText: {
    fontSize: 14,
    color: "#C62828",
    textAlign: "center",
    fontWeight: "500",
  },

  settingsButton: {
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 25,
  },

  // Main Scan Button Styles
  mainScanButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scanIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 15,
  },
  scanButtonText: {
    flex: 1,
    marginLeft: 16,
  },
  scanButtonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  scanButtonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Quick Actions Styles
  quickActionsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C5530",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 16,
    columnGap: 16,
  },
  quickActionButton: {
    width: (width - 64) / 2,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  // Carousel Styles
  carouselContainer: {
    marginBottom: 30,
  },
  carouselHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  carousel: {
    paddingLeft: 20,
    paddingBottom: 24,
  },
  carouselContent: {
    paddingRight: 20,
  },
  carouselItem: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: "hidden",
  },
  carouselImageContainer: {
    position: "relative",
    height: 120,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E8F5E8",
  },
  carouselOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 20,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C5530",
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  carouselDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },

  // Recent Scans Styles (Updated)
  recentScansContainer: {
    marginHorizontal: 20,
    marginBottom: 150,
  },
  recentScansHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recentScansList: {
    gap: 12,
  },
  recentScanItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scanImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  scanImage: {
    width: "100%",
    height: "100%",
  },
  scanDetails: {
    flex: 1,
  },
  scanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  scanPlantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C5530",
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  scanDisease: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  scanDate: {
    fontSize: 12,
    color: "#999",
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
});
