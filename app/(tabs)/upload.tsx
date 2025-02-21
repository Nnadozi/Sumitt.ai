import { StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Page from '@/components/Page';
import InputType from '@/components/InputType';
import MyButton from '@/components/MyButton';
import { router } from 'expo-router';
import MyInput from '@/components/MyInput';
import MyText from '@/components/MyText';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

const Upload = () => {

  return (
    <Page style={{ justifyContent: 'flex-start', alignItems: 'flex-start', margin: '5%' }}>
      <InputType
        name="Manual Input"
        subtitle="Input text manually"
        onPress={() => router.navigate({pathname:"/(input)/manual"})}
      />
      <InputType
        name="Website URL"
        subtitle="Website or Article URL"
        onPress={() => router.navigate({pathname:"/(input)/url"})}
      />
      <>
        <MyButton iconName="cancel" title="Cancel" onPress={router.back} width="100%" marginVertical="2%" />
        <MyText style={{ marginTop: '2%', opacity: 0.5 }} fontSize='small'>*Note: AI output may not always be correct*</MyText>
      </>
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
});

/**
 * IPAD DEBUGGING
 * import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Alert } from 'react-native';

async function checkTrackingStatus() {
  const { status } = await getTrackingPermissionsAsync();
  Alert.alert("Tracking Status", `Current status: ${status}`);

  if (status === 'not-determined') {
    const { status: newStatus } = await requestTrackingPermissionsAsync();
    Alert.alert("New Tracking Status", `Updated status: ${newStatus}`);
  }
}

 */
