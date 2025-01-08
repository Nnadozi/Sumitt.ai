import { Alert, ScrollView, Share, StyleSheet, View, } from 'react-native'
import React from 'react'
import Page from '@/components/Page'
import MyText from '@/components/MyText'
import { router, useLocalSearchParams } from 'expo-router'
import { Divider } from '@rneui/base'
import { Icon } from '@rneui/base'
import * as Clipboard from 'expo-clipboard';
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

  return (
    <Page style={{justifyContent:"flex-start", padding:'5%'}}>
      <Divider width={5}/>
      <ScrollView style = {styles.scrollContainer}>
        <MyText markdown>{summary}</MyText>
      </ScrollView>
      <View style = {styles.iconRow}>
        <Icon size={30} color={colors.primary} name="copy" type="ionicon"  onPress={handleCopy} />
        <Icon size={30} color={colors.primary} name="share" type='ionicon' onPress={handleShare} />
      </View>
    </Page>
  )
}

export default SavedSummaryScreen

const styles = StyleSheet.create({
  scrollContainer:{
    marginBottom: "2%",
  },
  iconRow: {
    alignSelf:"flex-end",
    flexDirection: 'row',
    gap:"2%",
    margin:"2%"
  },
})



