import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Page from '@/components/Page';
import MyButton from '@/components/MyButton';
import { router } from 'expo-router';
import MyText from '@/components/MyText';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from "expo-image-picker";
import { Image } from 'react-native';
import { Camera } from "expo-camera";

const image = () => {
  const { colors } = useTheme();
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setLoading(false);
    }, [])
  );

  const handleCancel = () => {
    setPreviewImage(null);
    setBase64Image(null);
    router.back();
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPreviewImage(result.assets[0].uri);
      setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`);
    } else {
      setPreviewImage(null);
      setBase64Image(null);
    }
  };

  const handlePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera access is required to take pictures.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPreviewImage(result.assets[0].uri);
      setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`);
    } else {
      setPreviewImage(null);
      setBase64Image(null);
    }
  };

  const generateSummary = () => {
    if (!base64Image) {
      alert("Something went wrong with the image upload. Please try again.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      router.navigate({
        pathname: '/(summary)/summary',
        params: {
          userInput: base64Image,
          options: selectedOptions,
          inputType: "Image",
          uri: previewImage,
        },
      });
    }, 500);
  };

  return (
    <Page>
      <ScrollView contentContainerStyle={{paddingBottom:50, alignItems:"flex-start"}}>
      {previewImage !== null && (
        <Image 
            resizeMode='cover' 
            style={styles.previewImage} 
            source={{ uri: previewImage }}
          />
      )}

      {loading ? (
        <View style={styles.loadingText}>
          <MyText textAlign='center' bold>Please be patient</MyText>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
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
              title="Upload Image"
              iconName="upload"
              onPress={handleUpload}
              width="49%"
            />
            <MyButton
              title="Take Photo"
              iconName='camera'
              iconType='antdesign'
              onPress={handlePicture}
              width="49%"
            />
          </View>
          <View style={styles.buttonRow}>
            <MyButton
              title="Options"
              iconName="options"
              iconType="ionicon"
              onPress={() => router.navigate('/(options)/options')}
              width="49%"
            />
            <MyButton
              iconName="cancel"
              title="Cancel"
              onPress={handleCancel}
              width="49%"
            />
          </View>
          </>
        )}
      </ScrollView>
    </Page>
  );
};

export default image;

const styles = StyleSheet.create({
    buttonRow: {
      alignSelf: 'center',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: 10,
      width: "100%",
    },
  previewImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 4/3,
    borderRadius: 12,
  },
  loadingText: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
    gap: 10,
  },
});
