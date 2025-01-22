import { ActivityIndicator, Alert, Animated, ScrollView, Share, StyleSheet, View, Platform, StatusBar} from 'react-native';
import React, { useEffect, useState } from 'react';
import Page from '@/components/Page';
import MyText from '@/components/MyText';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import MyButton from '@/components/MyButton';
import { Icon } from '@rneui/base';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NameModule from '@/components/NameModule';
import * as NetInfo from '@react-native-community/netinfo';

const Summary = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [moduleVisible, setModuleVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { userInput, options } = useLocalSearchParams();
  const { colors } = useTheme();


  useEffect(() => {
    if (userInput) generateSummary();
  }, [userInput]);

  const generateSummary = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setError('No internet connection');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      fadeAnim.setValue(0);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system',
              content: `You are a professional summarizer. Your goal is to create a concise, meaningful, and complete summary of the provided text, no matter how short or random the input may be. Follow these guidelines:
                1. ALWAYS SUMMARIZE BASED ON THE PROVIDED OPTIONS when available: ${options}.
                2. ALWAYS generate a summary, even if the input text is just a word or lacks substantial details.
                3. EVEN IF the input is too short or unclear, generate a thoughtful, complete response by providing context, interpretations, or relevant details to create a coherent summary.
                4. DO NOT ask for clarification or additional details. Ensure the summary is always generated.
                5. DO NOT apologize.
                6. NEVER DISPLAY THE OPTIONS OBJECT
                7. Avoid using bold, italics, or ANY other type of markdown style.
                8. IF USING BULLET POINTS, DO NOT use dashes ( - ). ALWAYS use bullets instead ( • )
                Input Text:
                {userInput}`, },
            { role: 'user', content: userInput },
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch summary from server');

      const data = await res.json();
      const summaryContent = data.choices?.[0]?.message?.content;

      if (!summaryContent) throw new Error('No summary content returned from server');

      setSummary(summaryContent);
      setLoading(false);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Something went wrong.');
      setSummary('');
      setLoading(false);
    }
  };

  const handleCopy = () => Clipboard.setStringAsync(summary);

  const handleShare = async () => {
    try {
      await Share.share({ message: summary });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleSave = async (name: string) => {
    setModuleVisible(false);
    try {
      const currentDate = new Date().toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const newSummary = { summary, timestamp: currentDate };
      await AsyncStorage.setItem(name, JSON.stringify(newSummary));
      console.log(`Summary saved successfully with key: ${name}`);
      handleGoBack();
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };

  const handleGoBack = async () => {
    router.navigate('/(tabs)');
    setSummary('');
    setLoading(false);
    setError(null);
  };

  return (
    <Page style={{ backgroundColor: colors.card, padding: '5%' }}>
      {loading ? (
        <>
          <MyText bold fontSize="large">Summarizing with AI</MyText>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: '3%' }} />
        </>
      ) : error ? (
        <>
          <Icon name="sad" type="ionicon" size={100} color={colors.primary} />
          <MyText style={{ marginVertical: '5%' }} textAlign="center">{error}</MyText>
          <MyButton width="50%" title="Go Back" onPress={handleGoBack} />
        </>
      ) : (
        <Animated.View style={[{ opacity: fadeAnim }, styles.container]}>
          <View style={styles.headerContainer}>
            <MyText bold fontSize="XL">Summary</MyText>
            <View style={styles.iconRow}>
              <Icon name="copy" type="ionicon" size={25} color={colors.primary} onPress={handleCopy} />
              <Icon name="share" type="ionicon" size={25} color={colors.primary} onPress={handleShare} />
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <MyText markdown>{summary}</MyText>
          </ScrollView>
          <View style={styles.buttonRow}>
            <MyButton width="30%" title="Save" onPress={() => setModuleVisible(true)} />
            <MyButton width="30%" title="Ok" onPress={handleGoBack} />
          </View>
          <NameModule
            visible={moduleVisible}
            onPress={handleSave}
            onCancel={() => setModuleVisible(false)}
          />
        </Animated.View>
      )}
    </Page>
  );
};

export default Summary;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    marginTop: '10%',
    marginBottom: '3%',
  },
  iconRow: {
    flexDirection: 'row',
    width: '20%',
    justifyContent: 'space-around',
  },
  scrollViewContent: {
    paddingBottom: '20%',
  },
  buttonRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: '3%',
    marginBottom: '5%',
    gap: '3%',
  },
});
