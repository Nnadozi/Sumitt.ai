import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import { useSafeAreaInsets ,SafeAreaView} from 'react-native-safe-area-context'


interface PageProps {
    style?: ViewStyle,
    children?:React.ReactNode
}

const Page = (props:PageProps) => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style = {[styles.con, 
    {
      backgroundColor:useTheme().colors.background, 
      paddingTop:insets.top * 0.25,
      paddingBottom:insets.bottom * 0.25,
      paddingLeft:insets.top * 0.5,
      paddingRight:insets.top * 0.5
    }, 
    props.style]}>
        {props.children}
    </SafeAreaView>
  )
}

export default Page

const styles = StyleSheet.create({
    con:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
    }
})