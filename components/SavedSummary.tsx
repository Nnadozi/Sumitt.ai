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


  return (
    <TouchableOpacity activeOpacity={0.5} style={[styles.con, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={handleExpand}>
      <MyText numberOfLines={1} bold>{title}</MyText>
      <View style = {styles.topRow}>
        <Icon color={colors.primary}  name='calendar' type='feather' size={14} />
        <MyText fontSize='small' gray style={{marginVertical:7.5}}>{timeStamp}</MyText>
      </View>
      <View style={{flexDirection:"row",gap:5}}>
          <ResponsiveIcon primary size={23} name='delete' onPress={handleDelete} />
          <ResponsiveIcon primary size={23} name="expand" type='ionicon' onPress={handleExpand} />
      </View>
    </TouchableOpacity>
  );
};


export default SavedSummary;

const styles = StyleSheet.create({
  con: {
    borderWidth: 1,
    marginVertical:5,
    alignSelf: 'center',
    width: '100%',
    borderRadius:20,
    padding:20
  },
  topRow:{
    flexDirection:"row",
    alignItems: 'center',
    gap:7.5
  },
});
