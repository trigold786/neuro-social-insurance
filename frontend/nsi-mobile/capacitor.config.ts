import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.nsi.socialinsurance',
  appName: 'NSI社保定制速算器',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'nsi',
      keystorePassword: '',
      keystoreAliasPassword: '',
    },
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
