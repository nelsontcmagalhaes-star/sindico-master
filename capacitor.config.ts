import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e0fdb4ef900b4a2086d325f0becb76a1',
  appName: 'Vencix Condomínio',
  webDir: 'dist',
  server: {
    url: 'https://e0fdb4ef-900b-4a20-86d3-25f0becb76a1.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1e3a8a',
    },
  },
};

export default config;
