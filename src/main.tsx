import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {LanguageProvider} from './i18n/LanguageContext.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { broadcastAppRenewalUpdate, CURRENT_APP_VERSION, playAppUpdateChime } from './services/appUpdateService';

// Automatic Service Worker update listener for everyone who downloaded/installed the app
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      broadcastAppRenewalUpdate({
        titleAr: `🎉 تم تجديد تطبيق Pointili (${CURRENT_APP_VERSION})!`,
        bodyAr: 'تنبيه للمحمّلين: تم إطلاق تجديد جديد لملفات وميزات التطبيق بنجاح.',
        version: CURRENT_APP_VERSION,
      });
      playAppUpdateChime();
    },
    onOfflineReady() {
      // PWA offline ready
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
