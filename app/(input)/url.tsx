import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Page from '@/components/Page';
import InputType from '@/components/InputType';
import MyButton from '@/components/MyButton';
import { router } from 'expo-router';
import MyInput from '@/components/MyInput';
import MyText from '@/components/MyText';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from "expo-image-picker"
import { Image } from 'react-native';
import { Camera } from "expo-camera";

const url = () => {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSuccess, setUrlSuccess] = useState<string | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);

  const fetchOptions = async () => {
    try {
      const storedOptions = await AsyncStorage.getItem('summaryOptions');
      if (storedOptions) setSelectedOptions(storedOptions);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useFocusEffect(
    useCallback(() => { 
      fetchOptions();
     }, [])
  );

  const validateUrlAndContent = async (url: string) => {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/;
    const isVideoUrl = /(?:youtube|youtu.be|vimeo|dailymotion|twitch)/i.test(url);
    
    if (isVideoUrl) {
      setUrlError('Video links are not supported.');
      setUrlSuccess(null);
      return;
    }
    if (!urlPattern.test(url)) {
      setUrlError('Invalid URL format.');
      setUrlSuccess(null);
      return;
    }

    try {
      setIsCheckingUrl(true);
      setUrlError(null);
      setUrlSuccess(null);

      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('Content-Type');

      if (!contentType || !contentType.includes('text/html')) {
        setUrlError('The URL does not lead to a readable webpage.');
        return;
      }

      setUrlSuccess('Valid webpage detected.');
    } catch (error) {
      console.error('Error validating URL:', error);
      setUrlError('Could not reach the website.');
    } finally {
      setIsCheckingUrl(false);
    }
  };

  const handleInputChange = async (text: string) => {
    setInputText(text);
    setUrlError(null);
    setUrlSuccess(null);
    if (text.trim() !== '') {
      await validateUrlAndContent(text.trim());
    }
  };

  const handleCancel = () => {
    setInputText('');
    setUrlError(null);
    setUrlSuccess(null);
    router.back();
  };

  const generateSummary = () => {
    if ( urlError) return;
    router.navigate({
     pathname: '/(summary)/summary',
     params: { userInput:inputText, options: selectedOptions, inputType:"URL" },
    });
  };


  return (
    <Page style={{ alignItems: "flex-start", justifyContent: "flex-start", padding: "5%",}}>
            <MyInput 
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Paste URL"
              textAlignVertical="top"
            />
            <MyText
              fontSize="small"
              style={{
                margin: 10,
                color: urlError ? 'red' : urlSuccess ? colors.primary : colors.text,
              }}
            >
              {urlError ? urlError : urlSuccess ? urlSuccess : isCheckingUrl ? 'Checking URL...' : 'Please enter a valid URL containing readable text.'}
            </MyText>
            <MyButton
              disabled={!inputText || !!urlError || isCheckingUrl}
              title="Summarize"
              onPress={generateSummary}
              width="100%"
              iconName="summarize"
            />
            <View style={styles.buttonRow}>
              <MyButton iconName="options" iconType="ionicon" title="Options" onPress={() => router.navigate('/(options)/options')} width="49%" />
              <MyButton iconName="cancel" title="Cancel" onPress={handleCancel} width="49%" />
            </View>
    </Page>
  )
}

export default url

const styles = StyleSheet.create({
  buttonRow: {
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
    width: "100%",
  },
})