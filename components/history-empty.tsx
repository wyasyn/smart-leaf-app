import { COLORS } from "@/constants/constants";
import { historyStyles as styles } from "@/constants/historyStyles";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const EmptyState = React.memo(() => (
  <View style={styles.emptyContainer}>
    <MaterialIcons
      name="history"
      size={64}
      color={COLORS.GRAY_100}
      accessible={false}
    />
    <Text style={styles.emptyTitle}>No Predictions Yet</Text>
    <Text style={styles.emptySubtitle}>
      Start scanning plants to build your prediction history
    </Text>
  </View>
));

EmptyState.displayName = "EmptyState";
export default EmptyState;
