import { CHART_CONFIG, CHART_HEIGHT, SPACING } from "@/constants/constants";
import { historyStyles as styles } from "@/constants/historyStyles";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";

const WeeklyChart = React.memo(({ chartData }: { chartData: any }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>Weekly Activity</Text>
    <VictoryChart
      theme={VictoryTheme.material}
      width={Dimensions.get("window").width - SPACING.XXXL}
      height={CHART_HEIGHT}
      padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
    >
      <VictoryBar
        data={chartData?.datasets?.[0]?.data?.map((value: number, index: number) => ({
          x: chartData.labels[index],
          y: value
        })) || []}
        style={{
          data: { fill: CHART_CONFIG.color() }
        }}
      />
    </VictoryChart>
  </View>
));

WeeklyChart.displayName = "WeeklyChart";

export default WeeklyChart;
