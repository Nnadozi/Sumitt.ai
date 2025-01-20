import { Stack } from "expo-router";

export default function OptionsNavigator() {
    return(
        <Stack screenOptions={{headerTitleAlign:"left", gestureEnabled:false}}>
            <Stack.Screen name="options" options={{title:"Options",headerBackVisible:false}}/>
        </Stack>
    )
}