import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { ThemeProvider } from "@react-navigation/native";
import { MyDarkTheme } from "@/constants/Colors";
import { useEffect } from "react";
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import React from "react";
import Constants from 'expo-constants';


export default function RootLayout() {
  useEffect(() => {
    async function prepareAds() {
      const { status } = await getTrackingPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await requestTrackingPermissionsAsync();
        console.log(`Tracking permission status: ${newStatus}`);
      } else {
        console.log(`Tracking already granted: ${status}`);
      }
      mobileAds()
        .setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.T,
          tagForUnderAgeOfConsent: true,
        })
        .then(() => {
          console.log("Ad setup done!");
        });
      mobileAds().initialize();
    }
    prepareAds();
    console.log(Constants.expoConfig?.extra?.fact);
  }, []);

  return (
    <SettingsProvider>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </SettingsProvider>
  );
}

const AppNavigator = () => {
  const { resolvedTheme } = useSettings();

  return (
    <ThemeProvider value={resolvedTheme}>
      <StatusBar style={resolvedTheme === MyDarkTheme ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, gestureEnabled:false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(options)" />
        <Stack.Screen name="(summary)" />
      </Stack>
    </ThemeProvider>
  );
};
