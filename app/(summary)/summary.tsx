import { ActivityIndicator, Alert, Animated, ScrollView, Share, StyleSheet, View, Platform, StatusBar, SafeAreaView,Image} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Page from '@/components/Page';
import MyText from '@/components/MyText';
import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
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

const id = __DEV__
  ? TestIds.INTERSTITIAL
  : (Platform.OS === "android" ? "ca-app-pub-8501095031703685/3736822220" : "ca-app-pub-8501095031703685/9379234986");
const interstitialAd = InterstitialAd.createForAdRequest(id);

const Summary = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [moduleVisible, setModuleVisible] = useState(false);
  const [summaryCount, setSummaryCount] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { userInput, options } = useGlobalSearchParams();
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
    if (userInput) {
      generateSummary()
    }
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
      fadeAnim.setValue(0);
      setError('');
      //https://sumitt-wpst.onrender.com/api/summarize
      const res = await fetch('http://10.212.40.150:3000/api/summarize', {
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
   
      if (!summaryContent) {
        setError('Failed to generate a summary');
        setSummary(summaryContent);
        return;
      }
      
      setSummary(summaryContent);
      Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
      }).start();
    } catch (error) {
        console.error('Error generating summary:', error);
        setError('Something went wrong.');
        setSummary('');
    } finally {
      setLoading(false);
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
        duration: 500,
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
      if (newCount === (Math.floor(Math.random() * 2) + 2)) {
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

  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => setShowLoadingMessage(true), 5000);
      return () => clearTimeout(timeout); 
    } else {
      setShowLoadingMessage(false);
    }
  }, [loading]);

  const loadingGifs = [
      require('../../assets/images/ball.gif'),
      require('../../assets/images/infinity.gif'),
      require('../../assets/images/dual.gif'),
      require('../../assets/images/pacman.gif'),
  ];

  const [loadingGif, setLoadingGif] = useState(loadingGifs[0]);
  useEffect(() => {
    setLoadingGif(loadingGifs[Math .floor(Math.random() * loadingGifs.length)]);
  }, []);


  return (
    <Page style={{ backgroundColor: colors.card, padding: '5%' }}>
      {loading ? (
        <>
          <Image source={loadingGif} key={loadingGif.uri} />
          <MyText bold fontSize="XL">Summarizing...</MyText>
          {showLoadingMessage && <MyText fontSize="small">Please be patient</MyText>}
        </>
      ) : error ? (
        <>
          <Icon name="error" size={100} color={colors.primary} />
            <MyText style={{ marginTop: '3%' }} textAlign="center">{`${error}`}</MyText>
            <MyText style={{ marginTop:"1%",marginBottom:"2%"}} textAlign="center" fontSize='small'>
            Please try a different URL. This may have occurred because:
            {'\n'}
            • The website requires a subscription to access content 
            {'\n'}
            • The page is blocked by a login or authentication prompt.
            {'\n'}
            • The website has blocked web scraping activities
            </MyText>
          <MyButton width="30%" title="Back" onPress={handleGoBack} />
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
            <ScrollView persistentScrollbar contentContainerStyle={styles.scrollViewContent}>
              <MyText markdown>{summary}</MyText>
            </ScrollView>
            <SafeAreaView style={styles.buttonRow}>
              <MyButton iconName='save' width="45%" title="Save" onPress={() => setModuleVisible(true)} />
              <MyButton iconName='check' width="45%" title="Ok" onPress={handleGoBack} />
            </SafeAreaView>
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
    gap: '2%',
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
    gap: '3%',
    marginVertical:'3%'
  },
});

export default Summary;
