import { Alert, ScrollView, Share, StyleSheet, View, } from 'react-native'
import React from 'react'
import Page from '@/components/Page'
import MyText from '@/components/MyText'
import { router, useLocalSearchParams } from 'expo-router'
import { Divider } from '@rneui/base'
import { Icon } from '@rneui/base'
import * as Clipboard from 'expo-clipboard';
import * as Speech from "expo-speech"
import { useTheme } from '@react-navigation/native'

const SavedSummaryScreen = () => {
  const {summary} = useLocalSearchParams()
  const {colors} = useTheme()

  const handleCopy = () => {
      Clipboard.setStringAsync(summary.toString());
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

  const handleSpeak = () => {
    Speech.speak(summary.toString())
  };
  

  return (
    <Page style={{justifyContent:"flex-start", padding:'5%'}}>
      <Divider width={5}/>
      <ScrollView style = {styles.scrollContainer}>
        <MyText markdown>{summary}</MyText>
      </ScrollView>
      <View style = {styles.iconRow}>
        <Icon size={30} color={colors.primary} name="copy" type="ionicon"  onPress={handleCopy} />
        <Icon size={30} color={colors.primary} name="share" type='ionicon' onPress={handleShare} />
        <Icon size={30} color={colors.primary} name="volume-2" type='feather' onPress={handleSpeak} />
      </View>
    </Page>
  )
}

export default SavedSummaryScreen

const styles = StyleSheet.create({
  scrollContainer:{
    marginBottom: "1%",
  },
  iconRow: {
    alignSelf:"flex-end",
    flexDirection: 'row',
    gap:"3%",
    margin:"2%"
  },
})



