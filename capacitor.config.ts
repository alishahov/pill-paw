
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.80e6972d9a444fcab125afdf78fe8534',
  appName: 'bulgarian-voice-beacon',
  webDir: 'dist',
  server: {
    url: 'https://80e6972d-9a44-4fca-b125-afdf78fe8534.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
