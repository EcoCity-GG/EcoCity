
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './config/firebase' // Importando a configuração do Firebase
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { app } from './config/firebase'

// Create a client
const queryClient = new QueryClient();

// Setup Firebase AppCheck with reCAPTCHA
const initializeAppCheckWithReCaptcha = () => {
  // Check if we have consent to load analytics cookies
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
  
  // Only initialize AppCheck if we have consent or if we're in development
  if (hasAnalyticsConsent || process.env.NODE_ENV === 'development') {
    // In development mode, we need to add this line to prevent the app check from failing
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      console.log('Firebase AppCheck em modo de debug para ambiente de desenvolvimento');
    }
    
    // Initialize AppCheck
    try {
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LdCOEUrAAAAACUOGmKFh56dzZ_ELXwZp0-lbLRm'),
        isTokenAutoRefreshEnabled: true
      });
      
      console.log('Firebase AppCheck inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Firebase AppCheck:', error);
    }
  } else {
    console.log('Firebase AppCheck não inicializado devido à falta de consentimento');
  }
};

// Initialize AppCheck
initializeAppCheckWithReCaptcha();

// Use createRoot API correctly
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
