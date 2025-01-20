import { router, Stack, useLocalSearchParams } from "expo-router";
import { Icon } from "@rneui/base";

export default function SavedNavigator() {
  const { id } = useLocalSearchParams();

  return (
    <Stack screenOptions={{gestureEnabled:false}}>
      <Stack.Screen name="[id]" options={{
          title: id, 
          headerTitleAlign:"center",
          headerBackVisible:false,
        }}
      />
    </Stack>
  );
}
