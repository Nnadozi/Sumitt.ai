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
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  
 useEffect(() => {
  async function prepareAds() {

    if (Platform.OS !== 'ios') {
      setupAds(); 
      return;
    }

    const { status } = await getTrackingPermissionsAsync();

    if (status === 'granted') {
      console.log(`Tracking already granted: ${status}`);
      setupAds();
    } else {
      const { status: newStatus } = await requestTrackingPermissionsAsync();
      console.log(`Tracking permission status: ${newStatus}`);
      if (newStatus === 'granted') {
        setupAds();
      }
    }
  }

  function setupAds() {
    mobileAds()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.T,
        tagForUnderAgeOfConsent: true,
      })
      .then(() => {
        console.log("Ad setup done!");
        mobileAds().initialize();
      });
  }

  prepareAds();
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
    <>
      <StatusBar style={resolvedTheme.dark ? 'light' : 'dark'} />
        <SafeAreaProvider>  
          <ThemeProvider value={resolvedTheme}>
            <Stack screenOptions={{ headerShown: false, gestureEnabled:false}} >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(input)" />
              <Stack.Screen name="(options)" />
              <Stack.Screen name="(summary)" />
            </Stack>
          </ThemeProvider>
        </SafeAreaProvider>
      <Toast />
    </>
  );
};
