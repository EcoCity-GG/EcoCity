
import { useState, useEffect } from 'react';

// Type definitions for reCAPTCHA Enterprise
declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options?: { action?: string }) => Promise<string>;
        render: (container: string | HTMLElement, parameters: any) => number;
      };
    };
  }
}

// Default site key - already defined
const DEFAULT_SITE_KEY = '6LdCOEUrAAAAACUOGmKFh56dzZ_ELXwZp0-lbLRm';

export interface UseCaptchaOptions {
  siteKey?: string;
  action?: string;
  autoLoad?: boolean;
}

export const useCaptcha = (options: UseCaptchaOptions = {}) => {
  const {
    siteKey = DEFAULT_SITE_KEY,
    action = 'submit',
    autoLoad = true
  } = options;

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ready, setReady] = useState(false);

  // Load reCAPTCHA script
  useEffect(() => {
    if (!autoLoad) return;

    const loadReCaptcha = async () => {
      // Skip if already loaded
      if (window.grecaptcha) {
        setReady(true);
        console.log('reCAPTCHA já está carregado (useCaptcha)');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create script element
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;

        // Create promise to wait for script load
        const scriptPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log('Script reCAPTCHA carregado (useCaptcha)');
            resolve();
          };
          script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
        });

        // Append script to document
        document.head.appendChild(script);

        // Wait for script to load
        await scriptPromise;

        // Initialize reCAPTCHA
        window.grecaptcha.enterprise.ready(() => {
          console.log('reCAPTCHA Enterprise está pronto (useCaptcha)');
          setReady(true);
          setLoading(false);
        });
      } catch (err) {
        console.error('Erro ao carregar reCAPTCHA:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading reCAPTCHA'));
        setLoading(false);
      }
    };

    loadReCaptcha();

    // Cleanup function
    return () => {
      // Script cleanup if needed
    };
  }, [siteKey, autoLoad]);

  // Function to execute reCAPTCHA and get token
  const execute = async (customAction?: string): Promise<string | null> => {
    if (!ready || !window.grecaptcha) {
      console.error('reCAPTCHA não está pronto para execução');
      setError(new Error('reCAPTCHA not ready'));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Executando reCAPTCHA com ação: ${customAction || action}`);
      const captchaToken = await window.grecaptcha.enterprise.execute(
        siteKey, 
        { action: customAction || action }
      );
      
      console.log('Token reCAPTCHA obtido (useCaptcha):', captchaToken.substring(0, 20) + '...');
      setToken(captchaToken);
      setLoading(false);
      return captchaToken;
    } catch (err) {
      console.error('Falha ao executar reCAPTCHA:', err);
      const error = err instanceof Error ? err : new Error('Failed to execute reCAPTCHA');
      setError(error);
      setLoading(false);
      return null;
    }
  };

  return {
    token,
    loading,
    error,
    ready,
    execute,
  };
};
