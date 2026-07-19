import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finly.app',
  appName: 'Finly',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#13161f',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#13161f',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    Preferences: {
      group: 'FinlyStorage',
    },
  },
};

export default config;
