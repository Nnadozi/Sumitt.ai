import { StyleSheet, ToastAndroid, View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Page from '@/components/Page';
import MyButton from '@/components/MyButton';
import { router } from 'expo-router';
import MyText from '@/components/MyText';
import { ButtonGroup, Divider } from '@rneui/base';
import { useTheme } from '@react-navigation/native';
import { 
  lengthDescriptions, 
  detailDescriptions, 
  toneDescriptions, 
  formatDescriptions,
  languageDescriptions 
} from '../../constants/optionDescriptions';

const options = () => {
  const [selectedIndexLength, setSelectedIndexLength] = useState(0);
  const [selectedIndexDetail, setSelectedIndexDetail] = useState(0);
  const [selectedIndexTone, setSelectedIndexTone] = useState(0);
  const [selectedIndexFormat, setSelectedIndexFormat] = useState(0);
  const [selectedIndexLanguage, setSelectedIndexLanguage] = useState(0);
  const [optionsApplied, setOptionsApplied] = useState(false);

  const saveOptions = () => {
    const options = {
      length: lengthDescriptions[selectedIndexLength],
      detail: detailDescriptions[selectedIndexDetail],
      tone: toneDescriptions[selectedIndexTone],
      format: formatDescriptions[selectedIndexFormat],
      language: languageDescriptions[selectedIndexLanguage],
    };
    router.setParams({ options: JSON.stringify(options) });
    setOptionsApplied(true);
    ToastAndroid.show('Options applied successfully', ToastAndroid.SHORT);
  };

  const { colors } = useTheme();

  return (
    <Page style={{ alignItems: 'flex-start', justifyContent: 'flex-start', padding: '5%' }}>

      <MyText bold>Length</MyText>
      <ButtonGroup
        buttons={['Short', 'Medium', 'Long', 'Deep']}
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
      <Divider width={10} />

      <MyText bold>Detail</MyText>
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
      <Divider width={10} />

      <MyText bold>Tone</MyText>
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
      <Divider width={10} />

      <MyText bold>Format</MyText>
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
      <Divider width={10} />

      <MyText bold>Language</MyText>
        <ButtonGroup
          buttons={['English', 'Spanish', 'French', 'Arabic']}
          selectedIndex={selectedIndexLanguage}
          onPress={(value) => setSelectedIndexLanguage(value)}
          selectedButtonStyle={{ backgroundColor: colors.primary }}
          innerBorderStyle={{ color: colors.border }}
          containerStyle={{
            marginVertical: '3%', width:"100%", marginLeft: '0%',
            backgroundColor: colors.card, borderColor: colors.border,
          }}
        />
 
      <MyText opacity={0.5} fontSize="small">{languageDescriptions[selectedIndexLanguage]}</MyText>
      <Divider width={30} />

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
    marginVertical: '3%',
    gap: '4%',
  },
});
