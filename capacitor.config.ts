
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pillpaw.app',
  appName: 'Pill Paw',
  webDir: 'dist',
  server: {
    url: 'https://80e6972d-9a44-4fca-b125-afdf78fe8534.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
