import { router, Stack, useLocalSearchParams } from "expo-router";
import { Icon } from "@rneui/base";

export default function SavedNavigator() {
  const { id } = useLocalSearchParams();

  return (
    <Stack screenOptions={{gestureEnabled:false, headerBackVisible:true}}>
      <Stack.Screen name="[id]" options={{title: id, headerTitleAlign:"center"}}/>
    </Stack>
  );
}
