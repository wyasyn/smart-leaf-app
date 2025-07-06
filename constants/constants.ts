// Constants
export const COLORS = {
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

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 40,
} as const;

export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
} as const;

export const MIN_TOUCH_TARGET = 44;
export const IMAGE_HEIGHT = 150;
export const CHART_HEIGHT = 180;

export const CHART_CONFIG = {
  backgroundGradientFrom: COLORS.WHITE,
  backgroundGradientTo: COLORS.WHITE,
  color: (opacity = 1) => `rgba(229, 0, 70, ${opacity})`,
  labelColor: () => COLORS.GRAY_400,
  barPercentage: 0.7,
  decimalPlaces: 0,
} as const;
