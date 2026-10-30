import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { ActivityIndicator, LogBox, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from "expo-status-bar";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";
import { colors } from "@/src/theme";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const [loaded] = useFonts({
    CG400: require("../assets/fonts/cormorant-garamond-400-normal.ttf"),
    CG500: require("../assets/fonts/cormorant-garamond-500-normal.ttf"),
    CG600: require("../assets/fonts/cormorant-garamond-600-normal.ttf"),
    CG400i: require("../assets/fonts/cormorant-garamond-400-italic.ttf"),
    CG500i: require("../assets/fonts/cormorant-garamond-500-italic.ttf"),
    Inter400: require("../assets/fonts/inter-400-normal.ttf"),
    Inter500: require("../assets/fonts/inter-500-normal.ttf"),
    Inter600: require("../assets/fonts/inter-600-normal.ttf"),
  });
  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <StatusBar style="dark" />
            {loaded ? (
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />
            ) : (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.brand} />
              </View>
            )}
          </KeyboardProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
});
