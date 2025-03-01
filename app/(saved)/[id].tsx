import { Alert, Button, Platform, SafeAreaView, ScrollView, Share, StyleSheet, View, } from 'react-native'
import React, { useEffect } from 'react'
import Page from '@/components/Page'
import MyText from '@/components/MyText'
import { router, useLocalSearchParams } from 'expo-router'
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native'
import MyButton from '@/components/MyButton'
import Snackbar from 'react-native-snackbar'
import ResponsiveIcon from '@/components/ResponsiveIcon'

const SavedSummaryScreen = () => {
  const {summary,originalInput} = useLocalSearchParams()
  const {colors} = useTheme()

  const handleCopy = () => {
      Clipboard.setStringAsync(summary.toString());
      if(Platform.OS === "ios"){
        Snackbar.show({
          text: 'Copied to clipboard',
          duration: 500,
        });
      }
  };
  
  const handleShare = async () => {
      try {
        const result = await Share.share({
          message: summary.toString(),
        });
      } catch (error: any) {
        Alert.alert(error.message);
      }
  };
  
  return (
    <Page style={{justifyContent:"flex-start", padding:'4%'}}>
      <ScrollView persistentScrollbar style = {styles.scrollContainer}>
        <MyText markdown>{summary}</MyText>
        <MyText>Original: {originalInput}</MyText>
      </ScrollView>
      <SafeAreaView style = {styles.bottomRow}>
          <View style = {styles.iconRow}>
            <ResponsiveIcon primary size={30} name="copy" type="ionicon" onPress={handleCopy} />
            <ResponsiveIcon primary size={30} name='share' type="ionicon" onPress={handleShare} />
          </View>
          {Platform.OS === "ios" && (
              <Button title='Back' onPress={router.back} color={colors.primary} />
            )}
      </SafeAreaView>
    </Page>
  )
}

export default SavedSummaryScreen

const styles = StyleSheet.create({
  scrollContainer:{
    marginBottom: "2%",
  },
  bottomRow:{
    width:"100%",
    alignItems:"center",
    flexDirection:"row-reverse",
    justifyContent:"space-between",
    marginVertical:"1%",
    alignSelf:"center",
  },
  iconRow:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-evenly",
    gap:"2%",
  }
})



