import React, { useEffect, useState, useRef } from 'react';
import { Animated, ScrollView, Share, StyleSheet, View, Platform, StatusBar, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { useGlobalSearchParams, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Icon } from '@rneui/base';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NetInfo from '@react-native-community/netinfo';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import Snackbar from 'react-native-snackbar';
import MyText from '@/components/MyText';
import MyButton from '@/components/MyButton';
import ResponsiveIcon from '@/components/ResponsiveIcon';
import NameModule from '@/components/NameModule';
import Page from '@/components/Page';

const interstitialAd = InterstitialAd.createForAdRequest(
  __DEV__ ? TestIds.INTERSTITIAL : Platform.OS === "android" ? "ca-app-pub-8501095031703685/3736822220" : "ca-app-pub-8501095031703685/9379234986"
);

const Summary = () => {
  const { userInput, options, inputType,uri } = useGlobalSearchParams();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [moduleVisible, setModuleVisible] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [summaryCount, setSummaryCount] = useState(0);

  const loadingGifs = [
    require('../../assets/images/ball.gif'), 
    require('../../assets/images/infinity.gif'), 
    require('../../assets/images/dual.gif'), 
    require('../../assets/images/pacman.gif')
  ];
  const [loadingGif, setLoadingGif] = useState(loadingGifs[0]); 


  useEffect(() => {
    interstitialAd.load();
    const unsubscribeOpened = interstitialAd.addAdEventListener(AdEventType.OPENED, () => Platform.OS === 'ios' && StatusBar.setHidden(true));
    const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      if (Platform.OS === 'ios') StatusBar.setHidden(false);
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

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => setShowLoadingMessage(true), 5000);
      return () => clearTimeout(timeout);
    } else {
      setShowLoadingMessage(false);
    }
  }, [loading]);

  const generateSummary = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setError('No internet connection');
        return;
      }

      const randomGif = loadingGifs[Math.floor(Math.random() * loadingGifs.length)];
      setLoadingGif(randomGif);

      setLoading(true);
      fadeAnim.setValue(0);
      const res = await fetch('https://sumitt-wpst.onrender.com/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, options }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch summary from server');
        return;
      }

      const summaryContent = data.choices?.[0]?.message?.content;
      setSummary(summaryContent || 'Failed to generate a summary');
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    Clipboard.setStringAsync(summary);
    if (Platform.OS === 'ios') Snackbar.show({ text: 'Copied to clipboard', duration: 500 });
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: summary });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const handleSave = async (name: string) => {
    setModuleVisible(false);
    try {
      const currentDate = new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' });
      let originalInput = inputType === "Image" ? uri : userInput;
      await AsyncStorage.setItem(name, JSON.stringify({
         summary, userInput:originalInput, timestamp: currentDate, inputType
      }));
      console.log(`Summary saved successfully with key: ${name}`);
      handleGoBack();
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };
  
  const handleGoBack = () => {
    setSummaryCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount === 2) showInterstitialAd();
      return newCount === 2 ? 0 : newCount;
    });
    setSummary('');
    setLoading(false);
    setError(null);
    router.navigate('/(tabs)');
  };

  const showInterstitialAd = () => {
    if (interstitialAd.loaded) interstitialAd.show();
  };

  return (
    <Page applyInsets style={{ backgroundColor: colors.card, }}>
      {loading ? (
      <>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20,transform:[{scale:1.5}] }} />
        <MyText bold fontSize="large">Summarizing...</MyText>
        {showLoadingMessage && <MyText fontSize="small">Please be patient</MyText>}
      </>
    ) : error ? (
      <>
        <ResponsiveIcon name="error" size={100} color={colors.primary} />
        <MyText style={{ marginTop: 0 }} textAlign="center">{error}</MyText>
        {inputType === 'URL' && (
          <MyText style={{ marginTop: 8, marginBottom: 16 }} textAlign="center" >
            Please try a different URL. This may have occurred because:
            {'\n'}• The website requires a subscription to access content
            {'\n'}• The page is blocked by a login or authentication prompt.
            {'\n'}• The website has blocked web scraping activities
          </MyText>
        )}
        {inputType === 'Text' && (
          <MyText style={{ marginTop: 8, marginBottom: 16 }} textAlign="center" >
            There was an issue processing the text input. Please reduce the length or try again later.
          </MyText>
        )}
        {inputType === 'Image' && (
          <MyText style={{ marginTop: 0, marginBottom: 16 }} textAlign="center" >
            Image processing failed. The image might be corrupted or unsupported.
          </MyText>
        )}
        <MyButton width="30%" title="Back" onPress={handleGoBack} />
      </>
    ) : (
        <>
          <SafeAreaView style={{ backgroundColor: colors.background }} />
          <Animated.View style={[{ opacity: fadeAnim, flex:1 }, styles.container]}>
            <View style={styles.headerContainer}>
              <MyText bold fontSize="large">Summary</MyText>
              <View style={[styles.iconRow,{backgroundColor:colors.background,borderRadius:20,borderWidth:1,borderColor:colors.border}]}>
                <ResponsiveIcon name="copy" type='ionicon' size={20} primary={true} onPress={handleCopy} />
                <ResponsiveIcon name="share" size={20} primary={true} onPress={handleShare} />
              </View>
            </View>
            <ScrollView persistentScrollbar style={{width:'100%'}} contentContainerStyle={styles.scrollViewContent}>
              <MyText style={{width:"100%"}} markdown>{summary}</MyText>
            </ScrollView>
            <View style={styles.buttonRow}>
              <MyButton iconName='save' width="45%" title="Save" onPress={() => setModuleVisible(true)} />
              <MyButton iconName='check' width="45%" title="Ok" onPress={handleGoBack} />
            </View>
            <NameModule visible={moduleVisible} onPress={handleSave} onCancel={() => setModuleVisible(false)} />
          </Animated.View>
        </>
      )}
    </Page>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: 5,
    paddingHorizontal:10,
  },
  scrollViewContent: { paddingBottom: '20%', width: "100%", flexGrow:1 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginVertical: 10 },
});

export default Summary;
