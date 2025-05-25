
import React, { useEffect, useRef, useState, forwardRef } from 'react';

interface ReCaptchaProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  action?: string;
}

interface ReCaptchaRefHandle {
  execute: () => Promise<string | null>;
}

export const ReCaptcha = forwardRef<ReCaptchaRefHandle, ReCaptchaProps>(
  ({ siteKey, onChange, action = 'submit' }, ref) => {
    const [loaded, setLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<number | null>(null);

    // Load reCAPTCHA script
    useEffect(() => {
      // Skip if already loaded
      if (window.grecaptcha) {
        console.log('reCAPTCHA já está carregado');
        setLoaded(true);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Script reCAPTCHA carregado');
        setLoaded(true);
      };

      script.onerror = (error) => {
        console.error('Falha ao carregar reCAPTCHA:', error);
      };

      document.head.appendChild(script);

      return () => {
        // Remove script on cleanup
        try {
          document.head.removeChild(script);
        } catch (e) {
          // Script might have been removed by another component
          console.log('Script não encontrado para remoção');
        }
      };
    }, [siteKey]);

    // Initialize reCAPTCHA when loaded
    useEffect(() => {
      if (!loaded || !window.grecaptcha) return;

      try {
        window.grecaptcha.enterprise.ready(() => {
          console.log('reCAPTCHA Enterprise está pronto');
        });
      } catch (error) {
        console.error('Erro ao inicializar reCAPTCHA:', error);
      }
    }, [loaded]);

    // Method to execute reCAPTCHA
    const execute = async () => {
      if (!loaded || !window.grecaptcha) {
        console.error('reCAPTCHA não carregado');
        return null;
      }

      try {
        console.log(`Executando reCAPTCHA com ação: ${action}`);
        const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
        console.log('Token reCAPTCHA obtido:', token.substring(0, 20) + '...');
        onChange(token);
        return token;
      } catch (error) {
        console.error('Erro ao executar reCAPTCHA:', error);
        onChange(null);
        return null;
      }
    };

    // Expose the execute method via ref
    React.useImperativeHandle(
      ref,
      () => ({
        execute
      })
    );

    return (
      <div ref={containerRef} className="g-recaptcha" data-sitekey={siteKey} data-action={action}>
        {!loaded && <p className="text-xs text-muted-foreground">Carregando reCAPTCHA...</p>}
        {loaded && <p className="text-xs text-green-500">reCAPTCHA pronto</p>}
      </div>
    );
  }
);

// Hook for easier use of reCAPTCHA
export const useReCaptcha = (siteKey: string, action: string = 'submit') => {
  const [token, setToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCaptchaRefHandle>(null);

  const execute = async () => {
    if (captchaRef.current) {
      const newToken = await captchaRef.current.execute();
      setToken(newToken);
      return newToken;
    }
    return null;
  };

  const CaptchaComponent = () => (
    <ReCaptcha
      ref={captchaRef}
      siteKey={siteKey}
      onChange={setToken}
      action={action}
    />
  );

  return { token, execute, CaptchaComponent };
};

// Create a ref version for imperative use
export const ReCaptchaWithRef = ReCaptcha;
