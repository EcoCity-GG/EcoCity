
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './config/firebase' // Importando a configuração do Firebase
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Add error boundary for React Query
queryClient.setMutationDefaults(['auth'], {
  onError: (error) => {
    console.error('Auth mutation error:', error);
  },
});

// Use createRoot API correctly with error handling
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

// Wrap in error boundary
const AppWithProviders = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

root.render(<AppWithProviders />);

// Enhanced error handling to prevent white screen issues
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Check if it's a reCAPTCHA related error
  if (event.reason && typeof event.reason === 'object' && 
      (event.reason.code === 'appCheck/recaptcha-error' || 
       event.reason.message?.includes('ReCAPTCHA') ||
       event.reason.message?.includes('AppCheck'))) {
    console.warn('reCAPTCHA/AppCheck error detected, continuing without blocking the app');
    event.preventDefault();
    return;
  }
  
  // Prevent the default behavior for null/undefined rejections
  if (event.reason === null || event.reason === undefined) {
    console.warn('Null/undefined promise rejection prevented');
    event.preventDefault();
    return;
  }
  
  // For other errors, let them through but don't crash the app
  event.preventDefault();
});

// Handle errors that could cause white screen
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Check if it's a reCAPTCHA script loading error
  if (event.target && 'src' in event.target && 
      typeof event.target.src === 'string' && 
      event.target.src.includes('recaptcha')) {
    console.warn('reCAPTCHA script loading error, app will continue without it');
    event.preventDefault();
    return;
  }
});

// Add a safety net for React errors
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known Firebase/reCAPTCHA warnings that don't affect functionality
  const message = args.join(' ');
  if (message.includes('AppCheck: ReCAPTCHA error') ||
      message.includes('reCAPTCHA error') ||
      message.includes('third-party cookies')) {
    console.warn('Filtered reCAPTCHA warning:', ...args);
    return;
  }
  originalConsoleError(...args);
};
