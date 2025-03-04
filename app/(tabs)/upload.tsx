import { StyleSheet, View } from 'react-native';
import React from 'react';
import Page from '@/components/Page';
import InputType from '@/components/InputType';
import MyButton from '@/components/MyButton';
import { router } from 'expo-router';
import MyText from '@/components/MyText';

const Upload = () => {
  return (
    <Page style={{ justifyContent: 'flex-start', alignItems: 'flex-start', margin: '5%' }}>
      <InputType
        name="Text"
        subtitle="Input text manually"
        inputType='Text'
        onPress={() => router.navigate({
          pathname:'/(input)/text',
          params:{
            inputType:'Text'
          }
        })}
      />
      <InputType
        name="Website URL"
        subtitle="Paste Website or article URL"
        inputType='URL'
        onPress={() => router.navigate({
          pathname:'/(input)/url',
          params:{
            inputType:'URL'
          }
        })}
      />
      <InputType
        name="Image"
        subtitle="Take photo or upload image"
        inputType='Image'
        onPress={() => router.navigate({
          pathname:'/(input)/image',
          params:{
            inputType:'Image'
          }
        })}
      />
      <InputType
        name="PDF"
        subtitle="Upload PDF from device"
        inputType='PDF'
        onPress={() => router.navigate({
          pathname:'/(input)/pdf',
          params:{
            inputType:'PDF'
          }
        })}
      />
      <View style = {{width:"100%"}}>
        <MyButton iconName="cancel" title="Cancel" onPress={ () => router.back()} width="100%" marginVertical="2%" />
        <MyText style={{ marginTop: '2%', opacity: 0.5 }} fontSize="small">
          *Note: AI output may not always be correct*
        </MyText>
      </View>
    </Page>
  );
};

export default Upload;

