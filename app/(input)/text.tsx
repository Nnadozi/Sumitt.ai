import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Page from '@/components/Page';
import MyButton from '@/components/MyButton';
import { router } from 'expo-router';
import MyInput from '@/components/MyInput';
import MyText from '@/components/MyText';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

const text = () => {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null);
  const [manualInputWarning, setManualInputWarning] = useState<string | null>(null);

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

  const handleInputChange = async (text: string) => {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/;

    if (urlPattern.test(text)) {
      setManualInputWarning('URLs are not allowed in manual input mode.');
      setInputText(' ');  
      return;
    } else {
      setManualInputWarning(null);
    }
    setInputText(text);
  };

  const handleCancel = () => {
    setInputText('');
    setManualInputWarning(null);
    router.back();
  };

  const generateSummary = () => {
    router.navigate({
        pathname: '/(summary)/summary',
        params: { userInput:inputText, options: selectedOptions, inputType:"Text" },
      });
  };



  return (
    <Page>
        <ScrollView contentContainerStyle={{paddingBottom:50, alignItems:"flex-start"}}>
            <MyInput
              height="50%"
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Enter text"
              multiline
              maxLength={200000}
              showLength
            />
              <MyButton
                disabled={!inputText}
                title="Summarize"
                onPress={generateSummary}
                width="100%"
                iconName="summarize"
              />
        
            <View style={styles.buttonRow}>
              <MyButton
                title="Options" iconName="options" iconType="ionicon"
                onPress={() => router.navigate('/(options)/options')}
                width="49%"
              />
              <MyButton iconName="cancel" title="Cancel" onPress={handleCancel} width="49%" />
            </View>
            {manualInputWarning && (
              <MyText textAlign="center" fontSize="small" style={{ color: 'red', margin: 10, }}>
                {manualInputWarning}
              </MyText>
            )}
      </ScrollView>
    </Page>
  )
}

export default text

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