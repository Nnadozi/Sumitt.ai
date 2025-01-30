import 'dotenv/config';
import appConfig from './app.json';

const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  ...appConfig, 
  expo: {
    ...appConfig.expo,
    name: IS_DEV ? 'Sumitt (Dev)' : appConfig.expo.name,
    ios: {
      ...appConfig.expo.ios,
      bundleIdentifier: IS_DEV ? 'com.nnadozi.sumitt.dev' : appConfig.expo.ios.bundleIdentifier,
    },
    android: {
      ...appConfig.expo.android,
      package: IS_DEV ? 'com.nnadozi.sumitt.dev' : appConfig.expo.android.package,
    },
  },
};
