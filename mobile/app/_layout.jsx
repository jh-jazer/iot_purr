import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, LogBox } from "react-native";

LogBox.ignoreLogs([
  "props.pointerEvents is deprecated. Use style.pointerEvents",
]);

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const { checkAuth, user, token } = useAuthStore();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 🔹 Step 1: Check auth once
  useEffect(() => {
    const runAuthCheck = async () => {
      await checkAuth(); // ensure it resolves before continuing
      setIsCheckingAuth(false);
    };
    runAuthCheck();
  }, []);

  // 🔹 Step 2: Navigate when router + auth are ready
  useEffect(() => {
    if (!rootNavigationState?.key || isCheckingAuth) return; // wait!

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, token, segments, rootNavigationState, isCheckingAuth]);

  // 🔹 Step 3: Show loading screen while initializing
  if (!rootNavigationState?.key || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🔹 Step 4: Render navigator normally
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
