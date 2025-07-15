import 'dotenv/config';
import appConfig from './app.json';

const IS_DEV = process.env.EXPO_PUBLIC_APP_VARIANT === 'development';

export default {
  ...appConfig, 
  expo: {
    ...appConfig.expo,
    name: IS_DEV ? 'Sumitt (Dev)' : appConfig.expo.name,
    ios: {
      ...appConfig.expo.ios,
      bundleIdentifier: IS_DEV ? 'com.nnadozi.Sumitt.dev' : appConfig.expo.ios.bundleIdentifier,
    },
    android: {
      ...appConfig.expo.android,
      package: IS_DEV ? 'com.nnadozi.Sumitt.dev' : appConfig.expo.android.package,
    },
    plugins: [
      ...appConfig.expo.plugins.filter(plugin => {
        // Keep all plugins except react-native-google-mobile-ads
        if (Array.isArray(plugin) && plugin[0] === 'react-native-google-mobile-ads') {
          return false;
        }
        return true;
      }),
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": process.env.ADMOB_ANDROID_APP_ID,
          "iosAppId": process.env.ADMOB_IOS_APP_ID,
          "userTrackingUsageDescription": "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ],
  },
  extra: {
    EXPO_PUBLIC_APP_VARIANT: process.env.EXPO_PUBLIC_APP_VARIANT
  },
};
