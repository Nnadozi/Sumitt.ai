import { Stack } from "expo-router";

export default function OptionsNavigator() {
    return(
        <Stack screenOptions={{headerTitleAlign:"center", gestureEnabled:false}}>
            <Stack.Screen name="options" options={{title:"Options",headerBackVisible:false}}/>
        </Stack>
    )
}