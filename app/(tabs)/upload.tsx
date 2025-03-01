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

const Upload = () => {
  const { colors } = useTheme();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSuccess, setUrlSuccess] = useState<string | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [manualInputWarning, setManualInputWarning] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)

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
      setLoading(false)
     }, [])
  );

  useEffect(() => {
    setInputText('');
  }, [selectedOption]);

  const handleSelectOption = (option: string) => {
    if (selectedOption !== option) {
      setSelectedOption(option);
      setInputText('');  
      setUrlError(null);
      setUrlSuccess(null);
      setManualInputWarning(null);
    }
  };

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
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/;

    if (selectedOption === 'Text' && urlPattern.test(text)) {
      setManualInputWarning('URLs are not allowed in manual input mode.');
      setInputText(' ');  
      return;
    } else {
      setManualInputWarning(null);
    }

    setInputText(text);
    setUrlError(null);
    setUrlSuccess(null);

    if (selectedOption === 'URL' && text.trim() !== '') {
      await validateUrlAndContent(text.trim());
    }
  };

  const handleCancel = () => {
    setSelectedOption(null);
    setInputText('');
    setPreviewImage(null)
    setUrlError(null);
    setUrlSuccess(null);
    setManualInputWarning(null);
    router.back();
  };

  const generateSummary = () => {
    if (selectedOption === 'URL' && urlError) return;
    let userInput = inputText;
  
    if (selectedOption === 'Image' && base64Image) {
      userInput = base64Image; 
      setLoading(true)
    }
  
    setTimeout(() => {
      router.navigate({
        pathname: '/(summary)/summary',
        params: { userInput, options: selectedOptions, inputType:selectedOption },
      });
    },500)
  };

  const handleUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 0.5,
      base64: true, 
    });
  
    if (!result.canceled && result.assets[0].base64) {
      setPreviewImage(result.assets[0].uri); 
      setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`); 
    }
  };
  
  const handlePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera access is required to take pictures.");
      return;
    }
  
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 0.5,
      base64: true, 
    });
  
    if (!result.canceled && result.assets[0].base64) {
      setPreviewImage(result.assets[0].uri);
      setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  return (
    <Page style={{ justifyContent: 'flex-start', alignItems: 'flex-start', margin: '5%' }}>
      <InputType
        name="Text"
        subtitle="Input text manually"
        selected={selectedOption === 'Text'}
        onPress={() => handleSelectOption('Text')}
      />
      <InputType
        name="Website URL"
        subtitle="Website or article URL"
        selected={selectedOption === 'URL'}
        onPress={() => handleSelectOption('URL')}
      />
      <InputType
        name="Image"
        subtitle="Take photo or upload image"
        selected={selectedOption === 'Image'}
        onPress={() => handleSelectOption('Image')}
      />
      {selectedOption ? (
        selectedOption === 'URL' ? (
          <>
            <MyInput 
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Paste URL"
              textAlignVertical="top"
            />
            <MyText
              fontSize="small"
              style={{
                margin: '2%',
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
          </>
        ) : selectedOption === "Text" ? (
          <>
            <MyInput
              height="38%"
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Enter text"
              multiline
              maxLength={300000}
            />
            {manualInputWarning && (
              <MyText fontSize="small" style={{ color: 'red', margin: '2%', marginBottom: "0%" }}>
                {manualInputWarning}
              </MyText>
            )}
            <View style={styles.buttonRow}>
              <MyButton
                disabled={!inputText}
                title="Summarize"
                onPress={generateSummary}
                width="100%"
                iconName="summarize"
              />
            </View>
            <View style={styles.buttonRow}>
              <MyButton
                title="Options" iconName="options" iconType="ionicon"
                onPress={() => router.navigate('/(options)/options')}
                width="49%"
              />
              <MyButton iconName="cancel" title="Cancel" onPress={handleCancel} width="49%" />
            </View>
          </>
        ):(
            <>
            {previewImage !== null && (
              <Image resizeMode='contain' style = {styles.previewImage} source={{uri:previewImage}} />
            )}
            {loading === true ? (
              <View style = {styles.loadingText}>
                <MyText bold fontSize='large'>Loading</MyText>
                <ActivityIndicator size={'large'} color={colors.primary} />
              </View>
            ):(
              <>
              <View style={styles.buttonRow}>
                <MyButton
                  title="Upload Image" iconName="upload"
                  onPress={handleUpload}
                  width="49%"
                />
                <MyButton title="Take Photo" iconName='camera' iconType='antdesign' onPress={handlePicture} width="49%" />
              </View>
              <View style={styles.buttonRow}>
                <MyButton
                  disabled={!previewImage}
                  title="Summarize"
                  onPress={generateSummary}
                  width="100%"
                  iconName="summarize"
                />
              </View>
              <View style={styles.buttonRow}>
                <MyButton
                  title="Options" iconName="options" iconType="ionicon"
                  onPress={() => router.navigate('/(options)/options')}
                  width="49%"
                />
                <MyButton iconName="cancel" title="Cancel" onPress={handleCancel} width="49%" />
              </View>
            </>
            )}
            </>
        )
      ) : (
        <>
          <MyButton iconName="cancel" title="Cancel" onPress={handleCancel} width="100%" marginVertical="2%" />
          <MyText style={{ marginTop: '2%', opacity: 0.5 }} fontSize="small">*Note: AI output may not always be correct*</MyText>
        </>
      )}
    </Page>
  );
};

export default Upload;

const styles = StyleSheet.create({
  buttonRow: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: '3%',
    gap: '2%',
  },
  previewImage:{
    width:"100%",
    height:"42.5%",
    alignSelf:"center",
  },
  loadingText:{
    flexDirection:"row",
    justifyContent: 'space-evenly',
    alignItems: 'center',
    alignSelf: 'center',
    gap:'5%',
    marginTop:"5%"
  }
});
