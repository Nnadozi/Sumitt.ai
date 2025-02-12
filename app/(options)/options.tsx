import { Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, ToastAndroid, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Page from '@/components/Page';
import MyButton from '@/components/MyButton';
import { router } from 'expo-router';
import MyText from '@/components/MyText';
import { Divider } from '@rneui/base';
import { Chip } from '@rneui/themed';
import { useTheme } from '@react-navigation/native';
import Snackbar from 'react-native-snackbar';
import ResponsiveIcon from '@/components/ResponsiveIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  lengthDescriptions,
  detailDescriptions,
  toneDescriptions,
  formatDescriptions,
  languageDescriptions,
} from '../../constants/optionDescriptions';

const options = () => {
  const { colors } = useTheme();

  const [selectedOptions, setSelectedOptions] = useState({
    length: `${lengthDescriptions[2]}`,
    detail: `${detailDescriptions[2]}`,
    tone: `${toneDescriptions[0]}`,
    format: `${formatDescriptions[2]}`,
    language: `${languageDescriptions[0]}`,
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const savedOptions = await AsyncStorage.getItem('summaryOptions');
        if (savedOptions) {
          setSelectedOptions(JSON.parse(savedOptions));
        }
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    loadOptions();
  }, []);

  const saveOptions = async () => {
    try {
      await AsyncStorage.setItem('summaryOptions', JSON.stringify(selectedOptions));
      ToastAndroid.show('Options applied successfully', ToastAndroid.SHORT);
      if (Platform.OS === 'ios') {
        Snackbar.show({ text: 'Options applied!', duration: 500 });
      }
    } catch (error) {
      console.error('Error saving options:', error);
    }
    router.back();
  };

  const renderChips = (category: keyof typeof selectedOptions, optionsArray: string[], descriptions: string[]) => (
    <View>
      <View style={styles.chipContainer}>
        {optionsArray.map((option, index) => (
          <Chip
            key={option}
            title={option}
            onPress={() => setSelectedOptions((prev) => ({
              ...prev,
              [category]: `${descriptions[index]}`,
            }))}
            buttonStyle={{
              backgroundColor: selectedOptions[category].startsWith(option) ? colors.primary : colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            titleStyle={{
              color: selectedOptions[category].startsWith(option) ? colors.background : colors.text,
            }}
          />
        ))}
      </View>
      <MyText opacity={0.5} fontSize="small">{selectedOptions[category]}</MyText>
    </View>
  );

  return (
    <Page style={{ alignItems: 'center', justifyContent: 'flex-start', padding: '5%' }}>
      <SafeAreaView>
      <ScrollView contentContainerStyle={{ paddingBottom: "10%" }}>
        <View style={styles.iconRow}>
          <ResponsiveIcon name='ruler' type='entypo' color={colors.text} size={15} />
          <MyText bold>Length</MyText>
        </View>
        {renderChips('length', ['Short', 'Medium', 'Long', 'Auto'], lengthDescriptions)}
        <Divider width={10} color='rgba(0,0,0,0)' />

        <View style={styles.iconRow}>
          <ResponsiveIcon name='magnifying-glass' type='entypo' color={colors.text} size={18} />
          <MyText bold>Detail</MyText>
        </View>
        {renderChips('detail', ['Low', 'Medium', 'High', 'Auto'], detailDescriptions)}
        <Divider width={10} color='rgba(0,0,0,0)' />

        <View style={styles.iconRow}>
          <ResponsiveIcon name='chatbubble-ellipses' type='ionicon' color={colors.text} size={17} />
          <MyText bold>Tone</MyText>
        </View>
        {renderChips('tone', ['Casual', 'Formal', 'Optimistic', 'Storyteller'], toneDescriptions)}
        <Divider width={10} color='rgba(0,0,0,0)' />

        <View style={styles.iconRow}>
          <ResponsiveIcon name='book' type='entypo' color={colors.text} size={18} />
          <MyText bold>Format</MyText>
        </View>
        {renderChips('format', ['Paragraphs', 'Bullet Points', 'Mix'], formatDescriptions)}
        <Divider width={10} color='rgba(0,0,0,0)' />

        <View style={styles.iconRow}>
          <ResponsiveIcon name='globe' type='entypo' color={colors.text} size={17} />
          <MyText bold>Language</MyText>
        </View>
        {renderChips('language', ['English', 'Spanish', 'French', 'Arabic',
          'German', 'Chinese', 'Hindi', 'Japanese', 'Russian', 'Portuguese', 'Italian', 'Korean',
          'Turkish', 'Swahili', 'Dutch', 'Greek', 'Bengali', 'Vietnamese', 'Thai', 'Pirate'], languageDescriptions)}
      </ScrollView>
      <View style={styles.buttonRow}>
        <MyButton iconName='save' width='40%' title='Apply' onPress={saveOptions} />
        <MyButton iconName='cancel' width='40%' title='Cancel' onPress={router.back} />
      </View>
      </SafeAreaView>
    </Page>
  );
};

export default options;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  buttonRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: '3%',
    marginTop:"3%"
  },
  iconRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: '2%',
    marginVertical: "1%",
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0.01 * height,
    marginVertical: "2%",
  },
});
