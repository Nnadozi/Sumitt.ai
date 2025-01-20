import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Page from '@/components/Page';
import InputType from '@/components/InputType';
import MyButton from '@/components/MyButton';
import { router, useGlobalSearchParams } from 'expo-router';
import MyInput from '@/components/MyInput';
import MyText from '@/components/MyText';

const Upload = () => {
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null); 
  const [inputText, setInputText] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<string | string[] | null>(null); 

  const { options } = useGlobalSearchParams()
  useEffect(() => {
    if (options) {
      console.log(options)
      setSelectedOptions(options);
    }
  }, [options]);

  const handleSelectOption = (option: string) => {
    if (selectedOption !== option) {
      setSelectedOption(option);
    }
  };

  const handleCancel = () => {
    setSelectedOption(null);  
    setInputText('');        
    router.back();          
  };

  const generateSummary = async () => {
    if (selectedOption === "URL") {
      try {
        const url = inputText;

        const response = await fetch(url);
        const html = await response.text();

        const contentMatches = html.match(/<p[^>]*>(.*?)<\/p>|<h[1-6][^>]*>(.*?)<\/h[1-6]>|<li[^>]*>(.*?)<\/li>/g);

        if (contentMatches) {
          const pageContent = contentMatches
            .map((match) => {
              const cleanedText = match.replace(/<[^>]+>/g, '').trim();
              return cleanedText;
            })
            .filter(Boolean) 
            .join(' '); 

          router.navigate({
            pathname: "/(summary)/summary",
            params: { userInput: pageContent, options: selectedOptions }
          });
        } else {
          console.error('No relevant content found in the page');
        }
      } catch (error) {
        console.error('Error scraping content: ', error);
      }
    } else {
      router.navigate({
        pathname: "/(summary)/summary",
        params: { userInput: inputText, options: selectedOptions }
      });
    }
  };

  return (
    <Page style={{ justifyContent: 'flex-start', alignItems: "flex-start", margin: "5%" }}>
      <InputType name='Manual Input' subtitle='Input text manually' selected={selectedOption === 'Manual Input'} onPress={() => handleSelectOption('Manual Input')} />
      <InputType name='URL' subtitle='Input article URL' selected={selectedOption === 'URL'} onPress={() => handleSelectOption('URL')} />
      {selectedOption ? (
        selectedOption === "URL" ? (
          <>
            <MyInput height='7.5%' value={inputText} onChangeText={ text => setInputText(text)} placeholder="Enter URL" textAlignVertical='top' />
            <MyText opacity = {0.5} fontSize='small' style={{marginVertical:'2%'}}>
            Note: Please enter a valid URL containing readable text.
            </MyText>
            <View style = {styles.buttonRow}>
                <MyButton disabled = {!inputText} title='Summarize' onPress={generateSummary} width='30%' />
                <MyButton title='Options' onPress={ () => router.navigate("/(options)/options")} width='30%' />
                <MyButton title='Cancel' onPress={handleCancel} width='30%' />
            </View>
          </>
        ) : (
          <>
            <MyInput height='50%' value={inputText} onChangeText={ text => setInputText(text)} placeholder="Enter text" multiline maxLength={10000} />
            <View style = {styles.buttonRow}>
                <MyButton disabled = {!inputText} title='Summarize' onPress={generateSummary} width='50%' />
                <MyButton title='Options' onPress={ () => router.navigate("/(options)/options")} width='50%' />
            </View>
            <View style = {styles.buttonRow}>
              <MyButton title='Clear' onPress={() => setInputText('')} width='50%' />
              <MyButton title='Cancel' onPress={handleCancel} width='50%' />
            </View>
          </>
        )
      ) : (
        <MyButton title='Cancel' onPress={handleCancel} width="100%" marginVertical="3%" />
      )}
  </Page>
  );
};

export default Upload;

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderRadius:10,
    width: '100%',
    padding: '3%',
  },
  button: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '2%',
  },
  buttonRow:{
    justifyContent: "center",
    alignItems: "center",
    flexDirection:"row",
    marginTop:"3%",
    gap:"2%"
  }
});
