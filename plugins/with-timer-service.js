// plugins/with-timer-service.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withTimerService(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;

    // 권한 추가
    manifest['uses-permission'] = manifest['uses-permission'] || [];
    const addPerm = (name) => {
      if (!manifest['uses-permission'].some(p => p.$['android:name'] === name)) {
        manifest['uses-permission'].push({ $: { 'android:name': name } });
      }
    };
    addPerm('android.permission.FOREGROUND_SERVICE');
    addPerm('android.permission.FOREGROUND_SERVICE_DATA_SYNC'); // Android 14+
    // 필요 시 위치 권한:
    // addPerm('android.permission.ACCESS_FINE_LOCATION');
    // addPerm('android.permission.ACCESS_COARSE_LOCATION');
    // addPerm('android.permission.ACCESS_BACKGROUND_LOCATION');

    // 서비스 등록
    const app = manifest.application?.[0];
    app.service = app.service || [];
    const serviceName = '.timer.TimerService';
    if (!app.service.some(s => s.$['android:name'] === serviceName)) {
      app.service.push({
        $: {
          'android:name': serviceName,
          'android:exported': 'false',
          'android:foregroundServiceType': 'dataSync|location', // 필요에 맞게
        },
      });
    }

    return cfg;
  });
};
