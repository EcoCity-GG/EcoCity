// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app"; // Adicionado getApps, getApp
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth } from "firebase/auth"; // Importe getAuth
import { getStorage } from "firebase/storage"; // Importe getStorage
import { getFirestore } from "firebase/firestore"; // Importe getFirestore se usar

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvuILIDo5uxxkX4SRo1rkMGN3EVKf_cRQ",
  authDomain: "ecocity-801cc.firebaseapp.com",
  databaseURL: "https://ecocity-801cc-default-rtdb.firebaseio.com",
  projectId: "ecocity-801cc",
  storageBucket: "ecocity-801cc.firebasestorage.app",
  messagingSenderId: "825751292076",
  appId: "1:825751292076:web:11dcde0f9a5d153b64b709",
  measurementId: "G-9NQK92Q42X"
};

// Initialize Firebase App (garante que inicializa apenas uma vez)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicialize Firebase Auth, Firestore e Storage
export const auth = getAuth(app); // EXPORTE A INSTÂNCIA AUTH
export const db = getFirestore(app); // EXPORTE A INSTÂNCIA FIRESTORE (se você usar)
export const storage = getStorage(app); // EXPORTE A INSTÂNCIA STORAGE

// Only initialize analytics in browser environments where it's supported
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    const consentData = localStorage.getItem('cookie_consent');
    let hasAnalyticsConsent = false;
    
    if (consentData) {
      try {
        const preferences = JSON.parse(consentData);
        hasAnalyticsConsent = preferences.analytics === true;
      } catch (e) {
        console.error('Erro ao analisar dados de consentimento de cookies', e);
      }
    }
    
    if (hasAnalyticsConsent || process.env.NODE_ENV === 'development') {
      analytics = getAnalytics(app);
      console.log("Analytics enabled based on user consent");
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Analytics:", error);
  }
}

// Initialize App Check with proper error handling and timing
let appCheck = null;
if (typeof window !== 'undefined') {
  const initializeAppCheckWhenReady = () => {
    try {
      const consentData = localStorage.getItem('cookie_consent');
      let hasAnalyticsConsent = false;
      
      if (consentData) {
        try {
          const preferences = JSON.parse(consentData);
          hasAnalyticsConsent = preferences.analytics === true;
        } catch (e) {
          console.error('Erro ao analisar dados de consentimento de cookies', e);
        }
      }
      
      if (hasAnalyticsConsent || process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
          // @ts-ignore
          self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
          console.log('Firebase AppCheck em modo de debug para ambiente de desenvolvimento');
        }
        
        if (window.grecaptcha && window.grecaptcha.enterprise) {
          appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider('6LdCOEUrAAAAACUOGmKFh56dzZ_ELXwZp0-lbLRm'),
            isTokenAutoRefreshEnabled: true
          });
          console.log('Firebase AppCheck inicializado com reCAPTCHA Enterprise');
        } else {
          console.warn('reCAPTCHA Enterprise não disponível, tentando novamente...');
          setTimeout(initializeAppCheckWhenReady, 1000);
        }
      } else {
        console.log('Firebase AppCheck não inicializado devido à falta de consentimento');
      }
    } catch (error) {
      console.error('Erro ao inicializar Firebase AppCheck:', error);
      appCheck = null;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppCheckWhenReady);
  } else {
    setTimeout(initializeAppCheckWhenReady, 500);
  }
}

// Global type declaration for reCAPTCHA Enterprise
declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options?: { action?: string }) => Promise<string>;
      };
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options?: { action?: string }) => Promise<string>;
    };
  }
}

// Exporte tudo que outros módulos precisarão
export { app, analytics, appCheck };
// Adicione auth, db, storage para exportação
// Isso já está sendo feito com `export const auth = getAuth(app);` etc.
