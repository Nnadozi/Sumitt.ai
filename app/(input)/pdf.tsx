import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Page from '@/components/Page'
import MyButton from '@/components/MyButton'
import { router, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as DocumentPicker from "expo-document-picker"

const pdf = () => {
  const[pdf, setPDF] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null);

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

  const generateSummary = () => {
    router.navigate({
        pathname: '/(summary)/summary',
        params: { userInput:pdf, options: selectedOptions, inputType:"Text" },
    });
  };

  const selectPDF = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
            copyToCacheDirectory: false,
            multiple:false
        });

        if (result.canceled) {
            console.log("User canceled document selection");
            return;
        }

        setPDF(result.assets[0]);
        console.log("Selected PDF:", pdf);
    } catch (error) {
        console.error("Error selecting PDF:", error);
    }
};

  const handleCancel = () => {
      setPDF(null)
      router.back();
  };
  
  return (
    <Page style={{justifyContent:"flex-start", alignItems:"center", padding:"5%"}}>
        <MyButton
            disabled={!pdf}
            title="Summarize"
            onPress={generateSummary}
            width="100%"
            iconName="summarize"
            marginTop='3%'
        />
        <MyButton
            title="Select PDF"
            onPress={selectPDF}
            width="100%"
            iconName="pdffile1"
            iconType='antdesign'
            marginTop='3%'
        />
        <View style={styles.buttonRow}>
            <MyButton
                title="Options" iconName="options" iconType="ionicon"
                onPress={() => router.navigate('/(options)/options')}
                width="49%"
            />
            <MyButton iconName="cancel" title="Cancel" onPress={handleCancel} width="49%" />
        </View>
    </Page>
  )
}

export default pdf
const styles = StyleSheet.create({
  buttonRow: {
      alignSelf: 'center',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: 10,
      gap: 10,
      width: "100%",
  },
})