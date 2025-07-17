import { ActivityIndicator, ScrollView, StyleSheet, View, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import Page from '@/components/Page';
import MyButton from '@/components/MyButton';
import { router, useFocusEffect } from 'expo-router';
import MyText from '@/components/MyText';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import ResponsiveIcon from '@/components/ResponsiveIcon';

const PDFInput = () => {
  const { colors } = useTheme();
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [base64PDF, setBase64PDF] = useState<string | null>(null);
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
    setSelectedFile(null);
    setBase64PDF(null);
    router.back();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (limit to 10MB for processing)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            'Please select a PDF file smaller than 10MB for processing.',
            [{ text: 'OK' }]
          );
          return;
        }

        setSelectedFile(file);
        
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        setBase64PDF(`data:application/pdf;base64,${base64}`);
        console.log('Selected PDF:', file.name, 'Size:', file.size);
      } else {
        setSelectedFile(null);
        setBase64PDF(null);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select PDF file. Please try again.');
      setSelectedFile(null);
      setBase64PDF(null);
    }
  };

  const generateSummary = () => {
    if (!base64PDF) {
      Alert.alert('No File Selected', 'Please select a PDF file first.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      router.navigate({
        pathname: '/(summary)/summary',
        params: {
          userInput: base64PDF,
          options: selectedOptions,
          inputType: 'PDF',
        },
      });
    }, 500);
  };

  return (
    <Page>
      <ScrollView contentContainerStyle={{paddingBottom:50, alignItems:"flex-start"}}>
      {selectedFile !== null && (
        <View style={styles.previewContainer}>
          <ResponsiveIcon name="pdffile1" type="antdesign" size={50} color={colors.primary} />
          <MyText style={{marginTop:10}} bold numberOfLines={1}>{selectedFile.name}</MyText>
          <MyText  gray>
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </MyText>
        </View>
      )}

      {loading ? (
         <View style={styles.loadingText}>
         <MyText textAlign='center' >Please be patient</MyText>
         <ActivityIndicator color={colors.primary} />
       </View>
      ) : (
        <>
          <View style={[styles.buttonRow, {marginTop:0}]}>
            <MyButton
              disabled={!selectedFile}
              title="Summarize"
              onPress={generateSummary}
              width="100%"
              iconName="summarize"
            />
          </View>
          <View style={styles.buttonRow}>
            <MyButton
              title="Upload PDF"
              iconName="upload"
              onPress={pickDocument}
              width="100%"
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

export default PDFInput;

const styles = StyleSheet.create({
  buttonRow: {
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
    width: "100%",
  },
  previewContainer: {
    width: "100%",
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf:"center"
  },
  loadingText: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
    gap: 10,
  },
});