import { router, Stack, useLocalSearchParams } from "expo-router";
import { Icon } from "@rneui/base";
import React from "react";

export default function InputNavigator() {
  return (
    <Stack screenOptions={{gestureEnabled:false, headerTitleAlign:"center",headerBackVisible:false}}>
        <Stack.Screen name="text" options={{title:"Text Input"}}/>
        <Stack.Screen name="url" options={{title:"Website URL Input"}}/>
        <Stack.Screen name="image" options={{title:"Image Input"}}/>
        <Stack.Screen name="pdf" options={{title:"PDF Input"}}/>
    </Stack>
  );
}
