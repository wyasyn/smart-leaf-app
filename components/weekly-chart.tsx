import { CHART_CONFIG, CHART_HEIGHT, SPACING } from "@/constants/constants";
import { historyStyles as styles } from "@/constants/historyStyles";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const WeeklyChart = React.memo(({ chartData }: { chartData: any }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>Weekly Activity</Text>
    <BarChart
      data={chartData}
      width={Dimensions.get("window").width - SPACING.XXXL}
      height={CHART_HEIGHT}
      chartConfig={CHART_CONFIG}
      style={styles.chart}
      yAxisLabel=""
      yAxisSuffix=""
      showValuesOnTopOfBars
    />
  </View>
));

WeeklyChart.displayName = "WeeklyChart";

export default WeeklyChart;
