/**
 * Holy Grill — OneSignal Push Integration
 * ----------------------------------------------------------------------------
 * Initializes the OneSignal web SDK (only if APP_CONFIG.onesignal.appId is set),
 * maps the app user ID to OneSignal, requests push permission, and stores the
 * device token in the DeviceToken entity.
 *
 * Channel default: push + in-app are ALWAYS delivered together
 * (APP_CONFIG.notifications.pushAndInAppTogether = true).
 *
 * Call initOneSignal(userId) once after the user logs in.
 */
import APP_CONFIG from '@/config/app.config';
import { base44 } from '@/api/base44Client';

let initialized = false;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

const storeDeviceToken = async (userId, playerId) => {
  if (!userId || !playerId) return;
  try {
    await base44.entities.DeviceToken.create({
      user_id: userId,
      player_id: playerId,
      platform: 'web',
      is_active: true,
    });
  } catch (e) {
    // Token may already exist — ignore duplicate errors.
  }
};

export const initOneSignal = async (userId) => {
  const appId = APP_CONFIG.onesignal.appId;
  if (!appId || initialized) return;
  try {
    await loadScript('https://cdn.onesignal.com/sdks/OneSignalSDK.js');
    window.OneSignal = window.OneSignal || [];

    window.OneSignal.push(() => {
      window.OneSignal.init({
        appId,
        notifyButton: { enable: false },
        serviceWorkerParam: { path: '/service-worker.js', scope: '/' },
        serviceWorkerPath: 'service-worker.js',
      });
      if (userId) {
        try { window.OneSignal.setExternalUserId(userId); } catch (e) { /* ignore */ }
      }
    });

    window.OneSignal.push(() => {
      window.OneSignal.getUserId().then((playerId) => {
        if (playerId) storeDeviceToken(userId, playerId);
      });
      window.OneSignal.on('subscriptionChange', (isSubscribed) => {
        if (isSubscribed) {
          window.OneSignal.getUserId().then((playerId) => {
            if (playerId) storeDeviceToken(userId, playerId);
          });
        }
      });
    });

    initialized = true;
  } catch (e) {
    if (typeof console !== 'undefined') console.warn('[OneSignal] init failed:', e);
  }
};

export const requestPushPermission = async () => {
  const appId = APP_CONFIG.onesignal.appId;
  if (!appId || !window.OneSignal) return false;
  try {
    await window.OneSignal.push(() => window.OneSignal.showSlidedownPrompt());
    return true;
  } catch (e) {
    return false;
  }
};

export const isPushSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
};