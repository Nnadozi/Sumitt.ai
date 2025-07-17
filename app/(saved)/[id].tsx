import { Alert, Button, Linking, Platform, SafeAreaView, ScrollView, Share, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import Page from '@/components/Page';
import MyText from '@/components/MyText';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native';
import MyButton from '@/components/MyButton';
import Snackbar from 'react-native-snackbar';
import ResponsiveIcon from '@/components/ResponsiveIcon';

const SavedSummaryScreen = () => {
  const { summary, originalInput, inputType, id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [showOriginal, setShowOriginal] = useState(false);

  const handleCopy = () => {
    Clipboard.setStringAsync(summary.toString());
    if (Platform.OS === 'ios') {
      Snackbar.show({
        text: 'Copied to clipboard',
        duration: 500,
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: summary.toString(),
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this summary?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(id.toString());
              router.back();
            } catch (error) {
              console.error("Error deleting summary:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <Page style={{ justifyContent: 'flex-start' }}>
      <ScrollView persistentScrollbar style={styles.scrollContainer}>
        <MyText markdown>{summary}</MyText>
        <TouchableOpacity style={styles.viewPrompt} onPress={() => setShowOriginal(!showOriginal)}>
          <>
            <MyText fontSize='small' bold color={colors.primary}>
              {showOriginal ? 'Hide Original Input' : 'View Original Input'}
            </MyText>
            <ResponsiveIcon primary size={10} type="antdesign" name={showOriginal ? 'caretup' : 'caretdown'} />
          </>
        </TouchableOpacity>
        {showOriginal && (
          inputType === 'URL' ? (
            <TouchableOpacity>
              <MyText fontSize='small' color="#5495ff" onPress={() => Linking.openURL(originalInput.toString())}>
                {originalInput}
              </MyText>      
            </TouchableOpacity>
          ) : (
            inputType === 'Text' ? (
                <MyText fontSize='small'>{originalInput}</MyText>
            ) : (
              <ScrollView>
                <Image source={{ uri: originalInput.toString() }} resizeMode='contain' style={styles.previewImage} />
              </ScrollView>
            )
          )
        )}
      </ScrollView>
      <View style={[styles.iconRow,{backgroundColor:colors.card,borderRadius:20,borderWidth:1,borderColor:colors.border}]}>
        <ResponsiveIcon primary size={27} name="arrowleft" type='antdesign' onPress={router.back} />
        <ResponsiveIcon primary size={30} name="delete" onPress={handleDelete} />
        <ResponsiveIcon primary size={27} name="copy" type="ionicon" onPress={handleCopy} />
        <ResponsiveIcon primary size={27} name="share" type="ionicon" onPress={handleShare} />
      </View>
    </Page>
  );
};

export default SavedSummaryScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    marginBottom: '2%',
  },
  iconRow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: 5,
    padding: 10,
    zIndex: 1000,
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 1000,
  },
  viewPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 5,
  },
  previewImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 4/3,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
});
