import { Platform, ScrollView, StyleSheet, ToastAndroid, View} from 'react-native';
import React, { useEffect, useState } from 'react';
import Page from '@/components/Page';
import MyButton from '@/components/MyButton';
import { router } from 'expo-router';
import MyText from '@/components/MyText';
import { ButtonGroup, Divider, Icon } from '@rneui/base';
import { useTheme } from '@react-navigation/native';
import { 
  lengthDescriptions, 
  detailDescriptions, 
  toneDescriptions, 
  formatDescriptions,
  languageDescriptions 
} from '../../constants/optionDescriptions';
import Snackbar from 'react-native-snackbar';
import ResponsiveIcon from '@/components/ResponsiveIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';

const options = () => {
  const [selectedIndexLength, setSelectedIndexLength] = useState(0);
  const [selectedIndexDetail, setSelectedIndexDetail] = useState(0);
  const [selectedIndexTone, setSelectedIndexTone] = useState(0);
  const [selectedIndexFormat, setSelectedIndexFormat] = useState(0);
  const [selectedIndexLanguage, setSelectedIndexLanguage] = useState(0);
  const [optionsApplied, setOptionsApplied] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const savedOptions = await AsyncStorage.getItem('summaryOptions');
        if (savedOptions) {
          const parsedOptions = JSON.parse(savedOptions);
          setSelectedIndexLength(lengthDescriptions.indexOf(parsedOptions.length));
          setSelectedIndexDetail(detailDescriptions.indexOf(parsedOptions.detail));
          setSelectedIndexTone(toneDescriptions.indexOf(parsedOptions.tone));
          setSelectedIndexFormat(formatDescriptions.indexOf(parsedOptions.format));
          setSelectedIndexLanguage(languageDescriptions.indexOf(parsedOptions.language));
        }
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    
    loadOptions();
  }, []);
  
  const saveOptions = async () => {
    const options = {
      length: lengthDescriptions[selectedIndexLength],
      detail: detailDescriptions[selectedIndexDetail],
      tone: toneDescriptions[selectedIndexTone],
      format: formatDescriptions[selectedIndexFormat],
      language: languageDescriptions[selectedIndexLanguage],
    };
    try {
      await AsyncStorage.setItem('summaryOptions', JSON.stringify(options));
      setOptionsApplied(true);
      ToastAndroid.show('Options applied successfully', ToastAndroid.SHORT);
      if (Platform.OS === 'ios') {
        Snackbar.show({
          text: 'Options applied!',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    } catch (error) {
      console.error('Error saving options:', error);
    }
  };

  const { colors } = useTheme();

  return (
    <Page style={{ alignItems: 'center', justifyContent: 'flex-start', padding: '5%' }}>
      <ScrollView>
        <View style = {styles.iconRow}>
          <ResponsiveIcon name='ruler' type='entypo' color={colors.text} size={15} />
          <MyText bold>Length</MyText>
        </View>
        <ButtonGroup
          buttons={['Short', 'Medium', 'Long']}
          selectedIndex={selectedIndexLength}
          onPress={(value) => setSelectedIndexLength(value)}
          selectedButtonStyle={{ backgroundColor: colors.primary }}
          innerBorderStyle={{ color: colors.border }}
          containerStyle={{
            marginVertical: '3%', width: '100%', marginLeft: '0%',
            backgroundColor: colors.card, borderColor: colors.border,
          }}
        />
        <MyText opacity={0.5} fontSize="small">{lengthDescriptions[selectedIndexLength]}</MyText>
        <Divider width={10} color="rgba(0,0,0,0)" />
        <View style = {styles.iconRow}>
          <ResponsiveIcon name='magnifying-glass' type='entypo' color={colors.text} size={18} />
          <MyText bold>Detail</MyText>
        </View>
        <ButtonGroup
          buttons={['Low', 'Medium', 'High']}
          selectedIndex={selectedIndexDetail}
          onPress={(value) => setSelectedIndexDetail(value)}
          selectedButtonStyle={{ backgroundColor: colors.primary }}
          innerBorderStyle={{ color: colors.border }}
          containerStyle={{
            marginVertical: '3%', width: '100%', marginLeft: '0%',
            backgroundColor: colors.card, borderColor: colors.border,
          }}
        />
        <MyText opacity={0.5} fontSize="small">{detailDescriptions[selectedIndexDetail]}</MyText>
        <Divider width={10} color="rgba(0,0,0,0)" />
        <View style = {styles.iconRow}>
          <ResponsiveIcon name='chatbubble-ellipses' type='ionicon' color={colors.text} size={17} />
          <MyText bold>Tone</MyText>
        </View>
        <ButtonGroup
          buttons={['Casual', 'Formal']}
          selectedIndex={selectedIndexTone}
          onPress={(value) => setSelectedIndexTone(value)}
          selectedButtonStyle={{ backgroundColor: colors.primary }}
          innerBorderStyle={{ color: colors.border }}
          containerStyle={{
            marginVertical: '3%', width: '100%', marginLeft: '0%', 
            backgroundColor: colors.card, borderColor: colors.border,
          }}
        />
        <MyText opacity={0.5} fontSize="small">{toneDescriptions[selectedIndexTone]}</MyText>
        <Divider width={10} color="rgba(0,0,0,0)" />
        <View style = {styles.iconRow}>
          <ResponsiveIcon name='book' type='entypo' color={colors.text} size={18} />
          <MyText bold>Format</MyText>
        </View>
        <ButtonGroup
          buttons={['Paragraphs', 'Bullet Points', 'Mix']}
          selectedIndex={selectedIndexFormat}
          onPress={(value) => setSelectedIndexFormat(value)}
          selectedButtonStyle={{ backgroundColor: colors.primary }}
          innerBorderStyle={{ color: colors.border }}
          containerStyle={{
            marginVertical: '3%', width: '100%', marginLeft: '0%',
            backgroundColor: colors.card, borderColor: colors.border,
          }}
        />
        <MyText opacity={0.5} fontSize="small">{formatDescriptions[selectedIndexFormat]}</MyText>
        <Divider width={10} color="rgba(0,0,0,0)" />
        <View style = {styles.iconRow}>
          <ResponsiveIcon name='globe' type='entypo' color={colors.text} size={17} />
          <MyText bold>Language {Platform.OS === "ios" ? "(Scroll)" : ""} </MyText>
        </View>
        <ScrollView persistentScrollbar horizontal contentContainerStyle={{width:"300%"}} >
          <ButtonGroup
            buttons={['English', 'Spanish', 'French', 'Arabic', 'German', 'Chinese', 'Hindi', 'Japaneese','Russian','Portuguese']}
            selectedIndex={selectedIndexLanguage}
            onPress={(value) => setSelectedIndexLanguage(value)}
            selectedButtonStyle={{ backgroundColor: colors.primary }}
            innerBorderStyle={{ color: colors.border }}
            containerStyle={{
              marginVertical: '1%', width:"100%", marginLeft: '0%',
              backgroundColor: colors.card, borderColor: colors.border,
            }}
          />
        </ScrollView>
        <MyText opacity={0.5} fontSize="small">{languageDescriptions[selectedIndexLanguage]}</MyText>
      </ScrollView>
      <View style={styles.buttonRow}>
        <MyButton width="30%" title="Apply" onPress={saveOptions} />
        <MyButton width="30%" title="Done" onPress={router.back} disabled={!optionsApplied} />
      </View>
    </Page>
  );
};

export default options;

const styles = StyleSheet.create({
  buttonRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: '4%',
    marginBottom:"3%",
    marginTop:"5%"
  },
  iconRow:{
    flexDirection:"row",
    width:"100%",
    alignItems: 'center',
    gap:"2%"
  }
});
