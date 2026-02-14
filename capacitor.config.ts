import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kithgrid.app',
  appName: 'KithGrid',
  webDir: 'out',
  server: {
    // 1. For Local Development on Android Emulator, uncomment the line below:
    // url: "http://10.0.2.2:3000",
    // cleartext: true,

    // 2. For Production/Phone, uncomment and set your Netlify URL:
    url: "https://kithgrid.netlify.app",

    androidScheme: 'https'
  }
};

export default config;
