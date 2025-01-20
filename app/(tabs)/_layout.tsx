import { Tabs } from "expo-router";
import { Icon } from "@rneui/base";
import { useTheme } from "@react-navigation/native";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { TransitionPresets } from "@react-navigation/bottom-tabs";

export default function MainNavigator() {
  const { colors } = useTheme();
  const router = useRouter();

  const screenOptions = (name: string, title: string) => ({
    title,
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <Icon name={name} size={30} color={focused ? colors.primary : colors.border} />
    ),
  });

  return (
    <Tabs screenOptions={{ tabBarShowLabel: false, tabBarStyle: { paddingTop: "1%" }, headerTitleAlign:"center" }}>
      <Tabs.Screen name="index" options={screenOptions("history", "History")} />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Select Input Type",
          tabBarButton: () => (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center",marginBottom:"50%" }}>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: colors.primary }]}
              onPress={() => router.navigate("/upload")} 
            >
              <Icon name="add" size={25} color="#fff" />
            </TouchableOpacity>
            </View>
          ),
          tabBarStyle: { display:"none"}, 
          ...TransitionPresets.ShiftTransition,
        }}
      />
      <Tabs.Screen name="settings" options={screenOptions("settings", "Settings")} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 30, 
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
});
