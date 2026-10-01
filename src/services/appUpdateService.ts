import { AppUpdateInfo, AppNotification } from '../types';

export const CURRENT_APP_VERSION = 'v2.5.0';
export const LAST_RELEASE_DATE = '2026-10-01';

// Detailed release changelog for the latest renewal
export const LATEST_APP_UPDATE: AppUpdateInfo = {
  version: CURRENT_APP_VERSION,
  releaseDate: LAST_RELEASE_DATE,
  title: 'Pointili v2.5.0 - New Renewal & Exclusive Features Released',
  titleAr: 'تجديد شامل لتطبيق Pointili (الإصدار v2.5.0)',
  titleFr: 'Mise à jour majeure Pointili (Version v2.5.0)',
  description: 'A major application renewal featuring enhanced customer privacy, interactive carousel slider, smart cashier QR verification, and instant push update notifications.',
  descriptionAr: 'تم تجديد التطبيق بالكامل بميزات حصرية: نظام خصوصية مجهول الهوية، شريط إعلانات متحرك تفاعلي، مسح ذكي لأكواد طاولات الكاشير، ونظام إشعارات فوري لكل من قام بتحميل التطبيق.',
  descriptionFr: 'Renouvellement complet avec confidentialité anonyme, carrousel interactif, scan QR sécurisé et notifications instantanées.',
  highlightsAr: [
    '🔔 نظام إشعارات فوري لتنبيه كل من قام بتحميل وتثبيت التطبيق بأي تجديد أو تحديث جديد',
    '🔒 حماية الخصوصية الكاملة: استخدام كود تعريفي خاص بالزبون واسم مستعار دون مشاركة أي بيانات شخصية',
    '🎠 شريط إعلانات وتحديثات تفاعلي متحرك (Carousel Slider) في الصفحة الرئيسية',
    '⚡ مسح ذكي مباشر لكود QR المعتمد لطاولات الكاشير بمحلات برج بوعريريج الـ 10',
    '📶 دعم العمل السريع بدون إنترنت (PWA Offline) وحفظ البيانات فائق السرعة',
  ],
  highlightsFr: [
    'Notifications instantanées pour toutes les personnes ayant téléchargé l\'application.',
    'Confidentialité totale avec identifiant client anonyme et pseudonyme.',
    'Carrousel interactif des promotions et nouveautés.',
    'Validation instantanée par QR code sécurisé des caisses.',
    'Support hors-ligne PWA complet.',
  ],
  highlightsEn: [
    'Instant renewal notifications sent to all users who downloaded/installed the app.',
    'Total privacy with anonymous client ID code & chosen aliases.',
    'Interactive swipeable promo carousel & announcements on home screen.',
    'Smart QR scanning matching official cashier desk stands.',
    'Offline PWA support & lightning-fast caching.',
  ],
  isCritical: false,
};

// Storage Keys
const STORAGE_KEY_NOTIFICATIONS = 'pointili_app_notifications_v1';
const STORAGE_KEY_LAST_SEEN_VERSION = 'pointili_last_seen_version';
const STORAGE_KEY_INSTALLED = 'pointili_is_installed';
const STORAGE_KEY_PUSH_ENABLED = 'pointili_push_notifications_enabled';

// Broadcast channel for multi-tab synchronization
let updateChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    updateChannel = new BroadcastChannel('pointili_app_updates');
  }
} catch {
  // BroadcastChannel unavailable in some sandboxes
}

/**
 * Play a high-tech crystal notification tone using Web Audio API
 */
export function playAppUpdateChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    // Chime notes: C5, E5, G5, C6 (cheerful ascending fanfare)
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });

    // Device vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([120, 60, 120]);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

/**
 * Record that user has installed or downloaded the PWA
 */
export function markAppAsInstalled(): void {
  try {
    localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
    window.dispatchEvent(new CustomEvent('pointili:install-status-changed', { detail: { installed: true } }));
  } catch {}
}

/**
 * Check if the current user has installed the app
 */
export function isAppInstalled(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      return true;
    }
    return localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Check and request Web Push / Notification permissions
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(STORAGE_KEY_PUSH_ENABLED, 'true');
      playAppUpdateChime();
    }
    return permission;
  } catch {
    return 'denied';
  }
}

export function isPushNotificationEnabled(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Load all stored update notifications
 */
export function getStoredNotifications(): AppNotification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}

  // Initial welcome update notification
  const initialNotification: AppNotification = {
    id: 'update-init-v250',
    type: 'app_update',
    title: 'Pointili v2.5.0 Renewal',
    titleAr: '🎉 تم تجديد تطبيق Pointili بإصدار جديد!',
    body: 'تم تجديد التطبيق بالكامل بميزات أمان وخصوصية جديدة وشريط إعلانات ومسح ذكي.',
    bodyAr: 'تم إطلاق التجديد الجديد: ميزات خصوصية متقدمة، شريط تفاعلي للعروض، ونظام إشعارات ذكي لجميع من قام بتحميل التطبيق.',
    timestamp: new Date().toISOString(),
    read: false,
    version: CURRENT_APP_VERSION,
    senderName: 'فريق تطوير Pointili',
  };

  saveNotifications([initialNotification]);
  return [initialNotification];
}

/**
 * Save notifications list to storage
 */
export function saveNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  } catch {}
}

/**
 * Add a new notification and trigger alerts
 */
export function pushNewNotification(notification: AppNotification): void {
  const current = getStoredNotifications();
  // Avoid duplicates with same id
  const filtered = current.filter((n) => n.id !== notification.id);
  const updated = [notification, ...filtered];
  saveNotifications(updated);

  // Play audio tone
  playAppUpdateChime();

  // Send native device push notification if permission granted
  sendNativeNotification(notification);

  // Notify active window components
  window.dispatchEvent(
    new CustomEvent('pointili:new-notification', { detail: notification })
  );

  // Broadcast across tabs
  if (updateChannel) {
    try {
      updateChannel.postMessage({ type: 'NEW_NOTIFICATION', notification });
    } catch {}
  }
}

/**
 * Fire native browser / OS notification
 */
function sendNativeNotification(notification: AppNotification): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const options: NotificationOptions & { renotify?: boolean } = {
      body: notification.bodyAr || notification.body,
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      tag: notification.id,
      renotify: true,
    };
    const notif = new Notification(notification.titleAr || notification.title, options as unknown as NotificationOptions);

    notif.onclick = () => {
      window.focus();
      notif.close();
      window.dispatchEvent(new CustomEvent('pointili:open-update-modal'));
    };
  } catch {
    // Native notification might fail in some iframe environments
  }
}

/**
 * Check if app has been updated since user last launched it
 */
export function checkForUnseenAppUpdate(): boolean {
  try {
    const lastSeen = localStorage.getItem(STORAGE_KEY_LAST_SEEN_VERSION);
    if (!lastSeen || lastSeen !== CURRENT_APP_VERSION) {
      return true;
    }
  } catch {}
  return false;
}

/**
 * Mark the current version as seen by the user
 */
export function markCurrentVersionAsSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_SEEN_VERSION, CURRENT_APP_VERSION);
    // Mark unread app_update notifications as read
    const current = getStoredNotifications();
    const updated = current.map((n) => (n.version === CURRENT_APP_VERSION ? { ...n, read: true } : n));
    saveNotifications(updated);
    window.dispatchEvent(new CustomEvent('pointili:notifications-updated'));
  } catch {}
}

/**
 * Admin / System trigger to broadcast a renewal update to ALL users who downloaded/installed the app
 */
export function broadcastAppRenewalUpdate(options?: {
  titleAr?: string;
  bodyAr?: string;
  version?: string;
}): AppNotification {
  const version = options?.version || CURRENT_APP_VERSION;
  const newNotification: AppNotification = {
    id: `broadcast-update-${Date.now()}`,
    type: 'broadcast',
    title: `Pointili Renewal ${version}`,
    titleAr: options?.titleAr || `🎉 تم تجديد تطبيق Pointili (${version})!`,
    body: options?.bodyAr || 'تم تجديد التطبيق بميزات وتحسينات جديدة لجميع مستخدمي كافيهات ومطاعم برج بوعريريج.',
    bodyAr: options?.bodyAr || 'تم تجديد تطبيق Pointili بنجاح! ميزات جديدة وعروض حصرية متوفرة الآن لكل من قام بتحميل التطبيق.',
    timestamp: new Date().toISOString(),
    read: false,
    version,
    senderName: 'إدارة شبكة Pointili الرسمية',
  };

  // Add and alert
  pushNewNotification(newNotification);

  // Trigger app updated event
  window.dispatchEvent(new CustomEvent('pointili:app-updated', { detail: { version, notification: newNotification } }));

  return newNotification;
}

/**
 * Hook up listeners for multi-tab updates
 */
export function setupUpdateSync(onNewNotification: (notif: AppNotification) => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_NOTIFICATIONS && e.newValue) {
      try {
        const parsed: AppNotification[] = JSON.parse(e.newValue);
        if (parsed.length > 0) {
          onNewNotification(parsed[0]);
        }
      } catch {}
    }
  };

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<AppNotification>;
    if (custom.detail) {
      onNewNotification(custom.detail);
    }
  };

  const handleBroadcast = (msg: MessageEvent) => {
    if (msg.data && msg.data.type === 'NEW_NOTIFICATION') {
      onNewNotification(msg.data.notification);
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('pointili:new-notification', handleCustomEvent);
  if (updateChannel) {
    updateChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('pointili:new-notification', handleCustomEvent);
    if (updateChannel) {
      updateChannel.removeEventListener('message', handleBroadcast);
    }
  };
}
