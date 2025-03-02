import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, Share, Alert, Platform } from 'react-native';
import React, { useState } from 'react';
import MyText from './MyText';
import { useTheme } from '@react-navigation/native';
import { Icon } from '@rneui/base';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import Snackbar from 'react-native-snackbar';
import ResponsiveIcon from './ResponsiveIcon';

interface SavedSummaryProps {
  id: string;
  timeStamp: string;
  summary: string;
  userInput: string; 
  inputType:string;
  title: string;
  onDelete: (id: string) => void;
}

const SavedSummary = ({ id, timeStamp, summary, userInput, onDelete, title, inputType }: SavedSummaryProps) => {
  const { colors } = useTheme();

  const handleDelete = () => {
    onDelete(id);
  };

  const handleCopy = () => {
    Clipboard.setStringAsync(summary);
    if(Platform.OS === "ios"){
      Snackbar.show({
        text: 'Copied to clipboard',
        duration: 500
      });
    }
  };

  const handleExpand = () => {
    router.navigate({
      pathname:"/(saved)/[id]",
      params:{
        id:id,
        summary:summary.toString(),
        originalInput:userInput,
        inputType:inputType
       }
    })
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: summary,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <View style={[styles.con, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <MyText numberOfLines={1} fontSize='large' bold>{title}</MyText>
      <View style = {styles.topRow}>
        <Icon color={colors.primary}  name='calendar' type='feather' size={14} />
        <MyText bold fontSize='small' opacity={0.5} style={{marginVertical:"2%" }}>{timeStamp}</MyText>
      </View>
      <MyText numberOfLines={3}>{summary}</MyText>
      <View style={styles.bottomRow}>
          <ResponsiveIcon primary size={24} name='delete' onPress={handleDelete} />
          <ResponsiveIcon primary size={23} name="copy" type="ionicon" onPress={handleCopy} />
          <ResponsiveIcon primary size={23} name="share" type='ionicon' onPress={handleShare} />
          <ResponsiveIcon primary size={23} name="expand" type='ionicon' onPress={handleExpand} />
      </View>
    </View>
  );
};


export default SavedSummary;

const styles = StyleSheet.create({
  con: {
    borderWidth: 1,
    marginVertical: '2%',
    alignSelf: 'center',
    width: '92%',
    padding: '4%',
    paddingBottom: '5%',
    borderRadius:20
  },
  topRow:{
    flexDirection:"row",
    alignItems: 'center',
    gap:'2%'
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop:"3%",
    gap:"1%",
  },
});
