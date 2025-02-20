import { router, Stack, useLocalSearchParams } from "expo-router";
import { Icon } from "@rneui/base";
import React from "react";

export default function InputNavigator() {

  return (
    <Stack screenOptions={{gestureEnabled:false,headerBackVisible:false}}>
      <Stack.Screen name="manual" options={{title:"Manual Input", headerTitleAlign:"center",headerBackVisible:false}}/>
      <Stack.Screen name="url"  options={{title:"Website URL Input", headerTitleAlign:"center",headerBackVisible:false}} />
    </Stack>
  );
}
