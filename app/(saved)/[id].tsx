import { Alert, Button, Platform, ScrollView, Share, StyleSheet, View, } from 'react-native'
import React from 'react'
import Page from '@/components/Page'
import MyText from '@/components/MyText'
import { router, useLocalSearchParams } from 'expo-router'
import { Divider } from '@rneui/base'
import { Icon } from '@rneui/base'
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native'
import MyButton from '@/components/MyButton'
import Snackbar from 'react-native-snackbar'

const SavedSummaryScreen = () => {
  const {summary} = useLocalSearchParams()
  const {colors} = useTheme()

  const handleCopy = () => {
      Clipboard.setStringAsync(summary.toString());
      if(Platform.OS === "ios"){
        Snackbar.show({
          text: 'Copied to clipboard',
          duration: Snackbar.LENGTH_SHORT,
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
    <Page style={{justifyContent:"flex-start", padding:'5%'}}>
      <ScrollView style = {styles.scrollContainer}>
        <MyText markdown>{summary}</MyText>
      </ScrollView>
      <View style = {styles.bottomRow}>
        <View style = {{ flexDirection: 'row', gap:'2%'}}>
          <Icon size={30} color={colors.primary} name="copy" type="ionicon"  onPress={handleCopy} />
          <Icon size={30} color={colors.primary} name="share" type='ionicon' onPress={handleShare} />
        </View>
        {Platform.OS === "ios" && (
            <Button title='Back' onPress={router.back} color={colors.primary} />
          )}
      </View>
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
    alignItems:"flex-end",
    marginVertical:"1%",
    flexDirection:"row-reverse",
    justifyContent:"space-between"
  }
})



