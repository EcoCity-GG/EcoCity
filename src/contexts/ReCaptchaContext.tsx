
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ReCaptchaContextProps {
  siteKey: string;
  ready: boolean;
  execute: (action?: string) => Promise<string | null>;
}

const ReCaptchaContext = createContext<ReCaptchaContextProps | undefined>(undefined);

// Default site key - usando a chave que você forneceu
const DEFAULT_SITE_KEY = '6LdCOEUrAAAAACUOGmKFh56dzZ_ELXwZp0-lbLRm';

interface ReCaptchaProviderProps {
  siteKey?: string;
  children: React.ReactNode;
}

export const ReCaptchaProvider: React.FC<ReCaptchaProviderProps> = ({ 
  siteKey = DEFAULT_SITE_KEY,
  children 
}) => {
  const [ready, setReady] = useState(false);

  // Load reCAPTCHA script
  useEffect(() => {
    // Skip if already loaded
    if (window.grecaptcha) {
      window.grecaptcha.enterprise.ready(() => {
        setReady(true);
        console.log('reCAPTCHA Enterprise está pronto (já carregado)');
      });
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha.enterprise.ready(() => {
        setReady(true);
        console.log('reCAPTCHA Enterprise carregado com sucesso');
      });
    };

    script.onerror = (error) => {
      console.error('Falha ao carregar reCAPTCHA:', error);
    };

    document.head.appendChild(script);

    return () => {
      // Only remove if it's the script we added
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('recaptcha')) {
          scripts[i].remove();
          break;
        }
      }
    };
  }, [siteKey]);

  // Function to execute reCAPTCHA
  const execute = async (action = 'submit'): Promise<string | null> => {
    if (!ready || !window.grecaptcha) {
      console.error('reCAPTCHA not ready');
      return null;
    }

    try {
      console.log(`Executando reCAPTCHA Enterprise com ação: ${action}`);
      const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
      console.log('reCAPTCHA token obtido:', token.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.error('Erro ao executar reCAPTCHA:', error);
      return null;
    }
  };

  const value = {
    siteKey,
    ready,
    execute,
  };

  return (
    <ReCaptchaContext.Provider value={value}>
      {children}
    </ReCaptchaContext.Provider>
  );
};

export const useReCaptcha = () => {
  const context = useContext(ReCaptchaContext);
  
  if (context === undefined) {
    throw new Error('useReCaptcha must be used within a ReCaptchaProvider');
  }
  
  return context;
};

// Adiciona declaração global para o tipo do grecaptcha
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
