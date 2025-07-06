import ErrorBoundary, {
  HistoryErrorFallback,
} from "@/components/ErrorBoundary";
import HistoryScreen from "@/components/screens/history-screen";
import React from "react";

const History = () => {
  return (
    <ErrorBoundary fallback={HistoryErrorFallback}>
      <HistoryScreen />
    </ErrorBoundary>
  );
};

export default History;
