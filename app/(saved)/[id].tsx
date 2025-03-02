import { Alert, Button, Linking, Platform, SafeAreaView, ScrollView, Share, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
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
  const { summary, originalInput, inputType } = useLocalSearchParams();
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

  return (
    <Page style={{ justifyContent: 'flex-start', padding: '4%' }}>
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
              <ScrollView contentContainerStyle={styles.imageContainer}>
                <Image source={{ uri: originalInput }} resizeMode='contain' style={styles.previewImage} />
              </ScrollView>
            )
          )
        )}
      </ScrollView>
      <SafeAreaView style={styles.bottomRow}>
        <View style={styles.iconRow}>
          <ResponsiveIcon primary size={30} name="copy" type="ionicon" onPress={handleCopy} />
          <ResponsiveIcon primary size={30} name="share" type="ionicon" onPress={handleShare} />
        </View>
        {Platform.OS === 'ios' && <Button title="Back" onPress={router.back} color={colors.primary} />}
      </SafeAreaView>
    </Page>
  );
};

export default SavedSummaryScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    marginBottom: '2%',
  },
  bottomRow: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: '1%',
    alignSelf: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: '2%',
  },
  viewPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: '1%',
    marginTop: "3%",
  },
  previewImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1, 
    alignSelf: 'center',
    marginTop: "2%",
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
