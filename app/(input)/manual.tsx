import { StyleSheet, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Page from '@/components/Page'
import MyText from '@/components/MyText'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect } from 'expo-router'
import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'

const Manual = () => {
  const [inputText, setInputText] = useState('');
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
      return () => setInputText(''); 
    }, [])
  );

  const handleCancel = () => {
    setInputText('');
    router.back();
  };

  const generateSummary = () => {
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
        onChangeText={setInputText}
        placeholder="Enter text"
        multiline
        maxLength={300000}
      />
      <MyButton
        disabled={!inputText}
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
