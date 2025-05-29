
import { useState, useEffect } from 'react';
import { useReCaptcha } from '@/contexts/ReCaptchaContext';

export interface UseCaptchaOptions {
  siteKey?: string;
  action?: string;
  autoExecute?: boolean;
}

export const useCaptcha = (options: UseCaptchaOptions = {}) => {
  const {
    action = 'submit',
    autoExecute = false
  } = options;

  const { 
    ready, 
    loading: contextLoading, 
    error: contextError, 
    execute: contextExecute,
    resetError 
  } = useReCaptcha();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Sync context error with local error
  useEffect(() => {
    if (contextError) {
      setError(new Error(contextError));
    } else {
      setError(null);
    }
  }, [contextError]);

  // Auto-execute when ready if requested
  useEffect(() => {
    if (ready && autoExecute && !token && !loading) {
      execute();
    }
  }, [ready, autoExecute, token, loading]);

  // Function to execute reCAPTCHA and get token
  const execute = async (customAction?: string): Promise<string | null> => {
    if (!ready) {
      const errorMsg = 'reCAPTCHA v3 não está pronto para execução';
      console.error(errorMsg);
      setError(new Error(errorMsg));
      return null;
    }

    setLoading(true);
    setError(null);
    resetError();

    try {
      const actionToUse = customAction || action;
      console.log(`Executando reCAPTCHA v3 com ação: ${actionToUse}`);
      const captchaToken = await contextExecute(actionToUse);
      
      if (captchaToken && captchaToken.length > 0) {
        console.log('Token reCAPTCHA v3 obtido (useCaptcha):', captchaToken.substring(0, 20) + '...');
        setToken(captchaToken);
        setLoading(false);
        return captchaToken;
      } else {
        throw new Error('Token reCAPTCHA v3 não foi obtido');
      }
    } catch (err) {
      console.error('Falha ao executar reCAPTCHA v3:', err);
      const error = err instanceof Error ? err : new Error('Failed to execute reCAPTCHA v3');
      setError(error);
      setLoading(false);
      return null;
    }
  };

  const reset = () => {
    setToken(null);
    setError(null);
    resetError();
  };

  return {
    token,
    loading: loading || contextLoading,
    error,
    ready,
    execute,
    reset,
  };
};
