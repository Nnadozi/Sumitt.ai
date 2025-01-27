import { ActivityIndicator, Alert, Animated, ScrollView, Share, StyleSheet, View, Platform, StatusBar, SafeAreaView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
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
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import Snackbar from 'react-native-snackbar';
import ResponsiveIcon from '@/components/ResponsiveIcon';

const id = Platform.OS === "android" ? "ca-app-pub-8501095031703685/3736822220" : "ca-app-pub-8501095031703685/9379234986";
const interstitialAd = InterstitialAd.createForAdRequest(id, {
  requestNonPersonalizedAdsOnly: true,
});

const Summary = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [moduleVisible, setModuleVisible] = useState(false);
  const [summaryCount, setSummaryCount] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isProcessing, setIsProcessing] = useState(false);
  const currentRequestId = useRef(0);

  const { userInput, options } = useLocalSearchParams();
  const { colors } = useTheme();

  useEffect(() => {
    interstitialAd.load();
    const unsubscribeOpened = interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
      if (Platform.OS === 'ios') {
        StatusBar.setHidden(true);
      }
    });
    const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      if (Platform.OS === 'ios') {
        StatusBar.setHidden(false);
      }
      interstitialAd.load();
    });
    return () => {
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, []);

  useEffect(() => {
    if (userInput) generateSummary();
  }, [userInput]);

  const generateSummary = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const requestId = ++currentRequestId.current;

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setError('No internet connection');
        setLoading(false);
        setIsProcessing(false);
        return;
      }

      setLoading(true);
      setError(null);
      fadeAnim.setValue(0);

      const res = await fetch('https://sumitt-wpst.onrender.com/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, options }),
      });

      if (!res.ok) throw new Error('Failed to fetch summary from server');

      const data = await res.json();
      const summaryContent = data.choices?.[0]?.message?.content;

      if (!summaryContent) throw new Error('No summary content returned from server');

      if (requestId === currentRequestId.current) {
        setSummary(summaryContent);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      if (requestId === currentRequestId.current) {
        console.error('Error generating summary:', error);
        setError('Something went wrong.');
        setSummary('');
      }
    } finally {
      if (requestId === currentRequestId.current) {
        setLoading(false);
        setIsProcessing(false);
      }
    }
  };

  const showInterstitialAd = () => {
    if (interstitialAd.loaded) {
      interstitialAd.show();
    } else {
      console.log('Ad is not loaded yet.');
    }
  };

  const handleCopy = () => {
    Clipboard.setStringAsync(summary);
    if (Platform.OS === 'ios') {
      Snackbar.show({
        text: 'Copied to clipboard',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

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
    setSummaryCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount === 2) {
        showInterstitialAd();
        return 0;
      }
      return newCount;
    });
    setSummary('');
    setLoading(false);
    setError(null);
    router.navigate('/(tabs)');
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
        <>
          <SafeAreaView style={{ backgroundColor: colors.background }} />
          <Animated.View style={[{ opacity: fadeAnim }, styles.container]}>
            <View style={styles.headerContainer}>
              <MyText bold fontSize="XL">Summary</MyText>
              <View style={styles.iconRow}>
                <ResponsiveIcon name="copy" type="ionicon" size={25} primary={true} onPress={handleCopy} />
                <ResponsiveIcon name="share" type="ionicon" size={25} primary={true} onPress={handleShare} />
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <MyText markdown>{summary}</MyText>
            </ScrollView>
            <View style={styles.buttonRow}>
              <MyButton width="35%" title="Save" onPress={() => setModuleVisible(true)} />
              <MyButton width="35%" title="Ok" onPress={handleGoBack} />
            </View>
            <NameModule
              visible={moduleVisible}
              onPress={handleSave}
              onCancel={() => setModuleVisible(false)}
            />
          </Animated.View>
        </>
      )}
    </Page>
  );
};

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
    marginTop: '7.5%',
    marginBottom: '3%',
  },
  iconRow: {
    flexDirection: 'row',
    width: '17.5%',
    justifyContent: 'space-around',
  },
  scrollViewContent: {
    paddingBottom: '20%',
  },
  buttonRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: '3%',
    marginBottom: '8%',
    gap: '3%',
  },
});

export default Summary;
