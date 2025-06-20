import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import "./utils/i18n";

export default function RootLayout() {
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS === "android") SplashScreen.hide();
  }, []);

  return (
    <AuthProvider>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: true }}>
          <Stack.Screen name="accueil" options={{ headerShown: false }} />
          <Stack.Screen
            name="index"
            options={{
              title: t("layout_artisans_title"),
            }}
          />
          <Stack.Screen
            name="Artisan"
            options={{ title: t("layout_artisan_title") }}
          />
          <Stack.Screen
            name="transport"
            options={{ title: t("layout_transport_title") }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}
