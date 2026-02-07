import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixeltennis.app',
  appName: '잇츠 마이 테니스',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#f6f8f6',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#f6f8f6',
    },
  },
};

export default config;
