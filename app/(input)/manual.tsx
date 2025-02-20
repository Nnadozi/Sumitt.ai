import { StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Page from '@/components/Page';
import MyText from '@/components/MyText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import MyInput from '@/components/MyInput';
import { useTheme } from '@react-navigation/native';
import MyButton from '@/components/MyButton';

const Manual = () => {
  const [inputText, setInputText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const { colors } = useTheme();

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

  const handleInputChange = (text: string) => {
    const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
    if (urlPattern.test(text)) {
      setInputError('URLs are not allowed. Please enter plain text.');
    } else {
      setInputError(null);
      setInputText(text);
    }
  };

  const handleCancel = () => {
    setInputText('');
    setInputError(null);
    router.back();
  };

  const generateSummary = () => {
    if (inputError) return;
    router.navigate({
      pathname: '/(summary)/summary',
      params: { userInput: inputText, options: selectedOptions },
    });
  };

  return (
    <Page style={{ justifyContent: 'flex-start', alignItems: 'flex-start', margin: '5%' }}>
      <MyInput
        height="65%"
        value={inputText}
        onChangeText={handleInputChange}
        placeholder="Enter text"
        multiline
        maxLength={300000}
      />
      {inputError && (
        <MyText fontSize="small" style={{ color: 'red', marginVertical: '2%' }}>
          {inputError}
        </MyText>
      )}
      <MyButton
        disabled={!inputText || !!inputError}
        title="Summarize"
        onPress={generateSummary}
        width="100%"
        iconName="summarize"
        marginTop="3%"
      />
      <View style={styles.buttonRow}>
        <MyButton
          title="Options"
          iconName="options"
          iconType="ionicon"
          onPress={() => router.navigate('/(options)/options')}
          width="49%"
        />
        <MyButton iconName="cancel" title="Cancel" onPress={handleCancel} width="49%" />
      </View>
    </Page>
  );
};

export default Manual;

const styles = StyleSheet.create({
  buttonRow: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: '3%',
    gap: '2%',
  },
});
