import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { ThemeProvider } from "@react-navigation/native";
import { MyDarkTheme } from "@/constants/Colors";


export default function RootLayout() {
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(options)" />
        <Stack.Screen name="(summary)" />
      </Stack>
    </ThemeProvider>
  );
};
