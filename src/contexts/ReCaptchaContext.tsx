
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ReCaptchaContextProps {
  siteKey: string;
  ready: boolean;
  loading: boolean;
  error: string | null;
  execute: (action?: string) => Promise<string | null>;
  resetError: () => void;
}

const ReCaptchaContext = createContext<ReCaptchaContextProps | undefined>(undefined);

// Site key para reCAPTCHA Enterprise
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for reCAPTCHA Enterprise availability
  useEffect(() => {
    const checkReCaptchaEnterprise = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if grecaptcha.enterprise is available
        if (window.grecaptcha?.enterprise?.ready) {
          console.log('reCAPTCHA Enterprise detectado');
          window.grecaptcha.enterprise.ready(() => {
            setReady(true);
            setLoading(false);
            console.log('reCAPTCHA Enterprise inicializado e pronto');
          });
        } else if (window.grecaptcha?.ready) {
          // Fallback to standard reCAPTCHA if Enterprise is not available
          console.log('Usando reCAPTCHA padrão como fallback');
          window.grecaptcha.ready(() => {
            setReady(true);
            setLoading(false);
            console.log('reCAPTCHA padrão inicializado e pronto');
          });
        } else {
          // reCAPTCHA not loaded yet, try again
          setTimeout(checkReCaptchaEnterprise, 500);
        }
      } catch (err) {
        console.error('Erro ao verificar reCAPTCHA:', err);
        setError('Erro ao verificar reCAPTCHA');
        setLoading(false);
      }
    };

    // Start checking immediately if document is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkReCaptchaEnterprise);
    } else {
      checkReCaptchaEnterprise();
    }

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', checkReCaptchaEnterprise);
    };
  }, []);

  // Function to execute reCAPTCHA
  const execute = async (action = 'submit'): Promise<string | null> => {
    if (!ready) {
      const errorMsg = 'reCAPTCHA não está pronto';
      console.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    try {
      console.log(`Executando reCAPTCHA com ação: ${action}`);
      
      let token: string;
      
      // Try Enterprise first, then fallback to standard
      if (window.grecaptcha?.enterprise?.execute) {
        token = await window.grecaptcha.enterprise.execute(siteKey, { action });
        console.log('Token obtido via reCAPTCHA Enterprise');
      } else if (window.grecaptcha?.execute) {
        token = await window.grecaptcha.execute(siteKey, { action });
        console.log('Token obtido via reCAPTCHA padrão');
      } else {
        throw new Error('reCAPTCHA não disponível');
      }
      
      if (token && token.length > 0) {
        console.log('Token reCAPTCHA obtido com sucesso:', token.substring(0, 20) + '...');
        setError(null);
        return token;
      } else {
        throw new Error('Token reCAPTCHA vazio ou inválido');
      }
    } catch (err) {
      const errorMsg = `Erro ao executar reCAPTCHA: ${err}`;
      console.error(errorMsg);
      setError(errorMsg);
      return null;
    }
  };

  const resetError = () => {
    setError(null);
  };

  const value = {
    siteKey,
    ready,
    loading,
    error,
    execute,
    resetError,
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
