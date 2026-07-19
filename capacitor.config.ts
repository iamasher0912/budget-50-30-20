import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finly.app',
  appName: 'Finly',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#13161f',
  },
};

export default config;
