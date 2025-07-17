import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, Share, StyleSheet, View, Platform, StatusBar, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useGlobalSearchParams, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
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
  __DEV__ ? TestIds.INTERSTITIAL : Platform.OS === "android" ? (process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID || TestIds.INTERSTITIAL) : (process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID || TestIds.INTERSTITIAL)
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
      // Check internet connectivity first
      const netInfo = await NetInfo.fetch();
      
      // iOS-specific network detection fix
      const isConnected = netInfo.isConnected;
      const hasConnectionType = netInfo.type !== 'none' && netInfo.type !== 'unknown';
      const isInternetReachable = netInfo.isInternetReachable !== false; // Allow undefined/null
      
      if (!isConnected || !hasConnectionType) {
        setError('No internet connection');
        return;
      }

      // Only check isInternetReachable if it's explicitly false (iOS can be undefined)
      if (netInfo.isInternetReachable === false) {
        setError('No internet connection');
        return;
      }

      // Log network info for debugging (remove in production)
      console.log('Network Info:', {
        isConnected: netInfo.isConnected,
        type: netInfo.type,
        isInternetReachable: netInfo.isInternetReachable,
        isWifi: netInfo.type === 'wifi',
        isCellular: netInfo.type === 'cellular'
      });

      setLoading(true);
      setError(null); // Clear any previous errors
      fadeAnim.setValue(0);
      
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch(`${supabaseUrl}/functions/v1/summarize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ userInput, options }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let errorMessage = 'Failed to generate summary';
        
        if (res.status === 401) {
          errorMessage = 'Authentication failed. Please try again.';
        } else if (res.status === 403) {
          errorMessage = errorData.error || 'Access denied. Please check your input.';
        } else if (res.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (res.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        setError(errorMessage);
        return;
      }

      const data = await res.json();
      const summaryContent = data.choices?.[0]?.message?.content;
      
      if (!summaryContent) {
        setError('Failed to generate a summary. Please try again.');
        return;
      }
      
      setSummary(summaryContent);
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    } catch (error: any) {
      console.error('Error generating summary:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message?.includes('Network request failed')) {
        errorMessage = Platform.OS === 'ios' 
          ? 'Network error on iOS. Please try again or check your connection.'
          : 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'Connection failed. Please try again.';
      } else if (Platform.OS === 'ios' && error.message?.includes('cancelled')) {
        errorMessage = 'Request was cancelled. Please try again.';
      }
      
      setError(errorMessage);
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
    } catch (error: any) {
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

  const getErrorIcon = () => {
    if (error?.includes('internet') || error?.includes('connection') || error?.includes('network')) {
      return "wifi-off";
    }
    return "error";
  };

  const getErrorDetails = () => {
    if (error?.includes('internet') || error?.includes('connection') || error?.includes('network')) {
      return "Please check your internet connection and try again.\n• Make sure you're connected to WiFi or mobile data\n• Try turning airplane mode on and off\n• Check if your connection is stable";
    } else if (error?.includes('timeout')) {
      return "The request took too long to complete.\n• Check your internet connection\n• Try again in a few moments\n• The content might be too large to process";
    } else if (error?.includes('Too many requests')) {
      return "You've made too many requests recently.\n• Please wait a few minutes before trying again\n• This helps us provide better service to everyone";
    } else if (inputType === 'URL') {
      return "Please try a different URL. This may have occurred because:\n• The website requires a subscription to access content\n• The page is blocked by a login or authentication prompt\n• The website has blocked web scraping activities\n• The URL might be invalid or inaccessible";
    } else if (inputType === 'Text') {
      return "There was an issue processing the text input.\n• Please reduce the length of your text\n• Make sure the text is not empty\n• Try again in a few moments";
    } else if (inputType === 'Image') {
      return "Image processing failed.\n• The image might be corrupted or unsupported\n• Try using a different image format (JPEG, PNG)\n• Make sure the image is not too large";
    } else {
      return "An unexpected error occurred.\n• Please try again in a few moments\n• If the problem persists, restart the app";
    }
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
          <ResponsiveIcon 
            type='material'
            name={getErrorIcon()} 
            size={100} 
            color={colors.primary} 
          />
          <MyText style={{ marginTop: 0 }} textAlign="center" bold>{error}</MyText>
          <MyText style={{ marginTop: 8, marginBottom: 16 }} textAlign="center" fontSize="small">
            {getErrorDetails()}
          </MyText>
          <View style={styles.errorButtonRow}>
            <MyButton 
              iconName="refresh" 
              width="45%" 
              title="Retry" 
              onPress={() => {
                setError(null);
                generateSummary();
              }} 
            />
            <MyButton width="45%" title="Back" onPress={handleGoBack} />
          </View>
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
  errorButtonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginVertical: 10 },
});

export default Summary;
