import { CHART_CONFIG, CHART_HEIGHT, SPACING } from "@/constants/constants";
import { historyStyles as styles } from "@/constants/historyStyles";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { Bar, CartesianChart } from "victory-native";

type ChartDataPoint = {
  x: string;
  y: number;
};

const WeeklyChart = React.memo(({ chartData }: { chartData: any }) => {
  // Transform the data to match victory-native format
  const transformedData: ChartDataPoint[] =
    chartData?.datasets?.[0]?.data?.map((value: number, index: number) => ({
      x: chartData.labels[index],
      y: value,
    })) || [];

  return (
    <View
      style={[
        styles.chartContainer,
        {
          width: Dimensions.get("window").width - SPACING.XXXL,
          height: CHART_HEIGHT,
        },
      ]}
    >
      <Text style={styles.chartTitle}>Weekly Activity</Text>
      <CartesianChart<ChartDataPoint, "x", "y">
        data={transformedData}
        xKey="x"
        yKeys={["y"]}
      >
        {({ points, chartBounds }) => (
          <Bar
            points={points.y}
            chartBounds={chartBounds}
            color={CHART_CONFIG.color()}
            roundedCorners={{ topLeft: 4, topRight: 4 }}
          />
        )}
      </CartesianChart>
    </View>
  );
});

WeeklyChart.displayName = "WeeklyChart";

export default WeeklyChart;
