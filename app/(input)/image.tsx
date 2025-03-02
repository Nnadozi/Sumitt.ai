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

const image = () => {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null);
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

  const handleInputChange = async (text: string) => {
    setInputText(text);
  };

  const handleCancel = () => {
    setInputText('');
    setPreviewImage(null)
    router.back();
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

  const generateSummary = () => {
    setLoading(true)
    setTimeout(() => {
      router.navigate({
        pathname: '/(summary)/summary',
        params: { userInput:base64Image, options: selectedOptions, inputType:"Image",uri:previewImage },
      });
    },500)
  };



  return (
    <Page style={{ alignItems: "flex-start", justifyContent: "flex-start", padding: "5%",}}>
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
    </Page>
  )
}

export default image

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
    alignSelf:"center",
    height: "70%",
    aspectRatio: 1, 
  },
  loadingText:{
    flexDirection:"row",
    justifyContent: 'space-evenly',
    alignItems: 'center',
    alignSelf: 'center',
    gap:'5%',
    marginTop:"3%"
  }
})